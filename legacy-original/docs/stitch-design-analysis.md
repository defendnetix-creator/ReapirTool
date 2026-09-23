# Stitch UI Design System Analysis & Specification
**Product:** ASHtech PC Toolkit Pro v8.0.0  
**Design Baseline:** Enterprise Cyber-Operations & Telemetry Console (Stitch Ref #AETHER-V4.2)  
**Date:** 2026-09-17  
**Status:** Approved for Implementation  

---

## 1. Executive Summary & Design Ethos
The Stitch reference design establishes a modern, high-precision commercial desktop operations console. It delivers a dark obsidian aesthetic with high typographic contrast, crisp 1px borders, subtle tonal depth, and focused vibrant accents (Emerald Mint, Electric Cyan, Amber Warning, and Soft Violet). 

This design completely replaces outdated hacker/cyberpunk clichés (e.g. excessive glowing neon drop-shadows, pure green matrix fonts, noisy gradients, unstyled command outputs) with an executive-grade interface suitable for IT Managed Service Providers (MSPs), professional technicians, and commercial desktop administrators.

---

## 2. Layout Grid & Spatial Metrics

| Dimension | Exact Spec | Description |
|---|---|---|
| **App Canvas Background** | `#07090e` / `#0a0d14` | Deep obsidian base neutral with <4% cool blue saturation |
| **Surface/Card Background** | `#0e121c` / `#111624` | Elevated surface with 1px border `rgba(255, 255, 255, 0.08)` / `#1e293b` |
| **Sidebar Width** | `260px` fixed | Multi-section navigation with badge counts and host telemetry footer |
| **Top Navigation Height** | `56px` | Breadcrumb path, global command palette (`Ctrl+K`), live status, clock, profile |
| **Main Content Margins** | `24px` horizontal, `20px` vertical | Structured rhythm with 16px/20px gap between bento cards |
| **Copilot Side Panel Width** | `360px` (or 35% on 2-col splits) | Real-time AI Diagnostic Copilot & Contextual Inspector |
| **Border Radius** | `8px` (cards/inputs), `6px` (badges/buttons), `9999px` (pills/dots) | Consistent geometric rhythm |

---

## 3. Color Palette & Functional Token Mapping

```css
:root {
  /* Surfaces */
  --bg-canvas: #07090e;
  --bg-sidebar: #090c13;
  --bg-surface: #0e121c;
  --bg-surface-elevated: #131826;
  --bg-surface-overlay: #182032;

  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.07);
  --border-muted: #1e283d;
  --border-focus: #06b6d4;

  /* Accents & Brand */
  --accent-mint: #10b981;
  --accent-mint-glow: rgba(16, 185, 129, 0.15);
  --accent-cyan: #06b6d4;
  --accent-cyan-glow: rgba(6, 182, 212, 0.15);
  --accent-amber: #f59e0b;
  --accent-amber-glow: rgba(245, 158, 11, 0.15);
  --accent-violet: #8b5cf6;
  --accent-rose: #f43f5e;

  /* Typography */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-cyan: #22d3ee;
  --text-mint: #34d399;
  --text-amber: #fbbf24;
}
```

---

## 4. Component Anatomy from Reference

### A. Top Navigation Header
- **Breadcrumbs:** Monospace path indicator (`Local Host / Workstation-01 / [Executive Dashboard]`) with cyan border accent around the active node.
- **Global Search:** Pill input with hotkey hint (`Ctrl+K`), opening instant tool filtering.
- **System Status Badge:** Pill containing a pulsing live green LED (`● 14/14 Services OK` / `Loopback Bridge Secure`).
- **UTC Clock & Uptime:** Fixed-width tabular numeric clock updating every second.
- **Profile / License Pill:** Highlighting `Enterprise Pro` edition with quick-switch popover.

### B. Navigation Sidebar
- **Brand Header:** Glowing hexagon icon, uppercase bold title `ASHTECH`, version pill `v8.0`, subtitle `Enterprise PC Suite`.
- **Active Node / Host Card:** Displaying machine name (e.g. `DESKTOP-ASHPRO`), `LIVE` status pill, Machine ID `#PC-8841`, and OS details.
- **Categorized Menu Groups:**
  1. *TELEMETRY & WORKSPACES:* Executive Dashboard, System Diagnostics, Real-Time Telemetry.
  2. *REPAIR & AUTOMATION:* Autonomous Fix Engine, Windows Repairs, Network Repairs, Printer Analyzer.
  3. *SECURITY & PERFORMANCE:* Security & Defender, Performance & Startup, Software & Updates.
  4. *INTELLIGENCE & AUDIT:* AI Diagnostic Copilot, Audit Trail & Logs, System Reports.
  5. *MANAGEMENT:* Subscription & Plan (UI Shell), Settings & Privacy.
- **Sidebar Footer:** Live SLA/Health indicator (`Cluster SLA: 99.98% | 0.14ms`) + Authenticated Admin User card.

### C. Hero Healing Banner
- High-contrast card with monospace title `AUTOMATED CLUSTER HEALING & GOVERNANCE SWEEP`, badge `ZERO DOWNTIME`, explanatory paragraph, secondary `View Dry-Run Spec` button, and primary Emerald action button `TRIGGER FULL HEALING →`.

### D. Bento Metric Cards
1. **PC Health Score:** Large numeric score (`98 / 100 Index`), Grade `A+`, segmented progress track, trend indicator (`▲ 2.4% vs last cycle`).
2. **Active System Issues:** Alert counter (`02 Non-Fatal Alerts`), priority tag (`P2 WARNING`), dual-color bar gauge, `Inspect` interactive link.
3. **Repairs Applied:** Stat counter (`142 Fixes Executed`), tag `TODAY`, sub-metrics (`100% automated`, `0 human escalations`).
4. **Network Throughput / IO:** Metric (`156K Active Connections` / `980 Mb/s`), segmented latency bar sparkline, `Edge Synced` status.

### E. Hardware Matrix & Telemetry
- 4 hardware metric tiles (`CPU POOL 18.4%`, `RAM USAGE 42.1%`, `NVME SSD 67.0%`, `NET I/O 980 Mb/s`) with segmented progress bars.
- Frequency oscilloscope / waveform visualization (`SYSTEM VITALS FREQUENCY: 60Hz Real-Time Stream`).

### F. AI Diagnostic Copilot
- Card header with AI inference indicator (`Connected: 4 Local Heuristic Engines`) and `PRO AI` tag.
- Autonomous audit summary text.
- Contextual recommended action with one-click `Approve Suggested Flush/Fix` button.
- Monospace interactive prompt input with send trigger.

### G. Security & Audit Trail Table
- Table layout with monospace headers (`TIMESTAMP (UTC)`, `PRINCIPAL ACTOR`, `TENANT/MODULE SCOPE`, `ACTION / EVENT`, `TARGET / IP`, `STATUS`).
- Status pills: `SUCCESS` (green background), `AUTH OK` (cyan), `WARN` (amber), `FAIL` (red).
- Action buttons: `Export CSV`, `Filters (0)`.

---

## 5. Implementation Strategy
We will implement this exact visual design system across both:
1. **React Application (`src/`)**: For AI Studio web preview, responsive desktop testing, full interaction simulation, and preview verification.
2. **Canonical HTML5 Dashboard (`dashboard.html`)**: For direct embedded execution inside the WebView2 host (`ModernHostForm.cs`) and WebBridge PowerShell server (`Modules/WebBridgeServer.ps1`).
