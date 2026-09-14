import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types/user';
import { Student } from './types/student';
import { getCurrentUser, switchUserPersona, logoutUser, getTeacherCredentials } from './services/authService';
import { Navbar, ERPTheme } from './components/layout/Navbar';
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
import { Timetable } from './pages/Timetable';
import { motion, AnimatePresence } from 'motion/react';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [theme, setTheme] = useState<ERPTheme>(() => {
    return (localStorage.getItem('dtm_erp_theme') as ERPTheme) || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light', 'theme-sapphire', 'theme-emerald');
    root.classList.add(`theme-${theme}`);
    localStorage.setItem('dtm_erp_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const selectTheme = (newTheme: ERPTheme) => {
    setTheme(newTheme);
  };

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
    if (role === 'TEACHER') {
      const creds = getTeacherCredentials();
      const switched = switchUserPersona(identifier, role, creds.password);
      if (switched.user) {
        setCurrentUser(switched.user);
      }
    } else {
      const switched = switchUserPersona(identifier, role);
      if (switched.user) {
        setCurrentUser(switched.user);
      }
    }
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
      <div className="min-h-screen bg-[var(--erp-bg)] text-[var(--erp-text-main)] selection:bg-emerald-600 selection:text-white font-sans antialiased transition-colors">
        <ToastNotification />
        <Login
          onLoginSuccess={(user) => setCurrentUser(user)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
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
        case 'timetable':
          return <Timetable />;
        case 'device':
          return <DeviceMonitor />;
        case 'reports':
          return <Reports />;
        case 'profile':
          return <Profile currentUser={currentUser} />;
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
      case 'timetable':
        return <Timetable />;
      case 'history':
        return <StudentDashboard currentUser={currentUser} />;
      case 'profile':
        return <Profile currentUser={currentUser} />;
      default:
        return <StudentDashboard currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--erp-bg)] text-[var(--erp-text-main)] flex flex-col selection:bg-emerald-600 selection:text-white font-sans antialiased transition-colors duration-200">
      <ToastNotification />

      {/* Persistent Academic ERP Header */}
      <Navbar
        currentUser={currentUser}
        onNavigate={handleTabChange}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        theme={theme}
        onSelectTheme={selectTheme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Body with Sidebar + Dynamic ERP View Area */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto overflow-hidden">
        <Sidebar
          role={currentUser.role}
          currentTab={currentTab}
          onTabChange={handleTabChange}
        />

        {/* Dynamic Main View Area with Smooth Motion Transition */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab + (viewingStudent ? viewingStudent.id : '')}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
