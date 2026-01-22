import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function RootIndex() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Add timeout to prevent infinite loading if backend is down
    const timeout = setTimeout(() => {
      if (isLoading) {
        // If still loading after 3 seconds, assume backend is down and show login
        router.replace('/auth/login');
      }
    }, 3000);

    if (!isLoading) {
      clearTimeout(timeout);
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth/login');
      }
    }

    return () => clearTimeout(timeout);
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner while checking auth
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4f46e5" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
