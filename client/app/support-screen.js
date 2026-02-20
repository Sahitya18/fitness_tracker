import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View, TextInput, Alert, StyleSheet, Text, TouchableOpacity,
  Platform, Dimensions, KeyboardAvoidingView, ScrollView, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import API_CONFIG from '../utils/config';
import { useAuth } from '../utils/AuthContext';

const { width, height } = Dimensions.get('window');

export default function CustomerSupportScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { userToken } = useAuth();

  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const currentColors = Colors[colorScheme || 'light'];

  const handleDetailsChange = (text) => {
    setDetails(text);
    setCharCount(text.length);
  };

  const handleSend = async () => {
    // Validation
    if (!subject.trim()) {
      Alert.alert('Missing Information', 'Please enter a subject for your query');
      return;
    }

    if (!details.trim()) {
      Alert.alert('Missing Information', 'Please provide details about your issue');
      return;
    }

    if (details.length < 10) {
      Alert.alert('Too Short', 'Please provide more details (at least 10 characters)');
      return;
    }

    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/support`, { // Your API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          subject: subject.trim(),
          details: details.trim(),
          timestamp: new Date().toISOString(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success!',
          'Your support request has been submitted. Our team will get back to you soon.',
          [
            {
              text: 'OK',
              onPress: () => {
                setSubject('');
                setDetails('');
                setCharCount(0);
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert('Submission Failed', data.message || 'Unable to submit your request. Please try again.');
      }
    } catch (err) {
      console.error('Support request error:', err);

      if (err.name === 'AbortError') {
        Alert.alert('Timeout', 'Request timed out. Please check your connection and try again.');
      } else {
        Alert.alert(
          'Connection Error',
          'Failed to send your request. Please check your internet connection and try again.'
        );
      }
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
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
            </TouchableOpacity>

            <View style={[styles.logoContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <MaterialCommunityIcons
                name="headset"
                size={48}
                color="white"
              />
            </View>
            <Text style={styles.appName}>Customer Support</Text>
            <Text style={styles.tagline}>We're here to help you!</Text>
          </View>
        </LinearGradient>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <Surface style={[styles.formCard, { backgroundColor: currentColors.card }, Shadows.medium]}>
            <Text style={[styles.welcomeText, { color: currentColors.text }]}>How can we assist you?</Text>
            <Text style={[styles.subtitleText, { color: currentColors.textSecondary }]}>
              Describe your issue and we'll get back to you as soon as possible
            </Text>

            {/* Subject Input */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: currentColors.text }]}>Subject</Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: currentColors.surfaceVariant,
                    borderColor: currentColors.borderLight,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={20}
                  color={currentColors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Brief summary of your issue"
                  value={subject}
                  onChangeText={setSubject}
                  style={[styles.input, { color: currentColors.text }]}
                  placeholderTextColor={currentColors.textTertiary}
                  maxLength={100}
                />
              </View>
            </View>

            {/* Details Input (Multiline) */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <Text style={[styles.fieldLabel, { color: currentColors.text }]}>Details</Text>
                <Text style={[styles.charCounter, { color: currentColors.textTertiary }]}>
                  {charCount}/500
                </Text>
              </View>
              <View
                style={[
                  styles.textAreaContainer,
                  {
                    backgroundColor: currentColors.surfaceVariant,
                    borderColor: currentColors.borderLight,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="text-box-outline"
                  size={20}
                  color={currentColors.textSecondary}
                  style={styles.textAreaIcon}
                />
                <TextInput
                  placeholder="Describe your issue in detail..."
                  value={details}
                  onChangeText={handleDetailsChange}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  style={[styles.textArea, { color: currentColors.text }]}
                  placeholderTextColor={currentColors.textTertiary}
                  maxLength={500}
                />
              </View>
            </View>

            {/* Info Box */}
            <View style={[styles.infoBox, { backgroundColor: currentColors.surfaceVariant + '80' }]}>
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color={currentColors.primary}
                style={styles.infoIcon}
              />
              <Text style={[styles.infoText, { color: currentColors.textSecondary }]}>
                Our support team typically responds within 24-48 hours during business days.
              </Text>
            </View>

            {/* Send Button */}
            <Button
              mode="contained"
              onPress={handleSend}
              loading={loading}
              disabled={loading || !subject.trim() || !details.trim()}
              style={[
                styles.sendButton,
                {
                  backgroundColor: currentColors.primary,
                  opacity: loading || !subject.trim() || !details.trim() ? 0.6 : 1,
                },
              ]}
              contentStyle={styles.sendButtonContent}
              labelStyle={styles.sendButtonLabel}
              icon={({ size, color }) => (
                <MaterialCommunityIcons name="send" size={size} color={color} />
              )}
            >
              {loading ? 'Sending...' : 'Send Request'}
            </Button>

            {/* Alternative Contact Methods */}
            <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, { backgroundColor: currentColors.border }]} />
              <Text style={[styles.dividerText, { color: currentColors.textTertiary }]}>or contact us via</Text>
              <View style={[styles.dividerLine, { backgroundColor: currentColors.border }]} />
            </View>

            <View style={styles.contactMethodsContainer}>
              <TouchableOpacity
                style={[styles.contactMethodButton, { backgroundColor: currentColors.surfaceVariant }]}
                onPress={() => Alert.alert('Email', 'support@fitme.com')}
              >
                <MaterialCommunityIcons name="email" size={24} color={currentColors.primary} />
                <Text style={[styles.contactMethodText, { color: currentColors.text }]}>Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contactMethodButton, { backgroundColor: currentColors.surfaceVariant }]}
                onPress={() => Alert.alert('Phone', '+1 (555) 123-4567')}
              >
                <MaterialCommunityIcons name="phone" size={24} color={currentColors.primary} />
                <Text style={[styles.contactMethodText, { color: currentColors.text }]}>Phone</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contactMethodButton, { backgroundColor: currentColors.surfaceVariant }]}
                onPress={() => Alert.alert('Chat', 'Live chat coming soon!')}
              >
                <MaterialCommunityIcons name="chat" size={24} color={currentColors.primary} />
                <Text style={[styles.contactMethodText, { color: currentColors.text }]}>Chat</Text>
              </TouchableOpacity>
            </View>
          </Surface>
        </View>

        {/* Bottom Decorative Element */}
        <View style={styles.bottomDecoration}>
          <MaterialCommunityIcons
            name="help-circle"
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
    height: height * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: Platform.OS === 'ios' ? 10 : 20,
    padding: 8,
    zIndex: 10,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: Platform.OS === 'ios' ? 20 : 10,
    ...Shadows.small,
  },
  appName: {
    fontSize: 28,
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCounter: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
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
  textAreaContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    minHeight: 150,
  },
  textAreaIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  sendButton: {
    borderRadius: 12,
    marginBottom: 24,
  },
  sendButtonContent: {
    paddingVertical: 8,
  },
  sendButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
  },
  contactMethodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  contactMethodButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  contactMethodText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomDecoration: {
    alignItems: 'center',
    paddingBottom: 20,
  },
});
