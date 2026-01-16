import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { internshipService } from '../services/internshipService';
import ActionButton from '../components/ActionButton';
import { Plus, Edit, Pause, Play, Archive, Trash2, ArrowLeft } from 'lucide-react';

const CompanyInternshipsList = () => {
  const navigate = useNavigate();
  const { email } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInternships();
  }, [email]);

  const loadInternships = async () => {
    try {
      const data = await internshipService.getByCompany(email);
      setInternships(data);
    } catch (error) {
      console.error('Failed to load internships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await internshipService.updateStatus(id, newStatus);
      await loadInternships();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm('Are you sure you want to archive this internship?')) {
      try {
        await internshipService.remove(id);
        await loadInternships();
      } catch (error) {
        console.error('Failed to archive:', error);
        alert('Failed to archive internship');
      }
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: { bg: '#D1FAE5', color: '#065F46', text: 'Active' },
      paused: { bg: '#FEF3C7', color: '#92400E', text: 'Paused' },
      archived: { bg: '#E5E7EB', color: '#374151', text: 'Archived' },
    };
    const style = styles[status] || styles.active;
    
    return (
      <span
        className="px-3 py-1 rounded-full text-xs font-semibold"
        style={{ background: style.bg, color: style.color }}
      >
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

  return (
    <div className="min-h-screen" style={{ background: '#E9EEF5' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <button
          onClick={() => navigate('/company/dashboard')}
          className="flex items-center gap-2 mb-6 text-sm"
          style={{ color: '#3F6FA6' }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#2C3E5B' }}>
            My Internships
          </h1>
          <ActionButton onClick={() => navigate('/company/internships/new')}>
            <Plus size={18} className="mr-2" />
            Create New Internship
          </ActionButton>
        </div>

        {/* Internships List */}
        {internships.length === 0 ? (
          <div
            className="rounded-xl p-12 text-center"
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
          <div className="space-y-4">
            {internships.map((internship) => (
              <div
                key={internship.id}
                className="rounded-xl p-6"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D6DEE9',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2" style={{ color: '#2C3E5B' }}>
                          {internship.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: '#6B7C93' }}>
                          <span>{internship.category}</span>
                          <span>•</span>
                          <span>{internship.workMode || internship.mode}</span>
                          <span>•</span>
                          <span>{internship.province}</span>
                        </div>
                      </div>
                      {getStatusBadge(internship.status)}
                    </div>
                    
                    {internship.mustSkills && internship.mustSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {internship.mustSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              background: '#E9EEF5',
                              color: '#3F6FA6',
                              border: '1px solid #D6DEE9',
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs mt-3" style={{ color: '#CBD5E1' }}>
                      Created: {new Date(internship.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:flex-col lg:min-w-[200px]">
                    <ActionButton
                      onClick={() => navigate(`/company/internships/${internship.id}/edit`)}
                      className="w-full"
                      style={{ background: '#3F6FA6' }}
                    >
                      <Edit size={16} className="mr-2" />
                      Edit
                    </ActionButton>
                    
                    {internship.status === 'active' ? (
                      <button
                        onClick={() => handleStatusChange(internship.id, 'paused')}
                        className="w-full px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center"
                        style={{
                          background: '#FEF3C7',
                          color: '#92400E',
                          border: '1px solid #FCD34D',
                        }}
                      >
                        <Pause size={16} className="mr-2" />
                        Pause
                      </button>
                    ) : internship.status === 'paused' ? (
                      <button
                        onClick={() => handleStatusChange(internship.id, 'active')}
                        className="w-full px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center"
                        style={{
                          background: '#D1FAE5',
                          color: '#065F46',
                          border: '1px solid #6EE7B7',
                        }}
                      >
                        <Play size={16} className="mr-2" />
                        Activate
                      </button>
                    ) : null}
                    
                    {internship.status !== 'archived' && (
                      <button
                        onClick={() => handleArchive(internship.id)}
                        className="w-full px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center"
                        style={{
                          background: '#FEE2E2',
                          color: '#991B1B',
                          border: '1px solid #FCA5A5',
                        }}
                      >
                        <Archive size={16} className="mr-2" />
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyInternshipsList;
