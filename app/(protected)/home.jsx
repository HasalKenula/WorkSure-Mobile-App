import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView,
  TextInput,
  FlatList,
  Dimensions
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import DefaultAvatar from "../../assets/default-user.png";
import api from "../services/api";
import Footer from "../components/Footer";

const { width } = Dimensions.get("window");

const SERVICES = [
  { id: 1, name: "Electricians", icon: "⚡", skill: "ELECTRICIAN" },
  { id: 2, name: "Plumbers", icon: "🔧", skill: "PLUMBER" },
  { id: 3, name: "Carpenters", icon: "🔨", skill: "CARPENTER" },
  { id: 4, name: "Painters", icon: "🎨", skill: "PAINTER" },
  { id: 5, name: "Masons", icon: "🧱", skill: "MASON" },
  { id: 6, name: "Welders", icon: "🔥", skill: "WELDERS" },
  { id: 7, name: "HVAC", icon: "💨", skill: "HVAC" },
  { id: 8, name: "Landscapers", icon: "🏡", skill: "LANDSCAPERS" },
  { id: 9, name: "Contractors", icon: "🏢", skill: "CONTRACTORS" },
  { id: 10, name: "Cleaners", icon: "🧹", skill: "CLEANER" },
];

const WHY_CHOOSE = [
  { id: 1, title: "Verified Workers", description: "All professionals thoroughly vetted and background-checked.", icon: "✓" },
  { id: 2, title: "Secure Payments", description: "Safe transactions protecting clients and workers.", icon: "🔒" },
  { id: 3, title: "Fast Response", description: "Quick booking and scheduling for your convenience.", icon: "⏱️" },
  { id: 4, title: "Transparent Reviews", description: "Real ratings and feedback from actual clients.", icon: "⭐" },
];

const HOW_IT_WORKS = [
  { id: 1, step: "1", title: "Search & Browse", description: "Find workers by skill, location, and ratings." },
  { id: 2, step: "2", title: "Book Service", description: "Choose your preferred professional and book directly." },
  { id: 3, step: "3", title: "Secure Payment", description: "Pay securely through WorkSure. Release after completion." },
];

