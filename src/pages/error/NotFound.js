// src/pages/error/NotFound.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.errorCode}>404</div>
        <div style={styles.errorIcon}>🔍</div>
        <h1 style={styles.title}>Page Not Found</h1>
        <p style={styles.message}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={styles.actions}>
          <button 
            onClick={() => navigate('/')}
            style={styles.button}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <span>🏠</span>
            <span>Go Home</span>
          </button>
          <button 
            onClick={() => navigate(-1)}
            style={{...styles.button, ...styles.secondaryButton}}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <span>←</span>
            <span>Go Back</span>
          </button>
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textAlign: 'center',
    padding: '20px'
  },
  content: {
    maxWidth: '500px',
    animation: 'fadeInUp 0.6s ease-out'
  },
  errorCode: {
    fontSize: '8rem',
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
    animation: 'bounce 2s infinite'
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
    flexWrap: 'wrap'
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
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `;
  
  if (!document.head.querySelector('#notfound-styles')) {
    style.id = 'notfound-styles';
    document.head.appendChild(style);
  }
}

export default NotFound;
