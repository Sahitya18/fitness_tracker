# Simple DuckDNS Test Script
$domain = "fitmee"
$token = "78c8638c-c802-44ee-8f93-8f04c8d26437"

Write-Host "Testing DuckDNS Setup..." -ForegroundColor Cyan

# Get current IP using a different method
Write-Host "Getting current IP..." -ForegroundColor Yellow
$currentIP = (Invoke-WebRequest -Uri "https://ifconfig.me/ip" -UseBasicParsing).Content.Trim()
Write-Host "Current IP: $currentIP" -ForegroundColor Green

# Test DuckDNS update
Write-Host "Testing DuckDNS update..." -ForegroundColor Yellow
$updateUrl = "https://www.duckdns.org/update?domains=$domain&token=$token&ip=$currentIP"
$response = Invoke-WebRequest -Uri $updateUrl -UseBasicParsing
Write-Host "DuckDNS response: $($response.Content)" -ForegroundColor White

# Test DNS resolution
Write-Host "Testing DNS resolution..." -ForegroundColor Yellow
$dnsResult = Resolve-DnsName -Name "$domain.duckdns.org"
$resolvedIP = $dnsResult.IPAddress
Write-Host "Resolved IP: $resolvedIP" -ForegroundColor White

# Compare IPs
if ($resolvedIP -eq $currentIP) {
    Write-Host "SUCCESS: DNS is up to date!" -ForegroundColor Green
} else {
    Write-Host "WARNING: DNS may need update" -ForegroundColor Yellow
    Write-Host "Current: $currentIP" -ForegroundColor White
    Write-Host "Resolved: $resolvedIP" -ForegroundColor White
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
