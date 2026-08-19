// src/utils/FranchiseAuthContext.js - REST API Franchise Authentication Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import franchiseService from '../services/franchiseService';

const FranchiseAuthContext = createContext();

export const useFranchiseAuth = () => {
  const context = useContext(FranchiseAuthContext);
  if (!context) {
    throw new Error('useFranchiseAuth must be used within a FranchiseAuthProvider');
  }
  return context;
};

export const FranchiseAuthProvider = ({ children }) => {
  const [franchise, setFranchise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to format franchise object matching previous component expectations
  const formatFranchiseData = (userObj, tenantObj) => {
    const t = tenantObj || userObj?.tenant || {};
    return {
      uid: userObj?.id || userObj?._id,
      franchiseId: t.franchiseId || 'ITPL-101',
      email: userObj?.email || t.email,
      displayName: t.centerName || t.firmName || userObj?.name,
      role: 'franchise',
      userType: 'franchise',
      profile: {
        centerName: t.centerName || 'Training Center',
        firmName: t.firmName || t.centerName,
        ownerName: t.ownerName || userObj?.name,
        contactNumber: t.contactNumber || userObj?.phone,
        email: t.email || userObj?.email,
        place: t.address?.place || '',
        district: t.address?.district || '',
        state: t.address?.state || 'Maharashtra',
        centerAddress: t.address?.centerAddress || '',
        trade: t.trade || 'MS-CIT',
        computerSystems: t.infrastructure?.computerSystems || 15,
        noOfClassroom: t.infrastructure?.noOfClassroom || 2,
        noOfLab: t.infrastructure?.noOfLab || 1,
        seatRequire: t.infrastructure?.seatRequire || 50,
        premisesArea: t.infrastructure?.premisesArea || 500,
        affiliationFee: t.affiliationFee || 25000,
        approvedDate: t.approvedDate || new Date().toISOString(),
        userName: userObj?.username || t.email,
        status: t.subscription?.status || 'Active'
      },
      permissions: ['dashboard', 'students', 'courses', 'reports', 'forms'],
      lastLogin: userObj?.lastLogin || new Date().toISOString()
    };
  };

  useEffect(() => {
    const initFranchise = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          if (userObj.role === 'franchise' || userObj.role === 'superadmin' || userObj.role === 'admin') {
            const franchiseData = formatFranchiseData(userObj, userObj.tenant);
            setFranchise(franchiseData);

            // Fetch latest profile from backend
            franchiseService.getMyFranchise()
              .then(res => {
                if (res.franchise) {
                  const updated = formatFranchiseData(userObj, res.franchise);
                  setFranchise(updated);
                }
              })
              .catch(() => {});
          }
        } catch (e) {
          setFranchise(null);
        }
      }
      setLoading(false);
    };

    initFranchise();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const res = await authService.login({ email, password, role: 'franchise' });

      if (res.success && res.user) {
        const franchiseData = formatFranchiseData(res.user, res.user.tenant);
        setFranchise(franchiseData);
        setLoading(false);
        return { success: true, user: res.user };
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (err) {
      setError(`Login error: ${err.message}`);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      setError(null);
      authService.logout();
      setFranchise(null);
      return { success: true };
    } catch (err) {
      setError(`Logout error: ${err.message}`);
      return { success: false, error: err.message };
    }
  };

  const value = {
    franchise,
    user: franchise,
    login,
    logout,
    loading,
    error,
    isAuthenticated: !!franchise,
    userRole: franchise?.role || null
  };

  return (
    <FranchiseAuthContext.Provider value={value}>
      {children}
    </FranchiseAuthContext.Provider>
  );
};

export default FranchiseAuthProvider;
