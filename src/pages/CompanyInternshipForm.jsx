import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { companyService } from '../services/companyService';
import { internshipService } from '../services/internshipService';
import LabeledInput from '../components/LabeledInput';
import ActionButton from '../components/ActionButton';
import { X } from 'lucide-react';

const CompanyInternshipForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { email } = useAuth();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Software',
    workMode: 'On-site',
    province: 'Bangkok',
    mustSkills: [],
    niceSkills: [],
    rawJdText: '',
  });
  const [mustSkillInput, setMustSkillInput] = useState('');
  const [niceSkillInput, setNiceSkillInput] = useState('');

  useEffect(() => {
    loadCompanyInfo();
    if (isEdit) {
      loadInternship();
    }
  }, [id, email]);

  const loadCompanyInfo = async () => {
    try {
      const me = await companyService.getMe();
      setCompanyInfo(me);
    } catch (error) {
      console.error('Failed to load company info:', error);
    }
  };

  const loadInternship = async () => {
    try {
      const internship = await internshipService.getById(id);
      if (internship) {
        setFormData({
          title: internship.title || '',
          category: internship.category || 'Software',
          workMode: internship.workMode || internship.mode || 'On-site',
          province: internship.province || 'Bangkok',
          mustSkills: internship.mustSkills || [],
          niceSkills: internship.niceSkills || [],
          rawJdText: internship.rawJdText || internship.rawJD || '',
        });
      }
    } catch (error) {
      console.error('Failed to load internship:', error);
      alert('Failed to load internship');
      navigate('/company/internships');
    }
  };

  const handleAddMustSkill = () => {
    const skill = mustSkillInput.trim();
    if (skill && !formData.mustSkills.includes(skill)) {
      setFormData({
        ...formData,
        mustSkills: [...formData.mustSkills, skill],
      });
      setMustSkillInput('');
    }
  };

  const handleRemoveMustSkill = (skill) => {
    setFormData({
      ...formData,
      mustSkills: formData.mustSkills.filter((s) => s !== skill),
    });
  };

  const handleAddNiceSkill = () => {
    const skill = niceSkillInput.trim();
    if (skill && !formData.niceSkills.includes(skill)) {
      setFormData({
        ...formData,
        niceSkills: [...formData.niceSkills, skill],
      });
      setNiceSkillInput('');
    }
  };

  const handleRemoveNiceSkill = (skill) => {
    setFormData({
      ...formData,
      niceSkills: formData.niceSkills.filter((s) => s !== skill),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    if (formData.mustSkills.length === 0) {
      alert('Please add at least one required skill');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        workMode: formData.workMode,
        province: formData.province,
        mustSkills: formData.mustSkills,
        niceSkills: formData.niceSkills,
        rawJdText: formData.rawJdText.trim(),
      };

      if (isEdit) {
        await internshipService.update(id, payload);
      } else {
        await internshipService.create(payload, {
          email: email,
          hrName: companyInfo?.hrName,
          companyName: companyInfo?.companyName,
        });
      }
      
      navigate('/company/internships');
    } catch (error) {
      console.error('Failed to save internship:', error);
      alert('Failed to save internship');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Software', 'Network', 'Data', 'Marketing'];
  const workModes = ['On-site', 'Hybrid', 'Remote'];
  const provinces = [
    'Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Khon Kaen',
    'Ubon Ratchathani', 'Hat Yai', 'Nakhon Ratchasima', 'Other'
  ];

  return (
    <div className="min-h-screen" style={{ background: '#E9EEF5' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: '#2C3E5B' }}>
          {isEdit ? 'Edit Internship' : 'Create New Internship'}
        </h1>

        <form onSubmit={handleSubmit}>
          <div
            className="rounded-xl p-6 mb-6"
            style={{
              background: '#FFFFFF',
              border: '1px solid #D6DEE9',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            }}
          >
            {/* Title */}
            <LabeledInput
              label="Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Software Developer Intern"
              required
            />

            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2C3E5B' }}>
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  background: '#FFFFFF',
                  borderColor: '#D6DEE9',
                  color: '#2C3E5B',
                }}
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Work Mode */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2C3E5B' }}>
                Work Mode *
              </label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  background: '#FFFFFF',
                  borderColor: '#D6DEE9',
                  color: '#2C3E5B',
                }}
                required
              >
                {workModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>

            {/* Province */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2C3E5B' }}>
                Province *
              </label>
              <select
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  background: '#FFFFFF',
                  borderColor: '#D6DEE9',
                  color: '#2C3E5B',
                }}
                required
              >
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            {/* Must Skills */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2C3E5B' }}>
                Required Skills * (at least one)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={mustSkillInput}
                  onChange={(e) => setMustSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMustSkill();
                    }
                  }}
                  placeholder="Type skill and press Enter"
                  className="flex-1 px-4 py-2 rounded-lg border"
                  style={{
                    background: '#FFFFFF',
                    borderColor: '#D6DEE9',
                    color: '#2C3E5B',
                  }}
                />
                <ActionButton type="button" onClick={handleAddMustSkill}>
                  Add
                </ActionButton>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.mustSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      background: '#E9EEF5',
                      color: '#3F6FA6',
                      border: '1px solid #D6DEE9',
                    }}
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveMustSkill(skill)}
                      className="hover:opacity-70"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Nice Skills */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2C3E5B' }}>
                Preferred Skills (optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={niceSkillInput}
                  onChange={(e) => setNiceSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNiceSkill();
                    }
                  }}
                  placeholder="Type skill and press Enter"
                  className="flex-1 px-4 py-2 rounded-lg border"
                  style={{
                    background: '#FFFFFF',
                    borderColor: '#D6DEE9',
                    color: '#2C3E5B',
                  }}
                />
                <ActionButton type="button" onClick={handleAddNiceSkill}>
                  Add
                </ActionButton>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.niceSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      background: '#F5F7FB',
                      color: '#6B7C93',
                      border: '1px solid #D6DEE9',
                    }}
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveNiceSkill(skill)}
                      className="hover:opacity-70"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Raw JD Text */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#2C3E5B' }}>
                Job Description (optional)
              </label>
              <textarea
                value={formData.rawJdText}
                onChange={(e) => setFormData({ ...formData, rawJdText: e.target.value })}
                placeholder="Enter full job description..."
                rows={8}
                className="w-full px-4 py-2 rounded-lg border resize-none"
                style={{
                  background: '#FFFFFF',
                  borderColor: '#D6DEE9',
                  color: '#2C3E5B',
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <ActionButton
              type="button"
              onClick={() => navigate('/company/internships')}
              style={{
                background: '#F5F7FB',
                color: '#6B7C93',
                border: '1px solid #D6DEE9',
              }}
            >
              Cancel
            </ActionButton>
            <ActionButton type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Internship'}
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyInternshipForm;
