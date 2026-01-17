import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Text, IconButton, Surface } from 'react-native-paper';
import { Accelerometer } from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../theme/theme';
import AnimatedButton from '../components/AnimatedButton';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.6;

export default function TrackingScreenNew({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const [isTracking, setIsTracking] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [duration, setDuration] = useState(0);
  const [movementLevel, setMovementLevel] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('awake');
  const [sensorData, setSensorData] = useState([]);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const movementAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isTracking) {
      startPulseAnimation();
      startRotateAnimation();
      startAccelerometer();
      const timer = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
      return () => {
        clearInterval(timer);
        stopAccelerometer();
      };
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
    }
  }, [isTracking]);

  useEffect(() => {
    // Animate movement indicator
    Animated.spring(movementAnim, {
      toValue: movementLevel,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [movementLevel]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startRotateAnimation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  };

  const startAccelerometer = () => {
    Accelerometer.setUpdateInterval(1000);
    Accelerometer.addListener((data) => {
      const { x, y, z } = data;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      
      setMovementLevel(Math.min(magnitude * 10, 1));
      setSensorData(prev => [...prev, { x, y, z, timestamp: Date.now() }]);
      
      // Send to backend every 5 readings
      if (sensorData.length % 5 === 0 && sessionId) {
        sendSensorData({ x, y, z });
      }
      
      // Estimate phase based on movement
      estimatePhase(magnitude);
    });
  };

  const stopAccelerometer = () => {
    Accelerometer.removeAllListeners();
  };

  const estimatePhase = (magnitude) => {
    if (magnitude > 0.4) {
      setCurrentPhase('awake');
    } else if (magnitude > 0.15) {
      setCurrentPhase('light');
    } else if (magnitude > 0.08) {
      setCurrentPhase('rem');
    } else {
      setCurrentPhase('deep');
    }
  };

  const sendSensorData = async (data) => {
    try {
      await axios.post(`http://localhost:8000/sleep/${sessionId}/data`, {
        accel_x: data.x,
        accel_y: data.y,
        accel_z: data.z,
      });
    } catch (error) {
      console.error('Error sending sensor data:', error);
    }
  };

  const handleStartStop = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (!isTracking) {
      // Start tracking
      try {
        const response = await axios.post('http://localhost:8000/sleep/start', {
          user_id: 'user123',
        });
        setSessionId(response.data.session_id);
        setIsTracking(true);
      } catch (error) {
        console.error('Error starting session:', error);
      }
    } else {
      // Stop tracking
      try {
        const response = await axios.post(`http://localhost:8000/sleep/${sessionId}/analyze`);
        setIsTracking(false);
        navigation.navigate('Results', { 
          analysis: response.data,
          sessionId 
        });
      } catch (error) {
        console.error('Error analyzing session:', error);
      }
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = () => {
    const phaseColors = {
      awake: colors.sleepPhases.awake,
      light: colors.sleepPhases.light,
      deep: colors.sleepPhases.deep,
      rem: colors.sleepPhases.rem,
    };
    return phaseColors[currentPhase] || colors.primary;
  };

  const getPhaseLabel = () => {
    const labels = {
      awake: 'Awake',
      light: 'Light Sleep',
      deep: 'Deep Sleep',
      rem: 'REM Sleep',
    };
    return labels[currentPhase] || 'Unknown';
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={theme.colors.text}
            onPress={() => navigation.goBack()}
          />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {isTracking ? 'Tracking Sleep...' : 'Sleep Tracker'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Main Circle */}
        <View style={styles.circleContainer}>
          <Animated.View
            style={[
              styles.outerCircle,
              {
                transform: [{ scale: pulseAnim }, { rotate: spin }],
                opacity: isTracking ? 0.3 : 0,
              },
            ]}
          >
            <LinearGradient
              colors={[getPhaseColor(), colors.primaryDark]}
              style={styles.gradientCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

          <Surface style={[styles.mainCircle, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={isTracking ? [getPhaseColor(), colors.primaryDark] : [colors.primary, colors.primaryDark]}
              style={styles.innerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.circleContent}>
                <MaterialCommunityIcons
                  name={isTracking ? 'sleep' : 'sleep-off'}
                  size={64}
                  color="#FFF"
                />
                <Text style={styles.durationText}>{formatDuration(duration)}</Text>
                {isTracking && (
                  <Text style={styles.phaseText}>{getPhaseLabel()}</Text>
                )}
              </View>
            </LinearGradient>
          </Surface>
        </View>

        {/* Stats */}
        {isTracking && (
          <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
            <View style={styles.statsRow}>
              <StatBox
                icon="motion"
                label="Movement"
                value={`${(movementLevel * 100).toFixed(0)}%`}
                theme={theme}
              />
              <StatBox
                icon="chart-timeline-variant"
                label="Data Points"
                value={sensorData.length}
                theme={theme}
              />
            </View>
            
            {/* Movement Indicator */}
            <Surface style={[styles.movementIndicator, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.indicatorLabel, { color: theme.colors.textSecondary }]}>
                Activity Level
              </Text>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: getPhaseColor(),
                      transform: [{ scaleX: movementAnim }],
                    },
                  ]}
                />
              </View>
            </Surface>
          </Animated.View>
        )}

        {/* Control Button */}
        <View style={styles.buttonContainer}>
          <AnimatedButton
            mode="contained"
            onPress={handleStartStop}
            buttonColor={isTracking ? colors.error : colors.success}
            icon={isTracking ? 'stop' : 'play'}
            style={styles.controlButton}
            contentStyle={styles.buttonContent}
          >
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </AnimatedButton>

          {!isTracking && (
            <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
              Place your phone on the bed next to you
            </Text>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

function StatBox({ icon, label, value, theme }) {
  return (
    <Surface style={[styles.statBox, { backgroundColor: theme.colors.surface }]}>
      <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} />
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  circleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  outerCircle: {
    position: 'absolute',
    width: CIRCLE_SIZE * 1.2,
    height: CIRCLE_SIZE * 1.2,
    borderRadius: CIRCLE_SIZE * 0.6,
  },
  gradientCircle: {
    flex: 1,
    borderRadius: CIRCLE_SIZE * 0.6,
  },
  mainCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    elevation: 8,
    overflow: 'hidden',
  },
  innerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContent: {
    alignItems: 'center',
  },
  durationText: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: '#FFF',
    marginTop: spacing.md,
  },
  phaseText: {
    fontSize: typography.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.sm,
  },
  statsContainer: {
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  movementIndicator: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    elevation: 2,
  },
  indicatorLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    transformOrigin: 'left',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  controlButton: {
    minWidth: '80%',
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  hint: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
});
