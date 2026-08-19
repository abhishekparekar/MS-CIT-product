// src/components/DebugAuthContext.js
import React from 'react';
import { useFranchiseAuth } from '../utils/FranchiseAuthContext';

const DebugAuthContext = () => {
  const franchiseAuth = useFranchiseAuth();
  
  console.log('Debug - Full franchise auth context:', franchiseAuth);
  console.log('Debug - Login function type:', typeof franchiseAuth?.login);
  console.log('Debug - Available functions:', Object.keys(franchiseAuth || {}));
  
  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px' }}>
      <h3>Auth Context Debug</h3>
      <p>Context exists: {franchiseAuth ? 'Yes' : 'No'}</p>
      <p>Login function: {typeof franchiseAuth?.login}</p>
      <p>Loading: {franchiseAuth?.loading ? 'Yes' : 'No'}</p>
      <p>Error: {franchiseAuth?.error || 'None'}</p>
      <p>Available functions: {Object.keys(franchiseAuth || {}).join(', ')}</p>
    </div>
  );
};

export default DebugAuthContext;
