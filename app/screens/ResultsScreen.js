import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Card, Button, Title, Paragraph } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import SleepArchitectureChart from '../components/SleepArchitectureChart';
import NotificationService from '../services/NotificationService';

const screenWidth = Dimensions.get('window').width;

export default function ResultsScreen({ route, navigation }) {
  const { analysis, sessionId } = route.params;

  // Send morning summary notification
  useEffect(() => {
    if (analysis && analysis.sleep_score) {
      NotificationService.sendMorningSummary({
        hours: analysis.total_sleep_time,
        score: analysis.sleep_score,
        quality: analysis.sleep_score >= 80 ? 'Excellent' : analysis.sleep_score >= 60 ? 'Good' : 'Poor'
      });
    }
  }, []);

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'awake': return '#ff5252';
      case 'light': return '#64b5f6';
      case 'deep': return '#4caf50';
      case 'rem': return '#ffa726';
      default: return '#9e9e9e';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ffa726';
    return '#ff5252';
  };

  const chartData = {
    labels: analysis.phases.slice(0, 10).map((_, i) => `${i}h`),
    datasets: [{
      data: analysis.phases.slice(0, 10).map(p => p.movement * 100),
      color: (opacity = 1) => `rgba(66, 165, 245, ${opacity})`,
    }]
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Sleep Score</Title>
          <Text style={[styles.score, { color: getScoreColor(analysis.sleep_score) }]}>
            {analysis.sleep_score}/100
          </Text>
        </Card.Content>
      </Card>

      <SleepArchitectureChart 
        phases={analysis.phases || []}
        duration={analysis.total_sleep_time}
      />

      <Card style={styles.card}>
        <Card.Content>
          <Title>Sleep Metrics</Title>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Total Sleep Time:</Text>
            <Text style={styles.metricValue}>{analysis.total_sleep_time.toFixed(1)} hours</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Sleep Efficiency:</Text>
            <Text style={styles.metricValue}>{analysis.sleep_efficiency.toFixed(1)}%</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Movement Chart</Title>
          <LineChart
            data={chartData}
            width={screenWidth - 60}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Sleep Phases</Title>
          <View style={styles.phasesContainer}>
            {['awake', 'light', 'deep', 'rem'].map(phase => {
              const count = analysis.phases.filter(p => p.phase === phase).length;
              const percentage = (count / analysis.phases.length * 100).toFixed(1);
              return (
                <View key={phase} style={styles.phaseItem}>
                  <View style={[styles.phaseColor, { backgroundColor: getPhaseColor(phase) }]} />
                  <Text style={styles.phaseText}>
                    {phase.toUpperCase()}: {percentage}%
                  </Text>
                </View>
              );
            })}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Recommendations</Title>
          {analysis.recommendations.map((rec, index) => (
            <Paragraph key={index} style={styles.recommendation}>
              • {rec}
            </Paragraph>
          ))}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('Home')}
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
    marginBottom: 15,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
  },
  score: {
    fontSize: 72,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  metric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: 16,
    color: '#666',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
  },
  phasesContainer: {
    marginTop: 10,
  },
  phaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  phaseColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
  },
  phaseText: {
    fontSize: 14,
  },
  recommendation: {
    marginVertical: 5,
    fontSize: 14,
  },
  button: {
    marginVertical: 20,
  },
});
