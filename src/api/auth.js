import axiosInstance from "../utils/axios";

const extractErrorMessage = (errorOrResponse, defaultMessage) => {
  const data = errorOrResponse?.response?.data || errorOrResponse?.data || errorOrResponse;
  if (data && data.message) {
    if (typeof data.message === "object" && data.message !== null) {
      return data.message.message || defaultMessage;
    }
    return data.message;
  }
  return errorOrResponse?.message || defaultMessage;
};

export const sendOtpApi = async (phone) => {
  try {
    console.log("[API] Calling sendOtpApi for:", phone);
    const response = await axiosInstance.post("/auth/send-otp", { phone });
    console.log("[API] sendOtpApi Success response:", response.data);
    if (!response.data.success) {
      throw new Error(extractErrorMessage(response.data, "Failed to send OTP"));
    }
    return {
      isFirstLogin: response.data.message?.isNewUser ?? response.data.data?.isFirstLogin ?? false,
      ...response.data.data,
    };
  } catch (error) {
    console.log("[API] sendOtpApi Error:", error.response?.data || error.message);
    throw new Error(extractErrorMessage(error, "Failed to send OTP"));
  }
};

export const verifyOtpApi = async (phone, otp) => {
  try {
    console.log("[API] Calling verifyOtpApi for:", phone, "with OTP:", otp);
    const response = await axiosInstance.post("/auth/verify-otp", { phone, otp });
    console.log("[API] verifyOtpApi Success response:", response.data);
    if (!response.data.success) {
      throw new Error(extractErrorMessage(response.data, "Invalid OTP"));
    }
    return response.data.data;
  } catch (error) {
    console.log("[API] verifyOtpApi Error:", error.response?.data || error.message);
    throw new Error(extractErrorMessage(error, "Invalid OTP"));
  }
};

export const resendOtpApi = async (phone) => {
  try {
    console.log("[API] Calling resendOtpApi for:", phone);
    const response = await axiosInstance.post("/auth/resend-otp", { phone });
    console.log("[API] resendOtpApi Success response:", response.data);
    if (!response.data.success) {
      throw new Error(extractErrorMessage(response.data, "Failed to resend OTP"));
    }
    return response.data.data;
  } catch (error) {
    console.log("[API] resendOtpApi Error:", error.response?.data || error.message);
    throw new Error(extractErrorMessage(error, "Failed to resend OTP"));
  }
};

export const logoutApi = async () => {
  try {
    console.log("[API] Calling logoutApi");
    const response = await axiosInstance.post("/auth/logout");
    console.log("[API] logoutApi Success response:", response.data);
    return response.data;
  } catch (error) {
    console.log("[API] logoutApi Error:", error.response?.data || error.message);
    throw new Error(extractErrorMessage(error, "Failed to logout"));
  }
};

export const updateProfileApi = async (fullName, email, password, location) => {
  try {
    console.log("[API] Calling updateProfileApi with:", { fullName, email, location });
    const payload = { fullName, email };
    if (password) payload.password = password;
    if (location) payload.location = location;

    const response = await axiosInstance.patch("/user/profile", payload);
    console.log("[API] updateProfileApi Success response:", response.data);
    if (!response.data.success) {
      throw new Error(extractErrorMessage(response.data, "Failed to update profile"));
    }
    return response.data.data;
  } catch (error) {
    console.log("[API] updateProfileApi Error:", error.response?.data || error.message);
    throw new Error(extractErrorMessage(error, "Failed to update profile"));
  }
};
