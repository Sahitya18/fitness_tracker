# DuckDNS Setup Guide for Windows

This guide will help you set up Dynamic DNS using DuckDNS to solve your IP address issue.

## 🚀 Step 1: Create DuckDNS Account

1. **Go to DuckDNS**: Visit [duckdns.org](https://duckdns.org)
2. **Sign up**: Click "Sign in with Google" or "Sign in with GitHub"
3. **Create subdomain**: 
   - Enter a subdomain name (e.g., `yourfitnessapp`)
   - Click "Add Domain"
   - Your full domain will be: `yourfitnessapp.duckdns.org`

## 🔑 Step 2: Get Your Token

1. **Copy your token**: 
   - On your DuckDNS dashboard, you'll see a token
   - Copy this token (it looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

## ⚙️ Step 3: Configure the Scripts

### Option A: Using Batch File (Simple)

1. **Edit `update_ddns.bat`**:
   ```batch
   REM Change these lines:
   set DOMAIN=yourfitnessapp
   set TOKEN=YOUR_DUCK_DNS_TOKEN
   ```

2. **Replace with your values**:
   ```batch
   set DOMAIN=yourfitnessapp
   set TOKEN=a1b2c3d4-e5f6-7890-abcd-ef1234567890
   ```

### Option B: Using PowerShell (Recommended)

1. **Edit `update_ddns.ps1`**:
   ```powershell
   # Change these lines:
   $domain = "yourfitnessapp"
   $token = "YOUR_DUCK_DNS_TOKEN"
   ```

2. **Replace with your values**:
   ```powershell
   $domain = "yourfitnessapp"
   $token = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
   ```

## 🧪 Step 4: Test the Script

### Test Batch File:
```cmd
# Open Command Prompt and run:
update_ddns.bat
```

### Test PowerShell:
```powershell
# Open PowerShell and run:
.\update_ddns.ps1
```

**Expected Output:**
```
🔄 Starting DuckDNS Update...
Domain: yourfitnessapp.duckdns.org
Current IP: 203.45.67.89
✅ DuckDNS updated successfully!
🌐 Your domain: yourfitnessapp.duckdns.org
📍 Points to IP: 203.45.67.89
```

## ⏰ Step 5: Set Up Automatic Updates

### Method 1: Windows Task Scheduler (Recommended)

1. **Open Task Scheduler**:
   - Press `Win + R`
   - Type `taskschd.msc`
   - Press Enter

2. **Create Basic Task**:
   - Click "Create Basic Task"
   - Name: `Update DuckDNS`
   - Description: `Automatically update DuckDNS with current IP`

3. **Set Trigger**:
   - Trigger: `Daily`
   - Start: `Now`
   - Recur every: `1 day`
   - Click "Next"

4. **Set Action**:
   - Action: `Start a program`
   - Program: `powershell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File "C:\path\to\update_ddns.ps1"`

5. **Finish**:
   - Check "Open properties dialog"
   - Click "Finish"

6. **Advanced Settings**:
   - In Properties, go to "Triggers" tab
   - Edit the trigger
   - Check "Repeat task every: 5 minutes"
   - Set "for a duration of: 1 day"
   - Click "OK"

### Method 2: Simple Batch File Loop

Create `run_ddns_loop.bat`:
```batch
@echo off
:loop
echo Updating DuckDNS...
call update_ddns.bat
echo Waiting 5 minutes...
timeout /t 300 /nobreak
goto loop
```

## 🔍 Step 6: Verify Setup

### Test DNS Resolution:
```cmd
nslookup yourfitnessapp.duckdns.org
```

### Test from External Network:
1. Go to [whatismyipaddress.com](https://whatismyipaddress.com)
2. Note your IP address
3. Run your DDNS script
4. Wait 2-3 minutes
5. Test: `nslookup yourfitnessapp.duckdns.org`

## 🔧 Step 7: Configure Your Fitness App

### Update Your Server Configuration:

1. **Edit `application.properties`**:
```properties
# Update your server configuration
server.address=0.0.0.0
server.port=8080

# Add your DDNS hostname
app.server.hostname=yourfitnessapp.duckdns.org
```

2. **Update API Provider**:
   - Contact your API provider
   - Tell them your hostname: `yourfitnessapp.duckdns.org`
   - Port: `8080` (or your server port)

## 🛡️ Step 8: Security Setup

### Configure Firewall:
```powershell
# Allow incoming connections on port 8080
New-NetFirewallRule -DisplayName "Fitness App Server" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow
```

### Test External Access:
```bash
# From another network, test:
curl http://yourfitnessapp.duckdns.org:8080/api/proxy/health
```

## 📊 Step 9: Monitoring

### Check Logs:
```cmd
# View update log
type ddns_update.log
```

### Health Check Script:
Create `check_ddns.ps1`:
```powershell
$domain = "yourfitnessapp.duckdns.org"
$currentIP = (Invoke-WebRequest -Uri "https://ifconfig.me" -UseBasicParsing).Content
$resolvedIP = (Resolve-DnsName $domain).IPAddress

if ($resolvedIP -eq $currentIP) {
    Write-Host "✅ DDNS is working correctly" -ForegroundColor Green
} else {
    Write-Host "❌ DDNS needs update: $resolvedIP vs $currentIP" -ForegroundColor Red
}
```

## 🚨 Troubleshooting

### Common Issues:

1. **Script won't run**:
   - Right-click script → "Run as administrator"
   - Check PowerShell execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

2. **DuckDNS update fails**:
   - Verify your token is correct
   - Check internet connection
   - Try the manual update URL in browser

3. **DNS not updating**:
   - Wait 2-3 minutes for DNS propagation
   - Clear DNS cache: `ipconfig /flushdns`
   - Test from different network

4. **External access blocked**:
   - Check Windows Firewall
   - Configure router port forwarding
   - Contact ISP if needed

## ✅ Success Checklist

- [ ] DuckDNS account created
- [ ] Domain configured (`yourfitnessapp.duckdns.org`)
- [ ] Scripts updated with your token
- [ ] Manual test successful
- [ ] Task Scheduler configured
- [ ] Firewall configured
- [ ] External access working
- [ ] API provider updated with hostname

## 🎯 Next Steps

1. **Test your fitness app** with the new hostname
2. **Monitor the logs** for a few days
3. **Set up email notifications** if needed
4. **Consider backup DDNS service** for reliability

Your dynamic IP issue is now solved! Your API provider can use `yourfitnessapp.duckdns.org` as a fixed hostname that automatically updates when your IP changes.
