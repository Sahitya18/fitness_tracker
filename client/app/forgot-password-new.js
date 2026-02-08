import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, TextInput, Alert, StyleSheet, Text, TouchableOpacity, Platform, Dimensions, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useAuth } from '../utils/AuthContext';
import API_CONFIG from '../utils/config';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Surface, Text as PaperText, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

const { width, height } = Dimensions.get('window');
export default function ForgotPasswordScreen() {
  const router = useRouter();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const theme = useTheme();
    const colorScheme = useColorScheme();
  
  // Get current theme colors
  const currentColors = Colors[colorScheme || 'light'];

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
                name="dumbbell" 
                size={48} 
                color="white" 
              />
            </View>
            <Text style={styles.appName}>FitMe</Text>
            <Text style={styles.tagline}>Your Fitness Journey Starts Here</Text>
          </View>
        </LinearGradient>

        {/* Login Form Section */}
        <View style={styles.formContainer}>
          <Surface style={[styles.formCard, { backgroundColor: currentColors.card }, Shadows.medium]}>
            <Text style={[styles.welcomeText, { color: currentColors.text }]}>Forgot Password</Text>
            <Text style={[styles.subtitleText, { color: currentColors.textSecondary }]}>Enter E-Mail address to get new password</Text>

            {/* Email Input */}
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

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={handleForgotPassword}
              loading={loading}
              disabled={loading}
              style={[styles.loginButton, { backgroundColor: currentColors.primary }]}
              contentStyle={styles.loginButtonContent}
              labelStyle={styles.loginButtonLabel}
            >
                {loading ? "Sending..." : "Send Reset Link"}
            </Button> 
          </Surface>
        </View>

        {/* Bottom Decorative Element */}
        <View style={styles.bottomDecoration}>
          <MaterialCommunityIcons 
            name="heart-pulse" 
            size={24} 
            color={currentColors.secondary} 
          />
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
    height: height * 0.35,
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
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: -30,
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 12,
    marginBottom: 24,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  loginButtonLabel: {
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
  registerContainer: {
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontWeight: '600',
  },
  bottomDecoration: {
    alignItems: 'center',
    paddingBottom: 20,
  },
});
