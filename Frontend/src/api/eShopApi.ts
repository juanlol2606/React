import axios from 'axios';

const eShopApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

eShopApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export { eShopApi };
