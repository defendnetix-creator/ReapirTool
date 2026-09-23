using System;
using System.Collections.Generic;
using System.Linq;

namespace UltimateToolkitLauncher.Licensing
{
    /// <summary>
    /// Centralized entitlement resolver for gating application features based on active plan and license state.
    /// </summary>
    public class EntitlementService
    {
        private readonly HashSet<string> activeEntitlements = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        private LicenseState currentState = LicenseState.Invalid;

        public LicenseState CurrentState => currentState;

        public void UpdateEntitlements(LicenseState state, IEnumerable<string> entitlements)
        {
            this.currentState = state;
            this.activeEntitlements.Clear();

            if (entitlements != null && (state == LicenseState.Active || state == LicenseState.ExpiringSoon || state == LicenseState.OfflineGrace))
            {
                foreach (var item in entitlements)
                {
                    this.activeEntitlements.Add(item);
                }
            }
        }

        /// <summary>
        /// Checks whether the user is entitled to perform a specific action.
        /// </summary>
        public bool HasEntitlement(string featureKey)
        {
            if (string.IsNullOrEmpty(featureKey)) return false;

            // In expired or revoked states, all pro features are locked (basic viewing is allowed)
            if (currentState == LicenseState.Expired || currentState == LicenseState.Revoked || currentState == LicenseState.Suspended)
            {
                return IsFreeBaseFeature(featureKey);
            }

            return activeEntitlements.Contains(featureKey) || activeEntitlements.Contains("*");
        }

        /// <summary>
        /// Features that remain accessible even when expired (non-destructive baseline telemetry).
        /// </summary>
        private bool IsFreeBaseFeature(string featureKey)
        {
            return featureKey.Equals("diagnostics.basic", StringComparison.OrdinalIgnoreCase) ||
                   featureKey.Equals("reports.view_existing", StringComparison.OrdinalIgnoreCase);
        }

        public string[] GetActiveEntitlements()
        {
            return activeEntitlements.ToArray();
        }
    }
}
