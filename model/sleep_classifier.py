import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from scipy.stats import skew, kurtosis
import joblib
from typing import List, Tuple

class SleepPhaseClassifier:
    """
    Machine Learning model for classifying sleep phases based on accelerometer data
    """
    
    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.window_size = 30  # 30-second windows
        
    def extract_features(self, accel_data: np.ndarray) -> np.ndarray:
        """
        Extract features from raw accelerometer data
        
        Features:
        - Mean, std, min, max of magnitude
        - Zero-crossing rate
        - Variance
        - Skewness and kurtosis
        - Spectral features
        """
        features = []
        
        # Calculate magnitude
        magnitude = np.sqrt(np.sum(accel_data**2, axis=1))
        
        # Time-domain features
        mean_mag = np.mean(magnitude)
        std_mag = np.std(magnitude)
        min_mag = np.min(magnitude)
        max_mag = np.max(magnitude)
        variance = np.var(magnitude)
        
        # Zero-crossing rate
        zero_crossings = np.sum(np.diff(np.sign(magnitude - np.mean(magnitude))) != 0)
        zcr = zero_crossings / len(magnitude)
        
        # Statistical features
        skewness = skew(magnitude)
        kurt = kurtosis(magnitude)
        
        # Range
        range_mag = max_mag - min_mag
        
        # Energy
        energy = np.sum(magnitude**2) / len(magnitude)
        
        features = [
            mean_mag, std_mag, min_mag, max_mag,
            variance, zcr, skewness, kurt,
            range_mag, energy
        ]
        
        return np.array(features)
    
    def prepare_windows(self, accel_data: np.ndarray) -> np.ndarray:
        """
        Split accelerometer data into windows and extract features
        """
        n_samples = len(accel_data)
        n_windows = n_samples // self.window_size
        
        features_list = []
        
        for i in range(n_windows):
            start_idx = i * self.window_size
            end_idx = start_idx + self.window_size
            window_data = accel_data[start_idx:end_idx]
            
            features = self.extract_features(window_data)
            features_list.append(features)
        
        return np.array(features_list)
    
    def train(self, X_train: np.ndarray, y_train: np.ndarray):
        """
        Train the classifier
        
        Args:
            X_train: Accelerometer data (n_samples, 3) - x, y, z axes
            y_train: Sleep phase labels (0=awake, 1=light, 2=deep, 3=rem)
        """
        # Prepare features
        X_features = self.prepare_windows(X_train)
        
        # Adjust labels to match window count
        y_windowed = []
        for i in range(len(X_features)):
            start_idx = i * self.window_size
            end_idx = start_idx + self.window_size
            # Use most common label in window
            window_labels = y_train[start_idx:end_idx]
            most_common = np.bincount(window_labels).argmax()
            y_windowed.append(most_common)
        
        y_windowed = np.array(y_windowed)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X_features)
        
        # Train model
        self.model.fit(X_scaled, y_windowed)
        
        print(f"Model trained with {len(X_features)} samples")
        print(f"Feature importance: {self.model.feature_importances_}")
    
    def predict(self, accel_data: np.ndarray) -> np.ndarray:
        """
        Predict sleep phases for accelerometer data
        
        Returns:
            Array of predicted phases (0=awake, 1=light, 2=deep, 3=rem)
        """
        # Prepare features
        X_features = self.prepare_windows(accel_data)
        
        # Scale features
        X_scaled = self.scaler.transform(X_features)
        
        # Predict
        predictions = self.model.predict(X_scaled)
        
        return predictions
    
    def predict_proba(self, accel_data: np.ndarray) -> np.ndarray:
        """
        Predict probability distribution for each sleep phase
        """
        X_features = self.prepare_windows(accel_data)
        X_scaled = self.scaler.transform(X_features)
        
        return self.model.predict_proba(X_scaled)
    
    def save(self, filepath: str):
        """Save the trained model"""
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'window_size': self.window_size
        }, filepath)
        print(f"Model saved to {filepath}")
    
    def load(self, filepath: str):
        """Load a trained model"""
        data = joblib.load(filepath)
        self.model = data['model']
        self.scaler = data['scaler']
        self.window_size = data['window_size']
        print(f"Model loaded from {filepath}")

