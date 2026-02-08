import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Surface, Divider } from 'react-native-paper';
import { useAuth } from '../utils/AuthContext';
import { router } from 'expo-router';

export default function DashboardModal({ visible, onClose }) {
  const { signOut, userData } = useAuth();

  const handleSignOut = () => {
    signOut();
    onClose();
  };

  const menuItems = [
    {
      icon: 'account-edit',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onPress: () => {
        // Navigate to user profile screen
        onClose();
        router.push('/user-profile');
      }
    },
    {
      icon: 'target',
      title: 'Goals & Targets',
      subtitle: 'Set your fitness and nutrition goals',
      onPress: () => {
        // Navigate to goals
        onClose();
      }
    },
    {
      icon: 'chart-line',
      title: 'Progress Analytics',
      subtitle: 'View your fitness journey progress',
      onPress: () => {
        // Navigate to analytics
        onClose();
      }
    },
    {
      icon: 'cog',
      title: 'Settings',
      subtitle: 'App preferences and notifications',
      onPress: () => {
        // Navigate to settings
        onClose();
      }
    },
    {
      icon: 'help-circle',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => {
        // Navigate to help
        onClose();
      }
    },
    {
      icon: 'information',
      title: 'About',
      subtitle: 'App version and information',
      onPress: () => {
        // Navigate to about
        onClose();
      }
    }
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
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
            {/* User Profile Section */}
            <Surface style={styles.profileSection}>
              <View style={styles.profileHeader}>
                <Avatar.Image
                  size={80}
                  source={{ 
                    uri: userData?.profilePic || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&q=80' 
                  }}
                  style={styles.profileAvatar}
                />
                <View style={styles.profileInfo}>
                  <Text style={styles.userName}>
                    {userData?.name || 'User Name'}
                  </Text>
                  <Text style={styles.userEmail}>
                    {userData?.email || 'user@example.com'}
                  </Text>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>7</Text>
                      <Text style={styles.statLabel}>Day Streak</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>85%</Text>
                      <Text style={styles.statLabel}>Goal Progress</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>12</Text>
                      <Text style={styles.statLabel}>Workouts</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Surface>

            

            {/* Menu Items */}
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

            {/* Sign Out Button */}
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <MaterialCommunityIcons name="logout" size={24} color="#FF6B6B" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#1A1B1E',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    backgroundColor: '#23243A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#999',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
     statLabel: {
     fontSize: 12,
     color: '#999',
     marginTop: 2,
   },
   sectionTitle: {
     fontSize: 18,
     fontWeight: 'bold',
     color: '#FFFFFF',
     marginBottom: 15,
   },
  menuSection: {
    backgroundColor: '#23243A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 15,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  divider: {
    backgroundColor: '#333',
    height: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 10,
  },
});
