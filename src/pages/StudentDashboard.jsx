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
  const {
    appliedInternshipIds,
    matchedInternshipIds,
    applyToInternship,
    withdrawFromInternship,
  } = useStudentStore();
  const [me, setMe] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const hasRes = await studentService.hasResume(email);
        setHasResume(hasRes);

        const [meData, summaryData] = await Promise.all([
          studentService.getMe(),
          studentService.getSummary(),
        ]);
        setMe(meData);
        setSummary(summaryData);
        
        if (hasRes) {
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

  const applicationsCount = appliedInternshipIds.size;
  const matchesCount = matchedInternshipIds.size;
  const interviewsCount = summary?.interviews || 0;

  return (
    <div className="w-full py-6 px-4">
        {/* Welcome Title */}
        <h2 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: '#2C3E5B' }}>
          Welcome, {me?.fullName || 'Student'}!
        </h2>

        {/* Summary Cards - ปรับ Grid ให้รองรับมือถือ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Matches', count: matchesCount },
            { label: 'Applications', count: applicationsCount },
            { label: 'Interviews', count: interviewsCount }
          ].map((item, idx) => (
            <div key={idx} className="rounded-xl p-5" style={{ background: '#F5F7FB', border: '1px solid #D6DEE9', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)' }}>
              <div className="text-sm sm:text-base mb-2" style={{ color: '#6B7C93' }}>{item.label}</div>
              <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#2C3E5B' }}>{item.count}</div>
            </div>
          ))}
        </div>

        {!hasResume ? (
          <div className="rounded-xl p-6 text-center mb-6" style={{ background: '#F5F7FB', border: '1px solid #D6DEE9' }}>
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#E0F2FE' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#3F6FA6' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-3" style={{ color: '#2C3E5B' }}>Resume Required</h3>
              <p className="text-sm mb-6" style={{ color: '#6B7C93' }}>กรุณาอัปโหลด Resume ก่อนเพื่อให้ระบบแนะนำงานที่เหมาะสมกับคุณ</p>
              <ActionButton onClick={() => navigate('/student/profile/documents')}>Upload Resume</ActionButton>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg sm:text-xl font-semibold" style={{ color: '#2C3E5B' }}>Recommended Internships</h3>
              <ActionButton onClick={() => navigate('/student/matching')} style={{ background: '#6B7C93' }} className="w-full sm:w-auto flex justify-center">
                <Search size={18} className="mr-2" /> See all matches
              </ActionButton>
            </div>
            
            <div className="grid gap-4">
              {recommended.length === 0 ? (
                <div className="text-center py-8" style={{ color: '#6B7C93' }}>No recommended internships.</div>
              ) : (
                recommended.map((internship) => {
                  if (!internship) return null;
                  const isApplied = appliedInternshipIds.has(internship.id);
                  return (
                    <div key={internship.id} className="w-full rounded-2xl border border-slate-200 bg-white/70 shadow-sm p-4 sm:p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl text-white flex items-center justify-center flex-none font-semibold text-lg" style={{ background: '#3F6FA6' }}>
                            {internship.company?.[0] || 'C'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug truncate">{internship.title || 'Untitled'}</h4>
                            <p className="text-sm text-slate-600 truncate">{internship.company || 'Unknown Company'}</p>
                            <p className="text-xs sm:text-sm text-slate-500">{internship.location || 'Unknown Location'}</p>
                          </div>
                        </div>

                        {/* Responsive Score & Buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                          <div className="text-sm text-slate-600 whitespace-nowrap">
                            Match Score <span className="text-base font-semibold text-slate-900">{internship.matchScore || 0}%</span>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <ActionButton onClick={() => navigate(`/student/internships/${internship.id}`)} className="flex-1 sm:flex-none px-4 py-2" style={{ background: '#6B7C93' }}><Eye size={18} /> View</ActionButton>
                            <ActionButton onClick={() => handleApply(internship.id)} className="flex-1 sm:flex-none px-6 py-2" style={{ background: isApplied ? '#10B981' : '#3F6FA6' }}>{isApplied ? 'Applied' : 'Apply'}</ActionButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default StudentDashboard;