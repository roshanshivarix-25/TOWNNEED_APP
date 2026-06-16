import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomTab({ active = "Home" }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleTabPress = (tabName, route) => {
    if (active === tabName) return;
    router.replace(route);
  };

  const dynamicPaddingBottom = Math.max(insets.bottom, Platform.OS === "ios" ? 18 : 8);
  const dynamicHeight = 56 + dynamicPaddingBottom;

  return (
    <View style={styles.wrapper}>
      {/* Background fill for safe area */}
      <View style={styles.bottomFill} />

      <View style={[styles.bottomNav, { height: dynamicHeight, paddingBottom: dynamicPaddingBottom }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress("Home", "/home")}
          activeOpacity={0.8}
        >
          <Ionicons
            name={active === "Home" ? "home" : "home-outline"}
            size={22}
            color={active === "Home" ? "#A2441D" : "#64748B"}
          />
          <Text style={[styles.navText, active === "Home" && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress("Bookings", "/bookings")}
          activeOpacity={0.8}
        >
          <Ionicons
            name={active === "Bookings" ? "clipboard" : "clipboard-outline"}
            size={22}
            color={active === "Bookings" ? "#A2441D" : "#64748B"}
          />
          <Text style={[styles.navText, active === "Bookings" && styles.activeNavText]}>Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress("Search", "/search")}
          activeOpacity={0.8}
        >
          <Ionicons
            name={active === "Search" ? "search" : "search-outline"}
            size={22}
            color={active === "Search" ? "#A2441D" : "#64748B"}
          />
          <Text style={[styles.navText, active === "Search" && styles.activeNavText]}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => handleTabPress("Profile", "/profile")}
          activeOpacity={0.8}
        >
          <Ionicons
            name={active === "Profile" ? "person" : "person-outline"}
            size={22}
            color={active === "Profile" ? "#A2441D" : "#64748B"}
          />
          <Text style={[styles.navText, active === "Profile" && styles.activeNavText]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  bottomFill: {
    position: "absolute",
    bottom: -100,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "#FFF",
  },
  bottomNav: {
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 8,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: "100%",
  },
  navText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 4,
  },
  activeNavText: {
    color: "#A2441D",
    fontWeight: "700",
  },
});
