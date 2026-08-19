import React, { useState, useEffect } from 'react';
import { useFranchiseAuth } from '../../utils/FranchiseAuthContext';
import { database } from '../../firebase/config';
import { ref, get, query, orderByChild, equalTo, onValue } from 'firebase/database';

const FranchiseDashboard = () => {
  const { franchise, logout, loading: authLoading, error: authError } = useFranchiseAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (franchise && !authLoading) {
      fetchDashboardData();
    }
  }, [franchise, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch students from this franchise
      const studentsRef = ref(database, 'studentCredentials');
      const studentsSnapshot = await get(studentsRef);
      
      let franchiseStudents = [];
      if (studentsSnapshot.exists()) {
        const allStudents = studentsSnapshot.val();
        franchiseStudents = Object.entries(allStudents)
          .filter(([id, student]) => student.franchiseId === franchise.franchiseId)
          .map(([id, student]) => ({ id, ...student }));
      }

      // Fetch admissions from this franchise
      const admissionsRef = ref(database, 'admissionApplications');
      const admissionsSnapshot = await get(admissionsRef);
      
      let franchiseAdmissions = [];
      if (admissionsSnapshot.exists()) {
        const allAdmissions = admissionsSnapshot.val();
        franchiseAdmissions = Object.entries(allAdmissions)
          .filter(([id, admission]) => admission.franchiseId === franchise.franchiseId)
          .map(([id, admission]) => ({ id, ...admission }));
      }

      // Calculate dashboard metrics
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const students = {
        total: franchiseStudents.length,
        active: franchiseStudents.filter(s => s.status === 'active').length,
        graduated: franchiseStudents.filter(s => s.status === 'graduated').length,
        pending: franchiseAdmissions.filter(a => a.status === 'pending').length,
        newThisMonth: franchiseStudents.filter(s => {
          const createdDate = new Date(s.createdAt);
          return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
        }).length
      };

      // Calculate revenue data
      const feePerStudent = parseInt(franchise.profile.affiliationFee) || 5000;
      const revenue = {
        total: students.active * feePerStudent,
        monthly: students.newThisMonth * feePerStudent,
        breakdown: [
          { 
            label: 'Course Fees', 
            value: students.active * feePerStudent * 0.6, 
            color: '#3b82f6' 
          },
          { 
            label: 'Registration Fees', 
            value: students.total * 500, 
            color: '#10b981' 
          },
          { 
            label: 'Certification Fees', 
            value: students.graduated * 1000, 
            color: '#f59e0b' 
          }
        ]
      };

      // Course popularity data
      const courseStats = {};
      franchiseStudents.forEach(student => {
        const course = student.course || 'basic-computer';
        if (!courseStats[course]) {
          courseStats[course] = { enrolled: 0, revenue: 0 };
        }
        courseStats[course].enrolled++;
        courseStats[course].revenue += feePerStudent;
      });

      const courses = {
        total: Object.keys(courseStats).length,
        popular: Object.entries(courseStats)
          .sort(([,a], [,b]) => b.enrolled - a.enrolled)
          .slice(0, 4)
          .map(([course, stats]) => ({
            name: getCourseLabel(course),
            enrolled: stats.enrolled,
            revenue: stats.revenue
          }))
      };

      // Monthly revenue trend (mock data based on current data)
      const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - (5 - i));
        return {
          month: monthAgo.toLocaleDateString('en-US', { month: 'short' }),
          value: Math.floor((revenue.monthly * (0.7 + Math.random() * 0.6)) * (0.5 + i * 0.1))
        };
      });

      setDashboardData({
        revenue,
        students,
        courses,
        monthlyRevenue,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(`Failed to load dashboard data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getCourseLabel = (course) => {
    const labels = {
      'basic-computer': 'Basic Computer Course',
      'ms-office': 'MS Office Suite',
      'web-development': 'Web Development',
      'programming-basics': 'Programming Basics',
      'data-entry': 'Data Entry Specialist',
      'digital-marketing': 'Digital Marketing',
      'graphic-design': 'Graphic Design',
      'computer-repair': 'Computer Hardware & Repair',
      'accounting-software': 'Accounting Software',
      'advanced-excel': 'Advanced Excel & Data Analysis'
    };
    return labels[course] || course || 'Computer Course';
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error logging out. Please try again.');
    }
  };

  // Enhanced Donut Chart Component
  const PieChart = ({ data, size = 200 }) => {
    let cumulativePercentage = 0;
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const centerRadius = size * 0.15;
    
    return (
      <div style={styles.chartContainer} className="pie-chart-container">
        <div style={styles.pieWrapper}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-chart">
            {/* Background circle */}
            <circle
              cx={size/2}
              cy={size/2}
              r={size/2 - 15}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="20"
            />
            
            {/* Data segments */}
            {data.map((slice, index) => {
              const percentage = slice.value / total;
              const circumference = 2 * Math.PI * (size/2 - 15);
              const strokeDasharray = `${percentage * circumference} ${circumference}`;
              const rotation = cumulativePercentage * 360 - 90;
              
              cumulativePercentage += percentage;
              
              return (
                <circle
                  key={index}
                  cx={size/2}
                  cy={size/2}
                  r={size/2 - 15}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray={strokeDasharray}
                  transform={`rotate(${rotation} ${size/2} ${size/2})`}
                  className="pie-segment"
                  style={{
                    transition: 'all 0.6s ease',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                  }}
                />
              );
            })}
            
            {/* Center content */}
            <circle
              cx={size/2}
              cy={size/2}
              r={centerRadius + 10}
              fill="white"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text
              x={size/2}
              y={size/2 - 8}
              textAnchor="middle"
              style={{
                fontSize: '14px',
                fontWeight: '700',
                fill: '#1e293b'
              }}
            >
              Total
            </text>
            <text
              x={size/2}
              y={size/2 + 8}
              textAnchor="middle"
              style={{
                fontSize: '12px',
                fontWeight: '600',
                fill: '#3b82f6'
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
                <div style={styles.legendColor}>
                  <div style={{...styles.legendDot, backgroundColor: item.color}}></div>
                  <span style={styles.legendLabel}>{item.label}</span>
                </div>
                <div style={styles.legendStats}>
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
                    backgroundColor: item.color,
                    width: `${(item.value / total) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Enhanced 3D Bar Chart Component
  const BarChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
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
        
        <div style={styles.barsContainer}>
          {data.map((bar, index) => (
            <div key={index} style={styles.barWrapper} className="bar-wrapper">
              <div style={styles.barTooltip} className="bar-tooltip">
                <span>{bar.month}</span>
                <strong>₹{bar.value.toLocaleString()}</strong>
              </div>
              <div 
                style={{
                  ...styles.modernBar,
                  height: `${(bar.value / maxValue) * 140}px`,
                  background: `linear-gradient(145deg, hsl(${220 + index * 25}, 70%, 55%), hsl(${220 + index * 25}, 70%, 45%))`
                }}
                className="modern-bar"
              >
                <div style={styles.barTop}></div>
              </div>
              <div style={styles.barLabel}>
                <span style={styles.monthLabel}>{bar.month}</span>
                <span style={styles.valueLabel}>₹{(bar.value/1000).toFixed(0)}K</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Show loading while authentication or data is loading
  if (authLoading || loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <div style={styles.pulseRings}>
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
        <p style={styles.loadingSubtitle}>
          {authLoading ? 'Authenticating franchise...' : 'Preparing your franchise insights...'}
        </p>
      </div>
    );
  }

  // Show error if authentication failed or data loading failed
  if (error || authError) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorAnimation}>⚠️</div>
        <h3 style={styles.errorTitle}>Dashboard Access Error</h3>
        <p style={styles.errorMessage}>{error || authError}</p>
        <div style={styles.errorActions}>
          <button onClick={() => window.location.reload()} style={styles.retryButton}>
            <span>🔄</span>
            <span>Try Again</span>
          </button>
          <button onClick={handleLogout} style={{...styles.retryButton, backgroundColor: '#ef4444'}}>
            <span>🚪</span>
            <span>Logout & Login Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorAnimation}>📊</div>
        <h3 style={styles.errorTitle}>No Data Available</h3>
        <p style={styles.errorMessage}>Unable to load franchise dashboard data.</p>
        <button onClick={fetchDashboardData} style={styles.retryButton}>
          <span>🔄</span>
          <span>Reload Dashboard</span>
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container} className="franchise-dashboard">
      {/* Enhanced Header with Real Franchise Info */}
      <div style={styles.header} className="header-animation">
        <div style={styles.headerContent}>
          <div style={styles.profileSection}>
            <div style={styles.headerIcon}>🏢</div>
            <div style={styles.headerText}>
              <h1 style={styles.title}>{franchise.profile.centerName}</h1>
              <p style={styles.subtitle}>
                Franchise Dashboard • {franchise.profile.place}, {franchise.profile.state}
              </p>
            </div>
          </div>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.headerStats}>
            <div style={styles.quickStat}>
              <span style={styles.quickStatValue}>
                {franchise.profile.status === 'Active' ? '🟢' : '🟡'} {franchise.profile.status}
              </span>
              <span style={styles.quickStatLabel}>Status</span>
            </div>
            <div style={styles.quickStat}>
              <span style={styles.quickStatValue}>#{franchise.profile.trade}</span>
              <span style={styles.quickStatLabel}>Trade</span>
            </div>
          </div>
          <div style={styles.profileActions}>
            <button 
              onClick={() => setShowProfileModal(true)} 
              style={styles.profileButton}
            >
              <span>👤</span>
              <span>Profile</span>
            </button>
            <button onClick={handleLogout} style={styles.logoutButton}>
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Key Metrics */}
      <div style={styles.metricsGrid} className="metrics-grid">
        <MetricCard 
          title="Total Revenue" 
          value={`₹${(dashboardData.revenue.total/100000).toFixed(1)}L`}
          icon="💰"
          color="#10b981"
          trend={`+${dashboardData.students.newThisMonth}`}
          gradient="linear-gradient(135deg, #10b981, #059669)"
          onClick={() => setActiveCard('revenue')}
          isActive={activeCard === 'revenue'}
        />
        <MetricCard 
          title="Active Students" 
          value={dashboardData.students.active.toLocaleString()}
          icon="👨‍🎓"
          color="#3b82f6"
          trend={`+${dashboardData.students.newThisMonth}`}
          gradient="linear-gradient(135deg, #3b82f6, #2563eb)"
          onClick={() => setActiveCard('students')}
          isActive={activeCard === 'students'}
        />
        <MetricCard 
          title="Total Courses" 
          value={dashboardData.courses.total}
          icon="📚"
          color="#8b5cf6"
          trend={`${dashboardData.courses.popular.length} active`}
          gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)"
          onClick={() => setActiveCard('courses')}
          isActive={activeCard === 'courses'}
        />
        <MetricCard 
          title="Monthly Revenue" 
          value={`₹${(dashboardData.revenue.monthly/1000).toFixed(0)}K`}
          icon="📈"
          color="#f59e0b"
          trend={`${dashboardData.students.newThisMonth} new`}
          gradient="linear-gradient(135deg, #f59e0b, #d97706)"
          onClick={() => setActiveCard('monthly')}
          isActive={activeCard === 'monthly'}
        />
      </div>

      {/* Enhanced Charts Section with Real Data */}
      <div style={styles.chartsGrid} className="charts-animation">
        <div style={styles.chartCard} className="chart-card">
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>
              <span style={styles.chartIcon}>🎯</span>
              Revenue Breakdown
            </h3>
            <div style={styles.chartActions}>
              <button style={styles.chartActionBtn}>📊</button>
              <button style={styles.chartActionBtn}>📥</button>
            </div>
          </div>
          <PieChart data={dashboardData.revenue.breakdown} />
        </div>

        <div style={styles.chartCard} className="chart-card">
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>
              <span style={styles.chartIcon}>📈</span>
              Monthly Revenue Trend
            </h3>
            <div style={styles.chartActions}>
              <button style={styles.chartActionBtn}>📊</button>
              <button style={styles.chartActionBtn}>📥</button>
            </div>
          </div>
          <BarChart data={dashboardData.monthlyRevenue} />
        </div>
      </div>

      {/* Enhanced Analytics Section with Real Data */}
      <div style={styles.analyticsGrid} className="analytics-animation">
        <div style={styles.analyticsCard} className="analytics-card">
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <span style={styles.cardIcon}>👥</span>
              Student Analytics
            </h3>
            <div style={styles.cardBadge}>Live</div>
          </div>
          <div style={styles.studentStatsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>👨‍🎓</div>
              <div style={styles.statContent}>
                <span style={styles.statNumber}>{dashboardData.students.total}</span>
                <span style={styles.statLabel}>Total Students</span>
                <div style={styles.statProgress}>
                  <div style={{...styles.statProgressFill, width: '100%'}}></div>
                </div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>✅</div>
              <div style={styles.statContent}>
                <span style={styles.statNumber}>{dashboardData.students.active}</span>
                <span style={styles.statLabel}>Active</span>
                <div style={styles.statProgress}>
                  <div style={{...styles.statProgressFill, width: `${(dashboardData.students.active/dashboardData.students.total)*100}%`}}></div>
                </div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>🎓</div>
              <div style={styles.statContent}>
                <span style={styles.statNumber}>{dashboardData.students.graduated}</span>
                <span style={styles.statLabel}>Graduated</span>
                <div style={styles.statProgress}>
                  <div style={{...styles.statProgressFill, width: `${(dashboardData.students.graduated/dashboardData.students.total)*100}%`}}></div>
                </div>
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>⏳</div>
              <div style={styles.statContent}>
                <span style={styles.statNumber}>{dashboardData.students.pending}</span>
                <span style={styles.statLabel}>Pending</span>
                <div style={styles.statProgress}>
                  <div style={{...styles.statProgressFill, width: `${(dashboardData.students.pending/dashboardData.students.total)*100}%`}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.analyticsCard} className="analytics-card">
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <span style={styles.cardIcon}>🏆</span>
              Top Performing Courses
            </h3>
            <div style={styles.cardBadge}>Popular</div>
          </div>
          <div style={styles.coursesList}>
            {dashboardData.courses.popular.length === 0 ? (
              <div style={styles.noCoursesMessage}>
                <span style={{ fontSize: '2rem', marginBottom: '10px' }}>📚</span>
                <p>No courses data available yet.</p>
                <p>Start enrolling students to see course analytics!</p>
              </div>
            ) : (
              dashboardData.courses.popular.map((course, index) => (
                <div key={index} style={styles.courseItem} className="course-item">
                  <div style={styles.courseRank}>#{index + 1}</div>
                  <div style={styles.courseInfo}>
                    <div style={styles.courseName}>{course.name}</div>
                    <div style={styles.courseMetrics}>
                      <span style={styles.courseEnrolled}>
                        👨‍🎓 {course.enrolled} students
                      </span>
                      <span style={styles.courseRevenue}>
                        💰 ₹{(course.revenue/1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                  <div style={styles.courseProgress}>
                    <div 
                      style={{
                        ...styles.courseProgressBar,
                        width: `${Math.min((course.enrolled / franchise.profile.seatRequire) * 100, 100)}%`,
                        backgroundColor: `hsl(${120 + index * 40}, 70%, 50%)`
                      }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Franchise Profile Modal */}
      {showProfileModal && (
        <div style={styles.modalOverlay} onClick={() => setShowProfileModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>🏢 Franchise Profile</h2>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.profileGrid}>
                <div style={styles.profileSection}>
                  <h3 style={styles.profileSectionTitle}>🏛️ Center Information</h3>
                  <div style={styles.profileDetails}>
                    <ProfileDetail label="Center Name" value={franchise.profile.centerName} />
                    <ProfileDetail label="Firm Name" value={franchise.profile.firmName} />
                    <ProfileDetail label="Owner Name" value={franchise.profile.ownerName} />
                    <ProfileDetail label="Contact Number" value={franchise.profile.contactNumber} />
                    <ProfileDetail label="Email Address" value={franchise.profile.email} />
                    <ProfileDetail label="Trade" value={getCourseLabel(franchise.profile.trade)} />
                  </div>
                </div>

                <div style={styles.profileSection}>
                  <h3 style={styles.profileSectionTitle}>📍 Location & Infrastructure</h3>
                  <div style={styles.profileDetails}>
                    <ProfileDetail 
                      label="Address" 
                      value={`${franchise.profile.place}, ${franchise.profile.district}, ${franchise.profile.state}`} 
                    />
                    <ProfileDetail label="Center Address" value={franchise.profile.centerAddress} />
                    <ProfileDetail label="Computer Systems" value={franchise.profile.computerSystems} />
                    <ProfileDetail label="Classrooms" value={franchise.profile.noOfClassroom} />
                    <ProfileDetail label="Computer Labs" value={franchise.profile.noOfLab} />
                    <ProfileDetail label="Seat Capacity" value={franchise.profile.seatRequire} />
                    <ProfileDetail label="Premises Area" value={`${franchise.profile.premisesArea} Sq.Ft`} />
                  </div>
                </div>

                <div style={styles.profileSection}>
                  <h3 style={styles.profileSectionTitle}>💼 Business Information</h3>
                  <div style={styles.profileDetails}>
                    <ProfileDetail 
                      label="Approved Date" 
                      value={new Date(franchise.profile.approvedDate).toLocaleDateString('en-IN')} 
                    />
                    <ProfileDetail label="Affiliation Fee" value={`₹${franchise.profile.affiliationFee}`} />
                    <ProfileDetail label="Username" value={franchise.profile.userName} />
                    <ProfileDetail label="Franchise ID" value={franchise.franchiseId} />
                    <ProfileDetail 
                      label="Last Login" 
                      value={new Date(franchise.lastLogin).toLocaleString('en-IN')} 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div style={styles.modalActions}>
              <button
                style={{...styles.modalBtn, ...styles.modalBtnSecondary}}
                onClick={() => setShowProfileModal(false)}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Profile Detail Component
const ProfileDetail = ({ label, value }) => (
  <div style={styles.profileDetail}>
    <span style={styles.profileDetailLabel}>{label}</span>
    <span style={styles.profileDetailValue}>{value || 'Not specified'}</span>
  </div>
);

// Enhanced Metric Card Component
const MetricCard = ({ title, value, icon, color, trend, gradient, onClick, isActive }) => (
  <div 
    style={{
      ...styles.metricCard,
      background: isActive ? gradient : '#ffffff',
      color: isActive ? '#ffffff' : '#1e293b',
      transform: isActive ? 'scale(1.05)' : 'scale(1)',
      boxShadow: isActive 
        ? `0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 3px ${color}30`
        : '0 4px 12px rgba(0, 0, 0, 0.05)'
    }}
    className="metric-card"
    onClick={onClick}
  >
    <div style={styles.metricHeader}>
      <div style={styles.metricIconContainer}>
        <span style={{...styles.metricIcon, filter: isActive ? 'brightness(0) invert(1)' : 'none'}}>{icon}</span>
      </div>
      <div style={styles.trendContainer}>
        <span style={{
          ...styles.trend, 
          color: isActive ? '#ffffff' : (trend.startsWith('+') ? '#10b981' : '#ef4444'),
          backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent'
        }}>
          {trend}
        </span>
      </div>
    </div>
    <div style={{...styles.metricValue, color: isActive ? '#ffffff' : '#1e293b'}}>
      {value}
    </div>
    <div style={{...styles.metricTitle, color: isActive ? 'rgba(255,255,255,0.9)' : '#64748b'}}>
      {title}
    </div>
    <div style={{
      ...styles.metricGlow,
      background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent'
    }}></div>
  </div>
);

// Enhanced Styles with Professional Layout [file:76][file:137]
const styles = {
  container: {
    padding: '24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    position: 'relative'
  },
  
  // Loading Styles
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  loadingSpinner: {
    position: 'relative',
    marginBottom: '32px'
  },
  spinner: {
    width: '60px',
    height: '60px',
    borderWidth: '4px',
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  pulseRings: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  ring: {
    position: 'absolute',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    animation: 'pulse-ring 2s ease-out infinite'
  },
  loadingTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '16px',
    textAlign: 'center'
  },
  loadingDots: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px'
  },
  loadingSubtitle: {
    fontSize: '1.1rem',
    opacity: '0.9',
    textAlign: 'center'
  },
  
  // Enhanced Error Styles
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px'
  },
  errorAnimation: {
    fontSize: '5rem',
    marginBottom: '20px',
    animation: 'bounce 2s infinite'
  },
  errorTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '12px'
  },
  errorMessage: {
    fontSize: '1.1rem',
    opacity: '0.9',
    marginBottom: '30px',
    maxWidth: '500px',
    lineHeight: '1.5'
  },
  errorActions: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  retryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#667eea',
    backgroundColor: '#ffffff',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
  },
  
  // Header Styles
  header: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '32px',
    marginBottom: '32px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  profileSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  headerIcon: {
    fontSize: '3rem',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
    lineHeight: '1.2'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    margin: 0
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  headerStats: {
    display: 'flex',
    gap: '16px'
  },
  quickStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 20px',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: '16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(102, 126, 234, 0.2)'
  },
  quickStatValue: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#667eea'
  },
  quickStatLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  profileActions: {
    display: 'flex',
    gap: '12px'
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '50px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '50px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)'
  },
  
  // Metrics Grid
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden'
  },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  metricIconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
  },
  metricIcon: {
    fontSize: '28px'
  },
  trendContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  trend: {
    fontSize: '14px',
    fontWeight: '700',
    padding: '6px 12px',
    borderRadius: '20px',
    transition: 'all 0.3s ease'
  },
  metricValue: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '8px',
    lineHeight: '1'
  },
  metricTitle: {
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600'
  },
  metricGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '20px',
    transition: 'all 0.3s ease'
  },
  
  // Charts Grid
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '32px',
    marginBottom: '40px'
  },
  chartCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease'
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px'
  },
  chartTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: 0
  },
  chartIcon: {
    fontSize: '24px',
    padding: '8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '12px'
  },
  chartActions: {
    display: 'flex',
    gap: '8px'
  },
  chartActionBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  // Pie Chart Styles
  chartContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px'
  },
  pieWrapper: {
    position: 'relative'
  },
  modernLegend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%'
  },
  legendItem: {
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    transition: 'all 0.3s ease'
  },
  legendHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  legendColor: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  legendLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  legendStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  legendValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b'
  },
  legendPercent: {
    fontSize: '12px',
    color: '#64748b',
    backgroundColor: '#e2e8f0',
    padding: '2px 8px',
    borderRadius: '12px'
  },
  progressBar: {
    height: '4px',
    backgroundColor: '#e2e8f0',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 1s ease'
  },
  
  // Bar Chart Styles
  barChartContainer: {
    position: 'relative',
    height: '200px'
  },
  chartGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '160px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  gridLine: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    position: 'relative'
  },
  gridLabel: {
    position: 'absolute',
    left: '-40px',
    top: '-8px',
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '500'
  },
  barsContainer: {
    display: 'flex',
    alignItems: 'end',
    justifyContent: 'space-around',
    height: '160px',
    marginTop: '20px',
    paddingLeft: '40px'
  },
  barWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  modernBar: {
    width: '32px',
    borderRadius: '8px 8px 4px 4px',
    position: 'relative',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  barTop: {
    position: 'absolute',
    top: '-2px',
    left: '0',
    right: '0',
    height: '8px',
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '8px 8px 2px 2px'
  },
  barLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    marginTop: '12px'
  },
  monthLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600'
  },
  valueLabel: {
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: '500'
  },
  barTooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#1e293b',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    opacity: 0,
    pointerEvents: 'none',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px'
  },
  
  // Analytics Grid
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '32px'
  },
  analyticsCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px'
  },
  cardTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: 0
  },
  cardIcon: {
    fontSize: '24px',
    padding: '8px',
    backgroundColor: '#f1f5f9',
    borderRadius: '12px'
  },
  cardBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  
  // Student Stats
  studentStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    transition: 'all 0.3s ease'
  },
  statIcon: {
    fontSize: '28px',
    width: '56px',
    height: '56px',
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
  },
  statContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  statNumber: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: '1'
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600'
  },
  statProgress: {
    height: '4px',
    backgroundColor: '#e2e8f0',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  statProgressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: '2px',
    transition: 'width 1s ease'
  },
  
  // Courses List
  coursesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  noCoursesMessage: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#64748b',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  courseItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  },
  courseRank: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#3b82f6',
    minWidth: '40px',
    textAlign: 'center'
  },
  courseInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  courseName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: '1.3'
  },
  courseMetrics: {
    display: 'flex',
    gap: '16px'
  },
  courseEnrolled: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
  },
  courseRevenue: {
    fontSize: '14px',
    color: '#10b981',
    fontWeight: '600'
  },
  courseProgress: {
    width: '80px',
    height: '6px',
    backgroundColor: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  courseProgressBar: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 1s ease'
  },

  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
    animation: 'fadeIn 0.3s ease-out'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '20px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 50px 100px rgba(0, 0, 0, 0.3)',
    animation: 'slideUp 0.5s ease-out'
  },
  modalHeader: {
    padding: '25px 30px',
    borderBottom: '2px solid #f1f5f9',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  modalTitle: {
    fontSize: '1.6rem',
    fontWeight: '700',
    margin: 0
  },
  modalBody: {
    padding: '30px'
  },
  profileGrid: {
    display: 'grid',
    gap: '30px'
  },
  profileSection: {
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0'
  },
  profileSectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#374151',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #667eea'
  },
  profileDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  profileDetail: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  profileDetailLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  profileDetailValue: {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: '600',
    lineHeight: '1.4'
  },
  modalActions: {
    padding: '25px 30px',
    borderTop: '2px solid #f1f5f9',
    backgroundColor: '#f8fafc',
    display: 'flex',
    gap: '15px',
    justifyContent: 'flex-end'
  },
  modalBtn: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  modalBtnSecondary: {
    backgroundColor: '#e5e7eb',
    color: '#374151'
  }
};

