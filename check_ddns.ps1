# DuckDNS Verification Script
# This script checks if your DDNS setup is working correctly

# Configuration - UPDATE THESE VALUES
$domain = "fitmee"
$token = "78c8638c-c802-44ee-8f93-8f04c8d26437"

Write-Host "🔍 DuckDNS Setup Verification" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Test 1: Check current public IP
Write-Host "`n1️⃣ Checking current public IP..." -ForegroundColor Yellow
try {
    $currentIP = (Invoke-WebRequest -Uri "https://ifconfig.me" -UseBasicParsing -TimeoutSec 10).Content.Trim()
    Write-Host "✅ Current public IP: $currentIP" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get current IP: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Check DNS resolution
Write-Host "`n2️⃣ Checking DNS resolution..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName -Name "$domain.duckdns.org" -ErrorAction Stop
    $resolvedIP = $dnsResult.IPAddress
    Write-Host "✅ DNS resolution successful: $resolvedIP" -ForegroundColor Green
    
    if ($resolvedIP -eq $currentIP) {
        Write-Host "✅ DNS is up to date!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ DNS may need update. Resolved: $resolvedIP vs Current: $currentIP" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ DNS resolution failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test DuckDNS update
Write-Host "`n3️⃣ Testing DuckDNS update..." -ForegroundColor Yellow
try {
    $updateUrl = "https://www.duckdns.org/update?domains=$domain&token=$token&ip=$currentIP"
    $response = Invoke-WebRequest -Uri $updateUrl -UseBasicParsing -TimeoutSec 10
    
    if ($response.Content -eq "OK") {
        Write-Host "✅ DuckDNS update successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ DuckDNS update failed: $($response.Content)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ DuckDNS update error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Check if domain is accessible
Write-Host "`n4️⃣ Testing domain accessibility..." -ForegroundColor Yellow
try {
    $testUrl = "http://$domain.duckdns.org"
    $webResponse = Invoke-WebRequest -Uri $testUrl -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Domain is accessible (HTTP $($webResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Domain not accessible via HTTP: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   This is normal if your server isn't running on port 80" -ForegroundColor Cyan
}

# Test 5: Check your fitness app server
Write-Host "`n5️⃣ Testing fitness app server..." -ForegroundColor Yellow
try {
    $fitnessAppUrl = "http://$domain.duckdns.org:8080/api/proxy/health"
    $fitnessResponse = Invoke-WebRequest -Uri $fitnessAppUrl -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Fitness app server is accessible!" -ForegroundColor Green
    Write-Host "   Response: $($fitnessResponse.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Fitness app server not accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure your Spring Boot server is running on port 8080" -ForegroundColor Yellow
}

# Summary
Write-Host "`n📊 Summary" -ForegroundColor Cyan
Write-Host "=========" -ForegroundColor Cyan
Write-Host "Domain: $domain.duckdns.org" -ForegroundColor White
Write-Host "Current IP: $currentIP" -ForegroundColor White
Write-Host "Resolved IP: $resolvedIP" -ForegroundColor White

if ($resolvedIP -eq $currentIP) {
    Write-Host "`n🎉 SUCCESS: Your DDNS setup is working correctly!" -ForegroundColor Green
    Write-Host "Your API provider can use: $domain.duckdns.org" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️ WARNING: DNS may not be updated yet" -ForegroundColor Yellow
    Write-Host "Wait 2-3 minutes and run this script again" -ForegroundColor Yellow
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
