import React, { useState } from 'react';
import {
  View, Text, Image, ActivityIndicator, Alert, StyleSheet,
  TouchableOpacity, Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// ─────────────────────────────────────────────────────────────────────────────
// 🔑 PUT YOUR API KEY HERE
//    Get it free at: https://ocr.space/ocrapi
//    Free tier: 25,000 requests/month · No model training needed.
//    OCR.space is a general-purpose OCR — it reads printed text from any image.
//    Engine 2 (default below) works best for nutrition labels.
// ─────────────────────────────────────────────────────────────────────────────
const OCR_API_KEY = 'YOUR_OCR_SPACE_API_KEY_HERE';
const OCR_API_URL = 'https://api.ocr.space/parse/image';

// ─────────────────────────────────────────────────────────────────────────────
// Nutrition label text parser
// Converts raw OCR text → structured nutrition object
// Handles common label formats:  "Protein 25g", "Total Fat: 8 g", "Calories 165", etc.
// ─────────────────────────────────────────────────────────────────────────────
export function parseNutritionFromOCRText(rawText) {
  if (!rawText) return {};
  const text = rawText.toLowerCase();

  const extract = (patterns) => {
    for (const pat of patterns) {
      const m = text.match(pat);
      if (m) return parseFloat(m[1]);
    }
    return '';
  };

  // Calories
  const calories = extract([
    /calories[:\s]+(\d+(?:\.\d+)?)/,
    /energy[:\s]+(\d+(?:\.\d+)?)\s*(?:kcal|cal)/,
    /\benergy\b.*?(\d+)\s*kcal/,
    /cal(?:ories)?\.?\s*(\d+)/,
  ]);

  // Protein
  const protein = extract([
    /protein[s]?[:\s]+(\d+(?:\.\d+)?)\s*g/,
    /protein[s]?\s*(\d+(?:\.\d+)?)/,
  ]);

  // Carbohydrates
  const carbs = extract([
    /total carbohydrate[s]?[:\s]+(\d+(?:\.\d+)?)\s*g/,
    /carbohydrate[s]?[:\s]+(\d+(?:\.\d+)?)\s*g/,
    /carb[s]?[:\s]+(\d+(?:\.\d+)?)\s*g/,
    /carbohydrate[s]?\s*(\d+(?:\.\d+)?)/,
    /carb[s]?\s*(\d+(?:\.\d+)?)/,
  ]);

  // Fat
  const fat = extract([
    /total fat[:\s]+(\d+(?:\.\d+)?)\s*g/,
    /(?:^|\s)fat[s]?[:\s]+(\d+(?:\.\d+)?)\s*g/,
    /fat[s]?\s*(\d+(?:\.\d+)?)/,
  ]);

  // Fiber
  const fiber = extract([
    /dietary\s*fi[b]?[e]?r[e]?[:\s]+(\d+(?:\.\d+)?)\s*g/,
    /fi[b]?[e]?r[e]?[:\s]+(\d+(?:\.\d+)?)\s*g/,
    /fi[b]?[e]?r[e]?\s*(\d+(?:\.\d+)?)/,
  ]);

  // Serving size: "Serving Size: 100g" or "Per 100g"
  const servingMatch =
    rawText.match(/serving\s*size[:\s]+(\d+(?:\.\d+)?)\s*(g|ml|oz|kg)/i) ||
    rawText.match(/per\s+(\d+(?:\.\d+)?)\s*(g|ml|oz)/i);
  const servingSize = servingMatch ? parseFloat(servingMatch[1]) : '';
  const servingUnit = servingMatch ? servingMatch[2].toLowerCase() : 'g';

  // Product name: first meaningful text line (not a number, not "nutrition facts")
  const lines = rawText.split(/\n/).map(l => l.trim()).filter(Boolean);
  let productName = '';
  for (const line of lines) {
    if (
      line.length > 3 &&
      line.length < 60 &&
      !/^\d/.test(line) &&
      !/nutrition\s*facts?/i.test(line) &&
      !/amount\s*per/i.test(line) &&
      !/serving/i.test(line)
    ) {
      productName = line.replace(/[^a-zA-Z0-9 &\-']/g, '').trim();
      if (productName.length > 2) break;
    }
  }

  return { calories, protein, carbs, fat, fiber, servingSize, servingUnit, productName };
}

// ─────────────────────────────────────────────────────────────────────────────
// OCR.space API call
// Uses base64 encoding — works on both iOS and Android without file upload issues
// OCREngine=2 handles dense / small text on nutrition labels better than engine 1
// ─────────────────────────────────────────────────────────────────────────────
async function callOCRSpace(imageUri) {
  // Convert image URI to base64
  const response = await fetch(imageUri);
  const blob = await response.blob();
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // "data:image/jpeg;base64,..."
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  // Build form data
  const formData = new FormData();
  formData.append('base64Image', base64);          // base64 string with data: prefix
  formData.append('language', 'eng');              // English
  formData.append('isOverlayRequired', 'false');
  formData.append('OCREngine', '2');               // Engine 2: better for dense label text
  formData.append('isTable', 'true');              // Preserve table structure (helps with labels)
  formData.append('scale', 'true');                // Auto scale image
  formData.append('detectOrientation', 'true');    // Handle rotated images

  const ocrResponse = await fetch(OCR_API_URL, {
    method: 'POST',
    headers: { apikey: OCR_API_KEY },              // API key goes in header
    body: formData,
  });

  if (!ocrResponse.ok) {
    throw new Error(`OCR API error: ${ocrResponse.status}`);
  }

  const data = await ocrResponse.json();

  if (data.IsErroredOnProcessing) {
    throw new Error(data.ErrorMessage?.[0] || 'OCR processing failed');
  }

  const parsedText = data.ParsedResults?.[0]?.ParsedText || '';
  if (!parsedText.trim()) {
    throw new Error('No text found in image. Please ensure the label is clearly visible.');
  }

  return parsedText;
}

// ─────────────────────────────────────────────────────────────────────────────
// ScannerComponent
// Props:
//   onNutritionExtracted(nutritionData, rawText) — called with parsed nutrition
//   (replaces old onTextExtracted prop — update MealDetailsScreen accordingly)
// ─────────────────────────────────────────────────────────────────────────────
export default function ScannerComponent({ onNutritionExtracted, onTextExtracted }) {
  const [image, setImage]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState('');

  const requestPermissions = async () => {
    const mediaPerm  = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
    if (!mediaPerm.granted || !cameraPerm.granted) {
      Alert.alert('Permission Denied', 'Camera and gallery access are required!');
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    const permitted = await requestPermissions();
    if (!permitted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.9,
      aspect: [4, 3],
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
      setShowModal(true);
    }
  };

  const captureImageFromCamera = async () => {
    const permitted = await requestPermissions();
    if (!permitted) return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.9,
      aspect: [4, 3],
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
      setShowModal(true);
    }
  };

  const extractNutrition = async () => {
    if (!image) return;
    setLoading(true);
    setProgress('Sending image to OCR...');

    try {
      setProgress('Extracting text from label...');
      const rawText = await callOCRSpace(image.uri);

      setProgress('Parsing nutrition values...');
      const nutrition = parseNutritionFromOCRText(rawText);

      console.log('✅ OCR raw text:', rawText);
      console.log('✅ Parsed nutrition:', nutrition);

      setShowModal(false);
      setImage(null);
      setProgress('');

      // Call new handler if provided, fall back to legacy handler
      if (onNutritionExtracted) {
        onNutritionExtracted(nutrition, rawText);
      } else if (onTextExtracted) {
        // Legacy fallback — passes raw text only
        onTextExtracted(rawText, nutrition);
      }
    } catch (error) {
      console.error('❌ OCR Error:', error);
      const msg = error.message || 'Failed to extract text';

      if (msg.includes('No text')) {
        Alert.alert('No Text Found', 'Make sure the nutrition label is clearly visible with good lighting.');
      } else if (msg.includes('401') || msg.includes('403')) {
        Alert.alert('API Key Error', 'Invalid OCR.space API key. Please check your key in ScannerComponent.js');
      } else {
        Alert.alert('Scan Failed', `${msg}\n\nTips:\n• Use good lighting\n• Keep label flat\n• Ensure text is sharp`);
      }
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const handleScannerPress = () => {
    Alert.alert(
      'Scan Food Label',
      'How would you like to add the image?',
      [
        { text: '📸 Camera', onPress: captureImageFromCamera },
        { text: '🖼️ Gallery', onPress: pickImageFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity style={styles.scannerButton} onPress={handleScannerPress}>
        <MaterialCommunityIcons name="barcode-scan" size={22} color="#FFFFFF" />
        <Text style={styles.buttonText}>Scan Label</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scan Nutrition Label</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); setImage(null); }}>
                <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {image && (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: image.uri }} style={styles.previewImage} />
                {/* Scan overlay corners */}
                {loading && (
                  <View style={styles.scanOverlay}>
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />
                  </View>
                )}
              </View>
            )}

            {loading && (
              <View style={styles.progressContainer}>
                <ActivityIndicator size="small" color="#4A90E2" />
                <Text style={styles.progressText}>{progress}</Text>
              </View>
            )}

            {!loading && (
              <View style={styles.tipBox}>
                <MaterialCommunityIcons name="information-outline" size={16} color="#445566" />
                <Text style={styles.tipText}>
                  Ensure the Nutrition Facts panel is fully visible & well-lit
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.retakeButton]}
                onPress={() => { setImage(null); setShowModal(false); }}
                disabled={loading}
              >
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.extractButton, loading && { opacity: 0.7 }]}
                onPress={extractNutrition}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="text-recognition" size={18} color="#FFFFFF" />
                    <Text style={styles.extractButtonText}>Extract Nutrition</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scannerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252830',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#3A3D4A',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1B1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  previewImage: {
    width: '100%',
    height: 260,
    borderRadius: 16,
  },
  scanOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: 16,
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: '#4A90E2',
  },
  cornerTL: { top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 10, left: 10, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3 },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  progressText: {
    color: '#4A90E2',
    fontSize: 13,
    fontWeight: '600',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#252830',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  tipText: {
    color: '#556677',
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  retakeButton: {
    backgroundColor: '#252830',
    borderWidth: 1,
    borderColor: '#3A3D4A',
  },
  retakeButtonText: {
    color: '#AAAAAA',
    fontSize: 15,
    fontWeight: '600',
  },
  extractButton: {
    backgroundColor: '#4A90E2',
    flex: 2,
  },
  extractButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
