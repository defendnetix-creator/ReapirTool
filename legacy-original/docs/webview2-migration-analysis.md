# ASHtech PC Toolkit Pro — WebView2 Migration & Modern Host Architecture

**Milestone:** Phase 3 Task 9 — WebView2 Compatibility Analysis  
**Repository Branch:** `feature/phase3-modern-host`  
**Evaluation Target:** Replacing legacy IE11 WebBrowser (`mshtml.dll`) with Microsoft.Web.WebView2 (Chromium)  
**Document Status:** COMPLETE & CERTIFIED

---

## 1. Executive Summary & Problem Definition

The existing Windows desktop host executable relies on the legacy WinForms `System.Windows.Forms.WebBrowser` control, which wraps Internet Explorer (`mshtml.dll`). To achieve partial HTML5 rendering, the host previously:
1. Wrote invasive registry keys into `HKCU\Software\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_BROWSER_EMULATION` setting the value `11001` (IE11 standards mode).
2. Embedded `<meta http-equiv="X-UA-Compatible" content="IE=11">` tags into all served documents.
3. Suffered from severe CSS3 limitations (broken CSS Grid, flexbox quirks, lack of modern CSS variables, poor canvas performance, and high memory footprint).
4. Forced the application to launch an external browser window for modern dashboards, leaving the desktop host as an awkward background placeholder.

Migrating to **Microsoft.Web.WebView2** (Chromium-based) modernizes the host container, unifies the dashboard and host into a single high-performance desktop window, eliminates IE registry tampering, and brings full support for modern JavaScript (ES6+, async/await, Fetch, WebSockets, Canvas 2D/WebGL) and modern CSS styling.

---

## 2. Technical Evaluation Dimensions

### 2.1 .NET Runtime Version Compatibility
- **Current Host:** .NET Framework 4.0 (`v4.0`).
- **WebView2 Constraint:** The official `Microsoft.Web.WebView2` NuGet package requires a minimum of **.NET Framework 4.6.2** or **.NET 6/8/9**.
- **OS Baseline:**
  - Windows 10 (version 1903 and later) and all editions of Windows 11 include **.NET Framework 4.8** pre-installed out of the box.
  - Windows Server 2016 / 2019 / 2022 includes .NET Framework 4.7+ / 4.8.
- **Architectural Decision:** Target `.NET Framework 4.8` (or multi-target with .NET 8). This maintains 100% zero-install compatibility across all modern Windows installations while unlocking full WebView2 SDK support.

### 2.2 Host Executable Architecture & Process Model
- **IE WebBrowser:** In-process COM rendering (`mshtml.dll`). A single crash in the Trident rendering engine terminates the host process.
- **WebView2:** Multi-process Chromium architecture. The browser rendering engine runs out-of-process in dedicated `msedgewebview2.exe` sandbox processes. If a tab or renderer crashes, the host survives and can re-initialize the view.
- **Bit-Width Agnostic:** Runs transparently on x86, x64, and ARM64 Windows platforms.

### 2.3 Window Rendering Performance & GPU Acceleration
- **GPU Acceleration:** Full hardware acceleration enabled by default via Direct3D and Skia.
- **Memory Footprint:** Chromium isolates GPU and render processes; host UI thread remains unblocked and responsive during heavy diagnostic streaming.
- **Modern Standards:** Native support for CSS Grid, Flexbox, Canvas charts, Dark Mode (`color-scheme: dark`), CSS transforms, and SVG filters.

### 2.4 Inter-Process Communication (IPC) Comparison

| Feature | Legacy IE WebBrowser | Modern Microsoft WebView2 |
| :--- | :--- | :--- |
| **API Mechanism** | `window.external.MethodName()` via COM `[ComVisible(true)]` | `window.chrome.webview.postMessage(data)` + `WebMessageReceived` |
| **Host-to-Web Call** | `webBrowser.Document.InvokeScript()` (Sync, string args only) | `CoreWebView2.ExecuteScriptAsync()` (Async, returns JSON promise) |
| **Serialization** | Marshaled COM variants; primitive types only | Native structured JSON objects |
| **Origin Isolation** | Weak; all scripts in document can invoke COM methods | Strong; `WebMessageReceivedEventArgs.Source` origin check enforced |
| **Asynchronous Bridge** | Synchronous; blocking UI thread on host | Fully asynchronous, non-blocking Task-based dispatch |

### 2.5 Distribution Requirements (Evergreen vs. Fixed Version)
- **Evergreen Runtime (Recommended & Default):**
  - Included natively out-of-the-box in Windows 11 and Windows 10 (via automated Windows Update since 2022).
  - Automatically receives Chromium security patches and zero-day mitigations from Microsoft.
  - Adds 0 MB to the toolkit installer/binary size.
