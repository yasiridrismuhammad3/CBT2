import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add JWT Authorization header
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('damale_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to catch 401 unauthorized
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional auto logout on expired token
      if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/auth')) {
        localStorage.removeItem('damale_token');
        localStorage.removeItem('damale_user');
      }
    }
    return Promise.reject(error);
  }
);

export default API;
