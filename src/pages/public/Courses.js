import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Courses = () => {
    const [activeFilter, setActiveFilter] = useState('all');
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
        coursesContainer: {
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

        filterTabs: {
            display: 'flex',
            justifyContent: 'center',
            gap: isMobile ? '8px' : '12px',
            marginBottom: '50px',
            flexWrap: 'wrap',
        },

        filterTab: {
            padding: isMobile ? '10px 18px' : '12px 24px',
            background: 'white',
            border: '2px solid #e2e8f0',
            borderRadius: '25px',
            color: '#64748b',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '600',
            fontSize: isMobile ? '0.85rem' : '0.9rem',
        },

        activeFilterTab: {
            background: '#2563eb',
            borderColor: '#2563eb',
            color: 'white',
        },

        coursesGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: isMobile ? '25px' : '30px',
        },

        courseCard: {
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            border: '1px solid #e2e8f0',
        },

        courseImage: {
            height: isMobile ? '150px' : '180px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            color: 'white',
            fontSize: isMobile ? '2.5rem' : '3rem',
        },

        courseBadge: {
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'white',
            color: '#2563eb',
            padding: '6px 12px',
            borderRadius: '15px',
            fontSize: '0.75rem',
            fontWeight: '600',
        },

        courseContent: {
            padding: isMobile ? '20px' : '25px',
        },

        courseTitle: {
            fontSize: isMobile ? '1.2rem' : '1.3rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '12px',
            lineHeight: '1.3',
        },

        courseDescription: {
            color: '#64748b',
            lineHeight: '1.6',
            marginBottom: '20px',
            fontSize: '0.95rem',
        },

        courseMeta: {
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

        coursePrice: {
            fontSize: isMobile ? '1.3rem' : '1.4rem',
            fontWeight: '700',
            color: '#2563eb',
            marginBottom: '20px',
        },

        courseButton: {
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
            fontSize: '0.95rem',
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

    const courses = [
        {
            id: 1,
            title: 'MSCIT (Maharashtra State CIT)',
            category: 'beginner',
            description: 'Government certified course covering computer fundamentals, MS Office, internet, and digital literacy.',
            duration: '3 Months',
            level: 'Beginner',
            students: '5,000+',
            certificate: 'Government',
            price: '₹4,500',
            icon: '🏛️'
        },
        {
            id: 2,
            title: 'CCC (Course on Computer Concepts)',
            category: 'beginner',
            description: 'NIELIT certified basic computer course covering Windows, Office applications, and internet usage.',
            duration: '2 Months',
            level: 'Beginner',
            students: '3,500+',
            certificate: 'NIELIT',
            price: '₹3,200',
            icon: '💻'
        },
        {
            id: 3,
            title: 'Tally Prime with GST',
            category: 'intermediate',
            description: 'Complete accounting software training with GST, inventory management, and financial reports.',
            duration: '2 Months',
            level: 'Intermediate',
            students: '2,800+',
            certificate: 'Yes',
            price: '₹6,500',
            icon: '📊'
        },
        {
            id: 4,
            title: 'MS Office Complete Course',
            category: 'beginner',
            description: 'Master Word, Excel, PowerPoint, and Outlook with practical projects and real-world applications.',
            duration: '2 Months',
            level: 'Beginner',
            students: '4,200+',
            certificate: 'Yes',
            price: '₹3,800',
            icon: '📄'
        },
        {
            id: 5,
            title: 'Advanced Excel & MIS',
            category: 'intermediate',
            description: 'Advanced Excel functions, pivot tables, macros, VBA programming, and MIS reporting.',
            duration: '1.5 Months',
            level: 'Intermediate',
            students: '1,500+',
            certificate: 'Yes',
            price: '₹5,500',
            icon: '📈'
        },
        {
            id: 6,
            title: 'Web Designing (HTML, CSS, JS)',
            category: 'intermediate',
            description: 'Create responsive websites using HTML5, CSS3, JavaScript, and Bootstrap framework.',
            duration: '3 Months',
            level: 'Intermediate',
            students: '1,800+',
            certificate: 'Yes',
            price: '₹8,500',
            icon: '🌐'
        },
        {
            id: 7,
            title: 'Digital Marketing Course',
            category: 'intermediate',
            description: 'SEO, Social Media Marketing, Google Ads, Email Marketing, and Analytics certification.',
            duration: '2 Months',
            level: 'Intermediate',
            students: '1,200+',
            certificate: 'Google',
            price: '₹7,500',
            icon: '📱'
        },
        {
            id: 8,
            title: 'Programming in C & C++',
            category: 'advanced',
            description: 'Learn programming fundamentals with C and object-oriented programming with C++.',
            duration: '4 Months',
            level: 'Advanced',
            students: '800+',
            certificate: 'Yes',
            price: '₹12,000',
            icon: '⚙️'
        },
        {
            id: 9,
            title: 'Java Programming',
            category: 'advanced',
            description: 'Complete Java programming from basics to advanced with projects and industry applications.',
            duration: '5 Months',
            level: 'Advanced',
            students: '600+',
            certificate: 'Yes',
            price: '₹15,000',
            icon: '☕'
        }
    ];

    const filters = [
        { key: 'all', label: 'All Courses' },
        { key: 'beginner', label: 'Beginner' },
        { key: 'intermediate', label: 'Intermediate' },
        { key: 'advanced', label: 'Advanced' }
    ];

    const filteredCourses = activeFilter === 'all'
        ? courses
        : courses.filter(course => course.category === activeFilter);

    const handleCardHover = (e, isHovering) => {
        if (isHovering) {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
        } else {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
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
                e.target.style.transform = 'translateY(-2px)';
            } else {
                e.target.style.background = '#2563eb';
                e.target.style.transform = 'translateY(0)';
            }
        }
    };

    return (
        <div style={styles.coursesContainer}>
            {/* Hero Section */}
            <section style={styles.heroSection}>
                <div style={styles.heroOverlay}></div>
                <div style={styles.container}>
                    <div style={styles.breadcrumb}>Home • Courses</div>
                    <h1 style={styles.heroTitle}>Computer Courses</h1>
                    <p style={styles.heroSubtitle}>
                        Professional computer education programs designed to enhance your digital skills 
                        and boost your career prospects in the technology sector.
                    </p>
                </div>
            </section>

            {/* Courses Section */}
            <section style={styles.section}>
                <div style={styles.container}>
                    <h2 style={styles.sectionTitle}>Choose Your Course</h2>
                    <p style={styles.sectionSubtitle}>
                        From government-certified programs to advanced programming courses, 
                        find the perfect course to match your career goals.
                    </p>

                    {/* Filter Tabs */}
                    <div style={styles.filterTabs}>
                        {filters.map((filter) => (
                            <div
                                key={filter.key}
                                style={{
                                    ...styles.filterTab,
                                    ...(activeFilter === filter.key ? styles.activeFilterTab : {})
                                }}
                                onClick={() => setActiveFilter(filter.key)}
                                onMouseEnter={(e) => {
                                    if (activeFilter !== filter.key) {
                                        e.target.style.borderColor = '#2563eb';
                                        e.target.style.color = '#2563eb';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeFilter !== filter.key) {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.color = '#64748b';
                                    }
                                }}
                            >
                                {filter.label}
                            </div>
                        ))}
                    </div>

                    {/* Courses Grid */}
                    <div style={styles.coursesGrid}>
                        {filteredCourses.map((course) => (
                            <div
                                key={course.id}
                                style={styles.courseCard}
                                onMouseEnter={(e) => handleCardHover(e, true)}
                                onMouseLeave={(e) => handleCardHover(e, false)}
                            >
                                <div style={styles.courseImage}>
                                    <span>{course.icon}</span>
                                    <div style={styles.courseBadge}>{course.level}</div>
                                </div>
                                <div style={styles.courseContent}>
                                    <h3 style={styles.courseTitle}>{course.title}</h3>
                                    <p style={styles.courseDescription}>{course.description}</p>

                                    <div style={styles.courseMeta}>
                                        <div style={styles.metaItem}>
                                            <span>⏱️</span>
                                            <span>{course.duration}</span>
                                        </div>
                                        <div style={styles.metaItem}>
                                            <span>👥</span>
                                            <span>{course.students}</span>
                                        </div>
                                        <div style={styles.metaItem}>
                                            <span>🏆</span>
                                            <span>{course.certificate}</span>
                                        </div>
                                        <div style={styles.metaItem}>
                                            <span>📚</span>
                                            <span>{course.level}</span>
                                        </div>
                                    </div>

                                    <div style={styles.coursePrice}>{course.price}</div>

                                    <Link
                                        to="/apply-now"
                                        style={styles.courseButton}
                                        onMouseEnter={(e) => handleButtonHover(e, true)}
                                        onMouseLeave={(e) => handleButtonHover(e, false)}
                                    >
                                        Enroll Now
                                    </Link>
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
                        Why Choose TechEdu?
                    </h2>
                    <div style={styles.featuresGrid}>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>🎓</div>
                            <h3 style={styles.featureTitle}>Certified Courses</h3>
                            <p style={styles.featureText}>
                                Government and industry recognized certifications
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>👨‍🏫</div>
                            <h3 style={styles.featureTitle}>Expert Faculty</h3>
                            <p style={styles.featureText}>
                                Experienced instructors with industry expertise
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>💻</div>
                            <h3 style={styles.featureTitle}>Practical Training</h3>
                            <p style={styles.featureText}>
                                Hands-on learning with real-world projects
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>📅</div>
                            <h3 style={styles.featureTitle}>Flexible Timings</h3>
                            <p style={styles.featureText}>
                                Morning, evening, and weekend batch options
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>💼</div>
                            <h3 style={styles.featureTitle}>Job Support</h3>
                            <p style={styles.featureText}>
                                Career guidance and placement assistance
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>🏢</div>
                            <h3 style={styles.featureTitle}>Modern Labs</h3>
                            <p style={styles.featureText}>
                                Well-equipped computer labs with latest software
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
                        Join thousands of successful students and advance your computer skills today. 
                        Get certified and boost your career prospects.
                    </p>
                    <Link
                        to="/apply-now"
                        style={styles.btn}
                        onMouseEnter={(e) => handleButtonHover(e, true)}
                        onMouseLeave={(e) => handleButtonHover(e, false)}
                    >
                        Apply Now
                    </Link>
                    <Link
                        to="/demo-lectures"
                        style={{ ...styles.btn, ...styles.btnSecondary }}
                        onMouseEnter={(e) => handleButtonHover(e, true, true)}
                        onMouseLeave={(e) => handleButtonHover(e, false, true)}
                    >
                        Free Demo
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Courses;
