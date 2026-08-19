import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/config'; // Add this import
import { ref, onValue } from "firebase/database"; // Add this import

const Gallery = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedItem, setSelectedItem] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024 && window.innerWidth > 768);
    const [galleryItems, setGalleryItems] = useState([]); // Add this state
    const [loading, setLoading] = useState(true); // Add this state

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            setIsTablet(window.innerWidth <= 1024 && window.innerWidth > 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Add Firebase data fetching
    useEffect(() => {
        const galleryRef = ref(database, 'gallery');
        const unsubscribe = onValue(galleryRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const items = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                })).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date
                setGalleryItems(items);
            } else {
                setGalleryItems([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const styles = {
        // ... (keep all existing styles)
        galleryContainer: {
            minHeight: '100vh',
            background: '#f8fafc',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            paddingTop: '80px',
        },

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

        sectionTitle: {
            fontSize: isMobile ? '1.8rem' : '2.2rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '15px',
            textAlign: 'center',
        },

        sectionSubtitle: {
            fontSize: isMobile ? '1rem' : '1.1rem',
            color: '#64748b',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto 40px',
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

        galleryGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: isMobile ? '20px' : '25px',
        },

        galleryItem: {
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            border: '1px solid #e2e8f0',
        },

        galleryImage: {
            width: '100%',
            height: isMobile ? '200px' : '220px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: isMobile ? '3rem' : '4rem',
            position: 'relative',
            backgroundImage: (item) => item.imageUrl ? `url(${item.imageUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        },

        realImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
        },

        galleryOverlay: {
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: '0',
            transition: 'opacity 0.3s ease',
        },

        playButton: {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb',
            fontSize: '1.2rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
        },

        galleryContent: {
            padding: isMobile ? '18px' : '20px',
        },

        galleryTitle: {
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '8px',
            lineHeight: '1.3',
        },

        galleryDescription: {
            color: '#64748b',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            marginBottom: '12px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
        },

        galleryMeta: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#94a3b8',
            fontSize: '0.8rem',
        },

        categoryBadge: {
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#2563eb',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.7rem',
            fontWeight: '600',
            textTransform: 'uppercase',
        },

        // Loading styles
        loadingGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: isMobile ? '20px' : '25px',
        },

        loadingCard: {
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0',
        },

        loadingSkeleton: {
            width: '100%',
            height: isMobile ? '200px' : '220px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite',
        },

        loadingContent: {
            padding: '20px',
        },

        loadingText: {
            height: '20px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite',
            borderRadius: '4px',
            marginBottom: '10px',
        },

        // Modal styles (keep existing)
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
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
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
        },

        modalClose: {
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            color: '#64748b',
            cursor: 'pointer',
            padding: '5px',
        },

        modalBody: {
            padding: isMobile ? '20px' : '25px',
        },

        modalImage: {
            width: '100%',
            height: '300px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '4rem',
            marginBottom: '20px',
            overflow: 'hidden',
        },

        modalRealImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
        },

        modalDescription: {
            color: '#475569',
            lineHeight: '1.6',
            fontSize: '1rem',
            marginBottom: '20px',
        },

        modalMeta: {
            display: 'flex',
            gap: '20px',
            padding: '15px',
            background: '#f8fafc',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#64748b',
            flexWrap: 'wrap',
        },

        statsSection: {
            background: 'white',
            padding: isMobile ? '50px 0' : '60px 0',
            borderTop: '1px solid #e2e8f0',
        },

        statsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '25px' : '30px',
            textAlign: 'center',
        },

        statItem: {
            padding: '20px',
        },

        statNumber: {
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '800',
            color: '#2563eb',
            marginBottom: '8px',
        },

        statLabel: {
            fontSize: '0.9rem',
            color: '#64748b',
            fontWeight: '500',
        },

        emptyState: {
            textAlign: 'center',
            padding: '60px 20px',
            color: '#64748b',
            fontSize: '1.1rem',
        },
    };

    const categories = [
        { key: 'all', label: 'All Media' },
        { key: 'classes', label: 'Classes' },
        { key: 'events', label: 'Events' },
        { key: 'facilities', label: 'Facilities' }
    ];

    const filteredItems = activeCategory === 'all'
        ? galleryItems
        : galleryItems.filter(item => item.category === activeCategory);

    const handleCardHover = (e, isHovering) => {
        if (isHovering) {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
            const overlay = e.currentTarget.querySelector('.gallery-overlay');
            if (overlay) overlay.style.opacity = '1';
        } else {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
            const overlay = e.currentTarget.querySelector('.gallery-overlay');
            if (overlay) overlay.style.opacity = '0';
        }
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };

    const closeModal = () => {
        setSelectedItem(null);
    };

    // Calculate stats from actual data
    const stats = {
        photos: galleryItems.filter(item => item.type === 'image').length,
        videos: galleryItems.filter(item => item.type === 'video').length,
        events: galleryItems.filter(item => item.category === 'events').length,
        facilities: galleryItems.filter(item => item.category === 'facilities').length,
    };

    return (
        <div style={styles.galleryContainer}>
            {/* Hero Section */}
            <section style={styles.heroSection}>
                <div style={styles.heroOverlay}></div>
                <div style={styles.container}>
                    <div style={styles.breadcrumb}>Home • Gallery</div>
                    <h1 style={styles.heroTitle}>Photo & Video Gallery</h1>
                    <p style={styles.heroSubtitle}>
                        Explore our campus facilities, classroom activities, and student achievements 
                        through our comprehensive media gallery.
                    </p>
                </div>
            </section>

            {/* Gallery Section */}
            <section style={styles.section}>
                <div style={styles.container}>
                    <h2 style={styles.sectionTitle}>Our Campus Life</h2>
                    <p style={styles.sectionSubtitle}>
                        Get a glimpse of our modern facilities, engaging classes, and vibrant campus events
                    </p>

                    {/* Filter Tabs */}
                    <div style={styles.filterTabs}>
                        {categories.map((category) => (
                            <div
                                key={category.key}
                                style={{
                                    ...styles.filterTab,
                                    ...(activeCategory === category.key ? styles.activeFilterTab : {})
                                }}
                                onClick={() => setActiveCategory(category.key)}
                                onMouseEnter={(e) => {
                                    if (activeCategory !== category.key) {
                                        e.target.style.borderColor = '#2563eb';
                                        e.target.style.color = '#2563eb';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeCategory !== category.key) {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.color = '#64748b';
                                    }
                                }}
                            >
                                {category.label}
                            </div>
                        ))}
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div style={styles.loadingGrid}>
                            {[...Array(6)].map((_, index) => (
                                <div key={index} style={styles.loadingCard}>
                                    <div style={styles.loadingSkeleton}></div>
                                    <div style={styles.loadingContent}>
                                        <div style={{...styles.loadingText, width: '80%'}}></div>
                                        <div style={{...styles.loadingText, width: '100%', height: '60px'}}></div>
                                        <div style={{...styles.loadingText, width: '60%', height: '16px'}}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Gallery Grid */}
                    {!loading && (
                        <div style={styles.galleryGrid}>
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    style={styles.galleryItem}
                                    onMouseEnter={(e) => handleCardHover(e, true)}
                                    onMouseLeave={(e) => handleCardHover(e, false)}
                                    onClick={() => handleItemClick(item)}
                                >
                                    <div style={styles.galleryImage}>
                                        {item.imageUrl || item.videoUrl ? (
                                            item.type === 'image' ? (
                                                <img 
                                                    src={item.imageUrl} 
                                                    alt={item.title}
                                                    style={styles.realImage}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = `<span style="font-size: 4rem;">${item.icon}</span>`;
                                                    }}
                                                />
                                            ) : (
                                                <div style={{position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                    <span style={{fontSize: '4rem'}}>{item.icon}</span>
                                                    <div style={{position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.7rem'}}>
                                                        VIDEO
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <span>{item.icon}</span>
                                        )}
                                        <div style={styles.categoryBadge}>
                                            {item.category}
                                        </div>
                                        <div
                                            className="gallery-overlay"
                                            style={styles.galleryOverlay}
                                        >
                                            <div style={styles.playButton}>
                                                {item.type === 'video' ? '▶' : '🔍'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={styles.galleryContent}>
                                        <h3 style={styles.galleryTitle}>{item.title}</h3>
                                        <p style={styles.galleryDescription}>{item.description}</p>
                                        <div style={styles.galleryMeta}>
                                            <span>{item.type === 'video' ? '📹' : '📷'}</span>
                                            <span>{item.type === 'video' ? 'Video' : 'Photo'}</span>
                                            <span>•</span>
                                            <span>{new Date(item.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && filteredItems.length === 0 && (
                        <div style={styles.emptyState}>
                            {galleryItems.length === 0 
                                ? "No gallery items found. Please add some content from the admin panel."
                                : "No media found in this category. Please try a different filter."
                            }
                        </div>
                    )}
                </div>
            </section>

            {/* Stats Section */}
            <section style={styles.statsSection}>
                <div style={styles.container}>
                    <h2 style={styles.sectionTitle}>Gallery Statistics</h2>
                    <div style={styles.statsGrid}>
                        <div style={styles.statItem}>
                            <div style={styles.statNumber}>{stats.photos}</div>
                            <div style={styles.statLabel}>Photos</div>
                        </div>
                        <div style={styles.statItem}>
                            <div style={styles.statNumber}>{stats.videos}</div>
                            <div style={styles.statLabel}>Videos</div>
                        </div>
                        <div style={styles.statItem}>
                            <div style={styles.statNumber}>{stats.events}</div>
                            <div style={styles.statLabel}>Events Covered</div>
                        </div>
                        <div style={styles.statItem}>
                            <div style={styles.statNumber}>{stats.facilities}</div>
                            <div style={styles.statLabel}>Facilities Showcased</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal for Gallery Item Detail */}
            {selectedItem && (
                <div style={styles.modal} onClick={closeModal}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}>{selectedItem.title}</h3>
                            <button 
                                style={styles.modalClose} 
                                onClick={closeModal}
                                onMouseEnter={(e) => e.target.style.color = '#2563eb'}
                                onMouseLeave={(e) => e.target.style.color = '#64748b'}
                            >
                                ✕
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.modalImage}>
                                {selectedItem.imageUrl && selectedItem.type === 'image' ? (
                                    <img 
                                        src={selectedItem.imageUrl} 
                                        alt={selectedItem.title}
                                        style={styles.modalRealImage}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = `<span style="font-size: 4rem;">${selectedItem.icon}</span>`;
                                        }}
                                    />
                                ) : selectedItem.videoUrl && selectedItem.type === 'video' ? (
                                    <video 
                                        controls 
                                        style={styles.modalRealImage}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = `<span style="font-size: 4rem;">${selectedItem.icon}</span>`;
                                        }}
                                    >
                                        <source src={selectedItem.videoUrl} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : (
                                    <span>{selectedItem.icon}</span>
                                )}
                            </div>
                            <p style={styles.modalDescription}>
                                {selectedItem.description}
                            </p>
                            <div style={styles.modalMeta}>
                                <div>
                                    <strong>Type:</strong> {selectedItem.type === 'video' ? 'Video' : 'Photo'}
                                </div>
                                <div>
                                    <strong>Category:</strong> {selectedItem.category}
                                </div>
                                <div>
                                    <strong>Date:</strong> {new Date(selectedItem.date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Add loading animation
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes loading {
            0% {
                background-position: -200% 0;
            }
            100% {
                background-position: 200% 0;
            }
        }
    `;
    document.head.appendChild(style);
}

export default Gallery;
