import React from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏋️ Welcome to FitTrack!</Text>
      <Text style={styles.subtitle}>Choose your zone</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.column, { backgroundColor: '#007AFF' }]}
          onPress={() => navigation.navigate('Gym')}
        >
          <Text style={styles.columnText}>Gym</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.column, { backgroundColor: '#FF9500' }]}
          onPress={() => navigation.navigate('Kitchen')}
        >
          <Text style={styles.columnText}>Kitchen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  column: {
    flex: 1,
    height: 200,
    marginHorizontal: 10,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  columnText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
