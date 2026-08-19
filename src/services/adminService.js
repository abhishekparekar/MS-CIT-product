// src/services/adminService.js
import apiClient from './apiClient';

export const adminService = {
  // Get Super Admin Analytics
  async getDashboardAnalytics() {
    return await apiClient.get('/analytics/admin');
  },

  // Get all franchises
  async getFranchises(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/franchises?${query}` : '/franchises';
    return await apiClient.get(endpoint);
  },

  // Create new franchise
  async createFranchise(franchiseData) {
    return await apiClient.post('/franchises', franchiseData);
  },

  // Get pending affiliation applications
  async getAffiliations(status = '') {
    const endpoint = status ? `/affiliations?status=${status}` : '/affiliations';
    return await apiClient.get(endpoint);
  },

  // Approve affiliation application
  async approveAffiliation(applicationId) {
    return await apiClient.post(`/affiliations/${applicationId}/approve`);
  },

  // Update affiliation status (Reject, etc.)
  async updateAffiliationStatus(applicationId, statusData) {
    return await apiClient.put(`/affiliations/${applicationId}/status`, statusData);
  },

  // Gallery items
  async getGallery(category = '') {
    const endpoint = category ? `/gallery?category=${category}` : '/gallery';
    return await apiClient.get(endpoint);
  },

  async addGalleryItem(itemData) {
    return await apiClient.post('/gallery', itemData);
  },

  async deleteGalleryItem(id) {
    return await apiClient.delete(`/gallery/${id}`);
  }
};

export default adminService;
