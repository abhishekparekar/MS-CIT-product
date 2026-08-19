import React, { useState, useEffect } from 'react';

const Exam = () => {
    const [selectedExam, setSelectedExam] = useState(null);
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
        examContainer: {
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
            maxWidth: '600px',
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

        examGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: isMobile ? '25px' : '30px',
        },

        examCard: {
            background: 'white',
            borderRadius: '12px',
            padding: isMobile ? '25px' : '30px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            border: '1px solid #e2e8f0',
            position: 'relative',
        },

        selectedExamCard: {
            borderColor: '#2563eb',
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 25px rgba(37, 99, 235, 0.15)',
        },

        examIcon: {
            fontSize: isMobile ? '2.5rem' : '3rem',
            marginBottom: '20px',
            display: 'block',
        },

        examTitle: {
            fontSize: isMobile ? '1.2rem' : '1.3rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '12px',
            lineHeight: '1.3',
        },

        examDescription: {
            color: '#64748b',
            lineHeight: '1.6',
            marginBottom: '20px',
            fontSize: '0.95rem',
        },

        examMeta: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px',
        },

        metaItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#64748b',
            fontSize: '0.85rem',
        },

        examPrice: {
            fontSize: isMobile ? '1.3rem' : '1.4rem',
            fontWeight: '700',
            color: '#2563eb',
            marginBottom: '20px',
        },

        examButton: {
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

        freeExamButton: {
            background: '#059669',
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

        guidelinesSection: {
            padding: isMobile ? '60px 0' : '80px 0',
            background: 'white',
        },

        guidelinesList: {
            maxWidth: '900px',
            margin: '0 auto',
            listStyle: 'none',
            padding: '0',
        },

        guidelineItem: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: isMobile ? '12px' : '15px',
            marginBottom: '20px',
            padding: isMobile ? '18px' : '20px',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s ease',
        },

        guidelineIcon: {
            fontSize: '1.3rem',
            marginTop: '2px',
            color: '#2563eb',
        },

        guidelineText: {
            color: '#475569',
            lineHeight: '1.6',
            fontSize: isMobile ? '0.9rem' : '1rem',
        },

        modal: {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '1000',
            padding: '20px',
        },

        modalContent: {
            background: 'white',
            borderRadius: '12px',
            padding: isMobile ? '30px 25px' : '40px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            maxHeight: '90vh',
            overflowY: 'auto',
        },

        modalTitle: {
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '15px',
        },

        modalText: {
            color: '#64748b',
            lineHeight: '1.6',
            marginBottom: '30px',
            fontSize: isMobile ? '0.9rem' : '1rem',
        },

        modalButtons: {
            display: 'flex',
            gap: isMobile ? '10px' : '15px',
            justifyContent: 'center',
            flexDirection: isMobile ? 'column' : 'row',
        },

        btn: {
            padding: isMobile ? '12px 20px' : '12px 25px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
        },

        btnPrimary: {
            background: '#2563eb',
            color: 'white',
        },

        btnSecondary: {
            background: '#f1f5f9',
            color: '#64748b',
            border: '1px solid #e2e8f0',
        },

        searchSection: {
            background: '#f8fafc',
            padding: isMobile ? '40px 0' : '50px 0',
            borderBottom: '1px solid #e2e8f0',
        },

        searchContainer: {
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center',
        },

        searchTitle: {
            fontSize: isMobile ? '1.4rem' : '1.6rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '15px',
        },

        searchForm: {
            display: 'flex',
            gap: '10px',
            marginTop: '20px',
            flexDirection: isMobile ? 'column' : 'row',
        },

        searchInput: {
            flex: 1,
            padding: '12px 15px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s ease',
        },

        searchButton: {
            padding: '12px 25px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
        },
    };

    const exams = [
        {
            id: 1,
            title: 'MSCIT Online Exam',
            description: 'Government certified Maharashtra State Certificate in Information Technology examination.',
            duration: '90 Minutes',
            questions: '100 Questions',
            attempts: '3 Attempts',
            validity: '6 Months',
            price: 'Free',
            icon: '🏛️',
            level: 'Beginner'
        },
        {
            id: 2,
            title: 'CCC Certification Exam',
            description: 'NIELIT Course on Computer Concepts certification exam for basic computer skills.',
            duration: '75 Minutes',
            questions: '100 Questions',
            attempts: '3 Attempts',
            validity: '6 Months',
            price: 'Free',
            icon: '💻',
            level: 'Beginner'
        },
        {
            id: 3,
            title: 'Advanced Excel Assessment',
            description: 'Comprehensive Excel skills test covering formulas, pivot tables, and data analysis.',
            duration: '60 Minutes',
            questions: '50 Questions',
            attempts: '2 Attempts',
            validity: '1 Year',
            price: '₹299',
            icon: '📊',
            level: 'Intermediate'
        },
        {
            id: 4,
            title: 'Tally with GST Exam',
            description: 'Professional accounting software certification with GST implementation knowledge.',
            duration: '75 Minutes',
            questions: '60 Questions',
            attempts: '2 Attempts',
            validity: '1 Year',
            price: '₹399',
            icon: '📋',
            level: 'Intermediate'
        },
        {
            id: 5,
            title: 'Web Development Test',
            description: 'HTML, CSS, JavaScript, and responsive web design skills assessment.',
            duration: '90 Minutes',
            questions: '75 Questions',
            attempts: '2 Attempts',
            validity: '1 Year',
            price: '₹599',
            icon: '🌐',
            level: 'Advanced'
        },
        {
            id: 6,
            title: 'Digital Marketing Certification',
            description: 'SEO, social media marketing, and Google Ads proficiency examination.',
            duration: '80 Minutes',
            questions: '65 Questions',
            attempts: '2 Attempts',
            validity: '1 Year',
            price: '₹499',
            icon: '📱',
            level: 'Intermediate'
        }
    ];

    const guidelines = [
        {
            icon: '🕐',
            text: 'Join the exam 15 minutes before scheduled time for system check and identity verification.'
        },
        {
            icon: '🆔',
            text: 'Keep a valid government photo ID ready for verification before starting the examination.'
        },
        {
            icon: '📱',
            text: 'Mobile phones and electronic devices are strictly prohibited during the exam session.'
        },
        {
            icon: '💻',
            text: 'Ensure stable internet connection and basic computer skills before attempting the exam.'
        },
        {
            icon: '⏰',
            text: 'Exam timer cannot be paused once started. Complete all questions within time limit.'
        },
        {
            icon: '✅',
            text: 'Review answers carefully before submission. No changes allowed after final submission.'
        },
        {
            icon: '📊',
            text: 'Instant results with detailed performance analysis available immediately after completion.'
        },
        {
            icon: '🏆',
            text: 'Digital certificates for passing candidates can be downloaded from student portal.'
        }
    ];

    const handleExamSelect = (exam) => {
        setSelectedExam(exam);
    };

    const handleStartExam = () => {
        alert(`Starting ${selectedExam.title}. This would redirect to the actual exam interface.`);
        setSelectedExam(null);
    };

    const handleCardHover = (e, isHovering) => {
        if (isHovering) {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
        } else {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
        }
    };

    const handleButtonHover = (e, isHovering, isFree = false) => {
        if (isHovering) {
            e.target.style.background = isFree ? '#047857' : '#1d4ed8';
            e.target.style.transform = 'translateY(-1px)';
        } else {
            e.target.style.background = isFree ? '#059669' : '#2563eb';
            e.target.style.transform = 'translateY(0)';
        }
    };

    const handleGuidelineHover = (e, isHovering) => {
        if (isHovering) {
            e.target.style.background = '#f1f5f9';
            e.target.style.borderColor = '#cbd5e1';
        } else {
            e.target.style.background = '#f8fafc';
            e.target.style.borderColor = '#e2e8f0';
        }
    };

    return (
        <div style={styles.examContainer}>
            {/* Hero Section */}
            <section style={styles.heroSection}>
                <div style={styles.heroOverlay}></div>
                <div style={styles.container}>
                    <div style={styles.breadcrumb}>Home • Online Exams</div>
                    <h1 style={styles.heroTitle}>Online Examinations</h1>
                    <p style={styles.heroSubtitle}>
                        Take certified computer skills examinations online and earn industry-recognized 
                        certificates to advance your career in technology.
                    </p>
                </div>
            </section>

            {/* Search Section */}
            <section style={styles.searchSection}>
                <div style={styles.container}>
                    <div style={styles.searchContainer}>
                        <h3 style={styles.searchTitle}>Search Your Exam Results</h3>
                        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                            Enter your application number or enrollment ID to check exam results
                        </p>
                        <div style={styles.searchForm}>
                            <input
                                type="text"
                                placeholder="Enter Application/Enrollment Number"
                                style={styles.searchInput}
                                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                            <button
                                style={styles.searchButton}
                                onMouseEnter={(e) => e.target.style.background = '#1d4ed8'}
                                onMouseLeave={(e) => e.target.style.background = '#2563eb'}
                            >
                                Search Results
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Exams Section */}
            <section style={styles.section}>
                <div style={styles.container}>
                    <h2 style={styles.sectionTitle}>Available Examinations</h2>
                    <p style={styles.sectionSubtitle}>
                        Choose from our range of computer certification exams and test your skills online
                    </p>

                    <div style={styles.examGrid}>
                        {exams.map((exam) => (
                            <div
                                key={exam.id}
                                style={styles.examCard}
                                onMouseEnter={(e) => handleCardHover(e, true)}
                                onMouseLeave={(e) => handleCardHover(e, false)}
                            >
                                <div style={styles.examIcon}>{exam.icon}</div>
                                <h3 style={styles.examTitle}>{exam.title}</h3>
                                <p style={styles.examDescription}>{exam.description}</p>

                                <div style={styles.examMeta}>
                                    <div style={styles.metaItem}>
                                        <span>⏱️</span>
                                        <span>{exam.duration}</span>
                                    </div>
                                    <div style={styles.metaItem}>
                                        <span>❓</span>
                                        <span>{exam.questions}</span>
                                    </div>
                                    <div style={styles.metaItem}>
                                        <span>🔄</span>
                                        <span>{exam.attempts}</span>
                                    </div>
                                    <div style={styles.metaItem}>
                                        <span>📅</span>
                                        <span>{exam.validity}</span>
                                    </div>
                                </div>

                                <div style={styles.examPrice}>{exam.price}</div>

                                <button
                                    style={{
                                        ...styles.examButton,
                                        ...(exam.price === 'Free' ? styles.freeExamButton : {})
                                    }}
                                    onClick={() => handleExamSelect(exam)}
                                    onMouseEnter={(e) => handleButtonHover(e, true, exam.price === 'Free')}
                                    onMouseLeave={(e) => handleButtonHover(e, false, exam.price === 'Free')}
                                >
                                    {exam.price === 'Free' ? 'Start Free Exam' : 'Purchase & Start'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={styles.featuresSection}>
                <div style={styles.container}>
                    <h2 style={{ ...styles.sectionTitle, color: 'white', marginBottom: '50px' }}>
                        Exam Features
                    </h2>
                    <div style={styles.featuresGrid}>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>🔒</div>
                            <h3 style={styles.featureTitle}>Secure Platform</h3>
                            <p style={styles.featureText}>
                                Advanced security measures ensure fair and secure examination
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>📊</div>
                            <h3 style={styles.featureTitle}>Instant Results</h3>
                            <p style={styles.featureText}>
                                Get immediate results with detailed performance analysis
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>🏆</div>
                            <h3 style={styles.featureTitle}>Digital Certificates</h3>
                            <p style={styles.featureText}>
                                Download verified certificates upon successful completion
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>🔄</div>
                            <h3 style={styles.featureTitle}>Multiple Attempts</h3>
                            <p style={styles.featureText}>
                                Retake exams to improve your score within validity period
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>📱</div>
                            <h3 style={styles.featureTitle}>Multi-Device</h3>
                            <p style={styles.featureText}>
                                Compatible with desktop, laptop, and tablet devices
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>⏰</div>
                            <h3 style={styles.featureTitle}>Flexible Timing</h3>
                            <p style={styles.featureText}>
                                Schedule exams at your convenience 24/7 availability
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Guidelines Section */}
            <section style={styles.guidelinesSection}>
                <div style={styles.container}>
                    <h2 style={styles.sectionTitle}>Exam Guidelines</h2>
                    <p style={styles.sectionSubtitle}>
                        Important instructions for a smooth and successful examination experience
                    </p>

                    <ul style={styles.guidelinesList}>
                        {guidelines.map((guideline, index) => (
                            <li 
                                key={index} 
                                style={styles.guidelineItem}
                                onMouseEnter={(e) => handleGuidelineHover(e, true)}
                                onMouseLeave={(e) => handleGuidelineHover(e, false)}
                            >
                                <span style={styles.guidelineIcon}>{guideline.icon}</span>
                                <span style={styles.guidelineText}>{guideline.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Modal for Exam Confirmation */}
            {selectedExam && (
                <div style={styles.modal} onClick={() => setSelectedExam(null)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3 style={styles.modalTitle}>Start {selectedExam.title}?</h3>
                        <p style={styles.modalText}>
                            You are about to start the {selectedExam.title}. Duration: {selectedExam.duration} 
                            with {selectedExam.questions}. Ensure stable internet connection and quiet environment 
                            before proceeding.
                        </p>
                        <div style={styles.modalButtons}>
                            <button
                                style={{ ...styles.btn, ...styles.btnPrimary }}
                                onClick={handleStartExam}
                                onMouseEnter={(e) => e.target.style.background = '#1d4ed8'}
                                onMouseLeave={(e) => e.target.style.background = '#2563eb'}
                            >
                                Start Exam
                            </button>
                            <button
                                style={{ ...styles.btn, ...styles.btnSecondary }}
                                onClick={() => setSelectedExam(null)}
                                onMouseEnter={(e) => e.target.style.background = '#e2e8f0'}
                                onMouseLeave={(e) => e.target.style.background = '#f1f5f9'}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Exam;
