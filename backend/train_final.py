"""
Train LSTM with the small dataset we generated
"""

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle
import json
import os
from datetime import datetime

print("="*70)
print("LSTM Training with Generated Dataset")
print("="*70)

# 1. Load data
print("\n📂 Loading dataset...")
df = pd.read_csv('data/sleep_dataset_small.csv')
print(f"   Samples: {len(df):,}")
print(f"   Sessions: {df['session_id'].nunique()}")

# 2. Create sliding windows
print("\n🪟 Creating sliding windows...")
window_size = 60
step_size = 30  # Overlap for more training data

X_windows = []
y_labels = []

for session_id in df['session_id'].unique():
    session = df[df['session_id'] == session_id]
    features = session[['x', 'y', 'z', 'magnitude']].values
    labels = session['stage_label'].values
    
    for i in range(0, len(features) - window_size, step_size):
        window = features[i:i + window_size]
        # Label is most common stage in window
        label = np.bincount(labels[i:i + window_size]).argmax()
        X_windows.append(window)
        y_labels.append(label)

X = np.array(X_windows)
y = np.array(y_labels)
print(f"   Windows created: {len(X):,}")
print(f"   Shape: {X.shape}")

# 3. Normalize
print("\n⚖️  Normalizing...")
scaler = StandardScaler()
X_flat = X.reshape(-1, 4)
X_norm = scaler.fit_transform(X_flat)
X = X_norm.reshape(-1, window_size, 4)

# 4. Split
print("\n✂️  Splitting...")
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y
)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
)

y_train_cat = keras.utils.to_categorical(y_train, 4)
y_val_cat = keras.utils.to_categorical(y_val, 4)
y_test_cat = keras.utils.to_categorical(y_test, 4)

print(f"   Train: {len(X_train):,}")
print(f"   Val:   {len(X_val):,}")
print(f"   Test:  {len(X_test):,}")

# Check distribution
print("\n📊 Class distribution:")
stages = ['Awake', 'Light', 'Deep', 'REM']
for i, stage in enumerate(stages):
    count = (y_train == i).sum()
    pct = count / len(y_train) * 100
    print(f"   {stage:8s}: {pct:5.1f}%")

# 5. Build model
print("\n🏗️  Building model...")
model = keras.Sequential([
    keras.layers.LSTM(128, return_sequences=True, input_shape=(60, 4)),
    keras.layers.BatchNormalization(),
    keras.layers.Dropout(0.3),
    
    keras.layers.LSTM(64, return_sequences=True),
    keras.layers.BatchNormalization(),
    keras.layers.Dropout(0.3),
    
    keras.layers.LSTM(32),
    keras.layers.BatchNormalization(),
    keras.layers.Dropout(0.3),
    
    keras.layers.Dense(64, activation='relu'),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(4, activation='softmax')
])

model.compile(
    optimizer=keras.optimizers.Adam(0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print(f"   Parameters: {model.count_params():,}")

# 6. Train
print("\n🚀 Training...")
print("   Epochs: 40, Batch: 128\n")

history = model.fit(
    X_train, y_train_cat,
    validation_data=(X_val, y_val_cat),
    epochs=40,
    batch_size=128,
    callbacks=[
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=7,
            restore_best_weights=True,
            verbose=1
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            verbose=1
        )
    ],
    verbose=2  # Less verbose output
)

# 7. Evaluate
print("\n📊 Evaluating...")
test_loss, test_acc = model.evaluate(X_test, y_test_cat, verbose=0)
print(f"\n   Overall Test Accuracy: {test_acc:.4f} ({test_acc*100:.2f}%)")

y_pred = model.predict(X_test, verbose=0)
y_pred_classes = np.argmax(y_pred, axis=1)

print("\n   Per-Class Accuracy:")
for i, stage in enumerate(stages):
    mask = y_test == i
    if mask.sum() > 0:
        acc = (y_pred_classes[mask] == i).mean()
        count = mask.sum()
        print(f"   {stage:8s}: {acc:.4f} ({acc*100:.2f}%) - {count:,} samples")

# 8. Save
print("\n💾 Saving model...")
os.makedirs('models', exist_ok=True)

model.save('models/lstm_sleep_model.h5')
print("   ✅ models/lstm_sleep_model.h5")

with open('models/scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)
print("   ✅ models/scaler.pkl")

metadata = {
    'window_size': 60,
    'n_features': 4,
    'n_classes': 4,
    'test_accuracy': float(test_acc),
    'trained_date': datetime.now().isoformat(),
    'dataset': 'sleep_dataset_small.csv',
    'stage_mapping': {0: 'awake', 1: 'light', 2: 'deep', 3: 'rem'}
}

with open('models/model_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)
print("   ✅ models/model_metadata.json")

print("\n" + "="*70)
print(f"✅ TRAINING COMPLETE! Accuracy: {test_acc*100:.2f}%")
print("="*70)
