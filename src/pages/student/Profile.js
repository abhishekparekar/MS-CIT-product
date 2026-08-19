import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { database } from '../../firebase/config';
import { ref, get, update } from 'firebase/database';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    const fetchStudentProfileData = async () => {
      if (!user || !user.studentId) {
        setError('User not authenticated or missing student ID');
        setLoading(false);
        return;
      }

      try {
        // Fetch credentials data (same as StudentDashboard.js)
        const credentialsRef = ref(database, `studentCredentials/${user.studentId}`);
        const credentialsSnapshot = await get(credentialsRef);

        if (!credentialsSnapshot.exists()) {
          setError('Student credentials not found');
          setLoading(false);
          return;
        }

        const credentialsData = credentialsSnapshot.val();

        // Fetch admission applications to get complete data (same as StudentDashboard.js)
        const admissionsRef = ref(database, 'admissionApplications');
        const admissionsSnapshot = await get(admissionsRef);

        let admissionData = null;
        if (admissionsSnapshot.exists()) {
          const allAdmissions = admissionsSnapshot.val();
          const matchingKey = Object.keys(allAdmissions).find(key => {
            const admission = allAdmissions[key];
            return (
              admission.studentId === user.studentId ||
              admission.email === credentialsData.email ||
              (admission.firstName === credentialsData.studentInfo?.firstName && 
               admission.lastName === credentialsData.studentInfo?.lastName)
            );
          });

          if (matchingKey) {
            admissionData = { ...allAdmissions[matchingKey], applicationId: matchingKey };
          }
        }

        // Combine data (same logic as StudentDashboard.js)
        const combinedProfileData = {
          // Basic info
          studentId: user.studentId,
          email: credentialsData.email,
          password: credentialsData.password,
          isTemporary: credentialsData.isTemporary,
          credentialsSent: true,
          credentialsSentAt: credentialsData.createdAt,
          
          // Personal information from both sources
          firstName: credentialsData.studentInfo?.firstName || admissionData?.firstName,
          lastName: credentialsData.studentInfo?.lastName || admissionData?.lastName,
          phone: admissionData?.phone || credentialsData.studentInfo?.phone,
          
          // Academic information
          course: admissionData?.course || credentialsData.studentInfo?.course,
          batch: admissionData?.preferredBatch || credentialsData.studentInfo?.batch,
          rollNumber: credentialsData.studentInfo?.rollNumber || generateRollNumber(admissionData),
          
          // Additional details from admission
          gender: admissionData?.gender,
          dateOfBirth: admissionData?.dateOfBirth,
          address: admissionData?.address,
          city: admissionData?.city,
          state: admissionData?.state,
          zipCode: admissionData?.zipCode,
          qualification: admissionData?.qualification,
          experience: admissionData?.experience,
          previousComputer: admissionData?.previousComputer,
          expectations: admissionData?.expectations,
          
          // Account info
          accountCreated: credentialsData.createdAt,
          lastLogin: credentialsData.lastLogin,
          accountStatus: credentialsData.status,
          
          // Application info
          applicationId: admissionData?.applicationId,
          admissionDate: admissionData?.admissionDate || admissionData?.submittedAt
        };

        setProfileData(combinedProfileData);
        
        // Set edit data
        setEditData({
          firstName: combinedProfileData.firstName || '',
          lastName: combinedProfileData.lastName || '',
          phone: combinedProfileData.phone || '',
          address: combinedProfileData.address || '',
          dateOfBirth: combinedProfileData.dateOfBirth || ''
        });

      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Error loading profile: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfileData();
  }, [user]);

  const generateRollNumber = (studentData) => {
    if (!studentData) return 'Not assigned';
    
    const year = new Date().getFullYear().toString().slice(-2);
    const courseCode = getCourseCode(studentData.course);
    const id = studentData.applicationId?.slice(-4) || Math.floor(Math.random() * 9999).toString().padStart(4, '0');
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
    return labels[course] || course || 'Not specified';
  };

  const handleEditClick = () => {
    setEditData({
      firstName: profileData.firstName || '',
      lastName: profileData.lastName || '',
      phone: profileData.phone || '',
      address: profileData.address || '',
      dateOfBirth: profileData.dateOfBirth || ''
    });
    setEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      // Update studentCredentials
      const credentialsUpdateRef = ref(database, `studentCredentials/${user.studentId}/studentInfo`);
      await update(credentialsUpdateRef, {
        ...editData,
        updatedAt: new Date().toISOString()
      });

      // Also update admission application if we have applicationId
      if (profileData.applicationId) {
        const admissionUpdateRef = ref(database, `admissionApplications/${profileData.applicationId}`);
        await update(admissionUpdateRef, {
          ...editData,
          updatedAt: new Date().toISOString()
        });
      }

      setEditing(false);
      alert('✅ Profile updated successfully!');
      
      // Refresh the data
      window.location.reload();
    } catch (error) {
      alert('❌ Error updating profile: ' + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditData({});
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`✅ ${type} copied to clipboard!`);
    }).catch(() => {
      alert('❌ Failed to copy to clipboard');
    });
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h3>Error Loading Profile</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} style={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>📄</div>
        <h3>No Profile Data</h3>
        <p>No profile information available.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.profileImageContainer}>
          <div style={styles.profileImage}>
            <div style={styles.avatarPlaceholder}>
              {profileData.firstName?.charAt(0)?.toUpperCase() || 
               profileData.email?.charAt(0)?.toUpperCase() || '👤'}
            </div>
          </div>
          <div style={styles.studentBadge}>🎓 Student</div>
        </div>
        <div style={styles.headerInfo}>
          <h1 style={styles.name}>
            {profileData.firstName || 'Student'} {profileData.lastName || 'Profile'}
          </h1>
          <p style={styles.email}>{profileData.email}</p>
          <p style={styles.studentId}>Student ID: {profileData.studentId}</p>
        </div>
        <div style={styles.headerActions}>
          {!editing ? (
            <button onClick={handleEditClick} style={styles.editButton}>
              ✏️ Edit Profile
            </button>
          ) : (
            <div style={styles.editActions}>
              <button onClick={handleSaveEdit} style={styles.saveButton}>
                ✅ Save
              </button>
              <button onClick={handleCancelEdit} style={styles.cancelButton}>
                ❌ Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Login Credentials Section */}
      <div style={styles.credentialsSection}>
        <div style={styles.credentialsHeader}>
          <h2 style={styles.sectionTitle}>🔐 Login Credentials</h2>
          <button 
            onClick={() => setShowCredentials(!showCredentials)}
            style={styles.toggleCredentialsButton}
          >
            {showCredentials ? '🙈 Hide' : '👁️ Show'} Credentials
          </button>
        </div>
        
        {showCredentials && (
          <div style={styles.credentialsContent}>
            <div style={styles.credentialItem}>
              <div style={styles.credentialLabel}>🆔 Student ID</div>
              <div style={styles.credentialValueContainer}>
                <div style={styles.credentialValue}>{profileData.studentId}</div>
                <button 
                  onClick={() => copyToClipboard(profileData.studentId, 'Student ID')}
                  style={styles.copyButton}
                >
                  📋 Copy
                </button>
              </div>
            </div>
            
            <div style={styles.credentialItem}>
              <div style={styles.credentialLabel}>🔑 Password</div>
              <div style={styles.credentialValueContainer}>
                <div style={styles.credentialValue}>{profileData.password}</div>
                <button 
                  onClick={() => copyToClipboard(profileData.password, 'Password')}
                  style={styles.copyButton}
                >
                  📋 Copy
                </button>
              </div>
            </div>
            
            {profileData.isTemporary && (
              <div style={styles.passwordWarning}>
                ⚠️ This is a temporary password. Please change it after your first login for security.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Personal Information Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>👤 Personal Information</h2>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>First Name</label>
            {editing ? (
              <input
                type="text"
                name="firstName"
                value={editData.firstName}
                onChange={handleEditChange}
                style={styles.editInput}
                placeholder="Enter first name"
              />
            ) : (
              <div style={styles.infoValue}>{profileData.firstName || 'Not provided'}</div>
            )}
          </div>

          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>Last Name</label>
            {editing ? (
              <input
                type="text"
                name="lastName"
                value={editData.lastName}
                onChange={handleEditChange}
                style={styles.editInput}
                placeholder="Enter last name"
              />
            ) : (
              <div style={styles.infoValue}>{profileData.lastName || 'Not provided'}</div>
            )}
          </div>

          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>Phone Number</label>
            {editing ? (
              <input
                type="tel"
                name="phone"
                value={editData.phone}
                onChange={handleEditChange}
                style={styles.editInput}
                placeholder="Enter phone number"
              />
            ) : (
              <div style={styles.infoValue}>{profileData.phone || 'Not provided'}</div>
            )}
          </div>

          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>Email</label>
            <div style={styles.infoValue}>{profileData.email}</div>
          </div>

          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>Gender</label>
            <div style={styles.infoValue}>
              {profileData.gender === 'male' ? 'Male' : 
               profileData.gender === 'female' ? 'Female' : 
               profileData.gender === 'other' ? 'Other' : 'Not specified'}
            </div>
          </div>

          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>Date of Birth</label>
            {editing ? (
              <input
                type="date"
                name="dateOfBirth"
                value={editData.dateOfBirth}
                onChange={handleEditChange}
                style={styles.editInput}
              />
            ) : (
              <div style={styles.infoValue}>
                {profileData.dateOfBirth ? 
                  new Date(profileData.dateOfBirth).toLocaleDateString() : 
                  'Not provided'
                }
              </div>
            )}
          </div>

          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>Address</label>
            {editing ? (
              <textarea
                name="address"
                value={editData.address}
                onChange={handleEditChange}
                style={{...styles.editInput, minHeight: '60px'}}
                placeholder="Enter complete address"
              />
            ) : (
              <div style={styles.infoValue}>
                {[profileData.address, profileData.city, profileData.state, profileData.zipCode]
                  .filter(Boolean).join(', ') || 'Not provided'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Academic Information Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>🎓 Academic Information</h2>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>Roll Number</label>
            <div style={styles.infoValue}>{profileData.rollNumber}</div>
          </div>

          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>Course</label>
            <div style={styles.infoValue}>{getCourseLabel(profileData.course)}</div>
          </div>

          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>Batch</label>
            <div style={styles.infoValue}>{profileData.batch || 'Not assigned'}</div>
          </div>

          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>Admission Date</label>
            <div style={styles.infoValue}>
              {profileData.admissionDate ? 
                new Date(profileData.admissionDate).toLocaleDateString() : 
                'Not available'
              }
            </div>
          </div>

          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>Qualification</label>
            <div style={styles.infoValue}>{profileData.qualification || 'Not specified'}</div>
          </div>

          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>Experience</label>
            <div style={styles.infoValue}>{profileData.experience || 'Not specified'}</div>
          </div>

          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>Computer Knowledge</label>
            <div style={styles.infoValue}>
              {profileData.previousComputer ? 
                (profileData.previousComputer.charAt(0).toUpperCase() + profileData.previousComputer.slice(1)) : 
                'Not specified'}
            </div>
          </div>

          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>Expectations</label>
            <div style={styles.infoValue}>{profileData.expectations || 'Not specified'}</div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>⚙️ Account Information</h2>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>Account Created</label>
            <div style={styles.infoValue}>
              {profileData.accountCreated ? 
                new Date(profileData.accountCreated).toLocaleDateString() : 
                'Not available'
              }
            </div>
          </div>

          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>Last Login</label>
            <div style={styles.infoValue}>
              {profileData.lastLogin ? 
                new Date(profileData.lastLogin).toLocaleString() : 
                'Not available'
              }
            </div>
          </div>

          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>Account Status</label>
            <div style={styles.infoValue}>
              <span style={styles.statusBadge}>✅ Active</span>
            </div>
          </div>

          <div style={styles.infoItem}>
            <label style={styles.infoLabel}>Credentials Status</label>
            <div style={styles.infoValue}>
              <span style={styles.successBadge}>
                📧 Sent on {new Date(profileData.credentialsSentAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {profileData.isTemporary && (
            <div style={styles.infoItem}>
              <label style={styles.infoLabel}>Password Status</label>
              <div style={styles.infoValue}>
                <span style={styles.warningBadge}>⚠️ Temporary - Please change password</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: '#f9fafb',
    minHeight: '100vh'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    gap: '16px',
    textAlign: 'center'
  },
  errorIcon: {
    fontSize: '48px'
  },
  retryButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  header: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    marginBottom: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    flexWrap: 'wrap'
  },
  profileImageContainer: {
    position: 'relative'
  },
  profileImage: {
    width: '120px',
    height: '120px',
    borderRadius: '60px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3b82f6',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    fontWeight: '700'
  },
  studentBadge: {
    position: 'absolute',
    bottom: '-5px',
    right: '-5px',
    backgroundColor: '#10b981',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  headerInfo: {
    flex: 1
  },
  name: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1f2937',
    margin: '0 0 8px 0'
  },
  email: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 4px 0'
  },
  studentId: {
    fontSize: '14px',
    color: '#3b82f6',
    fontWeight: '600',
    fontFamily: 'monospace'
  },
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  editButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  editActions: {
    display: 'flex',
    gap: '8px'
  },
  saveButton: {
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  credentialsSection: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginBottom: '30px',
    border: '2px solid #3b82f6'
  },
  credentialsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  toggleCredentialsButton: {
    backgroundColor: '#6b7280',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  credentialsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    animation: 'slideDown 0.3s ease'
  },
  credentialItem: {
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },
  credentialLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  credentialValueContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px'
  },
  credentialValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'monospace',
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #d1d5db'
  },
  copyButton: {
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  passwordWarning: {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    color: '#92400e',
    fontWeight: '500'
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #e5e7eb'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  infoLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  infoValue: {
    fontSize: '16px',
    color: '#1f2937',
    padding: '12px 16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    minHeight: '20px'
  },
  editInput: {
    fontSize: '16px',
    padding: '12px 16px',
    border: '2px solid #3b82f6',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  statusBadge: {
    backgroundColor: '#d1fae5',
    color: '#059669',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600'
  },
  successBadge: {
    backgroundColor: '#d1fae5',
    color: '#059669',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600'
  },
  warningBadge: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600'
  }
};

// Add CSS animations and responsive styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes slideDown {
      from { 
        opacity: 0;
        transform: translateY(-10px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 12px !important;
      }
      
      .header {
        flex-direction: column !important;
        text-align: center !important;
      }
      
      .info-grid {
        grid-template-columns: 1fr !important;
      }
      
      .name {
        font-size: 24px !important;
      }
      
      .credentials-header {
        flex-direction: column !important;
        gap: 10px !important;
        align-items: center !important;
      }
      
      .credential-value-container {
        flex-direction: column !important;
        gap: 8px !important;
      }
    }
    
    .edit-button:hover {
      background-color: #2563eb !important;
      transform: translateY(-2px);
    }
    
    .save-button:hover {
      background-color: #059669 !important;
    }
    
    .cancel-button:hover {
      background-color: #dc2626 !important;
    }
    
    .toggle-credentials-button:hover {
      background-color: #4b5563 !important;
    }
    
    .copy-button:hover {
      background-color: #059669 !important;
      transform: translateY(-1px);
    }
    
    .retry-button:hover {
      background-color: #2563eb !important;
    }
    
    .edit-input:focus {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
  `;
  document.head.appendChild(style);
}

export default Profile;
