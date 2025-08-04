import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Authentication functions
export const login = async (email, password) => {
  try {
    const response = await api.post('/token/', {
      email: email, // Use email since our User model uses email as USERNAME_FIELD
      password: password,
    });
    
    const { access, refresh } = response.data;
    localStorage.setItem('authToken', access);
    localStorage.setItem('refreshToken', refresh);
    
    // Get user profile to determine role
    const userResponse = await api.get('/users/profiles/me/');
    const user = userResponse.data;
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.response?.data || 'Login failed' };
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/users/auth/register/', {
      username: userData.email,
      email: userData.email,
      password: userData.password,
      password_confirm: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role,
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.response?.data || 'Registration failed' };
  }
};

export const logout = async () => {
  try {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Logout failed' };
  }
};

export const refreshToken = async () => {
  try {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh) {
      throw new Error('No refresh token available');
    }
    
    const response = await api.post('/token/refresh/', {
      refresh: refresh,
    });
    
    const { access } = response.data;
    localStorage.setItem('authToken', access);
    
    return { success: true, access };
  } catch (error) {
    console.error('Token refresh error:', error);
    // Clear tokens and redirect to login
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    return { success: false, error: 'Token refresh failed' };
  }
};

export default api; 