import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function RootIndex() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.replace('/');        // goes to (tabs)/index.tsx
    } else {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading]);

  return <View />;
}
