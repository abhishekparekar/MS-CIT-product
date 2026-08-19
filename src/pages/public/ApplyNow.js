import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/config';
import { ref, push } from "firebase/database";

const ApplyNow = () => {
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Computer course options
  const courseOptions = [
    { value: 'mscit', label: 'MSCIT (Maharashtra State CIT) - 3 Months' },
    { value: 'ccc', label: 'CCC (Course on Computer Concepts) - 2 Months' },
    { value: 'basic-computer', label: 'Basic Computer Course - 3 Months' },
    { value: 'ms-office', label: 'MS Office Complete - 2 Months' },
    { value: 'advanced-excel', label: 'Advanced Excel & MIS - 1.5 Months' },
    { value: 'tally-gst', label: 'Tally Prime with GST - 2 Months' },
    { value: 'web-development', label: 'Web Development (HTML, CSS, JS) - 3 Months' },
    { value: 'digital-marketing', label: 'Digital Marketing Course - 2 Months' },
    { value: 'programming-c', label: 'Programming in C & C++ - 4 Months' },
    { value: 'java-programming', label: 'Java Programming - 5 Months' }
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
      
    } catch (error) {
      setMessage('❌ Error submitting application. Please try again.');
      console.error('Error:', error);
    }

    setLoading(false);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      paddingTop: '80px', // Account for navbar
    },

    heroSection: {
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      color: 'white',
      padding: isMobile ? '60px 0' : '80px 0',
      textAlign: 'center',
      position: 'relative',
    },

    heroOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    },

    heroContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
      position: 'relative',
      zIndex: 2,
    },

    breadcrumb: {
      fontSize: '0.9rem',
      opacity: '0.7',
      marginBottom: '20px',
      fontWeight: '400',
      color: '#cbd5e1',
    },

    heroTitle: {
      fontSize: isMobile ? '2.2rem' : '3rem',
      fontWeight: '800',
      marginBottom: '20px',
      color: 'white',
    },

    heroSubtitle: {
      fontSize: isMobile ? '1.1rem' : '1.3rem',
      opacity: '0.9',
      maxWidth: '700px',
      margin: '0 auto',
      color: '#cbd5e1',
      lineHeight: '1.6',
    },

    formContainer: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: isMobile ? '40px 20px' : '60px 20px',
    },

    message: {
      padding: isMobile ? '14px 16px' : '16px 20px',
      borderRadius: '8px',
      marginBottom: '30px',
      fontSize: isMobile ? '0.9rem' : '1rem',
      fontWeight: '500',
      border: '1px solid',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },

    successMessage: {
      backgroundColor: '#f0fdf4',
      color: '#065f46',
      borderColor: '#bbf7d0',
    },

    errorMessage: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      borderColor: '#fecaca',
    },

    form: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: isMobile ? '30px 20px' : '40px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e2e8f0',
    },

    section: {
      marginBottom: isMobile ? '35px' : '40px',
      paddingBottom: isMobile ? '25px' : '30px',
      borderBottom: '1px solid #e2e8f0',
    },

    sectionTitle: {
      fontSize: isMobile ? '1.3rem' : '1.5rem',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '25px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },

    sectionIcon: {
      fontSize: '1.2rem',
      color: '#2563eb',
    },

    row: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: isMobile ? '20px' : '25px',
      marginBottom: '20px',
    },

    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
    },

    label: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    errorText: {
      color: '#dc2626',
      fontSize: '0.8rem',
      fontWeight: '500',
    },

    input: {
      padding: isMobile ? '12px 14px' : '14px 16px',
      fontSize: isMobile ? '0.95rem' : '1rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      outline: 'none',
      transition: 'all 0.3s ease',
      backgroundColor: '#f8fafc',
      fontFamily: 'inherit',
    },

    inputError: {
      borderColor: '#dc2626',
      backgroundColor: '#fef2f2',
    },

    select: {
      padding: isMobile ? '12px 14px' : '14px 16px',
      fontSize: isMobile ? '0.95rem' : '1rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      outline: 'none',
      transition: 'all 0.3s ease',
      backgroundColor: '#f8fafc',
      cursor: 'pointer',
      fontFamily: 'inherit',
    },

    textarea: {
      padding: isMobile ? '12px 14px' : '14px 16px',
      fontSize: isMobile ? '0.95rem' : '1rem',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      outline: 'none',
      transition: 'all 0.3s ease',
      backgroundColor: '#f8fafc',
      resize: 'vertical',
      fontFamily: 'inherit',
      minHeight: '100px',
    },

    submitButton: {
      width: '100%',
      padding: isMobile ? '16px 20px' : '18px 24px',
      fontSize: isMobile ? '1rem' : '1.1rem',
      fontWeight: '700',
      color: 'white',
      backgroundColor: '#2563eb',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      marginTop: '20px',
    },

    submitButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none',
    },

    loadingSpinner: {
      width: '20px',
      height: '20px',
      border: '2px solid transparent',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },

    infoBox: {
      background: '#f1f5f9',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '30px',
    },

    infoTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },

    infoText: {
      fontSize: '0.9rem',
      color: '#64748b',
      lineHeight: '1.5',
    },
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .input:focus, .select:focus, .textarea:focus {
      border-color: #2563eb !important;
      background-color: white !important;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
    }
    
    .submit-button:hover:not(:disabled) {
      background-color: #1d4ed8 !important;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4) !important;
    }
    
    .submit-button:active:not(:disabled) {
      transform: translateY(0);
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.container}>
        {/* Hero Section */}
        <section style={styles.heroSection}>
          <div style={styles.heroOverlay}></div>
          <div style={styles.heroContainer}>
            <div style={styles.breadcrumb}>Home • Apply Now</div>
            <h1 style={styles.heroTitle}>Apply for Admission</h1>
            <p style={styles.heroSubtitle}>
              Join our comprehensive computer education programs and take the first step 
              towards enhancing your digital skills and career prospects.
            </p>
          </div>
        </section>

        {/* Application Form */}
        <div style={styles.formContainer}>
          {/* Information Box */}
          <div style={styles.infoBox}>
            <div style={styles.infoTitle}>
              <span>💡</span>
              Application Information
            </div>
            <div style={styles.infoText}>
              Fill out the form below to apply for our computer courses. Our admissions team will 
              review your application and contact you within 2-3 business days to discuss the next steps.
            </div>
          </div>

          {message && (
            <div style={{
              ...styles.message,
              ...(message.includes('Error') ? styles.errorMessage : styles.successMessage)
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Personal Information */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>👤</span>
                Personal Information
              </h3>
              
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    First Name *
                    {errors.firstName && <span style={styles.errorText}>{errors.firstName}</span>}
                  </label>
                  <input
                    style={{
                      ...styles.input,
                      ...(errors.firstName ? styles.inputError : {})
                    }}
                    className="input"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Last Name *
                    {errors.lastName && <span style={styles.errorText}>{errors.lastName}</span>}
                  </label>
                  <input
                    style={{
                      ...styles.input,
                      ...(errors.lastName ? styles.inputError : {})
                    }}
                    className="input"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Email Address *
                    {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                  </label>
                  <input
                    style={{
                      ...styles.input,
                      ...(errors.email ? styles.inputError : {})
                    }}
                    className="input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Phone Number *
                    {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
                  </label>
                  <input
                    style={{
                      ...styles.input,
                      ...(errors.phone ? styles.inputError : {})
                    }}
                    className="input"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Date of Birth *
                    {errors.dateOfBirth && <span style={styles.errorText}>{errors.dateOfBirth}</span>}
                  </label>
                  <input
                    style={{
                      ...styles.input,
                      ...(errors.dateOfBirth ? styles.inputError : {})
                    }}
                    className="input"
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Gender *
                    {errors.gender && <span style={styles.errorText}>{errors.gender}</span>}
                  </label>
                  <select
                    style={{
                      ...styles.select,
                      ...(errors.gender ? styles.inputError : {})
                    }}
                    className="select"
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
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>🏠</span>
                Address Information
              </h3>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Address</label>
                <textarea
                  style={styles.textarea}
                  className="textarea"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your complete address"
                  rows="3"
                />
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>City</label>
                  <input
                    style={styles.input}
                    className="input"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>State</label>
                  <input
                    style={styles.input}
                    className="input"
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>ZIP Code</label>
                  <input
                    style={styles.input}
                    className="input"
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
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>📚</span>
                Course Information
              </h3>
              
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Select Course *
                    {errors.course && <span style={styles.errorText}>{errors.course}</span>}
                  </label>
                  <select
                    style={{
                      ...styles.select,
                      ...(errors.course ? styles.inputError : {})
                    }}
                    className="select"
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

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Preferred Batch *
                    {errors.preferredBatch && <span style={styles.errorText}>{errors.preferredBatch}</span>}
                  </label>
                  <select
                    style={{
                      ...styles.select,
                      ...(errors.preferredBatch ? styles.inputError : {})
                    }}
                    className="select"
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

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Educational Qualification *
                    {errors.qualification && <span style={styles.errorText}>{errors.qualification}</span>}
                  </label>
                  <input
                    style={{
                      ...styles.input,
                      ...(errors.qualification ? styles.inputError : {})
                    }}
                    className="input"
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="e.g., 12th Pass, Graduate, Post Graduate"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Work Experience</label>
                  <input
                    style={styles.input}
                    className="input"
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g., 2 years in Sales, Fresher, etc."
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Previous Computer Knowledge</label>
                <select
                  style={styles.select}
                  className="select"
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

              <div style={styles.inputGroup}>
                <label style={styles.label}>What do you expect from this course?</label>
                <textarea
                  style={styles.textarea}
                  className="textarea"
                  name="expectations"
                  value={formData.expectations}
                  onChange={handleChange}
                  placeholder="Tell us your goals and expectations from this course..."
                  rows="4"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {})
              }}
              className="submit-button"
            >
              {loading && <div style={styles.loadingSpinner}></div>}
              {loading ? 'Submitting Application...' : '📚 Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ApplyNow;
