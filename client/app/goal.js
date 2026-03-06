/**
 * WeightGoalSetupScreen.jsx
 * Shows user's weight loss journey visualization with projected progress
 * Fetches data from API and displays an interactive graph
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Alert, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Surface } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import API_CONFIG from '../utils/config';
import { Colors, Shadows } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

const { width, height } = Dimensions.get('window');

export default function WeightGoalSetupScreen() {
  const { email, weightLossGoal } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme || 'light'];

  const [loading, setLoading] = useState(true);
  const [goalData, setGoalData] = useState(null);

  useEffect(() => {
    fetchGoalData();
  }, []);

  const fetchGoalData = async () => {
    try {
      setLoading(true);
      
      // API endpoint to fetch weight goal projection
      const url = `${API_CONFIG.BASE_URL_LOCALHOST}${API_CONFIG.ENDPOINTS.PROFILE.PORT}/api/profile/weight-goal-projection`;
      console.log('Fetching goal data from:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          weightLossGoal: parseFloat(weightLossGoal || '1'),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Goal data received:', data);
        setGoalData(data);
      } else {
        const errorText = await response.text();
        console.error('API error:', errorText);
        Alert.alert('Error', 'Failed to load goal data. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching goal data:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.replace({
      pathname: '/profile-setup',
      params: { email }
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentColors.primary} />
          <Text style={[styles.loadingText, { color: currentColors.text }]}>
            Calculating your personalized journey...
          </Text>
        </View>
      </View>
    );
  }

  if (!goalData) {
    return (
      <View style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color={currentColors.error} />
          <Text style={[styles.errorText, { color: currentColors.text }]}>
            Unable to load goal data
          </Text>
          <Button mode="contained" onPress={fetchGoalData} style={{ marginTop: 20 }}>
            Retry
          </Button>
        </View>
      </View>
    );
  }

  // Extract data from API response
  const {
    initialWeight,
    targetWeight,
    currentWeight,
    weeklyGoal,
    estimatedMonths,
    projectionData, // Array of { month: "Jan", weight: 85 }
  } = goalData;

  // Prepare chart data
  const chartLabels = projectionData.map(d => d.month);
  const chartData = projectionData.map(d => d.weight);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: currentColors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Gradient */}
      <LinearGradient
        colors={[currentColors.primary, currentColors.secondary]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <MaterialCommunityIcons name="chart-line" size={64} color="white" />
          <Text style={styles.headerTitle}>Your Weight Loss Journey</Text>
          <Text style={styles.headerSubtitle}>
            Based on {weeklyGoal}kg/week goal
          </Text>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Surface style={[styles.statCard, { backgroundColor: currentColors.card }, Shadows.medium]}>
          <View style={[styles.statIcon, { backgroundColor: currentColors.primary + '20' }]}>
            <MaterialCommunityIcons name="weight" size={32} color={currentColors.primary} />
          </View>
          <Text style={[styles.statValue, { color: currentColors.text }]}>{initialWeight}kg</Text>
          <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>Starting Weight</Text>
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: currentColors.card }, Shadows.medium]}>
          <View style={[styles.statIcon, { backgroundColor: currentColors.secondary + '20' }]}>
            <MaterialCommunityIcons name="flag-checkered" size={32} color={currentColors.secondary} />
          </View>
          <Text style={[styles.statValue, { color: currentColors.text }]}>{targetWeight}kg</Text>
          <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>Target Weight</Text>
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: currentColors.card }, Shadows.medium]}>
          <View style={[styles.statIcon, { backgroundColor: currentColors.success + '20' }]}>
            <MaterialCommunityIcons name="calendar-month" size={32} color={currentColors.success} />
          </View>
          <Text style={[styles.statValue, { color: currentColors.text }]}>{estimatedMonths}</Text>
          <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>Months to Goal</Text>
        </Surface>
      </View>

      {/* Progress Chart */}
      <Surface style={[styles.chartCard, { backgroundColor: currentColors.card }, Shadows.medium]}>
        <Text style={[styles.chartTitle, { color: currentColors.text }]}>Projected Progress</Text>
        <Text style={[styles.chartSubtitle, { color: currentColors.textSecondary }]}>
          Your weight journey over time
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScrollContainer}>
          <LineChart
            data={{
              labels: chartLabels,
              datasets: [{
                data: chartData,
                color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                strokeWidth: 3,
              }],
            }}
            width={Math.max(width - 40, chartLabels.length * 60)} // Dynamic width based on data points
            height={280}
            chartConfig={{
              backgroundColor: currentColors.card,
              backgroundGradientFrom: currentColors.card,
              backgroundGradientTo: currentColors.card,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
              labelColor: (opacity = 1) => currentColors.textSecondary,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: currentColors.primary,
              },
              propsForBackgroundLines: {
                strokeDasharray: '', // solid background lines
                stroke: currentColors.border,
                strokeWidth: 1,
              },
            }}
            bezier
            style={styles.chart}
            yAxisSuffix="kg"
            yAxisInterval={1}
            fromZero={false}
          />
        </ScrollView>

        {/* Chart Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: currentColors.primary }]} />
            <Text style={[styles.legendText, { color: currentColors.textSecondary }]}>
              Projected Weight Loss
            </Text>
          </View>
        </View>
      </Surface>

      {/* Motivation Card */}
      <Surface style={[styles.motivationCard, { backgroundColor: currentColors.card }, Shadows.medium]}>
        <View style={[styles.motivationIcon, { backgroundColor: currentColors.warning + '20' }]}>
          <MaterialCommunityIcons name="star-circle" size={48} color={currentColors.warning} />
        </View>
        <Text style={[styles.motivationTitle, { color: currentColors.text }]}>
          You're on the right track!
        </Text>
        <Text style={[styles.motivationText, { color: currentColors.textSecondary }]}>
          With consistent effort and {weeklyGoal}kg loss per week, you'll reach your goal of {targetWeight}kg in approximately {estimatedMonths} months.
        </Text>
      </Surface>

      {/* Key Insights */}
      <Surface style={[styles.insightsCard, { backgroundColor: currentColors.card }, Shadows.medium]}>
        <Text style={[styles.insightsTitle, { color: currentColors.text }]}>Key Insights</Text>
        <View style={styles.insightsList}>
          <View style={styles.insightItem}>
            <MaterialCommunityIcons name="check-circle" size={24} color={currentColors.success} />
            <Text style={[styles.insightText, { color: currentColors.textSecondary }]}>
              Total weight to lose: {(initialWeight - targetWeight).toFixed(1)}kg
            </Text>
          </View>
          <View style={styles.insightItem}>
            <MaterialCommunityIcons name="check-circle" size={24} color={currentColors.success} />
            <Text style={[styles.insightText, { color: currentColors.textSecondary }]}>
              Weekly goal: {weeklyGoal}kg loss
            </Text>
          </View>
          <View style={styles.insightItem}>
            <MaterialCommunityIcons name="check-circle" size={24} color={currentColors.success} />
            <Text style={[styles.insightText, { color: currentColors.textSecondary }]}>
              Monthly projection: {(weeklyGoal * 4).toFixed(1)}kg loss
            </Text>
          </View>
        </View>
      </Surface>

      {/* Continue Button */}
      <Button
        mode="contained"
        onPress={handleContinue}
        style={[styles.continueButton, { backgroundColor: currentColors.primary }]}
        contentStyle={styles.continueButtonContent}
        labelStyle={styles.continueButtonLabel}
        icon="arrow-right"
      >
        Continue to Profile Setup
      </Button>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerGradient: {
    height: height * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: -40,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  chartCard: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  chartScrollContainer: {
    marginHorizontal: -20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    paddingRight: 0,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
  },
  motivationCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  motivationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  motivationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  motivationText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  insightsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
  },
  continueButton: {
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  continueButtonContent: {
    paddingVertical: 12,
  },
  continueButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
