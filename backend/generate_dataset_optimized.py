"""
Generate optimized sleep dataset - smaller but still realistic
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os

class OptimizedSleepDataGenerator:
    def __init__(self, sampling_rate=10):
        self.sampling_rate = sampling_rate
        self.sleep_stages = {'awake': 0, 'light': 1, 'deep': 2, 'rem': 3}
        
    def generate_movement(self, stage, duration_seconds):
        """Generate realistic accelerometer patterns"""
        n_samples = duration_seconds * self.sampling_rate
        
        # Movement characteristics per stage
        params = {
            'awake': {'base': 0.5, 'noise': 0.4, 'spike_prob': 0.05},
            'light': {'base': 0.2, 'noise': 0.15, 'spike_prob': 0.02},
            'deep':  {'base': 0.05, 'noise': 0.03, 'spike_prob': 0.005},
            'rem':   {'base': 0.1, 'noise': 0.08, 'spike_prob': 0.015}
        }
        
        p = params[stage]
        
        # Generate base signals
        t = np.linspace(0, 2*np.pi*duration_seconds/60, n_samples)
        x = np.random.normal(0, p['noise'], n_samples) + p['base'] * np.sin(t)
        y = np.random.normal(0, p['noise'], n_samples) + p['base'] * np.cos(t)
        z = np.random.normal(9.81, p['noise'], n_samples)
        
        # Add movement spikes
        spikes = np.random.random(n_samples) < p['spike_prob']
        x[spikes] += np.random.uniform(-2, 2, np.sum(spikes))
        y[spikes] += np.random.uniform(-2, 2, np.sum(spikes))
        
        magnitude = np.sqrt(x**2 + y**2 + z**2)
        
        return x, y, z, magnitude
    
    def generate_night(self, night_id):
        """Generate one night of sleep"""
        stages_timeline = [
            ('awake', 10),   # Fall asleep
            ('light', 15),
            ('deep', 25),
            ('light', 10),
            ('rem', 15),
            ('light', 20),
            ('deep', 20),
            ('light', 10),
            ('rem', 20),
            ('light', 15),
            ('rem', 25),
            ('light', 10),
            ('awake', 5)     # Wake up
        ]
        
        data = []
        current_time = datetime(2024, 1, 1, 23, 0, 0) + timedelta(days=night_id)
        
        for stage, duration_min in stages_timeline:
            duration_sec = duration_min * 60
            x, y, z, magnitude = self.generate_movement(stage, duration_sec)
            
            for i in range(len(x)):
                data.append({
                    'timestamp': current_time + timedelta(seconds=i/self.sampling_rate),
                    'session_id': f'session_{night_id}',
                    'x': x[i],
                    'y': y[i],
                    'z': z[i],
                    'magnitude': magnitude[i],
                    'stage': stage,
                    'stage_label': self.sleep_stages[stage]
                })
            
            current_time += timedelta(minutes=duration_min)
        
        return data
    
    def generate_dataset(self, n_nights=50, output_dir='data'):
        """Generate complete dataset"""
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"Generating {n_nights} nights of sleep data...")
        print("This will create ~150-200MB dataset\n")
        
        all_data = []
        
        for night in range(n_nights):
            if (night + 1) % 10 == 0:
                print(f"  Progress: {night + 1}/{n_nights} nights")
            
            night_data = self.generate_night(night)
            all_data.extend(night_data)
        
        # Create DataFrame
        df = pd.DataFrame(all_data)
        
        # Save
        output_file = os.path.join(output_dir, 'sleep_dataset_optimized.csv')
        df.to_csv(output_file, index=False)
        
        print(f"\n✅ Dataset saved to: {output_file}")
        print(f"   Total samples: {len(df):,}")
        print(f"   File size: {os.path.getsize(output_file) / (1024*1024):.2f} MB")
        
        # Stage distribution
        print("\nStage distribution:")
        for stage in ['awake', 'light', 'deep', 'rem']:
            count = (df['stage'] == stage).sum()
            pct = count / len(df) * 100
            print(f"   {stage.capitalize():8s}: {pct:5.1f}%")
        
        return df

if __name__ == '__main__':
    print("="*60)
    print("Optimized Sleep Dataset Generator")
    print("="*60 + "\n")
    
    generator = OptimizedSleepDataGenerator(sampling_rate=10)
    dataset = generator.generate_dataset(n_nights=50)
    
    print("\n✅ Dataset ready for training!")
    print("   Run: python train_with_real_data.py")
