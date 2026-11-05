using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace NijoPvtPc
{
    static class Program
    {
        [DllImport("user32.dll")]
        private static extern bool SetProcessDPIAware();

        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                SetProcessDPIAware();
            }
            catch { }

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            // Default target URL: Local dev server or hosted hub
            string appUrl = "http://localhost:3000";
            if (args.Length > 0 && !string.IsNullOrEmpty(args[0]))
            {
                appUrl = args[0];
            }

            // Path to Edge executable
            string edgePath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86),
                @"Microsoft\Edge\Application\msedge.exe"
            );

            if (!File.Exists(edgePath))
            {
                edgePath = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),
                    @"Microsoft\Edge\Application\msedge.exe"
                );
            }

            // User data directory for isolated profile
            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            string profileDir = Path.Combine(localAppData, "NijoPvtPcProfile");

            if (File.Exists(edgePath))
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = edgePath,
                    Arguments = string.Format(
                        "--app=\"{0}\" --user-data-dir=\"{1}\" --window-size=1366,850 --window-position=50,50 --enable-features=OverlayScrollbar",
                        appUrl,
                        profileDir
                    ),
                    UseShellExecute = false
                };

                try
                {
                    Process proc = Process.Start(psi);
                    if (proc != null)
                    {
                        return;
                    }
                }
                catch
                {
                    // Fallback to default browser
                }
            }

            // Fallback: Launch in default browser
            Process.Start(new ProcessStartInfo(appUrl) { UseShellExecute = true });
        }
    }
}
