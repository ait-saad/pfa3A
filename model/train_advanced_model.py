import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib

class LSTMSleepClassifier:
    """
    Advanced LSTM-based sleep phase classifier
    Better for sequential time-series data
    """
    
    def __init__(self, sequence_length=60):
        self.sequence_length = sequence_length
        self.scaler = StandardScaler()
        self.model = None
        
    def build_model(self, input_shape, num_classes=4):
        """Build LSTM model architecture"""
        model = keras.Sequential([
            layers.Input(shape=input_shape),
            
            # First LSTM layer with dropout
            layers.LSTM(128, return_sequences=True),
            layers.Dropout(0.3),
            
            # Second LSTM layer
            layers.LSTM(64, return_sequences=True),
            layers.Dropout(0.3),
            
            # Third LSTM layer
            layers.LSTM(32),
            layers.Dropout(0.2),
            
            # Dense layers
            layers.Dense(64, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(32, activation='relu'),
            
            # Output layer
            layers.Dense(num_classes, activation='softmax')
        ])
        
        model.compile(
            optimizer='adam',
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def prepare_sequences(self, X, y):
        """
        Prepare sequential data for LSTM
        
        Args:
            X: Raw accelerometer data (n_samples, 3)
            y: Labels (n_samples,)
            
        Returns:
            X_seq: Sequences (n_sequences, sequence_length, 3)
            y_seq: Labels for sequences (n_sequences,)
        """
        X_seq = []
        y_seq = []
        
        for i in range(len(X) - self.sequence_length):
            X_seq.append(X[i:i+self.sequence_length])
            # Use most common label in sequence
            window_labels = y[i:i+self.sequence_length]
            most_common = np.bincount(window_labels).argmax()
            y_seq.append(most_common)
        
        return np.array(X_seq), np.array(y_seq)
    
    def train(self, X_train, y_train, epochs=50, batch_size=32, validation_split=0.2):
        """Train the LSTM model"""
        
        # Scale the data
        n_samples = X_train.shape[0]
        X_flat = X_train.reshape(-1, X_train.shape[-1])
        X_scaled = self.scaler.fit_transform(X_flat)
        X_scaled = X_scaled.reshape(n_samples, -1, X_train.shape[-1])
        
        # Prepare sequences
        X_seq, y_seq = self.prepare_sequences(X_scaled.reshape(-1, 3), y_train)
        
        print(f"Training data shape: {X_seq.shape}")
        print(f"Labels shape: {y_seq.shape}")
        
        # Build model
        self.model = self.build_model(
            input_shape=(self.sequence_length, 3),
            num_classes=len(np.unique(y_seq))
        )
        
        # Callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5
            )
        ]
        
        # Train
        history = self.model.fit(
            X_seq, y_seq,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            callbacks=callbacks,
            verbose=1
        )
        
        return history
    
    def predict(self, X):
        """Predict sleep phases"""
        # Scale
        n_samples = X.shape[0]
        X_flat = X.reshape(-1, X.shape[-1])
        X_scaled = self.scaler.transform(X_flat)
        X_scaled = X_scaled.reshape(n_samples, -1, X.shape[-1])
        
        # Prepare sequences
        X_seq = []
        for i in range(len(X_scaled) - self.sequence_length):
            X_seq.append(X_scaled[i:i+self.sequence_length])
        X_seq = np.array(X_seq)
        
        # Predict
        predictions = self.model.predict(X_seq)
        return np.argmax(predictions, axis=1)
    
    def save(self, filepath):
        """Save model and scaler"""
        self.model.save(f"{filepath}_model.keras")
        joblib.dump({
            'scaler': self.scaler,
            'sequence_length': self.sequence_length
        }, f"{filepath}_scaler.pkl")
        print(f"Model saved to {filepath}")
    
    def load(self, filepath):
        """Load model and scaler"""
        self.model = keras.models.load_model(f"{filepath}_model.keras")
        data = joblib.load(f"{filepath}_scaler.pkl")
        self.scaler = data['scaler']
        self.sequence_length = data['sequence_length']
        print(f"Model loaded from {filepath}")


def generate_realistic_sleep_data(n_hours=8, samples_per_hour=3600):
    """
    Generate more realistic synthetic sleep data with proper sleep cycles
    """
    total_samples = n_hours * samples_per_hour
    X = []
    y = []
    
    # Sleep cycle: typically 90 minutes
    cycle_duration = int(1.5 * samples_per_hour)  # 90 minutes
    n_cycles = int(n_hours * samples_per_hour / cycle_duration)
    
    current_sample = 0
    
    for cycle in range(n_cycles):
        # Each cycle: Light -> Deep -> Light -> REM
        
        # Light sleep (30 min)
        light_duration = int(0.5 * samples_per_hour)
        for i in range(light_duration):
            movement = np.random.normal(0.2, 0.08, 3)
            X.append(movement)
            y.append(1)  # Light sleep
            current_sample += 1
        
        # Deep sleep (20 min)
        deep_duration = int(0.33 * samples_per_hour)
        for i in range(deep_duration):
            movement = np.random.normal(0.05, 0.02, 3)
            X.append(movement)
            y.append(2)  # Deep sleep
            current_sample += 1
        
        # Light sleep again (20 min)
        for i in range(int(0.33 * samples_per_hour)):
            movement = np.random.normal(0.18, 0.07, 3)
            X.append(movement)
            y.append(1)  # Light sleep
            current_sample += 1
        
        # REM sleep (20 min)
        rem_duration = int(0.33 * samples_per_hour)
        for i in range(rem_duration):
            movement = np.random.normal(0.15, 0.06, 3)
            X.append(movement)
            y.append(3)  # REM sleep
            current_sample += 1
        
        # Occasional brief awakening (1 min)
        if np.random.random() < 0.3:  # 30% chance
            wake_duration = int(0.017 * samples_per_hour)
            for i in range(wake_duration):
                movement = np.random.normal(0.6, 0.2, 3)
                X.append(movement)
                y.append(0)  # Awake
                current_sample += 1
    
    X = np.array(X[:total_samples])
    y = np.array(y[:total_samples])
    
    return X, y


if __name__ == "__main__":
    print("Generating realistic sleep data...")
    X, y = generate_realistic_sleep_data(n_hours=8)
    
    print(f"Generated {len(X)} samples")
    print(f"Phase distribution:")
    for phase in range(4):
        count = np.sum(y == phase)
        print(f"  Phase {phase}: {count} ({count/len(y)*100:.1f}%)")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print("\nTraining LSTM model...")
    classifier = LSTMSleepClassifier(sequence_length=60)
    history = classifier.train(X_train, y_train, epochs=30, batch_size=64)
    
    # Evaluate
    print("\nEvaluating model...")
    predictions = classifier.predict(X_test)
    
    # Calculate accuracy for overlapping sequences
    y_test_adjusted = y_test[classifier.sequence_length:]
    min_len = min(len(predictions), len(y_test_adjusted))
    accuracy = np.mean(predictions[:min_len] == y_test_adjusted[:min_len])
    print(f"Test accuracy: {accuracy:.2%}")
    
    # Save model
    classifier.save("model/lstm_sleep_classifier")
    print("\nModel training complete!")
