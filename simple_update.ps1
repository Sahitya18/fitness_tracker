# Simple DuckDNS Update Script
$domain = "fitmee"
$token = "78c8638c-c802-44ee-8f93-8f04c8d26437"

Write-Host "🔄 Starting DuckDNS Update..." -ForegroundColor Cyan
Write-Host "Domain: $domain.duckdns.org" -ForegroundColor Yellow

# Get current IP
try {
    $currentIP = (Invoke-WebRequest -Uri "https://ifconfig.me" -UseBasicParsing -TimeoutSec 10).Content.Trim()
    Write-Host "Current IP: $currentIP" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get current IP: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Update DuckDNS
try {
    $updateUrl = "https://www.duckdns.org/update?domains=$domain&token=$token&ip=$currentIP"
    $response = Invoke-WebRequest -Uri $updateUrl -UseBasicParsing -TimeoutSec 10
    
    if ($response.Content -eq "OK") {
        Write-Host "✅ DuckDNS updated successfully!" -ForegroundColor Green
        Write-Host "🌐 Your domain: $domain.duckdns.org" -ForegroundColor Cyan
        Write-Host "📍 Points to IP: $currentIP" -ForegroundColor Cyan
    } else {
        Write-Host "❌ DuckDNS update failed: $($response.Content)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error updating DuckDNS: $($_.Exception.Message)" -ForegroundColor Red
}

# Test DNS resolution
Write-Host "`n🔍 Testing DNS resolution..." -ForegroundColor Cyan
try {
    $dnsResult = Resolve-DnsName -Name "$domain.duckdns.org" -ErrorAction Stop
    $resolvedIP = $dnsResult.IPAddress
    Write-Host "Resolved IP: $resolvedIP" -ForegroundColor White
    
    if ($resolvedIP -eq $currentIP) {
        Write-Host "✅ DNS is up to date!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ DNS may not be updated yet" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ DNS resolution failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
