import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,

} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkersScreen() {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrorIds, setImageErrorIds] = useState({});
  const [searchText, setSearchText] = useState("");

  const router = useRouter();
  const { jwtToken } = useAuth();

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      const res = await axios.get("http://10.210.141.97:8080/worker", {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      setWorkers(res.data);
      setFilteredWorkers(res.data); // initial filtered list
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  //  Filter workers based on search text
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredWorkers(workers);
    } else {
      const filtered = workers.filter((worker) =>
        worker.fullName.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredWorkers(filtered);
    }
  }, [searchText, workers]);

  const renderAvatar = (worker) => {
    const hasImage = worker.user?.imageUrl && !imageErrorIds[worker.id];

    if (hasImage) {
      return (
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: worker.user.imageUrl }}
            style={styles.avatar}
            onError={() =>
              setImageErrorIds((prev) => ({ ...prev, [worker.id]: true }))
            }
          />
          <View style={[
            styles.statusIndicator,
            worker.status === "Free" ? styles.indicatorFree : styles.indicatorBusy
          ]} />
        </View>
      );
    }

    const initial = worker.fullName ? worker.fullName.charAt(0).toUpperCase() : "?";

    return (
      <View style={styles.fallbackAvatarContainer}>
        <View style={styles.fallbackAvatar}>
          <Text style={styles.initial}>{initial}</Text>
        </View>
        <View style={[
          styles.statusIndicator,
          worker.status === "Free" ? styles.indicatorFree : styles.indicatorBusy
        ]} />
      </View>
    );
  };

  const renderWorker = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[
          styles.statusBadge,
          item.status === "Free" ? styles.badgeFree : styles.badgeBusy
        ]}>
          <Ionicons
            name={item.status === "Free" ? "checkmark-circle" : "time"}
            size={12}
            color={item.status === "Free" ? "#10b981" : "#ef4444"}
          />
          <Text style={[
            styles.status,
            item.status === "Free" ? styles.free : styles.busy
          ]}>
            {item.status}
          </Text>
        </View>
      </View>

      {renderAvatar(item)}

      <View style={styles.profileInfo}>
        <Text style={styles.name}>{item.fullName}</Text>
        <View style={styles.roleContainer}>
          <MaterialIcons name="work" size={16} color="#f59e0b" />
          <Text style={styles.role}>{item.jobRole}</Text>
        </View>
        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={16} color="#64748b" />
          <Text style={styles.location} numberOfLines={1}>
            {item.preferredServiceLocation}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push(`/worker/${item.id}`)}
        >
          <FontAwesome name="user" size={14} color="#64748b" />
          <Text style={styles.secondaryText}>View Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push(`/hire/${item.id}`)}
        >
          <MaterialIcons name="work-outline" size={14} color="#fff" />
          <Text style={styles.btnText}>Hire Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.loadingText}>Loading workers...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
     
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Find Workers</Text>
            <Text style={styles.headerSubtitle}>
              {filteredWorkers.length} professionals available
            </Text>
          </View>

          {/*  Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              placeholder="Search workers by name..."
              placeholderTextColor="#94a3b8"
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Results Info */}
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsText}>
              Showing {filteredWorkers.length} workers
            </Text>
          </View>

          <FlatList
            data={filteredWorkers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderWorker}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={60} color="#e2e8f0" />
                <Text style={styles.emptyTitle}>No workers found</Text>
                <Text style={styles.emptyText}>
                  {searchText ? "Try a different search term" : "No workers available"}
                </Text>
              </View>
            }
          />
        </View>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loaderContainer: {
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  resultsInfo: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeader: {
    marginBottom: 16,
    alignItems: "flex-end",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeFree: {
    backgroundColor: "#f0fdf4",
  },
  badgeBusy: {
    backgroundColor: "#fef2f2",
  },
  status: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
  free: {
    color: "#16a34a",
  },
  busy: {
    color: "#dc2626",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  fallbackAvatarContainer: {
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  fallbackAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#fff",
  },
  indicatorFree: {
    backgroundColor: "#10b981",
  },
  indicatorBusy: {
    backgroundColor: "#ef4444",
  },
  initial: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 6,
    textAlign: "center",
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff7ed",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  role: {
    color: "#f59e0b",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 6,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f59e0b",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 6,
  },
  secondaryText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#64748b",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
});