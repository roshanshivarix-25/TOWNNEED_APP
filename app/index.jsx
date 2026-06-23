import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();

  // Animation values
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.85)).current;
  const textOpacityAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Run animations
    Animated.parallel([
      Animated.timing(logoFadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(logoScaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(textOpacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacityAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Check session
    const checkSession = async () => {
      const startTime = Date.now();
      let targetRoute = "/login";

      try {
        const token = await AsyncStorage.getItem("token");
        const expiry = await AsyncStorage.getItem("tokenExpiry");

        if (token) {
          if (expiry) {
            const now = new Date();
            const expiryDate = new Date(expiry);
            if (now <= expiryDate) {
              targetRoute = "/home";
            } else {
              await AsyncStorage.multiRemove(["token", "tokenExpiry", "user"]);
            }
          } else {
            targetRoute = "/home";
          }
        }
      } catch (error) {
        console.log("Session verification error:", error);
      }

      const elapsedTime = Date.now() - startTime;
      const delay = Math.max(0, 1800 - elapsedTime);

      setTimeout(() => {
        router.replace(targetRoute);
      }, delay);
    };

    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Animated Logo Container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoFadeAnim,
            transform: [{ scale: logoScaleAnim }],
          },
        ]}
      >
        <Image
          source={require("../assets/AppLogo/TownNeed.png")}
          style={{ width: 140, height: 140, marginBottom: 12 }}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>TOWNNEED</Text>
      </Animated.View>

      {/* Loading Text */}
      <View style={styles.loadingContainer}>
        <Animated.Text style={[styles.loadingText, { opacity: textOpacityAnim }]}>
          Loading your preferences...
        </Animated.Text>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "900",
    color: "#A2441D",
    letterSpacing: 2,
    marginTop: 10,
  },
  loadingContainer: {
    position: "absolute",
    bottom: 80,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 10,
  },
  progressTrack: {
    width: width * 0.5,
    height: 4,
    backgroundColor: "#F1F5F9",
    borderRadius: 2,
  },
  progressFill: {
    width: "60%",
    height: "100%",
    backgroundColor: "#A2441D",
    borderRadius: 2,
  },
});
