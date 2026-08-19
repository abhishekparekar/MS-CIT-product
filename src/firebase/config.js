// src/firebase/config.js - MongoDB Atlas Migration & SaaS REST API Bridge
// NOTE: Firebase Database has been successfully migrated to MongoDB Atlas + Node.js REST API Backend.
// All data is stored in MongoDB Atlas collections (tenants, users, students, courses, exams, etc.)

import { API_BASE_URL } from '../services/apiClient';

console.log(`🍃 MongoDB Atlas SaaS REST API Backend Active: ${API_BASE_URL}`);

// Compatibility stubs so legacy components continue rendering safely
export const auth = {
  currentUser: JSON.parse(localStorage.getItem('user') || 'null'),
  onAuthStateChanged: (cb) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    cb(user);
    return () => {};
  },
  signOut: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const database = {
  type: 'MongoDB Atlas',
  apiEndpoint: API_BASE_URL
};

export const db = database;
export const storage = {};
export const analytics = {};

const app = {
  name: 'ITPL-MSCIT-MongoDB-SaaS',
  database,
  auth
};

export default app;