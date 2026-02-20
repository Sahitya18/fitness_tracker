import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Image, Animated, Dimensions, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const MACROS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', icon: 'fire',     color: '#FF6B35' },
  { key: 'protein',  label: 'Protein',  unit: 'g',    icon: 'arm-flex', color: '#4A90E2' },
  { key: 'carbs',    label: 'Carbs',    unit: 'g',    icon: 'grain',    color: '#F5A623' },
  { key: 'fats',     label: 'Fats',     unit: 'g',    icon: 'water',    color: '#E8537A' },
  { key: 'fiber',    label: 'Fiber',    unit: 'g',    icon: 'leaf',     color: '#4CAF50' },
];

const UNIT_TO_G    = { g: 1, oz: 28.3495, lbs: 453.592 };
const UNITS        = ['g', 'oz', 'lbs'];
const GRAM_PRESETS = [50, 100, 150, 200, 250];

const storageKey = (mealType) =>
  mealType ? `recentMeals_${mealType}` : 'recentMeals_default';

export default function FoodDetailScreen() {
  // ── Params ─────────────────────────────────────────────────────────────────
  // editEntryId: present only in edit mode — the entryId of the meal to replace
  const { meal: mealParam, mealType, returnTab, editEntryId } = useLocalSearchParams();
  const meal        = JSON.parse(mealParam || '{}');
  const isEditMode  = !!editEntryId;

  const STORAGE_KEY  = storageKey(mealType);
  const baseWeightG  = parseFloat(meal.weight) || 100;

  // ── In edit mode, pre-fill with the saved weight/unit ─────────────────────
  // meal.weightUnit might be 'oz' or 'lbs' if it was saved that way
  const initialUnit  = isEditMode ? (meal.weightUnit || 'g') : 'g';
  const initialW     = isEditMode
    ? parseFloat((baseWeightG / UNIT_TO_G[initialUnit]).toFixed(2))
    : baseWeightG;

  const [unit,      setUnit]      = useState(initialUnit);
  const [weightInG, setWeightInG] = useState(baseWeightG);
  const [inputVal,  setInputVal]  = useState(String(initialW));

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Unit switching ─────────────────────────────────────────────────────────
  const handleUnitChange = (newUnit) => {
    const converted = parseFloat((weightInG / UNIT_TO_G[newUnit]).toFixed(2));
    setUnit(newUnit);
    setInputVal(String(converted));
  };

  // ── Weight input ───────────────────────────────────────────────────────────
  const handleWeightInput = (val) => {
    setInputVal(val);
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) setWeightInG(n * UNIT_TO_G[unit]);
  };

  const handlePreset = (presetG) => {
    setInputVal(String(parseFloat((presetG / UNIT_TO_G[unit]).toFixed(2))));
    setWeightInG(presetG);
  };

  const step = (dir) => {
    const newG = Math.max(1, weightInG + dir * 10);
    setInputVal(String(parseFloat((newG / UNIT_TO_G[unit]).toFixed(2))));
    setWeightInG(newG);
  };

  // ── Macro scaling ──────────────────────────────────────────────────────────
  // In edit mode, the base macros are the ORIGINAL per-baseWeightG values
  // stored in meal. We scale from there just like add mode.
  const scale = (val) => {
    const base = parseFloat(val) || 0;
    if (!baseWeightG) return '0';
    return ((base / baseWeightG) * weightInG).toFixed(1);
  };

  const scaledMacro = (key) =>
    scale({ calories: meal.calories, protein: meal.protein,
            carbs: meal.carbs, fats: meal.fats, fiber: meal.fiber }[key]);

  const displayWeight = parseFloat(inputVal) || 0;
  const baseDisplay   = parseFloat((baseWeightG / UNIT_TO_G[unit]).toFixed(2));

  // ── Save ──────────────────────────────────────────────────────────────────
  // Add mode  → prepend new entry
  // Edit mode → find by entryId and replace in-place (preserves list order)
  const handleSave = async () => {
    const updatedMeal = {
      ...meal,
      // In edit mode keep the same entryId so the item stays in its position.
      // In add mode generate a fresh one.
      entryId:    isEditMode ? editEntryId : `${meal.id}_${Date.now()}`,
      weight:     displayWeight,
      weightUnit: unit,
      calories:   scaledMacro('calories'),
      protein:    scaledMacro('protein'),
      carbs:      scaledMacro('carbs'),
      fats:       scaledMacro('fats'),
      fiber:      scaledMacro('fiber'),
    };

    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      let arr = existing ? JSON.parse(existing) : [];

      if (isEditMode) {
        // Replace the entry that has the matching entryId
        const idx = arr.findIndex(m => m.entryId === editEntryId);
        if (idx !== -1) {
          arr[idx] = updatedMeal;          // update in-place → keeps list order
        } else {
          arr.unshift(updatedMeal);        // safety: not found → prepend
        }
      } else {
        arr.unshift(updatedMeal);          // new entry → add to top
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      router.back(); // back to MealDetailsScreen
    } catch (e) {
      console.error('Error saving meal:', e);
      Alert.alert('Error', 'Could not save meal. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header — shows "Edit Food" vs "Food Details" */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Food' : 'Food Details'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <Animated.View style={[styles.heroCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.imageContainer}>
            {meal.photoUrl ? (
              <Image source={{ uri: meal.photoUrl }} style={styles.foodImage} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name="food-fork-drink" size={56} color="#3A3D4A" />
              </View>
            )}
            <View style={styles.calorieBadge}>
              <Text style={styles.calorieBadgeNum}>{scaledMacro('calories')}</Text>
              <Text style={styles.calorieBadgeUnit}>kcal</Text>
            </View>
          </View>
          <Text style={styles.mealName}>{meal.mealName}</Text>
          {meal.category && <Text style={styles.mealCategory}>{meal.category}</Text>}

          {/* Edit mode banner */}
          {isEditMode && (
            <View style={styles.editBanner}>
              <MaterialCommunityIcons name="pencil-circle" size={16} color="#F5A623" />
              <Text style={styles.editBannerText}>Editing existing entry — adjust values and save</Text>
            </View>
          )}
        </Animated.View>

        {/* Serving Size */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Serving Size</Text>

          <View style={styles.unitRow}>
            {UNITS.map(u => (
              <TouchableOpacity
                key={u}
                style={[styles.unitChip, unit === u && styles.unitChipActive]}
                onPress={() => handleUnitChange(u)}
              >
                <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.weightRow}>
            <View style={styles.weightInputWrapper}>
              <TextInput
                style={styles.weightInput}
                value={inputVal}
                onChangeText={handleWeightInput}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
              <Text style={styles.weightUnit}>{unit}</Text>
            </View>
            <View style={styles.steppers}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => step(-1)}>
                <MaterialCommunityIcons name="minus" size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.stepBtn, styles.stepBtnPlus]} onPress={() => step(1)}>
                <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.presetsRow}>
            {GRAM_PRESETS.map(pg => {
              const label    = unit === 'g' ? `${pg}g` : `${parseFloat((pg / UNIT_TO_G[unit]).toFixed(1))}${unit}`;
              const isActive = Math.abs(weightInG - pg) < 0.5;
              return (
                <TouchableOpacity
                  key={pg}
                  style={[styles.presetChip, isActive && styles.presetChipActive]}
                  onPress={() => handlePreset(pg)}
                >
                  <Text style={[styles.presetText, isActive && styles.presetTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Nutrition Facts */}
        <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.sectionTitle}>Nutrition Facts</Text>
          <Text style={styles.sectionSubtitle}>Per {displayWeight}{unit} serving</Text>
          <View style={styles.macroGrid}>
            {MACROS.map(m => (
              <MacroCard key={m.key} label={m.label} value={scaledMacro(m.key)} unit={m.unit} icon={m.icon} color={m.color} />
            ))}
          </View>
        </Animated.View>

        <View style={styles.baseInfo}>
          <MaterialCommunityIcons name="information-outline" size={14} color="#8E8E93" />
          <Text style={styles.baseInfoText}>
            Base values are per {baseDisplay}{unit} from database
          </Text>
        </View>

        {/* Save button — label adapts to mode */}
        <TouchableOpacity style={[styles.addButton, isEditMode && styles.editButton]} onPress={handleSave} activeOpacity={0.85}>
          <MaterialCommunityIcons
            name={isEditMode ? 'content-save-edit-outline' : 'plus-circle-outline'}
            size={22}
            color="#FFFFFF"
          />
          <Text style={styles.addButtonText}>
            {isEditMode ? 'Save Changes' : 'Add to Food Log'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function MacroCard({ label, value, unit, icon, color }) {
  return (
    <View style={[styles.macroCard, { borderLeftColor: color }]}>
      <View style={[styles.macroIconWrap, { backgroundColor: color + '22' }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.macroValue}>
        {value}<Text style={styles.macroUnit}> {unit}</Text>
      </Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#1A1B1E' },
  scroll:      { padding: 16, paddingTop: 8 },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, backgroundColor: '#1A1B1E' },
  backBtn:     { padding: 8 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },

  heroCard:         { backgroundColor: '#252830', borderRadius: 20, overflow: 'hidden', marginBottom: 16 },
  imageContainer:   { position: 'relative' },
  foodImage:        { width: '100%', height: 200 },
  imagePlaceholder: { width: '100%', height: 200, backgroundColor: '#1E2028', alignItems: 'center', justifyContent: 'center' },
  calorieBadge:     { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(255,107,53,0.92)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center' },
  calorieBadgeNum:  { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  calorieBadgeUnit: { color: '#FFD4C2', fontSize: 11 },
  mealName:         { color: '#FFFFFF', fontSize: 22, fontWeight: '800', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  mealCategory:     { color: '#8E8E93', fontSize: 13, paddingHorizontal: 16, paddingBottom: 8 },

  // ── Edit banner ──
  editBanner:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(245,166,35,0.10)', marginHorizontal: 16, marginBottom: 14, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  editBannerText: { color: '#F5A623', fontSize: 12, fontWeight: '600', flex: 1 },

  section:         { backgroundColor: '#252830', borderRadius: 20, padding: 16, marginBottom: 16 },
  sectionTitle:    { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  sectionSubtitle: { color: '#8E8E93', fontSize: 12, marginBottom: 12 },

  unitRow:            { flexDirection: 'row', gap: 8, marginBottom: 14 },
  unitChip:           { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: '#1A1B1E', borderWidth: 1, borderColor: '#3A3D4A', alignItems: 'center', justifyContent: 'center' },
  unitChipActive:     { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  unitChipText:       { color: '#8E8E93', fontSize: 14, fontWeight: '700' },
  unitChipTextActive: { color: '#FFFFFF' },

  weightRow:         { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  weightInputWrapper:{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1B1E', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, flex: 1, borderWidth: 1, borderColor: '#3A3D4A' },
  weightInput:       { color: '#FFFFFF', fontSize: 24, fontWeight: '800', flex: 1 },
  weightUnit:        { color: '#8E8E93', fontSize: 16, marginLeft: 4 },
  steppers:          { flexDirection: 'row', gap: 8 },
  stepBtn:           { width: 44, height: 44, borderRadius: 12, backgroundColor: '#3A3D4A', alignItems: 'center', justifyContent: 'center' },
  stepBtnPlus:       { backgroundColor: '#4A90E2' },

  presetsRow:       { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  presetChip:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1A1B1E', borderWidth: 1, borderColor: '#3A3D4A' },
  presetChipActive: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  presetText:       { color: '#8E8E93', fontSize: 13, fontWeight: '600' },
  presetTextActive: { color: '#FFFFFF' },

  macroGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  macroCard:    { width: (width - 32 - 32 - 10) / 2 - 2, backgroundColor: '#1E2028', borderRadius: 14, padding: 14, borderLeftWidth: 3 },
  macroIconWrap:{ width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  macroValue:   { color: '#FFFFFF', fontSize: 22, fontWeight: '800', lineHeight: 26 },
  macroUnit:    { color: '#8E8E93', fontSize: 13, fontWeight: '400' },
  macroLabel:   { color: '#8E8E93', fontSize: 12, marginTop: 2 },

  baseInfo:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20, paddingHorizontal: 4 },
  baseInfoText: { color: '#8E8E93', fontSize: 12 },

  addButton:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4A90E2', borderRadius: 16, paddingVertical: 18, gap: 10, shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  editButton:    { backgroundColor: '#E8953A' }, // amber for edit mode
  addButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
});
