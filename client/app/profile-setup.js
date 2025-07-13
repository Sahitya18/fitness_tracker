import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, ProgressBar, useTheme, SegmentedButtons } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from '@react-native-picker/picker';
import API_CONFIG from '../utils/config';

export default function ProfileSetupScreen() {
  const theme = useTheme();
  const { email } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    height: '',
    weight: '',
    fitnessGoal: 'weight_loss',
    activityLevel: 'moderate',
    targetWeight: '',
    weeklyGoal: '0.5',
    dietaryPreference: 'none',
    workoutPreference: 'gym'
  });

  const fitnessGoals = [
    { label: 'Weight Loss', value: 'weight_loss' },
    { label: 'Muscle Gain', value: 'muscle_gain' },
    { label: 'Maintain Weight', value: 'maintain' },
    { label: 'Improve Fitness', value: 'fitness' }
  ];

  const activityLevels = [
    { label: 'Sedentary (Office job)', value: 'sedentary' },
    { label: 'Light Exercise (1-2 days/week)', value: 'light' },
    { label: 'Moderate Exercise (3-5 days/week)', value: 'moderate' },
    { label: 'Very Active (6-7 days/week)', value: 'very_active' },
    { label: 'Extremely Active (Athletes)', value: 'extremely_active' }
  ];

  const dietaryPreferences = [
    { label: 'No Preference', value: 'none' },
    { label: 'Vegetarian', value: 'vegetarian' },
    { label: 'Vegan', value: 'vegan' },
    { label: 'Keto', value: 'keto' },
    { label: 'Paleo', value: 'paleo' }
  ];

  const workoutPreferences = [
    { label: 'Gym', value: 'gym' },
    { label: 'Home', value: 'home' },
    { label: 'Outdoors', value: 'outdoors' },
    { label: 'Mixed', value: 'mixed' }
  ];

  const weeklyGoals = [
    { label: '0.25 kg per week', value: '0.25' },
    { label: '0.5 kg per week', value: '0.5' },
    { label: '1 kg per week', value: '1.0' }
  ];

  const handleDateConfirm = (date) => {
    setFormData({
      ...formData,
      dateOfBirth: date.toISOString().split('T')[0]
    });
    setDatePickerVisible(false);
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName) {
      Alert.alert('Validation', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTRATION.COMPLETE_PROFILE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          email,
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          targetWeight: parseFloat(formData.targetWeight)
        }),
      });

      if (res.ok) {
        Alert.alert(
          'Success', 
          'Profile setup complete! Let\'s start your fitness journey.', 
          [{ text: 'Continue', onPress: () => router.replace('/home') }]
        );
      } else {
        Alert.alert('Error', await res.text());
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
        <Text variant="headlineMedium" style={styles.title}>Complete Your Profile</Text>
        
        <ProgressBar
          progress={0.7}
          color={theme.colors.primary}
          style={styles.progressBar}
        />
        
        <Text variant="titleMedium" style={styles.subtitle}>Step 2: Fitness Profile</Text>

        <View style={styles.row}>
          <TextInput
            label="First Name"
            value={formData.firstName}
            onChangeText={(value) => setFormData({...formData, firstName: value})}
            mode="outlined"
            style={[styles.input, styles.flex1]}
          />
          <View style={styles.spacer} />
          <TextInput
            label="Last Name"
            value={formData.lastName}
            onChangeText={(value) => setFormData({...formData, lastName: value})}
            mode="outlined"
            style={[styles.input, styles.flex1]}
          />
        </View>

        <TextInput
          label="Date of Birth"
          value={formData.dateOfBirth}
          onPressIn={() => setDatePickerVisible(true)}
          mode="outlined"
          style={styles.input}
          right={<TextInput.Icon icon="calendar" />}
          editable={false}
        />

        <SegmentedButtons
          value={formData.gender}
          onValueChange={value => setFormData({...formData, gender: value})}
          buttons={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' }
          ]}
          style={styles.segmentedButton}
        />

        <View style={styles.row}>
          <TextInput
            label="Height (cm)"
            value={formData.height}
            onChangeText={(value) => setFormData({...formData, height: value})}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.input, styles.flex1]}
          />
          <View style={styles.spacer} />
          <TextInput
            label="Weight (kg)"
            value={formData.weight}
            onChangeText={(value) => setFormData({...formData, weight: value})}
            keyboardType="numeric"
            mode="outlined"
            style={[styles.input, styles.flex1]}
          />
        </View>

        <TextInput
          label="Target Weight (kg)"
          value={formData.targetWeight}
          onChangeText={(value) => setFormData({...formData, targetWeight: value})}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Weekly Goal</Text>
          <Picker
            selectedValue={formData.weeklyGoal}
            onValueChange={(value) => setFormData({...formData, weeklyGoal: value})}
            style={styles.picker}
          >
            {weeklyGoals.map((goal) => (
              <Picker.Item key={goal.value} label={goal.label} value={goal.value} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Fitness Goal</Text>
          <Picker
            selectedValue={formData.fitnessGoal}
            onValueChange={(value) => setFormData({...formData, fitnessGoal: value})}
            style={styles.picker}
          >
            {fitnessGoals.map((goal) => (
              <Picker.Item key={goal.value} label={goal.label} value={goal.value} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Activity Level</Text>
          <Picker
            selectedValue={formData.activityLevel}
            onValueChange={(value) => setFormData({...formData, activityLevel: value})}
            style={styles.picker}
          >
            {activityLevels.map((level) => (
              <Picker.Item key={level.value} label={level.label} value={level.value} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Dietary Preference</Text>
          <Picker
            selectedValue={formData.dietaryPreference}
            onValueChange={(value) => setFormData({...formData, dietaryPreference: value})}
            style={styles.picker}
          >
            {dietaryPreferences.map((pref) => (
              <Picker.Item key={pref.value} label={pref.label} value={pref.value} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Preferred Workout Location</Text>
          <Picker
            selectedValue={formData.workoutPreference}
            onValueChange={(value) => setFormData({...formData, workoutPreference: value})}
            style={styles.picker}
          >
            {workoutPreferences.map((pref) => (
              <Picker.Item key={pref.value} label={pref.label} value={pref.value} />
            ))}
          </Picker>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Complete Setup
        </Button>
      </Surface>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisible(false)}
        maximumDate={new Date()}
      />
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
    marginBottom: 8,
  },
  subtitle: {
    marginVertical: 16,
    opacity: 0.7,
  },
  progressBar: {
    marginVertical: 8,
    height: 8,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  spacer: {
    width: 12,
  },
  input: {
    marginBottom: 16,
  },
  segmentedButton: {
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#666',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 45,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 6,
  },
}); 