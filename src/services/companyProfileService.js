import { USE_MOCK } from "../config/env";
import { readJSON, writeJSON } from "../utils/storage";
import { STORAGE_KEYS } from "../config/storageKeys";
import http from "./http";

// Helper to get profile key
const getProfileKey = (companyEmail) => {
  return `companyProfile_${companyEmail}`;
};

// Helper to get default profile
const getDefaultProfile = (companyEmail) => {
  // Try to get basic info from registeredUsers
  const registeredUsers = readJSON(STORAGE_KEYS.REGISTERED_USERS, {});
  const userData = registeredUsers[companyEmail] || {};

  return {
    companyEmail,
    companyName: userData.companyName || '',
    industry: '',
    province: '',
    workModes: [],
    website: '',
    contactEmail: companyEmail,
    phone: '',
    about: '',
    logoUrl: '',
    updatedAt: new Date().toISOString(),
  };
};

export const companyProfileService = {
  async getProfile(companyEmail) {
    if (USE_MOCK) {
      if (!companyEmail) {
        return getDefaultProfile('');
      }

      const profileKey = getProfileKey(companyEmail);
      const profile = readJSON(profileKey, null);

      if (profile) {
        return profile;
      }

      // Return default profile
      return getDefaultProfile(companyEmail);
    }

    const res = await http.get(`/api/company/profile?email=${companyEmail}`);
    return res.json();
  },

  async saveProfile(companyEmail, patch) {
    if (USE_MOCK) {
      if (!companyEmail) {
        return { success: false, error: 'Company email is required' };
      }

      const profileKey = getProfileKey(companyEmail);
      const currentProfile = readJSON(profileKey, getDefaultProfile(companyEmail));

      // Merge with patch
      const updatedProfile = {
        ...currentProfile,
        ...patch,
        companyEmail, // Ensure email is not changed
        updatedAt: new Date().toISOString(),
      };

      // Basic validation
      if (!updatedProfile.companyName || updatedProfile.companyName.trim() === '') {
        return { success: false, error: 'Company name is required' };
      }

      // Validate email format if contactEmail is provided
      if (updatedProfile.contactEmail && !updatedProfile.contactEmail.includes('@')) {
        return { success: false, error: 'Invalid contact email format' };
      }

      writeJSON(profileKey, updatedProfile);

      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent('profileUpdated'));

      return { success: true, profile: updatedProfile };
    }

    const res = await http.put('/api/company/profile', { companyEmail, ...patch });
    return res.json();
  },
};
