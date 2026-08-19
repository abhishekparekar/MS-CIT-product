import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DemoLectures = () => {
    const [selectedDemo, setSelectedDemo] = useState(null);
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
        demoContainer: {
            minHeight: '100vh',
            background: '#f8fafc',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            paddingTop: '80px', // Account for fixed navbar
        },

        // Hero Section
        heroSection: {
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            color: 'white',
            padding: isMobile ? '60px 0' : '80px 0',
            textAlign: 'center',
            position: 'relative',
        },

        heroOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        },

        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px',
            position: 'relative',
            zIndex: 2,
        },

        breadcrumb: {
            fontSize: '0.9rem',
            opacity: '0.7',
            marginBottom: '20px',
            fontWeight: '400',
            color: '#cbd5e1',
        },

        heroTitle: {
            fontSize: isMobile ? '2.2rem' : '3rem',
            fontWeight: '800',
            marginBottom: '20px',
            color: 'white',
        },

        heroSubtitle: {
            fontSize: isMobile ? '1.1rem' : '1.3rem',
            opacity: '0.9',
            maxWidth: '700px',
            margin: '0 auto',
            color: '#cbd5e1',
            lineHeight: '1.6',
        },

        section: {
            padding: isMobile ? '60px 0' : '80px 0',
        },

        whiteSection: {
            background: 'white',
        },

        sectionTitle: {
            fontSize: isMobile ? '1.8rem' : '2.5rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '20px',
            textAlign: 'center',
        },

        sectionSubtitle: {
            fontSize: isMobile ? '1rem' : '1.2rem',
            color: '#64748b',
            textAlign: 'center',
            maxWidth: '700px',
            margin: '0 auto 50px',
            lineHeight: '1.6',
        },

        demoGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: isMobile ? '25px' : '30px',
        },

        demoCard: {
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
        },

        demoThumbnail: {
            width: '100%',
            height: isMobile ? '180px' : '200px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: isMobile ? '2.5rem' : '3rem',
            position: 'relative',
            cursor: 'pointer',
        },

        playButton: {
            position: 'absolute',
            width: isMobile ? '50px' : '60px',
            height: isMobile ? '50px' : '60px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        },

        duration: {
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: '500',
        },

        categoryBadge: {
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#2563eb',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.7rem',
            fontWeight: '600',
            textTransform: 'uppercase',
        },

        demoContent: {
            padding: isMobile ? '20px' : '25px',
        },

        demoTitle: {
            fontSize: isMobile ? '1.1rem' : '1.3rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '10px',
            lineHeight: '1.3',
        },

        demoDescription: {
            color: '#64748b',
            lineHeight: '1.6',
            marginBottom: '20px',
            fontSize: '0.95rem',
        },

        demoMeta: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '10px',
        },

        instructor: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },

        instructorAvatar: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.8rem',
            fontWeight: '600',
        },

        instructorName: {
            color: '#475569',
            fontSize: '0.9rem',
            fontWeight: '500',
        },

        level: {
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: '500',
        },

        beginnerLevel: {
            background: '#dcfce7',
            color: '#166534',
        },

        intermediateLevel: {
            background: '#fef3c7',
            color: '#d97706',
        },

        advancedLevel: {
            background: '#fce7f3',
            color: '#be185d',
        },

        watchButton: {
            display: 'block',
            width: '100%',
            padding: '12px',
            background: '#2563eb',
            color: 'white',
            textAlign: 'center',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.95rem',
        },

        // Modal Styles
        modal: {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '1000',
            padding: '20px',
        },

        modalContent: {
            background: 'white',
            borderRadius: '12px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
        },

        modalHeader: {
            padding: isMobile ? '20px' : '25px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },

        modalTitle: {
            fontSize: isMobile ? '1.2rem' : '1.4rem',
            fontWeight: '600',
            color: '#1e293b',
            flex: 1,
            marginRight: '20px',
        },

        closeButton: {
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#64748b',
            padding: '8px',
            borderRadius: '4px',
            transition: 'all 0.3s ease',
        },

        videoContainer: {
            width: '100%',
            height: isMobile ? '250px' : '400px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            position: 'relative',
        },

        modalBody: {
            padding: isMobile ? '20px' : '25px',
        },

        modalDescription: {
            color: '#64748b',
            lineHeight: '1.6',
            marginBottom: '20px',
            fontSize: isMobile ? '0.9rem' : '1rem',
        },

        modalMeta: {
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
        },

        featuresSection: {
            padding: isMobile ? '60px 0' : '80px 0',
            background: '#1e293b',
            color: 'white',
        },

        featuresGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: isMobile ? '30px' : '40px',
        },

        featureCard: {
            textAlign: 'center',
            padding: isMobile ? '25px 15px' : '30px 20px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
        },

        featureIcon: {
            fontSize: isMobile ? '2.5rem' : '3rem',
            marginBottom: '15px',
        },

        featureTitle: {
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            fontWeight: '600',
            marginBottom: '12px',
        },

        featureText: {
            opacity: '0.9',
            lineHeight: '1.6',
            fontSize: '0.9rem',
        },

        ctaSection: {
            background: 'white',
            padding: isMobile ? '60px 0' : '80px 0',
            textAlign: 'center',
        },

        ctaTitle: {
            fontSize: isMobile ? '1.8rem' : '2.5rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '20px',
        },

        ctaText: {
            fontSize: isMobile ? '1rem' : '1.2rem',
            color: '#64748b',
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: '1.6',
        },

        btn: {
            display: 'inline-block',
            padding: isMobile ? '12px 28px' : '15px 35px',
            background: '#2563eb',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            marginRight: isMobile ? '8px' : '15px',
            marginBottom: '10px',
            fontSize: isMobile ? '0.9rem' : '1rem',
        },

        btnSecondary: {
            background: 'transparent',
            border: '2px solid #2563eb',
            color: '#2563eb',
        },
    };

    const demoLectures = [
        {
            id: 1,
            title: 'MSCIT Course Introduction',
            description: 'Complete overview of Maharashtra State Certificate in Information Technology course structure and benefits.',
            instructor: 'Dr. Rajesh Kumar',
            duration: '28:45',
            level: 'beginner',
            category: 'MSCIT',
            icon: '🏛️'
        },
        {
            id: 2,
            title: 'CCC Fundamentals Demo',
            description: 'NIELIT Course on Computer Concepts covering basic computer operations and digital literacy skills.',
            instructor: 'Prof. Sunita Sharma',
            duration: '25:30',
            level: 'beginner',
            category: 'CCC',
            icon: '💻'
        },
        {
            id: 3,
            title: 'Advanced Excel Formulas',
            description: 'Master complex Excel functions including VLOOKUP, INDEX-MATCH, pivot tables, and data analysis.',
            instructor: 'Amit Patel',
            duration: '35:20',
            level: 'intermediate',
            category: 'MS Office',
            icon: '📊'
        },
        {
            id: 4,
            title: 'Tally Prime with GST',
            description: 'Complete Tally software training with GST implementation, invoicing, and financial reporting.',
            instructor: 'CA Priya Gupta',
            duration: '42:15',
            level: 'intermediate',
            category: 'Accounting',
            icon: '📋'
        },
        {
            id: 5,
            title: 'Web Development Basics',
            description: 'Introduction to HTML5, CSS3, and responsive web design principles for modern websites.',
            instructor: 'Rohit Sharma',
            duration: '38:50',
            level: 'beginner',
            category: 'Web Development',
            icon: '🌐'
        },
        {
            id: 6,
            title: 'Digital Marketing Essentials',
            description: 'Learn SEO, social media marketing, Google Ads, and analytics for digital business growth.',
            instructor: 'Neha Singh',
            duration: '32:40',
            level: 'intermediate',
            category: 'Digital Marketing',
            icon: '📱'
        },
        {
            id: 7,
            title: 'Python Programming Intro',
            description: 'Start your programming journey with Python basics, variables, data types, and control structures.',
            instructor: 'Dr. Vikash Kumar',
            duration: '45:30',
            level: 'beginner',
            category: 'Programming',
            icon: '🐍'
        },
        {
            id: 8,
            title: 'Photoshop Essentials',
            description: 'Professional photo editing techniques using Adobe Photoshop tools, layers, and filters.',
            instructor: 'Kavya Reddy',
            duration: '29:15',
            level: 'intermediate',
            category: 'Graphic Design',
            icon: '🎨'
        },
        {
            id: 9,
            title: 'Computer Hardware Basics',
            description: 'Understanding computer components, assembly, troubleshooting, and maintenance techniques.',
            instructor: 'Ravi Mehta',
            duration: '33:25',
            level: 'beginner',
            category: 'Hardware',
            icon: '🔧'
        }
    ];

    const getLevelStyle = (level) => {
        switch (level) {
            case 'beginner':
                return styles.beginnerLevel;
            case 'intermediate':
                return styles.intermediateLevel;
            case 'advanced':
                return styles.advancedLevel;
            default:
                return styles.beginnerLevel;
        }
    };

    const getInstructorInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const handleWatchDemo = (demo) => {
        setSelectedDemo(demo);
    };

    const closeModal = () => {
        setSelectedDemo(null);
    };

    const handleCardHover = (e, isHovering) => {
        if (isHovering) {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
            const playBtn = e.currentTarget.querySelector('.play-button');
            if (playBtn) playBtn.style.transform = 'scale(1.1)';
        } else {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
            const playBtn = e.currentTarget.querySelector('.play-button');
            if (playBtn) playBtn.style.transform = 'scale(1)';
        }
    };

    const handleButtonHover = (e, isHovering, isSecondary = false) => {
        if (isSecondary) {
            if (isHovering) {
                e.target.style.background = '#2563eb';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-2px)';
            } else {
                e.target.style.background = 'transparent';
                e.target.style.color = '#2563eb';
                e.target.style.transform = 'translateY(0)';
            }
        } else {
            if (isHovering) {
                e.target.style.background = '#1d4ed8';
                e.target.style.transform = 'translateY(-1px)';
            } else {
                e.target.style.background = '#2563eb';
                e.target.style.transform = 'translateY(0)';
            }
        }
    };

    return (
        <div style={styles.demoContainer}>
            {/* Hero Section */}
            <section style={styles.heroSection}>
                <div style={styles.heroOverlay}></div>
                <div style={styles.container}>
                    <div style={styles.breadcrumb}>Home • Demo Lectures</div>
                    <h1 style={styles.heroTitle}>Free Demo Lectures</h1>
                    <p style={styles.heroSubtitle}>
                        Experience our expert teaching methodology and course quality with free sample lectures 
                        from our certified computer education programs.
                    </p>
                </div>
            </section>

            {/* Demo Lectures Section */}
            <section style={styles.section}>
                <div style={styles.container}>
                    <h2 style={styles.sectionTitle}>Sample Video Lectures</h2>
                    <p style={styles.sectionSubtitle}>
                        Preview our course content and teaching style before enrolling. All demos are completely free to watch.
                    </p>

                    <div style={styles.demoGrid}>
                        {demoLectures.map((demo) => (
                            <div
                                key={demo.id}
                                style={styles.demoCard}
                                onMouseEnter={(e) => handleCardHover(e, true)}
                                onMouseLeave={(e) => handleCardHover(e, false)}
                            >
                                <div
                                    style={styles.demoThumbnail}
                                    onClick={() => handleWatchDemo(demo)}
                                >
                                    <span>{demo.icon}</span>
                                    <div style={styles.categoryBadge}>
                                        {demo.category}
                                    </div>
                                    <div className="play-button" style={styles.playButton}>▶</div>
                                    <div style={styles.duration}>{demo.duration}</div>
                                </div>
                                <div style={styles.demoContent}>
                                    <h3 style={styles.demoTitle}>{demo.title}</h3>
                                    <p style={styles.demoDescription}>{demo.description}</p>

                                    <div style={styles.demoMeta}>
                                        <div style={styles.instructor}>
                                            <div style={styles.instructorAvatar}>
                                                {getInstructorInitials(demo.instructor)}
                                            </div>
                                            <span style={styles.instructorName}>{demo.instructor}</span>
                                        </div>
                                        <div style={{ ...styles.level, ...getLevelStyle(demo.level) }}>
                                            {demo.level.charAt(0).toUpperCase() + demo.level.slice(1)}
                                        </div>
                                    </div>

                                    <button
                                        style={styles.watchButton}
                                        onClick={() => handleWatchDemo(demo)}
                                        onMouseEnter={(e) => handleButtonHover(e, true)}
                                        onMouseLeave={(e) => handleButtonHover(e, false)}
                                    >
                                        Watch Free Demo
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={styles.featuresSection}>
                <div style={styles.container}>
                    <h2 style={{ ...styles.sectionTitle, color: 'white', marginBottom: '50px' }}>
                        Why Watch Our Demo Lectures?
                    </h2>
                    <div style={styles.featuresGrid}>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>🎯</div>
                            <h3 style={styles.featureTitle}>Quality Teaching</h3>
                            <p style={styles.featureText}>
                                Experience our proven teaching methods and structured approach
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>👨‍🏫</div>
                            <h3 style={styles.featureTitle}>Expert Faculty</h3>
                            <p style={styles.featureText}>
                                Meet our certified instructors with industry experience
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>📚</div>
                            <h3 style={styles.featureTitle}>Course Preview</h3>
                            <p style={styles.featureText}>
                                Get insights into curriculum and learning objectives
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>🆓</div>
                            <h3 style={styles.featureTitle}>Completely Free</h3>
                            <p style={styles.featureText}>
                                No registration required - watch instantly anytime
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>⏰</div>
                            <h3 style={styles.featureTitle}>24/7 Access</h3>
                            <p style={styles.featureText}>
                                Watch at your convenience from any device
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>🎥</div>
                            <h3 style={styles.featureTitle}>HD Quality</h3>
                            <p style={styles.featureText}>
                                Crystal clear video and audio for optimal learning
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={styles.ctaSection}>
                <div style={styles.container}>
                    <h2 style={styles.ctaTitle}>Ready to Start Learning?</h2>
                    <p style={styles.ctaText}>
                        After watching our demo lectures, take the next step and enroll in our 
                        comprehensive computer education programs with expert guidance and certification.
                    </p>
                    <Link
                        to="/apply-now"
                        style={styles.btn}
                        onMouseEnter={(e) => handleButtonHover(e, true)}
                        onMouseLeave={(e) => handleButtonHover(e, false)}
                    >
                        Enroll Now
                    </Link>
                    <Link
                        to="/courses"
                        style={{ ...styles.btn, ...styles.btnSecondary }}
                        onMouseEnter={(e) => handleButtonHover(e, true, true)}
                        onMouseLeave={(e) => handleButtonHover(e, false, true)}
                    >
                        View All Courses
                    </Link>
                </div>
            </section>

            {/* Video Modal */}
            {selectedDemo && (
                <div style={styles.modal} onClick={closeModal}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>{selectedDemo.title}</h3>
                            <button
                                style={styles.closeButton}
                                onClick={closeModal}
                                onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                                onMouseLeave={(e) => e.target.style.background = 'none'}
                            >
                                ✕
                            </button>
                        </div>
                        <div style={styles.videoContainer}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: isMobile ? '3rem' : '4rem', marginBottom: '20px' }}>
                                    {selectedDemo.icon}
                                </div>
                                <div style={{ fontSize: isMobile ? '1rem' : '1.2rem', opacity: '0.9', marginBottom: '10px' }}>
                                    Demo Video: {selectedDemo.title}
                                </div>
                                <div style={{ fontSize: '0.9rem', opacity: '0.7' }}>
                                    Duration: {selectedDemo.duration}
                                </div>
                                <div 
                                    style={{
                                        ...styles.playButton,
                                        position: 'relative',
                                        marginTop: '20px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => alert('In a real application, this would play the actual video.')}
                                >
                                    ▶
                                </div>
                            </div>
                        </div>
                        <div style={styles.modalBody}>
                            <p style={styles.modalDescription}>
                                {selectedDemo.description}
                            </p>
                            <div style={styles.modalMeta}>
                                <div style={styles.instructor}>
                                    <div style={styles.instructorAvatar}>
                                        {getInstructorInitials(selectedDemo.instructor)}
                                    </div>
                                    <span style={styles.instructorName}>Instructor: {selectedDemo.instructor}</span>
                                </div>
                                <div style={{ ...styles.level, ...getLevelStyle(selectedDemo.level) }}>
                                    {selectedDemo.level.charAt(0).toUpperCase() + selectedDemo.level.slice(1)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DemoLectures;
