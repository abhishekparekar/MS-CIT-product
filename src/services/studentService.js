// src/services/studentService.js
import apiClient from './apiClient';

export const studentService = {
  // Get students list
  async getStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/students?${query}` : '/students';
    return await apiClient.get(endpoint);
  },

  // Get single student by ID
  async getStudentById(id) {
    return await apiClient.get(`/students/${id}`);
  },

  // Enroll / Create new student
  async enrollStudent(studentData) {
    return await apiClient.post('/students', studentData);
  },

  // Update student
  async updateStudent(id, studentData) {
    return await apiClient.put(`/students/${id}`, studentData);
  },

  // Generate Hall Ticket
  async issueHallTicket(id, examData = {}) {
    return await apiClient.post(`/students/${id}/hall-ticket`, examData);
  },

  // Delete student
  async deleteStudent(id) {
    return await apiClient.delete(`/students/${id}`);
  }
};

export default studentService;
