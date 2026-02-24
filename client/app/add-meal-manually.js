import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, Alert,
  TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import API_CONFIG from '../utils/config';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../utils/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const UNITS = ['g', 'kg', 'oz', 'lb', 'ml'];

// ═══ POINT 2: Storage key includes date ═══
const storageKey = (mealType, date) => {
  if (!date) return `recentMeals_${mealType}`;
  const dateStr = new Date(date).toISOString().split('T')[0];
  return `recentMeals_${mealType}_${dateStr}`;
};

const ALL_MEAL_TYPES = [
  'breakfast', 'post_breakfast', 'lunch', 'post_lunch', 'pre_workout', 'dinner',
];

const toCamelCase = (str) => str.replace(/_([a-z])/g, (_, l) => l.toUpperCase());

export default function AddMealManuallyScreen() {
  const router = useRouter();
  const { userToken } = useAuth();
  const { mealType, mealLabel, returnTab, selectedDate } = useLocalSearchParams();
  
  const [form, setForm] = useState({
    name: '',
    weight: '',
    weightUnit: 'g',
    calories: '',
    carbs: '',
    protein: '',
    fats: '',
    fiber: '',
  });
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    console.log('AddMealManually loaded:');
    console.log('- mealType:', mealType);
    console.log('- selectedDate:', selectedDate);
    
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // ═══ POINT 2: Storage key includes date ═══
  const STORAGE_KEY = storageKey(mealType, selectedDate);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.weight || !form.calories) {
      Alert.alert('Required Fields', 'Please fill in Name, Weight, and Calories');
      return;
    }

    if (!userToken) {
      Alert.alert('Error', 'You must be logged in to add meals');
      return;
    }

    if (!mealType) {
      Alert.alert('Error', 'Meal type is missing. Please go back and try again.');
      return;
    }

    setLoading(true);

    try {
      const mealData = {
        mealName: form.name.trim(),
        weight: parseFloat(form.weight),
        weightUnit: form.weightUnit,
        calories: parseFloat(form.calories),
        carbs: form.carbs ? parseFloat(form.carbs) : 0,
        protein: form.protein ? parseFloat(form.protein) : 0,
        fats: form.fats ? parseFloat(form.fats) : 0,
        fiber: form.fiber ? parseFloat(form.fiber) : 0,
      };

      console.log('Sending meal data:', mealData);
      console.log('API URL:', `${API_CONFIG.BASE_URL_LOCALHOST}${API_CONFIG.ENDPOINTS.MEALS.PORT}${API_CONFIG.ENDPOINTS.MEALS.MANUAL_MEALS}`);
      console.log('Meal Type:', mealType);
      console.log('Storage Key:', STORAGE_KEY);

      const response = await fetch(
        `${API_CONFIG.BASE_URL_LOCALHOST}${API_CONFIG.ENDPOINTS.MEALS.PORT}${API_CONFIG.ENDPOINTS.MEALS.MANUAL_MEALS}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
          body: JSON.stringify(mealData),
        }
      );

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);

        // ═══ Save to local storage for the specific meal slot ═══
        const newMeal = {
          id: result.id || Date.now(),
          entryId: `${result.id}_${Date.now()}`,
          mealName: result.mealName,
          weight: result.weight,
          weightUnit: result.weightUnit,
          calories: result.calories,
          protein: result.protein || 0,
          carbs: result.carbs || 0,
          fats: result.fats || 0,
          fiber: result.fiber || 0,
          photoUrl: result.photoUrl || '',
          category: 'Custom',
        };

        console.log('New meal to save:', newMeal);
        console.log('Saving to storage key:', STORAGE_KEY);

        // Get existing meals for this slot
        const existing = await AsyncStorage.getItem(STORAGE_KEY);
        const arr = existing ? JSON.parse(existing) : [];
        
        console.log('Existing meals:', arr.length);
        
        // Add new meal to the beginning
        arr.unshift(newMeal);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

        console.log('Meal saved to AsyncStorage. Total meals:', arr.length);

        // ═══ Sync to backend ═══
        await syncMealSlotToBackend(arr);

        Alert.alert(
          'Success!',
          `${form.name} added to ${mealLabel || 'your meal'}`,
          [{ 
            text: 'OK', 
            onPress: () => {
              // Navigate back to meal details screen
              router.back();
            }
          }]
        );
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        Alert.alert('Error', errorText || 'Failed to add meal');
      }
    } catch (error) {
      console.error('Error adding meal:', error);
      Alert.alert('Error', `Failed to connect to server: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ═══ POINT 2: Backend sync with date-specific payload ═══
  const syncMealSlotToBackend = async (meals) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const mealDate = selectedDate
        ? new Date(selectedDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const allMeals = [];

      for (const slot of ALL_MEAL_TYPES) {
        let items;
        if (slot === mealType) {
          items = meals;
        } else {
          const key = storageKey(slot, selectedDate);
          const stored = await AsyncStorage.getItem(key);
          items = stored ? JSON.parse(stored) : [];
        }

        if (items.length === 0) continue;

        const mappedItems = items.map(m => ({
          name: m.mealName,
          quantity: `${m.weight}${m.weightUnit}`,
          macros: {
            protein: parseFloat(m.protein) || 0,
            carbs: parseFloat(m.carbs) || 0,
            fat: parseFloat(m.fats) || 0,
            fiber: parseFloat(m.fiber) || 0,
            calories: parseFloat(m.calories) || 0,
          },
        }));

        allMeals.push({
          mealType: toCamelCase(slot),
          items: mappedItems,
          totalCalories: mappedItems.reduce((s, i) => s + i.macros.calories, 0),
        });
      }

      const payload = { mealDate, meals: allMeals };

      console.log('Syncing to backend:', {
        date: mealDate,
        mealsCount: allMeals.length,
      });

      await fetch(
        `${API_CONFIG.BASE_URL_LOCALHOST}${API_CONFIG.ENDPOINTS.MEALS.PORT}${API_CONFIG.ENDPOINTS.MEALS.UPDATE_MEAL}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Manually</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Card */}
        <Animated.View
          style={[
            styles.headerCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.headerIconContainer}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={40} color="#4A90E2" />
          </View>
          <Text style={styles.headerCardTitle}>Add to {mealLabel || 'Meal'}</Text>
          <Text style={styles.headerCardSubtitle}>
            Enter nutritional information manually
          </Text>
        </Animated.View>

        {/* Name Input */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Food Name</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="food"
              size={20}
              color="#8E8E93"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="e.g., Chicken Breast"
              placeholderTextColor="#666"
              value={form.name}
              onChangeText={(text) => handleChange('name', text)}
              autoCapitalize="words"
              maxLength={50}
            />
          </View>
        </Animated.View>

        {/* Weight & Unit */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Serving Size</Text>
          <View style={styles.weightRow}>
            <View style={styles.weightInputWrapper}>
              <TextInput
                style={styles.weightInput}
                placeholder="100"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
                value={form.weight}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9.]/g, '');
                  handleChange('weight', numericValue);
                }}
              />
            </View>
            <TouchableOpacity
              style={styles.unitButton}
              onPress={() => setShowUnitPicker(!showUnitPicker)}
            >
              <Text style={styles.unitButtonText}>{form.weightUnit}</Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={20}
                color="#8E8E93"
              />
            </TouchableOpacity>
          </View>

          {showUnitPicker && (
            <View style={styles.unitPicker}>
              {UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.unitOption,
                    form.weightUnit === unit && styles.unitOptionActive,
                  ]}
                  onPress={() => {
                    handleChange('weightUnit', unit);
                    setShowUnitPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.unitOptionText,
                      form.weightUnit === unit && styles.unitOptionTextActive,
                    ]}
                  >
                    {unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Calories */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Calories</Text>
          <View style={styles.calorieInputWrapper}>
            <MaterialCommunityIcons name="fire" size={24} color="#FF6B35" />
            <TextInput
              style={styles.calorieInput}
              placeholder="0"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              value={form.calories}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9.]/g, '');
                handleChange('calories', numericValue);
              }}
            />
            <Text style={styles.calorieUnit}>kcal</Text>
          </View>
        </Animated.View>

        {/* Macros Grid */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.sectionTitle}>Macronutrients</Text>
          <View style={styles.macrosGrid}>
            {/* Protein */}
            <View style={styles.macroInputCard}>
              <View style={[styles.macroIconWrap, { backgroundColor: '#4A90E222' }]}>
                <MaterialCommunityIcons name="arm-flex" size={20} color="#4A90E2" />
              </View>
              <Text style={styles.macroLabel}>Protein</Text>
              <TextInput
                style={styles.macroInput}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
                value={form.protein}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9.]/g, '');
                  handleChange('protein', numericValue);
                }}
              />
              <Text style={styles.macroUnit}>g</Text>
            </View>

            {/* Carbs */}
            <View style={styles.macroInputCard}>
              <View style={[styles.macroIconWrap, { backgroundColor: '#F5A62322' }]}>
                <MaterialCommunityIcons name="grain" size={20} color="#F5A623" />
              </View>
              <Text style={styles.macroLabel}>Carbs</Text>
              <TextInput
                style={styles.macroInput}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
                value={form.carbs}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9.]/g, '');
                  handleChange('carbs', numericValue);
                }}
              />
              <Text style={styles.macroUnit}>g</Text>
            </View>

            {/* Fats */}
            <View style={styles.macroInputCard}>
              <View style={[styles.macroIconWrap, { backgroundColor: '#E8537A22' }]}>
                <MaterialCommunityIcons name="water" size={20} color="#E8537A" />
              </View>
              <Text style={styles.macroLabel}>Fats</Text>
              <TextInput
                style={styles.macroInput}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
                value={form.fats}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9.]/g, '');
                  handleChange('fats', numericValue);
                }}
              />
              <Text style={styles.macroUnit}>g</Text>
            </View>

            {/* Fiber */}
            <View style={styles.macroInputCard}>
              <View style={[styles.macroIconWrap, { backgroundColor: '#4CAF5022' }]}>
                <MaterialCommunityIcons name="leaf" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.macroLabel}>Fiber</Text>
              <TextInput
                style={styles.macroInput}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="decimal-pad"
                value={form.fiber}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9.]/g, '');
                  handleChange('fiber', numericValue);
                }}
              />
              <Text style={styles.macroUnit}>g</Text>
            </View>
          </View>
        </Animated.View>

        {/* Add Button */}
        <TouchableOpacity
          style={[styles.addButton, loading && styles.addButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name={loading ? 'loading' : 'check-circle-outline'}
            size={22}
            color="#FFFFFF"
          />
          <Text style={styles.addButtonText}>
            {loading ? 'Adding...' : 'Add to Food Log'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1B1E' },
  scroll: { padding: 16, paddingTop: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
  },
  backBtn: { padding: 8 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  headerCard: {
    backgroundColor: '#252830',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(74,144,226,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerCardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  headerCardSubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#252830',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1B1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#3A3D4A',
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
  },
  weightRow: {
    flexDirection: 'row',
    gap: 12,
  },
  weightInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1B1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#3A3D4A',
  },
  weightInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    paddingVertical: 12,
  },
  unitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1B1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#3A3D4A',
    minWidth: 80,
  },
  unitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  unitPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  unitOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1B1E',
    borderWidth: 1,
    borderColor: '#3A3D4A',
  },
  unitOptionActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  unitOptionText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },
  unitOptionTextActive: {
    color: '#FFFFFF',
  },
  calorieInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1B1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#3A3D4A',
    gap: 12,
  },
  calorieInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    paddingVertical: 12,
  },
  calorieUnit: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  macroInputCard: {
    width: (width - 32 - 32 - 10) / 2 - 2,
    backgroundColor: '#1E2028',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  macroIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  macroLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 8,
  },
  macroInput: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 4,
  },
  macroUnit: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    paddingVertical: 18,
    gap: 10,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
