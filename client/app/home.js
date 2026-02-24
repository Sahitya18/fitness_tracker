/**
 * HomeScreen.jsx - Point 1 + Point 2 Complete
 * 
 * Point 1: Date persistence when navigating back from meal details
 * Point 2: Fetch date-specific meal data from API for selected date
 * 
 * FIX: processMealData now handles flat API response object:
 *   { breakfast: {...}, postBreakfast: {...}, lunch: {...}, ... }
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, FlatList, Animated, Dimensions, Image, Modal,
} from 'react-native';
import { useAuth } from '../utils/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Surface, Avatar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DashboardModal from '../components/DashboardModal';
import API_CONFIG from '../utils/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

const ALL_MEAL_OPTIONS = [
  { mealType: 'breakfast',      name: 'Breakfast',      icon: 'food-apple',      time: '8:00 AM',  color: '#4A90E2' },
  { mealType: 'post_breakfast', name: 'Post Breakfast', icon: 'food-variant',    time: '10:30 AM', color: '#FF6B35' },
  { mealType: 'lunch',          name: 'Lunch',          icon: 'food-fork-drink', time: '1:00 PM',  color: '#FFD700' },
  { mealType: 'post_lunch',     name: 'Post Lunch',     icon: 'food-croissant',  time: '3:30 PM',  color: '#4CAF50' },
  { mealType: 'pre_workout',    name: 'Pre Workout',    icon: 'dumbbell',        time: '5:00 PM',  color: '#9C27B0' },
  { mealType: 'dinner',         name: 'Dinner',         icon: 'food-turkey',     time: '7:00 PM',  color: '#E8537A' },
];

// Maps API camelCase keys → local snake_case storage keys
const API_KEY_TO_STORAGE_KEY = {
  breakfast:      'breakfast',
  postBreakfast:  'post_breakfast',
  lunch:          'lunch',
  postLunch:      'post_lunch',
  preWorkout:     'pre_workout',
  dinner:         'dinner',
};

// Non-meal keys in the API response to skip
const SKIP_API_KEYS = new Set([
  'id', 'mealDate', 'createdAt', 'updatedAt', 'totalCalories',
  'breakfastCalories', 'postBreakfastCalories', 'lunchCalories',
  'postLunchCalories', 'preWorkoutCalories', 'dinnerCalories',
]);

const storageKey = (mealType, date) => {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return `recentMeals_${mealType}_${dateStr}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// DATE SLIDER
// ─────────────────────────────────────────────────────────────────────────────
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ITEM_WIDTH = 52, ITEM_SPACING = 6, ITEM_TOTAL = ITEM_WIDTH + ITEM_SPACING;
const DAYS_BEFORE = 30, TOTAL_DAYS = DAYS_BEFORE + 1;

function buildDates() {
  const today = new Date();
  return Array.from({ length: TOTAL_DAYS }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - DAYS_BEFORE + i);
    return {
      date: d.getDate(), day: DAYS[d.getDay()],
      month: d.toLocaleString('default', { month: 'short' }),
      full: new Date(d), isToday: d.toDateString() === today.toDateString(),
      key: d.toDateString(), index: i,
    };
  });
}

function DateItem({ item, isSelected, onPress }) {
  const scaleAnim = useRef(new Animated.Value(isSelected ? 1.1 : 1)).current;
  const handlePressIn  = () => Animated.spring(scaleAnim, { toValue: 1.42, tension: 200, friction: 6,  useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: isSelected ? 1.1 : 1.0, tension: 120, friction: 8, useNativeDriver: true }).start();
  useEffect(() => { Animated.spring(scaleAnim, { toValue: isSelected ? 1.1 : 1.0, tension: 120, friction: 8, useNativeDriver: true }).start(); }, [isSelected]);
  return (
    <TouchableOpacity activeOpacity={1} onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={dsStyles.itemWrapper}>
      <Animated.View style={[dsStyles.dateItem, isSelected && dsStyles.dateItemSelected, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={[dsStyles.dayText,  isSelected && dsStyles.dayTextSelected]}>{item.day}</Text>
        <Text style={[dsStyles.dateNum,  isSelected && dsStyles.dateNumSelected]}>{item.date}</Text>
        <View style={[dsStyles.dot, isSelected ? dsStyles.dotActive : dsStyles.dotHidden]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

function DateSlider({ selectedDate, onDateChange }) {
  const [dates] = useState(buildDates);
  const listRef = useRef(null);
  const selectedKey = selectedDate.toDateString();

  const scrollToIndex = useCallback((index, animated = true) => {
    listRef.current?.scrollToIndex({ index, animated, viewPosition: 0.5 });
  }, []);

  useEffect(() => {
    const selectedItem = dates.find(d => d.key === selectedKey);
    if (selectedItem) {
      const t = setTimeout(() => scrollToIndex(selectedItem.index, false), 50);
      return () => clearTimeout(t);
    }
  }, [selectedKey]);

  const handleSelect = useCallback((item) => {
    scrollToIndex(item.index);
    onDateChange?.(item.full);
  }, [onDateChange, scrollToIndex]);

  const getItemLayout = useCallback((_, index) => ({ length: ITEM_TOTAL, offset: ITEM_TOTAL * index, index }), []);
  const renderItem    = useCallback(({ item }) => (
    <DateItem item={item} isSelected={selectedKey === item.key} onPress={() => handleSelect(item)} />
  ), [selectedKey, handleSelect]);
  
  const selectedItem = dates.find(d => d.key === selectedKey);

  return (
    <View style={dsStyles.sliderRoot}>
      <Text style={dsStyles.selectedLabel}>
        {selectedItem?.isToday ? 'Today' : selectedItem?.full.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </Text>
      <View style={dsStyles.track}>
        <FlatList ref={listRef} data={dates} renderItem={renderItem} keyExtractor={item => item.key} horizontal
          showsHorizontalScrollIndicator={false} getItemLayout={getItemLayout} decelerationRate="fast"
          snapToInterval={ITEM_TOTAL} snapToAlignment="center" contentContainerStyle={dsStyles.listContent}
          onScrollToIndexFailed={info => listRef.current?.scrollToOffset({ offset: info.index * ITEM_TOTAL, animated: false })}
        />
        <LinearGradient colors={['#252830', 'transparent']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} pointerEvents="none" style={dsStyles.fadeLeft} />
        <LinearGradient colors={['transparent', '#252830']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} pointerEvents="none" style={dsStyles.fadeRight} />
      </View>
    </View>
  );
}

const dsStyles = StyleSheet.create({
  sliderRoot:    { alignItems: 'center', width: '100%' },
  selectedLabel: { color: '#4A90E2', fontSize: 12, fontWeight: '700', letterSpacing: 0.4, marginBottom: 6, height: 16 },
  track:         { width: '100%', position: 'relative', overflow: 'hidden' },
  listContent:   { paddingHorizontal: 16, alignItems: 'center' },
  fadeLeft:      { position: 'absolute', left: 0, top: 0, bottom: 0, width: 32, zIndex: 2 },
  fadeRight:     { position: 'absolute', right: 0, top: 0, bottom: 0, width: 32, zIndex: 2 },
  itemWrapper:   { width: ITEM_TOTAL, alignItems: 'center', justifyContent: 'center', paddingVertical: 4, zIndex: 1 },
  dateItem:         { width: ITEM_WIDTH, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 14, backgroundColor: 'transparent' },
  dateItemSelected: { backgroundColor: 'rgba(74,144,226,0.15)' },
  dayText:          { color: '#8E8E93', fontSize: 10, fontWeight: '600', letterSpacing: 0.3, marginBottom: 4 },
  dayTextSelected:  { color: '#4A90E2' },
  dateNum:          { color: '#CCCCCC', fontSize: 17, fontWeight: '500', lineHeight: 20 },
  dateNumSelected:  { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  dot:       { width: 5, height: 5, borderRadius: 3, marginTop: 5 },
  dotActive: { backgroundColor: '#4A90E2' },
  dotHidden: { backgroundColor: 'transparent' },
});

// ─────────────────────────────────────────────────────────────────────────────
// FOOD TRACKER CARD
// ─────────────────────────────────────────────────────────────────────────────
const MACRO_CONFIG = [
  { key: 'protein', label: 'Protein', colors: ['#2F6FB5', '#4A90E2'], glow: 'rgba(74,144,226,0.25)', goal: 150 },
  { key: 'carbs',   label: 'Carbs',   colors: ['#C07C0A', '#F5A623'], glow: 'rgba(245,166,35,0.25)', goal: 250 },
  { key: 'fats',    label: 'Fats',    colors: ['#B02F54', '#E8537A'], glow: 'rgba(232,83,122,0.25)', goal: 65  },
  { key: 'fiber',   label: 'Fiber',   colors: ['#2E7D32', '#4CAF50'], glow: 'rgba(76,175,80,0.25)',  goal: 30  },
];

function MacroBar({ label, consumed, goal, colors, glow }) {
  const animWidth = useRef(new Animated.Value(0)).current;
  const isOver = consumed > goal;
  useEffect(() => {
    Animated.timing(animWidth, { toValue: Math.min(consumed / goal, 1), duration: 900, delay: 150, useNativeDriver: false }).start();
  }, [consumed, goal]);
  const widthInterp = animWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'], extrapolate: 'clamp' });
  return (
    <View style={ftStyles.macroRow}>
      <Text style={ftStyles.macroLabel}>{label}</Text>
      <View style={ftStyles.trackWrap}>
        <View style={[ftStyles.glow, { backgroundColor: glow }]} />
        <View style={ftStyles.track}>
          <Animated.View style={[ftStyles.fill, { width: widthInterp }]}>
            <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          </Animated.View>
          {[25, 50, 75].map(tick => <View key={tick} style={[ftStyles.tick, { left: `${tick}%` }]} />)}
        </View>
      </View>
      <View style={ftStyles.valueRow}>
        <Text style={[ftStyles.consumed, { color: isOver ? '#FF6B35' : colors[1] }]}>{consumed}</Text>
        <Text style={ftStyles.slash}>/</Text>
        <Text style={ftStyles.goalText}>{goal}g</Text>
      </View>
    </View>
  );
}

function CalorieRing({ consumed, goal }) {
  const animProg = useRef(new Animated.Value(0)).current;
  const r = 52, cx = 64, cy = 64, circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);

  const isOver = consumed > goal;
  const normalColors  = { start: '#4A90E2', end: '#7BBCFF' };
  const overColors    = { start: '#C0392B', end: '#FF6B6B' };
  const activeColors  = isOver ? overColors : normalColors;

  useEffect(() => {
    Animated.timing(animProg, {
      toValue:  Math.min(consumed / goal, 1),
      duration: 1100,
      useNativeDriver: false,
    }).start();
  }, [consumed, goal]);

  useEffect(() => {
    const id = animProg.addListener(({ value }) => setOffset(circ * (1 - value)));
    return () => animProg.removeListener(id);
  }, []);

  return (
    <View style={ftStyles.ringWrap}>
      <Svg width={128} height={128} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <SvgGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%"   stopColor={activeColors.start} />
            <Stop offset="100%" stopColor={activeColors.end}   />
          </SvgGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke="#1E2130" strokeWidth={10} />
        <Circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="url(#rg)"
          strokeWidth={10}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={ftStyles.ringOverlay}>
        <Text style={ftStyles.ringCaption}>CALORIES</Text>
        <Text style={[ftStyles.ringCount, isOver && { color: '#FF6B6B' }]}>{consumed}</Text>
        <View style={ftStyles.ringDivider} />
        <Text style={ftStyles.ringGoal}>{goal}</Text>
        {isOver && <Text style={ftStyles.ringOverLabel}>Over!</Text>}
      </View>
    </View>
  );
}

function FoodTrackerCard({ caloriesConsumed, caloriesGoal, macros, cardWidth }) {
  const pct = Math.round((caloriesConsumed / caloriesGoal) * 100);
  return (
    <View style={[ftStyles.card, cardWidth ? { width: cardWidth } : null]}>
      <View style={ftStyles.cardHeader}>
        <Text style={ftStyles.cardTitle}>Food Tracker</Text>
        <View style={[ftStyles.badge, caloriesConsumed > caloriesGoal && ftStyles.badgeOver]}>
          <Text style={[ftStyles.badgeText, caloriesConsumed > caloriesGoal && ftStyles.badgeTextOver]}>
            {pct}% of daily goal
          </Text>
        </View>
      </View>
      <View style={ftStyles.cardBody}>
        <CalorieRing consumed={caloriesConsumed} goal={caloriesGoal} />
        <View style={ftStyles.barsCol}>
          {MACRO_CONFIG.map(m => (
            <MacroBar key={m.key} label={m.label} consumed={macros[m.key] ?? 0} goal={m.goal} colors={m.colors} glow={m.glow} />
          ))}
        </View>
      </View>
    </View>
  );
}

const ftStyles = StyleSheet.create({
  card:       { backgroundColor: '#252830', borderRadius: 20, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle:  { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  badge:      { backgroundColor: 'rgba(74,144,226,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeOver:  { backgroundColor: 'rgba(192,57,43,0.15)' },
  badgeText:      { color: '#4A90E2', fontSize: 11, fontWeight: '600' },
  badgeTextOver:  { color: '#FF6B6B' },
  cardBody:   { flexDirection: 'row', alignItems: 'center', gap: 14 },
  barsCol:    { flex: 1, justifyContent: 'center' },
  macroRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  macroLabel: { color: '#9BA3B2', fontSize: 11, fontWeight: '600', width: 48, letterSpacing: 0.2 },
  trackWrap:  { flex: 1, height: 8, position: 'relative' },
  glow:       { position: 'absolute', top: -3, left: -2, right: -2, bottom: -3, borderRadius: 8 },
  track:      { flex: 1, height: 8, backgroundColor: '#1E2130', borderRadius: 6, overflow: 'hidden', position: 'relative' },
  fill:       { height: '100%', borderRadius: 6, overflow: 'hidden', minWidth: 4 },
  tick:       { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.2)', zIndex: 2 },
  valueRow:   { flexDirection: 'row', alignItems: 'baseline', marginLeft: 8, width: 72, justifyContent: 'flex-end' },
  consumed:   { fontSize: 13, fontWeight: '800', lineHeight: 16 },
  slash:      { color: '#3A4050', fontSize: 11, marginHorizontal: 2 },
  goalText:   { color: '#4A5060', fontSize: 10, fontWeight: '500' },
  ringWrap:     { width: 128, height: 128, position: 'relative', flexShrink: 0 },
  ringOverlay:  { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  ringCaption:  { color: '#7A8499', fontSize: 8, fontWeight: '700', letterSpacing: 0.8, marginBottom: 2 },
  ringCount:    { color: '#FFFFFF', fontSize: 26, fontWeight: '900', lineHeight: 30 },
  ringDivider:  { width: 32, height: 1, backgroundColor: '#3A4050', marginVertical: 3 },
  ringGoal:     { color: '#5A6375', fontSize: 12, fontWeight: '600' },
  ringOverLabel:{ color: '#FF6B6B', fontSize: 9, fontWeight: '800', letterSpacing: 0.5, marginTop: 3 },
});

// ─────────────────────────────────────────────────────────────────────────────
// HOME SCREEN
// ─────────────────────────────────────────────────────────────────────────────
const formatTime = (min) => {
  const hh = String(Math.floor(min / 60) % 24).padStart(2, '0');
  const mm = String(min % 60).padStart(2, '0');
  return `${hh}:${mm}`;
};

export default function HomeScreen() {
  const { userData, userToken } = useAuth();
  const { returnTab: returnTabParam } = useLocalSearchParams();
  const pendingTabRef = useRef(null);

  const [selectedDate,   setSelectedDate]   = useState(new Date());
  const [activeTab,      setActiveTab]      = useState('home');
  const [showDashboard,  setShowDashboard]  = useState(false);
  const [activeCard,     setActiveCard]     = useState(0);
  const [numberOfMeals,  setNumberOfMeals]  = useState(5);
  const [showMealSelector, setShowMealSelector] = useState(false);
  const activeMealSlots = ALL_MEAL_OPTIONS.slice(0, numberOfMeals);

  const [mealCounts,       setMealCounts]       = useState({});
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [macros,           setMacros]           = useState({ protein: 0, carbs: 0, fats: 0, fiber: 0 });
  const [loading,          setLoading]          = useState(false);
  
  const [caloriesGoal]  = useState(2000);
  const [sleepHours]    = useState(6);
  const [steps]         = useState(8104);
  const [workoutStats]  = useState({ calories: 320, duration: 45, timeOfDay: 390, type: 'Back & Biceps', exercises: 8, sets: 24, reps: 192 });
  const [foodSuggestions] = useState([
    { id: 1, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&h=200&fit=crop&q=80', name: 'Avocado Toast' },
    { id: 2, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=200&h=200&fit=crop&q=80', name: 'Breakfast Bowl' },
    { id: 3, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=200&h=200&fit=crop&q=80', name: 'Protein Pancakes' },
    { id: 4, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&h=200&fit=crop&q=80', name: 'Fruit Bowl' },
  ]);

  // ═══ POINT 1: Load saved date on mount ═══
  useEffect(() => {
    const loadSavedDate = async () => {
      try {
        const savedDate = await AsyncStorage.getItem('selectedDate');
        if (savedDate) {
          setSelectedDate(new Date(savedDate));
          console.log('Loaded saved date:', savedDate);
        }
      } catch (e) {
        console.error('Error loading saved date:', e);
      }
    };
    loadSavedDate();
  }, []);

  // ═══ POINT 1: Save date whenever it changes ═══
  const handleDateChange = async (date) => {
    try {
      setSelectedDate(date);
      await AsyncStorage.setItem('selectedDate', date.toISOString());
      console.log('Date changed to:', date.toISOString());
    } catch (e) {
      console.error('Error saving date:', e);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem('numberOfMeals').then(s => { if (s) setNumberOfMeals(parseInt(s)); }).catch(() => {});
  }, []);

  const saveMealPreference = async (count) => {
    try { await AsyncStorage.setItem('numberOfMeals', String(count)); setNumberOfMeals(count); setShowMealSelector(false); }
    catch (e) { console.error(e); }
  };

  useEffect(() => { if (returnTabParam) pendingTabRef.current = returnTabParam; }, [returnTabParam]);

  // ═══ POINT 2: Fetch date-specific data whenever date or numberOfMeals changes ═══
  useFocusEffect(
    React.useCallback(() => {
      console.log('=== HOME SCREEN FOCUSED ===');
      console.log('Selected date:', selectedDate.toISOString());
      if (pendingTabRef.current) { 
        setActiveTab(pendingTabRef.current); 
        pendingTabRef.current = null; 
      }
      fetchMealDataForDate();
    }, [selectedDate, numberOfMeals])
  );

  // ═══ POINT 2: Fetch meal data from API for selected date ═══
  const fetchMealDataForDate = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const token = userToken || await AsyncStorage.getItem('userToken');
      
      if (!token) {
        console.warn('No token found, falling back to local storage');
        await aggregateMealsFromLocalStorage();
        return;
      }

      console.log(`Fetching meals for date: ${dateStr}`);
      
      const url = `${API_CONFIG.BASE_URL_LOCALHOST}${API_CONFIG.ENDPOINTS.MEALS.PORT}/api/meals/date/${dateStr}`;
      console.log('API URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        await processMealData(data);
      } else {
        console.warn('API failed with status', response.status, '— falling back to local storage');
        await aggregateMealsFromLocalStorage();
      }
    } catch (error) {
      console.error('Error fetching meal data:', error);
      await aggregateMealsFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  /**
   * ═══ POINT 2: Process flat API response object ═══
   *
   * API shape (flat object, NOT an array):
   * {
   *   breakfast:     { mealType, totalCalories, items: [{name, quantity, macros}] },
   *   postBreakfast: { ... },
   *   lunch:         { ... },
   *   postLunch:     { ... },
   *   preWorkout:    { ... },
   *   dinner:        { ... },
   *   totalCalories: 1598,
   *   mealDate:      "2026-02-04",
   *   id, createdAt, updatedAt, breakfastCalories, ...
   * }
   */
  const processMealData = async (apiData) => {
    try {
      let totalCal = 0, totalProt = 0, totalCarbs = 0, totalFats = 0, totalFiber = 0;
      const counts = {};

      for (const [apiKey, storageSlotKey] of Object.entries(API_KEY_TO_STORAGE_KEY)) {
        const slotData = apiData[apiKey]; // e.g. apiData.postBreakfast

        if (!slotData || !Array.isArray(slotData.items) || slotData.items.length === 0) {
          counts[storageSlotKey] = 0;
          // Clear stale local storage for this date+slot so MealDetailsScreen
          // doesn't show old entries when the server says none exist.
          const key = storageKey(storageSlotKey, selectedDate);
          await AsyncStorage.setItem(key, JSON.stringify([]));
          continue;
        }

        const items = slotData.items;
        counts[storageSlotKey] = items.length;

        // Transform API items → local storage format used by MealDetailsScreen
        const transformedMeals = items.map((item, index) => {
          // Parse numeric part and unit from quantity string e.g. "200g" → 200, "g"
          const quantityStr = String(item.quantity || '');
          const weightNum   = parseFloat(quantityStr) || 100;
          const weightUnit  = quantityStr.replace(/[0-9.\s]/g, '') || 'g';

          return {
            id:         `api_${apiKey}_${index}`,
            entryId:    `api_${apiKey}_${index}_${Date.now()}`,
            mealName:   item.name,
            weight:     weightNum,
            weightUnit: weightUnit,
            calories:   item.macros?.calories ?? 0,
            protein:    item.macros?.protein  ?? 0,
            carbs:      item.macros?.carbs    ?? 0,
            fats:       item.macros?.fat      ?? 0,  // API uses "fat", storage uses "fats"
            fiber:      item.macros?.fiber    ?? 0,
            photoUrl:   '',
            category:   'API',
          };
        });

        // Persist to date-specific local storage so MealDetailsScreen can read it
        const key = storageKey(storageSlotKey, selectedDate);
        await AsyncStorage.setItem(key, JSON.stringify(transformedMeals));

        // Accumulate totals from API macros
        items.forEach(item => {
          totalCal   += item.macros?.calories ?? 0;
          totalProt  += item.macros?.protein  ?? 0;
          totalCarbs += item.macros?.carbs    ?? 0;
          totalFats  += item.macros?.fat      ?? 0;
          totalFiber += item.macros?.fiber    ?? 0;
        });
      }

      console.log('Processed meal counts:', counts);
      console.log('Total calories:', totalCal);

      setMealCounts(counts);
      setCaloriesConsumed(Math.round(totalCal));
      setMacros({
        protein: Math.round(totalProt),
        carbs:   Math.round(totalCarbs),
        fats:    Math.round(totalFats),
        fiber:   Math.round(totalFiber),
      });
    } catch (error) {
      console.error('Error processing meal data:', error);
    }
  };

  // ═══ POINT 2: Fallback to local storage (date-specific) ═══
  const aggregateMealsFromLocalStorage = async () => {
    try {
      let totalCal = 0, totalProt = 0, totalCarbs = 0, totalFats = 0, totalFiber = 0;
      const counts = {};

      for (const slot of ALL_MEAL_OPTIONS.slice(0, numberOfMeals)) {
        const key = storageKey(slot.mealType, selectedDate);
        const stored = await AsyncStorage.getItem(key);
        const meals = stored ? JSON.parse(stored) : [];
        
        counts[slot.mealType] = meals.length;

        meals.forEach(meal => {
          totalCal   += parseFloat(meal.calories) || 0;
          totalProt  += parseFloat(meal.protein)  || 0;
          totalCarbs += parseFloat(meal.carbs)    || 0;
          totalFats  += parseFloat(meal.fats)     || 0;
          totalFiber += parseFloat(meal.fiber)    || 0;
        });
      }

      setMealCounts(counts);
      setCaloriesConsumed(Math.round(totalCal));
      setMacros({
        protein: Math.round(totalProt),
        carbs:   Math.round(totalCarbs),
        fats:    Math.round(totalFats),
        fiber:   Math.round(totalFiber),
      });
    } catch (e) {
      console.error('Error aggregating meals from local storage:', e);
    }
  };

  const renderGymCard = () => (
    <View style={[hsStyles.trackerCard, { width: CARD_WIDTH }]}>
      <View style={hsStyles.gymHeader}>
        <Text style={hsStyles.cardTitle}>Workout Tracker</Text>
        <View style={hsStyles.gymBadge}><Text style={hsStyles.gymBadgeText}>{workoutStats.type}</Text></View>
      </View>
      <View style={hsStyles.gymTilesRow}>
        {[
          { icon: 'fire',          color: '#FF6B35', val: workoutStats.calories,              label: 'Calories'   },
          { icon: 'timer-outline', color: '#4A90E2', val: `${workoutStats.duration} min`,     label: 'Duration'   },
          { icon: 'clock-outline', color: '#FFD700', val: formatTime(workoutStats.timeOfDay), label: 'Start Time' },
        ].map(({ icon, color, val, label }) => (
          <View key={label} style={hsStyles.gymTile}>
            <View style={[hsStyles.gymTileIcon, { backgroundColor: color + '22' }]}>
              <MaterialCommunityIcons name={icon} size={20} color={color} />
            </View>
            <Text style={[hsStyles.gymTileVal, { color }]}>{val}</Text>
            <Text style={hsStyles.gymTileLabel}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={hsStyles.gymSubRow}>
        {[
          { val: workoutStats.exercises, label: 'Exercises' },
          { val: workoutStats.sets,      label: 'Sets'      },
          { val: workoutStats.reps,      label: 'Total Reps'},
        ].map(({ val, label }, i) => (
          <React.Fragment key={label}>
            {i > 0 && <View style={hsStyles.gymSubDivider} />}
            <View style={hsStyles.gymSubItem}>
              <Text style={hsStyles.gymSubVal}>{val}</Text>
              <Text style={hsStyles.gymSubLabel}>{label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={hsStyles.container} showsVerticalScrollIndicator={false}>
      <Surface style={hsStyles.headerSurface}>
        <TouchableOpacity onPress={() => setShowDashboard(true)} style={hsStyles.avatarBtn}>
          <Avatar.Image size={38} source={{ uri: userData?.profilePic || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&q=80' }} />
        </TouchableOpacity>
        <View style={hsStyles.sliderContainer}>
          <DateSlider selectedDate={selectedDate} onDateChange={handleDateChange} />
        </View>
        <TouchableOpacity onPress={() => setShowDashboard(true)} style={hsStyles.avatarBtn}>
          <Avatar.Image size={38} source={{ uri: userData?.profilePic || 'https://via.placeholder.com/40' }} />
        </TouchableOpacity>
      </Surface>

      <View style={hsStyles.tabContainer}>
        {['kitchen', 'home', 'gym'].map(t => (
          <TouchableOpacity key={t} style={[hsStyles.tab, activeTab === t && hsStyles.activeTab]} onPress={() => setActiveTab(t)}>
            <Text style={[hsStyles.tabText, activeTab === t && hsStyles.activeTabText]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && (
        <View style={hsStyles.loadingOverlay}>
          <Text style={hsStyles.loadingText}>Loading meals...</Text>
        </View>
      )}

      {activeTab === 'home' && (
        <View style={hsStyles.cardContainer}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onScroll={e => setActiveCard(Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH))}
            scrollEventThrottle={16}>
            <FoodTrackerCard caloriesConsumed={caloriesConsumed} caloriesGoal={caloriesGoal} macros={macros} cardWidth={CARD_WIDTH} />
            {renderGymCard()}
          </ScrollView>
          <View style={hsStyles.pageIndicators}>
            {[0, 1].map(i => <View key={i} style={[hsStyles.pageIndicator, activeCard === i && hsStyles.activePageIndicator]} />)}
          </View>
        </View>
      )}

      {activeTab === 'kitchen' && (
        <View style={hsStyles.cardContainer}>
          <FoodTrackerCard caloriesConsumed={caloriesConsumed} caloriesGoal={caloriesGoal} macros={macros} />
          <Surface style={hsStyles.trackerCard}>
            <View style={hsStyles.mealHeader}>
              <Text style={hsStyles.sectionTitle}>
                {selectedDate.toDateString() === new Date().toDateString() 
                  ? "Today's Meals" 
                  : `Meals for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              </Text>
              <TouchableOpacity onPress={() => setShowMealSelector(true)} style={hsStyles.mealConfigBtn}>
                <MaterialCommunityIcons name="cog" size={20} color="#4A90E2" />
                <Text style={hsStyles.mealConfigText}>{numberOfMeals} meals</Text>
              </TouchableOpacity>
            </View>
            <View style={hsStyles.mealList}>
              {activeMealSlots.map(m => {
                const count = mealCounts[m.mealType] || 0;
                return (
                  <TouchableOpacity key={m.mealType} style={hsStyles.mealItem}
                    onPress={() => router.push({
                      pathname: '/meal-details',
                      params: {
                        mealType:     m.mealType,
                        mealLabel:    m.name,
                        returnTab:    'kitchen',
                        selectedDate: selectedDate.toISOString(),
                      },
                    })}>
                    <View style={hsStyles.mealIconWrap}>
                      <MaterialCommunityIcons name={m.icon} size={20} color={m.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={hsStyles.mealName}>{m.name}</Text>
                      <Text style={hsStyles.mealTime}>{m.time}</Text>
                    </View>
                    {count > 0
                      ? <View style={hsStyles.countBadge}><Text style={hsStyles.countText}>{count}</Text></View>
                      : <View style={hsStyles.statusDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Surface>
        </View>
      )}

      {activeTab === 'gym' && <View style={hsStyles.cardContainer}>{renderGymCard()}</View>}

      <View style={hsStyles.statsGrid}>
        <Surface style={hsStyles.statCard}>
          <View style={hsStyles.statHeader}>
            <MaterialCommunityIcons name="moon-waning-crescent" size={24} color="#4A90E2" />
            <Text style={hsStyles.statTitle}>Sleep</Text>
          </View>
          <View style={hsStyles.sleepGraph}>
            {[0.4, 0.6, 0.8, 0.5, 0.7, 0.9, 0.6].map((h, i) => <View key={i} style={[hsStyles.sleepBar, { height: h * 60 }]} />)}
          </View>
          <Text style={hsStyles.statValue}>{sleepHours} Hours</Text>
        </Surface>
        <Surface style={hsStyles.statCard}>
          <View style={hsStyles.statHeader}>
            <MaterialCommunityIcons name="walk" size={24} color="#4A90E2" />
            <Text style={hsStyles.statTitle}>Walk</Text>
          </View>
          <View style={hsStyles.stepsWrap}>
            <Text style={hsStyles.stepsCount}>{steps.toLocaleString()}</Text>
            <Text style={hsStyles.stepsLabel}>Steps</Text>
          </View>
        </Surface>
      </View>

      <Surface style={hsStyles.suggestionsCard}>
        <Text style={hsStyles.sectionTitle}>Food suggestions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
          {foodSuggestions.map(f => (
            <View key={f.id} style={hsStyles.foodItem}>
              <Image source={{ uri: f.image }} style={hsStyles.foodImage} />
              <Text style={hsStyles.foodName}>{f.name}</Text>
            </View>
          ))}
        </ScrollView>
      </Surface>

      <Modal visible={showMealSelector} transparent animationType="fade" onRequestClose={() => setShowMealSelector(false)}>
        <View style={hsStyles.modalOverlay}>
          <View style={hsStyles.modalContent}>
            <Text style={hsStyles.modalTitle}>Select Number of Meals</Text>
            <Text style={hsStyles.modalSubtitle}>Choose how many meals you want to track per day</Text>
            <View style={hsStyles.mealOptionsGrid}>
              {[3, 4, 5, 6].map(count => (
                <TouchableOpacity key={count} style={[hsStyles.mealOption, numberOfMeals === count && hsStyles.mealOptionActive]} onPress={() => saveMealPreference(count)}>
                  <Text style={[hsStyles.mealOptionNum,   numberOfMeals === count && hsStyles.mealOptionNumActive]}>{count}</Text>
                  <Text style={[hsStyles.mealOptionLabel, numberOfMeals === count && hsStyles.mealOptionLabelActive]}>meals</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={hsStyles.modalCloseBtn} onPress={() => setShowMealSelector(false)}>
              <Text style={hsStyles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 100 }} />
      <DashboardModal visible={showDashboard} onClose={() => setShowDashboard(false)} />
    </ScrollView>
  );
}

const hsStyles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#1A1B1E', padding: 16 },
  headerSurface:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#252830', borderRadius: 20, padding: 10, marginTop: 40, marginBottom: 16, gap: 8 },
  avatarBtn:      { padding: 2 },
  sliderContainer:{ flex: 1 },
  loadingOverlay: { backgroundColor: 'rgba(37,40,48,0.9)', borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' },
  loadingText:    { color: '#4A90E2', fontSize: 14, fontWeight: '600' },
  tabContainer:   { flexDirection: 'row', backgroundColor: '#252830', borderRadius: 20, padding: 4, marginBottom: 16 },
  tab:            { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 16 },
  activeTab:      { backgroundColor: '#4A90E2' },
  tabText:        { color: '#8E8E93', fontSize: 16, fontWeight: 'bold' },
  activeTabText:  { color: '#FFFFFF' },
  cardContainer:  { marginBottom: 16 },
  trackerCard:    { backgroundColor: '#252830', borderRadius: 20, padding: 16, marginBottom: 16 },
  mealHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:   { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  mealConfigBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(74,144,226,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  mealConfigText: { color: '#4A90E2', fontSize: 12, fontWeight: '600' },
  cardTitle:      { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  gymHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  gymBadge:       { backgroundColor: '#23243A', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  gymBadgeText:   { color: '#FFFFFF', fontSize: 11, fontWeight: '500' },
  gymTilesRow:    { flexDirection: 'row', gap: 8, marginBottom: 12 },
  gymTile:        { flex: 1, backgroundColor: '#1E2028', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
  gymTileIcon:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  gymTileVal:     { fontSize: 14, fontWeight: '800' },
  gymTileLabel:   { color: '#8E8E93', fontSize: 10, textAlign: 'center' },
  gymSubRow:      { flexDirection: 'row', backgroundColor: '#1E2028', borderRadius: 12, paddingVertical: 10 },
  gymSubItem:     { flex: 1, alignItems: 'center' },
  gymSubVal:      { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  gymSubLabel:    { color: '#8E8E93', fontSize: 10, marginTop: 2 },
  gymSubDivider:  { width: 1, backgroundColor: '#3A4A', marginVertical: 4 },
  pageIndicators: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  pageIndicator:  { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3A3B3F', marginHorizontal: 4 },
  activePageIndicator: { backgroundColor: '#4A90E2', width: 24 },
  mealList:   { gap: 8 },
  mealItem:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#1A1B1E', borderRadius: 12 },
  mealIconWrap:   { width: 38, height: 38, borderRadius: 19, backgroundColor: '#252830', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  mealName:   { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  mealTime:   { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  statusDot:  { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFA726' },
  countBadge: { backgroundColor: '#4A90E2', borderRadius: 12, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  countText:  { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  statsGrid:  { flexDirection: 'row', gap: 16, marginBottom: 16 },
  statCard:   { flex: 1, backgroundColor: '#252830', borderRadius: 20, padding: 16 },
  statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statTitle:  { color: '#FFFFFF', fontSize: 16, marginLeft: 8 },
  sleepGraph: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 60, marginBottom: 8 },
  sleepBar:   { width: 4, backgroundColor: '#4A90E2', borderRadius: 2 },
  statValue:  { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  stepsWrap:  { alignItems: 'center', marginTop: 8 },
  stepsCount: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  stepsLabel: { color: '#8E8E93', fontSize: 14 },
  suggestionsCard: { backgroundColor: '#252830', borderRadius: 20, padding: 16 },
  foodItem:   { alignItems: 'center', marginRight: 16 },
  foodImage:  { width: 100, height: 100, borderRadius: 12, marginBottom: 8 },
  foodName:   { color: '#FFFFFF', fontSize: 12, textAlign: 'center', width: 100 },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent:   { backgroundColor: '#252830', borderRadius: 20, padding: 24, margin: 20, width: '85%', maxWidth: 400 },
  modalTitle:     { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  modalSubtitle:  { color: '#8E8E93', fontSize: 14, textAlign: 'center', marginBottom: 24 },
  mealOptionsGrid:{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  mealOption:         { flex: 1, minWidth: '45%', backgroundColor: '#1A1B1E', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: '#3A3D4A' },
  mealOptionActive:   { backgroundColor: 'rgba(74,144,226,0.2)', borderColor: '#4A90E2' },
  mealOptionNum:          { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold', marginBottom: 4 },
  mealOptionNumActive:    { color: '#4A90E2' },
  mealOptionLabel:        { color: '#8E8E93', fontSize: 14, fontWeight: '600' },
  mealOptionLabelActive:  { color: '#4A90E2' },
  modalCloseBtn:     { backgroundColor: '#4A90E2', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalCloseBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
