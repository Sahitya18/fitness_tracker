import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Image, Alert } from 'react-native';
import { useAuth } from '../utils/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Surface, Button, ProgressBar, Avatar } from 'react-native-paper';
import { router } from 'expo-router';
import { StreakService } from '../utils/StreakService';

const { width } = Dimensions.get('window');

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HomeScreen() {
  const { signOut, userData } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('gym');
  const [caloriesConsumed, setCaloriesConsumed] = useState(1400);
  const [caloriesGoal] = useState(2000);
  const [macros] = useState({
    protein: 65,
    carbs: 45,
    fats: 30,
    fibers: 40
  });
  const [sleepHours] = useState(6);
  const [steps] = useState(8104);
  const [foodSuggestions] = useState([
    { 
      id: 1, 
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&h=200&fit=crop&q=80',
      name: 'Avocado Toast'
    },
    { 
      id: 2, 
      image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=200&h=200&fit=crop&q=80',
      name: 'Breakfast Bowl'
    },
    { 
      id: 3, 
      image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=200&h=200&fit=crop&q=80',
      name: 'Protein Pancakes'
    },
    { 
      id: 4, 
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&h=200&fit=crop&q=80',
      name: 'Fruit Bowl'
    },
  ]);

  const getDateRange = () => {
    const dates = [];
    const today = new Date();
    for (let i = -4; i <= 4; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.getDate(),
        day: DAYS[date.getDay()],
        isToday: i === 0
      });
    }
    return dates;
  };

  return (
    <View style={styles.container}>
      {/* Date Slider */}
      <Surface style={styles.dateSlider}>
        <Avatar.Image 
          size={40} 
          source={{ uri: userData?.profilePic || 'https://via.placeholder.com/40' }} 
          style={styles.profilePic}
        />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScrollContent}
        >
          {getDateRange().map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateItem,
                item.isToday && styles.activeDateItem
              ]}
              onPress={() => setSelectedDate(new Date())}
            >
              <Text style={[styles.dateText, item.isToday && styles.activeDateText]}>
                {item.date}
              </Text>
              <Text style={[styles.dayText, item.isToday && styles.activeDayText]}>
                {item.day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Avatar.Image 
          size={40} 
          source={{ uri: userData?.profilePic || 'https://via.placeholder.com/40' }} 
          style={styles.profilePic}
        />
      </Surface>

      {/* Tab Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'gym' && styles.activeTab]}
          onPress={() => setActiveTab('gym')}
        >
          <Text style={[styles.tabText, activeTab === 'gym' && styles.activeTabText]}>GYM</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'kitchen' && styles.activeTab]}
          onPress={() => setActiveTab('kitchen')}
        >
          <Text style={[styles.tabText, activeTab === 'kitchen' && styles.activeTabText]}>KITCHEN</Text>
        </TouchableOpacity>
      </View>

      {/* Food Tracker */}
      <Surface style={styles.trackerCard}>
        <Text style={styles.cardTitle}>Food Tracker</Text>
        <View style={styles.calorieCircle}>
          <Text style={styles.calorieCount}>{caloriesConsumed}</Text>
          <Text style={styles.calorieTotal}>/{caloriesGoal}</Text>
        </View>
        <View style={styles.macrosContainer}>
          {Object.entries(macros).map(([key, value]) => (
            <View key={key} style={styles.macroItem}>
              <Text style={styles.macroLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              <ProgressBar 
                progress={value / 100} 
                color="#4A90E2"
                style={styles.macroProgress} 
              />
            </View>
          ))}
        </View>
      </Surface>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Surface style={styles.statCard}>
          <View style={styles.statHeader}>
            <MaterialCommunityIcons name="moon-waning-crescent" size={24} color="#4A90E2" />
            <Text style={styles.statTitle}>Sleep</Text>
          </View>
          <View style={styles.sleepGraph}>
            {[0.4, 0.6, 0.8, 0.5, 0.7, 0.9, 0.6].map((height, index) => (
              <View 
                key={index} 
                style={[styles.sleepBar, { height: height * 60 }]} 
              />
            ))}
          </View>
          <Text style={styles.statValue}>{sleepHours} Hours</Text>
        </Surface>

        <Surface style={styles.statCard}>
          <View style={styles.statHeader}>
            <MaterialCommunityIcons name="walk" size={24} color="#4A90E2" />
            <Text style={styles.statTitle}>Walk</Text>
          </View>
          <View style={styles.stepsCircle}>
            <Text style={styles.stepsCount}>{steps}</Text>
            <Text style={styles.stepsLabel}>Steps</Text>
          </View>
        </Surface>
      </View>

      {/* Food Suggestions */}
      <Surface style={styles.suggestionsCard}>
        <Text style={styles.cardTitle}>Food suggestions</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsScroll}
        >
          {foodSuggestions.map((food) => (
            <View key={food.id} style={styles.foodItem}>
              <Image 
                source={{ uri: food.image }}
                style={styles.foodImage}
              />
              <Text style={styles.foodName}>{food.name}</Text>
            </View>
          ))}
        </ScrollView>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B1E',
    padding: 16,
  },
  dateSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252830',
    borderRadius: 20,
    padding: 10,
    marginBottom: 16,
  },
  profilePic: {
    marginHorizontal: 8,
  },
  dateScrollContent: {
    paddingHorizontal: 10,
  },
  dateItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    paddingVertical: 4,
  },
  activeDateItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayText: {
    color: '#8E8E93',
    fontSize: 12,
  },
  activeDateText: {
    color: '#4A90E2',
  },
  activeDayText: {
    color: '#4A90E2',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#252830',
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: '#4A90E2',
  },
  tabText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  trackerCard: {
    backgroundColor: '#252830',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  calorieCircle: {
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieCount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  calorieTotal: {
    color: '#8E8E93',
    fontSize: 16,
  },
  macrosContainer: {
    gap: 12,
  },
  macroItem: {
    marginBottom: 8,
  },
  macroLabel: {
    color: '#8E8E93',
    marginBottom: 4,
  },
  macroProgress: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3A3B3F',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#252830',
    borderRadius: 20,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
  },
  sleepGraph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 60,
    marginBottom: 8,
  },
  sleepBar: {
    width: 4,
    backgroundColor: '#4A90E2',
    borderRadius: 2,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepsCircle: {
    alignItems: 'center',
    marginTop: 8,
  },
  stepsCount: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  stepsLabel: {
    color: '#8E8E93',
    fontSize: 14,
  },
  suggestionsCard: {
    backgroundColor: '#252830',
    borderRadius: 20,
    padding: 16,
  },
  suggestionsScroll: {
    paddingVertical: 8,
  },
  foodItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  foodImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  foodName: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    width: 100,
  },
});