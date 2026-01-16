import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { companyProfileService } from '../services/companyProfileService';
import LabeledInput from '../components/LabeledInput';
import ActionButton from '../components/ActionButton';
import { ArrowLeft, Save } from 'lucide-react';

const CompanyEditProfile = () => {
  const navigate = useNavigate();
  const { email } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    province: '',
    website: '',
    contactEmail: '',
    phone: '',
    about: '',
    workModes: [],
  });

  const provinces = [
    'Bangkok',
    'Nonthaburi',
    'Pathum Thani',
    'Chonburi',
    'Chiang Mai',
    'Khon Kaen',
    'Phuket',
    'Songkhla',
    'Other',
  ];

  const industries = [
    'IT/Software',
    'Telecom',
    'Finance',
    'Manufacturing',
    'Retail',
    'Healthcare',
    'Education',
    'Marketing',
    'Other',
  ];

  const workModeOptions = ['On-site', 'Hybrid', 'Remote'];

  useEffect(() => {
    loadProfile();
  }, [email]);

  const loadProfile = async () => {
    try {
      const profile = await companyProfileService.getProfile(email);
      setFormData({
        companyName: profile.companyName || '',
        industry: profile.industry || '',
        province: profile.province || '',
        website: profile.website || '',
        contactEmail: profile.contactEmail || email || '',
        phone: profile.phone || '',
        about: profile.about || '',
        workModes: profile.workModes || [],
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWorkModeToggle = (mode) => {
    setFormData((prev) => ({
      ...prev,
      workModes: prev.workModes.includes(mode)
        ? prev.workModes.filter((m) => m !== mode)
        : [...prev.workModes, mode],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const result = await companyProfileService.saveProfile(email, formData);
      if (result.success) {
        navigate('/company/profile');
      } else {
        alert(result.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <div className="text-center" style={{ color: '#6B7C93' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <button
        onClick={() => navigate('/company/profile')}
        className="flex items-center gap-2 mb-6 text-sm"
        style={{ color: '#3F6FA6' }}
      >
        <ArrowLeft size={16} />
        Back to Profile
      </button>

      <h2 className="text-2xl font-bold mb-6" style={{ color: '#2C3E5B' }}>
        Edit Company Profile
      </h2>

      <form onSubmit={handleSubmit}>
        <div
          className="rounded-xl p-6 mb-6"
          style={{
            background: '#FFFFFF',
            border: '1px solid #D6DEE9',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div className="space-y-6">
            <LabeledInput
              label="Company Name *"
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              required
              placeholder="Enter company name"
            />

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2C3E5B' }}>
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  background: '#FFFFFF',
                  borderColor: '#CBD5E1',
                  color: '#2C3E5B',
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

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2C3E5B' }}>
                Province
              </label>
              <select
                value={formData.province}
                onChange={(e) => handleChange('province', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  background: '#FFFFFF',
                  borderColor: '#CBD5E1',
                  color: '#2C3E5B',
                }}
              >
                <option value="">Select province</option>
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2C3E5B' }}>
                Work Modes
              </label>
              <div className="flex flex-wrap gap-2">
                {workModeOptions.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleWorkModeToggle(mode)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.workModes.includes(mode)
                        ? 'text-white'
                        : 'text-gray-700'
                    }`}
                    style={{
                      background: formData.workModes.includes(mode) ? '#3F6FA6' : '#F5F7FB',
                      border: `1px solid ${formData.workModes.includes(mode) ? '#3F6FA6' : '#D6DEE9'}`,
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <LabeledInput
              label="Website"
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://example.com"
            />

            <LabeledInput
              label="Contact Email"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              placeholder="contact@company.com"
            />

            <LabeledInput
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+66 XX XXX XXXX"
            />

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2C3E5B' }}>
                About
              </label>
              <textarea
                value={formData.about}
                onChange={(e) => handleChange('about', e.target.value)}
                rows={6}
                className="w-full px-4 py-2 rounded-lg border resize-none"
                style={{
                  background: '#FFFFFF',
                  borderColor: '#CBD5E1',
                  color: '#2C3E5B',
                }}
                placeholder="Tell us about your company..."
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <ActionButton
            type="submit"
            disabled={saving || !formData.companyName.trim()}
            className="flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Profile'}
          </ActionButton>
          <ActionButton
            type="button"
            onClick={() => navigate('/company/profile')}
            style={{ background: '#6B7C93' }}
          >
            Cancel
          </ActionButton>
        </div>
      </form>
    </div>
  );
};

export default CompanyEditProfile;
