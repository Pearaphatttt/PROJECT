import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import ActionButton from '../components/ActionButton';
import LabeledInput from '../components/LabeledInput';

const StudentProfileSettings = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    matches: true,
    messages: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaving(false);
    // In a real app, this would save to backend
    alert('Settings saved!');
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
        Settings
      </h2>

      {/* Account Settings */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: '#F5F7FB',
          border: '1px solid #D6DEE9',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#2C3E5B' }}>
          Account Settings
        </h3>
        <div className="space-y-4">
          <LabeledInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <LabeledInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password (leave blank to keep current)"
          />
        </div>
      </div>

      {/* Notification Preferences */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: '#F5F7FB',
          border: '1px solid #D6DEE9',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#2C3E5B' }}>
          Notification Preferences
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span style={{ color: '#6B7C93' }}>Email Notifications</span>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) =>
                setNotifications({ ...notifications, email: e.target.checked })
              }
              className="w-5 h-5 rounded"
              style={{ accentColor: '#3F6FA6' }}
            />
          </label>
          <label className="flex items-center justify-between">
            <span style={{ color: '#6B7C93' }}>Push Notifications</span>
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={(e) =>
                setNotifications({ ...notifications, push: e.target.checked })
              }
              className="w-5 h-5 rounded"
              style={{ accentColor: '#3F6FA6' }}
            />
          </label>
          <label className="flex items-center justify-between">
            <span style={{ color: '#6B7C93' }}>New Matches</span>
            <input
              type="checkbox"
              checked={notifications.matches}
              onChange={(e) =>
                setNotifications({ ...notifications, matches: e.target.checked })
              }
              className="w-5 h-5 rounded"
              style={{ accentColor: '#3F6FA6' }}
            />
          </label>
          <label className="flex items-center justify-between">
            <span style={{ color: '#6B7C93' }}>New Messages</span>
            <input
              type="checkbox"
              checked={notifications.messages}
              onChange={(e) =>
                setNotifications({ ...notifications, messages: e.target.checked })
              }
              className="w-5 h-5 rounded"
              style={{ accentColor: '#3F6FA6' }}
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <ActionButton
        onClick={handleSave}
        disabled={saving}
        className="w-full sm:w-auto"
      >
        <Save size={18} className="mr-2" />
        {saving ? 'Saving...' : 'Save Settings'}
      </ActionButton>
    </div>
  );
};

export default StudentProfileSettings;

