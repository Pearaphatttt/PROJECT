import React from 'react';

const PasswordInput = ({ label, value, onChange, id, name }) => {
  return (
    <div className="mb-5">
      <label 
        htmlFor={id}
        className="block text-sm font-normal mb-2"
        style={{ color: '#6B7C93', fontSize: '14px' }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type="password"
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          style={{
            height: '44px',
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '14px',
          }}
        />
      </div>
    </div>
  );
};

export default PasswordInput;
