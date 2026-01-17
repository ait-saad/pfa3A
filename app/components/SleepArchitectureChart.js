import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Rect, Text as SvgText, Line, G } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_HEIGHT = 300;
const CHART_PADDING = 40;

export default function SleepArchitectureChart({ phases, duration }) {
  if (!phases || phases.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noData}>No sleep data available</Text>
      </View>
    );
  }

  const phaseColors = {
    awake: '#FF6B6B',
    light: '#4ECDC4',
    deep: '#45B7D1',
    rem: '#FFA07A',
  };

  const phaseLabels = {
    awake: 'Awake',
    light: 'Light Sleep',
    deep: 'Deep Sleep',
    rem: 'REM Sleep',
  };

  const phaseOrder = { awake: 4, light: 3, deep: 1, rem: 2 };

  // Calculate dimensions
  const chartWidth = SCREEN_WIDTH - 40;
  const plotWidth = chartWidth - 2 * CHART_PADDING;
  const plotHeight = CHART_HEIGHT - 2 * CHART_PADDING;
  const barWidth = plotWidth / phases.length;

  // Calculate phase statistics
  const phaseStats = phases.reduce((acc, phase) => {
    acc[phase.phase] = (acc[phase.phase] || 0) + 1;
    return acc;
  }, {});

  const totalMinutes = (phases.length * 30) / 60; // Assuming 30-second windows

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep Architecture</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <Svg width={Math.max(chartWidth, phases.length * 3)} height={CHART_HEIGHT}>
          {/* Y-axis labels */}
          <SvgText
            x={CHART_PADDING - 10}
            y={CHART_PADDING + plotHeight * 0 / 4}
            fontSize="10"
            fill="#666"
            textAnchor="end"
          >
            Awake
          </SvgText>
          <SvgText
            x={CHART_PADDING - 10}
            y={CHART_PADDING + plotHeight * 1 / 4}
            fontSize="10"
            fill="#666"
            textAnchor="end"
          >
            Light
          </SvgText>
          <SvgText
            x={CHART_PADDING - 10}
            y={CHART_PADDING + plotHeight * 2 / 4}
            fontSize="10"
            fill="#666"
            textAnchor="end"
          >
            REM
          </SvgText>
          <SvgText
            x={CHART_PADDING - 10}
            y={CHART_PADDING + plotHeight * 3 / 4}
            fontSize="10"
            fill="#666"
            textAnchor="end"
          >
            Deep
          </SvgText>

          {/* Chart bars */}
          <G>
            {phases.map((phase, index) => {
              const x = CHART_PADDING + index * barWidth;
              const phaseLevel = phaseOrder[phase.phase] || 3;
              const y = CHART_PADDING + (plotHeight * (4 - phaseLevel)) / 4;
              const height = plotHeight / 4;

              return (
                <Rect
                  key={index}
                  x={x}
                  y={y}
                  width={Math.max(barWidth - 1, 1)}
                  height={height}
                  fill={phaseColors[phase.phase]}
                  opacity={0.8}
                />
              );
            })}
          </G>

          {/* X-axis line */}
          <Line
            x1={CHART_PADDING}
            y1={CHART_HEIGHT - CHART_PADDING}
            x2={CHART_PADDING + plotWidth}
            y2={CHART_HEIGHT - CHART_PADDING}
            stroke="#666"
            strokeWidth="1"
          />

          {/* Time labels */}
          {[0, 2, 4, 6, 8].map((hour) => {
            if (hour <= totalMinutes / 60) {
              const x = CHART_PADDING + (hour / (totalMinutes / 60)) * plotWidth;
              return (
                <G key={hour}>
                  <Line
                    x1={x}
                    y1={CHART_HEIGHT - CHART_PADDING}
                    x2={x}
                    y2={CHART_HEIGHT - CHART_PADDING + 5}
                    stroke="#666"
                    strokeWidth="1"
                  />
                  <SvgText
                    x={x}
                    y={CHART_HEIGHT - CHART_PADDING + 20}
                    fontSize="10"
                    fill="#666"
                    textAnchor="middle"
                  >
                    {hour}h
                  </SvgText>
                </G>
              );
            }
            return null;
          })}
        </Svg>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(phaseColors).map(([phase, color]) => (
          <View key={phase} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: color }]} />
            <Text style={styles.legendText}>
              {phaseLabels[phase]}: {Math.round((phaseStats[phase] || 0) * 30 / 60)} min
            </Text>
          </View>
        ))}
      </View>

      {/* Statistics */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{duration || totalMinutes.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Hours Slept</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {phases.filter(p => p.phase === 'deep').length}
          </Text>
          <Text style={styles.statLabel}>Deep Sleep Cycles</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {phases.filter(p => p.phase === 'awake').length}
          </Text>
          <Text style={styles.statLabel}>Awakenings</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 3,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
});
