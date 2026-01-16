import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { useStudentStore } from '../state/studentStore';
import { internshipService } from '../services/internshipService';
import { applicationService } from '../services/applicationService';
import { notificationService } from '../services/notificationService';
import { studentService } from '../services/studentService';
import { USE_MOCK } from '../config/env';
import ActionButton from '../components/ActionButton';
import { Heart, ArrowLeft, CheckCircle, FileText } from 'lucide-react';

const StudentInternshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { email } = useAuth();
  const {
    appliedInternshipIds,
    savedInternshipIds,
    matchedInternshipIds,
    applyToInternship,
    withdrawFromInternship,
    saveInternship,
    unsaveInternship,
    matchInternship,
  } = useStudentStore();

  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasResume, setHasResume] = useState(false);
  const [activeTab, setActiveTab] = useState('extracted');
  const [simulating, setSimulating] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  
  useEffect(() => {
    const checkResume = async () => {
      const hasRes = await studentService.hasResume(email);
      setHasResume(hasRes);
    };
    checkResume();
  }, [email]);

  useEffect(() => {
    loadInternship();
    loadApplicationStatus();
  }, [id, email]);

  const loadInternship = async () => {
    setLoading(true);
    try {
      const data = await internshipService.getById(id);
      setInternship(data);
    } catch (error) {
      console.error('Failed to load internship:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationStatus = async () => {
    if (!email || !id) return;
    try {
      const status = await applicationService.getStatus(email, id);
      setApplicationStatus(status);
    } catch (error) {
      console.error('Failed to load application status:', error);
    }
  };

  const handleApply = async () => {
    if (!email) return;
    
    if (applicationStatus === 'applied' || appliedInternshipIds.has(id)) {
      await applicationService.remove(email, id);
      await internshipService.withdraw(id);
      withdrawFromInternship(id);
      setApplicationStatus(null);
    } else {
      // internshipService.apply() handles both applicationService.setStatus() and notification
      await internshipService.apply(id);
      applyToInternship(id);
      setApplicationStatus('applied');
    }
  };

  const handleSave = async () => {
    if (savedInternshipIds.has(id)) {
      await internshipService.unsave(id);
      unsaveInternship(id);
    } else {
      await internshipService.save(id);
      saveInternship(id);
    }
  };

  const handleSimulateHrAccept = async () => {
    if (!USE_MOCK) return;
    setSimulating(true);
    try {
      await internshipService.simulateHrAccept(id);
      matchInternship(id);
      await notificationService.pushNotification('student', email, {
        id: `notif-${Date.now()}`,
        type: 'match',
        title: `You are matched with ${internship.company}!`,
        message: `Congratulations! Your application for ${internship.title} has been accepted.`,
        createdAt: Date.now(),
        readAt: null,
        internshipId: id,
      });
    } catch (error) {
      console.error('Failed to simulate HR accept:', error);
    } finally {
      setSimulating(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div style={{ color: '#6B7C93' }}>Loading...</div>
      </div>
    );
  }

  if (!hasResume) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <button
          onClick={() => navigate('/student/matching')}
          className="flex items-center gap-2 mb-6 text-sm"
          style={{ color: '#3F6FA6' }}
        >
          <ArrowLeft size={16} />
          Back to Matching
        </button>
        <div
          className="rounded-xl p-8 sm:p-12 text-center"
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
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="text-center py-12" style={{ color: '#6B7C93' }}>
        Internship not found
      </div>
    );
  }

  const isApplied = applicationStatus === 'applied' || appliedInternshipIds.has(id);
  const isMatched = applicationStatus === 'matched';
  const isSaved = savedInternshipIds.has(id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <button
        onClick={() => navigate('/student/matching')}
        className="flex items-center gap-2 mb-6 text-sm"
        style={{ color: '#3F6FA6' }}
      >
        <ArrowLeft size={16} />
        Back to Matching
      </button>

      {/* Company Info Block */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: '#F5F7FB',
          border: '1px solid #D6DEE9',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0"
            style={{ background: '#3F6FA6' }}
          >
            {internship.company?.[0] || 'C'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#2C3E5B' }}>
              {internship.title}
            </h1>
            <p className="text-lg mb-2" style={{ color: '#6B7C93' }}>
              {internship.company}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: '#6B7C93' }}>
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
            {isMatched && (
              <div className="mt-3 flex items-center gap-2">
                <CheckCircle size={20} style={{ color: '#10B981' }} />
                <span className="font-medium" style={{ color: '#10B981' }}>
                  Matched
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm mb-1" style={{ color: '#6B7C93' }}>
              Match Score
            </div>
            <div className="text-3xl font-bold" style={{ color: '#3F6FA6' }}>
              {internship.matchScore}%
            </div>
          </div>
        </div>
      </div>

      {/* Match Breakdown */}
      {internship.breakdown && (
        <div
          className="rounded-xl p-6 mb-6"
          style={{
            background: '#F5F7FB',
            border: '1px solid #D6DEE9',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: '#2C3E5B' }}>
            Match Breakdown
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: '#6B7C93' }}>Skills Match</span>
                <span className="font-medium" style={{ color: '#2C3E5B' }}>
                  {internship.breakdown.skillsPct}%
                </span>
              </div>
              <div
                className="h-3 rounded-full"
                style={{ background: '#E0E7EF' }}
              >
                <div
                  className="h-3 rounded-full"
                  style={{
                    background: '#3F6FA6',
                    width: `${internship.breakdown.skillsPct}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: '#6B7C93' }}>Distance</span>
                <span className="font-medium" style={{ color: '#2C3E5B' }}>
                  {internship.breakdown.distancePct}%
                </span>
              </div>
              <div
                className="h-3 rounded-full"
                style={{ background: '#E0E7EF' }}
              >
                <div
                  className="h-3 rounded-full"
                  style={{
                    background: '#3F6FA6',
                    width: `${internship.breakdown.distancePct}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: '#6B7C93' }}>Interest</span>
                <span className="font-medium" style={{ color: '#2C3E5B' }}>
                  {internship.breakdown.interestPct}%
                </span>
              </div>
              <div
                className="h-3 rounded-full"
                style={{ background: '#E0E7EF' }}
              >
                <div
                  className="h-3 rounded-full"
                  style={{
                    background: '#3F6FA6',
                    width: `${internship.breakdown.interestPct}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4">
        <div className="flex gap-2 border-b" style={{ borderColor: '#D6DEE9' }}>
          <button
            onClick={() => setActiveTab('extracted')}
            className="px-4 py-2 font-medium transition-colors"
            style={{
              color: activeTab === 'extracted' ? '#3F6FA6' : '#6B7C93',
              borderBottom: activeTab === 'extracted' ? '2px solid #3F6FA6' : '2px solid transparent',
            }}
          >
            Extracted JD
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className="px-4 py-2 font-medium transition-colors"
            style={{
              color: activeTab === 'raw' ? '#3F6FA6' : '#6B7C93',
              borderBottom: activeTab === 'raw' ? '2px solid #3F6FA6' : '2px solid transparent',
            }}
          >
            Raw JD
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: '#F5F7FB',
          border: '1px solid #D6DEE9',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        }}
      >
        {activeTab === 'extracted' && internship.extractedJD ? (
          <div className="space-y-6">
            {internship.extractedJD.requirements && (
              <div>
                <h3 className="font-semibold mb-3" style={{ color: '#2C3E5B' }}>
                  Requirements
                </h3>
                <ul className="list-disc list-inside space-y-2" style={{ color: '#6B7C93' }}>
                  {internship.extractedJD.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            {internship.extractedJD.responsibilities && (
              <div>
                <h3 className="font-semibold mb-3" style={{ color: '#2C3E5B' }}>
                  Responsibilities
                </h3>
                <ul className="list-disc list-inside space-y-2" style={{ color: '#6B7C93' }}>
                  {internship.extractedJD.responsibilities.map((resp, idx) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}
            {internship.extractedJD.skills && (
              <div>
                <h3 className="font-semibold mb-3" style={{ color: '#2C3E5B' }}>
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {internship.extractedJD.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-sm"
                      style={{ background: '#E0F2FE', color: '#0369A1' }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <pre
              className="whitespace-pre-wrap text-sm"
              style={{ color: '#6B7C93', fontFamily: 'inherit' }}
            >
              {internship.rawJD || 'No raw JD available'}
            </pre>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
          style={{
            background: isSaved ? '#FEE2E2' : '#F5F7FB',
            color: isSaved ? '#DC2626' : '#6B7C93',
            border: '1px solid #D6DEE9',
          }}
        >
          <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <ActionButton
          onClick={handleApply}
          className="flex-1"
          style={{
            background: isApplied ? '#10B981' : '#3F6FA6',
          }}
        >
          {isApplied ? 'Withdraw Application' : 'Apply Now'}
        </ActionButton>
        {USE_MOCK && isApplied && !isMatched && (
          <ActionButton
            onClick={handleSimulateHrAccept}
            disabled={simulating}
            className="flex-1"
            style={{
              background: '#8B5CF6',
            }}
          >
            {simulating ? 'Simulating...' : 'Simulate HR Accept'}
          </ActionButton>
        )}
      </div>
    </div>
  );
};

export default StudentInternshipDetail;

