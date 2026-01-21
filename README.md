# 🌙 Smart Sleep Tracker

An intelligent sleep monitoring application using LSTM deep learning to classify sleep phases from accelerometer data.

## 📋 Project Overview

| Component | Technology |
|-----------|------------|
| **Backend** | FastAPI + TensorFlow/Keras LSTM |
| **Mobile App** | React Native (Expo) |
| **ML Models** | LSTM Neural Network + Random Forest |
| **Sleep Phases** | Awake, Light, Deep, REM |

## 🏗️ Architecture

```
pfa/
├── backend/           # FastAPI server + LSTM model
│   ├── main.py        # REST API endpoints
│   ├── lstm_model.py  # LSTM sleep classifier
│   └── models/        # Trained model files
├── app/               # React Native mobile app
│   ├── screens/       # App screens (Home, Tracking, Results, etc.)
│   ├── components/    # UI components
│   └── services/      # Notification service
├── model/             # Alternative ML models
│   ├── sleep_classifier.py      # Random Forest classifier
│   └── train_advanced_model.py  # LSTM training script
├── web-demo/          # Web demonstration interface
└── docs/              # API documentation
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### 1. Start Backend Server

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run server
python main.py
```

Server runs at `http://localhost:8000`

### 2. Start Mobile App

```bash
cd app

# Install dependencies
npm install

# Start Expo (use --tunnel for remote testing)
npx expo start --tunnel
```

Scan the QR code with Expo Go app on your phone.

## 🧠 ML Models

### LSTM Model (`backend/lstm_model.py`)
- **Architecture**: 3 LSTM layers (128→64→32 units) + Dense layers
- **Input**: 60 timesteps × 4 features (x, y, z acceleration + magnitude)
- **Output**: 4-class softmax (awake, light, deep, REM)
- **Features**: Real-time prediction, confidence scores, batch processing

### Random Forest (`model/sleep_classifier.py`)
- **Features extracted**: Mean, std, min, max, variance, zero-crossing rate, skewness, kurtosis, energy
- **Window size**: 30 seconds
- **Use case**: Fallback when LSTM unavailable

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| POST | `/sessions/start` | Start sleep session |
| POST | `/sessions/{id}/data` | Add sensor data |
| POST | `/sessions/{id}/stop` | Stop session |
| POST | `/analyze/{id}` | Analyze sleep session |
| GET | `/analysis/{id}` | Get analysis results |
| POST | `/realtime/predict` | Real-time phase prediction |
| GET | `/user/{id}/history` | User sleep history |

## 📱 Mobile App Features

- **Sleep Tracking**: Real-time accelerometer monitoring
- **Smart Alarm**: Wake during light sleep phase
- **Sleep Score**: Quality metrics (0-100)
- **Sleep Architecture**: Visual hypnogram chart
- **Weekly Trends**: Historical analysis
- **Recommendations**: Personalized sleep tips

## 🔬 Sleep Phase Classification

Based on movement patterns from accelerometer data:

| Phase | Movement Pattern | Typical % |
|-------|-----------------|-----------|
| **Awake** | High movement (>0.4) | <5% |
| **Light** | Moderate movement (0.15-0.4) | 45-55% |
| **Deep** | Minimal movement (<0.08) | 15-25% |
| **REM** | Low-moderate with occasional twitches | 20-25% |

## 🏃 Training the Model

```bash
cd backend

# Train LSTM model
python lstm_model.py

# Or train advanced model
cd ../model
python train_advanced_model.py
```

Models are saved to `backend/models/` directory.

## 📊 Evaluation Results

See `backend/evaluation_results/` for:
- Confusion matrix
- ROC curves
- Per-class accuracy metrics
- Performance analysis

## 🔧 Configuration

### Backend Environment
Create `backend/.env`:
```env
DEBUG=True
MODEL_PATH=models/lstm_sleep_model
```

### Mobile App
Update API URL in app screens to match your backend server IP.

## 🌐 LAN Mode (Local Network)

To test on the same WiFi network:
1. Find your PC's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update API URL in app to `http://YOUR_IP:8000`
3. Ensure firewall allows port 8000

## 📚 Documentation

- [API Documentation](docs/API_DOCUMENTATION.md)
- [Setup Guide](docs/SETUP_GUIDE.md)

## 🛠️ Tech Stack

- **Backend**: FastAPI, TensorFlow, Keras, scikit-learn, NumPy, Pandas
- **Mobile**: React Native, Expo, React Navigation
- **ML**: LSTM, Random Forest, StandardScaler

## 📄 License

This project is developed as a PFA (Projet de Fin d'Année) academic project.
