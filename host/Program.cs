using System.Diagnostics;
using System.Net.Http;
using System.Security.Principal;
using System.Text.Json;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace Akshigo.Host;

internal static class Program
{
    internal static readonly string DataDirectory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Akshigo", "TestBuild");
    private static readonly object LogLock = new();
    internal static void Log(string message)
    {
        lock (LogLock) {
            Directory.CreateDirectory(DataDirectory);
            var file = Path.Combine(DataDirectory, "host.log");
            if (File.Exists(file) && new FileInfo(file).Length > 2_000_000) File.Move(file, file + ".previous", true);
            File.AppendAllText(file, $"{DateTimeOffset.Now:O} {message}{Environment.NewLine}");
        }
    }

    [STAThread]
    private static void Main(string[] args)
    {
        ApplicationConfiguration.Initialize();
        bool smoke = args.Contains("--smoke-test");
        bool native = args.Contains("--enable-native") && !smoke;
        bool admin = new WindowsPrincipal(WindowsIdentity.GetCurrent()).IsInRole(WindowsBuiltInRole.Administrator);
        if (native && !admin) { MessageBox.Show("Use the administrator option inside Akshigo to enable native operations.", "Akshigo Test Build"); return; }
        using var mutex = new Mutex(false, @"Local\Akshigo.PCToolkit.TestBuild");
        bool owned;
        try { owned = mutex.WaitOne(args.Contains("--relaunch") ? TimeSpan.FromSeconds(20) : TimeSpan.Zero); }
        catch (AbandonedMutexException) { owned = true; }
        if (!owned) { if (!smoke) MessageBox.Show("Akshigo Test Build is already open.", "Akshigo"); Environment.ExitCode = 2; return; }
        try { Application.Run(new MainWindow(native, smoke)); }
        catch (Exception error) { Log(error.ToString()); Environment.ExitCode = 1; if (!smoke) MessageBox.Show(error.Message, "Akshigo could not start"); }
        finally { mutex.ReleaseMutex(); }
    }
}

internal sealed class MainWindow : Form
{
    private readonly WebView2 view = new() { Dock = DockStyle.Fill };
    private readonly ToolStrip menu = new() { GripStyle = ToolStripGripStyle.Hidden, Dock = DockStyle.Top };
    private readonly bool native;
    private readonly bool smoke;
    private readonly HttpClient http = new(new HttpClientHandler { UseProxy = false }) { Timeout = TimeSpan.FromSeconds(8) };
    private Process? backend;
    private Uri? origin;
    private string? sessionToken;
    private bool closing;
    private bool stopped;
    private bool ready;
    private readonly string instance = Guid.NewGuid().ToString("N");

    internal MainWindow(bool native, bool smoke)
    {
        this.native = native; this.smoke = smoke;
        Text = "Akshigo PC Toolkit Pro — TEST BUILD — " + (native ? "Administrator operations enabled" : "Preview mode");
        Width = 1440; Height = 940; MinimumSize = new Size(1000, 700); StartPosition = FormStartPosition.CenterScreen;
        menu.Items.Add(new ToolStripLabel("TEST BUILD • " + (native ? "Native repairs enabled — review every operation" : "Preview — native repairs disabled")));
        if (!native) { var enable = new ToolStripButton("Enable repairs as administrator…"); enable.Click += EnableNative; menu.Items.Add(enable); }
        var logs = new ToolStripButton("Open logs");
        logs.Click += (_, _) => Process.Start(new ProcessStartInfo("explorer.exe") { ArgumentList = { Program.DataDirectory }, UseShellExecute = false });
        menu.Items.Add(logs);
        Controls.Add(view); Controls.Add(menu);
        Shown += async (_, _) => await StartAsync();
        FormClosing += OnClosing;
        if (smoke) { ShowInTaskbar = false; Opacity = 0; }
    }

