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
import { getAddonsApi } from "../api/services";

export default function AddonsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const serviceId = params.serviceId;
  const eventType = params.eventType || "";
  const guestCount = params.guestCount || "";
  const formValuesStr = params.formValues || "{}";

  const selectedPackage = params.selectedPackage
    ? JSON.parse(params.selectedPackage)
    : null;

  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddonIds, setSelectedAddonIds] = useState(new Set());

  useEffect(() => {
    const fetchAddons = async () => {
      try {
        setLoading(true);
        console.log("[AddonsScreen] Fetching addons...");
        const data = await getAddonsApi();

        // Filter addons matching selected package ID
        let filtered = (data || []).filter(
          (addon) =>
            addon.packageId?.id === selectedPackage?.id ||
            addon.packageId === selectedPackage?.id
        );

        // Fallback to all addons if none match the package id
        if (filtered.length === 0) {
          filtered = data || [];
        }

        setAddons(filtered);
      } catch (error) {
        console.log("[AddonsScreen] Error loading addons:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAddons();
  }, [params.selectedPackage]);

  const toggleAddon = (addonId) => {
    const next = new Set(selectedAddonIds);
    if (next.has(addonId)) {
      next.delete(addonId);
    } else {
      next.add(addonId);
    }
    setSelectedAddonIds(next);
  };


  const packagePrice = selectedPackage?.price || 0;

  // Calculate sum of selected addons
  const addonsPrice = addons
    .filter((addon) => selectedAddonIds.has(addon.id))
    .reduce((sum, addon) => sum + (addon.price || 0), 0);

  const totalPrice = packagePrice + addonsPrice;

  const handleProceedToVendors = () => {
    const selectedList = addons.filter((addon) => selectedAddonIds.has(addon.id));
    router.navigate({
      pathname: "/vendor",
      params: {
        serviceId,
        eventType,
        guestCount,
        formValues: formValuesStr,
        selectedPackage: JSON.stringify(selectedPackage),
        selectedAddons: JSON.stringify(selectedList),
        totalPrice: totalPrice,
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
          <Text style={styles.headerTitle}>Add-ons chunein</Text>
          <Text style={styles.headerSubtitle}>Optional extras</Text>
        </View>
        
      </View>

      {/* CONTENT SCREEN */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 210 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {addons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="gift-outline" size={48} color="#9E9E9E" />
            <Text style={styles.emptyText}>No optional add-ons available</Text>
          </View>
        ) : (
          <View style={styles.addonsListCard}>
            {addons.map((addon, index) => {
              const isChecked = selectedAddonIds.has(addon.id);
              const isLast = index === addons.length - 1;
              return (
                <TouchableOpacity
                  key={addon.id}
                  style={[styles.addonRow, !isLast && styles.addonRowBorder]}
                  onPress={() => toggleAddon(addon.id)}
                  activeOpacity={0.8}
                >
                  {/* Custom Checkbox */}
                  <View
                    style={[
                      styles.checkbox,
                      isChecked && styles.checkboxChecked,
                    ]}
                  >
                    {isChecked && (
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                    )}
                  </View>

                  {/* Body Text */}
                  <View style={styles.addonInfo}>
                    <Text style={styles.addonTitle}>
                      {addon.title}
                    </Text>
                    {addon.description ? (
                      <Text style={styles.addonDesc}>{addon.description}</Text>
                    ) : null}
                  </View>

                  {/* Price */}
                  <Text style={styles.addonPrice}>
                    +₹{addon.price?.toLocaleString("en-IN")}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* BOTTOM BILLING DETAILS AND PROCEED BAR */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {/* Billing Calculation Breakdown */}
        <View style={styles.billingBreakdown}>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Package</Text>
            <Text style={styles.billingValue}>
              ₹{packagePrice.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.billingRow}>
            <Text style={styles.billingLabel}>Add-ons</Text>
            <Text style={styles.billingValue}>
              +₹{addonsPrice.toLocaleString("en-IN")}
            </Text>
          </View>
          
          <View style={styles.divider} />

          <View style={[styles.billingRow, { marginBottom: 4 }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>
                ₹{totalPrice.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>
        </View>

        {/* Proceed Action Button */}
        <TouchableOpacity
          style={styles.proceedButton}
          onPress={handleProceedToVendors}
          activeOpacity={0.85}
        >
          <Text style={styles.proceedButtonText}>Vendor chunein</Text>
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
  addonsListCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAE9E4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
  },
  addonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
  },
  addonRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#9A3412",
    borderColor: "#9A3412",
  },
  addonInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  addonTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  addonDesc: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
  },
  addonPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
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
  billingBreakdown: {
    marginBottom: 16,
  },
  billingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  billingLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  billingValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  totalBadge: {
    backgroundColor: "#FFEDE8",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  totalBadgeText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#9A3412",
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
