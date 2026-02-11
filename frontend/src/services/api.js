import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Change this to your backend URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const cashierAPI = {
  // Authentication
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  
  // Operations
  getOperations: (params = {}) => api.get('/operations', { params }),
  createOperation: (operationData) => api.post('/operations', operationData),
  updateOperation: (id, operationData) => api.put(`/operations/${id}`, operationData),
  deleteOperation: (id) => api.delete(`/operations/${id}`),
  
  // Cash Register
  getCashRegisters: () => api.get('/cash-registers'),
  getCashRegisterById: (id) => api.get(`/cash-registers/${id}`),
  getCurrentBalance: () => api.get('/cash-registers/current-balance'),
  updateBalance: (data) => api.post('/cash-registers/update-balance', data),
  
  // Motifs
  getMotifs: (type) => api.get('/motifs', { params: { type } }),
  
  // Documents
  uploadDocument: (operationId, file) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post(`/operations/${operationId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Reports
  getDailyReport: (date) => api.get('/reports/daily', { params: { date } }),
  getMonthlyReport: (month, year) => api.get('/reports/monthly', { params: { month, year } }),
};

export default api;