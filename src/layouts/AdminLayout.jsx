import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { USE_MOCK } from '../config/env';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/internships', label: 'Internships', icon: Briefcase },
  ];

  const getPageTitle = () => {
    const item = navItems.find((item) => location.pathname.startsWith(item.path));
    if (item) return item.label;
    return 'Admin Portal';
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: '#E9EEF5' }}>
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
              Admin Portal
            </h2>
          </div>
          <nav className="flex-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

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
              className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform"
              style={{ borderRight: '1px solid #D6DEE9' }}
            >
              <div className="p-6 border-b" style={{ borderColor: '#D6DEE9' }}>
                <h2 className="text-xl font-bold" style={{ color: '#2C3E5B' }}>
                  Admin Portal
                </h2>
              </div>
              <nav className="flex-1 p-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);

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
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold" style={{ color: '#2C3E5B' }}>
                {getPageTitle()}
              </h1>
              {USE_MOCK && (
                <span
                  className="px-2 py-1 text-xs font-medium rounded"
                  style={{
                    background: '#E0F2FE',
                    color: '#0369A1',
                  }}
                >
                  Mock Mode
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{ background: '#3F6FA6' }}
                >
                  A
                </div>
                <span className="text-sm" style={{ color: '#6B7C93' }}>
                  Admin
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
          <main className="flex-1 min-h-screen w-full overflow-x-hidden">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
