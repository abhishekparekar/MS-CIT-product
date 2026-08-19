import React, { useState, useEffect } from 'react';
import { database } from '../../../firebase/config';
import { ref, push } from 'firebase/database';

const CreateCertificate = () => {
  const [studentData, setStudentData] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    course: '',
    certificateNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    grade: 'A',
    duration: '3 months',
    remarks: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [createdCertificate, setCreatedCertificate] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const student = urlParams.get('student');
    if (student) {
      try {
        const parsed = JSON.parse(decodeURIComponent(student));
        setStudentData(parsed);
        setFormData(prev => ({
          ...prev,
          studentName: `${parsed.firstName} ${parsed.lastName}`,
          rollNumber: parsed.rollNumber,
          course: parsed.course,
          certificateNumber: `CERT${Date.now()}`
        }));
      } catch (error) {
        console.error('Error parsing student data:', error);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        certificateNumber: `CERT${Date.now()}`
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }
    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = 'Roll number is required';
    }
    if (!formData.course) {
      newErrors.course = 'Course selection is required';
    }
    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required';
    }
    if (!formData.grade) {
      newErrors.grade = 'Grade is required';
    }
    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('❌ Please fix the errors below');
      return;
    }

    setSaving(true);
    setMessage('');
    
    try {
      const certificateData = {
        studentId: studentData?.id || formData.rollNumber,
        studentName: formData.studentName,
        rollNumber: formData.rollNumber,
        course: formData.course,
        certificateNumber: formData.certificateNumber,
        issueDate: formData.issueDate,
        grade: formData.grade,
        duration: formData.duration,
        remarks: formData.remarks,
        createdAt: new Date().toISOString(),
        createdBy: 'franchise'
      };

      const certificatesRef = ref(database, 'certificates');
      await push(certificatesRef, certificateData);
      
      setMessage('✅ Certificate created and saved successfully!');
      setCreatedCertificate(certificateData);
      setShowPreview(true);
      
      // Reset form for new entry
      if (!studentData) {
        setFormData({
          studentName: '',
          rollNumber: '',
          course: '',
          certificateNumber: `CERT${Date.now()}`,
          issueDate: new Date().toISOString().split('T')[0],
          grade: 'A',
          duration: '3 months',
          remarks: ''
        });
      }
      
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error saving certificate:', error);
      setMessage('❌ Failed to save certificate record');
      setTimeout(() => setMessage(''), 5000);
    }
    setSaving(false);
  };

  const handlePrintCertificate = () => {
    const printWindow = document.getElementById('certificate-preview');
    if (printWindow) {
      const printContent = printWindow.innerHTML;
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const courseOptions = [
    { value: 'basic-computer', label: 'Basic Computer Course' },
    { value: 'ms-office', label: 'MS Office Suite' },
    { value: 'web-development', label: 'Web Development' },
    { value: 'programming-basics', label: 'Programming Basics' },
    { value: 'data-entry', label: 'Data Entry Specialist' },
    { value: 'digital-marketing', label: 'Digital Marketing' },
    { value: 'graphic-design', label: 'Graphic Design' },
    { value: 'computer-repair', label: 'Computer Hardware & Repair' },
    { value: 'accounting-software', label: 'Accounting Software' },
    { value: 'advanced-excel', label: 'Advanced Excel & Data Analysis' }
  ];

  const gradeOptions = ['A+', 'A', 'B+', 'B', 'C', 'D'];
  const durationOptions = ['1 month', '2 months', '3 months', '4 months', '6 months', '1 year'];

  const getCourseLabel = (courseValue) => {
    const option = courseOptions.find(opt => opt.value === courseValue);
    return option ? option.label : courseValue;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🏆 Create Certificate</h1>
        <p style={styles.subtitle}>
          {studentData ? 'Generate certificate for approved student' : 'Create new certificate record'}
        </p>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          ...styles.message,
          backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
          color: message.includes('✅') ? '#059669' : '#dc2626'
        }}>
          {message}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGrid}>
          {/* Student Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Student Information</h3>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Student Name *
                {errors.studentName && <span style={styles.errorText}>{errors.studentName}</span>}
              </label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  borderColor: errors.studentName ? '#ef4444' : '#d1d5db'
                }}
                placeholder="Enter student's full name"
                disabled={!!studentData}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Roll Number *
                {errors.rollNumber && <span style={styles.errorText}>{errors.rollNumber}</span>}
              </label>
              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  borderColor: errors.rollNumber ? '#ef4444' : '#d1d5db'
                }}
                placeholder="Enter roll number"
                disabled={!!studentData}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Course *
                {errors.course && <span style={styles.errorText}>{errors.course}</span>}
              </label>
              <select
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                style={{
                  ...styles.select,
                  borderColor: errors.course ? '#ef4444' : '#d1d5db'
                }}
                disabled={!!studentData}
              >
                <option value="">Select Course</option>
                {courseOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Certificate Details */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Certificate Details</h3>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Certificate Number</label>
              <input
                type="text"
                name="certificateNumber"
                value={formData.certificateNumber}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="Auto-generated"
                disabled
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Issue Date *
                {errors.issueDate && <span style={styles.errorText}>{errors.issueDate}</span>}
              </label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  borderColor: errors.issueDate ? '#ef4444' : '#d1d5db'
                }}
              />
            </div>

            <div style={styles.inputRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Grade *
                  {errors.grade && <span style={styles.errorText}>{errors.grade}</span>}
                </label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  style={{
                    ...styles.select,
                    borderColor: errors.grade ? '#ef4444' : '#d1d5db'
                  }}
                >
                  {gradeOptions.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Duration *
                  {errors.duration && <span style={styles.errorText}>{errors.duration}</span>}
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  style={{
                    ...styles.select,
                    borderColor: errors.duration ? '#ef4444' : '#d1d5db'
                  }}
                >
                  {durationOptions.map(duration => (
                    <option key={duration} value={duration}>{duration}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Remarks (Optional)</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                style={styles.textarea}
                placeholder="Any additional remarks or notes"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button
            type="submit"
            disabled={saving}
            style={{
              ...styles.submitButton,
              opacity: saving ? 0.7 : 1,
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? '💾 Creating Certificate...' : '🏆 Create Certificate'}
          </button>
          
          <button
            type="button"
            onClick={() => window.history.back()}
            style={styles.cancelButton}
          >
            ❌ Cancel
          </button>
        </div>
      </form>

      {/* Certificate Preview */}
      {showPreview && createdCertificate && (
        <div style={styles.previewSection}>
          <div style={styles.previewHeader}>
            <h2 style={styles.previewTitle}>📄 Certificate Preview</h2>
            <button onClick={handlePrintCertificate} style={styles.printPreviewButton}>
              🖨️ Print Certificate
            </button>
          </div>
          
          <div id="certificate-preview" style={styles.certificatePreview}>
            <div style={styles.certificateContainer}>
              <div style={styles.border}>
                <div style={styles.certHeader}>
                  <h1 style={styles.instituteName}>COMPUTER TRAINING INSTITUTE</h1>
                  <p style={styles.tagline}>Excellence in Computer Education</p>
                </div>

                <div style={styles.certificateTitle}>
                  <h2>CERTIFICATE OF COMPLETION</h2>
                </div>

                <div style={styles.content}>
                  <p style={styles.presentedTo}>This is to certify that</p>
                  
                  <div style={styles.studentName}>
                    {createdCertificate.studentName}
                  </div>
                  
                  <p style={styles.completionText}>
                    has successfully completed the course in
                  </p>
                  
                  <div style={styles.courseName}>
                    {getCourseLabel(createdCertificate.course)}
                  </div>
                  
                  <div style={styles.details}>
                    <p>Duration: {createdCertificate.duration}</p>
                    <p>Grade: {createdCertificate.grade}</p>
                    <p>Roll Number: {createdCertificate.rollNumber}</p>
                  </div>
                  
                  <div style={styles.dateSection}>
                    <p>Date of Issue: {new Date(createdCertificate.issueDate).toLocaleDateString()}</p>
                    <p>Certificate No: {createdCertificate.certificateNumber}</p>
                  </div>

                  {createdCertificate.remarks && (
                    <div style={styles.remarksSection}>
                      <p style={styles.remarksLabel}>Remarks:</p>
                      <p style={styles.remarksText}>{createdCertificate.remarks}</p>
                    </div>
                  )}
                </div>

                <div style={styles.signatures}>
                  <div style={styles.signature}>
                    <div style={styles.signatureLine}></div>
                    <p>Principal</p>
                  </div>
                  <div style={styles.signature}>
                    <div style={styles.signatureLine}></div>
                    <p>Director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: '#f9fafb',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1f2937',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    margin: 0
  },
  message: {
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '24px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '16px'
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '32px',
    marginBottom: '32px'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px',
    paddingBottom: '8px',
    borderBottom: '2px solid #10b981'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  inputRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  errorText: {
    color: '#ef4444',
    fontSize: '12px',
    fontWeight: '500'
  },
  input: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
  },
  select: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  textarea: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s ease',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  actions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  submitButton: {
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    color: '#fff',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  // Certificate Preview Styles
  previewSection: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '16px'
  },
  previewTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },
  printPreviewButton: {
    backgroundColor: '#d4af37',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  certificatePreview: {
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  certificateContainer: {
    backgroundColor: '#fff',
    padding: '40px',
    display: 'flex',
    justifyContent: 'center'
  },
  border: {
    border: '8px solid #d4af37',
    borderImage: 'linear-gradient(45deg, #d4af37, #ffd700) 1',
    padding: '60px 80px',
    maxWidth: '800px',
    width: '100%',
    position: 'relative',
    backgroundColor: '#fffef7'
  },
  certHeader: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  instituteName: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1a365d',
    margin: '0 0 8px 0',
    textTransform: 'uppercase'
  },
  tagline: {
    fontSize: '14px',
    color: '#4a5568',
    margin: 0,
    fontStyle: 'italic'
  },
  certificateTitle: {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '20px 0',
    backgroundColor: '#d4af37',
    color: '#fff',
    margin: '0 -80px 40px -80px'
  },
  content: {
    textAlign: 'center',
    lineHeight: '1.8'
  },
  presentedTo: {
    fontSize: '18px',
    color: '#2d3748',
    margin: '0 0 20px 0'
  },
  studentName: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#1a365d',
    margin: '20px 0',
    textTransform: 'uppercase',
    textDecoration: 'underline',
    textDecorationColor: '#d4af37'
  },
  completionText: {
    fontSize: '18px',
    color: '#2d3748',
    margin: '20px 0'
  },
  courseName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#d4af37',
    margin: '20px 0',
    textTransform: 'uppercase'
  },
  details: {
    margin: '40px 0',
    fontSize: '16px',
    color: '#4a5568'
  },
  dateSection: {
    margin: '40px 0',
    fontSize: '14px',
    color: '#4a5568'
  },
  remarksSection: {
    margin: '30px 0',
    padding: '20px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    textAlign: 'left'
  },
  remarksLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
    margin: '0 0 8px 0'
  },
  remarksText: {
    fontSize: '14px',
    color: '#4a5568',
    margin: 0,
    fontStyle: 'italic'
  },
  signatures: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '60px'
  },
  signature: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#4a5568'
  },
  signatureLine: {
    width: '150px',
    height: '2px',
    backgroundColor: '#000',
    marginBottom: '10px'
  }
};

// Add responsive styles and focus effects
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr !important;
      }
      
      .input-row {
        grid-template-columns: 1fr !important;
      }
      
      .actions {
        flex-direction: column !important;
      }
      
      .container {
        padding: 12px !important;
      }
    }
    
    .input:focus, .select:focus, .textarea:focus {
      border-color: #10b981 !important;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
    }
    
    .submit-button:hover:not(:disabled) {
      background-color: #059669 !important;
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4) !important;
    }
    
    .cancel-button:hover {
      background-color: #4b5563 !important;
      transform: translateY(-1px);
    }
    
    .print-preview-button:hover {
      background-color: #b8860b !important;
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(style);
}

export default CreateCertificate;
