import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, Alert, ScrollView } from 'react-native';
import { Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScannerComponent from '../components/ScannerComponent';
import API_CONFIG from '../utils/config';
import { useAuth } from '../utils/AuthContext';

const { width } = Dimensions.get('window');

export default function MealDetailsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [recentMeal, setRecentMeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const { returnTab } = useLocalSearchParams();
  const { userToken } = useAuth();

  useEffect(() => {
    // Check if there's a recent meal stored locally
    checkRecentMeal();
  }, []);

  const checkRecentMeal = async () => {
    try {
      const storedMeal = await AsyncStorage.getItem('recentMeal');
      if (storedMeal) {
        setRecentMeal(JSON.parse(storedMeal));
      }
    } catch (error) {
      console.error('Error checking recent meal:', error);
    }
  };

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

  const clearRecentMeal = async () => {
    try {
      await AsyncStorage.removeItem('recentMeal');
      setRecentMeal(null);
    } catch (error) {
      console.error('Error clearing recent meal:', error);
    }
  };

  const renderRecentMeal = (meal) => (
    <Surface style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealName}>{meal.mealName}</Text>
        <TouchableOpacity onPress={clearRecentMeal} style={styles.clearButton}>
          <MaterialCommunityIcons name="close" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.mealInfo}>
        <Text style={styles.mealWeight}>Weight: {meal.weight} {meal.weightUnit}</Text>
      </View>
      
      <View style={styles.nutritionRow}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Calories</Text>
          <Text style={styles.nutritionValue}>{meal.calories}</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Protein</Text>
          <Text style={styles.nutritionValue}>{meal.protein || '0'}g</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Carbs</Text>
          <Text style={styles.nutritionValue}>{meal.carbs || '0'}g</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Fats</Text>
          <Text style={styles.nutritionValue}>{meal.fats || '0'}g</Text>
        </View>
      </View>
      
      
    </Surface>
  );

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
        {recentMeal ? (
          <View style={styles.recentMealContainer}>
            <Text style={styles.sectionTitle}>Recently Added Meal</Text>
            {renderRecentMeal(recentMeal)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="food-apple" size={48} color="#8E8E93" />
            <Text style={styles.contentText}>No meals added yet</Text>
            <Text style={styles.subText}>Add your first meal manually or scan a food item</Text>
          </View>
        )}
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
  refreshButton: {
    padding: 8,
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
  },
  contentText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  mealCard: {
    backgroundColor: '#252830',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  mealWeight: {
    color: '#8E8E93',
    fontSize: 14,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  nutritionLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 4,
  },
  nutritionValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subText: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  clearButton: {
    padding: 8,
  },
  mealInfo: {
    marginBottom: 12,
  },
  successMessage: {
    color: '#4CAF50',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  recentMealContainer: {
    marginTop: 16,
  },
  placeholder: {
    width: 40, // Adjust as needed for spacing
  },
}); 