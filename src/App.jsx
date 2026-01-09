import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import RegisterRoleSelect from './pages/RegisterRoleSelect';
import StudentRegister from './pages/StudentRegister';
import CompanyRegister from './pages/CompanyRegister';
import StudentEditProfile from './pages/StudentEditProfile';
import CompanyEditInternship from './pages/CompanyEditInternship';
import StudentDashboard from './pages/StudentDashboard';
import StudentMatching from './pages/StudentMatching';
import StudentInternshipDetail from './pages/StudentInternshipDetail';
import StudentChat from './pages/StudentChat';
import StudentNotifications from './pages/StudentNotifications';
import StudentProfile from './pages/StudentProfile';
import StudentProfileDocuments from './pages/StudentProfileDocuments';
import StudentProfileSettings from './pages/StudentProfileSettings';
import CompanyDashboard from './pages/CompanyDashboard';
import CompanyProfile from './pages/CompanyProfile';
import CompanyEditProfile from './pages/CompanyEditProfile';
import Placeholder from './pages/Placeholder';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import StudentLayout from './components/StudentLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/forgot" element={<ForgotPassword />} />
        <Route path="/register" element={<RegisterRoleSelect />} />
        <Route path="/register/student" element={<StudentRegister />} />
        <Route path="/register/company" element={<CompanyRegister />} />
        
        {/* Student Routes with Layout */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout>
                <StudentDashboard />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/matching"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout>
                <StudentMatching />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/internships/:id"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout>
                <StudentInternshipDetail />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/chat"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout>
                <StudentChat />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/notifications"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout>
                <StudentNotifications />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout>
                <StudentProfile />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile/edit"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout>
                <StudentEditProfile />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile/documents"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout>
                <StudentProfileDocuments />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile/settings"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout>
                <StudentProfileSettings />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/company/dashboard"
          element={
            <ProtectedRoute requiredRole="company">
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/profile"
          element={
            <ProtectedRoute requiredRole="company">
              <CompanyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/profile/edit"
          element={
            <ProtectedRoute requiredRole="company">
              <CompanyEditProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/company/internship/edit" element={<CompanyEditInternship />} />
        <Route path="/placeholder" element={<Placeholder />} />
        <Route path="/" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

