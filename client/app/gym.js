import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';

export default function GymScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <Text style={styles.heading}>🏋️ Gym Dashboard</Text>
      <Text style={styles.subtext}>Track your workouts and training progress.</Text> */}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Start Workout</Text>
        <Button
          title="Start"
          onPress={() => navigation.navigate('Workout')}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Workout History</Text>
        <Button
          title="View History"
          onPress={() => navigation.navigate('WorkoutHistory')}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Performance Chart</Text>
        <Button
          title="View Chart"
          onPress={() => navigation.navigate('Progress')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
});
