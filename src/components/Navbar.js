import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo1.png';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/courses' },
    { name: 'Exam', path: '/exam' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Affiliation', path: '/affiliation' },
    { name: 'Demo Lectures', path: '/demo-lectures' },
    { name: 'Apply Now', path: '/apply-now', special: true },
    { name: 'Login', path: '/login' },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
const styles = {
      body: {
        fontFamily: 'Poppins, sans-serif'
      },



navbar: {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  background: isScrolled 
    ? 'rgba(255, 255, 255, 0.95)' 
    : 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  borderBottom: isScrolled 
    ? '1px solid rgba(0, 0, 0, 0.12)' 
    : '1px solid rgba(0, 0, 0, 0.06)',
  boxShadow: isScrolled
    ? '0 4px 20px rgba(0, 0, 0, 0.08)'
    : '0 2px 10px rgba(0, 0, 0, 0.04)',
  transition: 'all 0.3s ease',
  padding: isScrolled ? '10px 0' : '15px 0',
},



    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textDecoration: 'none',
      color: '#1a1a1a',
      transition: 'all 0.3s ease',
      padding: '5px 0',
    },

    logoImage: {
      height: isMobile ? '40px' : '45px',
      width: 'auto',
      objectFit: 'contain',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
    },

    logoText: {
      fontWeight: '800',
      color: '#1a1a1a',
      fontSize: isMobile ? '1.6rem' : '2rem',
      letterSpacing: '-0.5px',
    },

    desktopMenu: {
      display: isMobile ? 'none' : 'flex',
      listStyle: 'none',
      gap: '5px',
      margin: 0,
      padding: 0,
      alignItems: 'center',
    },

    menuItem: {
      position: 'relative',
    },

    menuLink: {
      color: '#070707ff',
      textDecoration: 'none',
      fontSize: '0.95rem',
      fontWeight: '600',
      padding: '10px 16px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
      position: 'relative',
    },

    activeLink: {
      color: '#2563eb',
      backgroundColor: '#f1f5f9',
    },

    specialButton: {
      backgroundColor: '#2563eb',
      color: 'white',
      fontWeight: '600',
    },

    mobileMenuButton: {
      display: isMobile ? 'flex' : 'none',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '44px',
      height: '44px',
      background: 'transparent',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      outline: 'none',
      position: 'relative',
      zIndex: 1001,
    },

    hamburgerLine: {
      width: '24px',
      height: '2px',
      background: '#080808ff',
      borderRadius: '2px',
      transition: 'all 0.3s ease',
      margin: '2px 0',
    },  

    mobileOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 999,
      opacity: isMenuOpen ? 1 : 0,
      visibility: isMenuOpen ? 'visible' : 'hidden',
      transition: 'all 0.3s ease',
    },

    mobileMenu: {
      position: 'fixed',
      top: '0',
      right: isMenuOpen ? '0' : '-100%',
      width: isMobile ? '280px' : '320px',
      maxWidth: '85vw',
      height: '100vh',
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(20px)',
      boxShadow: '-5px 0 25px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      zIndex: 1000,
      padding: '80px 25px 30px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
    },

    mobileMenuList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      listStyle: 'none',
      margin: 0,
      padding: 0,
    },

    mobileMenuItem: {
      width: '100%',
    },

    mobileMenuLink: {
      color: '#070707ff',
      textDecoration: 'none',
      fontSize: '1rem',
      fontWeight: '600',
      padding: '15px 20px',
      borderRadius: '10px',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      display: 'block',
      transition: 'all 0.3s ease',
      textAlign: 'left',
      position: 'relative',
    },

    mobileActiveLink: {
      color: '#2563eb',
      background: '#f1f5f9',
      borderColor: '#cbd5e1',
    },

    mobileSpecialButton: {
      background: '#2563eb',
      color: 'white',
      borderColor: '#2563eb',
    },

    mobileMenuFooter: {
      marginTop: 'auto',
      paddingTop: '25px',
      textAlign: 'center',
      color: '#94a3b8',
      fontSize: '0.85rem',
      borderTop: '1px solid #e2e8f0',
    },
  };

  // Hover handlers
  const handleLinkHover = (e, isEntering, isActive, isSpecial) => {
    if (isActive || isSpecial) return;
    
    if (isEntering) {
      e.target.style.color = '#2563eb';
      e.target.style.backgroundColor = '#f1f5f9';
    } else {
      e.target.style.color = '#4a4a4a';
      e.target.style.backgroundColor = 'transparent';
    }
  };

  const handleMobileLinkHover = (e, isEntering, isActive, isSpecial) => {
    if (isActive || isSpecial) return;
    
    if (isEntering) {
      e.target.style.color = '#2563eb';
      e.target.style.backgroundColor = '#f1f5f9';
      e.target.style.borderColor = '#cbd5e1';
      e.target.style.transform = 'translateX(5px)';
    } else {
      e.target.style.color = '#4a4a4a';
      e.target.style.backgroundColor = '#f8fafc';
      e.target.style.borderColor = '#e2e8f0';
      e.target.style.transform = 'translateX(0)';
    }
  };

  const handleSpecialButtonHover = (e, isEntering) => {
    if (isEntering) {
      e.target.style.backgroundColor = '#1d4ed8';
      e.target.style.transform = 'translateY(-1px)';
    } else {
      e.target.style.backgroundColor = '#2563eb';
      e.target.style.transform = 'translateY(0)';
    }
  };

  const handleMobileMenuButtonHover = (e, isEntering) => {
    if (isEntering) {
      e.target.style.backgroundColor = '#f1f5f9';
    } else {
      e.target.style.backgroundColor = 'transparent';
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMenuOpen && isMobile && (
        <div 
          style={styles.mobileOverlay}
          onClick={closeMenu}
        />
      )}

      {/* Main Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.container}>
          
          {/* Brand Logo */}
          <Link 
            to="/" 
            style={styles.logo}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <img
              src={logo}
              alt="TechEdu Logo"
              style={styles.logoImage}
              draggable={false}
            />
            <span style={styles.logoText}>TechEdu</span>
          </Link>

          {/* Desktop Menu */}
          <ul style={styles.desktopMenu}>
            {navItems.map(({ name, path, special }) => {
              const isActive = location.pathname === path;
              return (
                <li key={name} style={styles.menuItem}>
                  <Link
                    to={path}
                    style={{
                      ...styles.menuLink,
                      ...(isActive && !special ? styles.activeLink : {}),
                      ...(special ? styles.specialButton : {}),
                    }}
                    onMouseEnter={(e) => {
                      if (special) {
                        handleSpecialButtonHover(e, true);
                      } else {
                        handleLinkHover(e, true, isActive, special);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (special) {
                        handleSpecialButtonHover(e, false);
                      } else {
                        handleLinkHover(e, false, isActive, special);
                      }
                    }}
                  >
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile Menu Button */}
          <button
            style={styles.mobileMenuButton}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            onMouseEnter={(e) => handleMobileMenuButtonHover(e, true)}
            onMouseLeave={(e) => handleMobileMenuButtonHover(e, false)}
          >
            <span style={{
              ...styles.hamburgerLine,
              transform: isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'rotate(0)',
            }} />
            <span style={{
              ...styles.hamburgerLine,
              opacity: isMenuOpen ? 0 : 1,
            }} />
            <span style={{
              ...styles.hamburgerLine,
              transform: isMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'rotate(0)',
            }} />
          </button>
        </div>

        {/* Mobile Menu */}
        <div style={styles.mobileMenu}>
          <ul style={styles.mobileMenuList}>
            {navItems.map(({ name, path, special }) => {
              const isActive = location.pathname === path;
              return (
                <li key={name} style={styles.mobileMenuItem}>
                  <Link
                    to={path}
                    onClick={closeMenu}
                    style={{
                      ...styles.mobileMenuLink,
                      ...(isActive && !special ? styles.mobileActiveLink : {}),
                      ...(special ? styles.mobileSpecialButton : {}),
                    }}
                    onMouseEnter={(e) => handleMobileLinkHover(e, true, isActive, special)}
                    onMouseLeave={(e) => handleMobileLinkHover(e, false, isActive, special)}
                    onTouchStart={(e) => handleMobileLinkHover(e, true, isActive, special)}
                    onTouchEnd={(e) => {
                      setTimeout(() => handleMobileLinkHover(e, false, isActive, special), 150);
                    }}
                  >
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>
          
          <div style={styles.mobileMenuFooter}>
            <p>© 2025 TechEdu Institute</p>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
