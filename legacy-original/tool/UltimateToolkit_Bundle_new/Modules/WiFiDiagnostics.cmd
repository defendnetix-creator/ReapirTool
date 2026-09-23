@echo off
title Wi-Fi Diagnostics - ASHtech PC Toolkit Pro
cls
echo ========================================================
echo   ASHtech PC Toolkit Pro - Wi-Fi Diagnostics
echo ========================================================
echo.
echo [1] Wireless Interface Status:
netsh wlan show interfaces
echo.
echo [2] Saved Wi-Fi Profiles:
netsh wlan show profiles
echo.
echo [3] Current Wireless Drivers:
netsh wlan show drivers
echo.
echo [4] Radio Information:
netsh wlan show networks mode=bssid
echo.
echo ========================================================
pause
