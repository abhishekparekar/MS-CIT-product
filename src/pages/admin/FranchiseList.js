import React, { useEffect, useState } from 'react';
import { database } from '../../firebase/config';
import { ref, onValue, update, remove } from "firebase/database";

const FranchiseList = () => {
  const [franchises, setFranchises] = useState([]);
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const franchisesRef = ref(database, 'franchises');
    const unsubscribe = onValue(franchisesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({
          id: key,
          active: data[key].active !== undefined ? data[key].active : true,
          ...data[key]
        }));
        setFranchises(list);
      } else {
        setFranchises([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Enhanced CSS animations and responsive styles
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-60px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(60px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes shimmerWave {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }

      @keyframes gentlePulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.8;
        }
      }

      @keyframes bounceInModal {
        0% {
          opacity: 0;
          transform: scale(0.3) translateY(-100px);
        }
        50% {
          opacity: 1;
          transform: scale(1.05) translateY(0);
        }
        70% {
          transform: scale(0.95);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes glowPulse {
        0%, 100% {
          box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
        }
        50% {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
        }
      }

      .franchise-container {
        animation: slideInUp 0.8s cubic-bezier(0.25, 0.8, 0.25, 1);
      }

      .hero-section {
        animation: fadeInScale 1s ease-out;
      }

      .hero-stats-section {
        animation: slideInUp 1.2s ease-out;
        animation-delay: 0.3s;
        animation-fill-mode: both;
      }

      .franchise-card {
        animation: slideInUp 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
        animation-fill-mode: both;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        overflow: hidden;
      }

      .franchise-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s ease;
      }

      .franchise-card:hover::before {
        left: 100%;
      }

      .franchise-card:nth-child(1) { animation-delay: 0.1s; }
      .franchise-card:nth-child(2) { animation-delay: 0.2s; }
      .franchise-card:nth-child(3) { animation-delay: 0.3s; }
      .franchise-card:nth-child(4) { animation-delay: 0.4s; }
      .franchise-card:nth-child(5) { animation-delay: 0.5s; }
      .franchise-card:nth-child(6) { animation-delay: 0.6s; }

      .franchise-card:hover {
        transform: translateY(-16px) scale(1.03);
        box-shadow: 0 32px 64px rgba(0,0,0,0.25);
      }

      .franchise-card:hover .card-title {
        color: #2563eb;
        text-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
      }

      .stat-card {
        animation: bounceInModal 1.2s ease-out;
        animation-fill-mode: both;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .stat-card:nth-child(1) { animation-delay: 0.5s; }
      .stat-card:nth-child(2) { animation-delay: 0.7s; }
      .stat-card:nth-child(3) { animation-delay: 0.9s; }

      .stat-card:hover {
        transform: scale(1.12) rotate(3deg);
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      }

      .search-input {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .search-input:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.15);
        transform: scale(1.02);
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      }

      .filter-select:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.15);
        transform: scale(1.02);
      }

      .action-button {
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        overflow: hidden;
      }

      .action-button:hover {
        transform: scale(1.08) translateY(-2px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.2);
      }

      .action-button:active {
        transform: scale(0.95);
      }

      .modal-content {
        animation: bounceInModal 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .modal-close:hover {
        background: linear-gradient(135deg, #fee2e2, #fecaca);
        color: #dc2626;
        transform: scale(1.2) rotate(90deg);
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
      }

      .skeleton-shimmer {
        background: linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%);
        background-size: 200% 100%;
        animation: shimmerWave 2s infinite;
      }

      .status-badge {
        animation: gentlePulse 3s infinite;
      }

      .empty-state {
        animation: fadeInScale 1.2s ease-out 0.5s both;
      }

      .view-toggle-button.active {
        animation: glowPulse 2s infinite;
      }

      /* Enhanced Responsive Design */
      @media (max-width: 1400px) {
        .hero-title {
          font-size: 3rem !important;
        }
        
        .grid-view {
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)) !important;
        }
      }

      @media (max-width: 1024px) {
        .hero-header {
          padding: 50px 20px !important;
        }
        
        .hero-stats-section {
          padding: 40px 20px !important;
        }
        
        .hero-title {
          font-size: 2.5rem !important;
        }
        
        .hero-stats {
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
        }
      }

      @media (max-width: 768px) {
        .hero-header {
          padding: 40px 16px !important;
        }
        
        .hero-stats-section {
          padding: 30px 16px !important;
        }
        
        .hero-title {
          font-size: 2rem !important;
          margin-bottom: 16px !important;
        }
        
        .hero-subtitle {
          font-size: 1rem !important;
          margin-bottom: 32px !important;
        }
        
        .hero-stats {
          grid-template-columns: 1fr !important;
          gap: 16px !important;
        }
        
        .controls-section {
          padding: 16px !important;
          flex-direction: column !important;
          gap: 12px !important;
        }
        
        .search-controls {
          flex-direction: column !important;
          gap: 12px !important;
        }
        
        .grid-view {
          grid-template-columns: 1fr !important;
          gap: 20px !important;
        }
        
        .franchise-card {
          padding: 20px !important;
          border-radius: 16px !important;
        }
        
        .modal-content {
          width: 95% !important;
          max-height: 95vh !important;
          border-radius: 20px !important;
        }
        
        .modal-header {
          padding: 20px 20px 0 !important;
        }
        
        .modal-body {
          padding: 0 20px 20px !important;
        }
        
        .modal-footer {
          padding: 16px 20px 20px !important;
          flex-direction: column !important;
          gap: 12px !important;
        }
      }

      @media (max-width: 480px) {
        .hero-title {
          font-size: 1.8rem !important;
        }
        
        .hero-subtitle {
          font-size: 0.9rem !important;
        }
        
        .stat-card {
          padding: 16px 20px !important;
        }
        
        .main-content {
          padding: 20px 12px !important;
        }
        
        .franchise-card {
          padding: 16px !important;
        }
        
        .card-actions {
          flex-direction: column !important;
          gap: 8px !important;
        }
      }

      /* Enhanced Focus States */
      .franchise-card:focus-visible {
        outline: 3px solid #2563eb;
        outline-offset: 4px;
        box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.15);
      }

      .action-button:focus-visible {
        outline: 2px solid #2563eb;
        outline-offset: 2px;
      }

      /* Print Styles */
      @media print {
        .controls-section,
        .card-actions,
        .modal-overlay {
          display: none !important;
        }
        
        .franchise-card {
          break-inside: avoid;
          box-shadow: none !important;
          border: 1px solid #d1d5db !important;
        }
        
        .hero-header {
          background: white !important;
          color: black !important;
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

  const toggleActive = async (id, current) => {
    try {
      await update(ref(database, 'franchises/' + id), { active: !current });
    } catch (error) {
      alert('Error updating franchise status');
    }
  };

  const deleteFranchise = async (id) => {
    if(window.confirm('⚠️ Delete this franchise? This action cannot be undone.')) {
      try {
        await remove(ref(database, 'franchises/' + id));
        if (selected?.id === id) setSelected(null);
      } catch (error) {
        alert('Error deleting franchise');
      }
    }
  };

  const openPopup = (franchise) => {
    setSelected(franchise);
    setTimeout(() => setAnimating(true), 10);
  };

  const closePopup = () => {
    setAnimating(false);
    setTimeout(() => setSelected(null), 300);
  };

  const filteredFranchises = franchises
    .filter(f => {
      const matchesSearch = f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           f.city?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' ||
                           (filterStatus === 'active' && f.active) ||
                           (filterStatus === 'inactive' && !f.active);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'name':
          return a.name?.localeCompare(b.name) || 0;
        case 'date':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'status':
          return b.active - a.active;
        default:
          return 0;
      }
    });

  // Enhanced Loading State
  if (loading) return (
    <div style={styles.container} className="franchise-container">
      <div style={styles.loadingWrapper}>
        <div style={styles.loadingSpinner}></div>
        <h2 style={styles.loadingTitle}>Loading Franchise Network</h2>
        <p style={styles.loadingSubtitle}>Fetching your franchise data...</p>
      </div>
      <div style={{...styles.skeletonGrid, ...(isMobile && styles.skeletonGridMobile)}}>
        {[...Array(isMobile ? 3 : 6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );

  return (
    <div style={styles.container} className="franchise-container">
      {/* Separated Hero Header Section - Only Title and Subtitle */}
      <div style={{...styles.heroHeader, ...(isMobile && styles.heroHeaderMobile)}} className="hero-section">
        <div style={styles.heroContent}>
          <div style={styles.heroTextSection}>
            <h1 style={{...styles.heroTitle, ...(isMobile && styles.heroTitleMobile)}} className="hero-title">
              🏢 Franchise Management Hub
            </h1>
            <p style={{...styles.heroSubtitle, ...(isMobile && styles.heroSubtitleMobile)}} className="hero-subtitle">
              Comprehensive franchise network management and analytics platform
            </p>
          </div>
        </div>
      </div>

      {/* Separated Hero Stats Section */}
      <div style={{...styles.heroStatsSection, ...(isMobile && styles.heroStatsSectionMobile)}} className="hero-stats-section">
        <div style={styles.heroStatsContent}>
          <div style={{...styles.heroStats, ...(isMobile && styles.heroStatsMobile)}} className="hero-stats">
            <StatCard 
              label="Total Partners" 
              value={franchises.length} 
              color="#2563eb" 
              icon="🏢"
              subtitle="Registered"
              isMobile={isMobile}
            />
            <StatCard 
              label="Active Network" 
              value={franchises.filter(f => f.active).length} 
              color="#059669" 
              icon="✅"
              subtitle="Operating"
              isMobile={isMobile}
            />
            <StatCard 
              label="Growth Rate" 
              value="12%" 
              color="#dc2626" 
              icon="📈"
              subtitle="This Month"
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Controls Section */}
      <div style={{...styles.controlsSection, ...(isMobile && styles.controlsSectionMobile)}}>
        <div style={styles.controlsWrapper}>
          <div style={{...styles.searchControls, ...(isMobile && styles.searchControlsMobile)}}>
            <div style={{...styles.searchBox, ...(isMobile && styles.searchBoxMobile)}}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="search"
                placeholder={isMobile ? "Search franchises..." : "Search by name, email, city, or any detail..."}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{...styles.searchInput, ...(isMobile && styles.searchInputMobile)}}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  style={styles.clearSearch}
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                  className="action-button"
                >
                  ✕
                </button>
              )}
            </div>
            
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{...styles.filterSelect, ...(isMobile && styles.filterSelectMobile)}}
              className="filter-select"
            >
              <option value="all">📊 All Franchises</option>
              <option value="active">✅ Active Partners</option>
              <option value="inactive">⏸️ Inactive Partners</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{...styles.sortSelect, ...(isMobile && styles.sortSelectMobile)}}
              className="filter-select"
            >
              <option value="name">🔤 Sort by Name</option>
              <option value="date">📅 Sort by Date</option>
              <option value="status">📊 Sort by Status</option>
            </select>
          </div>

          <div style={styles.viewControls}>
            <button
              style={{
                ...styles.viewToggle,
                ...(viewMode === 'grid' ? styles.viewToggleActive : {}),
                ...(isMobile && styles.viewToggleMobile)
              }}
              onClick={() => setViewMode('grid')}
              className={`view-toggle-button ${viewMode === 'grid' ? 'active' : ''}`}
            >
              ⊞ Grid
            </button>
            <button
              style={{
                ...styles.viewToggle,
                ...(viewMode === 'list' ? styles.viewToggleActive : {}),
                ...(isMobile && styles.viewToggleMobile)
              }}
              onClick={() => setViewMode('list')}
              className={`view-toggle-button ${viewMode === 'list' ? 'active' : ''}`}
            >
              ☰ List
            </button>
          </div>
        </div>
        
        <div style={styles.resultsSection}>
          <span style={styles.resultsCounter}>
            Displaying <strong>{filteredFranchises.length}</strong> of <strong>{franchises.length}</strong> franchises
          </span>
          {searchTerm && (
            <span style={styles.searchIndicator}>
              🔍 Searching for: "<em>{searchTerm}</em>"
            </span>
          )}
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div style={{...styles.mainContent, ...(isMobile && styles.mainContentMobile)}}>
        {filteredFranchises.length === 0 ? (
          <EnhancedEmptyState searchTerm={searchTerm} isMobile={isMobile} onReset={() => {
            setSearchTerm('');
            setFilterStatus('all');
          }} />
        ) : (
          <div style={{
            ...styles.gridView,
            ...(viewMode === 'list' && styles.listView),
            ...(isMobile && styles.gridViewMobile)
          }}>
            {filteredFranchises.map((franchise, index) => (
              <EnhancedFranchiseCard
                key={franchise.id}
                franchise={franchise}
                onView={openPopup}
                onToggleActive={toggleActive}
                onDelete={deleteFranchise}
                index={index}
                viewMode={viewMode}
                isMobile={isMobile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {selected && (
        <EnhancedFranchiseModal
          franchise={selected}
          isOpen={animating}
          onClose={closePopup}
          onToggleActive={toggleActive}
          onDelete={deleteFranchise}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

// Enhanced Skeleton Card Component
const SkeletonCard = () => (
  <div style={styles.skeletonCard}>
    <div style={styles.skeletonAvatar} className="skeleton-shimmer"></div>
    <div style={styles.skeletonHeader}>
      <div style={styles.skeletonTitle} className="skeleton-shimmer"></div>
      <div style={styles.skeletonBadge} className="skeleton-shimmer"></div>
    </div>
    <div style={styles.skeletonMeta} className="skeleton-shimmer"></div>
    <div style={styles.skeletonBody}>
      <div style={styles.skeletonText} className="skeleton-shimmer"></div>
      <div style={styles.skeletonText} className="skeleton-shimmer"></div>
      <div style={styles.skeletonTextShort} className="skeleton-shimmer"></div>
    </div>
    <div style={styles.skeletonActions}>
      <div style={styles.skeletonButton} className="skeleton-shimmer"></div>
      <div style={styles.skeletonButton} className="skeleton-shimmer"></div>
    </div>
  </div>
);

// Enhanced Stat Card Component
const StatCard = ({ label, value, color, icon, subtitle, isMobile }) => (
  <div style={{
    ...styles.statCard,
    ...(isMobile && styles.statCardMobile),
    borderLeft: `6px solid ${color}`
  }} className="stat-card">
    <div style={styles.statCardContent}>
      <div style={styles.statLeft}>
        <div style={{...styles.statValue, color}}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
        <div style={styles.statSubtitle}>{subtitle}</div>
      </div>
      <div style={{...styles.statIconContainer, backgroundColor: `${color}20`}}>
        <span style={{...styles.statIcon, color}}>{icon}</span>
      </div>
    </div>
  </div>
);

// Enhanced Empty State Component
const EnhancedEmptyState = ({ searchTerm, isMobile, onReset }) => (
  <div style={{...styles.emptyState, ...(isMobile && styles.emptyStateMobile)}} className="empty-state">
    <div style={styles.emptyIconContainer}>
      <span style={styles.emptyIcon}>{searchTerm ? '🔍' : '🏢'}</span>
    </div>
    <h3 style={{...styles.emptyTitle, ...(isMobile && styles.emptyTitleMobile)}}>
      {searchTerm ? 'No matches found' : 'No franchises registered yet'}
    </h3>
    <p style={{...styles.emptyText, ...(isMobile && styles.emptyTextMobile)}}>
      {searchTerm 
        ? `We couldn't find any franchises matching "${searchTerm}". Try adjusting your search terms or filters.`
        : 'Ready to expand your network? Add your first franchise partner to get started with building your business empire.'
      }
    </p>
    <div style={styles.emptyActions}>
      {searchTerm ? (
        <button style={styles.resetButton} onClick={onReset} className="action-button">
          🔄 Clear Search & Filters
        </button>
      ) : (
        <button style={styles.addButton} className="action-button">
          ➕ Add First Franchise
        </button>
      )}
    </div>
  </div>
);

// Enhanced Franchise Card Component
const EnhancedFranchiseCard = ({ franchise, onView, onToggleActive, onDelete, index, viewMode, isMobile }) => (
  <div 
    style={{
      ...styles.franchiseCard,
      ...(viewMode === 'list' && styles.franchiseCardList),
      ...(isMobile && styles.franchiseCardMobile),
      animationDelay: `${index * 0.1}s`
    }} 
    onClick={() => onView(franchise)}
    className="franchise-card"
    tabIndex={0}
    role="button"
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onView(franchise);
      }
    }}
  >
    <div style={styles.cardHeader}>
      <div style={styles.cardAvatar}>
        {franchise.name?.charAt(0)?.toUpperCase() || 'F'}
      </div>
      <div style={styles.cardHeaderContent}>
        <div style={styles.cardTitleRow}>
          <h3 style={{...styles.cardTitle, ...(isMobile && styles.cardTitleMobile)}} className="card-title">
            {franchise.name}
          </h3>
          <EnhancedStatusBadge active={franchise.active} isMobile={isMobile} />
        </div>
        <div style={styles.cardMeta}>
          <span style={styles.metaItem}>
            📅 {franchise.createdAt ? new Date(franchise.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) : 'Recently added'}
          </span>
          {franchise.city && (
            <span style={styles.metaItem}>📍 {franchise.city}</span>
          )}
        </div>
      </div>
    </div>

    <div style={styles.cardBody}>
      <div style={styles.infoGrid}>
        <InfoItem icon="📧" label="Email" value={franchise.email} isMobile={isMobile} />
        <InfoItem icon="📱" label="Phone" value={franchise.phone} isMobile={isMobile} />
        {franchise.website && (
          <InfoItem icon="🌐" label="Website" value={franchise.website} isMobile={isMobile} />
        )}
        {franchise.address && (
          <InfoItem icon="🏠" label="Address" value={franchise.address} isMobile={isMobile} />
        )}
      </div>
    </div>

    <div style={{...styles.cardActions, ...(isMobile && styles.cardActionsMobile)}} onClick={e => e.stopPropagation()}>
      <button
        style={{
          ...styles.actionButton,
          ...(isMobile && styles.actionButtonMobile),
          backgroundColor: franchise.active ? '#fef2f2' : '#f0fdf4',
          color: franchise.active ? '#dc2626' : '#16a34a',
          borderColor: franchise.active ? '#fecaca' : '#bbf7d0'
        }}
        onClick={() => onToggleActive(franchise.id, franchise.active)}
        className="action-button"
        title={franchise.active ? 'Deactivate franchise' : 'Activate franchise'}
      >
        {franchise.active ? '⏸️ Deactivate' : '▶️ Activate'}
      </button>
      <button
        style={{
          ...styles.dangerButton,
          ...(isMobile && styles.dangerButtonMobile)
        }}
        onClick={() => onDelete(franchise.id)}
        className="action-button"
        title="Delete franchise permanently"
      >
        🗑️ Remove
      </button>
    </div>
  </div>
);

// Enhanced Status Badge Component
const EnhancedStatusBadge = ({ active, isMobile }) => (
  <span style={{
    ...styles.statusBadge,
    ...(isMobile && styles.statusBadgeMobile),
    backgroundColor: active ? '#f0fdf4' : '#fef2f2',
    color: active ? '#16a34a' : '#dc2626',
    border: `2px solid ${active ? '#bbf7d0' : '#fecaca'}`
  }} className="status-badge">
    {active ? '✅ Active' : '⏸️ Inactive'}
  </span>
);

// Enhanced Info Item Component
const InfoItem = ({ icon, label, value, isMobile }) => (
  <div style={{...styles.infoItem, ...(isMobile && styles.infoItemMobile)}}>
    <span style={styles.infoIcon}>{icon}</span>
    <div style={styles.infoContent}>
      <span style={styles.infoLabel}>{label}:</span>
      <span style={styles.infoValue}>{value || 'Not provided'}</span>
    </div>
  </div>
);

// Enhanced Modal Component
const EnhancedFranchiseModal = ({ franchise, isOpen, onClose, onToggleActive, onDelete, isMobile }) => (
  <div
    style={{
      ...styles.modalOverlay,
      opacity: isOpen ? 1 : 0,
      visibility: isOpen ? 'visible' : 'hidden'
    }}
    onClick={onClose}
  >
    <div
      style={{
        ...styles.modalContent,
        ...(isMobile && styles.modalContentMobile),
        transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(-20px)',
        opacity: isOpen ? 1 : 0
      }}
      onClick={e => e.stopPropagation()}
      className="modal-content"
    >
      <div style={{...styles.modalHeader, ...(isMobile && styles.modalHeaderMobile)}}>
        <div style={styles.modalHeaderContent}>
          <div style={styles.modalAvatar}>
            {franchise.name?.charAt(0)?.toUpperCase() || 'F'}
          </div>
          <div>
            <h2 style={{...styles.modalTitle, ...(isMobile && styles.modalTitleMobile)}}>
              {franchise.name}
            </h2>
            <EnhancedStatusBadge active={franchise.active} isMobile={isMobile} />
          </div>
        </div>
        <button 
          style={styles.modalClose} 
          onClick={onClose}
          className="modal-close"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>

      <div style={{...styles.modalBody, ...(isMobile && styles.modalBodyMobile)}}>
        <div style={{...styles.modalInfoGrid, ...(isMobile && styles.modalInfoGridMobile)}}>
          <DetailItem icon="📧" label="Email Address" value={franchise.email} isMobile={isMobile} />
          <DetailItem icon="📱" label="Phone Number" value={franchise.phone} isMobile={isMobile} />
          <DetailItem icon="🏠" label="Street Address" value={franchise.address} isMobile={isMobile} />
          <DetailItem icon="🌆" label="City" value={franchise.city} isMobile={isMobile} />
          <DetailItem icon="📍" label="State/Province" value={franchise.state} isMobile={isMobile} />
          <DetailItem icon="📮" label="Postal Code" value={franchise.zip} isMobile={isMobile} />
          <DetailItem 
            icon="🌐" 
            label="Website URL" 
            value={franchise.website}
            isLink={true}
            isMobile={isMobile}
          />
          <DetailItem 
            icon="📅" 
            label="Registration Date" 
            value={franchise.createdAt ? new Date(franchise.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Date not available'} 
            isMobile={isMobile}
          />
        </div>
      </div>

      <div style={{...styles.modalFooter, ...(isMobile && styles.modalFooterMobile)}}>
        <button
          style={{
            ...styles.modalActionButton,
            ...(isMobile && styles.modalActionButtonMobile),
            backgroundColor: franchise.active ? '#dc2626' : '#16a34a'
          }}
          onClick={() => onToggleActive(franchise.id, franchise.active)}
          className="action-button"
        >
          {franchise.active ? '⏸️ Deactivate Partner' : '▶️ Activate Partner'}
        </button>
        <button
          style={{
            ...styles.modalDangerButton,
            ...(isMobile && styles.modalDangerButtonMobile)
          }}
          onClick={() => onDelete(franchise.id)}
          className="action-button"
        >
          🗑️ Remove Forever
        </button>
      </div>
    </div>
  </div>
);

// Enhanced Detail Item Component
const DetailItem = ({ icon, label, value, isLink, isMobile }) => (
  <div style={{...styles.detailItem, ...(isMobile && styles.detailItemMobile)}}>
    <div style={styles.detailIconContainer}>
      <span style={styles.detailIcon}>{icon}</span>
    </div>
    <div style={styles.detailContent}>
      <div style={styles.detailLabel}>{label}</div>
      <div style={{...styles.detailValue, ...(isMobile && styles.detailValueMobile)}}>
        {isLink && value ? (
          <a href={value.startsWith('http') ? value : `https://${value}`} 
             target="_blank" 
             rel="noopener noreferrer" 
             style={styles.detailLink}>
            {value} 🔗
          </a>
        ) : (
          value || <span style={styles.notProvided}>Not provided</span>
        )}
      </div>
    </div>
  </div>
);

// Enhanced Comprehensive Styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    position: 'relative',
  },
  
  loadingWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    textAlign: 'center',
  },
  
  loadingSpinner: {
    width: '60px',
    height: '60px',
    border: '6px solid #e2e8f0',
    borderTop: '6px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '24px',
  },
  
  loadingTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  
  loadingSubtitle: {
    fontSize: '1rem',
    color: '#64748b',
    margin: 0,
  },

  // Hero Header Styles (Title and Subtitle Only)
  heroHeader: {
    background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 30%, #3b82f6 70%, #60a5fa 100%)',
    color: 'white',
    padding: '80px 32px 60px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroHeaderMobile: {
    padding: '60px 20px 40px',
  },
  heroContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
  },
  heroTextSection: {
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: '4rem',
    fontWeight: '900',
    margin: '0 0 20px 0',
    textShadow: '0 4px 16px rgba(0,0,0,0.3)',
    letterSpacing: '-0.02em',
    lineHeight: '1.1',
  },
  heroTitleMobile: {
    fontSize: '2.5rem',
    marginBottom: '16px',
  },
  heroSubtitle: {
    fontSize: '1.375rem',
    opacity: '0.95',
    margin: '0',
    fontWeight: '400',
    letterSpacing: '0.01em',
    lineHeight: '1.5',
  },
  heroSubtitleMobile: {
    fontSize: '1.1rem',
  },

  // Separated Hero Stats Section
  heroStatsSection: {
    background: 'linear-gradient(180deg, #3b82f6 0%, #f8fafc 100%)',
    padding: '60px 32px 80px',
    position: 'relative',
  },
  heroStatsSectionMobile: {
    padding: '40px 20px 60px',
  },
  heroStatsContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
  },
  heroStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '32px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  heroStatsMobile: {
    gridTemplateColumns: '1fr',
    gap: '20px',
  },

  // Stat Card Styles
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(12px)',
    borderRadius: '20px',
    padding: '32px',
    textAlign: 'left',
    border: '2px solid rgba(255,255,255,0.3)',
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  },
  statCardMobile: {
    padding: '24px',
  },
  statCardContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
  },
  statLeft: {
    flex: 1,
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: '900',
    display: 'block',
    marginBottom: '8px',
    lineHeight: '1',
  },
  statLabel: {
    fontSize: '1rem',
    opacity: '0.8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
    color: '#1e293b',
  },
  statSubtitle: {
    fontSize: '0.875rem',
    opacity: '0.7',
    fontWeight: '400',
    color: '#64748b',
  },
  statIconContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: '2rem',
  },

  // Controls Section Styles
  controlsSection: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    backdropFilter: 'blur(16px)',
    borderBottom: '2px solid #e2e8f0',
    padding: '24px 32px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  controlsSectionMobile: {
    padding: '20px 16px',
  },
  controlsWrapper: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap',
  },
  searchControls: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flex: 1,
  },
  searchControlsMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '12px',
  },
  searchBox: {
    position: 'relative',
    flex: 1,
    minWidth: '300px',
  },
  searchBoxMobile: {
    minWidth: 'auto',
  },
  searchIcon: {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '20px',
    opacity: '0.6',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '18px 60px 18px 56px',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    outline: 'none',
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
    fontWeight: '500',
  },
  searchInputMobile: {
    padding: '16px 50px 16px 50px',
  },
  clearSearch: {
    position: 'absolute',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: '#fee2e2',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#dc2626',
    padding: '6px',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSelect: {
    padding: '18px 24px',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '200px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
    fontWeight: '500',
  },
  filterSelectMobile: {
    minWidth: 'auto',
  },
  sortSelect: {
    padding: '18px 24px',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '180px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
    fontWeight: '500',
  },
  sortSelectMobile: {
    minWidth: 'auto',
  },
  viewControls: {
    display: 'flex',
    gap: '8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '12px',
    padding: '4px',
  },
  viewToggle: {
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: 'transparent',
    color: '#64748b',
  },
  viewToggleMobile: {
    padding: '10px 16px',
    fontSize: '12px',
  },
  viewToggleActive: {
    backgroundColor: '#fff',
    color: '#2563eb',
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
  },
  resultsSection: {
    maxWidth: '1400px',
    margin: '16px auto 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  resultsCounter: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '600',
  },
  searchIndicator: {
    fontSize: '14px',
    color: '#2563eb',
    fontWeight: '500',
    backgroundColor: '#eff6ff',
    padding: '6px 12px',
    borderRadius: '8px',
  },

  // Main Content Styles
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '48px 32px',
  },
  mainContentMobile: {
    padding: '32px 16px',
  },

  // Grid Styles
  gridView: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '32px',
  },
  gridViewMobile: {
    gridTemplateColumns: '1fr',
    gap: '24px',
  },
  listView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  // Enhanced Franchise Card Styles
  franchiseCard: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '32px',
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    border: '2px solid #f1f5f9',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  franchiseCardMobile: {
    padding: '24px',
    borderRadius: '20px',
  },
  franchiseCardList: {
    display: 'flex',
    alignItems: 'center',
    padding: '24px 32px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '24px',
  },
  cardAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    backgroundColor: '#2563eb',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '700',
    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
  },
  cardHeaderContent: {
    flex: 1,
  },
  cardTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
    gap: '16px',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1e293b',
    margin: 0,
    lineHeight: '1.3',
  },
  cardTitleMobile: {
    fontSize: '1.3rem',
  },
  cardMeta: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  metaItem: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: '500',
  },
  cardBody: {
    marginBottom: '28px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  infoItemMobile: {
    padding: '10px 12px',
  },
  infoIcon: {
    fontSize: '18px',
    minWidth: '20px',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '2px',
  },
  infoValue: {
    fontSize: '0.9rem',
    color: '#1e293b',
    fontWeight: '500',
  },
  statusBadge: {
    padding: '8px 16px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusBadgeMobile: {
    padding: '6px 12px',
    fontSize: '0.75rem',
  },
  cardActions: {
    display: 'flex',
    gap: '12px',
  },
  cardActionsMobile: {
    flexDirection: 'column',
    gap: '10px',
  },
  actionButton: {
    flex: 1,
    padding: '14px 20px',
    border: '2px solid',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  actionButtonMobile: {
    padding: '12px 16px',
    fontSize: '0.85rem',
  },
  dangerButton: {
    flex: 1,
    padding: '14px 20px',
    border: '2px solid #fecaca',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  dangerButtonMobile: {
    padding: '12px 16px',
    fontSize: '0.85rem',
  },

  // Enhanced Empty State Styles
  emptyState: {
    textAlign: 'center',
    padding: '100px 32px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  emptyStateMobile: {
    padding: '80px 20px',
  },
  emptyIconContainer: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 32px',
    border: '4px solid #e2e8f0',
  },
  emptyIcon: {
    fontSize: '3rem',
    opacity: '0.7',
  },
  emptyTitle: {
    fontSize: '1.875rem',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '16px',
  },
  emptyTitleMobile: {
    fontSize: '1.5rem',
  },
  emptyText: {
    fontSize: '1.125rem',
    lineHeight: '1.7',
    color: '#64748b',
    marginBottom: '32px',
  },
  emptyTextMobile: {
    fontSize: '1rem',
  },
  emptyActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
  },
  resetButton: {
    padding: '16px 32px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
  },
  addButton: {
    padding: '16px 32px',
    backgroundColor: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(22, 163, 74, 0.3)',
  },

  // Enhanced Modal Styles
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    transition: 'all 0.3s ease',
    padding: '20px',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '28px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 40px 80px rgba(0,0,0,0.3)',
    border: '2px solid #e2e8f0',
  },
  modalContentMobile: {
    borderRadius: '24px',
    maxHeight: '95vh',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '40px 40px 0',
    marginBottom: '32px',
  },
  modalHeaderMobile: {
    padding: '28px 24px 0',
    marginBottom: '24px',
  },
  modalHeaderContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  modalAvatar: {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    backgroundColor: '#2563eb',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: '700',
    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
  },
  modalTitle: {
    fontSize: '2.25rem',
    fontWeight: '900',
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  modalTitleMobile: {
    fontSize: '1.75rem',
  },
  modalClose: {
    backgroundColor: '#f8fafc',
    border: 'none',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    transition: 'all 0.3s ease',
  },
  modalBody: {
    padding: '0 40px 40px',
  },
  modalBodyMobile: {
    padding: '0 24px 24px',
  },
  modalInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '28px',
  },
  modalInfoGridMobile: {
    gridTemplateColumns: '1fr',
    gap: '24px',
  },
  detailItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    border: '2px solid #e2e8f0',
  },
  detailItemMobile: {
    gap: '12px',
    padding: '16px',
  },
  detailIconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  detailIcon: {
    fontSize: '20px',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
    fontWeight: '700',
  },
  detailValue: {
    fontSize: '1.1rem',
    color: '#1e293b',
    fontWeight: '600',
    lineHeight: '1.4',
  },
  detailValueMobile: {
    fontSize: '1rem',
  },
  detailLink: {
    color: '#2563eb',
    textDecoration: 'none',
    transition: 'color 0.3s ease',
    fontWeight: '600',
  },
  notProvided: {
    color: '#94a3b8',
    fontStyle: 'italic',
    fontWeight: '400',
  },
  modalFooter: {
    padding: '32px 40px 40px',
    borderTop: '2px solid #f1f5f9',
    display: 'flex',
    gap: '20px',
  },
  modalFooterMobile: {
    padding: '24px 24px 28px',
    flexDirection: 'column',
  },
  modalActionButton: {
    flex: 1,
    padding: '18px 28px',
    border: 'none',
    borderRadius: '16px',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#fff',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  },
  modalActionButtonMobile: {
    padding: '16px 24px',
    fontSize: '1rem',
  },
  modalDangerButton: {
    flex: 1,
    padding: '18px 28px',
    border: 'none',
    borderRadius: '16px',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#fff',
    cursor: 'pointer',
    backgroundColor: '#dc2626',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)',
  },
  modalDangerButtonMobile: {
    padding: '16px 24px',
    fontSize: '1rem',
  },

  // Enhanced Skeleton Loading Styles
  skeletonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '32px',
    maxWidth: '1400px',
    margin: '48px auto',
    padding: '0 32px',
  },
  skeletonGridMobile: {
    gridTemplateColumns: '1fr',
    gap: '24px',
    padding: '0 16px',
  },
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    border: '2px solid #f1f5f9',
  },
  skeletonAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    backgroundColor: '#e2e8f0',
    marginBottom: '20px',
  },
  skeletonHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  skeletonTitle: {
    height: '24px',
    width: '60%',
    backgroundColor: '#e2e8f0',
    borderRadius: '6px',
  },
  skeletonBadge: {
    height: '20px',
    width: '80px',
    backgroundColor: '#f1f5f9',
    borderRadius: '10px',
  },
  skeletonMeta: {
    height: '16px',
    width: '40%',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    marginBottom: '24px',
  },
  skeletonBody: {
    marginBottom: '28px',
  },
  skeletonText: {
    height: '16px',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
    marginBottom: '12px',
  },
  skeletonTextShort: {
    height: '16px',
    width: '70%',
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
  },
  skeletonActions: {
    display: 'flex',
    gap: '12px',
  },
  skeletonButton: {
    height: '44px',
    flex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: '12px',
  },
};

// Add spin animation for loading spinner
if (typeof document !== 'undefined') {
  const spinStyle = document.createElement('style');
  spinStyle.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(spinStyle);
}

export default FranchiseList;
