using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace UltimateToolkit
{
    static class PrinterAnalyzerPro
    {
        [STAThread]
        static void Main()
        {
            string dir = AppDomain.CurrentDomain.BaseDirectory;
            string bat = Path.Combine(dir, "Toolkit.bat");
            if (File.Exists(bat))
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = "/c \"" + bat + "\" --label menu_printer_spooler",
                    WorkingDirectory = dir,
                    UseShellExecute = true
                });
            }
            else
            {
                MessageBox.Show("Toolkit.bat not found at:\n" + bat, "File Not Found",
                    MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
            }
        }
    }
}
