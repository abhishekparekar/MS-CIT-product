// src/pages/admin/PendingApplications.js
import React, { useState, useEffect } from 'react';
import { ref, onValue, update, set } from 'firebase/database';
import { database } from '../../../firebase/config';

const PendingApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [message, setMessage] = useState('');
    const [approvalData, setApprovalData] = useState({
        monthlyFee: '',
        renewalDate: '',
        notes: '',
        createUser: true
    });

    // Fetch applications from Firebase Realtime Database
    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = () => {
        try {
            setLoading(true);
            const applicationsRef = ref(database, 'trainingCenterApplications');

            onValue(applicationsRef, (snapshot) => {
                const data = snapshot.val();
                const applicationsData = [];

                if (data) {
                    Object.keys(data).forEach((key) => {
                        const application = data[key];
                        // Only show applications that are "Under Review"
                        if (application.status === 'Under Review') {
                            applicationsData.push({
                                id: key,
                                ...application
                            });
                        }
                    });
                }

                setApplications(applicationsData);
                setLoading(false);
            }, (error) => {
                console.error('Error fetching applications:', error);
                setMessage('❌ Error fetching applications');
                setLoading(false);
            });

        } catch (error) {
            console.error('Error setting up listener:', error);
            setMessage('❌ Error connecting to database');
            setLoading(false);
        }
    };

    // Create user account from approved application
    const createUserFromApplication = async (applicationData) => {
        try {
            const userId = `franchise_${Date.now()}`;
            const userData = {
                // Authentication Data
                authProvider: "training_center",
                email: applicationData.trainingDetails?.email,
                password: applicationData.loginDetails?.password || "defaultPassword123",

                // User Profile
                displayName: [applicationData.personalDetails?.ownerName, ""],
                firstName: applicationData.personalDetails?.ownerName?.split(' ')[0] || "",
                lastName: applicationData.personalDetails?.ownerName?.split(' ').slice(1).join(' ') || "",

                // User Details
                role: "franchise",
                userType: "franchise",
                isActive: true,

                // Training Center Details
                centerDetails: {
                    centerName: applicationData.personalDetails?.centerName,
                    firmName: applicationData.personalDetails?.firmName,
                    ownerName: applicationData.personalDetails?.ownerName,
                    contactNumber: applicationData.personalDetails?.contactNumber,
                    qualification: applicationData.personalDetails?.qualification,

                    // Location
                    place: applicationData.personalDetails?.place,
                    district: applicationData.personalDetails?.district,
                    state: applicationData.personalDetails?.state,
                    centerAddress: applicationData.trainingDetails?.centerAddress,
                    trainingPinCode: applicationData.trainingDetails?.trainingPinCode,

                    // Infrastructure
                    computerSystems: applicationData.trainingDetails?.computerSystems,
                    lcdProjector: applicationData.trainingDetails?.lcdProjector,
                    premisesArea: applicationData.premisesDetails?.premisesArea,
                    noOfClassroom: applicationData.premisesDetails?.noOfClassroom,
                    noOfLab: applicationData.premisesDetails?.noOfLab,

                    // Business
                    trade: applicationData.premisesDetails?.trade,
                    seatRequire: applicationData.premisesDetails?.seatRequire,
                    affiliationFee: applicationData.premisesDetails?.affiliationFee,
                    centerType: applicationData.trainingDetails?.centerType,
                },

                // Contact Information
                profile: {
                    email: applicationData.trainingDetails?.email,
                    phone: applicationData.trainingDetails?.mobileNumber,
                    address: applicationData.trainingDetails?.centerAddress,
                    profileImage: "",
                    dateOfBirth: "",
                },

                // Login Credentials
                loginCredentials: {
                    username: applicationData.loginDetails?.userName,
                    password: applicationData.loginDetails?.password,
                },

                // Management Data
                managementInfo: {
                    status: 'Active',
                    monthlyFee: approvalData.monthlyFee,
                    renewalDate: approvalData.renewalDate,
                    notes: approvalData.notes,
                    approvedAt: new Date().toISOString(),
                    approvedBy: "admin",
                },

                // Timestamps
                createdAt: Date.now(),
                lastLogin: null,

                // Original Application Reference
                originalApplicationId: applicationData.applicationId,
                originalApplicationKey: applicationData.id
            };

            // Save to users node
            const userRef = ref(database, `users/${userId}`);
            await set(userRef, userData);

            // Save to franchiseUsers for easier querying
            const franchiseUserRef = ref(database, `franchiseUsers/${userId}`);
            await set(franchiseUserRef, userData);

            return { success: true, userId };

        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    };

    // Approve application
    const handleApproveApplication = async () => {
        if (!selectedApplication) return;

        try {
            setLoading(true);
            setMessage('Processing approval...');

            // Update application status to Approved
            const applicationRef = ref(database, `trainingCenterApplications/${selectedApplication.id}`);
            const updateData = {
                status: 'Approved',
                approvedAt: new Date().toISOString(),
                approvedBy: 'admin',
                monthlyFee: approvalData.monthlyFee,
                renewalDate: approvalData.renewalDate,
                notes: approvalData.notes,
            };

            await update(applicationRef, updateData);

            // Create user account if requested
            if (approvalData.createUser) {
                try {
                    const result = await createUserFromApplication(selectedApplication);

                    if (result.success) {
                        // Update application with user info
                        await update(applicationRef, {
                            convertedToUser: true,
                            userId: result.userId,
                            convertedAt: new Date().toISOString()
                        });

                        setMessage(`✅ Application approved and user account created! User ID: ${result.userId}`);
                    }
                } catch (userError) {
                    console.error('Error creating user:', userError);
                    setMessage('✅ Application approved but user creation failed. You can create the user account later.');
                }
            } else {
                setMessage('✅ Application approved successfully!');
            }

            // Remove from pending list
            setApplications(prev => prev.filter(app => app.id !== selectedApplication.id));

            setShowApprovalModal(false);
            setTimeout(() => setMessage(''), 5000);

        } catch (error) {
            console.error('Error approving application:', error);
            setMessage('❌ Error approving application');
        } finally {
            setLoading(false);
        }
    };

    // Reject application
    const handleRejectApplication = async (reason = '') => {
        if (!selectedApplication) return;

        try {
            setLoading(true);

            const applicationRef = ref(database, `trainingCenterApplications/${selectedApplication.id}`);
            const updateData = {
                status: 'Rejected',
                rejectedAt: new Date().toISOString(),
                rejectedBy: 'admin',
                rejectionReason: reason
            };

            await update(applicationRef, updateData);

            // Remove from pending list
            setApplications(prev => prev.filter(app => app.id !== selectedApplication.id));

            setMessage('✅ Application rejected');
            setShowApprovalModal(false);
            setTimeout(() => setMessage(''), 3000);

        } catch (error) {
            console.error('Error rejecting application:', error);
            setMessage('❌ Error rejecting application');
        } finally {
            setLoading(false);
        }
    };

    // Filter and sort applications
    const filteredAndSortedApplications = applications
        .filter(app => {
            const searchLower = searchTerm.toLowerCase();
            const centerName = (app.personalDetails?.centerName || '').toLowerCase();
            const ownerName = (app.personalDetails?.ownerName || '').toLowerCase();
            const place = (app.personalDetails?.place || '').toLowerCase();

            return centerName.includes(searchLower) ||
                ownerName.includes(searchLower) ||
                place.includes(searchLower);
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.submittedAt) - new Date(a.submittedAt);
                case 'oldest':
                    return new Date(a.submittedAt) - new Date(b.submittedAt);
                case 'name':
                    return (a.personalDetails?.centerName || '').localeCompare(b.personalDetails?.centerName || '');
                default:
                    return 0;
            }
        });

    const styles = {
        container: {
            padding: '20px',
            backgroundColor: '#f8fafc',
            minHeight: '100vh',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        },

        header: {
            marginBottom: '30px',
            textAlign: 'center'
        },

        title: {
            fontSize: '2.8rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
        },

        subtitle: {
            fontSize: '1.2rem',
            color: '#64748b',
            marginBottom: '30px'
        },

        controls: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px',
            padding: '25px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        },

        controlGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },

        controlLabel: {
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },

        input: {
            padding: '12px 16px',
            fontSize: '14px',
            border: '2px solid #e2e8f0',
            borderRadius: '10px',
            outline: 'none',
            transition: 'all 0.3s ease'
        },

        select: {
            padding: '12px 16px',
            fontSize: '14px',
            border: '2px solid #e2e8f0',
            borderRadius: '10px',
            outline: 'none',
            backgroundColor: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        },

        gridContainer: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '25px',
            marginBottom: '30px'
        },

        applicationCard: {
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '25px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            position: 'relative',
            border: '2px solid transparent'
        },

        applicationHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px'
        },

        centerName: {
            fontSize: '1.4rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '5px'
        },

        centerOwner: {
            fontSize: '14px',
            color: '#64748b',
            fontWeight: '500'
        },

        statusBadge: {
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white'
        },

        applicationDetails: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '20px'
        },

        detailItem: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        },

        detailLabel: {
            fontSize: '11px',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },

        detailValue: {
            fontSize: '13px',
            color: '#1e293b',
            fontWeight: '600'
        },

        applicationActions: {
            display: 'flex',
            gap: '10px',
            justifyContent: 'space-between'
        },

        actionBtn: {
            flex: 1,
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: '600',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
        },

        viewBtn: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
        },

        approveBtn: {
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white'
        },

        rejectBtn: {
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white'
        },

        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
        },

        modal: {
            backgroundColor: 'white',
            borderRadius: '20px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 50px 100px rgba(0, 0, 0, 0.3)'
        },

        modalHeader: {
            padding: '25px 30px',
            borderBottom: '2px solid #f1f5f9',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
        },

        modalTitle: {
            fontSize: '1.6rem',
            fontWeight: '700',
            margin: 0
        },

        modalBody: {
            padding: '30px'
        },

        modalSection: {
            marginBottom: '30px'
        },

        modalSectionTitle: {
            fontSize: '1.2rem',
            fontWeight: '700',
            color: '#374151',
            marginBottom: '20px',
            paddingBottom: '10px',
            borderBottom: '2px solid #667eea'
        },

        modalGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
        },

        inputGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },

        checkbox: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '10px'
        },

        modalActions: {
            padding: '25px 30px',
            borderTop: '2px solid #f1f5f9',
            backgroundColor: '#f8fafc',
            display: 'flex',
            gap: '15px',
            justifyContent: 'flex-end'
        },

        modalBtn: {
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        },

        modalBtnPrimary: {
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white'
        },

        modalBtnDanger: {
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white'
        },

        modalBtnSecondary: {
            backgroundColor: '#e5e7eb',
            color: '#374151'
        },

        message: {
            padding: '16px 20px',
            borderRadius: '12px',
            marginBottom: '25px',
            fontSize: '14px',
            fontWeight: '600',
            textAlign: 'center'
        },

        messageSuccess: {
            background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
            color: '#065f46',
            border: '2px solid #10b981'
        },

        messageError: {
            background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
            color: '#991b1b',
            border: '2px solid #dc2626'
        },

        loading: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
            gap: '20px'
        },

        loadingSpinner: {
            width: '60px',
            height: '60px',
            border: '6px solid #f3f4f6',
            borderTop: '6px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        },

        loadingText: {
            fontSize: '18px',
            color: '#64748b',
            fontWeight: '600'
        },

        noData: {
            textAlign: 'center',
            padding: '80px 20px',
            color: '#64748b'
        },

        noDataIcon: {
            fontSize: '4rem',
            marginBottom: '20px',
            opacity: '0.5'
        }
    };

    // Add CSS animation
    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(styleElement);

        return () => {
            if (document.head.contains(styleElement)) {
                document.head.removeChild(styleElement);
            }
        };
    }, []);

    if (loading && applications.length === 0) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>
                    <div style={styles.loadingSpinner}></div>
                    <div style={styles.loadingText}>Loading pending applications...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>📋 Pending Applications</h1>
                <p style={styles.subtitle}>
                    Review and approve training center affiliation requests ({applications.length} pending)
                </p>
            </div>

            {/* Message */}
            {message && (
                <div style={{
                    ...styles.message,
                    ...(message.includes('❌') ? styles.messageError : styles.messageSuccess)
                }}>
                    {message}
                </div>
            )}

            {/* Controls */}
            <div style={styles.controls}>
                <div style={styles.controlGroup}>
                    <label style={styles.controlLabel}>Search Applications</label>
                    <input
                        style={styles.input}
                        type="text"
                        placeholder="Search by center name, owner, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={styles.controlGroup}>
                    <label style={styles.controlLabel}>Sort By</label>
                    <select
                        style={styles.select}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name">Center Name</option>
                    </select>
                </div>
            </div>

            {/* Applications Grid */}
            {filteredAndSortedApplications.length === 0 ? (
                <div style={styles.noData}>
                    <div style={styles.noDataIcon}>📋</div>
                    <h3>No pending applications found</h3>
                    <p>All applications have been processed or no applications match your search.</p>
                </div>
            ) : (
                <div style={styles.gridContainer}>
                    {filteredAndSortedApplications.map((application, index) => (
                        <div
                            key={application.id}
                            style={styles.applicationCard}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
                                e.currentTarget.style.borderColor = '#667eea';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.borderColor = 'transparent';
                            }}
                        >
                            <div style={styles.applicationHeader}>
                                <div>
                                    <h3 style={styles.centerName}>
                                        {application.personalDetails?.centerName}
                                    </h3>
                                    <p style={styles.centerOwner}>
                                        👤 {application.personalDetails?.ownerName}
                                    </p>
                                </div>
                                <div style={styles.statusBadge}>
                                    {application.status}
                                </div>
                            </div>

                            <div style={styles.applicationDetails}>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailLabel}>Location</span>
                                    <span style={styles.detailValue}>
                                        📍 {application.personalDetails?.place}, {application.personalDetails?.state}
                                    </span>
                                </div>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailLabel}>Trade</span>
                                    <span style={styles.detailValue}>
                                        🎯 {application.premisesDetails?.trade}
                                    </span>
                                </div>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailLabel}>Capacity</span>
                                    <span style={styles.detailValue}>
                                        👥 {application.premisesDetails?.seatRequire} seats
                                    </span>
                                </div>
                                <div style={styles.detailItem}>
                                    <span style={styles.detailLabel}>Applied</span>
                                    <span style={styles.detailValue}>
                                        📅 {new Date(application.submittedAt).toLocaleDateString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            <div style={styles.applicationActions}>
                                <button
                                    style={{ ...styles.actionBtn, ...styles.viewBtn }}
                                    onClick={() => {
                                        setSelectedApplication(application);
                                        setShowDetailsModal(true);
                                    }}
                                >
                                    👁️ View Details
                                </button>
                                <button
                                    style={{ ...styles.actionBtn, ...styles.approveBtn }}
                                    onClick={() => {
                                        setSelectedApplication(application);
                                        setApprovalData({
                                            monthlyFee: '',
                                            renewalDate: '',
                                            notes: '',
                                            createUser: true
                                        });
                                        setShowApprovalModal(true);
                                    }}
                                >
                                    ✅ Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedApplication && (
                <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                📋 {selectedApplication.personalDetails?.centerName} - Application Details
                            </h2>
                        </div>

                        <div style={styles.modalBody}>
                            <div style={styles.modalSection}>
                                <h3 style={styles.modalSectionTitle}>Personal Details</h3>
                                <div style={styles.modalGrid}>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Center Name</span>
                                        <span style={styles.detailValue}>{selectedApplication.personalDetails?.centerName}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Firm Name</span>
                                        <span style={styles.detailValue}>{selectedApplication.personalDetails?.firmName}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Owner Name</span>
                                        <span style={styles.detailValue}>{selectedApplication.personalDetails?.ownerName}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Contact</span>
                                        <span style={styles.detailValue}>{selectedApplication.personalDetails?.contactNumber}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.modalSection}>
                                <h3 style={styles.modalSectionTitle}>Training Details</h3>
                                <div style={styles.modalGrid}>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Email</span>
                                        <span style={styles.detailValue}>{selectedApplication.trainingDetails?.email}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Mobile</span>
                                        <span style={styles.detailValue}>{selectedApplication.trainingDetails?.mobileNumber}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Computers</span>
                                        <span style={styles.detailValue}>{selectedApplication.trainingDetails?.computerSystems}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>LCD Projector</span>
                                        <span style={styles.detailValue}>{selectedApplication.trainingDetails?.lcdProjector ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.modalSection}>
                                <h3 style={styles.modalSectionTitle}>Premises Details</h3>
                                <div style={styles.modalGrid}>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Area (Sq.Ft)</span>
                                        <span style={styles.detailValue}>{selectedApplication.premisesDetails?.premisesArea}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Classrooms</span>
                                        <span style={styles.detailValue}>{selectedApplication.premisesDetails?.noOfClassroom}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Labs</span>
                                        <span style={styles.detailValue}>{selectedApplication.premisesDetails?.noOfLab}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Trade</span>
                                        <span style={styles.detailValue}>{selectedApplication.premisesDetails?.trade}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={styles.modalActions}>
                            <button
                                style={{ ...styles.modalBtn, ...styles.modalBtnSecondary }}
                                onClick={() => setShowDetailsModal(false)}
                            >
                                Close
                            </button>
                            <button
                                style={{ ...styles.modalBtn, ...styles.modalBtnPrimary }}
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setApprovalData({
                                        monthlyFee: '',
                                        renewalDate: '',
                                        notes: '',
                                        createUser: true
                                    });
                                    setShowApprovalModal(true);
                                }}
                            >
                                ✅ Approve Application
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approval Modal */}
            {showApprovalModal && selectedApplication && (
                <div style={styles.modalOverlay} onClick={() => setShowApprovalModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                ✅ Approve {selectedApplication.personalDetails?.centerName}
                            </h2>
                        </div>

                        <div style={styles.modalBody}>
                            <div style={styles.modalGrid}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.controlLabel}>Monthly Fee (₹)</label>
                                    <input
                                        style={styles.input}
                                        type="number"
                                        placeholder="Enter monthly fee"
                                        value={approvalData.monthlyFee}
                                        onChange={(e) => setApprovalData(prev => ({
                                            ...prev,
                                            monthlyFee: e.target.value
                                        }))}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.controlLabel}>Renewal Date</label>
                                    <input
                                        style={styles.input}
                                        type="date"
                                        value={approvalData.renewalDate}
                                        onChange={(e) => setApprovalData(prev => ({
                                            ...prev,
                                            renewalDate: e.target.value
                                        }))}
                                    />
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.controlLabel}>Notes</label>
                                <textarea
                                    style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                                    placeholder="Add approval notes..."
                                    value={approvalData.notes}
                                    onChange={(e) => setApprovalData(prev => ({
                                        ...prev,
                                        notes: e.target.value
                                    }))}
                                />
                            </div>

                            <div style={styles.checkbox}>
                                <input
                                    type="checkbox"
                                    id="createUser"
                                    checked={approvalData.createUser}
                                    onChange={(e) => setApprovalData(prev => ({
                                        ...prev,
                                        createUser: e.target.checked
                                    }))}
                                />
                                <label htmlFor="createUser" style={styles.controlLabel}>
                                    Create user account immediately
                                </label>
                            </div>
                        </div>

                        <div style={styles.modalActions}>
                            <button
                                style={{ ...styles.modalBtn, ...styles.modalBtnSecondary }}
                                onClick={() => setShowApprovalModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                style={{ ...styles.modalBtn, ...styles.modalBtnDanger }}
                                onClick={() => {
                                    const reason = prompt('Enter rejection reason (optional):');
                                    if (reason !== null) {
                                        handleRejectApplication(reason);
                                    }
                                }}
                            >
                                ❌ Reject
                            </button>
                            <button
                                style={{ ...styles.modalBtn, ...styles.modalBtnPrimary }}
                                onClick={handleApproveApplication}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : '✅ Approve & Create User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingApplications;
