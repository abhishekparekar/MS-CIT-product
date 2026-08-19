import React, { useState, useEffect } from 'react';
import { database } from '../../../firebase/config';
import { ref, push } from 'firebase/database';

const CreateMarksheet = () => {
  const [studentData, setStudentData] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    course: '',
    subjects: [
      { name: 'Computer Fundamentals', theory: 85, practical: 90, maxMarks: 200 },
      { name: 'MS Office Applications', theory: 88, practical: 92, maxMarks: 200 },
      { name: 'Internet & Email', theory: 90, practical: 95, maxMarks: 200 },
      { name: 'Basic Programming', theory: 75, practical: 80, maxMarks: 200 }
    ],
    examDate: '',
    resultDate: '',
    remarks: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [createdMarksheet, setCreatedMarksheet] = useState(null);

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

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index][field] = parseInt(value) || 0;
    
    // Recalculate total for this subject
    if (field === 'theory' || field === 'practical') {
      newSubjects[index].total = newSubjects[index].theory + newSubjects[index].practical;
    }
    
    setFormData(prev => ({
      ...prev,
      subjects: newSubjects
    }));
  };

  const addSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, { name: '', theory: 0, practical: 0, total: 0, maxMarks: 200 }]
    }));
  };

  const removeSubject = (index) => {
    if (formData.subjects.length > 1) {
      const newSubjects = formData.subjects.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        subjects: newSubjects
      }));
    }
  };

  const calculateTotals = (subjects = formData.subjects) => {
    const totalObtained = subjects.reduce((sum, subject) => sum + (subject.theory + subject.practical), 0);
    const totalMaxMarks = subjects.reduce((sum, subject) => sum + subject.maxMarks, 0);
    const percentage = totalMaxMarks > 0 ? ((totalObtained / totalMaxMarks) * 100).toFixed(2) : 0;
    return { totalObtained, totalMaxMarks, percentage };
  };

  const getGrade = (percentage) => {
    const perc = parseFloat(percentage);
    if (perc >= 90) return 'A+';
    if (perc >= 80) return 'A';
    if (perc >= 70) return 'B+';
    if (perc >= 60) return 'B';
    if (perc >= 50) return 'C';
    return 'F';
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
    if (!formData.examDate) {
      newErrors.examDate = 'Exam date is required';
    }
    if (!formData.resultDate) {
      newErrors.resultDate = 'Result date is required';
    }

    // Validate subjects
    formData.subjects.forEach((subject, index) => {
      if (!subject.name.trim()) {
        newErrors[`subject_${index}_name`] = 'Subject name is required';
      }
    });

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
      const totals = calculateTotals();
      const marksheetRecord = {
        studentId: studentData?.id || formData.rollNumber,
        studentName: formData.studentName,
        rollNumber: formData.rollNumber,
        course: formData.course,
        subjects: formData.subjects,
        examDate: formData.examDate,
        resultDate: formData.resultDate,
        totalObtained: totals.totalObtained,
        totalMaxMarks: totals.totalMaxMarks,
        percentage: totals.percentage,
        grade: getGrade(totals.percentage),
        result: parseFloat(totals.percentage) >= 50 ? 'PASSED' : 'FAILED',
        remarks: formData.remarks,
        createdAt: new Date().toISOString(),
        createdBy: 'franchise'
      };

      const marksheetsRef = ref(database, 'marksheets');
      await push(marksheetsRef, marksheetRecord);
      
      setMessage('✅ Marksheet created and saved successfully!');
      setCreatedMarksheet(marksheetRecord);
      setShowPreview(true);
      
      // Reset form for new entry
      if (!studentData) {
        setFormData({
          studentName: '',
          rollNumber: '',
          course: '',
          subjects: [
            { name: 'Computer Fundamentals', theory: 85, practical: 90, maxMarks: 200 },
            { name: 'MS Office Applications', theory: 88, practical: 92, maxMarks: 200 },
            { name: 'Internet & Email', theory: 90, practical: 95, maxMarks: 200 },
            { name: 'Basic Programming', theory: 75, practical: 80, maxMarks: 200 }
          ],
          examDate: '',
          resultDate: '',
          remarks: ''
        });
      }
      
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error saving marksheet:', error);
      setMessage('❌ Failed to save marksheet record');
      setTimeout(() => setMessage(''), 5000);
    }
    setSaving(false);
  };

  const handlePrintMarksheet = () => {
    const printWindow = document.getElementById('marksheet-preview');
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

  const totals = calculateTotals();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Create Marksheet</h1>
        <p style={styles.subtitle}>
          {studentData ? 'Generate marksheet for approved student' : 'Create new marksheet record'}
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

            <div style={styles.inputRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Exam Date *
                  {errors.examDate && <span style={styles.errorText}>{errors.examDate}</span>}
                </label>
                <input
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    borderColor: errors.examDate ? '#ef4444' : '#d1d5db'
                  }}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Result Date *
                  {errors.resultDate && <span style={styles.errorText}>{errors.resultDate}</span>}
                </label>
                <input
                  type="date"
                  name="resultDate"
                  value={formData.resultDate}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    borderColor: errors.resultDate ? '#ef4444' : '#d1d5db'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Subject Marks */}
          <div style={styles.section}>
            <div style={styles.subjectHeader}>
              <h3 style={styles.sectionTitle}>Subject Marks</h3>
              <button type="button" onClick={addSubject} style={styles.addButton}>
                ➕ Add Subject
              </button>
            </div>
            
            {formData.subjects.map((subject, index) => (
              <div key={index} style={styles.subjectRow}>
                <div style={styles.subjectInfo}>
                  <input
                    type="text"
                    placeholder="Subject name"
                    value={subject.name}
                    onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                    style={{
                      ...styles.input,
                      borderColor: errors[`subject_${index}_name`] ? '#ef4444' : '#d1d5db'
                    }}
                  />
                  {errors[`subject_${index}_name`] && (
                    <span style={styles.errorText}>{errors[`subject_${index}_name`]}</span>
                  )}
                </div>
                <div style={styles.marksInputs}>
                  <div style={styles.markInput}>
                    <label>Theory (100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={subject.theory}
                      onChange={(e) => handleSubjectChange(index, 'theory', e.target.value)}
                      style={styles.numberInput}
                    />
                  </div>
                  <div style={styles.markInput}>
                    <label>Practical (100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={subject.practical}
                      onChange={(e) => handleSubjectChange(index, 'practical', e.target.value)}
                      style={styles.numberInput}
                    />
                  </div>
                  <div style={styles.markInput}>
                    <label>Total</label>
                    <input
                      type="text"
                      value={subject.theory + subject.practical}
                      disabled
                      style={{...styles.numberInput, backgroundColor: '#f3f4f6'}}
                    />
                  </div>
                  <div style={styles.markInput}>
                    <label>Max Marks</label>
                    <input
                      type="number"
                      min="1"
                      value={subject.maxMarks}
                      onChange={(e) => handleSubjectChange(index, 'maxMarks', e.target.value)}
                      style={styles.numberInput}
                    />
                  </div>
                </div>
                {formData.subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubject(index)}
                    style={styles.removeButton}
                    title="Remove subject"
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}

            <div style={styles.totalsDisplay}>
              <div style={styles.totalItem}>
                <span>Total Obtained: <strong>{totals.totalObtained}/{totals.totalMaxMarks}</strong></span>
              </div>
              <div style={styles.totalItem}>
                <span>Percentage: <strong>{totals.percentage}%</strong></span>
              </div>
              <div style={styles.totalItem}>
                <span>Grade: <strong>{getGrade(totals.percentage)}</strong></span>
              </div>
              <div style={styles.totalItem}>
                <span style={{color: parseFloat(totals.percentage) >= 50 ? '#10b981' : '#ef4444'}}>
                  Result: <strong>{parseFloat(totals.percentage) >= 50 ? 'PASSED' : 'FAILED'}</strong>
                </span>
              </div>
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
            {saving ? '💾 Creating Marksheet...' : '📊 Create Marksheet'}
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

      {/* Marksheet Preview */}
      {showPreview && createdMarksheet && (
        <div style={styles.previewSection}>
          <div style={styles.previewHeader}>
            <h2 style={styles.previewTitle}>📄 Marksheet Preview</h2>
            <button onClick={handlePrintMarksheet} style={styles.printPreviewButton}>
              🖨️ Print Marksheet
            </button>
          </div>
          
          <div id="marksheet-preview" style={styles.marksheetPreview}>
            <div style={styles.marksheetContainer}>
              <div style={styles.marksheetHeader}>
                <h1 style={styles.instituteName}>COMPUTER TRAINING INSTITUTE</h1>
                <h2 style={styles.documentTitle}>MARKSHEET</h2>
                <p style={styles.examSession}>Academic Session: 2025</p>
              </div>

              <div style={styles.studentInfo}>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Student Name:</span>
                    <span style={styles.infoValue}>{createdMarksheet.studentName}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Roll Number:</span>
                    <span style={styles.infoValue}>{createdMarksheet.rollNumber}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Course:</span>
                    <span style={styles.infoValue}>{getCourseLabel(createdMarksheet.course)}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Exam Date:</span>
                    <span style={styles.infoValue}>{createdMarksheet.examDate}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Result Date:</span>
                    <span style={styles.infoValue}>{createdMarksheet.resultDate}</span>
                  </div>
                </div>
              </div>

              <div style={styles.marksTable}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.th}>Subject</th>
                      <th style={styles.th}>Theory<br/>(100)</th>
                      <th style={styles.th}>Practical<br/>(100)</th>
                      <th style={styles.th}>Total<br/>({createdMarksheet.subjects[0]?.maxMarks || 200})</th>
                      <th style={styles.th}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {createdMarksheet.subjects.map((subject, index) => (
                      <tr key={index} style={styles.tableRow}>
                        <td style={styles.td}>{subject.name}</td>
                        <td style={styles.td}>{subject.theory}</td>
                        <td style={styles.td}>{subject.practical}</td>
                        <td style={styles.td}>{subject.theory + subject.practical}</td>
                        <td style={styles.td}>{getGrade(((subject.theory + subject.practical) / subject.maxMarks) * 100)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={styles.totalRow}>
                      <td style={styles.totalTd}>TOTAL</td>
                      <td style={styles.totalTd}>-</td>
                      <td style={styles.totalTd}>-</td>
                      <td style={styles.totalTd}>{createdMarksheet.totalObtained}/{createdMarksheet.totalMaxMarks}</td>
                      <td style={styles.totalTd}>{createdMarksheet.grade}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div style={styles.result}>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Total Marks Obtained:</span>
                  <span style={styles.resultValue}>{createdMarksheet.totalObtained} out of {createdMarksheet.totalMaxMarks}</span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Percentage:</span>
                  <span style={styles.resultValue}>{createdMarksheet.percentage}%</span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Overall Grade:</span>
                  <span style={styles.resultValue}>{createdMarksheet.grade}</span>
                </div>
                <div style={styles.resultItem}>
                  <span style={styles.resultLabel}>Result:</span>
                  <span style={{
                    ...styles.resultValue, 
                    color: createdMarksheet.result === 'PASSED' ? '#10b981' : '#ef4444'
                  }}>
                    {createdMarksheet.result}
                  </span>
                </div>
              </div>

              {createdMarksheet.remarks && (
                <div style={styles.remarksSection}>
                  <h3 style={styles.remarksTitle}>Remarks</h3>
                  <p style={styles.remarksText}>{createdMarksheet.remarks}</p>
                </div>
              )}

              <div style={styles.footer}>
                <div style={styles.signatures}>
                  <div style={styles.signature}>
                    <div style={styles.signatureLine}></div>
                    <p>Controller of Examinations</p>
                  </div>
                  <div style={styles.signature}>
                    <div style={styles.signatureLine}></div>
                    <p>Principal</p>
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
    borderBottom: '2px solid #f59e0b'
  },
  subjectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  addButton: {
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
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
  subjectRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#f9fafb'
  },
  subjectInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  marksInputs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px'
  },
  markInput: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  numberInput: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '2px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    textAlign: 'center'
  },
  removeButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  totalsDisplay: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#e0f2fe',
    borderRadius: '8px',
    border: '2px solid #0284c7'
  },
  totalItem: {
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center'
  },
  actions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  submitButton: {
    backgroundColor: '#f59e0b',
    color: '#fff',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
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
    backgroundColor: '#f59e0b',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  marksheetPreview: {
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  marksheetContainer: {
    backgroundColor: '#fff',
    border: '2px solid #000',
    padding: '40px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  marksheetHeader: {
    textAlign: 'center',
    borderBottom: '3px solid #000',
    paddingBottom: '20px',
    marginBottom: '30px'
  },
  instituteName: {
    fontSize: '28px',
    fontWeight: '800',
    margin: '0 0 10px 0',
    textTransform: 'uppercase'
  },
  documentTitle: {
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    backgroundColor: '#000',
    color: '#fff',
    padding: '8px 16px',
    display: 'inline-block'
  },
  examSession: {
    fontSize: '14px',
    margin: 0
  },
  studentInfo: {
    border: '1px solid #000',
    padding: '20px',
    marginBottom: '30px'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px'
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center'
  },
  infoLabel: {
    fontWeight: '600',
    minWidth: '120px',
    fontSize: '14px'
  },
  infoValue: {
    fontSize: '14px',
    borderBottom: '1px dotted #000',
    paddingBottom: '2px',
    flex: 1
  },
  marksTable: {
    marginBottom: '30px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '2px solid #000'
  },
  tableHeader: {
    backgroundColor: '#f0f0f0'
  },
  th: {
    border: '1px solid #000',
    padding: '12px 8px',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '12px'
  },
  tableRow: {},
  td: {
    border: '1px solid #000',
    padding: '10px 8px',
    textAlign: 'center',
    fontSize: '14px'
  },
  totalRow: {
    backgroundColor: '#e0e0e0',
    fontWeight: '700'
  },
  totalTd: {
    border: '1px solid #000',
    padding: '12px 8px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: '700'
  },
  result: {
    border: '2px solid #000',
    padding: '20px',
    marginBottom: '30px',
    backgroundColor: '#f9f9f9'
  },
  resultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    fontSize: '16px'
  },
  resultLabel: {
    fontWeight: '600'
  },
  resultValue: {
    fontWeight: '700'
  },
  remarksSection: {
    border: '1px solid #000',
    padding: '20px',
    marginBottom: '30px',
    backgroundColor: '#f8fafc'
  },
  remarksTitle: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '10px',
    color: '#1f2937'
  },
  remarksText: {
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.5'
  },
  footer: {
    marginTop: '50px'
  },
  signatures: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  signature: {
    textAlign: 'center',
    fontSize: '12px'
  },
  signatureLine: {
    width: '150px',
    height: '1px',
    backgroundColor: '#000',
    marginBottom: '8px'
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
      
      .marks-inputs {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      
      .totals-display {
        grid-template-columns: 1fr !important;
      }
      
      .actions {
        flex-direction: column !important;
      }
      
      .container {
        padding: 12px !important;
      }
      
      .info-grid {
        grid-template-columns: 1fr !important;
      }
    }
    
    .input:focus, .select:focus, .textarea:focus, .number-input:focus {
      border-color: #f59e0b !important;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1) !important;
    }
    
    .submit-button:hover:not(:disabled) {
      background-color: #d97706 !important;
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4) !important;
    }
    
    .cancel-button:hover {
      background-color: #4b5563 !important;
      transform: translateY(-1px);
    }
    
    .print-preview-button:hover {
      background-color: #d97706 !important;
      transform: translateY(-1px);
    }
    
    .add-button:hover {
      background-color: #059669 !important;
    }
    
    .remove-button:hover {
      background-color: #dc2626 !important;
    }
  `;
  document.head.appendChild(style);
}

export default CreateMarksheet;
