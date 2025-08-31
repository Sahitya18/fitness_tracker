import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import API_CONFIG from '../utils/config';

const WEIGHT_UNITS = ['g', 'kg', 'oz', 'lb', 'ml'];

export default function AddMealManuallyScreen({ navigation }) {
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
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.weight || !form.calories) {
      Alert.alert('Validation', 'Please fill in all required fields.');
      return;
    }

    try {
      const mealData = {
        mealName: form.name,
        weight: parseFloat(form.weight),
        weightUnit: form.weightUnit,
        calories: parseFloat(form.calories),
        carbs: form.carbs ? parseFloat(form.carbs) : null,
        protein: form.protein ? parseFloat(form.protein) : null,
        fats: form.fats ? parseFloat(form.fats) : null,
        fiber: form.fiber ? parseFloat(form.fiber) : null,
      };

      console.log('Sending meal data:', mealData);
      console.log('API URL:', `${API_CONFIG.BASE_URL}/manual-meals`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/manual-meals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mealData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        try {
          const result = await response.json();
          Alert.alert('Success', 'Meal added successfully to database!');
          if (navigation && navigation.goBack) navigation.goBack();
        } catch (jsonError) {
          console.error('JSON Parse Error:', jsonError);
          Alert.alert('Success', 'Meal added successfully to database!');
          if (navigation && navigation.goBack) navigation.goBack();
        }
      } else {
        try {
          const errorData = await response.json();
          Alert.alert('Error', `Failed to add meal: ${errorData.message || 'Unknown error'}`);
        } catch (jsonError) {
          console.error('Error parsing error response:', jsonError);
          Alert.alert('Error', `Failed to add meal: HTTP ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error adding meal:', error);
      Alert.alert('Error', 'Failed to connect to server. Please check your internet connection.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Add Meal Manually</Text>
      <View style={styles.formRow}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#fff"
          value={form.name}
          onChangeText={text => handleChange('name', text)}
        />
      </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Weight</Text>
        <View style={styles.weightInputRow}>
          <TextInput
            style={[styles.input, styles.weightInput]}
            placeholder="Weight"
            placeholderTextColor="#fff"
            keyboardType="numeric"
            value={form.weight}
            onChangeText={text => handleChange('weight', text)}
          />
                                           <TouchableOpacity 
            style={styles.unitPickerWrapper}
            onPress={() => setShowUnitDropdown(true)}
          >
            <Text style={styles.selectedUnit}>{form.weightUnit}</Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="#fff" style={styles.unitDropdownIcon} />
          </TouchableOpacity>
          
          <Modal
            visible={showUnitDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowUnitDropdown(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowUnitDropdown(false)}
            >
              <View style={styles.dropdownContainer}>
                {WEIGHT_UNITS.map(unit => (
                  <TouchableOpacity
                    key={unit}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleChange('weightUnit', unit);
                      setShowUnitDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{unit}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Calories</Text>
        <TextInput
          style={styles.input}
          placeholder="Calories"
          placeholderTextColor="#fff"
          keyboardType="numeric"
          value={form.calories}
          onChangeText={text => handleChange('calories', text)}
        />
      </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Carbs</Text>
        <TextInput
          style={styles.input}
          placeholder="Carbs (g)"
          placeholderTextColor="#fff"
          keyboardType="numeric"
          value={form.carbs}
          onChangeText={text => handleChange('carbs', text)}
        />
      </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Protein</Text>
        <TextInput
          style={styles.input}
          placeholder="Protein (g)"
          placeholderTextColor="#fff"
          keyboardType="numeric"
          value={form.protein}
          onChangeText={text => handleChange('protein', text)}
        />
      </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Fats</Text>
        <TextInput
          style={styles.input}
          placeholder="Fats (g)"
          placeholderTextColor="#fff"
          keyboardType="numeric"
          value={form.fats}
          onChangeText={text => handleChange('fats', text)}
        />
      </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Fiber</Text>
        <TextInput
          style={styles.input}
          placeholder="Fiber (g)"
          placeholderTextColor="#fff"
          keyboardType="numeric"
          value={form.fiber}
          onChangeText={text => handleChange('fiber', text)}
        />
      </View>
      <Button title="Add Meal" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#1A1B1E',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  input: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    backgroundColor: '#23242a',
  },
  weightInputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weightInput: {
    flex: 6,
    marginRight: 1,
    marginLeft:-67,
  },
  unitPickerWrapper: {
    flex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1B1E', // match app background
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    height: 40,
    marginLeft: 0,
    marginRight: 0,
    position: 'relative',
    overflow: 'hidden',
    paddingRight: 8,
  },
  selectedUnit: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    marginRight: 4,
    zIndex: 2,
  },
       unitDropdownIcon: {
    marginLeft: 'auto',
    zIndex: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 300,
    paddingRight: 20,
  },
  dropdownContainer: {
    backgroundColor: '#23242a',
    borderRadius: 8,
    padding: 8,
    minWidth: 105,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
}); 