def generate_realistic_sleep_data(n_hours: int = 8, samples_per_minute: int = 60) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate realistic sleep data mimicking actual sleep cycles
    
    Sleep cycles: ~90 minutes each
    Each cycle: Light -> Deep -> Light -> REM
    More realistic movement patterns and transitions
    """
    X = []
    y = []
    
    samples_per_hour = samples_per_minute * 60
    total_samples = n_hours * samples_per_hour
    
    # Typical sleep cycle is 90 minutes
    cycle_duration_minutes = 90
    samples_per_cycle = cycle_duration_minutes * samples_per_minute
    n_cycles = int((n_hours * 60) / cycle_duration_minutes)
    
    for cycle in range(n_cycles):
        # Start of night: more deep sleep. End of night: more REM
        cycle_progress = cycle / max(n_cycles - 1, 1)
        
        # 1. Transition to sleep (5 min) - Awake to drowsy
        transition_samples = 5 * samples_per_minute
        for i in range(transition_samples):
            # Gradually decreasing movement
            movement_scale = 0.6 - (i / transition_samples) * 0.4
            movement = np.random.normal([0, 0, 1.0], [movement_scale, movement_scale, 0.1])
            X.append(movement)
            y.append(0 if i < transition_samples // 2 else 1)  # Awake -> Light
        
        # 2. Light Sleep (20-30 min)
        light_duration = int((25 - cycle_progress * 10) * samples_per_minute)
        for i in range(light_duration):
            # Occasional small movements
            if np.random.random() < 0.1:  # 10% chance of movement
                movement = np.random.normal([0, 0, 1.0], [0.3, 0.3, 0.1])
            else:
                movement = np.random.normal([0, 0, 1.0], [0.15, 0.15, 0.05])
            X.append(movement)
            y.append(1)
        
        # 3. Deep Sleep (15-25 min) - More at start of night
        deep_duration = int((20 + (1 - cycle_progress) * 10) * samples_per_minute)
        for i in range(deep_duration):
            # Very minimal movement
            movement = np.random.normal([0, 0, 1.0], [0.05, 0.05, 0.02])
            X.append(movement)
            y.append(2)
        
        # 4. Light Sleep again (15 min)
        light_duration2 = 15 * samples_per_minute
        for i in range(light_duration2):
            movement = np.random.normal([0, 0, 1.0], [0.18, 0.18, 0.06])
            X.append(movement)
            y.append(1)
        
        # 5. REM Sleep (10-25 min) - More at end of night
        rem_duration = int((15 + cycle_progress * 15) * samples_per_minute)
        for i in range(rem_duration):
            # Moderate movement, occasional twitches
            if np.random.random() < 0.15:  # 15% chance of REM twitch
                movement = np.random.normal([0, 0, 1.0], [0.25, 0.25, 0.08])
            else:
                movement = np.random.normal([0, 0, 1.0], [0.12, 0.12, 0.05])
            X.append(movement)
            y.append(3)
        
        # 6. Brief awakening (1-2 min) - 20% chance
        if np.random.random() < 0.2 and cycle < n_cycles - 1:
            wake_duration = np.random.randint(1, 3) * samples_per_minute
            for i in range(wake_duration):
                movement = np.random.normal([0, 0, 1.0], [0.5, 0.5, 0.15])
                X.append(movement)
                y.append(0)
    
    # Trim to exact length
    X = np.array(X[:total_samples])
    y = np.array(y[:total_samples])
    
    return X, y

if __name__ == "__main__":
    # Generate realistic sleep data
    print("Generating realistic sleep training data...")
    print("Simulating 8 hours of sleep with natural sleep cycles...")
    X, y = generate_realistic_sleep_data(n_hours=8, samples_per_minute=60)
    
    print(f"\nGenerated {len(X)} samples ({len(X)/3600:.1f} hours)")
    print("\nSleep phase distribution:")
    for phase_id, phase_name in enumerate(['Awake', 'Light', 'Deep', 'REM']):
        count = np.sum(y == phase_id)
        percentage = (count / len(y)) * 100
        print(f"  {phase_name}: {count} samples ({percentage:.1f}%)")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Train model
    print("\nTraining sleep phase classifier...")
    classifier = SleepPhaseClassifier()
    classifier.train(X_train, y_train)
    
    # Test model
    print("\nEvaluating model...")
    predictions = classifier.predict(X_test)
    
    # Adjust test labels to match prediction length (due to windowing)
    y_test_adjusted = []
    for i in range(len(predictions)):
        start_idx = i * classifier.window_size
        end_idx = start_idx + classifier.window_size
        window_labels = y_test[start_idx:end_idx]
        if len(window_labels) > 0:
            most_common = np.bincount(window_labels).argmax()
            y_test_adjusted.append(most_common)
    y_test_adjusted = np.array(y_test_adjusted)
    
    accuracy = np.mean(predictions == y_test_adjusted)
    print(f"Test accuracy: {accuracy:.2%}")
    
    # Per-class accuracy
    print("\nPer-phase accuracy:")
    for phase_id, phase_name in enumerate(['Awake', 'Light', 'Deep', 'REM']):
        mask = y_test_adjusted == phase_id
        if np.sum(mask) > 0:
            phase_acc = np.mean(predictions[mask] == y_test_adjusted[mask])
            print(f"  {phase_name}: {phase_acc:.2%}")
    
    # Save model
    import os
    os.makedirs("../data", exist_ok=True)
    model_path = "../data/sleep_classifier_model.pkl"
    classifier.save(model_path)
    print(f"\n✓ Model saved successfully!")
