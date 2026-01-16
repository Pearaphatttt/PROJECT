import { USE_MOCK } from "../config/env";
import { readJSON, writeJSON } from "../utils/storage";
import { internshipService } from "./internshipService";
import { internshipsMock } from "../mocks/internships.mock";
import { STORAGE_KEYS } from "../config/storageKeys";
import http from "./http";

const USERS_KEY = STORAGE_KEYS.REGISTERED_USERS;

export const adminService = {
  async getStats() {
    if (USE_MOCK) {
      // Get registered users from localStorage
      const registeredUsers = readJSON(USERS_KEY, {});
      
      // Count users by role
      let totalStudents = 0;
      let totalCompanies = 0;
      let totalAdmins = 1; // Include demo admin
      
      Object.values(registeredUsers).forEach((user) => {
        // Only count active users
        if (user.status === 'deleted') return;
        
        if (user.role === 'student') {
          totalStudents++;
        } else if (user.role === 'company') {
          totalCompanies++;
        } else if (user.role === 'admin') {
          totalAdmins++;
        }
      });
      
      // Add test accounts
      totalStudents += 1; // test@stu.com
      totalCompanies += 1; // test@hr.com
      
      const totalUsers = totalStudents + totalCompanies + totalAdmins;
      
      // Get internships count from internshipService
      const internships = await internshipService.getAllMatches();
      const totalInternships = internships.length;
      
      // Get applications count from studentStore state (if available)
      const studentAppState = readJSON(STORAGE_KEYS.STUDENT_APP_STATE, {});
      const appliedIds = studentAppState.appliedInternshipIds || [];
      const totalApplications = Array.isArray(appliedIds) ? appliedIds.length : 0;
      
      return {
        totalUsers,
        totalStudents,
        totalCompanies,
        totalAdmins,
        totalInternships,
        totalApplications,
      };
    }
    
    // API calls for production
    const res = await http.get("/api/admin/stats");
    return res.json();
  },
  
  async getAllUsers() {
    if (USE_MOCK) {
      const registeredUsers = readJSON(USERS_KEY, {});
      const users = [];
      
      // Add test accounts (always active)
      users.push({
        email: 'test@stu.com',
        role: 'student',
        registeredAt: new Date().toISOString(),
        status: 'active',
      });
      users.push({
        email: 'test@hr.com',
        role: 'company',
        registeredAt: new Date().toISOString(),
        status: 'active',
      });
      
      // Add demo admin (always active, cannot be deleted)
      users.push({
        email: 'admin',
        role: 'admin',
        registeredAt: new Date().toISOString(),
        status: 'active',
        isDemo: true,
      });
      
      // Add registered users
      Object.entries(registeredUsers).forEach(([email, userData]) => {
        users.push({
          email,
          role: userData.role,
          registeredAt: userData.registeredAt || new Date().toISOString(),
          status: userData.status || 'active',
          deletedAt: userData.deletedAt || null,
        });
      });
      
      return users;
    }
    
    const res = await http.get("/api/admin/users");
    return res.json();
  },
  
  async deleteUser(email) {
    if (USE_MOCK) {
      // Prevent deleting demo admin
      if (email === 'admin') {
        return { success: false, error: 'Cannot delete demo admin account' };
      }
      
      // Prevent deleting test accounts (they're hardcoded)
      if (email === 'test@stu.com' || email === 'test@hr.com') {
        return { success: false, error: 'Cannot delete test accounts' };
      }
      
      const registeredUsers = readJSON(USERS_KEY, {});
      
      if (!registeredUsers[email]) {
        return { success: false, error: 'User not found' };
      }
      
      // Soft delete
      registeredUsers[email] = {
        ...registeredUsers[email],
        status: 'deleted',
        deletedAt: new Date().toISOString(),
      };
      
      writeJSON(USERS_KEY, registeredUsers);
      return { success: true };
    }
    
    const res = await http.delete(`/api/admin/users/${email}`);
    return res.json();
  },
  
  async restoreUser(email) {
    if (USE_MOCK) {
      const registeredUsers = readJSON(USERS_KEY, {});
      
      if (!registeredUsers[email]) {
        return { success: false, error: 'User not found' };
      }
      
      // Restore user
      const { deletedAt, ...rest } = registeredUsers[email];
      registeredUsers[email] = {
        ...rest,
        status: 'active',
      };
      
      writeJSON(USERS_KEY, registeredUsers);
      return { success: true };
    }
    
    const res = await http.post(`/api/admin/users/${email}/restore`);
    return res.json();
  },
  
  async getAllInternships() {
    if (USE_MOCK) {
      // Admin should see all internships regardless of status
      let internships = readJSON(STORAGE_KEYS.INTERNSHIPS, []);
      
      if (internships.length === 0) {
        // Seed from mock if empty
        internships = internshipsMock.map((item) => ({
          ...item,
          status: item.status || 'active',
          createdAt: item.createdAt || new Date().toISOString(),
        }));
        writeJSON(STORAGE_KEYS.INTERNSHIPS, internships);
      }
      
      return internships;
    }
    
    const res = await http.get("/api/admin/internships");
    return res.json();
  },
  
  async updateInternshipStatus(id, status) {
    if (USE_MOCK) {
      const internships = readJSON(STORAGE_KEYS.INTERNSHIPS, []);
      const index = internships.findIndex((item) => item.id === id);
      
      if (index === -1) {
        return { success: false, error: 'Internship not found' };
      }
      
      internships[index] = {
        ...internships[index],
        status: status,
        updatedAt: new Date().toISOString(),
      };
      
      writeJSON(STORAGE_KEYS.INTERNSHIPS, internships);
      return { success: true, internship: internships[index] };
    }
    
    const res = await http.put(`/api/admin/internships/${id}/status`, { status });
    return res.json();
  },
  
  async deleteInternship(id) {
    if (USE_MOCK) {
      const internships = readJSON(STORAGE_KEYS.INTERNSHIPS, []);
      const filtered = internships.filter((item) => item.id !== id);
      
      if (filtered.length === internships.length) {
        return { success: false, error: 'Internship not found' };
      }
      
      writeJSON(STORAGE_KEYS.INTERNSHIPS, filtered);
      return { success: true };
    }
    
    const res = await http.delete(`/api/admin/internships/${id}`);
    return res.json();
  },
};
