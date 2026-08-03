import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';
import Footer from './Footer';
import {
  LayoutDashboard, Building2, ShieldCheck, KeySquare, Calendar, History,
  Wallet, UserX, BarChart3, FileText, Settings, Users, UserPlus, Upload,
  Clock, RefreshCw, Hourglass, DoorOpen, Briefcase, TrendingUp, CreditCard,
  Shield, PiggyBank, GitBranch, Receipt
} from 'lucide-react';

function HorizontalNav() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const getNavItems = (role) => {
    if (role === 'Admin') {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Organization', icon: Building2, path: '/org/companies' },
        { label: 'Org Tree', icon: GitBranch, path: '/org/orgtree' },
        { label: 'Contractors', icon: Briefcase, path: '/contractors' },
        { label: 'Permissions', icon: ShieldCheck, path: '/admin/permissions' },
        { label: 'Credentials', icon: KeySquare, path: '/admin/credentials' },
        { label: 'Audit Logs', icon: History, path: '/admin/audit-logs' },
      ];
    }
    if (role === 'Finance HR') {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Payroll', icon: Wallet, path: '/payroll' },
        { label: 'Full & Final', icon: UserX, path: '/payroll/fnf' },
        { label: 'Cost Centers', icon: BarChart3, path: '/payroll/cost-centers' },
        { label: 'Salary Structure', icon: TrendingUp, path: '/salary-structure' },
        { label: 'Income Tax', icon: Receipt, path: '/income-tax' },
        { label: 'Banking', icon: CreditCard, path: '/banking' },
        { label: 'Loans & Advances', icon: PiggyBank, path: '/loans' },
        { label: 'Gratuity', icon: Shield, path: '/gratuity' },
        { label: 'Contractors', icon: Briefcase, path: '/contractors' },
        { label: 'Org Tree', icon: GitBranch, path: '/org/orgtree' },
        { label: 'Reports', icon: FileText, path: '/reports' },
        { label: 'Settings', icon: Settings, path: '/settings' },
      ];
    }
    if (role === 'Recruitment HR') {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Directory', icon: Users, path: '/directory' },
        { label: 'Contractors', icon: Briefcase, path: '/contractors' },
        { label: 'New Employee', icon: UserPlus, path: '/wizard' },
        { label: 'Import', icon: Upload, path: '/employees/import' },
        { label: 'Salary Structure', icon: TrendingUp, path: '/salary-structure' },
        { label: 'Org Tree', icon: GitBranch, path: '/org/orgtree' },
        { label: 'Reports', icon: FileText, path: '/reports' },
        { label: 'Settings', icon: Settings, path: '/settings' },
      ];
    }
    if (role === 'Operational HR') {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Attendance', icon: Clock, path: '/attendance' },
        { label: 'Leaves', icon: FileText, path: '/leaves' },
        { label: 'Holidays', icon: Calendar, path: '/holidays' },
        { label: 'Shifts', icon: RefreshCw, path: '/shifts' },
        { label: 'Overtime & Comp-Off', icon: Hourglass, path: '/overtime' },
        { label: 'Contractors', icon: Briefcase, path: '/contractors' },
        { label: 'Org Tree', icon: GitBranch, path: '/org/orgtree' },
        { label: 'Reports', icon: FileText, path: '/reports' },
        { label: 'Settings', icon: Settings, path: '/settings' },
      ];
    }
    if (role === 'HR') {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Directory', icon: Users, path: '/directory' },
        { label: 'Attendance', icon: Clock, path: '/attendance' },
        { label: 'Leaves', icon: FileText, path: '/leaves' },
        { label: 'Holidays', icon: Calendar, path: '/holidays' },
        { label: 'Shifts', icon: RefreshCw, path: '/shifts' },
        { label: 'Overtime & Comp-Off', icon: Hourglass, path: '/overtime' },
        { label: 'Payroll', icon: Wallet, path: '/payroll' },
        { label: 'Contractors', icon: Briefcase, path: '/contractors' },
        { label: 'Policies', icon: FileText, path: '/policies/leave' },
        { label: 'Reports', icon: FileText, path: '/reports' },
        { label: 'Settings', icon: Settings, path: '/settings' },
      ];
    }
    if (role === 'Employee') {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'My Profile', icon: Users, path: `/profile/${user.employeeId}` },
        { label: 'My Attendance', icon: Clock, path: '/attendance' },
        { label: 'Leaves & Time Off', icon: FileText, path: '/leaves' },
        { label: 'Overtime Logs', icon: Hourglass, path: '/overtime' },
        { label: 'Shift Schedule', icon: Calendar, path: '/shifts' },
        { label: 'Salary Structure', icon: TrendingUp, path: '/salary-structure' },
        { label: 'Payslips', icon: Wallet, path: '/payroll' },
        { label: 'IT Declaration', icon: Receipt, path: '/income-tax' },
        { label: 'Loans & Advances', icon: PiggyBank, path: '/loans' },
        { label: 'Gratuity', icon: Shield, path: '/gratuity' },
        { label: 'Org Chart', icon: GitBranch, path: '/org/orgtree' },
        { label: 'Settings', icon: Settings, path: '/settings' },
      ];
    }
    if (role === 'Manager') {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'My Team', icon: Users, path: '/directory' },
        { label: 'Contractors', icon: Briefcase, path: '/contractors' },
        { label: 'Team Attendance', icon: Clock, path: '/attendance' },
        { label: 'Leave Approvals', icon: FileText, path: '/leaves' },
        { label: 'OT Approvals', icon: Hourglass, path: '/overtime' },
        { label: 'Shift Swap Approvals', icon: RefreshCw, path: '/shifts' },
        { label: 'Org Chart', icon: GitBranch, path: '/org/orgtree' },
        { label: 'Reports', icon: FileText, path: '/reports' },
      ];
    }
    if (role === 'Security') {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Gate Logs', icon: DoorOpen, path: '/gate-logs' },
        { label: 'OT Access', icon: Hourglass, path: '/overtime' },
        { label: 'Shift Swaps', icon: RefreshCw, path: '/shifts' },
      ];
    }
    return [];
  };

  const navItems = getNavItems(user.role);

  if (navItems.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30 shadow-xs mb-4 mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-start gap-1.5 py-2.5">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = item.path === '/dashboard'
              ? location.pathname === '/dashboard'
              : (item.path.startsWith('/org')
                  ? location.pathname.startsWith('/org')
                  : location.pathname.startsWith(item.path));
              
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] md:text-[11px] font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white dark:bg-accent dark:text-slate-950 shadow-md scale-102 border border-primary dark:border-accent font-semibold'
                    : 'bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={12} className="shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function EnterpriseLayout({ children }) {
  const { user } = useAuth();
  
  // Mobile drawer state
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Desktop collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isHorizontalLayout = ['Admin', 'HR', 'Finance HR', 'Recruitment HR', 'Operational HR', 'Employee', 'Manager', 'Security'].includes(user.role);

  const handleMenuToggle = () => {
    if (isHorizontalLayout) return; // No sidebar to toggle
    if (window.innerWidth < 1024) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Content offset styling based on sidebar state
  const marginClass = isHorizontalLayout ? '' : (isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[256px]');

  return (
    <div className="min-h-screen flex flex-col bg-bg-custom dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar onMenuToggle={handleMenuToggle} isCollapsed={isCollapsed} />

      {/* Horizontal Nav Bar */}
      {isHorizontalLayout && <HorizontalNav />}

      {/* Outer wrapper */}
      <div className={`flex flex-1 min-h-[calc(100vh-64px)] ${isHorizontalLayout ? 'pt-0' : 'pt-16'}`}>
        {/* Left Sidebar */}
        {!isHorizontalLayout && (
          <Sidebar
            isOpen={isMobileOpen}
            setIsOpen={setIsMobileOpen}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
        )}

        {/* Main Content Area */}
        <div className={`flex flex-col flex-1 w-full min-w-0 transition-all duration-300 ease-in-out ${marginClass}`}>
          <main className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col">
            {/* Breadcrumb Navigation */}
            <Breadcrumbs />

            {/* Main view container */}
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </main>

          {/* Corporate Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
}
