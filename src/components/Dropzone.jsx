import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

const Dropzone = ({ onFileSelect, accept = '.pdf,.docx', label = 'Upload File' }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    setFile(selectedFile);
    if (onFileSelect) {
      onFileSelect(selectedFile);
    }
  };

  const handleRemove = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  return (
    <div className="mb-5">
      <label
        className="block text-sm font-normal mb-2"
        style={{ color: '#6B7C93', fontSize: '14px' }}
      >
        {label}
      </label>
      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          style={{
            borderColor: isDragging ? '#3B82F6' : '#CBD5E1',
            background: isDragging ? '#EFF6FF' : '#FFFFFF',
            borderRadius: '8px',
          }}
        >
          <Upload className="mx-auto mb-2" size={32} style={{ color: '#6B7C93' }} />
          <p className="text-sm" style={{ color: '#6B7C93' }}>
            Drag and drop your file here, or click to browse
          </p>
          <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
            Accepted: {accept}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div
          className="flex items-center justify-between p-4 rounded-lg border"
          style={{
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
          }}
        >
          <div className="flex items-center gap-3">
            <Upload size={20} style={{ color: '#6B7C93' }} />
            <span className="text-sm" style={{ color: '#2C3E5B' }}>
              {file.name}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 hover:bg-gray-100 rounded"
            style={{ color: '#6B7C93' }}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Dropzone;
