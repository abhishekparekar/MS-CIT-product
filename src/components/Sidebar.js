import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar, menuItems, userRole }) => {
  const [openSubMenus, setOpenSubMenus] = useState({});
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        toggleSidebar();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, toggleSidebar]);

  const toggleSubMenu = (index) => {
    setOpenSubMenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getMenuIcon = (icon) => {
    const iconMap = {
      dashboard: '📊',
      message: '💬',
      upload: '📤',
      form: '📝',
      download: '📥',
      student: '👨‍🎓',
      coaching: '🏫',
      admission: '📋',
      profile: '👤',
      exam: '📖',
      edit: '✏️',
      courses: '📚',
      gallery: '🖼️',
      affiliation: '🤝',
      demo: '🎬',
      apply: '📄',
      home: '🏠',
      about: 'ℹ️',
      contact: '📞'
    };
    return iconMap[icon] || '📄';
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 998,
      display: isOpen ? 'block' : 'none',
      backdropFilter: 'blur(2px)',
    },

    sidebar: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: window.innerWidth <= 480 ? '260px' : '300px',
      maxWidth: '85vw',
      height: '100vh',
     background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      color: '#f8fafc',
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 999,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },

    sidebarHeader: {
      padding: window.innerWidth <= 480 ? '20px 16px' : '24px 20px',
      borderBottom: '2px solid rgba(255, 255, 255, 0.15)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontWeight: '800',
      fontSize: window.innerWidth <= 480 ? '1.4rem' : '1.7rem',
      color: '#fde047',
      letterSpacing: '0.5px',
      background: 'rgba(255, 255, 255, 0.05)',
    },

    closeBtn: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '2px solid rgba(253, 224, 71, 0.3)',
      color: '#fde047',
      fontSize: window.innerWidth <= 480 ? '20px' : '22px',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
    },

    closeBtnHover: {
      backgroundColor: 'rgba(253, 224, 71, 0.2)',
      borderColor: '#fde047',
      transform: 'scale(1.05)',
    },

    sidebarMenu: {
      flexGrow: 1,
      padding: window.innerWidth <= 480 ? '16px 8px' : '20px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },

    menuItem: {
      marginBottom: '6px',
    },

    menuLink: {
      display: 'flex',
      alignItems: 'center',
      padding: window.innerWidth <= 480 ? '12px 16px' : '14px 18px',
      color: '#e2e8f0',
      textDecoration: 'none',
      fontSize: window.innerWidth <= 480 ? '0.9rem' : '1rem',
      fontWeight: '500',
      borderRadius: '10px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      userSelect: 'none',
      border: '1px solid transparent',
      position: 'relative',
      overflow: 'hidden',
    },

    menuLinkHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      color: '#fde047',
      borderColor: 'rgba(253, 224, 71, 0.3)',
      transform: 'translateX(4px)',
    },

    activeMenuLink: {
      backgroundColor: 'rgba(253, 224, 71, 0.2)',
      color: '#fde047',
      borderColor: '#fde047',
      borderRightWidth: '4px',
      fontWeight: '700',
      boxShadow: '0 4px 12px rgba(253, 224, 71, 0.3)',
    },

    menuIcon: {
      marginRight: window.innerWidth <= 480 ? '12px' : '16px',
      fontSize: window.innerWidth <= 480 ? '1.2rem' : '1.4rem',
      minWidth: '24px',
      textAlign: 'center',
    },

    subMenuToggle: {
      width: '100%',
      background: 'transparent',
      border: '1px solid transparent',
      padding: window.innerWidth <= 480 ? '12px 16px' : '14px 18px',
      color: '#e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      fontSize: window.innerWidth <= 480 ? '0.9rem' : '1rem',
      fontWeight: '500',
      borderRadius: '10px',
      userSelect: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },

    subMenuToggleHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      color: '#fde047',
      borderColor: 'rgba(253, 224, 71, 0.3)',
      transform: 'translateX(4px)',
    },

    subMenu: {
      backgroundColor: 'rgba(30, 64, 175, 0.3)',
      overflow: 'hidden',
      maxHeight: '0',
      transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      borderRadius: '0 0 12px 12px',
      marginTop: '4px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },

    subMenuOpen: {
      maxHeight: '600px',
      paddingTop: '8px',
      paddingBottom: '8px',
    },

    subMenuItem: {
      display: 'block',
      padding: window.innerWidth <= 480 ? '10px 16px 10px 45px' : '12px 18px 12px 50px',
      color: '#cbd5e1',
      textDecoration: 'none',
      fontSize: window.innerWidth <= 480 ? '0.85rem' : '0.9rem',
      fontWeight: '400',
      borderRadius: '8px',
      margin: '2px 8px',
      transition: 'all 0.3s ease',
      userSelect: 'none',
      border: '1px solid transparent',
    },

    subMenuItemHover: {
      color: '#fde047',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderColor: 'rgba(253, 224, 71, 0.2)',
      transform: 'translateX(6px)',
    },

    activeSubMenuItem: {
      color: '#fde047',
      backgroundColor: 'rgba(253, 224, 71, 0.25)',
      fontWeight: '600',
      borderColor: '#fde047',
      borderLeftWidth: '3px',
    },

    userInfo: {
      padding: window.innerWidth <= 480 ? '16px' : '20px',
      borderTop: '2px solid rgba(255, 255, 255, 0.15)',
      fontSize: window.innerWidth <= 480 ? '0.9rem' : '1rem',
      color: '#fde047',
      fontWeight: '600',
      userSelect: 'none',
      textAlign: 'center',
      background: 'rgba(255, 255, 255, 0.05)',
    },

    roleText: {
      fontSize: window.innerWidth <= 480 ? '0.8rem' : '0.9rem',
      color: '#e2e8f0',
      fontWeight: '500',
      textTransform: 'capitalize',
      marginBottom: '4px',
    },

    welcomeText: {
      fontSize: window.innerWidth <= 480 ? '0.75rem' : '0.85rem',
      color: '#cbd5e1',
      opacity: '0.9',
    },

    subMenuArrow: {
      transition: 'transform 0.3s ease',
      fontSize: '0.8rem',
      color: '#cbd5e1',
    },

    subMenuArrowOpen: {
      transform: 'rotate(90deg)',
      color: '#fde047',
    }
  };

  // Add responsive CSS for better mobile experience
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      .sidebar-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      
      .sidebar-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
      }
      
      .sidebar-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(253, 224, 71, 0.4);
        border-radius: 3px;
      }
      
      .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(253, 224, 71, 0.6);
      }

      @media (max-width: 480px) {
        .sidebar-menu-item {
          font-size: 0.85rem !important;
        }
        
        .sidebar-submenu-item {
          font-size: 0.8rem !important;
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

  return (
    <>
      <div
        style={styles.overlay}
        onClick={() => isOpen && toggleSidebar()}
        aria-hidden={!isOpen}
      />
      <nav 
        style={styles.sidebar} 
        className="sidebar-scrollbar"
        aria-label="Sidebar navigation"
      >
        <div style={styles.sidebarHeader}>
          <span>🎓 TechEdu Institute</span>
          <button
            style={styles.closeBtn}
            aria-label="Close sidebar"
            onClick={toggleSidebar}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = styles.closeBtnHover.backgroundColor;
              e.currentTarget.style.borderColor = styles.closeBtnHover.borderColor;
              e.currentTarget.style.transform = styles.closeBtnHover.transform;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(253, 224, 71, 0.3)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ✕
          </button>
        </div>

        <div style={styles.sidebarMenu}>
          {menuItems.map((item, index) => {
            if (item.subItems) {
              return (
                <div key={index} style={styles.menuItem}>
                  <button
                    style={styles.subMenuToggle}
                    onClick={() => toggleSubMenu(index)}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = styles.subMenuToggleHover.backgroundColor;
                      e.currentTarget.style.color = styles.subMenuToggleHover.color;
                      e.currentTarget.style.borderColor = styles.subMenuToggleHover.borderColor;
                      e.currentTarget.style.transform = styles.subMenuToggleHover.transform;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = styles.subMenuToggle.color;
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                    aria-expanded={openSubMenus[index] ? 'true' : 'false'}
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={styles.menuIcon}>{getMenuIcon(item.icon)}</span>
                      {item.label}
                    </span>
                    <span 
                      style={{
                        ...styles.subMenuArrow,
                        ...(openSubMenus[index] ? styles.subMenuArrowOpen : {})
                      }}
                    >
                      ▶
                    </span>
                  </button>

                  <div
                    style={{
                      ...styles.subMenu,
                      ...(openSubMenus[index] ? styles.subMenuOpen : {})
                    }}
                    aria-hidden={!openSubMenus[index]}
                  >
                    {item.subItems.map((subItem, subIndex) => {
                      const isActive = location.pathname === subItem.path;
                      return (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className="sidebar-submenu-item"
                          style={{
                            ...styles.subMenuItem,
                            ...(isActive ? styles.activeSubMenuItem : {})
                          }}
                          onMouseEnter={e => {
                            if (!isActive) {
                              e.currentTarget.style.color = styles.subMenuItemHover.color;
                              e.currentTarget.style.backgroundColor = styles.subMenuItemHover.backgroundColor;
                              e.currentTarget.style.borderColor = styles.subMenuItemHover.borderColor;
                              e.currentTarget.style.transform = styles.subMenuItemHover.transform;
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isActive) {
                              e.currentTarget.style.color = styles.subMenuItem.color;
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.borderColor = 'transparent';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }
                          }}
                          onClick={toggleSidebar}
                        >
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const isActive = location.pathname === item.path;

            return (
              <div key={index} style={styles.menuItem}>
                <Link
                  to={item.path}
                  className="sidebar-menu-item"
                  style={{
                    ...styles.menuLink,
                    ...(isActive ? styles.activeMenuLink : {})
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = styles.menuLinkHover.backgroundColor;
                      e.currentTarget.style.color = styles.menuLinkHover.color;
                      e.currentTarget.style.borderColor = styles.menuLinkHover.borderColor;
                      e.currentTarget.style.transform = styles.menuLinkHover.transform;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = styles.menuLink.color;
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                  onClick={toggleSidebar}
                >
                  <span style={styles.menuIcon}>{getMenuIcon(item.icon)}</span>
                  {item.label}
                </Link>
              </div>
            );
          })}
        </div>

        <div style={styles.userInfo}>
          <div style={styles.roleText}>{userRole} Dashboard</div>
          <div style={styles.welcomeText}>Welcome Back! 👋</div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
