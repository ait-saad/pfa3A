import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button, Card, Title } from 'react-native-paper';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>🌙 Smart Sleep Tracker</Title>
          <Text style={styles.subtitle}>
            Track and analyze your sleep quality using AI
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('Tracking')}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Start Sleep Tracking
      </Button>

      <Button
        mode="outlined"
        onPress={() => navigation.navigate('History')}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        View Sleep History
      </Button>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('Alarm')}
        style={styles.button}
        contentStyle={styles.buttonContent}
        buttonColor="#FF6B6B"
        icon="alarm"
      >
        Smart Alarm ⏰
      </Button>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>📱 Place your phone on the bed</Text>
        <Text style={styles.infoText}>🔋 Ensure phone is charging</Text>
        <Text style={styles.infoText}>🔇 Enable Do Not Disturb mode</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  card: {
    marginBottom: 30,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    marginVertical: 10,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  infoContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  infoText: {
    fontSize: 14,
    marginVertical: 5,
    color: '#555',
  },
});
