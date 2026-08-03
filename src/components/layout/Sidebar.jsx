import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import {
  LayoutDashboard, Building2, ShieldCheck, Calendar, FileText,
  Clock, Wallet, GitFork, History, Settings, Users, UserPlus,
  Upload, RefreshCw, Hourglass, UserCheck, CheckSquare, DoorOpen,
  ChevronDown, ChevronRight, Menu, X, Landmark, Compass, KeySquare
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
  const { user } = useAuth();
  const { leaves, overtime, shiftSwaps } = useHRMS();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  if (!user) return null;

  const currentRole = user.role;

  // If Admin, do not render vertical sidebar
  if (currentRole === 'Admin') return null;

  // Calculate dynamic badges
  const pendingLeavesCount = leaves.filter(l => l.status === 'Pending').length;
  const pendingOTCount = overtime.filter(o => o.status === 'Pending').length;
  const pendingSwapsCount = shiftSwaps.filter(s => s.status === 'Pending').length;
  const totalApprovalsCount = pendingLeavesCount + pendingOTCount + pendingSwapsCount;

  // Define menus per role
  const adminMenu = []; // Admin uses horizontal nav instead

  const hrMenu = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    {
      label: 'Employees',
      icon: Users,
      submenu: [
        { label: 'Employee Directory', path: '/directory' },
        { label: 'Create Employee', path: '/wizard' },
        { label: 'Bulk Import', path: '/employees/import' },
      ]
    },
    { label: 'Attendance & Time', icon: Clock, path: '/attendance' },
    { label: 'Leave Administration', icon: FileText, path: '/leaves', badge: pendingLeavesCount },
    { label: 'Holiday Management', icon: Calendar, path: '/holidays' },
    { label: 'Shift Administration', icon: RefreshCw, path: '/shifts' },
    { label: 'Overtime & Comp-Off', icon: Hourglass, path: '/overtime', badge: pendingOTCount },
    {
      label: 'Policies',
      icon: FileText,
      submenu: [
        { label: 'Leave Policies', path: '/policies/leave' },
        { label: 'OT Policies', path: '/policies/ot' },
        { label: 'Salary Components', path: '/policies/salary' },
      ]
    },
    {
      label: 'Payroll Engine',
      icon: Wallet,
      submenu: [
        { label: 'Payroll Run', path: '/payroll' },
        { label: 'Full & Final', path: '/payroll/fnf' },
        { label: 'Cost Centers', path: '/payroll/cost-centers' },
      ]
    },
    { label: 'Reports', icon: FileText, path: '/reports' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const financeHrMenu = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    {
      label: 'Payroll Engine',
      icon: Wallet,
      submenu: [
        { label: 'Payroll Run', path: '/payroll' },
        { label: 'Full & Final', path: '/payroll/fnf' },
        { label: 'Cost Centers', path: '/payroll/cost-centers' },
      ]
    },
    {
      label: 'Policies',
      icon: FileText,
      submenu: [
        { label: 'Leave Policies', path: '/policies/leave' },
        { label: 'OT Policies', path: '/policies/ot' },
        { label: 'Salary Components', path: '/policies/salary' },
      ]
    },
    { label: 'Reports', icon: FileText, path: '/reports' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const recruitmentHrMenu = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    {
      label: 'Employees',
      icon: Users,
      submenu: [
        { label: 'Employee Directory', path: '/directory' },
        { label: 'Create Employee', path: '/wizard' },
        { label: 'Bulk Import', path: '/employees/import' },
      ]
    },
    { label: 'Reports', icon: FileText, path: '/reports' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const operationalHrMenu = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Attendance & Time', icon: Clock, path: '/attendance' },
    { label: 'Leave Administration', icon: FileText, path: '/leaves', badge: pendingLeavesCount },
    { label: 'Holiday Management', icon: Calendar, path: '/holidays' },
    { label: 'Shift Administration', icon: RefreshCw, path: '/shifts' },
    { label: 'Overtime & Comp-Off', icon: Hourglass, path: '/overtime', badge: pendingOTCount },
    {
      label: 'Policies',
      icon: FileText,
      submenu: [
        { label: 'Leave Policies', path: '/policies/leave' },
        { label: 'OT Policies', path: '/policies/ot' },
        { label: 'Salary Components', path: '/policies/salary' },
      ]
    },
    { label: 'Reports', icon: FileText, path: '/reports' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const managerMenu = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Team', icon: Users, path: '/directory' },
    { label: 'Team Attendance', icon: Clock, path: '/attendance' },
    {
      label: 'Approvals Panel',
      icon: CheckSquare,
      badge: totalApprovalsCount,
      submenu: [
        { label: 'Leave Approvals', path: '/leaves', badge: pendingLeavesCount },
        { label: 'OT Approvals', path: '/overtime', badge: pendingOTCount },
        { label: 'Shift Swap Approvals', path: '/shifts', badge: pendingSwapsCount },
      ]
    },
    { label: 'Push OT Demand', icon: Hourglass, path: '/overtime' },
    { label: 'Reports', icon: FileText, path: '/reports' },
  ];

  const employeeMenu = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'My Profile', icon: Users, path: `/profile/${user.employeeId}` },
    { label: 'My Attendance', icon: Clock, path: '/attendance' },
    { label: 'Leaves & Time Off', icon: FileText, path: '/leaves' },
    { label: 'Overtime Logs', icon: Hourglass, path: '/overtime' },
    { label: 'Shift Schedule', icon: Calendar, path: '/shifts' },
    { label: 'Payslips', icon: Wallet, path: '/payroll' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const securityMenu = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Gate Entry Logs', icon: DoorOpen, path: '/gate-logs' },
    { label: 'Approved OT Access', icon: Hourglass, path: '/overtime' },
    { label: 'Shift Swaps Today', icon: RefreshCw, path: '/shifts' },
  ];

  const menusByRole = {
    Admin: adminMenu,
    HR: hrMenu,
    'Finance HR': financeHrMenu,
    'Recruitment HR': recruitmentHrMenu,
    'Operational HR': operationalHrMenu,
    Manager: managerMenu,
    Employee: employeeMenu,
    Security: securityMenu,
  };

  const menuItems = menusByRole[currentRole] || [];

  const toggleSubmenu = (label) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const handleNav = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setIsOpen(false); // Close sidebar drawer on mobile
    }
  };

  const renderMenuItem = (item, index) => {
    const Icon = item.icon;
    const hasSubmenu = !!item.submenu;
    const isExpanded = !!expandedMenus[item.label];
    
    // Check if active
    let isActive = false;
    if (hasSubmenu) {
      isActive = item.submenu.some(sub => location.pathname === sub.path);
    } else {
      isActive = location.pathname === item.path;
    }

    return (
      <div key={index} className="w-full">
        {hasSubmenu ? (
          <div>
            <button
              onClick={() => toggleSubmenu(item.label)}
              className={`w-full flex items-center justify-between px-4 py-2.5 my-0.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-primary dark:text-accent font-semibold'
                  : 'text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:text-slate-450 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className="shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </div>
              {!isCollapsed && (
                <div className="flex items-center gap-1.5">
                  {item.badge > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
              )}
            </button>
            {isExpanded && !isCollapsed && (
              <div className="pl-9 pr-2 py-1 flex flex-col gap-1 border-l border-slate-200 dark:border-slate-800 ml-6">
                {item.submenu.map((sub, idx) => {
                  const isSubActive = location.pathname === sub.path;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleNav(sub.path)}
                      className={`text-left py-1.5 px-3 rounded-md text-xs font-medium cursor-pointer transition-all ${
                        isSubActive
                          ? 'bg-primary/5 text-primary dark:bg-slate-800 dark:text-accent font-semibold'
                          : 'text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/20'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{sub.label}</span>
                        {sub.badge > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-danger text-[9px] font-bold text-white">
                            {sub.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => handleNav(item.path)}
            className={`w-full flex items-center justify-between px-4 py-2.5 my-0.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-primary/5 text-primary border-l-4 border-primary pl-3 font-semibold dark:bg-slate-800/80 dark:text-accent dark:border-accent'
                : 'text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:text-slate-450 dark:hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon size={18} className="shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </div>
            {!isCollapsed && item.badge > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                {item.badge}
              </span>
            )}
          </button>
        )}
      </div>
    );
  };

  // Sidebar wrapper sizing classes
  const collapsedWidth = 'w-[72px]';
  const expandedWidth = 'w-[256px]';
  const widthClass = isCollapsed ? collapsedWidth : expandedWidth;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-[64px] bottom-0 left-0 z-35 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all duration-300 ease-in-out lg:translate-x-0 ${widthClass} ${
          isOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full'
        }`}
      >
        {/* Brand Banner (Optional placeholder, let's keep it clean) */}
        {!isCollapsed && (
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/10">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {currentRole} WORKSPACE
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent">
              V1.2
            </span>
          </div>
        )}

        {/* Menu Items Container */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item, idx) => renderMenuItem(item, idx))}
        </div>

        {/* Footer actions / Collapser trigger */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-center">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <ChevronRight size={18} className={`transition-transform duration-350 ${isCollapsed ? '' : 'rotate-180'}`} />
          </button>
          {!isCollapsed && (
            <div className="text-[11px] text-slate-400 font-semibold truncate text-center">
              Logged in as: <strong className="text-slate-650 dark:text-slate-350">{user.name}</strong>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
