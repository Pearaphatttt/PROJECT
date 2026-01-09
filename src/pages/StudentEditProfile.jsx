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
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      // Check if it's a test account first
      const testAccounts = ['test@stu.com', 'test@hr.com'];
      const isTestAccount = testAccounts.includes(email);
      
      if (isTestAccount) {
        // For test accounts, use mock data directly
        const meData = await studentService.getMe();
        // Load profile picture from localStorage
        const profileKey = `studentProfile_${email}`;
        const storedProfile = localStorage.getItem(profileKey);
        const stored = storedProfile ? JSON.parse(storedProfile) : {};
        const merged = {
          fullName: meData?.fullName || '',
          email: email || meData?.email || '',
          phone: meData?.phone || '',
          skills: meData?.skills || stored.skills || [],
          educationLevel: meData?.educationLevel || stored.educationLevel || '',
          fieldOfStudy: meData?.fieldOfStudy || stored.fieldOfStudy || '',
          institution: meData?.institution || stored.institution || '',
          province: meData?.province || stored.province || '',
          profilePicture: stored.profilePicture || null,
        };
        setProfileData(merged);
        if (merged.profilePicture) {
          setProfilePicturePreview(merged.profilePicture);
        }
        return;
      }
      
      // For registered users, try to get from service first (which loads from localStorage)
      const meData = await studentService.getMe();
      
      // Get from localStorage - store per email to avoid conflicts
      const profileKey = `studentProfile_${email}`;
      const storedProfile = localStorage.getItem(profileKey);
      const stored = storedProfile ? JSON.parse(storedProfile) : {};
      
      // Also check old format for backward compatibility (only if email matches)
      const oldStoredProfile = localStorage.getItem('studentProfile');
      let oldStored = {};
      if (oldStoredProfile) {
        try {
          const parsed = JSON.parse(oldStoredProfile);
          // Only use old format if email matches
          if (parsed.email === email) {
            oldStored = parsed;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      // Merge extracted data (from register), stored data, and service data
      const merged = {
        fullName: extracted.fullName || stored.fullName || oldStored.fullName || meData?.fullName || '',
        email: email || extracted.email || stored.email || oldStored.email || meData?.email || '',
        phone: extracted.phone || stored.phone || oldStored.phone || meData?.phone || '',
        skills: extracted.skills || stored.skills || oldStored.skills || meData?.skills || [],
        educationLevel: extracted.educationLevel || stored.educationLevel || oldStored.educationLevel || meData?.educationLevel || '',
        fieldOfStudy: extracted.fieldOfStudy || stored.fieldOfStudy || oldStored.fieldOfStudy || meData?.fieldOfStudy || '',
        institution: extracted.institution || stored.institution || oldStored.institution || meData?.institution || '',
        province: extracted.province || stored.province || oldStored.province || meData?.province || '',
        profilePicture: stored.profilePicture || oldStored.profilePicture || null,
      };
      
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

  const handleSaveField = (field) => {
    const updatedData = {
      ...profileData,
      [field]: editValues[field],
    };
    setProfileData(updatedData);
    
    // Save to localStorage - store per email to avoid conflicts
    const profileKey = `studentProfile_${email}`;
    const storedProfile = localStorage.getItem(profileKey);
    const stored = storedProfile ? JSON.parse(storedProfile) : {};
    const updated = { ...stored, ...updatedData };
    localStorage.setItem(profileKey, JSON.stringify(updated));
    
    // Also update old format for backward compatibility (but only if email matches)
    const oldStoredProfile = localStorage.getItem('studentProfile');
    if (oldStoredProfile) {
      const oldStored = JSON.parse(oldStoredProfile);
      if (oldStored.email === email) {
        localStorage.setItem('studentProfile', JSON.stringify(updated));
      }
    }
    
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
      reader.onloadend = () => {
        const base64String = reader.result;
        const updatedData = {
          ...profileData,
          profilePicture: base64String,
        };
        setProfileData(updatedData);
        setProfilePicturePreview(base64String);
        
        // Save to localStorage immediately
        const profileKey = `studentProfile_${email}`;
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
    const profileKey = `studentProfile_${email}`;
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
