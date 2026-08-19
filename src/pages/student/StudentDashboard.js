import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { database } from '../../firebase/config';
import { ref, get } from 'firebase/database';

const StudentDashboard = () => {
  const { user, logout, loading: authLoading, error: authError } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      // Wait for auth to complete
      if (authLoading) {
        console.log('Waiting for authentication...');
        return;
      }

      // Check for authentication errors first
      if (authError) {
        setError(`Authentication Error: ${authError}`);
        setLoading(false);
        return;
      }

      // Check if user is authenticated
      if (!user) {
        setError('User not authenticated. Please log in to continue.');
        setLoading(false);
        return;
      }

      // Check if user has studentId
      if (!user.studentId) {
        setError('Student ID not found. Please contact support.');
        setLoading(false);
        return;
      }

      try {
        setError(null);
        console.log('Fetching data for student:', user.studentId);

        // Fetch credentials data
        const credentialsRef = ref(database, `studentCredentials/${user.studentId}`);
        const credentialsSnapshot = await get(credentialsRef);

        let credentialsData = null;
        if (credentialsSnapshot.exists()) {
          credentialsData = credentialsSnapshot.val();
          console.log('Credentials found');
        } else {
          console.log('No credentials found, creating default data');
          // Create default credentials data if not found
          credentialsData = {
            email: user.email,
            studentInfo: {
              firstName: user.displayName?.split(' ')[0] || 'Student',
              lastName: user.displayName?.split(' ')[1] || '',
            },
            password: 'defaultPassword123', // Should be set properly
            isTemporary: true,
            createdAt: new Date().toISOString(),
            status: 'active'
          };
        }

        // Fetch admission applications to get complete data
        const admissionsRef = ref(database, 'admissionApplications');
        const admissionsSnapshot = await get(admissionsRef);

        let admissionData = null;
        if (admissionsSnapshot.exists()) {
          const allAdmissions = admissionsSnapshot.val();
          
          // Try multiple ways to find matching admission data
          const matchingKey = Object.keys(allAdmissions).find(key => {
            const admission = allAdmissions[key];
            return (
              key === user.studentId ||
              admission.studentId === user.studentId ||
              admission.email === user.email ||
              (admission.firstName === credentialsData.studentInfo?.firstName && 
               admission.lastName === credentialsData.studentInfo?.lastName)
            );
          });

          if (matchingKey) {
            admissionData = { ...allAdmissions[matchingKey], applicationId: matchingKey };
            console.log('Admission data found');
          } else {
            console.log('No matching admission data found');
          }
        }

        // Combine data with proper fallbacks
        const combinedData = {
          profile: {
            name: `${credentialsData.studentInfo?.firstName || user.displayName?.split(' ')[0] || 'Student'} ${credentialsData.studentInfo?.lastName || user.displayName?.split(' ')[1] || ''}`.trim(),
            studentId: user.studentId,
            course: admissionData?.course || credentialsData.studentInfo?.course || 'Basic Computer Course',
            batch: admissionData?.preferredBatch || credentialsData.studentInfo?.batch || 'Morning Batch',
            joinDate: admissionData?.admissionDate || credentialsData.createdAt || new Date().toISOString(),
            email: user.email,
            phone: admissionData?.phone || credentialsData.studentInfo?.phone || 'Not provided',
            rollNumber: credentialsData.studentInfo?.rollNumber || generateRollNumber(admissionData || { course: 'basic-computer' }),
            profileImage: '👨‍🎓'
          },
          credentials: {
            studentId: user.studentId,
            password: credentialsData.password || 'Contact Support',
            isTemporary: credentialsData.isTemporary !== false, // Default to true
            credentialsSent: true,
            credentialsSentAt: credentialsData.createdAt || new Date().toISOString()
          },
          personalInfo: {
            firstName: credentialsData.studentInfo?.firstName || admissionData?.firstName || user.displayName?.split(' ')[0] || '',
            lastName: credentialsData.studentInfo?.lastName || admissionData?.lastName || user.displayName?.split(' ')[1] || '',
            gender: admissionData?.gender || 'Not specified',
            dateOfBirth: admissionData?.dateOfBirth || '',
            address: admissionData?.address || '',
            city: admissionData?.city || '',
            state: admissionData?.state || '',
            zipCode: admissionData?.zipCode || '',
            qualification: admissionData?.qualification || 'Not specified',
            experience: admissionData?.experience || 'Not specified',
            computerKnowledge: admissionData?.previousComputer || 'basic',
            expectations: admissionData?.expectations || ''
          },
          accountInfo: {
            accountCreated: credentialsData.createdAt || new Date().toISOString(),
            lastLogin: user.lastLogin || credentialsData.lastLogin,
            status: credentialsData.status || 'active'
          }
        };

        setStudentData(combinedData);
        console.log('Student data loaded successfully');

      } catch (error) {
        console.error('Error fetching student data:', error);
        setError(`Failed to load dashboard data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user, authLoading, authError]);

  const generateRollNumber = (studentData) => {
    const year = new Date().getFullYear().toString().slice(-2);
    const courseCode = getCourseCode(studentData?.course || 'basic-computer');
    const id = studentData?.applicationId?.slice(-4) || Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `${year}${courseCode}${id}`;
  };

  const getCourseCode = (course) => {
    const codes = {
      'basic-computer': 'BC',
      'ms-office': 'MSO',
      'web-development': 'WD',
      'programming-basics': 'PB',
      'data-entry': 'DE',
      'digital-marketing': 'DM',
      'graphic-design': 'GD',
      'computer-repair': 'CR',
      'accounting-software': 'AS',
      'advanced-excel': 'AE'
    };
    return codes[course] || 'GEN';
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
      // AuthContext will handle the redirect
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error logging out. Please try again.');
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(type);
      setTimeout(() => setCopiedField(null), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(type);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  // Show loading while auth is loading
  if (authLoading || loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <div style={styles.loadingDots}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <h2 style={styles.loadingTitle}>Loading Dashboard</h2>
        <p style={styles.loadingSubtitle}>
          {authLoading ? 'Authenticating user...' : 'Fetching your student information...'}
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

  if (!studentData) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorAnimation}>📄</div>
        <h3 style={styles.errorTitle}>No Data Available</h3>
        <p style={styles.errorMessage}>Unable to load student information.</p>
        <button onClick={() => window.location.reload()} style={styles.retryButton}>
          <span>🔄</span>
          <span>Reload Dashboard</span>
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container} className="student-dashboard">
      {/* Enhanced Header with Gradient Background */}
      <div style={styles.header} className="dashboard-header">
        <div style={styles.profileSection}>
          <div style={styles.avatarContainer}>
            <div style={styles.avatar}>{studentData.profile.profileImage}</div>
            <div style={styles.onlineBadge}></div>
          </div>
          <div style={styles.profileInfo}>
            <h1 style={styles.studentName}>{studentData.profile.name}</h1>
            <div style={styles.studentIdContainer}>
              <span style={styles.studentIdLabel}>ID:</span>
              <span style={styles.studentId}>{studentData.profile.studentId}</span>
            </div>
            <div style={styles.courseInfoContainer}>
              <span style={styles.courseIcon}>📚</span>
              <span style={styles.courseText}>
                {getCourseLabel(studentData.profile.course)} • {studentData.profile.batch}
              </span>
            </div>
          </div>
        </div>
        <div style={styles.headerActions}>
          <div style={styles.welcomeMessage}>
            <span style={styles.welcomeText}>Welcome back! 👋</span>
            <span style={styles.lastLogin}>
              {studentData.accountInfo.lastLogin ? 
                `Last active: ${new Date(studentData.accountInfo.lastLogin).toLocaleDateString()}` :
                'First time here!'
              }
            </span>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton} className="logout-btn">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Enhanced Main Content Grid */}
      <div style={styles.mainGrid} className="main-content">
        
        {/* Enhanced Login Credentials Card */}
        <div style={styles.card} className="credentials-card slide-in">
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <span style={styles.cardIcon}>🔐</span>
              Login Credentials
            </h3>
            <div style={styles.securityBadge}>Secure</div>
          </div>
          <div style={styles.credentialsSection}>
            <div style={styles.credentialItem}>
              <div style={styles.credentialHeader}>
                <span style={styles.credentialLabel}>🆔 Student ID</span>
                <div style={styles.credentialStatus}>Active</div>
              </div>
              <div style={styles.credentialValueContainer}>
                <div style={styles.credentialValue}>{studentData.credentials.studentId}</div>
                <button 
                  onClick={() => copyToClipboard(studentData.credentials.studentId, 'Student ID')}
                  style={{
                    ...styles.copyButton,
                    backgroundColor: copiedField === 'Student ID' ? '#10b981' : '#3b82f6'
                  }}
                  className="copy-btn"
                >
                  {copiedField === 'Student ID' ? '✅' : '📋'}
                  <span>{copiedField === 'Student ID' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
            
            <div style={styles.credentialItem}>
              <div style={styles.credentialHeader}>
                <span style={styles.credentialLabel}>🔑 Password</span>
                <div style={studentData.credentials.isTemporary ? styles.tempStatus : styles.credentialStatus}>
                  {studentData.credentials.isTemporary ? 'Temporary' : 'Permanent'}
                </div>
              </div>
              <div style={styles.credentialValueContainer}>
                <div style={styles.credentialValue}>{'•'.repeat(studentData.credentials.password.length)}</div>
                <button 
                  onClick={() => copyToClipboard(studentData.credentials.password, 'Password')}
                  style={{
                    ...styles.copyButton,
                    backgroundColor: copiedField === 'Password' ? '#10b981' : '#3b82f6'
                  }}
                  className="copy-btn"
                >
                  {copiedField === 'Password' ? '✅' : '👁️'}
                  <span>{copiedField === 'Password' ? 'Copied!' : 'Show & Copy'}</span>
                </button>
              </div>
            </div>
            
            {studentData.credentials.isTemporary && (
              <div style={styles.passwordWarning} className="warning-pulse">
                <span style={styles.warningIcon}>⚠️</span>
                <div>
                  <strong>Security Notice:</strong> You're using a temporary password. 
                  Please change it after login for better security.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Student Information */}
        <div style={styles.card} className="info-card slide-in">
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <span style={styles.cardIcon}>ℹ️</span>
              Student Information
            </h3>
            <div style={styles.verifiedBadge}>✅ Verified</div>
          </div>
          <div style={styles.studentInfo}>
            <InfoRow label="Email Address" value={studentData.profile.email} icon="📧" />
            <InfoRow label="Phone Number" value={studentData.profile.phone} icon="📱" />
            <InfoRow label="Roll Number" value={studentData.profile.rollNumber} icon="🎯" />
            <InfoRow label="Admission Date" value={
              studentData.profile.joinDate ? 
              new Date(studentData.profile.joinDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 
              'Not available'
            } icon="📅" />
          </div>
        </div>

        {/* Enhanced Course Information */}
        <div style={styles.card} className="course-card slide-in">
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <span style={styles.cardIcon}>📚</span>
              Course Details
            </h3>
            <div style={styles.activeBadge}>🟢 Active</div>
          </div>
          <div style={styles.courseDetailsGrid}>
            <div style={styles.courseDetailItem}>
              <div style={styles.courseDetailIcon}>🎓</div>
              <div style={styles.courseDetailContent}>
                <span style={styles.courseDetailLabel}>Course Name</span>
                <span style={styles.courseDetailValue}>{getCourseLabel(studentData.profile.course)}</span>
              </div>
            </div>
            <div style={styles.courseDetailItem}>
              <div style={styles.courseDetailIcon}>👥</div>
              <div style={styles.courseDetailContent}>
                <span style={styles.courseDetailLabel}>Batch</span>
                <span style={styles.courseDetailValue}>{studentData.profile.batch}</span>
              </div>
            </div>
            <div style={styles.courseDetailItem}>
              <div style={styles.courseDetailIcon}>🏷️</div>
              <div style={styles.courseDetailContent}>
                <span style={styles.courseDetailLabel}>Course Code</span>
                <span style={styles.courseDetailValue}>{getCourseCode(studentData.profile.course)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Personal Details */}
        <div style={styles.card} className="personal-card slide-in">
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <span style={styles.cardIcon}>👤</span>
              Personal Details
            </h3>
            <div style={styles.completeBadge}>Complete</div>
          </div>
          <div style={styles.personalDetails}>
            <InfoRow 
              label="Full Name" 
              value={`${studentData.personalInfo.firstName || ''} ${studentData.personalInfo.lastName || ''}`.trim() || 'Not provided'} 
              icon="👨" 
            />
            <InfoRow label="Gender" value={
              studentData.personalInfo.gender === 'male' ? 'Male' :
              studentData.personalInfo.gender === 'female' ? 'Female' :
              studentData.personalInfo.gender === 'other' ? 'Other' : 'Not specified'
            } icon="⚧️" />
            <InfoRow label="Date of Birth" value={
              studentData.personalInfo.dateOfBirth ? 
              new Date(studentData.personalInfo.dateOfBirth).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 
              'Not provided'
            } icon="🎂" />
            <InfoRow label="Address" value={
              [
                studentData.personalInfo.address,
                studentData.personalInfo.city,
                studentData.personalInfo.state,
                studentData.personalInfo.zipCode
              ].filter(Boolean).join(', ') || 'Not provided'
            } icon="🏠" />
          </div>
        </div>

        {/* Enhanced Academic Background */}
        <div style={styles.card} className="academic-card slide-in">
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <span style={styles.cardIcon}>🎓</span>
              Academic Background
            </h3>
            <div style={styles.profileBadge}>Profile</div>
          </div>
          <div style={styles.academicGrid}>
            <div style={styles.academicItem}>
              <div style={styles.academicIcon}>📜</div>
              <div style={styles.academicContent}>
                <div style={styles.academicLabel}>Qualification</div>
                <div style={styles.academicValue}>
                  {studentData.personalInfo.qualification || 'Not specified'}
                </div>
              </div>
            </div>
            <div style={styles.academicItem}>
              <div style={styles.academicIcon}>💼</div>
              <div style={styles.academicContent}>
                <div style={styles.academicLabel}>Experience</div>
                <div style={styles.academicValue}>
                  {studentData.personalInfo.experience || 'Not specified'}
                </div>
              </div>
            </div>
            <div style={styles.academicItem}>
              <div style={styles.academicIcon}>💻</div>
              <div style={styles.academicContent}>
                <div style={styles.academicLabel}>Computer Knowledge</div>
                <div style={styles.academicValue}>
                  {studentData.personalInfo.computerKnowledge ? 
                    (studentData.personalInfo.computerKnowledge.charAt(0).toUpperCase() + 
                     studentData.personalInfo.computerKnowledge.slice(1)) : 
                    'Basic'
                  }
                </div>
              </div>
            </div>
            <div style={styles.academicItem}>
              <div style={styles.academicIcon}>🎯</div>
              <div style={styles.academicContent}>
                <div style={styles.academicLabel}>Expectations</div>
                <div style={styles.academicValue}>
                  {studentData.personalInfo.expectations || 'Not specified'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Account Status */}
        <div style={styles.card} className="status-card slide-in">
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <span style={styles.cardIcon}>⚙️</span>
              Account Status
            </h3>
            <div style={styles.activeBadge}>🟢 Online</div>
          </div>
          <div style={styles.statusGrid}>
            <div style={styles.statusCard}>
              <div style={styles.statusIcon}>✅</div>
              <div style={styles.statusContent}>
                <div style={styles.statusLabel}>Account Status</div>
                <div style={styles.statusValue}>Active & Verified</div>
              </div>
            </div>
            <div style={styles.statusCard}>
              <div style={styles.statusIcon}>📧</div>
              <div style={styles.statusContent}>
                <div style={styles.statusLabel}>Credentials</div>
                <div style={styles.statusValue}>Successfully Delivered</div>
              </div>
            </div>
            <div style={styles.statusCard}>
              <div style={styles.statusIcon}>📅</div>
              <div style={styles.statusContent}>
                <div style={styles.statusLabel}>Member Since</div>
                <div style={styles.statusValue}>
                  {studentData.accountInfo.accountCreated ? 
                    new Date(studentData.accountInfo.accountCreated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short'
                    }) : 
                    'Recently'
                  }
                </div>
              </div>
            </div>
            {studentData.credentials.isTemporary && (
              <div style={{...styles.statusCard, ...styles.warningCard}}>
                <div style={styles.statusIcon}>⚠️</div>
                <div style={styles.statusContent}>
                  <div style={styles.statusLabel}>Password Status</div>
                  <div style={styles.statusValue}>Temporary - Please Update</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Info Row Component
const InfoRow = ({ label, value, icon }) => (
  <div style={styles.infoRow} className="info-row">
    <div style={styles.infoIconContainer}>
      <span style={styles.infoIcon}>{icon}</span>
    </div>
    <div style={styles.infoContent}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  </div>
);

// Enhanced Responsive Styles with Animations [file:138]
const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    padding: '20px',
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
    marginBottom: '30px'
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingDots: {
    display: 'flex',
    gap: '8px',
    marginTop: '20px'
  },
  loadingTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '8px',
    textAlign: 'center'
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
    borderRadius: '20px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    position: 'relative',
    overflow: 'hidden'
  },
  profileSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  avatarContainer: {
    position: 'relative'
  },
  avatar: {
    fontSize: '56px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    borderRadius: '50%',
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
    border: '4px solid rgba(255, 255, 255, 0.8)',
    animation: 'avatarPulse 3s ease-in-out infinite'
  },
  onlineBadge: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    width: '20px',
    height: '20px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    border: '3px solid white',
    animation: 'pulse 2s infinite'
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  studentName: {
    fontSize: '2.2rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
    lineHeight: '1.2'
  },
  studentIdContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  studentIdLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
  },
  studentId: {
    fontSize: '16px',
    color: '#3b82f6',
    fontFamily: 'monospace',
    fontWeight: '700',
    backgroundColor: '#f0f9ff',
    padding: '4px 12px',
    borderRadius: '20px',
    border: '1px solid #bfdbfe'
  },
  courseInfoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  courseIcon: {
    fontSize: '18px'
  },
  courseText: {
    fontSize: '16px',
    color: '#475569',
    fontWeight: '500'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  welcomeMessage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px'
  },
  welcomeText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b'
  },
  lastLogin: {
    fontSize: '14px',
    color: '#64748b'
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
  
  // Main Grid
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '24px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  
  // Card Styles
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  cardTitle: {
    fontSize: '20px',
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
  
  // Badge Styles
  securityBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  verifiedBadge: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  completeBadge: {
    backgroundColor: '#f3e8ff',
    color: '#7c3aed',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  profileBadge: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  
  // Credentials Section
  credentialsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  credentialItem: {
    padding: '20px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease'
  },
  credentialHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  credentialLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  credentialStatus: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  tempStatus: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  credentialValueContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  credentialValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'monospace',
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '2px solid #e5e7eb',
    transition: 'all 0.3s ease'
  },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '90px',
    justifyContent: 'center'
  },
  passwordWarning: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 20%)',
    border: '2px solid #f59e0b',
    borderRadius: '16px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    color: '#92400e',
    fontWeight: '500',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  warningIcon: {
    fontSize: '20px',
    marginTop: '2px'
  },
  
  // Info Styles
  studentInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  infoIconContainer: {
    width: '40px',
    height: '40px',
    backgroundColor: '#f1f5f9',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoIcon: {
    fontSize: '18px'
  },
  infoContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  infoLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  infoValue: {
    fontSize: '15px',
    color: '#1e293b',
    fontWeight: '600',
    lineHeight: '1.4'
  },
  
  // Course Details Grid
  courseDetailsGrid: {
    display: 'grid',
    gap: '16px'
  },
  courseDetailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease'
  },
  courseDetailIcon: {
    fontSize: '24px',
    width: '48px',
    height: '48px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
  },
  courseDetailContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  courseDetailLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  courseDetailValue: {
    fontSize: '16px',
    color: '#1e293b',
    fontWeight: '600'
  },
  
  // Personal Details
  personalDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  
  // Academic Grid
  academicGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  academicItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  academicIcon: {
    fontSize: '20px',
    width: '40px',
    height: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
  },
  academicContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  academicLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  academicValue: {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: '600',
    lineHeight: '1.4'
  },
  
  // Status Grid
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  statusCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease'
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b'
  },
  statusIcon: {
    fontSize: '24px',
    width: '48px',
    height: '48px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
  },
  statusContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statusLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statusValue: {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: '600'
  }
};

// Add the enhanced CSS with animations and responsive design [file:138]
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
    
    @keyframes avatarPulse {
      0%, 100% { box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3); }
      50% { box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5); }
    }
    
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes warningPulse {
      0%, 100% { 
        background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 20%);
        transform: scale(1);
      }
      50% { 
        background: linear-gradient(135deg, #fbbf24 0%, #fef3c7 20%);
        transform: scale(1.02);
      }
    }
    
    .student-dashboard {
      animation: fadeIn 0.6s ease-out;
    }
    
    .dashboard-header {
      animation: slideInUp 0.8s ease-out;
    }
    
    .slide-in {
      animation: slideInUp 0.6s ease-out;
    }
    
    .slide-in:nth-child(2) { animation-delay: 0.1s; }
    .slide-in:nth-child(3) { animation-delay: 0.2s; }
    .slide-in:nth-child(4) { animation-delay: 0.3s; }
    .slide-in:nth-child(5) { animation-delay: 0.4s; }
    .slide-in:nth-child(6) { animation-delay: 0.5s; }
    
    .warning-pulse {
      animation: warningPulse 3s ease-in-out infinite;
    }
    
    .loading-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: white;
      display: inline-block;
      animation: loadingDots 1.4s infinite ease-in-out both;
    }
    
    .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
    .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes loadingDots {
      0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    /* Hover Effects */
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    }
    
    .logout-btn:hover {
      background-color: #dc2626 !important;
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(239, 68, 68, 0.4) !important;
    }
    
    .copy-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
    }
    
    .info-row:hover {
      background-color: #f8fafc;
      transform: translateX(5px);
    }
    
    .credential-item:hover {
      transform: scale(1.02);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
    
    .course-detail-item:hover,
    .academic-item:hover,
    .status-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .student-dashboard .container {
        padding: 16px !important;
      }
      
      .student-dashboard .main-grid {
        grid-template-columns: 1fr !important;
        gap: 16px !important;
      }
      
      .student-dashboard .header {
        flex-direction: column !important;
        text-align: center !important;
        padding: 24px 20px !important;
      }
      
      .student-dashboard .profile-section {
        flex-direction: column !important;
        text-align: center !important;
      }
      
      .student-dashboard .header-actions {
        flex-direction: column !important;
        align-items: center !important;
        gap: 16px !important;
      }
      
      .student-dashboard .welcome-message {
        align-items: center !important;
        text-align: center !important;
      }
      
      .student-dashboard .student-name {
        font-size: 1.8rem !important;
      }
      
      .student-dashboard .card {
        padding: 20px !important;
      }
      
      .student-dashboard .credential-value-container {
        flex-direction: column !important;
        gap: 8px !important;
      }
      
      .student-dashboard .copy-button {
        width: 100% !important;
      }
      
      .student-dashboard .academic-grid {
        grid-template-columns: 1fr !important;
      }
      
      .student-dashboard .status-grid {
        grid-template-columns: 1fr !important;
      }
      
      .student-dashboard .course-details-grid {
        grid-template-columns: 1fr !important;
      }
    }
    
    @media (max-width: 480px) {
      .student-dashboard .container {
        padding: 12px !important;
      }
      
      .student-dashboard .header {
        padding: 20px 16px !important;
      }
      
      .student-dashboard .avatar {
        width: 80px !important;
        height: 80px !important;
        font-size: 40px !important;
      }
      
      .student-dashboard .student-name {
        font-size: 1.5rem !important;
      }
      
      .student-dashboard .card {
        padding: 16px !important;
      }
      
      .student-dashboard .card-title {
        font-size: 18px !important;
      }
      
      .student-dashboard .course-detail-item,
      .student-dashboard .academic-item,
      .student-dashboard .status-card {
        flex-direction: column !important;
        text-align: center !important;
        gap: 8px !important;
      }
    }
    
    /* Large Screen Optimizations */
    @media (min-width: 1200px) {
      .student-dashboard .main-grid {
        grid-template-columns: repeat(3, 1fr) !important;
      }
      
      .student-dashboard .container {
        padding: 32px !important;
      }
    }
    
    /* Print Styles */
    @media print {
      .student-dashboard .logout-btn,
      .student-dashboard .copy-btn {
        display: none !important;
      }
      
      .student-dashboard .card {
        break-inside: avoid !important;
        box-shadow: none !important;
        border: 1px solid #ccc !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default StudentDashboard;
