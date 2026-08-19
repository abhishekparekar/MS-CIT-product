import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaQuoteLeft, FaStar } from 'react-icons/fa';

const TestimonialsPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);

    // Sample testimonials data - you can replace with your actual data
    const testimonials = [
        {
            id: 1,
            name: "Krutika, Pune",
            role: "Housewife",
            image: "👩‍💼",
            rating: 5,
            text: "I am a housewife. I wanted to learn computer so I joined the MS-CIT course after counseling in MS-CIT Centre. Now I help my children complete their projects using word and power point. I can search various images related to project on internet and can search topics related to science projects. I feel proud when I make gas bookings, electricity, mobile bill payment online without help."
        },
        {
            id: 2,
            name: "Pooja Raj, Dhule",
            role: "11th Std Student",
            image: "👨‍🎓",
            rating: 5,
            text: "I am a college student and have been using computer since 5th std, but I was not aware of so many functions in computer. I only used computers for playing games only. Now, I can search project related data online, make presentations in seminars and prepare projects reports easily."
        },
        {
            id: 3,
            name: "Veena Vibhute, Pune",
            role: "Senior Citizen",
            image: "👵",
            rating: 5,
            text: "I am a senior citizen. Previously, I used to think I don't have any need for computer education but when a medical emergency came at my home and I couldn't send a medical report by mail or WhatsApp to Doctor. I realized the warning alarm of computer literacy. I have completed MS-CIT course and now I am very happy with improvement in myself. Thanks to MS-CIT."
        },
        {
            id: 4,
            name: "Rahul Sharma, Mumbai",
            role: "Working Professional",
            image: "👨‍💻",
            rating: 5,
            text: "The advanced Excel course transformed my career completely. I was struggling with data analysis in my job, but after completing this course, I became the go-to person for all Excel-related tasks in my office. The instructors were excellent and the practical approach helped me learn faster."
        },
        {
            id: 5,
            name: "Priya Singh, Delhi",
            role: "Freelancer",
            image: "👩‍💻",
            rating: 5,
            text: "Web development course was amazing! I started from zero programming knowledge and now I'm earning good money as a freelance developer. The course structure was perfect and the support from instructors was outstanding. Highly recommended for anyone wanting to start a career in IT."
        },
        {
            id: 6,
            name: "Amit Patel, Ahmedabad",
            role: "Business Owner",
            image: "👨‍💼",
            rating: 5,
            text: "I completed the digital marketing course and it helped me grow my small business tremendously. Now I can manage my social media, create advertisements, and track analytics myself. The practical projects during the course gave me real-world experience."
        }
    ];

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-slide functionality
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % getVisibleSlides());
        }, 5000);

        return () => clearInterval(interval);
    }, [testimonials.length, isMobile, isTablet]);

    const getVisibleSlides = () => {
        if (isMobile) return testimonials.length;
        if (isTablet) return Math.ceil(testimonials.length / 2);
        return Math.ceil(testimonials.length / 3);
    };

    const getTestimonialsPerSlide = () => {
        if (isMobile) return 1;
        if (isTablet) return 2;
        return 3;
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % getVisibleSlides());
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + getVisibleSlides()) % getVisibleSlides());
    };

    const styles = {
        testimonialPage: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: "'Poppins', sans-serif",
            padding: isMobile ? '40px 0' : '80px 0',
        },

        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '0 15px' : '0 20px',
        },

        header: {
            textAlign: 'center',
            marginBottom: isMobile ? '40px' : '60px',
            color: 'white',
        },

        title: {
            fontSize: isMobile ? '2.5rem' : isTablet ? '3rem' : '3.5rem',
            fontWeight: '700',
            marginBottom: '15px',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
        },

        titleUnderline: {
            width: '60px',
            height: '4px',
            background: '#ff6b35',
            margin: '0 auto 20px',
            borderRadius: '2px',
        },

        subtitle: {
            fontSize: isMobile ? '1.1rem' : '1.3rem',
            opacity: '0.9',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
        },

        sliderContainer: {
            position: 'relative',
            overflow: 'hidden',
            margin: '0 auto',
        },

        sliderWrapper: {
            display: 'flex',
            transition: 'transform 0.5s ease-in-out',
            transform: `translateX(-${currentSlide * 100}%)`,
        },

        slide: {
            minWidth: '100%',
            display: 'flex',
            gap: '25px',
            padding: '0 10px',
        },

        testimonialCard: {
            flex: `0 0 ${100 / getTestimonialsPerSlide()}%`,
            background: 'white',
            borderRadius: '15px',
            padding: isMobile ? '25px 20px' : '35px 25px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            margin: '0 10px',
            transition: 'transform 0.3s ease',
        },

        quoteIcon: {
            position: 'absolute',
            top: '20px',
            right: '25px',
            fontSize: '24px',
            color: '#667eea',
            opacity: '0.3',
        },

        testimonialContent: {
            marginBottom: '25px',
        },

        testimonialText: {
            fontSize: isMobile ? '0.95rem' : '1rem',
            lineHeight: '1.6',
            color: '#4a5568',
            fontStyle: 'italic',
            marginBottom: '20px',
        },

        rating: {
            display: 'flex',
            gap: '5px',
            marginBottom: '20px',
        },

        star: {
            color: '#ffd700',
            fontSize: '16px',
        },

        testimonialAuthor: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '20px',
        },

        authorAvatar: {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'white',
        },

        authorInfo: {
            flex: 1,
        },

        authorName: {
            fontWeight: '600',
            color: '#2d3748',
            marginBottom: '5px',
            fontSize: '1rem',
        },

        authorRole: {
            color: '#718096',
            fontSize: '0.85rem',
        },

        navigationButtons: {
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            marginTop: isMobile ? '30px' : '40px',
        },

        navButton: {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
        },

        indicators: {
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '25px',
        },

        indicator: {
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.4)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        },

        indicatorActive: {
            background: 'white',
            transform: 'scale(1.2)',
        },

        statsSection: {
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: '20px',
            marginTop: isMobile ? '50px' : '80px',
            marginBottom: '40px',
        },

        statItem: {
            textAlign: 'center',
            color: 'white',
        },

        statNumber: {
            fontSize: isMobile ? '1.8rem' : '2.5rem',
            fontWeight: '700',
            marginBottom: '8px',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
        },

        statLabel: {
            fontSize: isMobile ? '0.9rem' : '1rem',
            opacity: '0.9',
        },
    };

    const handleNavHover = (e, isEntering) => {
        if (isEntering) {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
            e.target.style.transform = 'scale(1.1)';
        } else {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
            e.target.style.transform = 'scale(1)';
        }
    };

    const handleCardHover = (e, isEntering) => {
        if (isEntering) {
            e.currentTarget.style.transform = 'translateY(-5px)';
        } else {
            e.currentTarget.style.transform = 'translateY(0)';
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <FaStar
                key={index}
                style={{
                    ...styles.star,
                    opacity: index < rating ? 1 : 0.3
                }}
            />
        ));
    };

    return (
        <div style={styles.testimonialPage}>
            <div style={styles.container}>
                {/* Header */}
                <div style={styles.header}>
                    <h1 style={styles.title}>Testimonials</h1>
                    <div style={styles.titleUnderline}></div>
                    <p style={styles.subtitle}>
                        Hear what our students say about their transformative learning experience
                    </p>
                </div>

                {/* Stats Section */}
                <div style={styles.statsSection}>
                    <div style={styles.statItem}>
                        <div style={styles.statNumber}>5000+</div>
                        <div style={styles.statLabel}>Happy Students</div>
                    </div>
                    <div style={styles.statItem}>
                        <div style={styles.statNumber}>98%</div>
                        <div style={styles.statLabel}>Success Rate</div>
                    </div>
                    <div style={styles.statItem}>
                        <div style={styles.statNumber}>4.9/5</div>
                        <div style={styles.statLabel}>Average Rating</div>
                    </div>
                    <div style={styles.statItem}>
                        <div style={styles.statNumber}>50+</div>
                        <div style={styles.statLabel}>Centers</div>
                    </div>
                </div>

                {/* Testimonials Slider */}
                <div style={styles.sliderContainer}>
                    <div style={styles.sliderWrapper}>
                        {Array.from({ length: getVisibleSlides() }, (_, slideIndex) => (
                            <div key={slideIndex} style={styles.slide}>
                                {testimonials
                                    .slice(
                                        slideIndex * getTestimonialsPerSlide(),
                                        (slideIndex + 1) * getTestimonialsPerSlide()
                                    )
                                    .map((testimonial) => (
                                        <div
                                            key={testimonial.id}
                                            style={styles.testimonialCard}
                                            onMouseEnter={(e) => handleCardHover(e, true)}
                                            onMouseLeave={(e) => handleCardHover(e, false)}
                                        >
                                            <FaQuoteLeft style={styles.quoteIcon} />
                                            
                                            <div style={styles.testimonialContent}>
                                                <div style={styles.rating}>
                                                    {renderStars(testimonial.rating)}
                                                </div>
                                                
                                                <p style={styles.testimonialText}>
                                                    {testimonial.text}
                                                </p>
                                            </div>

                                            <div style={styles.testimonialAuthor}>
                                                <div style={styles.authorAvatar}>
                                                    {testimonial.image}
                                                </div>
                                                <div style={styles.authorInfo}>
                                                    <h4 style={styles.authorName}>
                                                        {testimonial.name}
                                                    </h4>
                                                    <span style={styles.authorRole}>
                                                        {testimonial.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div style={styles.navigationButtons}>
                    <button
                        style={styles.navButton}
                        onClick={prevSlide}
                        onMouseEnter={(e) => handleNavHover(e, true)}
                        onMouseLeave={(e) => handleNavHover(e, false)}
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        style={styles.navButton}
                        onClick={nextSlide}
                        onMouseEnter={(e) => handleNavHover(e, true)}
                        onMouseLeave={(e) => handleNavHover(e, false)}
                    >
                        <FaChevronRight />
                    </button>
                </div>

                {/* Indicators */}
                <div style={styles.indicators}>
                    {Array.from({ length: getVisibleSlides() }, (_, index) => (
                        <div
                            key={index}
                            style={{
                                ...styles.indicator,
                                ...(index === currentSlide ? styles.indicatorActive : {})
                            }}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TestimonialsPage;
