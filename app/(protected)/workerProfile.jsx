import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";
const DEFAULT_IMG = require("../../assets/icon.png");


export default function WorkerProfile() {
  const { jwtToken, isAuthenticated } = useAuth();
  const router = useRouter();

  const [userId, setUserId] = useState(null);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  const config = {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  };

  /* ---------- FETCH USER ---------- */
  useEffect(() => {
    if (!jwtToken) return;

    api
      .get("/user", config)
      .then((res) => setUserId(res.data.id))
      .catch(() => setLoading(false));
  }, [jwtToken]);

  /* ---------- FETCH WORKER ---------- */
  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    setLoading(true);
    api
      .get(`/worker/${userId}`, config)
      .then((res) => setWorker(res.data))
      .catch(() => Toast.show({ type: "error", text1: "Failed to load profile" }))
      .finally(() => setLoading(false));
  }, [isAuthenticated, userId]);

  const getWorkingDays = () => {
    if (!worker) return [];
    const days = [];
    if (worker.mon) days.push("Mon");
    if (worker.tue) days.push("Tue");
    if (worker.wed) days.push("Wed");
    if (worker.thu) days.push("Thu");
    if (worker.fri) days.push("Fri");
    if (worker.sat) days.push("Sat");
    if (worker.sun) days.push("Sun");
    return days;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!worker) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ================= HEADER WITH GRADIENT ================= */}
        <View style={styles.headerBackground}>
          <View style={styles.headerCard}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  worker.user?.imageUrl
                    ? { uri: worker.user.imageUrl }
                    : DEFAULT_IMG
                }
                style={styles.avatar}
              />
              <View style={styles.onlineIndicator} />
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.name}>{worker.fullName}</Text>
              <View style={styles.roleBadge}>
                <MaterialIcons name="work" size={16} color="#fff" />
                <Text style={styles.role}>{worker.jobRole}</Text>
              </View>
              
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={18} color="#64748b" />
                <Text style={styles.locationText}>{worker.address}</Text>
              </View>
              
              <View style={styles.ratingRow}>
                <FontAwesome name="star" size={16} color="#fbbf24" />
                <Text style={styles.ratingText}>5.0 • 75 reviews</Text>
              </View>
            </View>

            <Pressable
              style={styles.dashboardBtn}
              onPress={() => router.push("/workerDashboard")}
            >
              <MaterialIcons name="dashboard" size={18} color="#fff" />
              <Text style={styles.dashboardText}>Dashboard</Text>
            </Pressable>
          </View>
        </View>

        {/* ================= QUICK STATS ================= */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="work-history" size={24} color="#f59e0b" />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>
                {worker.jobExperiences?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Experiences</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <MaterialIcons name="verified" size={24} color="#f59e0b" />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>
                {worker.certificates?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Certificates</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <Feather name="calendar" size={24} color="#f59e0b" />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>
                {getWorkingDays().length}
              </Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
          </View>
        </View>

        {/* ================= CONTENT ================= */}
        <InfoCard 
          title="Working Area" 
          icon={<Ionicons name="map" size={20} color="#f59e0b" />}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardText}>{worker.preferredServiceLocation || "Not specified"}</Text>
          </View>
        </InfoCard>

        <InfoCard 
          title="Availability Schedule" 
          icon={<Feather name="clock" size={20} color="#f59e0b" />}
        >
          <View style={styles.cardContent}>
            <View style={styles.daysContainer}>
              {getWorkingDays().length > 0 ? (
                getWorkingDays().map((day, index) => (
                  <View key={index} style={styles.dayChip}>
                    <Text style={styles.dayText}>{day}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.mutedText}>Not set</Text>
              )}
            </View>
            {(worker.preferredStartTime && worker.preferredEndTime) && (
              <View style={styles.timeContainer}>
                <MaterialCommunityIcons name="clock-time-four" size={18} color="#64748b" />
                <Text style={styles.timeText}>
                  {worker.preferredStartTime} - {worker.preferredEndTime}
                </Text>
              </View>
            )}
          </View>
        </InfoCard>

        <InfoCard 
          title="Certifications & Skills" 
          icon={<MaterialIcons name="verified" size={20} color="#f59e0b" />}
        >
          {worker.certificates?.length ? (
            worker.certificates.map((c, i) => (
              <View key={i} style={styles.certItem}>
                <View style={styles.certIcon}>
                  <MaterialIcons name="school" size={18} color="#f59e0b" />
                </View>
                <View style={styles.certContent}>
                  <Text style={styles.certName}>{c.certificateName}</Text>
                  {c.issuingBody && (
                    <Text style={styles.certBody}>{c.issuingBody}</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="info-outline" size={24} color="#94a3b8" />
              <Text style={styles.emptyText}>No certifications added yet</Text>
            </View>
          )}
        </InfoCard>

        <InfoCard 
          title="Work Experience" 
          icon={<FontAwesome name="briefcase" size={18} color="#f59e0b" />}
        >
          {worker.jobExperiences?.length ? (
            worker.jobExperiences.map((exp, i) => (
              <View key={i} style={styles.expItem}>
                <View style={styles.expHeader}>
                  <View>
                    <Text style={styles.expTitle}>{exp.jobTitle}</Text>
                    <View style={styles.companyRow}>
                      <MaterialIcons name="business" size={14} color="#64748b" />
                      <Text style={styles.companyText}>{exp.companyName}</Text>
                    </View>
                  </View>
                  <View style={styles.yearsBadge}>
                    <Text style={styles.yearsText}>{exp.years} yrs</Text>
                  </View>
                </View>
                {i < worker.jobExperiences.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="work-outline" size={24} color="#94a3b8" />
              <Text style={styles.emptyText}>No experience added yet</Text>
            </View>
          )}
        </InfoCard>

        <InfoCard 
          title="Client Reviews" 
          icon={<FontAwesome name="star" size={18} color="#f59e0b" />}
        >
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerAvatar}>
                  <FontAwesome name="user" size={16} color="#666" />
                </View>
                <View style={styles.reviewerInfo}>
                  <Text style={styles.reviewerName}>John Doe</Text>
                  <Text style={styles.reviewDate}>2 weeks ago</Text>
                </View>
                <View style={styles.starRow}>
                  {[1,2,3,4,5].map((star) => (
                    <FontAwesome key={star} name="star" size={14} color="#fbbf24" />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>
                Excellent service and very professional. Highly recommend!
              </Text>
              {i < 2 && <View style={styles.reviewDivider} />}
            </View>
          ))}
          <Pressable style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View All Reviews</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#f59e0b" />
          </Pressable>
        </InfoCard>
        
        {/* Edit Profile Button */}
        <Pressable style={styles.editProfileBtn}>
          <MaterialIcons name="edit" size={20} color="#fff" />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </Pressable>
      </ScrollView>

      <Toast />
    </SafeAreaView>
  );
}

/* ================= INFO CARD ================= */
function InfoCard({ title, icon, children }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {icon}
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  headerBackground: {
    backgroundColor: "#f59e0b",
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerCard: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  role: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  locationText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 6,
    opacity: 0.9,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  ratingText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  dashboardBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dashboardText: {
    color: "#f59e0b",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
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
  statContent: {
    marginLeft: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginLeft: 10,
  },
  cardContent: {
    marginTop: 4,
  },
  cardText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
  },
  mutedText: {
    fontSize: 14,
    color: "#94a3b8",
    fontStyle: "italic",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  dayChip: {
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0f2fe",
  },
  dayText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0369a1",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  timeText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
    marginLeft: 6,
  },
  certItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  certIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff7ed",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  certContent: {
    flex: 1,
  },
  certName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  certBody: {
    fontSize: 13,
    color: "#64748b",
  },
  expItem: {
    paddingVertical: 12,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  expTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  companyText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 4,
  },
  yearsBadge: {
    backgroundColor: "#fff7ed",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  yearsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f59e0b",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 12,
  },
  reviewItem: {
    paddingVertical: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: "#94a3b8",
  },
  starRow: {
    flexDirection: "row",
  },
  reviewText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  reviewDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginTop: 12,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f59e0b",
    marginRight: 6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 8,
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f59e0b",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  editProfileText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});



