import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import BottomTab from "../Components/BottomTab";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const activeBooking = {
    id: "active-1",
    title: "Dhool — 2 trolley Mitti",
    orderId: "TN-DH-4821",
    provider: "Ramesh Kumar",
    eta: "~35 min",
    status: "On the way",
    iconType: "truck",
    iconLib: "FontAwesome5",
    iconColor: "#4B5563",
    bgColor: "#FEF3C7", // Soft warm background
    badgeBg: "#FEF3C7",
    badgeColor: "#B45309",
    progress: 0.6, // 60% progress
  };

  const pastBookings = [
    {
      id: "past-1",
      title: "Tent — Basic Shamiyana",
      time: "5 din pehle",
      price: "₹8,000",
      status: "Done ✓",
      iconType: "campground",
      iconLib: "FontAwesome5",
      iconColor: "#D97706",
      bgColor: "#FEE2E2", // Soft reddish/orange
      badgeBg: "#DCFCE7",
      badgeColor: "#166534",
    },
    {
      id: "past-2",
      title: "Pani Tanker — 1000 L",
      time: "10 din pehle",
      price: "₹350",
      status: "Done ✓",
      iconType: "water",
      iconLib: "Ionicons",
      iconColor: "#3B82F6",
      bgColor: "#DBEAFE", // Soft blue
      badgeBg: "#DCFCE7",
      badgeColor: "#166534",
    },
    {
      id: "past-3",
      title: "Catering — 50 guests",
      time: "1 mahine pehle",
      price: "₹7,500",
      status: "Done ✓",
      iconType: "food-fork-drink",
      iconLib: "MaterialCommunityIcons",
      iconColor: "#10B981",
      bgColor: "#D1FAE5", // Soft green
      badgeBg: "#DCFCE7",
      badgeColor: "#166534",
    },
  ];

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
    Alert.alert(
      "Tracking Order",
      `Driver: ${booking.provider}\nETA: ${booking.eta}\nStatus: ${booking.status}`
    );
  };

  const handlePastBookingPress = (booking) => {
    Alert.alert(
      "Booking Details",
      `${booking.title}\nDate: ${booking.time}\nAmount: ${booking.price}\nStatus: Completed`
    );
  };

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
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ACTIVE SECTION */}
        <View style={styles.sectionHeaderLabel}>
          <Text style={styles.sectionTitleLabel}>ACTIVE</Text>
        </View>

        <TouchableOpacity 
          style={styles.activeCard} 
          activeOpacity={0.9}
          onPress={() => handleTrackBooking(activeBooking)}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconContainer, { backgroundColor: activeBooking.bgColor }]}>
              {renderIcon(activeBooking.iconType, activeBooking.iconLib, activeBooking.iconColor)}
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.bookingTitle}>{activeBooking.title}</Text>
              <Text style={styles.bookingSubtext}>
                Order #{activeBooking.orderId} • {activeBooking.provider}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: activeBooking.badgeBg }]}>
              <Text style={[styles.badgeText, { color: activeBooking.badgeColor }]}>
                {activeBooking.status}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${activeBooking.progress * 100}%` }]} />
            </View>
          </View>

          <Text style={styles.trackText}>
            ETA: {activeBooking.eta} · <Text style={styles.trackLink}>Tap to track</Text>
          </Text>
        </TouchableOpacity>

        {/* PAST BOOKINGS SECTION */}
        <View style={styles.sectionHeaderLabel}>
          <Text style={styles.sectionTitleLabel}>PAST BOOKINGS</Text>
        </View>

        {pastBookings.map((booking) => (
          <TouchableOpacity
            key={booking.id}
            style={styles.pastCard}
            activeOpacity={0.8}
            onPress={() => handlePastBookingPress(booking)}
          >
            <View style={[styles.iconContainer, { backgroundColor: booking.bgColor }]}>
              {renderIcon(booking.iconType, booking.iconLib, booking.iconColor)}
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.bookingTitle}>{booking.title}</Text>
              <Text style={styles.bookingSubtext}>
                {booking.time} · <Text style={styles.priceText}>{booking.price}</Text>
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: booking.badgeBg }]}>
              <Text style={[styles.badgeText, { color: booking.badgeColor }]}>
                {booking.status}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
