import React, { useState, useEffect } from 'react';
import { database } from '../../../firebase/config';
import { ref, push } from 'firebase/database';

const CreateHallTicket = () => {
  const [studentData, setStudentData] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    course: '',
    examName: 'Final Examination',
    examDate: '',
    examTime: '10:00 AM - 01:00 PM',
    venue: 'Main Campus',
    instructions: 'Please bring your ID proof and arrive 30 minutes before the exam.',
    remarks: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);

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
          course: parsed.course
        }));
      } catch (error) {
        console.error('Error parsing student data:', error);
      }
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
    if (!formData.examName.trim()) {
      newErrors.examName = 'Exam name is required';
    }
    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required';
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
      const hallTicketData = {
        studentId: studentData?.id || formData.rollNumber,
        studentName: formData.studentName,
        rollNumber: formData.rollNumber,
        course: formData.course,
        examName: formData.examName,
        examDate: formData.examDate,
        examTime: formData.examTime,
        venue: formData.venue,
        instructions: formData.instructions,
        remarks: formData.remarks,
        createdAt: new Date().toISOString(),
        createdBy: 'franchise'
      };

      const hallTicketsRef = ref(database, 'hallTickets');
      await push(hallTicketsRef, hallTicketData);
      
      setMessage('✅ Hall ticket created and saved successfully!');
      setCreatedTicket(hallTicketData);
      setShowPreview(true);
      
      // Reset form for new entry
      if (!studentData) {
        setFormData({
          studentName: '',
          rollNumber: '',
          course: '',
          examName: 'Final Examination',
          examDate: '',
          examTime: '10:00 AM - 01:00 PM',
          venue: 'Main Campus',
          instructions: 'Please bring your ID proof and arrive 30 minutes before the exam.',
          remarks: ''
        });
      }
      
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error saving hall ticket:', error);
      setMessage('❌ Failed to save hall ticket record');
      setTimeout(() => setMessage(''), 5000);
    }
    setSaving(false);
  };

  const handlePrintTicket = () => {
    const printWindow = document.getElementById('ticket-preview');
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

  const getCourseLabel = (courseValue) => {
    const option = courseOptions.find(opt => opt.value === courseValue);
    return option ? option.label : courseValue;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🎫 Create Hall Ticket</h1>
        <p style={styles.subtitle}>
          {studentData ? 'Generate hall ticket for approved student' : 'Create new hall ticket record'}
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

          {/* Examination Details */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Examination Details</h3>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Exam Name *
                {errors.examName && <span style={styles.errorText}>{errors.examName}</span>}
              </label>
              <input
                type="text"
                name="examName"
                value={formData.examName}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  borderColor: errors.examName ? '#ef4444' : '#d1d5db'
                }}
                placeholder="Enter exam name"
              />
            </div>

            <div style={styles.inputRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Exam Date</label>
                <input
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Exam Time</label>
                <input
                  type="text"
                  name="examTime"
                  value={formData.examTime}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="e.g., 10:00 AM - 01:00 PM"
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Venue *
                {errors.venue && <span style={styles.errorText}>{errors.venue}</span>}
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  borderColor: errors.venue ? '#ef4444' : '#d1d5db'
                }}
                placeholder="Enter exam venue"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Instructions</label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                style={styles.textarea}
                placeholder="Enter exam instructions"
                rows="3"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Remarks (Optional)</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                style={styles.textarea}
                placeholder="Any additional remarks"
                rows="2"
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
            {saving ? '💾 Creating Ticket...' : '🎫 Create Hall Ticket'}
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

      {/* Ticket Preview */}
      {showPreview && createdTicket && (
        <div style={styles.previewSection}>
          <div style={styles.previewHeader}>
            <h2 style={styles.previewTitle}>📄 Hall Ticket Preview</h2>
            <button onClick={handlePrintTicket} style={styles.printPreviewButton}>
              🖨️ Print Ticket
            </button>
          </div>
          
          <div id="ticket-preview" style={styles.ticketPreview}>
            <div style={styles.printArea}>
              <div style={styles.ticketHeader}>
                <h1 style={styles.instituteName}>COMPUTER TRAINING INSTITUTE</h1>
                <h2 style={styles.documentTitle}>HALL TICKET</h2>
              </div>

              <div style={styles.content}>
                <div style={styles.studentInfo}>
                  <div style={styles.infoRow}>
                    <label style={styles.infoLabel}>Student Name:</label>
                    <span style={styles.infoValue}>{createdTicket.studentName}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <label style={styles.infoLabel}>Roll Number:</label>
                    <span style={styles.infoValue}>{createdTicket.rollNumber}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <label style={styles.infoLabel}>Course:</label>
                    <span style={styles.infoValue}>{getCourseLabel(createdTicket.course)}</span>
                  </div>
                </div>

                <div style={styles.examInfo}>
                  <h3 style={styles.examTitle}>Examination Details</h3>
                  <div style={styles.infoRow}>
                    <label style={styles.infoLabel}>Exam Name:</label>
                    <span style={styles.infoValue}>{createdTicket.examName}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <label style={styles.infoLabel}>Date:</label>
                    <span style={styles.infoValue}>{createdTicket.examDate || 'TBA'}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <label style={styles.infoLabel}>Time:</label>
                    <span style={styles.infoValue}>{createdTicket.examTime}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <label style={styles.infoLabel}>Venue:</label>
                    <span style={styles.infoValue}>{createdTicket.venue}</span>
                  </div>
                </div>

                <div style={styles.instructions}>
                  <h3 style={styles.examTitle}>Instructions</h3>
                  <p style={styles.instructionText}>{createdTicket.instructions}</p>
                </div>

                {createdTicket.remarks && (
                  <div style={styles.remarksSection}>
                    <h3 style={styles.examTitle}>Remarks</h3>
                    <p style={styles.instructionText}>{createdTicket.remarks}</p>
                  </div>
                )}

                <div style={styles.footer}>
                  <div style={styles.signature}>
                    <div style={styles.signatureLine}></div>
                    <p>Authorized Signature</p>
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
    borderBottom: '2px solid #3b82f6'
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
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
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
  // Preview Styles
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
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  ticketPreview: {
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  printArea: {
    backgroundColor: '#fff',
    border: '2px solid #000',
    padding: '40px',
    minHeight: '600px'
  },
  ticketHeader: {
    textAlign: 'center',
    borderBottom: '2px solid #000',
    paddingBottom: '20px',
    marginBottom: '30px'
  },
  instituteName: {
    fontSize: '24px',
    fontWeight: '800',
    margin: '0 0 10px 0'
  },
  documentTitle: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
    backgroundColor: '#000',
    color: '#fff',
    padding: '8px 16px',
    display: 'inline-block'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  studentInfo: {
    border: '1px solid #000',
    padding: '20px'
  },
  examInfo: {
    border: '1px solid #000',
    padding: '20px'
  },
  instructions: {
    border: '1px solid #000',
    padding: '20px'
  },
  remarksSection: {
    border: '1px solid #000',
    padding: '20px'
  },
  examTitle: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '15px',
    backgroundColor: '#f0f0f0',
    padding: '8px 12px',
    margin: '-20px -20px 15px -20px'
  },
  infoRow: {
    display: 'flex',
    marginBottom: '12px',
    alignItems: 'center'
  },
  infoLabel: {
    fontWeight: '600',
    minWidth: '150px',
    fontSize: '14px'
  },
  infoValue: {
    fontSize: '14px',
    borderBottom: '1px dotted #000',
    paddingBottom: '2px',
    flex: 1
  },
  instructionText: {
    fontSize: '12px',
    lineHeight: '1.6',
    margin: 0
  },
  footer: {
    marginTop: '40px',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  signature: {
    textAlign: 'center'
  },
  signatureLine: {
    width: '200px',
    height: '1px',
    backgroundColor: '#000',
    marginBottom: '5px'
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
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
    
    .submit-button:hover:not(:disabled) {
      background-color: #2563eb !important;
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4) !important;
    }
    
    .cancel-button:hover {
      background-color: #4b5563 !important;
      transform: translateY(-1px);
    }
    
    .print-preview-button:hover {
      background-color: #2563eb !important;
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(style);
}

export default CreateHallTicket;
