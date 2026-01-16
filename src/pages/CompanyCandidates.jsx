import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { internshipService } from '../services/internshipService';
import { matchingService } from '../services/matchingService';
import { applicationService } from '../services/applicationService';
import { notificationService } from '../services/notificationService';
import { chatService } from '../services/chatService';
import { studentProfileService } from '../services/studentProfileService';
import ActionButton from '../components/ActionButton';
import { User, CheckCircle, XCircle, Star, Eye, ArrowLeft, MessageSquare } from 'lucide-react';

const CompanyCandidates = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { email: companyEmail } = useAuth();
  
  const [internships, setInternships] = useState([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewProfile, setViewProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('candidates'); // 'candidates' or 'applicants'

  useEffect(() => {
    loadInternships();
  }, [companyEmail]);

  useEffect(() => {
    if (internships.length > 0) {
      const internshipParam = searchParams.get('internship') || searchParams.get('internshipId');
      const tabParam = searchParams.get('tab');
      
      if (tabParam === 'applicants') {
        setActiveTab('applicants');
      }
      
      if (internshipParam && internships.some((i) => i.id === internshipParam)) {
        setSelectedInternshipId(internshipParam);
      } else if (!selectedInternshipId) {
        setSelectedInternshipId(internships[0].id);
      }
    }
  }, [internships, searchParams]);

  useEffect(() => {
    if (selectedInternshipId) {
      loadCandidates();
      loadApplicants();
    }
  }, [selectedInternshipId]);

  useEffect(() => {
    const studentParam = searchParams.get('student');
    if (studentParam && (applicants.length > 0 || candidates.length > 0) && !viewProfile) {
      let found = applicants.find((a) => a.email === studentParam || a.studentEmail === studentParam);
      if (!found) {
        found = candidates.find((c) => c.email === studentParam || c.studentEmail === studentParam);
      }
      if (found) {
        setViewProfile(found);
      }
    }
  }, [searchParams, applicants, candidates, viewProfile]);

  const handleCloseModal = () => {
    setViewProfile(null);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('student');
    const newUrl = newParams.toString() ? `/company/candidates?${newParams.toString()}` : '/company/candidates';
    navigate(newUrl, { replace: true });
  };

  const loadInternships = async () => {
    try {
      const data = await internshipService.getByCompany(companyEmail);
      const filtered = data.filter((i) => i.status !== 'archived');
      setInternships(filtered);
      
      const internshipParam = searchParams.get('internship') || searchParams.get('internshipId');
      if (internshipParam && filtered.some((i) => i.id === internshipParam)) {
        setSelectedInternshipId(internshipParam);
      } else if (filtered.length > 0 && !selectedInternshipId) {
        setSelectedInternshipId(filtered[0].id);
      }
    } catch (error) {
      console.error('Failed to load internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async () => {
    if (!selectedInternshipId) return;
    try {
      const candidatesData = await matchingService.getCandidatesForInternship(selectedInternshipId, {
        minScore: 0,
        sort: 'score',
      });
      
      const applications = await applicationService.getByInternship(selectedInternshipId);
      const candidatesWithStatus = candidatesData.map((candidate) => {
        const app = applications.find((a) => a.studentEmail === candidate.email);
        return {
          ...candidate,
          applicationStatus: app ? app.status : null,
        };
      });
      
      setCandidates(candidatesWithStatus);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    }
  };

  const loadApplicants = async () => {
    if (!selectedInternshipId) return;
    try {
      const applications = await applicationService.getByInternship(selectedInternshipId);
      const applied = applications.filter((app) => app.status === 'applied');
      
      const applicantsData = await Promise.all(
        applied.map(async (app) => {
          const profile = await studentProfileService.getStudentProfileByEmail(app.studentEmail);
          if (!profile) return null;
          
          const internship = await internshipService.getById(selectedInternshipId);
          const scoreData = matchingService.computeScore(profile, internship);
          
          return {
            ...profile,
            matchScore: scoreData.totalScore,
            matchedSkills: scoreData.matchedSkills,
            applicationStatus: app.status,
          };
        })
      );
      
      setApplicants(applicantsData.filter((a) => a !== null));
    } catch (error) {
      console.error('Failed to load applicants:', error);
    }
  };

  const handleStatusChange = async (studentEmail, newStatus, currentStatus) => {
    try {
      if (newStatus === currentStatus) return;
      if (newStatus === 'matched' && (currentStatus === 'matched' || currentStatus === 'accepted')) return;
      
      const internship = await internshipService.getById(selectedInternshipId);
      await applicationService.setStatus(studentEmail, selectedInternshipId, newStatus, companyEmail);
      
      let notificationTitle = '';
      let notificationMessage = '';
      let threadId = null;
      
      if (newStatus === 'shortlisted') {
        notificationTitle = 'Application Shortlisted';
        notificationMessage = `You have been shortlisted for ${internship.title} at ${internship.companyName || 'the company'}`;
      } else if (newStatus === 'rejected') {
        notificationTitle = 'Application Update';
        notificationMessage = `Your application for ${internship.title} has been reviewed`;
      } else if (newStatus === 'matched') {
        const internshipTitle = internship?.title || '';
        const companyName = internship?.companyName || internship?.company || 'the company';
        notificationTitle = 'Matched!';
        notificationMessage = `You are matched with ${companyName} for ${internshipTitle}`;

        const thread = await chatService.getOrCreateThread({
          internshipId: selectedInternshipId,
          studentEmail,
          companyEmail,
          internshipTitle,
        });
        const enabledThread = await chatService.enableThread(thread?.id);
        threadId = enabledThread?.id || thread?.id || null;
      }
      
      if (notificationTitle) {
        await notificationService.pushNotification('student', studentEmail, {
          id: `noti_${Date.now()}_${selectedInternshipId}`,
          type: newStatus === 'matched' ? 'match' : 'apply',
          title: notificationTitle,
          message: notificationMessage,
          threadId: threadId || undefined,
          internshipId: selectedInternshipId,
          actionUrl: threadId ? `/student/chat?threadId=${threadId}` : undefined,
          createdAt: Date.now(),
          readAt: null,
        });
      }
      
      await loadCandidates();
      await loadApplicants();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      applied: { bg: '#DBEAFE', color: '#1E40AF', text: 'Applied' },
      shortlisted: { bg: '#FEF3C7', color: '#92400E', text: 'Shortlisted' },
      rejected: { bg: '#FEE2E2', color: '#991B1B', text: 'Rejected' },
      matched: { bg: '#D1FAE5', color: '#065F46', text: 'Matched' },
      accepted: { bg: '#D1FAE5', color: '#065F46', text: 'Accepted' },
    };
    const style = styles[status] || styles.applied;
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: style.bg, color: style.color }}>
        {style.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#E9EEF5' }}>
        <div className="text-center" style={{ color: '#6B7C93' }}>Loading...</div>
      </div>
    );
  }

  const selectedInternship = internships.find((i) => i.id === selectedInternshipId);
  const displayList = activeTab === 'candidates' ? candidates : applicants;

  return (
    <div className="w-full py-6">
      <div className="w-full">
        <button
          onClick={() => navigate('/company/dashboard')}
          className="flex items-center gap-2 mb-6 text-sm"
          style={{ color: '#3F6FA6' }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
        
        <h1 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: '#2C3E5B' }}>
          Candidates & Applicants
        </h1>

        {internships.length === 0 && (
          <div className="rounded-xl p-12 text-center mb-6" style={{ background: '#F5F7FB', border: '1px solid #D6DEE9', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)' }}>
            <User size={48} className="mx-auto mb-4" style={{ color: '#CBD5E1' }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: '#2C3E5B' }}>No internships created yet.</h3>
            <ActionButton onClick={() => navigate('/company/internships/new')}>Create Internship</ActionButton>
          </div>
        )}

        {internships.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm font-semibold" style={{ color: '#2C3E5B' }}>Select Internship</label>
              <select
                value={selectedInternshipId || ''}
                onChange={(e) => {
                  setSelectedInternshipId(e.target.value);
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('internship', e.target.value);
                  newParams.delete('student');
                  navigate(`/company/candidates?${newParams.toString()}`, { replace: true });
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border bg-white"
                style={{ borderColor: '#D6DEE9', color: '#2C3E5B' }}
              >
                {internships.map((internship) => (
                  <option key={internship.id} value={internship.id}>{internship.title}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {selectedInternship && (
          <>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center mb-6">
              <button
                onClick={() => {
                  setActiveTab('candidates');
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('tab', 'candidates');
                  newParams.delete('student');
                  navigate(`/company/candidates?${newParams.toString()}`, { replace: true });
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'candidates' ? 'text-white' : 'text-gray-600'}`}
                style={{ background: activeTab === 'candidates' ? '#3F6FA6' : '#F5F7FB' }}
              >
                Top Candidates ({candidates.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('applicants');
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('tab', 'applicants');
                  navigate(`/company/candidates?${newParams.toString()}`, { replace: true });
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'applicants' ? 'text-white' : 'text-gray-600'}`}
                style={{ background: activeTab === 'applicants' ? '#3F6FA6' : '#F5F7FB' }}
              >
                Applicants ({applicants.length})
              </button>
            </div>

            {displayList.length === 0 ? (
              <div className="rounded-xl p-12 text-center" style={{ background: '#F5F7FB', border: '1px solid #D6DEE9' }}>
                <p style={{ color: '#6B7C93' }}>{activeTab === 'candidates' ? 'No candidates found.' : 'No applicants yet.'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                {displayList.map((candidate) => (
                  <div key={candidate.email} className="rounded-xl p-6 bg-white border border-[#D6DEE9] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col 2xl:flex-row gap-6">
                      
                      {/* Left Side: Profile Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-none" style={{ background: '#3F6FA6' }}>
                          {candidate.fullName?.[0] || candidate.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-bold text-[#2C3E5B] text-lg leading-tight truncate max-w-[200px]" title={candidate.fullName || 'Student'}>
                              {candidate.fullName || 'Student'}
                            </h3>
                            {candidate.applicationStatus && getStatusBadge(candidate.applicationStatus)}
                          </div>
                          <p className="text-sm text-[#6B7C93] break-all mb-1">{candidate.email}</p>
                          <p className="text-sm text-[#6B7C93] mb-3">{candidate.province}</p>
                          {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {candidate.matchedSkills.map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 rounded bg-slate-100 text-xs text-slate-700">{skill}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side: Score & Actions */}
                      <div className="flex flex-col gap-3 flex-none 2xl:w-64">
                        <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between items-center">
                          <span>Match Score</span>
                          <span className="font-bold text-slate-900 text-base">{candidate.matchScore || '-'}%</span>
                        </div>

                        <div className="flex flex-col gap-2">
                          <ActionButton onClick={() => setViewProfile(candidate)} className="w-full justify-center" style={{ background: '#3F6FA6' }}>
                            <Eye size={16} className="mr-2" /> View Profile
                          </ActionButton>
                          
                          {candidate.applicationStatus === 'matched' || candidate.applicationStatus === 'accepted' ? (
                            <>
                              <div className="w-full flex items-center justify-center p-2 bg-[#D1FAE5] text-[#065F46] rounded-xl text-sm font-semibold border border-[#6EE7B7]">
                                <CheckCircle size={16} className="mr-2" /> Accepted
                              </div>
                              <ActionButton
                                onClick={() => navigate(`/company/chat?threadFor=${selectedInternshipId}&student=${candidate.email || candidate.studentEmail}`)}
                                className="w-full justify-center"
                                style={{ background: '#3F6FA6' }}
                              >
                                <MessageSquare size={16} className="mr-2" /> Open Chat
                              </ActionButton>
                            </>
                          ) : (
                            <div className="grid grid-cols-2 2xl:grid-cols-1 gap-2">
                              {candidate.applicationStatus !== 'shortlisted' && (
                                <button
                                  onClick={() => handleStatusChange(candidate.email || candidate.studentEmail, 'shortlisted', candidate.applicationStatus)}
                                  className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#FCD34D] bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A] transition-colors flex items-center justify-center"
                                >
                                  <Star size={14} className="mr-1" /> Shortlist
                                </button>
                              )}
                              {candidate.applicationStatus !== 'rejected' && (
                                <button
                                  onClick={() => handleStatusChange(candidate.email || candidate.studentEmail, 'rejected', candidate.applicationStatus)}
                                  className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#FCA5A5] bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FECACA] transition-colors flex items-center justify-center"
                                >
                                  <XCircle size={14} className="mr-1" /> Reject
                                </button>
                              )}
                              <button
                                onClick={() => handleStatusChange(candidate.email || candidate.studentEmail, 'matched', candidate.applicationStatus)}
                                className="col-span-2 2xl:col-span-1 px-3 py-2 rounded-lg text-sm font-bold border border-[#6EE7B7] bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0] transition-colors flex items-center justify-center"
                              >
                                <CheckCircle size={16} className="mr-2" /> Accept (Match)
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* View Profile Modal */}
        {viewProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleCloseModal}>
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#2C3E5B]">Student Profile</h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><XCircle size={24} /></button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6B7C93]">Full Name</label>
                    <p className="text-[#2C3E5B] font-medium">{viewProfile.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6B7C93]">Email Address</label>
                    <p className="text-[#2C3E5B] break-all">{viewProfile.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#6B7C93]">Province</label>
                    <p className="text-[#2C3E5B]">{viewProfile.province || 'N/A'}</p>
                  </div>
                  {viewProfile.applicationStatus && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#6B7C93] mb-1 block">Status</label>
                      {getStatusBadge(viewProfile.applicationStatus)}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6B7C93] mb-3 block">Skills & Expertise</label>
                  <div className="flex flex-wrap gap-2">
                    {viewProfile.skills && viewProfile.skills.length > 0 ? (
                      viewProfile.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full text-sm font-medium bg-[#E9EEF5] text-[#3F6FA6] border border-[#D6DEE9]">{skill}</span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">No skills listed</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#6B7C93] mb-2 block">Resume / Portfolio</label>
                  <div className="rounded-lg p-6 text-center bg-[#F5F7FB] border border-dashed border-[#D6DEE9]">
                    <p className="text-sm text-[#6B7C93]">Resume preview is currently being processed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyCandidates;