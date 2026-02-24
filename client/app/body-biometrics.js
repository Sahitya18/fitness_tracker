import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

// ── BMI Calculator ─────────────────────────────────────────────────────────
function BMICard() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return;
    const bmi = (w / (h * h)).toFixed(1);
    let category = 'Underweight';
    if (bmi >= 30) category = 'Obese';
    else if (bmi >= 25) category = 'Overweight';
    else if (bmi >= 18.5) category = 'Normal';
    setResult({ bmi, category });
  };

  const categoryColor = result
    ? result.category === 'Normal'    ? '#4CAF50'
    : result.category === 'Overweight'? '#F5A623'
    : result.category === 'Obese'     ? '#FF6B35'
    : '#4A90E2' // underweight
    : '#4A90E2';

  return (
    <Surface style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="human-handsdown" size={24} color="#4A90E2" />
        <Text style={styles.cardTitle}>BMI Calculator</Text>
      </View>
      <Text style={styles.cardSubtitle}>Body Mass Index</Text>
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Height (cm)</Text>
          <TextInput style={styles.input} placeholder="170" placeholderTextColor="#8E8E93"
            value={height} onChangeText={setHeight} keyboardType="decimal-pad" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Weight (kg)</Text>
          <TextInput style={styles.input} placeholder="70" placeholderTextColor="#8E8E93"
            value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
        </View>
      </View>
      <TouchableOpacity style={styles.calcButton} onPress={calculate}>
        <Text style={styles.calcButtonText}>Calculate BMI</Text>
      </TouchableOpacity>
      {result && (
        <View style={[styles.resultBox, { borderLeftColor: categoryColor, borderLeftWidth: 3 }]}>
          <Text style={[styles.resultValue, { color: categoryColor }]}>{result.bmi}</Text>
          <Text style={styles.resultLabel}>BMI · <Text style={{ color: categoryColor }}>{result.category}</Text></Text>
        </View>
      )}
    </Surface>
  );
}

