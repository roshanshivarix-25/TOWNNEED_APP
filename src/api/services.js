import axiosInstance from "../utils/axios";

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
    console.log("[API] createBookingApi Error:", error.message);
    throw error;
  }
};

export const createPaymentApi = async (paymentData) => {
  try {
    console.log("[API] Calling createPaymentApi with:", paymentData);
    const response = await axiosInstance.post("/payments/create", paymentData);
    console.log("[API] createPaymentApi Success response:", response.data);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to create payment");
    }
    return response.data.data;
  } catch (error) {
    console.log("[API] createPaymentApi Error:", error.message);
    throw error;
  }
};

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
