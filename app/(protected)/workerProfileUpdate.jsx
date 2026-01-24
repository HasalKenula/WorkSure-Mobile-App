import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import api from "../services/api";

export default function WorkerProfileUpdate() {
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

  // --- Form states ---
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [NIC, setNIC] = useState("");
  const [address, setAddress] = useState("");
  const [job, setJob] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [days, setDays] = useState([]);
  const [certifications, setCertifications] = useState([{ name: "", body: "" }]);
  const [experiences, setExperiences] = useState([{ title: "", company: "", years: "" }]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");

  const jobOptions = ["PLUMBER", "ELECTRICIAN", "CARPENTER", "PAINTER", "CLEANER"];
  const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    if (!jwtToken) return;

    api
      .get(`/user`, config)
      .then((res) => {
        setUserId(res.data.id);
      })
      .catch((err) => {
        console.log("Error fetching user:", err);
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Failed to load user data",
        });
      });
  }, [jwtToken]);

  useEffect(() => {
    async function getWorkerByUserId() {
      if (!userId) return;

      try {
        const response = await api.get(
          `/worker/${userId}`,
          config
        );
        setWorker(response.data);
        populateForm(response.data);
        setLoading(false);
      } catch (err) {
        console.log("Error loading worker:", err);
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Failed to load worker profile",
        });
      }
    }

    if (isAuthenticated && userId) {
      getWorkerByUserId();
    }
  }, [isAuthenticated, userId]);

  const populateForm = (data) => {
    setFullname(data.fullName || "");
    setEmail(data.email || "");
    setContact(data.phoneNumber || "");
    setNIC(data.nic || "");
    setAddress(data.address || "");
    setJob(data.jobRole || "");
    setStartTime(data.preferredStartTime || "");
    setEndTime(data.preferredEndTime || "");
    setLocation(data.preferredServiceLocation || "");
    
    // Set days
    const selectedDays = [];
    if (data.mon) selectedDays.push("Mon");
    if (data.tue) selectedDays.push("Tue");
    if (data.wed) selectedDays.push("Wed");
    if (data.thu) selectedDays.push("Thu");
    if (data.fri) selectedDays.push("Fri");
    if (data.sat) selectedDays.push("Sat");
    if (data.sun) selectedDays.push("Sun");
    setDays(selectedDays);
    
    // Set certifications
    if (data.certificates?.length > 0) {
      setCertifications(data.certificates.map(c => ({
        name: c.certificateName || "",
        body: c.issuingBody || ""
      })));
    } else {
      setCertifications([{ name: "", body: "" }]);
    }
    
    // Set experiences
    if (data.jobExperiences?.length > 0) {
      setExperiences(data.jobExperiences.map(e => ({
        title: e.jobTitle || "",
        company: e.companyName || "",
        years: e.years || ""
      })));
    } else {
      setExperiences([{ title: "", company: "", years: "" }]);
    }
    
    // Set PDF URL if exists
    if (data.pdfUrl) {
      setPdfUrl(data.pdfUrl);
    }
  };

  const handleDayChange = (day) => {
    setDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  const addCertification = () => {
    setCertifications(prev => [...prev, { name: "", body: "" }]);
  };

  const removeCertification = (index) => {
    if (certifications.length > 1) {
      setCertifications(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleCertificationChange = (index, field, value) => {
    setCertifications(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const addExperience = () => {
    setExperiences(prev => [...prev, { title: "", company: "", years: "" }]);
  };

  const removeExperience = (index) => {
    if (experiences.length > 1) {
      setExperiences(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleExperienceChange = (index, field, value) => {
    setExperiences(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setUploadedFile({
          name: file.name,
          uri: file.uri,
          type: file.mimeType,
          size: file.size,
        });
      }
    } catch (error) {
      console.log("Document picker error:", error);
      Toast.show({
        type: "error",
        text1: "Failed to pick document",
      });
    }
  };

  const uploadFile = async (file) => {
    // For now, we'll just return a dummy URL
    // In a real app, you would upload to your server
    return "https://example.com/uploaded-file.pdf";
  };

  const handleSubmit = async () => {
    if (!jwtToken) {
      Toast.show({
        type: "error",
        text1: "You must log in first",
      });
      return;
    }

    if (!worker?.id) {
      Toast.show({
        type: "error",
        text1: "Worker profile not found",
      });
      return;
    }

    let finalPdfUrl = pdfUrl;
    
    // Upload file if selected
    if (uploadedFile) {
      try {
        // In a real app, you would upload the file here
        // finalPdfUrl = await uploadFile(uploadedFile);
        Toast.show({
          type: "info",
          text1: "File upload simulation",
          text2: "File upload would happen here",
        });
      } catch (err) {
        Toast.show({
          type: "error",
          text1: "File upload failed",
        });
        return;
      }
    }

    // Prepare the data
    const updateData = {
      fullName: fullname.trim(),
      email: email.trim(),
      phoneNumber: contact.trim(),
      nic: NIC.trim(),
      address: address.trim(),
      jobRole: job,
      preferredStartTime: startTime,
      preferredEndTime: endTime,
      preferredServiceLocation: location.trim(),
      mon: days.includes("Mon"),
      tue: days.includes("Tue"),
      wed: days.includes("Wed"),
      thu: days.includes("Thu"),
      fri: days.includes("Fri"),
      sat: days.includes("Sat"),
      sun: days.includes("Sun"),
      pdfUrl: finalPdfUrl,
      certificates: certifications
        .filter(c => c.name.trim() && c.body.trim())
        .map(c => ({
          certificateName: c.name.trim(),
          issuingBody: c.body.trim()
        })),
      jobExperiences: experiences
        .filter(e => e.title.trim() && e.company.trim() && e.years)
        .map(e => ({
          companyName: e.company.trim(),
          jobTitle: e.title.trim(),
          years: Number(e.years) || 0
        }))
    };

    try {
      await api.put(
        `/worker/${worker.id}`,
        updateData,
        config
      );

      Toast.show({
        type: "success",
        text1: "Profile updated successfully!",
      });
      
      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
      
    } catch (err) {
      console.log("Update error:", err);
      Toast.show({
        type: "error",
        text1: "Update failed!",
        text2: err.response?.data?.message || "Please try again",
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!worker) {
    return (
      <View style={styles.center}>
        <MaterialIcons name="error-outline" size={60} color="#ef4444" />
        <Text style={styles.errorText}>No worker profile found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Update Profile</Text>
          <Text style={styles.headerSubtitle}>Edit your worker profile information</Text>
        </View>

        {/* Personal Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          
          <View style={styles.formGrid}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullname}
                onChangeText={setFullname}
                placeholder="Enter full name"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={contact}
                onChangeText={setContact}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>NIC Number</Text>
              <TextInput
                style={styles.input}
                value={NIC}
                onChangeText={setNIC}
                placeholder="Enter NIC"
              />
            </View>
            
            <View style={[styles.inputContainer, { width: '100%' }]}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter full address"
                multiline
                numberOfLines={2}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Job Role</Text>
              <View style={styles.selectContainer}>
                <Text style={[styles.input, !job && styles.placeholderText]}>
                  {job || "Select job role"}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#64748b" />
              </View>
              {jobOptions.map((option) => (
                <Pressable
                  key={option}
                  style={[
                    styles.optionItem,
                    job === option && styles.selectedOption,
                  ]}
                  onPress={() => setJob(option)}
                >
                  <Text style={job === option ? styles.selectedOptionText : styles.optionText}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Certifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="school" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Certifications</Text>
          </View>
          
          {certifications.map((cert, index) => (
            <View key={index} style={styles.dynamicItem}>
              <View style={styles.dynamicItemHeader}>
                <Text style={styles.itemNumber}>Certification {index + 1}</Text>
                {certifications.length > 1 && (
                  <Pressable onPress={() => removeCertification(index)}>
                    <MaterialIcons name="remove-circle" size={24} color="#ef4444" />
                  </Pressable>
                )}
              </View>
              
              <View style={styles.formGrid}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Certificate Name</Text>
                  <TextInput
                    style={styles.input}
                    value={cert.name}
                    onChangeText={(text) => handleCertificationChange(index, "name", text)}
                    placeholder="e.g., Plumbing License"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Issuing Body</Text>
                  <TextInput
                    style={styles.input}
                    value={cert.body}
                    onChangeText={(text) => handleCertificationChange(index, "body", text)}
                    placeholder="e.g., Government Authority"
                  />
                </View>
              </View>
            </View>
          ))}
          
          <Pressable style={styles.addButton} onPress={addCertification}>
            <Ionicons name="add-circle" size={20} color="#f59e0b" />
            <Text style={styles.addButtonText}>Add Certification</Text>
          </Pressable>
        </View>

        {/* Work Experience Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="work" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Work Experience</Text>
          </View>
          
          {experiences.map((exp, index) => (
            <View key={index} style={styles.dynamicItem}>
              <View style={styles.dynamicItemHeader}>
                <Text style={styles.itemNumber}>Experience {index + 1}</Text>
                {experiences.length > 1 && (
                  <Pressable onPress={() => removeExperience(index)}>
                    <MaterialIcons name="remove-circle" size={24} color="#ef4444" />
                  </Pressable>
                )}
              </View>
              
              <View style={styles.formGrid}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Job Title</Text>
                  <TextInput
                    style={styles.input}
                    value={exp.title}
                    onChangeText={(text) => handleExperienceChange(index, "title", text)}
                    placeholder="e.g., Senior Plumber"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Company</Text>
                  <TextInput
                    style={styles.input}
                    value={exp.company}
                    onChangeText={(text) => handleExperienceChange(index, "company", text)}
                    placeholder="Company name"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Years of Experience</Text>
                  <TextInput
                    style={styles.input}
                    value={exp.years}
                    onChangeText={(text) => handleExperienceChange(index, "years", text)}
                    placeholder="e.g., 5"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          ))}
          
          <Pressable style={styles.addButton} onPress={addExperience}>
            <Ionicons name="add-circle" size={20} color="#f59e0b" />
            <Text style={styles.addButtonText}>Add Experience</Text>
          </Pressable>
        </View>

        {/* Availability Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="calendar" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Availability & Preferences</Text>
          </View>
          
          <Text style={styles.subSectionTitle}>Working Days</Text>
          <View style={styles.daysContainer}>
            {dayOptions.map((day) => (
              <Pressable
                key={day}
                style={[
                  styles.dayButton,
                  days.includes(day) && styles.dayButtonActive,
                ]}
                onPress={() => handleDayChange(day)}
              >
                <Text style={[
                  styles.dayButtonText,
                  days.includes(day) && styles.dayButtonTextActive,
                ]}>
                  {day}
                </Text>
              </Pressable>
            ))}
          </View>
          
          <Text style={styles.subSectionTitle}>Working Hours</Text>
          <View style={styles.timeContainer}>
            <View style={styles.timeInputContainer}>
              <Text style={styles.inputLabel}>Start Time</Text>
              <View style={styles.timeInput}>
                <TextInput
                  style={styles.timeTextInput}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="09:00"
                />
                <Feather name="clock" size={20} color="#64748b" />
              </View>
            </View>
            
            <View style={styles.timeInputContainer}>
              <Text style={styles.inputLabel}>End Time</Text>
              <View style={styles.timeInput}>
                <TextInput
                  style={styles.timeTextInput}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="17:00"
                />
                <Feather name="clock" size={20} color="#64748b" />
              </View>
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Preferred Service Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Area or city where you provide services"
            />
          </View>
        </View>

        {/* Documents Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="attach-file" size={24} color="#f59e0b" />
            <Text style={styles.sectionTitle}>Documents</Text>
          </View>
          
          <Pressable style={styles.uploadArea} onPress={pickDocument}>
            <MaterialIcons name="cloud-upload" size={48} color="#94a3b8" />
            <Text style={styles.uploadText}>Upload PDF or Images</Text>
            <Text style={styles.uploadSubtext}>Tap to browse or drag & drop</Text>
            
            {uploadedFile ? (
              <View style={styles.fileInfo}>
                <MaterialIcons name="picture-as-pdf" size={24} color="#f59e0b" />
                <Text style={styles.fileName} numberOfLines={1}>
                  {uploadedFile.name}
                </Text>
                <Pressable onPress={() => setUploadedFile(null)}>
                  <MaterialIcons name="close" size={20} color="#ef4444" />
                </Pressable>
              </View>
            ) : pdfUrl ? (
              <View style={styles.fileInfo}>
                <MaterialIcons name="link" size={24} color="#3b82f6" />
                <Text style={styles.fileName} numberOfLines={1}>
                  Current file attached
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {/* Submit Button */}
        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <MaterialIcons name="save" size={24} color="#fff" />
          <Text style={styles.submitButtonText}>Update Profile</Text>
        </Pressable>
      </ScrollView>
      
      <Toast />
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    backgroundColor: "#f59e0b",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginLeft: 10,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  inputContainer: {
    width: "48%",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1e293b",
  },
  placeholderText: {
    color: "#94a3b8",
  },
  selectContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: "#f8fafc",
  },
  selectedOption: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  optionText: {
    fontSize: 14,
    color: "#64748b",
  },
  selectedOptionText: {
    fontSize: 14,
    color: "#f59e0b",
    fontWeight: "600",
  },
  dynamicItem: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dynamicItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#fff7ed",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f59e0b",
    marginLeft: 8,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  dayButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dayButtonActive: {
    backgroundColor: "#fff7ed",
    borderColor: "#f59e0b",
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  dayButtonTextActive: {
    color: "#f59e0b",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  timeInputContainer: {
    width: "48%",
  },
  timeInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  timeTextInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    padding: 0,
  },
  uploadArea: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 30,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginTop: 12,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 16,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginTop: 12,
    width: "100%",
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
    marginLeft: 8,
    marginRight: 8,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f59e0b",
    marginHorizontal: 20,
    marginBottom: 40,
    marginTop: 10,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 10,
  },
});






