import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import uploadFile from "../utils/mediaUpload";
import api from "../services/api";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // FIXED: Image picker function
  const handleImagePick = async () => {
    try {
      // Debug what's available
      console.log("ImagePicker object contains:", Object.keys(ImagePicker));
      
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to upload images!",
          [{ text: "OK" }]
        );
        return;
      }

      // OPTION 1: Try without mediaTypes (simplest)
      const result = await ImagePicker.launchImageLibraryAsync({
        // Remove mediaTypes parameter entirely
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log("Image picker result:", result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        setImage({
          uri: selectedImage.uri,
          name: selectedImage.fileName || `profile_${Date.now()}.jpg`,
          type: selectedImage.type || "image/jpeg",
        });
        
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Image selected successfully",
          visibilityTime: 1500,
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to pick image. Please try again.",
      });
    }
  };

  // Handle registration
  const submit = async () => {
    // Validation
    if (!name || !username || !email || !contact || !address || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "All fields are required",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "";
      
      // Upload image if exists
      if (image) {
        try {
          Toast.show({
            type: "info",
            text1: "Uploading...",
            text2: "Please wait while we upload your image",
          });
          
          imageUrl = await uploadFile(image);
          
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Image uploaded successfully",
          });
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          Toast.show({
            type: "info",
            text1: "Note",
            text2: "Profile created without image",
          });
        }
      }

      // Prepare data
      const userData = {
        name,
        username,
        email,
        contact,
        address,
        password,
        imageUrl,
      };

      console.log("Registering with data:", userData);

      // Send registration request
      const response = await api.post("/user", userData);
      
      console.log("Registration response:", response.data);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Registration successful!",
      });

      // Navigate to login after delay
      setTimeout(() => {
        router.replace("/login");
      }, 1500);

    } catch (error) {
      console.error("Registration error:", error);
      
      let errorMessage = "Registration failed";
      if (error.response?.status === 400) {
        errorMessage = error.response.data || errorMessage;
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Register</Text>
        <Text style={styles.subtitle}>Create your account</Text>
      </View>

      {/* Image Upload Section */}
      <View style={styles.imageSection}>
        <TouchableOpacity 
          style={styles.imageUploadContainer} 
          onPress={handleImagePick}
          disabled={loading}
        >
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.profileImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={styles.uploadText}>Add Profile Image</Text>
              <Text style={styles.uploadSubtext}>Tap to select</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Form Fields */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Full Name *"
          value={name}
          onChangeText={setName}
          editable={!loading}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Username *"
          value={username}
          onChangeText={setUsername}
          editable={!loading}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Email *"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Contact Number *"
          value={contact}
          onChangeText={setContact}
          keyboardType="phone-pad"
          editable={!loading}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Address *"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
          editable={!loading}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password *"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Confirm Password *"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.registerButton, loading && styles.buttonDisabled]}
          onPress={submit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Register</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>
            Already have an account?{" "}
            <Text 
              style={styles.loginLink} 
              onPress={() => !loading && router.push("/(auth)/login")}
            >
              Login
            </Text>
          </Text>
        </View>
      </View>

      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#f8fafc",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#f59e0b",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  imageUploadContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#f8fafc",
    borderWidth: 3,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 70,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
  },
  uploadSubtext: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  registerButton: {
    backgroundColor: "#f59e0b",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 24,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  loginLinkContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  loginText: {
    fontSize: 16,
    color: "#64748b",
  },
  loginLink: {
    color: "#f59e0b",
    fontWeight: "700",
  },
});


