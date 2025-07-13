# API Configuration Guide

## How to Change Base URL

If you need to change the server IP address, you only need to update **ONE FILE**:

### File to Edit
```
client/utils/config.js
```

### What to Change
Look for this line in the config file:
```javascript
BASE_URL: 'http://192.168.1.11:8080/api',
```

Change the IP address `192.168.1.11` to your new server IP address.

### Example
If your server is now running on IP `192.168.1.15`, change it to:
```javascript
BASE_URL: 'http://192.168.1.15:8080/api',
```

## Benefits of This Approach

✅ **Single Source of Truth**: All API calls use the same configuration  
✅ **Easy to Update**: Change IP in one place, affects all files  
✅ **Consistent**: No more mismatched IP addresses across files  
✅ **Maintainable**: Clear structure with organized endpoints  

## Files That Now Use This Config

- `client/app/login.js`
- `client/app/register.js` 
- `client/app/profile-setup.js`
- `client/app/forgot-password.js`
- `client/utils/StreakService.js`

## Configuration Structure

The config file includes:
- **BASE_URL**: The main server URL
- **TIMEOUT**: Request timeout in milliseconds
- **ENDPOINTS**: Organized API endpoints by feature

## Troubleshooting

If you're still having connection issues after changing the IP:

1. Make sure your server is running on the new IP
2. Check that your device/emulator can reach the new IP
3. Verify the port (8080) is correct
4. Test the connection: `http://YOUR_NEW_IP:8080/api/health` (if you have a health endpoint) 