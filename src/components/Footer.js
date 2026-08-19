import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bg from '../assets/footerbg.jpg';

const Footer = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024 && window.innerWidth > 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            setIsTablet(window.innerWidth <= 1024 && window.innerWidth > 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const styles = {
        // Top CTA Banner
        topBanner: {
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            background: '#f8fafc',
            padding: isMobile ? '15px 0' : '18px 0',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        },

        topBannerContainer: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            display: 'flex',
            justifyContent: isMobile ? 'center' : 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: isMobile ? '12px' : '20px',
        },

        topBannerText: {
            color: 'black',
            
            fontSize: isMobile ? '0.85rem' : '0.95rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textAlign: isMobile ? 'center' : 'left',
        },

        topBannerButtons: {
            display: 'flex',
            gap: isMobile ? '8px' : '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
        },

        topBannerBtn: {
            background: '#2563eb',
            color: 'white',
            padding: isMobile ? '8px 16px' : '10px 20px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: isMobile ? '0.8rem' : '0.85rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
        },

        // Main Footer
        footer: {
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            position: 'relative',
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: isMobile ? 'scroll' : 'fixed',
            color: '#fff',
            padding: isMobile ? '60px 0 40px' : '80px 0 50px',
            overflow: 'hidden',
        },

        footerOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(2px)',
            zIndex: 1,
        },

        footerContainer: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '0 20px' : '0 20px',
            position: 'relative',
            zIndex: 2,
        },

        footerContent: {
            display: 'grid',
            gridTemplateColumns: isMobile 
                ? '1fr' 
                : isTablet 
                    ? 'repeat(2, 1fr)' 
                    : '1.2fr 1fr 1fr 1fr',
            gap: isMobile ? '40px' : isTablet ? '40px' : '50px',
            marginBottom: isMobile ? '40px' : '50px',
        },

        footerSection: {
            display: 'flex',
            flexDirection: 'column',
        },

        logoSection: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: isMobile ? 'center' : 'flex-start',
            textAlign: isMobile ? 'center' : 'left',
        },

        logoWrapper: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            justifyContent: isMobile ? 'center' : 'flex-start',
        },

        logoImage: {
            width: '50px',
            height: '50px',
            background: '#2563eb',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: 'white',
        },

        logoTextGroup: {
            display: 'flex',
            flexDirection: 'column',
        },

        logoTitle: {
            fontSize: isMobile ? '1.6rem' : '1.8rem',
            fontWeight: '800',
            color: 'white',
            marginBottom: '4px',
            lineHeight: '1.1',
        },

        logoSubtitle: {
            fontSize: '0.85rem',
            color: '#94a3b8',
            fontWeight: '500',
            lineHeight: '1.2',
        },

        footerDescription: {
            fontSize: '0.95rem',
            color: '#cbd5e1',
            lineHeight: '1.6',
            marginBottom: '25px',
            maxWidth: isMobile ? '100%' : '300px',
        },

        socialLinks: {
            display: 'flex',
            gap: '12px',
            marginTop: '15px',
            justifyContent: isMobile ? 'center' : 'flex-start',
        },

        socialLink: {
            color: '#94a3b8',
            fontSize: '1.2rem',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
        },

        footerTitle: {
            fontSize: '1.1rem',
            fontWeight: '700',
            marginBottom: '20px',
            color: 'white',
            textAlign: isMobile ? 'center' : 'left',
            position: 'relative',
            paddingBottom: '8px',
        },

        footerTitleUnderline: {
            position: 'absolute',
            bottom: 0,
            left: isMobile ? '50%' : 0,
            transform: isMobile ? 'translateX(-50%)' : 'none',
            width: '30px',
            height: '2px',
            background: '#2563eb',
            borderRadius: '1px',
        },

        footerLinks: {
            listStyle: 'none',
            padding: '0',
            margin: '0',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        },

        footerLinkItem: {
            display: 'flex',
            justifyContent: isMobile ? 'center' : 'flex-start',
        },

        footerLink: {
            color: '#cbd5e1',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'all 0.3s ease',
            fontWeight: '400',
            padding: '4px 0',
        },

        contactInfo: {
            fontSize: '0.9rem',
            color: '#cbd5e1',
            lineHeight: '1.6',
        },

        contactItem: {
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            justifyContent: isMobile ? 'center' : 'flex-start',
            textAlign: isMobile ? 'center' : 'left',
        },

        contactIcon: {
            fontSize: '1rem',
            marginTop: '2px',
            color: '#2563eb',
            minWidth: '18px',
        },

        newsItem: {
            fontSize: '0.9rem',
            color: '#cbd5e1',
            marginBottom: '15px',
            lineHeight: '1.5',
            paddingLeft: '12px',
            borderLeft: '2px solid #2563eb',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            textAlign: isMobile ? 'center' : 'left',
        },

        footerBottom: {
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '25px',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '0.8rem',
            lineHeight: '1.5',
        },

        footerBottomLinks: {
            color: '#2563eb',
            textDecoration: 'none',
            marginLeft: '5px',
            transition: 'color 0.3s ease',
        },

        chatbotBtn: {
            position: 'fixed',
            bottom: isMobile ? '20px' : '30px',
            right: isMobile ? '20px' : '30px',
            background: '#2563eb',
            color: 'white',
            padding: isMobile ? '12px 16px' : '15px 20px',
            borderRadius: '25px',
            fontSize: '0.85rem',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
            zIndex: 1000,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },

        chatbotIcon: {
            fontSize: '1.1rem',
        },
    };

    const handleHover = (e, isEntering, type) => {
        if (type === 'social') {
            if (isEntering) {
                e.target.style.color = '#2563eb';
                e.target.style.background = 'rgba(37, 99, 235, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
            } else {
                e.target.style.color = '#94a3b8';
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
            }
        } else if (type === 'link') {
            if (isEntering) {
                e.target.style.color = '#2563eb';
                e.target.style.paddingLeft = '8px';
            } else {
                e.target.style.color = '#cbd5e1';
                e.target.style.paddingLeft = '0';
            }
        } else if (type === 'banner-btn') {
            if (isEntering) {
                e.target.style.background = '#1d4ed8';
                e.target.style.transform = 'translateY(-1px)';
            } else {
                e.target.style.background = '#2563eb';
                e.target.style.transform = 'translateY(0)';
            }
        } else if (type === 'chatbot') {
            if (isEntering) {
                e.target.style.background = '#1d4ed8';
                e.target.style.transform = 'scale(1.05)';
            } else {
                e.target.style.background = '#2563eb';
                e.target.style.transform = 'scale(1)';
            }
        } else if (type === 'news') {
            if (isEntering) {
                e.target.style.color = '#2563eb';
                e.target.style.paddingLeft = '16px';
            } else {
                e.target.style.color = '#cbd5e1';
                e.target.style.paddingLeft = '12px';
            }
        } else if (type === 'footer-link') {
            if (isEntering) {
                e.target.style.color = '#1d4ed8';
            } else {
                e.target.style.color = '#2563eb';
            }
        }
    };

    return (
        <>
            {/* Top CTA Banner */}
            <div style={styles.topBanner}>
                <div style={styles.topBannerContainer}>
                    <div style={styles.topBannerText}>
                        <span>📧</span>
                        <span>Email: feedback@techedu.org</span>
                    </div>
                    <div style={styles.topBannerButtons}>
                        <Link 
                            to="/apply-now" 
                            style={styles.topBannerBtn}
                            onMouseEnter={(e) => handleHover(e, true, 'banner-btn')}
                            onMouseLeave={(e) => handleHover(e, false, 'banner-btn')}
                        >
                            TechEdu Online Admission
                        </Link>
                        <Link 
                            to="/apply-now" 
                            style={styles.topBannerBtn}
                            onMouseEnter={(e) => handleHover(e, true, 'banner-btn')}
                            onMouseLeave={(e) => handleHover(e, false, 'banner-btn')}
                        >
                            Enroll Now
                        </Link>
                        <Link 
                            to="/exam" 
                            style={styles.topBannerBtn}
                            onMouseEnter={(e) => handleHover(e, true, 'banner-btn')}
                            onMouseLeave={(e) => handleHover(e, false, 'banner-btn')}
                        >
                            Search Enquiry ID
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Footer with Background Image */}
            <footer style={styles.footer}>
                {/* Background Overlay */}
                <div style={styles.footerOverlay}></div>

                <div style={styles.footerContainer}>
                    <div style={styles.footerContent}>
                        {/* Logo & Description Section */}
                        <div style={styles.footerSection}>
                            <div style={styles.logoSection}>
                                <div style={styles.logoWrapper}>
                                    <div style={styles.logoImage}>🎓</div>
                                    <div style={styles.logoTextGroup}>
                                        <div style={styles.logoTitle}>TechEdu</div>
                                        <div style={styles.logoSubtitle}>Creating a Knowledge Lit World</div>
                                    </div>
                                </div>
                                <p style={styles.footerDescription}>
                                    TechEdu is a leading Computer Education institute providing quality training
                                    and certification programs since 2001. We specialize in comprehensive 
                                    digital literacy courses that prepare students for the modern digital world.
                                </p>
                                <div style={styles.socialLinks}>
                                    {['📘', '🐦', '▶️', '💼', '📷'].map((icon, index) => (
                                        <a 
                                            key={index}
                                            href="#" 
                                            style={styles.socialLink}
                                            onMouseEnter={(e) => handleHover(e, true, 'social')}
                                            onMouseLeave={(e) => handleHover(e, false, 'social')}
                                            aria-label={`Social media link ${index + 1}`}
                                        >
                                            {icon}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Links Section */}
                        <div style={styles.footerSection}>
                            <h3 style={styles.footerTitle}>
                                Quick Links
                                <div style={styles.footerTitleUnderline}></div>
                            </h3>
                            <ul style={styles.footerLinks}>
                                {[
                                    { name: 'Home', path: '/' },
                                    { name: 'About', path: '/about' },
                                    { name: 'Courses', path: '/courses' },
                                    { name: 'Exam', path: '/exam' },
                                    { name: 'Gallery', path: '/gallery' },
                                    { name: 'Testimonials', path: '/testimonials' },
                                    { name: 'Affiliation', path: '/affiliation' },
                                    { name: 'Apply Now', path: '/apply-now' },
                                ].map((item, index) => (
                                    <li key={index} style={styles.footerLinkItem}>
                                        <Link 
                                            to={item.path}
                                            style={styles.footerLink}
                                            onMouseEnter={(e) => handleHover(e, true, 'link')}
                                            onMouseLeave={(e) => handleHover(e, false, 'link')}
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Latest News Section */}
                        <div style={styles.footerSection}>
                            <h3 style={styles.footerTitle}>
                                Latest News
                                <div style={styles.footerTitleUnderline}></div>
                            </h3>
                            {[
                                'Number of TechEdu learners to reach 5000+ students',
                                'TechEdu course targets computer literacy for all',
                                'New AI-integrated curriculum launched for 2025',
                                'Digital skills training expands to rural areas'
                            ].map((news, index) => (
                                <div 
                                    key={index}
                                    style={styles.newsItem}
                                    onMouseEnter={(e) => handleHover(e, true, 'news')}
                                    onMouseLeave={(e) => handleHover(e, false, 'news')}
                                >
                                    {news}
                                </div>
                            ))}
                        </div>

                        {/* Contact Section */}
                        <div style={styles.footerSection}>
                            <h3 style={styles.footerTitle}>
                                Contact Info
                                <div style={styles.footerTitleUnderline}></div>
                            </h3>
                            <div style={styles.contactInfo}>
                                <div style={styles.contactItem}>
                                    <span style={styles.contactIcon}>🏢</span>
                                    <div>
                                        TechEdu Tower, A Wing, 5th Floor,<br />
                                        Tech Street, Education City,<br />
                                        Maharashtra, India - 411016
                                    </div>
                                </div>
                                <div style={styles.contactItem}>
                                    <span style={styles.contactIcon}>📧</span>
                                    <div>Email: techedu@techedu.org</div>
                                </div>
                                <div style={styles.contactItem}>
                                    <span style={styles.contactIcon}>📞</span>
                                    <div>Call Us: +91 20 4011 4500 / 501</div>
                                </div>
                                <div style={styles.contactItem}>
                                    <span style={styles.contactIcon}>🕒</span>
                                    <div>Mon-Sat: 9:00 AM - 6:00 PM</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div style={styles.footerBottom}>
                        <p>
                            Copyright © 2025 TechEdu Institute Ltd. All Rights Reserved. | 
                            <Link 
                                to="/privacy" 
                                style={styles.footerBottomLinks}
                                onMouseEnter={(e) => handleHover(e, true, 'footer-link')}
                                onMouseLeave={(e) => handleHover(e, false, 'footer-link')}
                            > 
                                Privacy Policy 
                            </Link> | 
                            <Link 
                                to="/terms" 
                                style={styles.footerBottomLinks}
                                onMouseEnter={(e) => handleHover(e, true, 'footer-link')}
                                onMouseLeave={(e) => handleHover(e, false, 'footer-link')}
                            > 
                                Terms of Service
                            </Link>
                        </p>
                    </div>
                </div>
            </footer>

            {/* Chatbot Button */}
            <button
                style={styles.chatbotBtn}
                onMouseEnter={(e) => handleHover(e, true, 'chatbot')}
                onMouseLeave={(e) => handleHover(e, false, 'chatbot')}
                onClick={() => console.log('Chatbot opened')}
                aria-label="Open chatbot"
            >
                <span style={styles.chatbotIcon}>💬</span>
                <span>Chat with Us</span>
            </button>

            {/* Enhanced Custom CSS */}
            <style>
                {`
                    @media (max-width: 768px) {
                        footer {
                            background-attachment: scroll !important;
                        }
                    }
                    
                    html {
                        scroll-behavior: smooth;
                    }
                    
                    ::-webkit-scrollbar {
                        width: 6px;
                    }
                    
                    ::-webkit-scrollbar-track {
                        background: #f1f5f9;
                    }
                    
                    ::-webkit-scrollbar-thumb {
                        background: #2563eb;
                        border-radius: 3px;
                    }
                    
                    ::-webkit-scrollbar-thumb:hover {
                        background: #1d4ed8;
                    }
                    
                    a:focus, button:focus {
                        outline: 2px solid #2563eb;
                        outline-offset: 2px;
                        border-radius: 4px;
                    }
                    
                    @media (prefers-reduced-motion: reduce) {
                        *, *::before, *::after {
                            animation-duration: 0.01ms !important;
                            animation-iteration-count: 1 !important;
                            transition-duration: 0.01ms !important;
                        }
                    }
                    
                    @media print {
                        footer {
                            background: white !important;
                            color: black !important;
                        }
                        
                        .chatbot-btn {
                            display: none !important;
                        }
                    }
                `}
            </style>
        </>
    );
};

export default Footer;
