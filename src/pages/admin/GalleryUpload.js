import React, { useState } from 'react';
import { database } from '../../firebase/config';
import { ref, push, set } from "firebase/database";

const GalleryUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'image',
    icon: '',
    imageUrl: '',
    videoUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const categories = [
    { value: 'classes', label: 'Classes', icon: '🏛️' },
    { value: 'events', label: 'Events', icon: '🎉' },
    { value: 'facilities', label: 'Facilities', icon: '🏫' },
  ];

  const iconOptions = [
    '💻', '🏛️', '🎓', '📊', '🏆', '🏫', '📋', '👨‍💼', '📚', '🌐', '🚀', '🖥️',
    '📱', '⚡', '🔬', '🎨', '📝', '🎯', '💡', '🔧', '📈', '🎪', '🏅', '📷'
  ];

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'title':
        if (!value.trim()) newErrors.title = 'Title is required';
        else if (value.length < 5) newErrors.title = 'Title must be at least 5 characters';
        else delete newErrors.title;
        break;
      case 'description':
        if (!value.trim()) newErrors.description = 'Description is required';
        else if (value.length < 20) newErrors.description = 'Description must be at least 20 characters';
        else delete newErrors.description;
        break;
      case 'category':
        if (!value) newErrors.category = 'Category is required';
        else delete newErrors.category;
        break;
      case 'icon':
        if (!value) newErrors.icon = 'Icon is required';
        else delete newErrors.icon;
        break;
      case 'imageUrl':
        if (formData.type === 'image' && !value.trim()) {
          newErrors.imageUrl = 'Image URL is required for image type';
        } else if (value && !isValidUrl(value)) {
          newErrors.imageUrl = 'Please enter a valid URL';
        } else delete newErrors.imageUrl;
        break;
      case 'videoUrl':
        if (formData.type === 'video' && !value.trim()) {
          newErrors.videoUrl = 'Video URL is required for video type';
        } else if (value && !isValidUrl(value)) {
          newErrors.videoUrl = 'Please enter a valid URL';
        } else delete newErrors.videoUrl;
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleFocus = (field) => setFocusedField(field);
  const handleBlur = () => setFocusedField('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      if (key !== 'imageUrl' && key !== 'videoUrl') {
        validateField(key, formData[key]);
      }
    });

    // Validate URL based on type
    if (formData.type === 'image') {
      validateField('imageUrl', formData.imageUrl);
    } else {
      validateField('videoUrl', formData.videoUrl);
    }

    if (Object.keys(errors).length > 0) {
      setMessage('Please fix the errors below');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const galleryRef = ref(database, 'gallery');
      const newItemRef = push(galleryRef);

      const galleryData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        icon: formData.icon,
        imageUrl: formData.type === 'image' ? formData.imageUrl : '',
        videoUrl: formData.type === 'video' ? formData.videoUrl : '',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        active: true
      };

      await set(newItemRef, galleryData);

      setMessage('🎉 Gallery item added successfully!');
      setFormData({
        title: '',
        description: '',
        category: '',
        type: 'image',
        icon: '',
        imageUrl: '',
        videoUrl: '',
      });
      setErrors({});
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container} className="gallery-upload-container">
      {/* Enhanced Header */}
      <div style={styles.header} className="gallery-upload-header">
        <div style={styles.headerIcon}>🖼️</div>
        <h2 style={styles.title}>Gallery Content Manager</h2>
        <p style={styles.subtitle}>Add photos and videos to showcase campus activities and facilities</p>
        <div style={styles.headerDecoration}></div>
      </div>

      {/* Message Alert */}
      {message && (
        <div style={{
          ...styles.message,
          backgroundColor: message.includes('Error') || message.includes('fix') ? '#fef2f2' : '#f0fdf4',
          color: message.includes('Error') || message.includes('fix') ? '#dc2626' : '#16a34a',
          borderLeft: `4px solid ${message.includes('Error') || message.includes('fix') ? '#dc2626' : '#16a34a'}`
        }} className="gallery-upload-message">
          <div style={styles.messageIcon}>
            {message.includes('Error') || message.includes('fix') ? '⚠️' : '✅'}
          </div>
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form} className="gallery-upload-form">
        {/* Basic Information Section */}
        <div style={styles.section} className="form-section">
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>📝</span>
            <h3 style={styles.sectionTitle}>Content Information</h3>
          </div>
          
          <div style={styles.row}>
            <label style={styles.label}>
              <span style={styles.labelText}>
                <span style={styles.labelIcon}>📋</span>
                Title *
              </span>
              {errors.title && <span style={styles.errorText}>{errors.title}</span>}
            </label>
            <input
              style={{
                ...styles.input,
                borderColor: errors.title ? '#ef4444' : focusedField === 'title' ? '#3b82f6' : '#e5e7eb',
                boxShadow: focusedField === 'title' ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
                backgroundColor: focusedField === 'title' ? '#ffffff' : '#f9fafb'
              }}
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onFocus={() => handleFocus('title')}
              onBlur={handleBlur}
              required
              placeholder="Enter content title"
              className="form-input"
            />
          </div>

          <div style={styles.row}>
            <label style={styles.label}>
              <span style={styles.labelText}>
                <span style={styles.labelIcon}>📄</span>
                Description *
              </span>
              {errors.description && <span style={styles.errorText}>{errors.description}</span>}
            </label>
            <textarea
              style={{
                ...styles.input,
                ...styles.textarea,
                borderColor: errors.description ? '#ef4444' : focusedField === 'description' ? '#3b82f6' : '#e5e7eb',
                boxShadow: focusedField === 'description' ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
                backgroundColor: focusedField === 'description' ? '#ffffff' : '#f9fafb'
              }}
              name="description"
              value={formData.description}
              onChange={handleChange}
              onFocus={() => handleFocus('description')}
              onBlur={handleBlur}
              required
              placeholder="Enter detailed description..."
              rows="4"
              className="form-input"
            />
          </div>

          <div style={styles.gridRow} className="form-grid">
            <div style={styles.gridItem}>
              <label style={styles.label}>
                <span style={styles.labelText}>
                  <span style={styles.labelIcon}>📂</span>
                  Category *
                </span>
                {errors.category && <span style={styles.errorText}>{errors.category}</span>}
              </label>
              <select
                style={{
                  ...styles.input,
                  borderColor: errors.category ? '#ef4444' : focusedField === 'category' ? '#3b82f6' : '#e5e7eb',
                  boxShadow: focusedField === 'category' ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
                  backgroundColor: focusedField === 'category' ? '#ffffff' : '#f9fafb'
                }}
                name="category"
                value={formData.category}
                onChange={handleChange}
                onFocus={() => handleFocus('category')}
                onBlur={handleBlur}
                required
                className="form-input"
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
              <label style={styles.label}>
                <span style={styles.labelText}>
                  <span style={styles.labelIcon}>🎭</span>
                  Content Type *
                </span>
              </label>
              <select
                style={{
                  ...styles.input,
                  borderColor: focusedField === 'type' ? '#3b82f6' : '#e5e7eb',
                  boxShadow: focusedField === 'type' ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
                  backgroundColor: focusedField === 'type' ? '#ffffff' : '#f9fafb'
                }}
                name="type"
                value={formData.type}
                onChange={handleChange}
                onFocus={() => handleFocus('type')}
                onBlur={handleBlur}
                className="form-input"
              >
                <option value="image">📷 Image</option>
                <option value="video">🎥 Video</option>
              </select>
            </div>
          </div>
        </div>

        {/* Icon Selection Section */}
        <div style={styles.section} className="form-section">
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>🎨</span>
            <h3 style={styles.sectionTitle}>Visual Settings</h3>
          </div>
          
          <div style={styles.row}>
            <label style={styles.label}>
              <span style={styles.labelText}>
                <span style={styles.labelIcon}>😀</span>
                Select Icon *
              </span>
              {errors.icon && <span style={styles.errorText}>{errors.icon}</span>}
            </label>
            <div style={styles.iconGrid}>
              {iconOptions.map(icon => (
                <button
                  key={icon}
                  type="button"
                  style={{
                    ...styles.iconButton,
                    backgroundColor: formData.icon === icon ? '#3b82f6' : '#f8fafc',
                    color: formData.icon === icon ? 'white' : '#64748b',
                    transform: formData.icon === icon ? 'scale(1.1)' : 'scale(1)',
                  }}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, icon }));
                    validateField('icon', icon);
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* URL Section */}
        <div style={styles.section} className="form-section">
          <div style={styles.sectionHeader}>
            <span style={styles.sectionIcon}>🔗</span>
            <h3 style={styles.sectionTitle}>Media URL</h3>
          </div>
          
          {formData.type === 'image' ? (
            <div style={styles.row}>
              <label style={styles.label}>
                <span style={styles.labelText}>
                  <span style={styles.labelIcon}>🖼️</span>
                  Image URL *
                </span>
                {errors.imageUrl && <span style={styles.errorText}>{errors.imageUrl}</span>}
              </label>
              <input
                style={{
                  ...styles.input,
                  borderColor: errors.imageUrl ? '#ef4444' : focusedField === 'imageUrl' ? '#3b82f6' : '#e5e7eb',
                  boxShadow: focusedField === 'imageUrl' ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
                  backgroundColor: focusedField === 'imageUrl' ? '#ffffff' : '#f9fafb'
                }}
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                onFocus={() => handleFocus('imageUrl')}
                onBlur={handleBlur}
                placeholder="https://example.com/image.jpg"
                className="form-input"
              />
            </div>
          ) : (
            <div style={styles.row}>
              <label style={styles.label}>
                <span style={styles.labelText}>
                  <span style={styles.labelIcon}>🎬</span>
                  Video URL *
                </span>
                {errors.videoUrl && <span style={styles.errorText}>{errors.videoUrl}</span>}
              </label>
              <input
                style={{
                  ...styles.input,
                  borderColor: errors.videoUrl ? '#ef4444' : focusedField === 'videoUrl' ? '#3b82f6' : '#e5e7eb',
                  boxShadow: focusedField === 'videoUrl' ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
                  backgroundColor: focusedField === 'videoUrl' ? '#ffffff' : '#f9fafb'
                }}
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                onFocus={() => handleFocus('videoUrl')}
                onBlur={handleBlur}
                placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
                className="form-input"
              />
            </div>
          )}
        </div>

        {/* Preview Section */}
        {(formData.title || formData.description || formData.icon) && (
          <div style={styles.section} className="form-section">
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>👁️</span>
              <h3 style={styles.sectionTitle}>Preview</h3>
            </div>
            
            <div style={styles.previewCard}>
              <div style={styles.previewImage}>
                <span style={styles.previewIcon}>{formData.icon || '📷'}</span>
                <div style={styles.previewBadge}>
                  {formData.category || 'category'}
                </div>
              </div>
              <div style={styles.previewContent}>
                <h4 style={styles.previewTitle}>
                  {formData.title || 'Content Title'}
                </h4>
                <p style={styles.previewDescription}>
                  {formData.description || 'Content description will appear here...'}
                </p>
                <div style={styles.previewMeta}>
                  <span>{formData.type === 'video' ? '🎥' : '📷'}</span>
                  <span>{formData.type === 'video' ? 'Video' : 'Photo'}</span>
                  <span>•</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

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
          className="gallery-upload-button"
        >
          {loading ? (
            <>
              <span style={styles.spinner}></span>
              Publishing Content...
            </>
          ) : (
            <>
              <span style={styles.buttonIcon}>📤</span>
              Publish to Gallery
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '20px auto',
    padding: '0',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    border: '1px solid #f1f5f9',
    overflow: 'hidden',
    position: 'relative',
  },

  header: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #4c1d95 100%)',
    color: 'white',
    padding: '40px 30px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  headerIcon: {
    fontSize: '3rem',
    marginBottom: '16px',
    display: 'block',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
  },

  headerDecoration: {
    position: 'absolute',
    top: '-50px',
    right: '-50px',
    width: '150px',
    height: '150px',
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
    borderRadius: '50%',
  },

  title: {
    fontSize: '2rem',
    fontWeight: '800',
    margin: '0 0 12px 0',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },

  subtitle: {
    fontSize: '1.1rem',
    margin: '0',
    opacity: '0.9',
    fontWeight: '400',
  },

  message: {
    margin: '24px 30px',
    padding: '16px 20px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },

  messageIcon: {
    fontSize: '1.2rem',
  },

  form: {
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },

  section: {
    padding: '0',
    borderBottom: '2px solid #f1f5f9',
    paddingBottom: '24px',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },

  sectionIcon: {
    fontSize: '1.5rem',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
  },

  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0',
  },

  row: {
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
  },

  gridRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '16px',
  },

  gridItem: {
    display: 'flex',
    flexDirection: 'column',
  },

  label: {
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },

  labelText: {
    fontWeight: '600',
    color: '#374151',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  labelIcon: {
    fontSize: '1rem',
  },

  errorText: {
    color: '#ef4444',
    fontSize: '13px',
    fontWeight: '500',
    backgroundColor: '#fef2f2',
    padding: '4px 8px',
    borderRadius: '6px',
  },

  input: {
    padding: '16px 18px',
    fontSize: '15px',
    borderRadius: '12px',
    border: '2px solid #e5e7eb',
    outline: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'inherit',
    fontWeight: '500',
  },

  textarea: {
    resize: 'vertical',
    minHeight: '120px',
    fontFamily: 'inherit',
    lineHeight: '1.5',
  },

  iconGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
    gap: '12px',
    marginTop: '8px',
  },

  iconButton: {
    padding: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: '#f8fafc',
    color: '#64748b',
  },

  previewCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
    marginTop: '16px',
  },

  previewImage: {
    width: '100%',
    height: '180px',
    background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    position: 'relative',
  },

  previewIcon: {
    fontSize: '3rem',
  },

  previewBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#7c3aed',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  previewContent: {
    padding: '20px',
  },

  previewTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
    lineHeight: '1.3',
  },

  previewDescription: {
    color: '#64748b',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    marginBottom: '12px',
  },

  previewMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#94a3b8',
    fontSize: '0.8rem',
  },

  button: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #4c1d95 100%)',
    border: 'none',
    color: '#ffffff',
    padding: '18px 28px',
    fontSize: '16px',
    borderRadius: '14px',
    fontWeight: '700',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  buttonIcon: {
    fontSize: '1.2rem',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  },

  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// Add responsive styles and animations
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

    .gallery-upload-container {
      animation: fadeInUp 0.6s ease-out;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .gallery-upload-container {
        margin: 10px !important;
        borderRadius: 20px !important;
        maxWidth: none !important;
        width: calc(100% - 20px) !important;
      }

      .gallery-upload-header {
        padding: 30px 20px !important;
      }

      .gallery-upload-form {
        padding: 24px 20px !important;
        gap: 24px !important;
      }

      .form-grid {
        gridTemplateColumns: 1fr !important;
        gap: 16px !important;
      }
    }

    /* Hover Effects */
    .gallery-upload-button:hover:not(:disabled) {
      background: linear-gradient(135deg, #6d28d9 0%, #4c1d95 50%, #3730a3 100%) !important;
      transform: translateY(-2px) !important;
      boxShadow: 0 12px 32px rgba(124, 58, 237, 0.4) !important;
    }
  `;
  document.head.appendChild(style);
}

export default GalleryUpload;
