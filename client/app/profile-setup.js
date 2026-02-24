import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Animated, Dimensions, ScrollView, Alert, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../utils/config';

const { width, height } = Dimensions.get('window');

const STEPS = [
  { id: 1, title: 'What should we call you?' },
  { id: 2, title: 'What\'s your goal?' },
  { id: 3, title: 'Meal Preference' },
  { id: 4, title: 'Activity Goal' },
  { id: 5, title: 'Personal Information' },
  { id: 6, title: 'Workout Preference' },
];

const GOAL_OPTIONS = [
  { id: 'fat_loss', label: 'Fat Loss', icon: 'trending-down', color: '#FF6B35' },
  { id: 'maintain', label: 'Maintain', icon: 'minus', color: '#4A90E2' },
  { id: 'gain', label: 'Muscle Gain', icon: 'trending-up', color: '#4CAF50' },
];

const MEAL_PREFERENCES = [
  { id: 'everything', label: 'Everything', icon: 'food' },
  { id: 'vegetarian', label: 'Vegetarian', icon: 'food-apple' },
  { id: 'vegan', label: 'Vegan', icon: 'leaf' },
  { id: 'keto', label: 'Keto', icon: 'nutrition' },
  { id: 'paleo', label: 'Paleo', icon: 'food-drumstick' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', subtitle: 'Office job, little exercise', icon: 'seat' },
  { id: 'light', label: 'Lightly Active', subtitle: '1-2 days/week', icon: 'walk' },
  { id: 'moderate', label: 'Moderately Active', subtitle: '3-5 days/week', icon: 'run' },
  { id: 'active', label: 'Very Active', subtitle: '6-7 days/week', icon: 'run-fast' },
  { id: 'very_active', label: 'Extremely Active', subtitle: 'Athlete level', icon: 'arm-flex' },
];

const WORKOUT_PLACES = [
  { id: 'gym', label: 'Gym', icon: 'dumbbell' },
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'outdoors', label: 'Outdoors', icon: 'pine-tree' },
  { id: 'mixed', label: 'Mixed', icon: 'shuffle-variant' },
];

const SPORTS = [
  { id: 'running', label: 'Running', icon: 'run' },
  { id: 'cycling', label: 'Cycling', icon: 'bike' },
  { id: 'swimming', label: 'Swimming', icon: 'pool' },
  { id: 'yoga', label: 'Yoga', icon: 'yoga' },
  { id: 'basketball', label: 'Basketball', icon: 'basketball' },
  { id: 'football', label: 'Football', icon: 'soccer' },
  { id: 'tennis', label: 'Tennis', icon: 'tennis' },
  { id: 'none', label: 'No Sports', icon: 'close' },
];

