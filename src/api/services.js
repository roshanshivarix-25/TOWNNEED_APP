import axiosInstance from "../utils/axios";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";


export const getServicesApi = async () => {
  try {
    console.log("[API] Calling getServicesApi");
    const response = await axiosInstance.get("/services/");
    console.log("[API] getServicesApi Success response:", response.data);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch services");
    }
    return response.data.data;
  } catch (error) {
    console.log("[API] getServicesApi Full Error Object:", {
      message: error.message,
    });
    return [];
  }
};

export const getServiceDetailApi = async (serviceId) => {
  try {
    console.log("[API] Calling getServiceDetailApi for id:", serviceId);
    const response = await axiosInstance.get(`/services/${serviceId}`);
    console.log("[API] getServiceDetailApi Success response:", response.data);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch service details");
    }
    return response.data.data;
  } catch (error) {
    console.log("[API] getServiceDetailApi Error:", error.message);
    throw error;
  }
};

export const getPackagesApi = async (serviceId) => {
  try {
    console.log("[API] Calling getPackagesApi for serviceId:", serviceId);
    const response = await axiosInstance.get(`/package/`, {
      params: { serviceId }
    });
    console.log("[API] getPackagesApi Success response:", response.data);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch packages and no respones from db");
    }
    return response.data.data;
  } catch (error) {
    console.log("[API] getPackagesApi Error:", error.message);
    throw error;
  }
};

export const getAddonsApi = async () => {
  try {
    console.log("[API] Calling getAddonsApi");
    const response = await axiosInstance.get("/addons/");
    console.log("[API] getAddonsApi Success response:", response.data);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch addons");
    }
    return response.data.data;
  } catch (error) {
    console.log("[API] getAddonsApi Error:", error.message);
    throw error;
  }
};

export const getVendorsApi = async () => {
  try {
    console.log("[API] Calling getVendorsApi");
    const response = await axiosInstance.get("/user/vendor/");
    console.log("[API] getVendorsApi Success response:", response.data);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch vendors");
    }
    return response.data.data;
  } catch (error) {
    console.log("[API] getVendorsApi Error:", error.message);
    throw error;
  }
};

export const createBookingApi = async (bookingData) => {
  try {
    console.log("[API] Calling createBookingApi with:", bookingData);
    const response = await axiosInstance.post("/bookings/", bookingData);
    console.log("[API] createBookingApi Success response:", response.data);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to create booking");
    }
    return response.data.data;
  } catch (error) {
    console.log("[API] createBookingApi Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
};

// export const createPaymentApi = async (paymentData) => {
//   try {
//     console.log("[API] Calling createPaymentApi with:", paymentData);
//     const response = await axiosInstance.post("/payments/create", paymentData);
//     console.log("[API] createPaymentApi Success response:", response.data);
//     if (!response.data.success) {
//       throw new Error(response.data.message || "Failed to create payment");
//     }
//     return response.data.data;
//   } catch (error) {
//     console.log("[API] createPaymentApi Error:", error.message);
//     throw error;
//   }
// };

export const getUserBookingsApi = async () => {
  try {
    console.log("[API] Calling getUserBookingsApi");
    const response = await axiosInstance.get("/bookings/my/");
    console.log("[API] getUserBookingsApi Success response:", response.data);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch bookings");
    }
    return response.data.data;
  } catch (error) {
    console.log("[API] getUserBookingsApi Error:", error.message);
    return [];
  }
};


export const applyVendorApi = async (vendorData) => {
  try {
    console.log('[API] Calling applyVendorApi with:', vendorData);
    const response = await axiosInstance.post('/user/vendor/apply/', vendorData);
    console.log('[API] applyVendorApi Success response:', response.data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to apply vendor');
    }
    return response.data.data;
  } catch (error) {
    console.log('[API] applyVendorApi Error:', error.message);
    throw error;
  }
};

export const getBookingDetailsApi = async (bookingId) => {
  try {
    console.log('[API] Calling getBookingDetailsApi for:', bookingId);
    const response = await axiosInstance.get(`/bookings/${bookingId}`);
    console.log('[API] getBookingDetailsApi Success response:', response.data);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch booking details');
    }
    return response.data.data;
  } catch (error) {
    console.log('[API] getBookingDetailsApi Error:', error.message);
    throw error;
  }
};

export const createPaymentOrderApi = async (bookingId, amount) => {
  try {
    console.log("[API] Calling createPaymentOrderApi for booking:", bookingId, "amount:", amount);
    const response = await axiosInstance.post("/payment/create-order", {
      bookingId,
      amount,
    });
    console.log("[API] createPaymentOrderApi Success response:", response.data);
    return response.data; // Return full response to get data object
  } catch (error) {
    console.log("[API] createPaymentOrderApi Error:", error.message);
    throw error;
  }
};

export const verifyPaymentApi = async (payload) => {
  try {
    console.log("[API] Calling verifyPaymentApi with payload:", payload);
    const response = await axiosInstance.post("/payment/verify", payload);
    console.log("[API] verifyPaymentApi Success response:", response.data);
    return response.data; // Return full response
  } catch (error) {
    console.log("[API] verifyPaymentApi Error:", error.message);
    throw error;
  }
};

export const getMyPaymentsApi = async () => {
  try {
    console.log("[API] Calling getMyPaymentsApi");
    const response = await axiosInstance.get("/payment/my/");
    console.log("[API] getMyPaymentsApi Success response:", response.data);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch payment history");
    }
    return response.data.data;
  } catch (error) {
    console.log("[API] getMyPaymentsApi Error:", error.message);
    throw error;
  }
};

export const downloadInvoiceApi = async (paymentId) => {
  try {
    console.log("[API] Calling downloadInvoiceApi for paymentId:", paymentId);
    const baseURL = axiosInstance.defaults.baseURL;
    const cleanBaseUrl = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
    const downloadUrl = `${cleanBaseUrl}/user/invoice/${paymentId}/download`;

    if (Platform.OS === "web") {
      console.log("[API] Downloading invoice on Web:", downloadUrl);
      const response = await axiosInstance.get(`/user/invoice/${paymentId}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      return true;
    } else {
      const fileUri = `${FileSystem.documentDirectory}invoice_${paymentId}.pdf`;
      console.log("[API] Downloading native PDF using axiosInstance for correct header injection:", downloadUrl);
      
      const response = await axiosInstance.get(`/user/invoice/${paymentId}/download`, {
        responseType: "arraybuffer",
      });

      console.log("[API] Axios success. Converting buffer to base64...");
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      const bytes = new Uint8Array(response.data);
      const len = bytes.length;
      let base64 = "";
      for (let i = 0; i < len; i += 3) {
        const b1 = bytes[i];
        const b2 = i + 1 < len ? bytes[i + 1] : NaN;
        const b3 = i + 2 < len ? bytes[i + 2] : NaN;
        const enc1 = b1 >> 2;
        const enc2 = ((b1 & 3) << 4) | (isNaN(b2) ? 0 : b2 >> 4);
        const enc3 = isNaN(b2) ? 64 : ((b2 & 15) << 2) | (isNaN(b3) ? 0 : b3 >> 6);
        const enc4 = isNaN(b3) ? 64 : b3 & 63;
        base64 += chars.charAt(enc1) + chars.charAt(enc2) +
                  (enc3 === 64 ? "=" : chars.charAt(enc3)) +
                  (enc4 === 64 ? "=" : chars.charAt(enc4));
      }

      console.log("[API] Writing base64 to fileUri:", fileUri);
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return fileUri;
    }
  } catch (error) {
    console.log("[API] downloadInvoiceApi Error:", error.message);
    throw error;
  }
};


