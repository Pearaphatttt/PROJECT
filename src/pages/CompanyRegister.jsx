import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardShell from '../components/CardShell';
import Stepper from '../components/Stepper';
import LabeledInput from '../components/LabeledInput';
import PasswordInput from '../components/PasswordInput';
import SegmentedControl from '../components/SegmentedControl';
import Dropzone from '../components/Dropzone';
import ActionButton from '../components/ActionButton';
import { useAuth } from '../state/authStore';

const CompanyRegister = () => {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' or 'upload'

  // Step 1: Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Step 2: Company Info
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [province, setProvince] = useState('');
  const [workMode, setWorkMode] = useState('');

  // Step 3: JD
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState(null);

  const provinces = [
    'Bangkok',
    'Nonthaburi',
    'Pathum Thani',
    'Chonburi',
    'Chiang Mai',
    'Khon Kaen',
    'Phuket',
    'Songkhla',
  ];

  const industries = [
    'IT/Software',
    'Telecom',
    'Finance',
    'Manufacturing',
    'Education',
    'Healthcare',
    'Other',
  ];

  const workModes = [
    { value: 'onsite', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'remote', label: 'Remote' },
  ];

  const validateStep1 = () => {
    if (!email || !password || !confirmPassword) {
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateStep2 = () => {
    return companyName && industry && province && workMode;
  };

  const validateStep3 = () => {
    if (activeTab === 'paste') {
      return jdText.trim().length > 0;
    } else {
      return jdFile !== null;
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnalyze = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    
    // Register the user first
    const registerResult = register(email, password, 'company');
    if (!registerResult.success) {
      setPasswordError(registerResult.error);
      setLoading(false);
      setCurrentStep(1); // Go back to step 1 to show error
      return;
    }

    // Simulate analysis
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const loginResult = login(email, password);
    if (!loginResult.success) {
      setPasswordError(loginResult.error || 'Login failed');
      setLoading(false);
      return;
    }

    const extracted = {
      jobTitle: 'Software Developer Intern',
      mustSkills: ['JavaScript', 'React', 'Git'],
      niceSkills: ['Tailwind', 'Docker'],
      province,
      mode: workMode,
      jdText: activeTab === 'paste' ? jdText : '...',
    };

    setLoading(false);
    navigate('/company/internship/edit', { state: { extracted } });
  };

  const steps = ['Account', 'Company Info', 'JD'];

  return (
    <div
      className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-4"
      style={{ background: '#E9EEF5' }}
    >
      <CardShell>
        <Stepper steps={steps} currentStep={currentStep} />

        {currentStep === 1 && (
          <div className="max-w-md mx-auto">
            <h2
              className="text-center mb-4 sm:mb-6 font-bold text-xl sm:text-2xl md:text-[28px]"
              style={{ color: '#2C3E5B' }}
            >
              Account Information
            </h2>
            <LabeledInput
              label="Email"
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            <PasswordInput
              label="Password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordInput
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (password && e.target.value !== password) {
                  setPasswordError('Passwords do not match');
                } else {
                  setPasswordError('');
                }
              }}
            />
            {passwordError && (
              <p className="text-sm text-red-500 mb-4">{passwordError}</p>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="max-w-md mx-auto">
            <h2
              className="text-center mb-4 sm:mb-6 font-bold text-xl sm:text-2xl md:text-[28px]"
              style={{ color: '#2C3E5B' }}
            >
              Company Information
            </h2>
            <LabeledInput
              label="Company Name"
              type="text"
              id="companyName"
              name="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
            />
            <div className="mb-5">
              <label
                className="block text-sm font-normal mb-2"
                style={{ color: '#6B7C93', fontSize: '14px' }}
              >
                Industry
              </label>
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                style={{
                  height: '44px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '14px',
                }}
              >
                <option value="">Select industry</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label
                className="block text-sm font-normal mb-2"
                style={{ color: '#6B7C93', fontSize: '14px' }}
              >
                Province/Location
              </label>
              <select
                id="province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                style={{
                  height: '44px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  fontSize: '14px',
                }}
              >
                <option value="">Select province</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <SegmentedControl
              label="Work Mode"
              options={workModes}
              value={workMode}
              onChange={setWorkMode}
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="max-w-md mx-auto">
            <h2
              className="text-center mb-4 sm:mb-6 font-bold text-xl sm:text-2xl md:text-[28px]"
              style={{ color: '#2C3E5B' }}
            >
              Job Description
            </h2>
            <div className="mb-4">
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className="flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors"
                  style={{
                    background: activeTab === 'paste' ? '#3F6FA6' : '#FFFFFF',
                    color: activeTab === 'paste' ? '#FFFFFF' : '#6B7C93',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                  }}
                >
                  Paste JD
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className="flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors"
                  style={{
                    background: activeTab === 'upload' ? '#3F6FA6' : '#FFFFFF',
                    color: activeTab === 'upload' ? '#FFFFFF' : '#6B7C93',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                  }}
                >
                  Upload JD
                </button>
              </div>
              {activeTab === 'paste' ? (
                <div>
                  <label
                    className="block text-sm font-normal mb-2"
                    style={{ color: '#6B7C93', fontSize: '14px' }}
                  >
                    Job Description Text
                  </label>
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste job description here..."
                    rows={8}
                    className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '12px 14px',
                      fontSize: '14px',
                      resize: 'vertical',
                    }}
                  />
                </div>
              ) : (
                <Dropzone
                  onFileSelect={setJdFile}
                  accept=".pdf"
                  label="Job Description PDF"
                />
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 rounded-lg font-medium transition-colors"
              style={{
                background: '#FFFFFF',
                color: '#6B7C93',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                height: '44px',
              }}
            >
              Back
            </button>
          )}
          {currentStep < 3 ? (
            <ActionButton
              onClick={handleNext}
              disabled={loading}
              className="w-full sm:w-auto px-8"
            >
              Next
            </ActionButton>
          ) : (
            <ActionButton
              onClick={handleAnalyze}
              disabled={loading || !validateStep3()}
              className="w-full sm:w-auto px-8"
            >
              {loading ? 'Analyzing...' : 'Analyze JD'}
            </ActionButton>
          )}
        </div>
      </CardShell>
    </div>
  );
};

export default CompanyRegister;
