import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Sharing from "expo-sharing";
import { getMyPaymentsApi, downloadInvoiceApi } from "../api/services";


function CardServiceImage({ imageUrl }) {
  const [imageError, setImageError] = useState(false);

  if (imageUrl && !imageError) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={styles.serviceImage}
        onError={() => setImageError(true)}
      />
    );
  }
  return (
    <View style={styles.fallbackIconWrapper}>
      <Ionicons name="construct-outline" size={20} color="#9A3412" />
    </View>
  );
}

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, amount_desc, amount_asc
  const [statusFilter, setStatusFilter] = useState("all"); // all, paid, pending, failed
  const [modalVisible, setModalVisible] = useState(false);
  const [tempSortBy, setTempSortBy] = useState("newest");
  const [tempStatusFilter, setTempStatusFilter] = useState("all");
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownloadInvoice = async (paymentId) => {
    if (!paymentId) {
      Alert.alert("Error", "Payment ID not found");
      return;
    }
    try {
      setDownloadingId(paymentId);
      const fileUriOrSuccess = await downloadInvoiceApi(paymentId);
      
      if (Platform.OS !== "web" && fileUriOrSuccess) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUriOrSuccess, {
            mimeType: "application/pdf",
            dialogTitle: "Download Invoice",
            UTI: "com.adobe.pdf",
          });
        } else {
          Alert.alert("Success", "Invoice downloaded successfully!");
        }
      } else {
        Alert.alert("Success", "Invoice downloaded successfully!");
      }
    } catch (err) {
      console.log("Failed to download invoice:", err.message);
      Alert.alert("Error", "Could not download invoice. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const data = await getMyPaymentsApi();
        setPayments(data || []);
      } catch (err) {
        console.log("Failed to load payment history:", err.message);
        Alert.alert("Error", "Could not load payment history");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // Compute stats
  const paidOrders = payments.filter((p) => p.status?.toLowerCase() === "paid");
  const totalSpent = paidOrders.reduce((sum, p) => sum + (p.amount || 0), 0);

  const getFilteredAndSortedPayments = () => {
    let result = [...payments];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((p) => {
        const s = (p.status || "").toLowerCase();
        if (statusFilter === "paid") return s === "paid" || s === "success";
        if (statusFilter === "pending") return s === "pending" || s === "processing";
        if (statusFilter === "failed") return s === "failed" || s === "error" || (!s.startsWith("paid") && !s.startsWith("success") && !s.startsWith("pend") && !s.startsWith("proc"));
        return true;
      });
    }

    // Sort by
    result.sort((a, b) => {
      if (sortBy === "newest") {
        const dateA = a.createdAt ? new Date(a.createdAt) : 0;
        const dateB = b.createdAt ? new Date(b.createdAt) : 0;
        return dateB - dateA;
      }
      if (sortBy === "oldest") {
        const dateA = a.createdAt ? new Date(a.createdAt) : 0;
        const dateB = b.createdAt ? new Date(b.createdAt) : 0;
        return dateA - dateB;
      }
      if (sortBy === "amount_desc") {
        const amtA = a.amount || 0;
        const amtB = b.amount || 0;
        return amtB - amtA;
      }
      if (sortBy === "amount_asc") {
        const amtA = a.amount || 0;
        const amtB = b.amount || 0;
        return amtA - amtB;
      }
      return 0;
    });

    return result;
  };

  const copyToClipboard = (txt) => {
    if (!txt) return;
    Clipboard.setString(txt);
    if (Platform.OS === "android") {
      ToastAndroid.show("Transaction ID Copied!", ToastAndroid.SHORT);
    } else {
      Alert.alert("Copied", "Transaction ID copied to clipboard.");
    }
  };

  const getStatusStyle = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "paid" || s === "success") {
      return { bg: "#E8F5E9", text: "#2E7D32", label: "Paid", color: "#10B981" };
    }
    if (s === "pending" || s === "processing") {
      return { bg: "#FFF3E0", text: "#E65100", label: "Pending", color: "#F59E0B" };
    }
    return { bg: "#FFEBEE", text: "#C62828", label: status || "Failed", color: "#EF4444" };
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF9F5" }}>
      <StatusBar barStyle="light-content" backgroundColor="#9A3412" translucent={true} />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 12, paddingBottom: 12 }]}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Purchase History</Text>
        </View>
        <TouchableOpacity
          style={styles.headerFilterBtn}
          onPress={() => {
            setTempSortBy(sortBy);
            setTempStatusFilter(statusFilter);
            setModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="funnel" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* FILTERS MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <TouchableOpacity
                  style={styles.clearFilterBtn}
                  onPress={() => {
                    setTempSortBy("newest");
                    setTempStatusFilter("all");
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="reload" size={12} color="#A2441D" />
                  <Text style={styles.clearFilterText}>Clear Filter</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#0F172A" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Order Status Section */}
              <Text style={styles.filterSectionTitle}>Payment Status</Text>
              <View style={styles.filterList}>
                {[
                  { id: "all", label: "All Payments" },
                  { id: "paid", label: "Paid" },
                  { id: "pending", label: "Pending" },
                  { id: "failed", label: "Failed" },
                ].map((item) => {
                  const isSelected = tempStatusFilter === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.filterListItem, isSelected && styles.filterListItemActive]}
                      onPress={() => setTempStatusFilter(item.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.filterListItemText, isSelected && styles.filterListItemTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Sort By Section */}
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.filterList}>
                {[
                  { id: "newest", label: "Newest First" },
                  { id: "oldest", label: "Oldest First" },
                  { id: "amount_desc", label: "Amount: High to Low" },
                  { id: "amount_asc", label: "Amount: Low to High" },
                ].map((item) => {
                  const isSelected = tempSortBy === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.filterListItem, isSelected && styles.filterListItemActive]}
                      onPress={() => setTempSortBy(item.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.filterListItemText, isSelected && styles.filterListItemTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Apply Button */}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                setSortBy(tempSortBy);
                setStatusFilter(tempStatusFilter);
                setModalVisible(false);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* STATS SECTION */}
      <View style={styles.statsContainer}>
        {/* Paid Orders Card */}
        <View style={styles.statCardLeft}>
          <Text style={styles.statNumber}>{paidOrders.length}</Text>
          <Text style={styles.statLabel}>Paid Orders</Text>
        </View>

        {/* Total Spent Card */}
        <View style={styles.statCardRight}>
          <Text style={styles.statNumberRight}>₹{totalSpent.toLocaleString("en-IN")}</Text>
          <Text style={styles.statLabelRight}>Total Spent</Text>
        </View>
      </View>

      {/* TRANSACTIONS LIST */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#9A3412" />
          <Text style={styles.loadingText}>Fetching transaction logs...</Text>
        </View>
      ) : payments.length === 0 ? (
        <View style={styles.centerEmpty}>
          <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyText}>No payments recorded yet</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Active filter indication bar */}
          {(statusFilter !== "all" || sortBy !== "newest") && (
            <View style={styles.filterIndicatorRow}>
              <Text style={styles.filterIndicatorText}>
                Active Filters: {statusFilter !== "all" ? `Status: ${statusFilter}` : ""} {sortBy !== "newest" ? `Sort: ${sortBy}` : ""}
              </Text>
              <TouchableOpacity
                style={styles.clearFilterBtnSmall}
                onPress={() => {
                  setSortBy("newest");
                  setStatusFilter("all");
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="reload" size={10} color="#A2441D" />
                <Text style={styles.clearFilterTextSmall}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}

          {getFilteredAndSortedPayments().length === 0 ? (
            <View style={styles.centerEmpty}>
              <Ionicons name="funnel-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>No payments match active filters</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                { paddingTop: (statusFilter !== "all" || sortBy !== "newest") ? 8 : 24, paddingBottom: insets.bottom + 20 },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {getFilteredAndSortedPayments().map((payment) => {
                const statusStyle = getStatusStyle(payment.status);
                const booking = payment.bookingId || {};
                const service = booking.serviceId || {};
                const dateStr = payment.createdAt
                  ? new Date(payment.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A";

                // Extract service image dynamically
                const imageUrl = Array.isArray(service.image)
                  ? (Array.isArray(service.image[0]) ? (service.image[0][0]?.url || (service.image[0][0]?.key ? `https://townneed-bucket.s3.amazonaws.com/${service.image[0][0].key}` : null)) : (service.image[0]?.url || (service.image[0]?.key ? `https://townneed-bucket.s3.amazonaws.com/${service.image[0].key}` : null)))
                  : (typeof service.image === "string" ? service.image : null);

                return (
                  <View 
                    key={payment.id || payment._id} 
                    style={[
                      styles.paymentCard, 
                      { borderLeftWidth: 4, borderLeftColor: statusStyle.color }
                    ]}
                  >
                    {/* Header Row */}
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.serviceTitleWrapper}>
                        <Text style={styles.serviceTitle} numberOfLines={1}>
                          {service.title || "Service Booking"}
                        </Text>
                        <TouchableOpacity
                          style={styles.txnContainer}
                          onPress={() => copyToClipboard(payment.transactionId)}
                          activeOpacity={0.6}
                        >
                          <Text style={styles.transactionId} numberOfLines={1}>
                            TXN: {payment.transactionId || "N/A"}
                          </Text>
                          <Ionicons name="copy-outline" size={11} color="#94A3B8" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusStyle.bg },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                          {statusStyle.label}
                        </Text>
                      </View>
                    </View>

                    {/* Details Section */}
                    <View style={styles.detailsBlock}>
                      {/* <CardServiceImage imageUrl={imageUrl} /> */}
                      <View style={styles.detailsTextWrapper}>
                        <View style={styles.detailRow}>
                          <Ionicons name="location-sharp" size={13} color="#9A3412" style={{ marginRight: 4 }} />
                          <Text style={styles.venueText} numberOfLines={1}>
                            {booking.bookingData?.venue || "Venue not specified"}
                          </Text>
                        </View>
                        <View style={[styles.detailRow, { marginTop: 4 }]}>
                          <Ionicons name="calendar-sharp" size={12} color="#9A3412" style={{ marginRight: 4 }} />
                          <Text style={styles.dateText} numberOfLines={1}>
                            Event Date: {booking.bookingData?.eventDate || "N/A"}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Footer Grid */}
                    <View style={styles.cardFooterGrid}>
                      <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Amount</Text>
                        <Text style={[styles.gridValue, styles.amountHighlight]}>
                          ₹{payment.amount?.toLocaleString("en-IN")}
                        </Text>
                      </View>
                      <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Method</Text>
                        <Text style={styles.gridValue}>
                          {payment.paymentMethod?.toUpperCase() || "N/A"}
                        </Text>
                      </View>
                      <View style={styles.gridItem}>
                        <Text style={styles.gridLabel}>Payment Date</Text>
                        <Text style={styles.gridValue}>{dateStr}</Text>
                      </View>
                    </View>

                    {/* Invoice Download Action (Only for successful/paid payments) */}
                    {(payment.status?.toLowerCase() === "paid" || payment.status?.toLowerCase() === "success") && (
                      <View style={styles.cardActionRow}>
                        <View style={styles.divider} />
                        <TouchableOpacity
                          style={styles.downloadInvoiceBtn}
                          onPress={() => handleDownloadInvoice(payment.id || payment._id)}
                          disabled={downloadingId === (payment.id || payment._id)}
                          activeOpacity={0.7}
                        >
                          {downloadingId === (payment.id || payment._id) ? (
                            <ActivityIndicator size="small" color="#9A3412" />
                          ) : (
                            <>
                              <Ionicons name="download-outline" size={14} color="#9A3412" style={{ marginRight: 6 }} />
                              <Text style={styles.downloadInvoiceBtnText}>Download Invoice</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#9A3412",
    zIndex: 10,
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "white",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  statCardLeft: {
    flex: 1,
    backgroundColor: "#FFF7F5", // Brand Light Primary Accent
    borderWidth: 1.5,
    borderColor: "#FED7AA",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statCardRight: {
    flex: 1,
    backgroundColor: "#FFF7F5", // Brand Light Primary Accent
    borderWidth: 1.5,
    borderColor: "#FED7AA",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#9A3412", // Primary Brand color for numbers
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7C2D12", // Dark contrasting color
    marginTop: 4,
  },
  statNumberRight: {
    fontSize: 24,
    fontWeight: "800",
    color: "#9A3412", // Primary Brand color for numbers
  },
  statLabelRight: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7C2D12",
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 12,
  },
  centerEmpty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 12,
  },
  paymentCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EAE9E4",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  serviceTitleWrapper: {
    flex: 1,
    marginRight: 8,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  transactionId: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  detailsBlock: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  serviceImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  fallbackIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FFEDE8",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsTextWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  venueText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    flex: 1,
  },
  txnContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  amountHighlight: {
    color: "#9A3412",
    fontSize: 13,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 12,
  },
  cardFooterGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  gridValue: {
    fontSize: 12,
    color: "#0F172A",
    fontWeight: "700",
    marginTop: 2,
  },
  headerFilterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalScroll: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 12,
    marginBottom: 12,
  },
  filterList: {
    gap: 8,
    marginBottom: 16,
  },
  filterListItem: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  filterListItemActive: {
    backgroundColor: "#FFEDE8",
    borderColor: "#9A3412",
  },
  filterListItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  filterListItemTextActive: {
    color: "#9A3412",
    fontWeight: "700",
  },
  applyButton: {
    backgroundColor: "#9A3412",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
  clearFilterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 0.8,
    borderColor: "#FFDAD0",
    backgroundColor: "#FFEDE8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  clearFilterText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A2441D",
  },
  filterIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF7F5",
    borderBottomWidth: 1,
    borderColor: "#FFDAD0",
  },
  filterIndicatorText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9A3412",
  },
  clearFilterBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 0.8,
    borderColor: "#FFDAD0",
    backgroundColor: "#FFEDE8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  clearFilterTextSmall: {
    fontSize: 10,
    fontWeight: "700",
    color: "#A2441D",
  },
  cardActionRow: {
    marginTop: 12,
  },
  downloadInvoiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7F5",
    borderWidth: 1.5,
    borderColor: "#FED7AA",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 8,
  },
  downloadInvoiceBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9A3412",
  },
});
