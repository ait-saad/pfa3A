"""
Generate realistic sleep dataset based on accelerometer patterns
Uses research-based movement characteristics for each sleep stage
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os

class SleepDatasetGenerator:
    def __init__(self, sampling_rate=10):  # 10 Hz (10 samples per second)
        self.sampling_rate = sampling_rate
        self.sleep_stages = {
            'awake': 0,
            'light': 1,
            'deep': 2,
            'rem': 3
        }
        
    def generate_movement_pattern(self, stage, duration_seconds):
        """Generate accelerometer data for a specific sleep stage"""
        n_samples = duration_seconds * self.sampling_rate
        
        if stage == 'awake':
            # High movement: frequent position changes
            base_movement = 0.5
            noise_level = 0.4
            spike_prob = 0.05  # 5% chance of large movement per second
            
        elif stage == 'light':
            # Moderate movement: occasional shifts
            base_movement = 0.2
            noise_level = 0.15
            spike_prob = 0.02
            
        elif stage == 'deep':
            # Minimal movement: very stable
            base_movement = 0.05
            noise_level = 0.03
            spike_prob = 0.005
            
        elif stage == 'rem':
            # Low movement with occasional twitches
            base_movement = 0.1
            noise_level = 0.08
            spike_prob = 0.015
            
        # Generate base acceleration (gravity + small movements)
        x = np.random.normal(0, noise_level, n_samples) + base_movement * np.sin(np.linspace(0, 2*np.pi, n_samples))
        y = np.random.normal(0, noise_level, n_samples) + base_movement * np.cos(np.linspace(0, 2*np.pi, n_samples))
        z = np.random.normal(9.81, noise_level, n_samples)  # Gravity component
        
        # Add occasional spikes (position changes)
        spikes = np.random.random(n_samples) < spike_prob
        x[spikes] += np.random.uniform(-2, 2, np.sum(spikes))
        y[spikes] += np.random.uniform(-2, 2, np.sum(spikes))
        z[spikes] += np.random.uniform(-1, 1, np.sum(spikes))
        
        # Calculate magnitude
        magnitude = np.sqrt(x**2 + y**2 + z**2)
        
        return x, y, z, magnitude
    
    def generate_sleep_cycle(self):
        """
        Generate one realistic sleep cycle (~90 minutes)
        Typical cycle: Light -> Deep -> Light -> REM
        """
        cycle_stages = [
            ('light', np.random.randint(10, 20)),  # 10-20 min light sleep
            ('deep', np.random.randint(15, 30)),   # 15-30 min deep sleep
            ('light', np.random.randint(5, 15)),   # 5-15 min light sleep
            ('rem', np.random.randint(10, 25))     # 10-25 min REM
        ]
        return cycle_stages
    
    def generate_night_sleep(self, total_hours=8):
        """Generate a full night of sleep (multiple cycles)"""
        stages_timeline = []
        
        # Add initial awake period (falling asleep: 5-20 min)
        stages_timeline.append(('awake', np.random.randint(5, 20)))
        
        # Calculate number of sleep cycles (each ~90 min)
        n_cycles = int((total_hours * 60 - 20) / 90)
        
        for cycle_num in range(n_cycles):
            cycle = self.generate_sleep_cycle()
            
            # First cycle has longer deep sleep
            if cycle_num == 0:
                cycle[1] = ('deep', np.random.randint(25, 40))
            
            # Later cycles have longer REM
            if cycle_num >= 3:
                cycle[3] = ('rem', np.random.randint(20, 35))
            
            stages_timeline.extend(cycle)
        
        # Add morning awakening
        stages_timeline.append(('light', np.random.randint(5, 10)))
        stages_timeline.append(('awake', np.random.randint(5, 15)))
        
        return stages_timeline
    
    def generate_dataset(self, n_nights=100, hours_per_night=8, output_dir='data'):
        """Generate full dataset with multiple nights"""
        
        os.makedirs(output_dir, exist_ok=True)
        
        all_data = []
        
        print(f"Generating {n_nights} nights of sleep data...")
        
        for night_num in range(n_nights):
            if (night_num + 1) % 10 == 0:
                print(f"  Generated {night_num + 1}/{n_nights} nights")
            
            # Generate sleep timeline
            stages_timeline = self.generate_night_sleep(hours_per_night)
            
            # Start time (random between 22:00 and 00:00)
            start_hour = np.random.randint(22, 25) % 24
            current_time = datetime(2024, 1, 1, start_hour, 0, 0) + timedelta(days=night_num)
            
            # Generate accelerometer data for each stage
            for stage, duration_min in stages_timeline:
                duration_sec = duration_min * 60
                x, y, z, magnitude = self.generate_movement_pattern(stage, duration_sec)
                
                # Create timestamps
                timestamps = [current_time + timedelta(seconds=i/self.sampling_rate) 
                             for i in range(len(x))]
                
                # Create dataframe for this segment
                segment_data = pd.DataFrame({
                    'timestamp': timestamps,
                    'user_id': f'user_{night_num % 10}',  # 10 different users
                    'session_id': f'session_{night_num}',
                    'x': x,
                    'y': y,
                    'z': z,
                    'magnitude': magnitude,
                    'stage': stage,
                    'stage_label': self.sleep_stages[stage]
                })
                
                all_data.append(segment_data)
                current_time += timedelta(minutes=duration_min)
        
        # Combine all data
        full_dataset = pd.concat(all_data, ignore_index=True)
        
        # Save to CSV
        output_file = os.path.join(output_dir, 'sleep_dataset.csv')
        full_dataset.to_csv(output_file, index=False)
        print(f"\n✅ Dataset saved to: {output_file}")
        print(f"   Total samples: {len(full_dataset):,}")
        print(f"   Total size: {len(full_dataset) * 8 / (1024*1024):.2f} MB")
        
        # Print stage distribution
        print("\nStage distribution:")
        for stage, label in self.sleep_stages.items():
            count = (full_dataset['stage_label'] == label).sum()
            percentage = count / len(full_dataset) * 100
            print(f"   {stage.capitalize()}: {percentage:.1f}%")
        
        # Save summary statistics
        summary = full_dataset.groupby('stage').agg({
            'magnitude': ['mean', 'std', 'min', 'max'],
            'x': ['mean', 'std'],
            'y': ['mean', 'std'],
            'z': ['mean', 'std']
        }).round(4)
        
        summary_file = os.path.join(output_dir, 'dataset_summary.csv')
        summary.to_csv(summary_file)
        print(f"\n📊 Summary statistics saved to: {summary_file}")
        
        return full_dataset

if __name__ == '__main__':
    print("=" * 60)
    print("Sleep Dataset Generator")
    print("=" * 60)
    
    generator = SleepDatasetGenerator(sampling_rate=10)
    
    # Generate dataset
    # Adjust these parameters as needed:
    dataset = generator.generate_dataset(
        n_nights=100,          # Number of nights to generate
        hours_per_night=8,     # Hours per night
        output_dir='data'      # Output directory
    )
    
    print("\n✅ Dataset generation complete!")
    print("\nNext steps:")
    print("  1. Check data/sleep_dataset.csv")
    print("  2. Run: python train_with_real_data.py")
