"""
Simplified LSTM training - works reliably
"""
import numpy as np
import sys
from lstm_model import SleepLSTMModel

print("="*70)
print(" LSTM Training - Simplified Version")
print("="*70)

# Use the built-in data generation from lstm_model
print("\nGenerating training data (5,000 samples)...")
from lstm_model import generate_synthetic_training_data

X_train, y_train = generate_synthetic_training_data(5000)
X_val, y_val = generate_synthetic_training_data(1000)

print("Training data generated successfully!")
print(f"  Training: {len(X_train):,} samples")
print(f"  Validation: {len(X_val):,} samples")

# Build model
print("\nBuilding LSTM model...")
model = SleepLSTMModel(sequence_length=60, n_features=4)
model.build_model()
print("Model built!")

# Train
print("\nTraining model (20 epochs)...")
print("This will take ~5-7 minutes...")
print("-"*70)

try:
    history = model.train(
        X_train, y_train, 
        X_val, y_val, 
        epochs=20,
        batch_size=64
    )
    
    print("\n" + "="*70)
    print("Training completed successfully!")
    
    # Save
    print("\nSaving model...")
    model.save_model('models/lstm_sleep_model')
    print("Model saved!")
    
    # Test
    print("\nTesting prediction...")
    test_data = np.random.normal(0, 0.05, (100, 3))
    predictions = model.predict(test_data)
    print(f"Generated {len(predictions)} predictions")
    print(f"Sample: {predictions[0]['phase']} (confidence: {predictions[0]['confidence']:.2%})")
    
    print("\n" + "="*70)
    print("SUCCESS! Model is ready!")
    print("="*70)
    print("\nRun: python generate_professional_report.py")
    
except Exception as e:
    print(f"\nERROR during training: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
