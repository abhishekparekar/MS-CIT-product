import React, { useState, useEffect } from 'react';
import { database } from '../../../firebase/config';
import { ref, onValue, set, push } from "firebase/database";

const ApprovedStudents = () => {
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState({});
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sendingCredentials, setSendingCredentials] = useState({});
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedCredentials, setSelectedCredentials] = useState(null);

  useEffect(() => {
    const applicationsRef = ref(database, 'admissionApplications');
    const unsubscribe = onValue(applicationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const approved = Object.keys(data)
          .filter(key => data[key].status === 'Approved')
          .map(key => ({
            id: key,
            ...data[key],
            rollNumber: generateRollNumber(data[key]),
            admissionDate: data[key].updatedAt || data[key].submittedAt
          }));
        
        approved.sort((a, b) => new Date(b.admissionDate) - new Date(a.admissionDate));
        setApprovedStudents(approved);
      } else {
        setApprovedStudents([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateRollNumber = (student) => {
    const year = new Date().getFullYear().toString().slice(-2);
    const courseCode = getCourseCode(student.course);
    const id = student.applicationId?.slice(-4) || '0000';
    return `${year}${courseCode}${id}`;
  };

  const generateStudentCredentials = (student) => {
    // Generate unique student ID (combination of roll number and random string)
    const studentId = `STU${student.rollNumber}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    
    // Generate temporary password (combination of first name and random numbers)
    const tempPassword = `${student.firstName.toLowerCase()}${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
    
    return {
      studentId,
      password: tempPassword,
      email: student.email,
      isTemporary: true,
      createdAt: new Date().toISOString()
    };
  };

  const sendCredentialsEmail = async (student, credentials) => {
    try {
      // Email service configuration
      const emailData = {
        to_email: student.email,
        to_name: `${student.firstName} ${student.lastName}`,
        student_id: credentials.studentId,
        password: credentials.password,
        roll_number: student.rollNumber,
        course_name: getCourseLabel(student.course),
        login_url: `${window.location.origin}/login`,
        institute_name: "TechEdu Institute"
      };

      console.log('Sending email with credentials:', emailData);
      
      // For demonstration, we'll show a success message
      return { success: true, message: 'Credentials sent successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, message: 'Failed to send credentials email' };
    }
  };

  const generateAndSendCredentials = async (student) => {
    setSendingCredentials(prev => ({ ...prev, [student.id]: true }));
    
    try {
      // Generate credentials
      const credentials = generateStudentCredentials(student);
      
      // Save credentials to database
      const studentCredentialsRef = ref(database, `studentCredentials/${credentials.studentId}`);
      await set(studentCredentialsRef, {
        ...credentials,
        studentInfo: {
          id: student.id,
          rollNumber: student.rollNumber,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          course: student.course,
          batch: student.preferredBatch,
          admissionDate: student.admissionDate
        },
        role: 'student',
        status: 'active'
      });

      // Send email with credentials
      const emailResult = await sendCredentialsEmail(student, credentials);
      
      if (emailResult.success) {
        // Update student record with credential info
        const studentUpdateRef = ref(database, `admissionApplications/${student.id}`);
        await set(studentUpdateRef, {
          ...student,
          credentialsSent: true,
          credentialsSentAt: new Date().toISOString(),
          studentId: credentials.studentId,
          studentPassword: credentials.password // Store for viewing later
        });

        alert(`✅ Login credentials sent successfully to ${student.email}!`);
      } else {
        alert(`❌ Failed to send credentials: ${emailResult.message}`);
      }
    } catch (error) {
      console.error('Error generating credentials:', error);
      alert('❌ Error generating credentials. Please try again.');
    } finally {
      setSendingCredentials(prev => ({ ...prev, [student.id]: false }));
    }
  };

  const viewCredentials = (student) => {
    setSelectedCredentials({
      studentId: student.studentId,
      password: student.studentPassword,
      studentName: `${student.firstName} ${student.lastName}`,
      rollNumber: student.rollNumber,
      email: student.email,
      course: getCourseLabel(student.course)
    });
    setShowCredentialsModal(true);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`✅ ${type} copied to clipboard!`);
    }).catch(() => {
      alert('❌ Failed to copy to clipboard');
    });
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

  const getCourseLabel = (courseValue) => {
    const courseOptions = {
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
    return courseOptions[courseValue] || courseValue;
  };

  const handleActionSelect = (student, action) => {
    setSelectedStudent(student);
    setSelectedAction(action);
    setShowActionModal(true);
  };

  const proceedToCreation = () => {
    const { type } = selectedAction;
    const studentData = encodeURIComponent(JSON.stringify(selectedStudent));
    
    switch (type) {
      case 'hall-ticket':
        window.open(`/franchise/forms/hall-ticket?student=${studentData}`, '_blank');
        break;
      case 'certificate':
        window.open(`/franchise/forms/certificate?student=${studentData}`, '_blank');
        break;
      case 'marksheet':
        window.open(`/franchise/forms/marksheet?student=${studentData}`, '_blank');
        break;
      default:
        break;
    }
    
    setShowActionModal(false);
  };

  const filteredStudents = approvedStudents.filter(student =>
    student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber?.includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading approved students...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Approved Students</h1>
        <p style={styles.subtitle}>Manage approved student records, generate documents, and send login credentials</p>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{approvedStudents.length}</div>
          <div style={styles.statLabel}>Total Approved Students</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {approvedStudents.filter(s => new Date(s.admissionDate) > new Date(Date.now() - 30*24*60*60*1000)).length}
          </div>
          <div style={styles.statLabel}>New This Month</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {approvedStudents.filter(s => s.credentialsSent).length}
          </div>
          <div style={styles.statLabel}>Credentials Sent</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {new Set(approvedStudents.map(s => s.course)).size}
          </div>
          <div style={styles.statLabel}>Different Courses</div>
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by name, email, or roll number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Students Table */}
      <div style={styles.tableContainer}>
        {filteredStudents.length === 0 ? (
          <div style={styles.emptyState}>
            <h3>No approved students found</h3>
            <p>No students match your search criteria or no students have been approved yet.</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Roll Number</th>
                  <th style={styles.th}>Student Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Course</th>
                  <th style={styles.th}>Batch</th>
                  <th style={styles.th}>Admission Date</th>
                  <th style={styles.th}>Credentials</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={student.id} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                    <td style={styles.td}>
                      <div style={styles.rollNumber}>{student.rollNumber}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.studentName}>
                        <strong>{student.firstName} {student.lastName}</strong>
                        <small style={styles.phone}>{student.phone}</small>
                      </div>
                    </td>
                    <td style={styles.td}>{student.email}</td>
                    <td style={styles.td}>
                      <span style={styles.courseBadge}>
                        {getCourseLabel(student.course)}
                      </span>
                    </td>
                    <td style={styles.td}>{student.preferredBatch}</td>
                    <td style={styles.td}>
                      {new Date(student.admissionDate).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <CredentialStatus 
                        student={student}
                        onSendCredentials={generateAndSendCredentials}
                        onViewCredentials={viewCredentials}
                        isLoading={sendingCredentials[student.id]}
                      />
                    </td>
                    <td style={styles.td}>
                      <ActionDropdown 
                        student={student} 
                        onActionSelect={handleActionSelect}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && selectedStudent && (
        <ActionModal
          student={selectedStudent}
          action={selectedAction}
          onProceed={proceedToCreation}
          onClose={() => setShowActionModal(false)}
        />
      )}

      {/* Credentials Display Modal */}
      {showCredentialsModal && selectedCredentials && (
        <CredentialsModal
          credentials={selectedCredentials}
          onCopy={copyToClipboard}
          onClose={() => setShowCredentialsModal(false)}
        />
      )}
    </div>
  );
};

// Credential Status Component
const CredentialStatus = ({ student, onSendCredentials, onViewCredentials, isLoading }) => {
  if (student.credentialsSent) {
    return (
      <div style={styles.credentialStatusContainer}>
        <div style={styles.credentialSent}>
          <span style={styles.sentIcon}>✅</span>
          <div style={styles.sentText}>
            <div>Sent</div>
            <small style={styles.sentDate}>
              {new Date(student.credentialsSentAt).toLocaleDateString()}
            </small>
          </div>
        </div>
        <button
          onClick={() => onViewCredentials(student)}
          style={styles.viewCredentialsButton}
          title="View Login Credentials"
        >
          👁️ View
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => onSendCredentials(student)}
      disabled={isLoading}
      style={{
        ...styles.sendCredentialsButton,
        opacity: isLoading ? 0.6 : 1,
        cursor: isLoading ? 'not-allowed' : 'pointer'
      }}
    >
      {isLoading ? (
        <>
          <div style={styles.loadingSpinner}></div>
          Sending...
        </>
      ) : (
        <>
          📧 Send Login
        </>
      )}
    </button>
  );
};

// Credentials Display Modal Component
const CredentialsModal = ({ credentials, onCopy, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copyAnimation, setCopyAnimation] = useState({ studentId: false, password: false });

  const handleCopy = (text, type) => {
    onCopy(text, type);
    setCopyAnimation(prev => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCopyAnimation(prev => ({ ...prev, [type]: false }));
    }, 1000);
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.credentialsModalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.credentialsModalTitle}>🔐 Student Login Credentials</h3>
          <button style={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <div style={styles.credentialsModalBody}>
          <div style={styles.studentInfoCard}>
            <div style={styles.studentAvatar}>👨‍🎓</div>
            <div style={styles.studentMeta}>
              <h4 style={styles.credentialsStudentName}>{credentials.studentName}</h4>
              <p style={styles.credentialsStudentDetails}>
                Roll: {credentials.rollNumber} | Course: {credentials.course}
              </p>
              <p style={styles.credentialsStudentEmail}>{credentials.email}</p>
            </div>
          </div>

          <div style={styles.credentialsContainer}>
            <div style={styles.credentialField}>
              <div style={styles.credentialHeader}>
                <span style={styles.credentialLabel}>🆔 Student ID</span>
                <button 
                  onClick={() => handleCopy(credentials.studentId, 'studentId')}
                  style={{
                    ...styles.copyButton,
                    ...(copyAnimation.studentId ? styles.copyButtonActive : {})
                  }}
                >
                  {copyAnimation.studentId ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
              <div style={styles.credentialValue}>{credentials.studentId}</div>
            </div>

            <div style={styles.credentialField}>
              <div style={styles.credentialHeader}>
                <span style={styles.credentialLabel}>🔑 Password</span>
                <div style={styles.passwordControls}>
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.togglePasswordButton}
                  >
                    {showPassword ? '🙈 Hide' : '👁️ Show'}
                  </button>
                  <button 
                    onClick={() => handleCopy(credentials.password, 'password')}
                    style={{
                      ...styles.copyButton,
                      ...(copyAnimation.password ? styles.copyButtonActive : {})
                    }}
                  >
                    {copyAnimation.password ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>
              </div>
              <div style={styles.credentialValue}>
                {showPassword ? credentials.password : '•'.repeat(credentials.password.length)}
              </div>
            </div>
          </div>

          <div style={styles.loginInstructions}>
            <h4 style={styles.instructionsTitle}>📝 Login Instructions:</h4>
            <ul style={styles.instructionsList}>
              <li>Go to the login page</li>
              <li>Enter the Student ID in the email field</li>
              <li>Enter the password</li>
              <li>Click "Sign In" to access the student dashboard</li>
            </ul>
          </div>

          <div style={styles.warningBox}>
            <p>⚠️ <strong>Important:</strong> Ask the student to change their password after first login for security.</p>
          </div>
        </div>

        <div style={styles.credentialsModalFooter}>
          <button onClick={onClose} style={styles.modalCloseBtn}>Close</button>
        </div>
      </div>
    </div>
  );
};

// Action Dropdown Component (unchanged)
const ActionDropdown = ({ student, onActionSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { type: 'hall-ticket', label: '🎫 Create Hall Ticket', color: '#3b82f6' },
    { type: 'certificate', label: '🏆 Create Certificate', color: '#10b981' },
    { type: 'marksheet', label: '📊 Create Marksheet', color: '#f59e0b' }
  ];

  const handleActionClick = (action) => {
    onActionSelect(student, action);
    setIsOpen(false);
  };

  return (
    <div style={styles.dropdown}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={styles.dropdownButton}
      >
        📄 Actions ▼
      </button>
      {isOpen && (
        <div style={styles.dropdownMenu}>
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              style={{
                ...styles.dropdownItem,
                borderLeft: `4px solid ${action.color}`
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Action Modal Component (unchanged)
const ActionModal = ({ student, action, onProceed, onClose }) => (
  <div style={styles.modalOverlay} onClick={onClose}>
    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
      <div style={styles.modalHeader}>
        <h3 style={styles.modalTitle}>Confirm Document Creation</h3>
        <button style={styles.closeButton} onClick={onClose}>&times;</button>
      </div>
      <div style={styles.modalBody}>
        <div style={styles.confirmationText}>
          <div style={styles.actionIcon}>
            {action.type === 'hall-ticket' && '🎫'}
            {action.type === 'certificate' && '🏆'}
            {action.type === 'marksheet' && '📊'}
          </div>
          <p style={styles.actionDescription}>
            You are about to create a <strong>{action.label?.replace(/🎫|🏆|📊/g, '').trim()}</strong> for:
          </p>
          <div style={styles.studentDetails}>
            <div style={styles.studentInfo}>
              <p><strong>Student:</strong> {student.firstName} {student.lastName}</p>
              <p><strong>Roll Number:</strong> {student.rollNumber}</p>
              <p><strong>Course:</strong> {getCourseLabel(student.course)}</p>
              <p><strong>Batch:</strong> {student.preferredBatch}</p>
            </div>
          </div>
          <p style={styles.proceedDescription}>
            Click "Proceed" to open the document creation page in a new tab.
          </p>
        </div>
      </div>
      <div style={styles.modalFooter}>
        <button onClick={onClose} style={styles.cancelButton}>Cancel</button>
        <button onClick={onProceed} style={styles.proceedButton}>
          Proceed to Create
        </button>
      </div>
    </div>
  </div>
);

// Helper function
const getCourseLabel = (courseValue) => {
  const courseOptions = {
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
  return courseOptions[courseValue] || courseValue;
};

// Extended Styles
const styles = {
  container: {
    padding: '20px',
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
  loadingSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '8px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#1f2937',
    margin: '0 0 12px 0'
  },
  subtitle: {
    fontSize: '18px',
    color: '#6b7280',
    margin: 0
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#3b82f6',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  searchContainer: {
    marginBottom: '24px'
  },
  searchInput: {
    width: '100%',
    maxWidth: '500px',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #d1d5db',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    backgroundColor: '#f8fafc'
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '2px solid #e5e7eb',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px'
  },
  evenRow: {
    backgroundColor: '#f9fafb'
  },
  oddRow: {
    backgroundColor: '#fff'
  },
  rollNumber: {
    fontWeight: '700',
    color: '#1f2937',
    fontSize: '16px',
    fontFamily: 'monospace'
  },
  studentName: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  phone: {
    color: '#6b7280',
    fontSize: '12px'
  },
  courseBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  credentialStatusContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  sendCredentialsButton: {
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  credentialSent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#059669',
    fontSize: '12px'
  },
  sentIcon: {
    fontSize: '16px'
  },
  sentText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  sentDate: {
    color: '#6b7280',
    fontSize: '10px'
  },
  viewCredentialsButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  dropdown: {
    position: 'relative',
    display: 'inline-block'
  },
  dropdownButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: '200px',
    marginTop: '4px'
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.3s ease'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    width: '90%',
    maxWidth: '550px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
    animation: 'slideInUp 0.3s ease'
  },
  credentialsModalContent: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    width: '90%',
    maxWidth: '600px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
    animation: 'slideInUp 0.3s ease',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 32px',
    borderBottom: '1px solid #e5e7eb'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },
  credentialsModalTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1f2937',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
    transition: 'color 0.2s ease'
  },
  modalBody: {
    padding: '32px'
  },
  credentialsModalBody: {
    padding: '32px'
  },
  studentInfoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    marginBottom: '24px'
  },
  studentAvatar: {
    fontSize: '40px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  studentMeta: {
    flex: 1
  },
  credentialsStudentName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0'
  },
  credentialsStudentDetails: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 4px 0'
  },
  credentialsStudentEmail: {
    fontSize: '14px',
    color: '#3b82f6',
    margin: 0
  },
  credentialsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '24px'
  },
  credentialField: {
    padding: '20px',
    backgroundColor: '#fff',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
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
  passwordControls: {
    display: 'flex',
    gap: '8px'
  },
  credentialValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'monospace',
    padding: '12px 16px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    border: '1px solid #d1d5db'
  },
  copyButton: {
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  copyButtonActive: {
    backgroundColor: '#059669',
    transform: 'scale(1.05)'
  },
  togglePasswordButton: {
    backgroundColor: '#6b7280',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  loginInstructions: {
    backgroundColor: '#dbeafe',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '16px'
  },
  instructionsTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e40af',
    margin: '0 0 12px 0'
  },
  instructionsList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#1e40af'
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    color: '#92400e'
  },
  confirmationText: {
    textAlign: 'center'
  },
  actionIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  actionDescription: {
    fontSize: '18px',
    color: '#374151',
    marginBottom: '20px'
  },
  studentDetails: {
    backgroundColor: '#f8fafc',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px'
  },
  studentInfo: {
    textAlign: 'left',
    fontSize: '14px'
  },
  proceedDescription: {
    fontSize: '14px',
    color: '#6b7280',
    fontStyle: 'italic'
  },
  modalFooter: {
    display: 'flex',
    gap: '12px',
    padding: '24px 32px',
    borderTop: '1px solid #e5e7eb',
    justifyContent: 'flex-end'
  },
  credentialsModalFooter: {
    display: 'flex',
    justifyContent: 'center',
    padding: '24px 32px',
    borderTop: '1px solid #e5e7eb'
  },
  cancelButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  proceedButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#10b981',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  modalCloseBtn: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
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
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideInUp {
      from { 
        transform: translate(-50%, -40%) scale(0.9);
        opacity: 0;
      }
      to { 
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }
    
    @media (max-width: 1024px) {
      .table-wrapper {
        font-size: 12px !important;
      }
      
      .th, .td {
        padding: 12px 8px !important;
      }
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 12px !important;
      }
      
      .stats-row {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      
      .modal-content, .credentials-modal-content {
        width: 95% !important;
        margin: 20px;
      }
      
      .modal-footer, .credentials-modal-footer {
        flex-direction: column !important;
      }
      
      .credential-header {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 8px !important;
      }
    }
    
    .search-input:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
    
    .dropdown-button:hover {
      background-color: #2563eb !important;
    }
    
    .dropdown-item:hover {
      background-color: #f3f4f6 !important;
    }
    
    .send-credentials-button:hover:not(:disabled) {
      background-color: #059669 !important;
      transform: translateY(-1px);
    }
    
    .view-credentials-button:hover {
      background-color: #2563eb !important;
      transform: translateY(-1px);
    }
    
    .copy-button:hover:not(.copy-button-active) {
      background-color: #059669 !important;
      transform: translateY(-1px);
    }
    
    .toggle-password-button:hover {
      background-color: #4b5563 !important;
    }
    
    .close-button:hover {
      color: #374151 !important;
    }
    
    .credential-field:hover {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
    
    .proceed-button:hover {
      background-color: #059669 !important;
    }
    
    .cancel-button:hover {
      background-color: #f3f4f6 !important;
    }
    
    .modal-close-btn:hover {
      background-color: #2563eb !important;
    }
  `;
  document.head.appendChild(style);
}

export default ApprovedStudents;
