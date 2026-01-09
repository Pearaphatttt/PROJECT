import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { useStudentStore } from '../state/studentStore';
import { studentService } from '../services/studentService';
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useEffect } from 'react';

const StudentLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, logout } = useAuth();
  const { unreadCount } = useStudentStore();
  const [me, setMe] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const meData = await studentService.getMe();
        
        // Load profile picture from localStorage
        const profileKey = `studentProfile_${email}`;
        const storedProfile = localStorage.getItem(profileKey);
        if (storedProfile) {
          try {
            const stored = JSON.parse(storedProfile);
            if (stored.profilePicture) {
              meData.profilePicture = stored.profilePicture;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
        
        setMe(meData);
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };
    loadMe();
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
      loadMe();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [email]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems = [
    { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student/matching', label: 'Matching', icon: Search },
    { path: '/student/chat', label: 'Chat', icon: MessageSquare },
    { path: '/student/notifications', label: 'Notifications', icon: Bell },
    { path: '/student/profile', label: 'Profile', icon: User },
  ];

  const getPageTitle = () => {
    const item = navItems.find((item) => location.pathname.startsWith(item.path));
    if (item) return item.label;
    if (location.pathname.startsWith('/student/internships/')) return 'Internship Details';
    if (location.pathname.startsWith('/student/profile/edit')) return 'Edit Profile';
    if (location.pathname.startsWith('/student/profile/documents')) return 'Documents';
    if (location.pathname.startsWith('/student/profile/settings')) return 'Settings';
    return 'Student Portal';
  };

  return (
    <div className="min-h-screen" style={{ background: '#E9EEF5' }}>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b" style={{ borderColor: '#D6DEE9' }}>
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2"
            style={{ color: '#3F6FA6' }}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-lg font-bold" style={{ color: '#2C3E5B' }}>
            {getPageTitle()}
          </h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside
          className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r min-h-screen"
          style={{ borderColor: '#D6DEE9' }}
        >
          <div className="p-6 border-b" style={{ borderColor: '#D6DEE9' }}>
            <h2 className="text-xl font-bold" style={{ color: '#2C3E5B' }}>
              Student Portal
            </h2>
          </div>
          <nav className="flex-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              const showBadge = item.path === '/student/notifications' && unreadCount > 0;

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                    isActive ? 'font-semibold' : ''
                  }`}
                  style={{
                    background: isActive ? '#E9EEF5' : 'transparent',
                    color: isActive ? '#3F6FA6' : '#6B7C93',
                  }}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                  {showBadge && (
                    <span
                      className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5"
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t" style={{ borderColor: '#D6DEE9' }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
              style={{ color: '#6B7C93' }}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Sidebar - Mobile Drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
            <aside
              className="relative w-64 bg-white h-full shadow-xl"
              style={{ borderRight: '1px solid #D6DEE9' }}
            >
              <div className="p-6 border-b" style={{ borderColor: '#D6DEE9' }}>
                <h2 className="text-xl font-bold" style={{ color: '#2C3E5B' }}>
                  Student Portal
                </h2>
              </div>
              <nav className="flex-1 p-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  const showBadge = item.path === '/student/notifications' && unreadCount > 0;

                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                        isActive ? 'font-semibold' : ''
                      }`}
                      style={{
                        background: isActive ? '#E9EEF5' : 'transparent',
                        color: isActive ? '#3F6FA6' : '#6B7C93',
                      }}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                      {showBadge && (
                        <span
                          className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5"
                        >
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
              <div className="p-4 border-t" style={{ borderColor: '#D6DEE9' }}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                  style={{ color: '#6B7C93' }}
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar - Desktop */}
          <header
            className="hidden lg:flex items-center justify-between px-6 py-4 bg-white border-b"
            style={{ borderColor: '#D6DEE9' }}
          >
            <h1 className="text-2xl font-bold" style={{ color: '#2C3E5B' }}>
              {getPageTitle()}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {me?.profilePicture ? (
                  <img
                    src={me.profilePicture}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                    style={{ background: '#3F6FA6' }}
                  >
                    {me?.fullName?.[0] || email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="text-sm" style={{ color: '#6B7C93' }}>
                  {me?.fullName || email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:opacity-70 transition-opacity"
                style={{ color: '#3F6FA6' }}
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;

