import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CardShell from '../components/CardShell';
import LabeledInput from '../components/LabeledInput';
import TagInput from '../components/TagInput';
import ActionButton from '../components/ActionButton';

const StudentEditProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const extracted = location.state?.extracted || {};

  const [fullName, setFullName] = useState(extracted.fullName || '');
  const [email, setEmail] = useState(extracted.email || '');
  const [phone, setPhone] = useState(extracted.phone || '');
  const [skills, setSkills] = useState(extracted.skills || []);
  const [educationLevel, setEducationLevel] = useState(extracted.educationLevel || '');
  const [fieldOfStudy, setFieldOfStudy] = useState(extracted.fieldOfStudy || '');
  const [institution, setInstitution] = useState(extracted.institution || '');
  const [province, setProvince] = useState(extracted.province || '');

  const educationLevels = ['Diploma', 'Bachelor', 'Master', 'PhD', 'Other'];
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

  const handleSave = () => {
    // In a real app, this would save to backend
    // For now, save to localStorage
    const profileData = {
      fullName,
      email,
      phone,
      skills,
      educationLevel,
      fieldOfStudy,
      institution,
      province,
    };
    localStorage.setItem('studentProfile', JSON.stringify(profileData));
    navigate('/student/profile');
  };

  const handleSkip = () => {
    navigate('/student/profile');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-6 sm:py-12 px-4"
      style={{ background: '#E9EEF5' }}
    >
      <CardShell>
        <h1
          className="text-center mb-6 sm:mb-8 font-bold text-2xl sm:text-3xl md:text-[34px]"
          style={{ color: '#2C3E5B' }}
        >
          Edit Profile (Auto-filled)
        </h1>

        <div className="max-w-md mx-auto">
          <LabeledInput
            label="Full Name"
            type="text"
            id="fullName"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
          <LabeledInput
            label="Email"
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <LabeledInput
            label="Phone"
            type="tel"
            id="phone"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
          />
          <TagInput
            label="Skills"
            tags={skills}
            onChange={setSkills}
            placeholder="Add a skill"
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

          <div className="flex flex-col gap-3 mt-8">
            <ActionButton onClick={handleSave} className="w-full">
              Save
            </ActionButton>
            <button
              onClick={handleSkip}
              className="text-center text-sm hover:underline"
              style={{ color: '#3F6FA6', fontSize: '14px' }}
            >
              Skip for now
            </button>
          </div>
        </div>
      </CardShell>
    </div>
  );
};

export default StudentEditProfile;
