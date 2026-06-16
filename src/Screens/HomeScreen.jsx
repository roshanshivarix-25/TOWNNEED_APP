import { useRouter, useNavigation } from "expo-router";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getMeApi } from "../api/auth";
import { getServicesApi } from "../api/services";
import BottomTab from "../Components/BottomTab";

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState("Guest");
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const userObj = JSON.parse(userJson);
          setUserName(userObj.fullName || userObj.name || "User");
        } else {
          const apiUser = await getMeApi().catch(() => null);
          setUserName(apiUser?.fullName || apiUser?.name || "User");
        }
      } catch (e) {
        console.log("Failed to load user details:", e);
      }
    };

    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const data = await getServicesApi();
        setServices(data || []);
      } catch (err) {
        console.log("Failed to load services:", err.message);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchUser();
    fetchServices();

    const unsubscribe = navigation.addListener("focus", () => {
      fetchUser();
    });
    return unsubscribe;
  }, [navigation]);

  const getServiceDesign = (title) => {
    const t = (title || "").toLowerCase();
    if (t.includes("tent") || t.includes("shamiyana")) {
      return {
        iconType: "campground",
        iconLib: "FontAwesome5",
        iconColor: "#D97706",
        bgColor: "#FEF3C7",
      };
    }
    if (t.includes("dhool") || t.includes("mitti") || t.includes("construction")) {
      return {
        iconType: "truck",
        iconLib: "FontAwesome5",
        iconColor: "#4B5563",
        bgColor: "#F3F4F6",
      };
    }
    if (t.includes("pani") || t.includes("tanker") || t.includes("water")) {
      return {
        iconType: "water",
        iconLib: "Ionicons",
        iconColor: "#3B82F6",
        bgColor: "#DBEAFE",
      };
    }
    if (t.includes("catering") || t.includes("food") || t.includes("khana")) {
      return {
        iconType: "food-fork-drink",
        iconLib: "MaterialCommunityIcons",
        iconColor: "#10B981",
        bgColor: "#D1FAE5",
      };
    }
    return {
      iconType: "build-outline",
      iconLib: "Ionicons",
      iconColor: "#7C3AED",
      bgColor: "#F5F3FF",
    };
  };

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9F8" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.avatarButton}
              activeOpacity={0.8}
              onPress={() => router.replace("/profile")}
            >
              <View style={styles.avatarWrapper}>
                <Ionicons name="person" size={20} color="#FFF" />
              </View>
            </TouchableOpacity>
            <View style={styles.welcomeBlock}>
              <Text style={styles.greetingText}>Namaste {userName ? userName.trim().split(" ")[0] : "User"} 👋</Text>
              <TouchableOpacity style={styles.locationContainer} activeOpacity={0.7}>
                <Ionicons name="location-sharp" size={13} color="#A2441D" style={{ marginRight: 2 }} />
                <Text style={styles.locationText}>Location</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            activeOpacity={0.8}
            onPress={() => Alert.alert("Notifications", "No new notifications")}
          >
            <Ionicons name="notifications-outline" size={22} color="#1E293B" />
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
          {loadingServices ? (
            <Text style={styles.loadingTextCenter}>Loading services...</Text>
          ) : services.length === 0 ? (
            <Text style={styles.loadingTextCenter}>No services available</Text>
          ) : (
            services.map((service) => {
              const design = getServiceDesign(service.title);
              const hasImage = service.image && service.image.length > 0 && service.image[0]?.url;
              return (
                <TouchableOpacity
                  key={service.id || service._id}
                  style={styles.gridCard}
                  activeOpacity={0.9}
                  onPress={() => router.push({ pathname: "/service-detail", params: { id: service.id || service._id } })}
                >
                  <View style={[styles.iconContainer, { backgroundColor: design.bgColor }]}>
                    {hasImage ? (
                      <Image
                        source={{ uri: service.image[0].url }}
                        style={{ width: "100%", height: "100%", borderRadius: 30 }}
                        resizeMode="cover"
                      />
                    ) : (
                      renderIcon(design.iconType, design.iconLib, design.iconColor)
                    )}
                  </View>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceSubtext} numberOfLines={2}>{service.description || "Service Details"}</Text>
                </TouchableOpacity>
              );
            })
          )}
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

      <BottomTab active="Home" />
    </View>
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
    marginTop: 10,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  welcomeBlock: {
    flexDirection: "column",
    marginLeft: 12,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#A2441D",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#A2441D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  greetingText: {
    fontSize: 20,
    color: "#0F172A",
    fontWeight: "800",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -2,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  dropdownIcon: {
    marginLeft: 3,
    marginTop: 1,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
  loadingTextCenter: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    width: "100%",
    paddingVertical: 24,
    fontWeight: "500",
  },
});
