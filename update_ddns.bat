@echo off
REM DuckDNS Update Script for Windows
REM This script automatically updates your DuckDNS domain with your current IP address

REM Configuration - UPDATE THESE VALUES
set DOMAIN=fitmee.duckdns.org
set TOKEN=78c8638c-c802-44ee-8f93-8f04c8d26437

REM Get current public IP address
for /f "tokens=*" %%i in ('curl -s ifconfig.me') do set CURRENT_IP=%%i

REM Update DuckDNS
echo Updating DuckDNS for domain: %DOMAIN%
echo Current IP: %CURRENT_IP%

curl -s "https://www.duckdns.org/update?domains=%DOMAIN%&token=%TOKEN%&ip=%CURRENT_IP%"

REM Check if update was successful
if %ERRORLEVEL% EQU 0 (
    echo ✅ DuckDNS updated successfully!
    echo Domain: %DOMAIN%.duckdns.org
    echo IP: %CURRENT_IP%
) else (
    echo ❌ DuckDNS update failed!
    echo Please check your domain and token settings.
)

REM Optional: Log the update
echo %date% %time% - IP: %CURRENT_IP% >> ddns_update.log

pause
