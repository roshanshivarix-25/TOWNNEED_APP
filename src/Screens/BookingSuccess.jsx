import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Linking,
  Alert,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BookingSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // Route parameters
  const orderId = params.orderId || "TN-TT-7723";
  const totalPrice = params.totalPrice ? parseFloat(params.totalPrice) : 11500;
  const eventType = params.eventType || "Shaadi";
  const guestCount = params.guestCount ? parseInt(params.guestCount) : 100;
  const venue = params.venue || "Tajganj, Agra";
  const vendorName = params.vendorName || "Ajay Kumar Tent House";
  const packageName = params.packageName || "Basic Shamiyana";
  const addonTitles = params.addonTitles || "Generator + Chairs";
  const vendorPhone = params.vendorPhone || "9876543210";

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getInitials = (name) => {
    if (!name) return "VN";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleCall = () => {
    const cleanedPhone = vendorPhone.replace(/[^\d+]/g, "");
    Linking.openURL(`tel:${cleanedPhone}`).catch((err) => {
      console.log("Call error:", err);
      Alert.alert("Error", "Could not open dial pad.");
    });
  };

  const handleWhatsApp = () => {
    const cleanedPhone = vendorPhone.startsWith("+") ? vendorPhone : `+91${vendorPhone}`;
    const message = `Hello, I just booked your service "${packageName}" on Townneed (Order: ${orderId}). Please confirm setup details.`;
    const waUrl = `whatsapp://send?phone=${cleanedPhone}&text=${encodeURIComponent(message)}`;
    const webWaUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(waUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(waUrl);
        } else {
          Linking.openURL(webWaUrl); // Fallback to browser WhatsApp link
        }
      })
      .catch(() => {
        Linking.openURL(webWaUrl);
      });
  };

  const initials = getInitials(vendorName);

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF9F5" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9F5" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Checkmark Circle */}
        <View style={styles.animationContainer}>
          <Animated.View
            style={[
              styles.successCircle,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.successInnerBg}>
              <Ionicons name="checkmark" size={38} color="#FFF" />
            </View>
          </Animated.View>
        </View>

        {/* Status Text */}
        <Text style={styles.statusTitle}>Booking confirmed!</Text>
        <Text style={styles.orderIdText}>Order #{orderId}</Text>

        {/* Vendor Info Card */}
        <View style={styles.vendorCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.vendorDetails}>
            <Text style={styles.vendorName}>{vendorName}</Text>
            <Text style={styles.setupText}>Setup: 1 din pehle aayenge</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.callButton}
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>Call karo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={handleWhatsApp}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="whatsapp" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* BOOKING SUMMARY */}
        <Text style={styles.sectionTitle}>BOOKING SUMMARY</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Event</Text>
            <Text style={styles.summaryValue}>{eventType} • {guestCount} guests</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Package</Text>
            <Text style={styles.summaryValue}>{packageName}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Add-ons</Text>
            <Text style={styles.summaryValue}>{addonTitles}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Venue</Text>
            <Text style={styles.summaryValue}>{venue}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total paid</Text>
            <Text style={styles.totalValue}>₹{totalPrice.toLocaleString("en-IN")}</Text>
          </View>
        </View>

        {/* SETUP TIMELINE */}
        <Text style={styles.sectionTitle}>SETUP TIMELINE</Text>
        <View style={styles.timelineCard}>
          {/* Step 1: Payment Confirmed */}
          <View style={styles.timelineRow}>
            <View style={styles.timelineIconActive}>
              <Ionicons name="checkmark-circle" size={18} color="#166534" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitleActive}>Payment confirmed</Text>
              <Text style={styles.timelineSubtitle}>Abhi • Just now</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          {/* Step 2: Vendor Setup */}
          <View style={styles.timelineRow}>
            <View style={styles.timelineIconPending}>
              <Ionicons name="time-outline" size={18} color="#D97706" />
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitlePending}>Vendor 1 din pehle setup karega</Text>
              <Text style={styles.timelineSubtitle}>Coming soon</Text>
            </View>
          </View>

          <View style={styles.timelineLine} />

          {/* Step 3: Event Day */}
          <View style={styles.timelineRow}>
            <View style={styles.timelineIconFuture} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitleFuture}>Event ka din — Enjoy karo!</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace("/home")}
          activeOpacity={0.8}
        >
          <Text style={styles.homeButtonText}>← Home pe wapas jao</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  animationContainer: {
    marginVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  successCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  successInnerBg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 6,
  },
  orderIdText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  vendorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF2EE",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFDAD0",
    padding: 18,
    width: "100%",
    marginBottom: 16,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#E28743",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFF",
  },
  vendorDetails: {
    marginLeft: 14,
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  setupText: {
    fontSize: 12,
    color: "#C2410C",
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    marginBottom: 24,
  },
  callButton: {
    flex: 1,
    backgroundColor: "#A2441D",
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  whatsappButton: {
    flex: 1,
    backgroundColor: "#25D366",
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
  },
  sectionTitle: {
    alignSelf: "flex-start",
    fontSize: 11,
    fontWeight: "700",
    color: "#8C8B86",
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EAE9E4",
    padding: 18,
    width: "100%",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "700",
    textAlign: "right",
    maxWidth: "70%",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
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
    fontSize: 18,
    fontWeight: "800",
    color: "#9A3412",
  },
  timelineCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EAE9E4",
    padding: 20,
    width: "100%",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timelineIconActive: {
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineIconPending: {
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineIconFuture: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F1F5F9",
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitleActive: {
    fontSize: 14,
    fontWeight: "800",
    color: "#166534",
  },
  timelineSubtitle: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 2,
  },
  timelineTitlePending: {
    fontSize: 14,
    fontWeight: "800",
    color: "#D97706",
  },
  timelineTitleFuture: {
    fontSize: 14,
    fontWeight: "700",
    color: "#CBD5E1",
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: "#F1F5F9",
    marginLeft: 8,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#EAE9E4",
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  homeButton: {
    borderWidth: 1.5,
    borderColor: "#EAE9E4",
    backgroundColor: "#FFF",
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  homeButtonText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "800",
  },
});
