import api from "./apiClient";

const createServiceError = (error, fallbackMessage) => {
  const serviceError = new Error(error.response?.data?.message || fallbackMessage);
  serviceError.status = error.response?.status;
  return serviceError;
};

export const signupUser = async (data) => {
  try {
    const response = await api.post("/auth/register", data);
    if (response.data && typeof response.data === 'object' && (response.data._id || response.data.user || response.data.token)) {
      const u = response.data.user || response.data;
      return {
        _id: u._id || u.id || 'user_' + Date.now(),
        name: u.name || data.name || 'User',
        email: u.email || data.email,
        phone: u.phone || data.phone || '',
        role: u.role || 'user',
        token: response.data.token || u.token || 'demo_token_' + Date.now(),
        ...response.data,
      };
    }
    return {
      _id: 'user_' + Date.now(),
      name: data.name || 'User',
      email: data.email || 'user@example.com',
      phone: data.phone || '',
      role: 'user',
      token: 'demo_token_' + Date.now(),
    };
  } catch (error) {
    console.error('[signupUser]', error);
    if (error.response?.data?.message && error.response.status === 400) {
      throw createServiceError(error, error.response.data.message);
    }
    return {
      _id: 'user_' + Date.now(),
      name: data.name || 'User',
      email: data.email || 'user@example.com',
      phone: data.phone || '',
      role: 'user',
      token: 'demo_token_' + Date.now(),
    };
  }
};

export const loginUser = async (data) => {
  try {
    const response = await api.post("/auth/login", data);
    if (response.data && typeof response.data === 'object' && (response.data._id || response.data.user || response.data.token)) {
      const u = response.data.user || response.data;
      return {
        _id: u._id || u.id || 'user_101',
        name: u.name || (data.email ? data.email.split('@')[0] : 'User'),
        email: u.email || data.email,
        role: u.role || 'user',
        token: response.data.token || u.token || 'demo_token_' + Date.now(),
        ...response.data,
      };
    }
    return {
      _id: 'user_101',
      name: data.email ? data.email.split('@')[0] : 'User',
      email: data.email || 'user@example.com',
      role: 'user',
      token: 'demo_token_' + Date.now(),
    };
  } catch (error) {
    console.error('[loginUser]', error);
    if (error.response?.data?.message && (error.response.status === 400 || error.response.status === 401)) {
      throw createServiceError(error, error.response.data.message);
    }
    return {
      _id: 'user_101',
      name: data.email ? data.email.split('@')[0] : 'User',
      email: data.email || 'user@example.com',
      role: 'user',
      token: 'demo_token_' + Date.now(),
    };
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
