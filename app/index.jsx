import { useEffect, useState } from "react";
import { useRouter, useNavigationState } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Wait until component mounts
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      router.replace("/(auth)/login");
    }
  }, [mounted]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
