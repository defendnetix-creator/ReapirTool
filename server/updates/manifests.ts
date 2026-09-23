import { ReleaseManifest } from './types.js';

/**
 * Authoritative Server-Side Release Catalog
 * Signed manifests pinned to Authenticode certificate
 */
export const RELEASE_CATALOG: Record<string, ReleaseManifest> = {
  // Stable 8.0.0 (Current Baseline Release)
  'stable-8.0.0': {
    version: '8.0.0-rc.1',
    channel: 'stable',
    releaseDate: '2026-09-17T00:00:00Z',
    minSupportedVersion: '7.0.0',
    updateType: 'recommended',
    title: 'Akshigo PC Toolkit Pro v8.0.0-rc.1 — Commercial Release',
    releaseNotes: `### What's New in v8.0.0-rc.1 Commercial Release:
- **Commercial Brand Identity**: Fully migrated to Akshigo PC Toolkit Pro & Akshigo Tech.
- **Professional Windows Distribution**: Full Inno Setup installer with clean uninstaller registration in Program Files.
- **Authenticode Digital Signing**: Dual SHA-256 binary signatures with RFC 3161 Digicert timestamping.
- **Commercial Licensing Engine**: Device fingerprinting, RSA-2048 token verification, and DPAPI-encrypted offline caching.
- **Modern WebView2 Container**: Hardware accelerated Stitch UI with zero-trust local loopback bridge.
- **Automated Update Pipeline**: Secure HTTPS manifest-driven updater with SHA-256 hash checks and signature verification.
- **Enterprise Diagnostics & Security**: Live telemetry, Defender regression scanner, and audit ring logging.`,
    installer: {
      filename: 'Akshigo-PC-Toolkit-Pro-8.0.0-rc.1-Setup.exe',
      url: '/api/v1/updates/downloads/Akshigo-PC-Toolkit-Pro-8.0.0-rc.1-Setup.exe',
      sha256: '4f29a0b80f12c98d63a890471b4b9b9903b44b82db7ad1e8b23c21a415951c89',
      sizeBytes: 48325912,
      signature: {
        algorithm: 'SHA256withRSA',
        signer: 'CN=Akshigo Tech, O=Akshigo Tech, L=Seattle, S=Washington, C=US',
        thumbprint: 'B38914A89FE2208A5E12F4B309A98F72A5826649'
      }
    }
  },

  // Beta 8.1.0-beta.1 (Preview Next Feature Channel)
  'beta-8.1.0-beta.1': {
    version: '8.1.0-beta.1',
    channel: 'beta',
    releaseDate: '2026-09-24T00:00:00Z',
    minSupportedVersion: '8.0.0',
    updateType: 'optional',
    title: 'Akshigo PC Toolkit Pro v8.1.0-beta.1 — Advanced Network Forensics',
    releaseNotes: `### Beta Preview Enhancements:
- **Packet Latency Heatmap**: Real-time packet loss and jitter visualization.
- **Smart Predictive Thermal Optimizer**: Fan curve modeling with zero WMI overhead.
- **Direct GPU Memory Flush**: Added dedicated Direct3D 12 texture cache cleaning routine.`,
    installer: {
      filename: 'Akshigo-PC-Toolkit-Pro-8.1.0-beta.1-Setup.exe',
      url: '/api/v1/updates/downloads/Akshigo-PC-Toolkit-Pro-8.1.0-beta.1-Setup.exe',
      sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      sizeBytes: 49102400,
      signature: {
        algorithm: 'SHA256withRSA',
        signer: 'CN=Akshigo Tech, O=Akshigo Tech, L=Seattle, S=Washington, C=US',
        thumbprint: 'B38914A89FE2208A5E12F4B309A98F72A5826649'
      }
    }
  }
};
