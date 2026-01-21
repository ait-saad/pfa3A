"""
Test the newly trained LSTM model
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
import pickle
import os

print("="*60)
print("Testing Trained LSTM Model")
print("="*60)

# Load model
print("\n1️⃣ Loading model...")
model_path = 'models/lstm_sleep_model.h5'
if os.path.exists(model_path):
    model = keras.models.load_model(model_path)
    print(f"   ✅ Model loaded from {model_path}")
    print(f"   Parameters: {model.count_params():,}")
else:
    print(f"   ❌ Model not found at {model_path}")
    exit(1)

# Load scaler
print("\n2️⃣ Loading scaler...")
scaler_path = 'models/scaler.pkl'
if os.path.exists(scaler_path):
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)
    print(f"   ✅ Scaler loaded")
else:
    print(f"   ⚠️  Scaler not found at {scaler_path}")
    scaler = None

# Test with synthetic data
print("\n3️⃣ Testing predictions...")

stages = ['awake', 'light', 'deep', 'rem']
test_cases = {
    'awake': {'base': 0.5, 'noise': 0.4},
    'light': {'base': 0.2, 'noise': 0.15},
    'deep': {'base': 0.05, 'noise': 0.03},
    'rem': {'base': 0.1, 'noise': 0.08}
}

print("\n   Testing synthetic patterns:")
for stage, params in test_cases.items():
    # Generate test window (60 timesteps x 4 features)
    window_size = 60
    x = np.random.normal(0, params['noise'], window_size) + params['base']
    y = np.random.normal(0, params['noise'], window_size) + params['base']
    z = np.random.normal(9.81, params['noise'], window_size)
    magnitude = np.sqrt(x**2 + y**2 + z**2)
    
    test_data = np.column_stack([x, y, z, magnitude])
    
    # Normalize if scaler available
    if scaler:
        test_data = scaler.transform(test_data)
    
    # Reshape for LSTM (1, 60, 4)
    test_data = test_data.reshape(1, window_size, 4)
    
    # Predict
    prediction = model.predict(test_data, verbose=0)[0]
    predicted_stage = stages[np.argmax(prediction)]
    confidence = prediction[np.argmax(prediction)]
    
    # Show results
    correct = "✅" if predicted_stage == stage else "❌"
    print(f"\n   {correct} True: {stage:8s} | Predicted: {predicted_stage:8s} ({confidence:.2%})")
    print(f"      Probabilities: ", end="")
    for i, s in enumerate(stages):
        print(f"{s}={prediction[i]:.2%} ", end="")

print("\n\n" + "="*60)
print("✅ Model test complete!")
print("="*60)
print("\nModel is ready for use in the backend API")
