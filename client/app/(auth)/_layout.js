import { Stack } from 'expo-router';
import { useAuth } from '../../utils/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function AuthLayout() {
  const { userToken, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !userToken) {
      // Redirect to login if not authenticated
      router.replace('/login');
    }
  }, [isLoading, userToken]);

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
      }}
    />
  );
} 