# ASHtech PC Toolkit - Google AI Studio Start Here

## Goal
Modernize the purchased Windows toolkit into a professional subscription-based Windows desktop product while preserving its working diagnostic/repair engine and overall behavior.

## Source of truth
- C# launcher/build project: `tool/UltimateToolkit_Bundle_new/`
- Final runtime payload source used by `build_payload.ps1`: `V7/`
- Build script: `tool/UltimateToolkit_Bundle_new/build_payload.ps1`

Important: duplicated runtime files exist under both the C# project folder and `V7/`. The build script currently packages the `V7/` versions. Do not assume edits to the project-folder duplicates are included in the final EXE.

## Non-negotiable product rules
1. Preserve existing working Windows diagnostics and repair behavior unless a security problem requires refactoring.
2. Do not convert this into a web-only application.
3. Keep Windows desktop/EXE delivery.
4. Do not bypass, disable, evade, or whitelist around Microsoft Defender, SmartScreen, UAC, or Windows Firewall.
5. Improve Defender friendliness through secure implementation, least privilege, predictable execution, validation, signing, and removal/refactoring of suspicious patterns.
6. Do not store API keys or license secrets in source code.
7. Do not perform a full architecture rewrite in the first development phase.
8. Add subscription licensing as a new commercial layer, not as a hard-coded local-only date check.
9. Any privileged/destructive repair action must have clear confirmation and logging.
10. Do not claim a build/test succeeded without evidence.

## Target commercial product
Working name: ASHtech PC Toolkit Pro

Core areas:
- Dashboard
- Diagnostics
- Repairs
- Performance
- Network
- Software
- Security
- AI Assistant
- Reports
- Settings
- License / Subscription

## Subscription target
- License key activation
- 1-year subscription support
- Renewal reminders
- Expiry handling
- Device activation limits
- Signed/cached offline entitlement with periodic online validation
- HTTPS licensing backend
- Server-side subscription state
- No plaintext secrets in the EXE

## First development rule
Analyze and document before changing code. Create a modernization plan that reuses the working engine while replacing the user experience and unsafe implementation patterns incrementally.
