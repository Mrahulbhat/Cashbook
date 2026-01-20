import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (err) {
      alert('Invalid credentials');
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title">Login</ThemedText>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <Pressable
        onPress={handleLogin}
        disabled={isLoading}
        style={styles.button}
      >
        <ThemedText type="defaultSemiBold">
          {isLoading ? 'Logging in...' : 'Login'}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  button: {
    marginTop: 20,
    padding: 14,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    alignItems: 'center',
  },
});
