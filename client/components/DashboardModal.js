import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Surface, Divider } from 'react-native-paper';
import { useAuth } from '../utils/AuthContext';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../utils/config';

export default function DashboardModal({ visible, onClose }) {
  const { signOut, userData } = useAuth();

  // ── Fetched profile data (overrides auth context userData once loaded) ────
  const [tempUserData, setTempUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch on every time the modal opens so data is always fresh
  useEffect(() => {
    if (visible) fetchUserProfile();
  }, [visible]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No authentication token found');
        router.replace('/login');
        return;
      }
      const response = await fetch(`${API_CONFIG.BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTempUserData(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch profile:', errorText);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Use fetched data when available, fall back to auth context ────────────
  // This is the key fix: dashboard shows the name/email from the API response,
  // not the potentially stale value sitting in AuthContext.
  const displayName  = tempUserData?.name  || userData?.name  || 'User Name';
  const displayEmail = tempUserData?.email || userData?.email || 'user@example.com';
  const displayPic   = tempUserData?.profilePic || userData?.profilePic
    || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&q=80';

  const handleSignOut = () => {
    signOut();
    onClose();
  };

  const menuItems = [
    {
      icon: 'account-edit',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onPress: () => { router.push('/user-profile'); onClose(); },
    },
    {
      icon: 'target',
      title: 'Goals & Targets',
      subtitle: 'Set your fitness and nutrition goals',
      onPress: () => { onClose(); },
    },
    {
      icon: 'chart-line',
      title: 'Progress Analytics',
      subtitle: 'View your fitness journey progress',
      onPress: () => { onClose(); },
    },
    {
      icon: 'record',
      title: 'Body Biometrics',
      subtitle: 'View your body biometrics',
      onPress: () => { router.push('/body-biometrics'); onClose(); },
    },
    {
      icon: 'cog',
      title: 'Settings',
      subtitle: 'App preferences and notifications',
      onPress: () => { onClose(); },
    },
    {
      icon: 'help-circle',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => { router.push({ pathname: '/support-screen' }); onClose(); },
    },
    {
      icon: 'information',
      title: 'About',
      subtitle: 'App version and information',
      onPress: () => { router.push({ pathname: '/about' }); onClose(); },
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

            {/* Profile section */}
            <Surface style={styles.profileSection}>
              {loading ? (
                // Show a subtle skeleton while data loads so layout doesn't jump
                <View style={styles.loadingRow}>
                  <View style={styles.avatarPlaceholder} />
                  <View style={{ flex: 1 }}>
                    <ActivityIndicator size="small" color="#4A90E2" />
                    <Text style={styles.loadingText}>Loading profile…</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.profileHeader}>
                  <Avatar.Image size={80} source={{ uri: displayPic }} style={styles.profileAvatar} />
                  <View style={styles.profileInfo}>
                    {/* ── FIX: name now comes from fetched tempUserData ── */}
                    <Text style={styles.userName}>{displayName}</Text>
                    <Text style={styles.userEmail}>{displayEmail}</Text>
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{tempUserData?.currentStreak ?? 7}</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{tempUserData?.goalProgress ?? '85%'}</Text>
                        <Text style={styles.statLabel}>Goal Progress</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{tempUserData?.totalWorkouts ?? 12}</Text>
                        <Text style={styles.statLabel}>Workouts</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </Surface>

            {/* Menu items */}
            <Surface style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Menu</Text>
              {menuItems.map((item, index) => (
                <React.Fragment key={index}>
                  <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
                    <View style={styles.menuItemLeft}>
                      <MaterialCommunityIcons name={item.icon} size={24} color="#4A90E2" />
                      <View style={styles.menuItemText}>
                        <Text style={styles.menuItemTitle}>{item.title}</Text>
                        <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                      </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
                  </TouchableOpacity>
                  {index < menuItems.length - 1 && <Divider style={styles.divider} />}
                </React.Fragment>
              ))}
            </Surface>

            {/* Sign out */}
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <MaterialCommunityIcons name="logout" size={24} color="#FF6B6B" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)' },
  modalContent:  { flex: 1, backgroundColor: '#1A1B1E', marginTop: 50, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#333' },
  headerTitle:   { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  closeButton:   { padding: 5 },
  content:       { flex: 1, padding: 20 },

  // Loading state
  loadingRow:        { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 8 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2A2C35' },
  loadingText:       { color: '#8E8E93', fontSize: 13, marginTop: 8 },

  profileSection: { backgroundColor: '#23243A', borderRadius: 16, padding: 20, marginBottom: 20 },
  profileHeader:  { flexDirection: 'row', alignItems: 'center' },
  profileAvatar:  { marginRight: 15 },
  profileInfo:    { flex: 1 },
  userName:       { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  userEmail:      { fontSize: 14, color: '#999', marginBottom: 15 },
  statsRow:       { flexDirection: 'row', justifyContent: 'space-between' },
  statItem:       { alignItems: 'center' },
  statValue:      { fontSize: 18, fontWeight: 'bold', color: '#4A90E2' },
  statLabel:      { fontSize: 12, color: '#999', marginTop: 2 },

  sectionTitle:   { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 15 },
  menuSection:    { backgroundColor: '#23243A', borderRadius: 16, padding: 20, marginBottom: 20 },
  menuItem:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 },
  menuItemLeft:   { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuItemText:   { marginLeft: 15, flex: 1 },
  menuItemTitle:  { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  menuItemSubtitle:{ fontSize: 14, color: '#999', marginTop: 2 },
  divider:        { backgroundColor: '#333', height: 1 },

  signOutButton:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2A2A2A', borderRadius: 12, padding: 16, marginTop: 10 },
  signOutText:    { fontSize: 16, fontWeight: '600', color: '#FF6B6B', marginLeft: 10 },
});
