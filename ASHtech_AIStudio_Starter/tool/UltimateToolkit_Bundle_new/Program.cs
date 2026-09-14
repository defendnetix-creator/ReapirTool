using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Security.AccessControl;
using System.Security.Principal;
using System.Windows.Forms;

namespace UltimateToolkitLauncher
{
	public static class Program
	{
		[STAThread]
		public static void Main()
		{
			try
			{
				bool hasEmbeddedResource = false;
				using (Stream manifestResourceStream = Assembly.GetExecutingAssembly().GetManifestResourceStream("StagingZip"))
				{
					hasEmbeddedResource = (manifestResourceStream != null);
				}
				string text;
				if (hasEmbeddedResource)
				{
					text = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "UltimateToolkitSuite");
					string path = Path.Combine(text, ".utinstalled");
					bool needsExtraction = !File.Exists(path) || !File.Exists(Path.Combine(text, "V5.exe")) || !File.Exists(Path.Combine(text, "Modules", "WebBridgeServer.ps1"));
					if (needsExtraction)
					{
						if (Directory.Exists(text))
						{
							try
							{
								DirectoryInfo directoryInfo = new DirectoryInfo(text);
								directoryInfo.Attributes = FileAttributes.Normal;
								Directory.Delete(text, true);
							}
							catch
							{
							}
						}
						Directory.CreateDirectory(text);
						using (Stream manifestResourceStream2 = Assembly.GetExecutingAssembly().GetManifestResourceStream("StagingZip"))
						{
							if (manifestResourceStream2 == null)
							{
								throw new Exception("Embedded payload resource not found!");
							}
							byte[] array = new byte[manifestResourceStream2.Length];
							manifestResourceStream2.Read(array, 0, array.Length);
							string text2 = Path.Combine(text, "_ut_pkg.zip");
							File.WriteAllBytes(text2, array);
							ZipFile.ExtractToDirectory(text2, text);
							File.Delete(text2);
						}
						File.WriteAllText(path, DateTime.Now.ToString("O"));
						try
						{
							DirectorySecurity dirSecurity = new DirectorySecurity();
							NTAccount systemAccount = new NTAccount("NT AUTHORITY\\SYSTEM");
							dirSecurity.AddAccessRule(new FileSystemAccessRule(systemAccount, FileSystemRights.FullControl, InheritanceFlags.ContainerInherit | InheritanceFlags.ObjectInherit, PropagationFlags.None, AccessControlType.Allow));
							NTAccount adminAccount = new NTAccount("BUILTIN\\Administrators");
							dirSecurity.AddAccessRule(new FileSystemAccessRule(adminAccount, FileSystemRights.FullControl, InheritanceFlags.ContainerInherit | InheritanceFlags.ObjectInherit, PropagationFlags.None, AccessControlType.Allow));
							dirSecurity.SetAccessRuleProtection(true, false);
							Directory.SetAccessControl(text, dirSecurity);
						}
						catch
						{
						}
					}
				}
				else
				{
					text = AppDomain.CurrentDomain.BaseDirectory;
				}
				Environment.SetEnvironmentVariable("UT_ORIGINAL_DIR", text + "\\");
				Application.EnableVisualStyles();
				Application.SetCompatibleTextRenderingDefault(false);
				Application.Run(new LauncherForm(text));
			}
			catch (Exception ex)
			{
				try
				{
					string path2 = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "launcher_crash.log");
					File.WriteAllText(path2, "CRASH ERROR:\n" + ex.ToString());
				}
				catch
				{
				}
				MessageBox.Show("Launcher Crash: " + ex.Message + "\nSee launcher_crash.log for details.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Hand);
			}
		}
	}
}
