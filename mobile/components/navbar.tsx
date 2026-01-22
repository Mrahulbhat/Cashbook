import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from './themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';

  const handleLogout = async () => {
    await logout();
    router.replace('/auth');
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' },
      ]}
    >
      <ThemedText style={styles.title}>Cashbook App</ThemedText>

      {isAuthenticated && (
        <TouchableOpacity onPress={handleLogout}>
          <ThemedText style={styles.logout}>Logout</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  logout: {
    fontSize: 15,
  },
});
