import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/config';
import { ref, onValue, update, remove, push } from "firebase/database";

// ApplyNow Component for New Admission Form
const ApplyNow = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    course: '',
    qualification: '',
    experience: '',
    preferredBatch: '',
    previousComputer: '',
    expectations: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Computer course options
  const courseOptions = [
    { value: 'basic-computer', label: 'Basic Computer Course (3 months)' },
    { value: 'ms-office', label: 'MS Office Suite (2 months)' },
    { value: 'web-development', label: 'Web Development (6 months)' },
    { value: 'programming-basics', label: 'Programming Basics (4 months)' },
    { value: 'data-entry', label: 'Data Entry Specialist (1 month)' },
    { value: 'digital-marketing', label: 'Digital Marketing (3 months)' },
    { value: 'graphic-design', label: 'Graphic Design (4 months)' },
    { value: 'computer-repair', label: 'Computer Hardware & Repair (2 months)' },
    { value: 'accounting-software', label: 'Accounting Software (Tally/SAP) (3 months)' },
    { value: 'advanced-excel', label: 'Advanced Excel & Data Analysis (2 months)' }
  ];

  const batchOptions = [
    'Morning Batch (9:00 AM - 12:00 PM)',
    'Afternoon Batch (1:00 PM - 4:00 PM)', 
    'Evening Batch (5:00 PM - 8:00 PM)',
    'Weekend Batch (Saturday & Sunday)'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Phone number must be 10 digits';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.course) newErrors.course = 'Please select a course';
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';
    if (!formData.preferredBatch) newErrors.preferredBatch = 'Please select preferred batch';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Please fix the errors below');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Add submission timestamp and status
      const applicationData = {
        ...formData,
        submittedAt: new Date().toISOString(),
        status: 'Pending Review',
        applicationId: Date.now().toString()
      };

      // Save to Firebase Realtime Database
      await push(ref(database, 'admissionApplications'), applicationData);

      setMessage('🎉 Application submitted successfully! We will contact you within 2-3 business days.');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        course: '',
        qualification: '',
        experience: '',
        preferredBatch: '',
        previousComputer: '',
        expectations: ''
      });

      // Call success callback and close after 2 seconds
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
      
    } catch (error) {
      setMessage('❌ Error submitting application. Please try again.');
      console.error('Error:', error);
    }

    setLoading(false);
  };

  return (
    <div style={applyNowStyles.container}>
      <div style={applyNowStyles.header}>
        <h1 style={applyNowStyles.title}>Apply for Computer Classes</h1>
        <p style={applyNowStyles.subtitle}>Join our comprehensive computer training programs and enhance your digital skills</p>
      </div>

      {message && (
        <div style={{
          ...applyNowStyles.message,
          backgroundColor: message.includes('Error') ? '#fee2e2' : '#d1fae5',
          color: message.includes('Error') ? '#dc2626' : '#059669',
          borderLeft: `4px solid ${message.includes('Error') ? '#dc2626' : '#059669'}`
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={applyNowStyles.form}>
        {/* Personal Information */}
        <div style={applyNowStyles.section}>
          <h3 style={applyNowStyles.sectionTitle}>Personal Information</h3>
          
          <div style={applyNowStyles.row}>
            <div style={applyNowStyles.inputGroup}>
              <label style={applyNowStyles.label}>
                First Name *
                {errors.firstName && <span style={applyNowStyles.errorText}>{errors.firstName}</span>}
              </label>
              <input
                style={{...applyNowStyles.input, borderColor: errors.firstName ? '#dc2626' : '#d1d5db'}}
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
              />
            </div>

            <div style={applyNowStyles.inputGroup}>
              <label style={applyNowStyles.label}>
                Last Name *
                {errors.lastName && <span style={applyNowStyles.errorText}>{errors.lastName}</span>}
              </label>
              <input
                style={{...applyNowStyles.input, borderColor: errors.lastName ? '#dc2626' : '#d1d5db'}}
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div style={applyNowStyles.row}>
            <div style={applyNowStyles.inputGroup}>
              <label style={applyNowStyles.label}>
                Email Address *
                {errors.email && <span style={applyNowStyles.errorText}>{errors.email}</span>}
              </label>
              <input
                style={{...applyNowStyles.input, borderColor: errors.email ? '#dc2626' : '#d1d5db'}}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
              />
            </div>

            <div style={applyNowStyles.inputGroup}>
              <label style={applyNowStyles.label}>
                Phone Number *
                {errors.phone && <span style={applyNowStyles.errorText}>{errors.phone}</span>}
              </label>
              <input
                style={{...applyNowStyles.input, borderColor: errors.phone ? '#dc2626' : '#d1d5db'}}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
              />
            </div>
          </div>

          <div style={applyNowStyles.row}>
            <div style={applyNowStyles.inputGroup}>
              <label style={applyNowStyles.label}>
                Date of Birth *
                {errors.dateOfBirth && <span style={applyNowStyles.errorText}>{errors.dateOfBirth}</span>}
              </label>
              <input
                style={{...applyNowStyles.input, borderColor: errors.dateOfBirth ? '#dc2626' : '#d1d5db'}}
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div style={applyNowStyles.inputGroup}>
              <label style={applyNowStyles.label}>
                Gender *
                {errors.gender && <span style={applyNowStyles.errorText}>{errors.gender}</span>}
              </label>
              <select
                style={{...applyNowStyles.select, borderColor: errors.gender ? '#dc2626' : '#d1d5db'}}
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div style={applyNowStyles.section}>
          <h3 style={applyNowStyles.sectionTitle}>Address Information</h3>
          
          <div style={applyNowStyles.inputGroup}>
            <label style={applyNowStyles.label}>Address</label>
            <textarea
              style={applyNowStyles.textarea}
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your complete address"
              rows="3"
            />
          </div>

          <div style={applyNowStyles.row}>
            <div style={applyNowStyles.inputGroup}>
              <label style={applyNowStyles.label}>City</label>
              <input
                style={applyNowStyles.input}
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
            </div>

            <div style={applyNowStyles.inputGroup}>
              <label style={applyNowStyles.label}>State</label>
              <input
                style={applyNowStyles.input}
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
              />
            </div>

            <div style={applyNowStyles.inputGroup}>
              <label style={applyNowStyles.label}>ZIP Code</label>
              <input
                style={applyNowStyles.input}
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="Enter ZIP code"
              />
            </div>
          </div>
        </div>

        {/* Course Information */}
        <div style={applyNowStyles.section}>
          <h3 style={applyNowStyles.sectionTitle}>Course Information</h3>
          
          <div style={applyNowStyles.row}>
            <div style={applyNowStyles.inputGroup}>
              <label style={applyNowStyles.label}>
                Select Course *
                {errors.course && <span style={applyNowStyles.errorText}>{errors.course}</span>}
              </label>
              <select
                style={{...applyNowStyles.select, borderColor: errors.course ? '#dc2626' : '#d1d5db'}}
                name="course"
                value={formData.course}
                onChange={handleChange}
              >
                <option value="">Choose a Course</option>
                {courseOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={applyNowStyles.inputGroup}>
              <label style={applyNowStyles.label}>
                Preferred Batch *
                {errors.preferredBatch && <span style={applyNowStyles.errorText}>{errors.preferredBatch}</span>}
              </label>
              <select
                style={{...applyNowStyles.select, borderColor: errors.preferredBatch ? '#dc2626' : '#d1d5db'}}
                name="preferredBatch"
                value={formData.preferredBatch}
                onChange={handleChange}
              >
                <option value="">Select Batch Timing</option>
                {batchOptions.map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={applyNowStyles.row}>
            <div style={applyNowStyles.inputGroup}>
              <label style={applyNowStyles.label}>
                Educational Qualification *
                {errors.qualification && <span style={applyNowStyles.errorText}>{errors.qualification}</span>}
              </label>
              <input
                style={{...applyNowStyles.input, borderColor: errors.qualification ? '#dc2626' : '#d1d5db'}}
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="e.g., 12th Pass, Graduate, Post Graduate"
              />
            </div>

            <div style={applyNowStyles.inputGroup}>
              <label style={applyNowStyles.label}>Work Experience</label>
              <input
                style={applyNowStyles.input}
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g., 2 years in Sales, Fresher, etc."
              />
            </div>
          </div>

          <div style={applyNowStyles.inputGroup}>
            <label style={applyNowStyles.label}>Previous Computer Knowledge</label>
            <select
              style={applyNowStyles.select}
              name="previousComputer"
              value={formData.previousComputer}
              onChange={handleChange}
            >
              <option value="">Select your current level</option>
              <option value="none">No Computer Knowledge</option>
              <option value="basic">Basic (Can use mouse/keyboard)</option>
              <option value="intermediate">Intermediate (Basic software knowledge)</option>
              <option value="advanced">Advanced (Good with multiple software)</option>
            </select>
          </div>

          <div style={applyNowStyles.inputGroup}>
            <label style={applyNowStyles.label}>What do you expect from this course?</label>
            <textarea
              style={applyNowStyles.textarea}
              name="expectations"
              value={formData.expectations}
              onChange={handleChange}
              placeholder="Tell us your goals and expectations..."
              rows="4"
            />
          </div>
        </div>

        <div style={applyNowStyles.buttonRow}>
          <button 
            type="button" 
            onClick={onClose}
            style={applyNowStyles.cancelButton}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...applyNowStyles.submitButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Submitting Application...' : '📚 Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

const ApplicationForm = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewAdmissionModal, setShowNewAdmissionModal] = useState(false);

  useEffect(() => {
    const applicationsRef = ref(database, 'admissionApplications');
    const unsubscribe = onValue(applicationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const applicationsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        // Sort by submission date (newest first)
        applicationsList.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        setApplications(applicationsList);
      } else {
        setApplications([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateApplicationStatus = async (id, newStatus) => {
    try {
      await update(ref(database, `admissionApplications/${id}`), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      alert('Error updating status');
    }
  };

  const deleteApplication = async (id) => {
    if (window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      try {
        await remove(ref(database, `admissionApplications/${id}`));
      } catch (error) {
        alert('Error deleting application');
      }
    }
  };

  const openModal = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedApplication(null);
    setShowModal(false);
  };

  const openNewAdmissionModal = () => {
    setShowNewAdmissionModal(true);
  };

  const closeNewAdmissionModal = () => {
    setShowNewAdmissionModal(false);
  };

  const handleNewAdmissionSuccess = () => {
    // The applications will be automatically updated via the onValue listener
    // We can show a success message or perform any additional actions here
    console.log('New admission added successfully');
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>Admission Applications</h1>
            <p style={styles.subtitle}>Manage and review student admission requests</p>
          </div>
          <button 
            onClick={openNewAdmissionModal}
            style={styles.newAdmissionButton}
          >
            ➕ New Admission
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <StatCard 
          title="Total Applications" 
          count={applications.length}
          color="#3b82f6"
          icon="📋"
        />
        <StatCard 
          title="Pending Review" 
          count={applications.filter(app => app.status === 'Pending Review').length}
          color="#f59e0b"
          icon="⏳"
        />
        <StatCard 
          title="Approved" 
          count={applications.filter(app => app.status === 'Approved').length}
          color="#10b981"
          icon="✅"
        />
        <StatCard 
          title="Rejected" 
          count={applications.filter(app => app.status === 'Rejected').length}
          color="#ef4444"
          icon="❌"
        />
      </div>

      {/* Controls */}
      <div style={styles.controlsBar}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Applications Table */}
      <div style={styles.tableContainer}>
        {filteredApplications.length === 0 ? (
          <div style={styles.emptyState}>
            <h3>No applications found</h3>
            <p>No applications match your current search or filter criteria.</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Course</th>
                  <th style={styles.th}>Submitted</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application, index) => (
                  <tr key={application.id} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                    <td style={styles.td}>
                      <div style={styles.nameCell}>
                        <strong>{application.firstName} {application.lastName}</strong>
                        <small style={styles.applicationId}>ID: {application.applicationId}</small>
                      </div>
                    </td>
                    <td style={styles.td}>{application.email}</td>
                    <td style={styles.td}>{application.phone}</td>
                    <td style={styles.td}>
                      <span style={styles.courseBadge}>
                        {getCourseLabel(application.course)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(application.submittedAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(application.status),
                        color: '#fff'
                      }}>
                        {application.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => openModal(application)}
                          style={{...styles.actionBtn, backgroundColor: '#3b82f6'}}
                          title="View Details"
                        >
                          👁️
                        </button>
                        <select
                          value={application.status}
                          onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                          style={styles.statusSelect}
                          title="Change Status"
                        >
                          <option value="Pending Review">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                        <button
                          onClick={() => deleteApplication(application.id)}
                          style={{...styles.actionBtn, backgroundColor: '#ef4444'}}
                          title="Delete Application"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {showModal && selectedApplication && (
        <ApplicationModal 
          application={selectedApplication}
          onClose={closeModal}
          onStatusUpdate={updateApplicationStatus}
        />
      )}

      {/* New Admission Modal */}
      {showNewAdmissionModal && (
        <div style={styles.modalOverlay} onClick={closeNewAdmissionModal}>
          <div style={styles.newAdmissionModalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>New Admission Application</h2>
              <button style={styles.closeButton} onClick={closeNewAdmissionModal}>&times;</button>
            </div>
            <div style={styles.newAdmissionModalBody}>
              <ApplyNow 
                onClose={closeNewAdmissionModal}
                onSuccess={handleNewAdmissionSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, count, color, icon }) => (
  <div style={{...styles.statCard, borderLeft: `4px solid ${color}`}}>
    <div style={styles.statContent}>
      <div>
        <div style={styles.statTitle}>{title}</div>
        <div style={{...styles.statCount, color}}>{count}</div>
      </div>
      <div style={{...styles.statIcon, color}}>{icon}</div>
    </div>
  </div>
);

// Application Modal Component
const ApplicationModal = ({ application, onClose, onStatusUpdate }) => (
  <div style={styles.modalOverlay} onClick={onClose}>
    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
      <div style={styles.modalHeader}>
        <h2 style={styles.modalTitle}>Application Details</h2>
        <button style={styles.closeButton} onClick={onClose}>&times;</button>
      </div>

      <div style={styles.modalBody}>
        <div style={styles.detailsGrid}>
          <DetailRow label="Full Name" value={`${application.firstName} ${application.lastName}`} />
          <DetailRow label="Email" value={application.email} />
          <DetailRow label="Phone" value={application.phone} />
          <DetailRow label="Date of Birth" value={application.dateOfBirth} />
          <DetailRow label="Gender" value={application.gender} />
          <DetailRow label="Address" value={`${application.address}, ${application.city}, ${application.state} ${application.zipCode}`} />
          <DetailRow label="Course" value={getCourseLabel(application.course)} />
          <DetailRow label="Preferred Batch" value={application.preferredBatch} />
          <DetailRow label="Qualification" value={application.qualification} />
          <DetailRow label="Experience" value={application.experience || 'Not specified'} />
          <DetailRow label="Computer Knowledge" value={application.previousComputer || 'Not specified'} />
          <DetailRow label="Expectations" value={application.expectations || 'Not specified'} />
          <DetailRow label="Submitted Date" value={new Date(application.submittedAt).toLocaleString()} />
          <DetailRow label="Current Status" value={application.status} />
        </div>
      </div>

      <div style={styles.modalFooter}>
        <select
          value={application.status}
          onChange={(e) => {
            onStatusUpdate(application.id, e.target.value);
            onClose();
          }}
          style={styles.statusUpdateSelect}
        >
          <option value="Pending Review">Pending Review</option>
          <option value="Approved">Approve Application</option>
          <option value="Rejected">Reject Application</option>
        </select>
        <button onClick={onClose} style={styles.modalCloseBtn}>Close</button>
      </div>
    </div>
  </div>
);

// Detail Row Component
const DetailRow = ({ label, value }) => (
  <div style={styles.detailRow}>
    <strong style={styles.detailLabel}>{label}:</strong>
    <span style={styles.detailValue}>{value}</span>
  </div>
);

// Helper Functions
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

const getStatusColor = (status) => {
  switch (status) {
    case 'Approved': return '#10b981';
    case 'Rejected': return '#ef4444';
    case 'Pending Review': return '#f59e0b';
    default: return '#6b7280';
  }
};

// Styles for ApplicationForm
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
  header: {
    marginBottom: '40px',
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
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
  newAdmissionButton: {
    padding: '14px 28px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#10b981',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  statContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statTitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statCount: {
    fontSize: '32px',
    fontWeight: '800'
  },
  statIcon: {
    fontSize: '32px'
  },
  controlsBar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  searchContainer: {
    flex: 1,
    minWidth: '300px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #d1d5db',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  filterSelect: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #d1d5db',
    borderRadius: '12px',
    outline: 'none',
    backgroundColor: '#fff',
    cursor: 'pointer'
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
  nameCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  applicationId: {
    color: '#6b7280',
    fontSize: '12px'
  },
  courseBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  actionBtn: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#fff',
    transition: 'all 0.2s ease'
  },
  statusSelect: {
    padding: '6px 8px',
    fontSize: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer'
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
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
  },
  newAdmissionModalContent: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    width: '95%',
    maxWidth: '1000px',
    maxHeight: '95vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
  },
  newAdmissionModalBody: {
    maxHeight: 'calc(95vh - 80px)',
    overflowY: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 32px',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    backgroundColor: '#fff',
    zIndex: 10
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px'
  },
  modalBody: {
    padding: '32px'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px'
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  },
  detailLabel: {
    color: '#374151',
    fontSize: '14px'
  },
  detailValue: {
    color: '#1f2937',
    fontSize: '16px'
  },
  modalFooter: {
    padding: '24px 32px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    gap: '16px',
    justifyContent: 'flex-end'
  },
  statusUpdateSelect: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  modalCloseBtn: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer'
  }
};

// Styles for ApplyNow form
const applyNowStyles = {
  container: {
    maxWidth: '100%',
    margin: '0',
    padding: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: '#f9fafb'
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    margin: '0 0 12px 0'
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    margin: 0
  },
  message: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    fontSize: 16,
    fontWeight: '500'
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  },
  section: {
    marginBottom: 30,
    paddingBottom: 24,
    borderBottom: '1px solid #e5e7eb'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
    paddingBottom: 8,
    borderBottom: '2px solid #3b82f6'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 16,
    marginBottom: 16
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '500'
  },
  input: {
    padding: '10px 12px',
    fontSize: 14,
    border: '2px solid #d1d5db',
    borderRadius: 8,
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: '#fff'
  },
  select: {
    padding: '10px 12px',
    fontSize: 14,
    border: '2px solid #d1d5db',
    borderRadius: 8,
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: '#fff',
    cursor: 'pointer'
  },
  textarea: {
    padding: '10px 12px',
    fontSize: 14,
    border: '2px solid #d1d5db',
    borderRadius: 8,
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: '#fff',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  buttonRow: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    padding: '14px 24px',
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  submitButton: {
    padding: '14px 24px',
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
  }
};

// Add CSS for responsive design and animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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
      
      .stats-grid {
        grid-template-columns: 1fr !important;
      }
      
      .controls-bar {
        flex-direction: column !important;
        align-items: stretch !important;
      }
      
      .search-container {
        min-width: auto !important;
      }
      
      .details-grid {
        grid-template-columns: 1fr !important;
      }
      
      .modal-content, .new-admission-modal-content {
        width: 95% !important;
        margin: 20px;
      }
      
      .modal-footer {
        flex-direction: column !important;
      }

      .header-content {
        flex-direction: column !important;
        text-align: center !important;
      }

      .new-admission-button {
        align-self: center !important;
      }

      .button-row {
        flex-direction: column-reverse !important;
      }
    }
    
    .search-input:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
    
    .action-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
    }

    .new-admission-button:hover {
      background-color: #059669 !important;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4) !important;
    }

    .input:focus, .select:focus, .textarea:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
    
    .submit-button:hover:not(:disabled) {
      background-color: #2563eb !important;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.5) !important;
    }

    .cancel-button:hover {
      background-color: #f3f4f6 !important;
      border-color: #d1d5db !important;
    }
  `;
  document.head.appendChild(style);
}

export default ApplicationForm;
