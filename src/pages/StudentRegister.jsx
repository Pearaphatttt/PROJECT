import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardShell from '../components/CardShell';
import Stepper from '../components/Stepper';
import LabeledInput from '../components/LabeledInput';
import PasswordInput from '../components/PasswordInput';
import Dropzone from '../components/Dropzone';
import ActionButton from '../components/ActionButton';
import { useAuth } from '../state/authStore';

const StudentRegister = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Step 2: Basic Info
  const [fullName, setFullName] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [institution, setInstitution] = useState('');
  const [province, setProvince] = useState('');

  // Step 3: Resume
  const [resumeFile, setResumeFile] = useState(null);

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

  const educationLevels = ['Diploma', 'Bachelor', 'Master', 'PhD', 'Other'];

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
    return (
      fullName &&
      educationLevel &&
      fieldOfStudy &&
      institution &&
      province
    );
  };

  const validateStep3 = () => {
    return resumeFile !== null;
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
    const registerResult = register(email, password, 'student');
    if (!registerResult.success) {
      setPasswordError(registerResult.error);
      setLoading(false);
      setCurrentStep(1); // Go back to step 1 to show error
      return;
    }

    // Save profile data - store per email to avoid conflicts
    const profileData = {
      fullName,
      email,
      phone: '',
      skills: ['React', 'Node.js', 'Git'],
      educationLevel,
      fieldOfStudy,
      institution,
      province,
    };
    const profileKey = `studentProfile_${email}`;
    localStorage.setItem(profileKey, JSON.stringify(profileData));
    // Also save to old format for backward compatibility
    localStorage.setItem('studentProfile', JSON.stringify(profileData));

    // Save resume
    if (resumeFile) {
      const resumeData = {
        id: `resume-${Date.now()}`,
        filename: resumeFile.name,
        uploadedAt: new Date().toISOString(),
        size: resumeFile.size,
      };
      localStorage.setItem('studentResume', JSON.stringify(resumeData));
      // Mark that resume is uploaded
      localStorage.setItem('hasResume', 'true');
    }

    // Simulate analysis
    await new Promise((resolve) => setTimeout(resolve, 1200));

    navigate('/student/dashboard');
  };

  const handleSkip = async () => {
    setLoading(true);
    
    // Register the user first
    const registerResult = register(email, password, 'student');
    if (!registerResult.success) {
      setPasswordError(registerResult.error);
      setLoading(false);
      setCurrentStep(1); // Go back to step 1 to show error
      return;
    }

    // Save profile data - store per email to avoid conflicts
    const profileData = {
      fullName,
      email,
      phone: '',
      skills: [],
      educationLevel,
      fieldOfStudy,
      institution,
      province,
    };
    const profileKey = `studentProfile_${email}`;
    localStorage.setItem(profileKey, JSON.stringify(profileData));
    // Also save to old format for backward compatibility
    localStorage.setItem('studentProfile', JSON.stringify(profileData));
    
    // Mark that resume is NOT uploaded
    localStorage.setItem('hasResume', 'false');

    await new Promise((resolve) => setTimeout(resolve, 500));

    navigate('/student/dashboard');
  };

  const steps = ['Account', 'Basic Info', 'Resume'];

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
              Basic Information
            </h2>
            <LabeledInput
              label="Full Name"
              type="text"
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
            <div className="mb-5">
              <label
                className="block text-sm font-normal mb-2"
                style={{ color: '#6B7C93', fontSize: '14px' }}
              >
                Education Level
              </label>
              <select
                id="educationLevel"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
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
                <option value="">Select education level</option>
                {educationLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <LabeledInput
              label="Field of Study"
              type="text"
              id="fieldOfStudy"
              name="fieldOfStudy"
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
              placeholder="Enter your field of study"
            />
            <LabeledInput
              label="Institution"
              type="text"
              id="institution"
              name="institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Enter your institution"
            />
            <div className="mb-5">
              <label
                className="block text-sm font-normal mb-2"
                style={{ color: '#6B7C93', fontSize: '14px' }}
              >
                Province/Area
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
          </div>
        )}

        {currentStep === 3 && (
          <div className="max-w-md mx-auto">
            <h2
              className="text-center mb-4 sm:mb-6 font-bold text-xl sm:text-2xl md:text-[28px]"
              style={{ color: '#2C3E5B' }}
            >
              Upload Resume
            </h2>
            <Dropzone
              onFileSelect={setResumeFile}
              accept=".pdf,.docx"
              label="Resume"
            />
            <p className="text-sm text-center mt-4" style={{ color: '#6B7C93' }}>
              You can skip this step and upload your resume later in your profile
            </p>
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
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handleSkip}
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
                {loading ? 'Processing...' : 'Skip for now'}
              </button>
              <ActionButton
                onClick={handleAnalyze}
                disabled={loading || !resumeFile}
                className="w-full sm:w-auto px-8"
              >
                {loading ? 'Analyzing...' : 'Analyze Resume'}
              </ActionButton>
            </div>
          )}
        </div>
      </CardShell>
    </div>
  );
};

export default StudentRegister;
