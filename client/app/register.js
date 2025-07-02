import React, { useState } from 'react';
import { View, Alert, StyleSheet, ScrollView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface, ProgressBar, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

// Handle different platform URLs
// const getBaseUrl = () => {
//   if (Platform.OS === 'android') {
//     // Android emulator uses remote server IP
//     return 'http://192.168.1.9:8080/api';
//   } else if (Platform.OS === 'ios') {
//     // iOS simulator uses remote server IP
//     return 'http://192.168.1.9:8080/api';
//   } else {
//     // For web or physical devices, use remote server IP
//     return 'http://192.168.1.9:8080/api';
//   }
// };

const BASE_URL = 'http://192.168.1.13:8080/api';

export default function RegisterScreen() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const validateMobile = (mobile) => {
    return mobile.match(/^\d{10}$/);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const sendEmailOtp = async () => {
    if (!email) {
      Alert.alert('Validation', 'Please enter your email address');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Validation', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending request to:', `${BASE_URL}/registration/send-email-otp`);
      
      // Create request options with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const requestOptions = {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: email,
          mobile: null,
          otp: null
        }),
        signal: controller.signal,
        mode: 'cors'
      };

      console.log('Request options:', JSON.stringify(requestOptions, null, 2));
      
      const res = await fetch(`${BASE_URL}/registration/send-email-otp`, requestOptions);
      clearTimeout(timeoutId);
      
      console.log('Response status:', res.status);
      console.log('Response headers:', JSON.stringify(Object.fromEntries([...res.headers]), null, 2));
      
      if (res.ok) {
        setEmailOtpSent(true);
        Alert.alert('Success', 'OTP has been sent to your email');
      } else {
        const errorText = await res.text();
        console.error('Server error:', errorText);
        Alert.alert('Failed', `Server error: ${errorText || 'Failed to send OTP'}`);
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
          `Technical details:\n${err.message}\n` +
          `URL: ${BASE_URL}\n` +
          `Platform: ${Platform.OS}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // const sendMobileOtp = async () => {
  //   if (!mobile) {
  //     Alert.alert('Validation', 'Please enter your mobile number');
  //     return;
  //   }
  //   if (!validateMobile(mobile)) {
  //     Alert.alert('Validation', 'Please enter a valid 10-digit mobile number');
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const res = await fetch(`${BASE_URL}/registration/send-mobile-otp`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ 
  //         email: null,
  //         mobile: mobile,
  //         otp: null
  //       }),
  //     });
  //     if (res.ok) {
  //       setMobileOtpSent(true);
  //       Alert.alert('Success', 'OTP has been sent to your mobile');
  //     } else {
  //       const errorText = await res.text();
  //       Alert.alert('Failed', errorText || 'Failed to send OTP');
  //     }
  //   } catch (err) {
  //     Alert.alert('Error', err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const verifyEmailOtp = async () => {
    if (!otp) {
      Alert.alert('Validation', 'Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/registration/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email,
          mobile: null,
          otp: otp
        }),
      });
      if (res.ok) {
        setEmailVerified(true);
        Alert.alert('Success', 'Email verified successfully');
        setOtp('');
      } else {
        const errorText = await res.text();
        Alert.alert('Failed', errorText || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyMobileOtp = async () => {
    if (!otp) {
      Alert.alert('Validation', 'Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/registration/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: null,
          mobile: mobile,
          otp: otp
        }),
      });
      if (res.ok) {
        setMobileVerified(true);
        Alert.alert('Success', 'Mobile number verified successfully');
      } else {
        const errorText = await res.text();
        Alert.alert('Failed', errorText || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !mobile || !password || !confirmPassword) {
      Alert.alert('Validation', 'Please fill in all required fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Validation', 'Please enter a valid email address');
      return;
    }

    if (!validateMobile(mobile)) {
      Alert.alert('Validation', 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Validation', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation', 'Passwords do not match');
      return;
    }

    if (!emailVerified || !mobileVerified) {
      Alert.alert('Validation', 'Please verify both email and mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/registration/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mobile, password, otp }),
      });
      
      if (res.ok) {
        Alert.alert(
          'Success', 
          'Registration successful! Let\'s set up your fitness profile.', 
          [
            {
              text: 'Continue',
              onPress: () => router.push({
                pathname: '/profile-setup',
                params: { email }
              })
            }
          ]
        );
      } else {
        Alert.alert('Failed', await res.text());
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Surface style={styles.surface}>
        <Text variant="headlineMedium" style={styles.title}>Create Account</Text>
        
        <View style={styles.stepIndicator}>
          <Text variant="titleMedium" style={styles.subtitle}>Step 1: Basic Information</Text>
          <ProgressBar
            progress={0.3}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.section}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
            error={email && !validateEmail(email)}
            disabled={emailVerified}
          />
          <Button
            mode="contained"
            onPress={sendEmailOtp}
            loading={loading}
            disabled={loading || !validateEmail(email) || emailVerified}
            style={styles.actionButton}
          >
            Send Email OTP
          </Button>
        </View>

        {emailOtpSent && !emailVerified && (
          <View style={styles.section}>
            <TextInput
              label="Enter Email OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              mode="outlined"
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={verifyEmailOtp}
              loading={loading}
              disabled={loading || !otp}
              style={styles.actionButton}
            >
              Verify Email OTP
            </Button>
          </View>
        )}

        <View style={[styles.section, { opacity: emailVerified ? 1 : 0.6 }]}>
          <TextInput
            label="Mobile Number"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            mode="outlined"
            style={styles.input}
            error={mobile && !validateMobile(mobile)}
            disabled={!emailVerified || mobileVerified}
          />
          {emailVerified && !mobileVerified && (
            <Button
              mode="contained"
              onPress={sendMobileOtp}
              loading={loading}
              disabled={loading || !validateMobile(mobile) || mobileVerified}
              style={styles.actionButton}
            >
              Send Mobile OTP
            </Button>
          )}
        </View>

        {mobileOtpSent && !mobileVerified && (
          <View style={styles.section}>
            <TextInput
              label="Enter Mobile OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              mode="outlined"
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={verifyMobileOtp}
              loading={loading}
              disabled={loading || !otp}
              style={styles.actionButton}
            >
              Verify Mobile OTP
            </Button>
          </View>
        )}

        <View style={[styles.section, { opacity: emailVerified && mobileVerified ? 1 : 0.6 }]}>
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
            mode="outlined"
            right={<TextInput.Icon icon={secureTextEntry ? "eye" : "eye-off"} onPress={() => setSecureTextEntry(!secureTextEntry)} />}
            style={styles.input}
            error={password && !validatePassword(password)}
            disabled={!emailVerified || !mobileVerified}
          />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={secureTextEntry}
            mode="outlined"
            style={styles.input}
            error={confirmPassword && password !== confirmPassword}
            disabled={!emailVerified || !mobileVerified}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading || !emailVerified || !mobileVerified}
          style={styles.registerButton}
        >
          Register
        </Button>
        
        <Button
          mode="text"
          onPress={() => router.push('/login')}
          style={styles.linkButton}
        >
          Already have an account? Login
        </Button>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
  surface: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  stepIndicator: {
    marginBottom: 24,
  },
  subtitle: {
    marginBottom: 8,
    opacity: 0.7,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  section: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 6,
  },
  linkButton: {
    marginBottom: 8,
  },
});
