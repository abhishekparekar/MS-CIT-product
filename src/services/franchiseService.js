// src/services/franchiseService.js
import apiClient from './apiClient';

export const franchiseService = {
  // Get current franchise profile and stats
  async getMyFranchise() {
    return await apiClient.get('/franchises/me');
  },

  // Get franchise dashboard analytics
  async getDashboardAnalytics() {
    return await apiClient.get('/analytics/franchise');
  },

  // Submit franchise application (Public)
  async applyForAffiliation(applicationData) {
    return await apiClient.post('/affiliations', applicationData);
  },

  // Update franchise center profile
  async updateFranchise(id, updateData) {
    return await apiClient.put(`/franchises/${id}`, updateData);
  },

  // Get franchise messages
  async getMessages() {
    return await apiClient.get('/messages');
  },

  // Send message to Admin
  async sendMessage(messageData) {
    return await apiClient.post('/messages', messageData);
  }
};

export default franchiseService;
