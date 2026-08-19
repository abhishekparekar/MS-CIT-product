// src/services/examService.js
import apiClient from './apiClient';

export const examService = {
  // Get all active exams
  async getExams() {
    return await apiClient.get('/exams');
  },

  // Get single exam by ID
  async getExamById(id) {
    return await apiClient.get(`/exams/${id}`);
  },

  // Create new exam
  async createExam(examData) {
    return await apiClient.post('/exams', examData);
  },

  // Submit exam answers
  async submitExam(examId, submissionData) {
    return await apiClient.post(`/exams/${examId}/submit`, submissionData);
  },

  // Get exam submissions / results
  async getSubmissions() {
    return await apiClient.get('/exams/submissions');
  },

  // Generate Marksheet
  async createMarksheet(marksheetData) {
    return await apiClient.post('/marksheets', marksheetData);
  },

  // Get Marksheets
  async getMarksheets() {
    return await apiClient.get('/marksheets');
  },

  // Generate Certificate
  async createCertificate(certData) {
    return await apiClient.post('/certificates', certData);
  },

  // Get Certificates
  async getCertificates() {
    return await apiClient.get('/certificates');
  },

  // Public verify certificate
  async verifyCertificate(certNumber) {
    return await apiClient.get(`/certificates/verify/${certNumber}`);
  }
};

export default examService;
