import { Stack } from 'expo-router';
import { useAuth } from '../../utils/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function PublicLayout() {
  const { userToken, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && userToken) {
      // Redirect to home if already authenticated
      router.replace('/home');
    }
  }, [isLoading, userToken]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
} 