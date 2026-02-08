import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import API_CONFIG from '../utils/config';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Validation', 'Please enter your email address');
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT || 5000);

    try {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email }),
        signal: controller.signal,
        mode: 'cors'
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}/password/forgot`, requestOptions);
      clearTimeout(timeoutId);

      if (response.ok) {
        Alert.alert(
          'Success',
          'Password reset instructions have been sent to your email.'
        );
        router.back(); // Go back to previous screen
      } else {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        Alert.alert('Failed', errorText || 'Something went wrong');
      }
    } catch (err) {
      console.error('Network error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack,
        cause: err.cause
      });
      if (err.name === 'AbortError') {
        Alert.alert('Timeout', 'Request timed out. Please check your internet connection and try again.');
      } else {
        Alert.alert(
          'Network Error',
          `Failed to connect to server. Please check:\n\n` +
          `1. Your internet connection\n` +
          `2. The server is running\n\n` +
          `Technical details:\n${err.message}`
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Forgot Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Button title="Send Reset Link" onPress={handleForgotPassword} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
});
