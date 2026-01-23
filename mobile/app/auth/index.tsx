// app/(auth)/LoginScreen.tsx

import React, { useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/context/AuthContext";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { login, signup, isLoading, loginWithToken } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   clientId: process.env.GOOGLE_CLIENT_ID,
  //   iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
  // });
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });


  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken;

      if (!idToken) {
        Alert.alert("Google Login Failed", "No ID token received");
        return;
      }

      handleGoogleLogin(idToken);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    try {
      setGoogleLoading(true);
      await loginWithToken(idToken);
      router.replace("/(tabs)/transactions");
    } catch (err: any) {
      Alert.alert(
        "Google Login Failed",
        err?.response?.data?.message || err.message
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password || (isSignUp && !name)) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      setLocalLoading(true);
      if (isSignUp) {
        await signup(email, password, name);
      } else {
        await login(email, password);
      }
      router.replace("/(tabs)/transactions");
    } catch (err: any) {
      Alert.alert(
        "Auth Failed",
        err?.response?.data?.message || err.message
      );
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Cashbook
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {isSignUp
                ? "Create your account"
                : "Sign in to continue"}
            </ThemedText>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleEmailAuth}
              disabled={localLoading || isLoading}
            >
              {localLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.primaryButtonText}>
                  {isSignUp ? "Sign Up" : "Sign In"}
                </ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => promptAsync()}
              disabled={!request || googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator />
              ) : (
                <ThemedText>Continue with Google</ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <ThemedText style={{ textAlign: "center", marginTop: 16 }}>
                {isSignUp ? "Already have an account? Sign In" : "No account? Sign Up"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { opacity: 0.7 },
  form: {},
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  googleButton: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
});
