import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getMeApi, logoutApi } from "../api/auth";
import BottomTab from "../Components/BottomTab";

export default function ProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState({
    name: "User Name",
    phone: "+91 00000 00000",
    location: "Location",
    email: "Email Address",
  });

  const fetchUserDetails = useCallback(async () => {
    try {
      const userJson = await AsyncStorage.getItem("user");
      if (userJson) {
        const userObj = JSON.parse(userJson);
        setUser({
          name: userObj.fullName || userObj.name || "User Name",
          phone: userObj.phone || "+910000000000",
          location: userObj.location || "Location",
          email: userObj.email || "Email Address",
        });
      } else {
        const apiUser = await getMeApi().catch(() => null);
        if (apiUser) {
          setUser({
            name: apiUser.fullName || apiUser.name || "User Name",
            phone: apiUser.phone || "+910000000000",
            location: apiUser.location || "Location",
            email: apiUser.email || "Email Address",
          });
        }
      }
    } catch (e) {
      console.log("Failed to fetch user in ProfileScreen:", e);
    }
  }, []);

  useEffect(() => {
    fetchUserDetails();
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUserDetails();
    });
    return unsubscribe;
  }, [navigation, fetchUserDetails]);

  const handleLogout = async () => {
    try {
      await logoutApi();
      console.log("[LOGOUT] API logout successful");
    } catch (err) {
      console.log("[LOGOUT] API logout failed:", err.message || err);
    }

    try {
      await AsyncStorage.multiRemove(["token", "tokenExpiry", "user"]);
      console.log("[LOGOUT] Local session cleared successfully");
      router.replace("/login");
    } catch (e) {
      console.log("[LOGOUT] Local session clear failed:", e);
    }
  };

  const menuItems = [
    { id: "addresses", title: "Saved addresses", icon: "location-outline", emoji: "📍" },
    { id: "payments", title: "Payment methods", icon: "card-outline", emoji: "💳" },
    { id: "notifications", title: "Notifications", icon: "notifications-outline", emoji: "🔔" },
    { id: "vendor", title: "Vendor bano", icon: "briefcase-outline", emoji: "🤝" },
  ];

  const formatPhone = (phoneStr) => {
    if (!phoneStr) return "";
    const cleaned = phoneStr.replace(/\s+/g, "");
    if (cleaned.length > 3) {
      return cleaned.slice(0, 3) + " " + cleaned.slice(3);
    }
    return cleaned;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F9F9F8", paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F8" />
      {/* FIXED HEADER */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Mera Profile</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Profile Details Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <Ionicons name="person" size={44} color="#9A3412" />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={15} color="#9A3412" style={{ marginRight: 4 }} />
            <Text style={styles.userLocation}>{user.location}</Text>
          </View>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => router.navigate("/edit-profile")}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={14} color="#9A3412" style={{ marginRight: 4 }} />
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Services</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.ratingWrapper}>
              <Text style={styles.statNumber}>4.9</Text>
              <Ionicons name="star" size={20} color="#F59E0B" style={styles.starIcon} />
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Menu Options Container */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, idx) => (
            <View key={item.id}>
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => Alert.alert(item.title, `Opening ${item.title}...`)}
              >
                <View style={styles.menuLeft}>
                  <Text style={styles.menuEmoji}>{item.emoji}</Text>
                  <Text style={styles.menuText}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </TouchableOpacity>
              {idx < menuItems.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </View>

        {/* Logout Action */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Logout →</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomTab active="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F8",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: "#F9F9F8",
    position: "relative",
    minHeight: 56,
  },
  titleContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FFEDE8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFDAD0",
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  userSubtext: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  userLocation: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 4,
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEDE8",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 10,
  },
  editProfileBtnText: {
    color: "#9A3412",
    fontSize: 12,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#A2441D",
  },
  ratingWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginLeft: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    marginTop: 4,
  },
  menuContainer: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuEmoji: {
    fontSize: 18,
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
  separator: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  logoutButton: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  logoutText: {
    color: "#A2441D",
    fontSize: 16,
    fontWeight: "700",
  },
});
