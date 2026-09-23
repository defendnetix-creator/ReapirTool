using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

namespace UltimateToolkitLauncher
{
	// Token: 0x02000003 RID: 3
	public partial class LauncherForm : Form
	{
		// Token: 0x0600000B RID: 11
		[DllImport("dwmapi.dll")]
		public static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);

		// Token: 0x0600000C RID: 12 RVA: 0x00002138 File Offset: 0x00000338
		public LauncherForm(string runtimeDir)
		{
			this.runtimeDir = runtimeDir;
			base.Size = new Size(1020, 650);
			this.MinimumSize = new Size(880, 560);
			base.FormBorderStyle = FormBorderStyle.Sizable;
			this.Text = "ASHtech PC Toolkit Pro";
			this.BackColor = Color.FromArgb(8, 9, 13);
			base.StartPosition = FormStartPosition.CenterScreen;
			this.EnableDarkModeTitleBar();
			this.webBrowser = new WebBrowser();
			this.webBrowser.Dock = DockStyle.Fill;
			this.webBrowser.ScrollBarsEnabled = false;
			this.webBrowser.IsWebBrowserContextMenuEnabled = false;
			this.webBrowser.AllowWebBrowserDrop = false;
			this.webBrowser.WebBrowserShortcutsEnabled = false;
			this.webBrowser.ObjectForScripting = new ScriptManager(this);
			this.SetWebBrowserFeatures();
			base.Controls.Add(this.webBrowser);
			try
			{
				string text = Path.Combine(runtimeDir, "launcher.html");
				File.WriteAllText(text, this.GetHtmlString(), Encoding.UTF8);
				this.webBrowser.Navigate(text);
			}
			catch (Exception ex)
			{
				MessageBox.Show("Failed to load launcher dashboard: " + ex.Message);
			}
		}

		// Token: 0x0600000D RID: 13 RVA: 0x00002290 File Offset: 0x00000490
		private void EnableDarkModeTitleBar()
		{
			try
			{
				int num = 1;
				LauncherForm.DwmSetWindowAttribute(base.Handle, 20, ref num, 4);
				LauncherForm.DwmSetWindowAttribute(base.Handle, 19, ref num, 4);
			}
			catch
			{
			}
		}

		// Token: 0x0600000E RID: 14 RVA: 0x000022DC File Offset: 0x000004DC
		private void SetWebBrowserFeatures()
		{
			// IE11 registry tampering removed in Phase 3
			// Modern host uses WebView2 container with isolated profile
		}

