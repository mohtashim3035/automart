import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const isDev = import.meta.env.DEV;

export const productAPI   = axios.create({ baseURL: isDev ? 'http://localhost:3001/api' : '/api', timeout: 30000 });
export const orderAPI     = axios.create({ baseURL: isDev ? 'http://localhost:3002/api' : '/api', timeout: 30000 });
export const inventoryAPI = axios.create({ baseURL: isDev ? 'http://localhost:3003/api' : '/api', timeout: 30000 });
export const userAPI      = axios.create({ baseURL: isDev ? 'http://localhost:3004/api' : '/api', timeout: 30000 });
export const paymentAPI   = axios.create({ baseURL: isDev ? 'http://localhost:3005/api' : '/api', timeout: 30000 });
export const listingAPI   = axios.create({ baseURL: isDev ? 'http://localhost:3006/api' : '/api', timeout: 30000 });

[productAPI, orderAPI, inventoryAPI, userAPI, paymentAPI, listingAPI].forEach((instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
});

export default api;
