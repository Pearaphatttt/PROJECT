import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { companyProfileService } from '../services/companyProfileService';
import ActionButton from '../components/ActionButton';
import { Edit, ArrowLeft } from 'lucide-react';

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
      const profileData = await companyProfileService.getProfile(email);
      setMe(profileData);
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
      <button
        onClick={() => navigate('/company/dashboard')}
        className="flex items-center gap-2 mb-6 text-sm"
        style={{ color: '#3F6FA6' }}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      <h2 className="text-2xl font-bold mb-6" style={{ color: '#2C3E5B' }}>
        Company Profile
      </h2>

      {/* Profile Info */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: '#FFFFFF',
          border: '1px solid #D6DEE9',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div className="flex items-start gap-4 mb-6">
          {me?.logoUrl ? (
            <img
              src={me.logoUrl}
              alt="Logo"
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-lg flex items-center justify-center text-white text-3xl font-semibold"
              style={{ background: '#3F6FA6' }}
            >
              {me?.companyName?.[0] || email?.[0]?.toUpperCase() || 'C'}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#2C3E5B' }}>
              {me?.companyName || 'Company Name'}
            </h3>
            {me?.industry && (
              <p className="text-sm mb-1" style={{ color: '#6B7C93' }}>
                Industry: {me.industry}
              </p>
            )}
            {me?.province && (
              <p className="text-sm mb-1" style={{ color: '#6B7C93' }}>
                Location: {me.province}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {me?.website && (
            <div>
              <label className="text-sm font-semibold" style={{ color: '#6B7C93' }}>
                Website
              </label>
              <p style={{ color: '#2C3E5B' }}>
                <a href={me.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {me.website}
                </a>
              </p>
            </div>
          )}

          {me?.contactEmail && (
            <div>
              <label className="text-sm font-semibold" style={{ color: '#6B7C93' }}>
                Contact Email
              </label>
              <p style={{ color: '#2C3E5B' }}>{me.contactEmail}</p>
            </div>
          )}

          {me?.phone && (
            <div>
              <label className="text-sm font-semibold" style={{ color: '#6B7C93' }}>
                Phone
              </label>
              <p style={{ color: '#2C3E5B' }}>{me.phone}</p>
            </div>
          )}

          {me?.workModes && me.workModes.length > 0 && (
            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: '#6B7C93' }}>
                Work Modes
              </label>
              <div className="flex flex-wrap gap-2">
                {me.workModes.map((mode, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      background: '#E9EEF5',
                      color: '#3F6FA6',
                      border: '1px solid #D6DEE9',
                    }}
                  >
                    {mode}
                  </span>
                ))}
              </div>
            </div>
          )}

          {me?.about && (
            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: '#6B7C93' }}>
                About
              </label>
              <p className="whitespace-pre-wrap" style={{ color: '#2C3E5B' }}>
                {me.about}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <ActionButton
        onClick={() => navigate('/company/profile/edit')}
        className="flex items-center justify-center gap-2"
      >
        <Edit size={18} />
        Edit Profile
      </ActionButton>
    </div>
  );
};

export default CompanyProfile;

