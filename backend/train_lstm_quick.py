"""
Quick LSTM training script with reduced dataset for fast testing
"""
import numpy as np
from lstm_model import SleepLSTMModel

print("🚀 Starting Quick LSTM Training...")
print("=" * 50)

# Generate smaller training dataset for quick test
print("\n📊 Generating training data...")
print("   • Training: 2,000 samples")
print("   • Validation: 500 samples")

def generate_quick_training_data(n_samples=2000):
    """Generate synthetic training data"""
    np.random.seed(42)
    
    X = []
    y = []
    
    # Generate data for each sleep phase
    for phase in range(4):
        n = n_samples // 4
        
        if phase == 0:  # Awake - high movement
            data = np.random.normal(0, 0.3, (n, 3))
        elif phase == 1:  # Light sleep - moderate movement
            data = np.random.normal(0, 0.1, (n, 3))
        elif phase == 2:  # Deep sleep - minimal movement
            data = np.random.normal(0, 0.03, (n, 3))
        else:  # REM - slight movement
            data = np.random.normal(0, 0.08, (n, 3))
        
        X.append(data)
        y.append(np.full(n, phase))
    
    X = np.vstack(X)
    y = np.concatenate(y)
    
    # Shuffle
    indices = np.random.permutation(len(X))
    X = X[indices]
    y = y[indices]
    
    return X, y

# Generate data
X_train, y_train = generate_quick_training_data(2000)
X_val, y_val = generate_quick_training_data(500)

print("✅ Data generated successfully")

# Build and train model
print("\n🧠 Building LSTM model...")
model = SleepLSTMModel(sequence_length=60, n_features=4)
model.build_model()

print("\n📝 Model Architecture:")
print("   • Input: (60 timesteps, 4 features)")
print("   • LSTM layers: 128 → 64 → 32")
print("   • Dense layers: 64 → 32")
print("   • Output: 4 classes (Awake/Light/Deep/REM)")
print("   • Total parameters: ~300K")

print("\n🏋️ Training model (10 epochs - quick training)...")
print("   This will take about 2-3 minutes...")
print("-" * 50)

history = model.train(
    X_train, y_train, 
    X_val, y_val, 
    epochs=10,  # Reduced from 30 for quick test
    batch_size=64
)

print("\n" + "=" * 50)
print("✅ Training completed successfully!")

# Save model
print("\n💾 Saving model...")
model.save_model('models/lstm_sleep_model')
print("✅ Model saved to: models/lstm_sleep_model.h5")

# Test prediction
print("\n🧪 Testing prediction...")
test_data = np.random.normal(0, 0.05, (100, 3))
predictions = model.predict(test_data)
print(f"✅ Generated {len(predictions)} predictions")
print(f"   Sample prediction: {predictions[0]['phase']} (confidence: {predictions[0]['confidence']:.2%})")

print("\n" + "=" * 50)
print("🎉 LSTM Model Ready!")
print("=" * 50)
print("\n✅ You can now use the model for sleep phase prediction")
print("✅ The backend will automatically load this model")
print("\n💡 To improve accuracy, train with more data:")
print("   python lstm_model.py  (trains with 10,000 samples)")
