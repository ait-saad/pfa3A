"""
Generate SMALL sleep dataset for fast training (~20-30MB)
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os

def generate_movement(stage, samples, sampling_rate=10):
    """Generate movement pattern for a sleep stage"""
    params = {
        'awake': {'base': 0.5, 'noise': 0.4},
        'light': {'base': 0.2, 'noise': 0.15},
        'deep':  {'base': 0.05, 'noise': 0.03},
        'rem':   {'base': 0.1, 'noise': 0.08}
    }[stage]
    
    t = np.linspace(0, samples/sampling_rate, samples)
    x = np.random.normal(0, params['noise'], samples) + params['base'] * np.sin(2*np.pi*t/60)
    y = np.random.normal(0, params['noise'], samples) + params['base'] * np.cos(2*np.pi*t/60)
    z = np.random.normal(9.81, params['noise'], samples)
    
    return x, y, z, np.sqrt(x**2 + y**2 + z**2)

def generate_night(night_id, sampling_rate=10):
    """Generate one night (~3 hours for speed)"""
    # Simplified sleep cycle
    timeline = [
        ('awake', 5), ('light', 15), ('deep', 20),
        ('light', 10), ('rem', 15), ('light', 15),
        ('deep', 15), ('light', 10), ('rem', 20),
        ('light', 10), ('awake', 5)
    ]
    
    all_data = []
    
    for stage, duration_min in timeline:
        samples = duration_min * 60 * sampling_rate
        x, y, z, mag = generate_movement(stage, samples, sampling_rate)
        
        for i in range(samples):
            all_data.append([
                f'session_{night_id}',
                x[i], y[i], z[i], mag[i],
                stage,
                {'awake': 0, 'light': 1, 'deep': 2, 'rem': 3}[stage]
            ])
    
    return all_data

print("Generating small dataset for fast training...")
print("Target: 20 nights = ~30MB\n")

all_nights = []
for i in range(20):
    print(f"Night {i+1}/20", end='\r')
    all_nights.extend(generate_night(i))

df = pd.DataFrame(all_nights, columns=[
    'session_id', 'x', 'y', 'z', 'magnitude', 'stage', 'stage_label'
])

os.makedirs('data', exist_ok=True)
output = 'data/sleep_dataset_small.csv'
df.to_csv(output, index=False)

print(f"\n✅ Dataset created: {output}")
print(f"   Samples: {len(df):,}")
print(f"   Size: {os.path.getsize(output)/1024/1024:.1f} MB")
print("\nStage distribution:")
for s in ['awake', 'light', 'deep', 'rem']:
    pct = (df['stage']==s).sum()/len(df)*100
    print(f"   {s.capitalize():8s}: {pct:5.1f}%")
