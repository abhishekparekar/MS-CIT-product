// src/App.js - ❌ NO Router here
import React from 'react';
import { AuthProvider } from './utils/AuthContext';
import { FranchiseAuthProvider } from './utils/FranchiseAuthContext';
import AppRoutes from './routes/AppRoutes';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <FranchiseAuthProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </FranchiseAuthProvider>
    </AuthProvider>
  );
}

export default App;
