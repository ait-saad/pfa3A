import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.preprocessing import StandardScaler
import joblib
from typing import List, Tuple
import os

class SleepLSTMModel:
    """
    LSTM-based sleep phase classification model.
    Uses sequential accelerometer data to predict sleep phases.
    """
    
    def __init__(self, sequence_length=60, n_features=4):
        """
        Initialize LSTM model.
        
        Args:
            sequence_length: Number of timesteps to look back (default 60 = 1 minute at 1Hz)
            n_features: Number of input features (x, y, z, magnitude)
        """
        self.sequence_length = sequence_length
        self.n_features = n_features
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        
        # Sleep phase mapping
        self.phase_map = {
            0: 'awake',
            1: 'light',
            2: 'deep',
            3: 'rem'
        }
        
    def build_model(self):
        """Build LSTM architecture."""
        model = keras.Sequential([
            # First LSTM layer with return sequences
            layers.LSTM(128, return_sequences=True, 
                       input_shape=(self.sequence_length, self.n_features)),
            layers.Dropout(0.3),
            layers.BatchNormalization(),
            
            # Second LSTM layer
            layers.LSTM(64, return_sequences=True),
            layers.Dropout(0.3),
            layers.BatchNormalization(),
            
            # Third LSTM layer
            layers.LSTM(32, return_sequences=False),
            layers.Dropout(0.2),
            
            # Dense layers
            layers.Dense(64, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(32, activation='relu'),
            
            # Output layer (4 classes: awake, light, deep, REM)
            layers.Dense(4, activation='softmax')
        ])
        
        # Compile model
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy', 
                    keras.metrics.Precision(name='precision'),
                    keras.metrics.Recall(name='recall')]
        )
        
        self.model = model
        return model
    
    def prepare_features(self, accel_data: np.ndarray) -> np.ndarray:
        """
        Prepare features from raw accelerometer data.
        
        Args:
            accel_data: Array of shape (n_samples, 3) containing x, y, z
            
        Returns:
            Feature array with magnitude added
        """
        # Calculate magnitude
        magnitude = np.sqrt(np.sum(accel_data**2, axis=1, keepdims=True))
        
        # Combine with original data
        features = np.concatenate([accel_data, magnitude], axis=1)
        
        return features
    
    def create_sequences(self, data: np.ndarray, labels: np.ndarray = None) -> Tuple:
        """
        Create sequences for LSTM input.
        
        Args:
            data: Feature array of shape (n_samples, n_features)
            labels: Optional label array
            
        Returns:
            Tuple of (sequences, labels) or just sequences if no labels
        """
        sequences = []
        sequence_labels = []
        
        for i in range(len(data) - self.sequence_length):
            seq = data[i:i + self.sequence_length]
            sequences.append(seq)
            
            if labels is not None:
                # Use the label at the end of the sequence
                sequence_labels.append(labels[i + self.sequence_length])
        
        sequences = np.array(sequences)
        
        if labels is not None:
            sequence_labels = np.array(sequence_labels)
            return sequences, sequence_labels
        
        return sequences
    
    def train(self, X_train: np.ndarray, y_train: np.ndarray,
              X_val: np.ndarray = None, y_val: np.ndarray = None,
              epochs: int = 50, batch_size: int = 32):
        """
        Train the LSTM model.
        
        Args:
            X_train: Training accelerometer data (n_samples, 3)
            y_train: Training labels (n_samples,)
            X_val: Optional validation data
            y_val: Optional validation labels
            epochs: Number of training epochs
            batch_size: Batch size for training
        """
        # Build model if not already built
        if self.model is None:
            self.build_model()
        
        # Prepare features
        X_train_features = self.prepare_features(X_train)
        
        # Normalize features
        X_train_scaled = self.scaler.fit_transform(
            X_train_features.reshape(-1, self.n_features)
        ).reshape(-1, self.n_features)
        
        # Create sequences
        X_train_seq, y_train_seq = self.create_sequences(X_train_scaled, y_train)
        
        # Convert labels to categorical
        y_train_cat = keras.utils.to_categorical(y_train_seq, num_classes=4)
        
        # Prepare validation data if provided
        validation_data = None
        if X_val is not None and y_val is not None:
            X_val_features = self.prepare_features(X_val)
            X_val_scaled = self.scaler.transform(
                X_val_features.reshape(-1, self.n_features)
            ).reshape(-1, self.n_features)
            X_val_seq, y_val_seq = self.create_sequences(X_val_scaled, y_val)
            y_val_cat = keras.utils.to_categorical(y_val_seq, num_classes=4)
            validation_data = (X_val_seq, y_val_cat)
        
        # Callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss' if validation_data else 'loss',
                patience=10,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss' if validation_data else 'loss',
                factor=0.5,
                patience=5,
                min_lr=1e-6
            )
        ]
        
        # Train model
        history = self.model.fit(
            X_train_seq, y_train_cat,
            validation_data=validation_data,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        self.is_trained = True
        return history
    
    def predict(self, accel_data: np.ndarray) -> List[dict]:
        """
        Predict sleep phases for new data.
        
        Args:
            accel_data: Accelerometer data array (n_samples, 3)
            
        Returns:
            List of predictions with timestamps and probabilities
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")
        
        # Prepare features
        features = self.prepare_features(accel_data)
        
        # Normalize
        features_scaled = self.scaler.transform(
            features.reshape(-1, self.n_features)
        ).reshape(-1, self.n_features)
        
        # Create sequences
        sequences = self.create_sequences(features_scaled)
        
        # Predict
        predictions = self.model.predict(sequences, verbose=0)
        
        # Format results
        results = []
        for i, pred in enumerate(predictions):
            phase_idx = np.argmax(pred)
            results.append({
                'timestamp_index': i + self.sequence_length,
                'phase': self.phase_map[phase_idx],
                'confidence': float(pred[phase_idx]),
                'probabilities': {
                    'awake': float(pred[0]),
                    'light': float(pred[1]),
                    'deep': float(pred[2]),
                    'rem': float(pred[3])
                }
            })
        
        return results
    
    def predict_realtime(self, recent_data: np.ndarray) -> dict:
        """
        Predict current sleep phase from recent data (for real-time tracking).
        
        Args:
            recent_data: Recent accelerometer data (sequence_length, 3)
            
        Returns:
            Current phase prediction
        """
        if recent_data.shape[0] < self.sequence_length:
            raise ValueError(f"Need at least {self.sequence_length} samples for prediction")
        
        # Use only the most recent sequence
        recent_sequence = recent_data[-self.sequence_length:]
        
        # Prepare and predict
        features = self.prepare_features(recent_sequence)
        features_scaled = self.scaler.transform(features)
        
        # Reshape for model input
        sequence = features_scaled.reshape(1, self.sequence_length, self.n_features)
        
        # Predict
        prediction = self.model.predict(sequence, verbose=0)[0]
        phase_idx = np.argmax(prediction)
        
        return {
            'phase': self.phase_map[phase_idx],
            'confidence': float(prediction[phase_idx]),
            'probabilities': {
                'awake': float(prediction[0]),
                'light': float(prediction[1]),
                'deep': float(prediction[2]),
                'rem': float(prediction[3])
            }
        }
    
    def save_model(self, model_path: str = 'models/lstm_sleep_model'):
        """Save model and scaler."""
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        self.model.save(f'{model_path}.h5')
        joblib.dump(self.scaler, f'{model_path}_scaler.pkl')
        print(f"Model saved to {model_path}")
    
    def load_model(self, model_path: str = 'models/lstm_sleep_model'):
        """Load model and scaler."""
        self.model = keras.models.load_model(f'{model_path}.h5')
        self.scaler = joblib.load(f'{model_path}_scaler.pkl')
        self.is_trained = True
        print(f"Model loaded from {model_path}")


def generate_synthetic_training_data(n_samples=10000):
    """
    Generate synthetic training data for demonstration.
    Replace with real PSG-labeled data for production.
    """
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


if __name__ == "__main__":
    # Train a model with synthetic data
    print("Generating synthetic training data...")
    X_train, y_train = generate_synthetic_training_data(10000)
    X_val, y_val = generate_synthetic_training_data(2000)
    
    print("\nBuilding and training LSTM model...")
    model = SleepLSTMModel(sequence_length=60, n_features=4)
    model.build_model()
    
    print(model.model.summary())
    
    print("\nTraining model...")
    history = model.train(X_train, y_train, X_val, y_val, epochs=30, batch_size=64)
    
    print("\nSaving model...")
    model.save_model('models/lstm_sleep_model')
    
    print("\nModel training complete!")
