# 🌐 LAN Mode Setup Guide

## ✅ Switched from Tunnel to LAN Mode

**Why LAN mode is better:**
- ⚡ Much faster loading (no ngrok relay)
- 🔒 More reliable connection
- 📱 Better performance
- 🚀 Instant hot reload

---

## 📱 Your Network Configuration

**Your PC IP Address:** `100.91.177.121`

**Expo Metro Server:** Running on port 19000

**URL for Expo Go:** `exp://100.91.177.121:19000`

---

## 🔧 Setup Requirements

### **IMPORTANT: Phone and PC Must Be on Same WiFi**

Check this on your phone:
1. Open WiFi settings
2. Note the WiFi network name
3. Verify PC is on the SAME network

**If on different networks:**
- Connect phone to same WiFi as PC
- OR use mobile hotspot from phone and connect PC to it

---

## 📱 How to Connect Your Phone

### **Method 1: Scan QR Code (Easiest)**

1. Open the new PowerShell window (Expo should be running)
2. Look for the QR code in the terminal
3. Open **Expo Go** app on your phone
4. Tap "Scan QR Code"
5. Scan the code from the terminal

### **Method 2: Manual URL Entry**

1. Open **Expo Go** app
2. Tap "Enter URL manually"
3. Type: `exp://100.91.177.121:19000`
4. Tap "Connect"

---

## 🔥 Firewall Configuration

If connection fails, Windows Firewall might be blocking:

### **Allow Node.js through Firewall:**

**Option 1: Quick Fix (Recommended)**
```powershell
New-NetFirewallRule -DisplayName "Expo Metro" -Direction Inbound -Protocol TCP -LocalPort 19000-19002 -Action Allow
New-NetFirewallRule -DisplayName "Expo Metro" -Direction Inbound -Protocol TCP -LocalPort 8081 -Action Allow
```

**Option 2: Manual (GUI)**
1. Open "Windows Defender Firewall"
2. Click "Allow an app through firewall"
3. Click "Change settings"
4. Find "Node.js" and check both Private and Public
5. Click OK

---

## ✅ Verification Steps

### **1. Check Expo is Running:**
```powershell
netstat -ano | findstr "19000"
```
Should show: `LISTENING` on port 19000

### **2. Check Your IP:**
```powershell
ipconfig | findstr "IPv4"
```
Should show: `100.91.177.121` (or similar 192.168.x.x or 10.x.x.x)

### **3. Test Connection:**
Open browser on PC and go to:
```
http://localhost:19000
```
Should show Expo Dev Tools

---

## 🐛 Troubleshooting

### **Problem: "Unable to connect to Metro"**

**Solutions:**
1. **Check same WiFi:** Phone and PC on same network?
2. **Restart Expo:** Stop and restart with `--lan`
3. **Check firewall:** Allow Node.js through firewall
4. **Try different network:** Use mobile hotspot

### **Problem: QR code not scanning**

**Solutions:**
1. Use manual URL entry instead
2. Make sure Expo Go app is updated
3. Check camera permissions

### **Problem: "Network response timed out"**

**Solutions:**
1. Restart your router
2. Disable VPN if active
3. Check antivirus isn't blocking
4. Try connecting phone to PC's hotspot

### **Problem: App loads but hot reload doesn't work**

**Solutions:**
1. Restart Expo with `--clear` flag
2. Clear Expo Go cache on phone
3. Reinstall Expo Go app

---

## 🚀 Commands Reference

### **Start Expo in LAN mode:**
```bash
cd Desktop\pfa\app
npx expo start --lan --clear
```

### **Stop Expo:**
```bash
# In Expo terminal window:
Ctrl + C
```

### **Restart with different modes:**
```bash
npx expo start --lan          # LAN mode (recommended)
npx expo start --localhost    # Localhost only
npx expo start --tunnel       # Tunnel mode (slow but works everywhere)
```

### **Clear cache:**
```bash
npx expo start --lan --clear
```

---

## 📊 Connection Modes Comparison

| Mode | Speed | Setup | Works When |
|------|-------|-------|------------|
| **LAN** | ⚡⚡⚡ Fast | Same WiFi required | Same network |
| **Localhost** | ⚡⚡⚡ Fast | USB or emulator | Local only |
| **Tunnel** | 🐌 Slow | Always works | Any network |

**Recommendation:** Use LAN mode for development (what we just set up)

---

## ✅ Current Status

- ✅ Expo stopped from tunnel mode
- ✅ Local IP identified: `100.91.177.121`
- ✅ Expo restarted in LAN mode
- ✅ Port 19000 ready for connections

---

## 📱 Next Steps

1. **Check the Expo window** - Look for QR code
2. **Open Expo Go** on your phone
3. **Scan QR code** or enter URL manually
4. **Wait 30-60 seconds** for bundle to load
5. **Enjoy fast development!** ⚡

---

## 💡 Pro Tips

### **Faster Development:**
- Use LAN mode (faster than tunnel)
- Enable "Fast Refresh" in Expo Go settings
- Keep phone charging during development
- Close other apps to free up memory

### **Better Experience:**
- Connect phone to 5GHz WiFi (faster)
- Keep phone and PC close to router
- Disable battery optimization for Expo Go
- Use developer mode on phone

### **Troubleshooting:**
- Shake phone to open dev menu
- Press 'r' in Expo terminal to reload
- Press 'j' to open debugger
- Press 'm' to toggle menu

---

## 🎯 Success Indicators

You'll know it's working when:
- ✅ QR code appears in terminal
- ✅ URL shows `exp://100.91.177.121:19000`
- ✅ Phone shows "Opening project" in Expo Go
- ✅ App loads on phone
- ✅ Changes reflect quickly (hot reload)

---

**Your app should now load much faster! 🚀**

If you need to go back to tunnel mode:
```bash
npx expo start --tunnel
```

But LAN mode is recommended for development!