// ── BMR Calculator (Mifflin-St Jeor) ───────────────────────────────────────
function BMRCard() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age,    setAge]    = useState('');
  const [gender, setGender] = useState('male');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const w = parseFloat(weight), h = parseFloat(height), a = parseInt(age, 10);
    if (!w || !h || !a || w <= 0 || h <= 0 || a <= 0) return;
    const bmr = gender === 'male'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;
    setResult(Math.round(bmr));
  };

  return (
    <Surface style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="fire" size={24} color="#FF6B35" />
        <Text style={styles.cardTitle}>BMR Calculator</Text>
      </View>
      <Text style={styles.cardSubtitle}>Basal Metabolic Rate (kcal/day)</Text>
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Weight (kg)</Text>
          <TextInput style={styles.input} placeholder="70" placeholderTextColor="#8E8E93"
            value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Height (cm)</Text>
          <TextInput style={styles.input} placeholder="170" placeholderTextColor="#8E8E93"
            value={height} onChangeText={setHeight} keyboardType="decimal-pad" />
        </View>
      </View>
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Age</Text>
          <TextInput style={styles.input} placeholder="30" placeholderTextColor="#8E8E93"
            value={age} onChangeText={setAge} keyboardType="number-pad" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Gender</Text>
          <View style={styles.toggleRow}>
            {['male', 'female'].map(g => (
              <TouchableOpacity key={g} style={[styles.toggleBtn, gender === g && styles.toggleBtnActive]} onPress={() => setGender(g)}>
                <Text style={[styles.toggleBtnText, gender === g && styles.toggleBtnTextActive]}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      <TouchableOpacity style={[styles.calcButton, { backgroundColor: '#4A90E2' }]} onPress={calculate}>
        <Text style={styles.calcButtonText}>Calculate BMR</Text>
      </TouchableOpacity>
      {result !== null && (
        <View style={[styles.resultBox, { borderLeftColor: '#4A90E2', borderLeftWidth: 3 }]}>
          <Text style={[styles.resultValue, { color: '#4A90E2' }]}>{result}</Text>
          <Text style={styles.resultLabel}>kcal/day at rest</Text>
        </View>
      )}
    </Surface>
  );
}

// ── Activity level config ───────────────────────────────────────────────────
const ACTIVITY_LEVELS = [
  { label: 'Sedentary',  sub: 'Little / no exercise',       value: 1.2,   icon: 'sofa-single',       color: '#8E8E93' },
  { label: 'Light',      sub: '1–3 days / week',             value: 1.375, icon: 'walk',              color: '#4A90E2' },
  { label: 'Moderate',   sub: '3–5 days / week',             value: 1.55,  icon: 'run',               color: '#4CAF50' },
  { label: 'Active',     sub: '6–7 days / week',             value: 1.725, icon: 'bike',              color: '#F5A623' },
  { label: 'Very Active',sub: 'Intense training daily',      value: 1.9,   icon: 'dumbbell',          color: '#FF6B35' },
];

// ── Calories (TDEE) Calculator ─────────────────────────────────────────────
function CaloriesCard() {
  const [bmrInput, setBmrInput] = useState('');
  const [activity, setActivity] = useState(null); // nothing pre-selected
  const [result,   setResult]   = useState(null);

  const calculate = () => {
    const bmr = parseFloat(bmrInput);
    if (!bmr || bmr <= 0 || activity === null) return;
    setResult(Math.round(bmr * activity.value));
  };

  return (
    <Surface style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="food-apple" size={24} color="#66BB6A" />
        <Text style={styles.cardTitle}>Calories Calculator</Text>
      </View>
      <Text style={styles.cardSubtitle}>Daily calorie needs (TDEE)</Text>

      {/* BMR input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>BMR (from card above, or enter manually)</Text>
        <TextInput style={styles.input} placeholder="e.g. 1650" placeholderTextColor="#8E8E93"
          value={bmrInput} onChangeText={t => { setBmrInput(t); setResult(null); }}
          keyboardType="decimal-pad" />
      </View>

      {/* ── Custom activity selector ── */}
      <Text style={[styles.inputLabel, { marginTop: 16, marginBottom: 8 }]}>Activity level</Text>
      <View style={styles.activityGrid}>
        {ACTIVITY_LEVELS.map(level => {
          const isActive = activity?.value === level.value;
          return (
            <TouchableOpacity
              key={level.value}
              style={[styles.activityCard, isActive && { borderColor: level.color, backgroundColor: level.color + '18' }]}
              onPress={() => { setActivity(level); setResult(null); }}
              activeOpacity={0.75}
            >
              {/* Icon circle */}
              <View style={[styles.activityIconWrap, { backgroundColor: isActive ? level.color + '30' : '#1A1B1E' }]}>
                <MaterialCommunityIcons name={level.icon} size={20} color={isActive ? level.color : '#5A6375'} />
              </View>
              {/* Labels */}
              <View style={styles.activityTextWrap}>
                <Text style={[styles.activityLabel, isActive && { color: level.color }]}>{level.label}</Text>
                <Text style={styles.activitySub}>{level.sub}</Text>
              </View>
              {/* Multiplier badge */}
              <View style={[styles.activityBadge, isActive && { backgroundColor: level.color + '28' }]}>
                <Text style={[styles.activityBadgeText, isActive && { color: level.color }]}>×{level.value}</Text>
              </View>
              {/* Selected checkmark */}
              {isActive && (
                <MaterialCommunityIcons name="check-circle" size={16} color={level.color} style={styles.activityCheck} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.calcButton, { backgroundColor: '#4A90E2', marginTop: 16 }, (!bmrInput || activity === null) && styles.calcButtonDisabled]}
        onPress={calculate}
        activeOpacity={0.8}
      >
        <Text style={styles.calcButtonText}>Calculate Calories</Text>
      </TouchableOpacity>

      {result !== null && activity !== null && (
        <View style={[styles.resultBox, { borderLeftColor: '#4A90E2', borderLeftWidth: 3 }]}>
          <Text style={[styles.resultValue, { color: '#4A90E2' }]}>{result}</Text>
          <Text style={styles.resultLabel}>kcal/day to maintain weight</Text>
          <Text style={[styles.resultSub, { marginTop: 6 }]}>
            Activity: <Text style={{ color: activity.color, fontWeight: '700' }}>{activity.label}</Text>
            {'  ·  '}Multiplier: <Text style={{ color: activity.color, fontWeight: '700' }}>×{activity.value}</Text>
          </Text>
        </View>
      )}
    </Surface>
  );
}

// ── Body Fat % (Navy Method) ───────────────────────────────────────────────
function BodyFatCard() {
  const [height, setHeight] = useState('');
  const [waist,  setWaist]  = useState('');
  const [neck,   setNeck]   = useState('');
  const [hip,    setHip]    = useState('');
  const [gender, setGender] = useState('male');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const h = parseFloat(height), w = parseFloat(waist), n = parseFloat(neck), hipVal = parseFloat(hip);
    if (!h || !w || !n || h <= 0 || w <= 0 || n <= 0) return;
    if (gender === 'female' && (!hipVal || hipVal <= 0)) return;
    const bf = gender === 'male'
      ? 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450
      : 495 / (1.29579 - 0.35004 * Math.log10(w + hipVal - n) + 0.22100 * Math.log10(h)) - 450;
    setResult(bf.toFixed(1));
  };

  const bfColor = result
    ? parseFloat(result) > 30 ? '#FF6B35'
    : parseFloat(result) > 20 ? '#F5A623'
    : '#4A90E2'
    : '#9C27B0';

  return (
    <Surface style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="percent" size={24} color="#9C27B0" />
        <Text style={styles.cardTitle}>Body Fat %</Text>
      </View>
      <Text style={styles.cardSubtitle}>Navy method (measurements in cm)</Text>
      <View style={styles.toggleRow}>
        {['male', 'female'].map(g => (
          <TouchableOpacity key={g} style={[styles.toggleBtn, gender === g && styles.toggleBtnActive]} onPress={() => setGender(g)}>
            <Text style={[styles.toggleBtnText, gender === g && styles.toggleBtnTextActive]}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Height (cm)</Text>
          <TextInput style={styles.input} placeholder="170" placeholderTextColor="#8E8E93"
            value={height} onChangeText={setHeight} keyboardType="decimal-pad" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Waist (cm)</Text>
          <TextInput style={styles.input} placeholder="80" placeholderTextColor="#8E8E93"
            value={waist} onChangeText={setWaist} keyboardType="decimal-pad" />
        </View>
      </View>
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Neck (cm)</Text>
          <TextInput style={styles.input} placeholder="35" placeholderTextColor="#8E8E93"
            value={neck} onChangeText={setNeck} keyboardType="decimal-pad" />
        </View>
        {gender === 'female' && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Hip (cm)</Text>
            <TextInput style={styles.input} placeholder="95" placeholderTextColor="#8E8E93"
              value={hip} onChangeText={setHip} keyboardType="decimal-pad" />
          </View>
        )}
      </View>
      <TouchableOpacity style={[styles.calcButton, { backgroundColor: '#4A90E2' }]} onPress={calculate}>
        <Text style={styles.calcButtonText}>Calculate Body Fat %</Text>
      </TouchableOpacity>
      {result !== null && (
        <View style={[styles.resultBox, { borderLeftColor: bfColor, borderLeftWidth: 3 }]}>
          <Text style={[styles.resultValue, { color: bfColor }]}>{result}%</Text>
          <Text style={styles.resultLabel}>Body fat percentage</Text>
        </View>
      )}
    </Surface>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────
export default function BodyBiometricsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Body Biometrics</Text>
          <Text style={styles.headerSub}>Calculators</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <BMICard />
          <BMRCard />
          <CaloriesCard />
          <BodyFatCard />
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#1A1B1E' },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 40, marginBottom: 16, paddingHorizontal: 16 },
  backButton:    { padding: 8 },
  headerCenter:  { alignItems: 'center' },
  headerTitle:   { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  headerSub:     { color: '#8E8E93', fontSize: 12, marginTop: 2 },
  placeholder:   { width: 40 },
  keyboardView:  { flex: 1 },
  scroll:        { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  card:       { backgroundColor: '#252830', borderRadius: 16, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  cardTitle:  { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold', marginLeft: 10 },
  cardSubtitle:{ color: '#8E8E93', fontSize: 12, marginBottom: 14 },

  inputRow:   { flexDirection: 'row', gap: 12, marginBottom: 12 },
  inputGroup: { flex: 1 },
  inputLabel: { color: '#8E8E93', fontSize: 12, marginBottom: 6 },
  input:      { backgroundColor: '#1A1B1E', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#FFFFFF', fontSize: 16, borderWidth: 1, borderColor: '#333' },

  // Shared toggle (gender / binary choices)
  toggleRow:          { flexDirection: 'row', gap: 10, marginBottom: 12 },
  toggleBtn:          { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#1A1B1E', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  toggleBtnActive:    { backgroundColor: 'rgba(74,144,226,0.2)', borderColor: '#4A90E2' },
  toggleBtnText:      { color: '#8E8E93', fontSize: 14, fontWeight: '600' },
  toggleBtnTextActive:{ color: '#4A90E2' },

  calcButton:         { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4, backgroundColor: '#4A90E2' },
  calcButtonDisabled: { opacity: 0.45 },
  calcButtonText:     { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  resultBox:   { marginTop: 14, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: 'rgba(74,144,226,0.08)', borderRadius: 12, alignItems: 'center' },
  resultValue: { fontSize: 28, fontWeight: '900' },
  resultLabel: { color: '#8E8E93', fontSize: 13, marginTop: 4 },
  resultSub:   { color: '#8E8E93', fontSize: 12 },

  // ── Activity level cards ──────────────────────────────────────────────────
  activityGrid: { gap: 8 },

  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2028',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#2E3040',
    gap: 12,
  },

  activityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  activityTextWrap: { flex: 1 },
  activityLabel:    { color: '#CCCCCC', fontSize: 14, fontWeight: '700' },
  activitySub:      { color: '#5A6375', fontSize: 11, marginTop: 2 },

  activityBadge: {
    backgroundColor: '#252830',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activityBadgeText: { color: '#5A6375', fontSize: 12, fontWeight: '700' },

  activityCheck: { marginLeft: 2 },
});
