import React from 'react';
import { useNavigate } from 'react-router-dom';
import CardShell from '../components/CardShell';
import ActionButton from '../components/ActionButton';

const ForgotPassword = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-4"
      style={{ background: '#E9EEF5' }}
    >
      <CardShell>
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: '#2C3E5B' }}>
            Forgot Password
          </h1>
          <p className="mb-6 text-base sm:text-lg" style={{ color: '#6B7C93' }}>
            This feature is coming soon.
          </p>
          <ActionButton
            onClick={() => navigate('/auth')}
            className="w-full sm:w-auto"
          >
            Back to Auth
          </ActionButton>
        </div>
      </CardShell>
    </div>
  );
};

export default ForgotPassword;
