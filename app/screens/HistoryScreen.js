import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, ScrollView } from 'react-native';
import { Card, Title, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import WeeklyTrendsChart from '../components/WeeklyTrendsChart';
import NotificationService from '../services/NotificationService';

const API_URL = 'http://localhost:8000';

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
    checkAndSendInsights();
  }, []);

  const checkAndSendInsights = async () => {
    if (history.length >= 3) {
      const insights = NotificationService.generateInsights(history);
      if (insights.length > 0) {
        // Send the most important insight
        const topInsight = insights.find(i => i.priority === 'high') || insights[0];
        await NotificationService.sendInsightNotification(topInsight);
      }
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/user123/history`);
      setHistory(response.data.sessions);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>Session {item.session_id.split('_')[1]}</Title>
        <Text style={styles.text}>Start: {formatDate(item.start_time)}</Text>
        {item.end_time && (
          <Text style={styles.text}>End: {formatDate(item.end_time)}</Text>
        )}
        <Text style={[styles.status, { color: item.status === 'completed' ? '#4caf50' : '#ffa726' }]}>
          Status: {item.status.toUpperCase()}
        </Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {history.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No sleep sessions recorded yet</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={item => item.session_id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
  },
  card: {
    marginBottom: 15,
    elevation: 4,
  },
  text: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
