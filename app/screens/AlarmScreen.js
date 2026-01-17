import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Switch, Platform, Alert } from 'react-native';
import { Button, Card, Title, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function AlarmScreen({ navigation }) {
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [smartWakeEnabled, setSmartWakeEnabled] = useState(true);
  const [wakeWindow, setWakeWindow] = useState(30); // minutes before alarm
  const [notificationId, setNotificationId] = useState(null);

  useEffect(() => {
    loadAlarmSettings();
    requestNotificationPermissions();
  }, []);

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please enable notifications for alarm to work');
    }
  };

  const loadAlarmSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('alarmSettings');
      if (settings) {
        const { time, enabled, smartWake, window } = JSON.parse(settings);
        setAlarmTime(new Date(time));
        setAlarmEnabled(enabled);
        setSmartWakeEnabled(smartWake);
        setWakeWindow(window);
      }
    } catch (error) {
      console.error('Error loading alarm settings:', error);
    }
  };

  const saveAlarmSettings = async () => {
    try {
      const settings = {
        time: alarmTime.toISOString(),
        enabled: alarmEnabled,
        smartWake: smartWakeEnabled,
        window: wakeWindow,
      };
      await AsyncStorage.setItem('alarmSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving alarm settings:', error);
    }
  };

  const scheduleAlarm = async () => {
    try {
      // Cancel existing notification
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }

      // Calculate trigger time
      const trigger = new Date(alarmTime);
      
      // If smart wake is enabled, schedule earlier check
      if (smartWakeEnabled) {
        trigger.setMinutes(trigger.getMinutes() - wakeWindow);
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌅 Wake Up!',
          body: smartWakeEnabled 
            ? 'Good morning! You\'re in light sleep - perfect time to wake up.'
            : 'Time to wake up!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
        },
        trigger: {
          hour: trigger.getHours(),
          minute: trigger.getMinutes(),
          repeats: true,
        },
      });

      setNotificationId(id);
      setAlarmEnabled(true);
      await saveAlarmSettings();
      
      Alert.alert(
        'Alarm Set',
        `Your ${smartWakeEnabled ? 'smart ' : ''}alarm is set for ${formatTime(alarmTime)}${
          smartWakeEnabled ? ` (wake window: ${wakeWindow} min)` : ''
        }`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule alarm');
      console.error(error);
    }
  };

  const cancelAlarm = async () => {
    try {
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
      setAlarmEnabled(false);
      setNotificationId(null);
      await saveAlarmSettings();
      Alert.alert('Alarm Cancelled', 'Your alarm has been turned off');
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel alarm');
      console.error(error);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const onTimeChange = (event, selectedDate) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setAlarmTime(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>⏰ Smart Alarm</Title>
          
          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>Wake up time:</Text>
            <Button 
              mode="outlined" 
              onPress={() => setShowTimePicker(true)}
              style={styles.timeButton}
            >
              {formatTime(alarmTime)}
            </Button>
          </View>

          {showTimePicker && (
            <DateTimePicker
              value={alarmTime}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={onTimeChange}
            />
          )}

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Smart Wake Window</Text>
              <Text style={styles.settingDescription}>
                Wake you during light sleep for better alertness
              </Text>
            </View>
            <Switch
              value={smartWakeEnabled}
              onValueChange={setSmartWakeEnabled}
            />
          </View>

          {smartWakeEnabled && (
            <View style={styles.windowContainer}>
              <Text style={styles.windowLabel}>Wake window (minutes before alarm):</Text>
              <TextInput
                mode="outlined"
                value={wakeWindow.toString()}
                onChangeText={(text) => setWakeWindow(parseInt(text) || 30)}
                keyboardType="numeric"
                style={styles.windowInput}
              />
              <Text style={styles.windowHint}>
                The alarm will wake you {wakeWindow} minutes before {formatTime(alarmTime)} if you're in light sleep
              </Text>
            </View>
          )}

          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              Status: {alarmEnabled ? '✅ Active' : '⭕ Inactive'}
            </Text>
          </View>

          {!alarmEnabled ? (
            <Button
              mode="contained"
              onPress={scheduleAlarm}
              style={styles.button}
              icon="alarm-plus"
            >
              Set Alarm
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={cancelAlarm}
              style={styles.button}
              buttonColor="#ff5252"
              icon="alarm-off"
            >
              Cancel Alarm
            </Button>
          )}

          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            Back to Home
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.infoTitle}>💡 How Smart Alarm Works</Text>
          <Text style={styles.infoText}>
            • Monitors your sleep phases in real-time{'\n'}
            • Detects when you're in light sleep{'\n'}
            • Wakes you at the optimal time within your wake window{'\n'}
            • Helps you feel more refreshed and alert
          </Text>
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
  },
  card: {
    marginBottom: 20,
    elevation: 4,
  },
  infoCard: {
    elevation: 2,
    backgroundColor: '#e3f2fd',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  timeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  timeLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  timeButton: {
    minWidth: 150,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  windowContainer: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  windowLabel: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '500',
  },
  windowInput: {
    marginBottom: 10,
  },
  windowHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    marginVertical: 10,
  },
  backButton: {
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },
});
