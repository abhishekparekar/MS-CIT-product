// src/routes/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useFranchiseAuth } from '../utils/FranchiseAuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  
  // Get authentication states for different user types
  const { user: studentUser, loading: studentLoading, error: studentError } = useAuth();
  const { franchise: franchiseUser, loading: franchiseLoading, error: franchiseError } = useFranchiseAuth();
  
  // Check admin authentication (from localStorage for now)
  const adminAuth = localStorage.getItem('adminAuth');
  const adminUser = adminAuth ? JSON.parse(adminAuth) : null;

  // Determine current user and loading state based on allowed roles
  const getCurrentAuth = () => {
    if (allowedRoles.includes('admin')) {
      return {
        user: adminUser,
        loading: false,
        error: null,
        userType: 'admin'
      };
    }
    
    if (allowedRoles.includes('franchise')) {
      return {
        user: franchiseUser,
        loading: franchiseLoading,
        error: franchiseError,
        userType: 'franchise'
      };
    }
    
    if (allowedRoles.includes('student')) {
      return {
        user: studentUser,
        loading: studentLoading,
        error: studentError,
        userType: 'student'
      };
    }

    // If multiple roles allowed, check all
    if (allowedRoles.length > 1) {
      const loading = studentLoading || franchiseLoading;
      
      if (loading) {
        return { user: null, loading: true, error: null, userType: null };
      }

      // Priority: Admin > Franchise > Student
      if (adminUser) return { user: adminUser, loading: false, error: null, userType: 'admin' };
      if (franchiseUser) return { user: franchiseUser, loading: false, error: franchiseError, userType: 'franchise' };
      if (studentUser) return { user: studentUser, loading: false, error: studentError, userType: 'student' };
    }

    return { user: null, loading: false, error: null, userType: null };
  };

  const { user, loading, error, userType } = getCurrentAuth();

  // Enhanced Loading Component
  if (loading) {
    return (
      <div style={loadingStyles.container}>
        <div style={loadingStyles.spinner}>
          <div style={loadingStyles.spinnerRing}></div>
          <div style={loadingStyles.pulseRings}>
            <div style={loadingStyles.ring}></div>
            <div style={loadingStyles.ring}></div>
            <div style={loadingStyles.ring}></div>
          </div>
        </div>
        <h2 style={loadingStyles.title}>Authenticating</h2>
        <div style={loadingStyles.dots}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p style={loadingStyles.subtitle}>
          {allowedRoles.includes('admin') && 'Verifying admin access...'}
          {allowedRoles.includes('franchise') && 'Checking franchise credentials...'}
          {allowedRoles.includes('student') && 'Loading student profile...'}
        </p>
      </div>
    );
  }

  // If not authenticated, redirect to appropriate login page
  if (!user) {
    const loginRoutes = getLoginRoute(allowedRoles);
    return <Navigate to={loginRoutes} state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
    // If user is authenticated but doesn't have required role, 
    // redirect to their appropriate dashboard
    const redirectPath = getDashboardPath(userType);
    return <Navigate to={redirectPath} replace />;
  }

  // Add user info to the rendered children
  return React.cloneElement(children, { 
    currentUser: user, 
    userType: userType,
    authError: error 
  });
};

// Helper function to get appropriate login route
const getLoginRoute = (allowedRoles) => {
  if (allowedRoles.length === 1) {
    switch (allowedRoles[0]) {
      case 'admin':
        return '/admin/login';
      case 'franchise':
        return '/franchise/login';
      case 'student':
        return '/login';
      default:
        return '/login';
    }
  }
  
  // If multiple roles allowed, default to student login
  return '/login';
};

// Helper function to get dashboard path based on role
const getDashboardPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'franchise':
      return '/franchise/dashboard';
    case 'student':
      return '/student/dashboard';
    default:
      return '/';
  }
};

// Enhanced Loading Styles
const loadingStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    position: 'relative',
    overflow: 'hidden'
  },
  
  spinner: {
    position: 'relative',
    marginBottom: '32px'
  },
  
  spinnerRing: {
    width: '80px',
    height: '80px',
    border: '6px solid rgba(255, 255, 255, 0.2)',
    borderTop: '6px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1.2s linear infinite',
    position: 'relative',
    zIndex: 2
  },
  
  pulseRings: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1
  },
  
  ring: {
    position: 'absolute',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    animation: 'pulse-ring 2.5s ease-out infinite'
  },
  
  title: {
    fontSize: '2.2rem',
    fontWeight: '800',
    marginBottom: '16px',
    textAlign: 'center',
    letterSpacing: '-0.5px'
  },
  
  dots: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px'
  },
  
  subtitle: {
    fontSize: '1.1rem',
    opacity: '0.85',
    textAlign: 'center',
    maxWidth: '400px',
    lineHeight: '1.5'
  }
};

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes pulse-ring {
      0% { 
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0.8;
      }
      50% { 
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 0.4;
      }
      100% { 
        transform: translate(-50%, -50%) scale(1.6);
        opacity: 0;
      }
    }
    
    @keyframes loading-dots {
      0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
      }
      40% {
        transform: scale(1.2);
        opacity: 1;
      }
    }
    
    .loading-container .dots span {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: white;
      display: inline-block;
      animation: loading-dots 1.6s infinite ease-in-out both;
    }
    
    .loading-container .dots span:nth-child(1) { animation-delay: -0.32s; }
    .loading-container .dots span:nth-child(2) { animation-delay: -0.16s; }
    .loading-container .dots span:nth-child(3) { animation-delay: 0s; }
    
    .loading-container .ring:nth-child(1) { animation-delay: 0s; }
    .loading-container .ring:nth-child(2) { animation-delay: 0.5s; }
    .loading-container .ring:nth-child(3) { animation-delay: 1s; }
  `;
  
  if (!document.head.querySelector('#protected-route-styles')) {
    style.id = 'protected-route-styles';
    document.head.appendChild(style);
  }
}

export default ProtectedRoute;
