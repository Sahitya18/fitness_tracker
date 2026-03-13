/**
 * AuthContext.jsx - NEW APPROACH
 * Uses timestamp to detect fresh logins instead of boolean flags
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [isLoading,  setIsLoading]  = useState(true);
  const [userToken,  setUserToken]  = useState(null);
  const [userData,   setUserData]   = useState(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token          = await AsyncStorage.getItem('userToken');
      const storedUserData = await AsyncStorage.getItem('userData');

      if (token && storedUserData) {
        setUserToken(token);
        setUserData(JSON.parse(storedUserData));
        console.log('✓ Session restored — user is logged in');
      } else {
        console.log('No stored session — showing login');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (token, user) => {
    try {
      // ═══ NEW APPROACH: Store login timestamp ═══
      const loginTimestamp = Date.now();
      
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      await AsyncStorage.setItem('lastLoginTimestamp', loginTimestamp.toString());
      
      setUserToken(token);
      setUserData(user);
      
      console.log('✓ signIn: session saved with timestamp:', loginTimestamp);
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove([
        'userToken',
        'userData',
        'selectedDate',
        'lastLoginTimestamp',
        'homeScreenInitTimestamp',
      ]);
      setUserToken(null);
      setUserData(null);
      router.replace('/login');
      console.log('✓ signOut: session cleared');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isLoading, userToken, userData, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