    private async Task StartAsync()
    {
        try {
            _ = CoreWebView2Environment.GetAvailableBrowserVersionString();
            var root = AppContext.BaseDirectory;
            var node = Path.Combine(root, "runtime", "node.exe");
            var server = Path.Combine(root, "backend", "server.cjs");
            if (!File.Exists(node) || !File.Exists(server) || !File.Exists(Path.Combine(root, "dist", "index.html")))
                throw new InvalidOperationException("Extract the entire Akshigo ZIP before opening the EXE. Its runtime, backend and dist folders must stay beside it.");
            var started = new TaskCompletionSource<int>(TaskCreationOptions.RunContinuationsAsynchronously);
            var info = new ProcessStartInfo(node) { WorkingDirectory = root, UseShellExecute = false, CreateNoWindow = true, RedirectStandardOutput = true, RedirectStandardError = true, RedirectStandardInput = true };
            info.ArgumentList.Add(server);
            info.Environment.Remove("NODE_OPTIONS"); info.Environment.Remove("NODE_PATH");
            info.Environment["NODE_ENV"] = "production";
            info.Environment["PORT"] = "0";
            info.Environment["AKSHIGO_DESKTOP_HOST"] = "1";
            info.Environment["AKSHIGO_HOST_INSTANCE"] = instance;
            info.Environment["AKSHIGO_NATIVE_OPERATIONS"] = native ? "1" : "0";
            backend = new Process { StartInfo = info, EnableRaisingEvents = true };
            backend.OutputDataReceived += (_, e) => {
                if (e.Data is null) return;
                if (e.Data.StartsWith("AKSHIGO_READY ")) {
                    try { using var doc = JsonDocument.Parse(e.Data[14..]); if (doc.RootElement.GetProperty("instance").GetString() == instance) started.TrySetResult(doc.RootElement.GetProperty("port").GetInt32()); }
                    catch (Exception error) { started.TrySetException(error); }
                } else Program.Log(e.Data);
            };
            backend.ErrorDataReceived += (_, e) => { if (e.Data is not null) Program.Log(e.Data); };
            backend.Exited += (_, _) => {
                started.TrySetException(new InvalidOperationException("The backend exited before startup completed. See host.log."));
                if (ready && !closing && !IsDisposed) BeginInvoke(() => {
                    ready = false; view.Visible = false;
                    Controls.Add(new Label { Dock = DockStyle.Fill, TextAlign = ContentAlignment.MiddleCenter, Text = "The backend stopped. Close and reopen Akshigo. No repair success is assumed. See host.log." });
                });
            };
            backend.Start(); backend.BeginOutputReadLine(); backend.BeginErrorReadLine();
            int port = await started.Task.WaitAsync(TimeSpan.FromSeconds(40));
            origin = new Uri($"http://127.0.0.1:{port}/");
            using var health = JsonDocument.Parse(await http.GetStringAsync(new Uri(origin, "api/health")));
            if (health.RootElement.GetProperty("instance").GetString() != instance) throw new InvalidOperationException("Backend identity verification failed.");
            using var request = new HttpRequestMessage(HttpMethod.Get, new Uri(origin, "api/v1/operations/session"));
            request.Headers.Add("X-Toolkit-Client", "akshigo-ui");
            using var response = await http.SendAsync(request); response.EnsureSuccessStatusCode();
            using var session = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            sessionToken = session.RootElement.GetProperty("token").GetString();
            var environment = await CoreWebView2Environment.CreateAsync(null, Path.Combine(Program.DataDirectory, "WebView2"));
            await view.EnsureCoreWebView2Async(environment);
            view.CoreWebView2.Settings.AreHostObjectsAllowed = false;
            view.CoreWebView2.Settings.IsWebMessageEnabled = false;
            view.CoreWebView2.PermissionRequested += (_, e) => e.State = CoreWebView2PermissionState.Deny;
            view.CoreWebView2.DownloadStarting += (_, e) => e.Cancel = true;
            view.CoreWebView2.NewWindowRequested += (_, e) => { e.Handled = true; };
            view.CoreWebView2.NavigationStarting += (_, e) => {
                if (!Uri.TryCreate(e.Uri, UriKind.Absolute, out var uri) || uri.Scheme != origin.Scheme || uri.Host != origin.Host || uri.Port != origin.Port) e.Cancel = true;
            };
            view.CoreWebView2.NavigationCompleted += async (_, e) => {
                if (!smoke) return;
                try {
                    if (!e.IsSuccess) throw new InvalidOperationException("WebView navigation failed: " + e.WebErrorStatus);
                    bool rendered = false;
                    for (int i = 0; i < 60; i++) {
                        rendered = await view.CoreWebView2.ExecuteScriptAsync("document.getElementById('root')?.childElementCount > 0") == "true";
                        if (rendered) break;
                        await Task.Delay(250);
                    }
                    if (!rendered) throw new InvalidOperationException("React did not render in WebView2.");
                    Program.Log("SMOKE PASS: owned backend, random port, health identity, session and React rendering in WebView2.");
                    File.WriteAllText(Path.Combine(Program.DataDirectory, "smoke-result.json"), JsonSerializer.Serialize(new { status = "PASS", time = DateTimeOffset.UtcNow, port, nativeOperations = false }));
                    Close();
                } catch (Exception error) { Fail(error); }
            };
            ready = true;
            view.CoreWebView2.Navigate(origin.ToString());
            Program.Log($"Host ready; backend PID {backend.Id}, port {port}, native operations {native}.");
        } catch (Exception error) { Fail(error); }
    }

