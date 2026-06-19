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
  Modal,
  FlatList,
  ToastAndroid,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getServicesApi, applyVendorApi } from "../api/services";
import stateDisData from "../constants/state-and-dis.json";

export default function CreateVenderForm() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState(""); // Holds the selected District
  const [stateName, setStateName] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  
  const [servicesList, setServicesList] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServicesApi();
        setServicesList(data || []);
      } catch (err) {
        console.log("Failed to load services in CreateVenderForm:", err.message);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  const validateForm = () => {
    let errors = {};

    if (!businessName.trim()) {
      errors.businessName = "Business Name is required";
    }
    if (!description.trim()) {
      errors.description = "Description is required";
    }
    if (!address.trim()) {
      errors.address = "Address is required";
    }
    if (!stateName) {
      errors.stateName = "Please select a state";
    }
    if (!city.trim()) {
      errors.city = "Please select a district";
    }
    if (!selectedService) {
      errors.service = "Please select a service";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApply = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const serviceId = selectedService.id || selectedService._id;
      const payload = {
        businessName: businessName.trim(),
        description: description.trim(),
        address: address.trim(),
        city: city.trim(),
        services: [serviceId],
      };

      await applyVendorApi(payload);

      // Show toast message
      if (Platform.OS === "android") {
        ToastAndroid.show("Vendor application submitted successfully!", ToastAndroid.LONG);
      } else {
        Alert.alert("Success", "Vendor application submitted successfully!");
      }

      // Navigate back to profile screen
      router.back();
    } catch (error) {
      console.log("Vendor application submission failed:", error);
      Alert.alert("Submission Failed", error.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStateObj = stateDisData.states.find(s => s.state === stateName);
  const districtsList = selectedStateObj ? selectedStateObj.districts : [];

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F8" }}>
      <StatusBar barStyle="light-content" backgroundColor="#9A3412" translucent={true} />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 12, paddingBottom: 12 }]}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply as Vendor</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formIntro}>
          <Text style={styles.introTitle}>Register Your Business</Text>
          <Text style={styles.introSubtext}>Provide details below to list your services</Text>
        </View>

        {/* Input Fields */}
        <View style={styles.fieldsContainer}>
          {/* Business Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Business Name <Text style={{ color: "#EF4444" }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textInput,
                focusedInput === "businessName" && styles.textInputFocused,
                formErrors.businessName && styles.textInputError,
              ]}
              value={businessName}
              onChangeText={(text) => {
                setBusinessName(text);
                if (formErrors.businessName) {
                  setFormErrors((prev) => ({ ...prev, businessName: null }));
                }
              }}
              onFocus={() => setFocusedInput("businessName")}
              onBlur={() => setFocusedInput(null)}
              placeholder="e.g. Great Events Decor"
              placeholderTextColor="#9E9E9E"
            />
            {formErrors.businessName && <Text style={styles.errorText}>{formErrors.businessName}</Text>}
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Description <Text style={{ color: "#EF4444" }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textInput,
                styles.textArea,
                focusedInput === "description" && styles.textInputFocused,
                formErrors.description && styles.textInputError,
              ]}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (formErrors.description) {
                  setFormErrors((prev) => ({ ...prev, description: null }));
                }
              }}
              onFocus={() => setFocusedInput("description")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Describe your services..."
              placeholderTextColor="#9E9E9E"
              multiline
              numberOfLines={4}
            />
            {formErrors.description && <Text style={styles.errorText}>{formErrors.description}</Text>}
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Address <Text style={{ color: "#EF4444" }}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.textInput,
                focusedInput === "address" && styles.textInputFocused,
                formErrors.address && styles.textInputError,
              ]}
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                if (formErrors.address) {
                  setFormErrors((prev) => ({ ...prev, address: null }));
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

          {/* Services Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Service <Text style={{ color: "#EF4444" }}>*</Text>
            </Text>
            {loadingServices ? (
              <ActivityIndicator size="small" color="#9A3412" style={{ alignSelf: "flex-start", marginVertical: 10 }} />
            ) : (
              <TouchableOpacity
                style={[
                  styles.dropdownSelector,
                  formErrors.service && styles.textInputError,
                ]}
                activeOpacity={0.7}
                onPress={() => setModalVisible(true)}
              >
                <Text style={selectedService ? styles.dropdownText : styles.dropdownPlaceholder}>
                  {selectedService ? selectedService.title : "Select a service"}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#64748B" />
              </TouchableOpacity>
            )}
            {formErrors.service && <Text style={styles.errorText}>{formErrors.service}</Text>}
          </View>

          {/* Submit Action */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.disabledButton]}
            onPress={handleApply}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Application</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* SERVICE SELECTION MODAL */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Service</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={servicesList}
              keyExtractor={(item) => item.id || item._id}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedService && (selectedService.id === item.id || selectedService._id === item._id) && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    setSelectedService(item);
                    setModalVisible(false);
                    if (formErrors.service) {
                      setFormErrors((prev) => ({ ...prev, service: null }));
                    }
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedService && (selectedService.id === item.id || selectedService._id === item._id) && styles.modalItemTextSelected
                  ]}>
                    {item.title}
                  </Text>
                  {selectedService && (selectedService.id === item.id || selectedService._id === item._id) && (
                    <Ionicons name="checkmark" size={20} color="#9A3412" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyServicesText}>No services available</Text>
              }
            />
          </View>
        </View>
      </Modal>

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
  formIntro: {
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  introSubtext: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  fieldsContainer: {
    paddingHorizontal: 4,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#222",
    marginBottom: 6,
  },
  textInput: {
    height: 46,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#FFF",
    fontSize: 14,
    color: "#222",
  },
  textArea: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  textInputFocused: {
    borderColor: "#9A3412",
  },
  textInputError: {
    borderColor: "#E53935",
  },
  dropdownSelector: {
    height: 46,
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
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: "#9E9E9E",
  },
  disabledDropdown: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E2E2E2",
  },
  submitButton: {
    height: 48,
    backgroundColor: "#9A3412",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
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
  submitButtonText: {
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
  emptyServicesText: {
    textAlign: "center",
    marginVertical: 24,
    color: "#64748B",
    fontSize: 14,
  },
});
