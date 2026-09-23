/**
 * ASHtech PC Toolkit Pro — Universal Host IPC Bridge
 * Provides a unified, secure messaging bridge between frontend interfaces
 * (WebView2, legacy WebBrowser, and standalone browsers) and the host engine.
 */
(function() {
    'use strict';

    window.ASHtechBridge = {
        version: '8.0.0',
        runtimeMode: 'unknown',

        init: function() {
            if (window.chrome && window.chrome.webview && typeof window.chrome.webview.postMessage === 'function') {
                this.runtimeMode = 'WebView2';
            } else if (window.external && typeof window.external === 'object') {
                this.runtimeMode = 'LegacyHost';
            } else {
                this.runtimeMode = 'StandaloneBrowser';
            }
            console.log('[ASHtechBridge] Initialized in ' + this.runtimeMode + ' mode.');
        },

        /**
         * Dispatches a command to the host container or backend API.
         * @param {string} command Name of the command (e.g., 'launch_v5', 'stop_server')
         * @param {object} payload Optional parameters or data
         * @returns {Promise}
         */
        postCommand: function(command, payload) {
            var self = this;
            payload = payload || {};

            return new Promise(function(resolve, reject) {
                var message = {
                    id: 'msg_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
                    command: command,
                    payload: payload,
                    timestamp: new Date().toISOString()
                };

                if (self.runtimeMode === 'WebView2') {
                    try {
                        window.chrome.webview.postMessage(message);
                        resolve({ status: 'sent', mode: 'WebView2', messageId: message.id });
                    } catch (err) {
                        reject(err);
                    }
                } else if (self.runtimeMode === 'LegacyHost') {
                    try {
                        if (typeof window.external[command] === 'function') {
                            window.external[command](payload);
                            resolve({ status: 'executed', mode: 'LegacyHost' });
                        } else {
                            reject(new Error('Method ' + command + ' not exposed on window.external'));
                        }
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    // Standalone browser mode: fallback to local WebBridge HTTP API
                    fetch('http://127.0.0.1:9999/api/command', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(message)
                    })
                    .then(function(res) { return res.json(); })
                    .then(resolve)
                    .catch(function(err) {
                        console.warn('[ASHtechBridge] HTTP fallback failed:', err);
                        reject(err);
                    });
                }
            });
        },

        launchClassic: function() {
            return this.postCommand('launch_v5');
        },

        launchWebDashboard: function() {
            return this.postCommand('launch_v6');
        },

        launchPrinterAnalyzer: function() {
            return this.postCommand('launch_printer');
        },

        stopSuite: function() {
            return this.postCommand('stop_server');
        },

        openExternalUrl: function(url) {
            return this.postCommand('open_url', { url: url });
        }
    };

    // Auto-initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { window.ASHtechBridge.init(); });
    } else {
        window.ASHtechBridge.init();
    }
})();
