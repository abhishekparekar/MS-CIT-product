// src/services/feeService.js
import apiClient from './apiClient';

export const feeService = {
  // Record student fee payment and generate receipt
  async recordPayment(paymentData) {
    return await apiClient.post('/fees/pay', paymentData);
  },

  // Get fee payments / receipts
  async getPayments() {
    return await apiClient.get('/fees');
  },

  // Get receipt by receipt number
  async getReceipt(receiptNumber) {
    return await apiClient.get(`/fees/receipt/${receiptNumber}`);
  }
};

export default feeService;