export default function ProfileSetupScreen() {
  const { email } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [showWelcome, setShowWelcome] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const welcomeScale = useRef(new Animated.Value(0)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    goal: '',
    mealPreference: '',
    activityLevel: '',
    height: '',
    weight: '',
    targetWeight:'',
    gender: '',
    age: '',
    dateOfBirth: new Date(),
    workoutPlace: '',
    sports: [],
  });

  useEffect(() => {
    animateStep();
  }, [currentStep]);

  const animateStep = () => {
    slideAnim.setValue(30);
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const progress = currentStep / STEPS.length;

  const handleNext = () => {
    // Validation
    if (currentStep === 1 && (!formData.firstName || !formData.lastName)) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }
    if (currentStep === 2 && !formData.goal) {
      Alert.alert('Required', 'Please select your goal');
      return;
    }
    if (currentStep === 3 && !formData.mealPreference) {
      Alert.alert('Required', 'Please select a meal preference');
      return;
    }
    if (currentStep === 4 && !formData.activityLevel) {
      Alert.alert('Required', 'Please select your activity level');
      return;
    }
    if (currentStep === 5) {
      if (!formData.height || !formData.weight || !formData.targetWeight || !formData.gender || !formData.age) {
        Alert.alert('Required', 'Please fill all personal information');
        return;
      }
    }
    if (currentStep === 6 && !formData.workoutPlace) {
      Alert.alert('Required', 'Please select a workout preference');
      return;
    }

    if (currentStep === 6) {
      handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_CONFIG.BASE_URL_LOCALHOST}${API_CONFIG.ENDPOINTS.REGISTRATION.PORT}${API_CONFIG.ENDPOINTS.REGISTRATION.CREATE_PROFILE}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          email,
          dateOfBirth: formData.dateOfBirth.toISOString(),
        }),
      });

      if (response.ok) {
        showWelcomeAnimation();
      } else {
        const error = await response.text();
        Alert.alert('Error', error || 'Failed to complete profile');
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      Alert.alert('Error', 'Unable to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showWelcomeAnimation = () => {
    setShowWelcome(true);
    Animated.parallel([
      Animated.spring(welcomeScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(welcomeOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      router.replace('/home');
    }, 3000);
  };

  const toggleSport = (sportId) => {
    setFormData(prev => ({
      ...prev,
      sports: prev.sports.includes(sportId)
        ? prev.sports.filter(s => s !== sportId)
        : [...prev.sports, sportId],
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <MaterialCommunityIcons name="account-circle" size={80} color="#4A90E2" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>{STEPS[0].title}</Text>
            
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#666"
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#666"
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <MaterialCommunityIcons name="target" size={80} color="#4A90E2" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>{STEPS[1].title}</Text>
            
            <View style={styles.optionsGrid}>
              {GOAL_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    formData.goal === option.id && styles.optionCardSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, goal: option.id })}
                >
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={40}
                    color={formData.goal === option.id ? option.color : '#666'}
                  />
                  <Text style={[
                    styles.optionLabel,
                    formData.goal === option.id && { color: option.color },
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <MaterialCommunityIcons name="food" size={80} color="#4A90E2" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>{STEPS[2].title}</Text>
            
            <View style={styles.optionsGrid}>
              {MEAL_PREFERENCES.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    formData.mealPreference === option.id && styles.optionCardSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, mealPreference: option.id })}
                >
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={32}
                    color={formData.mealPreference === option.id ? '#4A90E2' : '#666'}
                  />
                  <Text style={[
                    styles.optionLabel,
                    formData.mealPreference === option.id && styles.optionLabelSelected,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <MaterialCommunityIcons name="run-fast" size={80} color="#4A90E2" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>{STEPS[3].title}</Text>
            
            <View style={styles.listContainer}>
              {ACTIVITY_LEVELS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.listItem,
                    formData.activityLevel === option.id && styles.listItemSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, activityLevel: option.id })}
                >
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={28}
                    color={formData.activityLevel === option.id ? '#4A90E2' : '#666'}
                  />
                  <View style={styles.listItemText}>
                    <Text style={[
                      styles.listItemLabel,
                      formData.activityLevel === option.id && styles.listItemLabelSelected,
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={styles.listItemSubtitle}>{option.subtitle}</Text>
                  </View>
                  {formData.activityLevel === option.id && (
                    <MaterialCommunityIcons name="check-circle" size={24} color="#4A90E2" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <MaterialCommunityIcons name="account-details" size={80} color="#4A90E2" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>{STEPS[4].title}</Text>
            
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="170"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={formData.height}
                  onChangeText={(text) => setFormData({ ...formData, height: text })}
                />
              </View>
              
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="70"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={formData.weight}
                  onChangeText={(text) => setFormData({ ...formData, weight: text })}
                />
              </View>

              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Target Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="70"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={formData.targetWeight}
                  onChangeText={(text) => setFormData({ ...formData, targetWeight: text })}
                />
              </View> 
            </View>

            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {['Male', 'Female', 'Other'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderButton,
                    formData.gender === g && styles.genderButtonSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, gender: g })}
                >
                  <Text style={[
                    styles.genderButtonText,
                    formData.gender === g && styles.genderButtonTextSelected,
                  ]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="25"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={formData.age}
              onChangeText={(text) => setFormData({ ...formData, age: text })}
            />

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialCommunityIcons name="calendar" size={20} color="#4A90E2" />
              <Text style={styles.dateButtonText}>
                {formData.dateOfBirth.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={formData.dateOfBirth}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    setFormData({ ...formData, dateOfBirth: date });
                  }
                }}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
              />
            )}
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContainer}>
            <MaterialCommunityIcons name="dumbbell" size={80} color="#4A90E2" style={styles.stepIcon} />
            <Text style={styles.stepTitle}>{STEPS[5].title}</Text>
            
            <Text style={styles.sectionLabel}>Where do you prefer to workout?</Text>
            <View style={styles.optionsGrid}>
              {WORKOUT_PLACES.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    formData.workoutPlace === option.id && styles.optionCardSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, workoutPlace: option.id })}
                >
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={32}
                    color={formData.workoutPlace === option.id ? '#4A90E2' : '#666'}
                  />
                  <Text style={[
                    styles.optionLabel,
                    formData.workoutPlace === option.id && styles.optionLabelSelected,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Any sports you enjoy?</Text>
            <View style={styles.sportsGrid}>
              {SPORTS.map((sport) => (
                <TouchableOpacity
                  key={sport.id}
                  style={[
                    styles.sportChip,
                    formData.sports.includes(sport.id) && styles.sportChipSelected,
                  ]}
                  onPress={() => toggleSport(sport.id)}
                >
                  <MaterialCommunityIcons
                    name={sport.icon}
                    size={20}
                    color={formData.sports.includes(sport.id) ? '#fff' : '#666'}
                  />
                  <Text style={[
                    styles.sportChipText,
                    formData.sports.includes(sport.id) && styles.sportChipTextSelected,
                  ]}>
                    {sport.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#4A90E2', '#357ABD']} style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          disabled={currentStep === 1}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={currentStep === 1 ? 'transparent' : '#fff'}
          />
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>Step {currentStep} of {STEPS.length}</Text>
        </View>
        
        <View style={styles.backButton} />
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
          }}
        >
          {renderStep()}
        </Animated.View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, loading && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Saving...' : currentStep === 6 ? 'Complete' : 'Next'}
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Welcome Modal */}
      {showWelcome && (
        <View style={styles.welcomeOverlay}>
          <Animated.View
            style={[
              styles.welcomeModal,
              {
                transform: [{ scale: welcomeScale }],
                opacity: welcomeOpacity,
              },
            ]}
          >
            <View style={styles.successIconContainer}>
              <MaterialCommunityIcons name="check-circle" size={80} color="#4CAF50" />
            </View>
            <Text style={styles.welcomeTitle}>Welcome to FitMe!</Text>
            <Text style={styles.welcomeSubtitle}>
              Your fitness journey starts now, {formData.firstName}!
            </Text>
            <View style={styles.welcomeStars}>
              {[1, 2, 3].map((i) => (
                <MaterialCommunityIcons key={i} name="star" size={24} color="#FFD700" />
              ))}
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B1E',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  stepContainer: {
    minHeight: height * 0.6,
  },
  stepIcon: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#252830',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  optionCard: {
    width: (width - 72) / 2,
    backgroundColor: '#252830',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  optionCardSelected: {
    borderColor: '#4A90E2',
    backgroundColor: 'rgba(74,144,226,0.1)',
  },
  optionLabel: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: '#4A90E2',
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252830',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  listItemSelected: {
    borderColor: '#4A90E2',
    backgroundColor: 'rgba(74,144,226,0.1)',
  },
  listItemText: {
    flex: 1,
    marginLeft: 12,
  },
  listItemLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listItemLabelSelected: {
    color: '#4A90E2',
  },
  listItemSubtitle: {
    color: '#666',
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
  },
  inputLabel: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#252830',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  genderButtonSelected: {
    borderColor: '#4A90E2',
    backgroundColor: 'rgba(74,144,226,0.1)',
  },
  genderButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  genderButtonTextSelected: {
    color: '#4A90E2',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252830',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionLabel: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 8,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252830',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  sportChipSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  sportChipText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  sportChipTextSelected: {
    color: '#fff',
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    padding: 18,
    gap: 8,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcomeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeModal: {
    backgroundColor: '#252830',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    width: width * 0.85,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  welcomeStars: {
    flexDirection: 'row',
    gap: 8,
  },
});
