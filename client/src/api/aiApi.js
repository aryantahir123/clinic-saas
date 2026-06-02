import axiosInstance from './axiosInstance';

export const symptomCheck = async (data) => {
  const response = await axiosInstance.post('/ai/symptom-check', data);
  return response.data;
};

export const explainPrescription = async (data) => {
  const response = await axiosInstance.post('/ai/explain-prescription', data);
  return response.data;
};

export const riskFlag = async (patientId) => {
  const response = await axiosInstance.post('/ai/risk-flag', { patientId });
  return response.data;
};