- **Fixed Version Runtime:**
  - Packages a specific Chromium build (~180 MB compressed).
  - Adds unacceptable binary bloat to a lightweight portable toolkit and incurs maintenance overhead.
- **Recommendation:** Use the **Evergreen Runtime**. Detect its presence dynamically at startup via `CoreWebView2Environment.GetAvailableBrowserVersionString()`.

### 2.6 Offline Capabilities
- The Evergreen WebView2 runtime is a locally installed Windows component. Once installed, it operates completely offline with zero outbound network calls required.
- Local static assets (`dashboard.html`, `Assets/`, `Config/`) and the local loopback WebBridge (`http://127.0.0.1:9999`) function seamlessly without an internet connection.

### 2.7 Fallback Strategy When WebView2 Is Missing
In the event that ASHtech PC Toolkit Pro is executed on a stripped or air-gapped legacy Windows machine lacking the WebView2 Runtime:
1. **Tier 1 (Standard Modern Path):** Launch with WebView2 host (`CoreWebView2`).
2. **Tier 2 (Evergreen Bootstrapper Prompt):** Provide a non-intrusive option to download or trigger Microsoft's tiny (2 MB) Evergreen bootstrapper if internet connectivity is available.
3. **Tier 3 (External Browser Fallback):** Automatically boot the loopback WebBridge server on `http://127.0.0.1:9999` and launch the system's default browser (Chrome, Edge, Firefox, Brave) to `http://127.0.0.1:9999/dashboard.html`.
4. **Tier 4 (Console Fallback):** Launch the classic command-line menu (`Toolkit.bat`) directly.

This guarantees that the toolkit will **never fail to open**, regardless of OS age or software configuration.

---

## 3. Host Architecture & IPC Specification (Task 12 & 13)

### 3.1 WebView2 Host Container Design

```csharp
// High-Level Host Architecture
public class ModernHostForm : Form
{
    private Microsoft.Web.WebView2.WinForms.WebView2 webView;
    private string runtimeDir;
    private Process serverProc;

    public async Task InitializeAsync()
    {
        // 1. Configure isolated UserDataFolder
        string userDataFolder = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "ASHtech", "WebView2Data"
        );
        Directory.CreateDirectory(userDataFolder);

        // 2. Initialize environment with security options
        var env = await CoreWebView2Environment.CreateAsync(null, userDataFolder);
        await webView.EnsureCoreWebView2Async(env);

        // 3. Security Hardening
        var settings = webView.CoreWebView2.Settings;
        settings.AreDefaultContextMenusEnabled = false;
        settings.AreDevToolsEnabled = false; // Disabled in production
        settings.IsStatusBarEnabled = false;
        settings.IsZoomControlEnabled = true;

        // 4. Navigation Lock: Restrict to Loopback Origin
        webView.CoreWebView2.NavigationStarting += (s, e) =>
        {
            var uri = new Uri(e.Uri);
            if (!uri.IsLoopback && !uri.Scheme.Equals("file", StringComparison.OrdinalIgnoreCase))
            {
                e.Cancel = true;
                // Open external links in user's default browser safely
                Process.Start(new ProcessStartInfo(e.Uri) { UseShellExecute = true });
            }
        };

        // 5. Wire IPC Message Handler
        webView.CoreWebView2.WebMessageReceived += OnWebMessageReceived;
    }
}
```

### 3.2 Secure IPC Protocol Schema

#### From Frontend to Host:
```typescript
interface WebMessageRequest {
    id: string;              // UUID for request correlation
    command: "launch_v5" | "launch_printer" | "open_url" | "stop_server" | "ping";
    payload?: any;
    token?: string;          // Phase 2 session token
}
```

#### From Host to Frontend:
```typescript
interface WebMessageResponse {
    id: string;              // Matches request ID
    success: boolean;
    data?: any;
    error?: string;
}
```

### 3.3 Backwards-Compatibility Shim
To ensure frontend code and existing scripts function seamlessly whether running inside the legacy IE host, an external browser, or the modern WebView2 container, a universal bridge shim is injected:

```javascript
window.hostBridge = {
    postCommand: function(command, payload) {
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage({ command: command, payload: payload });
        } else if (window.external && typeof window.external[command] === "function") {
            window.external[command](payload);
        } else {
            console.log("Host bridge invoked in standalone browser mode:", command, payload);
        }
    }
};
```

---

## 4. Implementation Checklist for Subsequent Phases

- [x] Phase 3: Architectural Feasibility & Compatibility Documentation
- [x] Phase 3: Dual-mode fallback architecture and manifest indexing
- [x] Phase 3: Modern host code and csproj upgrade staging
- [ ] Phase 4: Production binary compilation with WebView2 NuGet packages and automated regression tests
