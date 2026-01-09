import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { companyService } from '../services/companyService';
import CardShell from '../components/CardShell';
import LabeledInput from '../components/LabeledInput';
import ActionButton from '../components/ActionButton';
import { Edit, Check, X, Camera, Upload } from 'lucide-react';

const CompanyEditProfile = () => {
  const navigate = useNavigate();
  const { email } = useAuth();

  const [profileData, setProfileData] = useState({
    companyName: '',
    hrName: '',
    email: '',
    industry: '',
    province: '',
    profilePicture: null,
  });

  const [editingField, setEditingField] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      // Check if it's a test account first
      const testAccounts = ['test@stu.com', 'test@hr.com'];
      const isTestAccount = testAccounts.includes(email);
      
      if (isTestAccount) {
        // For test accounts, use mock data directly from service
        const meData = await companyService.getMe();
        // Load profile picture from localStorage
        const profileKey = `companyProfile_${email}`;
        const storedProfile = localStorage.getItem(profileKey);
        const stored = storedProfile ? JSON.parse(storedProfile) : {};
        const merged = {
          companyName: meData?.companyName || '',
          hrName: meData?.hrName || '',
          email: email || meData?.email || '',
          industry: meData?.industry || '',
          province: meData?.province || '',
          profilePicture: stored.profilePicture || null,
        };
        setProfileData(merged);
        if (merged.profilePicture) {
          setProfilePicturePreview(merged.profilePicture);
        }
        return;
      }
      
      // For registered users
      const meData = await companyService.getMe();
      
      // Get from localStorage - store per email to avoid conflicts
      const profileKey = `companyProfile_${email}`;
      const storedProfile = localStorage.getItem(profileKey);
      const stored = storedProfile ? JSON.parse(storedProfile) : {};
      
      const merged = {
        companyName: stored.companyName || meData?.companyName || '',
        hrName: stored.hrName || meData?.hrName || '',
        email: email || stored.email || meData?.email || '',
        industry: stored.industry || meData?.industry || '',
        province: stored.province || meData?.province || '',
        profilePicture: stored.profilePicture || null,
      };
      
      setProfileData(merged);
      if (merged.profilePicture) {
        setProfilePicturePreview(merged.profilePicture);
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  };

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
    'Retail',
    'Healthcare',
    'Education',
    'Other',
  ];

  const handleEdit = (field) => {
    setEditingField(field);
    setEditValues({
      ...editValues,
      [field]: profileData[field],
    });
  };

  const handleSaveField = (field) => {
    const updatedData = {
      ...profileData,
      [field]: editValues[field],
    };
    setProfileData(updatedData);
    
    // Save to localStorage - store per email to avoid conflicts
    const profileKey = `companyProfile_${email}`;
    const storedProfile = localStorage.getItem(profileKey);
    const stored = storedProfile ? JSON.parse(storedProfile) : {};
    const updated = { ...stored, ...updatedData };
    localStorage.setItem(profileKey, JSON.stringify(updated));
    
    // Trigger custom event to notify other components
    window.dispatchEvent(new CustomEvent('profileUpdated', { 
      detail: { field, value: editValues[field], profile: updatedData } 
    }));
    
    setEditingField(null);
    setEditValues({});
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValues({});
  };

  const handleChange = (field, value) => {
    setEditValues({
      ...editValues,
      [field]: value,
    });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        const updatedData = {
          ...profileData,
          profilePicture: base64String,
        };
        setProfileData(updatedData);
        setProfilePicturePreview(base64String);
        
        // Save to localStorage immediately
        const profileKey = `companyProfile_${email}`;
        const storedProfile = localStorage.getItem(profileKey);
        const stored = storedProfile ? JSON.parse(storedProfile) : {};
        const updated = { ...stored, ...updatedData };
        localStorage.setItem(profileKey, JSON.stringify(updated));
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('profileUpdated', { 
          detail: { field: 'profilePicture', value: base64String, profile: updatedData } 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    const updatedData = {
      ...profileData,
      profilePicture: null,
    };
    setProfileData(updatedData);
    setProfilePicturePreview(null);
    
    // Save to localStorage
    const profileKey = `companyProfile_${email}`;
    const storedProfile = localStorage.getItem(profileKey);
    const stored = storedProfile ? JSON.parse(storedProfile) : {};
    const updated = { ...stored, ...updatedData };
    localStorage.setItem(profileKey, JSON.stringify(updated));
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('profileUpdated', { 
      detail: { field: 'profilePicture', value: null, profile: updatedData } 
    }));
  };

  const renderEditableField = (field, label, type = 'text', options = null) => {
    const isEditing = editingField === field;
    const value = isEditing ? (editValues[field] ?? profileData[field]) : profileData[field];

    return (
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label
            className="block text-sm font-normal"
            style={{ color: '#6B7C93', fontSize: '14px' }}
          >
            {label}
          </label>
          {!isEditing ? (
            <button
              onClick={() => handleEdit(field)}
              className="p-1 hover:bg-gray-100 rounded"
              style={{ color: '#3F6FA6' }}
            >
              <Edit size={16} />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleSaveField(field)}
                className="p-1 hover:bg-gray-100 rounded"
                style={{ color: '#10B981' }}
              >
                <Check size={16} />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-100 rounded"
                style={{ color: '#EF4444' }}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
        {isEditing ? (
          options ? (
            <select
              value={value}
              onChange={(e) => handleChange(field, e.target.value)}
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
              <option value="">Select {label.toLowerCase()}</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={value}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={`Enter your ${label.toLowerCase()}`}
              className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              style={{
                height: '44px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '14px',
              }}
            />
          )
        ) : (
          <div
            className="w-full"
            style={{
              height: '44px',
              background: '#F5F7FB',
              border: '1px solid #D6DEE9',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              color: value ? '#2C3E5B' : '#6B7C93',
            }}
          >
            {value || `No ${label.toLowerCase()} set`}
          </div>
        )}
      </div>
    );
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
          Edit Company Profile
        </h1>

        <div className="max-w-md mx-auto">
          {/* Profile Picture */}
          <div className="mb-6 text-center">
            <label className="block text-sm font-normal mb-2" style={{ color: '#6B7C93', fontSize: '14px' }}>
              Profile Picture
            </label>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {profilePicturePreview ? (
                  <img
                    src={profilePicturePreview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4"
                    style={{ borderColor: '#D6DEE9' }}
                  />
                ) : (
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl font-semibold"
                    style={{ background: '#3F6FA6' }}
                  >
                    {profileData.companyName?.[0] || email?.[0]?.toUpperCase() || 'C'}
                  </div>
                )}
                <label
                  htmlFor="profilePictureInput"
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: '#3F6FA6' }}
                >
                  <Camera size={20} className="text-white" />
                  <input
                    id="profilePictureInput"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <label
                  htmlFor="profilePictureInput"
                  className="px-4 py-2 rounded-lg cursor-pointer text-sm"
                  style={{ background: '#3F6FA6', color: 'white' }}
                >
                  <Upload size={16} className="inline mr-2" />
                  {profilePicturePreview ? 'Change Photo' : 'Upload Photo'}
                </label>
                {profilePicturePreview && (
                  <button
                    onClick={handleRemoveProfilePicture}
                    className="px-4 py-2 rounded-lg text-sm"
                    style={{ background: '#EF4444', color: 'white' }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {renderEditableField('companyName', 'Company Name', 'text')}
          {renderEditableField('hrName', 'HR Name', 'text')}
          {renderEditableField('email', 'Email', 'email')}
          {renderEditableField('industry', 'Industry', 'select', industries)}
          {renderEditableField('province', 'Province/Area', 'select', provinces)}

          <div className="flex flex-col gap-3 mt-8">
            <ActionButton onClick={() => navigate('/company/profile')} className="w-full">
              Back to Profile
            </ActionButton>
          </div>
        </div>
      </CardShell>
    </div>
  );
};

export default CompanyEditProfile;

