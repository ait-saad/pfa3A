import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'react-native-paper';
import { colors, shadows, borderRadius } from '../theme/theme';

export default function GradientCard({ 
  children, 
  gradient = [colors.primary, colors.primaryDark],
  style,
  ...props 
}) {
  return (
    <Card style={[styles.card, style]} {...props}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {children}
      </LinearGradient>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: borderRadius.xl,
    ...shadows.lg,
  },
  gradient: {
    padding: 20,
  },
});
