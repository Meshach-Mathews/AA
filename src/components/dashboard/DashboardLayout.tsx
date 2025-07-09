import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Menu, X, LogOut, User, Settings, Home, Users, BookOpen, 
  BarChart, Calendar, Bell, FileText, Package, CreditCard,
  Shield, Database, School, UserCheck, GraduationCap, Edit3
} from 'lucide-react';
import Button from '../ui/Button';

const DashboardLayout: React.FC = () => {
  const { user, signOut, userRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getMenuItems = () => {
    const baseItems = [
      { icon: <Home size={20} />, label: 'Dashboard', path: '/dashboard' },
      { icon: <User size={20} />, label: 'Profile', path: '/dashboard/profile' },
    ];

    if (userRole === 'super_admin') {
      return [
        ...baseItems,
        { icon: <Shield size={20} />, label: 'Super Admin', path: '/dashboard/super-admin' },
        { icon: <Package size={20} />, label: 'Store Manager', path: '/dashboard/store-manager' },
        { icon: <School size={20} />, label: 'Schools', path: '/dashboard/schools' },
        { icon: <Users size={20} />, label: 'Users', path: '/dashboard/users' },
        { icon: <CreditCard size={20} />, label: 'Subscriptions', path: '/dashboard/subscriptions' },
        { icon: <Edit3 size={20} />, label: 'CMS', path: '/dashboard/cms' },
        { icon: <FileText size={20} />, label: 'Support Requests', path: '/dashboard/support' },
        { icon: <BarChart size={20} />, label: 'Analytics', path: '/dashboard/analytics' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/dashboard/settings' },
      ];
    }

    if (userRole === 'admin') {
      return [
        ...baseItems,
        { icon: <School size={20} />, label: 'School Management', path: '/dashboard/school' },
        { icon: <Users size={20} />, label: 'Staff Management', path: '/dashboard/staff' },
        { icon: <GraduationCap size={20} />, label: 'Students', path: '/dashboard/students' },
        { icon: <BookOpen size={20} />, label: 'Classes', path: '/dashboard/classes' },
        { icon: <CreditCard size={20} />, label: 'Finances', path: '/dashboard/finances' },
        { icon: <BarChart size={20} />, label: 'Reports', path: '/dashboard/reports' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/dashboard/settings' },
      ];
    }

    if (userRole === 'teacher') {
      return [
        ...baseItems,
        { icon: <BookOpen size={20} />, label: 'My Classes', path: '/dashboard/classes' },
        { icon: <GraduationCap size={20} />, label: 'Students', path: '/dashboard/students' },
        { icon: <Calendar size={20} />, label: 'Schedule', path: '/dashboard/schedule' },
        { icon: <FileText size={20} />, label: 'Assignments', path: '/dashboard/assignments' },
        { icon: <BarChart size={20} />, label: 'Grades', path: '/dashboard/grades' },
        { icon: <Bell size={20} />, label: 'Announcements', path: '/dashboard/announcements' },
      ];
    }

    if (userRole === 'staff') {
      return [
        ...baseItems,
        { icon: <UserCheck size={20} />, label: 'Attendance', path: '/dashboard/attendance' },
        { icon: <GraduationCap size={20} />, label: 'Students', path: '/dashboard/students' },
        { icon: <FileText size={20} />, label: 'Records', path: '/dashboard/records' },
        { icon: <Bell size={20} />, label: 'Announcements', path: '/dashboard/announcements' },
      ];
    }

    // Default user role
    return [
      ...baseItems,
      { icon: <Bell size={20} />, label: 'Notifications', path: '/dashboard/notifications' },
      { icon: <FileText size={20} />, label: 'Documents', path: '/dashboard/documents' },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <img 
            src="https://cfdptmabmfdmaiphtcqa.supabase.co/storage/v1/object/sign/acadeemia-bolt/acadeemia-logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81NmM2NjMyZS0yMmZkLTRkMDAtYTI5ZS05MzVmNWFmOTBhNDciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhY2FkZWVtaWEtYm9sdC9hY2FkZWVtaWEtbG9nby5wbmciLCJpYXQiOjE3NTA3NTAzMTUsImV4cCI6MzMyODY3NTAzMTV9.OIlwvdnuomUOtCYPQ4uIsvMRY12r3PdL9PEHVqKkxSk"
            alt="Acadeemia" 
            className="h-8"
          />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className="w-full flex items-center px-4 py-3 text-left text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{userRole?.replace('_', ' ')}</p>
            </div>
          </div>
          <Button
            variant="outline"
            fullWidth
            onClick={handleSignOut}
            icon={<LogOut size={16} />}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;