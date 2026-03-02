
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import api from "../services/api";

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    if (!username || !password) {
      Toast.show({
        type: "error",
        text1: "Username and password are required!",
      });
      return;
    }

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      // EXPECTING SAME RESPONSE AS WEB
      const token = response.data.token;
      const returnedUsername = response.data.username;

      if (!token || !returnedUsername) {
        throw new Error("Invalid response from server");
      }

      await login(token, returnedUsername);

      Toast.show({
        type: "success",
        text1: "Login successful!",
      });

      // admin vs user routing (same logic as web)
      if (returnedUsername === "admin") {
        router.replace("/(admin)/dashboard");
      } else {
        router.replace("/(protected)/home");
      }
    } catch (err) {
      console.log("Login error:", err);
      Toast.show({
        type: "error",
        text1: "Login failed!",
        text2: "Check your credentials",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#f59e0b",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
