import React, { useState } from 'react';
import { database } from '../../firebase/config';
import { ref, push } from "firebase/database";

const Receipt = () => {
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
      
    } catch (error) {
      setMessage('❌ Error submitting application. Please try again.');
      console.error('Error:', error);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Apply for Computer Classes</h1>
        <p style={styles.subtitle}>Join our comprehensive computer training programs and enhance your digital skills</p>
      </div>

      {message && (
        <div style={{
          ...styles.message,
          backgroundColor: message.includes('Error') ? '#fee2e2' : '#d1fae5',
          color: message.includes('Error') ? '#dc2626' : '#059669',
          borderLeft: `4px solid ${message.includes('Error') ? '#dc2626' : '#059669'}`
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Personal Information */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Personal Information</h3>
          
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                First Name *
                {errors.firstName && <span style={styles.errorText}>{errors.firstName}</span>}
              </label>
              <input
                style={{...styles.input, borderColor: errors.firstName ? '#dc2626' : '#d1d5db'}}
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
                style={{...styles.input, borderColor: errors.lastName ? '#dc2626' : '#d1d5db'}}
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
                style={{...styles.input, borderColor: errors.email ? '#dc2626' : '#d1d5db'}}
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
                style={{...styles.input, borderColor: errors.phone ? '#dc2626' : '#d1d5db'}}
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
                style={{...styles.input, borderColor: errors.dateOfBirth ? '#dc2626' : '#d1d5db'}}
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
                style={{...styles.select, borderColor: errors.gender ? '#dc2626' : '#d1d5db'}}
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
          <h3 style={styles.sectionTitle}>Address Information</h3>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Address</label>
            <textarea
              style={styles.textarea}
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
          <h3 style={styles.sectionTitle}>Course Information</h3>
          
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Select Course *
                {errors.course && <span style={styles.errorText}>{errors.course}</span>}
              </label>
              <select
                style={{...styles.select, borderColor: errors.course ? '#dc2626' : '#d1d5db'}}
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
                style={{...styles.select, borderColor: errors.preferredBatch ? '#dc2626' : '#d1d5db'}}
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
                style={{...styles.input, borderColor: errors.qualification ? '#dc2626' : '#d1d5db'}}
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
              name="expectations"
              value={formData.expectations}
              onChange={handleChange}
              placeholder="Tell us your goals and expectations..."
              rows="4"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            ...styles.submitButton,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Submitting Application...' : '📚 Submit Application'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: '#f9fafb'
  },
  header: {
    textAlign: 'center',
    marginBottom: 40,
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 20,
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1f2937',
    margin: '0 0 12px 0'
  },
  subtitle: {
    fontSize: 18,
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
    padding: 40,
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  },
  section: {
    marginBottom: 40,
    paddingBottom: 32,
    borderBottom: '1px solid #e5e7eb'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 24,
    paddingBottom: 8,
    borderBottom: '2px solid #3b82f6'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 20,
    marginBottom: 20
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
    padding: '12px 16px',
    fontSize: 16,
    border: '2px solid #d1d5db',
    borderRadius: 12,
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: '#fff'
  },
  select: {
    padding: '12px 16px',
    fontSize: 16,
    border: '2px solid #d1d5db',
    borderRadius: 12,
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: '#fff',
    cursor: 'pointer'
  },
  textarea: {
    padding: '12px 16px',
    fontSize: 16,
    border: '2px solid #d1d5db',
    borderRadius: 12,
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: '#fff',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  submitButton: {
    width: '100%',
    padding: '16px 24px',
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
  }
};

// Add CSS for responsive design
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 768px) {
      .container {
        padding: 12px !important;
      }
      
      .form {
        padding: 24px !important;
      }
      
      .row {
        grid-template-columns: 1fr !important;
      }
      
      .title {
        font-size: 28px !important;
      }
      
      .header {
        padding: 24px !important;
      }
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
  `;
  document.head.appendChild(style);
}

export default Receipt;