    private void Fail(Exception error)
    {
        Program.Log(error.ToString()); Environment.ExitCode = 1;
        if (smoke) File.WriteAllText(Path.Combine(Program.DataDirectory, "smoke-result.json"), JsonSerializer.Serialize(new { status = "FAIL", error = error.Message, time = DateTimeOffset.UtcNow }));
        else MessageBox.Show(this, error.Message + "\n\nLogs: " + Program.DataDirectory + "\nIf WebView2 is missing, install Microsoft's WebView2 Evergreen Runtime.", "Akshigo Test Build", MessageBoxButtons.OK, MessageBoxIcon.Error);
        closing = true; Close();
    }

    private void EnableNative(object? sender, EventArgs args)
    {
        if (MessageBox.Show(this, "This unfinished test build can change Windows services, networking and system files. Only implemented actions are available. Continue to Windows administrator approval?", "Enable native repair testing", MessageBoxButtons.YesNo, MessageBoxIcon.Warning) != DialogResult.Yes) return;
        try {
            Process.Start(new ProcessStartInfo(Environment.ProcessPath!) { UseShellExecute = true, Verb = "runas", Arguments = "--enable-native --relaunch", WorkingDirectory = AppContext.BaseDirectory });
            Close();
        } catch (Exception error) { MessageBox.Show(this, "Administrator launch did not complete: " + error.Message, "Akshigo"); }
    }

    private async void OnClosing(object? sender, FormClosingEventArgs e)
    {
        if (stopped) return;
        e.Cancel = true;
        if (native && ready && !closing) {
            try {
                using var request = new HttpRequestMessage(HttpMethod.Get, new Uri(origin!, "api/v1/operations/jobs"));
                request.Headers.Add("X-Toolkit-Auth", sessionToken);
                using var response = await http.SendAsync(request); response.EnsureSuccessStatusCode();
                using var jobs = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
                if (jobs.RootElement.GetProperty("jobs").EnumerateArray().Any(job => job.GetProperty("status").GetString() == "RUNNING")) {
                    MessageBox.Show(this, "A native operation is still running. Wait for it to finish before closing.", "Akshigo"); return;
                }
            } catch (Exception error) { Program.Log("Close check: " + error.Message); MessageBox.Show(this, "Cannot verify that repairs have finished. Check the operation and logs before closing.", "Akshigo"); return; }
        }
        closing = true;
        view.Dispose();
        if (backend is not null && !backend.HasExited) {
            backend.StandardInput.Close();
            try { await backend.WaitForExitAsync().WaitAsync(TimeSpan.FromSeconds(8)); }
            catch (TimeoutException) { backend.Kill(); await backend.WaitForExitAsync(); }
        }
        backend?.Dispose(); http.Dispose(); stopped = true; Close();
    }
}
