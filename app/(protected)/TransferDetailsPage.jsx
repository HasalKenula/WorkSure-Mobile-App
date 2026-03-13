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

export default function TransferDetailsPage() {
  const { jwtToken, isAuthenticated } = useAuth();
  const router = useRouter();

  const [userId, setUserId] = useState(null);
  const [worker, setWorker] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  /* ---------- FETCH TRANSFERS ---------- */
  const fetchTransfers = async () => {
    if (!worker?.id || !jwtToken) return;

    try {
      // Fix the API endpoint - use the correct endpoint
      const response = await api.get(`/transfe/${worker.id}`, getConfig());
      
      if (response.data && Array.isArray(response.data)) {
        setTransfers(response.data);
      } else if (response.data && response.data.transfers) {
        setTransfers(response.data.transfers);
      } else {
        setTransfers([]);
      }
    } catch (err) {
      console.log("Error fetching transfers:", err);
      if (err.response?.status !== 404) {
        Toast.show({
          type: "error",
          text1: "Failed to load transfer details",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (worker?.id && jwtToken) {
      fetchTransfers();
    }
  }, [worker?.id, jwtToken]);

  const onRefresh = () => {
    setRefreshing(true);
    if (worker?.id) {
      fetchTransfers();
    }
  };

  /* ---------- PREPARE CHART DATA ---------- */
  const prepareChartData = () => {
    if (!transfers || transfers.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }]
      };
    }

    // Group transfers by date
    const dataMap = new Map();

    transfers.forEach(transfer => {
      const date = new Date(transfer.createdAt);
      const dateKey = date.toLocaleDateString("en-GB", {
        day: '2-digit',
        month: 'short'
      });

      const amount = parseFloat(transfer.amount) || 0;

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
    return transfers.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  };

  /* ---------- CALCULATE AVERAGE ---------- */
  const calculateAverage = () => {
    if (transfers.length === 0) return 0;
    return calculateTotal() / transfers.length;
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

  const handlePrint = () => {
    Toast.show({
      type: "info",
      text1: "Print feature coming soon",
    });
  };

  if (loading && !worker) {
    return (
      <SafeAreaView style={styles.center}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Loading transfer details...</Text>
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
            <Text style={styles.headerTitle}>Transfer Details</Text>
            <Pressable onPress={handlePrint} style={styles.printButton}>
              <Ionicons name="print" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Worker Info - Fixed icon */}
        {worker && (
          <View style={styles.workerInfoCard}>
            <View style={styles.workerAvatar}>
              <FontAwesome name="user" size={24} color="#f59e0b" />
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
            <MaterialIcons name="account-balance-wallet" size={24} color="#f59e0b" />
            <Text style={styles.statLabel}>Total Amount</Text>
            <Text style={styles.statValue}>{formatCurrency(calculateTotal())}</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="trending-up" size={24} color="#f59e0b" />
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>{formatCurrency(calculateAverage())}</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="receipt" size={24} color="#f59e0b" />
            <Text style={styles.statLabel}>Count</Text>
            <Text style={styles.statValue}>{transfers.length}</Text>
          </View>
        </View>

        {/* Chart Section */}
        {transfers.length > 0 ? (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <MaterialIcons name="show-chart" size={20} color="#f59e0b" />
              <Text style={styles.chartTitle}>Transfer History Overview</Text>
            </View>
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
            <View style={styles.chartFooter}>
              <Text style={styles.chartFooterText}>
                Last 7 days • Total: {formatCurrency(calculateTotal())}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyChartContainer}>
            <MaterialIcons name="show-chart" size={64} color="#e2e8f0" />
            <Text style={styles.emptyChartTitle}>No Transfer Data</Text>
            <Text style={styles.emptyChartText}>
              Transfer records will appear here once payments are processed
            </Text>
          </View>
        )}

        {/* Transfers List */}
        <View style={styles.transfersContainer}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="history" size={22} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Transaction History</Text>
            {transfers.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{transfers.length}</Text>
              </View>
            )}
          </View>
          
          {transfers.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="receipt" size={64} color="#e2e8f0" />
              <Text style={styles.emptyTitle}>No Transfer Records</Text>
              <Text style={styles.emptyText}>
                No transfer records found for this worker
              </Text>
            </View>
          ) : (
            transfers.map((transfer, index) => (
              <View key={transfer.transactionId || index} style={styles.transferCard}>
                <View style={styles.transferHeader}>
                  <View style={styles.transactionIdContainer}>
                    <MaterialIcons name="tag" size={16} color="#f59e0b" />
                    <Text style={styles.transactionId}>
                      {transfer.transactionId ? transfer.transactionId.substring(0, 12) + '...' : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <MaterialIcons name="check-circle" size={14} color="#22c55e" />
                    <Text style={styles.statusText}>Completed</Text>
                  </View>
                </View>

                <View style={styles.transferDetails}>
                  <View style={styles.amountRow}>
                    <FontAwesome name="money" size={16} color="#f59e0b" />
                    <Text style={styles.amountLabel}>Amount:</Text>
                    <Text style={styles.amountValue}>{formatCurrency(transfer.amount)}</Text>
                  </View>

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="credit-card" size={14} color="#64748b" />
                      <Text style={styles.detailText}>
                        {transfer.paymentMethod || 'Bank Transfer'}
                      </Text>
                    </View>

                    <View style={styles.detailItem}>
                      <MaterialIcons name="person" size={14} color="#64748b" />
                      <Text style={styles.detailText}>
                        Ref: {transfer.referenceNumber || 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Ionicons name="time-outline" size={14} color="#64748b" />
                      <Text style={styles.detailText}>
                        {formatDate(transfer.createdAt)}
                      </Text>
                    </View>
                  </View>

                  {transfer.description && (
                    <View style={styles.descriptionContainer}>
                      <MaterialIcons name="description" size={14} color="#64748b" />
                      <Text style={styles.descriptionText}>{transfer.description}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Summary Card */}
        {transfers.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Transactions:</Text>
              <Text style={styles.summaryValue}>{transfers.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount:</Text>
              <Text style={styles.summaryValueTotal}>{formatCurrency(calculateTotal())}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Average per Transaction:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(calculateAverage())}</Text>
            </View>
          </View>
        )}
      </ScrollView>
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
  printButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
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
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    alignSelf: 'center',
  },
  chartFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    alignItems: "center",
  },
  chartFooterText: {
    fontSize: 12,
    color: "#64748b",
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
  transfersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    flex: 1,
  },
  countBadge: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
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
  transferCard: {
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
  transferHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  transactionIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#22c55e",
  },
  transferDetails: {
    gap: 12,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f59e0b",
  },
  detailsGrid: {
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#475569",
  },
  descriptionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  descriptionText: {
    fontSize: 13,
    color: "#64748b",
    flex: 1,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  summaryValueTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f59e0b",
  },
});