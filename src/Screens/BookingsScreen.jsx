import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import BottomTab from "../Components/BottomTab";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import { getUserBookingsApi } from "../api/services";

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getUserBookingsApi();
      setBookings(data || []);
    } catch (err) {
      console.log("Failed to load user bookings:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    const unsubscribe = navigation.addListener("focus", () => {
      fetchBookings();
    });
    return unsubscribe;
  }, [navigation]);

  const getServiceDesign = (title) => {
    const t = (title || "").toLowerCase();
    if (t.includes("tent") || t.includes("shamiyana")) {
      return { iconType: "campground", iconLib: "FontAwesome5", iconColor: "#D97706", bgColor: "#FEF3C7" };
    }
    if (t.includes("dhool") || t.includes("mitti") || t.includes("construction")) {
      return { iconType: "truck", iconLib: "FontAwesome5", iconColor: "#4B5563", bgColor: "#F3F4F6" };
    }
    if (t.includes("pani") || t.includes("tanker") || t.includes("water")) {
      return { iconType: "water", iconLib: "Ionicons", iconColor: "#3B82F6", bgColor: "#DBEAFE" };
    }
    if (t.includes("catering") || t.includes("food") || t.includes("khana")) {
      return { iconType: "food-fork-drink", iconLib: "MaterialCommunityIcons", iconColor: "#10B981", bgColor: "#D1FAE5" };
    }
    return { iconType: "build-outline", iconLib: "Ionicons", iconColor: "#7C3AED", bgColor: "#F5F3FF" };
  };

  const getStatusStyle = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "pending") {
      return { bg: "#FEF3C7", text: "#B45309", label: "Pending", progress: 0.2 };
    }
    if (s === "accepted" || s === "on the way") {
      return { bg: "#DBEAFE", text: "#1E40AF", label: s === "accepted" ? "Accepted" : "On the way", progress: 0.6 };
    }
    if (s === "completed" || s === "done") {
      return { bg: "#DCFCE7", text: "#166534", label: "Completed", progress: 1.0 };
    }
    return { bg: "#F3F4F6", text: "#4B5563", label: status, progress: 0.5 };
  };

  const renderIcon = (type, library, color) => {
    if (library === "FontAwesome5") {
      return <FontAwesome5 name={type} size={22} color={color} />;
    } else if (library === "MaterialCommunityIcons") {
      return <MaterialCommunityIcons name={type} size={24} color={color} />;
    } else {
      return <Ionicons name={type} size={24} color={color} />;
    }
  };

  const handleTrackBooking = (booking) => {
    router.push({
      pathname: "/booking-details",
      params: { id: booking.id || booking._id }
    });
  };

  const handlePastBookingPress = (booking) => {
    router.push({
      pathname: "/booking-details",
      params: { id: booking.id || booking._id }
    });
  };

  // Filter bookings
  const activeBookings = bookings.filter(
    (b) =>
      b.status?.toLowerCase() !== "completed" &&
      b.status?.toLowerCase() !== "done" &&
      b.status?.toLowerCase() !== "cancelled"
  );

  const pastBookings = bookings.filter(
    (b) =>
      b.status?.toLowerCase() === "completed" ||
      b.status?.toLowerCase() === "done" ||
      b.status?.toLowerCase() === "cancelled"
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F8", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F8" />
      {/* FIXED HEADER */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Meri Bookings</Text>
        </View>
      </View>

      {/* SCROLLABLE CONTENT */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#A2441D" />
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ACTIVE SECTION */}
          <View style={styles.sectionHeaderLabel}>
            <Text style={styles.sectionTitleLabel}>ACTIVE</Text>
          </View>

          {activeBookings.length === 0 ? (
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <Text style={{ color: "#94A3B8", fontWeight: "600" }}>No active bookings</Text>
            </View>
          ) : (
            activeBookings.map((booking) => {
              const design = getServiceDesign(booking.serviceId?.title);
              const statusStyle = getStatusStyle(booking.status);
              const title = `${booking.serviceId?.title || "Service"} — ${booking.packageId?.title || "Booking"}`;
              const orderId = (booking.id || booking._id || "").slice(-6).toUpperCase();
              const provider = booking.vendorId?.businessName || "Pending allocation";

              return (
                <TouchableOpacity
                  key={booking.id || booking._id}
                  style={styles.activeCard}
                  activeOpacity={0.9}
                  onPress={() => handleTrackBooking(booking)}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: design.bgColor }]}>
                      {renderIcon(design.iconType, design.iconLib, design.iconColor)}
                    </View>
                    <View style={styles.detailsContainer}>
                      <Text style={styles.bookingTitle}>{title}</Text>
                      <Text style={styles.bookingSubtext}>
                        Order #{orderId} • {provider}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                        {statusStyle.label}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${statusStyle.progress * 100}%` }]} />
                    </View>
                  </View>

                  <Text style={styles.trackText}>
                    Amount: <Text style={{ fontWeight: "700", color: "#0F172A" }}>₹{booking.totalAmount?.toLocaleString("en-IN")}</Text> · <Text style={styles.trackLink}>Tap details</Text>
                  </Text>
                </TouchableOpacity>
              );
            })
          )}

          {/* PAST BOOKINGS SECTION */}
          <View style={styles.sectionHeaderLabel}>
            <Text style={styles.sectionTitleLabel}>PAST BOOKINGS</Text>
          </View>

          {pastBookings.length === 0 ? (
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <Text style={{ color: "#94A3B8", fontWeight: "600" }}>No past bookings</Text>
            </View>
          ) : (
            pastBookings.map((booking) => {
              const design = getServiceDesign(booking.serviceId?.title);
              const statusStyle = getStatusStyle(booking.status);
              const title = `${booking.serviceId?.title || "Service"} — ${booking.packageId?.title || "Booking"}`;
              const formattedDate = booking.eventDate
                ? new Date(booking.eventDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })
                : "Done";

              const isCancelled = booking.status?.toLowerCase() === "cancelled";
              return (
                <TouchableOpacity
                  key={booking.id || booking._id}
                  style={styles.activeCard}
                  activeOpacity={0.9}
                  onPress={() => handlePastBookingPress(booking)}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: design.bgColor }]}>
                      {renderIcon(design.iconType, design.iconLib, design.iconColor)}
                    </View>
                    <View style={styles.detailsContainer}>
                      <Text style={styles.bookingTitle}>{title}</Text>
                      <Text style={styles.bookingSubtext}>
                        {formattedDate} · <Text style={styles.priceText}>₹{booking.totalAmount?.toLocaleString("en-IN")}</Text>
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                        {statusStyle.label}
                      </Text>
                    </View>
                  </View>

                  {!isCancelled && (
                    <>
                      {/* Progress Bar */}
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBarBg}>
                          <View style={[styles.progressBarFill, { width: `${statusStyle.progress * 100}%`, backgroundColor: "#166534" }]} />
                        </View>
                      </View>
                      <Text style={styles.trackText}>
                        Booking completed successfully. · <Text style={styles.trackLink}>View details</Text>
                      </Text>
                    </>
                  )}
                  {isCancelled && (
                    <Text style={[styles.trackText, { marginTop: 10, color: "#EF4444" }]}>
                      This booking was cancelled. · <Text style={styles.trackLink}>View details</Text>
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
      <BottomTab active="Bookings" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F8", // Soft warm off-white background matching the UI
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110, // Ensure bottom tab doesn't overlap content
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: "#F9F9F8",
    position: 'relative',
    minHeight: 56,
  },
  titleContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  sectionHeaderLabel: {
    marginBottom: 12,
  },
  sectionTitleLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1,
  },
  activeCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 14,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  bookingSubtext: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  progressContainer: {
    marginTop: 16,
    marginBottom: 10,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "#F1F5F9",
    borderRadius: 2,
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#A2441D", // Theme color
    borderRadius: 2,
  },
  trackText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  trackLink: {
    color: "#A2441D",
    fontWeight: "600",
  },
  pastCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  priceText: {
    color: "#0F172A",
    fontWeight: "600",
  },
});
