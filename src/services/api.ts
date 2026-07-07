// src/services/api.ts
import axios from 'axios';
import type { AxiosInstance,  AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import CryptoJS from 'crypto-js';

const API_BASE_URL = 'https://kingsconcept.com.ng/esm/api/';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': '1.0.0',
    'Accept': 'application/json'
  }
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const encryptedToken = sessionStorage.getItem('auth_token');
    if (encryptedToken && config.headers) {
      try {
        const encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY || 'default-key';
        
        const bytes = CryptoJS.AES.decrypt(encryptedToken, encryptionKey);
      
        const token = bytes.toString(CryptoJS.enc.Utf8);
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error decrypting token:', error);
      }
    }

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken && config.headers) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    if (config.headers) {
      config.headers['X-Request-Timestamp'] = Date.now().toString();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const encryptedRefreshToken = sessionStorage.getItem('refresh_token');
        if (!encryptedRefreshToken) {
          throw new Error('No refresh token available');
        }

        const encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY || 'default-key';
        const bytes = CryptoJS.AES.decrypt(encryptedRefreshToken, encryptionKey);
        const refreshToken = bytes.toString(CryptoJS.enc.Utf8);

        // Call refresh token endpoint
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });

        const { token } = response.data;
        
        // Store new token
        const newEncryptedToken = CryptoJS.AES.encrypt(token, encryptionKey).toString();
        sessionStorage.setItem('auth_token', newEncryptedToken);

        // Update session expiry
        const expiryTime = Date.now() + (response.data.expiresIn * 1000);
        sessionStorage.setItem('session_expiry', expiryTime.toString());

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - force logout
        sessionStorage.clear();
        document.cookie = 'session_id=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden - insufficient permissions');
    }

    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded');
      // Could implement retry with backoff
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error - server may be down');
    }

    return Promise.reject(error);
  }
);

