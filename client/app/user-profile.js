import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Platform, ActivityIndicator } from 'react-native';
import { Surface, Avatar, Divider, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../utils/AuthContext';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import API_CONFIG from '../utils/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserProfileScreen() {
  const { userData: authUserData, userToken } = useAuth();
  const [selectedTab, setSelectedTab] = useState('personal');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [tempUserData, setTempUserData] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [genderOptions] = useState(['Male', 'Female', 'Don\'t want to disclose']);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Fetch user profile data on mount ──────────────────────────────────────
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Error', 'No authentication token found');
        router.replace('/login');
        return;
      }

      console.log('Fetching user profile...');
      const response = await fetch(`${API_CONFIG.BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile data fetched:', data);
        setTempUserData(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch profile:', errorText);
        Alert.alert('Error', 'Failed to load profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Unable to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── User records derived from fetched data ────────────────────────────────
  const captialName = (text) =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
  const userRecords = {
    personal: [
      { label: 'Full Name', value: captialName(tempUserData?.name) || 'N/A', icon: 'account', editable: true },
      { label: 'Email', value: tempUserData?.email || 'N/A', icon: 'email', editable: false },
      { label: 'Mobile', value: tempUserData?.mobile || 'N/A', icon: 'phone', editable: true },
      { label: 'Date of Birth', value: tempUserData?.dateOfBirth || 'N/A', icon: 'calendar', editable: true },
      { label: 'Gender', value: tempUserData?.gender || 'N/A', icon: 'gender-male-female', editable: true },
    ],
    fitness: [
      { label: 'Current Weight', value: tempUserData?.weight ? `${tempUserData.weight} kg` : 'N/A', icon: 'scale', editable: true },
      { label: 'Target Weight', value: tempUserData?.targetWeight ? `${tempUserData.targetWeight} kg` : 'N/A', icon: 'target', editable: true },
      { label: 'Height', value: tempUserData?.height ? `${tempUserData.height} cm` : 'N/A', icon: 'ruler', editable: true },
      { label: 'Fitness Goal', value: tempUserData?.fitnessGoal || 'N/A', icon: 'dumbbell', editable: true },
      { label: 'Activity Level', value: tempUserData?.activityLevel || 'N/A', icon: 'run', editable: true },
    ],
    achievements: [
      { label: 'Current Streak', value: tempUserData?.currentStreak || '0 days', icon: 'fire', color: '#FF6B6B' },
      { label: 'Total Workouts', value: tempUserData?.totalWorkouts || '0 sessions', icon: 'dumbbell', color: '#4ECDC4' },
      { label: 'Calories Burned', value: tempUserData?.caloriesBurned || '0 kcal', icon: 'fire', color: '#FFA726' },
      { label: 'Weight Lost', value: tempUserData?.weightLost || '0 kg', icon: 'trending-down', color: '#66BB6A' },
      { label: 'Goal Progress', value: tempUserData?.goalProgress || '0%', icon: 'target', color: '#42A5F5' },
    ],
    stats: [
      { label: 'Average Daily Calories', value: tempUserData?.avgDailyCalories || 'N/A', icon: 'food-apple' },
      { label: 'Weekly Workouts', value: tempUserData?.weeklyWorkouts || 'N/A', icon: 'calendar-week' },
      { label: 'Water Intake', value: tempUserData?.waterIntake || 'N/A', icon: 'water' },
      { label: 'Sleep Average', value: tempUserData?.sleepAverage || 'N/A', icon: 'sleep' },
      { label: 'Steps Average', value: tempUserData?.stepsAverage || 'N/A', icon: 'walk' },
    ]
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: 'account' },
    { id: 'fitness', label: 'Fitness', icon: 'dumbbell' },
    { id: 'achievements', label: 'Achievements', icon: 'trophy' },
    { id: 'stats', label: 'Statistics', icon: 'chart-line' },
  ];

  const handleEditField = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue);
    
    if (field === 'Date of Birth') {
      setShowDatePicker(true);
    } else if (field === 'Gender') {
      setShowGenderPicker(true);
    } else {
      setEditModalVisible(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editValue.trim()) {
      Alert.alert('Invalid Input', 'Please enter a valid value');
      return;
    }

    const fieldMapping = {
      'Full Name': 'name',
      'Mobile': 'mobile',
      'Date of Birth': 'dateOfBirth',
      'Gender': 'gender',
      'Current Weight': 'weight',
      'Target Weight': 'targetWeight',
      'Height': 'height',
      'Fitness Goal': 'fitnessGoal',
      'Activity Level': 'activityLevel'
    };

    const fieldKey = fieldMapping[editingField];
    if (!fieldKey) return;

    try {
      await updateUserProfile(fieldKey, editValue);
      
      const updatedData = { ...tempUserData };
      updatedData[fieldKey] = editValue;
      setTempUserData(updatedData);
      
      Alert.alert('Success', `${editingField} updated successfully!`);
    } catch (error) {
      Alert.alert('Error', `Failed to update ${editingField}: ${error.message}`);
    }
    
    setEditModalVisible(false);
    setEditingField(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setShowDatePicker(false);
    setShowGenderPicker(false);
    setEditingField(null);
    setEditValue('');
  };

  const handleDateChange = async (event, date) => {
    setShowDatePicker(false);
    
    if (date && event.type !== 'dismissed') {
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      try {
        await updateUserProfile('dateOfBirth', formattedDate);
        
        const updatedData = { ...tempUserData };
        updatedData.dateOfBirth = formattedDate;
        setTempUserData(updatedData);
        
        Alert.alert('Success', 'Date of Birth updated successfully!');
      } catch (error) {
        Alert.alert('Error', `Failed to update Date of Birth: ${error.message}`);
      }
    }
    
    setEditingField(null);
  };

  const handleGenderSelect = async (gender) => {
    setShowGenderPicker(false);
    
    try {
      await updateUserProfile('gender', gender);
      
      const updatedData = { ...tempUserData };
      updatedData.gender = gender;
      setTempUserData(updatedData);
      
      Alert.alert('Success', 'Gender updated successfully!');
    } catch (error) {
      Alert.alert('Error', `Failed to update Gender: ${error.message}`);
    }
    
    setEditingField(null);
  };

  // ── Update user profile via API ───────────────────────────────────────────
  const updateUserProfile = async (field, value) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log(`Updating ${field} to: ${value}`);
      console.log("api:: ", `${API_CONFIG.BASE_URL_LOCALHOST}${API_CONFIG.ENDPOINTS.REGISTRATION.PORT}${API_CONFIG.ENDPOINTS.REGISTRATION.UPDATE_PROFILE}`)
      const response = await fetch(`${API_CONFIG.BASE_URL_LOCALHOST}${API_CONFIG.ENDPOINTS.REGISTRATION.PORT}${API_CONFIG.ENDPOINTS.REGISTRATION.UPDATE_PROFILE}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: tempUserData.email,  // Send email ID
          field: field,                // Field name
          value: value,                // New value
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update profile');
      }

      const result = await response.json();
      console.log('Update successful:', result);
      return result;
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      throw error;
    }
  };

  const renderRecordItem = (record) => {
    return (
      <View key={record.label} style={styles.recordItem}>
        <View style={styles.recordLeft}>
          <MaterialCommunityIcons 
            name={record.icon} 
            size={24} 
            color={record.color || '#4A90E2'} 
            style={styles.recordIcon}
          />
          <View style={styles.recordText}>
            <Text style={styles.recordLabel}>{record.label}</Text>
            <Text style={[styles.recordValue, record.color && { color: record.color }]}>
              {record.value}
            </Text>
          </View>
        </View>
        {record.label === 'Email' && (
          <MaterialCommunityIcons name="lock" size={16} color="#666" />
        )}
        {record.editable && (
          <TouchableOpacity 
            style={styles.editIconButton}
            onPress={() => handleEditField(record.label, record.value)}
          >
            <MaterialCommunityIcons name="pencil" size={16} color="#4A90E2" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Profile</Text>
        <TouchableOpacity onPress={fetchUserProfile} style={styles.refreshButton}>
          {/* <MaterialCommunityIcons name="refresh" size={24} color="#4A90E2" /> */}
        </TouchableOpacity>
      </View>

      {/* Profile Image Section */}
      <Surface style={styles.profileImageSection}>
        <View style={styles.profileImageContainer}>
          <Avatar.Image
            size={120}
            source={{ 
              uri: tempUserData?.profilePic || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&q=80' 
            }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.cameraButton}>
            <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{tempUserData?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{tempUserData?.email || 'N/A'}</Text>
      </Surface>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <MaterialCommunityIcons 
                name={tab.icon} 
                size={20} 
                color={selectedTab === tab.id ? '#FFFFFF' : '#666'} 
              />
              <Text style={[styles.tabText, selectedTab === tab.id && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content Section */}
      <Surface style={styles.contentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedTab === 'personal' && 'Personal Information'}
            {selectedTab === 'fitness' && 'Fitness Profile'}
            {selectedTab === 'achievements' && 'Achievements & Milestones'}
            {selectedTab === 'stats' && 'Health Statistics'}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {selectedTab === 'personal' && 'Your basic personal details'}
            {selectedTab === 'fitness' && 'Your fitness goals and measurements'}
            {selectedTab === 'achievements' && 'Your fitness journey milestones'}
            {selectedTab === 'stats' && 'Your health and activity statistics'}
          </Text>
        </View>

        <View style={styles.recordsContainer}>
          {userRecords[selectedTab].map((record, index) => (
            <React.Fragment key={record.label}>
              {renderRecordItem(record)}
              {index < userRecords[selectedTab].length - 1 && (
                <Divider style={styles.divider} />
              )}
            </React.Fragment>
          ))}
        </View>
      </Surface>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit {editingField}</Text>
            <TextInput
              style={styles.editInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`Enter ${editingField?.toLowerCase()}`}
              placeholderTextColor="#666"
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={handleCancelEdit}
                style={styles.modalButton}
                labelStyle={styles.modalButtonText}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveEdit}
                style={styles.modalButton}
                labelStyle={styles.modalButtonText}
              >
                Save
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}

      {/* Gender Picker Modal */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            <View style={styles.genderOptionsContainer}>
              {genderOptions.map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderOption,
                    tempUserData?.gender === gender && styles.selectedGenderOption
                  ]}
                  onPress={() => handleGenderSelect(gender)}
                >
                  <Text style={[
                    styles.genderOptionText,
                    tempUserData?.gender === gender && styles.selectedGenderOptionText
                  ]}>
                    {gender}
                  </Text>
                  {tempUserData?.gender === gender && (
                    <MaterialCommunityIcons name="check" size={20} color="#4A90E2" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelEdit}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B1E',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1A1B1E',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  refreshButton: {
    padding: 8,
  },
  profileImageSection: {
    backgroundColor: '#23243A',
    borderRadius: 20,
    margin: 16,
    padding: 24,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    borderWidth: 4,
    borderColor: '#4A90E2',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#23243A',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#999',
  },
  tabContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23243A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
    minWidth: 100,
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#4A90E2',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  contentSection: {
    backgroundColor: '#23243A',
    borderRadius: 20,
    margin: 16,
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  recordsContainer: {
    marginTop: 10,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordIcon: {
    marginRight: 16,
  },
  recordText: {
    flex: 1,
  },
  recordLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 2,
  },
  recordValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    backgroundColor: '#333',
    height: 1,
  },
  editIconButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#23243A',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  editInput: {
    backgroundColor: '#1A1B1E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  genderOptionsContainer: {
    marginBottom: 20,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#1A1B1E',
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedGenderOption: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderColor: '#4A90E2',
  },
  genderOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  selectedGenderOptionText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
});
