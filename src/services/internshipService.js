import { USE_MOCK } from "../config/env";
import { internshipsMock } from "../mocks/internships.mock";
import { readJSON, writeJSON } from "../utils/storage";
import { STORAGE_KEYS } from "../config/storageKeys";
import { applicationService } from "./applicationService";
import { notificationService } from "./notificationService";
import http from "./http";

// Helper to seed internships from mock data
const seedInternships = () => {
  const existing = readJSON(STORAGE_KEYS.INTERNSHIPS, []);
  if (existing.length > 0) return existing;
  
  // Transform mock data to standardized format
  const seeded = internshipsMock.map((item) => ({
    id: item.id,
    companyEmail: item.companyEmail || 'test@hr.com',
    companyName: item.company || 'Demo Company',
    title: item.title,
    category: item.category || 'Software',
    workMode: item.mode === 'Hybrid' ? 'Hybrid' : item.mode === 'Remote' ? 'Remote' : 'On-site',
    province: item.province || item.location || 'Bangkok',
    locationText: item.location || item.province || 'Bangkok',
    mustSkills: item.extractedJD?.skills?.slice(0, 3) || item.matchedSkills?.slice(0, 3) || [],
    niceSkills: item.extractedJD?.skills?.slice(3) || [],
    responsibilities: item.extractedJD?.responsibilities || [],
    rawJdText: item.rawJD || '',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Keep legacy fields for backward compatibility
    company: item.company,
    location: item.location,
    mode: item.mode,
    distanceKm: item.distanceKm,
    matchScore: item.matchScore,
  }));
  
  writeJSON(STORAGE_KEYS.INTERNSHIPS, seeded);
  return seeded;
};

