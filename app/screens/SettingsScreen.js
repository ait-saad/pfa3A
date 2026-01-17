import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Switch, Button, TextInput, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/NotificationService';

export default function SettingsScreen({ navigation }) {
  const [bedtimeReminders, setBedtimeReminders] = useState(true);
  const [bedtime, setBedtime] = useState('22:30');
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [insightsEnabled, setInsightsEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('appSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setBedtimeReminders(parsed.bedtimeReminders ?? true);
        setBedtime(parsed.bedtime ?? '22:30');
        setWeeklySummary(parsed.weeklySummary ?? true);
        setInsightsEnabled(parsed.insightsEnabled ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        bedtimeReminders,
        bedtime,
        weeklySummary,
        insightsEnabled,
      };
      await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
      
      // Update notification schedules
      if (bedtimeReminders) {
        const [hours, minutes] = bedtime.split(':');
        const bedtimeDate = new Date();
        bedtimeDate.setHours(parseInt(hours), parseInt(minutes), 0);
        await NotificationService.scheduleBedtimeReminder(bedtimeDate, true);
      } else {
        await NotificationService.scheduleBedtimeReminder(null, false);
      }

      if (weeklySummary) {
        await NotificationService.scheduleWeeklySummary(2, 9, 0);
      }

      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
      console.error('Error saving settings:', error);
    }
  };

  const clearAllNotifications = async () => {
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to cancel all scheduled notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            await NotificationService.cancelAllNotifications();
            Alert.alert('Success', 'All notifications cleared');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Notification Settings</Title>
          
          <View style={styles.setting}>
            <View style={styles.settingInfo}>
              <Title style={styles.settingTitle}>Bedtime Reminders</Title>
              <TextInput
                label="Bedtime"
                value={bedtime}
                onChangeText={setBedtime}
                placeholder="HH:MM"
                mode="outlined"
                style={styles.input}
                disabled={!bedtimeReminders}
              />
            </View>
            <Switch
              value={bedtimeReminders}
              onValueChange={setBedtimeReminders}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.setting}>
            <View style={styles.settingInfo}>
              <Title style={styles.settingTitle}>Weekly Summary</Title>
              <TextInput
                label="Summary Info"
                value="Every Monday at 9:00 AM"
                mode="outlined"
                style={styles.input}
                disabled
              />
            </View>
            <Switch
              value={weeklySummary}
              onValueChange={setWeeklySummary}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.setting}>
            <View style={styles.settingInfo}>
              <Title style={styles.settingTitle}>Sleep Insights</Title>
            </View>
            <Switch
              value={insightsEnabled}
              onValueChange={setInsightsEnabled}
            />
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={saveSettings}
        style={styles.button}
        icon="content-save"
      >
        Save Settings
      </Button>

      <Button
        mode="outlined"
        onPress={clearAllNotifications}
        style={styles.button}
        icon="bell-off"
        textColor="#ff5252"
      >
        Clear All Notifications
      </Button>

      <Button
        mode="text"
        onPress={() => navigation.goBack()}
        style={styles.button}
      >
        Back to Home
      </Button>
    </ScrollView>
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
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  settingInfo: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    marginTop: 5,
  },
  divider: {
    marginVertical: 10,
  },
  button: {
    marginVertical: 10,
  },
});
