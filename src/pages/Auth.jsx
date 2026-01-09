import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthSplitCard from '../components/AuthSplitCard';
import LabeledInput from '../components/LabeledInput';
import PasswordInput from '../components/PasswordInput';
import ActionButton from '../components/ActionButton';
import { GraduationCap, Building2 } from 'lucide-react';
import { useAuth } from '../state/authStore';

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate loading for better UX
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = login(email, password);
    
    if (result.success) {
      if (result.role === 'student') {
        navigate('/student/dashboard');
      } else if (result.role === 'company') {
        navigate('/company/dashboard');
      }
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleStudentSignUp = () => {
    navigate('/register/student');
  };

  const handleCompanySignUp = () => {
    navigate('/register/company');
  };

  const handleForgotPassword = () => {
    navigate('/auth/forgot');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-4"
      style={{ background: '#E9EEF5' }}
    >
      <AuthSplitCard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left Column - Login */}
          <div className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 md:pb-0 md:pr-8">
            <h2
              className="text-center mb-6 sm:mb-8 font-bold text-2xl sm:text-3xl md:text-[34px]"
              style={{ color: '#2C3E5B' }}
            >
              Login
            </h2>
            <form onSubmit={handleLogin}>
              <LabeledInput
                label="Email"
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="Enter your email"
              />
              <PasswordInput
                label="Password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
              />
              {error && (
                <div className="mb-4 text-sm text-red-600 text-center">
                  {error}
                </div>
              )}
              <div className="flex justify-center mb-4">
                <ActionButton
                  type="submit"
                  className="w-full sm:w-[72%] mx-auto"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </ActionButton>
              </div>
            </form>
            <div className="text-center mb-4">
              <button
                onClick={handleForgotPassword}
                className="text-sm hover:underline"
                style={{ color: '#3F6FA6', fontSize: '14px' }}
              >
                Forgot Password?
              </button>
            </div>
            <div className="text-center text-xs" style={{ color: '#6B7C93' }}>
              <p className="mb-1 font-semibold">Test accounts:</p>
              <p>Student: test@stu.com / P@ssw0rd</p>
              <p>Company: test@hr.com / P@ssw0rd</p>
            </div>
          </div>

          {/* Right Column - Sign Up */}
          <div className="px-4 sm:px-6 md:px-8 md:pl-8 border-t md:border-t-0 md:border-l pt-6 sm:pt-8 md:pt-0"
               style={{ borderColor: '#D6DEE9' }}>
            <h2
              className="text-center mb-6 sm:mb-8 font-bold text-2xl sm:text-3xl md:text-[34px]"
              style={{ color: '#2C3E5B' }}
            >
              Sign Up
            </h2>
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <ActionButton
                onClick={handleStudentSignUp}
                icon={GraduationCap}
                variant="large"
                className="w-full sm:w-[86%] mx-auto"
              >
                Sign Up as Student
              </ActionButton>
              <ActionButton
                onClick={handleCompanySignUp}
                icon={Building2}
                variant="large"
                className="w-full sm:w-[86%] mx-auto"
              >
                Sign Up as Company
              </ActionButton>
            </div>
            <div className="text-center">
              <button
                onClick={handleForgotPassword}
                className="text-sm hover:underline"
                style={{ color: '#3F6FA6', fontSize: '14px' }}
              >
                Forgot Password?
              </button>
            </div>
          </div>
        </div>
      </AuthSplitCard>
    </div>
  );
};

export default Auth;
