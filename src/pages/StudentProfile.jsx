import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { useStudentStore } from '../state/studentStore';
import { studentService } from '../services/studentService';
import ActionButton from '../components/ActionButton';
import { Edit, FileText, Settings, User } from 'lucide-react';

const StudentProfile = () => {
  const navigate = useNavigate();
  const { email } = useAuth();
  const { appliedInternshipIds, matchedInternshipIds } = useStudentStore();
  const [me, setMe] = useState(null);
  const [summary, setSummary] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    loadResume();
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
      loadData();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const loadData = async () => {
    try {
      const [meData, summaryData] = await Promise.all([
        studentService.getMe(),
        studentService.getSummary(),
      ]);
      
      // Load profile picture from localStorage
      const profileKey = `studentProfile_${email}`;
      const storedProfile = localStorage.getItem(profileKey);
      if (storedProfile) {
        try {
          const stored = JSON.parse(storedProfile);
          if (stored.profilePicture) {
            meData.profilePicture = stored.profilePicture;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      setMe(meData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResume = () => {
    const stored = localStorage.getItem('studentResume');
    if (stored) {
      try {
        setResume(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load resume:', e);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div style={{ color: '#6B7C93' }}>Loading...</div>
      </div>
    );
  }

  const applicationsCount = summary
    ? summary.applications + appliedInternshipIds.size
    : appliedInternshipIds.size;
  const matchesCount = summary ? summary.matches : 0;
  const interviewsCount = summary ? summary.interviews : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#2C3E5B' }}>
        Profile Overview
      </h2>

      {/* Basic Info */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: '#F5F7FB',
          border: '1px solid #D6DEE9',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div className="flex items-start gap-4">
          {me?.profilePicture ? (
            <img
              src={me.profilePicture}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-semibold"
              style={{ background: '#3F6FA6' }}
            >
              {me?.fullName?.[0] || email?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2" style={{ color: '#2C3E5B' }}>
              {me?.fullName || 'Student'}
            </h3>
            <p className="text-sm mb-1" style={{ color: '#6B7C93' }}>
              {email}
            </p>
            {me?.province && (
              <p className="text-sm" style={{ color: '#6B7C93' }}>
                {me.province}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Resume Status */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: '#F5F7FB',
          border: '1px solid #D6DEE9',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#2C3E5B' }}>
          Resume Status
        </h3>
        {resume ? (
          <div className="flex items-center gap-3">
            <FileText size={24} style={{ color: '#10B981' }} />
            <div>
              <div className="font-medium" style={{ color: '#2C3E5B' }}>
                {resume.filename}
              </div>
              <div className="text-sm" style={{ color: '#6B7C93' }}>
                Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm" style={{ color: '#6B7C93' }}>
            No resume uploaded yet
          </p>
        )}
      </div>

      {/* Match Summary */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: '#F5F7FB',
          border: '1px solid #D6DEE9',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#2C3E5B' }}>
          Match Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-sm mb-1" style={{ color: '#6B7C93' }}>
              Matches
            </div>
            <div className="text-2xl font-bold" style={{ color: '#2C3E5B' }}>
              {matchesCount}
            </div>
          </div>
          <div>
            <div className="text-sm mb-1" style={{ color: '#6B7C93' }}>
              Applications
            </div>
            <div className="text-2xl font-bold" style={{ color: '#2C3E5B' }}>
              {applicationsCount}
            </div>
          </div>
          <div>
            <div className="text-sm mb-1" style={{ color: '#6B7C93' }}>
              Interviews
            </div>
            <div className="text-2xl font-bold" style={{ color: '#2C3E5B' }}>
              {interviewsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ActionButton
          onClick={() => navigate('/student/profile/edit')}
          className="flex items-center justify-center gap-2"
        >
          <Edit size={18} />
          Edit Profile
        </ActionButton>
        <ActionButton
          onClick={() => navigate('/student/profile/documents')}
          className="flex items-center justify-center gap-2"
          style={{ background: '#6B7C93' }}
        >
          <FileText size={18} />
          Documents
        </ActionButton>
        <ActionButton
          onClick={() => navigate('/student/profile/settings')}
          className="flex items-center justify-center gap-2"
          style={{ background: '#6B7C93' }}
        >
          <Settings size={18} />
          Settings
        </ActionButton>
      </div>
    </div>
  );
};

export default StudentProfile;

