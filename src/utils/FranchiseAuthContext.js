// src/utils/FranchiseAuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, database } from '../firebase/config';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setError(null);
        
        if (firebaseUser) {
          console.log('Firebase franchise user detected:', firebaseUser.email);
          
          // Find franchise in trainingCenterApplications (approved franchises)
          const approvedCentersRef = ref(database, 'trainingCenterApplications');
          const approvedQuery = query(
            approvedCentersRef, 
            orderByChild('email'), 
            equalTo(firebaseUser.email)
          );
          
          const snapshot = await get(approvedQuery);
          
          if (snapshot.exists()) {
            const franchiseData = Object.entries(snapshot.val())[0];
            const [franchiseId, data] = franchiseData;
            
            // Only allow approved franchises to login
            if (data.status === 'Approved') {
              const franchiseProfile = {
                uid: firebaseUser.uid,
                franchiseId: franchiseId,
                email: firebaseUser.email,
                displayName: data.centerName || data.firmName,
                role: 'franchise',
                userType: 'franchise',
                profile: {
                  centerName: data.centerName,
                  firmName: data.firmName,
                  ownerName: data.ownerName,
                  contactNumber: data.contactNumber,
                  email: data.email,
                  place: data.place,
                  district: data.district,
                  state: data.state,
                  centerAddress: data.centerAddress,
                  trade: data.trade,
                  computerSystems: data.computerSystems,
                  noOfClassroom: data.noOfClassroom,
                  noOfLab: data.noOfLab,
                  seatRequire: data.seatRequire,
                  premisesArea: data.premisesArea,
                  affiliationFee: data.affiliationFee,
                  approvedDate: data.submittedAt,
                  userName: data.userName,
                  status: data.centerStatus || 'Active'
                },
                permissions: ['dashboard', 'students', 'courses', 'reports', 'forms'],
                lastLogin: new Date().toISOString()
              };
              
              setFranchise(franchiseProfile);
              console.log('Franchise authenticated successfully:', data.centerName);
            } else {
              throw new Error('Franchise not approved yet. Please wait for approval.');
            }
          } else {
            throw new Error('Franchise profile not found. Please contact administrator.');
          }
        } else {
          setFranchise(null);
        }
      } catch (error) {
        console.error('Error in franchise auth state change:', error);
        setError(`Authentication error: ${error.message}`);
        setFranchise(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // ✅ FIXED: Proper login function implementation
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      console.log('Franchise login attempt:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Franchise login successful:', userCredential.user.email);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Franchise login error:', error);
      setError(`Login error: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setFranchise(null);
      localStorage.removeItem('adminAuth');
      console.log('Franchise logged out successfully');
      return { success: true };
    } catch (error) {
      console.error('Franchise logout error:', error);
      setError(`Logout error: ${error.message}`);
      return { success: false, error: error.message };
    }
  };

  // ✅ FIXED: Ensure all functions are in the value object
  const value = {
    franchise,
    user: franchise, // Alias for consistency
    login,           // ✅ Make sure login function is included
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
