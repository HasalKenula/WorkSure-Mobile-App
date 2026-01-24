
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Modal,
//   Pressable,
//   StyleSheet,
//   ActivityIndicator,
//   ScrollView,
//   Image,
//   Dimensions,
//   StatusBar,
// } from "react-native";
// import Toast from "react-native-toast-message";
// import { useRouter } from "expo-router";
// import { useAuth } from "../../context/AuthContext";
// import api from "../services/api";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   Ionicons,
//   MaterialIcons,
//   FontAwesome,
//   MaterialCommunityIcons,
//   Feather,
// } from "@expo/vector-icons";

// const { width } = Dimensions.get('window');

// export default function WorkerDashboardScreen() {
//   const [modalVisible, setModalVisible] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [worker, setWorker] = useState(null);
//   const [payment, setPayment] = useState(null);
//   const [stats, setStats] = useState({
//     totalJobs: 0,
//     completedJobs: 0,
//     earnings: 0,
//     rating: 0,
//   });

//   const router = useRouter();
//   const { jwtToken, isAuthenticated, user } = useAuth();

//   const config = {
//     headers: {
//       Authorization: `Bearer ${jwtToken}`,
//     },
//   };

//   // Load logged user
//   useEffect(() => {
//     if (!jwtToken) return;

//     setLoading(true);
//     api
//       .get("/user", config)
//       .then((res) => {
//         setUserId(res.data.id);
//         // Also fetch worker stats if available
//         fetchWorkerStats(res.data.id);
//       })
//       .catch(() => { })
//       .finally(() => setLoading(false));
//   }, [jwtToken]);

//   // Load worker + payment
//   useEffect(() => {
//     if (isAuthenticated && userId) {
//       fetchWorker();
//       fetchPayment();
//     }
//   }, [isAuthenticated, userId]);

//   const fetchWorker = async () => {
//     try {
//       const res = await api.get(`/worker/${userId}`, config);
//       setWorker(res.data);
//     } catch {
//       setWorker(null);
//     }
//   };

//   const fetchPayment = async () => {
//     try {
//       const res = await api.get(`/payment/${userId}`, config);
//       setPayment(res.data);
//     } catch {
//       setPayment(null);
//     }
//   };

//   const fetchWorkerStats = async (id) => {
//     try {
//       const res = await api.get(`/worker/${id}/stats`, config);
//       setStats(res.data);
//     } catch {
//       // If stats endpoint doesn't exist, use default values
//     }
//   };

//   // Button handlers
//   const handleRegister = () => {
//     if (worker && payment) {
//       Toast.show({
//         type: "info",
//         text1: "Already Registered",
//         text2: "You are already registered as a worker",
//       });
//     } else if (worker) {
//       router.push("/planUpgradePage");
//     } else {
//       router.push("/workerRegistration");
//     }
//     setModalVisible(false);
//   };

//   const handleProfile = () => {
//     if (!worker && !payment) {
//       Toast.show({
//         type: "error",
//         text1: "Registration Required",
//         text2: "Please register first to view profile"
//       });
//       return;
//     }
//     if (worker?.isBlocked) {
//       Toast.show({
//         type: "error",
//         text1: "Account Blocked",
//         text2: "Your worker account has been blocked"
//       });
//       return;
//     }
//     router.push("/workerProfile");
//     setModalVisible(false);
//   };

//   const handleProfileUpdate = () => {
//     if (!worker && !payment) {
//       Toast.show({
//         type: "error",
//         text1: "Registration Required",
//         text2: "Please register first to update profile"
//       });
//       return;
//     }
//     if (worker?.isBlocked) {
//       Toast.show({
//         type: "error",
//         text1: "Account Blocked",
//         text2: "Your worker account has been blocked"
//       });
//       return;
//     }
//     router.push("/workerProfileUpdate");
//     setModalVisible(false);
//   };

