# Phase 6.1 — Commercial Brand Migration Summary
**Application:** Akshigo PC Toolkit Pro  
**Company / Publisher:** Akshigo Tech  
**Release Version:** `8.0.0-rc.1`

---

## 1. Objectives Achieved

Phase 6.1 successfully completes the commercial brand transition from **ASHtech** to **Akshigo Tech** and **Akshigo PC Toolkit Pro**:

1. **Brand Identity Normalization**:
   - Centralized all brand strings, filesystem locations, URLs, and registry paths in `src/config/brand.ts`.
   - Updated executable naming standard to `Akshigo-PC-Toolkit-Pro.exe`.
   - Updated Inno Setup packaging script to `installer/Akshigo_PC_Toolkit_Pro.iss`.

2. **User Experience & Presentation**:
   - Modernized Sidebar header with high-contrast `AKSHIGO` typography.
   - Updated Settings & Privacy view with new `Akshigo Tech\PC Toolkit Pro` filesystem directory layouts and About attestation.
   - Replaced customer-facing activation prompts with `AKSG-` series sample keys.

3. **Seamless Backward Compatibility**:
   - Implemented automated local storage key migration (`performLegacyBrandMigration()`).
   - Added server-side dual-key hash support allowing existing `ASHT-` keys and new `AKSG-` keys to authenticate to the same license seats.
   - Maintained stable Inno Setup `AppId` (`{{C81F7A23-5C32-4E2B-981D-F81A96010214}}`) for smooth in-place upgrades.

4. **Release Engineering & Build Tooling**:
   - Updated `scripts/build_release.ps1` to produce `Akshigo-PC-Toolkit-Pro-8.0.0-rc.1-Setup.exe`.
   - Updated `scripts/signing/Sign-Artifacts.ps1` with Akshigo Tech Authenticode credentials.
   - Updated `scripts/scan_defender_regressions.ps1` and verified 0 security regressions.
   - Updated `sbom.json` Software Bill of Materials with Akshigo Tech metadata.

---

## 2. Verification & Build Validation

- **TypeScript Typecheck / Lint**: PASSED (`tsc --noEmit`)
- **Vite & Server Build**: PASSED (`npm run build`)
- **Defender Regression Audit**: PASSED (0 flags)
- **Licensing Server Authority**: Dual-key verification active
