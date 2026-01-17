import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.setupNotifications();
  }

  async setupNotifications() {
    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('sleep-tracker', {
        name: 'Sleep Tracker',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6200ee',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('bedtime-reminders', {
        name: 'Bedtime Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('insights', {
        name: 'Sleep Insights',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: null,
      });
    }

    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    return true;
  }

  /**
   * Schedule bedtime reminder notification
   */
  async scheduleBedtimeReminder(bedtime, enabled = true) {
    try {
      // Cancel existing bedtime reminders
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const notif of scheduled) {
        if (notif.content.data?.type === 'bedtime-reminder') {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }

      if (!enabled) {
        return null;
      }

      const bedtimeDate = new Date(bedtime);
      const reminderTime = new Date(bedtimeDate);
      reminderTime.setMinutes(reminderTime.getMinutes() - 30); // 30 min before bedtime

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌙 Time to Wind Down',
          body: 'Your bedtime is in 30 minutes. Start preparing for a good night\'s sleep!',
          data: { type: 'bedtime-reminder' },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'bedtime-reminders',
        },
        trigger: {
          hour: reminderTime.getHours(),
          minute: reminderTime.getMinutes(),
          repeats: true,
        },
      });

      await AsyncStorage.setItem('bedtime-reminder-id', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling bedtime reminder:', error);
      return null;
    }
  }

  /**
   * Send sleep insights notification
   */
  async sendInsightNotification(insight) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💡 Sleep Insight',
          body: insight.message,
          data: { 
            type: 'sleep-insight',
            insight: insight 
          },
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
          categoryIdentifier: 'insights',
        },
        trigger: null, // Send immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Error sending insight notification:', error);
      return null;
    }
  }

  /**
   * Schedule weekly summary notification
   */
  async scheduleWeeklySummary(dayOfWeek = 1, hour = 9, minute = 0) {
    try {
      // Cancel existing weekly summary
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const notif of scheduled) {
        if (notif.content.data?.type === 'weekly-summary') {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📊 Weekly Sleep Summary',
          body: 'Your sleep report for the past week is ready!',
          data: { type: 'weekly-summary' },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
          categoryIdentifier: 'insights',
        },
        trigger: {
          weekday: dayOfWeek, // 1 = Monday, 2 = Tuesday, etc.
          hour: hour,
          minute: minute,
          repeats: true,
        },
      });

      await AsyncStorage.setItem('weekly-summary-id', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling weekly summary:', error);
      return null;
    }
  }

  /**
   * Send morning summary notification
   */
  async sendMorningSummary(sleepData) {
    try {
      const { hours, score, quality } = sleepData;
      
      let emoji = '😊';
      let message = `You slept ${hours.toFixed(1)} hours with a score of ${score}/100.`;
      
      if (score >= 80) {
        emoji = '🌟';
        message = `Great sleep! ${message} Keep it up!`;
      } else if (score >= 60) {
        emoji = '😊';
        message = `Good sleep. ${message}`;
      } else {
        emoji = '😴';
        message = `${message} Try to improve tonight.`;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${emoji} Good Morning!`,
          body: message,
          data: { 
            type: 'morning-summary',
            sleepData 
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'insights',
        },
        trigger: null, // Send immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Error sending morning summary:', error);
      return null;
    }
  }

  /**
   * Send achievement notification
   */
  async sendAchievementNotification(achievement) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏆 Achievement Unlocked!',
          body: achievement.message,
          data: { 
            type: 'achievement',
            achievement 
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'insights',
        },
        trigger: null,
      });

      return notificationId;
    } catch (error) {
      console.error('Error sending achievement notification:', error);
      return null;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem('bedtime-reminder-id');
      await AsyncStorage.removeItem('weekly-summary-id');
      return true;
    } catch (error) {
      console.error('Error cancelling notifications:', error);
      return false;
    }
  }

  /**
   * Cancel specific notification
   */
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return true;
    } catch (error) {
      console.error('Error cancelling notification:', error);
      return false;
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications() {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      return scheduled;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Generate sleep insights based on data
   */
  generateInsights(sleepHistory) {
    const insights = [];

    if (sleepHistory.length < 3) {
      return insights;
    }

    // Average sleep duration
    const avgHours = sleepHistory.reduce((sum, s) => sum + s.hours, 0) / sleepHistory.length;
    
    if (avgHours < 7) {
      insights.push({
        message: `You're averaging ${avgHours.toFixed(1)} hours of sleep. Try to get at least 7-8 hours!`,
        type: 'warning',
        priority: 'high'
      });
    }

    // Sleep consistency
    const bedtimes = sleepHistory.map(s => new Date(s.startTime).getHours());
    const bedtimeVariance = Math.max(...bedtimes) - Math.min(...bedtimes);
    
    if (bedtimeVariance > 2) {
      insights.push({
        message: 'Your bedtime varies by more than 2 hours. Try to maintain a consistent schedule.',
        type: 'tip',
        priority: 'medium'
      });
    }

    // Sleep score trend
    const recentScores = sleepHistory.slice(-3).map(s => s.score);
    const scoreChange = recentScores[recentScores.length - 1] - recentScores[0];
    
    if (scoreChange > 10) {
      insights.push({
        message: 'Great job! Your sleep quality has improved over the last few nights! 🌟',
        type: 'achievement',
        priority: 'high'
      });
    } else if (scoreChange < -10) {
      insights.push({
        message: 'Your sleep quality has decreased. Consider reviewing your sleep habits.',
        type: 'warning',
        priority: 'medium'
      });
    }

    return insights;
  }
}

// Export singleton instance
export default new NotificationService();