//   const handleBankDetails = () => {
//     if (!worker && !payment) {
//       Toast.show({
//         type: "error",
//         text1: "Registration Required",
//         text2: "Please register first to add payment details"
//       });
//       return;
//     }
//     if (worker?.isBlocked) {
//       Toast.show({
//         type: "error",
//         text1: "Account Blocked",
//         text2: "Cannot add payment details while account is blocked",
//       });
//       return;
//     }
//     router.push("/bank");
//     setModalVisible(false);
//   };

//   const handleJobRequests = () => {
//     if (!worker && !payment) {
//       Toast.show({
//         type: "error",
//         text1: "Registration Required",
//       });
//       return;
//     }
//     router.push("/jobRequests");
//     setModalVisible(false);
//   };

//   const handleMyJobs = () => {
//     if (!worker && !payment) {
//       Toast.show({
//         type: "error",
//         text1: "Registration Required",
//       });
//       return;
//     }
//     router.push("/myJobs");
//     setModalVisible(false);
//   };

//   const getRegistrationStatus = () => {
//     if (!worker && !payment) return "Not Registered";
//     if (worker && !payment) return "Registered (No Payment)";
//     if (worker && payment) return "Active Worker";
//     return "Unknown";
//   };

//   const getStatusColor = () => {
//     if (!worker && !payment) return "#ef4444";
//     if (worker && !payment) return "#f59e0b";
//     if (worker && payment) return "#22c55e";
//     return "#64748b";
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

//       {/* Header Section */}
//       <View style={styles.header}>
//         <View style={styles.headerContent}>
//           <View>
//             <Text style={styles.greeting}>Welcome back,</Text>
//             <Text style={styles.userName}>{worker?.user?.name || "Worker"}</Text>
//             <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
//               <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
//               <Text style={[styles.statusText, { color: getStatusColor() }]}>
//                 {getRegistrationStatus()}
//               </Text>
//             </View>
//           </View>
//           <Pressable
//             style={styles.profileIcon}
//             onPress={() => router.push("/profile")}
//           >
//             <Image
//               source={
//                 worker?.user?.imageUrl
//                   ? { uri: worker.user.imageUrl }
//                   : require("../../assets/default-user.png")
//               }
//               style={styles.profileImage}
//             />
//           </Pressable>

//         </View>
//       </View>

//       {/* Stats Cards Section */}
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         style={styles.statsContainer}
//       >
//         <View style={styles.statCard}>
//           <View style={[styles.statIcon, { backgroundColor: '#e0f2fe' }]}>
//             <MaterialIcons name="work" size={24} color="#0ea5e9" />
//           </View>
//           <Text style={styles.statNumber}>{stats.totalJobs}</Text>
//           <Text style={styles.statLabel}>Total Jobs</Text>
//         </View>

//         <View style={styles.statCard}>
//           <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
//             <MaterialIcons name="done-all" size={24} color="#22c55e" />
//           </View>
//           <Text style={styles.statNumber}>{stats.completedJobs}</Text>
//           <Text style={styles.statLabel}>Completed</Text>
//         </View>

//         <View style={styles.statCard}>
//           <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
//             <FontAwesome name="money" size={22} color="#f59e0b" />
//           </View>
//           <Text style={styles.statNumber}>Rs.{stats.earnings}</Text>
//           <Text style={styles.statLabel}>Earnings</Text>
//         </View>

//         <View style={styles.statCard}>
//           <View style={[styles.statIcon, { backgroundColor: '#f3e8ff' }]}>
//             <MaterialIcons name="star" size={24} color="#a855f7" />
//           </View>
//           <Text style={styles.statNumber}>{stats.rating || "N/A"}</Text>
//           <Text style={styles.statLabel}>Rating</Text>
//         </View>
//       </ScrollView>

