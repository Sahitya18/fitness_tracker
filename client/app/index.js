import React from 'react';
import { router } from 'expo-router';
import { Button, StyleSheet, Text, View, ImageBackground } from 'react-native';

export default function LandingScreen({ navigation }) {
  return (
    <ImageBackground
      // Optional background image if you want
      // source={require('../assets/images/your-bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Welcome to FitTrack!</Text>
        <View style={styles.spacer} />
        <View style={styles.buttonContainer}>
          <Button title="Login" onPress={() => router.push('/login')} />
          <View style={styles.buttonSpacing} />
          <Button title="Register" onPress={() => router.push('/register')} />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  spacer: {
    height: 40,
  },
  buttonContainer: {
    width: '80%',
  },
  buttonSpacing: {
    height: 20,
  },
});
