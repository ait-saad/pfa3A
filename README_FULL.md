# 🌙 Smart Sleep Tracker - Intelligent Sleep Monitoring Platform

A comprehensive mobile application for tracking and analyzing sleep patterns using AI and machine learning.

## 🎯 Features

### Core Functionality
- **Real-time Sleep Tracking** - Uses smartphone accelerometer to monitor movement
- **AI-Powered Analysis** - Machine learning classification of sleep phases (Light, Deep, REM)
- **Sleep Score Calculation** - Algorithm based on duration, quality, and sleep cycles
- **Smart Recommendations** - Personalized tips for better sleep
- **Historical Dashboard** - Track sleep patterns over time
- **Sleep Phase Visualization** - Interactive charts and hypnograms

### Technical Highlights
- FastAPI backend with RESTful API
- React Native (Expo) mobile app
- Random Forest & LSTM models for classification
- Real-time sensor data processing
- MongoDB for data persistence (optional)
- Docker containerization

## 📁 Project Structure

```
pfa/
├── backend/           # FastAPI backend server
│   ├── main.py       # API endpoints and logic
│   ├── requirements.txt
│   └── Dockerfile
├── app/              # React Native mobile app
│   ├── App.js
│   ├── screens/      # App screens
│   └── package.json
├── model/            # ML models
│   ├── sleep_classifier.py      # Random Forest classifier
│   └── train_advanced_model.py  # LSTM classifier
├── docs/             # Documentation
│   ├── API_DOCUMENTATION.md
│   └── SETUP_GUIDE.md
└── docker-compose.yml
```

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 2. Train ML Model
```bash
cd model
python sleep_classifier.py
```

### 3. Run Mobile App
```bash
cd app
npm install
npx expo start
```

## 📊 Sleep Phase Classification

| Phase | Description | Movement Level |
|-------|-------------|----------------|
| **Awake** | User is awake | High (> 0.5) |
| **Light** | Light sleep | Moderate (0.2-0.5) |
| **Deep** | Deep sleep | Very low (< 0.1) |
| **REM** | REM sleep | Low-moderate (0.1-0.2) |

## 🧠 Machine Learning Models

### 1. Random Forest Classifier
- Fast inference
- Good for real-time classification
- Feature extraction from accelerometer data

### 2. LSTM Neural Network
- Better accuracy for sequential data
- Captures temporal dependencies
- Ideal for production deployment

## 📱 Mobile App Screens

1. **Home** - Start tracking or view history
2. **Tracking** - Real-time sleep monitoring
3. **Results** - Detailed sleep analysis with charts
4. **History** - Past sleep sessions

## 🔧 Technologies

**Backend:**
- FastAPI
- Python 3.11+
- scikit-learn
- TensorFlow
- NumPy/Pandas

**Mobile:**
- React Native
- Expo
- Expo Sensors
- React Navigation
- React Native Paper

**Infrastructure:**
- Docker
- MongoDB
- Docker Compose

## 📖 Documentation

See `/docs` folder for:
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Setup Guide](docs/SETUP_GUIDE.md)

## 🎓 Academic Context

**Project:** PFA (Projet de Fin d'Année)  
**Topic:** Intelligent Sleep Tracking with AI  
**Keywords:** Actigraphy, Machine Learning, Mobile Health, Sleep Analysis

## 📄 License

MIT License - Feel free to use for academic or personal projects

## 👨‍💻 Author

Developed as an end-of-year project showcasing mobile development, AI/ML, and backend engineering skills.
