import React from 'react';
import { useNavigate } from 'react-router-dom';
import CardShell from '../components/CardShell';
import ActionButton from '../components/ActionButton';
import { GraduationCap, Building2 } from 'lucide-react';

const RegisterRoleSelect = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-4"
      style={{ background: '#E9EEF5' }}
    >
      <CardShell>
        <div className="text-center">
          <h1
            className="text-2xl sm:text-3xl md:text-[34px] font-bold mb-3"
            style={{ color: '#2C3E5B' }}
          >
            Register
          </h1>
          <p className="text-base sm:text-lg mb-6 sm:mb-8" style={{ color: '#6B7C93' }}>
            Choose user type
          </p>
          <div className="space-y-3 sm:space-y-4 max-w-md mx-auto">
            <ActionButton
              onClick={() => navigate('/register/student')}
              icon={GraduationCap}
              variant="large"
              className="w-full"
            >
              Student
            </ActionButton>
            <ActionButton
              onClick={() => navigate('/register/company')}
              icon={Building2}
              variant="large"
              className="w-full"
            >
              Company / HR
            </ActionButton>
          </div>
        </div>
      </CardShell>
    </div>
  );
};

export default RegisterRoleSelect;
