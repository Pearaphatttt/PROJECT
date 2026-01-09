import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { companyService } from '../services/companyService';
import ActionButton from '../components/ActionButton';
import { LogOut } from 'lucide-react';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { email, logout } = useAuth();
  const [me, setMe] = useState(null);
  const [candidateMatches, setCandidateMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [meData, matchesData] = await Promise.all([
          companyService.getMe(),
          companyService.getCandidateMatches(),
        ]);
        
        // Load profile picture from localStorage
        const profileKey = `companyProfile_${email}`;
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
        setCandidateMatches(matchesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
      loadData();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [email]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleViewProfile = (candidateId) => {
    // Navigate to candidate profile (placeholder for now)
    console.log('View profile for:', candidateId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#E9EEF5' }}>
        <div className="text-center" style={{ color: '#6B7C93' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#E9EEF5' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#2C3E5B' }}>
            Employer Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {me?.profilePicture ? (
                <img
                  src={me.profilePicture}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{ background: '#3F6FA6' }}
                >
                  {me?.hrName?.[0] || email?.[0]?.toUpperCase() || 'H'}
                </div>
              )}
              <span className="text-sm hidden sm:inline" style={{ color: '#6B7C93' }}>
                {me?.hrName || email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:opacity-70 transition-opacity"
              style={{ color: '#3F6FA6' }}
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Welcome Title */}
        <h2
          className="text-2xl sm:text-3xl font-bold mb-6"
          style={{ color: '#2C3E5B' }}
        >
          Hello, {me?.hrName || 'HR Manager'}!
        </h2>

        {/* Candidate Matches Section */}
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: '#2C3E5B' }}>
            Candidate Matches
          </h3>
          <div className="space-y-4">
            {candidateMatches.map((candidate) => (
              <div
                key={candidate.id}
                className="rounded-xl p-4 sm:p-6"
                style={{
                  background: '#F5F7FB',
                  border: '1px solid #D6DEE9',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                      style={{ background: '#3F6FA6' }}
                    >
                      {candidate.name?.[0] || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold mb-2" style={{ color: '#2C3E5B' }}>
                        {candidate.name}
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {candidate.skills?.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              background: '#E9EEF5',
                              color: '#3F6FA6',
                              border: '1px solid #D6DEE9',
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs mb-1" style={{ color: '#6B7C93' }}>
                          Match Score
                        </div>
                        <div
                          className="text-lg font-bold"
                          style={{ color: '#3F6FA6' }}
                        >
                          {candidate.matchScore}%
                        </div>
                      </div>
                      <ActionButton
                        onClick={() => handleViewProfile(candidate.id)}
                        className="w-full sm:w-auto min-w-[120px]"
                      >
                        View Profile
                      </ActionButton>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;

