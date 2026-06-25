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
  NativeModules,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RazorpayCheckout from "react-native-razorpay";
import { createPaymentOrderApi, verifyPaymentApi } from "../api/services";

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi"); // default to upi (recommended)

  // Parse parameters passed from CreateBookingScreen
  const bookingId = params.bookingId || "";
  const orderId = params.orderId || "";
  const totalPrice = params.totalPrice ? parseFloat(params.totalPrice) : 0;
  const eventType = params.eventType || "";
  const guestCount = params.guestCount ? parseInt(params.guestCount) : 0;
  const venue = params.venue || "";
  const vendorId = params.vendorId || "";
  const vendorName = params.vendorName || "";
  const packageName = params.packageName || "";
  const addonTitles = params.addonTitles || "";
  const vendorPhone = params.vendorPhone || "";

  // Public key ID from environment variables or hardcoded fallback
  const razorpayKeyId = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_T4xQMkq7AIVmdq";

  const handlePayment = async () => {
    if (!bookingId) {
      Alert.alert("Error", "Booking ID is missing. Please restart the booking process.");
      return;
    }

    try {
      setLoading(true);

      if (paymentMethod === "cash") {
        // --- CASH ON DELIVERY FLOW ---
        console.log("[PaymentScreen] Creating COD order on backend for booking:", bookingId);
        const orderRes = await createPaymentOrderApi(bookingId, totalPrice, true, "cod");

        const orderIdFromBackend = orderRes.data?.paymentId || orderRes.data?.orderId;

        if (!orderRes.success || !orderIdFromBackend) {
          throw new Error(orderRes.message || "Failed to create COD payment order.");
        }

        const transactionId = orderIdFromBackend;

        // Redirect to success screen with status information
        router.replace({
          pathname: "/booking-success",
          params: {
            bookingId,
            orderId: orderIdFromBackend,
            totalPrice: totalPrice.toString(),
            eventType,
            guestCount: guestCount.toString(),
            venue,
            vendorId,
            vendorName,
            packageName,
            addonTitles,
            vendorPhone,
            paymentMethod: "cash",
            paymentStatus: "unpaid",
            transactionId,
            isCOD: "true",
          },
        });
      } else {
        // --- ONLINE PAYMENT FLOW (Razorpay) ---
        // 1. Create Razorpay order on backend
        console.log("[PaymentScreen] Creating order on backend for booking:", bookingId);
        const orderRes = await createPaymentOrderApi(bookingId, totalPrice, false, paymentMethod);

        if (!orderRes.success || !orderRes.data?.orderId) {
          throw new Error(orderRes.message || "Failed to create Razorpay payment order.");
        }

        const rzpOrderId = orderRes.data.orderId;
        const rzpAmount = orderRes.data.amount; // already in paise from backend

        // 2. Configure and Open Razorpay Checkout Sheet
        const options = {
          description: `${eventType} booking for ${guestCount} guests`,
          image: "https://townneed.com/assets/logo.png", // Fallback web logo URL
          currency: "INR",
          key: razorpayKeyId,
          amount: rzpAmount,
          name: "TownNeed",
          order_id: rzpOrderId,
          prefill: {
            email: "customer@townneed.com",
            contact: "9999999999",
            name: "TownNeed Customer",
          },
          theme: { color: "#A2441D" }, 
        };

        console.log("[PaymentScreen] Launching Razorpay SDK with options:", options);
        
        const isRazorpayAvailable = !!NativeModules.RNRazorpayCheckout;
        if (!isRazorpayAvailable) {
          Alert.alert(
            "Razorpay SDK Not Available",
            "The native Razorpay SDK is not available in this build. If you are using Expo Go, please run a custom development build (npx expo run:android or npx expo run:ios) or choose Cash on Delivery instead."
          );
          setLoading(false);
          return;
        }

        RazorpayCheckout.open(options)
          .then(async (data) => {
            // SDK Success returns: razorpay_payment_id, razorpay_order_id, razorpay_signature
            console.log("[PaymentScreen] Razorpay SDK checkout success:", data);
            
            // 3. Verify Payment on Backend
            const verifyPayload = {
              bookingId,
              razorpayPaymentId: data.razorpay_payment_id,
              razorpayOrderId: data.razorpay_order_id,
              paymentMethod, // upi or card
              amount: totalPrice,
              // signature: data.razorpay_signature // in case backend verification demands signature field
            };

            setLoading(true);
            console.log("[PaymentScreen] Calling payment verification API...");
            const verifyRes = await verifyPaymentApi(verifyPayload);

            if (verifyRes.success) {
              console.log("[PaymentScreen] Verification successful, routing to success screen.");
              router.replace({
                pathname: "/booking-success",
                params: {
                  bookingId,
                  orderId: verifyRes.data?.orderId || orderId,
                  totalPrice: totalPrice.toString(),
                  eventType,
                  guestCount: guestCount.toString(),
                  venue,
                  vendorId,
                  vendorName,
                  packageName,
                  addonTitles,
                  vendorPhone,
                  paymentMethod,
                  paymentStatus: "paid",
                  transactionId: data.razorpay_payment_id,
                },
              });
            } else {
              Alert.alert("Verification Failed", verifyRes.message || "Payment signature verification failed.");
            }
          })
          .catch((error) => {
            console.log("[PaymentScreen] Razorpay SDK checkout error / cancelled:", error);
            Alert.alert("Payment Cancelled", error.description || "The checkout sheet was closed.");
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } catch (err) {
      console.log("[PaymentScreen] Payment process failed:", err.message);
      Alert.alert("Payment Error", err.message || "An error occurred while processing payment. Please try again.");
    } finally {
      if (paymentMethod === "cash") {
        setLoading(false);
      }
    }
  };

  const formattedPrice = totalPrice.toLocaleString("en-IN");

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
          <Text style={styles.headerTitle}>Select Payment Method</Text>
          <Text style={styles.headerSubtitle}>Complete booking secure payment</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* PAYMENT AMOUNT CARD */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount to Pay</Text>
          <Text style={styles.amountValue}>₹{formattedPrice}</Text>
        </View>

        <Text style={styles.sectionTitle}>PAYMENT METHODS OPTIONS</Text>

        {/* Option 1: UPI */}
        <TouchableOpacity
          style={[
            styles.paymentCard,
            paymentMethod === "upi" && styles.paymentCardActive,
          ]}
          onPress={() => setPaymentMethod("upi")}
          activeOpacity={0.8}
        >
          <View style={[styles.radioOuter, paymentMethod === "upi" && styles.radioOuterActive]}>
            {paymentMethod === "upi" && <View style={styles.radioInner} />}
          </View>
          <View style={styles.paymentIconWrapper}>
            <MaterialCommunityIcons name="cellphone" size={24} color="#7C3AED" />
          </View>
          <View style={styles.paymentDetails}>
            <Text style={styles.paymentTitle}>UPI / PhonePe</Text>
            <Text style={styles.paymentSubtitle}>Instant Payment</Text>
          </View>
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>Recommended</Text>
          </View>
        </TouchableOpacity>

        {/* Option 2: Cash on Delivery */}
        <TouchableOpacity
          style={[
            styles.paymentCard,
            paymentMethod === "cash" && styles.paymentCardActive,
          ]}
          onPress={() => setPaymentMethod("cash")}
          activeOpacity={0.8}
        >
          <View style={[styles.radioOuter, paymentMethod === "cash" && styles.radioOuterActive]}>
            {paymentMethod === "cash" && <View style={styles.radioInner} />}
          </View>
          <View style={styles.paymentIconWrapper}>
            <FontAwesome5 name="money-bill-wave" size={20} color="#10B981" />
          </View>
          <View style={styles.paymentDetails}>
            <Text style={styles.paymentTitle}>Cash on Delivery</Text>
            <Text style={styles.paymentSubtitle}>Pay on Service (Delivery pe pay karein)</Text>
          </View>
        </TouchableOpacity>



        {/* SECURE NOTICE */}
        <View style={styles.secureNotice}>
          <Ionicons name="shield-checkmark" size={16} color="#64748B" />
          <Text style={styles.secureNoticeText}>Secured by Razorpay. 256-bit SSL Encryption.</Text>
        </View>
      </ScrollView>

      {/* BOTTOM FIXED ACTION BAR */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handlePayment}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.confirmButtonText}>
              {paymentMethod === "cash"
                ? "Confirm Booking (Cash on Delivery)"
                : `Pay ₹${formattedPrice} & Confirm Booking`}
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
  scrollContent: {
    padding: 16,
  },
  amountCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EAE9E4",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#9A3412",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8C8B86",
    letterSpacing: 0.8,
    marginBottom: 12,
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
  secureNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 6,
  },
  secureNoticeText: {
    fontSize: 12,
    color: "#64748B",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  confirmButton: {
    backgroundColor: "#3E7B1D", // Custom green brand color matching mockup
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
