import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
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
      Toast.show({ type: "error", text1: "Username and password are required!" });
      return;
    }

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      const token = response.data; // token string only
      if (!token) throw new Error("Invalid response from server");

      await login(token);

      Toast.show({ type: "success", text1: "Login successful!" });
      router.replace("/(protected)/home");
    } catch (err) {
      console.log("Login error:", err);
      Toast.show({ type: "error", text1: "Login failed! Check your credentials." });
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

        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <Text style={styles.registerText}>
          Don't have an account?{" "}
          <Text style={styles.registerLink}>Register</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  heading: { fontSize: 32, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#d1d5db", padding: 10, borderRadius: 8, marginBottom: 10 },
  button: { backgroundColor: "#f59e0b", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  registerText: {
  marginTop: 20,
  textAlign: "center",
  color: "#374151",
},
registerLink: {
  color: "#f59e0b",
  fontWeight: "bold",
},

});
