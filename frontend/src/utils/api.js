import axios from 'axios';

const api = axios.create({
  // Pointing directly to your local backend server port
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    try {
      const auth = JSON.parse(localStorage.getItem('shopmart-auth') || '{}');
      const token = auth?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error("Auth token error:", err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';

    if (error.response?.status === 401) {
      // Clear auth and redirect to login if unauthorized
      try {
        const authData = JSON.parse(localStorage.getItem('shopmart-auth') || '{}');
        if (authData?.state?.token) {
          localStorage.removeItem('shopmart-auth');
          window.location.href = '/login';
        }
      } catch (err) {
        console.error("Logout error:", err);
      }
    }

    error.message = message;
    return Promise.reject(error);
  }
);

export default api;