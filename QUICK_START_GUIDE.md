# 🚀 Quick Start Guide - Smart Sleep Tracker

## 📋 Prerequisites Check

✅ Python 3.9.13 - Installed  
✅ Node.js v24.5.0 - Installed  
✅ npm 11.5.1 - Installed

---

## 🏃 Starting the Application

### Option 1: Using Batch Files (Windows)

#### Start Backend:
```bash
cd Desktop\pfa\backend
.\RUN_BACKEND.bat
```

#### Start Mobile App (separate terminal):
```bash
cd Desktop\pfa\app
npm start -- --tunnel
```

### Option 2: Manual Start

#### 1. Start Backend Server:
```bash
cd Desktop\pfa\backend
python main.py
```
**Expected Output:**
```
✅ LSTM model loaded successfully (or ⚠️ using fallback)
INFO:     Uvicorn running on http://0.0.0.0:8000
```

#### 2. Start Expo App:
```bash
cd Desktop\pfa\app
npx expo start --tunnel
```

**Expected Output:**
```
Metro waiting on exp://...
› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
```

---

## 📱 Testing on Your Phone

### Setup:
1. **Install Expo Go:**
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Connect:**
   - Open Expo Go app
   - Scan QR code from terminal
   - OR enter URL manually from terminal output

### Troubleshooting Connection:
If you see "Failed to download remote update":
- ✅ **Solution:** We're using `--tunnel` flag (already applied)
- Check: Phone and PC on same WiFi (not required with tunnel)
- Wait: First load takes 30-60 seconds

---

## 🧪 Testing New Features

### 1. Smart Alarm Testing

**Steps:**
1. Open app → Tap "Smart Alarm ⏰"
2. Set wake time (e.g., current time + 2 minutes for testing)
3. Enable "Smart Wake Window"
4. Set window to 1-2 minutes for quick testing
5. Tap "Set Alarm"
6. Wait for notification

**Expected:** Notification appears at set time with vibration

### 2. Sleep Architecture Chart Testing

**Steps:**
1. Tap "Start Sleep Tracking"
2. Let it run for 30 seconds (generates test data)
3. Tap "Stop Tracking"
4. View results → See hypnogram chart

**Expected:** Color-coded sleep phases chart with statistics

### 3. Weekly Trends Testing

**Steps:**
1. Complete 2-3 sleep sessions
2. Go to "View Sleep History"
3. Scroll to top

**Expected:** Bar chart with sleep duration + line for scores

### 4. Notifications Testing

**Steps:**
1. Check phone notifications permission (should auto-prompt)
2. Complete a sleep session
3. Check for morning summary notification

**Expected:** "Good Morning!" notification with sleep score

---

## 🔍 Verification Checklist

### Backend (Port 8000):
```bash
# Test health endpoint
curl http://localhost:8000/health

# Expected: {"status":"healthy"}
```

### Frontend (Port 19000):
```bash
# Check if Expo is running
netstat -ano | findstr "19000"

# Should show LISTENING on port 19000
```

