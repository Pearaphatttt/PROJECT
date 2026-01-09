import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CardShell from '../components/CardShell';
import LabeledInput from '../components/LabeledInput';
import TagInput from '../components/TagInput';
import ActionButton from '../components/ActionButton';

const CompanyEditInternship = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const extracted = location.state?.extracted || {};

  const [jobTitle, setJobTitle] = useState(extracted.jobTitle || '');
  const [mustSkills, setMustSkills] = useState(extracted.mustSkills || []);
  const [niceSkills, setNiceSkills] = useState(extracted.niceSkills || []);
  const [province, setProvince] = useState(extracted.province || '');
  const [mode, setMode] = useState(extracted.mode || '');

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

  const workModes = [
    { value: 'onsite', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'remote', label: 'Remote' },
  ];

  const handlePublish = () => {
    // In a real app, this would save to backend
    navigate('/placeholder');
  };

  const handleSkip = () => {
    navigate('/placeholder');
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
          Edit Internship (Auto-filled)
        </h1>

        <div className="max-w-md mx-auto">
          <LabeledInput
            label="Job Title"
            type="text"
            id="jobTitle"
            name="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Enter job title"
          />
          <TagInput
            label="Must-Have Skills"
            tags={mustSkills}
            onChange={setMustSkills}
            placeholder="Add required skill"
          />
          <TagInput
            label="Nice-to-Have Skills"
            tags={niceSkills}
            onChange={setNiceSkills}
            placeholder="Add optional skill"
          />
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
          <div className="mb-5">
            <label
              className="block text-sm font-normal mb-2"
              style={{ color: '#6B7C93', fontSize: '14px' }}
            >
              Work Mode
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              {workModes.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMode(option.value)}
                  className="flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-colors"
                  style={{
                    background: mode === option.value ? '#3F6FA6' : '#FFFFFF',
                    color: mode === option.value ? '#FFFFFF' : '#6B7C93',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-8">
            <ActionButton onClick={handlePublish} className="w-full">
              Publish
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

export default CompanyEditInternship;
