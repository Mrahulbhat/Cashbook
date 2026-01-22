import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { login, signup, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (isSignUp && !name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      setLocalLoading(true);
      if (isSignUp) {
        await signup(email, password, name);
        Alert.alert('Success', 'Account created successfully!');
      } else {
        await login(email, password);
      }
      // Navigate to tabs after successful auth
      router.replace('/(tabs)');
    } catch (err: any) {
      // Backend returns { success: false, message: "..." }
      const message = err?.response?.data?.message || err?.message || 
        (isSignUp ? 'Sign up failed. Please try again.' : 'Login failed. Please check your credentials.');
      Alert.alert(isSignUp ? 'Sign Up Failed' : 'Login Failed', message);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert('Coming Soon', 'Google sign in will be available soon');
    // TODO: Add Google OAuth logic here
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>Cashbook</ThemedText>
            <ThemedText style={styles.subtitle}>
              {isSignUp ? 'Create your account to start tracking' : 'Welcome back! Sign in to continue'}
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Full Name</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? '#1c1c1e' : '#f5f5f5',
                      borderColor: isDark ? '#3a3a3c' : '#e0e0e0',
                      color: isDark ? '#ffffff' : '#1a1a1a',
                    }
                  ]}
                  placeholder="John Doe"
                  placeholderTextColor={isDark ? '#8e8e93' : '#999999'}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!localLoading && !isLoading}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email Address</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#1c1c1e' : '#f5f5f5',
                    borderColor: isDark ? '#3a3a3c' : '#e0e0e0',
                    color: isDark ? '#ffffff' : '#1a1a1a',
                  }
                ]}
                placeholder="you@example.com"
                placeholderTextColor={isDark ? '#8e8e93' : '#999999'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!localLoading && !isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#1c1c1e' : '#f5f5f5',
                    borderColor: isDark ? '#3a3a3c' : '#e0e0e0',
                    color: isDark ? '#ffffff' : '#1a1a1a',
                  }
                ]}
                placeholder="••••••••"
                placeholderTextColor={isDark ? '#8e8e93' : '#999999'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!localLoading && !isLoading}
              />
            </View>

            {!isSignUp && (
              <TouchableOpacity style={styles.forgotPassword}>
                <ThemedText style={styles.forgotPasswordText}>Forgot password?</ThemedText>
              </TouchableOpacity>
            )}

            {/* Email Auth Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: isDark ? '#0a84ff' : '#007AFF' },
                (localLoading || isLoading) && styles.buttonDisabled
              ]}
              onPress={handleEmailAuth}
              disabled={localLoading || isLoading}
              activeOpacity={0.8}
            >
              {localLoading || isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ThemedText style={styles.primaryButtonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </ThemedText>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: isDark ? '#3a3a3c' : '#e0e0e0' }]} />
              <ThemedText style={styles.dividerText}>or continue with</ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: isDark ? '#3a3a3c' : '#e0e0e0' }]} />
            </View>

            {/* Google Sign In Button */}
            <TouchableOpacity
              style={[
                styles.googleButton,
                {
                  backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
                  borderColor: isDark ? '#3a3a3c' : '#dadce0',
                }
              ]}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
            >
              <ThemedText style={[styles.googleButtonText, { color: isDark ? '#ffffff' : '#3c4043' }]}>
                {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
              </ThemedText>
            </TouchableOpacity>

            {/* Toggle Sign Up/Sign In */}
            <View style={styles.footer}>
              <ThemedText style={styles.footerText}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </ThemedText>
              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} disabled={localLoading || isLoading}>
                <ThemedText style={styles.footerLink}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -6,
  },
  forgotPasswordText: {
    color: '#0a84ff',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    opacity: 0.5,
    fontSize: 13,
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    opacity: 0.7,
    fontSize: 14,
    marginRight: 4,
  },
  footerLink: {
    color: '#0a84ff',
    fontSize: 14,
    fontWeight: '700',
  },
});
