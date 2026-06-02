import axiosInstance from './axiosInstance';

export const getAppointments = async (params = {}) => {
  const response = await axiosInstance.get('/appointments', { params });
  return response.data;
};

export const bookAppointment = async (data) => {
  const response = await axiosInstance.post('/appointments', data);
  return response.data;
};

export const updateAppointment = async (id, data) => {
  const response = await axiosInstance.put(`/appointments/${id}`, data);
  return response.data;
};

export const updateStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/appointments/${id}/status`, { status });
  return response.data;
};

export const cancelAppointment = async (id) => {
  const response = await axiosInstance.delete(`/appointments/${id}`);
  return response.data;
};

export const getTodaysAppointments = async () => {
  const response = await axiosInstance.get('/appointments/today');
  return response.data;
};

export const getDoctorAppointments = async (id, params = {}) => {
  const response = await axiosInstance.get(`/appointments/doctor/${id}`, { params });
  return response.data;
};

export const getPatientAppointments = async (id) => {
  const response = await axiosInstance.get(`/appointments/patient/${id}`);
  return response.data;
};
