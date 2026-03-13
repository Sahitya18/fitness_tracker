import React, { useState } from 'react';
import { View, Alert, StyleSheet, ScrollView, TextInput, Platform, Dimensions, KeyboardAvoidingView, Text, TouchableOpacity } from 'react-native';
import { Button, Surface, ProgressBar, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import API_CONFIG from '../utils/config';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { useAuth } from '../utils/AuthContext';

const { height } = Dimensions.get('window');

export default function RegisterScreen() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme || 'light'];
  const { signIn } = useAuth();
  
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
      
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTRATION.SEND_EMAIL_OTP}`, requestOptions);
      clearTimeout(timeoutId);
      
      if (res.ok) {
        setEmailOtpSent(true);
        Alert.alert('Success', 'OTP has been sent to your email');
      } else {
        const errorText = await res.text();
        Alert.alert('Failed', `Server error: ${errorText || 'Failed to send OTP'}`);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        Alert.alert('Timeout', 'Request timed out. Please check your internet connection and try again.');
      } else {
        Alert.alert('Network Error', `Failed to connect to server.\n\nDetails: ${err.message}`);
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
    // --- Validation ---
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

    setLoading(true);
    try {
      console.log('REGISTER URL:', `${API_CONFIG.BASE_URL_LOCALHOST}${API_CONFIG.ENDPOINTS.REGISTRATION.PORT}${API_CONFIG.ENDPOINTS.REGISTRATION.REGISTER}`);
      
      const res = await fetch(
        `${API_CONFIG.BASE_URL_LOCALHOST}${API_CONFIG.ENDPOINTS.REGISTRATION.PORT}${API_CONFIG.ENDPOINTS.REGISTRATION.REGISTER}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, mobile, password }),
        }
      );

      if (res.ok) {
        // ✅ SUCCESS — first go to profile setup screen
        console.log('Registration successful for email:', email);
        router.replace({
          pathname: '/profile-setup',
          params: { email, fromRegister: '1' },
        });

        // ✅ Then, in the background, try to auto-login so that after setup we can land on /home.
        (async () => {
          try {
            const loginRes = await fetch(
              `${API_CONFIG.BASE_URL_LOCALHOST}${API_CONFIG.ENDPOINTS.AUTH.PORT}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ email, password }),
              }
            );
            const loginData = await loginRes.json().catch(() => ({}));

            if (loginRes.ok && loginData?.token) {
              await signIn(loginData.token, loginData);
            } else {
              console.warn('Auto-login failed after register:', loginData);
            }
          } catch (e) {
            console.warn('Auto-login error after register:', e?.message || e);
          }
        })();
      } else {
        // ❌ SERVER ERROR
        const errorText = await res.text();
        Alert.alert('Registration Failed', errorText || 'Something went wrong. Please try again.');
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
                />
              </View>
              
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

            {/* Account Details Section */}
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