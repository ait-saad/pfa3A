import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { Text, IconButton, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/theme';
import AnimatedButton from '../components/AnimatedButton';
import SleepArchitectureChart from '../components/SleepArchitectureChart';
import StatCard from '../components/StatCard';
import NotificationService from '../services/NotificationService';

export default function ResultsScreenNew({ route, navigation }) {
  const { theme } = useTheme();
  const { analysis, sessionId } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Send morning summary notification
    if (analysis && analysis.sleep_score) {
      NotificationService.sendMorningSummary({
        hours: analysis.total_sleep_time,
        score: analysis.sleep_score,
        quality: getQualityLabel(analysis.sleep_score),
      });
    }

    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  const getQualityLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const getScoreEmoji = (score) => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '😊';
    return '😴';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={theme.colors.text}
            onPress={() => navigation.navigate('Home')}
          />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Sleep Analysis
          </Text>
          <IconButton
            icon="share-variant"
            size={24}
            iconColor={theme.colors.primary}
            onPress={() => {/* Share functionality */}}
          />
        </View>

        {/* Score Card */}
        <Animated.View 
          style={[
            styles.scoreCardContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Surface style={[styles.scoreCard, { backgroundColor: theme.colors.surface }]}>
            <LinearGradient
              colors={[getScoreColor(analysis.sleep_score), getScoreColor(analysis.sleep_score) + 'CC']}
              style={styles.scoreGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.scoreEmoji}>{getScoreEmoji(analysis.sleep_score)}</Text>
              <Text style={styles.scoreValue}>{analysis.sleep_score}</Text>
              <Text style={styles.scoreOutOf}>/100</Text>
              <Text style={styles.scoreLabel}>{getQualityLabel(analysis.sleep_score)}</Text>
            </LinearGradient>
          </Surface>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Sleep Summary
          </Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="clock-outline"
              label="Total Sleep"
              value={analysis.total_sleep_time.toFixed(1)}
              suffix="h"
              color={colors.primary}
            />
            <StatCard
              icon="sleep"
              label="Deep Sleep"
              value={analysis.deep_sleep_percentage.toFixed(0)}
              suffix="%"
              color={colors.sleepPhases.deep}
            />
            <StatCard
              icon="eye"
              label="REM Sleep"
              value={analysis.rem_percentage.toFixed(0)}
              suffix="%"
              color={colors.sleepPhases.rem}
            />
            <StatCard
              icon="weather-night"
              label="Light Sleep"
              value={analysis.light_sleep_percentage.toFixed(0)}
              suffix="%"
              color={colors.sleepPhases.light}
            />
          </View>
        </Animated.View>

        {/* Sleep Architecture Chart */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Sleep Phases
          </Text>
          <SleepArchitectureChart 
            phases={analysis.phases || []}
            duration={analysis.total_sleep_time}
          />
        </Animated.View>

        {/* Sleep Quality Breakdown */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quality Breakdown
          </Text>
          <Surface style={[styles.breakdownCard, { backgroundColor: theme.colors.surface }]}>
            <QualityItem
              label="Sleep Duration"
              value={analysis.total_sleep_time >= 7 ? 'Good' : 'Needs Improvement'}
              icon={analysis.total_sleep_time >= 7 ? 'check-circle' : 'alert-circle'}
              color={analysis.total_sleep_time >= 7 ? colors.success : colors.warning}
              theme={theme}
            />
            <QualityItem
              label="Deep Sleep"
              value={analysis.deep_sleep_percentage >= 15 ? 'Sufficient' : 'Low'}
              icon={analysis.deep_sleep_percentage >= 15 ? 'check-circle' : 'alert-circle'}
              color={analysis.deep_sleep_percentage >= 15 ? colors.success : colors.warning}
              theme={theme}
            />
            <QualityItem
              label="REM Sleep"
              value={analysis.rem_percentage >= 20 ? 'Optimal' : 'Below Average'}
              icon={analysis.rem_percentage >= 20 ? 'check-circle' : 'alert-circle'}
              color={analysis.rem_percentage >= 20 ? colors.success : colors.warning}
              theme={theme}
            />
            <QualityItem
              label="Sleep Efficiency"
              value={analysis.sleep_score >= 70 ? 'High' : 'Moderate'}
              icon={analysis.sleep_score >= 70 ? 'check-circle' : 'information'}
              color={analysis.sleep_score >= 70 ? colors.success : colors.info}
              theme={theme}
              isLast
            />
          </Surface>
        </Animated.View>

        {/* Recommendations */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Recommendations
          </Text>
          <Surface style={[styles.recommendationsCard, { backgroundColor: theme.colors.surface }]}>
            {generateRecommendations(analysis).map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <View style={[styles.recIcon, { backgroundColor: colors.primary + '20' }]}>
                  <MaterialCommunityIcons name={rec.icon} size={20} color={colors.primary} />
                </View>
                <Text style={[styles.recText, { color: theme.colors.text }]}>
                  {rec.text}
                </Text>
              </View>
            ))}
          </Surface>
        </Animated.View>

        {/* Actions */}
        <Animated.View style={[styles.actionsContainer, { opacity: fadeAnim }]}>
          <AnimatedButton
            mode="contained"
            onPress={() => navigation.navigate('History')}
            icon="history"
            style={styles.actionButton}
            buttonColor={theme.colors.primary}
          >
            View History
          </AnimatedButton>
          <AnimatedButton
            mode="outlined"
            onPress={() => navigation.navigate('Home')}
            icon="home"
            style={styles.actionButton}
          >
            Back to Home
          </AnimatedButton>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function QualityItem({ label, value, icon, color, theme, isLast = false }) {
  return (
    <View style={[styles.qualityItem, !isLast && styles.qualityItemBorder]}>
      <View style={styles.qualityLeft}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
        <Text style={[styles.qualityLabel, { color: theme.colors.text }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.qualityValue, { color }]}>
        {value}
      </Text>
    </View>
  );
}

function generateRecommendations(analysis) {
  const recommendations = [];

  if (analysis.total_sleep_time < 7) {
    recommendations.push({
      icon: 'clock-plus',
      text: 'Aim for 7-9 hours of sleep per night for optimal health.',
    });
  }

  if (analysis.deep_sleep_percentage < 15) {
    recommendations.push({
      icon: 'weight-lifter',
      text: 'Regular exercise can help increase deep sleep duration.',
    });
  }

  if (analysis.rem_percentage < 20) {
    recommendations.push({
      icon: 'meditation',
      text: 'Try relaxation techniques before bed to improve REM sleep.',
    });
  }

  if (analysis.sleep_score < 70) {
    recommendations.push({
      icon: 'bed',
      text: 'Maintain a consistent sleep schedule, even on weekends.',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      icon: 'check-all',
      text: 'Great job! Keep maintaining your healthy sleep habits.',
    });
  }

  return recommendations;
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
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  scoreCardContainer: {
    marginBottom: spacing.xl,
  },
  scoreCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  scoreGradient: {
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  scoreEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: typography.fontWeight.bold,
    color: '#FFF',
    lineHeight: 72,
  },
  scoreOutOf: {
    fontSize: typography.fontSize.xl,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: -spacing.sm,
  },
  scoreLabel: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFF',
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  statsGrid: {
    gap: spacing.md,
  },
  breakdownCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  qualityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  qualityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  qualityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  qualityLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.md,
  },
  qualityValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  recommendationsCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  recIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  recText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  actionsContainer: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  actionButton: {
    width: '100%',
  },
});
