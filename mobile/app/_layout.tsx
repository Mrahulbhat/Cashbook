import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/navbar';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: isDark ? '#1e1e1e' : '#f0f0f0',
    },
  };

  return (
    <AuthProvider>
      <ThemeProvider value={theme}>
        <View style={styles.container}>
          <SafeAreaView
            edges={['top']}
            style={{
              backgroundColor: isDark ? '#1e1e1e' : '#ffffff'
            }}
          >
          <Navbar />
        </SafeAreaView>


        {/* Screens */}
        <View style={styles.content}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </View>
      </View>

      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
    </AuthProvider >
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
