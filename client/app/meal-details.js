/**
 * MealDetailsScreen.jsx - Point 2: Date-specific data
 * 
 * Changes:
 * - Storage keys now include date (e.g., recentMeals_breakfast_2024-02-20)
 * - Loads meals for the selected date
 * - API sync includes the selected date
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Dimensions, ScrollView,
} from 'react-native';
import { Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScannerComponent from '../components/ScannerComponent';
import API_CONFIG from '../utils/config';
import { useAuth } from '../utils/AuthContext';

const { width } = Dimensions.get('window');

const ALL_MEAL_TYPES = [
  'breakfast',
  'post_breakfast',
  'lunch',
  'post_lunch',
  'pre_workout',
  'dinner',
];

// ═══ POINT 2: Storage key now includes date ═══
const storageKey = (mealType, date) => {
  if (!date) return `recentMeals_${mealType}`;
  const dateStr = new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD
  return `recentMeals_${mealType}_${dateStr}`;
};

const toCamelCase = (str) => str.replace(/_([a-z])/g, (_, l) => l.toUpperCase());

export default function MealDetailsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentMeals, setRecentMeals] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [results,     setResults]     = useState([]);

  // ═══ POINT 2: Get selectedDate from params ═══
  const { mealType, mealLabel, returnTab, selectedDate } = useLocalSearchParams();
  const { userToken, userData } = useAuth();
  
  // ═══ POINT 2: Storage key includes selected date ═══
  const STORAGE_KEY = storageKey(mealType, selectedDate);

  console.log('MealDetailsScreen loaded:');
  console.log('- mealType:', mealType);
  console.log('- selectedDate:', selectedDate);
  console.log('- STORAGE_KEY:', STORAGE_KEY);

  useFocusEffect(
    React.useCallback(() => {
      console.log('=== MEAL DETAILS SCREEN FOCUSED ===');
      console.log('Loading meals for:', STORAGE_KEY);
      loadMeals();
    }, [mealType, selectedDate])
  );

  const loadMeals = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const meals = stored ? JSON.parse(stored) : [];
      console.log('Loaded meals count:', meals.length);
      setRecentMeals(meals);
    } catch (e) {
      console.error('loadMeals error:', e);
    }
  };

  // ═══ POINT 2: Build all meals payload for the selected date ═══
  const buildAllMealsPayload = async (currentSlotItems) => {
    const mealDate = selectedDate
      ? new Date(selectedDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const meals = [];

    for (const slot of ALL_MEAL_TYPES) {
      let items;
      if (slot === mealType) {
        items = currentSlotItems;
      } else {
        const key = storageKey(slot, selectedDate);
        const stored = await AsyncStorage.getItem(key);
        items = stored ? JSON.parse(stored) : [];
      }

      if (items.length === 0) continue;

      const mappedItems = items.map(m => ({
        name:     m.mealName,
        quantity: `${m.weight}${m.weightUnit}`,
        macros: {
          protein:  parseFloat(m.protein)  || 0,
          carbs:    parseFloat(m.carbs)    || 0,
          fat:      parseFloat(m.fats)     || 0,
          fiber:    parseFloat(m.fiber)    || 0,
          calories: parseFloat(m.calories) || 0,
        },
      }));

      meals.push({
        mealType:      toCamelCase(slot),
        items:         mappedItems,
        totalCalories: mappedItems.reduce((s, i) => s + i.macros.calories, 0),
      });
    }

    return { mealDate, userId: userData?.id || null, meals };
  };

  // ═══ POINT 2: Sync all meals for the selected date ═══
  const syncAllMealsToBackend = async (currentSlotItems) => {
    try {
      const [token, userId] = await AsyncStorage.multiGet(['userToken', 'userId'])
        .then(pairs => pairs.map(([, v]) => v));
      if (!token) return;

      const payload = await buildAllMealsPayload(currentSlotItems);
      if (userId) payload.userId = userData.id;
      
      console.log('=== SYNCING TO BACKEND ===');
      console.log('Date:', payload.mealDate);
      console.log('Meals:', payload.meals.length);
      console.log('Full payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(
        `${API_CONFIG.BASE_URL_LOCALHOST}${API_CONFIG.ENDPOINTS.MEALS.PORT}${API_CONFIG.ENDPOINTS.MEALS.UPDATE_MEAL}`,
        {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        console.log('✓ Backend sync successful');
      } else {
        const errorText = await response.text();
        console.error('✗ Backend sync failed:', response.status, errorText);
      }
    } catch (error) {
      console.error('✗ Sync error:', error);
    }
  };

  const removeMeal = async (entryId) => {
    try {
      const updated = recentMeals.filter(m => m.entryId !== entryId);
      setRecentMeals(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      await syncAllMealsToBackend(updated);
    } catch (e) {
      console.error('removeMeal error:', e);
    }
  };

  const clearAll = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setRecentMeals([]);
      await syncAllMealsToBackend([]);
    } catch (e) {
      console.error('clearAll error:', e);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleEditMeal = (meal) => {
    router.push({
      pathname: '/food-detail',
      params: {
        meal:        JSON.stringify(meal),
        mealType,
        returnTab:   returnTab || 'kitchen',
        editEntryId: meal.entryId,
        selectedDate: selectedDate, // ═══ POINT 2: Pass date to edit screen ═══
      },
    });
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery.trim().length > 0) searchMeals(searchQuery);
      else setResults([]);
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const searchMeals = async (keyword) => {
    try {
      setLoading(true);
      const url = `${API_CONFIG.BASE_URL_LOCALHOST}${API_CONFIG.ENDPOINTS.MEALS.PORT}${API_CONFIG.ENDPOINTS.MEALS.GET_MEALS}?keyword=${encodeURIComponent(keyword)}`;
      const response = await fetch(url, {
        method:  'GET',
        headers: { Accept: 'application/json', Authorization: `Bearer ${userToken}` },
      });
      const data = await response.json();
      setResults(data.slice(0, 10));
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMeal = (item) => {
    setSearchQuery(item.mealName);
    setResults([]);
    router.push({
      pathname: '/food-detail',
      params: { 
        meal: JSON.stringify(item), 
        mealType, 
        returnTab: returnTab || 'kitchen',
        selectedDate: selectedDate, // ═══ POINT 2: Pass date ═══
      },
    });
  };

  const renderMealCard = (meal) => (
    <Surface key={meal.entryId} style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealName} numberOfLines={1}>{meal.mealName}</Text>
        <View style={styles.mealActions}>
          <TouchableOpacity
            onPress={() => handleEditMeal(meal)}
            style={[styles.actionBtn, styles.editBtn]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="pencil" size={15} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => removeMeal(meal.entryId)}
            style={[styles.actionBtn, styles.deleteBtn]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="close" size={15} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.mealWeight}>{meal.weight} {meal.weightUnit}</Text>

      <View style={styles.nutritionRow}>
        {[
          { label: 'Cal',     value: meal.calories           },
          { label: 'Protein', value: `${meal.protein || 0}g` },
          { label: 'Carbs',   value: `${meal.carbs   || 0}g` },
          { label: 'Fats',    value: `${meal.fats    || 0}g` },
          { label: 'Fiber',   value: `${meal.fiber   || 0}g` },
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
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{mealLabel || 'Add Food Item'}</Text>
          {mealLabel && <Text style={styles.headerSub}>Add food to this meal</Text>}
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchWrapper}>
        <Surface style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search food for ${mealLabel || 'this meal'}...`}
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
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

      <View style={styles.buttonContainer}>
        <ScannerComponent onTextExtracted={(text) => setSearchQuery(text)} />
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            console.log('=== ADD MANUALLY BUTTON PRESSED ===');
            console.log('Passing params:', {
              mealType,
              mealLabel,
              returnTab: returnTab || 'kitchen',
              selectedDate: selectedDate,
            });
            
            router.push({
              pathname: '/add-meal-manually',
              params: { 
                mealType, 
                mealLabel, 
                returnTab: returnTab || 'kitchen',
                selectedDate: selectedDate, // ═══ POINT 2: Pass date ═══
              },
            });
          }}
        >
          <MaterialCommunityIcons name="plus-circle" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Add Manually</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentArea}>
        {recentMeals.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{mealLabel || 'Meals'} ({recentMeals.length})</Text>
              <TouchableOpacity onPress={clearAll}>
                <Text style={styles.clearAllText}>Clear all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {recentMeals.map(renderMealCard)}
            </ScrollView>
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="food-apple" size={48} color="#8E8E93" />
            <Text style={styles.contentText}>No food added to {mealLabel || 'this meal'} yet</Text>
            <Text style={styles.subText}>Search above to add food items</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#1A1B1E', padding: 16 },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 24 },
  backButton:   { padding: 8 },
  headerCenter: { alignItems: 'center' },
  headerTitle:  { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  headerSub:    { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  placeholder:  { width: 40 },
  searchWrapper:    { marginBottom: 16, zIndex: 999 },
  searchContainer:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#252830', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  searchIcon:       { marginRight: 12 },
  searchInput:      { flex: 1, color: '#FFFFFF', fontSize: 16 },
  resultsContainer: { backgroundColor: '#252830', borderRadius: 12, marginTop: 6, maxHeight: 250, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  resultItem:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: '#333' },
  resultItemLast:   { borderBottomWidth: 0 },
  resultIcon:       { marginRight: 10 },
  resultText:       { color: '#FFFFFF', fontSize: 15, flex: 1 },
  buttonContainer: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  actionButton:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4A90E2', borderRadius: 12, paddingVertical: 16 },
  buttonText:      { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  contentArea:   { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:  { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  clearAllText:  { color: '#FF6B35', fontSize: 13, fontWeight: '600' },
  mealCard:   { backgroundColor: '#252830', borderRadius: 12, padding: 14, marginBottom: 10 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  mealName:   { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', flex: 1, marginRight: 8 },
  mealActions: { flexDirection: 'row', gap: 6 },
  actionBtn:   { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  editBtn:     { backgroundColor: 'rgba(74,144,226,0.15)' },
  deleteBtn:   { backgroundColor: 'rgba(255,107,107,0.12)' },
  mealWeight:     { color: '#8E8E93', fontSize: 12, marginBottom: 10 },
  nutritionRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  nutritionItem:  { alignItems: 'center', flex: 1 },
  nutritionLabel: { color: '#8E8E93', fontSize: 11, marginBottom: 2 },
  nutritionValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  emptyState:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentText: { color: '#8E8E93', fontSize: 16, textAlign: 'center', marginTop: 12 },
  subText:     { color: '#8E8E93', fontSize: 14, textAlign: 'center', marginTop: 8 },
});
