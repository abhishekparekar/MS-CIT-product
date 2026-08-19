import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config'; // Add this import
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Add this import

const DashboardHeader = ({ title, onMenuClick }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  // Add user state
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: 'Admin',
    email: '',
    initials: 'AD'
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Extract user information
        const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
        const email = currentUser.email || '';
        
        // Generate initials from display name or email
        const initials = displayName.length >= 2 
          ? displayName.substring(0, 2).toUpperCase()
          : displayName.charAt(0).toUpperCase() + (email.charAt(0).toUpperCase() || 'U');

        setUserProfile({
          name: displayName,
          email: email,
          initials: initials
        });
      } else {
        // Reset to default if no user
        setUserProfile({
          name: 'Admin',
          email: '',
          initials: 'AD'
        });
      }
    });

    return unsubscribe;
  }, []);

  const handleLogoutClick = () => {
    if (isMobile) {
      // Direct logout on mobile for better UX
      handleLogout();
    } else {
      // Show confirmation on desktop
      setShowLogoutConfirm(true);
    }
  };

  // Modified logout function with Firebase signOut
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect to login page or handle logout in parent component
      window.location.href = '/login'; // or use your routing method
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const confirmLogout = () => {
    handleLogout();
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const styles = {
    header: {
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      color: '#f8fafc',
      padding: isMobile ? '16px 20px' : isTablet ? '18px 24px' : '20px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
      borderBottom: '2px solid rgba(251, 191, 36, 0.2)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      minHeight: isMobile ? '60px' : isTablet ? '65px' : '70px',
    },

    leftSection: {
      display: 'flex',
      alignItems: 'center',
      flex: 1,
    },

    menuToggleBtn: {
      fontSize: isMobile ? '1.4rem' : isTablet ? '1.5rem' : '1.6rem',
      background: 'rgba(251, 191, 36, 0.1)',
      border: '2px solid rgba(251, 191, 36, 0.3)',
      color: '#fbbf24',
      cursor: 'pointer',
      padding: isMobile ? '8px 10px' : '10px 12px',
      borderRadius: '10px',
      marginRight: isMobile ? '15px' : isTablet ? '18px' : '20px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: isMobile ? '40px' : '44px',
      height: isMobile ? '40px' : '44px',
      boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2)',
      outline: 'none',
    },

    menuToggleBtnHover: {
      background: 'rgba(251, 191, 36, 0.2)',
      borderColor: '#fbbf24',
      transform: 'scale(1.05)',
      boxShadow: '0 4px 16px rgba(251, 191, 36, 0.3)',
    },

    title: {
      margin: 0,
      fontWeight: '700',
      fontSize: isMobile ? '1.2rem' : isTablet ? '1.4rem' : '1.6rem',
      color: '#fbbf24',
      letterSpacing: '0.5px',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      lineHeight: '1.2',
      flex: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '8px' : '12px',
    },

    // Add user profile info styles
    userInfo: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      marginRight: isMobile ? '8px' : '12px',
    },

    userName: {
      fontSize: isMobile ? '0.8rem' : '0.9rem',
      fontWeight: '600',
      color: '#fbbf24',
      margin: '0',
      lineHeight: '1.2',
    },

    userEmail: {
      fontSize: isMobile ? '0.7rem' : '0.75rem',
      color: '#cbd5e1',
      margin: '0',
      lineHeight: '1.2',
      display: isMobile ? 'none' : 'block',
    },

    logoutBtn: {
      fontSize: isMobile ? '0.8rem' : '0.9rem',
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      border: '2px solid rgba(239, 68, 68, 0.3)',
      color: '#fff',
      cursor: 'pointer',
      padding: isMobile ? '6px 10px' : '8px 14px',
      borderRadius: '8px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      fontWeight: '600',
      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
      outline: 'none',
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
      minWidth: isMobile ? '70px' : '80px',
    },

    logoutBtnHover: {
      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      borderColor: '#ef4444',
      transform: 'scale(1.05)',
      boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)',
    },

    userAvatar: {
      width: isMobile ? '32px' : '36px',
      height: isMobile ? '32px' : '36px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? '1rem' : '1.2rem',
      fontWeight: '600',
      color: '#1e293b',
      border: '2px solid rgba(251, 191, 36, 0.3)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2)',
    },

    userAvatarHover: {
      transform: 'scale(1.1)',
      boxShadow: '0 4px 16px rgba(251, 191, 36, 0.4)',
      borderColor: '#fbbf24',
    },

    menuIcon: {
      transition: 'transform 0.3s ease',
    },

    // Confirmation Modal Styles
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    },

    modal: {
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      borderRadius: '16px',
      padding: isMobile ? '24px' : '32px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      border: '2px solid rgba(251, 191, 36, 0.2)',
      maxWidth: isMobile ? '320px' : '400px',
      width: '90%',
      textAlign: 'center',
      color: '#f8fafc',
    },

    modalTitle: {
      fontSize: isMobile ? '1.2rem' : '1.4rem',
      fontWeight: '700',
      color: '#fbbf24',
      marginBottom: '16px',
    },

    modalText: {
      fontSize: isMobile ? '0.9rem' : '1rem',
      color: '#cbd5e1',
      marginBottom: '24px',
      lineHeight: '1.5',
    },

    modalButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      flexDirection: isMobile ? 'column' : 'row',
    },

    confirmBtn: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: '#fff',
      border: '2px solid rgba(239, 68, 68, 0.3)',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease',
      minWidth: '100px',
    },

    cancelBtn: {
      background: 'rgba(251, 191, 36, 0.1)',
      color: '#fbbf24',
      border: '2px solid rgba(251, 191, 36, 0.3)',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease',
      minWidth: '100px',
    },

    confirmBtnHover: {
      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      transform: 'scale(1.05)',
    },

    cancelBtnHover: {
      background: 'rgba(251, 191, 36, 0.2)',
      borderColor: '#fbbf24',
      transform: 'scale(1.05)',
    }
  };

  // Add responsive CSS
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes modalFadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }

      .dashboard-header {
        animation: fadeIn 0.5s ease-out;
      }

      .menu-toggle-btn:focus-visible {
        outline: 3px solid #fbbf24;
        outline-offset: 2px;
      }

      .logout-btn:focus-visible {
        outline: 3px solid #ef4444;
        outline-offset: 2px;
      }

      .modal {
        animation: modalFadeIn 0.3s ease-out;
      }

      @media (max-width: 768px) {
        .dashboard-header {
          padding: 14px 16px !important;
          min-height: 56px !important;
        }
        
        .dashboard-title {
          font-size: 1.1rem !important;
        }
        
        .menu-toggle-btn {
          width: 36px !important;
          height: 36px !important;
          font-size: 1.3rem !important;
          margin-right: 12px !important;
        }

        .logout-btn {
          min-width: 65px !important;
          font-size: 0.75rem !important;
          padding: 5px 8px !important;
        }
      }

      @media (max-width: 480px) {
        .dashboard-header {
          padding: 12px 14px !important;
          min-height: 52px !important;
        }
        
        .dashboard-title {
          font-size: 1rem !important;
        }
        
        .menu-toggle-btn {
          width: 34px !important;
          height: 34px !important;
          font-size: 1.2rem !important;
          margin-right: 10px !important;
        }

        .logout-btn {
          min-width: 60px !important;
          font-size: 0.7rem !important;
          padding: 4px 6px !important;
        }

        .right-section {
          gap: 6px !important;
        }
      }

      @media (min-width: 1200px) {
        .dashboard-header {
          padding: 22px 32px !important;
          min-height: 75px !important;
        }
        
        .dashboard-title {
          font-size: 1.8rem !important;
        }

        .logout-btn {
          min-width: 90px !important;
          font-size: 1rem !important;
          padding: 10px 16px !important;
        }
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

  // Modified getUserInitials to use real user data
  const getUserInitials = () => {
    return userProfile.initials;
  };

  return (
    <>
      <header className="dashboard-header" style={styles.header}>
        <div style={styles.leftSection}>
          <button
            onClick={onMenuClick}
            className="menu-toggle-btn"
            aria-label="Toggle navigation menu"
            style={styles.menuToggleBtn}
            onMouseEnter={e => {
              Object.assign(e.currentTarget.style, styles.menuToggleBtnHover);
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(251, 191, 36, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.3)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(251, 191, 36, 0.2)';
            }}
          >
            <span style={styles.menuIcon}>☰</span>
          </button>

          <h1 className="dashboard-title" style={styles.title}>
            {title}
          </h1>
        </div>

        <div style={styles.rightSection} className="right-section">
          {/* Add user profile info */}
          <div style={styles.userInfo}>
            <p style={styles.userName}>{userProfile.name}</p>
            <p style={styles.userEmail}>{userProfile.email}</p>
          </div>

          <button
            onClick={handleLogoutClick}
            className="logout-btn"
            aria-label="Logout from dashboard"
            style={styles.logoutBtn}
            onMouseEnter={e => {
              Object.assign(e.currentTarget.style, styles.logoutBtnHover);
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.2)';
            }}
            title="Logout from system"
          >
            <span>🚪</span>
            <span>{isMobile ? 'Exit' : 'Logout'}</span>
          </button>
          
          <div
            style={styles.userAvatar}
            onMouseEnter={e => {
              Object.assign(e.currentTarget.style, styles.userAvatarHover);
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(251, 191, 36, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.3)';
            }}
            title={`${userProfile.name} - ${userProfile.email}`}
            role="button"
            tabIndex={0}
          >
            {getUserInitials()}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div 
          style={styles.modalOverlay}
          onClick={cancelLogout}
        >
          <div 
            style={styles.modal}
            className="modal"
            onClick={e => e.stopPropagation()}
          >
            <h3 style={styles.modalTitle}>Confirm Logout</h3>
            <p style={styles.modalText}>
              Are you sure you want to logout, {userProfile.name}? 
              You will need to login again to access your account.
            </p>
            <div style={styles.modalButtons}>
              <button
                style={styles.confirmBtn}
                onClick={confirmLogout}
                onMouseEnter={e => {
                  Object.assign(e.currentTarget.style, styles.confirmBtnHover);
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Yes, Logout
              </button>
              <button
                style={styles.cancelBtn}
                onClick={cancelLogout}
                onMouseEnter={e => {
                  Object.assign(e.currentTarget.style, styles.cancelBtnHover);
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(251, 191, 36, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.3)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardHeader;
