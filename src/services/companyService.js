import { USE_MOCK } from "../config/env";
import { companyMock } from "../mocks/company.mock";
import http from "./http";
import { readJSON, writeJSON } from "../utils/storage";
import { STORAGE_KEYS } from "../config/storageKeys";

export const companyService = {
  async getMe() {
    if (USE_MOCK) {
      const authState = readJSON(STORAGE_KEYS.AUTH);
      const email = authState?.email || null;
      
      // For test accounts, return mock data
      const testAccounts = ['test@stu.com', 'test@hr.com'];
      if (email && testAccounts.includes(email)) {
        return companyMock;
      }
      
      // For registered users, merge with stored profile
      if (email) {
        const profileKey = `companyProfile_${email}`;
        const stored = readJSON(profileKey);
        if (stored) {
          return {
            ...companyMock,
            ...stored,
            email: email,
          };
        }
      }
      
      return companyMock;
    }
    const res = await http.get("/api/company/me");
    return res.json();
  },
  async getCandidateMatches() {
    if (USE_MOCK) return companyMock.candidateMatches;
    const res = await http.get("/api/company/candidates/matches");
    return res.json();
  },
  async saveProfile(email, profileData) {
    if (USE_MOCK) {
      const profileKey = `companyProfile_${email}`;
      const existing = readJSON(profileKey, {});
      const updated = { ...existing, ...profileData };
      writeJSON(profileKey, updated);
      return updated;
    }
    const res = await http.put("/api/company/profile", profileData);
    return res.json();
  },
  async getProfilePicture(email) {
    if (USE_MOCK) {
      const profileKey = `companyProfile_${email}`;
      const profile = readJSON(profileKey);
      return profile?.profilePicture || null;
    }
    const res = await http.get("/api/company/profile/picture");
    return res.json();
  }
};

