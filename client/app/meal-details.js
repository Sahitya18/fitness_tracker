import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, Alert } from 'react-native';
import { Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScannerComponent from '../components/ScannerComponent';

const { width } = Dimensions.get('window');

export default function MealDetailsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const { returnTab } = useLocalSearchParams();

  const handleBack = async () => {
    // Save the return tab to AsyncStorage before going back
    if (returnTab) {
      try {
        await AsyncStorage.setItem('activeTab', returnTab);
        console.log('Saved return tab:', returnTab);
      } catch (error) {
        console.log('Error saving return tab:', error);
      }
    }
    router.back();
  };

  const handleTextExtracted = (text, nutritionalData = null) => {
    setExtractedText(text);
    setSearchQuery(text);
    
    // If we have structured nutritional data, log it for debugging
    if (nutritionalData) {
      console.log('Structured Nutritional Data:', nutritionalData);
      
      // You can use this structured data for automatic macro calculations
      if (nutritionalData.protein) {
        console.log(`Protein: ${nutritionalData.protein.value} ${nutritionalData.protein.unit}`);
      }
      if (nutritionalData.carbohydrates) {
        console.log(`Carbs: ${nutritionalData.carbohydrates.value} ${nutritionalData.carbohydrates.unit}`);
      }
      if (nutritionalData.total_fat) {
        console.log(`Fat: ${nutritionalData.total_fat.value} ${nutritionalData.total_fat.unit}`);
      }
      if (nutritionalData.energy) {
        console.log(`Calories: ${nutritionalData.energy.value} ${nutritionalData.energy.unit}`);
      }
    }
    
    Alert.alert('Success', 'Text extracted successfully! You can now search for this food item.');
  };

  const handleAddManually = () => {
    router.push('/add-meal-manually');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Food Item</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <Surface style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for food items..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </Surface>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <ScannerComponent onTextExtracted={handleTextExtracted} />
        
        <TouchableOpacity style={styles.actionButton} onPress={handleAddManually}>
          <MaterialCommunityIcons name="plus-circle" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Add Manually</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        <Text style={styles.contentText}>Search results will appear here</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B1E',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252830',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    color: '#8E8E93',
    fontSize: 16,
  },
}); 