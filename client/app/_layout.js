import { Stack, router, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../utils/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect } from 'react';

function useProtectedRoute(isAuthenticated, isLoading) {
  const segments = useSegments();

  useEffect(() => {
    // Don't redirect while session is still being restored from AsyncStorage
    if (isLoading) return;

    // Auth screens: if you're already logged in, you shouldn't be here.
    const onAuthScreen = ['login', 'register', 'forgot-password'].includes(segments[0]);

    // Onboarding screens: allowed even if not authenticated; also allowed even if authenticated
    // (we auto-login on register, then collect profile data).
    const onOnboardingScreen = ['profile-setup', 'goal'].includes(segments[0]);

    if (!isAuthenticated && !(onAuthScreen || onOnboardingScreen)) {
      // Not logged in → send to login
      router.replace('/login');
    } else if (isAuthenticated && onAuthScreen) {
      // Already logged in but on an auth screen → send straight to app
      router.replace('/home');
    }
  }, [isAuthenticated, isLoading, segments]);
}

function RootLayoutNav() {
  const { isLoading, userToken } = useAuth();
  useProtectedRoute(!!userToken, isLoading);

  // Block all rendering until AsyncStorage token restore is done —
  // prevents the login screen flashing before the session is confirmed.
  if (isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"             />
      <Stack.Screen name="login"             />
      <Stack.Screen name="register"          />
      <Stack.Screen name="forgot-password"   />
      <Stack.Screen name="profile-setup"     />
      <Stack.Screen name="goal"              />
      <Stack.Screen name="home"              />
      <Stack.Screen name="meal-details"      />
      <Stack.Screen name="food-detail"       />
      <Stack.Screen name="add-meal-manually" />
      <Stack.Screen name="user-profile"      />
      <Stack.Screen name="body-biometrics"   />
      <Stack.Screen name="support-screen"    />
      <Stack.Screen name="about"             />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#1A1B1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
