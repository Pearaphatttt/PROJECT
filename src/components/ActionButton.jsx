import React from 'react';

const ActionButton = ({ 
  children, 
  onClick, 
  icon: Icon, 
  variant = 'primary',
  className = '',
  style = {},
  type = 'button',
  disabled = false
}) => {
  const baseStyles = {
    height: variant === 'large' ? '52px' : '44px',
    background: '#3F6FA6',
    borderRadius: variant === 'large' ? '10px' : '8px',
    color: '#FFFFFF',
    fontSize: variant === 'large' ? '16px' : '14px',
    fontWeight: variant === 'large' ? '600' : '500',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: variant === 'large' ? 'flex-start' : 'center',
    gap: '8px',
    transition: 'background-color 0.2s',
    padding: variant === 'large' ? '0 20px' : '0 16px',
    opacity: disabled ? 0.5 : 1,
  };

  const hoverStyle = {
    background: '#2E5A8A',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${className} ${disabled ? '' : 'hover:opacity-90'}`}
      style={{
        ...baseStyles,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = hoverStyle.background;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = baseStyles.background;
        }
      }}
    >
      {Icon && (
        <Icon size={20} color="white" />
      )}
      {children}
    </button>
  );
};

export default ActionButton;

