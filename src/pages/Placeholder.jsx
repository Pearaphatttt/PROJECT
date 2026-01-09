import React from 'react';
import { useNavigate } from 'react-router-dom';

const Placeholder = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#E9EEF5' }}
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4" style={{ color: '#2C3E5B' }}>
          Logged in!
        </h1>
        <button
          onClick={() => navigate('/auth')}
          className="px-6 py-2 rounded-lg text-white hover:opacity-90"
          style={{ background: '#3F6FA6' }}
        >
          Back to Auth
        </button>
      </div>
    </div>
  );
};

export default Placeholder;
