"""
Train LSTM model with real/generated sleep dataset
"""

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import json
import os
from datetime import datetime

class SleepLSTMTrainer:
    def __init__(self, data_path='data/sleep_dataset_optimized.csv'):
        self.data_path = data_path
        self.window_size = 60  # 60 timesteps (6 seconds at 10 Hz)
        self.n_features = 4    # x, y, z, magnitude
        self.n_classes = 4     # awake, light, deep, rem
        self.model = None
        self.scaler = StandardScaler()
        
    def load_and_preprocess_data(self):
        """Load CSV and create sliding windows"""
        print("\n📂 Loading dataset...")
        df = pd.read_csv(self.data_path)
        print(f"   Total samples: {len(df):,}")
        print(f"   Columns: {list(df.columns)}")
        
        # Group by session to maintain temporal continuity
        sessions = df.groupby('session_id')
        
        X_windows = []
        y_labels = []
        
        print("\n🔄 Creating sliding windows...")
        for session_id, session_data in sessions:
            # Extract features
            features = session_data[['x', 'y', 'z', 'magnitude']].values
            labels = session_data['stage_label'].values
            
            # Create sliding windows
            for i in range(len(features) - self.window_size):
                window = features[i:i + self.window_size]
                # Label is the most common stage in the window
                window_labels = labels[i:i + self.window_size]
                label = np.bincount(window_labels).argmax()
                
                X_windows.append(window)
                y_labels.append(label)
        
        X = np.array(X_windows)
        y = np.array(y_labels)
        
        print(f"   Created {len(X):,} windows")
        print(f"   Shape: {X.shape}")
        
        # Normalize features
        print("\n⚖️  Normalizing features...")
        X_reshaped = X.reshape(-1, self.n_features)
        X_normalized = self.scaler.fit_transform(X_reshaped)
        X = X_normalized.reshape(-1, self.window_size, self.n_features)
        
        # Split data
        print("\n✂️  Splitting dataset...")
        X_train, X_temp, y_train, y_temp = train_test_split(
            X, y, test_size=0.3, random_state=42, stratify=y
        )
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
        )
        
        print(f"   Train: {len(X_train):,} samples")
        print(f"   Val:   {len(X_val):,} samples")
        print(f"   Test:  {len(X_test):,} samples")
        
        # Convert labels to categorical
        y_train = keras.utils.to_categorical(y_train, self.n_classes)
        y_val = keras.utils.to_categorical(y_val, self.n_classes)
        y_test = keras.utils.to_categorical(y_test, self.n_classes)
        
        return (X_train, y_train), (X_val, y_val), (X_test, y_test)
    
    def build_model(self):
        """Build LSTM model architecture"""
        print("\n🏗️  Building LSTM model...")
        
        model = keras.Sequential([
            # First LSTM layer
            layers.LSTM(128, return_sequences=True, 
                       input_shape=(self.window_size, self.n_features)),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            # Second LSTM layer
            layers.LSTM(64, return_sequences=True),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            # Third LSTM layer
            layers.LSTM(32, return_sequences=False),
            layers.BatchNormalization(),
            layers.Dropout(0.3),
            
            # Dense layers
            layers.Dense(64, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(32, activation='relu'),
            layers.Dropout(0.2),
            
            # Output layer
            layers.Dense(self.n_classes, activation='softmax')
        ])
        
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        print(model.summary())
        self.model = model
        return model
    
    def train(self, train_data, val_data, epochs=50, batch_size=64):
        """Train the model"""
        X_train, y_train = train_data
        X_val, y_val = val_data
        
        print("\n🚀 Starting training...")
        print(f"   Epochs: {epochs}")
        print(f"   Batch size: {batch_size}")
        
        # Callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True,
                verbose=1
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-6,
                verbose=1
            ),
            keras.callbacks.ModelCheckpoint(
                'models/best_model.h5',
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1
            )
        ]
        
        # Train
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        return history
    
    def evaluate(self, test_data):
        """Evaluate model on test set"""
        X_test, y_test = test_data
        
        print("\n📊 Evaluating model...")
        test_loss, test_acc = self.model.evaluate(X_test, y_test, verbose=0)
        
        print(f"   Test Loss: {test_loss:.4f}")
        print(f"   Test Accuracy: {test_acc:.4f} ({test_acc*100:.2f}%)")
        
        # Predictions
        y_pred = self.model.predict(X_test, verbose=0)
        y_pred_classes = np.argmax(y_pred, axis=1)
        y_true_classes = np.argmax(y_test, axis=1)
        
        # Per-class accuracy
        print("\n📈 Per-class accuracy:")
        stage_names = ['Awake', 'Light', 'Deep', 'REM']
        for i, stage in enumerate(stage_names):
            mask = y_true_classes == i
            if mask.sum() > 0:
                acc = (y_pred_classes[mask] == i).mean()
                print(f"   {stage}: {acc:.4f} ({acc*100:.2f}%)")
        
        return test_loss, test_acc, y_pred, y_true_classes
    
    def save_model(self, model_dir='models'):
        """Save model and scaler"""
        os.makedirs(model_dir, exist_ok=True)
        
        # Save Keras model
        model_path = os.path.join(model_dir, 'lstm_sleep_model.h5')
        self.model.save(model_path)
        print(f"\n💾 Model saved to: {model_path}")
        
        # Save scaler
        import pickle
        scaler_path = os.path.join(model_dir, 'scaler.pkl')
        with open(scaler_path, 'wb') as f:
            pickle.dump(self.scaler, f)
        print(f"💾 Scaler saved to: {scaler_path}")
        
        # Save metadata
        metadata = {
            'window_size': self.window_size,
            'n_features': self.n_features,
            'n_classes': self.n_classes,
            'trained_date': datetime.now().isoformat(),
            'stage_mapping': {
                0: 'awake',
                1: 'light',
                2: 'deep',
                3: 'rem'
            }
        }
        
        metadata_path = os.path.join(model_dir, 'model_metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        print(f"💾 Metadata saved to: {metadata_path}")
    
    def plot_training_history(self, history):
        """Plot training curves"""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
        
        # Accuracy
        ax1.plot(history.history['accuracy'], label='Train')
        ax1.plot(history.history['val_accuracy'], label='Validation')
        ax1.set_title('Model Accuracy')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Accuracy')
        ax1.legend()
        ax1.grid(True, alpha=0.3)
        
        # Loss
        ax2.plot(history.history['loss'], label='Train')
        ax2.plot(history.history['val_loss'], label='Validation')
        ax2.set_title('Model Loss')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Loss')
        ax2.legend()
        ax2.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig('models/training_history.png', dpi=150)
        print(f"\n📈 Training curves saved to: models/training_history.png")
        plt.close()

def main():
    print("=" * 70)
    print("LSTM Sleep Classifier Training with Real Data")
    print("=" * 70)
    
    # Check if dataset exists
    if not os.path.exists('data/sleep_dataset.csv'):
        print("\n❌ Dataset not found!")
        print("   Please run: python generate_dataset.py")
        return
    
    # Initialize trainer
    trainer = SleepLSTMTrainer(data_path='data/sleep_dataset.csv')
    
    # Load and preprocess data
    train_data, val_data, test_data = trainer.load_and_preprocess_data()
    
    # Build model
    trainer.build_model()
    
    # Train
    history = trainer.train(
        train_data, 
        val_data, 
        epochs=50,
        batch_size=64
    )
    
    # Evaluate
    trainer.evaluate(test_data)
    
    # Save model
    trainer.save_model()
    
    # Plot training history
    trainer.plot_training_history(history)
    
    print("\n" + "=" * 70)
    print("✅ Training complete!")
    print("=" * 70)
    print("\nNext steps:")
    print("  1. Check models/lstm_sleep_model.h5")
    print("  2. Run backend: python main.py")
    print("  3. Test API: python test_api.py")

if __name__ == '__main__':
    main()
