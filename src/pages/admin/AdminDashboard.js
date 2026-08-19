import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/config';
import { ref, onValue } from "firebase/database";

// Enhanced Donut Chart Component with modern animations
const PieChart = ({ data, title, size = 220 }) => {
  let cumulativePercentage = 0;
  const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  return (
    <div style={styles.chartWrapper} className="chart-wrapper">
      <div style={styles.donutContainer}>
        <svg width={size} height={size} style={styles.pieChart} className="donut-chart">
          {/* Background circle */}
          <circle
            cx={size/2}
            cy={size/2}
            r={size/2 - 25}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="25"
          />
          
          {/* Data segments */}
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const circumference = 2 * Math.PI * (size/2 - 25);
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const rotation = (cumulativePercentage / 100) * 360 - 90;
            
            cumulativePercentage += percentage;
            
            return (
              <circle
                key={index}
                cx={size/2}
                cy={size/2}
                r={size/2 - 25}
                fill="none"
                stroke={`url(#gradient-${index})`}
                strokeWidth="25"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                transform={`rotate(${rotation} ${size/2} ${size/2})`}
                className="donut-segment"
                style={{
                  transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
                }}
              />
            );
          })}
          
          {/* Gradients definition */}
          <defs>
            {colors.map((color, index) => (
              <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="1"/>
                <stop offset="100%" stopColor={color} stopOpacity="0.7"/>
              </linearGradient>
            ))}
          </defs>
          
          {/* Center content */}
          <circle
            cx={size/2}
            cy={size/2}
            r="45"
            fill="url(#centerGradient)"
          />
          <defs>
            <radialGradient id="centerGradient">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
              <stop offset="100%" stopColor="#f8fafc" stopOpacity="1"/>
            </radialGradient>
          </defs>
          
          <text
            x={size/2}
            y={size/2 - 8}
            textAnchor="middle"
            style={{
              fontSize: '16px',
              fontWeight: '800',
              fill: '#1e293b'
            }}
          >
            Total
          </text>
          <text
            x={size/2}
            y={size/2 + 12}
            textAnchor="middle"
            style={{
              fontSize: '14px',
              fontWeight: '700',
              fill: '#667eea'
            }}
          >
            ₹{(total/100000).toFixed(1)}L
          </text>
        </svg>
      </div>
      
      <div style={styles.modernLegend}>
        {data.map((item, index) => (
          <div key={index} style={styles.legendItem} className="legend-item">
            <div style={styles.legendHeader}>
              <div style={styles.legendLeft}>
                <div style={{
                  ...styles.legendDot, 
                  background: `linear-gradient(45deg, ${colors[index % colors.length]}, ${colors[(index + 1) % colors.length]})`
                }}></div>
                <span style={styles.legendLabel}>{item.label}</span>
              </div>
              <div style={styles.legendRight}>
                <span style={styles.legendValue}>₹{(item.value/1000).toFixed(0)}K</span>
                <span style={styles.legendPercent}>
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  background: `linear-gradient(90deg, ${colors[index % colors.length]}, ${colors[(index + 1) % colors.length]})`,
                  width: `${(item.value / total) * 100}%`
                }}
                className="progress-fill"
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced 3D Bar Chart Component with gradients
const BarChart = ({ data, title, height = 240 }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
  
  return (
    <div style={styles.chartWrapper}>
      <div style={styles.barChartContainer}>
        {/* Grid lines */}
        <div style={styles.chartGrid}>
          {[4, 3, 2, 1].map(line => (
            <div key={line} style={styles.gridLine}>
              <span style={styles.gridLabel}>
                ₹{((maxValue * line) / 4 / 1000).toFixed(0)}K
              </span>
            </div>
          ))}
        </div>
        
        <div style={{...styles.barChart, height: height + 40}}>
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 60);
            return (
              <div key={index} style={styles.barWrapper} className="bar-wrapper">
                <div style={styles.barTooltip} className="bar-tooltip">
                  <span style={styles.tooltipLabel}>{item.label}</span>
                  <strong style={styles.tooltipValue}>₹{item.value.toLocaleString()}</strong>
                </div>
                <div 
                  style={{
                    ...styles.modernBar,
                    height: `${barHeight}px`,
                    background: `linear-gradient(145deg, ${colors[index % colors.length]}, ${colors[(index + 1) % colors.length]})`,
                    '--bar-height': `${barHeight}px`,
                    '--index': index
                  }}
                  className="modern-bar"
                >
                  <div style={styles.barHighlight}></div>
                  <div style={styles.barShadow}></div>
                </div>
                <div style={styles.barLabel}>
                  <span style={styles.monthLabel}>{item.label}</span>
                  <span style={styles.valueLabel}>₹{(item.value/1000).toFixed(0)}K</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [franchises, setFranchises] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 850000,
    monthlyRevenue: 125000,
    totalStudents: 2450,
    activeFranchises: 12,
    totalCourses: 8,
    pendingPayments: 45000
  });
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeMetric, setActiveMetric] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Fetch franchises from Firebase
    const franchisesRef = ref(database, 'franchises');
    const unsubscribe = onValue(franchisesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setFranchises(list);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Enhanced CSS animations and styles
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
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

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes growBar {
        from {
          height: 0;
          opacity: 0;
        }
        to {
          height: var(--bar-height);
          opacity: 1;
        }
      }

      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.02);
        }
      }

      @keyframes glow {
        0%, 100% {
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.1);
        }
        50% {
          box-shadow: 0 12px 48px rgba(102, 126, 234, 0.3);
        }
      }

      @keyframes shimmer {
        0% {
          background-position: -200px 0;
        }
        100% {
          background-position: 200px 0;
        }
      }

      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      @keyframes spin3d {
        0% {
          transform: rotate(0deg) rotateY(0deg);
        }
        100% {
          transform: rotate(360deg) rotateY(360deg);
        }
      }

      @keyframes progressGrow {
        from {
          width: 0;
        }
        to {
          width: var(--progress-width);
        }
      }

      .admin-dashboard {
        animation: fadeInUp 0.8s ease-out;
      }

      .metric-card {
        animation: fadeInUp 1s ease-out;
        animation-fill-mode: both;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .metric-card:nth-child(1) { animation-delay: 0.1s; }
      .metric-card:nth-child(2) { animation-delay: 0.2s; }
      .metric-card:nth-child(3) { animation-delay: 0.3s; }
      .metric-card:nth-child(4) { animation-delay: 0.4s; }
      .metric-card:nth-child(5) { animation-delay: 0.5s; }
      .metric-card:nth-child(6) { animation-delay: 0.6s; }

      .metric-card:hover {
        transform: translateY(-12px) scale(1.05);
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
        z-index: 10;
        position: relative;
      }

      .metric-card.active {
        transform: scale(1.05);
        box-shadow: 0 20px 50px rgba(102, 126, 234, 0.3);
        z-index: 10;
      }

      .chart-wrapper {
        animation: scaleIn 1.2s ease-out;
        animation-delay: 0.6s;
        animation-fill-mode: both;
        transition: all 0.4s ease;
      }

      .chart-wrapper:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      }

      .modern-bar {
        animation: growBar 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        animation-delay: calc(var(--index) * 0.2s);
        animation-fill-mode: both;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .modern-bar:hover {
        transform: translateY(-8px) scale(1.1);
        filter: brightness(1.2);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
      }

      .donut-segment {
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        transform-origin: center;
      }

      .donut-segment:hover {
        stroke-width: 30;
        filter: brightness(1.2) drop-shadow(0 8px 16px rgba(0,0,0,0.3));
      }

      .table-section {
        animation: slideInRight 1s ease-out;
        animation-delay: 0.8s;
        animation-fill-mode: both;
      }

      .legend-item {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .legend-item:hover {
        transform: translateX(8px) scale(1.02);
        background: linear-gradient(135deg, #ffffff, #f8fafc);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }

      .bar-wrapper:hover .bar-tooltip {
        opacity: 1;
        visibility: visible;
        transform: translateY(-8px);
      }

      .progress-fill {
        animation: progressGrow 2s ease-out;
        animation-delay: 1s;
        animation-fill-mode: both;
      }

      .loading-shimmer {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200px 100%;
        animation: shimmer 2s infinite;
      }

      .status-badge {
        animation: pulse 3s ease-in-out infinite;
        animation-delay: calc(var(--row-index) * 0.1s);
      }

      .table-row {
        transition: all 0.3s ease;
      }

      .table-row:hover {
        background: linear-gradient(135deg, #f8fafc, #ffffff) !important;
        transform: translateX(4px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      }

      .header-icon {
        animation: float 6s ease-in-out infinite;
      }

      .loading-spinner {
        animation: spin3d 2s linear infinite;
      }

      @media (max-width: 1024px) {
        .metric-card {
          padding: 24px !important;
        }
        
        .chart-wrapper {
          padding: 24px !important;
        }
        
        .main-title {
          font-size: 2.2rem !important;
        }
      }

      @media (max-width: 768px) {
        .admin-dashboard {
          padding: 16px !important;
        }
        
        .metrics-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 16px !important;
        }
        
        .charts-grid {
          grid-template-columns: 1fr !important;
          gap: 20px !important;
        }
        
        .main-title {
          font-size: 1.8rem !important;
          margin-bottom: 20px !important;
        }
        
        .section-title {
          font-size: 1.4rem !important;
        }
      }

      @media (max-width: 480px) {
        .metrics-grid {
          grid-template-columns: 1fr !important;
        }
        
        .main-title {
          font-size: 1.6rem !important;
        }
        
        .card-value {
          font-size: 1.6rem !important;
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

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner} className="loading-spinner">
          <div style={styles.spinner}></div>
          <div style={styles.spinnerRings}>
            <div style={styles.ring}></div>
            <div style={styles.ring}></div>
            <div style={styles.ring}></div>
          </div>
        </div>
        <h2 style={styles.loadingTitle}>Loading Dashboard</h2>
        <div style={styles.loadingDots}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p style={styles.loadingText}>Fetching comprehensive analytics...</p>
      </div>
    );
  }

  // Chart data
  const revenueData = [
    { label: 'Course Fees', value: 650000 },
    { label: 'Franchise Fees', value: 120000 },
    { label: 'Certification', value: 80000 }
  ];

  const monthlyData = [
    { label: 'Jan', value: 95000 },
    { label: 'Feb', value: 110000 },
    { label: 'Mar', value: 125000 },
    { label: 'Apr', value: 140000 },
    { label: 'May', value: 130000 }
  ];

  const studentData = [
    { label: 'Active', value: 1850 },
    { label: 'Graduated', value: 450 },
    { label: 'Pending', value: 150 }
  ];

  return (
    <div style={styles.dashboard} className="admin-dashboard">
      <div style={styles.headerSection}>
        <h1 style={styles.mainTitle} className="main-title">
          Admin Dashboard Overview
        </h1>
      </div>

      {/* Enhanced Key Metrics Cards */}
      <div style={styles.metricsGrid} className="metrics-grid">
        <MetricCard 
          title="Total Revenue" 
          value={`₹${(dashboardData.totalRevenue/100000).toFixed(1)}L`} 
          icon="💰" 
          gradient="linear-gradient(135deg, #667eea, #764ba2)"
          trend="+12.5%"
          trendUp={true}
          onClick={() => setActiveMetric('revenue')}
          isActive={activeMetric === 'revenue'}
        />
        <MetricCard 
          title="Monthly Revenue" 
          value={`₹${(dashboardData.monthlyRevenue/1000).toFixed(0)}K`} 
          icon="📈" 
          gradient="linear-gradient(135deg, #f093fb, #f5576c)"
          trend="+8.2%"
          trendUp={true}
          onClick={() => setActiveMetric('monthly')}
          isActive={activeMetric === 'monthly'}
        />
        <MetricCard 
          title="Total Students" 
          value={dashboardData.totalStudents.toLocaleString()} 
          icon="👨‍🎓" 
          gradient="linear-gradient(135deg, #4facfe, #00f2fe)"
          trend="+15.3%"
          trendUp={true}
          onClick={() => setActiveMetric('students')}
          isActive={activeMetric === 'students'}
        />
        <MetricCard 
          title="Active Franchises" 
          value={franchises.length} 
          icon="🏢" 
          gradient="linear-gradient(135deg, #43e97b, #38f9d7)"
          trend="+5.8%"
          trendUp={true}
          onClick={() => setActiveMetric('franchises')}
          isActive={activeMetric === 'franchises'}
        />
        <MetricCard 
          title="Total Courses" 
          value={dashboardData.totalCourses} 
          icon="📚" 
          gradient="linear-gradient(135deg, #fa709a, #fee140)"
          trend="0%"
          trendUp={null}
          onClick={() => setActiveMetric('courses')}
          isActive={activeMetric === 'courses'}
        />
        <MetricCard 
          title="Pending Payments" 
          value={`₹${(dashboardData.pendingPayments/1000).toFixed(0)}K`} 
          icon="⏰" 
          gradient="linear-gradient(135deg, #ff9a9e, #fecfef)"
          trend="-3.2%"
          trendUp={false}
          onClick={() => setActiveMetric('payments')}
          isActive={activeMetric === 'payments'}
        />
      </div>

      {/* Enhanced Charts Section */}
      <div style={styles.chartsGrid} className="charts-grid">
        <div style={styles.chartContainer} className="chart-container">
          <div style={styles.chartHeader}>
            <div style={styles.chartTitleContainer}>
              <span style={styles.chartEmoji}>💼</span>
              <div>
                <h3 style={styles.chartTitle}>Revenue Breakdown</h3>
                <span style={styles.chartSubtitle}>Distribution by source</span>
              </div>
            </div>
            <div style={styles.chartActions}>
              <button style={styles.actionBtn}>📊</button>
              <button style={styles.actionBtn}>📥</button>
            </div>
          </div>
          <PieChart data={revenueData} title="Revenue Breakdown" size={isMobile ? 200 : 240} />
        </div>
        
        <div style={styles.chartContainer} className="chart-container">
          <div style={styles.chartHeader}>
            <div style={styles.chartTitleContainer}>
              <span style={styles.chartEmoji}>📊</span>
              <div>
                <h3 style={styles.chartTitle}>Monthly Revenue Trend</h3>
                <span style={styles.chartSubtitle}>Last 5 months performance</span>
              </div>
            </div>
            <div style={styles.chartActions}>
              <button style={styles.actionBtn}>📈</button>
              <button style={styles.actionBtn}>📥</button>
            </div>
          </div>
          <BarChart data={monthlyData} title="Monthly Revenue Trend" height={isMobile ? 200 : 240} />
        </div>
        
        <div style={styles.chartContainer} className="chart-container">
          <div style={styles.chartHeader}>
            <div style={styles.chartTitleContainer}>
              <span style={styles.chartEmoji}>🎓</span>
              <div>
                <h3 style={styles.chartTitle}>Student Distribution</h3>
                <span style={styles.chartSubtitle}>Current enrollment status</span>
              </div>
            </div>
            <div style={styles.chartActions}>
              <button style={styles.actionBtn}>👥</button>
              <button style={styles.actionBtn}>📥</button>
            </div>
          </div>
          <PieChart data={studentData} title="Student Distribution" size={isMobile ? 200 : 240} />
        </div>
      </div>

      {/* Enhanced Franchises Table */}
      <div style={styles.tableSection} className="table-section">
        <div style={styles.tableSectionHeader}>
          <div style={styles.sectionTitleContainer}>
            <span style={styles.sectionEmoji}>🏢</span>
            <h2 style={styles.sectionTitle} className="section-title">
              Recent Franchises
            </h2>
          </div>
          <button style={styles.viewAllBtn}>
            <span>View All</span>
            <span style={styles.arrowIcon}>→</span>
          </button>
        </div>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>👤 Name</th>
                <th style={styles.th}>📧 Email</th>
                <th style={styles.th}>🏙️ City</th>
                <th style={styles.th}>📊 Status</th>
                <th style={styles.th}>📅 Created</th>
              </tr>
            </thead>
            <tbody>
              {franchises.slice(0, 5).map((franchise, index) => (
                <tr 
                  key={franchise.id} 
                  style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                  className="table-row"
                >
                  <td style={styles.td}>
                    <div style={styles.nameCell}>
                      <div style={{
                        ...styles.avatar,
                        background: `linear-gradient(135deg, #667eea, #764ba2)`
                      }}>
                        {franchise.name?.charAt(0)?.toUpperCase() || 'F'}
                      </div>
                      <span style={styles.nameText}>{franchise.name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{franchise.email}</td>
                  <td style={styles.td}>
                    <span style={styles.cityText}>{franchise.city || '-'}</span>
                  </td>
                  <td style={styles.td}>
                    <span 
                      style={{
                        ...styles.statusBadge,
                        background: franchise.active 
                          ? 'linear-gradient(135deg, #10b981, #059669)' 
                          : 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: '#ffffff',
                        '--row-index': index
                      }}
                      className="status-badge"
                    >
                      {franchise.active ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.dateText}>
                      {franchise.createdAt ? new Date(franchise.createdAt).toLocaleDateString() : '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Enhanced Metric Card Component with gradients and animations
const MetricCard = ({ title, value, icon, gradient, trend, trendUp, onClick, isActive }) => (
  <div 
    style={{
      ...styles.metricCard,
      background: isActive ? gradient : 'rgba(255, 255, 255, 0.95)',
      color: isActive ? '#ffffff' : '#1e293b',
      transform: isActive ? 'scale(1.05)' : 'scale(1)',
      boxShadow: isActive 
        ? '0 20px 50px rgba(102, 126, 234, 0.3)' 
        : '0 8px 32px rgba(0, 0, 0, 0.08)'
    }} 
    className={`metric-card ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    <div style={styles.cardContent}>
      <div style={styles.cardLeft}>
        <p style={{
          ...styles.cardTitle,
          color: isActive ? 'rgba(255, 255, 255, 0.9)' : '#64748b'
        }}>
          {title}
        </p>
        <h3 style={{
          ...styles.cardValue,
          color: isActive ? '#ffffff' : '#1e293b'
        }}>
          {value}
        </h3>
        {trend && (
          <div style={styles.trendContainer}>
            <span style={{
              ...styles.trendText,
              color: isActive 
                ? 'rgba(255, 255, 255, 0.9)' 
                : (trendUp === null ? '#6b7280' : trendUp ? '#10b981' : '#ef4444'),
              backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              padding: isActive ? '4px 8px' : '0',
              borderRadius: isActive ? '12px' : '0'
            }}>
              {trendUp === null ? '📊' : trendUp ? '📈' : '📉'} {trend}
            </span>
          </div>
        )}
      </div>
      <div style={styles.cardRight}>
        <div style={{
          ...styles.iconContainer,
          background: isActive 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'linear-gradient(135deg, #f8fafc, #ffffff)',
          boxShadow: isActive 
            ? '0 8px 25px rgba(0, 0, 0, 0.2)' 
            : '0 4px 15px rgba(0, 0, 0, 0.1)'
        }}>
          <span style={{
            ...styles.cardIcon,
            filter: isActive ? 'brightness(0) invert(1)' : 'none'
          }}>
            {icon}
          </span>
        </div>
      </div>
    </div>
    <div style={{
      ...styles.cardGlow,
      background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
    }}></div>
  </div>
);

const styles = {
  dashboard: {
    padding: window.innerWidth <= 768 ? '16px' : '24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    position: 'relative',
  },

  headerSection: {
    textAlign: 'center',
    marginBottom: '48px',
    padding: '32px 0',
  },

  headerIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
    filter: 'drop-shadow(0 8px 16px rgba(255, 255, 255, 0.3))',
  },

  mainTitle: {
    fontSize: window.innerWidth <= 768 ? '2.2rem' : '3.2rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '16px',
    letterSpacing: '-1px',
    textShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },

  subtitle: {
    fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    margin: 0,
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },

  loadingSpinner: {
    position: 'relative',
    marginBottom: '32px',
  },

  spinner: {
    width: '60px',
    height: '60px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },

  spinnerRings: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },

  ring: {
    position: 'absolute',
    width: '80px',
    height: '80px',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
  },

  loadingTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '16px',
  },

  loadingDots: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },

  loadingText: {
    fontSize: '1.1rem',
    opacity: '0.9',
    textAlign: 'center',
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: window.innerWidth <= 768 
      ? 'repeat(2, 1fr)' 
      : window.innerWidth <= 1024 
        ? 'repeat(3, 1fr)' 
        : 'repeat(3, 1fr)',
    gap: window.innerWidth <= 768 ? '16px' : '24px',
    marginBottom: '48px',
  },

  metricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: window.innerWidth <= 768 ? '24px' : '32px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  cardContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
    zIndex: 2,
  },

  cardLeft: {
    flex: 1,
  },

  cardRight: {
    display: 'flex',
    alignItems: 'center',
  },

  cardTitle: {
    margin: '0 0 16px 0',
    fontSize: '0.9rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  cardValue: {
    margin: '0 0 12px 0',
    fontSize: window.innerWidth <= 768 ? '2rem' : '2.5rem',
    fontWeight: '900',
    lineHeight: '1.2',
  },

  trendContainer: {
    marginTop: '12px',
  },

  trendText: {
    fontSize: '0.85rem',
    fontWeight: '700',
    transition: 'all 0.3s ease',
  },

  iconContainer: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },

  cardIcon: {
    fontSize: '2rem',
    transition: 'all 0.3s ease',
  },

  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '20px',
    transition: 'all 0.3s ease',
  },

  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: window.innerWidth <= 768 
      ? '1fr' 
      : 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: window.innerWidth <= 768 ? '24px' : '32px',
    marginBottom: '48px',
  },

  chartContainer: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: window.innerWidth <= 768 ? '24px' : '32px',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.4s ease',
  },

  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
  },

  chartTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  chartEmoji: {
    fontSize: '2rem',
    padding: '12px',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '16px',
  },

  chartTitle: {
    margin: '0 0 4px 0',
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#1e293b',
  },

  chartSubtitle: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '500',
  },

  chartActions: {
    display: 'flex',
    gap: '8px',
  },

  actionBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },

  chartWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },

  donutContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pieChart: {
    filter: 'drop-shadow(0 8px 25px rgba(0, 0, 0, 0.1))',
  },

  modernLegend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  },

  legendItem: {
    padding: '16px',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderRadius: '16px',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  legendHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },

  legendLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  legendDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },

  legendLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },

  legendRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  legendValue: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#1e293b',
  },

  legendPercent: {
    fontSize: '12px',
    color: '#64748b',
    backgroundColor: 'rgba(226, 232, 240, 0.8)',
    padding: '4px 8px',
    borderRadius: '12px',
    fontWeight: '600',
  },

  progressBar: {
    height: '6px',
    backgroundColor: 'rgba(226, 232, 240, 0.5)',
    borderRadius: '3px',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 2s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  barChartContainer: {
    position: 'relative',
    height: '280px',
  },

  chartGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '240px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingLeft: '50px',
  },

  gridLine: {
    height: '1px',
    backgroundColor: 'rgba(226, 232, 240, 0.6)',
    position: 'relative',
  },

  gridLabel: {
    position: 'absolute',
    left: '-45px',
    top: '-8px',
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '600',
  },

  barChart: {
    display: 'flex',
    alignItems: 'end',
    justifyContent: 'space-around',
    padding: '20px 0',
    paddingLeft: '50px',
  },

  barWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },

  modernBar: {
    width: window.innerWidth <= 768 ? '32px' : '40px',
    borderRadius: '8px 8px 4px 4px',
    position: 'relative',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
  },

  barHighlight: {
    position: 'absolute',
    top: 0,
    left: '20%',
    width: '60%',
    height: '30%',
    background: 'rgba(255, 255, 255, 0.4)',
    borderRadius: '4px',
  },

  barShadow: {
    position: 'absolute',
    bottom: '-4px',
    left: '2px',
    right: '2px',
    height: '4px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '2px',
    filter: 'blur(4px)',
  },

  barTooltip: {
    position: 'absolute',
    bottom: '120%',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#1e293b',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    opacity: 0,
    visibility: 'hidden',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },

  tooltipLabel: {
    fontSize: '11px',
    opacity: 0.9,
  },

  tooltipValue: {
    fontSize: '13px',
    fontWeight: '700',
  },

  barLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },

  monthLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '700',
  },

  valueLabel: {
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: '600',
  },

  tableSection: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: window.innerWidth <= 768 ? '24px' : '32px',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },

  tableSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
  },

  sectionTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  sectionEmoji: {
    fontSize: '2rem',
    padding: '12px',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '16px',
  },

  sectionTitle: {
    fontSize: window.innerWidth <= 768 ? '1.4rem' : '1.8rem',
    fontWeight: '800',
    color: '#1e293b',
    margin: 0,
  },

  viewAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },

  arrowIcon: {
    transition: 'transform 0.3s ease',
  },

  tableContainer: {
    overflowX: 'auto',
    borderRadius: '16px',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
  },

  tableHeader: {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
  },

  th: {
    padding: window.innerWidth <= 768 ? '16px 12px' : '20px 16px',
    textAlign: 'left',
    fontWeight: '800',
    color: '#1e293b',
    borderBottom: '2px solid rgba(102, 126, 234, 0.1)',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  td: {
    padding: window.innerWidth <= 768 ? '16px 12px' : '20px 16px',
    borderBottom: '1px solid rgba(241, 245, 249, 0.8)',
    color: '#374151',
  },

  evenRow: {
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
  },

  oddRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },

  nameText: {
    fontWeight: '700',
    color: '#1e293b',
  },

  cityText: {
    color: '#64748b',
    fontWeight: '500',
  },

  statusBadge: {
    padding: '8px 16px',
    borderRadius: '25px',
    fontSize: '0.8rem',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },

  dateText: {
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
};

// Add loading dots animation
if (typeof window !== 'undefined') {
  const dotsStyle = document.createElement('style');
  dotsStyle.textContent = `
    .loading-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: white;
      display: inline-block;
      animation: loading-bounce 1.4s infinite ease-in-out both;
    }
    .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
    .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes loading-bounce {
      0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .view-all-btn:hover .arrow-icon {
      transform: translateX(4px);
    }

    .action-btn:hover {
      transform: scale(1.1);
      background: linear-gradient(135deg, #667eea, #764ba2) !important;
      color: white;
    }
  `;
  document.head.appendChild(dotsStyle);
}

export default AdminDashboard;