//       {/* Quick Actions Grid */}
//       <View style={styles.actionsContainer}>
//         <Text style={styles.sectionTitle}>Quick Actions</Text>
//         <View style={styles.actionsGrid}>
//           <Pressable
//             style={styles.actionCard}
//             onPress={handleJobRequests}
//           >
//             <View style={[styles.actionIcon, { backgroundColor: '#3b82f6' }]}>
//               <MaterialIcons name="request-quote" size={28} color="#fff" />
//             </View>
//             <Text style={styles.actionText}>Job Requests</Text>
//           </Pressable>

//           <Pressable
//             style={styles.actionCard}
//             onPress={handleMyJobs}
//           >
//             <View style={[styles.actionIcon, { backgroundColor: '#10b981' }]}>
//               <MaterialCommunityIcons name="briefcase-check" size={28} color="#fff" />
//             </View>
//             <Text style={styles.actionText}>My Jobs</Text>
//           </Pressable>

//           <Pressable
//             style={styles.actionCard}
//             onPress={() => setModalVisible(true)}
//           >
//             <View style={[styles.actionIcon, { backgroundColor: '#f59e0b' }]}>
//               <MaterialIcons name="settings" size={28} color="#fff" />
//             </View>
//             <Text style={styles.actionText}>Worker Settings</Text>
//           </Pressable>

//           <Pressable
//             style={styles.actionCard}
//             onPress={() => router.push("/support")}
//           >
//             <View style={[styles.actionIcon, { backgroundColor: '#8b5cf6' }]}>
//               <Ionicons name="headset" size={28} color="#fff" />
//             </View>
//             <Text style={styles.actionText}>Support</Text>
//           </Pressable>
//         </View>
//       </View>

//       {/* Main Worker Panel Button */}
//       <View style={styles.mainPanelContainer}>
//         <Pressable
//           style={styles.mainPanelButton}
//           onPress={() => setModalVisible(true)}
//         >
//           <View style={styles.mainPanelContent}>
//             <View style={styles.mainPanelIcon}>
//               <MaterialIcons name="engineering" size={32} color="#fff" />
//             </View>
//             <View style={styles.mainPanelText}>
//               <Text style={styles.mainPanelTitle}>Worker Panel</Text>
//               <Text style={styles.mainPanelSubtitle}>
//                 Manage your worker account and settings
//               </Text>
//             </View>
//             <MaterialIcons name="chevron-right" size={28} color="#fff" />
//           </View>
//         </Pressable>
//       </View>

//       {/* Recent Activity Section */}
//       <View style={styles.activityContainer}>
//         <Text style={styles.sectionTitle}>Recent Activity</Text>
//         {worker ? (
//           <View style={styles.activityCard}>
//             <View style={styles.activityItem}>
//               <View style={styles.activityIcon}>
//                 <Feather name="clock" size={20} color="#3b82f6" />
//               </View>
//               <View style={styles.activityContent}>
//                 <Text style={styles.activityTitle}>Profile Status</Text>
//                 <Text style={styles.activityText}>
//                   {worker.verified ? "Verified Worker" : "Pending Verification"}
//                 </Text>
//               </View>
//               <Text style={styles.activityTime}>Now</Text>
//             </View>

//             {payment && (
//               <View style={styles.activityItem}>
//                 <View style={styles.activityIcon}>
//                   <FontAwesome name="credit-card" size={18} color="#22c55e" />
//                 </View>
//                 <View style={styles.activityContent}>
//                   <Text style={styles.activityTitle}>Payment Setup</Text>
//                   <Text style={styles.activityText}>
//                     {payment.status === 'ACTIVE' ? 'Active' : 'Pending'}
//                   </Text>
//                 </View>
//                 <Text style={styles.activityTime}>Now</Text>
//               </View>
//             )}
//           </View>
//         ) : (
//           <View style={styles.emptyCard}>
//             <MaterialIcons name="info" size={40} color="#94a3b8" />
//             <Text style={styles.emptyText}>No worker activity yet</Text>
//             <Text style={styles.emptySubtext}>
//               Register as a worker to start receiving job requests
//             </Text>
//           </View>
//         )}
//       </View>