// API helper methods
export const apiService = {
  // Auth endpoints
  auth: {
    login: (data: { email: string; password: string; two_factor_code?: string }) =>
      api.post('/auth/login', data),
    
    register: (data: any) =>
      api.post('/auth/register', data),
    
    logout: () =>
      api.post('/auth/logout'),
    
    refreshToken: (refreshToken: string) =>
      api.post('/auth/refresh', { refresh_token: refreshToken }),
    
    validateToken: () =>
      api.get('/auth/validate'),
    
    forgotPassword: (email: string) =>
      api.post('/auth/forgot-password', { email }),
    
    resetPassword: (data: { token: string; password: string; password_confirmation: string }) =>
      api.post('/auth/reset-password', data),
    
    verifyEmail: (token: string) =>
      api.post('/auth/verify-email', { token }),
    
    resendVerification: () =>
      api.post('/auth/resend-verification'),
    
    enable2FA: () =>
      api.post('/auth/enable-2fa'),
    
    verify2FA: (code: string) =>
      api.post('/auth/verify-2fa', { code }),
    
    disable2FA: () =>
      api.post('/auth/disable-2fa'),
  },

  // Admin endpoints
  admin: {
    getDashboardStats: () =>
      api.get('/admin/dashboard/stats'),
    
    getDashboardRevenue: () =>
      api.get('/admin/dashboard/revenue'),
    
    getDashboardVisitorStats: () =>
      api.get('/admin/dashboard/visitor-stats'),
    
    getRecentActivities: () =>
      api.get('/admin/dashboard/recent-activities'),
    
    // Residents
    getResidents: (params?: any) =>
      api.get('/admin/residents', { params }),
    
    createResident: (data: any) =>
      api.post('/admin/residents', data),
    
    updateResident: (id: number, data: any) =>
      api.put(`/admin/residents/${id}`, data),
    
    deleteResident: (id: number) =>
      api.delete(`/admin/residents/${id}`),
    
    // Tenants
    getTenants: (params?: any) =>
      api.get('/admin/tenants', { params }),
    
    createTenant: (data: any) =>
      api.post('/admin/tenants', data),
    
    updateTenant: (id: number, data: any) =>
      api.put(`/admin/tenants/${id}`, data),
    
    deleteTenant: (id: number) =>
      api.delete(`/admin/tenants/${id}`),
    
    // Staff
    getStaff: (params?: any) =>
      api.get('/admin/staff', { params }),
    
    createStaff: (data: any) =>
      api.post('/admin/staff', data),
    
    updateStaff: (id: number, data: any) =>
      api.put(`/admin/staff/${id}`, data),
    
    deleteStaff: (id: number) =>
      api.delete(`/admin/staff/${id}`),
    
    // Buildings
    getBuildings: () =>
      api.get('/admin/buildings'),
    
    createBuilding: (data: any) =>
      api.post('/admin/buildings', data),
    
    updateBuilding: (id: number, data: any) =>
      api.put(`/admin/buildings/${id}`, data),
    
    deleteBuilding: (id: number) =>
      api.delete(`/admin/buildings/${id}`),
    
    // Bills
    getBills: (params?: any) =>
      api.get('/admin/bills', { params }),
    
    getBillsStats: () =>
      api.get('/admin/bills/stats'),
    
    createBill: (data: any) =>
      api.post('/admin/bills', data),
    
    updateBill: (id: number, data: any) =>
      api.put(`/admin/bills/${id}`, data),
    
    // Maintenance
    getMaintenanceRequests: (params?: any) =>
      api.get('/admin/maintenance', { params }),
    
    getMaintenanceStats: () =>
      api.get('/admin/maintenance/stats'),
    
    assignMaintenance: (id: number, data: any) =>
      api.put(`/admin/maintenance/${id}/assign`, data),
    
    updateMaintenanceStatus: (id: number, data: any) =>
      api.put(`/admin/maintenance/${id}/status`, data),
    
    // Visitors
    getVisitors: (params?: any) =>
      api.get('/admin/visitors', { params }),
    
    // Access Logs
    getAccessLogs: (params?: any) =>
      api.get('/admin/access-logs', { params }),
    
    // Audit Logs
    getAuditLogs: (params?: any) =>
      api.get('/admin/audit-logs', { params }),
    
    // Notices
    getNotices: (params?: any) =>
      api.get('/notices/manage', { params }),
    
    createNotice: (data: any) =>
      api.post('/notices/manage', data),
    
    updateNotice: (id: number, data: any) =>
      api.put(`/notices/manage/${id}`, data),
    
    deleteNotice: (id: number) =>
      api.delete(`/notices/manage/${id}`),
    
    // Comments
    getComments: (noticeId: number) =>
      api.get(`/notices/${noticeId}/comments`),
    
    createComment: (data: any) =>
      api.post('/notices/comments', data),
  },

  // Resident endpoints
  resident: {
    getDashboardData: () =>
      api.get('/resident/dashboard'),
    
    getBills: (params?: any) =>
      api.get('/bills/my-bills', { params }),
    
    getPaymentHistory: () =>
      api.get('/bills/payment-history'),
    
    payBill: (billId: number, data: any) =>
      api.post(`/bills/${billId}/pay`, data),
    
    getMaintenanceRequests: (params?: any) =>
      api.get('/maintenance/requests', { params }),
    
    createMaintenanceRequest: (data: FormData) =>
      api.post('/maintenance/requests', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
    
    getVisitors: (params?: any) =>
      api.get('/visitors/manage', { params }),
    
    createVisitor: (data: any) =>
      api.post('/visitors/manage', data),
    
    getFamilyMembers: () =>
      api.get('/resident/family'),
    
    addFamilyMember: (data: any) =>
      api.post('/resident/family', data),
    
    updateFamilyMember: (id: number, data: any) =>
      api.put(`/resident/family/${id}`, data),
    
    deleteFamilyMember: (id: number) =>
      api.delete(`/resident/family/${id}`),
    
    getAccessCard: () =>
      api.get('/access/my-card'),
    
    updateProfile: (data: any) =>
      api.put('/profile/update', data),
    
    uploadPhoto: (data: FormData) =>
      api.post('/profile/upload-photo', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
  },

  // Tenant endpoints
  tenant: {
    getDashboardData: () =>
      api.get('/tenant/dashboard'),
    
    getBills: (params?: any) =>
      api.get('/tenant/bills', { params }),
    
    getMaintenanceRequests: (params?: any) =>
      api.get('/tenant/maintenance', { params }),
    
    createMaintenanceRequest: (data: FormData) =>
      api.post('/tenant/maintenance', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
    
    getVisitors: (params?: any) =>
      api.get('/tenant/visitors', { params }),
    
    createVisitor: (data: any) =>
      api.post('/tenant/visitors', data),
    
    getLeaseInfo: () =>
      api.get('/tenant/lease-info'),
    
    getAccessCard: () =>
      api.get('/access/my-card'),
    
    updateProfile: (data: any) =>
      api.put('/profile/update', data),
  },

  // Security endpoints
  security: {
    getDashboardData: () =>
      api.get('/security/dashboard'),
    
    getStats: () =>
      api.get('/security/stats'),
    
    getExpectedVisitors: () =>
      api.get('/security/expected-visitors'),
    
    getCurrentVisitors: () =>
      api.get('/security/current-visitors'),
    
    getRecentEntries: () =>
      api.get('/security/recent-entries'),
    
    searchVisitor: (query: string) =>
      api.get(`/security/search-visitor?query=${query}`),
    
    verifyVisitor: (data: any) =>
      api.post('/security/verify-visitor', data),
    
    manualEntry: (data: any) =>
      api.post('/security/manual-entry', data),
    
    checkOutVisitor: (id: number) =>
      api.post(`/security/checkout/${id}`),
  },

  // Staff endpoints
  staff: {
    getDashboardData: () =>
      api.get('/staff/dashboard'),
    
    getStats: () =>
      api.get('/staff/stats'),
    
    getTasks: (params?: any) =>
      api.get('/staff/tasks', { params }),
    
    updateTaskStatus: (id: number, data: any) =>
      api.put(`/staff/tasks/${id}/status`, data),
    
    getMaintenanceRequests: () =>
      api.get('/staff/maintenance'),
    
    updateProfile: (data: any) =>
      api.put('/profile/update', data),
  },

  // Notifications
  notifications: {
    getAll: () =>
      api.get('/notifications'),
    
    getUnread: () =>
      api.get('/notifications/unread'),
    
    markAsRead: (id: number) =>
      api.put(`/notifications/${id}/read`),
    
    markAllAsRead: () =>
      api.put('/notifications/mark-all-read'),
    
    delete: (id: number) =>
      api.delete(`/notifications/${id}`),
  },

  // Profile
  profile: {
    getProfile: () =>
      api.get('/profile'),
    
    updateProfile: (data: any) =>
      api.put('/profile/update', data),
    
    uploadPhoto: (data: FormData) =>
      api.post('/profile/upload-photo', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
    
    changePassword: (data: any) =>
      api.put('/profile/change-password', data),
  },
};

export default api;