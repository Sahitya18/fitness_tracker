import React, { useState } from 'react';
import {
  View, Text, Image, ActivityIndicator, Alert, StyleSheet,
  TouchableOpacity, Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

// ─────────────────────────────────────────────────────────────────────────────
// 🔑 YOUR OCR.space API KEY — https://ocr.space/ocrapi
// ─────────────────────────────────────────────────────────────────────────────
const OCR_API_KEY = 'K84957361388957';
const OCR_API_URL = 'https://api.ocr.space/parse/image';

// Target file size for JPEG (well under 1024 KB limit to avoid size errors)
// Using 800 KB as safe target to account for any encoding variations
const TARGET_FILE_KB = 800;
const MAX_FILE_KB = 1024; // Hard limit from OCR.space API

// ─────────────────────────────────────────────────────────────────────────────
// compressToTarget
// Shrinks + re-encodes until the actual file on disk is ≤ TARGET_FILE_KB.
// Uses expo-image-manipulator (no extra native setup with Expo).
// ─────────────────────────────────────────────────────────────────────────────
async function compressToTarget(uri) {
  // More aggressive compression attempts - start smaller and lower quality
  const attempts = [
    [1000, 0.6],
    [900, 0.5],
    [800, 0.4],
    [700, 0.35],
    [600, 0.3],
    [500, 0.25],
    [450, 0.2],
    [400, 0.15],
    [350, 0.12],
    [300, 0.1],
  ];

  for (const [maxWidth, quality] of attempts) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );

    const info = await FileSystem.getInfoAsync(result.uri, { size: true });
    const sizeKB = Math.round((info.size || 0) / 1024);
    console.log(`📐 Attempt w=${maxWidth} q=${quality} → ${sizeKB} KB`);

    if (sizeKB <= TARGET_FILE_KB) {
      console.log(`✅ Compressed to ${sizeKB} KB`);
      return { uri: result.uri, sizeKB };
    }
  }

  // Final fallback - very aggressive compression
  const last = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 250 } }],
    { compress: 0.08, format: ImageManipulator.SaveFormat.JPEG }
  );
  const info = await FileSystem.getInfoAsync(last.uri, { size: true });
  const sizeKB = Math.round((info.size || 0) / 1024);
  console.log(`✅ Fallback compressed to ${sizeKB} KB`);
  
  // Final safety check - if still too large, throw error with helpful message
  if (sizeKB > MAX_FILE_KB) {
    throw new Error(`Image too large (${sizeKB} KB). Please crop tighter to just the nutrition label and try again.`);
  }
  
  return { uri: last.uri, sizeKB };
}

