import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/config';
import { ref, get, push, update } from 'firebase/database';
import { useParams } from 'react-router-dom';

const Exam = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Student Info
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    rollNumber: '',
    email: ''
  });
  const [showExam, setShowExam] = useState(false);
  
  // Exam State
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  useEffect(() => {
    let timer;
    if (examStarted && timeLeft > 0 && !examSubmitted) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitExam(true); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, timeLeft, examSubmitted]);

  const fetchExam = async () => {
    try {
      const examRef = ref(database, `exams/${examId}`);
      const snapshot = await get(examRef);
      
      if (snapshot.exists()) {
        const examData = snapshot.val();
        if (!examData.isActive) {
          setError('This exam is no longer active.');
          setLoading(false);
          return;
        }
        setExam(examData);
        setTimeLeft(examData.duration * 60); // Convert minutes to seconds
      } else {
        setError('Exam not found.');
      }
    } catch (error) {
      console.error('Error fetching exam:', error);
      setError('Failed to load exam.');
    }
    setLoading(false);
  };

  const handleStudentInfoChange = (e) => {
    const { name, value } = e.target;
    setStudentInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startExam = () => {
    if (!studentInfo.name.trim() || !studentInfo.rollNumber.trim()) {
      alert('Please fill in your name and roll number');
      return;
    }
    setShowExam(true);
    setExamStarted(true);
  };

  const handleAnswerChange = (questionIndex, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const calculateResult = () => {
    let correctAnswers = 0;
    let totalMarks = 0;
    let obtainedMarks = 0;

    exam.questions.forEach((question, index) => {
      totalMarks += question.marks;
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
        obtainedMarks += question.marks;
      }
    });

    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    const passed = percentage >= exam.passingMarks;

    return {
      correctAnswers,
      totalQuestions: exam.questions.length,
      obtainedMarks,
      totalMarks,
      percentage: percentage.toFixed(2),
      passed,
      grade: getGrade(percentage)
    };
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
  };

  const submitExam = async (autoSubmit = false) => {
    if (submitting) return;
    
    const confirmSubmit = autoSubmit || window.confirm('Are you sure you want to submit the exam? This action cannot be undone.');
    
    if (!confirmSubmit) return;

    setSubmitting(true);
    
    try {
      const examResult = calculateResult();
      
      const submissionData = {
        examId,
        examTitle: exam.title,
        studentInfo,
        answers,
        result: examResult,
        submittedAt: new Date().toISOString(),
        timeTaken: (exam.duration * 60) - timeLeft,
        autoSubmitted: autoSubmit
      };

      // Save exam result
      const resultsRef = ref(database, 'examResults');
      await push(resultsRef, submissionData);

      // Update exam attempts count
      const examRef = ref(database, `exams/${examId}`);
      const examSnapshot = await get(examRef);
      if (examSnapshot.exists()) {
        const currentAttempts = examSnapshot.val().attempts || 0;
        await update(examRef, { attempts: currentAttempts + 1 });
      }

      setResult(examResult);
      setExamSubmitted(true);
      setExamStarted(false);
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam. Please try again.');
    }
    setSubmitting(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading exam...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.close()} style={styles.closeButton}>
          Close Window
        </button>
      </div>
    );
  }

  if (!exam) {
    return (
      <div style={styles.errorContainer}>
        <h2>Exam Not Found</h2>
        <p>The requested exam could not be found.</p>
      </div>
    );
  }

  // Show result screen
  if (examSubmitted && result) {
    return (
      <div style={styles.container}>
        <div style={styles.resultContainer}>
          <div style={styles.resultHeader}>
            <h1 style={styles.resultTitle}>📊 Exam Completed</h1>
            <div style={styles.resultBadge}>
              <span style={{
                ...styles.resultStatus,
                backgroundColor: result.passed ? '#10b981' : '#ef4444'
              }}>
                {result.passed ? '✅ PASSED' : '❌ FAILED'}
              </span>
            </div>
          </div>

          <div style={styles.studentDetails}>
            <h3 style={styles.examTitle}>{exam.title}</h3>
            <div style={styles.studentInfo}>
              <p><strong>Name:</strong> {studentInfo.name}</p>
              <p><strong>Roll Number:</strong> {studentInfo.rollNumber}</p>
              <p><strong>Submitted:</strong> {new Date().toLocaleString()}</p>
            </div>
          </div>

          <div style={styles.resultStats}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{result.correctAnswers}</div>
              <div style={styles.statLabel}>Correct Answers</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{result.totalQuestions}</div>
              <div style={styles.statLabel}>Total Questions</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{result.obtainedMarks}</div>
              <div style={styles.statLabel}>Marks Obtained</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{result.totalMarks}</div>
              <div style={styles.statLabel}>Total Marks</div>
            </div>
          </div>

          <div style={styles.finalResult}>
            <div style={styles.percentageDisplay}>
              <span style={styles.percentage}>{result.percentage}%</span>
              <span style={styles.grade}>Grade: {result.grade}</span>
            </div>
            <p style={styles.passingInfo}>
              Passing Marks: {exam.passingMarks}%
            </p>
          </div>

          <button
            onClick={() => window.close()}
            style={styles.closeResultButton}
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  // Show student info form
  if (!showExam) {
    return (
      <div style={styles.container}>
        <div style={styles.welcomeContainer}>
          <div style={styles.examInfo}>
            <h1 style={styles.examTitle}>{exam.title}</h1>
            <p style={styles.examDescription}>{exam.description}</p>
            
            <div style={styles.examDetails}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Duration:</span>
                <span style={styles.detailValue}>{exam.duration} minutes</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Total Questions:</span>
                <span style={styles.detailValue}>{exam.totalQuestions}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Total Marks:</span>
                <span style={styles.detailValue}>{exam.totalMarks}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Passing Marks:</span>
                <span style={styles.detailValue}>{exam.passingMarks}%</span>
              </div>
            </div>

            <div style={styles.instructions}>
              <h3>Instructions:</h3>
              <p>{exam.instructions}</p>
            </div>
          </div>

          <div style={styles.studentForm}>
            <h3>Student Information</h3>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name *</label>
              <input
                type="text"
                name="name"
                value={studentInfo.name}
                onChange={handleStudentInfoChange}
                style={styles.input}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Roll Number *</label>
              <input
                type="text"
                name="rollNumber"
                value={studentInfo.rollNumber}
                onChange={handleStudentInfoChange}
                style={styles.input}
                placeholder="Enter your roll number"
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email (Optional)</label>
              <input
                type="email"
                name="email"
                value={studentInfo.email}
                onChange={handleStudentInfoChange}
                style={styles.input}
                placeholder="Enter your email"
              />
            </div>
            
            <button onClick={startExam} style={styles.startButton}>
              🚀 Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show exam questions
  return (
    <div style={styles.container}>
      <div style={styles.examContainer}>
        {/* Exam Header */}
        <div style={styles.examHeader}>
          <div style={styles.examHeaderLeft}>
            <h2 style={styles.examTitle}>{exam.title}</h2>
            <p style={styles.studentName}>{studentInfo.name} ({studentInfo.rollNumber})</p>
          </div>
          <div style={styles.examHeaderRight}>
            <div style={styles.timer}>
              <span style={styles.timerLabel}>Time Left:</span>
              <span style={{
                ...styles.timerValue,
                color: timeLeft < 300 ? '#ef4444' : '#059669' // Red when < 5 minutes
              }}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div style={styles.progress}>
              <span style={styles.progressText}>
                {getAnsweredCount()}/{exam.totalQuestions} Answered
              </span>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div style={styles.questionsContainer}>
          {exam.questions.map((question, questionIndex) => (
            <div key={questionIndex} style={styles.questionCard}>
              <div style={styles.questionHeader}>
                <h3 style={styles.questionNumber}>
                  Question {questionIndex + 1}
                  <span style={styles.questionMarks}>({question.marks} marks)</span>
                </h3>
                <div style={styles.questionStatus}>
                  {answers[questionIndex] !== undefined && (
                    <span style={styles.answeredBadge}>✅ Answered</span>
                  )}
                </div>
              </div>
              
              <p style={styles.questionText}>{question.question}</p>
              
              <div style={styles.optionsContainer}>
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    style={{
                      ...styles.optionLabel,
                      backgroundColor: answers[questionIndex] === optionIndex ? '#dbeafe' : 'transparent'
                    }}
                  >
                    <input
                      type="radio"
                      name={`question_${questionIndex}`}
                      value={optionIndex}
                      checked={answers[questionIndex] === optionIndex}
                      onChange={() => handleAnswerChange(questionIndex, optionIndex)}
                      style={styles.optionRadio}
                    />
                    <span style={styles.optionText}>
                      {String.fromCharCode(65 + optionIndex)}. {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div style={styles.submitContainer}>
          <div style={styles.submitInfo}>
            <p style={styles.submitWarning}>
              ⚠️ Make sure you have answered all questions before submitting.
            </p>
            <p style={styles.submitNote}>
              You have answered {getAnsweredCount()} out of {exam.totalQuestions} questions.
            </p>
          </div>
          <button
            onClick={() => submitExam()}
            disabled={submitting}
            style={{
              ...styles.submitButton,
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? '⏳ Submitting...' : '📝 Submit Exam'}
          </button>
        </div>
      </div>
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
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
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
    height: '100vh',
    gap: '20px',
    textAlign: 'center'
  },
  closeButton: {
    backgroundColor: '#6b7280',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600'
  },
  // Welcome Screen Styles
  welcomeContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  },
  examInfo: {
    marginBottom: '40px'
  },
  examTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '16px',
    textAlign: 'center'
  },
  examDescription: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '24px',
    lineHeight: '1.6'
  },
  examDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '24px',
    padding: '20px',
    backgroundColor: '#f3f4f6',
    borderRadius: '12px'
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  detailLabel: {
    fontWeight: '600',
    color: '#374151'
  },
  detailValue: {
    fontWeight: '700',
    color: '#1f2937'
  },
  instructions: {
    padding: '20px',
    backgroundColor: '#dbeafe',
    borderRadius: '12px',
    borderLeft: '4px solid #3b82f6'
  },
  studentForm: {
    borderTop: '2px solid #e5e7eb',
    paddingTop: '32px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  startButton: {
    width: '100%',
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
  // Exam Interface Styles
  examContainer: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  examHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 32px',
    backgroundColor: '#3b82f6',
    color: '#fff'
  },
  examHeaderLeft: {},
  examHeaderRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px'
  },
  studentName: {
    fontSize: '14px',
    margin: 0,
    opacity: 0.9
  },
  timer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  timerLabel: {
    fontSize: '14px'
  },
  timerValue: {
    fontSize: '20px',
    fontWeight: '700',
    fontFamily: 'monospace'
  },
  progress: {},
  progressText: {
    fontSize: '14px',
    opacity: 0.9
  },
  questionsContainer: {
    padding: '32px'
  },
  questionCard: {
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    transition: 'all 0.2s ease'
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  questionNumber: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },
  questionMarks: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: '8px'
  },
  questionStatus: {},
  answeredBadge: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#059669',
    backgroundColor: '#d1fae5',
    padding: '4px 8px',
    borderRadius: '12px'
  },
  questionText: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#374151',
    marginBottom: '20px'
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  optionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  optionRadio: {
    width: '16px',
    height: '16px'
  },
  optionText: {
    fontSize: '14px',
    color: '#374151',
    flex: 1
  },
  submitContainer: {
    padding: '32px',
    borderTop: '2px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },
  submitInfo: {
    marginBottom: '20px',
    textAlign: 'center'
  },
  submitWarning: {
    fontSize: '14px',
    color: '#d97706',
    margin: '0 0 8px 0'
  },
  submitNote: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
  },
  // Result Screen Styles
  resultContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  resultHeader: {
    marginBottom: '32px'
  },
  resultTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '16px'
  },
  resultBadge: {},
  resultStatus: {
    color: '#fff',
    padding: '8px 24px',
    borderRadius: '24px',
    fontSize: '16px',
    fontWeight: '700'
  },
  studentDetails: {
    marginBottom: '32px'
  },
  studentInfo: {
    textAlign: 'left',
    backgroundColor: '#f3f4f6',
    padding: '16px',
    borderRadius: '8px'
  },
  resultStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    marginBottom: '32px'
  },
  statCard: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '2px solid #e5e7eb'
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#3b82f6',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  finalResult: {
    padding: '24px',
    backgroundColor: '#dbeafe',
    borderRadius: '12px',
    marginBottom: '32px'
  },
  percentageDisplay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '12px'
  },
  percentage: {
    fontSize: '48px',
    fontWeight: '900',
    color: '#1f2937'
  },
  grade: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#3b82f6'
  },
  passingInfo: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  },
  closeResultButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  }
};

// Add responsive styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 12px !important;
      }
      
      .exam-details {
        grid-template-columns: 1fr !important;
      }
      
      .exam-header {
        flex-direction: column !important;
        gap: 16px;
      }
      
      .exam-header-left,
      .exam-header-right {
        text-align: center !important;
      }
      
      .result-stats {
        grid-template-columns: 1fr !important;
      }
      
      .percentage-display {
        flex-direction: column !important;
        gap: 12px !important;
      }
    }
    
    .input:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
    
    .start-button:hover {
      background-color: #059669 !important;
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4) !important;
    }
    
    .submit-button:hover:not(:disabled) {
      background-color: #dc2626 !important;
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4) !important;
    }
    
    .option-label:hover {
      border-color: #3b82f6 !important;
      background-color: #f0f9ff !important;
    }
    
    .close-result-button:hover,
    .close-button:hover {
      background-color: #2563eb !important;
    }
  `;
  document.head.appendChild(style);
}

export default Exam;
