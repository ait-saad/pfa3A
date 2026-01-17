# Smart Sleep Tracker - Setup Guide

## Prerequisites

### Backend Requirements
- Python 3.11+
- pip or conda
- MongoDB (optional, for production)

### Mobile App Requirements
- Node.js 18+
- npm or yarn
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

---

## Backend Setup

### 1. Navigate to backend directory
```bash
cd Desktop/pfa/backend
```

### 2. Create virtual environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 5. Run the backend
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### 6. Test the API
Open browser and go to:
- API documentation: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

---

## Train ML Model

### 1. Navigate to model directory
```bash
cd Desktop/pfa/model
```

### 2. Train the classifier
```bash
python sleep_classifier.py
```

This will:
- Generate synthetic training data
- Train the Random Forest model
- Save the model to `sleep_classifier_model.pkl`

### 3. Test the model
The script will output training accuracy and save the model.

---

## Mobile App Setup

### 1. Navigate to app directory
```bash
cd Desktop/pfa/app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start Expo development server
```bash
npx expo start
```

### 4. Run on device/emulator

**Android:**
- Press `a` to open in Android emulator
- Or scan QR code with Expo Go app

**iOS:**
- Press `i` to open in iOS simulator (Mac only)
- Or scan QR code with Expo Go app

**Web:**
- Press `w` to open in browser

---

## Docker Setup (Optional)

### 1. Install Docker and Docker Compose

### 2. Build and run containers
```bash
cd Desktop/pfa
docker-compose up -d
```

This will start:
- Backend API on port 8000
- MongoDB on port 27017

### 3. Stop containers
```bash
docker-compose down
```

---

## Configuration

### Backend Configuration (.env)
```env
DATABASE_URL=mongodb://localhost:27017
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Mobile App Configuration
Edit `app/screens/TrackingScreen.js`:
```javascript
const API_URL = 'http://YOUR_IP_ADDRESS:8000';
```

**Note:** Replace `localhost` with your computer's IP address when testing on physical device.

---

## Testing the Application

### 1. Start backend
```bash
cd backend
python main.py
```

### 2. Start mobile app
```bash
cd app
npx expo start
```

### 3. Test workflow
1. Open app on device
2. Click "Start Sleep Tracking"
3. Let it run for 1-2 minutes
4. Click "Stop & Analyze"
5. View sleep analysis results

---

## Troubleshooting

### Backend won't start
- Check if port 8000 is already in use
- Verify Python version: `python --version`
- Reinstall dependencies: `pip install -r requirements.txt`

### Mobile app can't connect to backend
- Ensure backend is running
- Check firewall settings
- Use computer's IP address instead of localhost
- Test API manually: `curl http://YOUR_IP:8000/health`

### Accelerometer not working
- Grant sensor permissions in device settings
- Restart the app
- Try on physical device (not emulator)

### Model training fails
- Check if numpy/scikit-learn is installed correctly
- Ensure sufficient RAM (minimum 4GB recommended)
- Try reducing dataset size in `generate_synthetic_data()`

---

## Production Deployment

### Backend
1. Use production database (MongoDB)
2. Set secure SECRET_KEY
3. Enable HTTPS
4. Use production WSGI server (gunicorn)
5. Set up monitoring and logging

### Mobile App
1. Build production APK/IPA
2. Update API_URL to production endpoint
3. Configure app signing
4. Submit to app stores

---

## Next Steps

- [ ] Add user authentication
- [ ] Implement data persistence with MongoDB
- [ ] Train model with real sleep dataset
- [ ] Add smart alarm feature
- [ ] Implement push notifications
- [ ] Add social features (compare with friends)
- [ ] Integrate with health apps (Apple Health, Google Fit)
