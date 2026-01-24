import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
  AntDesign,
  FontAwesome5,
} from "@expo/vector-icons";
import api from "../services/api";

const DEFAULT_IMG = require("../../assets/icon.png");

export default function WorkerDashBoard() {
  const { jwtToken, isAuthenticated } = useAuth();
  const router = useRouter();

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [worker, setWorker] = useState(null);
  const [hire, setHire] = useState([]);
  const [hiresLoading, setHiresLoading] = useState(false);

  const config = {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  };

  /* ---------- FETCH USER ---------- */
  useEffect(() => {
    if (!jwtToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    api
      .get("/user", config)
      .then((res) => {
        setUserId(res.data.id);
        setLoading(false);
      })
      .catch((err) => {
        console.log("User load error:", err);
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Failed to load user data",
        });
      });
  }, [jwtToken]);

  /* ---------- FETCH WORKER ---------- */
  const getWorkers = async () => {
    if (!userId) return;
    
    try {
      const response = await api.get(
        `/worker/${userId}`,
        config
      );
      setWorker(response.data);
    } catch (error) {
      console.log("Error loading worker:", error);
      Toast.show({
        type: "error",
        text1: "Failed to load worker data",
      });
    }
  };

  /* ---------- FETCH HIRES ---------- */
  const getHires = async () => {
    if (!worker || !worker.id) return;
    
    setHiresLoading(true);
    try {
      const response = await api.get(
        `/hire/${worker.id}`,
        config
      );
      setHire(response.data || []);
    } catch (error) {
      console.log("Error loading hires:", error);
      Toast.show({
        type: "error",
        text1: "Failed to load job requests",
      });
    } finally {
      setHiresLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userId) {
      getWorkers();
    }
  }, [isAuthenticated, userId]);

  useEffect(() => {
    if (worker?.id) {
      getHires();
    }
  }, [worker?.id]);

  /* ---------- STATUS COUNTS ---------- */
  const pendingCount = hire.filter((h) => h.isPending && !h.isComplete).length;
  const ongoingCount = hire.filter((h) => h.isOngoing && !h.isComplete).length;
  const completedCount = hire.filter((h) => h.isComplete).length;

  const visibleWorkers = hire.filter((w) => !w.isBooked);

  /* ---------- TOGGLE FUNCTIONS ---------- */
  const handleToggleBlock = async (hireId) => {
    try {
      await api.put(
        `/hire/toggle-block/${hireId}`,
        {},
        config
      );
      setHire((prev) =>
        prev.map((hire) =>
          hire.id === hireId
            ? { ...hire, isBooked: !hire.isBooked }
            : hire
        )
      );
      Toast.show({
        type: "success",
        text1: "Status updated successfully",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to update status",
      });
    }
  };

  const handleTogglePending = async (hireId) => {
    try {
      await api.put(
        `/hire/toggle-pending/${hireId}`,
        {},
        config
      );
      setHire((prev) =>
        prev.map((hire) =>
          hire.id === hireId
            ? { ...hire, isPending: !hire.isPending }
            : hire
        )
      );
      Toast.show({
        type: "success",
        text1: "Pending status updated",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to update status",
      });
    }
  };

  const handleToggleOngoing = async (hireId) => {
    try {
      await api.put(
        `/hire/toggle-ongoging/${hireId}`,
        {},
        config
      );
      setHire((prev) =>
        prev.map((hire) =>
          hire.id === hireId
            ? { ...hire, isOngoing: !hire.isOngoing }
            : hire
        )
      );
      Toast.show({
        type: "success",
        text1: "Ongoing status updated",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to update status",
      });
    }
  };

  const handleToggleComplete = async (hireId) => {
    try {
      await api.put(
        `/hire/toggle-complete/${hireId}`,
        {},
        config
      );
      setHire((prev) =>
        prev.map((hire) =>
          hire.id === hireId
            ? { ...hire, isComplete: !hire.isComplete }
            : hire
        )
      );
      Toast.show({
        type: "success",
        text1: "Completion status updated",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to update status",
      });
    }
  };

  /* ---------- RENDER STARS ---------- */
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FontAwesome
        key={i}
        name="star"
        size={16}
        color={i < rating ? "#fbbf24" : "#e2e8f0"}
      />
    ));
  };

  /* ---------- SAMPLE REVIEWS ---------- */
  const workerReviews = [
    {
      id: 1,
      name: "John Doe",
      date: new Date().toLocaleDateString(),
      rating: 3,
      review: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      id: 2,
      name: "Michael Silva",
      date: new Date().toLocaleDateString(),
      rating: 4,
      review: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      id: 3,
      name: "Kamal Perera",
      date: new Date().toLocaleDateString(),
      rating: 5,
      review: "Praesent aliquet, leo non facilisis malesuada.",
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Worker Dashboard</Text>
          <Text style={styles.headerSubtitle}>Manage your work efficiently</Text>
        </View>

        {/* ================= STATS CARDS ================= */}
        <View style={styles.statsContainer}>
          {/* Completed Works */}
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#d1fae5" }]}>
              <MaterialCommunityIcons name="check-circle" size={32} color="#059669" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed Works</Text>
            </View>
          </View>

          {/* Ongoing Works */}
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#dbeafe" }]}>
              <Feather name="clock" size={32} color="#3b82f6" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{ongoingCount}</Text>
              <Text style={styles.statLabel}>Ongoing Works</Text>
            </View>
          </View>

          {/* Pending Requests */}
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#fef3c7" }]}>
              <MaterialIcons name="pending" size={32} color="#d97706" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pending Requests</Text>
            </View>
          </View>
        </View>

        {/* ================= EARNINGS & RATING ================= */}
        <View style={styles.earningRatingContainer}>
          {/* Earnings Card */}
          <View style={styles.earningCard}>
            <View style={styles.cardIcon}>
              <FontAwesome5 name="money-bill-wave" size={40} color="#f59e0b" />
            </View>
            <Text style={styles.cardTitle}>Total Earnings</Text>
            <Text style={styles.earningAmount}>Rs. 0</Text>
            <Text style={styles.cardSubtitle}>Total revenue earned</Text>
          </View>

          {/* Rating Card */}
          <View style={styles.ratingCard}>
            <View style={styles.cardIcon}>
              <AntDesign name="star" size={40} color="#f59e0b" />
            </View>
            <Text style={styles.cardTitle}>Rating</Text>
            <View style={styles.starsContainer}>
              {renderStars(0)}
            </View>
            <Text style={styles.ratingText}>0.0 (0 Reviews)</Text>
          </View>
        </View>

        {/* ================= NEW JOB REQUESTS ================= */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="work-outline" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>New Job Requests</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Manage and review pending user verification requests
          </Text>

          {hiresLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#f59e0b" />
              <Text style={styles.loadingSmallText}>Loading requests...</Text>
            </View>
          ) : hire.length > 0 ? (
            <FlatList
              data={hire}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <View style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestId}>#{index + 1}</Text>
                    <View style={[
                      styles.statusBadge,
                      item.isBooked ? styles.blockedBadge : styles.activeBadge
                    ]}>
                      <Text style={styles.statusText}>
                        {item.isBooked ? "Blocked" : "Active"}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.requestInfo}>
                    <Text style={styles.clientName}>{item.user?.name || "Unknown Client"}</Text>
                    <View style={styles.dateTimeRow}>
                      <Feather name="calendar" size={16} color="#64748b" />
                      <Text style={styles.dateText}>{item.bookingDate}</Text>
                      <Feather name="clock" size={16} color="#64748b" style={styles.timeIcon} />
                      <Text style={styles.timeText}>{item.bookingTime}</Text>
                    </View>
                    <Text style={styles.description} numberOfLines={2}>
                      {item.description}
                    </Text>
                    
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          item.isBooked ? styles.approveButton : styles.blockButton
                        ]}
                        onPress={() => handleToggleBlock(item.id)}
                      >
                        {item.isBooked ? (
                          <Ionicons name="checkmark-circle" size={18} color="#059669" />
                        ) : (
                          <Ionicons name="close-circle" size={18} color="#dc2626" />
                        )}
                        <Text style={styles.actionButtonText}>
                          {item.isBooked ? "Approve" : "Block"}
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          item.isPending ? styles.pendingButton : styles.seenButton
                        ]}
                        onPress={() => handleTogglePending(item.id)}
                      >
                        <Ionicons name="eye" size={18} color={item.isPending ? "#d97706" : "#3b82f6"} />
                        <Text style={styles.actionButtonText}>
                          {item.isPending ? "Pending" : "Seen"}
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => router.push(`/workerView/${item.user?.id}`)}
                      >
                        <Feather name="user" size={18} color="#64748b" />
                        <Text style={styles.profileButtonText}>Profile</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="work-off" size={48} color="#e2e8f0" />
              <Text style={styles.emptyText}>No job requests available</Text>
            </View>
          )}
        </View>

        {/* ================= ONGOING WORKS ================= */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="play-circle-outline" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Ongoing Works</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Manage your current ongoing jobs
          </Text>

          {hiresLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#f59e0b" />
              <Text style={styles.loadingSmallText}>Loading works...</Text>
            </View>
          ) : visibleWorkers.length > 0 ? (
            <FlatList
              data={visibleWorkers}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <View style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestId}>#{index + 1}</Text>
                    <View style={styles.statusContainer}>
                      <View style={[
                        styles.statusBadge,
                        item.isOngoing ? styles.ongoingBadge : styles.notOngoingBadge
                      ]}>
                        <Text style={styles.statusText}>
                          {item.isOngoing ? "Ongoing" : "Not Ongoing"}
                        </Text>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        item.isComplete ? styles.completeBadge : styles.incompleteBadge
                      ]}>
                        <Text style={styles.statusText}>
                          {item.isComplete ? "Complete" : "Incomplete"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.requestInfo}>
                    <Text style={styles.clientName}>{item.user?.name || "Unknown Client"}</Text>
                    <View style={styles.dateTimeRow}>
                      <Feather name="calendar" size={16} color="#64748b" />
                      <Text style={styles.dateText}>{item.bookingDate}</Text>
                      <Feather name="clock" size={16} color="#64748b" style={styles.timeIcon} />
                      <Text style={styles.timeText}>{item.bookingTime}</Text>
                    </View>
                    <Text style={styles.description} numberOfLines={2}>
                      {item.description}
                    </Text>
                    
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          item.isBooked ? styles.approveButton : styles.blockButton
                        ]}
                        onPress={() => handleToggleBlock(item.id)}
                      >
                        {item.isBooked ? (
                          <Ionicons name="checkmark-circle" size={18} color="#059669" />
                        ) : (
                          <Ionicons name="close-circle" size={18} color="#dc2626" />
                        )}
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          item.isOngoing ? styles.ongoingButton : styles.freeButton
                        ]}
                        onPress={() => handleToggleOngoing(item.id)}
                      >
                        <MaterialIcons name="play-circle" size={18} color={item.isOngoing ? "#d97706" : "#3b82f6"} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          item.isComplete ? styles.completeActionButton : styles.incompleteActionButton
                        ]}
                        onPress={() => handleToggleComplete(item.id)}
                      >
                        <MaterialIcons name="done-all" size={18} color={item.isComplete ? "#059669" : "#64748b"} />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => router.push(`/workerView/${item.user?.id}`)}
                      >
                        <Feather name="user" size={18} color="#64748b" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="play-circle-outline" size={48} color="#e2e8f0" />
              <Text style={styles.emptyText}>No ongoing works</Text>
            </View>
          )}
        </View>

        {/* ================= USER REVIEWS ================= */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome name="star" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>User Reviews</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {workerReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <Image source={DEFAULT_IMG} style={styles.reviewerAvatar} />
                    <View>
                      <Text style={styles.reviewerName}>{review.name}</Text>
                      <Text style={styles.reviewDate}>{review.date}</Text>
                    </View>
                  </View>
                  <View style={styles.reviewRating}>
                    {renderStars(review.rating)}
                    <Text style={styles.ratingValue}>{review.rating}.0</Text>
                  </View>
                </View>
                <Text style={styles.reviewText}>{review.review}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  loadingSmallText: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748b",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  header: {
    backgroundColor: "#f59e0b",
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  statsContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  earningRatingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  earningCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginRight: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  ratingCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginLeft: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 8,
  },
  earningAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: "#64748b",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginLeft: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  requestId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  blockedBadge: {
    backgroundColor: "#fee2e2",
  },
  activeBadge: {
    backgroundColor: "#d1fae5",
  },
  ongoingBadge: {
    backgroundColor: "#fef3c7",
  },
  notOngoingBadge: {
    backgroundColor: "#dbeafe",
  },
  completeBadge: {
    backgroundColor: "#d1fae5",
  },
  incompleteBadge: {
    backgroundColor: "#dbeafe",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusContainer: {
    flexDirection: "row",
    gap: 8,
  },
  requestInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 4,
  },
  timeIcon: {
    marginLeft: 12,
  },
  timeText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  approveButton: {
    backgroundColor: "#d1fae5",
    borderColor: "#a7f3d0",
  },
  blockButton: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
  },
  pendingButton: {
    backgroundColor: "#fef3c7",
    borderColor: "#fde68a",
  },
  seenButton: {
    backgroundColor: "#dbeafe",
    borderColor: "#bfdbfe",
  },
  ongoingButton: {
    backgroundColor: "#fef3c7",
    borderColor: "#fde68a",
  },
  freeButton: {
    backgroundColor: "#dbeafe",
    borderColor: "#bfdbfe",
  },
  completeActionButton: {
    backgroundColor: "#d1fae5",
    borderColor: "#a7f3d0",
  },
  incompleteActionButton: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  profileButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  emptyText: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 12,
  },
  reviewCard: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: "#94a3b8",
  },
  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginLeft: 6,
  },
  reviewText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
});
