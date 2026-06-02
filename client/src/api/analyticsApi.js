import axiosInstance from './axiosInstance';

export const getAdminStats = async () => {
  const response = await axiosInstance.get('/analytics/admin');
  return response.data;
};

export const getDoctorStats = async (id) => {
  const response = await axiosInstance.get(`/analytics/doctor/${id}`);
  return response.data;
};

export const getMonthlyData = async () => {
  const response = await axiosInstance.get('/analytics/monthly');
  return response.data;
};
