import axiosInstance from './axiosInstance';

export const getUsers = async () => {
  const response = await axiosInstance.get('/users');
  return response.data;
};

export const getDoctorsList = async () => {
  const response = await axiosInstance.get('/users/doctors');
  return response.data;
};

export const adminCreateUser = async (data) => {
  const response = await axiosInstance.post('/users', data);
  return response.data;
};

export const updateUserProfile = async (id, data) => {
  const response = await axiosInstance.put(`/users/${id}`, data);
  return response.data;
};

export const deactivateUserProfile = async (id) => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};

export const updateSubscriptionPlan = async (id, subscriptionPlan) => {
  const response = await axiosInstance.put(`/users/${id}/subscription`, { subscriptionPlan });
  return response.data;
};
