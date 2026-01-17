# Smart Sleep Tracker API Documentation

## Base URL
```
http://localhost:8000
```

## Endpoints

### 1. Health Check
**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-11T10:00:00"
}
```

---

### 2. Start Sleep Session
**POST** `/sessions/start`

Start a new sleep tracking session.

**Parameters:**
- `user_id` (query parameter): User identifier

**Response:**
```json
{
  "session_id": "user123_1704967200.0",
  "start_time": "2024-01-11T10:00:00"
}
```

---

### 3. Add Sensor Data
**POST** `/sessions/{session_id}/data`

Add accelerometer and sensor data to an active session.

**Request Body:**
```json
[
  {
    "timestamp": "2024-01-11T10:00:01",
    "accel_x": 0.12,
    "accel_y": -0.05,
    "accel_z": 0.98,
    "sound_level": 25.5,
    "light_level": 0.0
  }
]
```

**Response:**
```json
{
  "message": "Data added successfully",
  "count": 1
}
```

---

### 4. Stop Sleep Session
**POST** `/sessions/{session_id}/stop`

Stop an active sleep tracking session.

**Response:**
```json
{
  "message": "Session stopped",
  "end_time": "2024-01-11T18:00:00"
}
```

---

### 5. Analyze Sleep Session
**POST** `/analyze/{session_id}`

Analyze a completed sleep session using ML model.

**Response:**
```json
{
  "session_id": "user123_1704967200.0",
  "sleep_score": 85.5,
  "total_sleep_time": 7.5,
  "sleep_efficiency": 92.3,
  "phases": [
    {
      "timestamp": 0,
      "phase": "light",
      "movement": 0.15
    }
  ],
  "recommendations": [
    "Great sleep quality! Keep up your good habits.",
    "You had optimal deep sleep duration."
  ]
}
```

---

### 6. Get Analysis Results
**GET** `/analysis/{session_id}`

Retrieve previously computed analysis results.

**Response:** Same as `/analyze/{session_id}`

---

### 7. Get User History
**GET** `/user/{user_id}/history`

Get all sleep sessions for a user.

**Response:**
```json
{
  "user_id": "user123",
  "sessions": [
    {
      "session_id": "user123_1704967200.0",
      "start_time": "2024-01-11T10:00:00",
      "end_time": "2024-01-11T18:00:00",
      "status": "completed"
    }
  ]
}
```

---

## Sleep Phase Classifications

| Phase | Description | Movement Level |
|-------|-------------|----------------|
| **AWAKE** | User is awake | High (> 0.5) |
| **LIGHT** | Light sleep stage | Moderate (0.2-0.5) |
| **DEEP** | Deep sleep stage | Very low (< 0.1) |
| **REM** | REM sleep stage | Low-moderate (0.1-0.2) |

---

## Sleep Score Calculation

Sleep score (0-100) is calculated based on:
- **Deep sleep percentage** (40 points max)
- **REM sleep percentage** (30 points max)
- **Light sleep percentage** (20 points max)
- **Sleep duration** (10 points max)
- **Awake time penalty** (deducted points)

---

## Error Responses

### 404 Not Found
```json
{
  "detail": "Session not found"
}
```

### 400 Bad Request
```json
{
  "detail": "No sensor data available"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```
