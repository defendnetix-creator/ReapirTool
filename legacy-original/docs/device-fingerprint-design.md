# Device Fingerprinting Design & Privacy Architecture

## 1. Design Objectives
The device fingerprinting mechanism in ASHtech PC Toolkit Pro achieves three balanced goals:
1. **Uniqueness**: Distinguishes distinct physical and virtual workstations with >99.9% accuracy.
2. **Stability**: Remains constant across minor OS patching, IP address changes, and network adapter replacements.
3. **Zero Invasive PII**: Gathers no MAC addresses, user account credentials, browsing histories, or private files.

---

## 2. Input Component Matrix

```
+-------------------------------------------------------------------------------+
|                       FINGERPRINT COMPOSITE SCHEME                            |
+-------------------------------------------------------------------------------+

  [Windows Machine GUID]  -----\
  HKLM\Cryptography             \
                                 +---> [ SHA-256 Composite Engine ] ---> [ Stable Hash ]
  [CPU Architecture Hash] ----->/      + Secret Salt
  ProcessorID + Cores          /
                              /
  [Motherboard Serial Hash] -/
  Win32_BaseBoard
```

### Components Collected:
- **Windows Cryptographic Machine GUID**: Stored at `HKLM\SOFTWARE\Microsoft\Cryptography\MachineGuid`. Generated during Windows OS installation.
- **CPU Architecture Hash**: `Win32_Processor` `ProcessorId` + Core Count.
- **Motherboard Serial Number Hash**: `Win32_BaseBoard` `SerialNumber` + `Manufacturer`.
- **Application Salt**: `ASHtech_Pro_v8_Device_Identity_Salt_99812`.

---

## 3. Privacy & Compliance Guarantees
- **No Network MAC Tracking**: MAC addresses are avoided because user network cards, USB adapters, and VPN tunnels frequently rotate.
- **One-Way Cryptographic Digest**: Raw hardware serials are immediately hashed with SHA-256 and never transmitted to the licensing server in plaintext.
- **No User Identity in Fingerprint**: The hash contains no username, email, IP address, or directory paths.
- **Auditable Implementation**: Documented in `DeviceIdentity.cs` and `deviceFingerprint.ts`.
