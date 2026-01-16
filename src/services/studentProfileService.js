import { USE_MOCK } from "../config/env";
import { readJSON } from "../utils/storage";
import { STORAGE_KEYS } from "../config/storageKeys";
import { studentMock } from "../mocks/student.mock";
import http from "./http";

export const studentProfileService = {
  // Get all active student accounts
  async getAllStudents() {
    if (USE_MOCK) {
      const registeredUsers = readJSON(STORAGE_KEYS.REGISTERED_USERS, {});
      const students = [];
      
      // Add test student account
      students.push({
        email: 'test@stu.com',
        fullName: studentMock.fullName || 'Test Student',
        province: studentMock.province || 'Bangkok',
        skills: studentMock.skills || [],
      });
      
      // Add registered students
      Object.entries(registeredUsers).forEach(([email, userData]) => {
        if (userData.role === 'student' && userData.status !== 'deleted') {
          const profileKey = `studentProfile_${email}`;
          const profile = readJSON(profileKey, {});
          
          students.push({
            email: email,
            fullName: profile.fullName || userData.fullName || 'Student',
            province: profile.province || 'Bangkok',
            skills: profile.skills || [],
          });
        }
      });
      
      return students;
    }
    const res = await http.get("/api/students");
    return res.json();
  },

  // Get student profile by email
  async getStudentProfileByEmail(email) {
    if (USE_MOCK) {
      if (!email) return null;
      
      // Check test account
      if (email === 'test@stu.com') {
        return {
          email: email,
          fullName: studentMock.fullName || 'Test Student',
          province: studentMock.province || 'Bangkok',
          skills: studentMock.skills || [],
        };
      }
      
      // Check registered users
      const registeredUsers = readJSON(STORAGE_KEYS.REGISTERED_USERS, {});
      const userData = registeredUsers[email];
      
      if (!userData || userData.role !== 'student' || userData.status === 'deleted') {
        return null;
      }
      
      // Get profile data
      const profileKey = `studentProfile_${email}`;
      const profile = readJSON(profileKey, {});
      
      return {
        email: email,
        fullName: profile.fullName || userData.fullName || 'Student',
        province: profile.province || 'Bangkok',
        skills: profile.skills || [],
      };
    }
    const res = await http.get(`/api/students/${email}`);
    return res.json();
  },
};
