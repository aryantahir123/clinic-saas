import axiosInstance from './axiosInstance';

export const getPatients = async (params = {}) => {
  const response = await axiosInstance.get('/patients', { params });
  return response.data;
};

export const getPatientById = async (id) => {
  const response = await axiosInstance.get(`/patients/${id}`);
  return response.data;
};

export const createPatient = async (data) => {
  const response = await axiosInstance.post('/patients', data);
  return response.data;
};

export const updatePatient = async (id, data) => {
  const response = await axiosInstance.put(`/patients/${id}`, data);
  return response.data;
};

export const deletePatient = async (id) => {
  const response = await axiosInstance.delete(`/patients/${id}`);
  return response.data;
};

export const getPatientHistory = async (id) => {
  const response = await axiosInstance.get(`/patients/${id}/history`);
  return response.data;
};

export const searchPatients = async (q) => {
  const response = await axiosInstance.get('/patients/search', { params: { q } });
  return response.data;
};
