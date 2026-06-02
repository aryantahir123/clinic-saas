const axios = require('axios');

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor exactly as in axiosInstance.js
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error);
  }
);

async function testAxios() {
  const payload = {
    name: "Umair",
    email: "umair12@example.com", // This email is already registered now
    phone: "00000000000",
    password: "password123",
    role: "patient"
  };

  try {
    const response = await axiosInstance.post('/auth/register', payload);
    console.log('Success:', response.data);
  } catch (error) {
    console.log('--- AXIOS ERROR CAUGHT ---');
    console.log('Is AxiosError?', axios.isAxiosError(error));
    console.log('Error Message:', error.message);
    if (error.response) {
      console.log('Response Status:', error.response.status);
      console.log('Response Data:', error.response.data);
      console.log('Message extracted:', error.response?.data?.message);
    } else {
      console.log('NO ERROR RESPONSE OBJECT (Network/CORS error)');
      console.log('Code:', error.code);
    }
  }
}

testAxios();
