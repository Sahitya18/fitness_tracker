# Comprehensive DuckDNS Test Script
# This script will test all aspects of your DuckDNS setup

param(
    [string]$Domain = "fitmee",
    [string]$Token = "YOUR_TOKEN_HERE"
)

Write-Host "🔍 Comprehensive DuckDNS Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Get current public IP
Write-Host "1️⃣ Getting current public IP..." -ForegroundColor Yellow
try {
    $currentIP = Invoke-RestMethod -Uri "https://ifconfig.me" -TimeoutSec 10
    Write-Host "✅ Current IP: $currentIP" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get current IP: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Test DNS resolution
Write-Host "`n2️⃣ Testing DNS resolution..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName -Name "$Domain.duckdns.org" -ErrorAction Stop
    Write-Host "✅ DNS resolution successful!" -ForegroundColor Green
    Write-Host "   Resolved IP: $($dnsResult.IPAddress)" -ForegroundColor White
    Write-Host "   Domain: $Domain.duckdns.org" -ForegroundColor White
    
    # Check if resolved IP matches current IP
    if ($dnsResult.IPAddress -eq $currentIP) {
        Write-Host "✅ DNS IP matches current IP!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  DNS IP ($($dnsResult.IPAddress)) doesn't match current IP ($currentIP)" -ForegroundColor Yellow
        Write-Host "   This might indicate DuckDNS needs updating" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ DNS resolution failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test DuckDNS update (if token is provided)
if ($Token -ne "YOUR_TOKEN_HERE") {
    Write-Host "`n3️⃣ Testing DuckDNS update..." -ForegroundColor Yellow
    try {
        $updateUrl = "https://www.duckdns.org/update?domains=$Domain&token=$Token&ip=$currentIP"
        $response = Invoke-RestMethod -Uri $updateUrl -TimeoutSec 10
        
        if ($response -eq "OK") {
            Write-Host "✅ DuckDNS update successful!" -ForegroundColor Green
        } else {
            Write-Host "❌ DuckDNS update failed: $response" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ DuckDNS update error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n3️⃣ Skipping DuckDNS update (token not configured)" -ForegroundColor Yellow
}

# Test 4: Test HTTP connectivity
Write-Host "`n4️⃣ Testing HTTP connectivity..." -ForegroundColor Yellow
try {
    $testUrl = "http://$Domain.duckdns.org"
    $response = Invoke-WebRequest -Uri $testUrl -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ HTTP connectivity successful!" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "❌ HTTP connectivity failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Test fitness app server (if running)
Write-Host "`n5️⃣ Testing fitness app server..." -ForegroundColor Yellow
try {
    $fitnessAppUrl = "http://$Domain.duckdns.org:8080/api/proxy/health"
    $response = Invoke-WebRequest -Uri $fitnessAppUrl -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Fitness app server is accessible!" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor White
    Write-Host "   Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "❌ Fitness app server not accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure your Spring Boot app is running on port 8080" -ForegroundColor Yellow
}

# Test 6: Test HTTPS (if available)
Write-Host "`n6️⃣ Testing HTTPS connectivity..." -ForegroundColor Yellow
try {
    $httpsUrl = "https://$Domain.duckdns.org"
    $response = Invoke-WebRequest -Uri $httpsUrl -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ HTTPS connectivity successful!" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "❌ HTTPS connectivity failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   This is normal if you haven't set up SSL certificates" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📊 DuckDNS Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Domain: $Domain.duckdns.org" -ForegroundColor White
Write-Host "Current IP: $currentIP" -ForegroundColor White
Write-Host ""

if ($Token -eq "YOUR_TOKEN_HERE") {
    Write-Host "⚠️  To enable automatic updates, set your DuckDNS token:" -ForegroundColor Yellow
    Write-Host "   .\test_duckdns_comprehensive.ps1 -Token 'your-actual-token'" -ForegroundColor White
}

Write-Host "`n🌐 Your API provider can use: $Domain.duckdns.org" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
