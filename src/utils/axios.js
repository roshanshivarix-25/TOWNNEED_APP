import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "https://api.townneed.com/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor - Automatically appends auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.warn("Failed to get token from storage:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handles session clearing on 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Skip handling for login/auth routes to let them show credential/validation errors
      if (
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/verify-otp") ||
        error.config?.url?.includes("/auth/send-otp")
      ) {
        return Promise.reject(error);
      }

      console.warn("Session expired. Clearing storage...");
      try {
        await AsyncStorage.multiRemove(["token", "tokenExpiry", "user"]);
        const { router } = require("expo-router");
        router.replace("/login");
      } catch (err) {
        console.log("Failed to clear session:", err);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
