import React, { useState } from 'react';
import { View, Alert, StyleSheet, ScrollView,TextInput, Platform, Dimensions, KeyboardAvoidingView, Text, TouchableOpacity } from 'react-native';
import { Button, Surface, ProgressBar, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import API_CONFIG from '../utils/config';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

const { height } = Dimensions.get('window');

export default function RegisterScreen() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme || 'light'];
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);

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
      console.log('Sending request to:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTRATION.SEND_EMAIL_OTP}`);
      
      // Create request options with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
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
      
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTRATION.SEND_EMAIL_OTP}`, requestOptions);
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
          `URL: ${API_CONFIG.BASE_URL}\n` +
          `Platform: ${Platform.OS}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (!otp) {
      Alert.alert('Validation', 'Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTRATION.VERIFY_OTP}`, {
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

    if (!emailVerified) {
      Alert.alert('Validation', 'Please verify email');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTRATION.REGISTER}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          mobile, 
          password
        }),
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
        const errorText = await res.text();
        Alert.alert('Failed', errorText);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: currentColors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Gradient */}
        <LinearGradient
          colors={[currentColors.primary, currentColors.secondary]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={[styles.logoContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <MaterialCommunityIcons 
                name="account-plus" 
                size={48} 
                color="white" 
              />
            </View>
            <Text style={styles.appName}>Join FitMe</Text>
            <Text style={styles.tagline}>Start Your Fitness Journey Today</Text>
          </View>
        </LinearGradient>

        {/* Registration Form Section */}
        <View style={styles.formContainer}>
          <Surface style={[styles.formCard, { backgroundColor: currentColors.card }, Shadows.medium]}>
            <Text style={[styles.welcomeText, { color: currentColors.text }]}>Create Account</Text>
            <Text style={[styles.subtitleText, { color: currentColors.textSecondary }]}>Step 1: Basic Information</Text>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={0.1}
                color={currentColors.primary}
                style={styles.progressBar}
              />
            </View>

            {/* Email Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Email Verification</Text>
              <View style={[styles.inputContainer, { 
                backgroundColor: currentColors.surfaceVariant,
                borderColor: currentColors.borderLight 
              }]}>
                <MaterialCommunityIcons 
                  name="email-outline" 
                  size={20} 
                  color={currentColors.textSecondary} 
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={[styles.input, { color: currentColors.text }]}
                  placeholderTextColor={currentColors.textTertiary}
                  // editable={!emailVerified}
                />
              </View>
              
              {/* {!emailVerified && (
                <Button
                  mode="contained"
                  onPress={sendEmailOtp}
                  loading={loading}
                  disabled={loading || !validateEmail(email)}
                  style={[styles.actionButton, { backgroundColor: currentColors.primary }]}
                  contentStyle={styles.actionButtonContent}
                  labelStyle={styles.actionButtonLabel}
                >
                  Send Email OTP
                </Button>
              )} */}
              
              {emailVerified && (
                <View style={[styles.verifiedContainer, { backgroundColor: currentColors.success + '20' }]}>
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={20} 
                    color={currentColors.success} 
                  />
                  <Text style={[styles.verifiedText, { color: currentColors.success }]}>
                    Email verified successfully
                  </Text>
                </View>
              )}
            </View>

            {/* OTP Verification Section */}
            {/* {emailOtpSent && !emailVerified && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Enter OTP</Text>
                <View style={[styles.inputContainer, { 
                  backgroundColor: 'transparent',
                  borderColor: currentColors.border
                }]}>
                  <MaterialCommunityIcons 
                    name="key-outline" 
                    size={20} 
                    color={currentColors.textSecondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    style={[styles.input, { color: currentColors.text }]}
                    placeholderTextColor={currentColors.textTertiary}
                    maxLength={6}
                  />
                </View>
                <Button
                  mode="contained"
                  onPress={verifyEmailOtp}
                  loading={loading}
                  disabled={loading || !otp}
                  style={[styles.actionButton, { backgroundColor: currentColors.secondary }]}
                  contentStyle={styles.actionButtonContent}
                  labelStyle={styles.actionButtonLabel}
                >
                  Verify OTP
                </Button>
              </View>
            )} */}

            {/* Additional Information Section */}

            {/* otp section is removed to simplify the flow, we can add it back if needed in future iterations */}
            {/* <View style={[styles.section, { opacity: emailVerified ? 1 : 0.6 }]}> */}
            
            <View style={[styles.section, { opacity: 1 }]}>
              <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Account Details</Text>

              <View style={[styles.inputContainer, { 
                backgroundColor: currentColors.surfaceVariant,
                borderColor: currentColors.borderLight 
              }]}>
                <MaterialCommunityIcons 
                  name="phone-outline" 
                  size={20} 
                  color={currentColors.textSecondary} 
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Mobile number (10 digits)"
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  style={[styles.input, { color: currentColors.text }]}
                  placeholderTextColor={currentColors.textTertiary}
                  // editable={emailVerified}
                  maxLength={10}
                />
              </View>
              <View style={[styles.inputContainer, { 
                backgroundColor: currentColors.surfaceVariant,
                borderColor: currentColors.borderLight 
              }]}>
                <MaterialCommunityIcons 
                  name="lock-outline" 
                  size={20} 
                  color={currentColors.textSecondary} 
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secureTextEntry}
                  style={[styles.input, { color: currentColors.text }]}
                  placeholderTextColor={currentColors.textTertiary}
                  // editable={emailVerified}
                />
                <TouchableOpacity 
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                  style={styles.eyeIcon}
                >
                  <MaterialCommunityIcons 
                    name={secureTextEntry ? "eye-off" : "eye"} 
                    size={20} 
                    color={currentColors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
              <View style={[styles.inputContainer, { 
                backgroundColor: currentColors.surfaceVariant,
                borderColor: currentColors.borderLight 
              }]}>
                <MaterialCommunityIcons 
                  name="lock-check-outline" 
                  size={20} 
                  color={currentColors.textSecondary} 
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={showConfirmPassword}
                  style={[styles.input, { color: currentColors.text }]}
                  placeholderTextColor={currentColors.textTertiary}
                  // editable={emailVerified}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <MaterialCommunityIcons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={currentColors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Register Button */}
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              // disabled={!emailVerified}
              style={[styles.registerButton, { backgroundColor: currentColors.primary }]}
              contentStyle={styles.registerButtonContent}
              labelStyle={styles.registerButtonLabel}
            >
              Create Account
            </Button>

            {/* Login Link */}
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: currentColors.border }]} />
              <Text style={[styles.dividerText, { color: currentColors.textTertiary }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: currentColors.border }]} />
            </View>

            <TouchableOpacity 
              onPress={() => router.push('/login')}
              style={styles.loginContainer}
            >
              <Text style={[styles.loginText, { color: currentColors.textSecondary }]}>
                Already have an account?{' '}
                <Text style={[styles.loginLink, { color: currentColors.primary }]}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </Surface>
        </View>

        {/* Bottom Decorative Element */}
        <View style={styles.bottomDecoration}>
          <MaterialCommunityIcons 
            name="dumbbell" 
            size={24} 
            color={currentColors.secondary} 
          />
          <Text style={[styles.bottomText, { color: currentColors.textTertiary }]}>
            Ready to start your fitness journey?
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerGradient: {
    height: height * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Shadows.small,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -30,
  },
  formCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  actionButton: {
    borderRadius: 12,
    marginBottom: 16,
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
  actionButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  verifiedText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  registerButton: {
    borderRadius: 12,
    marginBottom: 24,
  },
  registerButtonContent: {
    paddingVertical: 8,
  },
  registerButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontWeight: '600',
  },
  bottomDecoration: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 20,
    minHeight: 80,
  },
  bottomText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.8,
  },
});