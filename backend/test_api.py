"""
Test script for Smart Sleep Tracker API
"""
import requests
import time
import numpy as np
from datetime import datetime

API_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{API_URL}/health")
    print(f"✓ Health check: {response.json()}")
    return response.status_code == 200

def test_start_session():
    """Test starting a sleep session"""
    print("\nTesting session start...")
    response = requests.post(f"{API_URL}/sessions/start", params={"user_id": "test_user"})
    data = response.json()
    print(f"✓ Session started: {data['session_id']}")
    return data['session_id']

def generate_mock_sensor_data(duration_seconds=60):
    """Generate mock accelerometer data"""
    data = []
    for i in range(duration_seconds):
        timestamp = datetime.now().isoformat()
        # Simulate sleep movement (low values)
        accel_x = np.random.normal(0.1, 0.05)
        accel_y = np.random.normal(0.1, 0.05)
        accel_z = np.random.normal(0.9, 0.1)
        
        data.append({
            "timestamp": timestamp,
            "accel_x": float(accel_x),
            "accel_y": float(accel_y),
            "accel_z": float(accel_z),
            "sound_level": np.random.uniform(20, 40),
            "light_level": 0.0
        })
    return data

def test_add_sensor_data(session_id):
    """Test adding sensor data"""
    print("\nGenerating and sending sensor data...")
    sensor_data = generate_mock_sensor_data(120)  # 2 minutes of data
    
    response = requests.post(
        f"{API_URL}/sessions/{session_id}/data",
        json=sensor_data
    )
    print(f"✓ Added {response.json()['count']} data points")
    return True

def test_stop_session(session_id):
    """Test stopping session"""
    print("\nStopping session...")
    response = requests.post(f"{API_URL}/sessions/{session_id}/stop")
    print(f"✓ Session stopped at: {response.json()['end_time']}")
    return True

def test_analyze_session(session_id):
    """Test session analysis"""
    print("\nAnalyzing sleep session...")
    response = requests.post(f"{API_URL}/analyze/{session_id}")
    analysis = response.json()
    
    print(f"\n{'='*50}")
    print("SLEEP ANALYSIS RESULTS")
    print(f"{'='*50}")
    print(f"Sleep Score: {analysis['sleep_score']}/100")
    print(f"Total Sleep Time: {analysis['total_sleep_time']} hours")
    print(f"Sleep Efficiency: {analysis['sleep_efficiency']}%")
    print(f"\nSleep Phases Detected: {len(analysis['phases'])}")
    
    # Count phases
    phases = analysis['phases']
    phase_counts = {'awake': 0, 'light': 0, 'deep': 0, 'rem': 0}
    for phase in phases:
        phase_counts[phase['phase']] += 1
    
    print("\nPhase Distribution:")
    for phase, count in phase_counts.items():
        percentage = (count / len(phases) * 100) if phases else 0
        print(f"  {phase.upper()}: {count} ({percentage:.1f}%)")
    
    print("\nRecommendations:")
    for i, rec in enumerate(analysis['recommendations'], 1):
        print(f"  {i}. {rec}")
    print(f"{'='*50}\n")
    
    return analysis

def test_get_history():
    """Test getting user history"""
    print("\nFetching user history...")
    response = requests.get(f"{API_URL}/user/test_user/history")
    history = response.json()
    print(f"✓ Found {len(history['sessions'])} sessions")
    return True

def run_full_test():
    """Run complete API test suite"""
    print("="*50)
    print("SMART SLEEP TRACKER API TEST SUITE")
    print("="*50)
    
    try:
        # Test 1: Health check
        if not test_health():
            print("❌ Health check failed!")
            return
        
        # Test 2: Start session
        session_id = test_start_session()
        
        # Test 3: Add sensor data
        test_add_sensor_data(session_id)
        
        # Test 4: Stop session
        test_stop_session(session_id)
        
        # Test 5: Analyze session
        test_analyze_session(session_id)
        
        # Test 6: Get history
        test_get_history()
        
        print("\n✓ ALL TESTS PASSED!")
        print("="*50)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to API")
        print("Make sure the backend is running at http://localhost:8000")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")

if __name__ == "__main__":
    run_full_test()
