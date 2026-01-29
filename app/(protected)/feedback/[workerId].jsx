import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import api from "../../services/api";

export default function FeedbackScreen() {
  const router = useRouter();
  const { workerId } = useLocalSearchParams();
  const { jwtToken } = useAuth();

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Fetch logged user ID (same as web app)
  React.useEffect(() => {
    if (!jwtToken) return;

    api
      .get("/user", {
        headers: { Authorization: `Bearer ${jwtToken}` },
      })
      .then((res) => setUserId(res.data.id))
      .catch((err) => {
        console.error("Failed to fetch user:", err);
        Alert.alert("Error", "Could not fetch user information");
      });
  }, [jwtToken]);

  const submitFeedback = async () => {
    if (!jwtToken || !userId) {
      Alert.alert("Error", "Please log in to submit feedback");
      return;
    }
    if (rating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }
    if (feedback.trim().length === 0) {
      Alert.alert("Error", "Please write your feedback");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: userId,
        workerId: parseInt(workerId),
        rating: rating,
        feedback: feedback.trim(),
      };

      await api.post("/rating", payload, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      Alert.alert("Success", "Feedback submitted successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      console.log("Error submitting feedback:", err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to submit feedback"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Feedback</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Rating Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rate this Worker</Text>
              <Text style={styles.sectionSubtitle}>
                How would you rate your experience?
              </Text>

              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <FontAwesome
                      name="star"
                      size={50}
                      color={star <= rating ? "#FFD700" : "#E0E0E0"}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {rating > 0 && (
                <Text style={styles.ratingDisplay}>
                  You rated: <Text style={styles.ratingValue}>{rating} out of 5 stars</Text>
                </Text>
              )}
            </View>

            {/* Feedback Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Feedback</Text>
              <Text style={styles.sectionSubtitle}>
                Share your experience with this worker
              </Text>

              <TextInput
                style={styles.textInput}
                placeholder="Write your feedback here... (min 10 characters)"
                placeholderTextColor="#AAA"
                multiline={true}
                numberOfLines={5}
                value={feedback}
                onChangeText={setFeedback}
                textAlignVertical="top"
              />

              <Text style={styles.charCount}>
                {feedback.length} characters
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (rating === 0 || feedback.trim().length === 0) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={submitFeedback}
              disabled={loading || rating === 0 || feedback.trim().length === 0}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text style={styles.submitButtonText}>Submit Feedback</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#f59e0b" />
              <Text style={styles.infoText}>
                Your feedback is important and will help other users make informed decisions.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#fff",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  starButton: {
    paddingHorizontal: 10,
  },
  ratingDisplay: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginTop: 12,
    fontWeight: "500",
  },
  ratingValue: {
    color: "#f59e0b",
    fontWeight: "bold",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#F8F9FA",
    height: 140,
    fontFamily: "System",
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    textAlign: "right",
  },
  submitButton: {
    backgroundColor: "#f59e0b",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#CCC",
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF5F0",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFE0CC",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    marginLeft: 12,
    lineHeight: 20,
  },
});