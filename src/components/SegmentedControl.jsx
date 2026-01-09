import React from 'react';

const SegmentedControl = ({ options, value, onChange, label }) => {
  return (
    <div className="mb-5">
      <label
        className="block text-sm font-normal mb-2"
        style={{ color: '#6B7C93', fontSize: '14px' }}
      >
        {label}
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className="flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors"
            style={{
              background: value === option.value ? '#3F6FA6' : '#FFFFFF',
              color: value === option.value ? '#FFFFFF' : '#6B7C93',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SegmentedControl;
