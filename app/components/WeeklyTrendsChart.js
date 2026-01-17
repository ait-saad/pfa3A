import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Rect, Line, Circle, Text as SvgText, G, Path } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_HEIGHT = 250;
const CHART_PADDING = 40;

export default function WeeklyTrendsChart({ weeklyData }) {
  if (!weeklyData || weeklyData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noData}>No weekly data available yet</Text>
        <Text style={styles.hint}>Track your sleep for a few days to see trends</Text>
      </View>
    );
  }

  const chartWidth = SCREEN_WIDTH - 40;
  const plotWidth = chartWidth - 2 * CHART_PADDING;
  const plotHeight = CHART_HEIGHT - 2 * CHART_PADDING;

  // Calculate statistics
  const maxHours = Math.max(...weeklyData.map(d => d.hours), 10);
  const avgHours = weeklyData.reduce((sum, d) => sum + d.hours, 0) / weeklyData.length;
  const avgScore = weeklyData.reduce((sum, d) => sum + d.score, 0) / weeklyData.length;

  // Bar chart settings
  const barWidth = plotWidth / (weeklyData.length * 2);
  const barSpacing = barWidth;

  // Line chart for sleep score
  const scorePoints = weeklyData.map((d, i) => {
    const x = CHART_PADDING + (i + 0.5) * (barWidth + barSpacing) * 2;
    const y = CHART_PADDING + plotHeight - (d.score / 100) * plotHeight;
    return { x, y };
  });

  const scorePath = scorePoints
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Sleep Trends</Text>

      <Svg width={chartWidth} height={CHART_HEIGHT}>
        {/* Y-axis (hours) */}
        {[0, 2, 4, 6, 8, 10].map((hours) => {
          if (hours <= maxHours) {
            const y = CHART_PADDING + plotHeight - (hours / maxHours) * plotHeight;
            return (
              <G key={`hours-${hours}`}>
                <Line
                  x1={CHART_PADDING - 5}
                  y1={y}
                  x2={CHART_PADDING}
                  y2={y}
                  stroke="#666"
                  strokeWidth="1"
                />
                <SvgText
                  x={CHART_PADDING - 10}
                  y={y + 4}
                  fontSize="10"
                  fill="#666"
                  textAnchor="end"
                >
                  {hours}h
                </SvgText>
              </G>
            );
          }
          return null;
        })}

        {/* Bars for sleep duration */}
        {weeklyData.map((data, index) => {
          const x = CHART_PADDING + index * (barWidth + barSpacing) * 2;
          const barHeight = (data.hours / maxHours) * plotHeight;
          const y = CHART_PADDING + plotHeight - barHeight;

          const barColor = data.score >= 80 ? '#4CAF50' : data.score >= 60 ? '#FFC107' : '#FF5252';

          return (
            <G key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={barColor}
                opacity={0.7}
                rx={3}
              />
            </G>
          );
        })}

        {/* Line for sleep score */}
        <Path
          d={scorePath}
          stroke="#6200ee"
          strokeWidth="2"
          fill="none"
        />

        {/* Points on line */}
        {scorePoints.map((point, i) => (
          <Circle
            key={`point-${i}`}
            cx={point.x}
            cy={point.y}
            r={4}
            fill="#6200ee"
          />
        ))}

        {/* X-axis */}
        <Line
          x1={CHART_PADDING}
          y1={CHART_PADDING + plotHeight}
          x2={CHART_PADDING + plotWidth}
          y2={CHART_PADDING + plotHeight}
          stroke="#666"
          strokeWidth="1"
        />

        {/* Day labels */}
        {weeklyData.map((data, index) => {
          const x = CHART_PADDING + (index + 0.5) * (barWidth + barSpacing) * 2;
          return (
            <SvgText
              key={`label-${index}`}
              x={x}
              y={CHART_PADDING + plotHeight + 20}
              fontSize="10"
              fill="#666"
              textAnchor="middle"
            >
              {data.day}
            </SvgText>
          );
        })}

        {/* Average line */}
        <Line
          x1={CHART_PADDING}
          y1={CHART_PADDING + plotHeight - (avgHours / maxHours) * plotHeight}
          x2={CHART_PADDING + plotWidth}
          y2={CHART_PADDING + plotHeight - (avgHours / maxHours) * plotHeight}
          stroke="#999"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
      </Svg>

      {/* Summary statistics */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{avgHours.toFixed(1)}h</Text>
          <Text style={styles.summaryLabel}>Avg Sleep</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{avgScore.toFixed(0)}</Text>
          <Text style={styles.summaryLabel}>Avg Score</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {weeklyData.filter(d => d.score >= 70).length}/{weeklyData.length}
          </Text>
          <Text style={styles.summaryLabel}>Good Nights</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBar, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Good (80+)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBar, { backgroundColor: '#FFC107' }]} />
          <Text style={styles.legendText}>Fair (60-79)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBar, { backgroundColor: '#FF5252' }]} />
          <Text style={styles.legendText}>Poor (&lt;60)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: '#6200ee' }]} />
          <Text style={styles.legendText}>Score</Text>
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
    fontSize: 16,
  },
  hint: {
    textAlign: 'center',
    color: '#bbb',
    fontSize: 14,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
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
  legendBar: {
    width: 20,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendLine: {
    width: 20,
    height: 3,
    borderRadius: 1,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
});
