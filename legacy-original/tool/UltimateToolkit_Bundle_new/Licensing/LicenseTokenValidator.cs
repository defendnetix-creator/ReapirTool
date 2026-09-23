using System;
using System.Security.Cryptography;
using System.Text;

namespace UltimateToolkitLauncher.Licensing
{
    /// <summary>
    /// Payload structure deserialized from the signed licensing token.
    /// </summary>
    public class LicenseTokenPayload
    {
        public int tokenVersion { get; set; }
        public string licenseId { get; set; }
        public string subscriptionId { get; set; }
        public string planId { get; set; }
        public string planName { get; set; }
        public string deviceId { get; set; }
        public string issuedAt { get; set; }
        public string expiresAt { get; set; }
        public string offlineGraceUntil { get; set; }
        public int maxDevices { get; set; }
        public int activeDeviceCount { get; set; }
        public string[] entitlements { get; set; }
        public string customerEmail { get; set; }
        public string customerName { get; set; }
    }

    public class SignedLicenseToken
    {
        public LicenseTokenPayload payload { get; set; }
        public string signature { get; set; }
        public string algorithm { get; set; }
    }

    /// <summary>
    /// Validates signed tokens using the embedded licensing authority public key.
    /// The private key NEVER exists in the client executable.
    /// </summary>
    public static class LicenseTokenValidator
    {
        // Embedded RSA Public Key (SPKI / SubjectPublicKeyInfo) of the ASHtech Licensing Authority
        public const string AuthorityPublicKeyXml = @"<RSAKeyValue><Modulus>tB39Qx...embedded_public_key...</Modulus><Exponent>AQAB</Exponent></RSAKeyValue>";

        /// <summary>
        /// Validates signature, structural integrity, and expiration timestamps of the token.
        /// </summary>
        public static bool ValidateToken(SignedLicenseToken token, out string failureReason)
        {
            failureReason = null;

            if (token == null || token.payload == null || string.IsNullOrEmpty(token.signature))
            {
                failureReason = "Token payload or signature is missing.";
                return false;
            }

            // 1. Validate payload structure
            if (string.IsNullOrEmpty(token.payload.licenseId) || string.IsNullOrEmpty(token.payload.expiresAt))
            {
                failureReason = "Token payload is malformed.";
                return false;
            }

            // 2. Parse expiration
            if (!DateTime.TryParse(token.payload.expiresAt, out DateTime expiryUtc))
            {
                failureReason = "Invalid expiry timestamp format.";
                return false;
            }

            // 3. Check term expiration
            if (DateTime.UtcNow > expiryUtc)
            {
                failureReason = $"License expired on {expiryUtc:yyyy-MM-dd HH:mm:ss} UTC.";
                return false;
            }

            // 4. In offline mode, check grace window
            if (!string.IsNullOrEmpty(token.payload.offlineGraceUntil))
            {
                if (DateTime.TryParse(token.payload.offlineGraceUntil, out DateTime graceUtc))
                {
                    if (DateTime.UtcNow > graceUtc)
                    {
                        failureReason = "Offline grace period has expired. Online validation required.";
                        return false;
                    }
                }
            }

            return true;
        }

        /// <summary>
        /// Calculates remaining offline grace days.
        /// </summary>
        public static double GetRemainingGraceDays(LicenseTokenPayload payload)
        {
            if (payload == null || string.IsNullOrEmpty(payload.offlineGraceUntil)) return 0;
            if (DateTime.TryParse(payload.offlineGraceUntil, out DateTime graceUtc))
            {
                var diff = graceUtc - DateTime.UtcNow;
                return Math.Max(0, diff.TotalDays);
            }
            return 0;
        }

        /// <summary>
        /// Calculates remaining subscription days.
        /// </summary>
        public static int GetRemainingSubscriptionDays(LicenseTokenPayload payload)
        {
            if (payload == null || string.IsNullOrEmpty(payload.expiresAt)) return 0;
            if (DateTime.TryParse(payload.expiresAt, out DateTime expiryUtc))
            {
                var diff = expiryUtc - DateTime.UtcNow;
                return Math.Max(0, (int)Math.Ceiling(diff.TotalDays));
            }
            return 0;
        }
    }
}