//       {/* Modal */}
//       <Modal
//         animationType="slide"
//         transparent
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Worker Management</Text>
//               <Text style={styles.modalSubtitle}>Choose an option</Text>
//             </View>

//             {loading && <ActivityIndicator size="large" color="#f59e0b" style={{ marginVertical: 20 }} />}

//             <ScrollView style={styles.modalOptions}>
//               <Pressable style={styles.optionButton} onPress={handleRegister}>
//                 <View style={[styles.optionIcon, { backgroundColor: '#22c55e' }]}>
//                   <MaterialIcons name="app-registration" size={24} color="#fff" />
//                 </View>
//                 <View style={styles.optionContent}>
//                   <Text style={styles.optionTitle}>Registration</Text>
//                   <Text style={styles.optionDescription}>
//                     Register as a worker or upgrade your plan
//                   </Text>
//                 </View>
//                 <MaterialIcons name="chevron-right" size={24} color="#64748b" />
//               </Pressable>

//               <Pressable style={styles.optionButton} onPress={handleProfile}>
//                 <View style={[styles.optionIcon, { backgroundColor: '#3b82f6' }]}>
//                   <Ionicons name="person" size={24} color="#fff" />
//                 </View>
//                 <View style={styles.optionContent}>
//                   <Text style={styles.optionTitle}>View Profile</Text>
//                   <Text style={styles.optionDescription}>
//                     View your worker profile
//                   </Text>
//                 </View>
//                 <MaterialIcons name="chevron-right" size={24} color="#64748b" />
//               </Pressable>

//               <Pressable style={styles.optionButton} onPress={handleProfileUpdate}>
//                 <View style={[styles.optionIcon, { backgroundColor: '#f59e0b' }]}>
//                   <MaterialIcons name="edit" size={24} color="#fff" />
//                 </View>
//                 <View style={styles.optionContent}>
//                   <Text style={styles.optionTitle}>Update Profile</Text>
//                   <Text style={styles.optionDescription}>
//                     Update your profile information
//                   </Text>
//                 </View>
//                 <MaterialIcons name="chevron-right" size={24} color="#64748b" />
//               </Pressable>

//               <Pressable style={styles.optionButton} onPress={handleBankDetails}>
//                 <View style={[styles.optionIcon, { backgroundColor: '#ef4444' }]}>
//                   <MaterialIcons name="account-balance" size={24} color="#fff" />
//                 </View>
//                 <View style={styles.optionContent}>
//                   <Text style={styles.optionTitle}>Payment Details</Text>
//                   <Text style={styles.optionDescription}>
//                     Add or update bank details
//                   </Text>
//                 </View>
//                 <MaterialIcons name="chevron-right" size={24} color="#64748b" />
//               </Pressable>
//             </ScrollView>

//             <Pressable
//               style={styles.modalCloseButton}
//               onPress={() => setModalVisible(false)}
//             >
//               <Text style={styles.modalCloseText}>Close</Text>
//             </Pressable>
//           </View>
//         </View>
//       </Modal>

