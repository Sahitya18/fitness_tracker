import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '../utils/AuthContext';
import API_CONFIG from '../utils/config';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation', 'Email and password are required');
      return;
    }

    setLoading(true);
    try {
      // Create request options with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      console.log('Attempting to connect to:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`);
      
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeoutId);
      
      console.log('Response status:', res.status);
      console.log('Response headers:', JSON.stringify(Object.fromEntries([...res.headers]), null, 2));

      const data = await res.json();
      
      if (res.ok && data.token) {
        // Pass the entire response as user data, it contains all necessary user information
        await signIn(data.token, data);
        router.replace('/home');
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack,
        cause: err.cause
      });
      
      if (err.name === 'AbortError') {
        Alert.alert('Timeout', 'Request timed out. Please check your internet connection and try again.');
      } else {
        Alert.alert(
          'Connection Error', 
          `Failed to connect to server. Please check:\n\n` +
          `1. Your internet connection\n` +
          `2. The server is running\n` +
          `3. You're on the same network as the server\n\n` +
          `Technical details:\n${err.message}\n` +
          `URL: ${API_CONFIG.BASE_URL}\n` +
          `Platform: ${Platform.OS}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login to FitTrack</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button 
        title={loading ? "Logging in..." : "Login"} 
        onPress={handleLogin}
        disabled={loading}
      />

      <TouchableOpacity onPress={() => router.push('/forgot-password')}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  link: {
    marginTop: 15,
    color: 'blue',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
