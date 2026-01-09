import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

const TagInput = ({ label, tags = [], onChange, placeholder = 'Add tag...' }) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      onChange([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="mb-5">
      <label
        className="block text-sm font-normal mb-2"
        style={{ color: '#6B7C93', fontSize: '14px' }}
      >
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm"
            style={{
              background: '#EFF6FF',
              color: '#3F6FA6',
              border: '1px solid #BFDBFE',
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="hover:bg-blue-200 rounded-full p-0.5"
              style={{ color: '#3F6FA6' }}
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      <form onSubmit={handleAddTag} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          style={{
            height: '44px',
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '12px 14px',
            fontSize: '14px',
          }}
        />
        <button
          type="submit"
          className="px-4 rounded-lg flex items-center justify-center"
          style={{
            background: '#3F6FA6',
            color: '#FFFFFF',
            borderRadius: '8px',
            height: '44px',
          }}
        >
          <Plus size={20} />
        </button>
      </form>
    </div>
  );
};

export default TagInput;
