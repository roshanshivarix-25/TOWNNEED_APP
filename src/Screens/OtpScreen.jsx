import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useRef } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { verifyOtpApi, resendOtpApi } from "../api/auth";

export default function OtpScreen() {
  const router = useRouter();
  const { phone, isFirstLogin } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      setError("");
      await resendOtpApi(phone);
    } catch (err) {
      console.log("Resend failed:", err.message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP code");
      return;
    }

    if (isFirstLogin === "true" && !agreed) {
      setError("Please agree to the Terms and Conditions to proceed");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await verifyOtpApi(phone, otp);
      const token = result?.accessToken || result?.token;
      
      if (!token) {
        throw new Error("Invalid OTP verification response");
      }

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(result.user || { phone, role: "user" }));

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      await AsyncStorage.setItem("tokenExpiry", expiryDate.toISOString());

      router.replace("/home");
    } catch (err) {
      console.log("OTP verification failed:", err.message);
      setError(err.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color="#1E293B" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>OTP Verification</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit verification code sent to
        </Text>
        <Text style={styles.phoneText}>+91 ******{phone?.slice(-4)}</Text>

        <View style={styles.otpWrapper}>
          <TextInput
            style={styles.hiddenInput}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(text) => {
              setOtp(text);
              if (error) setError("");
            }}
            autoFocus
          />

          <View style={styles.otpContainer}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                style={[
                  styles.otpBox,
                  otp[i] ? styles.otpBoxActive : null,
                  otp.length === i && styles.otpBoxCurrent,
                ]}
              >
                <Text style={styles.otpText}>{otp[i] || ""}</Text>
                {otp.length === i && <View style={styles.cursor} />}
              </View>
            ))}
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResendOtp} disabled={resendLoading}>
            <Text style={styles.resendLink}>
              {resendLoading ? "Sending..." : "Resend OTP"}
            </Text>
          </TouchableOpacity>
        </View>

        {isFirstLogin === "true" && (
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, agreed && styles.checkboxChecked]}
              onPress={() => setAgreed(!agreed)}
            >
              {agreed && <Ionicons name="checkmark" size={14} color="#FFF" />}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>
              I agree to the Townneed Terms of Service & Privacy Policy
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? "Verifying..." : "Verify & Proceed"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFBFB",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
  },
  phoneText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#A2441D",
    marginTop: 4,
    marginBottom: 36,
  },
  otpWrapper: {
    position: "relative",
    width: "100%",
    height: 60,
    justifyContent: "center",
  },
  hiddenInput: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0,
    zIndex: 10,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  otpBox: {
    width: 48,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxActive: {
    borderColor: "#A2441D",
  },
  otpBoxCurrent: {
    borderColor: "#A2441D",
    borderWidth: 2,
  },
  otpText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  cursor: {
    width: 2,
    height: 20,
    backgroundColor: "#A2441D",
    position: "absolute",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 15,
    marginLeft: 4,
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    marginBottom: 32,
  },
  resendLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  resendLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#A2441D",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: "#A2441D",
    borderColor: "#A2441D",
  },
  checkboxText: {
    fontSize: 13,
    color: "#64748B",
    flex: 1,
    lineHeight: 18,
  },
  button: {
    height: 54,
    backgroundColor: "#A2441D",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#A2441D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
