import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const About = () => {
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
        aboutContainer: {
            minHeight: '100vh',
            background: '#f8fafc',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            lineHeight: '1.6',
            paddingTop: '80px', // Account for fixed navbar
        },

        // Hero Section
        heroSection: {
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            color: 'white',
            padding: isMobile ? '60px 0' : '80px 0',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
        },

        heroOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.1)',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
            fontSize: isMobile ? '2.2rem' : isTablet ? '3rem' : '3.5rem',
            fontWeight: '800',
            marginBottom: '20px',
            color: 'white',
            lineHeight: '1.2',
        },

        heroSubtitle: {
            fontSize: isMobile ? '1.1rem' : '1.3rem',
            opacity: '0.9',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6',
            fontWeight: '400',
            color: '#cbd5e1',
        },

        // Sections
        section: {
            padding: isMobile ? '60px 0' : '80px 0',
        },

        whiteSection: {
            background: 'white',
        },

        graySection: {
            background: '#f8fafc',
        },

        darkSection: {
            background: '#1e293b',
            color: 'white',
        },

        sectionTitle: {
            fontSize: isMobile ? '1.8rem' : isTablet ? '2.2rem' : '2.5rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '20px',
            textAlign: 'center',
            lineHeight: '1.2',
        },

        sectionTitleLight: {
            color: 'white',
        },

        sectionSubtitle: {
            fontSize: isMobile ? '1rem' : '1.1rem',
            color: '#64748b',
            textAlign: 'center',
            maxWidth: '700px',
            margin: '0 auto 60px',
            lineHeight: '1.6',
            fontWeight: '400',
        },

        sectionSubtitleLight: {
            color: '#cbd5e1',
        },

        // Grid Layouts
        gridTwo: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '40px' : '60px',
            alignItems: 'center',
        },

        gridThree: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: isMobile ? '30px' : '40px',
        },

        textContent: {
            lineHeight: '1.7',
            color: '#475569',
            fontSize: isMobile ? '1rem' : '1.05rem',
        },

        textContentLight: {
            color: '#cbd5e1',
        },

        paragraph: {
            marginBottom: '20px',
            lineHeight: '1.7',
        },

        // Image Placeholder
        imagePlaceholder: {
            width: '100%',
            height: isMobile ? '250px' : '350px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: isMobile ? '3rem' : '4rem',
            boxShadow: '0 10px 30px rgba(37, 99, 235, 0.2)',
            transition: 'all 0.3s ease',
        },

        // Value Cards
        valueCard: {
            background: 'white',
            padding: isMobile ? '30px 20px' : '40px 30px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            border: '1px solid #e2e8f0',
            height: '100%',
        },

        valueIcon: {
            fontSize: isMobile ? '2.5rem' : '3rem',
            marginBottom: '20px',
            display: 'block',
        },

        valueTitle: {
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '15px',
        },

        valueText: {
            color: '#64748b',
            lineHeight: '1.6',
            fontSize: '0.95rem',
        },

        // Statistics
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '25px' : '30px',
            textAlign: 'center',
        },

        statCard: {
            background: 'rgba(255, 255, 255, 0.1)',
            padding: isMobile ? '30px 20px' : '40px 25px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
        },

        statNumber: {
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '800',
            color: '#2563eb',
            marginBottom: '10px',
        },

        statLabel: {
            fontSize: isMobile ? '0.9rem' : '1rem',
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: '500',
        },

        // Team Cards
        teamGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '30px' : '35px',
        },

        teamCard: {
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            border: '1px solid #e2e8f0',
        },

        teamImage: {
            width: '100%',
            height: isMobile ? '200px' : '220px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: isMobile ? '3rem' : '3.5rem',
        },

        teamInfo: {
            padding: isMobile ? '25px 20px' : '30px 25px',
        },

        teamName: {
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '8px',
        },

        teamRole: {
            color: '#2563eb',
            fontSize: '0.9rem',
            marginBottom: '15px',
            fontWeight: '500',
        },

        teamBio: {
            color: '#64748b',
            fontSize: '0.85rem',
            lineHeight: '1.6',
        },

        // CTA Section
        ctaSection: {
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            color: 'white',
            padding: isMobile ? '60px 0' : '80px 0',
            textAlign: 'center',
            position: 'relative',
        },

        ctaTitle: {
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '700',
            marginBottom: '20px',
            color: 'white',
        },

        ctaText: {
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            marginBottom: '40px',
            opacity: '0.9',
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: '1.6',
        },

        btn: {
            display: 'inline-block',
            padding: isMobile ? '15px 35px' : '18px 45px',
            background: 'white',
            color: '#2563eb',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: isMobile ? '1rem' : '1.1rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        },

        highlight: {
            color: '#2563eb',
            fontWeight: '700',
        },

        missionVisionBox: {
            marginBottom: '35px',
        },

        missionTitle: {
            color: '#2563eb',
            fontSize: isMobile ? '1.2rem' : '1.3rem',
            fontWeight: '600',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
        },

        missionIcon: {
            marginRight: '10px',
            fontSize: '1.5rem',
        },
    };

    // Hover Effects
    const handleCardHover = (e, isHovering) => {
        if (isHovering) {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.12)';
        } else {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
        }
    };

    const handleImageHover = (e, isHovering) => {
        if (isHovering) {
            e.target.style.transform = 'scale(1.02)';
            e.target.style.boxShadow = '0 15px 40px rgba(37, 99, 235, 0.3)';
        } else {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 10px 30px rgba(37, 99, 235, 0.2)';
        }
    };

    const handleStatHover = (e, isHovering) => {
        if (isHovering) {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.background = 'rgba(255, 255, 255, 0.15)';
        } else {
            e.target.style.transform = 'translateY(0)';
            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
        }
    };

    const handleButtonHover = (e, isHovering) => {
        if (isHovering) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.background = '#f8fafc';
            e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        } else {
            e.target.style.transform = 'translateY(0)';
            e.target.style.background = 'white';
            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        }
    };

    return (
        <div style={styles.aboutContainer}>
            {/* Hero Section */}
            <section style={styles.heroSection}>
                <div style={styles.heroOverlay}></div>
                <div style={styles.container}>
                    <div style={styles.breadcrumb}>Home • About Us</div>
                    <h1 style={styles.heroTitle}>About TechEdu Institute</h1>
                    <p style={styles.heroSubtitle}>
                        Leading computer education institute providing comprehensive training in digital literacy, 
                        programming, and modern technology skills since 2001. Empowering students for the digital future.
                    </p>
                </div>
            </section>

            {/* Our Story Section */}
            <section style={{ ...styles.section, ...styles.whiteSection }}>
                <div style={styles.container}>
                    <div style={styles.gridTwo}>
                        <div>
                            <h2 style={{ ...styles.sectionTitle, textAlign: 'left', marginBottom: '30px' }}>
                                Our <span style={styles.highlight}>Story</span>
                            </h2>
                            <div style={styles.textContent}>
                                <p style={styles.paragraph}>
                                    Established in 2001, TechEdu Institute began with a vision to bridge the digital divide 
                                    and make quality computer education accessible to everyone. From humble beginnings with 
                                    a single computer lab, we have grown into a trusted network of computer training centers.
                                </p>
                                <p style={styles.paragraph}>
                                    Today, we serve thousands of students through our comprehensive curriculum covering 
                                    everything from basic computer literacy to advanced programming and digital marketing. 
                                    Our practical approach ensures students gain job-ready skills.
                                </p>
                                <p style={styles.paragraph}>
                                    What sets us apart is our commitment to quality education, experienced instructors, 
                                    and modern teaching methodologies that adapt to the rapidly evolving technology landscape.
                                </p>
                            </div>
                        </div>
                        <div 
                            style={styles.imagePlaceholder}
                            onMouseEnter={(e) => handleImageHover(e, true)}
                            onMouseLeave={(e) => handleImageHover(e, false)}
                        >
                            🏢
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section style={{ ...styles.section, ...styles.graySection }}>
                <div style={styles.container}>
                    <div style={styles.gridTwo}>
                        <div 
                            style={styles.imagePlaceholder}
                            onMouseEnter={(e) => handleImageHover(e, true)}
                            onMouseLeave={(e) => handleImageHover(e, false)}
                        >
                            🎯
                        </div>
                        <div>
                            <h2 style={{ ...styles.sectionTitle, textAlign: 'left', marginBottom: '30px' }}>
                                Mission & <span style={styles.highlight}>Vision</span>
                            </h2>
                            <div style={styles.textContent}>
                                <div style={styles.missionVisionBox}>
                                    <h3 style={styles.missionTitle}>
                                        <span style={styles.missionIcon}>🚀</span>
                                        Our Mission
                                    </h3>
                                    <p style={styles.paragraph}>
                                        To provide high-quality, affordable computer education that empowers individuals 
                                        with practical digital skills. We focus on hands-on training, industry-relevant 
                                        curriculum, and personalized attention to ensure every student succeeds.
                                    </p>
                                </div>

                                <div style={styles.missionVisionBox}>
                                    <h3 style={styles.missionTitle}>
                                        <span style={styles.missionIcon}>🌟</span>
                                        Our Vision
                                    </h3>
                                    <p style={styles.paragraph}>
                                        To be the leading computer education institute, recognized for excellence in 
                                        teaching and innovation in curriculum. We envision a digitally literate society 
                                        where technology empowers every individual to achieve their career goals.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Statistics */}
            <section style={{ ...styles.section, ...styles.darkSection }}>
                <div style={styles.container}>
                    <h2 style={{ ...styles.sectionTitle, ...styles.sectionTitleLight }}>
                        Our Achievements in <span style={{ color: '#2563eb' }}>Numbers</span>
                    </h2>
                    <p style={{ ...styles.sectionSubtitle, ...styles.sectionSubtitleLight }}>
                        Measuring our impact through student success stories and educational excellence
                    </p>

                    <div style={styles.statsGrid}>
                        {[
                            { number: '50,000+', label: 'Students Trained' },
                            { number: '100+', label: 'Training Centers' },
                            { number: '25+', label: 'Courses Offered' },
                            { number: '23+', label: 'Years Experience' },
                            
                        ].map((stat, index) => (
                            <div 
                                key={index}
                                style={styles.statCard}
                                onMouseEnter={(e) => handleStatHover(e, true)}
                                onMouseLeave={(e) => handleStatHover(e, false)}
                            >
                                <div style={styles.statNumber}>{stat.number}</div>
                                <div style={styles.statLabel}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Leadership Team */}
            <section style={{ ...styles.section, ...styles.whiteSection }}>
                <div style={styles.container}>
                    <h2 style={styles.sectionTitle}>Our <span style={styles.highlight}>Team</span></h2>
                    <p style={styles.sectionSubtitle}>
                        Meet the dedicated professionals behind TechEdu's success in computer education
                    </p>

                    <div style={styles.teamGrid}>
                        {[
                            { emoji: '👨‍💼', name: 'Mr. Rajesh Sharma', role: 'Founder & Director', bio: '20+ years in computer education and technology training.' },
                            { emoji: '👩‍🏫', name: 'Mrs. Priya Patel', role: 'Academic Head', bio: 'Expert in curriculum design and educational methodology.' },
                            { emoji: '👨‍💻', name: 'Mr. Amit Kumar', role: 'Technical Director', bio: 'Senior software developer with extensive teaching experience.' },
                            { emoji: '👩‍💼', name: 'Ms. Sunita Gupta', role: 'Operations Manager', bio: 'Specialized in student support and center management.' }
                        ].map((member, index) => (
                            <div
                                key={index}
                                style={styles.teamCard}
                                onMouseEnter={(e) => handleCardHover(e, true)}
                                onMouseLeave={(e) => handleCardHover(e, false)}
                            >
                                <div style={styles.teamImage}>{member.emoji}</div>
                                <div style={styles.teamInfo}>
                                    <h3 style={styles.teamName}>{member.name}</h3>
                                    <div style={styles.teamRole}>{member.role}</div>
                                    <p style={styles.teamBio}>{member.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={styles.ctaSection}>
                <div style={styles.container}>
                    <h2 style={styles.ctaTitle}>Ready to Start Your Tech Journey?</h2>
                    <p style={styles.ctaText}>
                        Join thousands of successful students who have launched their careers in technology. 
                        Discover our comprehensive computer courses and expert training programs.
                    </p>
                    <Link
                        to="/apply-now"
                        style={styles.btn}
                        onMouseEnter={(e) => handleButtonHover(e, true)}
                        onMouseLeave={(e) => handleButtonHover(e, false)}
                    >
                        Enroll Now
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default About;
