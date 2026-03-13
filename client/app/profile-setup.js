import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, ProgressBar, Surface } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { router, useLocalSearchParams } from 'expo-router';
import API_CONFIG from '../utils/config';
import { Colors, Shadows } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { useAuth } from '../utils/AuthContext';

const { width, height } = Dimensions.get('window');

const GOAL_OPTIONS = [
  { id: 'fat_loss', label: 'Fat Loss', icon: 'trending-down', color: '#FF6B35', desc: 'Burn fat & get lean' },
  { id: 'maintain', label: 'Maintain', icon: 'scale-balance', color: '#4A90E2', desc: 'Stay at current weight' },
  { id: 'gain', label: 'Muscle Gain', icon: 'trending-up', color: '#4CAF50', desc: 'Build muscle & strength' },
];

const MEAL_PREFERENCES = [
  { id: 'everything', label: 'Everything', icon: 'food' },
  { id: 'vegetarian', label: 'Vegetarian', icon: 'leaf' },
  { id: 'vegan', label: 'Vegan', icon: 'sprout' },
  { id: 'keto', label: 'Keto', icon: 'bowl-mix' },
  { id: 'paleo', label: 'Paleo', icon: 'food-steak' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', subtitle: 'Office job, little exercise', multiplier: 1.2 },
  { id: 'light', label: 'Lightly Active', subtitle: '1-2 days/week', multiplier: 1.375 },
  { id: 'moderate', label: 'Moderately Active', subtitle: '3-5 days/week', multiplier: 1.55 },
  { id: 'active', label: 'Very Active', subtitle: '6-7 days/week', multiplier: 1.725 },
  { id: 'very_active', label: 'Extremely Active', subtitle: 'Athlete level', multiplier: 1.9 },
];

const WORKOUT_PLACES = [
  { id: 'gym', label: 'Gym', icon: 'dumbbell' },
  { id: 'home', label: 'Home', icon: 'home-variant' },
  { id: 'outdoors', label: 'Outdoors', icon: 'pine-tree' },
  { id: 'mixed', label: 'Mixed', icon: 'shuffle-variant' },
];

const SPORTS = [
  { id: 'running', label: 'Running', icon: 'run' },
  { id: 'cycling', label: 'Cycling', icon: 'bike' },
  { id: 'swimming', label: 'Swimming', icon: 'swim' },
  { id: 'yoga', label: 'Yoga', icon: 'yoga' },
  { id: 'basketball', label: 'Basketball', icon: 'basketball' },
  { id: 'football', label: 'Football', icon: 'soccer' },
  { id: 'tennis', label: 'Tennis', icon: 'tennis' },
];

function toNum(v) {
  const n = Number(String(v ?? '').trim());
  return Number.isFinite(n) ? n : 0;
}

// ── Calorie formulas (Mifflin-St Jeor) ───────────────────────────────────────
function calcBMR(weight, heightCm, age, gender) {
  const w = toNum(weight);
  const h = toNum(heightCm);
  const a = toNum(age);
  if (!w || !h || !a) return 0;
  const base = 10 * w + 6.25 * h - 5 * a;
  return gender === 'Female' ? base - 161 : base + 5;
}
function calcTDEE(bmr, activityId) {
  const lvl = ACTIVITY_LEVELS.find(l => l.id === activityId);
  return Math.round(bmr * (lvl?.multiplier || 1.2));
}
function calcGoalCalories(tdee, goal) {
  if (goal === 'fat_loss') return tdee - 500;
  if (goal === 'gain') return tdee + 300;
  return tdee;
}
function calcMacros(calories, goal) {
  const splits = {
    fat_loss: { p: 0.35, c: 0.35, f: 0.3 },
    gain: { p: 0.3, c: 0.45, f: 0.25 },
    maintain: { p: 0.3, c: 0.4, f: 0.3 },
  };
  const sp = splits[goal] || splits.maintain;
  return {
    protein: Math.round((calories * sp.p) / 4),
    carbs: Math.round((calories * sp.c) / 4),
    fat: Math.round((calories * sp.f) / 9),
  };
}

// ── Journey (start month → goal month) ───────────────────────────────────────
function mockJourneyAPI(curW, tgtW, goal, ratePerMonth) {
  const months = [];
  const today = new Date();
  const n = Math.ceil(Math.abs(curW - tgtW) / Math.max(ratePerMonth, 0.01));
  for (let i = 0; i <= Math.min(n, 12); i++) {
    const d = new Date(today);
    d.setMonth(d.getMonth() + i);
    const label = d.toLocaleString('default', { month: 'short' }) + " '" + d.getFullYear().toString().slice(2);
    const w = goal === 'fat_loss' ? Math.max(tgtW, curW - ratePerMonth * i) : Math.min(tgtW, curW + ratePerMonth * i);
    months.push({ label, weight: Number(w.toFixed(1)) });
  }
  return { months, startMonth: months[0]?.label, goalMonth: months[months.length - 1]?.label };
}

function WeightJourneyGraph({ currentWeight, targetWeight, goal, weightGoalRate, colors }) {
  const cur = toNum(currentWeight);
  const tgt = toNum(targetWeight);
  const weekly = toNum(weightGoalRate);

  if (!cur || !tgt) {
    return (
      <View style={styles.graphEmpty}>
        <Text style={[styles.graphEmptyText, { color: colors.textSecondary }]}>
          Enter current & target weight to see your journey
        </Text>
      </View>
    );
  }

  const monthlyRate = weekly * 4.33;
  const data = mockJourneyAPI(cur, tgt, goal, monthlyRate || 4);
  const labels = data.months.map((m, idx) => {
    // avoid crowding labels
    if (idx === 0 || idx === data.months.length - 1) return m.label;
    return idx % 2 === 0 ? m.label : '';
  });
  const weights = data.months.map(m => m.weight);
  const accent = goal === 'fat_loss' ? '#FF6B35' : '#4CAF50';

  return (
    <View>
      <View style={styles.graphHeader}>
        <Text style={[styles.graphHeaderText, { color: colors.textSecondary }]}>
          Start <Text style={[styles.graphHeaderBold, { color: colors.text }]}>{data.startMonth}</Text>
        </Text>
        <Text style={[styles.graphHeaderText, { color: colors.textSecondary }]}>
          Goal <Text style={[styles.graphHeaderBold, { color: accent }]}>{data.goalMonth}</Text>
        </Text>
      </View>

      <LineChart
        data={{
          labels,
          datasets: [{ data: weights, color: (o = 1) => `rgba(74, 144, 226, ${o})`, strokeWidth: 3 }],
        }}
        width={width - 40}
        height={220}
        yAxisSuffix="kg"
        chartConfig={{
          backgroundColor: colors.card,
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          decimalPlaces: 1,
          color: (opacity = 1) => (goal === 'fat_loss' ? `rgba(255,107,53,${opacity})` : `rgba(76,175,80,${opacity})`),
          labelColor: (opacity = 1) => `rgba(140, 148, 163, ${opacity})`,
          propsForDots: { r: '5', strokeWidth: '2', stroke: accent },
          propsForBackgroundLines: { strokeDasharray: '', stroke: colors.border },
        }}
        bezier
        style={styles.graphChart}
      />
    </View>
  );
}

function CalorieCard({ label, calories, accent, description, macros, highlight, colors }) {
  return (
    <View
      style={[
        styles.calCard,
        {
          borderColor: highlight ? accent + '80' : colors.borderLight,
          backgroundColor: highlight ? accent + '12' : colors.surfaceVariant,
        },
      ]}
    >
      <View style={styles.calRow}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={[styles.calLabel, { color: highlight ? accent : colors.textSecondary }]}>{label}</Text>
          <Text style={[styles.calDesc, { color: colors.textSecondary }]}>{description}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.calValue, { color: highlight ? accent : colors.text }]}>{Math.round(calories)}</Text>
          <Text style={[styles.calUnit, { color: colors.textSecondary }]}>kcal/day</Text>
        </View>
      </View>

      {!!macros && (
        <View style={[styles.macroRow, { borderTopColor: colors.border }]}>
          {[
            { k: 'Protein', v: `${macros.protein}g`, c: '#4A90E2' },
            { k: 'Carbs', v: `${macros.carbs}g`, c: '#F5A623' },
            { k: 'Fat', v: `${macros.fat}g`, c: '#FF6B35' },
          ].map(m => (
            <View key={m.k} style={styles.macroBox}>
              <Text style={[styles.macroVal, { color: m.c }]}>{m.v}</Text>
              <Text style={[styles.macroKey, { color: colors.textSecondary }]}>{m.k}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function WelcomeOverlay({ visible, name }) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.welcomeOverlay}>
        <LinearGradient colors={['#0d1117', '#1A1B1E']} style={styles.welcomeGradient}>
          <Text style={styles.welcomeEmoji}>🎉</Text>
          <Text style={styles.welcomeTitle}>Welcome to FitMe!</Text>
          <Text style={styles.welcomeSub}>
            Your journey starts now,{'\n'}
            <Text style={styles.welcomeName}>{name || 'there'}!</Text>
          </Text>
          <Text style={styles.welcomeFooter}>Taking you to your dashboard...</Text>
        </LinearGradient>
      </View>
    </Modal>
  );
}

export default function ProfileSetupScreen() {
  const params = useLocalSearchParams();
  const { userData } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];

  const email = typeof params?.email === 'string' ? params.email : (userData?.email || userData?.user?.email);

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const [fd, setFd] = useState({
    firstName: '',
    lastName: '',
    goal: '',
    weightLossGoal: '1',
    weightGainGoal: '0.5',
    mealPreference: '',
    activityLevel: '',
    height: '',
    weight: '',
    targetWeight: '',
    gender: '',
    age: '',
    workoutPlace: '',
    sports: [],
  });

  const upd = (k, v) => setFd(p => ({ ...p, [k]: v }));

  // Step order: 1→2→4→5→6→7→8(calories, always)→3(weight goal, conditional)
  const visibleSteps = useMemo(() => {
    const base = [1, 2, 4, 5, 6, 7, 8];
    if (fd.goal === 'fat_loss' || fd.goal === 'gain') base.push(3);
    return base;
  }, [fd.goal]);

  const stepIdx = visibleSteps.indexOf(currentStep);
  const totalSteps = visibleSteps.length;
  const progress = (stepIdx + 1) / totalSteps;
  const isLast = stepIdx === totalSteps - 1;

  const bmr = calcBMR(fd.weight, fd.height, fd.age, fd.gender);
  const tdee = calcTDEE(bmr, fd.activityLevel);
  const goalCals = calcGoalCalories(tdee, fd.goal);
  const goalMacros = calcMacros(goalCals, fd.goal);
  const maintMacros = calcMacros(tdee, 'maintain');
  const activityInfo = ACTIVITY_LEVELS.find(a => a.id === fd.activityLevel);

  useEffect(() => {
    if (showWelcome) {
      const t = setTimeout(() => {
        setShowWelcome(false);
        router.replace('/home');
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [showWelcome]);

  const validateCurrentStep = () => {
    if (!email) {
      Alert.alert('Error', 'Email missing. Please register again.');
      return false;
    }

    if (currentStep === 1) {
      if (!fd.firstName.trim()) return Alert.alert('Validation', 'Please enter first name'), false;
      return true;
    }
    if (currentStep === 2) {
      if (!fd.goal) return Alert.alert('Validation', 'Please select your goal'), false;
      return true;
    }
    if (currentStep === 4) {
      if (!fd.mealPreference) return Alert.alert('Validation', 'Please select a meal preference'), false;
      return true;
    }
    if (currentStep === 5) {
      if (!fd.activityLevel) return Alert.alert('Validation', 'Please select activity level'), false;
      return true;
    }
    if (currentStep === 6) {
      const h = toNum(fd.height);
      const w = toNum(fd.weight);
      const a = toNum(fd.age);
      if (!fd.gender) return Alert.alert('Validation', 'Please select gender'), false;
      if (h < 100 || h > 250) return Alert.alert('Validation', 'Height must be between 100 and 250 cm'), false;
      if (w < 30 || w > 300) return Alert.alert('Validation', 'Weight must be between 30 and 300 kg'), false;
      if (a < 5 || a > 120) return Alert.alert('Validation', 'Age must be valid'), false;
      if ((fd.goal === 'fat_loss' || fd.goal === 'gain') && !toNum(fd.targetWeight)) {
        return Alert.alert('Validation', 'Please enter target weight'), false;
      }
      return true;
    }
    if (currentStep === 7) {
      if (!fd.workoutPlace) return Alert.alert('Validation', 'Please select workout place'), false;
      return true;
    }
    if (currentStep === 8) {
      // calories step is informational; allow continue
      return true;
    }
    if (currentStep === 3) {
      if (!toNum(fd.targetWeight)) return Alert.alert('Validation', 'Please enter target weight'), false;
      return true;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    if (!isLast) {
      setCurrentStep(visibleSteps[stepIdx + 1]);
      return;
    }

    // last step → submit profile then show welcome → home
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = {
        email,
        firstName: fd.firstName.trim(),
        lastName: fd.lastName.trim(),
        gender: fd.gender,
        height: toNum(fd.height),
        weight: toNum(fd.weight),
        targetWeight: toNum(fd.targetWeight),
        goal: fd.goal,
        mealPreference: fd.mealPreference,
        activityLevel: fd.activityLevel,
        age: Math.round(toNum(fd.age)),
        workoutPlace: fd.workoutPlace,
        sports: fd.sports,
      };

      const url =
        `${API_CONFIG.BASE_URL_LOCALHOST}` +
        `${API_CONFIG.ENDPOINTS.REGISTRATION.PORT}` +
        `${API_CONFIG.ENDPOINTS.REGISTRATION.CREATE_PROFILE}`;

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowWelcome(true);
      } else {
        const txt = await res.text();
        Alert.alert('Profile Setup Failed', txt || 'Something went wrong. Please try again.');
      }
    } catch (e) {
      Alert.alert('Error', e?.message || 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (stepIdx > 0) setCurrentStep(visibleSteps[stepIdx - 1]);
  };

  const toggleSport = (id) => {
    setFd(p => {
      const has = p.sports.includes(id);
      return { ...p, sports: has ? p.sports.filter(x => x !== id) : [...p.sports, id] };
    });
  };

  const weightLossOpts = [
    { value: '0.5', label: '0.5 kg/week', subtitle: 'Slow & steady', icon: 'turtle' },
    { value: '1', label: '1 kg/week', subtitle: 'Recommended', icon: 'thumb-up' },
    { value: '1.5', label: '1.5 kg/week', subtitle: 'Aggressive', icon: 'fire' },
  ];
  const weightGainOpts = [
    { value: '0.25', label: '0.25 kg/week', subtitle: 'Lean bulk', icon: 'sprout' },
    { value: '0.5', label: '0.5 kg/week', subtitle: 'Recommended', icon: 'thumb-up' },
    { value: '0.75', label: '0.75 kg/week', subtitle: 'Fast bulk', icon: 'flash' },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.step}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>What should we call you?</Text>
            <TextInput
              placeholder="First Name"
              placeholderTextColor={colors.textTertiary}
              value={fd.firstName}
              onChangeText={(t) => upd('firstName', t)}
              style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceVariant, borderColor: colors.borderLight }]}
            />
            <TextInput
              placeholder="Last Name"
              placeholderTextColor={colors.textTertiary}
              value={fd.lastName}
              onChangeText={(t) => upd('lastName', t)}
              style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceVariant, borderColor: colors.borderLight }]}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.step}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>What's your goal?</Text>
            {GOAL_OPTIONS.map(opt => {
              const selected = fd.goal === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => upd('goal', opt.id)}
                  activeOpacity={0.85}
                  style={[
                    styles.optionCard,
                    {
                      borderColor: selected ? opt.color : colors.borderLight,
                      backgroundColor: selected ? opt.color + '12' : colors.card,
                    },
                  ]}
                >
                  <MaterialCommunityIcons name={opt.icon} size={24} color={selected ? opt.color : colors.textSecondary} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.optionTitle, { color: selected ? opt.color : colors.text }]}>{opt.label}</Text>
                    <Text style={[styles.optionSub, { color: colors.textSecondary }]}>{opt.desc}</Text>
                  </View>
                  <MaterialCommunityIcons name={selected ? 'check-circle' : 'circle-outline'} size={20} color={selected ? opt.color : colors.border} />
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case 4:
        return (
          <View style={styles.step}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Meal preference</Text>
            <View style={styles.chipsWrap}>
              {MEAL_PREFERENCES.map(opt => {
                const selected = fd.mealPreference === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => upd('mealPreference', opt.id)}
                    activeOpacity={0.85}
                    style={[
                      styles.chip,
                      {
                        borderColor: selected ? colors.primary : colors.borderLight,
                        backgroundColor: selected ? colors.primary + '12' : colors.card,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name={opt.icon} size={18} color={selected ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.chipText, { color: selected ? colors.primary : colors.textSecondary }]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.step}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Activity level</Text>
            {ACTIVITY_LEVELS.map(opt => {
              const selected = fd.activityLevel === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => upd('activityLevel', opt.id)}
                  activeOpacity={0.85}
                  style={[
                    styles.optionCard,
                    {
                      borderColor: selected ? colors.primary : colors.borderLight,
                      backgroundColor: selected ? colors.primary + '12' : colors.card,
                    },
                  ]}
                >
                  <MaterialCommunityIcons name="walk" size={22} color={selected ? colors.primary : colors.textSecondary} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.optionTitle, { color: selected ? colors.primary : colors.text }]}>{opt.label}</Text>
                    <Text style={[styles.optionSub, { color: colors.textSecondary }]}>{opt.subtitle}</Text>
                  </View>
                  <MaterialCommunityIcons name={selected ? 'check-circle' : 'circle-outline'} size={20} color={selected ? colors.primary : colors.border} />
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case 6:
        return (
          <View style={styles.step}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Personal information</Text>

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Gender</Text>
            <View style={styles.row}>
              {['Male', 'Female', 'Other'].map(g => {
                const selected = fd.gender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    onPress={() => upd('gender', g)}
                    activeOpacity={0.85}
                    style={[
                      styles.genderBtn,
                      {
                        borderColor: selected ? colors.primary : colors.borderLight,
                        backgroundColor: selected ? colors.primary + '12' : colors.card,
                      },
                    ]}
                  >
                    <Text style={[styles.genderText, { color: selected ? colors.primary : colors.textSecondary }]}>{g}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Height (cm)</Text>
                <TextInput
                  placeholder="170"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  value={fd.height}
                  onChangeText={(t) => upd('height', t)}
                  style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceVariant, borderColor: colors.borderLight }]}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Weight (kg)</Text>
                <TextInput
                  placeholder="70"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  value={fd.weight}
                  onChangeText={(t) => upd('weight', t)}
                  style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceVariant, borderColor: colors.borderLight }]}
                />
              </View>
            </View>

            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Age</Text>
                <TextInput
                  placeholder="25"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  value={fd.age}
                  onChangeText={(t) => upd('age', t)}
                  style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceVariant, borderColor: colors.borderLight }]}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Target Weight (kg)</Text>
                <TextInput
                  placeholder="65"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  value={fd.targetWeight}
                  onChangeText={(t) => upd('targetWeight', t)}
                  style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceVariant, borderColor: colors.borderLight }]}
                />
              </View>
            </View>
          </View>
        );

      case 7:
        return (
          <View style={styles.step}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Workout preferences</Text>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Where do you prefer to workout?</Text>
            <View style={styles.chipsWrap}>
              {WORKOUT_PLACES.map(opt => {
                const selected = fd.workoutPlace === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => upd('workoutPlace', opt.id)}
                    activeOpacity={0.85}
                    style={[
                      styles.chip,
                      {
                        borderColor: selected ? colors.primary : colors.borderLight,
                        backgroundColor: selected ? colors.primary + '12' : colors.card,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name={opt.icon} size={18} color={selected ? colors.primary : colors.textSecondary} />
                    <Text style={[styles.chipText, { color: selected ? colors.primary : colors.textSecondary }]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 12 }]}>Sports you enjoy (optional)</Text>
            <View style={styles.chipsWrap}>
              {SPORTS.map(s => {
                const selected = fd.sports.includes(s.id);
                return (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => toggleSport(s.id)}
                    activeOpacity={0.85}
                    style={[
                      styles.chip,
                      {
                        borderColor: selected ? colors.secondary : colors.borderLight,
                        backgroundColor: selected ? colors.secondary + '12' : colors.card,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name={s.icon} size={18} color={selected ? colors.secondary : colors.textSecondary} />
                    <Text style={[styles.chipText, { color: selected ? colors.secondary : colors.textSecondary }]}>{s.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 8: {
        const canCalc = !!(fd.weight && fd.height && fd.age && fd.activityLevel && fd.gender);
        const goalColor = fd.goal === 'fat_loss' ? '#FF6B35' : fd.goal === 'gain' ? '#4CAF50' : '#4A90E2';

        return (
          <View style={styles.step}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>Your calorie targets</Text>

            {!canCalc ? (
              <View style={[styles.infoBox, { backgroundColor: colors.surfaceVariant, borderColor: colors.borderLight }]}>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Please complete your personal information first (height, weight, age, gender & activity).
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.pillsRow}>
                  {[
                    { k: 'BMR', v: `${Math.round(bmr)} kcal`, s: 'Calories at rest' },
                    { k: 'TDEE', v: `${tdee} kcal`, s: `Maintenance × ${activityInfo?.multiplier}` },
                  ].map(p => (
                    <View key={p.k} style={[styles.pill, { backgroundColor: colors.surfaceVariant, borderColor: colors.borderLight }]}>
                      <Text style={[styles.pillKey, { color: colors.textSecondary }]}>{p.k}</Text>
                      <Text style={[styles.pillVal, { color: colors.text }]}>{p.v}</Text>
                      <Text style={[styles.pillSub, { color: colors.textSecondary }]}>{p.s}</Text>
                    </View>
                  ))}
                </View>

                <CalorieCard
                  label="Maintenance Calories"
                  calories={tdee}
                  accent="#4A90E2"
                  description="Calories to stay at your current weight"
                  macros={fd.goal === 'maintain' ? maintMacros : null}
                  highlight={fd.goal === 'maintain'}
                  colors={colors}
                />

                {fd.goal !== 'maintain' && (
                  <CalorieCard
                    label={fd.goal === 'fat_loss' ? 'Fat Loss Target' : 'Muscle Gain Target'}
                    calories={goalCals}
                    accent={goalColor}
                    description={fd.goal === 'fat_loss' ? 'Maintenance − 500 kcal deficit' : 'Maintenance + 300 kcal surplus'}
                    macros={goalMacros}
                    highlight
                    colors={colors}
                  />
                )}
              </>
            )}
          </View>
        );
      }

      case 3: {
        const isLoss = fd.goal === 'fat_loss';
        const opts = isLoss ? weightLossOpts : weightGainOpts;
        const rateKey = isLoss ? 'weightLossGoal' : 'weightGainGoal';
        const selRate = fd[rateKey];
        const accent = isLoss ? '#FF6B35' : '#4CAF50';

        return (
          <View style={styles.step}>
            <Text style={[styles.stepTitle, { color: colors.text }]}>{isLoss ? 'Weight loss goal' : 'Weight gain goal'}</Text>
            <Text style={[styles.optionSub, { color: colors.textSecondary, marginBottom: 8 }]}>
              How fast do you want to {isLoss ? 'lose' : 'gain'} weight?
            </Text>

            <View style={styles.rateRow}>
              {opts.map(opt => {
                const selected = selRate === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => upd(rateKey, opt.value)}
                    activeOpacity={0.85}
                    style={[
                      styles.rateCard,
                      {
                        borderColor: selected ? accent : colors.borderLight,
                        backgroundColor: selected ? accent + '12' : colors.card,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name={opt.icon} size={22} color={selected ? accent : colors.textSecondary} />
                    <Text style={[styles.rateLabel, { color: selected ? accent : colors.text }]}>{opt.label}</Text>
                    <Text style={[styles.rateSub, { color: colors.textSecondary }]}>{opt.subtitle}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Current Weight (kg)</Text>
                <TextInput
                  placeholder="80"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  value={fd.weight}
                  onChangeText={(t) => upd('weight', t)}
                  style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceVariant, borderColor: colors.borderLight }]}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Target Weight (kg)</Text>
                <TextInput
                  placeholder={isLoss ? '70' : '85'}
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  value={fd.targetWeight}
                  onChangeText={(t) => upd('targetWeight', t)}
                  style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceVariant, borderColor: colors.borderLight }]}
                />
              </View>
            </View>

            <View style={[styles.graphBox, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
              <Text style={[styles.graphTitle, { color: colors.text }]}>Your weight journey</Text>
              <WeightJourneyGraph
                currentWeight={fd.weight}
                targetWeight={fd.targetWeight}
                goal={fd.goal}
                weightGoalRate={selRate}
                colors={colors}
              />
            </View>
          </View>
        );
      }

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIconWrap, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
              <MaterialCommunityIcons name="account-details" size={42} color="white" />
            </View>
            <Text style={styles.headerTitle}>Profile Setup</Text>
            <Text style={styles.headerSubtitle}>Step {stepIdx + 1} of {totalSteps}</Text>
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Surface style={[styles.formCard, { backgroundColor: colors.card }, Shadows.medium]}>
            <ProgressBar progress={progress} color={colors.primary} style={styles.progress} />

            <View style={{ marginTop: 14 }}>{renderStep()}</View>

            <View style={styles.footerRow}>
              <Button
                mode="outlined"
                onPress={handleBack}
                disabled={stepIdx === 0 || submitting}
                style={[styles.backBtn, { borderColor: colors.border }]}
                labelStyle={{ color: colors.textSecondary }}
              >
                Back
              </Button>

              <Button
                mode="contained"
                onPress={handleNext}
                loading={submitting}
                disabled={submitting}
                style={[styles.nextBtn, { backgroundColor: colors.primary }]}
                contentStyle={styles.nextBtnContent}
                labelStyle={styles.nextBtnLabel}
              >
                {isLast ? 'Complete Setup' : 'Continue'}
              </Button>
            </View>
          </Surface>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      <WelcomeOverlay visible={showWelcome} name={fd.firstName} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },

  headerGradient: {
    height: height * 0.28,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: { alignItems: 'center', paddingHorizontal: 20 },
  headerIconWrap: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Shadows.small,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 6 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },

  formContainer: { flex: 1, paddingHorizontal: 20, marginTop: -30 },
  formCard: { borderRadius: 20, padding: 16, marginBottom: 20 },
  progress: { height: 8, borderRadius: 4 },

  step: { paddingBottom: 8 },
  stepTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 14 },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },

  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  optionTitle: { fontSize: 15, fontWeight: '800' },
  optionSub: { fontSize: 12, lineHeight: 16, marginTop: 2 },

  sectionLabel: { fontSize: 12, fontWeight: '800', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.7 },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '800' },

  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  genderBtn: { flex: 1, paddingVertical: 12, borderWidth: 1, borderRadius: 12, alignItems: 'center' },
  genderText: { fontSize: 13, fontWeight: '800' },

  twoCol: { flexDirection: 'row', marginTop: 8 },

  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  backBtn: { borderRadius: 12, minWidth: 110 },
  nextBtn: { borderRadius: 12, minWidth: 150 },
  nextBtnContent: { paddingVertical: 6 },
  nextBtnLabel: { fontSize: 15, fontWeight: '800', color: 'white' },

  pillsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  pill: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 12, alignItems: 'center' },
  pillKey: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  pillVal: { fontSize: 18, fontWeight: '900', marginTop: 4 },
  pillSub: { fontSize: 10, marginTop: 2, textAlign: 'center' },

  calCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 },
  calRow: { flexDirection: 'row', justifyContent: 'space-between' },
  calLabel: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  calDesc: { fontSize: 12, lineHeight: 16 },
  calValue: { fontSize: 30, fontWeight: '900', lineHeight: 34 },
  calUnit: { fontSize: 10, fontWeight: '700', marginTop: 2 },

  macroRow: { flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  macroBox: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.03)' },
  macroVal: { fontSize: 16, fontWeight: '900' },
  macroKey: { fontSize: 10, fontWeight: '800', marginTop: 2 },

  infoBox: { borderWidth: 1, borderRadius: 14, padding: 14 },
  infoText: { fontSize: 13, lineHeight: 18, textAlign: 'center', fontWeight: '700' },

  rateRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  rateCard: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
  rateLabel: { fontSize: 12, fontWeight: '900', textAlign: 'center' },
  rateSub: { fontSize: 10, fontWeight: '700', textAlign: 'center' },

  graphBox: { borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 4 },
  graphTitle: { fontSize: 14, fontWeight: '900', marginBottom: 10 },
  graphHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  graphHeaderText: { fontSize: 11, fontWeight: '700' },
  graphHeaderBold: { fontSize: 11, fontWeight: '900' },
  graphChart: { borderRadius: 16 },
  graphEmpty: { paddingVertical: 20, alignItems: 'center' },
  graphEmptyText: { fontSize: 12, fontWeight: '700' },

  welcomeOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center' },
  welcomeGradient: { width: '88%', borderRadius: 22, paddingVertical: 26, paddingHorizontal: 20, alignItems: 'center' },
  welcomeEmoji: { fontSize: 64, marginBottom: 8 },
  welcomeTitle: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 10 },
  welcomeSub: { fontSize: 15, color: '#aab3c2', textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  welcomeName: { color: '#4A90E2', fontWeight: '900' },
  welcomeFooter: { fontSize: 12, color: '#667085', fontWeight: '800' },
});
