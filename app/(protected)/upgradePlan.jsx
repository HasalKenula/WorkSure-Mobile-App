import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

const plans = [
  { id: "go", name: "Go", price: 2000 },
  { id: "plus", name: "Plus", price: 4000 },
  { id: "pro", name: "Pro", price: 8000 },
];

export default function UpgradePlan() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const router = useRouter();

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan.id);
    router.push({
      pathname: "/payment",
      params: {
        planName: plan.name,
        planPrice: plan.price,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Upgrade Plan</Text>

      {plans.map((plan) => (
        <Pressable
          key={plan.id}
          style={styles.btn}
          onPress={() => handlePlanSelect(plan)}
        >
          <Text style={styles.label}>{plan.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ 
    container: { padding: 20, }, 
    pageTitle: { fontSize: 30, marginBottom: 30 }, 
    btn: { borderWidth: 1, borderRadius: 10, width: "30%", padding:10, marginBottom: 30, }, 
    label: { fontSize: 20 } 
});