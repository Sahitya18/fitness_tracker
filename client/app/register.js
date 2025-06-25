import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';

const BASE_URL = 'http://192.168.1.23:8080/api'; // change to your backend IP

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const sendEmailOtp = async () => {
    if (!email) return Alert.alert('Email required');
    try {
      const res = await fetch(`${BASE_URL}/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setOtpSent(true);
        Alert.alert('OTP sent to email');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const sendMobileOtp = async () => {
    if (!mobile) return Alert.alert('Mobile required');
    try {
      const res = await fetch(`${BASE_URL}/send-mobile-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      if (res.ok) {
        setOtpSent(true);
        Alert.alert('OTP sent to mobile');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleRegister = async () => {
    if (!email || !mobile || !password || !otp) return Alert.alert('All fields required');
    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mobile, password, otp }),
      });
      if (res.ok) Alert.alert('Registered successfully');
      else Alert.alert('Failed', await res.text());
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <View style={styles.row}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.inputFlex}
        />
        <TouchableOpacity onPress={sendEmailOtp} style={styles.otpButton}>
          <Text style={styles.otpButtonText}>Send OTP</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TextInput
          placeholder="Mobile"
          value={mobile}
          onChangeText={setMobile}
          style={styles.inputFlex}
          keyboardType="phone-pad"
        />
        <TouchableOpacity onPress={sendMobileOtp} style={styles.otpButton}>
          <Text style={styles.otpButtonText}>Send OTP</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {otpSent && (
        <TextInput
          placeholder="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          style={styles.input}
        />
      )}

      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', padding: 20,
  },
  title: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputFlex: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 45,
  },
  otpButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 8,
    height: 45,
    justifyContent: 'center',
  },
  otpButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 45,
    marginBottom: 12,
  },
});
