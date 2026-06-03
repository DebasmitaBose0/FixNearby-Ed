import api from "./apiClient";

export const signupUser = async (data) => {
  try {
    const response = await api.post("/auth/register", data);
    return response.data;
  } catch (error) {
    console.error(error.response?.data?.message || error);
    throw {
      message: error.response?.data?.message || "Registration failed",
      status: error.response?.status,
    };
  }
};

export const loginUser = async (data) => {
  try {
    const response = await api.post("/auth/login", data);
    return response.data;
  } catch (error) {
    console.error(error.response?.data?.message || error);
    throw {
      message: error.response?.data?.message || "Login failed",
      status: error.response?.status,
    };
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get("/auth/profile");
    return response.data;
  } catch (error) {
    console.error(error.response?.data?.message || error);
    throw {
      message: error.response?.data?.message || "failed to fetch profile",
      status: error.response?.status,
    };
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await api.put("/auth/profile", data);
    return response.data;
  } catch (error) {
    console.error(error.response?.data?.message || error);
    throw {
      message: error.response?.data?.message || "Failed to update profile",
      status: error.response?.status,
    };
  }
};


export const forgotUserPassword = async (email) => {
  try {
    const response = await api.post("/auth/forgot-password", {
      email,
    });

    return response.data;
  } catch (error) {
    throw {
      message:
        error.response?.data?.message ||
        "Failed to send reset link",
      status: error.response?.status,
    };
  }
};

export const resetUserPassword = async (token, password) => {
  try {
    const response = await api.put(
      `/auth/reset-password/${token}`,
      { password }
    );

    return response.data;
  } catch (error) {
    throw {
      message:
        error.response?.data?.message ||
        "Failed to reset password",
      status: error.response?.status,
    };
  }
};



export const forgotWorkerPassword = async (email) => {
  try {
    const response = await api.post(
      "/auth/worker/forgot-password",
      { email }
    );

    return response.data;
  } catch (error) {
    throw {
      message:
        error.response?.data?.message ||
        "Failed to send reset link",
      status: error.response?.status,
    };
  }
};

export const resetWorkerPassword = async (token, password) => {
  try {
    const response = await api.put(
      `/auth/worker/reset-password/${token}`,
      { password }
    );

    return response.data;
  } catch (error) {
    throw {
      message:
        error.response?.data?.message ||
        "Failed to reset password",
      status: error.response?.status,
    };
  }
};

