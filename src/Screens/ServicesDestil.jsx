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
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getServiceDetailApi } from "../api/services";
import CustomDatePicker from "../Components/CustomDatePicker";

const getProcessedFields = (rawFields) => {
  return (rawFields || [
    { name: "eventDate", label: "Event Date", type: "date" },
    { name: "venue", label: "Venue/Delivery Address", type: "text" }
  ])
  .filter(field => field.name !== "eventDuration" && field.name !== "duration")
  .map(field => {
    if (field.type === "date" || field.name.toLowerCase().includes("date")) {
      return { ...field, label: "Service date" };
    }
    return field;
  });
};

export default function ServicesDestil() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  // User selections
  const [selections, setSelections] = useState({});
  const [formValues, setFormValues] = useState({});
  const [imageError, setImageError] = useState(false);

  // DatePicker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDatePickerField, setCurrentDatePickerField] = useState(null);

  const handleOpenDatePicker = (fieldName) => {
    setCurrentDatePickerField(fieldName);
    setShowDatePicker(true);
  };

  const handleSelectDate = (dateString) => {
    setFormValues(prev => ({
      ...prev,
      [currentDatePickerField]: dateString
    }));
    setShowDatePicker(false);
  };

  const getOptionsList = (value) => {
    let list = [];
    if (Array.isArray(value)) list = value;
    else if (typeof value === "string") {
      list = value.split(",").map(item => item.trim()).filter(Boolean);
    }
    return [...new Set(list)];
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await getServiceDetailApi(id);
          setService(data);
          
          // Set initial defaults dynamically
          const initialSelections = {};
          const serviceDataKeys = Object.keys(data?.serviceData || {}).filter(
            key => key !== "fields"
          );
          
          serviceDataKeys.forEach(key => {
            const options = getOptionsList(data.serviceData[key]);
            if (options.length > 0) {
              initialSelections[key] = options[0];
            }
          });
          setSelections(initialSelections);
          
          // Fetch user address if available for prefill
          let userAddressStr = "";
          try {
            const userJson = await AsyncStorage.getItem("user");
            if (userJson) {
              const userObj = JSON.parse(userJson);
              if (userObj && userObj.location) {
                if (typeof userObj.location === "object") {
                  const parts = [];
                  if (userObj.location.address) parts.push(userObj.location.address);
                  if (userObj.location.city) parts.push(userObj.location.city);
                  if (userObj.location.state) parts.push(userObj.location.state);
                  if (userObj.location.pincode) parts.push(userObj.location.pincode);
                  userAddressStr = parts.join(", ");
                } else if (typeof userObj.location === "string") {
                  userAddressStr = userObj.location;
                }
              }
            }
          } catch (err) {
            console.log("Error loading user address for prefill:", err);
          }

          // Initialize form fields
          const initialForm = {};
          const fields = getProcessedFields(data?.serviceData?.fields);
          fields.forEach(field => {
            const fieldName = (field.name || "").toLowerCase();
            if (fieldName.includes("address") || fieldName.includes("venue") || fieldName.includes("location")) {
              initialForm[field.name] = userAddressStr;
            } else {
              initialForm[field.name] = "";
            }
          });
          setFormValues(initialForm);
        }
      } catch (err) {
        console.log("Failed to load service details:", err.message);
        Alert.alert("Error", "Could not load service details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleInputChange = (fieldName, text) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: text,
    }));
  };

  const getFieldIcon = (fieldName) => {
    const name = (fieldName || "").toLowerCase();
    if (name.includes("date")) return "calendar-outline";
    if (name.includes("address") || name.includes("venue") || name.includes("location")) return "location-outline";
    if (name.includes("duration") || name.includes("time") || name.includes("hours")) return "time-outline";
    return "create-outline";
  };

  const getFieldPlaceholder = (fieldLabel) => {
    const label = (fieldLabel || "").toLowerCase();
    if (label.includes("date")) return `${fieldLabel} chunein`;
    if (label.includes("address") || label.includes("venue")) return `${fieldLabel} likhein`;
    return fieldLabel;
  };

  const handleProceed = () => {
    const serviceDataKeys = Object.keys(service?.serviceData || {}).filter(
      key => key !== "fields"
    );
    for (const key of serviceDataKeys) {
      if (!selections[key]) {
        Alert.alert("Error", `Please select ${key}`);
        return;
      }
    }

    // Validate fields
    let missingField = null;
    const fields = getProcessedFields(service?.serviceData?.fields);
    fields.forEach(field => {
      if (!formValues[field.name]?.trim()) {
        missingField = field.label;
      }
    });

    if (missingField) {
      Alert.alert("Error", `Please enter ${missingField}`);
      return;
    }

    // Map dynamic fields to packages screen params
    const eventTypeKey = serviceDataKeys.find(k => k.toLowerCase().includes("type") || k.toLowerCase().includes("event")) || serviceDataKeys[0];
    const guestKey = serviceDataKeys.find(k => k.toLowerCase().includes("guest") || k.toLowerCase().includes("qty") || k.toLowerCase().includes("quantity")) || serviceDataKeys[1];

    router.push({
      pathname: "/packages",
      params: {
        serviceId: id,
        eventType: selections[eventTypeKey] || "",
        guestCount: selections[guestKey] || "",
        selections: JSON.stringify(selections),
        formValues: JSON.stringify(formValues),
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#9A3412" />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Service not found</Text>
      </View>
    );
  }

  const serviceDataKeys = Object.keys(service?.serviceData || {}).filter(
    key => key !== "fields"
  );

  const fields = getProcessedFields(service?.serviceData?.fields);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#FAF9F5" }}
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF9F5" />
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{service.title}</Text>
            <Text style={styles.headerSubtitle}>Event booking</Text>
          </View>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* PROMO HERO CARD */}
          <View style={styles.heroCard}>
            <View style={styles.heroIconWrapper}>
              {(() => {
                const imageUrl = Array.isArray(service.image)
                  ? (Array.isArray(service.image[0]) ? service.image[0][0]?.url : service.image[0]?.url)
                  : (typeof service.image === "string" ? service.image : null);
                if (imageUrl && !imageError) {
                  return (
                    <Image
                      source={{ uri: imageUrl }}
                      style={{ width: "100%", height: "100%", borderRadius: 40 }}
                      resizeMode="cover"
                      onError={() => setImageError(true)}
                    />
                  );
                }
                return <Ionicons name="image-outline" size={42} color="#94A3B8" />;
              })()}
            </View>
            <Text style={styles.heroTitle}>
              {service.title}
            </Text>
            <Text style={styles.heroSubtitle}>
              {service.description || "Setup + breakdown included"}
            </Text>
          </View>

          {/* DYNAMIC OPTION SECTIONS */}
          {serviceDataKeys.map((key) => {
            const options = getOptionsList(service.serviceData[key]);
            if (options.length === 0) return null;
            return (
              <View key={key} style={styles.section}>
                <Text style={styles.sectionTitle}>{key.toUpperCase()}</Text>
                <View style={styles.tagGrid}>
                  {options.map((opt, idx) => {
                    const isSelected = selections[key] === opt;
                    return (
                      <TouchableOpacity
                        key={`${opt}-${idx}`}
                        style={[styles.tagPill, isSelected && styles.tagPillActive]}
                        onPress={() => {
                          setSelections(prev => ({
                            ...prev,
                            [key]: opt
                          }));
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.tagText, isSelected && styles.tagTextActive]}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })/* end map */}

          {/* DYNAMIC FIELDS SECTION */}
          {fields && fields.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DATE AUR VENUE</Text>
              <View style={styles.fieldsContainer}>
                {fields.map((field) => {
                  const isDateField = field.type === "date" || field.name.toLowerCase().includes("date");
                  if (isDateField) {
                    return (
                      <TouchableOpacity
                        key={field.name}
                        style={styles.inputWrapper}
                        activeOpacity={0.8}
                        onPress={() => handleOpenDatePicker(field.name)}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color="#9A3412"
                          style={styles.inputIcon}
                        />
                        <Text style={[
                          styles.textInput,
                          !formValues[field.name] && { color: "#9E9E9E" }
                        ]}>
                          {formValues[field.name] || getFieldPlaceholder(field.label)}
                        </Text>
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <View key={field.name} style={styles.inputWrapper}>
                      <Ionicons
                        name={getFieldIcon(field.name)}
                        size={18}
                        color="#9A3412"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={formValues[field.name]}
                        onChangeText={(text) => handleInputChange(field.name, text)}
                        placeholder={getFieldPlaceholder(field.label)}
                        placeholderTextColor="#9E9E9E"
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        {/* BOTTOM FIXED ACTION BAR */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Starting from</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>₹{service.price?.toLocaleString("en-IN") || "8,000"}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Free setup</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={handleProceed}
            activeOpacity={0.85}
          >
            <Text style={styles.proceedButtonText}>Package dekho</Text>
            <View style={styles.iconCircle}>
              <Ionicons name="arrow-forward" size={16} color="#9A3412" />
            </View>
          </TouchableOpacity>
        </View>

        <CustomDatePicker
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSelectDate={handleSelectDate}
          selectedValue={formValues[currentDatePickerField]}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F5",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#EAE9E4",
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EAE9E4",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
    fontWeight: "500",
  },
  headerMenuBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  heroCard: {
    backgroundColor: "#FFF2EE",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFDAD0",
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  heroIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFEDE8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#9A3412",
    marginBottom: 6,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#C2410C",
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8C8B86",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  tagGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EAE9E4",
  },
  tagPillActive: {
    backgroundColor: "#9A3412",
    borderColor: "#9A3412",
  },
  tagText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  tagTextActive: {
    color: "#FFF",
  },
  guestGrid: {
    flexDirection: "row",
    gap: 8,
  },
  guestPill: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EAE9E4",
    alignItems: "center",
    justifyContent: "center",
  },
  guestPillActive: {
    backgroundColor: "#9A3412",
    borderColor: "#9A3412",
  },
  guestText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  guestTextActive: {
    color: "#FFF",
  },
  fieldsContainer: {
    gap: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EAE9E4",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#EAE9E4",
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 8,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginRight: 8,
  },
  badge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#B45309",
  },
  proceedButton: {
    backgroundColor: "#9A3412",
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  proceedButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
