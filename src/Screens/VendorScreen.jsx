import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getVendorsApi } from "../api/services";

export default function VendorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const totalPrice = params.totalPrice ? parseFloat(params.totalPrice) : 8000;
  
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendorId, setSelectedVendorId] = useState(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        const data = await getVendorsApi();
        setVendors(data || []);
        if (data && data.length > 0) {
          setSelectedVendorId(data[0].id || data[0]._id);
        }
      } catch (err) {
        console.log("Failed to load vendors:", err.message);
        Alert.alert("Error", "Could not fetch vendors");
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const getInitials = (name) => {
    if (!name) return "VN";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarBg = (index) => {
    const colors = [
      { bg: "#FDF2E9", text: "#A2441D" }, // Peach / Orange-brown
      { bg: "#EEF2FF", text: "#4F46E5" }, // Indigo
      { bg: "#ECFDF5", text: "#059669" }, // Emerald
      { bg: "#F5F3FF", text: "#7C3AED" }, // Purple
    ];
    return colors[index % colors.length];
  };

  const selectedVendor = vendors.find(
    (v) => (v.id || v._id) === selectedVendorId
  );

  const handleProceed = () => {
    if (!selectedVendor) {
      Alert.alert("Chunein", "Kripya ek vendor chunein");
      return;
    }
    router.push({
      pathname: "/booking-confirm",
      params: {
        serviceId: params.serviceId,
        eventType: params.eventType,
        guestCount: params.guestCount,
        formValues: params.formValues,
        selectedPackage: params.selectedPackage,
        selectedAddons: params.selectedAddons,
        totalPrice: params.totalPrice,
        vendorId: selectedVendorId,
        vendorName: selectedVendor.businessName,
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

  const activeCity = vendors[0]?.city || "";

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF9F5" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F5" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Vendor chunein</Text>
          <Text style={styles.headerSubtitle}>
            {activeCity} mein {vendors.length} available
          </Text>
        </View>
        <TouchableOpacity style={styles.headerMenuBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* VENDOR LIST */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 160 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {vendors.map((vendor, index) => {
          const isSelected = (vendor.id || vendor._id) === selectedVendorId;
          const avatarColors = getAvatarBg(index);
          const initials = getInitials(vendor.businessName);
          const rating = vendor.rating !== undefined ? vendor.rating : 0;
          const totalEvents = vendor.totalEvents !== undefined ? vendor.totalEvents : 0;

          return (
            <TouchableOpacity
              key={vendor.id || vendor._id}
              style={[
                styles.vendorCard,
                isSelected && styles.vendorCardActive,
              ]}
              onPress={() => setSelectedVendorId(vendor.id || vendor._id)}
              activeOpacity={0.9}
            >
              {/* Left Initials Circle */}
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: avatarColors.bg },
                ]}
              >
                <Text style={[styles.avatarText, { color: avatarColors.text }]}>
                  {initials}
                </Text>
              </View>

              {/* Middle Details */}
              <View style={styles.detailsBlock}>
                <Text style={styles.businessName} numberOfLines={1}>
                  {vendor.businessName}
                </Text>
                
                <View style={styles.metaRow}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {rating} <Text style={styles.bullet}>•</Text> {totalEvents} events
                  </Text>
                </View>

                <View style={styles.badgeRow}>
                  {vendor.description ? (
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagText}>{vendor.description}</Text>
                    </View>
                  ) : null}

                  {vendor.verified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>Verified ✓</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Right Block */}
              <View style={styles.rightBlock}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* BOTTOM BILLING DETAILS AND PROCEED BAR */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.billingRow}>
          <Text style={styles.selectedVendorLabel}>
            {selectedVendor ? `${selectedVendor.businessName} - Total` : "Total price"}
          </Text>
          <Text style={styles.totalPriceValue}>
            ₹{totalPrice.toLocaleString("en-IN")}
          </Text>
        </View>

        {/* Proceed Action Button */}
        <TouchableOpacity
          style={styles.proceedButton}
          onPress={handleProceed}
          activeOpacity={0.85}
        >
          <Text style={styles.proceedButtonText}>Aage badho</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F5",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#FAF9F5",
    borderBottomWidth: 1,
    borderColor: "#EAE9E4",
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#EAE9E4",
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  headerMenuBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  vendorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAE9E4",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  vendorCardActive: {
    borderColor: "#9A3412",
    borderWidth: 1.5,
    backgroundColor: "#FFFBF9",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "800",
  },
  detailsBlock: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  businessName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginLeft: 4,
  },
  bullet: {
    color: "#94A3B8",
    marginHorizontal: 4,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tagBadge: {
    backgroundColor: "#9A3412",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: "#FFF",
    fontWeight: "700",
  },
  verifiedBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 11,
    color: "#166534",
    fontWeight: "700",
  },
  rightBlock: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: "100%",
  },
  distanceText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    marginBottom: 8,
  },
  priceContainer: {
    backgroundColor: "#FFF2EE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#9A3412",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  billingRow: {
    marginBottom: 16,
  },
  selectedVendorLabel: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "700",
    marginBottom: 4,
  },
  totalPriceValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#9A3412",
  },
  proceedButton: {
    backgroundColor: "#9A3412",
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  proceedButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
