@echo off
echo ========================================
echo DuckDNS Quick Test
echo ========================================
echo.

echo 1. Testing current IP...
for /f "tokens=*" %%i in ('curl -s ifconfig.me') do set CURRENT_IP=%%i
echo Current IP: %CURRENT_IP%
echo.

echo 2. Testing DNS resolution...
nslookup fitmee.duckdns.org
echo.

echo 3. Testing DuckDNS update...
curl -s "https://www.duckdns.org/update?domains=fitmee&token=YOUR_TOKEN_HERE&ip=%CURRENT_IP%"
echo.
echo.

echo 4. Testing fitness app server...
curl -s "http://fitmee.duckdns.org:8080/api/proxy/health"
echo.
echo.

echo ========================================
echo Test Complete!
echo ========================================
pause
