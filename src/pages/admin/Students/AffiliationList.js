import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';

const AffiliationList = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [message, setMessage] = useState('');
    const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });

    // Fetch applications from Firestore
    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, 'trainingCenterApplications'));
            const applicationsData = [];
            
            querySnapshot.forEach((doc) => {
                applicationsData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            setApplications(applicationsData);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setMessage('Error fetching applications');
        } finally {
            setLoading(false);
        }
    };

    // Update application status
    const updateApplicationStatus = async (applicationId, newStatus) => {
        try {
            await updateDoc(doc(db, 'trainingCenterApplications', applicationId), {
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
            
            setApplications(prev => prev.map(app => 
                app.id === applicationId ? { ...app, status: newStatus } : app
            ));
            
            setMessage(`✅ Application ${newStatus.toLowerCase()} successfully`);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error updating status:', error);
            setMessage('❌ Error updating application status');
        }
    };

    // Send login credentials
    const handleSendLogin = async () => {
        if (!selectedApplication) return;
        
        try {
            await updateDoc(doc(db, 'trainingCenterApplications', selectedApplication.id), {
                loginSent: true,
                loginSentAt: new Date().toISOString(),
                loginCredentials: loginCredentials
            });
            
            setApplications(prev => prev.map(app => 
                app.id === selectedApplication.id 
                    ? { ...app, loginSent: true, loginCredentials: loginCredentials } 
                    : app
            ));
            
            setMessage('🎉 Login credentials sent successfully!');
            setShowLoginModal(false);
            setLoginCredentials({ username: '', password: '' });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error sending login:', error);
            setMessage('❌ Error sending login credentials');
        }
    };

    // Filter applications
    const filteredApplications = applications.filter(app => {
        const matchesSearch = 
            app.centerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.applicationId?.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        const colors = {
            'Under Review': '#f59e0b',
            'Approved': '#10b981',
            'Rejected': '#ef4444',
            'Pending': '#6b7280'
        };
        return colors[status] || '#6b7280';
    };

    const styles = {
        container: {
            padding: '20px',
            backgroundColor: '#f8fafc',
            minHeight: '100vh',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        },
        
        header: {
            marginBottom: '30px'
        },
        
        title: {
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#1e293b',
            marginBottom: '10px'
        },
        
        subtitle: {
            fontSize: '1.1rem',
            color: '#64748b',
            marginBottom: '30px'
        },
        
        controls: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        },
        
        searchInput: {
            padding: '12px 16px',
            fontSize: '14px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            outline: 'none',
            transition: 'all 0.3s ease'
        },
        
        filterSelect: {
            padding: '12px 16px',
            fontSize: '14px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            outline: 'none',
            backgroundColor: 'white',
            cursor: 'pointer'
        },
        
        stats: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
        },
        
        statCard: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            textAlign: 'center'
        },
        
        statNumber: {
            fontSize: '2rem',
            fontWeight: '800',
            color: '#2563eb',
            marginBottom: '5px'
        },
        
        statLabel: {
            fontSize: '14px',
            color: '#64748b',
            fontWeight: '500'
        },
        
        tableContainer: {
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
        },
        
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
        },
        
        tableHeader: {
            backgroundColor: '#2563eb',
            color: 'white'
        },
        
        th: {
            padding: '16px 12px',
            textAlign: 'left',
            fontWeight: '600',
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        
        td: {
            padding: '16px 12px',
            borderBottom: '1px solid #e2e8f0'
        },
        
        tableRow: {
            transition: 'background-color 0.2s ease'
        },
        
        statusBadge: {
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            color: 'white',
            display: 'inline-block'
        },
        
        actionButtons: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
        },
        
        actionBtn: {
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '600',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
        },
        
        viewBtn: {
            backgroundColor: '#3b82f6',
            color: 'white'
        },
        
        approveBtn: {
            backgroundColor: '#10b981',
            color: 'white'
        },
        
        rejectBtn: {
            backgroundColor: '#ef4444',
            color: 'white'
        },
        
        loginBtn: {
            backgroundColor: '#8b5cf6',
            color: 'white'
        },
        
        // Modal Styles
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
        },
        
        modal: {
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
        },
        
        modalHeader: {
            padding: '20px 30px',
            borderBottom: '2px solid #e2e8f0',
            backgroundColor: '#f8fafc'
        },
        
        modalTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b',
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
            fontWeight: '600',
            color: '#374151',
            marginBottom: '15px',
            paddingBottom: '8px',
            borderBottom: '2px solid #3b82f6'
        },
        
        detailGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px'
        },
        
        detailItem: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        },
        
        detailLabel: {
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        
        detailValue: {
            fontSize: '14px',
            color: '#1e293b',
            fontWeight: '500'
        },
        
        modalActions: {
            padding: '20px 30px',
            borderTop: '2px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
        },
        
        modalBtn: {
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        },
        
        modalBtnPrimary: {
            backgroundColor: '#2563eb',
            color: 'white'
        },
        
        modalBtnSecondary: {
            backgroundColor: '#e5e7eb',
            color: '#374151'
        },
        
        loginForm: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        
        loginInput: {
            padding: '12px 16px',
            fontSize: '14px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            outline: 'none'
        },
        
        message: {
            padding: '12px 20px',
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
        
        loading: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
            fontSize: '18px',
            color: '#64748b'
        },
        
        noData: {
            textAlign: 'center',
            padding: '60px 20px',
            color: '#64748b',
            fontSize: '16px'
        },
        
        fileLinks: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px'
        },
        
        fileLink: {
            padding: '4px 8px',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500'
        }
    };

    // Statistics
    const stats = {
        total: applications.length,
        pending: applications.filter(app => app.status === 'Under Review').length,
        approved: applications.filter(app => app.status === 'Approved').length,
        rejected: applications.filter(app => app.status === 'Rejected').length
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>
                    <div>Loading applications...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>📋 Training Center Applications</h1>
                <p style={styles.subtitle}>Manage and review all training center affiliation applications</p>
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

            {/* Statistics */}
            <div style={styles.stats}>
                <div style={styles.statCard}>
                    <div style={styles.statNumber}>{stats.total}</div>
                    <div style={styles.statLabel}>Total Applications</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{...styles.statNumber, color: '#f59e0b'}}>{stats.pending}</div>
                    <div style={styles.statLabel}>Under Review</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{...styles.statNumber, color: '#10b981'}}>{stats.approved}</div>
                    <div style={styles.statLabel}>Approved</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{...styles.statNumber, color: '#ef4444'}}>{stats.rejected}</div>
                    <div style={styles.statLabel}>Rejected</div>
                </div>
            </div>

            {/* Controls */}
            <div style={styles.controls}>
                <div>
                    <label style={styles.detailLabel}>Search Applications</label>
                    <input
                        style={styles.searchInput}
                        type="text"
                        placeholder="Search by center name, owner, email, or application ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div>
                    <label style={styles.detailLabel}>Filter by Status</label>
                    <select
                        style={styles.filterSelect}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Applications</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div style={styles.tableContainer}>
                {filteredApplications.length === 0 ? (
                    <div style={styles.noData}>
                        <h3>No applications found</h3>
                        <p>No applications match your current search and filter criteria.</p>
                    </div>
                ) : (
                    <table style={styles.table}>
                        <thead style={styles.tableHeader}>
                            <tr>
                                <th style={styles.th}>Application ID</th>
                                <th style={styles.th}>Center Name</th>
                                <th style={styles.th}>Owner Name</th>
                                <th style={styles.th}>Location</th>
                                <th style={styles.th}>Trade</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Submitted</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.map((app) => (
                                <tr
                                    key={app.id}
                                    style={styles.tableRow}
                                    onMouseEnter={(e) => e.target.closest('tr').style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.target.closest('tr').style.backgroundColor = 'transparent'}
                                >
                                    <td style={styles.td}>
                                        <strong>{app.applicationId}</strong>
                                    </td>
                                    <td style={styles.td}>{app.centerName}</td>
                                    <td style={styles.td}>{app.ownerName}</td>
                                    <td style={styles.td}>{app.place}, {app.state}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            padding: '2px 8px',
                                            backgroundColor: '#eff6ff',
                                            color: '#2563eb',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}>
                                            {app.trade}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: getStatusColor(app.status)
                                        }}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {new Date(app.submittedAt).toLocaleDateString('en-IN')}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.actionButtons}>
                                            <button
                                                style={{...styles.actionBtn, ...styles.viewBtn}}
                                                onClick={() => {
                                                    setSelectedApplication(app);
                                                    setShowDetailsModal(true);
                                                }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                                            >
                                                👁️ View
                                            </button>
                                            
                                            {app.status === 'Under Review' && (
                                                <>
                                                    <button
                                                        style={{...styles.actionBtn, ...styles.approveBtn}}
                                                        onClick={() => updateApplicationStatus(app.id, 'Approved')}
                                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                                                    >
                                                        ✅ Approve
                                                    </button>
                                                    <button
                                                        style={{...styles.actionBtn, ...styles.rejectBtn}}
                                                        onClick={() => updateApplicationStatus(app.id, 'Rejected')}
                                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                                                    >
                                                        ❌ Reject
                                                    </button>
                                                </>
                                            )}
                                            
                                            {app.status === 'Approved' && !app.loginSent && (
                                                <button
                                                    style={{...styles.actionBtn, ...styles.loginBtn}}
                                                    onClick={() => {
                                                        setSelectedApplication(app);
                                                        setShowLoginModal(true);
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#7c3aed'}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#8b5cf6'}
                                                >
                                                    🔐 Send Login
                                                </button>
                                            )}
                                            
                                            {app.loginSent && (
                                                <span style={{
                                                    fontSize: '12px',
                                                    color: '#059669',
                                                    fontWeight: '600'
                                                }}>
                                                    ✅ Login Sent
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedApplication && (
                <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                Application Details - {selectedApplication.applicationId}
                            </h2>
                        </div>
                        
                        <div style={styles.modalBody}>
                            {/* Personal Details */}
                            <div style={styles.modalSection}>
                                <h3 style={styles.modalSectionTitle}>📋 Personal Details</h3>
                                <div style={styles.detailGrid}>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Center Name</span>
                                        <span style={styles.detailValue}>{selectedApplication.centerName}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Firm Name</span>
                                        <span style={styles.detailValue}>{selectedApplication.firmName}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Owner Name</span>
                                        <span style={styles.detailValue}>{selectedApplication.ownerName}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Contact Number</span>
                                        <span style={styles.detailValue}>{selectedApplication.contactNumber}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Email</span>
                                        <span style={styles.detailValue}>{selectedApplication.email}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Qualification</span>
                                        <span style={styles.detailValue}>{selectedApplication.qualification}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Address Details */}
                            <div style={styles.modalSection}>
                                <h3 style={styles.modalSectionTitle}>📍 Location Details</h3>
                                <div style={styles.detailGrid}>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Place</span>
                                        <span style={styles.detailValue}>{selectedApplication.place}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>District</span>
                                        <span style={styles.detailValue}>{selectedApplication.district}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>State</span>
                                        <span style={styles.detailValue}>{selectedApplication.state}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Center Type</span>
                                        <span style={styles.detailValue}>{selectedApplication.centerType}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Details */}
                            <div style={styles.modalSection}>
                                <h3 style={styles.modalSectionTitle}>💻 Technical Details</h3>
                                <div style={styles.detailGrid}>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Computer Systems</span>
                                        <span style={styles.detailValue}>{selectedApplication.computerSystems}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>LCD Projector</span>
                                        <span style={styles.detailValue}>{selectedApplication.lcdProjector}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Classrooms</span>
                                        <span style={styles.detailValue}>{selectedApplication.noOfClassroom}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Labs</span>
                                        <span style={styles.detailValue}>{selectedApplication.noOfLab}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Trade</span>
                                        <span style={styles.detailValue}>{selectedApplication.trade}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Seats Required</span>
                                        <span style={styles.detailValue}>{selectedApplication.seatRequire}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Details */}
                            <div style={styles.modalSection}>
                                <h3 style={styles.modalSectionTitle}>💰 Financial Details</h3>
                                <div style={styles.detailGrid}>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Affiliation Fee</span>
                                        <span style={styles.detailValue}>₹{selectedApplication.affiliationFee}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Payment Mode</span>
                                        <span style={styles.detailValue}>{selectedApplication.modeOfPayment}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Bank Name</span>
                                        <span style={styles.detailValue}>{selectedApplication.bankName}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span style={styles.detailLabel}>Account Number</span>
                                        <span style={styles.detailValue}>{selectedApplication.accountNo}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Uploaded Files */}
                            {selectedApplication.files && (
                                <div style={styles.modalSection}>
                                    <h3 style={styles.modalSectionTitle}>📁 Uploaded Files</h3>
                                    <div style={styles.fileLinks}>
                                        {Object.entries(selectedApplication.files).map(([key, url]) => (
                                            <a
                                                key={key}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={styles.fileLink}
                                            >
                                                📄 {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div style={styles.modalActions}>
                            <button
                                style={{...styles.modalBtn, ...styles.modalBtnSecondary}}
                                onClick={() => setShowDetailsModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Login Modal */}
            {showLoginModal && selectedApplication && (
                <div style={styles.modalOverlay} onClick={() => setShowLoginModal(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                🔐 Send Login Credentials
                            </h2>
                        </div>
                        
                        <div style={styles.modalBody}>
                            <p><strong>Center:</strong> {selectedApplication.centerName}</p>
                            <p><strong>Owner:</strong> {selectedApplication.ownerName}</p>
                            <p><strong>Email:</strong> {selectedApplication.email}</p>
                            
                            <div style={styles.loginForm}>
                                <div>
                                    <label style={styles.detailLabel}>Username</label>
                                    <input
                                        style={styles.loginInput}
                                        type="text"
                                        placeholder="Enter username for login"
                                        value={loginCredentials.username}
                                        onChange={(e) => setLoginCredentials(prev => ({
                                            ...prev,
                                            username: e.target.value
                                        }))}
                                    />
                                </div>
                                <div>
                                    <label style={styles.detailLabel}>Password</label>
                                    <input
                                        style={styles.loginInput}
                                        type="text"
                                        placeholder="Enter password for login"
                                        value={loginCredentials.password}
                                        onChange={(e) => setLoginCredentials(prev => ({
                                            ...prev,
                                            password: e.target.value
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div style={styles.modalActions}>
                            <button
                                style={{...styles.modalBtn, ...styles.modalBtnSecondary}}
                                onClick={() => setShowLoginModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                style={{...styles.modalBtn, ...styles.modalBtnPrimary}}
                                onClick={handleSendLogin}
                                disabled={!loginCredentials.username || !loginCredentials.password}
                            >
                                📧 Send Login Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AffiliationList;
