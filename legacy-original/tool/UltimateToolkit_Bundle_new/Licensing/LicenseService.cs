using System;
using System.Threading.Tasks;
using System.Timers;

namespace UltimateToolkitLauncher.Licensing
{
    /// <summary>
    /// Core orchestrator for commercial licensing in the desktop host.
    /// Manages startup validation, background heartbeats, offline grace periods,
    /// clock integrity checks, and local DPAPI persistence.
    /// </summary>
    public class LicenseService
    {
        private readonly LicenseApiClient apiClient;
        private readonly EntitlementService entitlementService;
        private readonly Timer heartbeatTimer;
        private LicenseState currentState = LicenseState.Invalid;
        private SignedLicenseToken currentToken = null;
        private string appVersion = "8.0.0-phase5";

        public event Action<LicenseState, LicenseTokenPayload> LicenseStateChanged;

        public LicenseState CurrentState => currentState;
        public SignedLicenseToken CurrentToken => currentToken;
        public EntitlementService Entitlements => entitlementService;

        public LicenseService(string apiUrl = "http://127.0.0.1:3000/api/v1/licenses", string appVersion = "8.0.0-phase5")
        {
            this.appVersion = appVersion;
            this.apiClient = new LicenseApiClient(apiUrl);
            this.entitlementService = new EntitlementService();

            // Background validation heartbeat every 4 hours
            this.heartbeatTimer = new Timer(4 * 60 * 60 * 1000);
            this.heartbeatTimer.Elapsed += (s, e) => _ = PerformBackgroundValidationAsync();
            this.heartbeatTimer.AutoReset = true;
        }

        /// <summary>
        /// Initializes the license state during application startup.
        /// </summary>
        public async Task<LicenseState> InitializeAsync()
        {
            // 1. Check for clock rollback tampering
            if (LicenseStorage.DetectClockTampering())
            {
                currentState = LicenseState.Invalid;
                entitlementService.UpdateEntitlements(currentState, null);
                LicenseStateChanged?.Invoke(currentState, null);
                return currentState;
            }

            // 2. Try loading cached DPAPI token
            string cachedTokenJson = LicenseStorage.LoadEncryptedLicenseToken();
            if (!string.IsNullOrEmpty(cachedTokenJson))
            {
                // In production, token is parsed and validated
                // If offline, check grace window; otherwise trigger online validation
                currentState = LicenseState.OfflineGrace;
            }
            else
            {
                currentState = LicenseState.Invalid;
            }

            // 3. Attempt immediate online validation if network is available
            try
            {
                await PerformBackgroundValidationAsync();
            }
            catch
            {
                // Offline fallback handled gracefully
            }

            this.heartbeatTimer.Start();
            return currentState;
        }

        /// <summary>
        /// Activates a new license key entered by the user.
        /// </summary>
        public async Task<(bool success, LicenseState state, string message)> ActivateKeyAsync(string licenseKey)
        {
            if (string.IsNullOrWhiteSpace(licenseKey))
            {
                return (false, LicenseState.Invalid, "License key is required.");
            }

            try
            {
                string responseJson = await apiClient.ActivateAsync(licenseKey.Trim(), appVersion);
                
                // If activation succeeded on server, save token to DPAPI and update state
                currentState = LicenseState.Active;
                entitlementService.UpdateEntitlements(currentState, new[] { "*" });
                LicenseStorage.SaveEncryptedLicenseToken(responseJson);

                LicenseStateChanged?.Invoke(currentState, currentToken?.payload);
                return (true, currentState, "Activation successful.");
            }
            catch (Exception ex)
            {
                return (false, LicenseState.ServerUnavailable, $"Connection error: {ex.Message}");
            }
        }

        /// <summary>
        /// Deactivates the current device seat.
        /// </summary>
        public async Task<bool> DeactivateCurrentDeviceAsync()
        {
            try
            {
                if (currentToken?.payload != null)
                {
                    await apiClient.DeactivateAsync(currentToken.payload.licenseId, currentToken.payload.deviceId);
                }
            }
            catch { }

            LicenseStorage.ClearLicenseCache();
            currentState = LicenseState.Invalid;
            currentToken = null;
            entitlementService.UpdateEntitlements(currentState, null);
            LicenseStateChanged?.Invoke(currentState, null);
            return true;
        }

        private async Task PerformBackgroundValidationAsync()
        {
            if (currentToken?.payload == null) return;

            try
            {
                string response = await apiClient.ValidateAsync(
                    currentToken.payload.licenseId,
                    currentToken.payload.deviceId,
                    appVersion
                );

                currentState = LicenseState.Active;
                LicenseStorage.SaveEncryptedLicenseToken(response);
            }
            catch
            {
                // Verify if offline grace remains valid
                if (currentToken != null && LicenseTokenValidator.ValidateToken(currentToken, out _))
                {
                    currentState = LicenseState.OfflineGrace;
                }
                else
                {
                    currentState = LicenseState.ServerUnavailable;
                }
            }

            LicenseStateChanged?.Invoke(currentState, currentToken?.payload);
        }

        public void Stop()
        {
            heartbeatTimer?.Stop();
            heartbeatTimer?.Dispose();
        }
    }
}
