// src/pages/public/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'student',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');

  const { register, loginWithGoogle, loginWithFacebook } = useAuth();
  const navigate = useNavigate();

  const styles = {
    registerContainer: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },

    registerCard: {
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '1000px',
      display: 'grid',
      gridTemplateColumns: window.innerWidth > 968 ? '1fr 1fr' : '1fr',
      minHeight: '700px',
    },

    registerLeft: {
      padding: window.innerWidth > 480 ? '40px 50px' : '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      maxHeight: '700px',
      overflowY: 'auto',
    },

    registerRight: {
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      color: 'white',
      padding: '60px 50px',
      display: window.innerWidth > 968 ? 'flex' : 'none',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    },

    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '30px',
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1e293b',
    },

    registerTitle: {
      fontSize: window.innerWidth > 480 ? '2rem' : '1.6rem',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '10px',
    },

    registerSubtitle: {
      color: '#64748b',
      marginBottom: '30px',
      lineHeight: '1.5',
    },

    stepIndicator: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '30px',
      gap: '10px',
    },

    step: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      background: '#e5e7eb',
      transition: 'background 0.3s ease',
    },

    activeStep: {
      background: '#667eea',
    },

    form: {
      width: '100%',
    },

    formRow: {
      display: 'grid',
      gridTemplateColumns: window.innerWidth > 600 ? '1fr 1fr' : '1fr',
      gap: '20px',
      marginBottom: '20px',
    },

    formGroup: {
      marginBottom: '20px',
    },

    label: {
      display: 'block',
      marginBottom: '6px',
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#374151',
    },

    required: {
      color: '#ef4444',
      marginLeft: '3px',
    },

    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },

    input: {
      width: '100%',
      padding: window.innerWidth > 480 ? '12px 45px 12px 15px' : '10px 40px 10px 12px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '0.95rem',
      color: '#374151',
      background: '#f9fafb',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box',
    },

    select: {
      width: '100%',
      padding: window.innerWidth > 480 ? '12px 15px' : '10px 12px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '0.95rem',
      color: '#374151',
      background: '#f9fafb',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box',
      cursor: 'pointer',
    },

    textarea: {
      width: '100%',
      padding: '12px 15px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '0.95rem',
      color: '#374151',
      background: '#f9fafb',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box',
      resize: 'vertical',
      minHeight: '80px',
      fontFamily: 'inherit',
    },

    inputError: {
      borderColor: '#ef4444',
      background: '#fef2f2',
    },

    inputIcon: {
      position: 'absolute',
      right: '12px',
      color: '#9ca3af',
      cursor: 'pointer',
      fontSize: '1.1rem',
      transition: 'color 0.3s ease',
    },

    checkbox: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      marginBottom: '25px',
    },

    checkboxInput: {
      width: '16px',
      height: '16px',
      accentColor: '#667eea',
      cursor: 'pointer',
      marginTop: '2px',
    },

    checkboxLabel: {
      color: '#64748b',
      fontSize: '0.85rem',
      cursor: 'pointer',
      lineHeight: '1.4',
      userSelect: 'none',
    },

    buttonGroup: {
      display: 'flex',
      gap: '15px',
      marginBottom: '20px',
    },

    button: {
      padding: '12px 25px',
      borderRadius: '8px',
      fontSize: '0.95rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },

    primaryButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      flex: 1,
    },

    secondaryButton: {
      background: '#f1f5f9',
      color: '#64748b',
      border: '2px solid #e5e7eb',
    },

    buttonDisabled: {
      background: '#d1d5db',
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
    },

    loadingSpinner: {
      width: '18px',
      height: '18px',
      border: '2px solid transparent',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },

    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '25px 0',
      color: '#9ca3af',
      fontSize: '0.85rem',
    },

    dividerLine: {
      flex: 1,
      height: '1px',
      background: '#e5e7eb',
    },

    dividerText: {
      padding: '0 15px',
    },

    socialButtons: {
      display: 'flex',
      flexDirection: window.innerWidth > 600 ? 'row' : 'column',
      gap: '12px',
      marginBottom: '25px',
    },

    socialButton: {
      flex: 1,
      padding: '10px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      background: 'white',
      color: '#374151',
      fontSize: '0.85rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
    },

    loginLink: {
      textAlign: 'center',
      color: '#64748b',
      fontSize: '0.9rem',
    },

    loginLinkAnchor: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '600',
      marginLeft: '5px',
    },

    errorMessage: {
      color: '#ef4444',
      fontSize: '0.8rem',
      marginTop: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },

    successMessage: {
      color: '#065f46',
      fontSize: '0.85rem',
      marginBottom: '20px',
      padding: '12px 15px',
      background: '#d1fae5',
      borderRadius: '8px',
      border: '1px solid #a7f3d0',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },

    roleSelector: {
      marginBottom: '20px',
    },

    roleButtons: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
      gap: '8px',
      marginTop: '8px',
    },

    roleButton: {
      padding: '8px 12px',
      border: '2px solid #e5e7eb',
      borderRadius: '6px',
      background: 'white',
      color: '#64748b',
      fontSize: '0.8rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'center',
    },

    roleButtonActive: {
      borderColor: '#667eea',
      background: '#667eea',
      color: 'white',
    },

    rightTitle: {
      fontSize: '2.2rem',
      fontWeight: '700',
      marginBottom: '20px',
    },

    rightSubtitle: {
      fontSize: '1rem',
      opacity: '0.9',
      lineHeight: '1.6',
      marginBottom: '30px',
    },

    features: {
      textAlign: 'left',
      width: '100%',
    },

    feature: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '15px',
      fontSize: '0.9rem',
    },

    featureIcon: {
      fontSize: '1.1rem',
    },
  };

  const spinKeyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Please select your gender';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';

    return newErrors;
  };

  const handleNextStep = () => {
    const validationErrors = validateStep1();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const step1Errors = validateStep1();
    const step2Errors = validateStep2();
    const validationErrors = { ...step1Errors, ...step2Errors };

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (Object.keys(step1Errors).length > 0) {
        setCurrentStep(1);
      }
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: formData.role,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      });

      if (result.success) {
        setSuccessMessage('Account created successfully! Redirecting to your dashboard...');
        setTimeout(() => {
          const redirectPath = getRedirectPath(result.user.role);
          navigate(redirectPath, { replace: true });
        }, 2000);
      } else {
        setErrors({ general: result.error || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getRedirectPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'franchise':
        return '/franchise/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/student/dashboard';
    }
  };

  const handleSocialRegister = async (provider) => {
    setIsLoading(true);
    setErrors({});

    try {
      let result;
      if (provider === 'google') {
        result = await loginWithGoogle();
      } else if (provider === 'facebook') {
        result = await loginWithFacebook();
      }

      if (result.success) {
        const redirectPath = getRedirectPath(result.user.role || 'student');
        navigate(redirectPath, { replace: true });
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('Social registration error:', error);
      setErrors({ general: 'Social registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{spinKeyframes}</style>
      <div style={styles.registerContainer}>
        <div style={styles.registerCard}>
          {/* Left Panel - Registration Form */}
          <div style={styles.registerLeft}>
            <div style={styles.logo}>
              <span>🎓</span>
              <span>TechEdu Institute</span>
            </div>

            <h1 style={styles.registerTitle}>Create Account</h1>
            <p style={styles.registerSubtitle}>
              Join thousands of students and start your learning journey today.
            </p>

            {/* Step Indicator */}
            <div style={styles.stepIndicator}>
              <div style={{
                ...styles.step,
                ...(currentStep >= 1 ? styles.activeStep : {})
              }}></div>
              <div style={{
                ...styles.step,
                ...(currentStep >= 2 ? styles.activeStep : {})
              }}></div>
            </div>

            {successMessage && (
              <div style={styles.successMessage}>
                <span>✅</span>
                {successMessage}
              </div>
            )}

            {errors.general && (
              <div style={styles.errorMessage}>
                <span>⚠️</span>
                {errors.general}
              </div>
            )}

            <form style={styles.form} onSubmit={handleSubmit} noValidate>
              {currentStep === 1 && (
                <>
                  {/* Role Selection */}
                  <div style={styles.roleSelector}>
                    <label style={styles.label}>I want to register as <span style={styles.required}>*</span></label>
                    <div style={styles.roleButtons}>
                      {['student', 'franchise', 'admin'].map((role) => (
                        <button
                          key={role}
                          type="button"
                          style={{
                            ...styles.roleButton,
                            ...(formData.role === role ? styles.roleButtonActive : {})
                          }}
                          onClick={() => handleRoleChange(role)}
                        >
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label} htmlFor="firstName">
                        First Name <span style={styles.required}>*</span>
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        style={{
                          ...styles.input,
                          ...(errors.firstName ? styles.inputError : {}),
                        }}
                        required
                      />
                      {errors.firstName && (
                        <div style={styles.errorMessage}>
                          <span>⚠️</span>
                          {errors.firstName}
                        </div>
                      )}
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label} htmlFor="lastName">
                        Last Name <span style={styles.required}>*</span>
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        style={{
                          ...styles.input,
                          ...(errors.lastName ? styles.inputError : {}),
                        }}
                        required
                      />
                      {errors.lastName && (
                        <div style={styles.errorMessage}>
                          <span>⚠️</span>
                          {errors.lastName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="email">
                      Email Address <span style={styles.required}>*</span>
                    </label>
                    <div style={styles.inputWrapper}>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        style={{
                          ...styles.input,
                          ...(errors.email ? styles.inputError : {}),
                        }}
                        required
                      />
                      <span style={styles.inputIcon}>📧</span>
                    </div>
                    {errors.email && (
                      <div style={styles.errorMessage}>
                        <span>⚠️</span>
                        {errors.email}
                      </div>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="phone">
                      Phone Number <span style={styles.required}>*</span>
                    </label>
                    <div style={styles.inputWrapper}>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        style={{
                          ...styles.input,
                          ...(errors.phone ? styles.inputError : {}),
                        }}
                        required
                      />
                      <span style={styles.inputIcon}>📱</span>
                    </div>
                    {errors.phone && (
                      <div style={styles.errorMessage}>
                        <span>⚠️</span>
                        {errors.phone}
                      </div>
                    )}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="address">Address</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your full address"
                      style={styles.textarea}
                    />
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label} htmlFor="city">City</label>
                      <input
                        id="city"
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter city"
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label} htmlFor="state">State</label>
                      <input
                        id="state"
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Enter state"
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="pincode">PIN Code</label>
                    <input
                      id="pincode"
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="Enter PIN code"
                      style={styles.input}
                    />
                  </div>

                  <button
                    type="button"
                    style={styles.primaryButton}
                    onClick={handleNextStep}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    Continue →
                  </button>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label} htmlFor="password">
                        Password <span style={styles.required}>*</span>
                      </label>
                      <div style={styles.inputWrapper}>
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Create password"
                          style={{
                            ...styles.input,
                            ...(errors.password ? styles.inputError : {}),
                          }}
                          required
                        />
                        <span
                          style={styles.inputIcon}
                          onClick={() => setShowPassword(!showPassword)}
                          onMouseEnter={(e) => e.target.style.color = '#667eea'}
                          onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
                        >
                          {showPassword ? '🙈' : '👁️'}
                        </span>
                      </div>
                      {errors.password && (
                        <div style={styles.errorMessage}>
                          <span>⚠️</span>
                          {errors.password}
                        </div>
                      )}
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label} htmlFor="confirmPassword">
                        Confirm Password <span style={styles.required}>*</span>
                      </label>
                      <div style={styles.inputWrapper}>
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm password"
                          style={{
                            ...styles.input,
                            ...(errors.confirmPassword ? styles.inputError : {}),
                          }}
                          required
                        />
                        <span
                          style={styles.inputIcon}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          onMouseEnter={(e) => e.target.style.color = '#667eea'}
                          onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
                        >
                          {showConfirmPassword ? '🙈' : '👁️'}
                        </span>
                      </div>
                      {errors.confirmPassword && (
                        <div style={styles.errorMessage}>
                          <span>⚠️</span>
                          {errors.confirmPassword}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label} htmlFor="dateOfBirth">
                        Date of Birth <span style={styles.required}>*</span>
                      </label>
                      <input
                        id="dateOfBirth"
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        style={{
                          ...styles.input,
                          ...(errors.dateOfBirth ? styles.inputError : {}),
                        }}
                        required
                      />
                      {errors.dateOfBirth && (
                        <div style={styles.errorMessage}>
                          <span>⚠️</span>
                          {errors.dateOfBirth}
                        </div>
                      )}
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label} htmlFor="gender">
                        Gender <span style={styles.required}>*</span>
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        style={{
                          ...styles.select,
                          ...(errors.gender ? styles.inputError : {}),
                        }}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                      {errors.gender && (
                        <div style={styles.errorMessage}>
                          <span>⚠️</span>
                          {errors.gender}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={styles.checkbox}>
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      style={styles.checkboxInput}
                      required
                    />
                    <label htmlFor="agreeToTerms" style={styles.checkboxLabel}>
                      I agree to the <Link to="/terms" style={{ color: '#667eea', textDecoration: 'none' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: '#667eea', textDecoration: 'none' }}>Privacy Policy</Link> <span style={styles.required}>*</span>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <div style={styles.errorMessage}>
                      <span>⚠️</span>
                      {errors.agreeToTerms}
                    </div>
                  )}

                  <div style={styles.buttonGroup}>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      onClick={handlePrevStep}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#e2e8f0';
                        e.target.style.borderColor = '#cbd5e1';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#f1f5f9';
                        e.target.style.borderColor = '#e5e7eb';
                      }}
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      style={{
                        ...styles.primaryButton,
                        ...(isLoading ? styles.buttonDisabled : {}),
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isLoading) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {isLoading && <div style={styles.loadingSpinner}></div>}
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </div>
                </>
              )}
            </form>

            {currentStep === 1 && (
              <>
                <div style={styles.divider}>
                  <div style={styles.dividerLine}></div>
                  <span style={styles.dividerText}>or register with</span>
                  <div style={styles.dividerLine}></div>
                </div>

                <div style={styles.socialButtons}>
                  <button
                    type="button"
                    style={styles.socialButton}
                    onClick={() => handleSocialRegister('google')}
                    disabled={isLoading}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.background = 'white';
                    }}
                  >
                    <span>🔍</span>
                    Google
                  </button>
                  <button
                    type="button"
                    style={styles.socialButton}
                    onClick={() => handleSocialRegister('facebook')}
                    disabled={isLoading}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.background = 'white';
                    }}
                  >
                    <span>📘</span>
                    Facebook
                  </button>
                </div>
              </>
            )}

            <div style={styles.loginLink}>
              Already have an account?
              <Link
                to="/login"
                style={styles.loginLinkAnchor}
                onMouseEnter={(e) => e.target.style.color = '#5a67d8'}
                onMouseLeave={(e) => e.target.style.color = '#667eea'}
              >
                Sign in here
              </Link>
            </div>
          </div>

          {/* Right Panel - Welcome Message */}
          <div style={styles.registerRight}>
            <h2 style={styles.rightTitle}>Welcome!</h2>
            <p style={styles.rightSubtitle}>
              Join our community of learners and start your journey towards excellence in computer education.
            </p>

            <div style={styles.features}>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>🎓</span>
                <span>Industry-recognized certificates</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>👨‍🏫</span>
                <span>Learn from expert instructors</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>💼</span>
                <span>Career placement assistance</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>🌟</span>
                <span>Join 5000+ successful students</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>📱</span>
                <span>Learn online or at centers</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>🔄</span>
                <span>Lifetime course access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
