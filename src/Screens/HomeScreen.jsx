import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMeApi } from "../api/auth";

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("Guest");
  const [selectedTab, setSelectedTab] = useState("Home");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const userObj = JSON.parse(userJson);
          setUserName(userObj.name || "User");
        } else {
          const apiUser = await getMeApi();
          setUserName(apiUser?.name || "User");
        }
      } catch (e) {
        console.log("Failed to load user details:", e);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "tokenExpiry", "user"]);
      router.replace("/login");
    } catch (e) {
      console.error(e);
    }
  };

  const services = [
    {
      id: 1,
      title: "Tent / Shamiyana",
      subtext: "Events ke liye",
      iconType: "campground",
      iconLib: "FontAwesome5",
      iconColor: "#D97706",
      bgColor: "#FEF3C7",
    },
    {
      id: 2,
      title: "Dhool / Mitti",
      subtext: "Construction ke liye",
      iconType: "truck",
      iconLib: "FontAwesome5",
      iconColor: "#4B5563",
      bgColor: "#F3F4F6",
    },
    {
      id: 3,
      title: "Pani Tanker",
      subtext: "Water delivery",
      iconType: "water",
      iconLib: "Ionicons",
      iconColor: "#3B82F6",
      bgColor: "#DBEAFE",
    },
    {
      id: 4,
      title: "Catering",
      subtext: "Khana events ke liye",
      iconType: "food-fork-drink",
      iconLib: "MaterialCommunityIcons",
      iconColor: "#10B981",
      bgColor: "#D1FAE5",
    },
  ];

  const bookings = [
    {
      id: 1,
      title: "Tent — Basic Shamiyana",
      time: "5 din pehle",
      price: "₹8,000",
      status: "Done ✓",
      iconType: "campground",
      bgColor: "#FEF3C7",
      iconColor: "#D97706",
    },
    {
      id: 2,
      title: "Dhool — 2 trolley",
      time: "2 hafte pehle",
      price: "₹1,800",
      status: "Done ✓",
      iconType: "truck",
      bgColor: "#F3F4F6",
      iconColor: "#4B5563",
    },
  ];

  const renderIcon = (type, library, color) => {
    if (library === "FontAwesome5") {
      return <FontAwesome5 name={type} size={26} color={color} />;
    } else if (library === "MaterialCommunityIcons") {
      return <MaterialCommunityIcons name={type} size={28} color={color} />;
    } else {
      return <Ionicons name={type} size={28} color={color} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F8" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greetingText}>Namaste 👋</Text>
            <TouchableOpacity style={styles.locationContainer} activeOpacity={0.7}>
              <Text style={styles.locationText}>Agra, UP</Text>
              <Ionicons name="caret-down" size={14} color="#1E293B" style={styles.dropdownIcon} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.avatarButton} 
            activeOpacity={0.8}
            onPress={handleLogout}
            title="Logout"
          >
            <View style={styles.avatarWrapper}>
              <Ionicons name="person" size={20} color="#5B21B6" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar Section */}
        <View style={styles.searchSection}>
          <Ionicons name="search" size={20} color="#7C3AED" style={styles.searchIcon} />
          <TextInput
            placeholder="Service khojo..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        {/* Promotion Banner Card */}
        <View style={styles.promoBanner}>
          <View style={styles.promoIconCircle}>
            <MaterialCommunityIcons name="flash" size={24} color="#F97316" />
          </View>
          <View style={styles.promoTexts}>
            <Text style={styles.promoTitle}>Jaldi booking karo!</Text>
            <Text style={styles.promoSubtitle}>Aaj ke liye services available hain</Text>
          </View>
        </View>

        {/* HAMARE SERVICES Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>HAMARE SERVICES</Text>
        </View>

        <View style={styles.gridContainer}>
          {services.map((service) => (
            <TouchableOpacity key={service.id} style={styles.gridCard} activeOpacity={0.9}>
              <View style={[styles.iconContainer, { backgroundColor: service.bgColor }]}>
                {renderIcon(service.iconType, service.iconLib, service.iconColor)}
              </View>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceSubtext}>{service.subtext}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* RECENT BOOKINGS Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECENT BOOKINGS</Text>
        </View>

        <View style={styles.bookingsContainer}>
          {bookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={[styles.bookingIconContainer, { backgroundColor: booking.bgColor }]}>
                <FontAwesome5 name={booking.iconType} size={18} color={booking.iconColor} />
              </View>
              <View style={styles.bookingDetails}>
                <Text style={styles.bookingTitle}>{booking.title}</Text>
                <Text style={styles.bookingSubtext}>
                  {booking.time} • <Text style={styles.bookingPrice}>{booking.price}</Text>
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{booking.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation Tab */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setSelectedTab("Home")} 
          activeOpacity={0.8}
        >
          <Ionicons 
            name={selectedTab === "Home" ? "home" : "home-outline"} 
            size={22} 
            color={selectedTab === "Home" ? "#A2441D" : "#64748B"} 
          />
          <Text style={[styles.navText, selectedTab === "Home" && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setSelectedTab("Bookings")} 
          activeOpacity={0.8}
        >
          <Ionicons 
            name={selectedTab === "Bookings" ? "clipboard" : "clipboard-outline"} 
            size={22} 
            color={selectedTab === "Bookings" ? "#A2441D" : "#64748B"} 
          />
          <Text style={[styles.navText, selectedTab === "Bookings" && styles.activeNavText]}>Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setSelectedTab("Search")} 
          activeOpacity={0.8}
        >
          <Ionicons 
            name={selectedTab === "Search" ? "search" : "search-outline"} 
            size={22} 
            color={selectedTab === "Search" ? "#A2441D" : "#64748B"} 
          />
          <Text style={[styles.navText, selectedTab === "Search" && styles.activeNavText]}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setSelectedTab("Profile")} 
          activeOpacity={0.8}
        >
          <Ionicons 
            name={selectedTab === "Profile" ? "person" : "person-outline"} 
            size={22} 
            color={selectedTab === "Profile" ? "#A2441D" : "#64748B"} 
          />
          <Text style={[styles.navText, selectedTab === "Profile" && styles.activeNavText]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F8",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "column",
  },
  greetingText: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  dropdownIcon: {
    marginLeft: 6,
    marginTop: 2,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FAF5FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3E8FF",
  },
  avatarWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
  },
  promoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9A3412", // Premium Rust/Brown Accent
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    shadowColor: "#9A3412",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  promoIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  promoTexts: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 13,
    color: "#FFEDD5",
    fontWeight: "500",
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 1,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  gridCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 4,
  },
  serviceSubtext: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  bookingsContainer: {
    width: "100%",
  },
  bookingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  bookingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  bookingDetails: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  bookingSubtext: {
    fontSize: 12,
    color: "#64748B",
  },
  bookingPrice: {
    fontWeight: "600",
    color: "#0F172A",
  },
  statusBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingBottom: 8,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
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