		// Token: 0x0600000F RID: 15 RVA: 0x00002368 File Offset: 0x00000568
		public void ExecuteLaunchV5()
		{
			try
			{
				string text = Path.Combine(this.runtimeDir, "V5.exe");
				if (!File.Exists(text))
				{
					MessageBox.Show("V5.exe was not found at:\n" + text + "\n\nPlease ensure V5.exe is in the same folder as UltimateToolkit.exe.", "File Not Found", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
				}
				else
				{
					Process.Start(new ProcessStartInfo
					{
						FileName = text,
						WorkingDirectory = this.runtimeDir,
						UseShellExecute = true
					});
					base.Hide();
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show("Failed to launch v5: " + ex.Message, "Exception", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			}
		}

		// Token: 0x06000010 RID: 16 RVA: 0x0000241C File Offset: 0x0000061C
		public void ExecuteLaunchV6()
		{
			try
			{
				string text = Path.Combine(this.runtimeDir, "Modules", "WebBridgeServer.ps1");
				if (!File.Exists(text))
				{
					MessageBox.Show("WebBridgeServer.ps1 not found at:\n" + text, "Error", MessageBoxButtons.OK, MessageBoxIcon.Hand);
				}
				else
				{
					try
					{
						Process process = Process.Start(new ProcessStartInfo
						{
							FileName = "powershell.exe",
							Arguments = "-NoProfile -ExecutionPolicy Bypass -Command \"Get-CimInstance Win32_Process | Where-Object { $_.Name -like '*powershell*' -and $_.CommandLine -like '*WebBridgeServer.ps1*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }\"",
							CreateNoWindow = true,
							UseShellExecute = false
						});
						if (process != null)
						{
							process.WaitForExit();
						}
					}
					catch
					{
					}
					try
					{
						Process process2 = Process.Start(new ProcessStartInfo
						{
							FileName = "powershell.exe",
							Arguments = "-NoProfile -ExecutionPolicy Bypass -Command \"netsh advfirewall firewall delete rule name='UltimateToolkit Web Bridge'\"",
							CreateNoWindow = true,
							UseShellExecute = false
						});
						if (process2 != null)
						{
							process2.WaitForExit();
						}
					}
					catch
					{
					}
					this.serverProc = Process.Start(new ProcessStartInfo
					{
						FileName = "powershell.exe",
						Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"" + text + "\" -Port 9999",
						WorkingDirectory = this.runtimeDir,
						UseShellExecute = true,
						WindowStyle = ProcessWindowStyle.Hidden
					});
					Thread.Sleep(3000);
					Process.Start("http://localhost:9999/dashboard.html");
					string text2 = Path.Combine(this.runtimeDir, "server_running.html");
					File.WriteAllText(text2, this.GetRunningHtmlString(), Encoding.UTF8);
					this.webBrowser.Navigate(text2);
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show("Failed to launch v6: " + ex.Message, "Exception", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			}
		}

		// Token: 0x06000011 RID: 17 RVA: 0x00002628 File Offset: 0x00000828
		public void ExecuteLaunchPrinter()
		{
			try
			{
				string text = Path.Combine(this.runtimeDir, "Printer_Analyzer_Pro.exe");
				if (!File.Exists(text))
				{
					string folderPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
					text = Path.Combine(folderPath, "Printer_Analyzer_Pro.exe");
				}
				if (!File.Exists(text))
				{
					MessageBox.Show("Printer_Analyzer_Pro.exe was not found in the UltimateSuite folder or Desktop.", "File Not Found", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
				}
				else
				{
					Process.Start(new ProcessStartInfo
					{
						FileName = text,
						WorkingDirectory = Path.GetDirectoryName(text),
						UseShellExecute = true
					});
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show("Failed to launch Printer Analyzer: " + ex.Message, "Exception", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			}
		}

		// Token: 0x06000012 RID: 18 RVA: 0x000026F8 File Offset: 0x000008F8
		public void ExecuteStopV6()
		{
			try
			{
				if (this.serverProc != null && !this.serverProc.HasExited)
				{
					try
					{
						this.serverProc.Kill();
					}
					catch
					{
					}
				}
			}
			catch
			{
			}
			try
			{
				Process process = Process.Start(new ProcessStartInfo
				{
					FileName = "powershell.exe",
					Arguments = "-NoProfile -ExecutionPolicy Bypass -Command \"Get-CimInstance Win32_Process | Where-Object { $_.Name -like '*powershell*' -and $_.CommandLine -like '*WebBridgeServer.ps1*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }\"",
					CreateNoWindow = true,
					UseShellExecute = false
				});
				if (process != null)
				{
					process.WaitForExit();
				}
			}
			catch
			{
			}
			this.serverProc = null;
			base.Close();
		}

		// Token: 0x06000013 RID: 19 RVA: 0x000027C8 File Offset: 0x000009C8
		protected override void OnFormClosing(FormClosingEventArgs e)
		{
			base.OnFormClosing(e);
			try
			{
				if (this.serverProc != null && !this.serverProc.HasExited)
				{
					this.serverProc.Kill();
				}
			}
			catch
			{
			}
			try
			{
				Process process = Process.Start(new ProcessStartInfo
				{
					FileName = "powershell.exe",
					Arguments = "-NoProfile -ExecutionPolicy Bypass -Command \"Get-Process powershell -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like '*WebBridgeServer.ps1*'} | Stop-Process -Force; Get-CimInstance Win32_Process | Where-Object { $_.Name -like '*powershell*' -and $_.CommandLine -like '*WebBridgeServer.ps1*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }\"",
					CreateNoWindow = true,
					UseShellExecute = false
				});
				if (process != null)
				{
					process.WaitForExit();
				}
			}
			catch
			{
			}
			try
			{
				string path = Path.Combine(this.runtimeDir, "launcher.html");
				if (File.Exists(path))
				{
					File.Delete(path);
				}
				string path2 = Path.Combine(this.runtimeDir, "server_running.html");
				if (File.Exists(path2))
				{
					File.Delete(path2);
				}
			}
			catch
			{
			}
		}

		// Token: 0x06000014 RID: 20 RVA: 0x000028E8 File Offset: 0x00000AE8
		private string GetHtmlString()
		{
			return "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n<title>ASHtech PC Toolkit Pro</title>\n<style>\n  * { margin:0; padding:0; box-sizing:border-box; }\n  body {\n    background: #08090d;\n    color: #ffffff;\n    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n    overflow: hidden;\n    user-select: none;\n    -ms-user-select: none;\n    padding: 24px 30px;\n    height: 100%;\n  }\n  \n  .container {\n    display: flex;\n    flex-direction: column;\n    height: 100%;\n    justify-content: space-between;\n  }\n  \n  .header {\n    text-align: center;\n    margin-bottom: 20px;\n  }\n  \n  .header h1 {\n    font-size: 26px;\n    font-weight: 800;\n    letter-spacing: 2px;\n    margin-bottom: 3px;\n    color: #ffffff;\n  }\n  \n  .header p {\n    font-size: 11px;\n    color: #94a3b8;\n    letter-spacing: 1px;\n  }\n  \n  .grid-table {\n    display: flex;\n    width: 100%;\n    gap: 20px;\n  }\n  \n  .grid-cell {\n    flex: 1;\n  }\n  \n  .card {\n    border-radius: 12px;\n    padding: 20px 20px 75px 20px;\n    position: relative;\n    height: 330px;\n  }\n  \n  .card-v5 {\n    background: rgba(26, 15, 46, 0.25);\n    border: 1px solid rgba(139, 92, 246, 0.4);\n  }\n  \n  .card-v5:hover {\n    border-color: #a78bfa;\n  }\n  \n  .card-v6 {\n    background: rgba(14, 30, 49, 0.25);\n    border: 1px solid rgba(14, 116, 144, 0.4);\n  }\n  \n  .card-v6:hover {\n    border-color: #22d3ee;\n  }\n  \n  .card-printer {\n    background: rgba(251, 191, 36, 0.05);\n    border: 1px solid rgba(245, 158, 11, 0.4);\n  }\n  \n  .card-printer:hover {\n    border-color: #f59e0b;\n  }\n  \n  .card-header-area {\n    display: flex;\n    align-items: center;\n    gap: 12px;\n    margin-bottom: 12px;\n  }\n  \n  .icon-circle {\n    width: 55px;\n    height: 55px;\n    border-radius: 50%;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 24px;\n  }\n  \n  .v5-icon {\n    background: rgba(139, 92, 246, 0.1);\n    border: 1px dashed rgba(139, 92, 246, 0.5);\n    color: #a78bfa;\n  }\n  \n  .v6-icon {\n    background: rgba(6, 182, 212, 0.1);\n    border: 1px dashed rgba(6, 182, 212, 0.5);\n    color: #22d3ee;\n  }\n  \n  .printer-icon {\n    background: rgba(245, 158, 11, 0.1);\n    border: 1px dashed rgba(245, 158, 11, 0.5);\n    color: #fbbf24;\n  }\n  \n  .card-title-info h2 {\n    font-size: 14px;\n    font-weight: 700;\n    margin-bottom: 3px;\n  }\n  \n  .badge {\n    display: inline-block;\n    padding: 2px 8px;\n    border-radius: 4px;\n    font-size: 8px;\n    font-weight: 800;\n    letter-spacing: 0.5px;\n  }\n  \n  .v5-badge {\n    background: rgba(139, 92, 246, 0.2);\n    color: #c084fc;\n    border: 1px solid rgba(139, 92, 246, 0.3);\n  }\n  \n  .v6-badge {\n    background: rgba(6, 182, 212, 0.2);\n    color: #22d3ee;\n    border: 1px solid rgba(6, 182, 212, 0.3);\n  }\n  \n  .printer-badge {\n    background: rgba(245, 158, 11, 0.2);\n    color: #fbbf24;\n    border: 1px solid rgba(245, 158, 11, 0.3);\n  }\n  \n  .card-desc {\n    font-size: 10.5px;\n    color: #94a3b8;\n    line-height: 1.4;\n    margin-bottom: 10px;\n    min-height: 40px;\n  }\n  \n  .features-list {\n    list-style: none;\n    margin-bottom: 12px;\n  }\n  \n  .features-list li {\n    font-size: 10px;\n    color: #cbd5e1;\n    margin-bottom: 5px;\n    display: flex;\n    align-items: center;\n    gap: 8px;\n  }\n  \n  .features-list li::before {\n    content: \"\\2713\";\n    font-weight: bold;\n  }\n  \n  .v5-features li::before { color: #a78bfa; }\n  .v6-features li::before { color: #22d3ee; }\n  .printer-features li::before { color: #fbbf24; }\n  \n  .launch-btn {\n    position: absolute;\n    bottom: 20px;\n    left: 20px;\n    right: 20px;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    padding: 10px 16px;\n    border-radius: 6px;\n    font-size: 10.5px;\n    font-weight: 700;\n    letter-spacing: 0.5px;\n    cursor: pointer;\n  }\n  \n  .v5-btn {\n    background: transparent;\n    border: 1px solid #7c3aed;\n    color: #c084fc;\n  }\n  \n  .v5-btn:hover {\n    background: #7c3aed;\n    color: #ffffff;\n  }\n  \n  .v6-btn {\n    background: transparent;\n    border: 1px solid #0e7490;\n    color: #22d3ee;\n  }\n  \n  .v6-btn:hover {\n    background: #0e7490;\n    color: #ffffff;\n  }\n  \n  .printer-btn {\n    background: transparent;\n    border: 1px solid #d97706;\n    color: #fbbf24;\n  }\n  \n  .printer-btn:hover {\n    background: #d97706;\n    color: #ffffff;\n  }\n  \n  .recommended-tag {\n    position: absolute;\n    top: 15px;\n    right: 15px;\n    background: rgba(245, 158, 11, 0.2);\n    border: 1px solid #f59e0b;\n    color: #fbbf24;\n    padding: 2px 6px;\n    border-radius: 4px;\n    font-size: 7px;\n    font-weight: 800;\n    letter-spacing: 0.5px;\n  }\n  \n  .stats-bar {\n    display: flex;\n    justify-content: space-between;\n    background: rgba(15, 23, 42, 0.4);\n    border: 1px solid rgba(255, 255, 255, 0.05);\n    border-radius: 6px;\n    padding: 8px;\n    margin-bottom: 12px;\n  }\n  \n  .stat-item {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n    flex: 1;\n    justify-content: center;\n    border-right: 1px solid rgba(255, 255, 255, 0.05);\n  }\n  \n  .stat-item:last-child {\n    border-right: none;\n  }\n  \n  .stat-icon {\n    font-size: 13px;\n    color: #a78bfa;\n  }\n  \n  .stat-text h3 {\n    font-size: 8.5px;\n    font-weight: 700;\n    color: #ffffff;\n    letter-spacing: 0.5px;\n  }\n  \n  .stat-text p {\n    font-size: 7px;\n    color: #64748b;\n  }\n  \n  .footer {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    border-top: 1px solid rgba(255, 255, 255, 0.05);\n    padding-top: 10px;\n  }\n  \n  .status-pill {\n    display: flex;\n    align-items: center;\n    gap: 6px;\n    background: rgba(16, 185, 129, 0.1);\n    border: 1px solid rgba(16, 185, 129, 0.2);\n    border-radius: 100px;\n    padding: 3px 8px;\n    font-size: 8px;\n    color: #10b981;\n    font-weight: 700;\n  }\n  \n  .status-dot {\n    width: 4px;\n    height: 4px;\n    background: #10b981;\n    border-radius: 50%;\n  }\n  \n  .footer-center {\n    font-size: 8px;\n    color: #475569;\n    letter-spacing: 0.5px;\n  }\n  \n  .footer-right {\n    display: flex;\n    align-items: center;\n    gap: 10px;\n  }\n</style>\n</head>\n<body>\n<div class=\"container\">\n  \n  <div class=\"header\">\n    <h1>ASHTECH PC TOOLKIT PRO</h1>\n    <p>Enterprise Windows Diagnostic &bull; Security & Repair Suite &bull; Version 8.0</p>\n  </div>\n  \n  <div class=\"grid-table\">\n    \n    <div class=\"grid-cell\">\n      <div class=\"card card-v5\">\n        <div class=\"recommended-tag\">&#x2605; FAST & LIGHT</div>\n        <div class=\"card-header-area\">\n          <div class=\"icon-circle v5-icon\">\ud83d\udda5️</div>\n          <div class=\"card-title-info\">\n            <h2>CLASSIC CONSOLE</h2>\n            <span class=\"badge v5-badge\">NATIVE ENGINE</span>\n          </div>\n        </div>\n        <p class=\"card-desc\">Fast, ultra-reliable command and diagnostic launcher for all Windows environments.</p>\n        <ul class=\"features-list v5-features\">\n          <li>Interactive Command Hub</li>\n          <li>37 Core Admin Modules</li>\n          <li>Zero External Dependencies</li>\n          <li>Instant Diagnostics</li>\n        </ul>\n        <div class=\"launch-btn v5-btn\" onclick=\"window.external ? window.external.LaunchV5() : null\">\n          <span>LAUNCH CONSOLE</span>\n          <span>&rarr;</span>\n        </div>\n      </div>\n    </div>\n    \n    <div class=\"grid-cell\">\n      <div class=\"card card-v6\">\n        <div class=\"card-header-area\">\n          <div class=\"icon-circle v6-icon\">\ud83c\udf10</div>\n          <div class=\"card-title-info\">\n            <h2>WEB DASHBOARD</h2>\n            <span class=\"badge v6-badge\">CHROMIUM / WEBVIEW2</span>\n          </div>\n        </div>\n        <p class=\"card-desc\">Interactive dashboard with real-time monitors, log streaming, and autopilot repair.</p>\n        <ul class=\"features-list v6-features\">\n          <li>Rich Visual Dashboard</li>\n          <li>Real-Time Hardware Telemetry</li>\n          <li>Live Diagnostic Streaming</li>\n          <li>One-Click Fix Presets</li>\n        </ul>\n        <div class=\"launch-btn v6-btn\" onclick=\"window.external ? window.external.LaunchV6() : null\">\n          <span>LAUNCH DASHBOARD</span>\n          <span>&rarr;</span>\n        </div>\n      </div>\n    </div>\n    \n    <div class=\"grid-cell\">\n      <div class=\"card card-printer\">\n        <div class=\"card-header-area\">\n          <div class=\"icon-circle printer-icon\">\ud83d\udda8️</div>\n          <div class=\"card-title-info\">\n            <h2>PRINTER ANALYZER</h2>\n            <span class=\"badge printer-badge\">SPECIALIZED TOOL</span>\n          </div>\n        </div>\n        <p class=\"card-desc\">Dedicated printer diagnostic, spooler self-repair, and driver auditing utility.</p>\n        <ul class=\"features-list printer-features\">\n          <li>Spooler Subsystem Health</li>\n          <li>Driver Architecture Audit</li>\n          <li>Queue Management</li>\n          <li>Automated Spooler Reset</li>\n        </ul>\n        <div class=\"launch-btn printer-btn\" onclick=\"window.external ? window.external.LaunchPrinter() : null\">\n          <span>LAUNCH PRINTER TOOL</span>\n          <span>&rarr;</span>\n        </div>\n      </div>\n    </div>\n    \n  </div>\n  \n  <div class=\"stats-bar\">\n    <div class=\"stat-item\">\n      <div class=\"stat-icon\">⚙️</div>\n      <div class=\"stat-text\">\n        <h3>DUAL ENGINE ARCHITECTURE</h3>\n        <p>Console + Web Interface</p>\n      </div>\n    </div>\n    <div class=\"stat-item\">\n      <div class=\"stat-icon\">⚡</div>\n      <div class=\"stat-text\">\n        <h3>HARDENED LOCAL BRIDGE</h3>\n        <p>Loopback Bound (Port 9999)</p>\n      </div>\n    </div>\n    <div class=\"stat-item\">\n      <div class=\"stat-icon\">\ud83d\udee1️</div>\n      <div class=\"stat-text\">\n        <h3>ENTERPRISE SECURITY</h3>\n        <p>Phase 2 Compliant</p>\n      </div>\n    </div>\n  </div>\n  \n  <div class=\"footer\">\n    <div class=\"status-pill\">\n      <div class=\"status-dot\"></div>\n      <span>SYSTEM: Certified Loopback Protected</span>\n    </div>\n    <div class=\"footer-center\">\n      ASHtech PC Toolkit Pro &bull; Version 8.0.0-dev\n    </div>\n  </div>\n  \n</div>\n</body>\n</html>";
		}

		// Token: 0x06000015 RID: 21 RVA: 0x00002900 File Offset: 0x00000B00
		private string GetRunningHtmlString()
		{
			return "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n<title>ASHtech PC Toolkit Pro — Dashboard Active</title>\n<style>\n  * { margin:0; padding:0; box-sizing:border-box; }\n  body {\n    background: #08090d;\n    color: #ffffff;\n    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n    overflow: hidden;\n    user-select: none;\n    -ms-user-select: none;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    height: 100%;\n  }\n  \n  .card {\n    background: rgba(14, 30, 49, 0.25);\n    border: 1px solid rgba(14, 116, 144, 0.4);\n    box-shadow: 0 0 40px rgba(6, 182, 212, 0.15);\n    border-radius: 16px;\n    padding: 40px;\n    text-align: center;\n    width: 90%;\n    max-width: 500px;\n  }\n  \n  .icon-circle {\n    width: 80px;\n    height: 80px;\n    border-radius: 50%;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    font-size: 36px;\n    margin: 0 auto 20px;\n    background: rgba(6, 182, 212, 0.1);\n    border: 1px dashed rgba(6, 182, 212, 0.5);\n    color: #22d3ee;\n  }\n  \n  h2 {\n    font-size: 20px;\n    font-weight: 800;\n    letter-spacing: 1px;\n    margin-bottom: 10px;\n    color: #22d3ee;\n  }\n  \n  p {\n    font-size: 12px;\n    color: #94a3b8;\n    line-height: 1.6;\n    margin-bottom: 30px;\n  }\n  \n  .stop-btn {\n    display: block;\n    width: 100%;\n    padding: 12px 0;\n    background: transparent;\n    border: 1px solid #ef4444;\n    color: #fca5a5;\n    border-radius: 8px;\n    font-size: 12px;\n    font-weight: 700;\n    cursor: pointer;\n    letter-spacing: 1.5px;\n  }\n  \n  .stop-btn:hover {\n    background: #ef4444;\n    color: #ffffff;\n  }\n</style>\n</head>\n<body>\n<div class=\"card\">\n  <div class=\"icon-circle\">\ud83c\udf10</div>\n  <h2>WEB DASHBOARD ACTIVE</h2>\n  <p>\n    The local WebBridge server is running securely on loopback port 9999.<br>\n    The interactive admin dashboard is open in your browser.<br>\n    Keep this launcher window active while using the toolkit.\n  </p>\n  <button class=\"stop-btn\" onclick=\"window.external ? window.external.StopV6() : null\">STOP SERVER & EXIT</button>\n</div>\n</body>\n</html>";
		}

		// Token: 0x04000002 RID: 2
		private string runtimeDir;

		// Token: 0x04000003 RID: 3
		private WebBrowser webBrowser;

		// Token: 0x04000004 RID: 4
		private Process serverProc = null;
	}
}
