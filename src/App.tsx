import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types/user';
import { Student } from './types/student';
import { getCurrentUser, switchUserPersona, logoutUser } from './services/authService';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastNotification } from './components/ui/ToastNotification';
import { Login } from './pages/Login';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentDetails } from './pages/StudentDetails';
import { AttendanceLogs } from './pages/AttendanceLogs';
import { DeviceMonitor } from './pages/DeviceMonitor';
import { Reports } from './pages/Reports';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener('dtm_auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('dtm_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setCurrentTab('dashboard');
    setViewingStudent(null);
  };

  const handleSwitchUser = (identifier: string, role: UserRole) => {
    const switched = switchUserPersona(identifier, role);
    setCurrentUser(switched);
    setViewingStudent(null);
    setCurrentTab('dashboard');
  };

  const handleTabChange = (tab: string) => {
    setViewingStudent(null);
    setCurrentTab(tab);
  };

  // If unauthenticated, show Login screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased">
        <ToastNotification />
        <Login onLoginSuccess={(user) => setCurrentUser(user)} />
      </div>
    );
  }

  // Render view based on role and tab
  const renderContent = () => {
    // If viewing a specific student's detail page
    if (viewingStudent) {
      return (
        <StudentDetails
          student={viewingStudent}
          onBack={() => setViewingStudent(null)}
        />
      );
    }

    // Teacher tabs
    if (currentUser.role === 'TEACHER') {
      switch (currentTab) {
        case 'dashboard':
          return (
            <TeacherDashboard
              onViewStudent={(std) => setViewingStudent(std)}
            />
          );
        case 'live':
        case 'logs':
        case 'students':
          return <AttendanceLogs />;
        case 'device':
          return <DeviceMonitor />;
        case 'reports':
          return <Reports />;
        case 'settings':
          return <Settings />;
        default:
          return (
            <TeacherDashboard
              onViewStudent={(std) => setViewingStudent(std)}
            />
          );
      }
    }

    // Student tabs
    switch (currentTab) {
      case 'dashboard':
      case 'my-attendance':
        return <StudentDashboard currentUser={currentUser} />;
      case 'history':
        return <StudentDashboard currentUser={currentUser} />;
      case 'profile':
        return <Profile currentUser={currentUser} />;
      default:
        return <StudentDashboard currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans antialiased">
      <ToastNotification />

      {/* Persistent App Header */}
      <Navbar
        currentUser={currentUser}
        onNavigate={handleTabChange}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto overflow-hidden">
        <Sidebar
          role={currentUser.role}
          currentTab={currentTab}
          onTabChange={handleTabChange}
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
