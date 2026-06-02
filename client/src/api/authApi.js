import axiosInstance from './axiosInstance';

export const login = async (email, password) => {
  const response = await axiosInstance.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (data) => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data;
};

export const logout = async (refreshToken) => {
  const response = await axiosInstance.post('/auth/logout', { refreshToken });
  return response.data;
};

export const refreshToken = async (token) => {
  const response = await axiosInstance.post('/auth/refresh', { refreshToken: token });
  return response.data;
};

export const getMe = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axiosInstance.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const response = await axiosInstance.post('/auth/reset-password', { email, otp, newPassword });
  return response.data;
};
