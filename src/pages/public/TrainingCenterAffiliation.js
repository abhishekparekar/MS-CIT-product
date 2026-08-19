// src/pages/public/TrainingCenterAffiliation.js
import React, { useState } from 'react';
import franchiseService from '../../services/franchiseService';

const TrainingCenterAffiliation = () => {
    const [formData, setFormData] = useState({
        // Personal Details
        centerName: '',
        firmName: '',
        ownerName: '',
        contactNumber: '',
        qualification: '',
        place: '',
        district: '',
        state: '',
        ownerAddress: '',
        personalPinCode: '',

        // Training Address Details
        mobileNumber: '',
        centerAddress: '',
        trainingPinCode: '',
        email: '',
        computerSystems: '',
        lcdProjector: 'no',
        geographicalName: '',
        centerType: 'urban',

        // TC Premises Details
        premisesArea: '',
        noOfClassroom: '',
        noOfLab: '',
        trade: '',
        affiliationFee: '',
        seatRequire: '',
        modeOfPayment: '',
        accountNo: '',
        bankName: '',
        ifscCode: '',

        // Login Details
        userName: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required field validation
        const requiredFields = [
            'centerName', 'firmName', 'ownerName', 'contactNumber', 'qualification',
            'place', 'district', 'state', 'ownerAddress', 'personalPinCode',
            'mobileNumber', 'centerAddress', 'trainingPinCode', 'email',
            'computerSystems', 'geographicalName', 'premisesArea', 'noOfClassroom',
            'noOfLab', 'trade', 'affiliationFee', 'seatRequire', 'modeOfPayment',
            'accountNo', 'bankName', 'ifscCode', 'userName', 'password'
        ];

        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].toString().trim() === '') {
                newErrors[field] = 'This field is required';
            }
        });

        // Email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Phone number validation
        if (formData.contactNumber && !/^\d{10}$/.test(formData.contactNumber.replace(/\D/g, ''))) {
            newErrors.contactNumber = 'Phone number must be 10 digits';
        }

        if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
            newErrors.mobileNumber = 'Mobile number must be 10 digits';
        }

        // Pin code validation
        if (formData.personalPinCode && !/^\d{6}$/.test(formData.personalPinCode)) {
            newErrors.personalPinCode = 'Pin code must be 6 digits';
        }

        if (formData.trainingPinCode && !/^\d{6}$/.test(formData.trainingPinCode)) {
            newErrors.trainingPinCode = 'Pin code must be 6 digits';
        }

        // Password validation
        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setMessage('Please fix all errors before submitting');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            // Generate unique application ID
            const applicationId = `TC-${Date.now()}`;
            const timestamp = new Date().toISOString();

            // Prepare data for Realtime Database
            const applicationData = {
                // Application Info
                applicationId,
                submittedAt: timestamp,
                status: 'Under Review',

                // Personal Details
                personalDetails: {
                    centerName: formData.centerName,
                    firmName: formData.firmName,
                    ownerName: formData.ownerName,
                    contactNumber: formData.contactNumber,
                    qualification: formData.qualification,
                    place: formData.place,
                    district: formData.district,
                    state: formData.state,
                    ownerAddress: formData.ownerAddress,
                    personalPinCode: formData.personalPinCode
                },

                // Training Address Details
                trainingDetails: {
                    mobileNumber: formData.mobileNumber,
                    centerAddress: formData.centerAddress,
                    trainingPinCode: formData.trainingPinCode,
                    email: formData.email,
                    computerSystems: parseInt(formData.computerSystems),
                    lcdProjector: formData.lcdProjector === 'yes',
                    geographicalName: formData.geographicalName,
                    centerType: formData.centerType
                },

                // TC Premises Details
                premisesDetails: {
                    premisesArea: parseInt(formData.premisesArea),
                    noOfClassroom: parseInt(formData.noOfClassroom),
                    noOfLab: parseInt(formData.noOfLab),
                    trade: formData.trade,
                    affiliationFee: parseInt(formData.affiliationFee),
                    seatRequire: parseInt(formData.seatRequire),
                    modeOfPayment: formData.modeOfPayment,
                    accountNo: formData.accountNo,
                    bankName: formData.bankName,
                    ifscCode: formData.ifscCode
                },

                // Login Details (encrypted/hashed in production)
                loginDetails: {
                    userName: formData.userName,
                    password: formData.password // In production, hash this password
                },

                // Additional metadata
                metadata: {
                    submissionSource: 'web-portal',
                    ipAddress: 'client-ip', // You can get this from a service
                    userAgent: navigator.userAgent,
                    timestamp: Date.now()
                }
            };

            setMessage('Saving application to MongoDB Atlas...');

            const payload = {
                directorName: formData.ownerName,
                email: formData.email,
                contactNumber: formData.contactNumber,
                whatsappNumber: formData.mobileNumber,
                qualification: formData.qualification,
                instituteName: formData.centerName || formData.firmName,
                centerAddress: formData.centerAddress,
                place: formData.place,
                district: formData.district,
                state: formData.state || 'Maharashtra',
                pincode: formData.trainingPinCode || formData.personalPinCode,
                computerCount: parseInt(formData.computerSystems) || 10,
                classroomCount: parseInt(formData.noOfClassroom) || 2,
                labCount: parseInt(formData.noOfLab) || 1,
                totalArea: parseInt(formData.premisesArea) || 500,
                desiredUsername: formData.userName,
                desiredPassword: formData.password
            };

            const res = await franchiseService.applyForAffiliation(payload);

            setMessage('🎉 Application submitted successfully! Your application number is: ' + (res.applicationNumber || applicationId));

            // Reset form
            setFormData({
                centerName: '', firmName: '', ownerName: '', contactNumber: '',
                qualification: '', place: '', district: '', state: '', ownerAddress: '',
                personalPinCode: '', mobileNumber: '', centerAddress: '', trainingPinCode: '',
                email: '', computerSystems: '', lcdProjector: 'no', geographicalName: '',
                centerType: 'urban', premisesArea: '', noOfClassroom: '', noOfLab: '',
                trade: '', affiliationFee: '', seatRequire: '', modeOfPayment: '',
                accountNo: '', bankName: '', ifscCode: '', userName: '', password: ''
            });

        } catch (error) {
            console.error('Error submitting application:', error);
            setMessage('❌ Error submitting application: ' + (error.message || 'Please try again.'));
        }

        setLoading(false);
    };

    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            padding: '20px 0'
        },

        formWrapper: {
            maxWidth: '900px',
            margin: '0 auto',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
        },

        header: {
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            padding: '40px',
            textAlign: 'center'
        },

        title: {
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '10px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },

        subtitle: {
            fontSize: '1.1rem',
            opacity: '0.9'
        },

        form: {
            padding: '40px'
        },

        section: {
            marginBottom: '40px',
            padding: '30px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
        },

        sectionTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '20px',
            paddingBottom: '10px',
            borderBottom: '2px solid #2563eb'
        },

        row: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
        },

        inputGroup: {
            display: 'flex',
            flexDirection: 'column'
        },

        label: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '6px'
        },

        required: {
            color: '#dc2626'
        },

        input: {
            padding: '12px 16px',
            fontSize: '16px',
            border: '2px solid #d1d5db',
            borderRadius: '8px',
            outline: 'none',
            transition: 'all 0.3s ease',
            backgroundColor: 'white'
        },

        inputFocus: {
            borderColor: '#2563eb',
            boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)'
        },

        inputError: {
            borderColor: '#dc2626'
        },

        textarea: {
            padding: '12px 16px',
            fontSize: '16px',
            border: '2px solid #d1d5db',
            borderRadius: '8px',
            outline: 'none',
            transition: 'all 0.3s ease',
            backgroundColor: 'white',
            resize: 'vertical',
            minHeight: '80px',
            fontFamily: 'inherit'
        },

        select: {
            padding: '12px 16px',
            fontSize: '16px',
            border: '2px solid #d1d5db',
            borderRadius: '8px',
            outline: 'none',
            transition: 'all 0.3s ease',
            backgroundColor: 'white',
            cursor: 'pointer'
        },

        radioGroup: {
            display: 'flex',
            gap: '20px',
            marginTop: '8px'
        },

        radioLabel: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
        },

        radioInput: {
            width: '18px',
            height: '18px',
            accentColor: '#2563eb'
        },

        errorText: {
            color: '#dc2626',
            fontSize: '12px',
            marginTop: '4px',
            fontWeight: '500'
        },

        message: {
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500',
            textAlign: 'center'
        },

        messageSuccess: {
            backgroundColor: '#d1fae5',
            color: '#065f46',
            border: '1px solid #10b981'
        },

        messageError: {
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #dc2626'
        },

        submitButton: {
            width: '100%',
            padding: '16px 24px',
            fontSize: '18px',
            fontWeight: '700',
            color: 'white',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)'
        },

        submitButtonHover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(37, 99, 235, 0.5)'
        },

        submitButtonDisabled: {
            opacity: '0.7',
            cursor: 'not-allowed',
            transform: 'none'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formWrapper}>
                {/* Header */}
                <div style={styles.header}>
                    <h1 style={styles.title}>New Training Center Affiliation</h1>
                    <p style={styles.subtitle}>Join our network of certified training centers</p>
                </div>

                {/* Message */}
                {message && (
                    <div style={{
                        ...styles.message,
                        ...(message.includes('Error') || message.includes('❌') ? styles.messageError : styles.messageSuccess)
                    }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Personal Details */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>📋 Personal Details</h2>

                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Center Name <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.centerName ? styles.inputError : {})
                                    }}
                                    type="text"
                                    name="centerName"
                                    value={formData.centerName}
                                    onChange={handleInputChange}
                                    placeholder="Enter training center name"
                                />
                                {errors.centerName && <span style={styles.errorText}>{errors.centerName}</span>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Firm Name <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.firmName ? styles.inputError : {})
                                    }}
                                    type="text"
                                    name="firmName"
                                    value={formData.firmName}
                                    onChange={handleInputChange}
                                    placeholder="Enter firm name"
                                />
                                {errors.firmName && <span style={styles.errorText}>{errors.firmName}</span>}
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Owner Name <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.ownerName ? styles.inputError : {})
                                    }}
                                    type="text"
                                    name="ownerName"
                                    value={formData.ownerName}
                                    onChange={handleInputChange}
                                    placeholder="Enter owner name"
                                />
                                {errors.ownerName && <span style={styles.errorText}>{errors.ownerName}</span>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Contact Number <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.contactNumber ? styles.inputError : {})
                                    }}
                                    type="tel"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleInputChange}
                                    placeholder="9876543210"
                                />
                                {errors.contactNumber && <span style={styles.errorText}>{errors.contactNumber}</span>}
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Qualification <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.qualification ? styles.inputError : {})
                                    }}
                                    type="text"
                                    name="qualification"
                                    value={formData.qualification}
                                    onChange={handleInputChange}
                                    placeholder="Educational qualification"
                                />
                                {errors.qualification && <span style={styles.errorText}>{errors.qualification}</span>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Place / Location <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.place ? styles.inputError : {})
                                    }}
                                    type="text"
                                    name="place"
                                    value={formData.place}
                                    onChange={handleInputChange}
                                    placeholder="Enter place/location"
                                />
                                {errors.place && <span style={styles.errorText}>{errors.place}</span>}
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    District <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.district ? styles.inputError : {})
                                    }}
                                    type="text"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleInputChange}
                                    placeholder="Enter district"
                                />
                                {errors.district && <span style={styles.errorText}>{errors.district}</span>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    State <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.state ? styles.inputError : {})
                                    }}
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    placeholder="Enter state"
                                />
                                {errors.state && <span style={styles.errorText}>{errors.state}</span>}
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Owner's Residential Address <span style={styles.required}>*</span>
                                </label>
                                <textarea
                                    style={{
                                        ...styles.textarea,
                                        ...(errors.ownerAddress ? styles.inputError : {})
                                    }}
                                    name="ownerAddress"
                                    value={formData.ownerAddress}
                                    onChange={handleInputChange}
                                    placeholder="Enter complete residential address"
                                />
                                {errors.ownerAddress && <span style={styles.errorText}>{errors.ownerAddress}</span>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Pin Code <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.personalPinCode ? styles.inputError : {})
                                    }}
                                    type="text"
                                    name="personalPinCode"
                                    value={formData.personalPinCode}
                                    onChange={handleInputChange}
                                    placeholder="123456"
                                    maxLength="6"
                                />
                                {errors.personalPinCode && <span style={styles.errorText}>{errors.personalPinCode}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Training Address Details */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>🏢 Training Address Details</h2>

                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Mobile Number <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.mobileNumber ? styles.inputError : {})
                                    }}
                                    type="tel"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleInputChange}
                                    placeholder="9876543210"
                                />
                                {errors.mobileNumber && <span style={styles.errorText}>{errors.mobileNumber}</span>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Email Address <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.email ? styles.inputError : {})
                                    }}
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="training@example.com"
                                />
                                {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Center Address <span style={styles.required}>*</span>
                                </label>
                                <textarea
                                    style={{
                                        ...styles.textarea,
                                        ...(errors.centerAddress ? styles.inputError : {})
                                    }}
                                    name="centerAddress"
                                    value={formData.centerAddress}
                                    onChange={handleInputChange}
                                    placeholder="Enter complete center address"
                                />
                                {errors.centerAddress && <span style={styles.errorText}>{errors.centerAddress}</span>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Pin Code <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.trainingPinCode ? styles.inputError : {})
                                    }}
                                    type="text"
                                    name="trainingPinCode"
                                    value={formData.trainingPinCode}
                                    onChange={handleInputChange}
                                    placeholder="123456"
                                    maxLength="6"
                                />
                                {errors.trainingPinCode && <span style={styles.errorText}>{errors.trainingPinCode}</span>}
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Availability of Computer Systems <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.computerSystems ? styles.inputError : {})
                                    }}
                                    type="number"
                                    name="computerSystems"
                                    value={formData.computerSystems}
                                    onChange={handleInputChange}
                                    placeholder="Number of computers available"
                                    min="1"
                                />
                                {errors.computerSystems && <span style={styles.errorText}>{errors.computerSystems}</span>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>LCD Projector</label>
                                <div style={styles.radioGroup}>
                                    <label style={styles.radioLabel}>
                                        <input
                                            style={styles.radioInput}
                                            type="radio"
                                            name="lcdProjector"
                                            value="yes"
                                            checked={formData.lcdProjector === 'yes'}
                                            onChange={handleInputChange}
                                        />
                                        Yes
                                    </label>
                                    <label style={styles.radioLabel}>
                                        <input
                                            style={styles.radioInput}
                                            type="radio"
                                            name="lcdProjector"
                                            value="no"
                                            checked={formData.lcdProjector === 'no'}
                                            onChange={handleInputChange}
                                        />
                                        No
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Geographical Name of the Center <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.geographicalName ? styles.inputError : {})
                                    }}
                                    type="text"
                                    name="geographicalName"
                                    value={formData.geographicalName}
                                    onChange={handleInputChange}
                                    placeholder="Geographical location name"
                                />
                                {errors.geographicalName && <span style={styles.errorText}>{errors.geographicalName}</span>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Center Type</label>
                                <div style={styles.radioGroup}>
                                    <label style={styles.radioLabel}>
                                        <input
                                            style={styles.radioInput}
                                            type="radio"
                                            name="centerType"
                                            value="urban"
                                            checked={formData.centerType === 'urban'}
                                            onChange={handleInputChange}
                                        />
                                        Urban
                                    </label>
                                    <label style={styles.radioLabel}>
                                        <input
                                            style={styles.radioInput}
                                            type="radio"
                                            name="centerType"
                                            value="rural"
                                            checked={formData.centerType === 'rural'}
                                            onChange={handleInputChange}
                                        />
                                        Rural
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TC Premises Details */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>🏗️ TC Premises Details</h2>

                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    TC Premises Area (Sq.Ft) <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.premisesArea ? styles.inputError : {})
                                    }}
                                    type="number"
                                    name="premisesArea"
                                    value={formData.premisesArea}
                                    onChange={handleInputChange}
                                    placeholder="Area in square feet"
                                    min="1"
                                />
                                {errors.premisesArea && <span style={styles.errorText}>{errors.premisesArea}</span>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    No. of Classrooms <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.noOfClassroom ? styles.inputError : {})
                                    }}
                                    type="number"
                                    name="noOfClassroom"
                                    value={formData.noOfClassroom}
                                    onChange={handleInputChange}
                                    placeholder="Number of classrooms"
                                    min="1"
                                />
                                {errors.noOfClassroom && <span style={styles.errorText}>{errors.noOfClassroom}</span>}
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    No. of Labs <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.noOfLab ? styles.inputError : {})
                                    }}
                                    type="number"
                                    name="noOfLab"
                                    value={formData.noOfLab}
                                    onChange={handleInputChange}
                                    placeholder="Number of computer labs"
                                    min="1"
                                />
                                {errors.noOfLab && <span style={styles.errorText}>{errors.noOfLab}</span>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Trade <span style={styles.required}>*</span>
                                </label>
                                <select
                                    style={{
                                        ...styles.select,
                                        ...(errors.trade ? styles.inputError : {})
                                    }}
                                    name="trade"
                                    value={formData.trade}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Trade</option>
                                    <option value="computer-basic">Computer Basic</option>
                                    <option value="web-development">Web Development</option>
                                    <option value="programming">Programming</option>
                                    <option value="data-entry">Data Entry</option>
                                    <option value="digital-marketing">Digital Marketing</option>
                                    <option value="graphic-design">Graphic Design</option>
                                    <option value="ms-office">MS Office</option>
                                    <option value="hardware">Hardware & Networking</option>
                                </select>
                                {errors.trade && <span style={styles.errorText}>{errors.trade}</span>}
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Affiliation Fee <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.affiliationFee ? styles.inputError : {})
                                    }}
                                    type="number"
                                    name="affiliationFee"
                                    value={formData.affiliationFee}
                                    onChange={handleInputChange}
                                    placeholder="Amount in INR"
                                    min="1"
                                />
                                {errors.affiliationFee && <span style={styles.errorText}>{errors.affiliationFee}</span>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Seats Required <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.seatRequire ? styles.inputError : {})
                                    }}
                                    type="number"
                                    name="seatRequire"
                                    value={formData.seatRequire}
                                    onChange={handleInputChange}
                                    placeholder="Number of seats"
                                    min="1"
                                />
                                {errors.seatRequire && <span style={styles.errorText}>{errors.seatRequire}</span>}
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Mode of Payment <span style={styles.required}>*</span>
                                </label>
                                <select
                                    style={{
                                        ...styles.select,
                                        ...(errors.modeOfPayment ? styles.inputError : {})
                                    }}
                                    name="modeOfPayment"
                                    value={formData.modeOfPayment}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Payment Mode</option>
                                    <option value="cash">Cash</option>
                                    <option value="cheque">Cheque</option>
                                    <option value="online">Online Transfer</option>
                                    <option value="card">Card Payment</option>
                                    <option value="upi">UPI</option>
                                </select>
                                {errors.modeOfPayment && <span style={styles.errorText}>{errors.modeOfPayment}</span>}
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Account Number <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.accountNo ? styles.inputError : {})
                                    }}
                                    type="text"
                                    name="accountNo"
                                    value={formData.accountNo}
                                    onChange={handleInputChange}
                                    placeholder="Bank account number"
                                />
                                {errors.accountNo && <span style={styles.errorText}>{errors.accountNo}</span>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Bank Name <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.bankName ? styles.inputError : {})
                                    }}
                                    type="text"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleInputChange}
                                    placeholder="Bank name"
                                />
                                {errors.bankName && <span style={styles.errorText}>{errors.bankName}</span>}
                            </div>
                        </div>

                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    IFSC Code <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.ifscCode ? styles.inputError : {})
                                    }}
                                    type="text"
                                    name="ifscCode"
                                    value={formData.ifscCode}
                                    onChange={handleInputChange}
                                    placeholder="IFSC code"
                                />
                                {errors.ifscCode && <span style={styles.errorText}>{errors.ifscCode}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Login Details */}
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>🔐 Enter Login Details (Future Use)</h2>

                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    User Name <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.userName ? styles.inputError : {})
                                    }}
                                    type="text"
                                    name="userName"
                                    value={formData.userName}
                                    onChange={handleInputChange}
                                    placeholder="Choose a username"
                                />
                                {errors.userName && <span style={styles.errorText}>{errors.userName}</span>}
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Password <span style={styles.required}>*</span>
                                </label>
                                <input
                                    style={{
                                        ...styles.input,
                                        ...(errors.password ? styles.inputError : {})
                                    }}
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Choose a secure password"
                                />
                                {errors.password && <span style={styles.errorText}>{errors.password}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.submitButton,
                            ...(loading ? styles.submitButtonDisabled : {})
                        }}
                        onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
                        onMouseLeave={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
                    >
                        {loading ? 'Processing Application...' : '🚀 Submit Application'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TrainingCenterAffiliation;
