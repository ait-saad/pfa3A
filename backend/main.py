from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import numpy as np
from enum import Enum
import os

# Try to import LSTM model
try:
    from lstm_model import SleepLSTMModel
    LSTM_AVAILABLE = True
    # Initialize LSTM model
    lstm_model = SleepLSTMModel(sequence_length=60, n_features=4)
    # Try to load pre-trained model
    if os.path.exists('models/lstm_sleep_model.h5'):
        lstm_model.load_model('models/lstm_sleep_model')
        print("✅ LSTM model loaded successfully")
    else:
        print("⚠️  LSTM model not found, will use fallback classification")
        LSTM_AVAILABLE = False
except Exception as e:
    print(f"⚠️  LSTM not available: {e}, using fallback classification")
    LSTM_AVAILABLE = False
    lstm_model = None

app = FastAPI(title="Smart Sleep Tracker API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SleepPhase(str, Enum):
    AWAKE = "awake"
    LIGHT = "light"
    DEEP = "deep"
    REM = "rem"

class SensorData(BaseModel):
    timestamp: datetime
    accel_x: float
    accel_y: float
    accel_z: float
    sound_level: Optional[float] = None
    light_level: Optional[float] = None

class SleepSession(BaseModel):
    user_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    sensor_data: List[SensorData]

class SleepAnalysis(BaseModel):
    session_id: str
    sleep_score: float
    total_sleep_time: float
    sleep_efficiency: float
    phases: List[dict]
    recommendations: List[str]

# In-memory storage (replace with database in production)
sessions_db = {}
analysis_db = {}

@app.get("/")
async def root():
    return {
        "message": "Smart Sleep Tracker API",
        "version": "1.0.0",
        "endpoints": ["/sessions", "/analyze", "/health"]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.post("/sessions/start")
async def start_session(user_id: str):
    """Start a new sleep tracking session"""
    session_id = f"{user_id}_{datetime.now().timestamp()}"
    sessions_db[session_id] = {
        "user_id": user_id,
        "start_time": datetime.now(),
        "sensor_data": [],
        "status": "active"
    }
    return {"session_id": session_id, "start_time": sessions_db[session_id]["start_time"]}

@app.post("/sessions/{session_id}/data")
async def add_sensor_data(session_id: str, data: List[SensorData]):
    """Add sensor data to an active session"""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Session not found")
    
    sessions_db[session_id]["sensor_data"].extend([d.dict() for d in data])
    return {"message": "Data added successfully", "count": len(data)}

@app.post("/sessions/{session_id}/stop")
async def stop_session(session_id: str):
    """Stop a sleep tracking session"""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Session not found")
    
    sessions_db[session_id]["end_time"] = datetime.now()
    sessions_db[session_id]["status"] = "completed"
    return {"message": "Session stopped", "end_time": sessions_db[session_id]["end_time"]}

@app.post("/analyze/{session_id}", response_model=SleepAnalysis)
async def analyze_session(session_id: str):
    """Analyze a completed sleep session"""
    if session_id not in sessions_db:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions_db[session_id]
    sensor_data = session["sensor_data"]
    
    if len(sensor_data) == 0:
        raise HTTPException(status_code=400, detail="No sensor data available")
    
    # Calculate movement magnitude
    movements = []
    for data in sensor_data:
        magnitude = np.sqrt(
            data["accel_x"]**2 + 
            data["accel_y"]**2 + 
            data["accel_z"]**2
        )
        movements.append(magnitude)
    
    # Use LSTM model if available, otherwise fallback to rule-based
    if LSTM_AVAILABLE and lstm_model.is_trained:
        # Prepare data for LSTM
        accel_data = np.array([[d.accel_x, d.accel_y, d.accel_z] 
                               for d in session["sensor_data"]])
        try:
            phases = lstm_model.predict(accel_data)
        except Exception as e:
            print(f"LSTM prediction failed: {e}, using fallback")
            phases = classify_sleep_phases(movements)
    else:
        phases = classify_sleep_phases(movements)
    
    # Calculate sleep metrics
    total_sleep_time = calculate_sleep_duration(session)
    sleep_score = calculate_sleep_score(phases, total_sleep_time)
    sleep_efficiency = calculate_sleep_efficiency(phases, total_sleep_time)
    recommendations = generate_recommendations(sleep_score, phases)
    
    analysis = SleepAnalysis(
        session_id=session_id,
        sleep_score=sleep_score,
        total_sleep_time=total_sleep_time,
        sleep_efficiency=sleep_efficiency,
        phases=phases,
        recommendations=recommendations
    )
    
    analysis_db[session_id] = analysis.dict()
    return analysis

@app.get("/analysis/{session_id}", response_model=SleepAnalysis)
async def get_analysis(session_id: str):
    """Get the analysis results for a session"""
    if session_id not in analysis_db:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis_db[session_id]

@app.post("/realtime/predict")
async def predict_current_phase(sensor_data: List[SensorData]):
    """
    Predict current sleep phase from recent sensor data (for smart alarm).
    Requires at least 60 samples for LSTM prediction.
    """
    if len(sensor_data) < 60:
        raise HTTPException(
            status_code=400,
            detail=f"Need at least 60 data points, got {len(sensor_data)}"
        )
    
    if LSTM_AVAILABLE and lstm_model.is_trained:
        try:
            # Prepare recent data
            recent_data = np.array([
                [d.accel_x, d.accel_y, d.accel_z] 
                for d in sensor_data[-60:]
            ])
            
            # Get real-time prediction
            prediction = lstm_model.predict_realtime(recent_data)
            
            return {
                "current_phase": prediction["phase"],
                "confidence": prediction["confidence"],
                "probabilities": prediction["probabilities"],
                "is_light_sleep": prediction["phase"] == "light",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
    else:
        # Fallback: use simple classification
        movements = []
        for d in sensor_data[-60:]:
            magnitude = np.sqrt(d.accel_x**2 + d.accel_y**2 + d.accel_z**2)
            movements.append(magnitude)
        
        avg_movement = np.mean(movements)
        
        if avg_movement > 0.4:
            phase = "awake"
        elif avg_movement < 0.08:
            phase = "deep"
        elif avg_movement > 0.15:
            phase = "light"
        else:
            phase = "rem"
        
        return {
            "current_phase": phase,
            "confidence": 0.7,
            "probabilities": {
                "awake": 0.25,
                "light": 0.25,
                "deep": 0.25,
                "rem": 0.25
            },
            "is_light_sleep": phase == "light",
            "timestamp": datetime.now().isoformat()
        }

@app.get("/user/{user_id}/history")
async def get_user_history(user_id: str):
    """Get sleep history for a user"""
    user_sessions = [
        {
            "session_id": sid,
            "start_time": session["start_time"],
            "end_time": session.get("end_time"),
            "status": session["status"]
        }
        for sid, session in sessions_db.items()
        if session["user_id"] == user_id
    ]
    return {"user_id": user_id, "sessions": user_sessions}

def classify_sleep_phases(movements: List[float]) -> List[dict]:
    """Classify sleep phases based on movement data with improved algorithm"""
    phases = []
    window_size = 30  # 30-second windows
    
    for i in range(0, len(movements), window_size):
        window = movements[i:i+window_size]
        if len(window) == 0:
            continue
            
        avg_movement = np.mean(window)
        std_movement = np.std(window)
        max_movement = np.max(window)
        min_movement = np.min(window)
        
        # Improved threshold-based classification with more realistic criteria
        # These thresholds are based on actigraphy research
        if avg_movement > 0.4 or max_movement > 0.8:
            # High movement indicates being awake
            phase = SleepPhase.AWAKE
        elif avg_movement < 0.08 and std_movement < 0.03:
            # Very low and stable movement indicates deep sleep
            phase = SleepPhase.DEEP
        elif avg_movement > 0.15 and std_movement > 0.05:
            # Moderate movement with variability indicates light sleep
            phase = SleepPhase.LIGHT
        else:
            # Low-moderate movement indicates REM sleep
            phase = SleepPhase.REM
        
        phases.append({
            "timestamp": i,
            "phase": phase.value,
            "movement": float(avg_movement),
            "movement_std": float(std_movement)
        })
    
    return phases

def calculate_sleep_duration(session: dict) -> float:
    """Calculate total sleep duration in hours"""
    if session.get("end_time"):
        duration = (session["end_time"] - session["start_time"]).total_seconds() / 3600
        return round(duration, 2)
    return 0.0

def calculate_sleep_score(phases: List[dict], duration: float) -> float:
    """Calculate overall sleep score (0-100) based on sleep quality research"""
    if duration == 0 or len(phases) == 0:
        return 0.0
    
    # Count phases
    deep_count = sum(1 for p in phases if p["phase"] == SleepPhase.DEEP)
    light_count = sum(1 for p in phases if p["phase"] == SleepPhase.LIGHT)
    rem_count = sum(1 for p in phases if p["phase"] == SleepPhase.REM)
    awake_count = sum(1 for p in phases if p["phase"] == SleepPhase.AWAKE)
    
    total_phases = len(phases)
    
    # Calculate percentages
    deep_pct = deep_count / total_phases
    light_pct = light_count / total_phases
    rem_pct = rem_count / total_phases
    awake_pct = awake_count / total_phases
    
    # Ideal sleep composition (based on sleep research):
    # Deep: 15-25% | Light: 45-55% | REM: 20-25% | Awake: <5%
    
    # Deep sleep score (0-25 points) - ideal 15-25%
    if 0.15 <= deep_pct <= 0.25:
        deep_score = 25
    elif deep_pct > 0.25:
        deep_score = max(0, 25 - (deep_pct - 0.25) * 50)
    else:
        deep_score = deep_pct / 0.15 * 25
    
    # REM sleep score (0-25 points) - ideal 20-25%
    if 0.20 <= rem_pct <= 0.25:
        rem_score = 25
    elif rem_pct > 0.25:
        rem_score = max(0, 25 - (rem_pct - 0.25) * 50)
    else:
        rem_score = rem_pct / 0.20 * 25
    
    # Light sleep score (0-20 points) - ideal 45-55%
    if 0.45 <= light_pct <= 0.55:
        light_score = 20
    else:
        light_score = max(0, 20 - abs(light_pct - 0.50) * 40)
    
    # Duration score (0-20 points) - ideal 7-9 hours
    if 7 <= duration <= 9:
        duration_score = 20
    elif duration < 7:
        duration_score = max(0, duration / 7 * 20)
    else:
        duration_score = max(0, 20 - (duration - 9) * 5)
    
    # Awake penalty (0-10 points deduction)
    awake_penalty = min(awake_pct * 100, 10)
    
    # Final score
    score = deep_score + rem_score + light_score + duration_score - awake_penalty
    
    return round(max(0, min(100, score)), 2)

def calculate_sleep_efficiency(phases: List[dict], duration: float) -> float:
    """Calculate sleep efficiency percentage"""
    if len(phases) == 0:
        return 0.0
    
    asleep_phases = sum(1 for p in phases if p["phase"] != SleepPhase.AWAKE)
    efficiency = (asleep_phases / len(phases)) * 100
    return round(efficiency, 2)

def generate_recommendations(score: float, phases: List[dict]) -> List[str]:
    """Generate personalized sleep recommendations based on sleep science"""
    recommendations = []
    
    if len(phases) == 0:
        return ["Not enough data to generate recommendations."]
    
    # Count phases
    total = len(phases)
    deep_pct = sum(1 for p in phases if p["phase"] == SleepPhase.DEEP) / total
    light_pct = sum(1 for p in phases if p["phase"] == SleepPhase.LIGHT) / total
    rem_pct = sum(1 for p in phases if p["phase"] == SleepPhase.REM) / total
    awake_pct = sum(1 for p in phases if p["phase"] == SleepPhase.AWAKE) / total
    
    # Overall score feedback
    if score >= 85:
        recommendations.append("🌟 Excellent sleep! You're getting high-quality rest.")
    elif score >= 70:
        recommendations.append("😊 Good sleep quality. Minor improvements can make it even better.")
    elif score >= 50:
        recommendations.append("😐 Fair sleep. Several areas could be improved for better rest.")
    else:
        recommendations.append("😟 Poor sleep quality. Consider consulting a sleep specialist.")
    
    # Deep sleep recommendations
    if deep_pct < 0.13:
        recommendations.append("💤 Low deep sleep detected. Try: regular exercise, cooler room (60-67°F), avoid alcohol before bed.")
    elif deep_pct > 0.30:
        recommendations.append("⚠️ Unusually high deep sleep. This might indicate sleep debt recovery.")
    
    # REM sleep recommendations
    if rem_pct < 0.15:
        recommendations.append("🧠 Low REM sleep. Try: consistent sleep schedule, reduce alcohol, manage stress before bed.")
    elif rem_pct > 0.30:
        recommendations.append("💭 High REM sleep percentage. This is normal during recovery or stress periods.")
    
    # Awake time recommendations
    if awake_pct > 0.10:
        recommendations.append("🌙 Frequent awakenings detected. Minimize: noise, light, temperature fluctuations, screen time before bed.")
    elif awake_pct > 0.05:
        recommendations.append("👍 Some awakenings are normal, but try to minimize bedroom disruptions.")
    
    # Light sleep balance
    if light_pct < 0.35:
        recommendations.append("⚡ Low light sleep. This might indicate interrupted sleep cycles.")
    elif light_pct > 0.65:
        recommendations.append("📊 High light sleep percentage. Focus on deep sleep quality: exercise, reduce stress, optimize temperature.")
    
    # General tips if score is low
    if score < 70:
        recommendations.append("✨ General tips: Keep consistent sleep schedule, dark & cool room, limit caffeine after 2 PM.")
    
    return recommendations

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
