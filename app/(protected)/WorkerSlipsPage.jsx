import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Dimensions,
  Image,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { 
  Ionicons, 
  MaterialIcons, 
  FontAwesome, 
  Feather,
  MaterialCommunityIcons 
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from 'react-native-chart-kit';
import api from "../services/api";

const { width: screenWidth } = Dimensions.get('window');
const DEFAULT_IMG = require("../../assets/icon.png");

export default function WorkerSlipsPage() {
  const { jwtToken, isAuthenticated } = useAuth();
  const router = useRouter();

  const [userId, setUserId] = useState(null);
  const [worker, setWorker] = useState(null);
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Create config dynamically
  const getConfig = () => ({
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  });

  /* ---------- FETCH USER ---------- */
  useEffect(() => {
    if (!jwtToken) {
      setLoading(false);
      return;
    }

    api
      .get("/user", getConfig())
      .then((res) => {
        setUserId(res.data.id);
      })
      .catch((err) => {
        console.log("Error fetching user:", err);
        setLoading(false);
        Toast.show({ 
          type: "error", 
          text1: "Failed to load user data" 
        });
      });
  }, [jwtToken]);

  /* ---------- FETCH WORKER ---------- */
  useEffect(() => {
    if (!isAuthenticated || !userId || !jwtToken) return;

    api
      .get(`/worker/${userId}`, getConfig())
      .then((res) => {
        setWorker(res.data);
      })
      .catch((err) => {
        console.log("Error fetching worker:", err);
        Toast.show({ 
          type: "error", 
          text1: "Failed to load profile" 
        });
      });
  }, [isAuthenticated, userId, jwtToken]);

  /* ---------- FETCH SLIPS ---------- */
  const fetchSlips = async () => {
    if (!worker?.id || !jwtToken) return;

    try {
      const response = await api.get(`/slip/${worker.id}`, getConfig());
      
      if (response.data && Array.isArray(response.data)) {
        setSlips(response.data);
      } else if (response.data && response.data.slips) {
        setSlips(response.data.slips);
      } else {
        setSlips([]);
      }
    } catch (err) {
      console.log("Error fetching slips:", err);
      if (err.response?.status !== 404) {
        Toast.show({
          type: "error",
          text1: "Failed to load payment slips",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (worker?.id && jwtToken) {
      fetchSlips();
    }
  }, [worker?.id, jwtToken]);

  const onRefresh = () => {
    setRefreshing(true);
    if (worker?.id) {
      fetchSlips();
    }
  };

  /* ---------- PREPARE CHART DATA ---------- */
  const prepareChartData = () => {
    if (!slips || slips.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }]
      };
    }

    // Group slips by date
    const dataMap = new Map();

    slips.forEach(slip => {
      const date = new Date(slip.paymentDate || slip.createdAt);
      const dateKey = date.toLocaleDateString("en-GB", {
        day: '2-digit',
        month: 'short'
      });

      const amount = parseFloat(slip.amount) || 0;

      if (dataMap.has(dateKey)) {
        dataMap.set(dateKey, dataMap.get(dateKey) + amount);
      } else {
        dataMap.set(dateKey, amount);
      }
    });

    // Convert to array and sort by date
    const data = Array.from(dataMap, ([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Limit to last 7 days for better display
    const recentData = data.slice(-7);

    return {
      labels: recentData.map(d => d.date),
      datasets: [{
        data: recentData.map(d => d.amount)
      }]
    };
  };

  /* ---------- CALCULATE TOTAL ---------- */
  const calculateTotal = () => {
    return slips.reduce((sum, slip) => sum + (parseFloat(slip.amount) || 0), 0);
  };

  /* ---------- CALCULATE AVERAGE ---------- */
  const calculateAverage = () => {
    if (slips.length === 0) return 0;
    return calculateTotal() / slips.length;
  };

  /* ---------- FORMAT CURRENCY ---------- */
  const formatCurrency = (amount) => {
    return `LKR ${parseFloat(amount || 0).toFixed(2)}`;
  };

  /* ---------- FORMAT DATE ---------- */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "N/A";
    }
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#F59E0B'
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Loading payment slips...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text style={styles.headerTitle}>Payment Slips</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>

        {/* Worker Info with Image */}
        {worker && (
          <View style={styles.workerInfoCard}>
            <View style={styles.workerAvatar}>
              {worker.user?.imageUrl ? (
                <Image
                  source={{ uri: worker.user.imageUrl }}
                  style={styles.workerAvatarImage}
                />
              ) : (
                <MaterialIcons name="person" size={24} color="#f59e0b" />
              )}
            </View>
            <View style={styles.workerDetails}>
              <Text style={styles.workerName}>{worker.fullName}</Text>
              <Text style={styles.workerRole}>{worker.jobRole}</Text>
            </View>
          </View>
        )}

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Payments</Text>
            <Text style={styles.statValue}>{formatCurrency(calculateTotal())}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Average Payment</Text>
            <Text style={styles.statValue}>{formatCurrency(calculateAverage())}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Slips</Text>
            <Text style={styles.statValue}>{slips.length}</Text>
          </View>
        </View>

        {/* Chart Section */}
        {slips.length > 0 ? (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Payment History Overview</Text>
            <LineChart
              data={prepareChartData()}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              formatYLabel={(value) => {
                const num = parseFloat(value);
                return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : value;
              }}
              yAxisLabel="LKR "
              yAxisSuffix=""
              fromZero
              segments={5}
            />
          </View>
        ) : (
          <View style={styles.emptyChartContainer}>
            <MaterialIcons name="show-chart" size={64} color="#e2e8f0" />
            <Text style={styles.emptyChartTitle}>No Payment Data</Text>
            <Text style={styles.emptyChartText}>
              Payment slips will appear here once you receive payments
            </Text>
          </View>
        )}

        {/* Slips List with Images */}
        <View style={styles.slipsContainer}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          
          {slips.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="receipt" size={64} color="#e2e8f0" />
              <Text style={styles.emptyTitle}>No Payment Slips</Text>
              <Text style={styles.emptyText}>
                Your payment history will appear here
              </Text>
            </View>
          ) : (
            slips.map((slip, index) => (
              <View key={slip.id || index} style={styles.slipCard}>
                <View style={styles.slipHeader}>
                  <View style={styles.slipIcon}>
                    <FontAwesome name="money" size={20} color="#f59e0b" />
                  </View>
                  <View style={styles.slipMainInfo}>
                    <Text style={styles.slipAmount}>{formatCurrency(slip.amount)}</Text>
                    <Text style={styles.slipDate}>{formatDate(slip.paymentDate || slip.createdAt)}</Text>
                  </View>
                </View>
                
                {/* Slip Image if available */}
                {slip.imageUrl && (
                  <Pressable 
                    style={styles.slipImageContainer}
                    onPress={() => openImageModal(slip.imageUrl)}
                  >
                    <Image
                      source={{ uri: slip.imageUrl }}
                      style={styles.slipImage}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlay}>
                      <MaterialIcons name="zoom-in" size={24} color="#fff" />
                    </View>
                  </Pressable>
                )}
                
                {slip.description && (
                  <View style={styles.slipDescription}>
                    <MaterialIcons name="description" size={16} color="#64748b" />
                    <Text style={styles.slipDescriptionText}>{slip.description}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Image Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable 
            style={styles.modalCloseButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </Pressable>
          <Image
            source={{ uri: selectedImage }}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  header: {
    backgroundColor: "#f59e0b",
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  workerInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  workerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff7ed",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  workerAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  workerDetails: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  workerRole: {
    fontSize: 14,
    color: "#64748b",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    alignSelf: 'center',
  },
  emptyChartContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    borderStyle: "dashed",
  },
  emptyChartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyChartText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  slipsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  slipCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  slipHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  slipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff7ed",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  slipMainInfo: {
    flex: 1,
  },
  slipAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  slipDate: {
    fontSize: 12,
    color: "#64748b",
  },
  slipImageContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  slipImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  slipDescription: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  slipDescriptionText: {
    fontSize: 13,
    color: "#475569",
    marginLeft: 8,
    flex: 1,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  modalImage: {
    width: screenWidth,
    height: screenWidth,
  },
});

// Don't forget to import Modal at the top
import { Modal } from "react-native";