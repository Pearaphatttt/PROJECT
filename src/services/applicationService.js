import { USE_MOCK } from "../config/env";
import { readJSON, writeJSON } from "../utils/storage";
import { STORAGE_KEYS } from "../config/storageKeys";
import http from "./http";

// Helper to get all applications
const getAllApplications = () => {
  return readJSON(STORAGE_KEYS.APPLICATIONS, []);
};

// Helper to save applications
const saveApplications = (applications) => {
  writeJSON(STORAGE_KEYS.APPLICATIONS, applications);
};

export const applicationService = {
  // Get applications by internship
  async getByInternship(internshipId) {
    if (USE_MOCK) {
      const applications = getAllApplications();
      return applications.filter((app) => app.internshipId === internshipId);
    }
    const res = await http.get(`/api/applications?internshipId=${internshipId}`);
    return res.json();
  },

  // Get applications by student
  async getByStudent(studentEmail) {
    if (USE_MOCK) {
      const applications = getAllApplications();
      return applications.filter((app) => app.studentEmail === studentEmail);
    }
    const res = await http.get(`/api/applications?studentEmail=${studentEmail}`);
    return res.json();
  },

  // Get application status for a student-internship pair
  async getStatus(studentEmail, internshipId) {
    if (USE_MOCK) {
      const applications = getAllApplications();
      const app = applications.find(
        (a) => a.studentEmail === studentEmail && a.internshipId === internshipId
      );
      return app ? app.status : null;
    }
    const res = await http.get(`/api/applications/${studentEmail}/${internshipId}`);
    return res.json();
  },

  // Set application status
  async setStatus(studentEmail, internshipId, status, companyEmail) {
    if (USE_MOCK) {
      const applications = getAllApplications();
      const existingIndex = applications.findIndex(
        (a) => a.studentEmail === studentEmail && a.internshipId === internshipId
      );

      const applicationData = {
        id: existingIndex >= 0 ? applications[existingIndex].id : `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentEmail,
        internshipId,
        companyEmail: companyEmail || null,
        status,
        createdAt: existingIndex >= 0 ? applications[existingIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        applications[existingIndex] = applicationData;
      } else {
        applications.push(applicationData);
      }

      saveApplications(applications);
      return applicationData;
    }
    const res = await http.post("/api/applications", {
      studentEmail,
      internshipId,
      status,
      companyEmail,
    });
    return res.json();
  },

  // Remove application
  async remove(studentEmail, internshipId) {
    if (USE_MOCK) {
      const applications = getAllApplications();
      const filtered = applications.filter(
        (a) => !(a.studentEmail === studentEmail && a.internshipId === internshipId)
      );
      saveApplications(filtered);
      return { success: true };
    }
    const res = await http.delete(`/api/applications/${studentEmail}/${internshipId}`);
    return res.json();
  },
};
