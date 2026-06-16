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


