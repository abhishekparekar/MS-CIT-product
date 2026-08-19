import React, { useState } from 'react';

const FormInput = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    required = false,
    error,
    options = [],
    rows = 4,
    disabled = false,
    icon
}) => {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const styles = {
        formGroup: {
            marginBottom: '20px',
            position: 'relative',
        },

        label: {
            display: 'block',
            marginBottom: '8px',
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#374151',
        },

        required: {
            color: '#ef4444',
            marginLeft: '4px',
        },

        inputWrapper: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
        },

        input: {
            width: '100%',
            padding: icon ? '12px 12px 12px 45px' : '12px 15px',
            border: `2px solid ${error ? '#ef4444' : focused ? '#667eea' : '#d1d5db'}`,
            borderRadius: '8px',
            fontSize: '0.95rem',
            color: '#374151',
            background: disabled ? '#f9fafb' : 'white',
            transition: 'all 0.3s ease',
            outline: 'none',
            boxSizing: 'border-box',
        },

        textarea: {
            width: '100%',
            padding: '12px 15px',
            border: `2px solid ${error ? '#ef4444' : focused ? '#667eea' : '#d1d5db'}`,
            borderRadius: '8px',
            fontSize: '0.95rem',
            color: '#374151',
            background: disabled ? '#f9fafb' : 'white',
            transition: 'all 0.3s ease',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
        },

        select: {
            width: '100%',
            padding: '12px 15px',
            border: `2px solid ${error ? '#ef4444' : focused ? '#667eea' : '#d1d5db'}`,
            borderRadius: '8px',
            fontSize: '0.95rem',
            color: '#374151',
            background: disabled ? '#f9fafb' : 'white',
            transition: 'all 0.3s ease',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxSizing: 'border-box',
        },

        icon: {
            position: 'absolute',
            left: '15px',
            color: '#9ca3af',
            fontSize: '1.1rem',
            zIndex: '1',
        },

        passwordToggle: {
            position: 'absolute',
            right: '15px',
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '1.1rem',
            padding: '4px',
        },

        error: {
            color: '#ef4444',
            fontSize: '0.85rem',
            marginTop: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
        },

        helpText: {
            color: '#6b7280',
            fontSize: '0.85rem',
            marginTop: '6px',
        },
    };

    const renderInput = () => {
        const commonProps = {
            name,
            value: value || '',
            onChange,
            onFocus: () => setFocused(true),
            onBlur: () => setFocused(false),
            placeholder,
            disabled,
            required,
        };

        switch (type) {
            case 'textarea':
                return (
                    <textarea
                        {...commonProps}
                        style={styles.textarea}
                        rows={rows}
                    />
                );

            case 'select':
                return (
                    <select {...commonProps} style={styles.select}>
                        <option value="">Select {label}</option>
                        {options.map((option, index) => (
                            <option key={index} value={option.value || option}>
                                {option.label || option}
                            </option>
                        ))}
                    </select>
                );

            case 'password':
                return (
                    <div style={styles.inputWrapper}>
                        {icon && <span style={styles.icon}>{icon}</span>}
                        <input
                            {...commonProps}
                            type={showPassword ? 'text' : 'password'}
                            style={styles.input}
                        />
                        <button
                            type="button"
                            style={styles.passwordToggle}
                            onClick={() => setShowPassword(!showPassword)}
                            onMouseEnter={(e) => e.target.style.color = '#667eea'}
                            onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                );

            case 'file':
                return (
                    <div style={styles.inputWrapper}>
                        <input
                            {...commonProps}
                            type="file"
                            style={{
                                ...styles.input,
                                paddingTop: '10px',
                                paddingBottom: '10px',
                                cursor: 'pointer',
                            }}
                            accept={name === 'image' ? 'image/*' : undefined}
                        />
                    </div>
                );

            default:
                return (
                    <div style={styles.inputWrapper}>
                        {icon && <span style={styles.icon}>{icon}</span>}
                        <input
                            {...commonProps}
                            type={type}
                            style={styles.input}
                        />
                    </div>
                );
        }
    };

    return (
        <div style={styles.formGroup}>
            <label style={styles.label}>
                {label}
                {required && <span style={styles.required}>*</span>}
            </label>

            {renderInput()}

            {error && (
                <div style={styles.error}>
                    <span>⚠️</span>
                    {error}
                </div>
            )}
        </div>
    );
};

export default FormInput;
