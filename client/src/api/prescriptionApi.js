import axiosInstance from './axiosInstance';

export const createPrescription = async (data) => {
  const response = await axiosInstance.post('/prescriptions', data);
  return response.data;
};

export const getPrescriptionsByPatient = async (patientId) => {
  const response = await axiosInstance.get(`/prescriptions/patient/${patientId}`);
  return response.data;
};

export const getPrescriptionById = async (id) => {
  const response = await axiosInstance.get(`/prescriptions/${id}`);
  return response.data;
};

export const updatePrescription = async (id, data) => {
  const response = await axiosInstance.put(`/prescriptions/${id}`, data);
  return response.data;
};

export const downloadPDF = async (id) => {
  const response = await axiosInstance.get(`/prescriptions/${id}/pdf`, {
    responseType: 'blob',
  });
  return response.data;
};

export const deletePrescription = async (id) => {
  const response = await axiosInstance.delete(`/prescriptions/${id}`);
  return response.data;
};
