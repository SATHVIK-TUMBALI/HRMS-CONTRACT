import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Leave Request Approved', message: 'Your annual leave request for Aug 15-18 has been approved.', type: 'info', read: false, time: '10m ago' },
  { id: 2, title: 'New Leave Request', message: 'Sarah Jenkins submitted a request for Sick Leave (2 days).', type: 'pending', read: false, time: '1h ago', role: 'Manager' },
  { id: 3, title: 'Payroll Simulation Ready', message: 'July payroll cycle simulation is completed. Please review.', type: 'warning', read: false, time: '2h ago', role: 'HR' },
  { id: 4, title: 'OT Gate Entry Alert', message: 'Marcus Chen checked in 45 mins early with approved OT code.', type: 'info', read: true, time: '4h ago', role: 'Security' },
  { id: 5, title: 'System Maintenance', message: 'The HRMS will undergo scheduled updates on Sunday 2:00 AM EST.', type: 'system', read: true, time: '1d ago' },
];

export const AuthProvider = ({ children }) => {
  const getInitialUser = () => {
    const saved = localStorage.getItem('hrms_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      name: 'Alexander Wright',
      email: 'a.wright@enterprise.corp',
      role: 'Admin',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      department: 'Executive Board',
      designation: 'Managing Director & VP',
      employeeId: 'EMP-001',
      status: 'Active'
    };
  };

  const [user, setUser] = useState(getInitialUser);
  const [activeCompany, setActiveCompany] = useState(() => localStorage.getItem('hrms_active_company') || 'Enterprise Global');
  const [activePortal, setActivePortal] = useState(() => localStorage.getItem('hrms_active_portal') || 'Core HR & Employee Suite');
  const [theme, setTheme] = useState(() => localStorage.getItem('hrms_theme') || 'light');
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [statutoryRole, setStatutoryRole] = useState(() => localStorage.getItem('hrms_statutory_role') || 'Admin');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('hrms_view_mode') || 'role');

  useEffect(() => {
    if (user) {
      localStorage.setItem('hrms_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hrms_current_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('hrms_active_company', activeCompany);
  }, [activeCompany]);

  useEffect(() => {
    localStorage.setItem('hrms_active_portal', activePortal);
  }, [activePortal]);

  useEffect(() => {
    localStorage.setItem('hrms_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('hrms_statutory_role', statutoryRole);
  }, [statutoryRole]);

  useEffect(() => {
    localStorage.setItem('hrms_view_mode', viewMode);
  }, [viewMode]);

  // Sync role to user object when changed
  const switchRole = (newRole) => {
    setStatutoryRole(newRole);
    setViewMode('role');
    let mockProfile = {
      name: 'Alexander Wright',
      email: 'a.wright@enterprise.corp',
      role: newRole,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      department: 'Executive Board',
      designation: 'Managing Director & VP',
      employeeId: 'EMP-001',
      status: 'Active'
    };

    if (newRole === 'Finance HR') {
      mockProfile = {
        name: 'Rebecca Vance (Finance)',
        email: 'r.finance@enterprise.corp',
        role: 'Finance HR',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        department: 'Human Resources - Finance',
        designation: 'HR Director - Finance & Compensation',
        employeeId: 'EMP-004',
        status: 'Active'
      };
    } else if (newRole === 'Recruitment HR') {
      mockProfile = {
        name: 'Rebecca Vance (Recruitment)',
        email: 'r.recruiting@enterprise.corp',
        role: 'Recruitment HR',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        department: 'Human Resources - Talent Acquisition',
        designation: 'HR Director - Recruitment & Onboarding',
        employeeId: 'EMP-005',
        status: 'Active'
      };
    } else if (newRole === 'Operational HR') {
      mockProfile = {
        name: 'Rebecca Vance (Operational)',
        email: 'r.ops@enterprise.corp',
        role: 'Operational HR',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        department: 'Human Resources - Operations',
        designation: 'HR Director - Operations & Employee Relations',
        employeeId: 'EMP-006',
        status: 'Active'
      };
    } else if (newRole === 'HR') {
      // Fallback
      mockProfile = {
        name: 'Rebecca Vance',
        email: 'r.vance@enterprise.corp',
        role: 'HR',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        department: 'Human Resources',
        designation: 'Chief HR Officer',
        employeeId: 'EMP-004',
        status: 'Active'
      };
    } else if (newRole === 'Manager') {
      mockProfile = {
        name: 'David Miller',
        email: 'd.miller@enterprise.corp',
        role: 'Manager',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        department: 'Engineering Division',
        designation: 'Engineering Manager',
        employeeId: 'EMP-012',
        status: 'Active'
      };
    } else if (newRole === 'Employee') {
      mockProfile = {
        name: 'Sarah Jenkins',
        email: 's.jenkins@enterprise.corp',
        role: 'Employee',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
        department: 'Product Design',
        designation: 'Senior UI/UX Designer',
        employeeId: 'EMP-108',
        status: 'Active'
      };
    } else if (newRole === 'Security') {
      mockProfile = {
        name: 'Marcus Chen',
        email: 'm.chen@security.corp',
        role: 'Security',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        department: 'Loss Prevention & Security',
        designation: 'Safety & Access Lead',
        employeeId: 'EMP-902',
        status: 'Active'
      };
    }

    setUser(mockProfile);
  };

  const toggleViewMode = () => {
    setViewMode(prev => {
      const next = prev === 'role' ? 'employee' : 'role';
      setUser(curr => {
        if (!curr) return null;
        return {
          ...curr,
          role: next === 'employee' ? 'Employee' : statutoryRole
        };
      });
      return next;
    });
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = (title, message, type = 'info', role = null) => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      type,
      read: false,
      time: 'Just now',
      role
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const logout = () => {
    setUser(null);
  };

  const login = (role) => {
    switchRole(role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      activeCompany,
      setActiveCompany,
      activePortal,
      setActivePortal,
      theme,
      toggleTheme,
      notifications,
      markAllRead,
      addNotification,
      switchRole,
      login,
      logout,
      statutoryRole,
      viewMode,
      toggleViewMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
