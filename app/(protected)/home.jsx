import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import DefaultAvatar from "../../assets/default-user.png";
import api from "../services/api";

export default function HomeScreen() {
  const { logout, jwtToken } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jwtToken) {
      setLoading(false); // stop loader if no token
      return;
    }
    fetchUser();
  }, [jwtToken]);

  const fetchUser = async () => {
    try {
      const res = await api.get("/user", {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      setUser(res.data);
    } catch (err) {
      console.log("Fetch user error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  if (loading) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color="#f59e0b" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image source={user?.imageUrl ? { uri: user.imageUrl } : DefaultAvatar} style={styles.avatar} />
        <Text style={styles.name}>{user?.name || "User"}</Text>
        <Text style={styles.email}>{user?.email || ""}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/workers")}>
        <Text style={styles.buttonText}>Find Workers</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { marginTop: 20 }]} onPress={() => router.push("/workerPanel")}>
        <Text style={styles.buttonText}>Worker Panel</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { marginTop: 20 }]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { marginTop: 20 }]} onPress={() => router.push("/upgrade/UpgradePlanScreen")}>
        <Text style={styles.buttonText}>Upgrade</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  profileContainer: { justifyContent: "center", alignItems: "center", marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10, borderWidth: 3, borderColor: "#f59e0b" },
  name: { fontSize: 22, fontWeight: "bold" },
  email: { fontSize: 16, color: "#555" },
  button: { backgroundColor: "#f59e0b", padding: 15, borderRadius: 8, alignItems: "center", width: 200 },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
});
