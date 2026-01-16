import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { studentService } from '../services/studentService';
import CardShell from '../components/CardShell';
import LabeledInput from '../components/LabeledInput';
import TagInput from '../components/TagInput';
import ActionButton from '../components/ActionButton';
import { Edit, Check, X, Camera, Upload } from 'lucide-react';

const StudentEditProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = useAuth();
  const extracted = location.state?.extracted || {};

  // Load existing data from localStorage or service
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    skills: [],
    educationLevel: '',
    fieldOfStudy: '',
    institution: '',
    province: '',
    profilePicture: null,
  });

  // Track which field is being edited
  const [editingField, setEditingField] = useState(null);
  
  // Temporary values while editing
  const [editValues, setEditValues] = useState({});
  
  // Profile picture preview
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  useEffect(() => {
    if (email) {
      loadProfileData();
    }
  }, [email]);

  const loadProfileData = async () => {
    try {
      if (!email) {
        console.warn('StudentEditProfile: No email found in auth state');
        return;
      }
      
      // Get profile data from service (which handles localStorage internally)
      const meData = await studentService.getMe();
      
      // Debug: Check what we got
      console.log('StudentEditProfile - Current email:', email);
      console.log('StudentEditProfile - meData from service:', meData);
      
      // Ensure we use the current email, not the one from meData
      // Merge extracted data (from register) with service data
      const merged = {
        fullName: extracted.fullName || meData?.fullName || '',
        email: email, // Always use current email from auth
        phone: extracted.phone || meData?.phone || '',
        skills: extracted.skills || meData?.skills || [],
        educationLevel: extracted.educationLevel || meData?.educationLevel || '',
        fieldOfStudy: extracted.fieldOfStudy || meData?.fieldOfStudy || '',
        institution: extracted.institution || meData?.institution || '',
        province: extracted.province || meData?.province || '',
        profilePicture: meData?.profilePicture || null,
      };
      
      console.log('StudentEditProfile - Merged profile data:', merged);
      
      setProfileData(merged);
      if (merged.profilePicture) {
        setProfilePicturePreview(merged.profilePicture);
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  };

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

  const handleEdit = (field) => {
    setEditingField(field);
    setEditValues({
      ...editValues,
      [field]: profileData[field],
    });
  };

  const handleSaveField = async (field) => {
    const updatedData = {
      ...profileData,
      [field]: editValues[field],
    };
    setProfileData(updatedData);
    
    // Save via service
    await studentService.saveProfile(email, updatedData);
    
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        const updatedData = {
          ...profileData,
          profilePicture: base64String,
        };
        setProfileData(updatedData);
        setProfilePicturePreview(base64String);
        
        // Save via service
        await studentService.saveProfile(email, updatedData);
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('profileUpdated', { 
          detail: { field: 'profilePicture', value: base64String, profile: updatedData } 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = async () => {
    const updatedData = {
      ...profileData,
      profilePicture: null,
    };
    setProfileData(updatedData);
    setProfilePicturePreview(null);
    
    // Save via service
    await studentService.saveProfile(email, updatedData);
    
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

  const renderSkillsField = () => {
    const isEditing = editingField === 'skills';
    const skills = isEditing ? (editValues.skills ?? profileData.skills) : profileData.skills;

    return (
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label
            className="block text-sm font-normal"
            style={{ color: '#6B7C93', fontSize: '14px' }}
          >
            Skills
          </label>
          {!isEditing ? (
            <button
              onClick={() => handleEdit('skills')}
              className="p-1 hover:bg-gray-100 rounded"
              style={{ color: '#3F6FA6' }}
            >
              <Edit size={16} />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleSaveField('skills')}
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
          <TagInput
            tags={skills}
            onChange={(newSkills) => handleChange('skills', newSkills)}
            placeholder="Add a skill"
          />
        ) : (
          <div
            className="w-full min-h-[44px]"
            style={{
              background: '#F5F7FB',
              border: '1px solid #D6DEE9',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '14px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              alignItems: 'center',
              color: skills.length > 0 ? '#2C3E5B' : '#6B7C93',
            }}
          >
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full"
                  style={{
                    background: '#E0F2FE',
                    color: '#3F6FA6',
                    fontSize: '12px',
                  }}
                >
                  {skill}
                </span>
              ))
            ) : (
              'No skills set'
            )}
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
          Edit Profile
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
                    {profileData.fullName?.[0] || email?.[0]?.toUpperCase() || 'U'}
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

          {renderEditableField('fullName', 'Full Name', 'text')}
          {renderEditableField('email', 'Email', 'email')}
          {renderEditableField('phone', 'Phone', 'tel')}
          {renderSkillsField()}
          {renderEditableField('educationLevel', 'Education Level', 'select', educationLevels)}
          {renderEditableField('fieldOfStudy', 'Field of Study', 'text')}
          {renderEditableField('institution', 'Institution', 'text')}
          {renderEditableField('province', 'Province/Area', 'select', provinces)}

          <div className="flex flex-col gap-3 mt-8">
            <ActionButton onClick={() => navigate('/student/profile')} className="w-full">
              Back to Profile
            </ActionButton>
          </div>
        </div>
      </CardShell>
    </div>
  );
};

export default StudentEditProfile;
