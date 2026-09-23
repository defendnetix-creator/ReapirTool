using System;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace UltimateToolkitLauncher.Licensing
{
    /// <summary>
    /// Communicates with the remote licensing authority over HTTPS.
    /// Supports automatic failover and local bridge communication in development.
    /// </summary>
    public class LicenseApiClient
    {
        private readonly string baseApiUrl;

        public LicenseApiClient(string baseApiUrl = "http://127.0.0.1:3000/api/v1/licenses")
        {
            this.baseApiUrl = baseApiUrl.TrimEnd('/');
        }

        public async Task<string> ActivateAsync(string licenseKey, string appVersion)
        {
            string url = $"{baseApiUrl}/activate";
            string jsonBody = string.Format(
                "{{\"licenseKey\":\"{0}\",\"deviceFingerprint\":\"{1}\",\"deviceName\":\"{2}\",\"osVersion\":\"{3}\",\"appVersion\":\"{4}\"}}",
                EscapeJson(licenseKey),
                EscapeJson(DeviceIdentity.GetDeviceFingerprint()),
                EscapeJson(DeviceIdentity.GetDeviceFriendlyName()),
                EscapeJson(DeviceIdentity.GetOsVersionString()),
                EscapeJson(appVersion)
            );

            return await PostJsonAsync(url, jsonBody);
        }

        public async Task<string> ValidateAsync(string licenseId, string deviceId, string appVersion)
        {
            string url = $"{baseApiUrl}/validate";
            string jsonBody = string.Format(
                "{{\"licenseId\":\"{0}\",\"deviceId\":\"{1}\",\"deviceFingerprint\":\"{2}\",\"appVersion\":\"{3}\"}}",
                EscapeJson(licenseId),
                EscapeJson(deviceId),
                EscapeJson(DeviceIdentity.GetDeviceFingerprint()),
                EscapeJson(appVersion)
            );

            return await PostJsonAsync(url, jsonBody);
        }

        public async Task<string> DeactivateAsync(string licenseId, string deviceId)
        {
            string url = $"{baseApiUrl}/deactivate";
            string jsonBody = string.Format(
                "{{\"licenseId\":\"{0}\",\"deviceId\":\"{1}\"}}",
                EscapeJson(licenseId),
                EscapeJson(deviceId)
            );

            return await PostJsonAsync(url, jsonBody);
        }

        public async Task<string> GetStatusAsync(string licenseId, string deviceId)
        {
            string url = $"{baseApiUrl}/status?licenseId={Uri.EscapeDataString(licenseId)}&deviceId={Uri.EscapeDataString(deviceId)}";
            return await GetStringAsync(url);
        }

        private async Task<string> PostJsonAsync(string url, string jsonBody)
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "POST";
            request.ContentType = "application/json";
            request.Timeout = 10000;
            request.UserAgent = "ASHtech-PC-Toolkit-Pro/8.0.0 (Windows)";

            byte[] bytes = Encoding.UTF8.GetBytes(jsonBody);
            request.ContentLength = bytes.Length;

            using (Stream reqStream = await request.GetRequestStreamAsync())
            {
                await reqStream.WriteAsync(bytes, 0, bytes.Length);
            }

            try
            {
                using (HttpWebResponse response = (HttpWebResponse)await request.GetResponseAsync())
                using (StreamReader reader = new StreamReader(response.GetResponseStream(), Encoding.UTF8))
                {
                    return await reader.ReadToEndAsync();
                }
            }
            catch (WebException wex)
            {
                if (wex.Response != null)
                {
                    using (StreamReader reader = new StreamReader(wex.Response.GetResponseStream(), Encoding.UTF8))
                    {
                        return await reader.ReadToEndAsync();
                    }
                }
                throw;
            }
        }

        private async Task<string> GetStringAsync(string url)
        {
            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
            request.Method = "GET";
            request.Timeout = 10000;
            request.UserAgent = "ASHtech-PC-Toolkit-Pro/8.0.0 (Windows)";

            using (HttpWebResponse response = (HttpWebResponse)await request.GetResponseAsync())
            using (StreamReader reader = new StreamReader(response.GetResponseStream(), Encoding.UTF8))
            {
                return await reader.ReadToEndAsync();
            }
        }

        private static string EscapeJson(string s)
        {
            if (string.IsNullOrEmpty(s)) return "";
            return s.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\r", "").Replace("\n", "");
        }
    }
}
