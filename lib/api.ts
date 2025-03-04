import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const decisionApi = {
  getAll: () => api.get('/decisions'),
  getById: (id: string) => api.get(`/decisions/${id}`),
  create: (data: any) => api.post('/decisions', data),
  update: (id: string, data: any) => api.patch(`/decisions/${id}`, data),
  delete: (id: string) => api.delete(`/decisions/${id}`)
};