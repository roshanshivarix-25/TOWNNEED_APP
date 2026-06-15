import axiosInstance from "../utils/axios";

export const sendOtpApi = async (phone) => {
  try {
    const response = await axiosInstance.post("/user/send-otp", { phone });
    if (!response.data.status) {
      throw new Error(response.data.message || "Failed to send OTP");
    }
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to send OTP");
  }
};

export const verifyOtpApi = async (phone, otp) => {
  try {
    const response = await axiosInstance.post("/user/verify-otp", { phone, otp });
    if (!response.data.status) {
      throw new Error(response.data.message || "Invalid OTP");
    }
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Invalid OTP");
  }
};

export const getMeApi = async () => {
  try {
    const response = await axiosInstance.post("/user/me");
    if (!response.data.status) {
      throw new Error(response.data.message || "Failed to fetch user");
    }
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch user");
  }
};


