import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Dimensions, Alert, ScrollView,
} from 'react-native';
import { Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScannerComponent from '../components/ScannerComponent';
import API_CONFIG from '../utils/config';
import { useAuth } from '../utils/AuthContext';

const { width } = Dimensions.get('window');

export default function MealDetailsScreen() {
  const [searchQuery, setSearchQuery]   = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [recentMeals, setRecentMeals]   = useState([]);   // ✅ array now
  const [loading, setLoading]           = useState(false);
  const [results, setResults]           = useState([]);
  const { returnTab }                   = useLocalSearchParams();
  const { userToken }                   = useAuth();

  // Re-read the array every time this screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      loadRecentMeals();
    }, [])
  );

  // ✅ Reads the array
  const loadRecentMeals = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentMeals');
      if (stored) setRecentMeals(JSON.parse(stored));
      else setRecentMeals([]);
    } catch (error) {
      console.error('Error loading recent meals:', error);
    }
  };

  // ✅ Removes one entry by entryId
  const removeMeal = async (entryId) => {
    try {
      const updated = recentMeals.filter((m) => m.entryId !== entryId);
      setRecentMeals(updated);
      await AsyncStorage.setItem('recentMeals', JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing meal:', error);
    }
  };

  // ✅ Clears the whole list
  const clearAllMeals = async () => {
    try {
      await AsyncStorage.removeItem('recentMeals');
      setRecentMeals([]);
    } catch (error) {
      console.error('Error clearing meals:', error);
    }
  };

  const handleBack = async () => {
    if (returnTab) {
      try { await AsyncStorage.setItem('activeTab', returnTab); }
      catch (e) { console.log('Error saving return tab:', e); }
    }
    router.back();
  };

  const handleTextExtracted = (text) => {
    setExtractedText(text);
    setSearchQuery(text);
    Alert.alert('Success', 'Text extracted! You can now search for this food item.');
  };

  const handleAddManually = () => router.push('/add-meal-manually');

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length > 0) searchMeals(searchQuery);
      else setResults([]);
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const searchMeals = async (keyword) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_CONFIG.ENDPOINTS.MEALS.GET_MEALS}?keyword=${encodeURIComponent(keyword)}`,
        { method: 'GET', headers: { Accept: 'application/json', Authorization: `Bearer ${userToken}` } }
      );
      const data = await response.json();
      setResults(data.slice(0, 10));
    } catch (error) {
      console.log('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMeal = (item) => {
    setSearchQuery(item.mealName);
    setResults([]);
    router.push({ pathname: '/food-detail', params: { meal: JSON.stringify(item) } });
  };

  // ── Render one meal card ──────────────────────────────────────────────────
  const renderMealCard = (meal) => (
    <Surface key={meal.entryId} style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealName} numberOfLines={1}>{meal.mealName}</Text>
        <TouchableOpacity onPress={() => removeMeal(meal.entryId)} style={styles.clearButton}>
          <MaterialCommunityIcons name="close" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <Text style={styles.mealWeight}>
        Weight: {meal.weight} {meal.weightUnit}
      </Text>

      <View style={styles.nutritionRow}>
        {[
          { label: 'Cal',     value: meal.calories },
          { label: 'Protein', value: `${meal.protein  || 0}g` },
          { label: 'Carbs',   value: `${meal.carbs    || 0}g` },
          { label: 'Fats',    value: `${meal.fats     || 0}g` },
          { label: 'Fiber',   value: `${meal.fiber    || 0}g` },
        ].map(({ label, value }) => (
          <View key={label} style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>{label}</Text>
            <Text style={styles.nutritionValue}>{value}</Text>
          </View>
        ))}
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

      {/* Search Bar + Results */}
      <View style={styles.searchWrapper}>
        <Surface style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for food items..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setResults([]); }}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </Surface>

        {results.length > 0 && (
          <View style={styles.resultsContainer}>
            <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {results.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.resultItem, index === results.length - 1 && styles.resultItemLast]}
                  onPress={() => handleSelectMeal(item)}
                >
                  <MaterialCommunityIcons name="food" size={16} color="#8E8E93" style={styles.resultIcon} />
                  <Text style={styles.resultText}>{item.mealName}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color="#8E8E93" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <ScannerComponent onTextExtracted={handleTextExtracted} />
        <TouchableOpacity style={styles.actionButton} onPress={handleAddManually}>
          <MaterialCommunityIcons name="plus-circle" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Add Manually</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Meal list — scrollable, shows all entries */}
      <View style={styles.contentArea}>
        {recentMeals.length > 0 ? (
          <>
            {/* Section header with "Clear all" */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Added Meals ({recentMeals.length})
              </Text>
              <TouchableOpacity onPress={clearAllMeals}>
                <Text style={styles.clearAllText}>Clear all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {recentMeals.map((meal) => renderMealCard(meal))}
            </ScrollView>
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="food-apple" size={48} color="#8E8E93" />
            <Text style={styles.contentText}>No meals added yet</Text>
            <Text style={styles.subText}>Search or scan a food item to get started</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// useEffect is still needed for the search debounce, keep it available
const { useEffect } = React;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1B1E', padding: 16 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 40, marginBottom: 24,
  },
  backButton: { padding: 8 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  placeholder: { width: 40 },

  searchWrapper: { marginBottom: 24, zIndex: 999 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#252830', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 16 },
  resultsContainer: {
    backgroundColor: '#252830', borderRadius: 12, marginTop: 6,
    maxHeight: 250, overflow: 'hidden', width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  resultItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 0.5, borderBottomColor: '#333',
  },
  resultItemLast: { borderBottomWidth: 0 },
  resultIcon: { marginRight: 10 },
  resultText: { color: '#FFFFFF', fontSize: 15, flex: 1 },

  buttonContainer: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  actionButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#4A90E2', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 20,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },

  contentArea: { flex: 1 },

  // Section header row
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  clearAllText: { color: '#FF6B35', fontSize: 13, fontWeight: '600' },

  // Meal card
  mealCard: {
    backgroundColor: '#252830', borderRadius: 12,
    padding: 14, marginBottom: 10,
  },
  mealHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  mealName: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', flex: 1, marginRight: 8 },
  mealWeight: { color: '#8E8E93', fontSize: 12, marginBottom: 10 },
  nutritionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  nutritionItem: { alignItems: 'center', flex: 1 },
  nutritionLabel: { color: '#8E8E93', fontSize: 11, marginBottom: 2 },
  nutritionValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentText: { color: '#8E8E93', fontSize: 16, textAlign: 'center', marginTop: 12 },
  subText: { color: '#8E8E93', fontSize: 14, textAlign: 'center', marginTop: 8 },
  clearButton: { padding: 4 },
});
