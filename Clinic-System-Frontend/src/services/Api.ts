import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.BACKEND_URL || 'http://localhost:3000',
  withCredentials: true,
  timeout: 30000,
  // ❌ KHÔNG set Content-Type mặc định ở đây
  // headers: { 'Content-Type': 'application/json' },
});

// ✅ Dùng interceptor để xử lý Content-Type thông minh
api.interceptors.request.use(
  (config) => {
    // Nếu data là FormData, KHÔNG set Content-Type (để browser tự set với boundary)
    if (config.data instanceof FormData) {
      console.log('📤 Detected FormData, letting browser set Content-Type with boundary');
      // Xóa Content-Type nếu có
      delete config.headers['Content-Type'];
    } else {
      // Chỉ set Content-Type cho JSON requests
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response interceptor để xử lý lỗi chung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;