//       <Toast />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8fafc",
//   },
//   header: {
//     backgroundColor: "#fff",
//     paddingTop: 20,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 25,
//     borderBottomRightRadius: 25,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   headerContent: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   greeting: {
//     fontSize: 16,
//     color: "#64748b",
//     marginBottom: 4,
//   },
//   userName: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#1e293b",
//     marginBottom: 8,
//   },
//   statusBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     alignSelf: "flex-start",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   statusDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginRight: 6,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   profileIcon: {
//     padding: 8,
//   },
//   statsContainer: {
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 10,
//   },
//   statCard: {
//     width: 140,
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//     marginRight: 12,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   statIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   statNumber: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#1e293b",
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontSize: 14,
//     color: "#64748b",
//     fontWeight: "500",
//   },
//   actionsContainer: {
//     paddingHorizontal: 20,
//     paddingTop: 20,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#1e293b",
//     marginBottom: 16,
//   },
//   actionsGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },
//   actionCard: {
//     width: (width - 60) / 2,
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 12,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   actionIcon: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   actionText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#1e293b",
//     textAlign: "center",
//   },
//   mainPanelContainer: {
//     paddingHorizontal: 20,
//     paddingTop: 20,
//   },
//   mainPanelButton: {
//     backgroundColor: "#f59e0b",
//     borderRadius: 16,
//     padding: 20,
//     shadowColor: "#f59e0b",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   mainPanelContent: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   mainPanelIcon: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 16,
//   },
//   mainPanelText: {
//     flex: 1,
//   },
//   mainPanelTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 4,
//   },
//   mainPanelSubtitle: {
//     fontSize: 14,
//     color: "rgba(255, 255, 255, 0.9)",
//   },
//   activityContainer: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 20,
//   },
//   activityCard: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   activityItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   activityIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#f8fafc",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   activityContent: {
//     flex: 1,
//   },
//   activityTitle: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#1e293b",
//     marginBottom: 2,
//   },
//   activityText: {
//     fontSize: 14,
//     color: "#64748b",
//   },
//   activityTime: {
//     fontSize: 12,
//     color: "#94a3b8",
//   },
//   emptyCard: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 40,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   emptyText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#1e293b",
//     marginTop: 12,
//     marginBottom: 4,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: "#64748b",
//     textAlign: "center",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "flex-end",
//   },
//   modalContainer: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 25,
//     borderTopRightRadius: 25,
//     maxHeight: "80%",
//   },
//   modalHeader: {
//     padding: 25,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f1f5f9",
//   },
//   modalTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#1e293b",
//     marginBottom: 4,
//   },
//   modalSubtitle: {
//     fontSize: 16,
//     color: "#64748b",
//   },
//   modalOptions: {
//     padding: 20,
//   },
//   optionButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#f1f5f9",
//   },
//   optionIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 16,
//   },
//   optionContent: {
//     flex: 1,
//   },
//   optionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#1e293b",
//     marginBottom: 4,
//   },
//   optionDescription: {
//     fontSize: 14,
//     color: "#64748b",
//   },
//   modalCloseButton: {
//     backgroundColor: "#f8fafc",
//     padding: 20,
//     alignItems: "center",
//     borderTopWidth: 1,
//     borderTopColor: "#f1f5f9",
//   },
//   modalCloseText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#64748b",
//   },
//   profileImage: {
//   width: 50,
//   height: 50,
//   borderRadius: 25,
//   borderWidth: 2,
//   borderColor: "#f59e0b",
// },

// });



import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
} from "react-native";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import api from "../services/api";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";

const { width } = Dimensions.get('window');

