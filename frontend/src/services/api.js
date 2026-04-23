import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 10000 });

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

export const productAPI   = axios.create({ baseURL: 'http://localhost:3001/api', timeout: 10000 });
export const orderAPI     = axios.create({ baseURL: 'http://localhost:3002/api', timeout: 10000 });
export const inventoryAPI = axios.create({ baseURL: 'http://localhost:3003/api', timeout: 10000 });
export const userAPI      = axios.create({ baseURL: 'http://localhost:3004/api', timeout: 10000 });
export const paymentAPI   = axios.create({ baseURL: 'http://localhost:3005/api', timeout: 10000 });
export const listingAPI   = axios.create({ baseURL: 'http://localhost:3006/api', timeout: 30000 });

// 30s timeout for listingAPI because image uploads can take time

[productAPI, orderAPI, inventoryAPI, userAPI, paymentAPI, listingAPI].forEach((instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
});

export default api;
