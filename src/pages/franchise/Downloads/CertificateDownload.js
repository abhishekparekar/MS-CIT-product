import React, { useState, useEffect } from 'react';
import { database } from '../../../firebase/config';
import { ref, onValue, remove } from 'firebase/database';

const CertificateDownload = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCertificates, setSelectedCertificates] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const certificatesRef = ref(database, 'certificates');
    const unsubscribe = onValue(certificatesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const certsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        certsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCertificates(certsList);
      } else {
        setCertificates([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this certificate record?')) {
      try {
        await remove(ref(database, `certificates/${id}`));
        alert('Certificate record deleted successfully');
      } catch (error) {
        alert('Error deleting record');
      }
    }
  };

  const handleView = (certificate) => {
    setSelectedCertificate(certificate);
    setShowCertificateModal(true);
  };

  const handleSelectCertificate = (certificateId) => {
    setSelectedCertificates(prev => {
      if (prev.includes(certificateId)) {
        return prev.filter(id => id !== certificateId);
      } else {
        return [...prev, certificateId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCertificates([]);
    } else {
      setSelectedCertificates(filteredCertificates.map(cert => cert.id));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkDownload = async () => {
    if (selectedCertificates.length === 0) {
      alert('Please select at least one certificate to download');
      return;
    }

    setIsDownloading(true);
    
    try {
      const selectedCerts = certificates.filter(cert => 
        selectedCertificates.includes(cert.id)
      );

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Bulk Certificate Download</title>
            <style>
              body { 
                font-family: 'Inter', Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: #f9fafb;
              }
              .certificate-page {
                page-break-after: always;
                margin-bottom: 40px;
                background: #fff;
                padding: 40px;
                display: flex;
                justify-content: center;
              }
              .certificate-page:last-child {
                page-break-after: auto;
              }
              .border {
                border: 8px solid #d4af37;
                padding: 60px 80px;
                max-width: 800px;
                width: 100%;
                background: #fffef7;
                position: relative;
              }
              .cert-header {
                text-align: center;
                margin-bottom: 40px;
              }
              .institute-name {
                font-size: 32px;
                font-weight: 800;
                color: #1a365d;
                margin: 0 0 8px 0;
                text-transform: uppercase;
              }
              .tagline {
                font-size: 14px;
                color: #4a5568;
                margin: 0;
                font-style: italic;
              }
              .certificate-title {
                text-align: center;
                margin-bottom: 40px;
                padding: 20px 0;
                background: #d4af37;
                color: #fff;
                margin: 0 -80px 40px -80px;
              }
              .content {
                text-align: center;
                line-height: 1.8;
              }
              .presented-to {
                font-size: 18px;
                color: #2d3748;
                margin: 0 0 20px 0;
              }
              .student-name {
                font-size: 36px;
                font-weight: 800;
                color: #1a365d;
                margin: 20px 0;
                text-transform: uppercase;
                text-decoration: underline;
                text-decoration-color: #d4af37;
              }
              .completion-text {
                font-size: 18px;
                color: #2d3748;
                margin: 20px 0;
              }
              .course-name {
                font-size: 24px;
                font-weight: 700;
                color: #d4af37;
                margin: 20px 0;
                text-transform: uppercase;
              }
              .details {
                margin: 40px 0;
                font-size: 16px;
                color: #4a5568;
              }
              .date-section {
                margin: 40px 0;
                font-size: 14px;
                color: #4a5568;
              }
              .signatures {
                display: flex;
                justify-content: space-between;
                margin-top: 60px;
              }
              .signature {
                text-align: center;
                font-size: 14px;
                color: #4a5568;
              }
              .signature-line {
                width: 150px;
                height: 2px;
                background: #000;
                margin-bottom: 10px;
              }
              @media print {
                body { margin: 0; padding: 0; }
                .certificate-page { margin: 0; padding: 20px; }
              }
            </style>
          </head>
          <body>
      `);

      selectedCerts.forEach((cert) => {
        printWindow.document.write(`
          <div class="certificate-page">
            <div class="border">
              <div class="cert-header">
                <h1 class="institute-name">COMPUTER TRAINING INSTITUTE</h1>
                <p class="tagline">Excellence in Computer Education</p>
              </div>
              <div class="certificate-title">
                <h2>CERTIFICATE OF COMPLETION</h2>
              </div>
              <div class="content">
                <p class="presented-to">This is to certify that</p>
                <div class="student-name">${cert.studentName}</div>
                <p class="completion-text">has successfully completed the course in</p>
                <div class="course-name">${getCourseLabel(cert.course)}</div>
                <div class="details">
                  <p>Duration: ${cert.duration}</p>
                  <p>Grade: ${cert.grade}</p>
                  <p>Roll Number: ${cert.rollNumber}</p>
                </div>
                <div class="date-section">
                  <p>Date of Issue: ${new Date(cert.issueDate).toLocaleDateString()}</p>
                  <p>Certificate No: ${cert.certificateNumber}</p>
                </div>
                ${cert.remarks ? `
                  <div style="margin: 30px 0; padding: 20px; background: #f7fafc; border-radius: 8px; text-align: left;">
                    <p style="font-size: 14px; font-weight: 600; color: #2d3748; margin: 0 0 8px 0;">Remarks:</p>
                    <p style="font-size: 14px; color: #4a5568; margin: 0; font-style: italic;">${cert.remarks}</p>
                  </div>
                ` : ''}
              </div>
              <div class="signatures">
                <div class="signature">
                  <div class="signature-line"></div>
                  <p>Principal</p>
                </div>
                <div class="signature">
                  <div class="signature-line"></div>
                  <p>Director</p>
                </div>
              </div>
            </div>
          </div>
        `);
      });

      printWindow.document.write(`
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
      }, 500);

    } catch (error) {
      console.error('Error downloading certificates:', error);
      alert('Error downloading certificates');
    }
    
    setIsDownloading(false);
  };

  const filteredCertificates = certificates.filter(cert =>
    cert.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.certificateNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading certificates...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🏆 Certificate Downloads</h1>
        <p style={styles.subtitle}>View and manage all issued certificates</p>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{certificates.length}</div>
          <div style={styles.statLabel}>Total Certificates</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {certificates.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length}
          </div>
          <div style={styles.statLabel}>This Month</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {certificates.filter(c => c.grade === 'A' || c.grade === 'A+').length}
          </div>
          <div style={styles.statLabel}>Grade A/A+</div>
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controlsRow}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by student name, roll number, or certificate number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.bulkActions}>
          <button
            onClick={handleSelectAll}
            style={styles.selectAllButton}
          >
            {selectAll ? '✅ Deselect All' : '☑️ Select All'}
          </button>
          <button
            onClick={handleBulkDownload}
            disabled={selectedCertificates.length === 0 || isDownloading}
            style={{
              ...styles.downloadButton,
              opacity: selectedCertificates.length === 0 || isDownloading ? 0.5 : 1
            }}
          >
            {isDownloading ? '⏳ Downloading...' : `📥 Download Selected (${selectedCertificates.length})`}
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        {filteredCertificates.length === 0 ? (
          <div style={styles.emptyState}>
            <h3>No certificates found</h3>
            <p>No certificates match your search criteria.</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      style={styles.checkbox}
                    />
                  </th>
                  <th style={styles.th}>Student Name</th>
                  <th style={styles.th}>Roll Number</th>
                  <th style={styles.th}>Course</th>
                  <th style={styles.th}>Certificate No.</th>
                  <th style={styles.th}>Issue Date</th>
                  <th style={styles.th}>Grade</th>
                  <th style={styles.th}>Duration</th>
                  <th style={styles.th}>Created On</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCertificates.map((cert, index) => (
                  <tr key={cert.id} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                    <td style={styles.td}>
                      <input
                        type="checkbox"
                        checked={selectedCertificates.includes(cert.id)}
                        onChange={() => handleSelectCertificate(cert.id)}
                        style={styles.checkbox}
                      />
                    </td>
                    <td style={styles.td}>
                      <strong>{cert.studentName}</strong>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.rollNumber}>{cert.rollNumber}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.courseBadge}>
                        {getCourseLabel(cert.course)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.certificateNumber}>{cert.certificateNumber}</div>
                    </td>
                    <td style={styles.td}>{new Date(cert.issueDate).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.gradeBadge,
                        backgroundColor: getGradeColor(cert.grade)
                      }}>
                        {cert.grade}
                      </span>
                    </td>
                    <td style={styles.td}>{cert.duration}</td>
                    <td style={styles.td}>{new Date(cert.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => handleView(cert)}
                          style={{...styles.actionBtn, backgroundColor: '#10b981'}}
                          title="View Certificate"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => handleDelete(cert.id)}
                          style={{...styles.actionBtn, backgroundColor: '#ef4444'}}
                          title="Delete Record"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {showCertificateModal && selectedCertificate && (
        <CertificateModal
          certificate={selectedCertificate}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </div>
  );
};

// Certificate Modal Component
const CertificateModal = ({ certificate, onClose }) => {
  const handlePrint = () => {
    const printContent = document.getElementById('modal-certificate');
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>Certificate Preview</h3>
          <div style={styles.modalActions}>
            <button onClick={handlePrint} style={styles.printModalButton}>
              🖨️ Print
            </button>
            <button onClick={onClose} style={styles.closeModalButton}>
              ❌ Close
            </button>
          </div>
        </div>
        
        <div id="modal-certificate" style={styles.modalBody}>
          <div style={styles.certificateContainer}>
            <div style={styles.border}>
              <div style={styles.certHeader}>
                <h1 style={styles.instituteName}>COMPUTER TRAINING INSTITUTE</h1>
                <p style={styles.tagline}>Excellence in Computer Education</p>
              </div>

              <div style={styles.certificateTitle}>
                <h2>CERTIFICATE OF COMPLETION</h2>
              </div>

              <div style={styles.content}>
                <p style={styles.presentedTo}>This is to certify that</p>
                
                <div style={styles.studentName}>
                  {certificate.studentName}
                </div>
                
                <p style={styles.completionText}>
                  has successfully completed the course in
                </p>
                
                <div style={styles.courseName}>
                  {getCourseLabel(certificate.course)}
                </div>
                
                <div style={styles.details}>
                  <p>Duration: {certificate.duration}</p>
                  <p>Grade: {certificate.grade}</p>
                  <p>Roll Number: {certificate.rollNumber}</p>
                </div>
                
                <div style={styles.dateSection}>
                  <p>Date of Issue: {new Date(certificate.issueDate).toLocaleDateString()}</p>
                  <p>Certificate No: {certificate.certificateNumber}</p>
                </div>

                {certificate.remarks && (
                  <div style={styles.remarksSection}>
                    <p style={styles.remarksLabel}>Remarks:</p>
                    <p style={styles.remarksText}>{certificate.remarks}</p>
                  </div>
                )}
              </div>

              <div style={styles.signatures}>
                <div style={styles.signature}>
                  <div style={styles.signatureLine}></div>
                  <p>Principal</p>
                </div>
                <div style={styles.signature}>
                  <div style={styles.signatureLine}></div>
                  <p>Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getCourseLabel = (courseValue) => {
  const courseOptions = {
    'basic-computer': 'Basic Computer Course',
    'ms-office': 'MS Office Suite',
    'web-development': 'Web Development',
    'programming-basics': 'Programming Basics',
    'data-entry': 'Data Entry Specialist',
    'digital-marketing': 'Digital Marketing',
    'graphic-design': 'Graphic Design',
    'computer-repair': 'Computer Hardware & Repair',
    'accounting-software': 'Accounting Software',
    'advanced-excel': 'Advanced Excel & Data Analysis'
  };
  return courseOptions[courseValue] || courseValue;
};

const getGradeColor = (grade) => {
  switch (grade) {
    case 'A+': return '#10b981';
    case 'A': return '#059669';
    case 'B+': return '#f59e0b';
    case 'B': return '#d97706';
    case 'C': return '#ef4444';
    default: return '#6b7280';
  }
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
    height: '60vh',
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #10b981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#1f2937',
    margin: '0 0 12px 0'
  },
  subtitle: {
    fontSize: '18px',
    color: '#6b7280',
    margin: 0
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#10b981',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  controlsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    gap: '16px',
    flexWrap: 'wrap'
  },
  searchContainer: {
    flex: 1,
    minWidth: '300px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #d1d5db',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  bulkActions: {
    display: 'flex',
    gap: '12px'
  },
  selectAllButton: {
    backgroundColor: '#6b7280',
    color: '#fff',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  downloadButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    backgroundColor: '#f8fafc'
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '2px solid #e5e7eb',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px'
  },
  evenRow: {
    backgroundColor: '#f9fafb'
  },
  oddRow: {
    backgroundColor: '#fff'
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  rollNumber: {
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'monospace'
  },
  certificateNumber: {
    fontWeight: '600',
    color: '#7c3aed',
    fontFamily: 'monospace',
    fontSize: '12px'
  },
  courseBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600'
  },
  gradeBadge: {
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  actionBtn: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    color: '#fff',
    transition: 'all 0.2s ease'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280'
  },
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    width: '95%',
    maxWidth: '1000px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 32px',
    borderBottom: '2px solid #e5e7eb'
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0
  },
  modalActions: {
    display: 'flex',
    gap: '12px'
  },
  printModalButton: {
    backgroundColor: '#d4af37',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  closeModalButton: {
    backgroundColor: '#6b7280',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  modalBody: {
    padding: '32px'
  },
  // Certificate Styles (reused from CreateCertificate)
  certificateContainer: {
    backgroundColor: '#fff',
    padding: '40px',
    display: 'flex',
    justifyContent: 'center'
  },
  border: {
    border: '8px solid #d4af37',
    borderImage: 'linear-gradient(45deg, #d4af37, #ffd700) 1',
    padding: '60px 80px',
    maxWidth: '800px',
    width: '100%',
    position: 'relative',
    backgroundColor: '#fffef7'
  },
  certHeader: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  instituteName: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1a365d',
    margin: '0 0 8px 0',
    textTransform: 'uppercase'
  },
  tagline: {
    fontSize: '14px',
    color: '#4a5568',
    margin: 0,
    fontStyle: 'italic'
  },
  certificateTitle: {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '20px 0',
    backgroundColor: '#d4af37',
    color: '#fff',
    margin: '0 -80px 40px -80px'
  },
  content: {
    textAlign: 'center',
    lineHeight: '1.8'
  },
  presentedTo: {
    fontSize: '18px',
    color: '#2d3748',
    margin: '0 0 20px 0'
  },
  studentName: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#1a365d',
    margin: '20px 0',
    textTransform: 'uppercase',
    textDecoration: 'underline',
    textDecorationColor: '#d4af37'
  },
  completionText: {
    fontSize: '18px',
    color: '#2d3748',
    margin: '20px 0'
  },
  courseName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#d4af37',
    margin: '20px 0',
    textTransform: 'uppercase'
  },
  details: {
    margin: '40px 0',
    fontSize: '16px',
    color: '#4a5568'
  },
  dateSection: {
    margin: '40px 0',
    fontSize: '14px',
    color: '#4a5568'
  },
  remarksSection: {
    margin: '30px 0',
    padding: '20px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    textAlign: 'left'
  },
  remarksLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
    margin: '0 0 8px 0'
  },
  remarksText: {
    fontSize: '14px',
    color: '#4a5568',
    margin: 0,
    fontStyle: 'italic'
  },
  signatures: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '60px'
  },
  signature: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#4a5568'
  },
  signatureLine: {
    width: '150px',
    height: '2px',
    backgroundColor: '#000',
    marginBottom: '10px'
  }
};

// Add CSS animations
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
      
      .stats-row {
        grid-template-columns: 1fr !important;
      }
      
      .controls-row {
        flex-direction: column !important;
        align-items: stretch !important;
      }
      
      .search-container {
        min-width: auto !important;
      }
      
      .bulk-actions {
        justify-content: center !important;
      }
      
      .th, .td {
        padding: 8px !important;
        font-size: 12px !important;
      }
      
      .modal-content {
        width: 98% !important;
        margin: 10px;
      }
      
      .modal-header {
        flex-direction: column !important;
        gap: 16px;
      }
    }
    
    .search-input:focus {
      border-color: #10b981 !important;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
    }
    
    .action-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
    }
    
    .select-all-button:hover {
      background-color: #4b5563 !important;
      transform: translateY(-1px);
    }
    
    .download-button:hover:not(:disabled) {
      background-color: #2563eb !important;
      transform: translateY(-1px);
    }
    
    .print-modal-button:hover {
      background-color: #b8860b !important;
    }
    
    .close-modal-button:hover {
      background-color: #4b5563 !important;
    }
  `;
  document.head.appendChild(style);
}

export default CertificateDownload;
