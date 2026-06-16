import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { updateProfileApi } from "../api/auth";

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [focusedInput, setFocusedInput] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const formatPhone = (phoneStr) => {
    if (!phoneStr) return "";
    const cleaned = phoneStr.replace(/\s+/g, "");
    if (cleaned.length > 3) {
      return cleaned.slice(0, 3) + " " + cleaned.slice(3);
    }
    return cleaned;
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const userObj = JSON.parse(userJson);
          setName(userObj.name || userObj.fullName || "");
          setEmail(userObj.email || "");
          setPhone(userObj.phone || "");
        }
      } catch (e) {
        console.log("Failed to fetch user in EditProfileScreen:", e);
      } finally {
        setLoadingData(false);
      }
    };
    fetchUserDetails();
  }, []);

  const validateForm = () => {
    let errors = {};

    if (!name.trim()) {
      errors.name = "Full Name is required";
    }

    if (!email.trim()) {
      errors.email = "Email Address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const updatedUser = await updateProfileApi(
        name.trim(),
        email.trim()
      );

      const userJson = await AsyncStorage.getItem("user");
      let currentUserObj = {};
      if (userJson) {
        currentUserObj = JSON.parse(userJson);
      }

      const newName = updatedUser?.fullName || updatedUser?.name || name.trim();
      const newEmail = updatedUser?.email || email.trim();

      const mergedUserObj = {
        ...currentUserObj,
        name: newName,
        fullName: newName,
        email: newEmail,
      };

      await AsyncStorage.setItem("user", JSON.stringify(mergedUserObj));
      
      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      console.log("Profile update failed:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#9A3412" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F8", paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" backgroundColor="#9A3412" />
      
      {/* FIXED HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Details Header Area */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Ionicons name="person" size={42} color="#9A3412" />
          </View>
          <Text style={styles.avatarTitle}>Update Profile Details</Text>
          <Text style={styles.avatarSubtext}>Keep your personal info updated</Text>
        </View>

        {/* Input Fields Wrapper */}
        <View style={styles.fieldsContainer}>
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Full Name <Text style={{ color: "#EF4444" }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textInput,
                focusedInput === "name" && styles.textInputFocused,
                formErrors.name && styles.textInputError
              ]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (formErrors.name) {
                  setFormErrors(prev => ({ ...prev, name: null }));
                }
              }}
              onFocus={() => setFocusedInput("name")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Enter your full name"
              placeholderTextColor="#9E9E9E"
            />
            {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
          </View>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Email Address <Text style={{ color: "#EF4444" }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textInput,
                focusedInput === "email" && styles.textInputFocused,
                formErrors.email && styles.textInputError
              ]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (formErrors.email) {
                  setFormErrors(prev => ({ ...prev, email: null }));
                }
              }}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Enter your email"
              placeholderTextColor="#9E9E9E"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}
          </View>

          {/* Mobile Number Field (Non-editable) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <TextInput
              style={[styles.textInput, styles.disabledTextInput]}
              value={formatPhone(phone)}
              editable={false}
              placeholder="Mobile Number"
              placeholderTextColor="#9E9E9E"
            />
          </View>

          {/* Save Action */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F8",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: "#9A3412",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FFEDE8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFDAD0",
  },
  avatarTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  avatarSubtext: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  fieldsContainer: {
    paddingHorizontal: 4,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#222",
    marginBottom: 6,
  },
  textInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#FFF",
    fontSize: 14,
    color: "#222",
  },
  textInputFocused: {
    borderColor: "#9A3412",
  },
  textInputError: {
    borderColor: "#E53935",
  },
  disabledTextInput: {
    backgroundColor: "#F3F4F6",
    color: "#424141",
    borderColor: "#E2E2E2",
  },
  saveButton: {
    height: 48,
    backgroundColor: "#9A3412",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 32,
    marginTop: 9,
    marginBottom: 40,
    shadowColor: "#9A3412",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: "#FED7AA",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 4,
    fontSize: 11,
    color: "#E53935",
  },
});
