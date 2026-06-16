import { useRouter } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { sendOtpApi } from "../api/auth";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    setError("");
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      const formattedPhone = `+91${phone}`;
      const res = await sendOtpApi(formattedPhone);
      router.push({
        pathname: "/otp",
        params: {
          phone: formattedPhone,
          isFirstLogin: res?.isFirstLogin ? "true" : "false",
        },
      });
    } catch (err) {
      // Mock flow if backend api fails in development environment
      console.log("OTP API ERROR:", err.message);
      // Fallback redirect to test flow easily
      router.push({
        pathname: "/otp",
        params: {
          phone: `+91${phone}`,
          isFirstLogin: "false",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Brand Header */}
        <View style={styles.logoWrapper}>
          <Text style={styles.brandTitle}>TOWNNEED</Text>
          <Text style={styles.brandSubtitle}>Your Local Service Expert</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome to Townneed</Text>
          <Text style={styles.subtitle}>Enter your mobile number to sign in or sign up</Text>

          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              placeholder="Enter 10-digit number"
              style={styles.input}
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setError("");
              }}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleSendOtp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Sending OTP..." : "Get OTP"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFBFB",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 40,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#A2441D", // Custom Townneed theme color
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    height: 54,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#0F172A",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: -10,
    marginBottom: 15,
    marginLeft: 4,
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
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
});

