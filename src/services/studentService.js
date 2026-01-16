import { USE_MOCK } from "../config/env";
import { studentMock } from "../mocks/student.mock";
import http from "./http";
import { readJSON, writeJSON, removeKey } from "../utils/storage";
import {
  studentProfileKey,
  studentResumeKey,
  studentResumeHistoryKey,
  studentHasResumeKey,
} from "../utils/storageKeys";
import { STORAGE_KEYS } from "../config/storageKeys";

export const studentService = {
  async getMe() {
    if (USE_MOCK) {
      // Get email from auth state to check if it's a test account
      const authState = readJSON(STORAGE_KEYS.AUTH);
      const email = authState?.email || null;
      
      console.log('studentService.getMe() - Current email from auth:', email);
      
      // Test accounts should use mock data
      const testAccounts = ['test@stu.com', 'test@hr.com'];
      if (email && testAccounts.includes(email)) {
        console.log('studentService.getMe() - Using mock data for test account');
        return studentMock;
      }
      
      // Clean up old format if email doesn't match
      if (email) {
        const oldStoredProfile = readJSON('studentProfile');
        if (oldStoredProfile && oldStoredProfile.email && oldStoredProfile.email !== email) {
          console.warn(`studentService.getMe() - Cleaning up old format profile for different email (${oldStoredProfile.email} vs ${email})`);
          // Remove old format if email doesn't match
          removeKey('studentProfile');
        }
      }
      
      // For registered users, try to get profile data from localStorage
      // First try per-email storage
      if (email) {
        const profileKey = studentProfileKey(email);
        const profile = readJSON(profileKey);
        console.log(`studentService.getMe() - Profile key: ${profileKey}`);
        console.log('studentService.getMe() - Profile found:', profile);
        
        if (profile) {
          // Always use current email from auth state, not from profile
          const result = {
            fullName: profile.fullName || 'Student',
            email: email, // Always use current email from auth
            phone: profile.phone || '',
            skills: profile.skills || [],
            educationLevel: profile.educationLevel || '',
            fieldOfStudy: profile.fieldOfStudy || '',
            institution: profile.institution || '',
            province: profile.province || '',
            profilePicture: profile.profilePicture || null,
          };
          console.log('studentService.getMe() - Returning profile:', result);
          return result;
        }
      }
      
      // Fallback to old format for backward compatibility
      // Only use if email matches exactly
      const oldStoredProfile = readJSON('studentProfile');
      console.log('studentService.getMe() - Old format profile:', oldStoredProfile);
      if (oldStoredProfile && email) {
        if (oldStoredProfile.email === email) {
          console.log('studentService.getMe() - Using old format profile (email matches), migrating to new format');
          // Migrate to new format
          const profileKey = studentProfileKey(email);
          const migratedProfile = {
            ...oldStoredProfile,
            email: email, // Ensure email is correct
          };
          writeJSON(profileKey, migratedProfile);
          // Remove old format after migration
          removeKey('studentProfile');
          return {
            fullName: oldStoredProfile.fullName || 'Student',
            email: email, // Always use current email
            phone: oldStoredProfile.phone || '',
            skills: oldStoredProfile.skills || [],
            educationLevel: oldStoredProfile.educationLevel || '',
            fieldOfStudy: oldStoredProfile.fieldOfStudy || '',
            institution: oldStoredProfile.institution || '',
            province: oldStoredProfile.province || '',
            profilePicture: oldStoredProfile.profilePicture || null,
          };
        } else {
          console.warn(`studentService.getMe() - Old format profile email (${oldStoredProfile.email}) doesn't match current email (${email}), removing old format`);
          // Remove old format if email doesn't match
          removeKey('studentProfile');
        }
      }
      
      // For registered users without profile, return empty profile instead of mock data
      // Only return mock data if email is null (shouldn't happen in normal flow)
      if (email) {
        console.log('studentService.getMe() - No profile found, returning empty profile for:', email);
        return {
          fullName: 'Student',
          email: email,
          phone: '',
          skills: [],
          educationLevel: '',
          fieldOfStudy: '',
          institution: '',
          province: '',
          profilePicture: null,
        };
      }
      
      // Fallback to mock data only if no email (shouldn't happen)
      console.warn('studentService.getMe() - No email found, returning mock data');
      return studentMock;
    }
    const res = await http.get("/api/student/me");
    return res.json();
  },
  async getSummary() {
    if (USE_MOCK) {
      // Get email from auth state to check if it's a test account
      const authState = readJSON(STORAGE_KEYS.AUTH);
      const email = authState?.email || null;
      
      // Test accounts should use mock summary
      const testAccounts = ['test@stu.com', 'test@hr.com'];
      if (email && testAccounts.includes(email)) {
        return studentMock.summary;
      }
      
      // For registered users, return default summary
      // (Summary should be calculated from actual data, not stored)
      return { matches: 0, applications: 0, interviews: 0 };
    }
    const res = await http.get("/api/student/summary");
    return res.json();
  },
  async saveProfile(email, profileData) {
    if (USE_MOCK) {
      if (!email) {
        console.error('studentService.saveProfile() - No email provided');
        return null;
      }
      
      const profileKey = studentProfileKey(email);
      const existing = readJSON(profileKey, {});
      // Ensure email is always included in the saved profile
      const updated = { ...existing, ...profileData, email: email };
      
      console.log(`studentService.saveProfile() - Saving profile for: ${email}`);
      console.log(`studentService.saveProfile() - Profile key: ${profileKey}`);
      console.log('studentService.saveProfile() - Profile data:', updated);
      
      writeJSON(profileKey, updated);
      
      // Verify it was saved
      const saved = readJSON(profileKey);
      console.log('studentService.saveProfile() - Verified saved profile:', saved);
      
      return updated;
    }
    const res = await http.put("/api/student/profile", profileData);
    return res.json();
  },
  async getProfilePicture(email) {
    if (USE_MOCK) {
      const profileKey = `studentProfile_${email}`;
      const profile = readJSON(profileKey);
      if (profile?.profilePicture) {
        return profile.profilePicture;
      }
      
      // Check old format
      const oldStoredProfile = readJSON('studentProfile');
      if (oldStoredProfile?.email === email && oldStoredProfile?.profilePicture) {
        return oldStoredProfile.profilePicture;
      }
      return null;
    }
    const res = await http.get("/api/student/profile/picture");
    return res.json();
  },
  async getResume(email) {
    if (USE_MOCK) {
      if (!email) {
        const authState = readJSON(STORAGE_KEYS.AUTH);
        email = authState?.email || null;
      }
      if (email) {
        const resumeKey = studentResumeKey(email);
        const resume = readJSON(resumeKey, null);
        if (resume) {
          return resume;
        }
        // One-time migration from old format
        const legacy = readJSON('studentResume', null);
        if (legacy) {
          writeJSON(resumeKey, legacy);
          return legacy;
        }
        return null;
      }
      // Fallback to old format for backward compatibility
      return readJSON('studentResume', null);
    }
    const res = await http.get("/api/student/resume");
    return res.json();
  },
  async saveResume(resumeData, email) {
    if (USE_MOCK) {
      if (!email) {
        const authState = readJSON(STORAGE_KEYS.AUTH);
        email = authState?.email || null;
      }
      if (email) {
        const resumeKey = studentResumeKey(email);
        const hasResumeKey = studentHasResumeKey(email);
        if (resumeData) {
          writeJSON(resumeKey, resumeData);
          writeJSON(hasResumeKey, 'true');
        } else {
          writeJSON(hasResumeKey, 'false');
        }
      } else {
        // Fallback to old format for backward compatibility
        if (resumeData) {
          writeJSON('studentResume', resumeData);
          writeJSON('hasResume', 'true');
        } else {
          writeJSON('hasResume', 'false');
        }
      }
      return resumeData;
    }
    const res = await http.post("/api/student/resume", resumeData);
    return res.json();
  },
  async getResumeHistory(email) {
    if (USE_MOCK) {
      if (!email) {
        const authState = readJSON(STORAGE_KEYS.AUTH);
        email = authState?.email || null;
      }
      if (email) {
        const historyKey = studentResumeHistoryKey(email);
        const history = readJSON(historyKey, []);
        if (history && history.length > 0) {
          return history;
        }
        // One-time migration from old format
        const legacy = readJSON('studentResumeHistory', []);
        if (legacy && legacy.length > 0) {
          writeJSON(historyKey, legacy);
          return legacy;
        }
        return [];
      }
      // Fallback to old format for backward compatibility
      return readJSON('studentResumeHistory', []);
    }
    const res = await http.get("/api/student/resume/history");
    return res.json();
  },
  async saveResumeHistory(history, email) {
    if (USE_MOCK) {
      if (!email) {
        const authState = readJSON(STORAGE_KEYS.AUTH);
        email = authState?.email || null;
      }
      if (email) {
        const historyKey = studentResumeHistoryKey(email);
        writeJSON(historyKey, history);
      } else {
        // Fallback to old format for backward compatibility
        writeJSON('studentResumeHistory', history);
      }
      return history;
    }
    const res = await http.put("/api/student/resume/history", history);
    return res.json();
  },
  async hasResume(email) {
    if (USE_MOCK) {
      if (!email) {
        const authState = readJSON(STORAGE_KEYS.AUTH);
        email = authState?.email || null;
      }
      const testAccounts = ['test@stu.com', 'test@hr.com'];
      const isTestAccount = email && testAccounts.includes(email);
      
      if (email) {
        const hasResumeKey = studentHasResumeKey(email);
        const resumeKey = studentResumeKey(email);
        const legacyResume = readJSON('studentResume', null);
        const legacyHasResume = readJSON('hasResume') === 'true';
        const existingResume = readJSON(resumeKey, null);

        if (!existingResume && legacyResume) {
          writeJSON(resumeKey, legacyResume);
        }
        if (legacyHasResume && readJSON(hasResumeKey) !== 'true') {
          writeJSON(hasResumeKey, 'true');
        }

        const hasResumeFlag = readJSON(hasResumeKey) === 'true';
        const hasResumeFile = readJSON(resumeKey) !== null;
        return isTestAccount || hasResumeFlag || hasResumeFile;
      }
      
      // Fallback to old format for backward compatibility
      const hasResumeFlag = readJSON('hasResume') === 'true';
      const hasResumeFile = readJSON('studentResume') !== null;
      return isTestAccount || hasResumeFlag || hasResumeFile;
    }
    const res = await http.get("/api/student/resume/status");
    return res.json();
  }
};

