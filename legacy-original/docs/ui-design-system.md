# UI Design System & Component Guidelines
**Product:** ASHtech PC Toolkit Pro v8.0.0  
**Framework:** Modern React 19 + Tailwind CSS + Vanilla Web Component Tokens  

---

## 1. Typography & Hierarchy

| Element | Font Family | Size | Weight | Tracking / Letter Spacing | Color |
|---|---|---|---|---|---|
| **App Title** | `JetBrains Mono`, `Consolas`, monospace | `15px` | 800 (Extrabold) | `0.1em` uppercase | `#ffffff` |
| **Page Title** | `Inter`, `Segoe UI`, sans-serif | `22px` | 700 (Bold) | `-0.01em` | `#f8fafc` |
| **Section Header** | `JetBrains Mono`, monospace | `12px` | 700 (Bold) | `0.08em` uppercase | `#94a3b8` |
| **Card Header** | `JetBrains Mono`, monospace | `11px` | 700 (Bold) | `0.08em` uppercase | `#f1f5f9` |
| **Metric Value (Hero)**| `Inter`, sans-serif | `28px` - `32px` | 800 (Extrabold) | `-0.02em` | `#f8fafc` / `#22d3ee` / `#34d399` |
| **Body Text** | `Inter`, sans-serif | `13px` - `14px` | 400 (Regular) | `0` | `#94a3b8` |
| **Meta / Caption** | `JetBrains Mono`, monospace | `11px` | 500 (Medium) | `0.02em` | `#64748b` |
| **Badge / Pill** | `JetBrains Mono`, monospace | `10px` | 700 (Bold) | `0.05em` | Variable by status |

---

## 2. Component Token Specifications

### 2.1 Buttons
- **Primary Emerald Action (`btn-primary`):**
  - Background: `#10b981` (hover: `#059669`, active: `#047857`)
  - Text: `#022c22`, Font: Bold `12px`, Monospace Tracking `0.05em`
  - Border: None, Border-radius: `6px`, Padding: `8px 18px`
  - Icon: Sits on the right with animated transition (`group-hover:translate-x-1`)
- **Secondary Ghost Action (`btn-secondary`):**
  - Background: `rgba(255, 255, 255, 0.04)` (hover: `rgba(255, 255, 255, 0.08)`)
  - Text: `#cbd5e1`, Font: Bold `12px`, Border: `1px solid rgba(255, 255, 255, 0.12)`
  - Border-radius: `6px`, Padding: `8px 16px`
- **Destructive Action (`btn-danger`):**
  - Background: `rgba(239, 68, 68, 0.12)` (hover: `rgba(239, 68, 68, 0.25)`)
  - Text: `#fca5a5`, Border: `1px solid rgba(239, 68, 68, 0.4)`, Radius: `6px`

### 2.2 Bento Cards (`card-bento`)
- Surface: `background: #0e121c; border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 8px;`
- Hover State: `border-color: rgba(6, 182, 212, 0.3); transition: border-color 0.2s ease;`
- Internal Padding: `16px` to `20px`

### 2.3 Status Pills & Indicators
- **Optimal / Success:** `bg-emerald-950/40 text-emerald-400 border border-emerald-500/30`
- **Cyan Info / Active:** `bg-cyan-950/40 text-cyan-400 border border-cyan-500/30`
- **Warning (P2):** `bg-amber-950/40 text-amber-400 border border-amber-500/30`
- **Critical Alert (P1):** `bg-rose-950/40 text-rose-400 border border-rose-500/30`
- **Violet Role / Tag:** `bg-purple-950/40 text-purple-400 border border-purple-500/30`

### 2.4 Data Tables (`table-enterprise`)
- Header: Monospace, `11px`, `tracking-wider`, `text-slate-400`, `bg-[#0a0d15]`, `border-b border-white/5`
- Row: `border-b border-white/5`, `hover:bg-white/[0.02]`, `text-slate-200`, `text-[13px]`
- Selected Row: `bg-cyan-950/20 border-l-2 border-l-cyan-400`

---

## 3. Micro-Interactions & Animation Guardrails
- **Duration:** All transitions use `150ms` - `200ms` ease-out.
- **No Heavy Physics:** Never use bouncing, looping, or spring animations that distract from operational status.
- **Pulsing LED Dots:** 2s gentle opacity breath (`opacity: 1` -> `opacity: 0.4`).
- **Telemetry Frequency Stream:** Real-time 60Hz harmonic SVG sine wave to visually confirm streaming activity without CPU thrashing.
