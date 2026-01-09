import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { useStudentStore } from '../state/studentStore';
import { studentService } from '../services/studentService';
import { internshipService } from '../services/internshipService';
import ActionButton from '../components/ActionButton';
import { Eye, Search } from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { email } = useAuth();
  const { appliedInternshipIds, applyToInternship, withdrawFromInternship } = useStudentStore();
  const [me, setMe] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadData = async () => {
      try {
        // Get email from auth state
        const authState = localStorage.getItem('auth');
        const currentEmail = authState ? JSON.parse(authState).email : email;
        
        // Check if user has resume first
        const testAccounts = ['test@stu.com', 'test@hr.com'];
        const isTestAccount = testAccounts.includes(currentEmail);
        const hasResumeFromStorage = localStorage.getItem('hasResume') === 'true';
        const hasResumeFile = localStorage.getItem('studentResume') !== null;
        const hasResume = isTestAccount || hasResumeFromStorage || hasResumeFile;

        const [meData, summaryData] = await Promise.all([
          studentService.getMe(),
          studentService.getSummary(),
        ]);
        setMe(meData);
        setSummary(summaryData);
        
        // Only load recommended if user has resume
        if (hasResume) {
          const recommendedData = await internshipService.getRecommended();
          setRecommended(recommendedData || []);
        } else {
          setRecommended([]);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
      loadData();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [email]);

  const handleApply = async (internshipId) => {
    if (appliedInternshipIds.has(internshipId)) {
      await internshipService.withdraw(internshipId);
      withdrawFromInternship(internshipId);
    } else {
      await internshipService.apply(internshipId);
      applyToInternship(internshipId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div style={{ color: '#6B7C93' }}>Loading...</div>
      </div>
    );
  }

  const applicationsCount = summary ? summary.applications + appliedInternshipIds.size : appliedInternshipIds.size;
  
  // Check if user has resume
  // Test accounts (test@stu.com) should have resume by default
  // Get email from auth state to ensure it's current
  const authState = localStorage.getItem('auth');
  const currentEmail = authState ? JSON.parse(authState).email : email;
  const testAccounts = ['test@stu.com', 'test@hr.com'];
  const isTestAccount = testAccounts.includes(currentEmail);
  const hasResume = isTestAccount || 
    localStorage.getItem('hasResume') === 'true' || 
    localStorage.getItem('studentResume') !== null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-6">

        {/* Welcome Title */}
        <h2
          className="text-2xl sm:text-3xl font-bold mb-6"
          style={{ color: '#2C3E5B' }}
        >
          Welcome, {me?.fullName || 'Student'}!
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div
            className="rounded-xl p-6"
            style={{
              background: '#F5F7FB',
              border: '1px solid #D6DEE9',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            }}
          >
            <div className="text-sm mb-2" style={{ color: '#6B7C93' }}>Matches</div>
            <div className="text-3xl font-bold" style={{ color: '#2C3E5B' }}>
              {summary?.matches || 0}
            </div>
          </div>
          <div
            className="rounded-xl p-6"
            style={{
              background: '#F5F7FB',
              border: '1px solid #D6DEE9',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            }}
          >
            <div className="text-sm mb-2" style={{ color: '#6B7C93' }}>Applications</div>
            <div className="text-3xl font-bold" style={{ color: '#2C3E5B' }}>
              {applicationsCount}
            </div>
          </div>
          <div
            className="rounded-xl p-6"
            style={{
              background: '#F5F7FB',
              border: '1px solid #D6DEE9',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            }}
          >
            <div className="text-sm mb-2" style={{ color: '#6B7C93' }}>Interviews</div>
            <div className="text-3xl font-bold" style={{ color: '#2C3E5B' }}>
              {summary?.interviews || 0}
            </div>
          </div>
        </div>

        {/* Recommended Internships or Resume Required Message */}
        {!hasResume ? (
          <div
            className="rounded-xl p-8 sm:p-12 text-center mb-6"
            style={{
              background: '#F5F7FB',
              border: '1px solid #D6DEE9',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            }}
          >
            <div className="max-w-md mx-auto">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: '#E0F2FE' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: '#3F6FA6' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#2C3E5B' }}>
                Resume Required
              </h3>
              <p className="text-sm mb-6" style={{ color: '#6B7C93' }}>
                กรุณาอัปโหลด Resume ก่อนเพื่อให้ระบบสามารถวิเคราะห์และแนะนำตำแหน่งงานที่เหมาะสมกับคุณได้
              </p>
              <ActionButton
                onClick={() => navigate('/student/profile/documents')}
                style={{ padding: '0 20px' }}
              >
                Upload Resume
              </ActionButton>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-semibold" style={{ color: '#2C3E5B' }}>
                Recommended Internships
              </h3>
              <ActionButton
                onClick={() => navigate('/student/matching')}
                style={{ background: '#6B7C93', padding: '0 18px' }}
              >
                <Search size={18} />
                See all matches
              </ActionButton>
            </div>
            <div className="space-y-4">
              {recommended.length === 0 ? (
                <div className="text-center py-8" style={{ color: '#6B7C93' }}>
                  No recommended internships at the moment.
                </div>
              ) : (
              recommended.map((internship) => {
                if (!internship) {
                  return null;
                }
                const isApplied = appliedInternshipIds.has(internship.id);
                return (
                  <div
                    key={internship.id || Math.random()}
                    className="rounded-xl p-4 sm:p-6"
                    style={{
                      background: '#F5F7FB',
                      border: '1px solid #D6DEE9',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0"
                          style={{ background: '#3F6FA6' }}
                        >
                          {internship.company?.[0] || 'C'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold mb-1" style={{ color: '#2C3E5B' }}>
                            {internship.title || 'Untitled'}
                          </h4>
                          <p className="text-sm mb-1" style={{ color: '#6B7C93' }}>
                            {internship.company || 'Unknown Company'}
                          </p>
                          <p className="text-xs" style={{ color: '#6B7C93' }}>
                            {internship.location || 'Unknown Location'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs mb-1" style={{ color: '#6B7C93' }}>
                              Match Score
                            </div>
                            <div
                              className="text-lg font-bold"
                              style={{ color: '#3F6FA6' }}
                            >
                              {internship.matchScore || 0}%
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <ActionButton
                              onClick={() => navigate(`/student/internships/${internship.id}`)}
                              className="w-full sm:w-auto"
                              style={{ background: '#6B7C93', padding: '0 18px' }}
                            >
                              <Eye size={18} />
                              View Details
                            </ActionButton>
                            <ActionButton
                              onClick={() => handleApply(internship.id)}
                              className="w-full sm:w-auto"
                              style={{
                                background: isApplied ? '#10B981' : '#3F6FA6',
                                padding: '0 20px',
                                minWidth: '100px',
                              }}
                            >
                              {isApplied ? 'Applied' : 'Apply'}
                            </ActionButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }).filter(Boolean)
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default StudentDashboard;

