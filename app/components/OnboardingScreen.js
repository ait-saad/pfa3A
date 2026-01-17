import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../theme/theme';
import AnimatedButton from './AnimatedButton';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: 'sleep',
    title: 'Track Your Sleep',
    description: 'Monitor your sleep patterns with advanced sensor technology and get detailed insights.',
    gradient: [colors.primary, colors.primaryDark],
  },
  {
    id: '2',
    icon: 'alarm',
    title: 'Smart Alarm',
    description: 'Wake up at the optimal time during light sleep for a more refreshed feeling.',
    gradient: [colors.secondary, colors.secondaryDark],
  },
  {
    id: '3',
    icon: 'chart-line',
    title: 'Beautiful Analytics',
    description: 'Visualize your sleep architecture and track weekly trends with professional charts.',
    gradient: [colors.accent, colors.accentDark],
  },
  {
    id: '4',
    icon: 'bell-ring',
    title: 'Smart Reminders',
    description: 'Get personalized insights and reminders to improve your sleep quality.',
    gradient: ['#8B5CF6', '#6366F1'],
  },
];

export default function OnboardingScreen({ onComplete }) {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <LinearGradient
        colors={item.gradient}
        style={styles.iconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MaterialCommunityIcons name={item.icon} size={80} color="#FFF" />
      </LinearGradient>
      <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
        {item.description}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
      />

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentIndex
                    ? theme.colors.primary
                    : theme.colors.disabled,
                width: index === currentIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {currentIndex < slides.length - 1 ? (
          <View style={styles.buttonsRow}>
            <Button
              mode="text"
              onPress={handleSkip}
              textColor={theme.colors.textSecondary}
            >
              Skip
            </Button>
            <AnimatedButton
              mode="contained"
              onPress={handleNext}
              style={styles.nextButton}
              buttonColor={theme.colors.primary}
            >
              Next
            </AnimatedButton>
          </View>
        ) : (
          <AnimatedButton
            mode="contained"
            onPress={handleComplete}
            style={styles.getStartedButton}
            buttonColor={theme.colors.primary}
            icon="check"
          >
            Get Started
          </AnimatedButton>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.lg,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: borderRadius.full,
    marginHorizontal: 4,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextButton: {
    minWidth: 120,
  },
  getStartedButton: {
    width: '100%',
  },
});
