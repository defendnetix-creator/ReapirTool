# AI Assistant Language Fix — Changed Hindi Replies to English

## Problem

The AI assistant was replying in Hindi/Hinglish when users typed messages containing Hindi keywords. This was caused by two separate mechanisms in `WebBridgeServer.ps1`:

1. **System prompt instructed the AI to reply in Hindi** — The prompt sent to the Pollinations/OpenAI API contained a `CRITICAL` instruction telling the AI to respond in Hindi/Hinglish if it detected Hindi input.

2. **Offline fallback replies were hardcoded in Hindi** — When the AI API was unreachable, the code would detect Hindi keywords in the user's message and return hardcoded Hindi replies.

## Changes Made

**File:** `tool/UltimateToolkit_Bundle_new/Modules/WebBridgeServer.ps1`

### Change 1 — System Prompt (line 16527)

**Before:**
```
"CRITICAL: If the user's message is in Hindi or Hinglish (Hindi written in 
Roman script like 'kaise ho', 'jawab de', 'kro'), you MUST respond in natural 
Hinglish/Hindi!"
```

**After:**
```
"Always respond in English regardless of the language the user writes in."
```

Also removed the `'Namaste Technician!'` alternate greeting to only use `'Hello Technician!'`.

---

### Change 2 — Offline Hindi Detection (line 5795)

**Before:**
```powershell
$isHindi = ($u -match 'kya|hai|karo|mera|mujhe|nahi|kaise|kab|kyun|bhai|yaar|pc|tera|mera|slow|thanda|garam|problem|help|bata|batao|chal|raha')
```

**After:**
```powershell
$isHindi = $false
```

This ensures the offline fallback replies always use the English branch.

---

### Change 3 — Offline Error Messages (lines 5879, 5883)

**Before:**
- `"[Offline] Namaste Technician! AI server busy hai, thodi der mein try karo. Dashboard ke sabhi tools kaam kar rahe hain!"`
- `"[Offline] Namaste Technician! Internet AI down hai. ..."`

**After:**
- `"[Offline] Hello Technician! AI server is busy, please try again shortly. All dashboard tools are working!"`
- `"[Offline] Hello Technician! Internet AI is down. ..."`

---

## What Was NOT Changed

- The English fallback replies were left untouched.
- The `Namaste Technician!` greeting in `dashboard.html` was left as-is (cosmetic, not functional).
- All other functionality remains identical.

## Verification

After changes, the AI assistant will:
- Always respond in English via the online AI API
- Always use English text in offline fallback mode
- Function identically in every other respect
