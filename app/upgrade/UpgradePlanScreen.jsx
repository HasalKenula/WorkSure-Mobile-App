import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import Toast from "react-native-toast-message";

export default function UpgradePlanScreen() {
  const router = useRouter();
  const { jwtToken } = useAuth();

  const handleUpgrade = (plan) => {
    if (!jwtToken) {
      Toast.show({
        type: "error",
        text1: "Please login first",
      });
      return;
    }

    Toast.show({
      type: "info",
      text1: `${plan} plan selected`,
      text2: "Payment flow goes here",
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>{"<"}</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Upgrade Your Plan</Text>

        <Text style={styles.headerSub}>
          Choose the best plan for your work
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* FREE */}
        <PlanCard
          title="Free"
          price="Rs.0"
          duration="Current Plan"
          features={[
            "Can view Workers",
            "Can send a request to worker",
            "Can hire workers",
            "Can add review for them",
          ]}
          buttonText="Current Plan"
          disabled
        />

        {/* GO */}
        <PlanCard
          title="Go"
          price="Rs.2000"
          duration="Valid for 3 Months"
          features={[
            "Can view Workers",
            "Can send a request to worker",
            "Can hire workers",
            "Can add review for them",
            "Can create a worker profile for you",
            "Can do the payment transactions within the app",
            "Can get the Client requests and can approve them",
          ]}
          buttonText="Upgrade to Go"
          onPress={() => handleUpgrade("GO")}
        />

        {/* PLUS */}
        <PlanCard
          title="Plus"
          price="Rs.4000"
          badge="POPULAR"
          duration="Valid for 6 Months"
          features={[
            "Can view Workers",
            "Can send a request to worker",
            "Can hire workers",
            "Can add review for them",
            "Can create a worker profile for you",
            "Can do the payment transactions within the app",
            "Can get the Client requests and can approve them",
          ]}
          highlight
          buttonText="Get Plus"
          onPress={() => handleUpgrade("PLUS")}
        />

        {/* PRO */}
        <PlanCard
          title="Pro"
          price="Rs.8000"
          duration="Valid for 1 Year"
          features={[
            "Can view Workers",
            "Can send a request to worker",
            "Can hire workers",
            "Can add review for them",
            "Can create a worker profile for you",
            "Can do the payment transactions within the app",
            "Can get the Client requests and can approve them",
          ]}
          pro
          buttonText="Get Pro"
          onPress={() => handleUpgrade("PRO")}
        />
      </ScrollView>

      <Toast />
    </View>
  );
}

/* ================= PLAN CARD ================= */

function PlanCard({
  title,
  price,
  duration,
  features,
  buttonText,
  onPress,
  disabled,
  highlight,
  badge,
  pro,
}) {
  return (
    <View
      style={[
        styles.card,
        title === "Free" && styles.freeCard,
        title === "Go" && styles.goCard,
        title === "Plus" && styles.plusCard,
        title === "Pro" && styles.proCard,
        pro && styles.proGlow,
      ]}
    >
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      <Text style={styles.planTitle}>{title}</Text>
      <Text style={styles.duration}>{duration}</Text>
      <Text style={styles.price}>{price}</Text>

      <View style={styles.features}>
        {features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <MaterialIcons name="check-circle" size={18} color="#22c55e" />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      <Pressable
        style={[
          styles.button,
          title === "Go" && styles.goButton,
          title === "Plus" && styles.plusButton,
          title === "Pro" && styles.proButton,
          disabled && styles.disabledBtn,
        ]}
        disabled={disabled}
        onPress={onPress}
      >
        <Text style={styles.buttonText}>{buttonText}</Text>
      </Pressable>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  backText: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },

  /* HEADER */
  /* HEADER */
header: {
  backgroundColor: "#f59e0b",
  paddingTop: 70,
  paddingBottom: 30,
  paddingHorizontal: 20,
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
  alignItems: "center",   // 👈 center title
},

backBtn: {
  position: "absolute",
  top: 60,
  left: 20,
  width: 45,
  height: 45,
  borderRadius: 22.5,
  backgroundColor: "rgba(255,255,255,0.2)",  // soft glass look
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.4)",
},

backText: {
  fontSize: 22,
  color: "#fff",
  fontWeight: "bold",
},


  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },

  headerSub: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginTop: 6,
  },

  scroll: {
    padding: 20,
    paddingBottom: 40,
  },

  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  freeCard: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },

  goCard: {
    backgroundColor: "#eff6ff",
    borderColor: "#93c5fd",
  },

  plusCard: {
    backgroundColor: "#fff7ed",
    borderColor: "#f59e0b",
  },

  proCard: {
    backgroundColor: "#faf5ff",
    borderColor: "#c084fc",
  },

  proGlow: {
    shadowColor: "#a855f7",
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
  },

  badge: {
    alignSelf: "center",
    backgroundColor: "#f59e0b",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },

  planTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },

  duration: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
  },

  price: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
    color: "#1e293b",
  },

  features: {
    marginVertical: 10,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#334155",
  },

  button: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  goButton: {
    backgroundColor: "#f59e0b",
  },

  plusButton: {
    backgroundColor: "#f59e0b",
  },

  proButton: {
    backgroundColor: "#f59e0b",
  },

  disabledBtn: {
    backgroundColor: "#e5e7eb",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
