import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import DefaultAvatar from "../../assets/default-user.png";
import api from "../services/api";


export default function HomeScreen() {
  const { logout, jwtToken } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jwtToken) {
      setLoading(false);
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

  const menuItems = [
    {
      id: 1,
      title: "Find Workers",
      route: "/workers",
      colors: ["#3b82f6", "#2563eb"],
      description: "Browse and hire skilled workers",
      icon: <FontAwesome5 name="search" size={28} color="white" />,
    },
    {
      id: 2,
      title: "Worker Panel",
      route: "/workerPanel",
      colors: ["#10b981", "#059669"],
      description: "Manage your work profile",
      icon: <FontAwesome5 name="hard-hat" size={28} color="white" />,
    },
  ];

  if (loading) {
    return (
      <View style={styles.loader}>
        <View style={[styles.loaderGradient, { backgroundColor: "#f59e0b" }]}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loaderText}>Loading your profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header with solid color */}
        <View style={[styles.header, { backgroundColor: "#f59e0b" }]}>
          <View style={styles.profileSection}>
            <Image
              source={user?.imageUrl ? { uri: user.imageUrl } : DefaultAvatar}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name || "User"}</Text>
              <View style={styles.emailContainer}>
                <Ionicons name="mail-outline" size={16} color="white" />
                <Text style={styles.userEmail}>{user?.email || ""}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions Title */}
        <View style={styles.quickActionsHeader}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <Text style={styles.quickActionsSubtitle}>
            What would you like to do today?
          </Text>
        </View>

        {/* Menu Items Grid */}
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => router.push(item.route)}
              style={styles.menuItemWrapper}
            >
              <View
                style={[
                  styles.menuItemGradient,
                  { backgroundColor: item.colors[0] }
                ]}
              >
                <View style={styles.iconContainer}>
                  {item.icon}
                </View>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemDescription}>
                  {item.description}
                </Text>
                <View style={styles.arrowContainer}>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={[styles.logoutGradient, { backgroundColor: "#ef4444" }]}>
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text style={styles.logoutText}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderGradient: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: "white",
    fontWeight: "500",
  },
  header: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginLeft: 6,
  },
  quickActionsHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  quickActionsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  quickActionsSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  menuGrid: {
    paddingHorizontal: 16,
  },
  menuItemWrapper: {
    marginBottom: 16,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  menuItemGradient: {
    padding: 20,
    borderRadius: 20,
    position: "relative",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  menuItemTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginRight: 30,
  },
  arrowContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    marginTop: 8,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});