import axios from 'axios';
import useAuthStore from '../store/authStore';

// API base URL - backend bilan bog'lanish uchun
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token qo'shish
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xatolarni boshqarish
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API kontraktlar (example endpoints)

// Authentication
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  refreshToken: () => apiClient.post('/auth/refresh'),
  getCurrentUser: () => apiClient.get('/auth/me'),
};

// Teachers
export const teachersAPI = {
  getAll: (params) => apiClient.get('/teachers', { params }),
  getById: (id) => apiClient.get(`/teachers/${id}`),
  create: (data) => apiClient.post('/teachers', data),
  update: (id, data) => apiClient.put(`/teachers/${id}`, data),
  delete: (id) => apiClient.delete(`/teachers/${id}`),
};

// Students
export const studentsAPI = {
  getAll: (params) => apiClient.get('/students', { params }),
  getById: (id) => apiClient.get(`/students/${id}`),
  create: (data) => apiClient.post('/students', data),
  update: (id, data) => apiClient.put(`/students/${id}`, data),
  delete: (id) => apiClient.delete(`/students/${id}`),
  getByGroup: (groupId) => apiClient.get(`/students/group/${groupId}`),
};

// Groups
export const groupsAPI = {
  getAll: () => apiClient.get('/groups'),
  getById: (id) => apiClient.get(`/groups/${id}`),
  create: (data) => apiClient.post('/groups', data),
  update: (id, data) => apiClient.put(`/groups/${id}`, data),
  delete: (id) => apiClient.delete(`/groups/${id}`),
};

// Departments (Yo'nalishlar)
export const departmentsAPI = {
  getAll: () => apiClient.get('/departments'),
  getById: (id) => apiClient.get(`/departments/${id}`),
  create: (data) => apiClient.post('/departments', data),
  update: (id, data) => apiClient.put(`/departments/${id}`, data),
  delete: (id) => apiClient.delete(`/departments/${id}`),
};

// Schedules (Dars jadvallari)
export const schedulesAPI = {
  getAll: (params) => apiClient.get('/schedules', { params }),
  getById: (id) => apiClient.get(`/schedules/${id}`),
  create: (data) => apiClient.post('/schedules', data),
  update: (id, data) => apiClient.put(`/schedules/${id}`, data),
  delete: (id) => apiClient.delete(`/schedules/${id}`),
  getByGroup: (groupId) => apiClient.get(`/schedules/group/${groupId}`),
};

// Attendance (Davomat)
export const attendanceAPI = {
  getAll: (params) => apiClient.get('/attendance', { params }),
  getById: (id) => apiClient.get(`/attendance/${id}`),
  create: (data) => apiClient.post('/attendance', data),
  update: (id, data) => apiClient.put(`/attendance/${id}`, data),
  delete: (id) => apiClient.delete(`/attendance/${id}`),
  getByDate: (date) => apiClient.get(`/attendance/date/${date}`),
  getByStudent: (studentId, params) => apiClient.get(`/attendance/student/${studentId}`, { params }),
  getStatistics: (params) => apiClient.get('/attendance/statistics', { params }),
};

// Library (Kutubxona)
export const libraryAPI = {
  getAll: (params) => apiClient.get('/books', { params }),
  getById: (id) => apiClient.get(`/books/${id}`),
  create: (data) => apiClient.post('/books', data),
  update: (id, data) => apiClient.put(`/books/${id}`, data),
  delete: (id) => apiClient.delete(`/books/${id}`),
  getBorrowed: () => apiClient.get('/books/borrowed'),
  borrow: (data) => apiClient.post('/books/borrow', data),
  return: (id) => apiClient.post(`/books/return/${id}`),
};

// Dashboard Statistics
export const dashboardAPI = {
  getStats: () => apiClient.get('/dashboard/stats'),
  getAttendanceStats: (params) => apiClient.get('/dashboard/attendance', { params }),
  getStudentStats: () => apiClient.get('/dashboard/students'),
  getBookStats: () => apiClient.get('/dashboard/books'),
};

// Audit Logs
export const auditAPI = {
  getAll: (params) => apiClient.get('/audit-logs', { params }),
  getById: (id) => apiClient.get(`/audit-logs/${id}`),
};

export default apiClient;
