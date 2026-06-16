import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getPackagesApi } from "../api/services";

export default function PackagesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const serviceId = params.serviceId;
  const eventType = params.eventType || "";
  const guestCount = params.guestCount || "";

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        console.log("[PackagesScreen] Fetching packages for serviceId:", serviceId);
        const data = await getPackagesApi(serviceId);
        
        // Filter packages by serviceId just in case API returns all packages
        const filtered = (data || []).filter(
          (pkg) => pkg.serviceId === serviceId || !serviceId
        );
        
        setPackages(filtered);

        if (filtered.length > 0) {
          // Default selection: select the popular package if available, else first package
          const popularPkg = filtered.find((p) => p.isPopular);
          setSelectedPackage(popularPkg || filtered[0]);
        }
      } catch (error) {
        console.log("[PackagesScreen] Error loading packages:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [serviceId]);

  const handleProceedToAddons = () => {
    if (!selectedPackage) {
      Alert.alert("Error", "Please select a package first");
      return;
    }
    router.replace({
      pathname: "/addons",
      params: {
        serviceId,
        eventType,
        guestCount,
        selectedPackage: JSON.stringify(selectedPackage),
        formValues: params.formValues || "{}",
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#9A3412" />
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Package chunein</Text>
          <Text style={styles.headerSubtitle}>
            {guestCount ? `${guestCount} guests` : ""}
            {guestCount && eventType ? " · " : ""}
            {eventType || ""}
          </Text>
        </View>
        <View style={{ width: 44, alignItems: "flex-end" }}>
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* LIST OF PACKAGES */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {packages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color="#9E9E9E" />
            <Text style={styles.emptyText}>No packages available</Text>
          </View>
        ) : (
          packages.map((pkg) => {
            const isSelected = selectedPackage?.id === pkg.id;
            return (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.packageCard,
                  isSelected && styles.packageCardSelected,
                ]}
                onPress={() => setSelectedPackage(pkg)}
                activeOpacity={0.9}
              >
                {/* Title & Price Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.packageTitle}>{pkg.title}</Text>
                    {pkg.isPopular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>Popular</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeText}>
                      ₹{pkg.price?.toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.packageDesc}>{pkg.description}</Text>

                {/* Features Tags */}
                {pkg.features && pkg.features.length > 0 && (
                  <View style={styles.featuresContainer}>
                    {pkg.features.map((feature, idx) => (
                      <View key={idx} style={styles.featureTag}>
                        <Text style={styles.featureTagText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.bottomBarTop}>
          <Text style={styles.selectedLabel}>Selected</Text>
          <Text style={styles.selectedPrice}>
            ₹{selectedPackage ? selectedPackage.price?.toLocaleString("en-IN") : "0"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.proceedButton}
          onPress={handleProceedToAddons}
          activeOpacity={0.85}
        >
          <Text style={styles.proceedButtonText}>Add-ons dekho</Text>
          <View style={styles.iconCircle}>
            <Ionicons name="arrow-forward" size={16} color="#9A3412" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F5",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
  },
  packageCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#EAE9E4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  packageCardSelected: {
    borderColor: "#9A3412",
    backgroundColor: "#FFF",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    flex: 1,
    marginRight: 8,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  popularBadge: {
    backgroundColor: "#9A3412",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  popularBadgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "800",
    fontStyle:"bold",
  },
  priceBadge: {
    backgroundColor: "#FFEDE8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  priceBadgeText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#9A3412",
  },
  packageDesc: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 6,
    lineHeight: 18,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
    gap: 8,
  },
  featureTag: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  featureTagText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
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
  bottomBarTop: {
    marginBottom: 12,
  },
  selectedLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  selectedPrice: {
    fontSize: 24,
    fontWeight: "800",
    color: "#9A3412",
    marginTop: 4,
  },
  proceedButton: {
    backgroundColor: "#9A3412",
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  proceedButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
