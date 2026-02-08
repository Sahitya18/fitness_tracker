import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Gym2Screen() {
  return (
    <View style={styles.container}>
      <MaterialIcons name="build" size={64} color="#FFA500" style={styles.icon} />
      <Text style={styles.text}>Work in Progress</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  icon: {
    marginBottom: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFA500',
  },
}); 