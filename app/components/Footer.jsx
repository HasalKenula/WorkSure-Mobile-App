import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Footer() {
  const router = useRouter();

  return (
    <View style={styles.footer}>
      <TouchableOpacity 
        style={styles.footerItem} 
        onPress={() => router.push("/(protected)/home")}
      >
        <Text style={styles.footerIcon}>🏠</Text>
        <Text style={styles.footerText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.footerItem} 
        onPress={() => router.push("/(protected)/workers")}
      >
        <Text style={styles.footerIcon}>🔍</Text>
        <Text style={styles.footerText}>Find Workers</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.footerItem} 
        onPress={() => alert("Contact page coming soon")}
      >
        <Text style={styles.footerIcon}>📞</Text>
        <Text style={styles.footerText}>Contact</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.footerItem} 
        onPress={() => alert("About Us page coming soon")}
      >
        <Text style={styles.footerIcon}>ℹ️</Text>
        <Text style={styles.footerText}>About</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 0,
    backgroundColor: "#f59e0b",
    borderTopWidth: 1,
    borderTopColor: "#e5a534",
  },
  footerItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  footerIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  footerText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});
