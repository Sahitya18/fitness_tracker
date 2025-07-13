import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Image, Alert } from 'react-native';
import { useAuth } from '../utils/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Surface, Button, ProgressBar, Avatar } from 'react-native-paper';
import { router } from 'expo-router';
import { StreakService } from '../utils/StreakService';
import Svg, { Circle, G } from 'react-native-svg';

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
  const [activeCard, setActiveCard] = useState(0);
  const [workoutStats] = useState({
    calories: 320,
    duration: 45,
    exercises: 8,
    sets: 24
  });

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

  const onCardScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const newIndex = Math.round(contentOffset / viewSize);
    setActiveCard(newIndex);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Date Slider */}
      <Surface style={styles.dateSlider}>
        <Avatar.Image 
          size={40} 
          source={{ uri: userData?.profilePic || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&q=80' }} 
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
          style={[styles.tab, activeTab === 'kitchen' && styles.activeTab]}
          onPress={() => setActiveTab('kitchen')}
        >
          <Text style={[styles.tabText, activeTab === 'kitchen' && styles.activeTabText]}>KITCHEN</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'gym' && styles.activeTab]}
          onPress={() => setActiveTab('gym')}
        >
          <Text style={[styles.tabText, activeTab === 'gym' && styles.activeTabText]}>GYM</Text>
        </TouchableOpacity>
      </View>

      {/* Tracker Cards */}
      <View style={styles.cardContainer}>
        <ScrollView 
          horizontal 
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onCardScroll}
          scrollEventThrottle={16}
        >
          {/* Food Tracker Card */}
          <Surface style={[styles.trackerCard, { width: width - 32, alignSelf: 'center', marginRight: 0, marginLeft: 0 }]}>
            <View style={styles.foodTrackerRow}>
              {/* Left: Title and Circular Progress */}
              <View style={styles.foodTrackerLeft}>
                <Text style={styles.foodTrackerTitle}>Food Tracker</Text>
                <View style={styles.circleContainer}>
                  <Svg width={140} height={140}>
                    <G rotation="-90" origin="70,70">
                      {/* Background Circle */}
                      <Circle
                        cx="70"
                        cy="70"
                        r="60"
                        stroke="#23243A"
                        strokeWidth="10"
                        fill="none"
                      />
                      {/* Progress Circle */}
                      <Circle
                        cx="70"
                        cy="70"
                        r="60"
                        stroke="#4A90E2"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 60}
                        strokeDashoffset={
                          2 * Math.PI * 60 * (1 - caloriesConsumed / caloriesGoal)
                        }
                        strokeLinecap="round"
                      />
                    </G>
                  </Svg>
                  <View style={styles.calorieTextOverlayLarge}>
                    <Text style={styles.calorieLabel}>cal consumed</Text>
                    <Text style={styles.calorieCountLarge}>{caloriesConsumed}</Text>
                    <View style={styles.calorieSeparator} />
                    <Text style={styles.calorieTotalLarge}>{caloriesGoal}</Text>
                  </View>
                </View>
              </View>
              {/* Right: Macros */}
              <View style={styles.foodTrackerRightCentered}>
                {Object.entries(macros).map(([key, value]) => (
                  <View key={key} style={styles.macroRow}>
                    <Text style={styles.macroLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                    <View style={styles.macroBarBackground}>
                      <View style={[styles.macroBarFill, { width: `${value}%` }]} />
                    </View>
                    <Text style={styles.macroPercent}>{value}%</Text>
                  </View>
                ))}
              </View>
            </View>
          </Surface>

          {/* Workout Tracker Card */}
          <Surface style={[styles.trackerCard, styles.matchFoodCard, { width: width - 32, alignSelf: 'center', marginRight: 0, marginLeft: 0 }]}>
            <View style={styles.workoutHeaderRow}>
              <Text style={styles.cardTitle}>Workout Tracker</Text>
              <View style={styles.workoutTypeBox}>
                <Text style={styles.workoutTypeText}>back and biceps</Text>
              </View>
            </View>
            <View style={styles.workoutSimpleContent}>
              <View style={styles.workoutStatsRow}>
                <View style={styles.workoutStatItem}>
                  <MaterialCommunityIcons name="fire" size={24} color="#FF6B35" />
                  <Text style={styles.workoutStatValue}>{workoutStats.calories}</Text>
                  <Text style={styles.workoutStatLabel}>Calories</Text>
                </View>
                <View style={styles.workoutStatItem}>
                  <MaterialCommunityIcons name="clock-outline" size={24} color="#4A90E2" />
                  <Text style={styles.workoutStatValue}>{workoutStats.duration} min</Text>
                  <Text style={styles.workoutStatLabel}>Duration</Text>
                </View>
                <View style={styles.workoutStatItem}>
                  <MaterialCommunityIcons name="dumbbell" size={24} color="#FFD700" />
                  <Text style={styles.workoutStatValue}>{workoutStats.exercises}</Text>
                  <Text style={styles.workoutStatLabel}>Exercises</Text>
                </View>
              </View>
            </View>
          </Surface>
        </ScrollView>

        {/* Page Indicators */}
        <View style={styles.pageIndicators}>
          {[0, 1].map((index) => (
            <View
              key={index}
              style={[
                styles.pageIndicator,
                activeCard === index && styles.activePageIndicator
              ]}
            />
          ))}
        </View>
      </View>

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

      {/* Additional Content to Enable Scrolling */}
      <View style={styles.bottomSpacer}>
        <Text style={styles.bottomText}>Swipe up for more content</Text>
      </View>
    </ScrollView>
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
    marginTop: 40,
    marginBottom: 16,
  },
  profilePic: {
    marginHorizontal: 8,
    marginTop: 8,
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
  cardContainer: {
    marginBottom: 16,
  },
  trackerCard: {
    backgroundColor: '#252830',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    marginRight: 0,
    marginLeft: 0,
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
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3A3B3F',
    marginHorizontal: 4,
  },
  activePageIndicator: {
    backgroundColor: '#4A90E2',
    width: 24,
  },
  bottomSpacer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  bottomText: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
  },
  workoutStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  workoutStatItem: {
    width: '48%',
    backgroundColor: '#1A1B1E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutStatValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  workoutStatLabel: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 4,
  },
  foodTrackerCard: {
    backgroundColor: '#181A20',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4A90E2',
    padding: 16,
    marginBottom: 16,
    marginRight: 1,
  },
  foodTrackerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  calorieTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 2,
  },
  calorieCount: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  calorieTotal: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 18,
  },
  foodTrackerRight: {
    flex: 1,
    marginLeft: 8,
  },
  foodTrackerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    alignSelf: 'flex-end',
  },
  macrosList: {
    gap: 10,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroLabel: {
    color: '#fff',
    fontSize: 13,
    width: 70,
  },
  macroBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: '#23243A',
    borderRadius: 2,
    marginLeft: 8,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: 4,
    backgroundColor: '#4A90E2',
    borderRadius: 2,
  },
  calorieTextOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  foodTrackerLeft: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  calorieTextOverlayLarge: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  calorieCountLarge: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  calorieTotalLarge: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 20,
  },
  macroPercent: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 8,
    width: 40,
    textAlign: 'right',
  },
  calorieSeparator: {
    width: 60,
    height: 1.5,
    backgroundColor: '#fff',
    marginVertical: 2,
    borderRadius: 1,
  },
  foodTrackerRightCentered: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  matchFoodCard: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#252830',
    minHeight: 160, // reduced to match Food Tracker card height
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  workoutGridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  workoutGridRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutGridItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    backgroundColor: 'transparent',
  },
  workoutHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline', // use baseline for perfect alignment
    marginBottom: 8,
  },
  workoutTypeBox: {
    backgroundColor: '#23243A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    alignSelf: 'flex-end',
  },
  workoutTypeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  workoutSimpleContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  workoutMainStat: {
    alignItems: 'center',
    marginBottom: 18,
  },
  workoutMainValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  workoutMainLabel: {
    color: '#8E8E93',
    fontSize: 15,
    marginBottom: 2,
  },
  workoutSubStatsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  workoutSubStat: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  workoutSubValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  workoutSubLabel: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 0,
  },
  workoutStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  workoutStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  workoutStatValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  workoutStatLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
});