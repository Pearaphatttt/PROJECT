// ============================================
// TEST DATABASE - Mock data for testing
// ============================================
// NOTE: This file is for testing purposes only
// Remove or comment out when deploying to production
// ============================================

// Test users for registration testing
export const testUsers = {
  // Test student accounts (can register with different names)
  students: [
    {
      email: 'teststudent1@test.com',
      password: 'Test123!',
      fullName: 'Test Student One',
      role: 'student',
    },
    {
      email: 'teststudent2@test.com',
      password: 'Test123!',
      fullName: 'Test Student Two',
      role: 'student',
    },
    {
      email: 'alice@test.com',
      password: 'Test123!',
      fullName: 'Alice Test',
      role: 'student',
    },
    {
      email: 'bob@test.com',
      password: 'Test123!',
      fullName: 'Bob Test',
      role: 'student',
    },
  ],
  // Test company accounts
  companies: [
    {
      email: 'testcompany1@test.com',
      password: 'Test123!',
      companyName: 'Test Company One',
      role: 'company',
    },
    {
      email: 'testcompany2@test.com',
      password: 'Test123!',
      companyName: 'Test Company Two',
      role: 'company',
    },
  ],
};

// Test resume data
export const testResumes = [
  {
    id: 'test-resume-1',
    filename: 'test-resume-1.pdf',
    uploadedAt: new Date().toISOString(),
    size: 102400,
  },
  {
    id: 'test-resume-2',
    filename: 'test-resume-2.pdf',
    uploadedAt: new Date().toISOString(),
    size: 204800,
  },
];

// Test profile data
export const testProfiles = {
  'teststudent1@test.com': {
    fullName: 'Test Student One',
    email: 'teststudent1@test.com',
    phone: '0812345678',
    skills: ['React', 'Node.js', 'JavaScript'],
    educationLevel: 'Bachelor',
    fieldOfStudy: 'Computer Science',
    institution: 'Test University',
    province: 'Bangkok',
  },
  'teststudent2@test.com': {
    fullName: 'Test Student Two',
    email: 'teststudent2@test.com',
    phone: '0823456789',
    skills: ['Python', 'Data Analysis'],
    educationLevel: 'Master',
    fieldOfStudy: 'Data Science',
    institution: 'Test University',
    province: 'Bangkok',
  },
};

// Helper function to initialize test data (for development/testing)
export const initTestData = () => {
  if (process.env.NODE_ENV === 'development' || import.meta.env.DEV) {
    console.log('🧪 Test database initialized');
    console.log('📝 Test users available:', testUsers);
    console.log('⚠️  Remember to remove test data before production!');
  }
};

// Export initialization
if (typeof window !== 'undefined') {
  // Only run in browser
  initTestData();
}

