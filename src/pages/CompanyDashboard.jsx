import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { companyService } from '../services/companyService';
import { internshipService } from '../services/internshipService';
import ActionButton from '../components/ActionButton';
import { Users, MessageSquare, User, Briefcase, ChevronRight, Plus } from 'lucide-react';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { email } = useAuth();
  const [me, setMe] = useState(null);
  const [candidateMatches, setCandidateMatches] = useState([]);
  const [myInternships, setMyInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [meData, matchesData, internshipsData] = await Promise.all([
          companyService.getMe(),
          companyService.getCandidateMatches(),
          internshipService.getByCompany(email),
        ]);
        
        setMe(meData);
        setCandidateMatches(matchesData || []);
        setMyInternships(internshipsData || []);
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

  const handleViewProfile = (candidateId) => {
    navigate(`/company/candidates?student=${candidateId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#E9EEF5' }}>
        <div className="text-center" style={{ color: '#6B7C93' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full py-6" style={{ background: '#E9EEF5' }}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <div className="flex gap-2 flex-wrap">
            <ActionButton onClick={() => navigate('/company/chat')}>
              <MessageSquare size={18} className="mr-2" />
              Chat
            </ActionButton>
            <ActionButton onClick={() => navigate('/company/candidates')}>
              <Users size={18} className="mr-2" />
              View Candidates
            </ActionButton>
            <ActionButton onClick={() => navigate('/company/internships')}>
              Manage Internships
            </ActionButton>
            <ActionButton onClick={() => navigate('/company/profile')}>
              <User size={18} className="mr-2" />
              Profile
            </ActionButton>
          </div>
        </div>

        {/* My Internships Section */}
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: '#2C3E5B' }}>
            My Internships
          </h3>
          {myInternships.length === 0 ? (
            <div
              className="rounded-xl p-4 sm:p-5 text-center"
              style={{
                background: '#F5F7FB',
                border: '1px solid #D6DEE9',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
              }}
            >
              <p className="mb-4" style={{ color: '#6B7C93' }}>
                You haven't created any internships yet.
              </p>
              <ActionButton onClick={() => navigate('/company/internships/new')}>
                Create Your First Internship
              </ActionButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {myInternships.slice(0, 5).map((internship) => (
                <div
                  key={internship.id}
                  className="rounded-2xl p-4 sm:p-5 cursor-pointer"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #D6DEE9',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                  }}
                >
                  <div className="flex flex-col gap-4">
                    <div className="min-w-0">
                      <h4 className="text-base font-semibold whitespace-normal break-words" style={{ color: '#2C3E5B' }}>
                        {internship.title}
                      </h4>
                      <p className="text-sm whitespace-normal break-words" style={{ color: '#6B7C93' }}>
                        {internship.category} • {internship.workMode || internship.mode} • {internship.province}
                      </p>
                    </div>
                    <ActionButton
                      onClick={() => navigate(`/company/candidates?internship=${internship.id}`)}
                      className="flex-none px-4 py-2 rounded-xl whitespace-nowrap"
                      style={{ background: '#3F6FA6' }}
                    >
                      View Candidates
                    </ActionButton>
                  </div>
                </div>
              ))}
              {myInternships.length > 5 && (
                <ActionButton
                  onClick={() => navigate('/company/internships')}
                  className="w-full"
                  style={{
                    background: '#F5F7FB',
                    color: '#6B7C93',
                    border: '1px solid #D6DEE9',
                  }}
                >
                  View All Internships ({myInternships.length})
                </ActionButton>
              )}
            </div>
          )}
        </div>

        {/* Candidate Matches Section */}
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: '#2C3E5B' }}>
            Candidate Matches
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {candidateMatches.map((candidate) => (
              <div
                key={candidate.id}
                className="rounded-xl p-4 sm:p-5"
                style={{
                  background: '#F5F7FB',
                  border: '1px solid #D6DEE9',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-full text-white flex items-center justify-center flex-none font-semibold"
                    style={{ background: '#3F6FA6' }}
                  >
                    {candidate.name?.[0] || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold whitespace-normal break-words" style={{ color: '#2C3E5B' }}>
                      {candidate.name}
                    </h4>
                    <p className="text-sm whitespace-normal break-words" style={{ color: '#6B7C93' }}>
                      {candidate.email}
                    </p>
                    <div className="text-sm mt-1" style={{ color: '#6B7C93' }}>
                      Match Score{' '}
                      <span className="font-semibold" style={{ color: '#2C3E5B' }}>
                        {candidate.matchScore}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {candidate.skills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-sm"
                      style={{ background: '#FFFFFF', color: '#2C3E5B' }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <ActionButton
                  onClick={() => handleViewProfile(candidate.id)}
                  className="w-full"
                  style={{ background: '#3F6FA6' }}
                >
                  View Profile
                </ActionButton>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;