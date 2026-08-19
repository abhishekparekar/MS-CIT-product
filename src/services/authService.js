// src/services/authService.js
import apiClient from './apiClient';

export const authService = {
  // Login for Super Admin, Franchise, or Student
  async login(credentials) {
    const data = await apiClient.post('/auth/login', credentials);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  // Register new student or franchise
  async register(userData) {
    const data = await apiClient.post('/auth/register', userData);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  // Get current logged-in user details
  async getCurrentUser() {
    return await apiClient.get('/auth/me');
  },

  // Update profile
  async updateProfile(profileData) {
    return await apiClient.put('/auth/profile', profileData);
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('franchise_token');
    localStorage.removeItem('franchise_user');
  }
};

export default authService;
