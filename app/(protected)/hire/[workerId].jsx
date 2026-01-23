import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { Ionicons, MaterialIcons, FontAwesome, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const API = "http://10.210.141.97:8080";

export default function WorkerHire() {
  const { workerId } = useLocalSearchParams();
  const { jwtToken } = useAuth();

  const [worker, setWorker] = useState(null);
  const [user, setUser] = useState(null);
  const [hires, setHires] = useState([]);
  const [myHires, setMyHires] = useState([]);

  const [selectedDate, setSelectedDate] = useState("");
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const config = {
    headers: { Authorization: `Bearer ${jwtToken}` },
  };

  /* ---------------- FETCH USER ---------------- */
  useEffect(() => {
    if (!jwtToken) return;

    axios
      .get(`${API}/user`, config)
      .then(res => setUser(res.data))
      .catch(err => console.log("User load error:", err));
  }, [jwtToken]);

  /* ---------------- FETCH WORKER ---------------- */
  useEffect(() => {
    if (!workerId) return;

    axios
      .get(`${API}/worker/id/${workerId}`, config)
      .then(res => setWorker(res.data))
      .catch(err => console.log("Worker load error:", err));
  }, [workerId]);

  /* ---------------- FETCH HIRES ---------------- */
  const loadHires = () => {
    if (!workerId) return;

    // Try different endpoints if 404 occurs
    const endpoints = [
      `${API}/hire/${workerId}`,
      `${API}/hire/worker/${workerId}`,
      `${API}/hire?workerId=${workerId}`
    ];

    let successful = false;

    const tryEndpoint = async (index = 0) => {
      if (index >= endpoints.length) {
        console.log("All endpoints failed for hires");
        setHires([]);
        setMyHires([]);
        return;
      }

      try {
        const res = await axios.get(endpoints[index], config);
        setHires(res.data || []);
        if (user?.id) {
          setMyHires(res.data.filter(h => h.user?.id === user.id));
        }
        successful = true;
        console.log(`Successfully loaded hires from: ${endpoints[index]}`);
      } catch (err) {
        console.log(`Endpoint failed: ${endpoints[index]} - ${err.message}`);
        if (err.response?.status === 404 && index < endpoints.length - 1) {
          tryEndpoint(index + 1);
        } else {
          setHires([]);
          setMyHires([]);
        }
      }
    };

    tryEndpoint(0);
  };

  useEffect(() => {
    if (workerId && user) {
      loadHires();
    }
  }, [workerId, user]);

  /* ---------------- CREATE HIRE ---------------- */
  async function createHire() {
    if (!selectedDate || !description.trim()) {
      return Alert.alert("Error", "Please select a date and enter a job description");
    }

    if (!user?.id) {
      return Alert.alert("Error", "User information not available");
    }

    setLoading(true);

    try {
      await axios.post(
        `${API}/hire`,
        {
          workerId,
          userId: user.id,
          bookingDate: selectedDate,
          bookingTime: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: description.trim(),
          isBooked: true,
          isPending: true,
          isOngoing: false,
          isComplete: false,
        },
        config
      );

      Alert.alert("Success", "Job request sent successfully!");
      setDescription("");
      loadHires();
    } catch (err) {
      console.log("Create hire error:", err.response?.data || err.message);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to send request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- BOOKED DATES ---------------- */
  const bookedDates = {};
  hires
    .filter(h => h.isBooked)
    .forEach(h => {
      bookedDates[h.bookingDate] = {
        marked: true,
        dotColor: "#ef4444",
        disabled: true,
      };
    });

  const today = new Date().toISOString().split('T')[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <Text style={styles.headerSubtitle}>Schedule your service with</Text>
        </View>

        {/* -------- WORKER CARD -------- */}
        {worker && (
          <View style={styles.workerCard}>
            <View style={styles.workerHeader}>
              <Image
                source={{
                  uri:
                    worker?.user?.imageUrl ||
                    "https://via.placeholder.com/150",
                }}
                style={styles.avatar}
              />
              <View style={styles.workerInfo}>
                <Text style={styles.name}>{worker?.fullName}</Text>
                <View style={styles.roleContainer}>
                  <MaterialIcons name="work" size={16} color="#f59e0b" />
                  <Text style={styles.role}>{worker?.jobRole}</Text>
                </View>
                <View style={styles.locationContainer}>
                  <Ionicons name="location-sharp" size={16} color="#64748b" />
                  <Text style={styles.location} numberOfLines={1}>
                    {worker?.preferredServiceLocation || "Location not specified"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Calendar Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>
          <View style={styles.calendarContainer}>
            <Calendar
              markedDates={{
                ...bookedDates,
                [selectedDate]: {
                  selected: true,
                  selectedColor: "#f59e0b",
                  selectedTextColor: "#fff",
                },
              }}
              onDayPress={day => setSelectedDate(day.dateString)}
              theme={{
                backgroundColor: '#fff',
                calendarBackground: '#fff',
                textSectionTitleColor: '#94a3b8',
                selectedDayBackgroundColor: '#f59e0b',
                selectedDayTextColor: '#fff',
                todayTextColor: '#f59e0b',
                dayTextColor: '#1e293b',
                textDisabledColor: '#cbd5e1',
                monthTextColor: '#1e293b',
                arrowColor: '#f59e0b',
              }}
              minDate={today}
              hideExtraDays={true}
              enableSwipeMonths={true}
            />
          </View>
        </View>

        {/* Time Picker Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Select Time</Text>
          </View>
          <Pressable
            style={styles.timePicker}
            onPress={() => setShowTimePicker(true)}
          >
            <View style={styles.timePickerContent}>
              <Feather name="clock" size={20} color="#64748b" />
              <Text style={styles.timeText}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#64748b" />
            </View>
          </Pressable>

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="spinner"
              onChange={(event, selected) => {
                setShowTimePicker(false);
                if (selected) setTime(selected);
              }}
            />
          )}
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="edit-3" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Job Description</Text>
          </View>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Describe the job in detail..."
              placeholderTextColor="#94a3b8"
              multiline
              value={description}
              onChangeText={setDescription}
              numberOfLines={4}
              maxLength={500}
            />
            <View style={styles.textAreaFooter}>
              <Text style={styles.charCount}>{description.length}/500</Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          style={[styles.submitButton, (!selectedDate || !description.trim() || loading) && styles.disabledButton]}
          onPress={createHire}
          disabled={!selectedDate || !description.trim() || loading}
        >
          <View style={styles.buttonContent}>
            <MaterialIcons name="send" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>
              {loading ? "Sending..." : "Send Job Request"}
            </Text>
          </View>
        </Pressable>

        {/* -------- MY REQUESTS -------- */}
        {myHires.length > 0 && (
          <View style={styles.requestsSection}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="history" size={24} color="#f59e0b" />
              <Text style={styles.sectionTitle}>Your Requests</Text>
              <View style={styles.requestCount}>
                <Text style={styles.requestCountText}>{myHires.length}</Text>
              </View>
            </View>

            {myHires.map((hire, index) => (
              <View key={index} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View>
                    <Text style={styles.requestDate}>{hire.bookingDate}</Text>
                    <Text style={styles.requestTime}>{hire.bookingTime}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    hire.isComplete ? styles.completeBadge :
                      hire.isOngoing ? styles.ongoingBadge :
                        hire.isPending ? styles.pendingBadge : styles.seenBadge
                  ]}>
                    <Text style={[
                      styles.statusText,
                      hire.isComplete ? { color: '#059669' } :
                        hire.isOngoing ? { color: '#2563eb' } :
                          hire.isPending ? { color: '#d97706' } : { color: '#4b5563' }
                    ]}>
                      {hire.isComplete ? "Completed" :
                        hire.isOngoing ? "Ongoing" :
                          hire.isPending ? "Pending" : "Seen"}
                    </Text>
                  </View>
                </View>

                {hire.description && (
                  <Text style={styles.requestDescription} numberOfLines={2}>
                    {hire.description}
                  </Text>
                )}

                <View style={styles.requestFooter}>
                  <View style={styles.statusRow}>
                    <View style={styles.statusItem}>
                      <Ionicons name="checkmark-circle" size={16} color={hire.isBooked ? "#10b981" : "#94a3b8"} />
                      <Text style={styles.statusLabel}>Booked</Text>
                    </View>
                    <View style={styles.statusItem}>
                      <Ionicons name="time" size={16} color={hire.isPending ? "#f59e0b" : "#94a3b8"} />
                      <Text style={styles.statusLabel}>Pending</Text>
                    </View>
                    <View style={styles.statusItem}>
                      <MaterialIcons name="work" size={16} color={hire.isOngoing ? "#3b82f6" : "#94a3b8"} />
                      <Text style={styles.statusLabel}>Ongoing</Text>
                    </View>
                    <View style={styles.statusItem}>
                      <MaterialIcons name="done-all" size={16} color={hire.isComplete ? "#10b981" : "#94a3b8"} />
                      <Text style={styles.statusLabel}>Complete</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Show message if no hires found */}
        {myHires.length === 0 && user && (
          <View style={styles.noRequestsSection}>
            <FontAwesome name="file-text-o" size={40} color="#e2e8f0" />
            <Text style={styles.noRequestsText}>No job requests yet</Text>
            <Text style={styles.noRequestsSubtext}>
              Your requests will appear here after booking
            </Text>
          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  workerCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  workerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  workerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff7ed",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  role: {
    color: "#f59e0b",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 4,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginLeft: 10,
  },
  calendarContainer: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  timePicker: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  timePickerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  timeText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
  textAreaContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  textArea: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    fontSize: 16,
    color: "#1e293b",
    textAlignVertical: "top",
    minHeight: 120,
  },
  textAreaFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  charCount: {
    fontSize: 12,
    color: "#94a3b8",
  },
  submitButton: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f59e0b",
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  requestsSection: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  requestCount: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  requestCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  requestCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  requestDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  requestTime: {
    fontSize: 14,
    color: "#64748b",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: "#fef3c7",
  },
  seenBadge: {
    backgroundColor: "#dbeafe",
  },
  ongoingBadge: {
    backgroundColor: "#dbeafe",
  },
  completeBadge: {
    backgroundColor: "#d1fae5",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  requestDescription: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 12,
  },
  requestFooter: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusItem: {
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 4,
  },
  noRequestsSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  
  noRequestsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
    marginBottom: 8,
  },
  noRequestsSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
});