### Features Verification:
- [ ] Backend API responding (http://localhost:8000/docs)
- [ ] Expo Metro bundler running
- [ ] App loads on phone via Expo Go
- [ ] Smart Alarm screen accessible
- [ ] Notifications permission granted
- [ ] Sleep tracking works
- [ ] Charts display correctly

---

## 🐛 Common Issues & Fixes

### Issue 1: "Module not found: expo-notifications"
**Fix:**
```bash
cd Desktop\pfa\app
npm install
```

### Issue 2: Backend LSTM warning
**Fix (Optional):**
```bash
cd Desktop\pfa\backend
pip install tensorflow==2.15.0
python lstm_model.py  # Train model (takes 5-10 min)
```

### Issue 3: Port already in use
**Fix:**
```bash
# Stop all Node processes
taskkill /F /IM node.exe

# Stop Python
taskkill /F /IM python.exe

# Restart services
```

### Issue 4: Expo tunnel not working
**Alternative:**
```bash
# Use LAN mode instead
npx expo start --lan
# Make sure phone and PC on same WiFi
```

---

## 📊 API Endpoints

### Available Endpoints:

**Health Check:**
```
GET http://localhost:8000/health
```

**Start Sleep Session:**
```
POST http://localhost:8000/sleep/start
Body: {"user_id": "user123"}
```

**Add Sensor Data:**
```
POST http://localhost:8000/sleep/session123/data
Body: {"accel_x": 0.1, "accel_y": 0.2, "accel_z": 0.9}
```

**Real-time Prediction (NEW):**
```
POST http://localhost:8000/realtime/predict
Body: [array of 60 sensor readings]
Returns: {"current_phase": "light", "is_light_sleep": true}
```

**Get Analysis:**
```
POST http://localhost:8000/sleep/session123/analyze
```

**API Documentation:**
```
http://localhost:8000/docs
```

---

## 📱 App Navigation

```
Home Screen
├── Start Sleep Tracking → Tracking Screen → Results Screen
├── View Sleep History → History Screen (with Weekly Trends)
└── Smart Alarm ⏰ → Alarm Screen
```

---

## 🎯 Feature Testing Workflow

### Complete Test Scenario:

**Day 1 - Setup:**
1. ✅ Start app and grant notification permissions
2. ✅ Set bedtime reminder for tonight (Settings)
3. ✅ Configure smart alarm for tomorrow morning

**Day 1 - Evening:**
4. ✅ Receive bedtime reminder notification
5. ✅ Start sleep tracking
6. ✅ Place phone on bed, go to sleep

**Day 2 - Morning:**
7. ✅ Smart alarm wakes you during light sleep
8. ✅ Stop tracking
9. ✅ View sleep architecture chart
10. ✅ Receive morning summary notification

**Day 2-7 - Continued Use:**
11. ✅ Repeat for 7 days
12. ✅ View weekly trends chart
13. ✅ Receive sleep insights notifications
14. ✅ Check weekly summary (Monday 9 AM)

---

## 💡 Tips for Best Results

### Smart Alarm:
- Set wake window to 30 minutes for best results
- Ensure phone has notifications enabled
- Keep app in background while sleeping

### Sleep Tracking:
- Place phone on mattress (not nightstand)
- Ensure phone is charging
- Enable Do Not Disturb mode
- Close other apps to save battery

### Charts:
- Need at least 2 nights for weekly trends
- Sleep architecture shows after each session
- More data = better insights

---

## 🔋 Battery Optimization

The app is designed to minimize battery usage:
- Sensors sample at 1Hz (once per second)
- Smart algorithm reduces sampling during stable periods
- Background processing optimized
- Expect ~10-15% battery drain per 8-hour night

---

## 📈 Data Flow

```
Phone Sensors (Accelerometer)
    ↓
Expo App (React Native)
    ↓
Backend API (FastAPI)
    ↓
LSTM Model (TensorFlow)
    ↓
Sleep Analysis
    ↓
Charts + Notifications
```

---

## 🆘 Need Help?

### Check Logs:

**Backend Logs:**
- Visible in backend PowerShell window
- Look for errors in red

**App Logs:**
- Visible in Expo Metro window
- Press 'j' to open debugger

**Notification Logs:**
- Check phone notification settings
- Verify app has permission

---

## ✅ Success Indicators

You'll know everything is working when:
1. ✅ Backend shows "Uvicorn running on http://0.0.0.0:8000"
2. ✅ Expo shows QR code in terminal
3. ✅ App loads on phone without errors
4. ✅ "Smart Alarm ⏰" button visible on home screen
5. ✅ Can access http://localhost:8000/docs in browser
6. ✅ Notifications permission granted
7. ✅ Sleep tracking collects data
8. ✅ Charts render after tracking

---

## 🎉 You're Ready!

Your Smart Sleep Tracker with all medium features is now ready to use!

**Quick Test:** Run a 30-second sleep session right now to verify everything works!

```bash
1. Open app
2. Tap "Start Sleep Tracking"
3. Wait 30 seconds
4. Tap "Stop Tracking"
5. View beautiful sleep architecture chart! 📊
```

**Enjoy your improved sleep tracking experience! 🌙✨**
