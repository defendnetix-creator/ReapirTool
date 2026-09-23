@echo off
title Windows License Activation Check - ASHtech PC Toolkit Pro
cls
echo ========================================================
echo   ASHtech PC Toolkit Pro - License Activation Check
echo ========================================================
echo.
echo Querying Windows Software Licensing Status...
cscript //nologo %windir%\System32\slmgr.vbs /dli
echo.
echo Detailed License Channel Information:
cscript //nologo %windir%\System32\slmgr.vbs /xpr
echo.
echo ========================================================
pause
