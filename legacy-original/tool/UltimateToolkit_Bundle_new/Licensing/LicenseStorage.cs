using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace UltimateToolkitLauncher.Licensing
{
    /// <summary>
    /// Encrypted local storage for caching signed licensing tokens and tracking clock integrity.
    /// Employs Windows Data Protection API (DPAPI) and tamper-detection digests.
    /// </summary>
    public static class LicenseStorage
    {
        private static readonly byte[] Entropy = Encoding.UTF8.GetBytes("ASHtech_Toolkit_DPAPI_Entropy_2026");
        private static readonly string StorageDirectory = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "ASHtech",
            "Licensing"
        );
        private static readonly string LicenseCacheFile = Path.Combine(StorageDirectory, "license.dat");
        private static readonly string MonotonicTimeFile = Path.Combine(StorageDirectory, "monotonic.dat");

        static LicenseStorage()
        {
            try
            {
                if (!Directory.Exists(StorageDirectory))
                {
                    Directory.CreateDirectory(StorageDirectory);
                }
            }
            catch { }
        }

        /// <summary>
        /// Saves encrypted token string using DPAPI.
        /// </summary>
        public static bool SaveEncryptedLicenseToken(string jsonToken)
        {
            try
            {
                byte[] plainBytes = Encoding.UTF8.GetBytes(jsonToken);
                byte[] encryptedBytes = ProtectedData.Protect(plainBytes, Entropy, DataProtectionScope.CurrentUser);
                File.WriteAllBytes(LicenseCacheFile, encryptedBytes);
                UpdateMonotonicTimestamp();
                return true;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Reads and decrypts stored license token.
        /// </summary>
        public static string LoadEncryptedLicenseToken()
        {
            try
            {
                if (!File.Exists(LicenseCacheFile)) return null;

                byte[] encryptedBytes = File.ReadAllBytes(LicenseCacheFile);
                byte[] plainBytes = ProtectedData.Unprotect(encryptedBytes, Entropy, DataProtectionScope.CurrentUser);
                return Encoding.UTF8.GetString(plainBytes);
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Clears local cached license token upon explicit deactivation.
        /// Does NOT destroy user configuration or audit logs.
        /// </summary>
        public static void ClearLicenseCache()
        {
            try
            {
                if (File.Exists(LicenseCacheFile))
                {
                    File.Delete(LicenseCacheFile);
                }
            }
            catch { }
        }

        /// <summary>
        /// Detects system clock rollbacks by comparing current UTC time against encrypted monotonic records.
        /// </summary>
        public static bool DetectClockTampering()
        {
            try
            {
                if (!File.Exists(MonotonicTimeFile))
                {
                    UpdateMonotonicTimestamp();
                    return false;
                }

                byte[] encrypted = File.ReadAllBytes(MonotonicTimeFile);
                byte[] plain = ProtectedData.Unprotect(encrypted, Entropy, DataProtectionScope.CurrentUser);
                string str = Encoding.UTF8.GetString(plain);

                if (long.TryParse(str, out long lastSeenTicks))
                {
                    DateTime lastSeen = new DateTime(lastSeenTicks, DateTimeKind.Utc);
                    DateTime now = DateTime.UtcNow;

                    // Allow 1 hour backward drift for timezone / daylight savings adjustments
                    if (now < lastSeen.AddHours(-1))
                    {
                        return true; // Clock has been rolled back!
                    }
                }

                UpdateMonotonicTimestamp();
                return false;
            }
            catch
            {
                return false;
            }
        }

        private static void UpdateMonotonicTimestamp()
        {
            try
            {
                long ticks = DateTime.UtcNow.Ticks;
                byte[] plain = Encoding.UTF8.GetBytes(ticks.ToString());
                byte[] encrypted = ProtectedData.Protect(plain, Entropy, DataProtectionScope.CurrentUser);
                File.WriteAllBytes(MonotonicTimeFile, encrypted);
            }
            catch { }
        }
    }
}
