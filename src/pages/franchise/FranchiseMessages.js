import React, { useState, useEffect } from 'react';
import { database, auth } from '../../firebase/config';
import { ref, push, set, onValue } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

const FranchiseMessages = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    priority: 'medium',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');
  const [activeTab, setActiveTab] = useState('send'); // 'send' or 'received'
  const [adminEnquiries, setAdminEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Get current user for franchise identification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // Fetch admin enquiries directed to this franchise
  useEffect(() => {
    if (!user) return;
    
    const enquiriesRef = ref(database, 'enquiries');
    const unsubscribe = onValue(enquiriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const adminEnquiriesList = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(enquiry => 
            enquiry.type === 'admin-to-franchise' && 
            enquiry.toUserId === user.uid
          )
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setAdminEnquiries(adminEnquiriesList);
      }
    });
    
    return unsubscribe;
  }, [user]);

  const categories = [
    { value: 'technical', label: 'Technical Support', icon: '🔧' },
    { value: 'billing', label: 'Billing Inquiry', icon: '💰' },
    { value: 'general', label: 'General Question', icon: '❓' },
    { value: 'training', label: 'Training Support', icon: '📚' },
    { value: 'complaint', label: 'Complaint', icon: '⚠️' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: '#10b981' },
    { value: 'medium', label: 'Medium Priority', color: '#f59e0b' },
    { value: 'high', label: 'High Priority', color: '#ef4444' },
    { value: 'urgent', label: 'Urgent', color: '#dc2626' }
  ];

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required';
        } else if (value.length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Invalid email format';
        } else {
          delete newErrors.email;
        }
        break;
      case 'phone':
        const phoneRegex = /^[0-9]{10}$/;
        if (value && !phoneRegex.test(value.replace(/\D/g, ''))) {
          newErrors.phone = 'Invalid phone number';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'subject':
        if (!value.trim()) {
          newErrors.subject = 'Subject is required';
        } else if (value.length < 5) {
          newErrors.subject = 'Subject must be at least 5 characters';
        } else {
          delete newErrors.subject;
        }
        break;
      case 'message':
        if (!value.trim()) {
          newErrors.message = 'Message is required';
        } else if (value.length < 10) {
          newErrors.message = 'Message must be at least 10 characters';
        } else {
          delete newErrors.message;
        }
        break;
      case 'category':
        if (!value) {
          newErrors.category = 'Please select a category';
        } else {
          delete newErrors.category;
        }
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
      if (key !== 'phone') {
        validateField(key, formData[key]);
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setMessage('Please fix the errors below');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      // Create reference to enquiries in Firebase
      const enquiriesRef = ref(database, 'enquiries');
      const newEnquiryRef = push(enquiriesRef);
      
      // Prepare enquiry data for Firebase
      const enquiryData = {
        // Map form fields to expected structure
        franchiseName: formData.name,
        contactEmail: formData.email,
        contactPhone: formData.phone || '',
        subject: formData.subject,
        category: formData.category,
        priority: formData.priority,
        message: formData.message,
        
        // Add system fields
        type: 'franchise-to-admin',
        fromUserId: user?.uid || 'anonymous',
        fromUserEmail: user?.email || formData.email,
        toUserId: 'admin',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'unread',
        
        // Initialize empty replies object
        replies: {}
      };
      
      // Save to Firebase
      await set(newEnquiryRef, enquiryData);
      
      setMessage('Your enquiry has been sent successfully! We will get back to you soon.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: '',
        priority: 'medium',
        message: ''
      });
      setErrors({});
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('Error sending enquiry:', error);
      setMessage('Error: Failed to send enquiry. Please try again.');
    }
    
    setLoading(false);
  };

  const markAsRead = async (enquiryId) => {
    try {
      await set(ref(database, `enquiries/${enquiryId}/status`), 'read');
    } catch (error) {
      console.error('Error marking enquiry as read:', error);
    }
  };

  const sendReply = async (enquiryId) => {
    if (!replyText.trim()) return;
    
    try {
      const replyId = Date.now().toString();
      const replyData = {
        text: replyText,
        timestamp: new Date().toISOString(),
        sender: 'franchise',
        senderName: user?.displayName || user?.email || 'Franchise'
      };
      
      await set(ref(database, `enquiries/${enquiryId}/replies/${replyId}`), replyData);
      await set(ref(database, `enquiries/${enquiryId}/status`), 'replied');
      await set(ref(database, `enquiries/${enquiryId}/lastReplyAt`), new Date().toISOString());
      
      setReplyText('');
      setSelectedEnquiry(null);
    } catch (error) {
      console.error('Error sending reply:', error);
    }
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

  return (
    <div style={styles.container} className="franchise-messages-container">
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>💬</div>
        <h2 style={styles.title}>Message Center</h2>
        <p style={styles.subtitle}>Send enquiries and manage communications with admin</p>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabNavigation}>
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
            ...(activeTab === 'received' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('received')}
        >
          📥 Received Messages ({adminEnquiries.length})
        </button>
      </div>

      {/* Message Alert */}
      {message && (
        <div style={{
          ...styles.messageAlert,
          backgroundColor: message.includes('Error') || message.includes('fix') ? '#fef2f2' : '#f0fdf4',
          color: message.includes('Error') || message.includes('fix') ? '#dc2626' : '#16a34a',
          borderLeft: `4px solid ${message.includes('Error') || message.includes('fix') ? '#dc2626' : '#16a34a'}`
        }}>
          <div style={styles.messageIcon}>
            {message.includes('Error') || message.includes('fix') ? '❌' : '✅'}
          </div>
          <span>{message}</span>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'send' ? (
        // Send Enquiry Form (existing form)
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Personal Information */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>👤</span>
              Personal Information
            </h3>
            
            <div style={styles.gridRow}>
              <div style={styles.gridItem}>
                <label style={styles.label}>
                  Name
                  {errors.name && <span style={styles.errorText}>{errors.name}</span>}
                </label>
                <input
                  style={{
                    ...styles.input,
                    borderColor: errors.name ? '#ef4444' : focusedField === 'name' ? '#8b5cf6' : '#e5e7eb',
                    boxShadow: focusedField === 'name' ? '0 0 0 3px rgba(139, 92, 246, 0.1)' : 'none'
                  }}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => handleFocus('name')}
                  onBlur={handleBlur}
                  required
                  placeholder="Your full name"
                />
              </div>
              
              <div style={styles.gridItem}>
                <label style={styles.label}>
                  Email Address
                  {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                </label>
                <input
                  style={{
                    ...styles.input,
                    borderColor: errors.email ? '#ef4444' : focusedField === 'email' ? '#8b5cf6' : '#e5e7eb',
                    boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(139, 92, 246, 0.1)' : 'none'
                  }}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  required
                  placeholder="you@email.com"
                />
              </div>
            </div>
            
            <div style={styles.row}>
              <label style={styles.label}>
                Phone Number (Optional)
                {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
              </label>
              <input
                style={{
                  ...styles.input,
                  borderColor: errors.phone ? '#ef4444' : focusedField === 'phone' ? '#8b5cf6' : '#e5e7eb',
                  boxShadow: focusedField === 'phone' ? '0 0 0 3px rgba(139, 92, 246, 0.1)' : 'none'
                }}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onFocus={() => handleFocus('phone')}
                onBlur={handleBlur}
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          {/* Enquiry Details */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>📝</span>
              Enquiry Details
            </h3>
            
            <div style={styles.gridRow}>
              <div style={styles.gridItem}>
                <label style={styles.label}>
                  Category
                  {errors.category && <span style={styles.errorText}>{errors.category}</span>}
                </label>
                <select
                  style={{
                    ...styles.input,
                    borderColor: errors.category ? '#ef4444' : focusedField === 'category' ? '#8b5cf6' : '#e5e7eb',
                    boxShadow: focusedField === 'category' ? '0 0 0 3px rgba(139, 92, 246, 0.1)' : 'none'
                  }}
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  onFocus={() => handleFocus('category')}
                  onBlur={handleBlur}
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
              
              <div style={styles.gridItem}>
                <label style={styles.label}>Priority Level</label>
                <select
                  style={{
                    ...styles.input,
                    borderColor: focusedField === 'priority' ? '#8b5cf6' : '#e5e7eb',
                    boxShadow: focusedField === 'priority' ? '0 0 0 3px rgba(139, 92, 246, 0.1)' : 'none'
                  }}
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  onFocus={() => handleFocus('priority')}
                  onBlur={handleBlur}
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={styles.row}>
              <label style={styles.label}>
                Subject
                {errors.subject && <span style={styles.errorText}>{errors.subject}</span>}
              </label>
              <input
                style={{
                  ...styles.input,
                  borderColor: errors.subject ? '#ef4444' : focusedField === 'subject' ? '#8b5cf6' : '#e5e7eb',
                  boxShadow: focusedField === 'subject' ? '0 0 0 3px rgba(139, 92, 246, 0.1)' : 'none'
                }}
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                onFocus={() => handleFocus('subject')}
                onBlur={handleBlur}
                required
                placeholder="Brief description of your enquiry"
              />
            </div>
            
            <div style={styles.row}>
              <label style={styles.label}>
                Message
                {errors.message && <span style={styles.errorText}>{errors.message}</span>}
              </label>
              <textarea
                style={{
                  ...styles.input,
                  ...styles.textarea,
                  borderColor: errors.message ? '#ef4444' : focusedField === 'message' ? '#8b5cf6' : '#e5e7eb',
                  boxShadow: focusedField === 'message' ? '0 0 0 3px rgba(139, 92, 246, 0.1)' : 'none'
                }}
                name="message"
                value={formData.message}
                onChange={handleChange}
                onFocus={() => handleFocus('message')}
                onBlur={handleBlur}
                required
                placeholder="Please describe your enquiry in detail..."
                rows="5"
              />
              <div style={styles.charCount}>
                {formData.message.length}/500 characters
              </div>
            </div>
          </div>

          {/* Submit Button */}
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
      ) : (
        // Received Messages Tab
        <div style={styles.receivedMessagesContainer}>
          {adminEnquiries.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📭</span>
              <h3>No Messages from Admin</h3>
              <p>When admin sends you enquiries, they will appear here.</p>
            </div>
          ) : (
            <div style={styles.messagesLayout}>
              {/* Messages List */}
              <div style={styles.messagesList}>
                {adminEnquiries.map(enquiry => (
                  <div
                    key={enquiry.id}
                    style={{
                      ...styles.messageCard,
                      backgroundColor: selectedEnquiry?.id === enquiry.id ? '#f0f9ff' : '#ffffff',
                      borderColor: selectedEnquiry?.id === enquiry.id ? '#3b82f6' : '#e2e8f0'
                    }}
                    onClick={() => {
                      setSelectedEnquiry(enquiry);
                      if (enquiry.status === 'unread') {
                        markAsRead(enquiry.id);
                      }
                    }}
                    className="message-card"
                  >
                    <div style={styles.messageHeader}>
                      <div style={styles.messageInfo}>
                        <h4 style={styles.messageSubject}>{enquiry.subject}</h4>
                        <p style={styles.messageFranchise}>
                          From: <strong>Admin</strong>
                        </p>
                      </div>
                      <div style={styles.messageBadges}>
                        <span style={{
                          ...styles.priorityBadge,
                          backgroundColor: `${getPriorityColor(enquiry.priority)}20`,
                          color: getPriorityColor(enquiry.priority)
                        }}>
                          {enquiry.priority}
                        </span>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: `${getStatusColor(enquiry.status)}20`,
                          color: getStatusColor(enquiry.status)
                        }}>
                          {enquiry.status}
                        </span>
                      </div>
                    </div>
                    <p style={styles.messagePreview}>
                      {enquiry.message?.substring(0, 120)}...
                    </p>
                    <div style={styles.messageFooter}>
                      <span>{enquiry.category}</span>
                      <span>•</span>
                      <span>{new Date(enquiry.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Details */}
              {selectedEnquiry && (
                <div style={styles.messageDetails}>
                  <div style={styles.detailsHeader}>
                    <h3 style={styles.detailsTitle}>{selectedEnquiry.subject}</h3>
                  </div>
                  
                  <div style={styles.detailsContent}>
                    <div style={styles.messageMetaDetails}>
                      <div style={styles.metaRow}>
                        <strong>From:</strong> Admin
                      </div>
                      <div style={styles.metaRow}>
                        <strong>Category:</strong> {selectedEnquiry.category}
                      </div>
                      <div style={styles.metaRow}>
                        <strong>Priority:</strong>
                        <span style={{
                          ...styles.priorityBadge,
                          backgroundColor: `${getPriorityColor(selectedEnquiry.priority)}20`,
                          color: getPriorityColor(selectedEnquiry.priority),
                          marginLeft: '8px'
                        }}>
                          {selectedEnquiry.priority}
                        </span>
                      </div>
                      <div style={styles.metaRow}>
                        <strong>Date:</strong> {new Date(selectedEnquiry.timestamp).toLocaleString()}
                      </div>
                    </div>
                    
                    <div style={styles.messageBody}>
                      <h4>Message</h4>
                      <p style={styles.messageText}>{selectedEnquiry.message}</p>
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
                        onClick={() => sendReply(selectedEnquiry.id)}
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
                    {selectedEnquiry.replies && Object.keys(selectedEnquiry.replies).length > 0 && (
                      <div style={styles.repliesSection}>
                        <h4>Reply History</h4>
                        {Object.entries(selectedEnquiry.replies).map(([replyId, reply]) => (
                          <div key={replyId} style={styles.replyItem}>
                            <div style={styles.replyHeader}>
                              <strong>{reply.senderName || reply.sender}</strong>
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
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced styles with new tab navigation and received messages
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    padding: '40px 20px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    borderRadius: '16px',
    color: 'white'
  },
  headerIcon: {
    fontSize: '3rem',
    marginBottom: '16px',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: '0 0 12px 0'
  },
  subtitle: {
    fontSize: '1.1rem',
    margin: '0',
    opacity: '0.9'
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
  messageAlert: {
    margin: '0 0 24px 0',
    padding: '16px 20px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  messageIcon: {
    fontSize: '1.2rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
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
  errorText: {
    color: '#ef4444',
    fontSize: '13px',
    fontWeight: '500'
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
  charCount: {
    fontSize: '12px',
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: '4px'
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
  receivedMessagesContainer: {
    minHeight: '600px'
  },
  messagesLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    minHeight: '600px'
  },
  messagesList: {
    backgroundColor: 'white',
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
    backgroundColor: 'white',
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
    
    .franchise-messages-container {
      animation: fadeInUp 0.6s ease-out;
    }
    
    .message-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }
    
    /* Mobile Responsive */
    @media (max-width: 1024px) {
      .franchise-messages-container .messagesLayout {
        grid-template-columns: 1fr !important;
      }
    }
    
    @media (max-width: 768px) {
      .franchise-messages-container .container {
        padding: 16px !important;
      }
      .franchise-messages-container .gridRow {
        grid-template-columns: 1fr !important;
      }
      .franchise-messages-container .tabNavigation {
        flex-direction: column;
      }
      .franchise-messages-container .tabButton {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);
}

export default FranchiseMessages;
