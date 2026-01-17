import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Animated } from 'react-native';
import { Text, IconButton, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/theme';
import AnimatedButton from '../components/AnimatedButton';
import StatCard from '../components/StatCard';
import GradientCard from '../components/GradientCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreenNew({ navigation }) {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [userName, setUserName] = useState('User');
  const [recentStats, setRecentStats] = useState(null);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    loadUserData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);
      
      // Load recent sleep stats
      const stats = await AsyncStorage.getItem('recentStats');
      if (stats) setRecentStats(JSON.parse(stats));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {userName} 👋
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <IconButton
              icon={isDarkMode ? 'weather-sunny' : 'moon-waning-crescent'}
              size={24}
              iconColor={theme.colors.primary}
              onPress={toggleTheme}
              style={[styles.iconButton, { backgroundColor: theme.colors.surfaceVariant }]}
            />
            <IconButton
              icon="cog"
              size={24}
              iconColor={theme.colors.primary}
              onPress={() => navigation.navigate('Settings')}
              style={[styles.iconButton, { backgroundColor: theme.colors.surfaceVariant }]}
            />
          </View>
        </Animated.View>

        {/* Main Card - Sleep Tracking */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <GradientCard 
            gradient={[colors.primary, colors.primaryDark]}
            style={styles.mainCard}
          >
            <View style={styles.mainCardContent}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="sleep" size={48} color="#FFF" />
              </View>
              <Text style={styles.mainCardTitle}>Ready to Track Your Sleep?</Text>
              <Text style={styles.mainCardSubtitle}>
                Place your phone on the bed and start monitoring your sleep patterns
              </Text>
              <AnimatedButton
                mode="contained"
                onPress={() => navigation.navigate('Tracking')}
                buttonColor="#FFF"
                textColor={colors.primary}
                style={styles.startButton}
                icon="play-circle"
                contentStyle={styles.buttonContent}
              >
                Start Tracking
              </AnimatedButton>
            </View>
          </GradientCard>
        </Animated.View>

        {/* Quick Stats */}
        {recentStats && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Last Night's Sleep
            </Text>
            <View style={styles.statsGrid}>
              <StatCard
                icon="clock-outline"
                label="Duration"
                value={recentStats.duration || '0'}
                suffix="h"
                color={colors.primary}
              />
              <StatCard
                icon="chart-line"
                label="Sleep Score"
                value={recentStats.score || '0'}
                suffix="/100"
                color={colors.accent}
              />
            </View>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <ActionCard
              icon="alarm"
              title="Smart Alarm"
              color={colors.secondary}
              onPress={() => navigation.navigate('Alarm')}
              theme={theme}
            />
            <ActionCard
              icon="history"
              title="Sleep History"
              color={colors.accent}
              onPress={() => navigation.navigate('History')}
              theme={theme}
            />
            <ActionCard
              icon="chart-box"
              title="Analytics"
              color={colors.primary}
              onPress={() => navigation.navigate('History')}
              theme={theme}
            />
            <ActionCard
              icon="lightbulb-on"
              title="Sleep Tips"
              color={colors.warning}
              onPress={() => {/* Navigate to tips */}}
              theme={theme}
            />
          </View>
        </Animated.View>

        {/* Sleep Tips Card */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Surface style={[styles.tipsCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.tipsIconContainer, { backgroundColor: colors.info + '20' }]}>
              <MaterialCommunityIcons name="information" size={24} color={colors.info} />
            </View>
            <View style={styles.tipsContent}>
              <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
                Sleep Tip of the Day
              </Text>
              <Text style={[styles.tipsText, { color: theme.colors.textSecondary }]}>
                Maintain a consistent sleep schedule by going to bed and waking up at the same time every day.
              </Text>
            </View>
          </Surface>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function ActionCard({ icon, title, color, onPress, theme }) {
  return (
    <Surface
      style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
      elevation={2}
    >
      <AnimatedButton
        mode="text"
        onPress={onPress}
        style={styles.actionButton}
      >
        <View style={styles.actionContent}>
          <View style={[styles.actionIconContainer, { backgroundColor: color + '20' }]}>
            <MaterialCommunityIcons name={icon} size={28} color={color} />
          </View>
          <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
        </View>
      </AnimatedButton>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    borderRadius: borderRadius.md,
  },
  mainCard: {
    marginBottom: spacing.xl,
  },
  mainCardContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  mainCardTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  mainCardSubtitle: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  startButton: {
    minWidth: 200,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  statsGrid: {
    gap: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  actionButton: {
    margin: 0,
  },
  actionContent: {
    padding: spacing.md,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  tipsCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    ...shadows.md,
  },
  tipsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  tipsText: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
});
