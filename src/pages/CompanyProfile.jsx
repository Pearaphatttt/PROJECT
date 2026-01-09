import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { companyService } from '../services/companyService';
import ActionButton from '../components/ActionButton';
import { Edit, Settings } from 'lucide-react';

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { email } = useAuth();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
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
      const meData = await companyService.getMe();
      
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
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div style={{ color: '#6B7C93' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#2C3E5B' }}>
        Company Profile
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
              {me?.companyName?.[0] || email?.[0]?.toUpperCase() || 'C'}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2" style={{ color: '#2C3E5B' }}>
              {me?.companyName || 'Company'}
            </h3>
            <p className="text-sm mb-1" style={{ color: '#6B7C93' }}>
              {email}
            </p>
            {me?.hrName && (
              <p className="text-sm" style={{ color: '#6B7C93' }}>
                HR: {me.hrName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ActionButton
          onClick={() => navigate('/company/profile/edit')}
          className="flex items-center justify-center gap-2"
        >
          <Edit size={18} />
          Edit Profile
        </ActionButton>
        <ActionButton
          onClick={() => navigate('/company/profile/settings')}
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

export default CompanyProfile;

