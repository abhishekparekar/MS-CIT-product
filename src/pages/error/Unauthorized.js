// src/pages/error/Unauthorized.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.errorCode}>401</div>
        <div style={styles.errorIcon}>🚫</div>
        <h1 style={styles.title}>Access Denied</h1>
        <p style={styles.message}>
          You don't have permission to access this page. Please login with appropriate credentials.
        </p>
        <div style={styles.actions}>
          <button 
            onClick={() => navigate('/login')}
            style={styles.button}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <span>🔑</span>
            <span>Login</span>
          </button>
          <button 
            onClick={() => navigate('/')}
            style={{...styles.button, ...styles.secondaryButton}}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <span>🏠</span>
            <span>Home</span>
          </button>
        </div>
        <div style={styles.loginOptions}>
          <p style={styles.optionsTitle}>Quick Login Options:</p>
          <div style={styles.optionsList}>
            <button 
              onClick={() => navigate('/login')}
              style={styles.optionButton}
            >
              Student Login
            </button>
            <button 
              onClick={() => navigate('/franchise/login')}
              style={styles.optionButton}
            >
              Franchise Login
            </button>
            <button 
              onClick={() => navigate('/admin/login')}
              style={styles.optionButton}
            >
              Admin Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    textAlign: 'center',
    padding: '20px'
  },
  content: {
    maxWidth: '500px',
    animation: 'fadeInUp 0.6s ease-out'
  },
  errorCode: {
    fontSize: '6rem',
    fontWeight: '900',
    marginBottom: '20px',
    background: 'linear-gradient(45deg, #ffffff, rgba(255,255,255,0.8))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: '1'
  },
  errorIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
    animation: 'shake 1s ease-in-out infinite'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '16px'
  },
  message: {
    fontSize: '1.1rem',
    marginBottom: '40px',
    opacity: '0.9',
    lineHeight: '1.6'
  },
  actions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '40px'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  },
  secondaryButton: {
    background: 'transparent',
    border: '2px solid rgba(255, 255, 255, 0.5)'
  },
  loginOptions: {
    marginTop: '30px',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    backdropFilter: 'blur(10px)'
  },
  optionsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px',
    opacity: '0.9'
  },
  optionsList: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  optionButton: {
    padding: '8px 16px',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

// Add CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
  `;
  
  if (!document.head.querySelector('#unauthorized-styles')) {
    style.id = 'unauthorized-styles';
    document.head.appendChild(style);
  }
}

export default Unauthorized;