// Helper to normalize internship data
const normalizeInternship = (data) => {
  return {
    id: data.id || `int-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    companyEmail: data.companyEmail || '',
    companyName: data.companyName || data.company || '',
    title: data.title || '',
    category: data.category || 'Software',
    workMode: data.workMode || data.mode || 'On-site',
    province: data.province || 'Bangkok',
    locationText: data.locationText || data.location || data.province || 'Bangkok',
    mustSkills: Array.isArray(data.mustSkills) ? data.mustSkills : [],
    niceSkills: Array.isArray(data.niceSkills) ? data.niceSkills : [],
    responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
    rawJdText: data.rawJdText || data.rawJD || '',
    status: data.status || 'active',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const internshipService = {
  // Seed internships if empty (called internally)
  _ensureSeeded() {
    if (USE_MOCK) {
      seedInternships();
    }
  },

  // Get all internships (excluding archived)
  async getAll() {
    if (USE_MOCK) {
      this._ensureSeeded();
      const internships = readJSON(STORAGE_KEYS.INTERNSHIPS, []);
      return internships.filter((item) => item.status !== 'archived');
    }
    const res = await http.get("/api/internships");
    return res.json();
  },

  // Get active internships only
  async getActive() {
    if (USE_MOCK) {
      this._ensureSeeded();
      const internships = readJSON(STORAGE_KEYS.INTERNSHIPS, []);
      return internships.filter((item) => item.status === 'active');
    }
    const res = await http.get("/api/internships?status=active");
    return res.json();
  },

  // Create new internship
  async create(payload, companyContext) {
    if (USE_MOCK) {
      this._ensureSeeded();
      const internships = readJSON(STORAGE_KEYS.INTERNSHIPS, []);
      
      const newInternship = normalizeInternship({
        ...payload,
        companyEmail: companyContext?.email || payload.companyEmail || 'test@hr.com',
        companyName: companyContext?.hrName || companyContext?.companyName || payload.companyName || 'Demo Company',
        status: 'active',
      });
      
      internships.push(newInternship);
      writeJSON(STORAGE_KEYS.INTERNSHIPS, internships);
      return newInternship;
    }
    const res = await http.post("/api/internships", payload);
    return res.json();
  },

  // Update internship
  async update(id, payload) {
    if (USE_MOCK) {
      this._ensureSeeded();
      const internships = readJSON(STORAGE_KEYS.INTERNSHIPS, []);
      const index = internships.findIndex((item) => item.id === id);
      
      if (index === -1) {
        throw new Error('Internship not found');
      }
      
      const existing = internships[index];
      const updated = normalizeInternship({
        ...existing,
        ...payload,
        id: existing.id, // Preserve ID
        createdAt: existing.createdAt, // Preserve creation date
        updatedAt: new Date().toISOString(),
      });
      
      internships[index] = updated;
      writeJSON(STORAGE_KEYS.INTERNSHIPS, internships);
      return updated;
    }
    const res = await http.put(`/api/internships/${id}`, payload);
    return res.json();
  },

  // Update status only
  async updateStatus(id, status) {
    if (USE_MOCK) {
      this._ensureSeeded();
      const internships = readJSON(STORAGE_KEYS.INTERNSHIPS, []);
      const index = internships.findIndex((item) => item.id === id);
      
      if (index === -1) {
        throw new Error('Internship not found');
      }
      
      internships[index] = {
        ...internships[index],
        status: status,
        updatedAt: new Date().toISOString(),
      };
      
      writeJSON(STORAGE_KEYS.INTERNSHIPS, internships);
      return internships[index];
    }
    const res = await http.put(`/api/internships/${id}/status`, { status });
    return res.json();
  },

  // Remove internship (soft delete: archive)
  async remove(id) {
    if (USE_MOCK) {
      return this.updateStatus(id, 'archived');
    }
    const res = await http.delete(`/api/internships/${id}`);
    return res.json();
  },
  async getRecommended() {
    if (USE_MOCK) {
      const active = await this.getActive();
      // Sort by matchScore if available, otherwise by createdAt (newest first)
      const sorted = active.sort((a, b) => {
        if (a.matchScore && b.matchScore) {
          return b.matchScore - a.matchScore;
        }
        if (a.matchScore) return -1;
        if (b.matchScore) return 1;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
      return sorted.slice(0, 5);
    }
    const res = await http.get("/api/internships/recommended");
    return res.json();
  },

  async getAllMatches(filters = {}, sort = "matchScore") {
    if (USE_MOCK) {
      this._ensureSeeded();
      let internships = readJSON(STORAGE_KEYS.INTERNSHIPS, []);
      
      // Filter by status (for student views, only show active by default)
      if (filters.status) {
        internships = internships.filter((item) => item.status === filters.status);
      } else if (filters.hideInactive !== false) {
        // Default: hide paused/archived for student views
        internships = internships.filter((item) => !item.status || item.status === 'active');
      }

      // Filter by distance
      if (filters.distance) {
        if (filters.distance === "0-5") {
          internships = internships.filter((item) => (item.distanceKm || 0) <= 5);
        } else if (filters.distance === "5-15") {
          internships = internships.filter((item) => {
            const dist = item.distanceKm || 0;
            return dist > 5 && dist <= 15;
          });
        } else if (filters.distance === "15-30") {
          internships = internships.filter((item) => {
            const dist = item.distanceKm || 0;
            return dist > 15 && dist <= 30;
          });
        }
      }

      // Filter by category
      if (filters.category) {
        internships = internships.filter((item) => item.category === filters.category);
      }

      // Filter by mode/workMode
      if (filters.mode) {
        internships = internships.filter((item) => {
          const mode = item.workMode || item.mode;
          return mode === filters.mode;
        });
      }

      // Sort
      if (sort === "matchScore") {
        internships.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      } else if (sort === "distance") {
        internships.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
      } else if (sort === "newest") {
        internships.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      }

      return internships;
    }
    const res = await http.get("/api/internships/matches", { params: { filters, sort } });
    return res.json();
  },

  async getById(id) {
    if (USE_MOCK) {
      this._ensureSeeded();
      const internships = readJSON(STORAGE_KEYS.INTERNSHIPS, []);
      return internships.find((item) => item.id === id) || null;
    }
    const res = await http.get(`/api/internships/${id}`);
    return res.json();
  },

  // Get internships by company email
  async getByCompany(companyEmail) {
    if (USE_MOCK) {
      this._ensureSeeded();
      const internships = readJSON(STORAGE_KEYS.INTERNSHIPS, []);
      return internships.filter((item) => item.companyEmail === companyEmail);
    }
    const res = await http.get(`/api/internships?companyEmail=${companyEmail}`);
    return res.json();
  },

  async apply(id) {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // Get current user email from auth
      const authState = readJSON(STORAGE_KEYS.AUTH, {});
      const studentEmail = authState?.email;
      
      if (!studentEmail) {
        return { success: false, error: 'Not logged in' };
      }
      
      // Get internship
      const internship = await this.getById(id);
      if (!internship) {
        return { success: false, error: 'Internship not found' };
      }
      
      const companyEmail = internship.companyEmail || internship.company?.email || '';
      const companyName = internship.companyName || internship.company || 'Company';
      
      // Create application record
      await applicationService.setStatus(studentEmail, id, 'applied', companyEmail);
      
      // Push notification to company via notificationService (persistent)
      if (companyEmail) {
        await notificationService.pushNotification('company', companyEmail, {
          id: `noti_${Date.now()}_${id}`,
          type: 'apply',
          title: 'New application',
          message: `${studentEmail} applied for ${internship.title}`,
          internshipId: id,
          actionUrl: `/company/candidates?internshipId=${id}`,
          createdAt: Date.now(),
          readAt: null,
        });
      } else {
        console.error('Missing companyEmail for application notification', {
          internshipId: id,
          studentEmail,
        });
      }
      
      // Also dispatch event for real-time updates (optional, not source of truth)
      window.dispatchEvent(new CustomEvent('companyNotification', {
        detail: {
          id: `notif-${Date.now()}-${id}`,
          type: 'application',
          title: 'New Application Received',
          message: `A student has applied for your internship: ${internship.title}`,
          timestamp: new Date().toISOString(),
          read: false,
          internshipId: id,
          companyEmail: companyEmail,
        }
      }));
      
      return { success: true };
    }
    const res = await http.post(`/api/internships/${id}/apply`);
    return res.json();
  },

  async withdraw(id) {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true };
    }
    const res = await http.post(`/api/internships/${id}/withdraw`);
    return res.json();
  },

  async save(id) {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true };
    }
    const res = await http.post(`/api/internships/${id}/save`);
    return res.json();
  },

  async unsave(id) {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true };
    }
    const res = await http.post(`/api/internships/${id}/unsave`);
    return res.json();
  },

  async skip(id) {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true };
    }
    const res = await http.post(`/api/internships/${id}/skip`);
    return res.json();
  },

  async simulateHrAccept(id) {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { success: true };
    }
    return { success: false, error: "This method is only available in mock mode" };
  },
};

