import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Modal,
  FlatList
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import api from "../../services/api";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import uploadFile from "../../utils/mediaUpload"; // Import the upload utility

const PaymentSIPUpload = () => {
  const router = useRouter();
  const { workerId } = useLocalSearchParams();
  const { jwtToken, isAuthenticated } = useAuth();

  // Form states
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentSIP, setPaymentSIP] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [showBankPicker, setShowBankPicker] = useState(false);

  // UI states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [worker, setWorker] = useState(null);
  const [user, setUser] = useState({ id: null, name: "", email: "" });
  const [loading, setLoading] = useState(true);

  const config = {
    headers: { Authorization: `Bearer ${jwtToken}` },
  };

  const banks = [
    "Commercial Bank",
    "Bank of Ceylon",
    "Hatton National Bank",
    "Sampath Bank",
    "DFCC Bank",
    "People's Bank",
    "National Savings Bank",
    "Seylan Bank",
    "Pan Asia Bank",
    "Union Bank",
    "Other"
  ];

  // Fetch worker details
  async function getWorker() {
    try {
      const response = await api.get(`/worker/id/${workerId}`, config);
      setWorker(response.data);
    } catch (error) {
      console.log("Error loading worker:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load worker details",
      });
    }
  }

  // Fetch logged-in user
  async function getUser() {
    try {
      const response = await api.get("/user", config);
      setUser(response.data);
    } catch (error) {
      console.log("Error loading user:", error);
    }
  }

  // Initial data loading
  useEffect(() => {
    if (!jwtToken || !workerId) return;

    const loadData = async () => {
      setLoading(true);
      await Promise.all([getWorker(), getUser()]);
      setLoading(false);
    };

    loadData();
  }, [jwtToken, workerId]);

  // Request permissions for image picker
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        }
      }
    })();
  }, []);

  // Handle file selection - FIXED mediaTypes
  async function handleFilePick() {
    try {
      // Use array format for newer versions of expo-image-picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Changed from ImagePicker.MediaType.Images
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Get filename from URI or create one
        const fileName = asset.fileName || 
                        asset.uri.split('/').pop() || 
                        `payment_${Date.now()}.jpg`;
        
        // Get file type from URI or default to image/jpeg
        const fileType = asset.type || 
                        (fileName.endsWith('.png') ? 'image/png' : 'image/jpeg');
        
        const file = {
          uri: asset.uri,
          type: fileType,
          name: fileName,
          size: asset.fileSize,
        };
        setPaymentSIP(file);
        setError("");
        
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Image selected successfully",
        });
      }
    } catch (error) {
      console.log("Error picking image:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to pick image: " + (error.message || "Unknown error"),
      });
    }
  }

  // Validate form
  function validateForm() {
    if (!amount || !bankName || !accountNumber || !paymentDate || !paymentSIP) {
      setError("All fields are required");
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "All fields are required",
      });
      return false;
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a valid amount",
      });
      return false;
    }

    if (accountNumber.length < 9) {
      setError("Please enter a valid account number");
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a valid account number",
      });
      return false;
    }

    return true;
  }

  // Handle form submission
  async function handleSubmit() {
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Upload SIP image using the imported uploadFile utility
      let sipImageUrl = "";
      if (paymentSIP) {
        try {
          // Use the uploadFile utility from mediaUpload.js
          sipImageUrl = await uploadFile(paymentSIP);
          console.log("Upload successful, URL:", sipImageUrl);
        } catch (err) {
          console.log("Upload error details:", err);
          setError("SIP image upload failed: " + (err.message || "Unknown error"));
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "SIP image upload failed",
          });
          setIsLoading(false);
          return;
        }
      }

      const paymentData = {
        amount: parseFloat(amount),
        bankName: bankName,
        accountNumber: accountNumber,
        paymentDate: paymentDate,
        sipImageUrl: sipImageUrl,
        remarks: remarks || "",
        workerId,
        userId: user.id,
      };

      console.log("Submitting payment data:", paymentData);
      const response = await api.post("/slip", paymentData, config);
      console.log("Submit response:", response.data);

      setSuccess("Payment SIP uploaded successfully!");
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Payment SIP uploaded successfully!",
      });

      // Reset form
      setAmount("");
      setBankName("");
      setAccountNumber("");
      setPaymentDate("");
      setPaymentSIP(null);
      setRemarks("");

      // Navigate back after 2 seconds
      setTimeout(() => {
        router.back();
      }, 2000);

    } catch (error) {
      console.log("Submit error:", error);
      if (error.response?.status === 400) {
        setError(error.response.data?.message || "Invalid payment details");
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Invalid payment details",
        });
      } else if (error.response?.status === 409) {
        setError("Transaction ID already exists");
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Transaction ID already exists",
        });
      } else {
        setError("There was an error uploading payment SIP");
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "There was an error uploading payment SIP",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Clear form
  function clearForm() {
    setAmount("");
    setBankName("");
    setAccountNumber("");
    setPaymentDate("");
    setPaymentSIP(null);
    setRemarks("");
    setError("");
    setSuccess("");
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.loadingText}>Loading payment form...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.headerIcon}>
              <MaterialIcons name="receipt" size={40} color="#f59e0b" />
            </View>
            <Text style={styles.headerTitle}>Upload Payment SIP</Text>
            <Text style={styles.headerSubtitle}>
              Submit your bank payment details and upload the transaction screenshot
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Worker and User Info */}
            <View style={styles.infoRow}>
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Worker Name</Text>
                <View style={styles.infoValueContainer}>
                  <Feather name="user" size={16} color="#f59e0b" />
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {worker?.fullName || "No worker selected"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>User Name</Text>
                <View style={styles.infoValueContainer}>
                  <Feather name="user" size={16} color="#f59e0b" />
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {user?.name || "Not logged in"}
                  </Text>
                </View>
                {user?.email && (
                  <Text style={styles.infoEmail} numberOfLines={1}>{user.email}</Text>
                )}
              </View>
            </View>

            {/* Amount and Date */}
            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>
                  Amount Paid <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.amountInput}>
                  <Text style={styles.currencySymbol}>Rs.</Text>
                  <TextInput
                    style={styles.amountField}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={(text) => {
                      setAmount(text);
                      setError("");
                      setSuccess("");
                    }}
                  />
                </View>
              </View>

              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>
                  Payment Date <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={paymentDate}
                  onChangeText={(text) => {
                    setPaymentDate(text);
                    setError("");
                    setSuccess("");
                  }}
                />
              </View>
            </View>

            {/* Bank Name and Account Number */}
            <View style={styles.inputRow}>
              {/* Bank Name with Picker */}
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>
                  Bank Name <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowBankPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pickerButtonText, !bankName && styles.placeholderText]}>
                    {bankName || "Select Bank"}
                  </Text>
                  <Feather name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>

                {/* Bank Selection Modal */}
                <Modal
                  visible={showBankPicker}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setShowBankPicker(false)}
                >
                  <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowBankPicker(false)}
                  >
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Bank</Text>
                        <TouchableOpacity onPress={() => setShowBankPicker(false)}>
                          <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                      </View>
                      <FlatList
                        data={banks}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.bankItem}
                            onPress={() => {
                              setBankName(item);
                              setShowBankPicker(false);
                              setError("");
                              setSuccess("");
                            }}
                          >
                            <Text style={styles.bankItemText}>{item}</Text>
                            {bankName === item && (
                              <Ionicons name="checkmark" size={20} color="#f59e0b" />
                            )}
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </TouchableOpacity>
                </Modal>
              </View>

              {/* Account Number */}
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>
                  Account Number <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter account number"
                  value={accountNumber}
                  maxLength={18}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    setAccountNumber(text);
                    setError("");
                    setSuccess("");
                  }}
                />
              </View>
            </View>

            {/* File Upload */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Upload Bank SIP/Transaction Screenshot <Text style={styles.required}>*</Text>
              </Text>
              
              <TouchableOpacity
                style={styles.uploadArea}
                onPress={handleFilePick}
                activeOpacity={0.7}
              >
                {!paymentSIP ? (
                  <>
                    <Feather name="upload-cloud" size={40} color="#999" />
                    <Text style={styles.uploadText}>Click to upload or drag and drop</Text>
                    <Text style={styles.uploadSubtext}>PNG, JPG, PDF (Max 5MB)</Text>
                  </>
                ) : (
                  <View style={styles.filePreview}>
                    <View style={styles.fileInfo}>
                      <View style={styles.fileIcon}>
                        <Feather name="file-text" size={24} color="#f59e0b" />
                      </View>
                      <View style={styles.fileDetails}>
                        <Text style={styles.fileName} numberOfLines={1}>
                          {paymentSIP.name || "Selected file"}
                        </Text>
                        <Text style={styles.fileSize}>
                          {paymentSIP.size ? `${(paymentSIP.size / 1024).toFixed(2)} KB` : "Size unknown"}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => setPaymentSIP(null)}
                      style={styles.removeFile}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close-circle" size={24} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>

              {paymentSIP && paymentSIP.uri && (
                <Image
                  source={{ uri: paymentSIP.uri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
              )}
            </View>

            {/* Remarks */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Remarks (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter any additional remarks or notes..."
                value={remarks}
                onChangeText={setRemarks}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Error and Success Messages */}
            {error ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={20} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successContainer}>
                <Feather name="check-circle" size={20} color="#10b981" />
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.submitButtonText}>Uploading...</Text>
                  </>
                ) : (
                  <>
                    <Feather name="upload-cloud" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Upload Payment SIP</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearForm}
                activeOpacity={0.8}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>

            {/* Secure Payment Badge */}
            <View style={styles.securityBadge}>
              <Feather name="lock" size={14} color="#999" />
              <Text style={styles.securityText}>
                Your payment information is secure and encrypted
              </Text>
            </View>
          </View>
        </ScrollView>
        <Toast />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PaymentSIPUpload;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#f59e0b",
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: "relative",
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
    elevation: 10,
  },
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  formContainer: {
    padding: 20,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
  },
  infoValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 6,
    flex: 1,
  },
  infoEmail: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#ef4444",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#333",
  },
  amountInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
  },
  currencySymbol: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#666",
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  amountField: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: "#333",
  },
  // Picker styles
  pickerButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerButtonText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  bankItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  bankItemText: {
    fontSize: 16,
    color: "#333",
  },
  uploadArea: {
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginTop: 12,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    color: "#999",
  },
  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: "#999",
  },
  removeFile: {
    padding: 8,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fee2e2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#dcfce7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    fontSize: 14,
    color: "#10b981",
    marginLeft: 8,
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f59e0b",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  securityText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 6,
  },
});