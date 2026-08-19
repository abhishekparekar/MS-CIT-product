import React, { useState, useEffect } from 'react';
import { database } from '../../../firebase/config';
import { ref, push, onValue, remove } from 'firebase/database';

const ExamForm = () => {
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    duration: 60, // minutes
    passingMarks: 50, // percentage
    instructions: 'Read all questions carefully before answering. Each question carries equal marks.',
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        marks: 1
      }
    ],
    course: '',
    batch: '',
    isActive: true
  });
  
  const [exams, setExams] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [showExamsList, setShowExamsList] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = () => {
    const examsRef = ref(database, 'exams');
    const unsubscribe = onValue(examsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const examsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        examsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setExams(examsList);
      } else {
        setExams([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExamData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    const newQuestions = [...examData.questions];
    
    if (field === 'question') {
      newQuestions[questionIndex].question = value;
    } else if (field === 'marks') {
      newQuestions[questionIndex].marks = parseInt(value) || 1;
    } else if (field === 'correctAnswer') {
      newQuestions[questionIndex].correctAnswer = parseInt(value);
    }
    
    setExamData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...examData.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    
    setExamData(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const addQuestion = () => {
    setExamData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        marks: 1
      }]
    }));
  };

  const removeQuestion = (index) => {
    if (examData.questions.length > 1) {
      const newQuestions = examData.questions.filter((_, i) => i !== index);
      setExamData(prev => ({
        ...prev,
        questions: newQuestions
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!examData.title.trim()) {
      newErrors.title = 'Exam title is required';
    }
    
    if (!examData.description.trim()) {
      newErrors.description = 'Exam description is required';
    }
    
    if (examData.duration < 5) {
      newErrors.duration = 'Duration must be at least 5 minutes';
    }
    
    if (examData.passingMarks < 1 || examData.passingMarks > 100) {
      newErrors.passingMarks = 'Passing marks must be between 1-100%';
    }
    
    // Validate questions
    examData.questions.forEach((q, index) => {
      if (!q.question.trim()) {
        newErrors[`question_${index}`] = `Question ${index + 1} is required`;
      }
      
      const emptyOptions = q.options.filter(opt => !opt.trim()).length;
      if (emptyOptions > 0) {
        newErrors[`options_${index}`] = `All options for question ${index + 1} are required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalMarks = () => {
    return examData.questions.reduce((total, q) => total + q.marks, 0);
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
      const examRecord = {
        ...examData,
        totalMarks: calculateTotalMarks(),
        totalQuestions: examData.questions.length,
        createdAt: new Date().toISOString(),
        createdBy: 'franchise',
        attempts: 0
      };

      const examsRef = ref(database, 'exams');
      const result = await push(examsRef, examRecord);
      
      setMessage(`✅ Exam created successfully! Exam ID: ${result.key}`);
      
      // Reset form
      setExamData({
        title: '',
        description: '',
        duration: 60,
        passingMarks: 50,
        instructions: 'Read all questions carefully before answering. Each question carries equal marks.',
        questions: [{
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          marks: 1
        }],
        course: '',
        batch: '',
        isActive: true
      });
      
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error creating exam:', error);
      setMessage('❌ Failed to create exam');
      setTimeout(() => setMessage(''), 5000);
    }
    setSaving(false);
  };

  const generateExamLink = (examId) => {
    const baseURL = window.location.origin;
    return `${baseURL}/exam/${examId}`;
  };

  const copyExamLink = (examId) => {
    const link = generateExamLink(examId);
    navigator.clipboard.writeText(link).then(() => {
      alert('Exam link copied to clipboard!');
    });
  };

  const toggleExamStatus = async (examId, currentStatus) => {
    try {
      const examRef = ref(database, `exams/${examId}`);
      await examRef.update({ isActive: !currentStatus });
      setMessage(currentStatus ? '⏸️ Exam deactivated' : '✅ Exam activated');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Failed to update exam status');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteExam = async (examId) => {
    if (window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      try {
        await remove(ref(database, `exams/${examId}`));
        setMessage('✅ Exam deleted successfully');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('❌ Failed to delete exam');
        setTimeout(() => setMessage(''), 3000);
      }
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

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>📝 Exam Management</h1>
        <div style={styles.headerButtons}>
          <button
            onClick={() => setShowExamsList(!showExamsList)}
            style={styles.toggleButton}
          >
            {showExamsList ? '📝 Create New Exam' : '📋 View All Exams'}
          </button>
        </div>
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

      {!showExamsList ? (
        // Create Exam Form
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            {/* Basic Information */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Basic Information</h3>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Exam Title *
                  {errors.title && <span style={styles.errorText}>{errors.title}</span>}
                </label>
                <input
                  type="text"
                  name="title"
                  value={examData.title}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    borderColor: errors.title ? '#ef4444' : '#d1d5db'
                  }}
                  placeholder="Enter exam title"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Description *
                  {errors.description && <span style={styles.errorText}>{errors.description}</span>}
                </label>
                <textarea
                  name="description"
                  value={examData.description}
                  onChange={handleInputChange}
                  style={{
                    ...styles.textarea,
                    borderColor: errors.description ? '#ef4444' : '#d1d5db'
                  }}
                  placeholder="Enter exam description"
                  rows="3"
                />
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Duration (minutes) *
                    {errors.duration && <span style={styles.errorText}>{errors.duration}</span>}
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={examData.duration}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      borderColor: errors.duration ? '#ef4444' : '#d1d5db'
                    }}
                    min="5"
                    max="300"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Passing Marks (%) *
                    {errors.passingMarks && <span style={styles.errorText}>{errors.passingMarks}</span>}
                  </label>
                  <input
                    type="number"
                    name="passingMarks"
                    value={examData.passingMarks}
                    onChange={handleInputChange}
                    style={{
                      ...styles.input,
                      borderColor: errors.passingMarks ? '#ef4444' : '#d1d5db'
                    }}
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div style={styles.inputRow}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Course</label>
                  <select
                    name="course"
                    value={examData.course}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
                    <option value="">Select Course (Optional)</option>
                    {courseOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Batch</label>
                  <input
                    type="text"
                    name="batch"
                    value={examData.batch}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter batch name (Optional)"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Instructions</label>
                <textarea
                  name="instructions"
                  value={examData.instructions}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  placeholder="Enter exam instructions"
                  rows="3"
                />
              </div>

              <div style={styles.checkboxGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={examData.isActive}
                    onChange={handleInputChange}
                    style={styles.checkbox}
                  />
                  <span>Activate exam immediately</span>
                </label>
              </div>
            </div>

            {/* Questions Section */}
            <div style={styles.section}>
              <div style={styles.questionsHeader}>
                <h3 style={styles.sectionTitle}>Questions ({examData.questions.length})</h3>
                <div style={styles.questionsInfo}>
                  <span style={styles.totalMarks}>Total Marks: {calculateTotalMarks()}</span>
                  <button type="button" onClick={addQuestion} style={styles.addButton}>
                    ➕ Add Question
                  </button>
                </div>
              </div>

              {examData.questions.map((question, questionIndex) => (
                <div key={questionIndex} style={styles.questionCard}>
                  <div style={styles.questionHeader}>
                    <h4 style={styles.questionTitle}>Question {questionIndex + 1}</h4>
                    {examData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        style={styles.removeButton}
                        title="Remove question"
                      >
                        ❌
                      </button>
                    )}
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      Question *
                      {errors[`question_${questionIndex}`] && (
                        <span style={styles.errorText}>{errors[`question_${questionIndex}`]}</span>
                      )}
                    </label>
                    <textarea
                      value={question.question}
                      onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                      style={{
                        ...styles.textarea,
                        borderColor: errors[`question_${questionIndex}`] ? '#ef4444' : '#d1d5db'
                      }}
                      placeholder="Enter your question"
                      rows="2"
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      Options *
                      {errors[`options_${questionIndex}`] && (
                        <span style={styles.errorText}>{errors[`options_${questionIndex}`]}</span>
                      )}
                    </label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} style={styles.optionRow}>
                        <span style={styles.optionLabel}>{String.fromCharCode(65 + optionIndex)}.</span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                          style={{
                            ...styles.optionInput,
                            borderColor: errors[`options_${questionIndex}`] ? '#ef4444' : '#d1d5db'
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                        />
                        <input
                          type="radio"
                          name={`correct_${questionIndex}`}
                          checked={question.correctAnswer === optionIndex}
                          onChange={() => handleQuestionChange(questionIndex, 'correctAnswer', optionIndex)}
                          style={styles.radio}
                          title="Mark as correct answer"
                        />
                      </div>
                    ))}
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Marks</label>
                    <input
                      type="number"
                      value={question.marks}
                      onChange={(e) => handleQuestionChange(questionIndex, 'marks', e.target.value)}
                      style={styles.marksInput}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div style={styles.submitSection}>
            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.submitButton,
                opacity: saving ? 0.7 : 1,
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? '💾 Creating Exam...' : '📝 Create Exam'}
            </button>
          </div>
        </form>
      ) : (
        // Exams List
        <div style={styles.examsList}>
          <h3 style={styles.examsListTitle}>All Exams ({exams.length})</h3>
          
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Loading exams...</p>
            </div>
          ) : exams.length === 0 ? (
            <div style={styles.emptyState}>
              <h4>No exams created yet</h4>
              <p>Click "Create New Exam" to get started</p>
            </div>
          ) : (
            <div style={styles.examsGrid}>
              {exams.map(exam => (
                <div key={exam.id} style={styles.examCard}>
                  <div style={styles.examCardHeader}>
                    <h4 style={styles.examCardTitle}>{exam.title}</h4>
                    <div style={styles.examStatus}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: exam.isActive ? '#10b981' : '#ef4444'
                      }}>
                        {exam.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <p style={styles.examDescription}>{exam.description}</p>
                  
                  <div style={styles.examStats}>
                    <div style={styles.statItem}>
                      <span style={styles.statLabel}>Questions:</span>
                      <span style={styles.statValue}>{exam.totalQuestions}</span>
                    </div>
                    <div style={styles.statItem}>
                      <span style={styles.statLabel}>Duration:</span>
                      <span style={styles.statValue}>{exam.duration} min</span>
                    </div>
                    <div style={styles.statItem}>
                      <span style={styles.statLabel}>Total Marks:</span>
                      <span style={styles.statValue}>{exam.totalMarks}</span>
                    </div>
                    <div style={styles.statItem}>
                      <span style={styles.statLabel}>Passing:</span>
                      <span style={styles.statValue}>{exam.passingMarks}%</span>
                    </div>
                  </div>

                  <div style={styles.examLink}>
                    <label style={styles.linkLabel}>Exam Link:</label>
                    <div style={styles.linkContainer}>
                      <input
                        type="text"
                        value={generateExamLink(exam.id)}
                        readOnly
                        style={styles.linkInput}
                      />
                      <button
                        onClick={() => copyExamLink(exam.id)}
                        style={styles.copyButton}
                        title="Copy link"
                      >
                        📋
                      </button>
                    </div>
                  </div>

                  <div style={styles.examActions}>
                    <button
                      onClick={() => toggleExamStatus(exam.id, exam.isActive)}
                      style={{
                        ...styles.actionButton,
                        backgroundColor: exam.isActive ? '#f59e0b' : '#10b981'
                      }}
                    >
                      {exam.isActive ? '⏸️ Deactivate' : '✅ Activate'}
                    </button>
                    <button
                      onClick={() => deleteExam(exam.id)}
                      style={{...styles.actionButton, backgroundColor: '#ef4444'}}
                    >
                      🗑️ Delete
                    </button>
                  </div>

                  <div style={styles.examMeta}>
                    <small>Created: {new Date(exam.createdAt).toLocaleDateString()}</small>
                    {exam.course && <small>Course: {exam.course}</small>}
                  </div>
                </div>
              ))}
            </div>
          )}
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    margin: 0
  },
  headerButtons: {
    display: 'flex',
    gap: '12px'
  },
  toggleButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
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
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
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
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  checkbox: {
    width: '16px',
    height: '16px'
  },
  questionsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  questionsInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  totalMarks: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#059669',
    backgroundColor: '#d1fae5',
    padding: '4px 12px',
    borderRadius: '12px'
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
  questionCard: {
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: '#f9fafb'
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  questionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },
  removeButton: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  optionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px'
  },
  optionLabel: {
    fontSize: '14px',
    fontWeight: '600',
    minWidth: '20px'
  },
  optionInput: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '14px',
    border: '2px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none'
  },
  radio: {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  marksInput: {
    width: '80px',
    padding: '8px 12px',
    fontSize: '14px',
    border: '2px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    textAlign: 'center'
  },
  submitSection: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '20px',
    borderTop: '2px solid #e5e7eb'
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
  // Exams List Styles
  examsList: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  examsListTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '24px',
    textAlign: 'center'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
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
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    color: '#6b7280'
  },
  examsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px'
  },
  examCard: {
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: '#f9fafb'
  },
  examCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  examCardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
    flex: 1
  },
  examStatus: {
    marginLeft: '12px'
  },
  statusBadge: {
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  examDescription: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '16px',
    lineHeight: '1.5'
  },
  examStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '16px'
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px'
  },
  statLabel: {
    fontWeight: '500',
    color: '#6b7280'
  },
  statValue: {
    fontWeight: '600',
    color: '#1f2937'
  },
  examLink: {
    marginBottom: '16px'
  },
  linkLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '4px',
    display: 'block'
  },
  linkContainer: {
    display: 'flex',
    gap: '8px'
  },
  linkInput: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '12px',
    border: '2px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#f3f4f6',
    color: '#6b7280'
  },
  copyButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  examActions: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px'
  },
  actionButton: {
    flex: 1,
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  examMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#6b7280',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '12px'
  }
};

// Add responsive styles and focus effects
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr !important;
      }
      
      .input-row {
        grid-template-columns: 1fr !important;
      }
      
      .exams-grid {
        grid-template-columns: 1fr !important;
      }
      
      .container {
        padding: 12px !important;
      }
      
      .header {
        flex-direction: column !important;
        gap: 16px;
      }
      
      .questions-header {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 12px;
      }
      
      .questions-info {
        flex-direction: column !important;
        align-items: flex-start !important;
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
    
    .toggle-button:hover {
      background-color: #2563eb !important;
    }
    
    .add-button:hover {
      background-color: #059669 !important;
    }
    
    .action-button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
    }
    
    .copy-button:hover {
      background-color: #2563eb !important;
    }
  `;
  document.head.appendChild(style);
}

export default ExamForm;
