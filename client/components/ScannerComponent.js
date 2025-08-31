import React, { useState } from 'react';
import { View, Text, Image, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import OCR_CONFIG from '../utils/ocrConfig';

export default function ScannerComponent({ onTextExtracted }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const requestPermissions = async () => {
    const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();

    if (!mediaPerm.granted || !cameraPerm.granted) {
      Alert.alert("Permission Denied", "Camera and gallery access are required!");
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    const permitted = await requestPermissions();
    if (!permitted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
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
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setShowModal(true);
    }
  };

  const extractText = async () => {
    if (!image) return;

    setLoading(true);
    console.log('🔍 Starting text extraction...');
    console.log('📡 Sending request to:', `${OCR_CONFIG.BASE_URL}${OCR_CONFIG.ENDPOINTS.EXTRACT_TEXT}`);
    
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: image.uri,
        name: 'image.jpg',
        type: 'image/jpeg',
      });

      console.log('📦 FormData created with image:', image.uri);

      const response = await axios.post(
        `${OCR_CONFIG.BASE_URL}${OCR_CONFIG.ENDPOINTS.EXTRACT_TEXT}`, 
        formData, 
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: OCR_CONFIG.TIMEOUT,
        }
      );

      console.log('✅ Response received:', response.status);
      console.log('📄 Response data:', response.data);

      if (response.data && response.data.success) {
        const extractedText = response.data.text;
        console.log('📝 Extracted text:', extractedText);
        console.log('📏 Text length:', response.data.text_length);
        
        // Pass the extracted text to parent component
        console.log('/////////////////////////////////////////🎯 FULL EXTRACTED TEXT:////////////////////////////////////////////////////////////', extractedText);
        onTextExtracted(extractedText);
        setShowModal(false);
        setImage(null);
      } else {
        console.log('❌ No text found in response');
        Alert.alert("Error", "No text found in the image.");
      }
    } catch (error) {
      console.error('❌ OCR Error:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      
      if (error.code === 'ECONNABORTED') {
        Alert.alert("Timeout", "Request timed out. Please try again.");
      } else if (error.response?.status === 400) {
        Alert.alert("Error", "No readable text found in the image.");
      } else {
        Alert.alert("Error", "Failed to extract text. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScannerPress = () => {
    Alert.alert(
      "Choose Image Source",
      "Select how you want to get the image",
      [
        { text: "Camera", onPress: captureImageFromCamera },
        { text: "Gallery", onPress: pickImageFromGallery },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  return (
    <>
      <TouchableOpacity style={styles.scannerButton} onPress={handleScannerPress}>
        <MaterialCommunityIcons name="qrcode-scan" size={24} color="#FFFFFF" />
        <Text style={styles.buttonText}>Scanner</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Extract Text from Image</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {image && (
              <Image source={{ uri: image.uri }} style={styles.previewImage} />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.retakeButton]} 
                onPress={() => {
                  setImage(null);
                  setShowModal(false);
                }}
              >
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.extractButton]} 
                onPress={extractText}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.extractButtonText}>Extract Text</Text>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1B1E',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#333',
  },
  retakeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  extractButton: {
    backgroundColor: '#4A90E2',
  },
  extractButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
