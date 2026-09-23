using System;

namespace UltimateToolkitLauncher.Licensing
{
    /// <summary>
    /// Represents the authoritative state of the application's commercial license.
    /// </summary>
    public enum LicenseState
    {
        /// <summary>
        /// Verified active subscription within valid term. Full feature access.
        /// </summary>
        Active,

        /// <summary>
        /// Subscription is valid but expiring within 30 days. Renewal notice shown.
        /// </summary>
        ExpiringSoon,

        /// <summary>
        /// Subscription term has lapsed. Pro features restricted; local diagnostic logs preserved.
        /// </summary>
        Expired,

        /// <summary>
        /// Subscription is suspended due to billing or compliance issues.
        /// </summary>
        Suspended,

        /// <summary>
        /// License key explicitly invalidated by licensing authority (e.g. chargeback, leaked key).
        /// </summary>
        Revoked,

        /// <summary>
        /// Active seat limit reached for this license key. Seat reallocation required.
        /// </summary>
        DeviceLimitReached,

        /// <summary>
        /// Key not recognized or cryptographically malformed.
        /// </summary>
        Invalid,

        /// <summary>
        /// Operating offline under valid cached cryptographic token within allowed grace window.
        /// </summary>
        OfflineGrace,

        /// <summary>
        /// Server could not be reached, but no valid local token exists or grace window has expired.
        /// </summary>
        ServerUnavailable
    }

    /// <summary>
    /// Subscription tier definition.
    /// </summary>
    public enum SubscriptionTier
    {
        Personal,
        Professional,
        Technician,
        Business
    }
}
