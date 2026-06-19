import React, { useState, useEffect, useRef } from "react";
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
  Modal,
  FlatList,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { updateProfileApi } from "../api/auth";
import MapView, { Marker } from "react-native-maps";
import stateDisData from "../constants/state-and-dis.json";
import * as Location from "expo-location";

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [focusedInput, setFocusedInput] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Structured address states
  const [address, setAddress] = useState("");
  const [city, setCity] = useState(""); // City is District
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState(null); // No default coordinates initially
  const [longitude, setLongitude] = useState(null); // No default coordinates initially
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchingLocation, setFetchingLocation] = useState(false);

  // Modal visibility states
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);

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

          if (userObj.location) {
            if (typeof userObj.location === "object") {
              setAddress(userObj.location.address || "");
              setCity(userObj.location.city || "");
              setStateName(userObj.location.state || "");
              setPincode(userObj.location.pincode || "");
              if (userObj.location.coordinates && userObj.location.coordinates.lat) {
                setLatitude(userObj.location.coordinates.lat);
                setLongitude(userObj.location.coordinates.lng);
              }
            } else if (typeof userObj.location === "string") {
              setAddress(userObj.location);
            }
          }
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

    if (!address.trim()) {
      errors.address = "Address is required";
    }

    if (!stateName) {
      errors.stateName = "Please select a state";
    }

    if (!city) {
      errors.city = "Please select a district";
    }

    if (!pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(pincode.trim())) {
      errors.pincode = "Pincode must be exactly 6 digits";
    }

    if (latitude === null || longitude === null) {
      errors.coordinates = "Please select location coordinates on the map";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const locationPayload = {
        address: address.trim(),
        city: city.trim(), // city represents District in DB payload
        state: stateName.trim(),
        pincode: pincode.trim(),
        coordinates: {
          lat: latitude,
          lng: longitude,
        }
      };

      const updatedUser = await updateProfileApi(
        name.trim(),
        email.trim(),
        undefined, // no password change here
        locationPayload
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
        location: updatedUser?.location || locationPayload,
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

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        {
          headers: {
            "User-Agent": "TownNeedApp/1.0"
          }
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setLatitude(lat);
        setLongitude(lon);
        
        mapRef.current?.animateToRegion({
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 1000);
      } else {
        Alert.alert("Not Found", "Could not find coordinates for this search query.");
      }
    } catch (err) {
      console.log("Geocoding failed:", err);
      Alert.alert("Error", "Failed to search location.");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setFetchingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access location was denied. Please enable location permissions in settings."
        );
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (loc && loc.coords) {
        setLatitude(loc.coords.latitude);
        setLongitude(loc.coords.longitude);
        
        mapRef.current?.animateToRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 1000);
      }
    } catch (err) {
      console.log("Error getting location:", err);
      Alert.alert("Error", "Could not retrieve your current location.");
    } finally {
      setFetchingLocation(false);
    }
  };

  const selectedStateObj = stateDisData.states.find(s => s.state === stateName);
  const districtsList = selectedStateObj ? selectedStateObj.districts : [];

  if (loadingData) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#9A3412" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F8" }}>
      <StatusBar barStyle="light-content" backgroundColor="#9A3412" translucent={true} />
      
      {/* FIXED HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 12, paddingBottom: 12 }]}>
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

          {/* ADDRESS FIELDS SECTION */}
          <Text style={styles.sectionDividerText}>Location & Address</Text>

          {/* Address Line (AB Road etc) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Address <Text style={{ color: "#EF4444" }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textInput,
                focusedInput === "address" && styles.textInputFocused,
                formErrors.address && styles.textInputError
              ]}
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                if (formErrors.address) {
                  setFormErrors(prev => ({ ...prev, address: null }));
                }
              }}
              onFocus={() => setFocusedInput("address")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Street address"
              placeholderTextColor="#9E9E9E"
            />
            {formErrors.address && <Text style={styles.errorText}>{formErrors.address}</Text>}
          </View>

          {/* State Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              State <Text style={{ color: "#EF4444" }}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdownSelector,
                formErrors.stateName && styles.textInputError
              ]}
              activeOpacity={0.7}
              onPress={() => setStateModalVisible(true)}
            >
              <Text style={stateName ? styles.dropdownText : styles.dropdownPlaceholder}>
                {stateName || "Select State"}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#64748B" />
            </TouchableOpacity>
            {formErrors.stateName && <Text style={styles.errorText}>{formErrors.stateName}</Text>}
          </View>

          {/* District Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              District <Text style={{ color: "#EF4444" }}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.dropdownSelector,
                !stateName && styles.disabledDropdown,
                formErrors.city && styles.textInputError
              ]}
              activeOpacity={stateName ? 0.7 : 1}
              onPress={() => stateName && setDistrictModalVisible(true)}
            >
              <Text style={city ? styles.dropdownText : styles.dropdownPlaceholder}>
                {city || (stateName ? "Select District" : "Select State First")}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#64748B" />
            </TouchableOpacity>
            {formErrors.city && <Text style={styles.errorText}>{formErrors.city}</Text>}
          </View>

          {/* Pincode Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Pincode <Text style={{ color: "#EF4444" }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textInput,
                focusedInput === "pincode" && styles.textInputFocused,
                formErrors.pincode && styles.textInputError
              ]}
              value={pincode}
              onChangeText={(text) => {
                setPincode(text);
                if (formErrors.pincode) {
                  setFormErrors(prev => ({ ...prev, pincode: null }));
                }
              }}
              onFocus={() => setFocusedInput("pincode")}
              onBlur={() => setFocusedInput(null)}
              placeholder="e.g. 455001"
              placeholderTextColor="#9E9E9E"
              keyboardType="number-pad"
              maxLength={6}
            />
            {formErrors.pincode && <Text style={styles.errorText}>{formErrors.pincode}</Text>}
          </View>

          {/* Map Coordinates Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Set Location Coordinates <Text style={{ color: "#EF4444" }}>*</Text></Text>
            <Text style={styles.coordinatesText}>
              {latitude !== null && longitude !== null
                ? `Latitude: ${latitude.toFixed(6)} | Longitude: ${longitude.toFixed(6)}`
                : "Coordinates: Not Selected (Required)"}
            </Text>

            {/* Search Bar & Current Location Button */}
            <View style={styles.searchRow}>
              <TouchableOpacity
                style={styles.currentLocationBtn}
                onPress={getCurrentLocation}
                activeOpacity={0.7}
              >
                {fetchingLocation ? (
                  <ActivityIndicator size="small" color="#9A3412" />
                ) : (
                  <Ionicons name="locate" size={20} color="#9A3412" />
                )}
              </TouchableOpacity>
              <TextInput
                style={styles.mapSearchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search location on map..."
                placeholderTextColor="#9E9E9E"
                onSubmitEditing={handleSearchLocation}
                returnKeyType="search"
              />
              <TouchableOpacity
                style={styles.searchGoBtn}
                onPress={handleSearchLocation}
                activeOpacity={0.7}
              >
                <Ionicons name="search" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: latitude || 22.9734,
                  longitude: longitude || 78.6569,
                  latitudeDelta: latitude ? 0.05 : 5.0,
                  longitudeDelta: longitude ? 0.05 : 5.0,
                }}
                onPress={(e) => {
                  const coords = e.nativeEvent.coordinate;
                  setLatitude(coords.latitude);
                  setLongitude(coords.longitude);
                }}
              >
                {latitude !== null && longitude !== null && (
                  <Marker
                    coordinate={{ latitude, longitude }}
                    draggable
                    onDragEnd={(e) => {
                      const coords = e.nativeEvent.coordinate;
                      setLatitude(coords.latitude);
                      setLongitude(coords.longitude);
                    }}
                    title="Your Location"
                    description="Drag marker to position accurately"
                  />
                )}
              </MapView>
            </View>
            <Text style={styles.mapInstruction}>
              Tap on map or drag the marker to update coordinates.
            </Text>
            {formErrors.coordinates && <Text style={styles.errorText}>{formErrors.coordinates}</Text>}
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

      {/* STATE MODAL LIST */}
      <Modal
        visible={stateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setStateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setStateModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={stateDisData.states}
              keyExtractor={(item) => item.state}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    stateName === item.state && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    setStateName(item.state);
                    setCity(""); // reset district on state change
                    setStateModalVisible(false);
                    if (formErrors.stateName) {
                      setFormErrors(prev => ({ ...prev, stateName: null }));
                    }
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    stateName === item.state && styles.modalItemTextSelected
                  ]}>
                    {item.state}
                  </Text>
                  {stateName === item.state && (
                    <Ionicons name="checkmark" size={20} color="#9A3412" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* DISTRICT MODAL LIST */}
      <Modal
        visible={districtModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDistrictModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select District</Text>
              <TouchableOpacity onPress={() => setDistrictModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={districtsList}
              keyExtractor={(item) => item}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    city === item && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    setCity(item);
                    setDistrictModalVisible(false);
                    if (formErrors.city) {
                      setFormErrors(prev => ({ ...prev, city: null }));
                    }
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    city === item && styles.modalItemTextSelected
                  ]}>
                    {item}
                  </Text>
                  {city === item && (
                    <Ionicons name="checkmark" size={20} color="#9A3412" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  sectionDividerText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#9A3412",
    marginTop: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#FFDAD0",
    paddingBottom: 6,
  },
  dropdownSelector: {
    height: 44,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: 14,
    color: "#222",
    fontWeight: "500",
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: "#9E9E9E",
  },
  disabledDropdown: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E2E2E2",
  },
  coordinatesText: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 8,
    fontWeight: "600",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  currentLocationBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#FFEDE8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFDAD0",
    marginRight: 8,
  },
  mapSearchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFF",
    fontSize: 14,
    color: "#222",
  },
  searchGoBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#9A3412",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  mapContainer: {
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E2E2",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapInstruction: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 6,
    fontStyle: "italic",
  },
  saveButton: {
    height: 48,
    backgroundColor: "#9A3412",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 32,
    marginTop: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  modalItemSelected: {
    backgroundColor: "#FFF7F5",
  },
  modalItemText: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "500",
  },
  modalItemTextSelected: {
    color: "#9A3412",
    fontWeight: "600",
  },
  modalSeparator: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
});