export default function WorkerDashboardScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [worker, setWorker] = useState(null);
  const [payment, setPayment] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    earnings: 0,
    rating: 0,
  });

  const router = useRouter();
  const { jwtToken, isAuthenticated, user } = useAuth();

  const config = {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  };

  // Load logged user
  useEffect(() => {
    if (!jwtToken) return;

    setLoading(true);
    api
      .get("/user", config)
      .then((res) => {
        setUserId(res.data.id);
        // Also fetch worker stats if available
        fetchWorkerStats(res.data.id);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [jwtToken]);

  // Load worker + payment
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchWorker();
      fetchPayment();
    }
  }, [isAuthenticated, userId]);

  const fetchWorker = async () => {
    try {
      const res = await api.get(`/worker/${userId}`, config);
      setWorker(res.data);
    } catch {
      setWorker(null);
    }
  };

  const fetchPayment = async () => {
    try {
      const res = await api.get(`/payment/${userId}`, config);
      setPayment(res.data);
    } catch {
      setPayment(null);
    }
  };

  const fetchWorkerStats = async (id) => {
    try {
      const res = await api.get(`/worker/${id}/stats`, config);
      setStats(res.data);
    } catch {
      // If stats endpoint doesn't exist, use default values
    }
  };

  // Button handlers
  const handleRegister = () => {
    if (worker && payment) {
      Toast.show({
        type: "info",
        text1: "Already Registered",
        text2: "You are already registered as a worker",
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
      Toast.show({
        type: "error",
        text1: "Registration Required",
        text2: "Please register first to view profile"
      });
      return;
    }
    if (worker?.isBlocked) {
      Toast.show({
        type: "error",
        text1: "Account Blocked",
        text2: "Your worker account has been blocked"
      });
      return;
    }
    router.push("/workerProfile");
    setModalVisible(false);
  };

  const handleProfileUpdate = () => {
    if (!worker && !payment) {
      Toast.show({
        type: "error",
        text1: "Registration Required",
        text2: "Please register first to update profile"
      });
      return;
    }
    if (worker?.isBlocked) {
      Toast.show({
        type: "error",
        text1: "Account Blocked",
        text2: "Your worker account has been blocked"
      });
      return;
    }
    router.push("/workerProfileUpdate");
    setModalVisible(false);
  };

  const handleBankDetails = () => {
    if (!worker && !payment) {
      Toast.show({
        type: "error",
        text1: "Registration Required",
        text2: "Please register first to add payment details"
      });
      return;
    }
    if (worker?.isBlocked) {
      Toast.show({
        type: "error",
        text1: "Account Blocked",
        text2: "Cannot add payment details while account is blocked",
      });
      return;
    }
    router.push("/bank");
    setModalVisible(false);
  };

  const handleJobRequests = () => {
    if (!worker && !payment) {
      Toast.show({
        type: "error",
        text1: "Registration Required",
      });
      return;
    }
    router.push("/workerDashboard");
    setModalVisible(false);
  };

  const handleMyJobs = () => {
    if (!worker && !payment) {
      Toast.show({
        type: "error",
        text1: "Registration Required",
      });
      return;
    }
    router.push("/workerDashboard");
    setModalVisible(false);
  };

  const getRegistrationStatus = () => {
    if (!worker && !payment) return "Not Registered";
    if (worker && !payment) return "Registered (No Payment)";
    if (worker && payment) return "Active Worker";
    return "Unknown";
  };

  const getStatusColor = () => {
    if (!worker && !payment) return "#ef4444";
    if (worker && !payment) return "#f59e0b";
    if (worker && payment) return "#22c55e";
    return "#64748b";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Main ScrollView that wraps the entire content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Welcome to Worker Panel,</Text>
              <Text style={styles.userName}>{worker?.user?.name || user?.name || "Worker"}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  {getRegistrationStatus()}
                </Text>
              </View>
            </View>
            <Pressable
              style={styles.profileIcon}
              onPress={() => router.push("/profile")}
            >
              <Image
                source={
                  worker?.user?.imageUrl
                    ? { uri: worker.user.imageUrl }
                    : user?.imageUrl
                    ? { uri: user.imageUrl }
                    : require("../../assets/default-user.png")
                }
                style={styles.profileImage}
              />
            </Pressable>
          </View>
        </View>

        {/* Stats Cards Section */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsContainer}
        >
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#e0f2fe' }]}>
              <MaterialIcons name="work" size={24} color="#0ea5e9" />
            </View>
            <Text style={styles.statNumber}>{stats.totalJobs}</Text>
            <Text style={styles.statLabel}>Total Jobs</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
              <MaterialIcons name="done-all" size={24} color="#22c55e" />
            </View>
            <Text style={styles.statNumber}>{stats.completedJobs}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
              <FontAwesome name="money" size={22} color="#f59e0b" />
            </View>
            <Text style={styles.statNumber}>Rs.{stats.earnings.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#f3e8ff' }]}>
              <MaterialIcons name="star" size={24} color="#a855f7" />
            </View>
            <Text style={styles.statNumber}>{stats.rating || "N/A"}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </ScrollView>

        {/* Quick Actions Grid */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Pressable
              style={styles.actionCard}
              onPress={handleJobRequests}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#3b82f6' }]}>
                <MaterialIcons name="request-quote" size={28} color="#fff" />
              </View>
              <Text style={styles.actionText}>Job Requests</Text>
            </Pressable>

            <Pressable
              style={styles.actionCard}
              onPress={handleMyJobs}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#10b981' }]}>
                <MaterialCommunityIcons name="briefcase-check" size={28} color="#fff" />
              </View>
              <Text style={styles.actionText}>My Jobs</Text>
            </Pressable>       
          </View>
        </View>

        {/* Main Worker Panel Button */}
        <View style={styles.mainPanelContainer}>
          <Pressable
            style={styles.mainPanelButton}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.mainPanelContent}>
              <View style={styles.mainPanelIcon}>
                <MaterialIcons name="engineering" size={32} color="#fff" />
              </View>
              <View style={styles.mainPanelText}>
                <Text style={styles.mainPanelTitle}>Worker Panel</Text>
                <Text style={styles.mainPanelSubtitle}>
                  Manage your worker account and settings
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={28} color="#fff" />
            </View>
          </Pressable>
        </View>


        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Worker Management</Text>
              <Text style={styles.modalSubtitle}>Choose an option</Text>
            </View>

            {loading && <ActivityIndicator size="large" color="#f59e0b" style={{ marginVertical: 20 }} />}

            <ScrollView style={styles.modalOptions}>
              <Pressable style={styles.optionButton} onPress={handleRegister}>
                <View style={[styles.optionIcon, { backgroundColor: '#22c55e' }]}>
                  <MaterialIcons name="app-registration" size={24} color="#fff" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Registration</Text>
                  <Text style={styles.optionDescription}>
                    Register as a worker or upgrade your plan
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#64748b" />
              </Pressable>

              <Pressable style={styles.optionButton} onPress={handleProfile}>
                <View style={[styles.optionIcon, { backgroundColor: '#3b82f6' }]}>
                  <Ionicons name="person" size={24} color="#fff" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>View Profile</Text>
                  <Text style={styles.optionDescription}>
                    View your worker profile
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#64748b" />
              </Pressable>

              <Pressable style={styles.optionButton} onPress={handleProfileUpdate}>
                <View style={[styles.optionIcon, { backgroundColor: '#f59e0b' }]}>
                  <MaterialIcons name="edit" size={24} color="#fff" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Update Profile</Text>
                  <Text style={styles.optionDescription}>
                    Update your profile information
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#64748b" />
              </Pressable>

              <Pressable style={styles.optionButton} onPress={handleBankDetails}>
                <View style={[styles.optionIcon, { backgroundColor: '#ef4444' }]}>
                  <MaterialIcons name="account-balance" size={24} color="#fff" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Payment Details</Text>
                  <Text style={styles.optionDescription}>
                    Add or update bank details
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#64748b" />
              </Pressable>
            </ScrollView>

            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
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
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingBottom: 30, // Add padding at the bottom for better scrolling
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  profileIcon: {
    padding: 8,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#f59e0b",
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  statCard: {
    width: 140,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginRight: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: (width - 60) / 2,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
  },
  mainPanelContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mainPanelButton: {
    backgroundColor: "#f59e0b",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  mainPanelContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  mainPanelIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  mainPanelText: {
    flex: 1,
  },
  mainPanelTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  mainPanelSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  activityContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40, // Extra padding at bottom
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  activityText: {
    fontSize: 14,
    color: "#64748b",
  },
  activityTime: {
    fontSize: 12,
    color: "#94a3b8",
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "80%",
  },
  modalHeader: {
    padding: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#64748b",
  },
  modalOptions: {
    padding: 20,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#64748b",
  },
  modalCloseButton: {
    backgroundColor: "#f8fafc",
    padding: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
  },
  bottomSpacing: {
    height: 20,
  },
});