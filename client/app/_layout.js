import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../utils/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { router, useSegments } from 'expo-router';
import { Slot } from 'expo-router';

// This hook will protect the route access based on user authentication
function useProtectedRoute(isAuthenticated) {
  const segments = useSegments();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    
    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the login page if not authenticated
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect away from auth group pages if authenticated
      router.replace('/home');
    }
  }, [isAuthenticated, segments]);
}

function RootLayoutNav() {
  const { isLoading, userToken } = useAuth();
  useProtectedRoute(!!userToken);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f5f5f5',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
