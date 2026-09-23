import { EmailPayload } from './types.js';

export interface CompiledEmail {
  subject: string;
  html: string;
  text: string;
}

/**
 * Generate Purchase Confirmation Email (New Subscription)
 */
export function buildPurchaseConfirmationEmail(payload: EmailPayload): CompiledEmail {
  const subject = 'Your Akshigo PC Toolkit Pro subscription is active';
  
  const formattedActivation = new Date(payload.activationDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedExpiry = new Date(payload.expiryDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b1120; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #1e293b; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #06b6d4; text-transform: uppercase; margin-bottom: 6px;">
                      AKSHIGO TECH • OFFICIAL LICENSING AUTHORITY
                    </div>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                      Akshigo PC Toolkit Pro
                    </h1>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background-color: #065f46; color: #34d399; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; border: 1px solid #059669;">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                Hello <strong>${escapeHtml(payload.customerName)}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                Thank you for subscribing to <strong>Akshigo PC Toolkit Pro</strong>. Your commercial license has been provisioned and is active across our global telemetry network.
              </p>

              <!-- Details Table -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b1120; border: 1px solid #1e293b; border-radius: 8px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #64748b;">
                    Product & Plan
                  </td>
                  <td align="right" style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; font-weight: 600; color: #38bdf8;">
                    ${escapeHtml(payload.planName)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #64748b;">
                    Device Allowance
                  </td>
                  <td align="right" style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; font-weight: 600; color: #ffffff;">
                    ${payload.deviceAllowance} ${payload.deviceAllowance === 1 ? 'PC Seat' : 'PC Seats'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #64748b;">
                    Activation Date
                  </td>
                  <td align="right" style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #cbd5e1;">
                    ${formattedActivation}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #64748b;">
                    Term Expiry Date
                  </td>
                  <td align="right" style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; font-weight: 600; color: #34d399;">
                    ${formattedExpiry} (365 Days)
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; font-size: 13px; color: #64748b;">
                    Order Reference
                  </td>
                  <td align="right" style="padding: 14px 18px; font-size: 12px; font-family: monospace; color: #94a3b8;">
                    ${escapeHtml(payload.orderReference)}
                  </td>
                </tr>
              </table>

              <!-- Masked License Key Callout -->
              ${payload.maskedLicenseKey ? `
              <div style="background-color: #0b1120; border: 1px dashed #0284c7; border-radius: 8px; padding: 18px; margin-bottom: 28px; text-align: center;">
                <div style="font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
                  Masked License Identifier
                </div>
                <div style="font-family: monospace; font-size: 16px; font-weight: 700; color: #ffffff; letter-spacing: 0.08em;">
                  ${escapeHtml(payload.maskedLicenseKey)}
                </div>
                <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
                  For security, your full unmasked license key is available inside your authenticated account.
                </div>
              </div>
              ` : ''}

              <!-- Primary CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(payload.accountUrl)}" target="_blank" style="display: block; width: 100%; max-width: 320px; background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%); color: #020617; text-align: center; padding: 14px 24px; font-size: 14px; font-weight: 800; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 14px rgba(6,182,212,0.3);">
                      View License &amp; Download
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Download Link -->
              <p style="margin: 0; text-align: center; font-size: 13px; color: #94a3b8;">
                Need to install on Windows? <a href="${escapeHtml(payload.downloadUrl)}" style="color: #38bdf8; text-decoration: underline;">Direct Application Download (.exe)</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #080d1a; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0 0 8px 0;">
                Have questions or need technical support? Contact us at <a href="mailto:${escapeHtml(payload.supportUrl)}" style="color: #38bdf8; text-decoration: none;">${escapeHtml(payload.supportUrl)}</a>.
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; ${new Date().getFullYear()} Akshigo Tech. All rights reserved. This is an automated transactional confirmation.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
================================================================
AKSHIGO TECH • OFFICIAL LICENSING AUTHORITY
Akshigo PC Toolkit Pro — Subscription Activated
================================================================

Hello ${payload.customerName},

Thank you for subscribing to Akshigo PC Toolkit Pro.
Your commercial license is active.

SUBSCRIPTION DETAILS
----------------------------------------------------------------
Product & Plan    : ${payload.planName}
Status            : ACTIVE
Device Allowance  : ${payload.deviceAllowance} PC Seat(s)
Activation Date   : ${formattedActivation}
Expiry Date       : ${formattedExpiry} (365 Days)
Order Reference   : ${payload.orderReference}
${payload.maskedLicenseKey ? `Masked License    : ${payload.maskedLicenseKey}\n(Full license available in your secure account)` : ''}

SECURE ACCESS
----------------------------------------------------------------
Access Account & License : ${payload.accountUrl}
Direct Windows Download  : ${payload.downloadUrl}
Support Contact          : ${payload.supportUrl}

----------------------------------------------------------------
© ${new Date().getFullYear()} Akshigo Tech. All rights reserved.
  `.trim();

  return { subject, html, text };
}

/**
 * Generate Renewal Confirmation Email (Existing Subscription)
 */
export function buildRenewalConfirmationEmail(payload: EmailPayload): CompiledEmail {
  const subject = 'Your Akshigo PC Toolkit Pro subscription has been renewed';
  
  const formattedNewExpiry = new Date(payload.expiryDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedPrevExpiry = payload.previousExpiryDate
    ? new Date(payload.previousExpiryDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : undefined;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b1120; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #1e293b; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #06b6d4; text-transform: uppercase; margin-bottom: 6px;">
                      AKSHIGO TECH • SUBSCRIPTION RENEWAL
                    </div>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                      Akshigo PC Toolkit Pro
                    </h1>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; background-color: #0284c7; color: #e0f2fe; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; border: 1px solid #0369a1;">
                      RENEWED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                Hello <strong>${escapeHtml(payload.customerName)}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                Your subscription to <strong>Akshigo PC Toolkit Pro</strong> has been successfully renewed. Your existing installed applications and activated workstation seats remain active without needing reconfiguration.
              </p>

              <!-- Details Table -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b1120; border: 1px solid #1e293b; border-radius: 8px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #64748b;">
                    Plan
                  </td>
                  <td align="right" style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; font-weight: 600; color: #38bdf8;">
                    ${escapeHtml(payload.planName)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #64748b;">
                    Device Allowance
                  </td>
                  <td align="right" style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; font-weight: 600; color: #ffffff;">
                    ${payload.deviceAllowance} ${payload.deviceAllowance === 1 ? 'PC Seat' : 'PC Seats'}
                  </td>
                </tr>
                ${formattedPrevExpiry ? `
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #64748b;">
                    Previous Expiry
                  </td>
                  <td align="right" style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #94a3b8;">
                    ${formattedPrevExpiry}
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #64748b;">
                    New Extended Expiry
                  </td>
                  <td align="right" style="padding: 14px 18px; border-bottom: 1px solid #1e293b; font-size: 13px; font-weight: 700; color: #34d399;">
                    ${formattedNewExpiry} (+365 Days)
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; font-size: 13px; color: #64748b;">
                    Order Reference
                  </td>
                  <td align="right" style="padding: 14px 18px; font-size: 12px; font-family: monospace; color: #94a3b8;">
                    ${escapeHtml(payload.orderReference)}
                  </td>
                </tr>
              </table>

              <!-- Primary CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(payload.accountUrl)}" target="_blank" style="display: block; width: 100%; max-width: 320px; background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%); color: #020617; text-align: center; padding: 14px 24px; font-size: 14px; font-weight: 800; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 14px rgba(6,182,212,0.3);">
                      Go to My Account
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Note -->
              <p style="margin: 0; text-align: center; font-size: 12px; color: #64748b;">
                No new license key is needed. Your existing activated devices will synchronize automatically on their next heartbeat.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #080d1a; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0 0 8px 0;">
                Have questions or need technical support? Contact us at <a href="mailto:${escapeHtml(payload.supportUrl)}" style="color: #38bdf8; text-decoration: none;">${escapeHtml(payload.supportUrl)}</a>.
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; ${new Date().getFullYear()} Akshigo Tech. All rights reserved. This is an automated transactional confirmation.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
================================================================
AKSHIGO TECH • OFFICIAL LICENSING AUTHORITY
Akshigo PC Toolkit Pro — Subscription Renewed
================================================================

Hello ${payload.customerName},

Your subscription to Akshigo PC Toolkit Pro has been successfully renewed.

RENEWAL DETAILS
----------------------------------------------------------------
Plan              : ${payload.planName}
Status            : RENEWED (Active)
Device Allowance  : ${payload.deviceAllowance} PC Seat(s)
${formattedPrevExpiry ? `Previous Expiry   : ${formattedPrevExpiry}\n` : ''}New Expiry Date   : ${formattedNewExpiry} (+365 Days)
Order Reference   : ${payload.orderReference}

Note: Your existing activated devices will update automatically.

SECURE ACCESS
----------------------------------------------------------------
Access Account & License : ${payload.accountUrl}
Direct Windows Download  : ${payload.downloadUrl}
Support Contact          : ${payload.supportUrl}

----------------------------------------------------------------
© ${new Date().getFullYear()} Akshigo Tech. All rights reserved.
  `.trim();

  return { subject, html, text };
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