// ─────────────────────────────────────────────────────────────────────────────
// callOCRSpace
// Sends compressed JPEG as raw multipart/form-data file upload.
// ─────────────────────────────────────────────────────────────────────────────
export async function callOCRSpace(imageAsset, onProgress) {
  onProgress?.('Compressing image...');
  const { uri, sizeKB } = await compressToTarget(imageAsset.uri);
  
  // Final safety check before sending
  if (sizeKB > MAX_FILE_KB) {
    throw new Error(`File still too large (${sizeKB} KB). Maximum allowed is ${MAX_FILE_KB} KB. Please crop tighter to just the nutrition label.`);
  }
  
  onProgress?.(`Compressed to ${sizeKB} KB · Uploading...`);

  const body = new FormData();
  body.append('file', {
    uri,
    name: 'label.jpg',
    type: 'image/jpeg',
  });
  body.append('apikey', OCR_API_KEY);
  body.append('language', 'eng');
  body.append('isOverlayRequired', 'false');
  body.append('OCREngine', '2');
  body.append('isTable', 'true');
  body.append('scale', 'true');
  body.append('detectOrientation', 'true');

  onProgress?.('Reading nutrition label...');
  const response = await fetch(OCR_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data' },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Check for file size errors in response
    if (errorText.includes('1024') || errorText.includes('size') || errorText.includes('limit')) {
      throw new Error(`File size limit exceeded. Please crop tighter to just the nutrition label and try again.`);
    }
    throw new Error(`OCR server error: HTTP ${response.status}`);
  }

  const data = await response.json();
  console.log('📄 OCR response:', JSON.stringify(data, null, 2));

  if (data.IsErroredOnProcessing) {
    const msg = Array.isArray(data.ErrorMessage)
      ? data.ErrorMessage.join(' ')
      : (data.ErrorMessage || 'OCR failed');
    
    // Check for file size errors in error message
    if (msg.includes('1024') || msg.toLowerCase().includes('size') || msg.toLowerCase().includes('limit')) {
      throw new Error(`File size limit exceeded (1024 KB). Please crop tighter to just the nutrition label and try again.`);
    }
    
    throw new Error(msg);
  }

  const text = data.ParsedResults?.[0]?.ParsedText || '';
  if (!text.trim()) {
    throw new Error('No text detected in image.');
  }

  return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// parseNutritionFromOCRText — robust line-pair strategy
// ─────────────────────────────────────────────────────────────────────────────
export function parseNutritionFromOCRText(rawText) {
  if (!rawText) return {};
  console.log('🔍 Raw OCR text:\n', rawText);

  const cleaned = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .toLowerCase();

  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);

  const getNum = (str) => {
    const s = str.replace(/\d+\s*%/g, '');
    const m = s.match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : null;
  };

  const has = (line, words) => words.some(w => line.includes(w));
  const fatExclusions = ['saturated', 'trans', 'unsaturated', 'monounsat', 'polyunsat', 'hdl', 'ldl'];
  const result = {
    servingSize: undefined,
    servingUnit: undefined,
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1] || '';

    const numLine = getNum(line) !== null ? line : next;
    const val = getNum(numLine);
    if (val === null) continue;

    if (
      result.calories === undefined &&
      has(line, ['calori', 'calones', 'energy', 'kcal']) &&
      !has(line, ['from fat', 'from carb'])
    ) {
      result.calories = val;
    }

    if (
      result.protein === undefined &&
      has(line, ['protein', 'protei', 'proteln', 'protien'])
    ) {
      result.protein = val;
    }

    if (
      result.carbs === undefined &&
      has(line, ['carbohydrate', 'carbohydrat', 'total carb', 'carbs', 'glucide']) &&
      !has(line, ['fiber', 'fibre', 'sugar'])
    ) {
      result.carbs = val;
    }

    if (
      result.fat === undefined &&
      has(line, ['total fat', ' fat ', 'fat\t', 'fats ', 'lipid', 'total lip']) &&
      !has(line, fatExclusions)
    ) {
      result.fat = val;
    }

    if (
      result.fiber === undefined &&
      has(line, ['fiber', 'fibre', 'fibr', 'dietary fi'])
    ) {
      result.fiber = val;
    }

    if (
      result.sugar === undefined &&
      has(line, ['total sugar', 'sugars', ' sugar']) &&
      !has(line, ['added sugar', 'alcohol'])
    ) {
      result.sugar = val;
    }

    if (
      result.sodium === undefined &&
      has(line, ['sodium', 'sodiu', 'salt', 'natrium'])
    ) {
      result.sodium = val;
    }

    // ── Serving Size ─────────────────────────────────────────────────────────
    if (
      result.servingSize === undefined &&
      has(line, ['serving size', 'serving', 'serv.', 'per serving', 'per serv'])
    ) {
      // Check the current line and next line combined
      const searchText = (line + ' ' + next);
      
      // First try: Look for serving size in parentheses (most common format: "2/3 cup (55g)")
      let servingMatch = searchText.match(/\((\d+(?:\.\d+)?)\s*(g|ml|oz|kg|gram|grams|milliliter|milliliters|ounce|ounces)\)/i);
      
      // Second try: Look for "Xg" or "X g" format after "serving size"
      if (!servingMatch) {
        servingMatch = searchText.match(/serving\s*size[^\d]*(\d+(?:\.\d+)?)\s*(g|ml|oz|kg|gram|grams|milliliter|milliliters|ounce|ounces)/i);
      }
      
      // Third try: Look for any number followed by unit after "serving"
      if (!servingMatch) {
        servingMatch = searchText.match(/serving[^\d]*(\d+(?:\.\d+)?)\s*(g|ml|oz|kg|gram|grams|milliliter|milliliters|ounce|ounces)/i);
      }
      
      if (servingMatch) {
        result.servingSize = parseFloat(servingMatch[1]);
        let unit = servingMatch[2].toLowerCase().replace(/s$/, ''); // Remove plural 's'
        // Normalize unit abbreviations
        if (unit.includes('gram')) unit = 'g';
        else if (unit.includes('milliliter')) unit = 'ml';
        else if (unit.includes('ounce')) unit = 'oz';
        result.servingUnit = unit;
      }
    }
  }

  const fallback = (field, patterns) => {
    if (result[field] !== undefined) return;
    for (const pat of patterns) {
      const m = cleaned.match(pat);
      if (m) { result[field] = parseFloat(m[1]); return; }
    }
  };

  fallback('calories', [
    /(?:calori[^\n]{0,10}?|energy[^\n]{0,10}?)(\d+(?:\.\d+)?)\s*(?:kcal|cal|$)/,
    /(\d{2,4})\s*(?:kcal|cal)\b/,
  ]);
  fallback('protein', [
    /protein[^\n]{0,5}?(\d+(?:\.\d+)?)\s*g/,
    /protein\s*\n\s*(\d+(?:\.\d+)?)/,
  ]);
  fallback('carbs', [
    /carbohydrate[^\n]{0,5}?(\d+(?:\.\d+)?)\s*g/,
    /carbohydrate\s*\n\s*(\d+(?:\.\d+)?)/,
    /carbs?[^\n]{0,5}?(\d+(?:\.\d+)?)\s*g/,
  ]);
  fallback('fat', [
    /total fat[^\n]{0,5}?(\d+(?:\.\d+)?)\s*g/,
    /\bfat\b[^\n]{0,5}?(\d+(?:\.\d+)?)\s*g/,
  ]);
  fallback('fiber', [
    /(?:dietary\s*)?fi[b]?[e]?r[^\n]{0,5}?(\d+(?:\.\d+)?)\s*g/,
  ]);

  // Fallback: Try regex patterns if line-by-line parsing didn't find serving size
  let servingSize = result.servingSize !== undefined ? result.servingSize : '';
  let servingUnit = result.servingUnit || 'g';
  
  if (servingSize === '') {
    const srvPatterns = [
      // Priority 1: Look for serving size in parentheses (e.g., "2/3 cup (55g)")
      /\((\d+(?:\.\d+)?)\s*(g|ml|oz|kg|gram|grams|milliliter|milliliters|ounce|ounces)\)/i,
      // Priority 2: "Serving size: 100g" format
      /serving\s*size[:\s]+[^(]*?(\d+(?:\.\d+)?)\s*(g|ml|oz|kg|gram|grams|milliliter|milliliters|ounce|ounces)/i,
      // Priority 3: "Serv. size: 100g" format
      /serv\.\s*size[:\s]+(\d+(?:\.\d+)?)\s*(g|ml|oz|gram|grams|milliliter|milliliters|ounce|ounces)/i,
      // Priority 4: "Per 100g" format
      /per\s+(\d+(?:\.\d+)?)\s*(g|ml|oz|gram|grams|milliliter|milliliters|ounce|ounces)/i,
      // Priority 5: "100g per serving" format
      /(\d+(?:\.\d+)?)\s*(g|ml|gram|grams|milliliter|milliliters)\s*per\s*serv/i,
    ];
    for (const p of srvPatterns) {
      const m = rawText.match(p);
      if (m) {
        servingSize = parseFloat(m[1]);
        let unit = m[2].toLowerCase().replace(/s$/, ''); // Remove plural
        // Normalize unit abbreviations
        if (unit.includes('gram')) unit = 'g';
        else if (unit.includes('milliliter')) unit = 'ml';
        else if (unit.includes('ounce')) unit = 'oz';
        servingUnit = unit;
        break;
      }
    }
  }

  const SKIP_LINE = [
    /^nutrition\s*facts?/i, /^supplement\s*facts?/i,
    /^amount\s*per/i,       /^serving/i,
    /^calories/i,           /^%\s*daily/i,
    /^total/i,              /^dietary/i,
    /^vitamin/i,            /^mineral/i,
    /^sodium/i,             /^protein/i,
    /^carbo/i,              /^fat/i,
    /^sugar/i,              /^fiber/i,
    /^ingredi/i,            /^contains/i,
  ];
  let productName = '';
  for (const line of rawText.split(/\n/).map(l => l.trim())) {
    if (!line || line.length < 3 || line.length > 60) continue;
    if (/^\d/.test(line)) continue;
    if (SKIP_LINE.some(p => p.test(line))) continue;
    const cl = line.replace(/[^a-zA-Z0-9 &\-()']/g, '').trim();
    if (cl.length > 2) { productName = cl; break; }
  }

  const clean = (v) => {
    if (v === undefined || v === null || isNaN(v)) return '';
    const n = Math.abs(parseFloat(v));
    return isFinite(n) ? n : '';
  };

  const parsed = {
    calories:    clean(result.calories),
    protein:     clean(result.protein),
    carbs:       clean(result.carbs),
    fat:         clean(result.fat),
    fiber:       clean(result.fiber),
    sugar:       clean(result.sugar),
    sodium:      clean(result.sodium),
    servingSize: servingSize !== '' ? Math.abs(parseFloat(servingSize)) : '',
    servingUnit,
    productName,
  };

  console.log('✅ Final parsed nutrition:', parsed);
  return parsed;
}

// ─────────────────────────────────────────────────────────────────────────────
// ScannerComponent
// ─────────────────────────────────────────────────────────────────────────────
export default function ScannerComponent({ onNutritionExtracted, onTextExtracted }) {
  const [image,     setImage]     = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [progress,  setProgress]  = useState('');

  const requestPermissions = async () => {
    const [mediaPerm, cameraPerm] = await Promise.all([
      ImagePicker.requestMediaLibraryPermissionsAsync(),
      ImagePicker.requestCameraPermissionsAsync(),
    ]);
    if (!mediaPerm.granted || !cameraPerm.granted) {
      Alert.alert('Permission Denied', 'Camera and gallery access are required.');
      return false;
    }
    return true;
  };

  const openPicker = async (mode) => {
    const ok = await requestPermissions();
    if (!ok) return;
    const opts = {
      allowsEditing: true,
      quality: 1,
      aspect: [3, 4],
    };
    const res = mode === 'camera'
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);
    if (!res.canceled) {
      setImage(res.assets[0]);
      setShowModal(true);
    }
  };

  const handleExtract = async () => {
    if (!image) return;
    setLoading(true);
    setProgress('Starting...');
    try {
      const rawText = await callOCRSpace(image, setProgress);
      setProgress('Mapping nutrients...');
      const nutrition = parseNutritionFromOCRText(rawText);
      console.log('✅ OCR raw text:', rawText);
      console.log('✅ Parsed nutrition:', nutrition);
      setShowModal(false);
      setImage(null);

      if (onNutritionExtracted) onNutritionExtracted(nutrition, rawText);
      else if (onTextExtracted) onTextExtracted(rawText, nutrition);
    } catch (err) {
      console.error('OCR error:', err.message);
      const msg = err.message || '';
      if (msg.includes('No text')) {
        Alert.alert('No Text Found', 'Ensure the nutrition label fills the frame and is well-lit.');
      } else if (msg.includes('1024') || msg.toLowerCase().includes('size') || msg.toLowerCase().includes('limit') || msg.toLowerCase().includes('too large')) {
        Alert.alert(
          'File Too Large', 
          'The image is still too large after compression. Please:\n\n• Crop tighter to just the nutrition label\n• Ensure good lighting\n• Avoid shadows and glare\n\nThen try scanning again.'
        );
      } else if (msg.includes('401') || msg.includes('403') || msg.toLowerCase().includes('apikey')) {
        Alert.alert('API Key Error', 'Check OCR_API_KEY in ScannerComponent.js');
      } else {
        Alert.alert('Scan Failed', msg || 'Unknown error. Please try again.');
      }
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const closeModal = () => {
    if (loading) return;
    setShowModal(false);
    setImage(null);
    setProgress('');
  };

  return (
    <>
      <TouchableOpacity
        style={styles.scanBtn}
        onPress={() =>
          Alert.alert('Scan Food Label', 'Choose image source', [
            { text: '📸  Camera', onPress: () => openPicker('camera') },
            { text: '🖼️  Gallery', onPress: () => openPicker('gallery') },
            { text: 'Cancel', style: 'cancel' },
          ])
        }
      >
        <MaterialCommunityIcons name="barcode-scan" size={22} color="#fff" />
        <Text style={styles.scanBtnText}>Scan Label</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>

            <View style={styles.header}>
              <Text style={styles.headerTitle}>Scan Nutrition Label</Text>
              <TouchableOpacity onPress={closeModal} disabled={loading}>
                <MaterialCommunityIcons name="close" size={24} color={loading ? '#333' : '#fff'} />
              </TouchableOpacity>
            </View>

            {image && (
              <View style={styles.imgWrap}>
                <Image source={{ uri: image.uri }} style={styles.img} resizeMode="cover" />
                <View style={[styles.corner, styles.cTL]} />
                <View style={[styles.corner, styles.cTR]} />
                <View style={[styles.corner, styles.cBL]} />
                <View style={[styles.corner, styles.cBR]} />
                {loading && <View style={styles.scanOverlay} />}
              </View>
            )}

            {loading ? (
              <View style={styles.progressRow}>
                <ActivityIndicator size="small" color="#4A90E2" />
                <Text style={styles.progressText}>{progress}</Text>
              </View>
            ) : (
              <View style={styles.tipRow}>
                <MaterialCommunityIcons name="lightbulb-outline" size={15} color="#4A5568" />
                <Text style={styles.tipText}>
                  Crop tightly to the Nutrition Facts panel for best results.
                  Avoid glare and shadows.
                </Text>
              </View>
            )}

            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.btn, styles.btnAlt]} onPress={closeModal} disabled={loading}>
                <Text style={styles.btnAltText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnMain, loading && { opacity: 0.6 }]}
                onPress={handleExtract}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : (
                    <>
                      <MaterialCommunityIcons name="text-recognition" size={18} color="#fff" />
                      <Text style={styles.btnMainText}>Extract Nutrition</Text>
                    </>
                  )
                }
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scanBtn:     { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:'#252830', borderRadius:12, paddingVertical:16, borderWidth:1, borderColor:'#3A3D4A', gap:8 },
  scanBtnText: { color:'#fff', fontSize:15, fontWeight:'700' },
  overlay:     { flex:1, backgroundColor:'rgba(0,0,0,0.88)', justifyContent:'flex-end' },
  sheet:       { backgroundColor:'#1A1B1E', borderTopLeftRadius:24, borderTopRightRadius:24, padding:20, paddingBottom:44 },
  header:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  headerTitle: { color:'#fff', fontSize:18, fontWeight:'800' },
  imgWrap:     { position:'relative', marginBottom:14, borderRadius:14, overflow:'hidden' },
  img:         { width:'100%', height:250, borderRadius:14 },
  corner:      { position:'absolute', width:22, height:22, borderColor:'#4A90E2' },
  cTL:         { top:8,    left:8,  borderTopWidth:3,    borderLeftWidth:3  },
  cTR:         { top:8,    right:8, borderTopWidth:3,    borderRightWidth:3 },
  cBL:         { bottom:8, left:8,  borderBottomWidth:3, borderLeftWidth:3  },
  cBR:         { bottom:8, right:8, borderBottomWidth:3, borderRightWidth:3 },
  scanOverlay: { position:'absolute', inset:0, backgroundColor:'rgba(74,144,226,0.07)' },
  progressRow: { flexDirection:'row', alignItems:'center', gap:10, paddingVertical:10, marginBottom:10 },
  progressText:{ color:'#4A90E2', fontSize:13, fontWeight:'600', flex:1 },
  tipRow:      { flexDirection:'row', alignItems:'flex-start', gap:8, backgroundColor:'#252830', borderRadius:10, padding:12, marginBottom:14 },
  tipText:     { color:'#4A5568', fontSize:12, flex:1, lineHeight:18 },
  btnRow:      { flexDirection:'row', gap:12 },
  btn:         { flex:1, paddingVertical:14, borderRadius:12, alignItems:'center', justifyContent:'center', flexDirection:'row', gap:8 },
  btnAlt:      { backgroundColor:'#252830', borderWidth:1, borderColor:'#3A3D4A' },
  btnAltText:  { color:'#aaa', fontSize:15, fontWeight:'600' },
  btnMain:     { backgroundColor:'#4A90E2', flex:2 },
  btnMainText: { color:'#fff', fontSize:15, fontWeight:'700' },
});
