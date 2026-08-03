import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  if (location.pathname === '/dashboard' || location.pathname === '/login' || location.pathname === '/') {
    return null; // Skip breadcrumbs for dashboard or login
  }

  // Format mapping for nice labels
  const labelMap = {
    'org': 'Organization',
    'companies': 'Companies',
    'branches': 'Branches',
    'departments': 'Departments',
    'locations': 'Locations',
    'designations': 'Designations',
    'admin': 'Administration',
    'permissions': 'Roles & Permissions',
    'holidays': 'Holiday Calendars',
    'policies': 'Policies',
    'leave': 'Leave Policies',
    'ot': 'OT Policies',
    'salary': 'Salary Components',
    'workflow': 'Workflow Config',
    'audit-logs': 'Audit Logs',
    'directory': 'Employee Directory',
    'wizard': 'Employee Wizard',
    'employees': 'Employees',
    'import': 'Bulk Import',
    'attendance': 'Attendance & Time',
    'leaves': 'Leave Administration',
    'shifts': 'Shift Administration',
    'overtime': 'Overtime & Comp-Off',
    'payroll': 'Payroll Center',
    'fnf': 'Full & Final',
    'cost-centers': 'Cost Centers',
    'reports': 'System Reports',
    'settings': 'Settings',
    'profile': 'My Profile'
  };

  const getLabel = (str) => {
    if (labelMap[str]) return labelMap[str];
    // If it is an employee ID (e.g. EMP-xxx)
    if (str.startsWith('EMP-')) return str;
    // Fallback format
    return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400 py-3 px-4 mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 text-slate-650 dark:text-slate-350 hover:text-primary dark:hover:text-accent transition-colors"
      >
        <Home size={13} />
        <span>Dashboard</span>
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = getLabel(value);

        return (
          <React.Fragment key={to}>
            <ChevronRight size={12} className="text-slate-350 dark:text-slate-600 shrink-0" />
            {isLast ? (
              <span className="text-slate-800 dark:text-slate-250 truncate">{label}</span>
            ) : (
              <Link
                to={to}
                className="hover:text-primary dark:hover:text-accent transition-colors truncate"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