export default function HomeScreen() {
  const { logout, jwtToken } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (!jwtToken) {
      setLoading(false);
      return;
    }
    fetchUser();
  }, [jwtToken]);

  const fetchUser = async () => {
    try {
      const res = await api.get("/user", {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      setUser(res.data);
    } catch (err) {
      console.log("Fetch user error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  const handleWorkerPanel = () => {
    router.push("/(protected)/workerPanel");
    setMenuOpen(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handleServicePress = (skill) => {
    router.push({
      pathname: "/(protected)/workers",
      params: { skill }
    });
  };

  if (loading) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color="#f59e0b" />
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WorkSure</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} style={styles.menuButton}>
            <Text style={styles.menuButtonText}>☰</Text>
          </TouchableOpacity>
          {menuOpen && (
            <View style={styles.menuDropdown}>
              {/* User Profile in Menu */}
              <View style={styles.menuUserSection}>
                <Image 
                  source={user?.imageUrl ? { uri: user.imageUrl } : DefaultAvatar} 
                  style={styles.menuUserAvatar} 
                />
                <View style={styles.menuUserInfo}>
                  <Text style={styles.menuUserName}>{user?.name || "User"}</Text>
                  <Text style={styles.menuUserEmail}>{user?.email || ""}</Text>
                </View>
              </View>
              
              <View style={styles.menuDivider} />
              
              <TouchableOpacity onPress={handleWorkerPanel} style={styles.menuItem}>
                <Text style={styles.menuItemText}>Worker Panel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={[styles.menuItem, styles.logoutItem]}>
                <Text style={styles.menuItemText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.contentContainer} 
        contentContainerStyle={styles.contentContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Your Trusted Partner for Every Service Need</Text>
            <Text style={styles.heroSubtitle}>
              Discover, Book, and Manage professional services with ease. Quality assured, every time.
            </Text>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for services..."
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            {/* Hero Buttons */}
            <View style={styles.heroButttonRow}>
              <TouchableOpacity style={styles.ctaButtonPrimary}>
                <Text style={styles.ctaButtonTextPrimary}>Get Started</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ctaButtonSecondary}>
                <Text style={styles.ctaButtonTextSecondary}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image 
            source={user?.imageUrl ? { uri: user.imageUrl } : DefaultAvatar} 
            style={styles.profileAvatar} 
          />
          {/* <Text style={styles.profileName}>{user?.name || "User"}</Text>
          <Text style={styles.profileEmail}>{user?.email || ""}</Text> */}
        </View>

        {/* Browse Services Section */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Browse All Services</Text>
          <Text style={styles.sectionSubtitle}>Explore professional workers across multiple service categories</Text>
          
          <View style={styles.servicesGrid}>
            {SERVICES.map((service) => (
              <TouchableOpacity 
                key={service.id}
                style={styles.serviceCard}
                onPress={() => handleServicePress(service.skill)}
              >
                <View style={styles.serviceIconContainer}>
                  <Text style={styles.serviceIcon}>{service.icon}</Text>
                </View>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceSubtext}>Verified Professionals</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>View All Services</Text>
          </TouchableOpacity>
        </View>

        {/* Why Choose Section */}
        <View style={styles.whyChooseSection}>
          <Text style={styles.sectionTitle}>Why Choose WorkSure?</Text>
          <Text style={styles.sectionSubtitle}>We ensure quality, trust, and professional service</Text>
          
          <View style={styles.whyChooseGrid}>
            {WHY_CHOOSE.map((item) => (
              <View key={item.id} style={styles.whyChooseCard}>
                <Text style={styles.whyChooseIcon}>{item.icon}</Text>
                <Text style={styles.whyChooseTitle}>{item.title}</Text>
                <Text style={styles.whyChooseDescription}>{item.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* How It Works Section */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>How WorkSure Works</Text>
          <Text style={styles.sectionSubtitle}>Get professional work done in 3 simple steps</Text>
          
          <View style={styles.stepsContainer}>
            {HOW_IT_WORKS.map((item) => (
              <View key={item.id} style={styles.stepCard}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{item.step}</Text>
                </View>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDescription}>{item.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Simplify Your Service Search?</Text>
          <Text style={styles.ctaDescription}>
            Find reliable professionals, book with confidence, and get things done without stress.
          </Text>
          
          <View style={styles.ctaButtonsContainer}>
            <TouchableOpacity style={styles.ctaButtonDark}>
              <Text style={styles.ctaButtonDarkText}>Join WorkSure Today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaButtonYellow}>
              <Text style={styles.ctaButtonYellowText}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <Footer />
    </View>
  );
}


const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainContainer: { flex: 1, backgroundColor: "#fff" },
  
  // Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 18,
    backgroundColor: "#f59e0b",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5a534",
  },
  backButton: { padding: 8, marginRight: 10 },
  backButtonText: { fontSize: 24, color: "#fff", fontWeight: "bold" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", flex: 1, textAlign: "center" },
  menuContainer: { position: "relative" },
  menuButton: { padding: 8 },
  menuButtonText: { fontSize: 24, color: "#fff", fontWeight: "bold" },
  menuDropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuUserSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
  },
  menuUserAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: "#f59e0b",
  },
  menuUserInfo: {
    flex: 1,
  },
  menuUserName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1f2937",
  },
  menuUserEmail: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  menuItem: { paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  logoutItem: { borderBottomWidth: 0 },
  menuItemText: { fontSize: 14, color: "#333", fontWeight: "500" },

  // Content Container
  contentContainer: { flex: 1 },
  contentContent: { paddingBottom: 20 },

  // Hero Section
  heroSection: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  heroContent: { gap: 12 },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#f59e0b",
    borderRadius: 24,
    paddingHorizontal: 12,
    marginVertical: 12,
  },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1f2937",
  },
  heroButttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  ctaButtonPrimary: {
    flex: 1,
    backgroundColor: "#f59e0b",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  ctaButtonTextPrimary: {
    color: "#000",
    fontWeight: "600",
    fontSize: 13,
  },
  ctaButtonSecondary: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#f59e0b",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  ctaButtonTextSecondary: {
    color: "#f59e0b",
    fontWeight: "600",
    fontSize: 13,
  },

  // Services Section
  servicesSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 6,
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
    textAlign: "center",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  serviceCard: {
    width: (width - 48) / 2,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  serviceIcon: {
    fontSize: 28,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
  },
  serviceSubtext: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
  },
  viewAllButton: {
    backgroundColor: "#1f2937",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  viewAllButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  // Why Choose Section
  whyChooseSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: "#f3f4f6",
  },
  whyChooseGrid: {
    gap: 12,
  },
  whyChooseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  whyChooseIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  whyChooseTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 6,
    textAlign: "center",
  },
  whyChooseDescription: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 16,
  },

  // How It Works Section
  howItWorksSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  stepsContainer: {
    gap: 12,
  },
  stepCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 16,
  },

  // CTA Section
  ctaSection: {
    backgroundColor: "#fffbeb",
    marginHorizontal: 16,
    marginVertical: 24,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
    textAlign: "center",
    lineHeight: 26,
  },
  ctaDescription: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 18,
  },
  ctaButtonsContainer: {
    gap: 10,
    width: "100%",
  },
  ctaButtonDark: {
    backgroundColor: "#1f2937",
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  ctaButtonDarkText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  ctaButtonYellow: {
    backgroundColor: "#f59e0b",
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  ctaButtonYellowText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },
});
