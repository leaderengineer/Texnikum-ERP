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
  updateCurrentUser: (data) => apiClient.put('/auth/me', data),
  requestPasswordReset: (email) => apiClient.post('/auth/password-reset/request', { email }),
  verifyPasswordResetCode: (email, code) => apiClient.post('/auth/password-reset/verify', { email, code }),
  confirmPasswordReset: (email, code, newPassword) => apiClient.post('/auth/password-reset/confirm', { email, code, new_password: newPassword }),
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
  getAll: (params) => apiClient.get('/groups', { params }),
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
  getByGroup: (group) => apiClient.get(`/schedules/group/${group}`),
};

// Institutions
export const institutionsAPI = {
  getAll: () => apiClient.get('/institutions'),
  getById: (id) => apiClient.get(`/institutions/${id}`),
  update: (id, data) => apiClient.put(`/institutions/${id}`, data),
};

// Attendance (Davomat)
export const attendanceAPI = {
  getAll: (params) => apiClient.get('/attendance', { params }),
  getById: (id) => apiClient.get(`/attendance/${id}`),
  create: (data) => apiClient.post('/attendance', data),
  update: (id, data) => apiClient.put(`/attendance/${id}`, data),
  delete: (id) => apiClient.delete(`/attendance/${id}`),
  getByDate: (date, params) => apiClient.get(`/attendance/date/${date}`, { params }),
  getByStudent: (studentId, params) => apiClient.get(`/attendance/student/${studentId}`, { params }),
  getStatistics: (params) => apiClient.get('/attendance/statistics', { params }),
};

// Grades (Baholash)
export const gradesAPI = {
  getAll: (params) => apiClient.get('/grades', { params }),
  getById: (id) => apiClient.get(`/grades/${id}`),
  create: (data) => apiClient.post('/grades', data),
  update: (id, data) => apiClient.put(`/grades/${id}`, data),
  delete: (id) => apiClient.delete(`/grades/${id}`),
  getByStudent: (studentId, params) => apiClient.get(`/grades/student/${studentId}`, { params }),
  getByGroupSubjectDate: (group, subject, date) => apiClient.get(`/grades/group/${group}/subject/${subject}/date/${date}`),
  getStatistics: (group, subject, params) => apiClient.get(`/grades/statistics/group/${group}/subject/${subject}`, { params }),
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

// Lesson Materials (Dars materiallari)
export const lessonMaterialsAPI = {
  getAll: (params) => apiClient.get('/lesson-materials', { params }),
  getById: (id) => apiClient.get(`/lesson-materials/${id}`),
  create: (formData) => apiClient.post('/lesson-materials', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  update: (id, data) => apiClient.put(`/lesson-materials/${id}`, data),
  delete: (id) => apiClient.delete(`/lesson-materials/${id}`),
  download: (id) => apiClient.get(`/lesson-materials/${id}/download`, {
    responseType: 'blob',
  }),
  getViewUrl: (id) => {
    const token = localStorage.getItem('token');
    const baseURL = apiClient.defaults.baseURL;
    return `${baseURL}/lesson-materials/${id}/view?token=${token}`;
  },
};

// Upload
export const uploadAPI = {
  uploadAvatar: (formData) => apiClient.post('/upload/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAvatar: (filename) => {
    const baseURL = apiClient.defaults.baseURL;
    return `${baseURL}/upload/avatar/${filename}`;
  },
};

export default apiClient;
