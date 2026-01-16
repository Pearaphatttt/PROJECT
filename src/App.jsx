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
import CompanyNotifications from './pages/CompanyNotifications';
import CompanyInternshipsList from './pages/CompanyInternshipsList';
import CompanyInternshipForm from './pages/CompanyInternshipForm';
import CompanyCandidates from './pages/CompanyCandidates';
import CompanyChat from './pages/CompanyChat';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminInternships from './pages/AdminInternships';
import Placeholder from './pages/Placeholder';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import StudentLayout from './components/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import CompanyLayout from './layouts/CompanyLayout';

function App() {
  return (
    <div className="w-full overflow-x-hidden">
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
              <CompanyLayout>
                <CompanyDashboard />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/internships"
          element={
            <ProtectedRoute requiredRole="company">
              <CompanyLayout>
                <CompanyInternshipsList />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/internships/new"
          element={
            <ProtectedRoute requiredRole="company">
              <CompanyLayout>
                <CompanyInternshipForm />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/internships/:id/edit"
          element={
            <ProtectedRoute requiredRole="company">
              <CompanyLayout>
                <CompanyInternshipForm />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/candidates"
          element={
            <ProtectedRoute requiredRole="company">
              <CompanyLayout>
                <CompanyCandidates />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/notifications"
          element={
            <ProtectedRoute requiredRole="company">
              <CompanyLayout>
                <CompanyNotifications />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/chat"
          element={
            <ProtectedRoute requiredRole="company">
              <CompanyLayout>
                <CompanyChat />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/profile"
          element={
            <ProtectedRoute requiredRole="company">
              <CompanyLayout>
                <CompanyProfile />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/profile/edit"
          element={
            <ProtectedRoute requiredRole="company">
              <CompanyLayout>
                <CompanyEditProfile />
              </CompanyLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/company/internship/edit" element={<CompanyEditInternship />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/internships"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <AdminInternships />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route path="/placeholder" element={<Placeholder />} />
        <Route path="/" element={<Navigate to="/auth" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

