import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import DefaultAvatar from "../../../assets/default-user.png";
import { Ionicons, FontAwesome, MaterialIcons, Feather, AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../services/api";
import { set } from "date-fns";

export default function WorkerProfileScreen() {
  const { jwtToken } = useAuth();
  const router = useRouter();
  const { workerId } = useLocalSearchParams();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // mock user ratings
  // const userRate = [
  //   {
  //     id: 1,
  //     name: "John Doe",
  //     date: "2023/10/26",
  //     rating: 5,
  //     message: "Excellent work! Highly recommended."
  //   },
  //   {
  //     id: 2,
  //     name: "Jane Smith",
  //     date: "2023/11/02",
  //     rating: 4,
  //     message: "Good work, punctual and professional."
  //   },
  // ];


  // Fetch worker data

  const fetchWorker = useCallback(async () => {
    if (!workerId || !jwtToken) return;

      try {
        const res = await api.get(`/worker/id/${workerId}`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        //const data = await res.json();
        setWorker(res.data);
      } catch (err) {
        console.log("Error fetching worker:", err);
        Alert.alert("Error", "Failed to load worker profile.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
  }, [workerId, jwtToken]);

  // Fetch ratings from database
  const fetchRatings = useCallback(async () => {
    if (!workerId || !jwtToken) return;
    try {
      const res = await api.get(`/ratings/worker/${workerId}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      setRatings(res.data);
      setAverageRating(res.data.average || 0);
    }catch (err) {
      console.log("Error fetching ratings:", err);
      setRatings([]);
      setAverageRating(0);
    }
  }, [workerId, jwtToken]);

  
  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchWorker(), fetchRatings()]);
      setLoading(false);
    };

    initializeData();
  }, [fetchWorker, fetchRatings]);

  














  const getWorkingDays = (worker) => {
    if (!worker) return [];
    const days = [];
    if (worker.mon) days.push("Monday");
    if (worker.tue) days.push("Tuesday");
    if (worker.wed) days.push("Wednesday");
    if (worker.thu) days.push("Thursday");
    if (worker.fri) days.push("Friday");
    if (worker.sat) days.push("Saturday");
    if (worker.sun) days.push("Sunday");
    return days;
  };

  // Calculate average rating
  const calculateAverageRating = () => {
    if (userRate.length === 0) return "0.0";
    const total = userRate.reduce((sum, review) => sum + review.rating, 0);
    return (total / userRate.length).toFixed(1);
  };

  if (loading) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color="#f59e0b" />
      <Text style={styles.loadingText}>Loading profile...</Text>
    </View>
  );

  if (!worker) return (
    <View style={styles.loader}>
      <MaterialIcons name="error-outline" size={60} color="#f59e0b" />
      <Text style={styles.errorText}>Worker not found</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with Gradient Background */}
        <View style={styles.header}>
          <View style={styles.headerBackground} />

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Profile Image Container */}
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: worker.user?.imageUrl || DefaultAvatar }}
              style={styles.avatar}
            />
            <View style={styles.onlineIndicator} />
          </View>
        </View>

        {/* Profile Content */}
        <View style={styles.content}>
          {/* Name and Role */}
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{worker.fullName}</Text>
            <Text style={styles.role}>{worker.jobRole}</Text>

            {/* Rating Badge */}
            <View style={styles.ratingBadge}>
              <FontAwesome name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{calculateAverageRating()} • {userRate.length} reviews</Text>
            </View>
          </View>

          {/* Location Card */}
          <View style={styles.locationCard}>
            <Ionicons name="location-sharp" size={20} color="#f59e0b" />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Location</Text>
              <Text style={styles.locationText}>{worker.address}</Text>
            </View>
          </View>

          {/* Working Area Card */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Feather name="map-pin" size={20} color="#f59e0b" />
              <Text style={styles.cardTitle}>Working Area</Text>
            </View>
            <Text style={styles.cardContent}>{worker.preferredServiceLocation}</Text>
          </View>

          {/* Working Schedule */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="time" size={20} color="#f59e0b" />
              <Text style={styles.cardTitle}>Working Schedule</Text>
            </View>
            {getWorkingDays(worker).map((day, i) => (
              <View key={i} style={styles.scheduleItem}>
                <View style={styles.dayDot} />
                <Text style={styles.scheduleDay}>{day}</Text>
                <Text style={styles.scheduleTime}>
                  {worker.preferredStartTime} to {worker.preferredEndTime}
                </Text>
              </View>
            ))}
          </View>

          {/* Certifications */}
          {worker.certificates?.length > 0 && (
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="verified" size={20} color="#f59e0b" />
                <Text style={styles.cardTitle}>Certifications</Text>
              </View>
              {worker.certificates.map((c, i) => (
                <View key={i} style={styles.certificateItem}>
                  <View style={styles.certIcon}>
                    <FontAwesome5 name="award" size={16} color="#f59e0b" />
                  </View>
                  <View style={styles.certContent}>
                    <Text style={styles.certName}>{c.certificateName}</Text>
                    <Text style={styles.certBody}>{c.issuingBody}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Job Experience */}
          {worker.jobExperiences?.length > 0 && (
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="briefcase" size={18} color="#f59e0b" />
                <Text style={styles.cardTitle}>Job Experience</Text>
              </View>
              {worker.jobExperiences.map((exp, i) => (
                <View key={i} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.experienceTitle}>{exp.jobTitle}</Text>
                    <View style={styles.experienceYears}>
                      <Text style={styles.yearsText}>{exp.years} years</Text>
                    </View>
                  </View>
                  <View style={styles.companyRow}>
                    <Feather name="briefcase" size={14} color="#666" />
                    <Text style={styles.companyText}>{exp.companyName}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* User Ratings */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <AntDesign name="star" size={20} color="#f59e0b" />
              <Text style={styles.cardTitle}>User Ratings</Text>
              <View style={styles.reviewCount}>
                <Text style={styles.reviewCountText}>{userRate.length}</Text>
              </View>
            </View>

            {userRate.map((user) => (
              <View key={user.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerAvatar}>
                    <FontAwesome name="user" size={18} color="#666" />
                  </View>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{user.name}</Text>
                    <Text style={styles.reviewDate}>{user.date}</Text>
                  </View>
                  <View style={styles.starsContainer}>
                    {[...Array(5)].map((_, i) => (
                      <FontAwesome
                        key={i}
                        name="star"
                        size={14}
                        color={i < user.rating ? "#FFD700" : "#E0E0E0"}
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewMessage}>{user.message}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() => router.push(`/feedback/${worker.id}`)}
            >
              <Feather name="message-square" size={18} color="#f59e0b" />
              <Text style={styles.feedbackButtonText}>Add Feedback</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hireButton}
              onPress={() => router.push(`/hire/${worker.id}`)}
            >
              <MaterialIcons name="work" size={18} color="#fff" />
              <Text style={styles.hireButtonText}>Hire Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc"
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    fontFamily: "System"
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    fontWeight: "500"
  },
  header: {
    height: 200,
    backgroundColor: "#f59e0b",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f59e0b",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  profileImageContainer: {
    position: "absolute",
    bottom: -60,
    alignSelf: "center",
    zIndex: 10,
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
    bottom: 10,
    right: 10,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  content: {
    padding: 20,
    paddingTop: 80,
  },
  nameContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
    fontFamily: "System"
  },
  role: {
    fontSize: 16,
    color: "#f59e0b",
    fontWeight: "600",
    backgroundColor: "#FFF5F0",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8EAED",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 6,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  locationTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  locationText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginLeft: 10,
    flex: 1,
  },
  cardContent: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f59e0b",
    marginRight: 12,
  },
  scheduleDay: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    width: 100,
  },
  scheduleTime: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  certificateItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  certIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF5F0",
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
    color: "#333",
    marginBottom: 2,
  },
  certBody: {
    fontSize: 13,
    color: "#666",
  },
  experienceItem: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  experienceYears: {
    backgroundColor: "#FFF5F0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  yearsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f59e0b",
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  companyText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  reviewCount: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  reviewCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  reviewItem: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
  },
  starsContainer: {
    flexDirection: "row",
  },
  reviewMessage: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  feedbackButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  feedbackButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
    marginLeft: 8,
  },
  hireButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f59e0b",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  hireButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
});