import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';

export default function KitchenScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>🍽️ Kitchen Dashboard</Text>
      <Text style={styles.subtext}>Manage your diet, track food, and plan meals.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Track Calories</Text>
        <Button
          title="Open Tracker"
          onPress={() => navigation.navigate('CalorieTracker')}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Food History</Text>
        <Button
          title="View History"
          onPress={() => navigation.navigate('FoodHistory')}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Meal Planner</Text>
        <Button
          title="Plan Meals"
          onPress={() => navigation.navigate('MealPlanner')}
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
    backgroundColor: '#fff7ee',
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
