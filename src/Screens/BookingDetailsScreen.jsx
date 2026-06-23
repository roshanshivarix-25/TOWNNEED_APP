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
  Linking,
  Platform,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getBookingDetailsApi } from "../api/services";

export default function BookingDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await getBookingDetailsApi(id);
          setBooking(data);
        } else {
          Alert.alert("Error", "No booking ID provided");
        }
      } catch (err) {
        console.log("Failed to load booking details:", err.message);
        Alert.alert("Error", "Could not load booking details");
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [id]);

  const handleCallVendor = (phone) => {
    if (!phone) return;
    const sanitized = phone.replace(/[^\d+]/g, "");
    Linking.openURL(`tel:${sanitized}`).catch((err) => {
      console.log("Failed to dial number:", err);
      Alert.alert("Error", "Could not open dial pad");
    });
  };

  const getStatusDetails = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "pending":
        return { bg: "#FEF3C7", text: "#B45309", label: "Pending Approval", icon: "hourglass-outline" };
      case "accepted":
      case "confirmed":
        return { bg: "#DCFCE7", text: "#166534", label: "Confirmed", icon: "checkmark-circle-outline" };
      case "on the way":
        return { bg: "#DBEAFE", text: "#1E40AF", label: "On the way", icon: "bicycle-outline" };
      case "completed":
      case "done":
        return { bg: "#E0F2FE", text: "#0369A1", label: "Completed", icon: "ribbon-outline" };
      case "cancelled":
        return { bg: "#FEE2E2", text: "#991B1B", label: "Cancelled", icon: "close-circle-outline" };
      default:
        return { bg: "#F3F4F6", text: "#4B5563", label: status, icon: "information-circle-outline" };
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#9A3412" />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Booking not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusStyle = getStatusDetails(booking.status);
  const formattedDate = booking.eventDate
    ? new Date(booking.eventDate).toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not specified";

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
          <Text style={styles.headerTitle}>Booking Details</Text>
          <Text style={styles.headerSubtitle}>
            ID: {booking.orderId || booking.id || booking._id}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* STATUS CARD */}
        <View style={[styles.card, styles.statusCard, { backgroundColor: statusStyle.bg }]}>
          <Ionicons name={statusStyle.icon} size={28} color={statusStyle.text} />
          <View style={styles.statusInfo}>
            <Text style={[styles.statusLabel, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
            <Text style={styles.statusDesc}>
              {booking.status === "confirmed" 
                ? "Your booking is confirmed. Vendor will arrive at the scheduled time."
                : `Booking status is currently ${booking.status}.`}
            </Text>
          </View>
        </View>

        {/* SERVICE & PACKAGE DETAILS */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Service Details</Text>
          
          <View style={styles.serviceRow}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name="campground" size={20} color="#9A3412" />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceTitle}>{booking.serviceId?.title || "Service"}</Text>
              <Text style={styles.serviceDescText}>{booking.serviceId?.description}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoGrid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Event Type</Text>
              <Text style={styles.gridValue}>{booking.eventType || "General"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Guests Count</Text>
              <Text style={styles.gridValue}>{booking.guestCount || "N/A"}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color="#64748B" />
            <Text style={styles.detailText}>{formattedDate}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color="#64748B" />
            <Text style={styles.detailText}>{booking.venue || "Venue address not provided"}</Text>
          </View>
        </View>

        {/* PACKAGE DETAILS */}
        {booking.packageId && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Selected Package</Text>
            <View style={styles.packageHeaderRow}>
              <Text style={styles.packageTitle}>{booking.packageId.title}</Text>
              <Text style={styles.packagePrice}>₹{booking.packageId.price?.toLocaleString("en-IN")}</Text>
            </View>
            <Text style={styles.packageDesc}>{booking.packageId.description}</Text>

            {(() => {
              let featuresList = [];
              const feats = booking.packageId.features;
              if (feats) {
                if (Array.isArray(feats)) {
                  feats.forEach((feat) => {
                    if (typeof feat === "string") {
                      const splitFeats = feat.split(",").map(f => f.trim()).filter(Boolean);
                      featuresList.push(...splitFeats);
                    } else if (feat) {
                      featuresList.push(feat);
                    }
                  });
                } else if (typeof feats === "string") {
                  featuresList = feats.split(",").map(f => f.trim()).filter(Boolean);
                }
              }

              if (featuresList.length === 0) return null;

              return (
                <View style={styles.featuresContainer}>
                  {featuresList.map((feature, idx) => (
                    <View key={idx} style={styles.featureTag}>
                      <Ionicons name="checkmark-circle" size={12} color="#9A3412" style={{ marginRight: 4 }} />
                      <Text style={styles.featureTagText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              );
            })()}
          </View>
        )}

        {/* ADDONS DETAILS */}
        {booking.addons && booking.addons.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Add-ons Selection</Text>
            {booking.addons.map((addon, idx) => (
              <View key={addon.id || addon._id}>
                <View style={styles.addonItemRow}>
                  <View style={styles.addonLeft}>
                    <Text style={styles.addonTitle}>{addon.title}</Text>
                    <Text style={styles.addonDesc} numberOfLines={1}>{addon.description}</Text>
                  </View>
                  <Text style={styles.addonPrice}>₹{addon.price?.toLocaleString("en-IN")}</Text>
                </View>
                {idx < booking.addons.length - 1 && <View style={styles.itemSeparator} />}
              </View>
            ))}
          </View>
        )}

        {/* VENDOR DETAILS */}
        {booking.vendorId ? (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Vendor Profile</Text>
            <Text style={styles.vendorName}>{booking.vendorId.businessName}</Text>
            <Text style={styles.vendorDesc}>{booking.vendorId.description}</Text>
            <Text style={styles.vendorAddress}>
              {booking.vendorId.address}, {booking.vendorId.city}
            </Text>

            {booking.vendorId.phone && (
              <View style={[styles.detailRow, { marginTop: 12 }]}>
                <Ionicons name="call-outline" size={18} color="#64748B" />
                <Text style={styles.detailText}>{booking.vendorId.phone}</Text>
              </View>
            )}

            {booking.vendorId?.phone && (
              <TouchableOpacity
                style={styles.callButton}
                activeOpacity={0.8}
                onPress={() => handleCallVendor(booking.vendorId.phone)}
              >
                <Ionicons name="call" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.callButtonText}>Call Vendor</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={[styles.card, styles.pendingVendorCard]}>
            <Ionicons name="people-outline" size={24} color="#64748B" />
            <Text style={styles.pendingVendorText}>Assigning local vendor shortly</Text>
          </View>
        )}

        {/* PAYMENT TRANSACTIONS CARD */}
        {booking.payments && booking.payments.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Payment Details</Text>
            {(() => {
              const payment = booking.payments[0];
              const statusColors = payment.status === "paid" 
                ? { bg: "#DCFCE7", text: "#166534" } 
                : { bg: "#FEF3C7", text: "#B45309" };
              return (
                <View style={styles.paymentTransactionBlock}>
                  <View style={styles.paymentHeaderRow}>
                    <View style={styles.paymentMethodWrapper}>
                      <Ionicons name="card-outline" size={16} color="#9A3412" />
                      <Text style={styles.paymentMethodText}>
                        {payment.paymentMethod?.toUpperCase() || "N/A"}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>
                        {payment.status || "pending"}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.paymentDetailGrid}>
                    <View style={styles.paymentGridItem}>
                      <Text style={styles.paymentGridLabel}>Amount</Text>
                      <Text style={styles.paymentGridValue}>₹{payment.amount?.toLocaleString("en-IN")}</Text>
                    </View>
                    <View style={styles.paymentGridItem}>
                      <Text style={styles.paymentGridLabel}>Date</Text>
                      <Text style={styles.paymentGridValue}>
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : "N/A"}
                      </Text>
                    </View>
                  </View>

                  {payment.razorpayPaymentId && (
                    <View style={styles.paymentSubRow}>
                      <Text style={styles.paymentSubLabel}>Razorpay Payment ID: </Text>
                      <Text style={styles.paymentSubValue}>{payment.razorpayPaymentId}</Text>
                    </View>
                  )}

                  {payment.razorpayOrderId && (
                    <View style={styles.paymentSubRow}>
                      <Text style={styles.paymentSubLabel}>Razorpay Order ID: </Text>
                      <Text style={styles.paymentSubValue}>{payment.razorpayOrderId}</Text>
                    </View>
                  )}
                </View>
              );
            })()}
          </View>
        )}

        {/* PAYMENT & RECEIPT CARD */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Payment Summary</Text>
          
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Base Package Price</Text>
            <Text style={styles.receiptValue}>
              ₹{booking.packageId ? booking.packageId.price?.toLocaleString("en-IN") : "0"}
            </Text>
          </View>
          
          {booking.addons && booking.addons.length > 0 && (
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Addons</Text>
              <Text style={styles.receiptValue}>
                ₹{booking.addons.reduce((acc, a) => acc + (a.price || 0), 0).toLocaleString("en-IN")}
              </Text>
            </View>
          )}

          <View style={styles.receiptSeparator} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid (COD)</Text>
            <Text style={styles.totalValue}>₹{booking.totalAmount?.toLocaleString("en-IN")}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 16,
    color: "#E53935",
    fontWeight: "600",
    marginBottom: 16,
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#9A3412",
    borderRadius: 8,
  },
  backBtnText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EAE9E4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
  },
  statusInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "800",
  },
  statusDesc: {
    fontSize: 12,
    color: "#475569",
    marginTop: 4,
    lineHeight: 16,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFEDE8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  serviceDescText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  gridValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
    marginTop: 2,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  detailText: {
    fontSize: 13,
    color: "#334155",
    marginLeft: 8,
    fontWeight: "500",
  },
  packageHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#9A3412",
  },
  packageDesc: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 6,
    lineHeight: 18,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 6,
  },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDF8F6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#FFEDE8",
  },
  featureTagText: {
    fontSize: 11,
    color: "#9A3412",
    fontWeight: "600",
  },
  addonItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  addonLeft: {
    flex: 1,
    marginRight: 10,
  },
  addonTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  addonDesc: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  addonPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  itemSeparator: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  vendorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  vendorDesc: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 18,
  },
  vendorAddress: {
    fontSize: 12,
    color: "#475569",
    marginTop: 6,
    fontWeight: "500",
  },
  callButton: {
    flexDirection: "row",
    backgroundColor: "#9A3412",
    borderRadius: 10,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  callButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  pendingVendorCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    borderWidth: 1.5,
  },
  pendingVendorText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  receiptLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  receiptValue: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "600",
  },
  receiptSeparator: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#9A3412",
  },
  paymentTransactionBlock: {
    paddingVertical: 4,
  },
  paymentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  paymentMethodWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  paymentDetailGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 16,
  },
  paymentGridItem: {
    flex: 1,
  },
  paymentGridLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  paymentGridValue: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "700",
    marginTop: 2,
  },
  paymentSubRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  paymentSubLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  paymentSubValue: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "700",
  },
  paymentDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
});
