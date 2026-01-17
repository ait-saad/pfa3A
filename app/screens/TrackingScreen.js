import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { Button, Card, ActivityIndicator } from 'react-native-paper';
import { Accelerometer } from 'expo-sensors';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export default function TrackingScreen({ navigation }) {
  const [isTracking, setIsTracking] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let subscription;
    let interval;

    if (isTracking) {
      // Start accelerometer tracking
      Accelerometer.setUpdateInterval(1000); // Update every second

      subscription = Accelerometer.addListener(accelerometerData => {
        const timestamp = new Date().toISOString();
        const data = {
          timestamp,
          accel_x: accelerometerData.x,
          accel_y: accelerometerData.y,
          accel_z: accelerometerData.z,
        };
        
        setSensorData(prev => [...prev, data]);
      });

      // Timer
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (subscription) subscription.remove();
      if (interval) clearInterval(interval);
    };
  }, [isTracking]);

  const startTracking = async () => {
    try {
      const response = await axios.post(`${API_URL}/sessions/start`, null, {
        params: { user_id: 'user123' }
      });
      
      setSessionId(response.data.session_id);
      setIsTracking(true);
      setSensorData([]);
      setElapsedTime(0);
    } catch (error) {
      Alert.alert('Error', 'Failed to start tracking session');
      console.error(error);
    }
  };

  const stopTracking = async () => {
    try {
      // Upload sensor data
      if (sensorData.length > 0) {
        await axios.post(`${API_URL}/sessions/${sessionId}/data`, sensorData);
      }

      // Stop session
      await axios.post(`${API_URL}/sessions/${sessionId}/stop`);

      // Analyze session
      const analysisResponse = await axios.post(`${API_URL}/analyze/${sessionId}`);

      setIsTracking(false);
      
      // Navigate to results
      navigation.navigate('Results', {
        analysis: analysisResponse.data,
        sessionId
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to stop tracking');
      console.error(error);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          {!isTracking ? (
            <>
              <Text style={styles.title}>Ready to Track Sleep</Text>
              <Text style={styles.subtitle}>
                Place your phone on the mattress near your pillow
              </Text>
              <Button
                mode="contained"
                onPress={startTracking}
                style={styles.button}
              >
                Start Tracking
              </Button>
            </>
          ) : (
            <>
              <Text style={styles.title}>Tracking Sleep...</Text>
              <ActivityIndicator size="large" style={styles.loader} />
              <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
              <Text style={styles.dataCount}>
                Data points collected: {sensorData.length}
              </Text>
              <Button
                mode="contained"
                onPress={stopTracking}
                style={styles.button}
                buttonColor="#ff5252"
              >
                Stop & Analyze
              </Button>
            </>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  card: {
    padding: 20,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  loader: {
    marginVertical: 20,
  },
  timer: {
    fontSize: 48,
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  dataCount: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  button: {
    marginTop: 20,
  },
});
