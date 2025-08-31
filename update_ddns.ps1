# DuckDNS Update Script for Windows PowerShell
# This script automatically updates your DuckDNS domain with your current IP address

# Configuration - UPDATE THESE VALUES
$domain = "fitmee"
$token = "78c8638c-c802-44ee-8f93-8f04c8d26437"

# Function to get current public IP
function Get-CurrentIP {
    try {
        $response = Invoke-WebRequest -Uri "https://ifconfig.me" -UseBasicParsing -TimeoutSec 10
        return $response.Content.Trim()
    }
    catch {
        Write-Host "❌ Failed to get current IP address: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to update DuckDNS
function Update-DuckDNS {
    param(
        [string]$Domain,
        [string]$Token,
        [string]$IP
    )
    
    try {
        $updateUrl = "https://www.duckdns.org/update?domains=$Domain&token=$Token&ip=$IP"
        $response = Invoke-WebRequest -Uri $updateUrl -UseBasicParsing -TimeoutSec 10
        
        if ($response.Content -eq "OK") {
            return $true
        } else {
            Write-Host "❌ DuckDNS update failed: $($response.Content)" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Error updating DuckDNS: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to log updates
function Write-DDNSLog {
    param(
        [string]$Message,
        [string]$IP
    )
    
    $logFile = "ddns_update.log"
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "$timestamp - $Message - IP: $IP"
    
    try {
        Add-Content -Path $logFile -Value $logEntry
    }
    catch {
        Write-Host "⚠️ Warning: Could not write to log file" -ForegroundColor Yellow
    }
}

# Main execution
Write-Host "🔄 Starting DuckDNS Update..." -ForegroundColor Cyan
Write-Host "Domain: $domain.duckdns.org" -ForegroundColor Yellow

# Get current IP
$currentIP = Get-CurrentIP

if ($currentIP) {
    Write-Host "Current IP: $currentIP" -ForegroundColor Green
    
    # Update DuckDNS
    $success = Update-DuckDNS -Domain $domain -Token $token -IP $currentIP
    
    if ($success) {
        Write-Host "✅ DuckDNS updated successfully!" -ForegroundColor Green
        Write-Host "🌐 Your domain: $domain.duckdns.org" -ForegroundColor Cyan
        Write-Host "📍 Points to IP: $currentIP" -ForegroundColor Cyan
        
        # Log successful update
        Write-DDNSLog -Message "SUCCESS" -IP $currentIP
    } else {
        Write-Host "❌ DuckDNS update failed!" -ForegroundColor Red
        Write-Host "Please check your domain and token settings." -ForegroundColor Yellow
        
        # Log failed update
        Write-DDNSLog -Message "FAILED" -IP $currentIP
    }
} else {
    Write-Host "❌ Could not determine current IP address" -ForegroundColor Red
    Write-DDNSLog -Message "IP_DETECTION_FAILED" -IP "UNKNOWN"
}

# Optional: Test DNS resolution
Write-Host "`n🔍 Testing DNS resolution..." -ForegroundColor Cyan
try {
    $dnsResult = Resolve-DnsName -Name "$domain.duckdns.org" -ErrorAction Stop
    $resolvedIP = $dnsResult.IPAddress
    
    if ($resolvedIP -eq $currentIP) {
        Write-Host "✅ DNS resolution successful: $resolvedIP" -ForegroundColor Green
    } else {
        Write-Host "⚠️ DNS may not be updated yet. Resolved: $resolvedIP" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ DNS resolution failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
