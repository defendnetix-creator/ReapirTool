/**
 * Generates a stable, privacy-conscious hardware and browser client fingerprint.
 * No invasive tracking or PII is collected.
 * Maintains migration compatibility with existing device registrations.
 */
export async function getClientDeviceFingerprint(): Promise<string> {
  // Check Akshigo storage first, then legacy ASHtech storage for seamless upgrade
  const cached = localStorage.getItem('akshigo_device_fp') || localStorage.getItem('ashtech_device_fp');
  if (cached) {
    localStorage.setItem('akshigo_device_fp', cached);
    return cached;
  }

  try {
    const nav = window.navigator;
    const screen = window.screen;

    const components = [
      nav.userAgent || 'unknown_agent',
      nav.language || 'en-US',
      screen.colorDepth || '24',
      screen.width + 'x' + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      nav.hardwareConcurrency || '4',
      'Akshigo_v8_Client_Salt_99182'
    ];

    const rawString = components.join('###');
    const msgBuffer = new TextEncoder().encode(rawString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = 'sha256_fp_' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').substring(0, 32);

    localStorage.setItem('akshigo_device_fp', hashHex);
    return hashHex;
  } catch {
    const fallback = 'sha256_fp_fallback_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('akshigo_device_fp', fallback);
    return fallback;
  }
}

export function getClientDeviceName(): string {
  const cached = localStorage.getItem('akshigo_device_name') || localStorage.getItem('ashtech_device_name');
  if (cached) {
    localStorage.setItem('akshigo_device_name', cached);
    return cached;
  }

  const isWin = navigator.userAgent.indexOf('Windows') !== -1;
  const isMac = navigator.userAgent.indexOf('Macintosh') !== -1;
  const os = isWin ? 'WIN11-WORKSTATION' : isMac ? 'MAC-WORKSTATION' : 'WORKSTATION-PRIMARY';
  const name = `${os}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  localStorage.setItem('akshigo_device_name', name);
  return name;
}
