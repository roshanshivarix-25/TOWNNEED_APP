import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getServicesApi } from "../api/services";
import BottomTab from "../Components/BottomTab";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all services initially
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const data = await getServicesApi();
        setServices(data || []);
        setFilteredServices(data || []);
      } catch (err) {
        console.log("Failed to fetch services in SearchScreen:", err.message);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  // Filter services on query change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredServices(services);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = services.filter(
      (s) =>
        s.title?.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query)
    );
    setFilteredServices(filtered);
  }, [searchQuery, services]);

  const popularSearches = ["Tent", "Mitti", "Tanker", "Catering"];

  const getServiceDesign = (title) => {
    const t = (title || "").toLowerCase();
    if (t.includes("tent") || t.includes("shamiyana")) {
      return { iconType: "campground", iconLib: "FontAwesome5", iconColor: "#D97706", bgColor: "#FEF3C7" };
    }
    if (t.includes("dhool") || t.includes("mitti") || t.includes("construction")) {
      return { iconType: "truck", iconLib: "FontAwesome5", iconColor: "#4B5563", bgColor: "#F3F4F6" };
    }
    if (t.includes("pani") || t.includes("tanker") || t.includes("water")) {
      return { iconType: "water", iconLib: "Ionicons", iconColor: "#3B82F6", bgColor: "#DBEAFE" };
    }
    if (t.includes("catering") || t.includes("food") || t.includes("khana")) {
      return { iconType: "food-fork-drink", iconLib: "MaterialCommunityIcons", iconColor: "#10B981", bgColor: "#D1FAE5" };
    }
    return { iconType: "build-outline", iconLib: "Ionicons", iconColor: "#7C3AED", bgColor: "#F5F3FF" };
  };

  const renderIcon = (type, library, color) => {
    if (library === "FontAwesome5") {
      return <FontAwesome5 name={type} size={20} color={color} />;
    } else if (library === "MaterialCommunityIcons") {
      return <MaterialCommunityIcons name={type} size={22} color={color} />;
    } else {
      return <Ionicons name={type} size={22} color={color} />;
    }
  };

  const renderServiceItem = ({ item }) => {
    const design = getServiceDesign(item.title);
    const hasImage = item.image && item.image.length > 0 && item.image[0]?.url;

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.8}>
        <View style={[styles.iconContainer, { backgroundColor: design.bgColor }]}>
          {hasImage ? (
            <Image
              source={{ uri: item.image[0].url }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            renderIcon(design.iconType, design.iconLib, design.iconColor)
          )}
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.serviceTitle}>{item.title}</Text>
          <Text style={styles.serviceDesc} numberOfLines={2}>
            {item.description || "High-quality professional service."}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Bar Container */}
      <View style={styles.searchHeader}>
        <View style={styles.inputWrapper}>
          <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            placeholder="Search for services (e.g. Tent, Pani)..."
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" style={styles.clearIcon} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#A2441D" />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Popular Search tags when input is empty */}
          {!searchQuery ? (
            <View style={styles.tagsSection}>
              <Text style={styles.tagsTitle}>Popular Searches</Text>
              <View style={styles.tagsContainer}>
                {popularSearches.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.tagButton}
                    onPress={() => setSearchQuery(tag)}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* Search Results */}
          <FlatList
            data={filteredServices}
            keyExtractor={(item) => item.id || item._id}
            renderItem={renderServiceItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Services Found</Text>
                <Text style={styles.emptySubtitle}>
                  Try checking spelling or using a different keyword.
                </Text>
              </View>
            }
          />
        </View>
      )}

      <BottomTab active="Search" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F8",
  },
  searchHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
    height: "100%",
  },
  clearIcon: {
    marginLeft: 6,
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  tagsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  tagsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tagButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 3,
  },
  serviceDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 18,
  },
});
