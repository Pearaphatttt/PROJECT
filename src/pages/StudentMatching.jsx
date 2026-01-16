import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { useStudentStore } from '../state/studentStore';
import { internshipService } from '../services/internshipService';
import { studentService } from '../services/studentService';
import ActionButton from '../components/ActionButton';
import { Heart, Eye, X, FileText } from 'lucide-react';

const StudentMatching = () => {
  const navigate = useNavigate();
  const { email } = useAuth();
  const {
    appliedInternshipIds,
    savedInternshipIds,
    skippedInternshipIds,
    applyToInternship,
    withdrawFromInternship,
    saveInternship,
    unsaveInternship,
    skipInternship,
  } = useStudentStore();

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasResume, setHasResume] = useState(false);
  const [filters, setFilters] = useState({
    distance: '',
    category: '',
    mode: '',
  });
  const [sort, setSort] = useState('matchScore');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const checkResume = async () => {
      const hasRes = await studentService.hasResume(email);
      setHasResume(hasRes);
    };
    checkResume();
  }, [email]);

  useEffect(() => {
    if (hasResume) {
      loadInternships();
    } else {
      setLoading(false);
      setInternships([]);
    }
  }, [filters, sort, hasResume]);

  const loadInternships = async () => {
    setLoading(true);
    try {
      const data = await internshipService.getAllMatches(filters, sort);
      // Filter out skipped items
      const filtered = data.filter((item) => !skippedInternshipIds.has(item.id));
      setInternships(filtered);
    } catch (error) {
      console.error('Failed to load internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (id) => {
    if (appliedInternshipIds.has(id)) {
      await internshipService.withdraw(id);
      withdrawFromInternship(id);
    } else {
      await internshipService.apply(id);
      applyToInternship(id);
    }
  };

  const handleSave = async (id) => {
    if (savedInternshipIds.has(id)) {
      await internshipService.unsave(id);
      unsaveInternship(id);
    } else {
      await internshipService.save(id);
      saveInternship(id);
    }
  };

  const handleSkip = async (id) => {
    await internshipService.skip(id);
    skipInternship(id);
    setInternships((prev) => prev.filter((item) => item.id !== id));
  };

  const getStatusBadge = (id) => {
    if (appliedInternshipIds.has(id)) {
      return (
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: '#E0F2FE', color: '#0369A1' }}
        >
          Applied
        </span>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div style={{ color: '#6B7C93' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold mb-2" style={{ color: '#2C3E5B' }}>
          Find Your Perfect Match
        </h2>
        <p className="text-sm sm:text-base" style={{ color: '#6B7C93' }}>
          Browse available internships and find the best fit for you
        </p>
      </div>

      {/* Filters and Sort - Desktop */}
      {hasResume && (
      <div className="hidden md:flex gap-4 mb-6">
        <div className="flex-1 flex gap-3">
          <select
            value={filters.distance}
            onChange={(e) => setFilters({ ...filters, distance: e.target.value })}
            className="flex-1 px-4 py-2 rounded-lg border"
            style={{
              background: '#FFFFFF',
              borderColor: '#CBD5E1',
              fontSize: '14px',
            }}
          >
            <option value="">Any Distance</option>
            <option value="0-5">0-5 km</option>
            <option value="5-15">5-15 km</option>
            <option value="15-30">15-30 km</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="flex-1 px-4 py-2 rounded-lg border"
            style={{
              background: '#FFFFFF',
              borderColor: '#CBD5E1',
              fontSize: '14px',
            }}
          >
            <option value="">All Categories</option>
            <option value="Software">Software</option>
            <option value="Network">Network</option>
            <option value="Data">Data</option>
            <option value="Marketing">Marketing</option>
          </select>

          <select
            value={filters.mode}
            onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
            className="flex-1 px-4 py-2 rounded-lg border"
            style={{
              background: '#FFFFFF',
              borderColor: '#CBD5E1',
              fontSize: '14px',
            }}
          >
            <option value="">All Modes</option>
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2 rounded-lg border"
          style={{
            background: '#FFFFFF',
            borderColor: '#CBD5E1',
            fontSize: '14px',
          }}
        >
          <option value="matchScore">Match Score</option>
          <option value="distance">Nearest</option>
        </select>
      </div>
      )}

      {/* Filters - Mobile */}
      {hasResume && (
      <div className="md:hidden mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full px-4 py-2 rounded-lg border text-left"
          style={{
            background: '#FFFFFF',
            borderColor: '#CBD5E1',
            fontSize: '14px',
          }}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        {showFilters && (
          <div className="mt-3 space-y-3 p-4 rounded-lg border" style={{ background: '#F5F7FB', borderColor: '#D6DEE9' }}>
            <select
              value={filters.distance}
              onChange={(e) => setFilters({ ...filters, distance: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                background: '#FFFFFF',
                borderColor: '#CBD5E1',
                fontSize: '14px',
              }}
            >
              <option value="">Any Distance</option>
              <option value="0-5">0-5 km</option>
              <option value="5-15">5-15 km</option>
              <option value="15-30">15-30 km</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                background: '#FFFFFF',
                borderColor: '#CBD5E1',
                fontSize: '14px',
              }}
            >
              <option value="">All Categories</option>
              <option value="Software">Software</option>
              <option value="Network">Network</option>
              <option value="Data">Data</option>
              <option value="Marketing">Marketing</option>
            </select>

            <select
              value={filters.mode}
              onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                background: '#FFFFFF',
                borderColor: '#CBD5E1',
                fontSize: '14px',
              }}
            >
              <option value="">All Modes</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                background: '#FFFFFF',
                borderColor: '#CBD5E1',
                fontSize: '14px',
              }}
            >
              <option value="matchScore">Match Score</option>
              <option value="distance">Nearest</option>
            </select>
          </div>
        )}
      </div>
      )}

      {/* Resume Required Message */}
      {!hasResume && (
        <div
          className="rounded-xl p-4 sm:p-5 text-center mb-6"
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
              <FileText size={32} style={{ color: '#3F6FA6' }} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-3" style={{ color: '#2C3E5B' }}>
              Resume Required
            </h3>
            <p className="text-sm sm:text-base mb-6" style={{ color: '#6B7C93' }}>
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
      )}

      {/* Internship List */}
      {hasResume && (
        <div className="space-y-4">
          {internships.length === 0 ? (
            <div className="text-center py-12" style={{ color: '#6B7C93' }}>
              No internships found. Try adjusting your filters.
            </div>
          ) : (
          internships.map((internship) => {
            const isApplied = appliedInternshipIds.has(internship.id);
            const isSaved = savedInternshipIds.has(internship.id);

            return (
              <div
                key={internship.id}
                className="rounded-xl p-4 sm:p-5"
                style={{
                  background: '#F5F7FB',
                  border: '1px solid #D6DEE9',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                }}
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0"
                        style={{ background: '#3F6FA6' }}
                      >
                        {internship.company?.[0] || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3
                            className="font-semibold text-lg whitespace-normal break-words"
                            style={{ color: '#2C3E5B' }}
                            title={internship.title}
                          >
                            {internship.title}
                          </h3>
                          {getStatusBadge(internship.id)}
                        </div>
                        <p
                          className="text-sm sm:text-base mb-1 whitespace-normal break-words"
                          style={{ color: '#6B7C93' }}
                          title={internship.company}
                        >
                          {internship.company}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: '#6B7C93' }}>
                          <span>{internship.location}</span>
                          <span>•</span>
                          <span>{internship.mode}</span>
                          {internship.distanceKm > 0 && (
                            <>
                              <span>•</span>
                              <span>{internship.distanceKm.toFixed(1)} km away</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Match Score */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium" style={{ color: '#2C3E5B' }}>
                          Match Score: {internship.matchScore}%
                        </span>
                        <div
                          className="flex-1 h-2 rounded-full"
                          style={{ background: '#E0E7EF' }}
                        >
                          <div
                            className="h-2 rounded-full"
                            style={{
                              background: '#3F6FA6',
                              width: `${internship.matchScore}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Matched Skills */}
                    {internship.matchedSkills && internship.matchedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {internship.matchedSkills.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ background: '#E0F2FE', color: '#0369A1' }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(internship.id)}
                        className="p-2 rounded-lg transition-colors"
                        style={{
                          background: isSaved ? '#FEE2E2' : '#F5F7FB',
                          color: isSaved ? '#DC2626' : '#6B7C93',
                        }}
                        title={isSaved ? 'Unsave' : 'Save'}
                      >
                        <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => handleSkip(internship.id)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ background: '#F5F7FB', color: '#6B7C93' }}
                        title="Skip"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
                        {isApplied ? 'Withdraw' : 'Apply'}
                      </ActionButton>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>
      )}
    </div>
  );
};

export default StudentMatching;

