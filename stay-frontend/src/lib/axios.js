import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Attach token if logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stay_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or invalid (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('stay_token');
      localStorage.removeItem('stay_user');
      // Optional: redirect to login if page is not public
      if (!window.location.pathname.startsWith('/login') && 
          !window.location.pathname.startsWith('/register') && 
          window.location.pathname !== '/' && 
          !window.location.pathname.startsWith('/search') && 
          !window.location.pathname.startsWith('/property/')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
