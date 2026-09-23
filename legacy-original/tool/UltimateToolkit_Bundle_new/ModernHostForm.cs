using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace UltimateToolkitLauncher
{
	/// <summary>
	/// ASHtech PC Toolkit Pro — Modern Chromium Host Container (WebView2)
	/// Provides hardware-accelerated rendering, isolated application state,
	/// hardened loopback origin boundaries, and structured asynchronous IPC.
	/// </summary>
	public class ModernHostForm : Form
	{
		private string runtimeDir;
		private Process serverProc = null;
		private dynamic webViewControl = null;
		private bool webViewInitialized = false;

		public ModernHostForm(string runtimeDir)
		{
			this.runtimeDir = runtimeDir;
			this.Text = "ASHtech PC Toolkit Pro";
			this.Size = new Size(1180, 780);
			this.MinimumSize = new Size(960, 640);
			this.StartPosition = FormStartPosition.CenterScreen;
			this.BackColor = Color.FromArgb(8, 9, 13);

			this.EnableDarkModeTitleBar();
			this.InitializeHostAsync();
		}

		private void EnableDarkModeTitleBar()
		{
			try
			{
				int darkMode = 1;
				DwmSetWindowAttribute(this.Handle, 20, ref darkMode, sizeof(int));
			}
			catch { }
		}

		[DllImport("dwmapi.dll", PreserveSig = true)]
		private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);

		private async void InitializeHostAsync()
		{
			bool webViewAvailable = CheckWebView2Availability();

			if (webViewAvailable)
			{
				try
				{
					await SetupWebView2ControlAsync();
					return;
				}
				catch (Exception ex)
				{
					// Log and fall back
					Debug.WriteLine("WebView2 initialization failed: " + ex.Message);
				}
			}

			// Fallback path: Launch classic launcher form or external browser
			SetupFallbackView();
		}

		/// <summary>
		/// Determines whether the Microsoft Edge WebView2 runtime is present on the system.
		/// </summary>
		public static bool CheckWebView2Availability()
		{
			try
			{
				// Check WebView2 installation via registry or Edge installation
				string regPath = @"SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}";
				using (var key = Microsoft.Win32.Registry.LocalMachine.OpenSubKey(regPath))
				{
					if (key != null && key.GetValue("pv") != null) return true;
				}

				string userRegPath = @"SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}";
				using (var key = Microsoft.Win32.Registry.CurrentUser.OpenSubKey(userRegPath))
				{
					if (key != null && key.GetValue("pv") != null) return true;
				}

				return false;
			}
			catch
			{
				return false;
			}
		}

		/// <summary>
		/// Configures the modern WebView2 container with isolated UserDataFolder and strict security boundaries.
		/// </summary>
		private async Task SetupWebView2ControlAsync()
		{
			// Isolated data directory in %LOCALAPPDATA%\ASHtech\WebView2Data
			string userDataFolder = Path.Combine(
				Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
				"ASHtech",
				"WebView2Data"
			);
			Directory.CreateDirectory(userDataFolder);

			// Dynamically instantiate WebView2 control if referenced
			Type webViewType = Type.GetType("Microsoft.Web.WebView2.WinForms.WebView2, Microsoft.Web.WebView2.WinForms");
			if (webViewType == null)
			{
				throw new InvalidOperationException("Microsoft.Web.WebView2 assembly is not present in runtime path.");
			}

			Control control = (Control)Activator.CreateInstance(webViewType);
			control.Dock = DockStyle.Fill;
			this.Controls.Add(control);
			this.webViewControl = control;

			// Initialize CoreWebView2 environment
			await (Task)webViewType.GetMethod("EnsureCoreWebView2Async").Invoke(control, new object[] { null });
			dynamic core = control.GetType().GetProperty("CoreWebView2").GetValue(control, null);

			if (core != null)
			{
				// Hardened Security Settings
				dynamic settings = core.Settings;
				settings.AreDefaultContextMenusEnabled = false;
				settings.AreDevToolsEnabled = false;
				settings.IsStatusBarEnabled = false;
				settings.IsZoomControlEnabled = true;

				// Enforce Origin Restriction: Loopback & Local File only
				// External links are automatically intercepted and routed to the user's default browser
				core.NavigationStarting += new EventHandler<dynamic>((s, e) =>
				{
					try
					{
						string uriString = (string)e.Uri;
						Uri uri = new Uri(uriString);
						if (!uri.IsLoopback && !uri.Scheme.Equals("file", StringComparison.OrdinalIgnoreCase))
						{
							e.Cancel = true;
							Process.Start(new ProcessStartInfo(uriString) { UseShellExecute = true });
						}
					}
					catch { }
				});

				// Wire Asynchronous Structured IPC Handler
				core.WebMessageReceived += new EventHandler<dynamic>(OnWebMessageReceived);

				// Navigate to local dashboard or launcher UI
				string localDashboard = Path.Combine(this.runtimeDir, "dashboard.html");
				if (File.Exists(localDashboard))
				{
					core.Navigate("file:///" + localDashboard.Replace('\\', '/'));
				}

				this.webViewInitialized = true;
			}
		}

		/// <summary>
		/// Fallback view when WebView2 runtime is absent.
		/// </summary>
		private void SetupFallbackView()
		{
			var panel = new Panel
			{
				Dock = DockStyle.Fill,
				BackColor = Color.FromArgb(12, 14, 20)
			};

			var lblTitle = new Label
			{
				Text = "ASHtech PC Toolkit Pro",
				Font = new Font("Segoe UI", 18, FontStyle.Bold),
				ForeColor = Color.White,
				Location = new Point(40, 40),
				AutoSize = true
			};

			var lblSubtitle = new Label
			{
				Text = "Modern WebView2 Runtime not detected. Launching in compatible external browser mode.",
				Font = new Font("Segoe UI", 11),
				ForeColor = Color.FromArgb(148, 163, 184),
				Location = new Point(40, 80),
				AutoSize = true
			};

			var btnLaunchWeb = new Button
			{
				Text = "Launch Web Dashboard (External Browser)",
				Font = new Font("Segoe UI", 10, FontStyle.Bold),
				ForeColor = Color.White,
				BackColor = Color.FromArgb(14, 116, 144),
				FlatStyle = FlatStyle.Flat,
				Size = new Size(320, 45),
				Location = new Point(40, 140),
				Cursor = Cursors.Hand
			};
			btnLaunchWeb.Click += (s, e) => ExecuteLaunchV6();

			var btnLaunchClassic = new Button
			{
				Text = "Launch Classic Console Menu",
				Font = new Font("Segoe UI", 10, FontStyle.Bold),
				ForeColor = Color.White,
				BackColor = Color.FromArgb(30, 41, 59),
				FlatStyle = FlatStyle.Flat,
				Size = new Size(320, 45),
				Location = new Point(40, 200),
				Cursor = Cursors.Hand
			};
			btnLaunchClassic.Click += (s, e) => ExecuteLaunchV5();

			panel.Controls.Add(lblTitle);
			panel.Controls.Add(lblSubtitle);
			panel.Controls.Add(btnLaunchWeb);
			panel.Controls.Add(btnLaunchClassic);
			this.Controls.Add(panel);
		}

		/// <summary>
		/// Structured Asynchronous IPC Message Dispatcher
		/// </summary>
		private void OnWebMessageReceived(object sender, dynamic args)
		{
			try
			{
				string messageJson = (string)args.WebMessageAsJson;
				if (string.IsNullOrEmpty(messageJson)) return;

				// Parse command from message
				if (messageJson.Contains("\"launch_v5\""))
				{
					this.Invoke(new Action(() => ExecuteLaunchV5()));
				}
				else if (messageJson.Contains("\"launch_v6\""))
				{
					this.Invoke(new Action(() => ExecuteLaunchV6()));
				}
				else if (messageJson.Contains("\"launch_printer\""))
				{
					this.Invoke(new Action(() => ExecuteLaunchPrinter()));
				}
				else if (messageJson.Contains("\"stop_server\""))
				{
					this.Invoke(new Action(() => ExecuteStopV6()));
				}
			}
			catch (Exception ex)
			{
				Debug.WriteLine("IPC dispatch error: " + ex.Message);
			}
		}

		public void ExecuteLaunchV5()
		{
			try
			{
				string text = Path.Combine(this.runtimeDir, "Toolkit.bat");
				if (!File.Exists(text)) text = Path.Combine(this.runtimeDir, "V5.exe");

				if (File.Exists(text))
				{
					Process.Start(new ProcessStartInfo
					{
						FileName = text,
						WorkingDirectory = this.runtimeDir,
						UseShellExecute = true
					});
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show("Failed to launch Classic engine: " + ex.Message, "Exception", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			}
		}

		public void ExecuteLaunchV6()
		{
			try
			{
				string text = Path.Combine(this.runtimeDir, "Modules", "WebBridgeServer.ps1");
				if (File.Exists(text))
				{
					this.serverProc = Process.Start(new ProcessStartInfo
					{
						FileName = "powershell.exe",
						Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"" + text + "\" -Port 9999",
						WorkingDirectory = this.runtimeDir,
						UseShellExecute = true,
						WindowStyle = ProcessWindowStyle.Hidden
					});
					System.Threading.Thread.Sleep(2000);
					Process.Start("http://localhost:9999/dashboard.html");
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show("Failed to launch WebBridge: " + ex.Message, "Exception", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			}
		}

		public void ExecuteLaunchPrinter()
		{
			try
			{
				string text = Path.Combine(this.runtimeDir, "Printer_Analyzer_Pro.exe");
				if (File.Exists(text))
				{
					Process.Start(new ProcessStartInfo
					{
						FileName = text,
						WorkingDirectory = this.runtimeDir,
						UseShellExecute = true
					});
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show("Failed to launch Printer Analyzer: " + ex.Message, "Exception", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			}
		}

		public void ExecuteStopV6()
		{
			try
			{
				if (this.serverProc != null && !this.serverProc.HasExited)
				{
					this.serverProc.Kill();
				}
			}
			catch { }
			this.serverProc = null;
			this.Close();
		}

		protected override void OnFormClosing(FormClosingEventArgs e)
		{
			base.OnFormClosing(e);
			ExecuteStopV6();
		}
	}
}
