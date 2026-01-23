import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import api from "../services/api";

export default function WorkerCardScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [worker, setWorker] = useState(null);
  const [payment, setPayment] = useState(null);

  const router = useRouter();
  const { jwtToken, isAuthenticated } = useAuth();

  const config = {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  };

  //  Load logged user
  useEffect(() => {
    if (!jwtToken) return;

    setLoading(true);
    api
      .get("/user", config)
      .then((res) => setUserId(res.data.id))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [jwtToken]);

  //  Load worker + payment
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchWorker();
      fetchPayment();
    }
  }, [isAuthenticated, userId]);

  const fetchWorker = async () => {
    try {
      const res = await api.get(
        `/worker/${userId}`,
        config
      );
      setWorker(res.data);
    } catch {
      setWorker(null);
    }
  };

  const fetchPayment = async () => {
    try {
      const res = await api.get(
        `/payment/${userId}`,
        config
      );
      setPayment(res.data);
    } catch {
      setPayment(null);
    }
  };

  //  Button handlers
  const handleRegister = () => {
    if (worker && payment) {
      Toast.show({
        type: "error",
        text1: "Already registered as a worker",
      });
    } else if (worker) {
      router.push("/planUpgradePage");
    } else {
      router.push("/workerRegistration");
    }
    setModalVisible(false);
  };

  const handleProfile = () => {
    if (!worker && !payment) {
      Toast.show({ type: "error", text1: "Please register first" });
      return;
    }
    if (worker?.isBlocked) {
      Toast.show({ type: "error", text1: "Your account is blocked" });
      return;
    }
    router.push("/workerProfile");
    setModalVisible(false);
  };

  const handleProfileUpdate = () => {
    if (!worker && !payment) {
      Toast.show({ type: "error", text1: "Please register first" });
      return;
    }
    if (worker?.isBlocked) {
      Toast.show({ type: "error", text1: "Your account is blocked" });
      return;
    }
    router.push("/workerProfileUpdate");
    setModalVisible(false);
  };

  const handleBankDetails = () => {
    if (!worker && !payment) {
      Toast.show({ type: "error", text1: "Please register first" });
      return;
    }
    if (worker?.isBlocked) {
      Toast.show({
        type: "error",
        text1: "Account blocked. Cannot add payment details",
      });
      return;
    }
    router.push("/bank");
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/*  Main Button */}
      <Pressable style={styles.mainButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.mainButtonText}>Find Worker</Text>
      </Pressable>

      {/*  Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Choose Option</Text>

            {loading && <ActivityIndicator size="small" />}

            <Pressable style={styles.greenBtn} onPress={handleRegister}>
              <Text style={styles.btnText}>Worker Registration</Text>
            </Pressable>

            <Pressable style={styles.blueBtn} onPress={handleProfile}>
              <Text style={styles.btnText}>Worker Profile</Text>
            </Pressable>

            <Pressable style={styles.yellowBtn} onPress={handleProfileUpdate}>
              <Text style={styles.btnText}>Worker Profile Update</Text>
            </Pressable>

            <Pressable style={styles.redBtn} onPress={handleBankDetails}>
              <Text style={styles.btnText}>Worker Payment Details</Text>
            </Pressable>

            <Pressable
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },

  mainButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    elevation: 3,
  },

  mainButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: 320,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },

  greenBtn: {
    backgroundColor: "#22c55e",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  blueBtn: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  yellowBtn: {
    backgroundColor: "#eab308",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  redBtn: {
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  closeBtn: {
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
  },

  closeText: {
    textAlign: "center",
    fontWeight: "600",
  },
});


