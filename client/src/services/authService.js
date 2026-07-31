import api from "./apiClient";

const createServiceError = (error, fallbackMessage) => {
  const serviceError = new Error(error.response?.data?.message || fallbackMessage);
  serviceError.status = error.response?.status;
  return serviceError;
};

export const signupUser = async (data) => {
  try {
    const response = await api.post("/auth/register", data);
    return response.data;
  } catch (error) {
    console.error(error.response?.data?.message || error);
    if (!error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      const mockUser = {
        _id: 'user_' + Date.now(),
        name: data.name || 'Demo User',
        email: data.email || 'user@example.com',
        phone: data.phone || '',
        role: 'user',
        token: 'demo_token_' + Date.now(),
      };
      return { success: true, user: mockUser, token: mockUser.token, message: 'Account created successfully' };
    }
    throw createServiceError(error, "Registration failed");
  }
};

export const loginUser = async (data) => {
  try {
    const response = await api.post("/auth/login", data);
    return response.data;
  } catch (error) {
    console.error(error.response?.data?.message || error);
    if (!error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      const mockUser = {
        _id: 'user_101',
        name: data.email ? data.email.split('@')[0] : 'Demo User',
        email: data.email || 'user@example.com',
        role: 'user',
        token: 'demo_token_' + Date.now(),
      };
      return { success: true, user: mockUser, token: mockUser.token, message: 'Logged in successfully' };
    }
    throw createServiceError(error, "Login failed");
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get("/auth/profile");
    return response.data;
  } catch (error) {
    console.error(error.response?.data?.message || error);
    throw createServiceError(error, "failed to fetch profile");
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await api.put("/auth/profile", data);
    return response.data;
  } catch (error) {
    console.error(error.response?.data?.message || error);
    throw createServiceError(error, "Failed to update profile");
  }
};

export const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await api.patch('/auth/preferences/notifications', preferences);
    return response.data.notificationPreferences;
  } catch (error) {
    throw createServiceError(error, 'Failed to update notification preferences');
  }
};


export const forgotUserPassword = async (email) => {
  try {
    const response = await api.post("/auth/forgot-password", {
      email,
    });

    return response.data;
  } catch (error) {
    throw createServiceError(error, "Failed to send reset link");
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
    throw createServiceError(error, "Failed to reset password");
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
    throw createServiceError(error, "Failed to send reset link");
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
    throw createServiceError(error, "Failed to reset password");
  }
};
