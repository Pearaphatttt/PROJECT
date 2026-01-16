import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Upload, FileText, ArrowLeft } from 'lucide-react';
import ActionButton from '../components/ActionButton';
import { studentService } from '../services/studentService';
import { useAuth } from '../state/authStore';

const StudentProfileDocuments = () => {
  const navigate = useNavigate();
  const { email } = useAuth();
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    loadResumes();
  }, [email]);

  const loadResumes = async () => {
    try {
      const history = await studentService.getResumeHistory(email);
      setResumes(history);
    } catch (e) {
      console.error('Failed to load resume history:', e);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const newResume = {
        id: `resume-${Date.now()}`,
        filename: file.name,
        uploadedAt: new Date().toISOString(),
        size: file.size,
      };
      const updated = [newResume, ...resumes];
      setResumes(updated);
      await studentService.saveResumeHistory(updated, email);
      await studentService.saveResume(newResume, email);
    }
  };

  const handleDownload = (resume) => {
    // Mock download - just show alert
    alert(`Downloading ${resume.filename}...`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
      <button
        onClick={() => navigate('/student/profile')}
        className="flex items-center gap-2 mb-6 text-sm"
        style={{ color: '#3F6FA6' }}
      >
        <ArrowLeft size={16} />
        Back to Profile
      </button>

      <h2 className="text-2xl font-bold mb-6" style={{ color: '#2C3E5B' }}>
        Documents
      </h2>

      {/* Upload Section */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: '#F5F7FB',
          border: '1px solid #D6DEE9',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#2C3E5B' }}>
          Upload New Resume
        </h3>
        <label className="block">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors hover:bg-white"
            style={{ borderColor: '#CBD5E1' }}
          >
            <Upload size={20} style={{ color: '#3F6FA6' }} />
            <span style={{ color: '#3F6FA6' }}>Choose file to upload</span>
          </div>
        </label>
        <p className="text-xs mt-2 text-center" style={{ color: '#6B7C93' }}>
          Supported formats: PDF, DOCX
        </p>
      </div>

      {/* Resume History */}
      <div
        className="rounded-xl p-6"
        style={{
          background: '#F5F7FB',
          border: '1px solid #D6DEE9',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#2C3E5B' }}>
          Resume History
        </h3>
        {resumes.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: '#6B7C93' }}>
            No resumes uploaded yet
          </p>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{ background: '#FFFFFF', border: '1px solid #D6DEE9' }}
              >
                <div className="flex items-center gap-3">
                  <FileText size={24} style={{ color: '#3F6FA6' }} />
                  <div>
                    <div className="font-medium" style={{ color: '#2C3E5B' }}>
                      {resume.filename}
                    </div>
                    <div className="text-xs" style={{ color: '#6B7C93' }}>
                      Uploaded {new Date(resume.uploadedAt).toLocaleString()}
                      {resume.size && ` • ${(resume.size / 1024).toFixed(1)} KB`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(resume)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ background: '#F5F7FB', color: '#3F6FA6' }}
                  title="Download"
                >
                  <Download size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfileDocuments;

