using System;
using System.IO;
using System.Management;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Win32;

namespace UltimateToolkitLauncher.Licensing
{
    /// <summary>
    /// Generates a stable, privacy-conscious hardware and installation fingerprint
    /// for device registration. Does not collect invasive PII or MAC addresses.
    /// </summary>
    public static class DeviceIdentity
    {
        private const string ApplicationSalt = "ASHtech_Pro_v8_Device_Identity_Salt_99812";
        private static string cachedFingerprint = null;

        /// <summary>
        /// Retrieves the composite SHA-256 device fingerprint.
        /// </summary>
        public static string GetDeviceFingerprint()
        {
            if (!string.IsNullOrEmpty(cachedFingerprint))
            {
                return cachedFingerprint;
            }

            try
            {
                string machineGuid = GetWindowsMachineGuid();
                string cpuHash = GetCpuIdentifierHash();
                string motherboardHash = GetMotherboardIdentifierHash();

                string rawSeed = $"{machineGuid}|{cpuHash}|{motherboardHash}|{ApplicationSalt}";
                cachedFingerprint = ComputeSha256(rawSeed);
                return cachedFingerprint;
            }
            catch
            {
                // Fallback deterministic fallback based on machine name and system drive serial
                string fallbackSeed = $"{Environment.MachineName}|{Environment.ProcessorCount}|{ApplicationSalt}";
                cachedFingerprint = ComputeSha256(fallbackSeed);
                return cachedFingerprint;
            }
        }

        /// <summary>
        /// Human-readable device name for workstation identification in the portal.
        /// </summary>
        public static string GetDeviceFriendlyName()
        {
            try
            {
                return Environment.MachineName;
            }
            catch
            {
                return "Windows Workstation";
            }
        }

        /// <summary>
        /// Human-readable OS version string.
        /// </summary>
        public static string GetOsVersionString()
        {
            try
            {
                return $"{Environment.OSVersion.VersionString} ({(Environment.Is64BitOperatingSystem ? "64-bit" : "32-bit")})";
            }
            catch
            {
                return "Windows 11 Pro";
            }
        }

        private static string GetWindowsMachineGuid()
        {
            try
            {
                using (var key = RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, RegistryView.Registry64)
                    .OpenSubKey(@"SOFTWARE\Microsoft\Cryptography"))
                {
                    if (key != null)
                    {
                        var val = key.GetValue("MachineGuid");
                        if (val != null) return val.ToString();
                    }
                }
            }
            catch { }
            return "DEFAULT_MACHINE_GUID";
        }

        private static string GetCpuIdentifierHash()
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher("Select ProcessorId, NumberOfCores from Win32_Processor"))
                {
                    foreach (ManagementObject mo in searcher.Get())
                    {
                        string id = mo["ProcessorId"]?.ToString() ?? "";
                        string cores = mo["NumberOfCores"]?.ToString() ?? "";
                        return ComputeSha256($"{id}_{cores}");
                    }
                }
            }
            catch { }
            return ComputeSha256(Environment.ProcessorCount.ToString());
        }

        private static string GetMotherboardIdentifierHash()
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher("Select SerialNumber, Manufacturer from Win32_BaseBoard"))
                {
                    foreach (ManagementObject mo in searcher.Get())
                    {
                        string serial = mo["SerialNumber"]?.ToString() ?? "";
                        string man = mo["Manufacturer"]?.ToString() ?? "";
                        return ComputeSha256($"{serial}_{man}");
                    }
                }
            }
            catch { }
            return "BOARD_GENERIC";
        }

        private static string ComputeSha256(string raw)
        {
            using (var sha = SHA256.Create())
            {
                byte[] bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(raw));
                var sb = new StringBuilder();
                foreach (byte b in bytes)
                {
                    sb.Append(b.ToString("x2"));
                }
                return sb.ToString();
            }
        }
    }
}