// Enhanced CSS with Modern Animations [web:161][web:163]
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes pulse-ring {
      0% { 
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 1;
      }
      100% { 
        transform: translate(-50%, -50%) scale(1.4);
        opacity: 0;
      }
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    .loading-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: white;
      display: inline-block;
      animation: loading-dots 1.4s infinite ease-in-out both;
    }
    
    .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
    .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes loading-dots {
      0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    .franchise-dashboard {
      animation: fadeIn 0.8s ease-out;
    }
    
    .header-animation {
      animation: slideUp 0.6s ease-out;
    }
    
    .metrics-grid {
      animation: slideUp 0.8s ease-out 0.2s both;
    }
    
    .charts-animation {
      animation: slideUp 0.8s ease-out 0.4s both;
    }
    
    .analytics-animation {
      animation: slideUp 0.8s ease-out 0.6s both;
    }
    
    .metric-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    }
    
    .chart-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
    }
    
    .analytics-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
    }
    
    .modern-bar:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
    }
    
    .bar-wrapper:hover .bar-tooltip {
      opacity: 1;
      transform: translateX(-50%) translateY(-8px);
    }
    
    .legend-item:hover {
      background-color: #ffffff;
      transform: translateX(4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
    
    .course-item:hover {
      background-color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
    
    .stat-card:hover {
      background-color: #ffffff;
      transform: scale(1.02);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
    
    /* Mobile Responsive */
    @media (max-width: 768px) {
      .franchise-dashboard .container {
        padding: 16px !important;
      }
      
      .franchise-dashboard .header {
        flex-direction: column !important;
        text-align: center !important;
        gap: 20px !important;
      }
      
      .franchise-dashboard .metrics-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 16px !important;
      }
      
      .franchise-dashboard .charts-grid {
        grid-template-columns: 1fr !important;
      }
      
      .franchise-dashboard .analytics-grid {
        grid-template-columns: 1fr !important;
      }
      
      .franchise-dashboard .student-stats-grid {
        grid-template-columns: 1fr !important;
      }
    }
    
    @media (max-width: 480px) {
      .franchise-dashboard .metrics-grid {
        grid-template-columns: 1fr !important;
      }
      
      .franchise-dashboard .title {
        font-size: 2rem !important;
      }
      
      .franchise-dashboard .metric-value {
        font-size: 2rem !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default FranchiseDashboard;
