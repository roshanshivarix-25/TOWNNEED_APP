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
  Modal,
  Platform,
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
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, amount_desc, amount_asc
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, confirmed, completed, cancelled

  const [modalVisible, setModalVisible] = useState(false);
  const [tempSortBy, setTempSortBy] = useState("newest");
  const [tempStatusFilter, setTempStatusFilter] = useState("all");

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

  const getFilteredAndSorted = (list) => {
    let result = [...list];

    // 1. Filter by Status
    if (statusFilter !== "all") {
      result = result.filter((b) => {
        const status = (b.status || "").toLowerCase();
        if (statusFilter === "pending") return status === "pending";
        if (statusFilter === "confirmed") return status === "accepted" || status === "confirmed" || status === "on the way";
        if (statusFilter === "completed") return status === "completed" || status === "done";
        if (statusFilter === "cancelled") return status === "cancelled";
        return true;
      });
    }



    // 3. Sort By
    result.sort((a, b) => {
      if (sortBy === "newest") {
        const dateA = a.createdAt ? new Date(a.createdAt) : 0;
        const dateB = b.createdAt ? new Date(b.createdAt) : 0;
        return dateB - dateA;
      }
      if (sortBy === "oldest") {
        const dateA = a.createdAt ? new Date(a.createdAt) : 0;
        const dateB = b.createdAt ? new Date(b.createdAt) : 0;
        return dateA - dateB;
      }
      if (sortBy === "amount_desc") {
        const amtA = a.totalAmount || 0;
        const amtB = b.totalAmount || 0;
        return amtB - amtA;
      }
      if (sortBy === "amount_asc") {
        const amtA = a.totalAmount || 0;
        const amtB = b.totalAmount || 0;
        return amtA - amtB;
      }
      return 0;
    });

    return result;
  };

  // Filter bookings
  const filteredList = getFilteredAndSorted(bookings);

  const activeBookings = filteredList.filter(
    (b) =>
      b.status?.toLowerCase() !== "completed" &&
      b.status?.toLowerCase() !== "done" &&
      b.status?.toLowerCase() !== "cancelled"
  );

  const pastBookings = filteredList.filter(
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
        <TouchableOpacity 
          style={styles.headerFilterBtn} 
          onPress={() => {
            setTempSortBy(sortBy);
            setTempStatusFilter(statusFilter);
            setModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="funnel" size={20} color="#9A3412" />
        </TouchableOpacity>
      </View>

      {/* FILTERS MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <TouchableOpacity 
                  style={styles.clearFilterBtn} 
                  onPress={() => {
                    setTempSortBy("newest");
                    setTempStatusFilter("all");
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="reload" size={12} color="#A2441D" />
                  <Text style={styles.clearFilterText}>Clear Filter</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#0F172A" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Order Status Section */}
              <Text style={styles.filterSectionTitle}>Order Status</Text>
              <View style={styles.filterList}>
                {[
                  { id: "all", label: "All Status" },
                  { id: "confirmed", label: "Confirmed" },
                  { id: "pending", label: "Pending" },
                  { id: "cancelled", label: "Cancelled" },
                ].map((item) => {
                  const isSelected = tempStatusFilter === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.filterListItem, isSelected && styles.filterListItemActive]}
                      onPress={() => setTempStatusFilter(item.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.filterListItemText, isSelected && styles.filterListItemTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Sort By Section */}
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.filterList}>
                {[
                  { id: "newest", label: "Newest First" },
                  { id: "oldest", label: "Oldest First" },
                  { id: "amount_desc", label: "Price: High to Low" },
                  { id: "amount_asc", label: "Price: Low to High" },
                ].map((item) => {
                  const isSelected = tempSortBy === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.filterListItem, isSelected && styles.filterListItemActive]}
                      onPress={() => setTempSortBy(item.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.filterListItemText, isSelected && styles.filterListItemTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Apply Button */}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                setSortBy(tempSortBy);
                setStatusFilter(tempStatusFilter);
                setModalVisible(false);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
            {(statusFilter !== "all" || sortBy !== "newest") && (
              <TouchableOpacity 
                style={styles.clearFilterBtn} 
                onPress={() => {
                  setSortBy("newest");
                  setStatusFilter("all");
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="reload" size={12} color="#A2441D" />
                <Text style={styles.clearFilterText}>Clear Filter</Text>
              </TouchableOpacity>
            )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  headerFilterBtn: {
    position: "absolute",
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FFEDE8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ffd0d0ff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    zIndex: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalScroll: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 12,
    marginBottom: 12,
  },
  filterList: {
    gap: 8,
    marginBottom: 16,
  },
  filterListItem: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  filterListItemActive: {
    backgroundColor: "#FFEDE8",
    borderColor: "#9A3412",
  },
  filterListItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  filterListItemTextActive: {
    color: "#9A3412",
    fontWeight: "700",
  },
  applyButton: {
    backgroundColor: "#9A3412",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
  clearFilterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 0.8,
    borderColor: "#FFDAD0",
    backgroundColor: "#FFEDE8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  clearFilterText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A2441D",
  },
});
