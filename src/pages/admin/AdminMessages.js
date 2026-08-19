import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/config';
import { ref, onValue, update, remove, push, set } from 'firebase/database';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    sortBy: 'newest',
    type: 'all' // New filter for message type
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'send'
  const [newEnquiryForm, setNewEnquiryForm] = useState({
    toFranchise: '',
    subject: '',
    category: '',
    priority: 'medium',
    message: ''
  });
  const [franchises, setFranchises] = useState([]);
  const [sendingEnquiry, setSendingEnquiry] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch messages from Firebase
  useEffect(() => {
    const messagesRef = ref(database, 'enquiries');
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setMessages(messagesList);
      } else {
        setMessages([]);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  // Fetch franchises list (you might want to create a separate endpoint for this)
  useEffect(() => {
    // This is a placeholder - you should implement proper franchise fetching
    const fetchFranchises = async () => {
      try {
        const franchiseRef = ref(database, 'users'); // Assuming you have users collection
        onValue(franchiseRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const franchiseList = Object.keys(data)
              .map(key => ({ id: key, ...data[key] }))
              .filter(user => user.role === 'franchise'); // Assuming role field exists
            setFranchises(franchiseList);
          }
        });
      } catch (error) {
        console.error('Error fetching franchises:', error);
      }
    };
    
    fetchFranchises();
  }, []);

  // Filter and sort messages
  useEffect(() => {
    let filtered = messages.filter(message => {
      const matchesSearch = (
        message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.franchiseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus = filters.status === 'all' || message.status === filters.status;
      const matchesPriority = filters.priority === 'all' || message.priority === filters.priority;
      const matchesCategory = filters.category === 'all' || message.category === filters.category;
      const matchesType = filters.type === 'all' || message.type === filters.type;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesType;
    });

    // Sort messages
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'franchise':
          return (a.franchiseName?.localeCompare(b.franchiseName)) || 0;
        default:
          return 0;
      }
    });

    setFilteredMessages(filtered);
  }, [messages, filters, searchTerm]);

  const categories = [
    { value: 'technical', label: 'Technical Support', icon: '🔧' },
    { value: 'billing', label: 'Billing Inquiry', icon: '💰' },
    { value: 'general', label: 'General Question', icon: '❓' },
    { value: 'training', label: 'Training Support', icon: '📚' },
    { value: 'complaint', label: 'Complaint', icon: '⚠️' },
    { value: 'announcement', label: 'Announcement', icon: '📢' },
    { value: 'policy', label: 'Policy Update', icon: '📋' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: '#10b981' },
    { value: 'medium', label: 'Medium Priority', color: '#f59e0b' },
    { value: 'high', label: 'High Priority', color: '#ef4444' },
    { value: 'urgent', label: 'Urgent', color: '#dc2626' }
  ];

  const markAsRead = async (messageId) => {
    try {
      await update(ref(database, `enquiries/${messageId}`), { status: 'read' });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const markAsUnread = async (messageId) => {
    try {
      await update(ref(database, `enquiries/${messageId}`), { status: 'unread' });
    } catch (error) {
      console.error('Error marking message as unread:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await remove(ref(database, `enquiries/${messageId}`));
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(null);
        }
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    
    try {
      const replyId = Date.now().toString();
      await update(ref(database, `enquiries/${selectedMessage.id}/replies/${replyId}`), {
        text: replyText,
        timestamp: new Date().toISOString(),
        sender: 'admin'
      });
      await update(ref(database, `enquiries/${selectedMessage.id}`), {
        status: 'replied',
        lastReplyAt: new Date().toISOString()
      });
      setReplyText('');
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const sendNewEnquiry = async (e) => {
    e.preventDefault();
    if (!newEnquiryForm.toFranchise || !newEnquiryForm.subject || !newEnquiryForm.message) return;
    
    setSendingEnquiry(true);
    
    try {
      const enquiriesRef = ref(database, 'enquiries');
      const newEnquiryRef = push(enquiriesRef);
      
      const enquiryData = {
        type: 'admin-to-franchise',
        fromUserId: 'admin',
        fromUserEmail: 'admin@company.com',
        toUserId: newEnquiryForm.toFranchise,
        franchiseName: 'Admin',
        contactEmail: 'admin@company.com',
        subject: newEnquiryForm.subject,
        category: newEnquiryForm.category,
        priority: newEnquiryForm.priority,
        message: newEnquiryForm.message,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'unread',
        replies: {}
      };
      
      await set(newEnquiryRef, enquiryData);
      
      // Reset form
      setNewEnquiryForm({
        toFranchise: '',
        subject: '',
        category: '',
        priority: 'medium',
        message: ''
      });
      
      alert('Enquiry sent successfully!');
      setActiveTab('received'); // Switch back to received tab
      
    } catch (error) {
      console.error('Error sending enquiry:', error);
      alert('Error sending enquiry. Please try again.');
    }
    
    setSendingEnquiry(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return '#ef4444';
      case 'read': return '#3b82f6';
      case 'replied': return '#10b981';
      default: return '#64748b';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'franchise-to-admin': return 'From Franchise';
      case 'admin-to-franchise': return 'To Franchise';
      default: return 'Unknown';
    }
  };

  const stats = {
    total: messages.length,
    unread: messages.filter(m => m.status === 'unread').length,
    urgent: messages.filter(m => m.priority === 'urgent').length,
    replied: messages.filter(m => m.status === 'replied').length,
    fromFranchise: messages.filter(m => m.type === 'franchise-to-admin').length,
    toFranchise: messages.filter(m => m.type === 'admin-to-franchise').length
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingWrapper}>
          <div style={styles.loadingSpinner}></div>
          <h2 style={styles.loadingTitle}>Loading Messages</h2>
          <p style={styles.loadingSubtitle}>Fetching your messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} className="admin-messages-container">
      {/* Header */}
      <div style={styles.header} className="admin-messages-header">
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>💬</div>
            <div>
              <h1 style={styles.title}>Message Center</h1>
              <p style={styles.subtitle}>Manage franchise communications and enquiries</p>
            </div>
          </div>
          <div style={styles.statsCards}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.total}</div>
              <div style={styles.statLabel}>Total</div>
            </div>
            <div style={{...styles.statCard, borderLeft: '4px solid #ef4444'}}>
              <div style={styles.statNumber}>{stats.unread}</div>
              <div style={styles.statLabel}>Unread</div>
            </div>
            <div style={{...styles.statCard, borderLeft: '4px solid #dc2626'}}>
              <div style={styles.statNumber}>{stats.urgent}</div>
              <div style={styles.statLabel}>Urgent</div>
            </div>
            <div style={{...styles.statCard, borderLeft: '4px solid #10b981'}}>
              <div style={styles.statNumber}>{stats.replied}</div>
              <div style={styles.statLabel}>Replied</div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Tab Navigation */}
        <div style={styles.tabNavigation}>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'received' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('received')}
          >
            📥 Received Messages ({stats.fromFranchise})
          </button>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'send' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('send')}
          >
            📤 Send Enquiry
          </button>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'sent' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('sent')}
          >
            📋 Sent Messages ({stats.toFranchise})
          </button>
        </div>

        {activeTab === 'send' ? (
          // Send New Enquiry Form
          <div style={styles.sendEnquirySection}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <span style={styles.sectionIcon}>📤</span>
                Send New Enquiry to Franchise
              </h3>
              
              <form onSubmit={sendNewEnquiry} style={styles.form}>
                <div style={styles.gridRow}>
                  <div style={styles.gridItem}>
                    <label style={styles.label}>Select Franchise</label>
                    <select
                      style={styles.input}
                      value={newEnquiryForm.toFranchise}
                      onChange={(e) => setNewEnquiryForm(prev => ({...prev, toFranchise: e.target.value}))}
                      required
                    >
                      <option value="">Choose Franchise</option>
                      {franchises.map(franchise => (
                        <option key={franchise.id} value={franchise.id}>
                          {franchise.name || franchise.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={styles.gridItem}>
                    <label style={styles.label}>Category</label>
                    <select
                      style={styles.input}
                      value={newEnquiryForm.category}
                      onChange={(e) => setNewEnquiryForm(prev => ({...prev, category: e.target.value}))}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div style={styles.gridRow}>
                  <div style={styles.gridItem}>
                    <label style={styles.label}>Priority Level</label>
                    <select
                      style={styles.input}
                      value={newEnquiryForm.priority}
                      onChange={(e) => setNewEnquiryForm(prev => ({...prev, priority: e.target.value}))}
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={styles.gridItem}>
                    <label style={styles.label}>Subject</label>
                    <input
                      type="text"
                      style={styles.input}
                      value={newEnquiryForm.subject}
                      onChange={(e) => setNewEnquiryForm(prev => ({...prev, subject: e.target.value}))}
                      placeholder="Brief description of your enquiry"
                      required
                    />
                  </div>
                </div>
                
                <div style={styles.row}>
                  <label style={styles.label}>Message</label>
                  <textarea
                    style={{...styles.input, ...styles.textarea}}
                    value={newEnquiryForm.message}
                    onChange={(e) => setNewEnquiryForm(prev => ({...prev, message: e.target.value}))}
                    placeholder="Describe your enquiry in detail..."
                    rows="5"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={sendingEnquiry}
                  style={{
                    ...styles.button,
                    opacity: sendingEnquiry ? 0.7 : 1,
                    cursor: sendingEnquiry ? 'not-allowed' : 'pointer'
                  }}
                >
                  {sendingEnquiry ? (
                    <>
                      <span style={styles.spinner}></span>
                      Sending Enquiry...
                    </>
                  ) : (
                    <>
                      <span style={styles.buttonIcon}>📤</span>
                      Send Enquiry
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          // Messages List and Details
          <>
            {/* Filters and Search */}
            <div style={styles.controlsSection}>
              <div style={styles.searchBox}>
                <span style={styles.searchIcon}>🔍</span>
                <input
                  type="search"
                  placeholder="Search messages, franchises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              
              <div style={styles.filtersRow}>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
                  style={styles.filterSelect}
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
                
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({...prev, priority: e.target.value}))}
                  style={styles.filterSelect}
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">🔴 Urgent</option>
                  <option value="high">🟠 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
                
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({...prev, type: e.target.value}))}
                  style={styles.filterSelect}
                >
                  <option value="all">All Types</option>
                  <option value="franchise-to-admin">From Franchise</option>
                  <option value="admin-to-franchise">To Franchise</option>
                </select>
                
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({...prev, sortBy: e.target.value}))}
                  style={styles.filterSelect}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priority">By Priority</option>
                  <option value="franchise">By Franchise</option>
                </select>
              </div>
            </div>

            <div style={styles.messagesLayout}>
              {/* Messages List */}
              <div style={styles.messagesList}>
                {filteredMessages.length === 0 ? (
                  <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>📭</span>
                    <h3>No messages found</h3>
                    <p>No messages match your current filters.</p>
                  </div>
                ) : (
                  filteredMessages.map(message => (
                    <div
                      key={message.id}
                      style={{
                        ...styles.messageCard,
                        backgroundColor: selectedMessage?.id === message.id ? '#f0f9ff' : '#ffffff',
                        borderColor: selectedMessage?.id === message.id ? '#3b82f6' : '#e2e8f0'
                      }}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (message.status === 'unread') {
                          markAsRead(message.id);
                        }
                      }}
                      className="message-card"
                    >
                      <div style={styles.messageHeader}>
                        <div style={styles.messageInfo}>
                          <h4 style={styles.messageSubject}>{message.subject}</h4>
                          <p style={styles.messageFranchise}>
                            {getTypeLabel(message.type)}: <strong>{message.franchiseName || 'Unknown'}</strong>
                          </p>
                        </div>
                        <div style={styles.messageBadges}>
                          <span style={{
                            ...styles.priorityBadge,
                            backgroundColor: `${getPriorityColor(message.priority)}20`,
                            color: getPriorityColor(message.priority)
                          }}>
                            {message.priority}
                          </span>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: `${getStatusColor(message.status)}20`,
                            color: getStatusColor(message.status)
                          }}>
                            {message.status}
                          </span>
                          <span style={{
                            ...styles.typeBadge,
                            backgroundColor: message.type === 'franchise-to-admin' ? '#f0f9ff' : '#fef3e2',
                            color: message.type === 'franchise-to-admin' ? '#1d4ed8' : '#d97706'
                          }}>
                            {message.type === 'franchise-to-admin' ? '📥' : '📤'}
                          </span>
                        </div>
                      </div>
                      <p style={styles.messagePreview}>
                        {message.message?.substring(0, 120)}...
                      </p>
                      <div style={styles.messageFooter}>
                        <span>{message.category}</span>
                        <span>•</span>
                        <span>{new Date(message.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Details */}
              {selectedMessage && (
                <div style={styles.messageDetails}>
                  <div style={styles.detailsHeader}>
                    <h3 style={styles.detailsTitle}>{selectedMessage.subject}</h3>
                    <div style={styles.detailsActions}>
                      <button
                        onClick={() => selectedMessage.status === 'unread' ? markAsRead(selectedMessage.id) : markAsUnread(selectedMessage.id)}
                        style={styles.actionButton}
                      >
                        {selectedMessage.status === 'unread' ? 'Mark Read' : 'Mark Unread'}
                      </button>
                      <button
                        onClick={() => deleteMessage(selectedMessage.id)}
                        style={{...styles.actionButton, backgroundColor: '#fef2f2', color: '#dc2626'}}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div style={styles.detailsContent}>
                    <div style={styles.messageMetaDetails}>
                      <div style={styles.metaRow}>
                        <strong>Type:</strong> {getTypeLabel(selectedMessage.type)}
                      </div>
                      <div style={styles.metaRow}>
                        <strong>From:</strong> {selectedMessage.franchiseName}
                      </div>
                      {selectedMessage.contactEmail && (
                        <div style={styles.metaRow}>
                          <strong>Email:</strong> {selectedMessage.contactEmail}
                        </div>
                      )}
                      {selectedMessage.contactPhone && (
                        <div style={styles.metaRow}>
                          <strong>Phone:</strong> {selectedMessage.contactPhone}
                        </div>
                      )}
                      <div style={styles.metaRow}>
                        <strong>Category:</strong> {selectedMessage.category}
                      </div>
                      <div style={styles.metaRow}>
                        <strong>Priority:</strong>
                        <span style={{
                          ...styles.priorityBadge,
                          backgroundColor: `${getPriorityColor(selectedMessage.priority)}20`,
                          color: getPriorityColor(selectedMessage.priority),
                          marginLeft: '8px'
                        }}>
                          {selectedMessage.priority}
                        </span>
                      </div>
                      <div style={styles.metaRow}>
                        <strong>Date:</strong> {new Date(selectedMessage.timestamp).toLocaleString()}
                      </div>
                    </div>
                    
                    <div style={styles.messageBody}>
                      <h4>Message</h4>
                      <p style={styles.messageText}>{selectedMessage.message}</p>
                    </div>

                    {/* Reply Section */}
                    <div style={styles.replySection}>
                      <h4>Send Reply</h4>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply here..."
                        style={styles.replyTextarea}
                        rows="4"
                      />
                      <button
                        onClick={sendReply}
                        disabled={!replyText.trim()}
                        style={{
                          ...styles.sendReplyButton,
                          opacity: !replyText.trim() ? 0.5 : 1,
                          cursor: !replyText.trim() ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Send Reply
                      </button>
                    </div>

                    {/* Replies History */}
                    {selectedMessage.replies && Object.keys(selectedMessage.replies).length > 0 && (
                      <div style={styles.repliesSection}>
                        <h4>Reply History</h4>
                        {Object.entries(selectedMessage.replies).map(([replyId, reply]) => (
                          <div key={replyId} style={styles.replyItem}>
                            <div style={styles.replyHeader}>
                              <strong>{reply.sender === 'admin' ? 'Admin Reply' : reply.senderName || reply.sender}</strong>
                              <span style={styles.replyDate}>
                                {new Date(reply.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p style={styles.replyText}>{reply.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Enhanced styles (keeping your original styles and adding new ones)
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  loadingWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center'
  },
  loadingSpinner: {
    width: '60px',
    height: '60px',
    border: '6px solid #e2e8f0',
    borderTop: '6px solid #8b5cf6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '24px'
  },
  loadingTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  loadingSubtitle: {
    fontSize: '1rem',
    color: '#64748b',
    margin: '0'
  },
  header: {
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    color: 'white',
    padding: '32px'
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '24px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  headerIcon: {
    fontSize: '3rem',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    margin: '0 0 8px 0',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  subtitle: {
    fontSize: '1.1rem',
    opacity: '0.9',
    margin: '0'
  },
  statsCards: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  statCard: {
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(12px)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.2)',
    minWidth: '100px'
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '0.9rem',
    opacity: '0.9',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px'
  },
  tabNavigation: {
    display: 'flex',
    marginBottom: '24px',
    backgroundColor: '#f8fafc',
    padding: '4px',
    borderRadius: '12px',
    gap: '4px'
  },
  tabButton: {
    flex: '1',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activeTab: {
    backgroundColor: '#8b5cf6',
    color: 'white',
    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)'
  },
  sendEnquirySection: {
    marginBottom: '32px'
  },
  section: {
    padding: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: '1px solid #f1f5f9'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  sectionIcon: {
    fontSize: '1.5rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  row: {
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column'
  },
  gridRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  gridItem: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    marginBottom: '8px',
    fontWeight: '600',
    color: '#374151',
    fontSize: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  input: {
    padding: '14px 16px',
    fontSize: '15px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit'
  },
  textarea: {
    resize: 'vertical',
    minHeight: '120px',
    fontFamily: 'inherit',
    lineHeight: '1.5'
  },
  button: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    border: 'none',
    color: '#ffffff',
    padding: '16px 24px',
    fontSize: '16px',
    borderRadius: '12px',
    fontWeight: '700',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
    cursor: 'pointer'
  },
  buttonIcon: {
    fontSize: '1.2rem'
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  controlsSection: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  searchBox: {
    position: 'relative',
    marginBottom: '20px'
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '20px',
    opacity: '0.6',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    padding: '16px 20px 16px 50px',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    outline: 'none',
    backgroundColor: '#f8fafc',
    transition: 'all 0.3s ease'
  },
  filtersRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  filterSelect: {
    padding: '12px 16px',
    fontSize: '14px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '150px'
  },
  messagesLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    minHeight: '600px'
  },
  messagesList: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    maxHeight: '800px',
    overflowY: 'auto'
  },
  messageCard: {
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: '#ffffff'
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '16px'
  },
  messageInfo: {
    flex: '1'
  },
  messageSubject: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 4px 0',
    lineHeight: '1.3'
  },
  messageFranchise: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: '0'
  },
  messageBadges: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'flex-end'
  },
  priorityBadge: {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  typeBadge: {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: '600'
  },
  messagePreview: {
    fontSize: '0.9rem',
    color: '#64748b',
    lineHeight: '1.5',
    marginBottom: '12px'
  },
  messageFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem',
    color: '#94a3b8'
  },
  messageDetails: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    maxHeight: '800px',
    overflowY: 'auto'
  },
  detailsHeader: {
    padding: '24px',
    borderBottom: '2px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px'
  },
  detailsTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0',
    lineHeight: '1.3'
  },
  detailsActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  actionButton: {
    padding: '8px 16px',
    fontSize: '0.85rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: '500'
  },
  detailsContent: {
    padding: '24px'
  },
  messageMetaDetails: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px'
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '0.9rem',
    gap: '8px'
  },
  messageBody: {
    marginBottom: '24px'
  },
  messageText: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#374151',
    whiteSpace: 'pre-wrap',
    background: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  replySection: {
    marginBottom: '24px',
    padding: '20px',
    background: '#f0f9ff',
    borderRadius: '12px',
    border: '1px solid #bfdbfe'
  },
  replyTextarea: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    marginBottom: '12px'
  },
  sendReplyButton: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  repliesSection: {
    paddingTop: '20px',
    borderTop: '2px solid #f1f5f9'
  },
  replyItem: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px'
  },
  replyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  replyDate: {
    fontSize: '0.8rem',
    color: '#94a3b8'
  },
  replyText: {
    fontSize: '0.9rem',
    lineHeight: '1.5',
    color: '#374151',
    margin: '0'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#64748b'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '16px',
    display: 'block'
  }
};

// Enhanced responsive styles and animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .admin-messages-container {
      animation: fadeInUp 0.6s ease-out;
    }
    
    .message-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }
    
    /* Mobile Responsive */
    @media (max-width: 1024px) {
      .admin-messages-container .messagesLayout {
        grid-template-columns: 1fr !important;
      }
      .admin-messages-container .statsCards {
        justify-content: center;
      }
      .admin-messages-container .headerContent {
        flex-direction: column;
        text-align: center;
      }
    }
    
    @media (max-width: 768px) {
      .admin-messages-container .mainContent {
        padding: 16px !important;
      }
      .admin-messages-container .filtersRow {
        flex-direction: column;
      }
      .admin-messages-container .filterSelect {
        width: 100%;
      }
      .admin-messages-container .detailsActions {
        flex-direction: column;
      }
      .admin-messages-container .gridRow {
        grid-template-columns: 1fr !important;
      }
      .admin-messages-container .tabNavigation {
        flex-direction: column;
      }
      .admin-messages-container .tabButton {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);
}

export default AdminMessages;
