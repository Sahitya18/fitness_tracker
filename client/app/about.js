import React from 'react';
import { useRouter } from 'expo-router';
import {
  View, StyleSheet, Text, TouchableOpacity,
  Platform, Dimensions, ScrollView, Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

const { width, height } = Dimensions.get('window');

export default function AboutScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme || 'light'];

  const appVersion = '1.0.0';
  const buildNumber = '2024.02';

  const handleSocialLink = (platform, url) => {
    Linking.openURL(url).catch(err => 
      console.error(`Failed to open ${platform}:`, err)
    );
  };

  const features = [
    { icon: 'food-apple', title: 'Smart Food Tracking', desc: 'Track meals with detailed macro breakdowns' },
    { icon: 'dumbbell', title: 'Workout Logger', desc: 'Record and monitor your fitness journey' },
    { icon: 'chart-line', title: 'Analytics', desc: 'Visualize your progress with insights' },
    { icon: 'calendar-check', title: 'Daily Goals', desc: 'Set and achieve personalized targets' },
  ];

  const techStack = [
    { name: 'React Native', icon: 'react' },
    { name: 'Expo', icon: 'application-brackets' },
    { name: 'Node.js', icon: 'nodejs' },
    { name: 'MongoDB', icon: 'database' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentColors.background }]}
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
            <MaterialCommunityIcons name="information" size={48} color="white" />
          </View>
          <Text style={styles.appName}>About FitMe</Text>
          <Text style={styles.tagline}>Your Personal Fitness Companion</Text>
          <Text style={styles.version}>Version {appVersion} ({buildNumber})</Text>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        
        {/* App Description */}
        <Surface style={[styles.card, { backgroundColor: currentColors.card }, Shadows.medium]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="application" size={24} color={currentColors.primary} />
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>What is FitMe?</Text>
          </View>
          <Text style={[styles.descriptionText, { color: currentColors.textSecondary }]}>
            FitMe is your all-in-one fitness tracking companion designed to help you achieve your health goals. 
            Track your meals, log workouts, monitor progress, and stay motivated on your fitness journey.
          </Text>
          <Text style={[styles.descriptionText, { color: currentColors.textSecondary, marginTop: 12 }]}>
            Built with love and dedication to make fitness tracking simple, intuitive, and effective.
          </Text>
        </Surface>

        {/* Features */}
        <Surface style={[styles.card, { backgroundColor: currentColors.card }, Shadows.medium]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="star-circle" size={24} color={currentColors.primary} />
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Key Features</Text>
          </View>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIconWrap, { backgroundColor: currentColors.primary + '20' }]}>
                  <MaterialCommunityIcons name={feature.icon} size={28} color={currentColors.primary} />
                </View>
                <Text style={[styles.featureTitle, { color: currentColors.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDesc, { color: currentColors.textTertiary }]}>{feature.desc}</Text>
              </View>
            ))}
          </View>
        </Surface>

        {/* Creator Info */}
        <Surface style={[styles.card, { backgroundColor: currentColors.card }, Shadows.medium]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account-star" size={24} color={currentColors.primary} />
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Meet the Creator</Text>
          </View>
          
          <View style={styles.creatorCard}>
            <View style={[styles.creatorAvatar, { backgroundColor: currentColors.primary + '20' }]}>
              <Text style={[styles.creatorInitials, { color: currentColors.primary }]}>S</Text>
            </View>
            <View style={styles.creatorInfo}>
              <Text style={[styles.creatorName, { color: currentColors.text }]}>Sahitya</Text>
              <Text style={[styles.creatorRole, { color: currentColors.textSecondary }]}>
                Full Stack Developer & Fitness Enthusiast
              </Text>
            </View>
          </View>

          <Text style={[styles.creatorBio, { color: currentColors.textSecondary }]}>
            Passionate about building products that make a difference in people's lives. 
            FitMe was born from a personal journey to simplify fitness tracking and make it accessible to everyone.
          </Text>

          {/* Social Links */}
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: currentColors.surfaceVariant }]}
              onPress={() => handleSocialLink('GitHub', 'https://github.com/sahitya')}
            >
              <MaterialCommunityIcons name="github" size={24} color={currentColors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: currentColors.surfaceVariant }]}
              onPress={() => handleSocialLink('LinkedIn', 'https://linkedin.com/in/sahitya')}
            >
              <MaterialCommunityIcons name="linkedin" size={24} color="#0A66C2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: currentColors.surfaceVariant }]}
              onPress={() => handleSocialLink('Twitter', 'https://twitter.com/sahitya')}
            >
              <MaterialCommunityIcons name="twitter" size={24} color="#1DA1F2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: currentColors.surfaceVariant }]}
              onPress={() => handleSocialLink('Email', 'mailto:sahitya@fitme.com')}
            >
              <MaterialCommunityIcons name="email" size={24} color={currentColors.primary} />
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Tech Stack */}
        {/* <Surface style={[styles.card, { backgroundColor: currentColors.card }, Shadows.medium]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="code-braces" size={24} color={currentColors.primary} />
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Built With</Text>
          </View>
          <View style={styles.techStackRow}>
            {techStack.map((tech, index) => (
              <View key={index} style={[styles.techBadge, { backgroundColor: currentColors.surfaceVariant }]}>
                <MaterialCommunityIcons name={tech.icon} size={20} color={currentColors.primary} />
                <Text style={[styles.techName, { color: currentColors.text }]}>{tech.name}</Text>
              </View>
            ))}
          </View>
        </Surface> */}

        {/* Legal & Info Links */}
        {/* <Surface style={[styles.card, { backgroundColor: currentColors.card }, Shadows.medium]}>
          <TouchableOpacity style={styles.linkItem}>
            <MaterialCommunityIcons name="shield-check" size={20} color={currentColors.textSecondary} />
            <Text style={[styles.linkText, { color: currentColors.text }]}>Privacy Policy</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={currentColors.textTertiary} />
          </TouchableOpacity>
          
          <View style={[styles.linkDivider, { backgroundColor: currentColors.border }]} />
          
          <TouchableOpacity style={styles.linkItem}>
            <MaterialCommunityIcons name="file-document" size={20} color={currentColors.textSecondary} />
            <Text style={[styles.linkText, { color: currentColors.text }]}>Terms of Service</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={currentColors.textTertiary} />
          </TouchableOpacity>
          
          <View style={[styles.linkDivider, { backgroundColor: currentColors.border }]} />
          
          <TouchableOpacity style={styles.linkItem}>
            <MaterialCommunityIcons name="license" size={20} color={currentColors.textSecondary} />
            <Text style={[styles.linkText, { color: currentColors.text }]}>Open Source Licenses</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={currentColors.textTertiary} />
          </TouchableOpacity>
        </Surface> */}

        {/* Copyright */}
        {/* <View style={styles.copyrightContainer}>
          <MaterialCommunityIcons name="copyright" size={16} color={currentColors.textTertiary} />
          <Text style={[styles.copyrightText, { color: currentColors.textTertiary }]}>
            2024 FitMe. All rights reserved.
          </Text>
        </View>

        <View style={styles.madeWithLove}>
          <Text style={[styles.madeWithText, { color: currentColors.textTertiary }]}>
            Made with
          </Text>
          <MaterialCommunityIcons name="heart" size={16} color="#E8537A" />
          <Text style={[styles.madeWithText, { color: currentColors.textTertiary }]}>
            by Sahitya
          </Text>
        </View> */}

      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  version: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  contentContainer: {
    paddingHorizontal: 24,
    marginTop: -30,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    width: (width - 48 - 36 - 12) / 2,
    alignItems: 'center',
    padding: 16,
  },
  featureIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  creatorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorInitials: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  creatorRole: {
    fontSize: 13,
    lineHeight: 18,
  },
  creatorBio: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  techStackRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  techBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  techName: {
    fontSize: 14,
    fontWeight: '600',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  linkDivider: {
    height: 1,
  },
  copyrightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  copyrightText: {
    fontSize: 13,
  },
  madeWithLove: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  madeWithText: {
    fontSize: 13,
  },
});
