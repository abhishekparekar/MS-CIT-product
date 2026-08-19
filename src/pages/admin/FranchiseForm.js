import React, { useState } from 'react';
import { auth, database } from '../../firebase/config';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";

const FranchiseForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    website: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) newErrors.name = 'Franchise name is required';
        else if (value.length < 3) newErrors.name = 'Name must be at least 3 characters';
        else delete newErrors.name;
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) newErrors.email = 'Email is required';
        else if (!emailRegex.test(value)) newErrors.email = 'Invalid email format';
        else delete newErrors.email;
        break;
      case 'password':
        if (!value) newErrors.password = 'Password is required';
        else if (value.length < 6) newErrors.password = 'Password must be at least 6 characters';
        else delete newErrors.password;
        break;
      case 'phone':
        const phoneRegex = /^[0-9]{10}$/;
        if (value && !phoneRegex.test(value.replace(/\D/g, ''))) {
          newErrors.phone = 'Invalid phone number';
        } else delete newErrors.phone;
        break;
      case 'website':
        if (value && !value.startsWith('http')) {
          newErrors.website = 'Website must start with http:// or https://';
        } else delete newErrors.website;
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key]);
    });

    if (Object.keys(errors).length > 0) {
      setMessage('Please fix the errors below');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const userId = userCredential.user.uid;

      await set(ref(database, 'franchises/' + userId), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        website: formData.website,
        active: true,
        createdAt: new Date().toISOString()
      });

      setMessage('🎉 Franchise added successfully!');
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        website: '',
      });
      setErrors({});
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Add New Franchise</h2>
        <p style={styles.subtitle}>Create a new franchise account with login credentials</p>
      </div>

      {message && (
        <div style={{
          ...styles.message,
          backgroundColor: message.includes('Error') || message.includes('fix') ? '#fee' : '#efe',
          color: message.includes('Error') || message.includes('fix') ? '#c33' : '#363',
          borderLeft: `4px solid ${message.includes('Error') || message.includes('fix') ? '#c33' : '#363'}`
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Basic Information Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Basic Information</h3>
          
          <div style={styles.row}>
            <label style={styles.label}>
              Franchise Name *
              {errors.name && <span style={styles.errorText}>{errors.name}</span>}
            </label>
            <input
              style={{
                ...styles.input,
                borderColor: errors.name ? '#e74c3c' : focusedField === 'name' ? '#3498db' : '#ddd',
                boxShadow: focusedField === 'name' ? '0 0 0 3px rgba(52, 152, 219, 0.1)' : 'none'
              }}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => handleFocus('name')}
              onBlur={handleBlur}
              required
              placeholder="Enter franchise name"
            />
          </div>

          <div style={styles.row}>
            <label style={styles.label}>
              Email Address *
              {errors.email && <span style={styles.errorText}>{errors.email}</span>}
            </label>
            <input
              style={{
                ...styles.input,
                borderColor: errors.email ? '#e74c3c' : focusedField === 'email' ? '#3498db' : '#ddd',
                boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(52, 152, 219, 0.1)' : 'none'
              }}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => handleFocus('email')}
              onBlur={handleBlur}
              required
              placeholder="franchise@example.com"
            />
          </div>

          <div style={styles.row}>
            <label style={styles.label}>
              Password *
              {errors.password && <span style={styles.errorText}>{errors.password}</span>}
            </label>
            <input
              style={{
                ...styles.input,
                borderColor: errors.password ? '#e74c3c' : focusedField === 'password' ? '#3498db' : '#ddd',
                boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(52, 152, 219, 0.1)' : 'none'
              }}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => handleFocus('password')}
              onBlur={handleBlur}
              required
              placeholder="Create a secure password"
            />
          </div>
        </div>

        {/* Contact Information Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Contact Information</h3>
          
          <div style={styles.row}>
            <label style={styles.label}>
              Phone Number
              {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
            </label>
            <input
              style={{
                ...styles.input,
                borderColor: errors.phone ? '#e74c3c' : focusedField === 'phone' ? '#3498db' : '#ddd',
                boxShadow: focusedField === 'phone' ? '0 0 0 3px rgba(52, 152, 219, 0.1)' : 'none'
              }}
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onFocus={() => handleFocus('phone')}
              onBlur={handleBlur}
              placeholder="9876543210"
            />
          </div>

          <div style={styles.row}>
            <label style={styles.label}>Address</label>
            <textarea
              style={{
                ...styles.input,
                ...styles.textarea,
                borderColor: focusedField === 'address' ? '#3498db' : '#ddd',
                boxShadow: focusedField === 'address' ? '0 0 0 3px rgba(52, 152, 219, 0.1)' : 'none'
              }}
              name="address"
              value={formData.address}
              onChange={handleChange}
              onFocus={() => handleFocus('address')}
              onBlur={handleBlur}
              placeholder="Enter complete address"
              rows="3"
            />
          </div>
        </div>

        {/* Location Details Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Location Details</h3>
          
          <div style={styles.gridRow}>
            <div style={styles.gridItem}>
              <label style={styles.label}>City</label>
              <input
                style={{
                  ...styles.input,
                  borderColor: focusedField === 'city' ? '#3498db' : '#ddd',
                  boxShadow: focusedField === 'city' ? '0 0 0 3px rgba(52, 152, 219, 0.1)' : 'none'
                }}
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                onFocus={() => handleFocus('city')}
                onBlur={handleBlur}
                placeholder="City"
              />
            </div>

            <div style={styles.gridItem}>
              <label style={styles.label}>State</label>
              <input
                style={{
                  ...styles.input,
                  borderColor: focusedField === 'state' ? '#3498db' : '#ddd',
                  boxShadow: focusedField === 'state' ? '0 0 0 3px rgba(52, 152, 219, 0.1)' : 'none'
                }}
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                onFocus={() => handleFocus('state')}
                onBlur={handleBlur}
                placeholder="State"
              />
            </div>

            <div style={styles.gridItem}>
              <label style={styles.label}>Zip Code</label>
              <input
                style={{
                  ...styles.input,
                  borderColor: focusedField === 'zip' ? '#3498db' : '#ddd',
                  boxShadow: focusedField === 'zip' ? '0 0 0 3px rgba(52, 152, 219, 0.1)' : 'none'
                }}
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                onFocus={() => handleFocus('zip')}
                onBlur={handleBlur}
                placeholder="Zip Code"
              />
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Additional Information</h3>
          
          <div style={styles.row}>
            <label style={styles.label}>
              Website
              {errors.website && <span style={styles.errorText}>{errors.website}</span>}
            </label>
            <input
              style={{
                ...styles.input,
                borderColor: errors.website ? '#e74c3c' : focusedField === 'website' ? '#3498db' : '#ddd',
                boxShadow: focusedField === 'website' ? '0 0 0 3px rgba(52, 152, 219, 0.1)' : 'none'
              }}
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              onFocus={() => handleFocus('website')}
              onBlur={handleBlur}
              placeholder="https://example.com"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
            transform: loading ? 'scale(0.98)' : 'scale(1)'
          }}
        >
          {loading ? (
            <>
              <span style={styles.spinner}></span>
              Adding Franchise...
            </>
          ) : (
            '✨ Add Franchise'
          )}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 600,
    margin: '20px auto',
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    border: '1px solid #f0f0f0'
  },
  header: {
    textAlign: 'center',
    marginBottom: 30
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    margin: 0
  },
  message: {
    padding: '12px 16px',
    borderRadius: 8,
    marginBottom: 24,
    fontSize: 14,
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24
  },
  section: {
    padding: '20px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  row: {
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column'
  },
  gridRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 16,
    marginBottom: 16
  },
  gridItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: 14,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: '400'
  },
  input: {
    padding: '14px 16px',
    fontSize: 15,
    borderRadius: 8,
    border: '2px solid #ddd',
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: '#fafafa',
    fontFamily: 'inherit'
  },
  textarea: {
    resize: 'vertical',
    minHeight: 80,
    fontFamily: 'inherit'
  },
  button: {
    backgroundColor: '#3498db',
    border: 'none',
    color: '#fff',
    padding: '16px 24px',
    fontSize: 16,
    borderRadius: 10,
    fontWeight: '600',
    transition: 'all 0.3s ease',
    marginTop: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)'
  },
  spinner: {
    width: 16,
    height: 16,
    border: '2px solid #ffffff40',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};

// Add keyframe animation for spinner
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .franchise-form-container {
        margin: 10px;
        padding: 20px;
      }
      
      .franchise-form-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .franchise-form-container:hover {
      box-shadow: 0 15px 50px rgba(0,0,0,0.15);
    }
    
    .franchise-form-button:hover:not(:disabled) {
      background-color: #2980b9;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
    }
  `;
  document.head.appendChild(style);
}

export default FranchiseForm;
