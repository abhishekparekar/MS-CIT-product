import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import home1 from '../../assets/home1.jpg';
import home2 from '../../assets/home2.jpg';
import home3 from '../../assets/home3.jpg';
import home4 from '../../assets/home4.jpg';
import home5 from '../../assets/home5.jpeg';
import home6 from '../../assets/home6.jpeg';
import home7 from '../../assets/home7.jpg';
import home8 from '../../assets/home8.jpg';
import home9 from '../../assets/home9.jpg';
import home10 from '../../assets/home10.png';

const Home = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);
    const [scrollY, setScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState({});
    
    const backgroundImages = [home3, home4, home7, home5, home6];

    useEffect(() => {
        // Auto-change background images
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => 
                (prevIndex + 1) % backgroundImages.length
            );
        }, 4000);

        // Handle resize
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
        };

        // Handle scroll for parallax effects
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        // Intersection Observer for animations
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setIsVisible(prev => ({
                        ...prev,
                        [entry.target.id]: entry.isIntersecting
                    }));
                });
            },
            { threshold: 0.1, rootMargin: '50px' }
        );

        // Observe all animated elements
        document.querySelectorAll('[data-animate]').forEach((el) => {
            if (el.id) observer.observe(el);
        });

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, [backgroundImages.length]);

    const styles = {
        homeContainer: {
            minHeight: '100vh',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            overflowX: 'hidden',
            position: 'relative',
        },

        // Hero Section
        heroSection: {
            position: 'relative',
            width: '100%',
            height: isMobile ? '70vh' : '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        },

        backgroundImage: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            transition: 'all 2s ease-in-out',
            zIndex: 0,
            transform: `translateY(${scrollY * 0.5}px)`,
        },

        heroOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)',
            zIndex: 1,
        },

        heroContent: {
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            color: 'white',
            maxWidth: '800px',
            margin: '0 auto',
            padding: isMobile ? '0 20px' : '0 40px',
        },

        heroTitle: {
            fontSize: isMobile ? '2.5rem' : isTablet ? '3.5rem' : '4.5rem',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: '20px',
            textShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
        },

        heroTitleAccent: {
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
        },

        heroSubtitle: {
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            fontWeight: '400',
            marginBottom: '40px',
            opacity: '0.9',
            lineHeight: '1.6',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        },

        heroButtons: {
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '40px',
        },

        btn: {
            padding: isMobile ? '15px 35px' : '18px 45px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-block',
            textAlign: 'center',
            fontSize: isMobile ? '1rem' : '1.1rem',
        },

        btnPrimary: {
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
        },

        btnSecondary: {
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
        },

        // Welcome Section
        welcomeToMSCITSection: {
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            padding: isMobile ? '80px 0' : '120px 0',
            position: 'relative',
        },

        welcomeContentWrapper: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '1fr 1fr',
            gap: isMobile ? '60px' : '80px',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
        },

        welcomeTitle: {
            fontSize: isMobile ? '2rem' : isTablet ? '2.5rem' : '3rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '20px',
            lineHeight: '1.2',
        },

        welcomeText: {
            fontSize: isMobile ? '1rem' : '1.1rem',
            lineHeight: '1.7',
            color: '#475569',
            marginBottom: '20px',
        },

        welcomeImageContainer: {
            width: '100%',
            maxWidth: isMobile ? '300px' : '400px',
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        },

        welcomeImg: {
            width: '100%',
            height: 'auto',
            display: 'block',
        },

        // Stats Section
        statsSection: {
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            padding: isMobile ? '80px 0' : '100px 0',
            color: 'white',
        },

        statsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '30px' : '40px',
            textAlign: 'center',
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '0 20px',
        },

        statItem: {
            background: 'rgba(255, 255, 255, 0.1)',
            padding: isMobile ? '30px 20px' : '40px 30px',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
        },

        statNumber: {
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '800',
            color: '#3b82f6',
            marginBottom: '10px',
        },

        statLabel: {
            fontSize: isMobile ? '0.9rem' : '1rem',
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: '500',
        },

        // Courses Section
        coursesSection: {
            padding: isMobile ? '80px 0' : '100px 0',
            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        },

        sectionTitle: {
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '700',
            textAlign: 'center',
            color: '#1e293b',
            marginBottom: '20px',
        },

        sectionDescription: {
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            color: '#64748b',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto 60px auto',
            lineHeight: '1.6',
        },

        coursesGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: isMobile ? '30px' : '40px',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
        },

        courseCard: {
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 15px 50px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
        },

        courseImage: {
            height: isMobile ? '150px' : '180px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        },

        courseBadge: {
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#1e293b',
            padding: '8px 20px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600',
        },

        courseContent: {
            padding: isMobile ? '25px' : '30px',
        },

        courseTitle: {
            fontSize: isMobile ? '1.2rem' : '1.3rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '15px',
        },

        courseMeta: {
            display: 'flex',
            gap: '20px',
            margin: '20px 0',
            color: '#64748b',
            fontSize: '0.9rem',
        },

        courseBtn: {
            color: '#3b82f6',
            textDecoration: 'none',
            fontWeight: '600',
            display: 'inline-block',
            marginTop: '15px',
        },

        // Testimonials Section
        testimonialsSection: {
            padding: isMobile ? '80px 0' : '100px 0',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        },

        testimonialsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: isMobile ? '30px' : '40px',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
        },

        testimonialCard: {
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '20px',
            padding: isMobile ? '25px' : '30px',
            boxShadow: '0 15px 50px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
        },

        testimonialContent: {
            marginBottom: '25px',
            fontStyle: 'italic',
            lineHeight: '1.6',
            color: '#475569',
        },

        testimonialAuthor: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
        },

        authorAvatar: {
            fontSize: '2.5rem',
        },

        authorName: {
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '5px',
        },

        authorRole: {
            color: '#64748b',
            fontSize: '0.9rem',
        },

        // Final CTA Section
        finalCtaSection: {
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            color: 'white',
            padding: isMobile ? '80px 0' : '100px 0',
            textAlign: 'center',
        },

        ctaContent: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px',
        },

        ctaTitle: {
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '700',
            marginBottom: '20px',
        },

        ctaDescription: {
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            marginBottom: '40px',
            opacity: '0.9',
            lineHeight: '1.6',
        },

        ctaButtons: {
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
        },

        btnOutline: {
            background: 'transparent',
            border: '2px solid #3b82f6',
            color: '#3b82f6',
        },
    };

    // Add CSS animations to document head
    useEffect(() => {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
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

            @keyframes slideInLeft {
                from {
                    opacity: 0;
                    transform: translateX(-50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes scaleIn {
                from {
                    opacity: 0;
                    transform: scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 35px rgba(59, 130, 246, 0.5);
            }

            .course-card:hover {
                transform: translateY(-5px);
            }
        `;
        document.head.appendChild(styleSheet);

        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    const navigate = useNavigate();

    return (
        <div style={styles.homeContainer}>
            {/* Hero Section */}
            <section style={styles.heroSection}>
                <div style={styles.backgroundImage}></div>
                <div style={styles.heroOverlay}></div>
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>
                        Transform Your Future with 
                        <span style={styles.heroTitleAccent}> MS-CIT Excellence</span>
                    </h1>
                    <p style={styles.heroSubtitle}>
                        Empowering careers through industry-leading computer education and certification programs. 
                        Join 50,000+ successful graduates who chose excellence.
                    </p>
                    <div style={styles.heroButtons}>
                        <a
                            href="/apply-now"
                            style={{ ...styles.btn, ...styles.btnPrimary }}
                        >
                            Start Your Journey
                        </a>
                        <a
                            href="/demo-lectures"
                            style={{ ...styles.btn, ...styles.btnSecondary }}
                        >
                            Free Demo Class
                        </a>
                    </div>
                </div>
            </section>

            {/* Welcome Section */}
            <section style={styles.welcomeToMSCITSection}>
                <div style={styles.welcomeContentWrapper}>
                    <div>
                        <h2 style={styles.welcomeTitle}>Welcome to MS-CIT Excellence</h2>
                        <p style={styles.welcomeText}>
                            For over two decades, MS-CIT has been at the forefront of computer education, 
                            transforming lives through comprehensive training programs that bridge the gap 
                            between academic learning and industry requirements.
                        </p>
                        <p style={styles.welcomeText}>
                            Our state-of-the-art curriculum, expert instructors, and hands-on approach ensure 
                            that every student gains practical skills and industry-recognized certifications.
                        </p>
                        <a
                            href="/about"
                            style={{ ...styles.btn, ...styles.btnPrimary }}
                        >
                            Learn More About Us
                        </a>
                    </div>
                    <div>
                        <div style={styles.welcomeImageContainer}>
                            <img 
                                src={home6} 
                                alt="Welcome to MS-CIT Excellence" 
                                style={styles.welcomeImg}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section style={styles.statsSection}>
                <div style={styles.statsGrid}>
                    {[
                        { number: '50,000+', label: 'Students Certified' },
                        { number: '25+', label: 'Courses Available' },
                        { number: '99%', label: 'Success Rate' },
                        { number: '100+', label: 'Training Centers' }
                    ].map((stat, index) => (
                        <div key={index} style={styles.statItem}>
                            <div style={styles.statNumber}>{stat.number}</div>
                            <div style={styles.statLabel}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Popular Courses Section */}
            <section style={styles.coursesSection}>
                <h2 style={styles.sectionTitle}>Industry-Leading Courses</h2>
                <p style={styles.sectionDescription}>
                    From foundational computer skills to advanced specializations, our comprehensive 
                    curriculum is designed to meet diverse learning needs and career goals
                </p>
                <div style={styles.coursesGrid}>
                    {[
                        {
                            badge: 'Foundation',
                            title: 'Computer Fundamentals & MS Office',
                            description: 'Master essential computer operations, Windows navigation, MS Office suite, internet usage, and digital communication tools.',
                            duration: '3 Months',
                            level: 'Beginner'
                        },
                        {
                            badge: 'Professional',
                            title: 'Data Analysis & Excel Mastery',
                            description: 'Advanced Excel functions, data visualization, pivot tables, macros, and business intelligence tools for data-driven decisions.',
                            duration: '2 Months',
                            level: 'Intermediate'
                        },
                        {
                            badge: 'Advanced',
                            title: 'Web Development & AI Integration',
                            description: 'Modern web technologies, responsive design, JavaScript frameworks, and AI tool integration for next-gen web solutions.',
                            duration: '6 Months',
                            level: 'Expert'
                        }
                    ].map((course, index) => (
                        <div key={index} style={styles.courseCard} className="course-card">
                            <div style={styles.courseImage}>
                                <div style={styles.courseBadge}>{course.badge}</div>
                            </div>
                            <div style={styles.courseContent}>
                                <h3 style={styles.courseTitle}>{course.title}</h3>
                                <p style={styles.welcomeText}>
                                    {course.description}
                                </p>
                                <div style={styles.courseMeta}>
                                    <span>📅 {course.duration}</span>
                                    <span>🎯 {course.level}</span>
                                </div>
                                <a href="/courses" style={styles.courseBtn}>Explore Course →</a>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials Section */}
            <section style={styles.testimonialsSection}>
                <h2 style={styles.sectionTitle}>Success Stories</h2>
                <p style={styles.sectionDescription}>
                    Real stories from our graduates who transformed their careers and achieved their dreams 
                    through our comprehensive training programs
                </p>
                <div style={styles.testimonialsGrid}>
                    {[
                        {
                            content: "MS-CIT certification opened doors I never imagined possible. The practical training and industry-relevant curriculum helped me secure a position as a Data Analyst at a leading tech company.",
                            avatar: '👩‍💼',
                            name: 'Priya Sharma',
                            role: 'Senior Data Analyst'
                        },
                        {
                            content: "The web development course completely changed my career trajectory. From zero coding experience to freelancing full-time in 6 months.",
                            avatar: '👨‍💻',
                            name: 'Rahul Kumar',
                            role: 'Full-Stack Developer'
                        },
                        {
                            content: "Starting my own training center through the franchise program was the best business decision I made. The ongoing support and proven curriculum made success inevitable.",
                            avatar: '🏢',
                            name: 'Amit Patel',
                            role: 'Franchise Owner'
                        }
                    ].map((testimonial, index) => (
                        <div key={index} style={styles.testimonialCard}>
                            <div style={styles.testimonialContent}>
                                <p>"{testimonial.content}"</p>
                            </div>
                            <div style={styles.testimonialAuthor}>
                                <div style={styles.authorAvatar}>{testimonial.avatar}</div>
                                <div>
                                    <h4 style={styles.authorName}>{testimonial.name}</h4>
                                    <span style={styles.authorRole}>{testimonial.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA Section */}
            <section style={styles.finalCtaSection}>
                <div style={styles.ctaContent}>
                    <h2 style={styles.ctaTitle}>Ready to Transform Your Future?</h2>
                    <p style={styles.ctaDescription}>
                        Join thousands of successful professionals who chose excellence. Your journey to 
                        digital mastery and career transformation starts with a single step.
                    </p>
                    <div style={styles.ctaButtons}>
                        <a
                            href="/apply-now"
                            style={{ ...styles.btn, ...styles.btnPrimary }}
                        >
                            Begin Your Journey
                        </a>
                        <a
                            href="/demo-lectures"
                            style={{ ...styles.btn, ...styles.btnOutline }}
                        >
                            Free Trial Class
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
