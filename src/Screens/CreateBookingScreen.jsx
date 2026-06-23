import React, { useState } from "react";
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
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createBookingApi } from "../api/services";

export default function CreateBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash"); // upi, cash, card

  // Parse parameters
  const serviceId = params.serviceId || "";
  const eventType = params.eventType || "";
  const guestCount = params.guestCount ? parseInt(params.guestCount) : 0;
  const totalPrice = params.totalPrice ? parseFloat(params.totalPrice) : 0;
  const vendorId = params.vendorId || "";
  const vendorName = params.vendorName || "";

  const selectedPackage = params.selectedPackage ? JSON.parse(params.selectedPackage) : null;
  const selectedAddons = params.selectedAddons ? JSON.parse(params.selectedAddons) : [];
  const formValues = params.formValues ? JSON.parse(params.formValues) : {};
  const selections = params.selections ? JSON.parse(params.selections) : {};

  const packagePrice = selectedPackage?.price ? parseFloat(selectedPackage.price) : 0;
  const addonsPrice = selectedAddons.reduce((sum, addon) => sum + (addon.price ? parseFloat(addon.price) : 0), 0);

  // Extract eventDate and venue dynamically from formValues
  const eventDateKey = Object.keys(formValues).find(key => key.toLowerCase().includes("date"));
  const venueKey = Object.keys(formValues).find(key => 
    key.toLowerCase().includes("address") || 
    key.toLowerCase().includes("venue") || 
    key.toLowerCase().includes("location")
  );

  const eventDate = eventDateKey ? formValues[eventDateKey] : "";
  const venue = venueKey ? formValues[venueKey] : "";

  const addonsList = selectedAddons.map(a => a.id || a._id).filter(Boolean);
  const addonTitles = selectedAddons.map(a => a.title).join(" + ") || "None";

  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (typeof dateStr !== "string") return new Date(dateStr);
    if (dateStr.includes("-")) return new Date(dateStr);
    
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateStr);
  };

  const handleConfirmOrder = async () => {
    try {
      setLoading(true);

      // Combine selections and formValues into bookingData object.
      // Convert numeric fields (like guest numbers) to actual Numbers if possible.
      const combinedBookingData = {};
      Object.keys(selections).forEach(key => {
        const val = selections[key];
        combinedBookingData[key] = (val && !isNaN(val)) ? Number(val) : val;
      });
      Object.keys(formValues).forEach(key => {
        combinedBookingData[key] = formValues[key];
      });

      // Format date to YYYY-MM-DD
      const parsedDateObj = parseDate(eventDate);
      const y = parsedDateObj.getFullYear();
      const m = String(parsedDateObj.getMonth() + 1).padStart(2, "0");
      const d = String(parsedDateObj.getDate()).padStart(2, "0");
      const formattedBookingDate = `${y}-${m}-${d}`;

      // 1. Post Booking Data
      const bookingPayload = {
        serviceId,
        packageId: selectedPackage?.id || selectedPackage?._id || "",
        vendorId,
        bookingDate: formattedBookingDate,
        bookingAddress: venue || "",
        addons: addonsList,
        bookingData: combinedBookingData,
      };

      const bookingResult = await createBookingApi(bookingPayload);
      const bookingId = bookingResult?.id || bookingResult?._id;

      if (!bookingId) {
        throw new Error("Failed to retrieve Booking ID from success response");
      }

      router.replace({
        pathname: "/payment",
        params: {
          bookingId,
          orderId: bookingResult?.orderId || `TN-TT-${bookingId.slice(-4).toUpperCase()}`,
          totalPrice: totalPrice.toString(),
          eventType,
          guestCount: guestCount.toString(),
          venue,
          vendorId,
          vendorName,
          packageName: selectedPackage?.title || "",
          addonTitles,
          vendorPhone: params.vendorPhone || "9876543210",
        },
      });
    } catch (err) {
      console.log("Order placement failed:", err.message);
      Alert.alert("Error", err.message || "Failed to complete the booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.headerTitle}>Order confirm karo</Text>
          <Text style={styles.headerSubtitle}>Final step</Text>
        </View>
        <TouchableOpacity style={styles.headerMenuBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ORDER SUMMARY */}
        <Text style={styles.sectionTitle}>ORDER SUMMARY</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Event</Text>
            <Text style={styles.summaryValue}>{eventType} • {guestCount} guests</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Package</Text>
            <Text style={styles.summaryValue}>{selectedPackage?.title || "None"}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Add-ons</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>{addonTitles}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Vendor</Text>
            <Text style={styles.summaryValue}>{vendorName}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Venue</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>{venue}</Text>
          </View>

        </View>

        {/* BILL DETAILS */}
        <Text style={styles.sectionTitle}>BILL DETAILS</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Package Price</Text>
            <Text style={styles.summaryValue}>₹{packagePrice.toLocaleString("en-IN")}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Add-ons Price</Text>
            <Text style={styles.summaryValue}>₹{addonsPrice.toLocaleString("en-IN")}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{totalPrice.toLocaleString("en-IN")}</Text>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM FIXED CONFIRM BAR */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmOrder}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.confirmButtonText}>
              Proceed to Payment
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8C8B86",
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EAE9E4",
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
    maxWidth: "70%",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#9A3412",
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EAE9E4",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  paymentCardActive: {
    borderColor: "#9A3412",
    borderWidth: 1.5,
    backgroundColor: "#FFFBF9",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioOuterActive: {
    borderColor: "#9A3412",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#9A3412",
  },
  paymentIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  recommendedBadge: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#A7F3D0",
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#065F46",
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
  confirmButton: {
    backgroundColor: "#3E7B1D", // Custom premium green theme color matching the mockup
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
