import React, { useState, useEffect } from 'react';
import { database } from '../../../firebase/config';
import { ref, onValue, remove } from 'firebase/database';

const HallTicketDownload = () => {
  const [hallTickets, setHallTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const hallTicketsRef = ref(database, 'hallTickets');
    const unsubscribe = onValue(hallTicketsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ticketsList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        ticketsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setHallTickets(ticketsList);
      } else {
        setHallTickets([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hall ticket record?')) {
      try {
        await remove(ref(database, `hallTickets/${id}`));
        alert('Hall ticket record deleted successfully');
      } catch (error) {
        alert('Error deleting record');
      }
    }
  };

  const handleView = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const handleSelectTicket = (ticketId) => {
    setSelectedTickets(prev => {
      if (prev.includes(ticketId)) {
        return prev.filter(id => id !== ticketId);
      } else {
        return [...prev, ticketId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map(ticket => ticket.id));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkDownload = async () => {
    if (selectedTickets.length === 0) {
      alert('Please select at least one hall ticket to download');
      return;
    }

    setIsDownloading(true);
    
    try {
      const selectedTicketData = hallTickets.filter(ticket => 
        selectedTickets.includes(ticket.id)
      );

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Bulk Hall Ticket Download</title>
            <style>
              body { 
                font-family: 'Inter', Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: #f9fafb;
              }
              .ticket-page {
                page-break-after: always;
                margin-bottom: 40px;
                background: #fff;
                border: 2px solid #000;
                padding: 40px;
                min-height: 600px;
              }
              .ticket-page:last-child {
                page-break-after: auto;
              }
              .ticket-header {
                text-align: center;
                border-bottom: 2px solid #000;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .institute-name {
                font-size: 24px;
                font-weight: 800;
                margin: 0 0 10px 0;
              }
              .document-title {
                font-size: 20px;
                font-weight: 600;
                margin: 0;
                background: #000;
                color: #fff;
                padding: 8px 16px;
                display: inline-block;
              }
              .content {
                display: flex;
                flex-direction: column;
                gap: 30px;
              }
              .student-info, .exam-info, .instructions {
                border: 1px solid #000;
                padding: 20px;
              }
              .section-title {
                font-size: 16px;
                font-weight: 700;
                margin-bottom: 15px;
                background: #f0f0f0;
                padding: 8px 12px;
                margin: -20px -20px 15px -20px;
              }
              .info-row {
                display: flex;
                margin-bottom: 12px;
                align-items: center;
              }
              .label {
                font-weight: 600;
                min-width: 150px;
                font-size: 14px;
              }
              .value {
                font-size: 14px;
                border-bottom: 1px dotted #000;
                padding-bottom: 2px;
                flex: 1;
              }
              .instruction-text {
                font-size: 12px;
                line-height: 1.6;
                margin: 0;
              }
              .footer {
                margin-top: 40px;
                display: flex;
                justify-content: flex-end;
              }
              .signature {
                text-align: center;
              }
              .signature-line {
                width: 200px;
                height: 1px;
                background: #000;
                margin-bottom: 5px;
              }
              @media print {
                body { margin: 0; padding: 0; }
                .ticket-page { margin: 0; padding: 20px; }
              }
            </style>
          </head>
          <body>
      `);

      selectedTicketData.forEach((ticket) => {
        printWindow.document.write(`
          <div class="ticket-page">
            <div class="ticket-header">
              <h1 class="institute-name">COMPUTER TRAINING INSTITUTE</h1>
              <h2 class="document-title">HALL TICKET</h2>
            </div>
            <div class="content">
              <div class="student-info">
                <div class="info-row">
                  <label class="label">Student Name:</label>
                  <span class="value">${ticket.studentName}</span>
                </div>
                <div class="info-row">
                  <label class="label">Roll Number:</label>
                  <span class="value">${ticket.rollNumber}</span>
                </div>
                <div class="info-row">
                  <label class="label">Course:</label>
                  <span class="value">${getCourseLabel(ticket.course)}</span>
                </div>
              </div>
              <div class="exam-info">
                <h3 class="section-title">Examination Details</h3>
                <div class="info-row">
                  <label class="label">Exam Name:</label>
                  <span class="value">${ticket.examName}</span>
                </div>
                <div class="info-row">
                  <label class="label">Date:</label>
                  <span class="value">${ticket.examDate || 'TBA'}</span>
                </div>
                <div class="info-row">
                  <label class="label">Time:</label>
                  <span class="value">${ticket.examTime}</span>
                </div>
                <div class="info-row">
                  <label class="label">Venue:</label>
                  <span class="value">${ticket.venue}</span>
                </div>
              </div>
              <div class="instructions">
                <h3 class="section-title">Instructions</h3>
                <p class="instruction-text">${ticket.instructions}</p>
              </div>
              ${ticket.remarks ? `
                <div class="instructions">
                  <h3 class="section-title">Remarks</h3>
                  <p class="instruction-text">${ticket.remarks}</p>
                </div>
              ` : ''}
              <div class="footer">
                <div class="signature">
                  <div class="signature-line"></div>
                  <p style="font-size: 12px; margin: 0;">Authorized Signature</p>
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
      console.error('Error downloading hall tickets:', error);
      alert('Error downloading hall tickets');
    }
    
    setIsDownloading(false);
  };

  const filteredTickets = hallTickets.filter(ticket =>
    ticket.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.examName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading hall tickets...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🎫 Hall Ticket Downloads</h1>
        <p style={styles.subtitle}>View and manage all generated hall tickets</p>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{hallTickets.length}</div>
          <div style={styles.statLabel}>Total Hall Tickets</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {hallTickets.filter(t => new Date(t.createdAt) > new Date(Date.now() - 7*24*60*60*1000)).length}
          </div>
          <div style={styles.statLabel}>This Week</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {new Set(hallTickets.map(t => t.course)).size}
          </div>
          <div style={styles.statLabel}>Different Courses</div>
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controlsRow}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by student name, roll number, or exam..."
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
            disabled={selectedTickets.length === 0 || isDownloading}
            style={{
              ...styles.downloadButton,
              opacity: selectedTickets.length === 0 || isDownloading ? 0.5 : 1
            }}
          >
            {isDownloading ? '⏳ Downloading...' : `📥 Download Selected (${selectedTickets.length})`}
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        {filteredTickets.length === 0 ? (
          <div style={styles.emptyState}>
            <h3>No hall tickets found</h3>
            <p>No hall tickets match your search criteria.</p>
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
                  <th style={styles.th}>Exam Name</th>
                  <th style={styles.th}>Exam Date</th>
                  <th style={styles.th}>Venue</th>
                  <th style={styles.th}>Created On</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket, index) => (
                  <tr key={ticket.id} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                    <td style={styles.td}>
                      <input
                        type="checkbox"
                        checked={selectedTickets.includes(ticket.id)}
                        onChange={() => handleSelectTicket(ticket.id)}
                        style={styles.checkbox}
                      />
                    </td>
                    <td style={styles.td}>
                      <strong>{ticket.studentName}</strong>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.rollNumber}>{ticket.rollNumber}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.courseBadge}>
                        {getCourseLabel(ticket.course)}
                      </span>
                    </td>
                    <td style={styles.td}>{ticket.examName}</td>
                    <td style={styles.td}>{ticket.examDate || 'TBA'}</td>
                    <td style={styles.td}>{ticket.venue}</td>
                    <td style={styles.td}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => handleView(ticket)}
                          style={{...styles.actionBtn, backgroundColor: '#3b82f6'}}
                          title="View Hall Ticket"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => handleDelete(ticket.id)}
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

      {/* Ticket Modal */}
      {showTicketModal && selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setShowTicketModal(false)}
        />
      )}
    </div>
  );
};

// Ticket Modal Component
const TicketModal = ({ ticket, onClose }) => {
  const handlePrint = () => {
    const printContent = document.getElementById('modal-ticket');
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
          <h3 style={styles.modalTitle}>Hall Ticket Preview</h3>
          <div style={styles.modalActions}>
            <button onClick={handlePrint} style={styles.printModalButton}>
              🖨️ Print
            </button>
            <button onClick={onClose} style={styles.closeModalButton}>
              ❌ Close
            </button>
          </div>
        </div>
        
        <div id="modal-ticket" style={styles.modalBody}>
          <div style={styles.printArea}>
            <div style={styles.ticketHeader}>
              <h1 style={styles.instituteName}>COMPUTER TRAINING INSTITUTE</h1>
              <h2 style={styles.documentTitle}>HALL TICKET</h2>
            </div>

            <div style={styles.content}>
              <div style={styles.studentInfo}>
                <div style={styles.infoRow}>
                  <label style={styles.infoLabel}>Student Name:</label>
                  <span style={styles.infoValue}>{ticket.studentName}</span>
                </div>
                <div style={styles.infoRow}>
                  <label style={styles.infoLabel}>Roll Number:</label>
                  <span style={styles.infoValue}>{ticket.rollNumber}</span>
                </div>
                <div style={styles.infoRow}>
                  <label style={styles.infoLabel}>Course:</label>
                  <span style={styles.infoValue}>{getCourseLabel(ticket.course)}</span>
                </div>
              </div>

              <div style={styles.examInfo}>
                <h3 style={styles.sectionTitle}>Examination Details</h3>
                <div style={styles.infoRow}>
                  <label style={styles.infoLabel}>Exam Name:</label>
                  <span style={styles.infoValue}>{ticket.examName}</span>
                </div>
                <div style={styles.infoRow}>
                  <label style={styles.infoLabel}>Date:</label>
                  <span style={styles.infoValue}>{ticket.examDate || 'TBA'}</span>
                </div>
                <div style={styles.infoRow}>
                  <label style={styles.infoLabel}>Time:</label>
                  <span style={styles.infoValue}>{ticket.examTime}</span>
                </div>
                <div style={styles.infoRow}>
                  <label style={styles.infoLabel}>Venue:</label>
                  <span style={styles.infoValue}>{ticket.venue}</span>
                </div>
              </div>

              <div style={styles.instructions}>
                <h3 style={styles.sectionTitle}>Instructions</h3>
                <p style={styles.instructionText}>{ticket.instructions}</p>
              </div>

              {ticket.remarks && (
                <div style={styles.remarksSection}>
                  <h3 style={styles.sectionTitle}>Remarks</h3>
                  <p style={styles.instructionText}>{ticket.remarks}</p>
                </div>
              )}

              <div style={styles.footer}>
                <div style={styles.signature}>
                  <div style={styles.signatureLine}></div>
                  <p style={styles.signatureText}>Authorized Signature</p>
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
    borderTop: '4px solid #3b82f6',
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
    color: '#3b82f6',
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
  courseBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600'
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
    maxWidth: '900px',
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
    backgroundColor: '#3b82f6',
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
  printArea: {
    backgroundColor: '#fff',
    border: '2px solid #000',
    padding: '40px',
    minHeight: '600px'
  },
  ticketHeader: {
    textAlign: 'center',
    borderBottom: '2px solid #000',
    paddingBottom: '20px',
    marginBottom: '30px'
  },
  instituteName: {
    fontSize: '24px',
    fontWeight: '800',
    margin: '0 0 10px 0'
  },
  documentTitle: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
    backgroundColor: '#000',
    color: '#fff',
    padding: '8px 16px',
    display: 'inline-block'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  studentInfo: {
    border: '1px solid #000',
    padding: '20px'
  },
  examInfo: {
    border: '1px solid #000',
    padding: '20px'
  },
  instructions: {
    border: '1px solid #000',
    padding: '20px'
  },
  remarksSection: {
    border: '1px solid #000',
    padding: '20px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    marginBottom: '15px',
    backgroundColor: '#f0f0f0',
    padding: '8px 12px',
    margin: '-20px -20px 15px -20px'
  },
  infoRow: {
    display: 'flex',
    marginBottom: '12px',
    alignItems: 'center'
  },
  infoLabel: {
    fontWeight: '600',
    minWidth: '150px',
    fontSize: '14px'
  },
  infoValue: {
    fontSize: '14px',
    borderBottom: '1px dotted #000',
    paddingBottom: '2px',
    flex: 1
  },
  instructionText: {
    fontSize: '12px',
    lineHeight: '1.6',
    margin: 0
  },
  footer: {
    marginTop: '40px',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  signature: {
    textAlign: 'center'
  },
  signatureLine: {
    width: '200px',
    height: '1px',
    backgroundColor: '#000',
    marginBottom: '5px'
  },
  signatureText: {
    fontSize: '12px',
    margin: 0
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
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
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
      background-color: #2563eb !important;
    }
    
    .close-modal-button:hover {
      background-color: #4b5563 !important;
    }
  `;
  document.head.appendChild(style);
}

export default HallTicketDownload;
