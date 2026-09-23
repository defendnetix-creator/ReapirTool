using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace UltimateToolkit
{
    static class V5
    {
        [STAThread]
        static void Main()
        {
            string dir = AppDomain.CurrentDomain.BaseDirectory;
            string modulesDir = Path.Combine(dir, "Modules");
            string ps1 = Path.Combine(modulesDir, "Toolkit-GUI-Pro.ps1");

            if (!File.Exists(ps1))
            {
                string altDir = Environment.GetEnvironmentVariable("UT_ORIGINAL_DIR");
                if (!string.IsNullOrEmpty(altDir))
                {
                    ps1 = Path.Combine(altDir, "Modules", "Toolkit-GUI-Pro.ps1");
                }
            }

            if (!File.Exists(ps1))
            {
                MessageBox.Show("Could not find Toolkit-GUI-Pro.ps1 in:\n" + modulesDir,
                    "File Not Found", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
                return;
            }

            try
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = "powershell.exe";
                psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -File \"" + ps1 + "\"";
                psi.WorkingDirectory = dir;
                psi.UseShellExecute = false;
                psi.CreateNoWindow = true;
                psi.WindowStyle = ProcessWindowStyle.Hidden;
                Process.Start(psi);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Failed to launch v5: " + ex.Message, "Error",
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
