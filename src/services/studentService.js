import { USE_MOCK } from "../config/env";
import { studentMock } from "../mocks/student.mock";
import http from "./http";

export const studentService = {
  async getMe() {
    if (USE_MOCK) {
      // Get email from auth state to check if it's a test account
      const authState = localStorage.getItem('auth');
      const email = authState ? JSON.parse(authState).email : null;
      
      // Test accounts should use mock data
      const testAccounts = ['test@stu.com', 'test@hr.com'];
      if (email && testAccounts.includes(email)) {
        return studentMock;
      }
      
      // For registered users, try to get profile data from localStorage
      const storedProfile = localStorage.getItem('studentProfile');
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile);
          
          // Merge profile data with email
          return {
            fullName: profile.fullName || 'Student',
            email: email || profile.email || 'student@demo.com',
            phone: profile.phone || '',
            skills: profile.skills || [],
            educationLevel: profile.educationLevel || '',
            fieldOfStudy: profile.fieldOfStudy || '',
            institution: profile.institution || '',
            province: profile.province || '',
          };
        } catch (e) {
          console.error('Failed to parse student profile:', e);
        }
      }
      // Fallback to mock data if no profile found
      return studentMock;
    }
    const res = await http.get("/api/student/me");
    return res.json();
  },
  async getSummary() {
    if (USE_MOCK) {
      // Get email from auth state to check if it's a test account
      const authState = localStorage.getItem('auth');
      const email = authState ? JSON.parse(authState).email : null;
      
      // Test accounts should use mock summary
      const testAccounts = ['test@stu.com', 'test@hr.com'];
      if (email && testAccounts.includes(email)) {
        return studentMock.summary;
      }
      
      // For registered users, try to get summary from localStorage or use default
      const storedProfile = localStorage.getItem('studentProfile');
      if (storedProfile) {
        // Return default summary for now
        return { matches: 0, applications: 0, interviews: 0 };
      }
      return studentMock.summary;
    }
    const res = await http.get("/api/student/summary");
    return res.json();
  }
};

