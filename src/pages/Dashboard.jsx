import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHRMS } from '../context/HRMSContext';
import {
  Users, UserCheck, UserX, Calendar, Clock, DollarSign,
  TrendingUp, Award, Activity, ShieldAlert, DoorOpen, Play,
  Globe, FileText, Briefcase, AlertTriangle, Building
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, activeCompany, workforceMode, setWorkforceMode } = useAuth();
  const { employees, attendance, leaves, holidays, gateLogs, overtime, toggleCheckIn, isCheckedIn, shiftSwaps, contractors, contractorOT } = useHRMS();
  const navigate = useNavigate();
  const [localMode, setLocalMode] = useState(workforceMode || 'fte');

  const switchMode = (m) => { setLocalMode(m); setWorkforceMode(m); };

  if (!user) return null;

  const currentRole = user.role;

  // Group contractors by site for site map
  const siteGroups = contractors.reduce((acc, c) => {
    const site = c.site || 'Other';
    if (!acc[site]) acc[site] = [];
    acc[site].push(c);
    return acc;
  }, {});

  // Filter employees and logs
  const activeEmployees = employees.filter(e => e.status === 'Active');
  const inactiveEmployees = employees.filter(e => e.status === 'Inactive');
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = attendance.filter(a => a.date === today);
  const presentCount = todayLogs.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const lateCount = todayLogs.filter(a => a.status === 'Late').length;
  const absentCount = activeEmployees.length - presentCount;

  // Calculate dynamic stats
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
  const pendingOT = overtime.filter(o => o.status === 'Pending').length;

  // 1. Chart Data: Attendance Trend
  const attendanceChartData = [
    { name: 'Mon', Present: 8, Late: 1, Absent: 1 },
    { name: 'Tue', Present: 9, Late: 0, Absent: 1 },
    { name: 'Wed', Present: 7, Late: 2, Absent: 1 },
    { name: 'Thu', Present: 9, Late: 1, Absent: 0 },
    { name: 'Fri', Present: presentCount, Late: lateCount, Absent: absentCount },
  ];

  // 2. Chart Data: Department Distribution
  const deptData = activeEmployees.reduce((acc, emp) => {
    const found = acc.find(d => d.name === emp.department);
    if (found) {
      found.value += 1;
    } else {
      acc.push({ name: emp.department, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#1F3A5F', '#2E75B6', '#2E7D32', '#B8860B', '#B3261E', '#6366F1'];

  // Upcoming Holidays
  const upcomingHolidays = holidays
    .filter(h => new Date(h.date) >= new Date('2026-07-30'))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  // Recent Gate Logs (Security Roster)
  const recentGateLogs = gateLogs.slice(0, 5);

  // Render Stats Cards based on Role
  const renderStatCards = () => {
    const commonCard = (title, val, desc, Icon, color = 'primary') => {
      const colorMap = {
        primary: 'text-primary bg-primary/10 border-primary/20 dark:text-accent dark:bg-accent/10',
        success: 'text-success bg-success/10 border-success/20',
        warning: 'text-warning bg-warning/10 border-warning/20',
        danger: 'text-danger bg-danger/10 border-danger/20',
      };
      
      return (
        <Card className="p-5 flex items-center justify-between" key={title}>
          <div className="text-left">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              {title}
            </span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">
              {val}
            </span>
            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold block mt-1">
              {desc}
            </span>
          </div>
          <div className={`p-3.5 rounded-xl border ${colorMap[color] || colorMap.primary}`}>
            <Icon size={20} />
          </div>
        </Card>
      );
    };

    if (currentRole === 'Admin') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {commonCard('Total Workforces', employees.length, `${activeEmployees.length} Active / ${inactiveEmployees.length} Inactive`, Users, 'primary')}
          {commonCard('Branches Connected', '5 Sites', 'NY, SF, Austin, Chicago, Remote', Globe, 'success')}
          {commonCard('SSO Security Policies', '9 Active', '256-bit encryption configured', Award, 'warning')}
          {commonCard('System Audit Logs', '492 Total', '12 events logged today', ShieldAlert, 'danger')}
        </div>
      );
    }

    if (['HR', 'Finance HR'].includes(currentRole)) {
      if (localMode === 'contractor' && currentRole === 'Finance HR') {
        const activeC = contractors.filter(c => c.status === 'Active').length;
        const totalBill = contractors.filter(c => c.status === 'Active').reduce((s, c) => s + (c.ratePerHour * (c.hoursWorked || 176)), 0);
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {commonCard('Active Contractors', activeC, `${contractors.length} total engaged`, Briefcase, 'primary')}
            {commonCard('Total Contract Cost', `₹${(totalBill/1000).toFixed(0)}K`, 'This billing cycle', DollarSign, 'success')}
            {commonCard('Agencies Engaged', [...new Set(contractors.map(c => c.agency))].length, 'Vendor partners', Award, 'warning')}
            {commonCard('Pending Billing', '2 Invoices', 'Awaiting Finance approval', ShieldAlert, 'danger')}
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {commonCard('Total Salaries YTD', '₹2,22,00,000', 'Annual budget allocation', DollarSign, 'primary')}
          {commonCard('Cost Centers Active', '3 Divisions', 'Engineering, Design, Security', Globe, 'success')}
          {commonCard('Payroll Month Run', 'Completed', 'July cycle run simulations', Award, 'warning')}
          {commonCard('Statutory Comp Tax', 'Active', 'PF / ESIC deductions synced', ShieldAlert, 'success')}
        </div>
      );
    }

    if (currentRole === 'Recruitment HR') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {commonCard('Total Workforce', employees.length, `${activeEmployees.length} Active in registry`, Users, 'primary')}
          {commonCard('Active Openings', '4 Roles', 'Engineering, Product Design, QA', Award, 'success')}
          {commonCard('Onboarding Pipeline', '2 Candidates', 'SSO profiles pending setup', UserCheck, 'warning')}
          {commonCard('F&F Settlement Cases', '1 Closed', '1 employee exited this month', Clock, 'danger')}
        </div>
      );
    }

    if (currentRole === 'Operational HR') {
      if (localMode === 'contractor') {
        const activeC = contractors.filter(c => c.status === 'Active').length;
        const expiring = contractors.filter(c => { const d = Math.round((new Date(c.contractExpiry) - new Date()) / 86400000); return d > 0 && d <= 60; }).length;
        const totalBudget = contractors.filter(c => c.status === 'Active').reduce((s, c) => s + (c.ratePerHour * 176), 0);
        const pendingC = 3; // mock
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {commonCard('Active Contractors', activeC, `${contractors.length} total in system`, Briefcase, 'primary')}
            {commonCard('Expiring in 60 Days', expiring, 'Contract renewals required', AlertTriangle, 'warning')}
            {commonCard('Monthly Bill Est.', `₹${(totalBudget/1000).toFixed(0)}K`, 'Total contractor cost', DollarSign, 'success')}
            {commonCard('Pending Actions', pendingC, 'Attendance / OT approvals', Calendar, 'danger')}
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {commonCard('Total Workforce', employees.length, `${activeEmployees.length} Active in registry`, Users, 'primary')}
          {commonCard('Checked In Today', `${presentCount}/${activeEmployees.length}`, `${lateCount} Late Clock-ins recorded`, UserCheck, 'success')}
          {commonCard('Absent Personnel', absentCount, 'No check-in or leave logs today', UserX, 'danger')}
          {commonCard('Approvals Outstanding', pendingLeaves + pendingOT, `${pendingLeaves} Leaves / ${pendingOT} OT Requests`, Calendar, 'warning')}
        </div>
      );
    }

    if (currentRole === 'Manager') {
      if (localMode === 'contractor') {
        const myC = contractors.filter(c => c.managerEmpId === user.employeeId);
        const activeC = myC.filter(c => c.status === 'Active').length;
        const expC = myC.filter(c => { const d = Math.round((new Date(c.contractExpiry) - new Date()) / 86400000); return d > 0 && d <= 60; }).length;
        const myOT = contractorOT.filter(o => o.status === 'Pending');
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {commonCard('My Contractors', myC.length, `${activeC} Active under my supervision`, Briefcase, 'primary')}
            {commonCard('Expiring Soon', expC, 'Contracts needing renewal', AlertTriangle, 'warning')}
            {commonCard('OT Pending Approval', myOT.length, 'Contractor OT awaiting review', Clock, 'danger')}
            {commonCard('Sites Managed', [...new Set(myC.map(c => c.site))].length, 'Unique sites with contractors', Building, 'success')}
          </div>
        );
      }
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {commonCard('My Direct Reports', '3 Employees', 'Sarah Jenkins, Jonathan, Emily', Users, 'primary')}
          {commonCard('Team Present Today', '2 Checked-In', '1 Employee absent or on leave', UserCheck, 'success')}
          {commonCard('Leaves Pending Approval', pendingLeaves, 'Requires your decision', Calendar, 'warning')}
          {commonCard('Overtime Pending Approval', pendingOT, 'Awaiting review', Clock, 'danger')}
        </div>
      );
    }

    if (currentRole === 'Employee') {
      const selfPendingCount = leaves.filter(l => l.empId === user.employeeId && l.status === 'Pending').length;
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {commonCard('My Roster Shift', 'General Shift (GS)', 'Roster scheduled shift: 9am-6pm', Clock, 'success')}
          {commonCard('Leave Balances', '14.0 Days', 'Available annual/sick quota', Calendar, 'primary')}
          {commonCard('Hours This Month', '158.5 hrs', 'Target: 160 hrs general roster', TrendingUp, 'success')}
          {commonCard('Pending Requests', selfPendingCount, 'Awaiting manager approval', FileText, 'warning')}
        </div>
      );
    }

    if (currentRole === 'Security') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {commonCard('Today\'s Access Logs', gateLogs.length, 'Total RFID Badge scans', DoorOpen, 'primary')}
          {commonCard('Approved OT Entry', pendingOT, 'Awaiting secure clock-ins', Clock, 'warning')}
          {commonCard('Active Shifts Today', '4 Guards', 'Shift roster coverage 100%', ShieldAlert, 'success')}
          {commonCard('Roster System Status', 'ONLINE', 'Secured cloud bridge sync active', Activity, 'success')}
        </div>
      );
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-primary dark:bg-slate-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] rounded-full bg-accent/20 blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-accent mb-2">
            Tenant: {activeCompany}
          </span>
          <h2 className="text-2xl font-bold text-white mb-1">
            Good day, {user.name}!
          </h2>
          <p className="text-slate-300 text-xs font-medium">
            Role: <strong className="text-white">{user.role}</strong> &bull; Department: <strong className="text-white">{user.department}</strong> &bull; Designation: <strong className="text-white">{user.designation}</strong>
          </p>

          {/* FTE / Contractor Toggle for relevant roles */}
          {['Operational HR', 'Finance HR', 'Recruitment HR', 'Manager'].includes(currentRole) && (
            <div className="flex mt-3 bg-white/10 rounded-full p-0.5 w-fit gap-1">
              <button onClick={() => switchMode('fte')}
                className={`px-4 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${localMode === 'fte' ? 'bg-white text-primary' : 'text-white/70 hover:text-white'}`}>
                FTE
              </button>
              <button onClick={() => switchMode('contractor')}
                className={`px-4 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${localMode === 'contractor' ? 'bg-white text-primary' : 'text-white/70 hover:text-white'}`}>
                Contractors
              </button>
            </div>
          )}
        </div>

        {/* Dashboard Quick Action */}
        <div className="mt-4 md:mt-0 flex gap-2 relative z-10">
          {currentRole === 'Employee' && (
            <Button onClick={() => navigate('/leaves')} variant="secondary">Apply Leave</Button>
          )}
          {['HR', 'Recruitment HR'].includes(currentRole) && (
            <Button onClick={() => navigate('/wizard')} variant="accent" className="bg-accent hover:bg-accent/95" icon={Users}>
              Onboard Talent
            </Button>
          )}
          {['HR', 'Finance HR'].includes(currentRole) && (
            <Button onClick={() => navigate(localMode === 'contractor' ? '/payroll?tab=contractors' : '/payroll')} variant="secondary">Run Payroll Run</Button>
          )}
          {['HR', 'Operational HR'].includes(currentRole) && (
            <Button onClick={() => navigate('/leaves')} variant="secondary">View Leave Requests</Button>
          )}
          {currentRole === 'Manager' && (
            <>
              <Button onClick={() => navigate('/leaves')} variant="secondary">View Leave Requests</Button>
              <Button onClick={() => navigate('/overtime')} variant="accent" className="bg-accent hover:bg-accent/95">Overtime Requests</Button>
            </>
          )}
          {currentRole === 'Security' && (
            <Button onClick={() => navigate('/gate-logs')} variant="secondary">Check Access Logs</Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {renderStatCards()}

      {/* Main Grid: Charts & Tables */}
      {localMode === 'contractor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side: Contractor List & Agency breakdown */}
          <div className="lg:col-span-2 space-y-6 text-xs text-left">
            {/* Table: Contractor Engagements */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Active Contractor Engagements</h3>
                  <span className="text-[10px] text-slate-400 font-semibold">Engaged contract staff, PO reference, hourly rate, and monthly rate</span>
                </div>
                <Badge status="Active">Contract Registry</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-[9px] text-slate-500 uppercase font-extrabold tracking-wider">
                    <tr>
                      {['Contractor', 'Agency', 'Role', 'Site', 'Rate/Hr', 'Hours', 'Gross Pay', 'PO Number'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    {contractors.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                        <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">{c.name}</td>
                        <td className="px-4 py-3 text-slate-500">{c.agency}</td>
                        <td className="px-4 py-3">{c.role}</td>
                        <td className="px-4 py-3 text-[10px] text-slate-405">{c.site}</td>
                        <td className="px-4 py-3 font-mono">₹{c.ratePerHour}</td>
                        <td className="px-4 py-3 font-mono">{c.hoursWorked || 0} hrs</td>
                        <td className="px-4 py-3 font-bold text-primary dark:text-accent">₹{(c.ratePerHour * (c.hoursWorked || 176)).toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-[10px] text-slate-405">{c.poNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Contractor Overtime Logs */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Contractor Overtime Approvals</h3>
                  <span className="text-[10px] text-slate-400 font-semibold">Overtime logs, rates, and approval status for contract workers</span>
                </div>
                <Badge status="Warning">Hours Audit</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-[9px] text-slate-500 uppercase font-extrabold tracking-wider">
                    <tr>
                      {['Contractor', 'Agency', 'OT Date', 'OT Hours', 'OT Rate', 'Est. Cost', 'Status'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                    {contractorOT.map(ot => (
                      <tr key={ot.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                        <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">{ot.empName}</td>
                        <td className="px-4 py-3 text-slate-500">{ot.agency}</td>
                        <td className="px-4 py-3 font-mono text-[11px]">{ot.date}</td>
                        <td className="px-4 py-3 font-mono">{ot.hours} hrs</td>
                        <td className="px-4 py-3 font-mono">₹{ot.ratePerHour || 250}</td>
                        <td className="px-4 py-3 font-bold text-primary dark:text-accent">₹{ot.otAmount || (ot.hours * (ot.ratePerHour || 250))}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            ot.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>{ot.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right Side: Agency Billing & Site-wise Breakdown */}
          <div className="space-y-6 text-xs text-left">
            {/* Card: Agency billing summary */}
            <Card className="p-5 space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Agency Billings Summary</h3>
                <span className="text-[10px] text-slate-400 font-semibold">Monthly payout distribution by vendor agency</span>
              </div>
              <div className="space-y-3">
                {['Techforce Services', 'Reliable Staffing', 'StaffPro Solutions'].map(agency => {
                  const activeCons = contractors.filter(c => c.agency === agency && c.status === 'Active');
                  const billing = activeCons.reduce((sum, c) => sum + (c.ratePerHour * (c.hoursWorked || 176)), 0);
                  return (
                    <div key={agency} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex justify-between items-center border border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="font-extrabold text-slate-850 dark:text-slate-200">{agency}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{activeCons.length} active contractors</div>
                      </div>
                      <div className="font-extrabold text-primary dark:text-accent text-[13px]">
                        ₹{billing.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Card: Site distribution */}
            <Card className="p-5 space-y-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Site Deployment Map</h3>
                <span className="text-[10px] text-slate-400 font-semibold">Active contractor deployments per site location</span>
              </div>
              <div className="space-y-2">
                {Object.entries(siteGroups).map(([site, list]) => (
                  <div key={site} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="font-bold text-slate-700 dark:text-slate-350">{site}</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent font-extrabold rounded-full text-[10px]">{list.length} Engaged</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Side: Visual Charts or Audit Logs */}
          <div className="lg:col-span-2 space-y-6">
            {currentRole !== 'Admin' && currentRole !== 'Operational HR' ? (
              <>
                {/* Chart 1: Attendance Trends */}
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-white">Roster Attendance Analytics</h3>
                      <span className="text-[10px] text-slate-400 font-semibold">Weekly clock-in compliance stats</span>
                    </div>
                    <Badge status="Approved">Real-Time</Badge>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={attendanceChartData}>
                        <defs>
                          <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2E75B6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#2E75B6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#B8860B" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#B8860B" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                        <Area type="monotone" dataKey="Present" stroke="#2E75B6" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={2} />
                        <Area type="monotone" dataKey="Late" stroke="#B8860B" fillOpacity={1} fill="url(#colorLate)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Chart 2: Department Headcounts */}
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-white">Department distribution</h3>
                      <span className="text-[10px] text-slate-400 font-semibold">Operational headcount split</span>
                    </div>
                    <Badge status="Active">System Roster</Badge>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deptData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                        <Bar dataKey="value" name="Headcount" fill="#1F3A5F" radius={[4, 4, 0, 0]}>
                          {deptData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </>
            ) : (
              currentRole === 'Admin' ? (
                /* Render Recent Security Audit Logs table for Admin */
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-white">Recent System Security Audit Logs</h3>
                      <span className="text-[10px] text-slate-400 font-semibold">Real-time audit trace logs of all database operations</span>
                    </div>
                    <Badge status="Approved">Security Core</Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                        <tr>
                          <th className="px-4 py-2.5">Audit Event</th>
                          <th className="px-4 py-2.5">User Account</th>
                          <th className="px-4 py-2.5">Client IP Address</th>
                          <th className="px-4 py-2.5">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-650 dark:text-slate-400">
                        {[
                          { id: 1, action: 'User Sign-In (SSO)', user: 'Alexander Wright', ip: '192.168.1.49', timestamp: '25m ago' },
                          { id: 2, action: 'SSO Certificate Renewal', user: 'SYSTEM', ip: '127.0.0.1', timestamp: '1h ago' },
                          { id: 3, action: 'Role Switch Sim', user: 'Rebecca Vance (HR)', ip: '192.168.1.12', timestamp: '2h ago' },
                          { id: 4, action: 'Modified Employee Dossier', user: 'Rebecca Vance (HR)', ip: '192.168.1.12', timestamp: '3h ago' },
                          { id: 5, action: 'Database backup synchronized', user: 'SYSTEM', ip: '127.0.0.1', timestamp: '4h ago' }
                        ].map(log => (
                          <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                            <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{log.action}</td>
                            <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-350">{log.user}</td>
                            <td className="px-4 py-3.5 font-mono">{log.ip}</td>
                            <td className="px-4 py-3.5 text-slate-455">{log.timestamp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                /* Render Operational Task Center for Operational HR */
                <Card className="p-5 space-y-6">
                  <div className="flex items-center justify-between border-b pb-3.5">
                    <div>
                      <h3 className="font-bold text-sm text-slate-850 dark:text-white">Active Operational Task Queue</h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Track pending leave and shift swap approvals requiring immediate action</p>
                    </div>
                    <Badge status="Warning">Action Required</Badge>
                  </div>

                  <div className="space-y-6 text-left">
                    <div>
                      <h4 className="font-bold text-[10px] uppercase text-primary dark:text-accent tracking-wider mb-2.5">Pending Leave Applications</h4>
                      {leaves.filter(l => l.status === 'Pending').length === 0 ? (
                        <div className="py-4 text-center text-slate-400 font-semibold border border-dashed rounded-xl bg-slate-50/30">
                          No pending leave requests.
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-[9px] uppercase font-bold text-slate-450 border-b border-slate-100 dark:border-slate-800">
                              <tr>
                                <th className="px-3 py-2">Employee</th>
                                <th className="px-3 py-2">Leave Type</th>
                                <th className="px-3 py-2">Dates</th>
                                <th className="px-3 py-2 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-855 text-slate-600 dark:text-slate-400">
                              {leaves.filter(l => l.status === 'Pending').map(req => (
                                <tr key={req.id} className="hover:bg-slate-50/30">
                                  <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white">{req.empName}</td>
                                  <td className="px-3 py-2.5 font-semibold">{req.type}</td>
                                  <td className="px-3 py-2.5 text-[10px] font-mono">{req.startDate} to {req.endDate}</td>
                                  <td className="px-3 py-2.5 text-right">
                                    <Button size="xs" onClick={() => navigate('/leaves')} variant="secondary" className="py-0.5 px-2 text-[10px]">Review</Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-[10px] uppercase text-primary dark:text-accent tracking-wider mb-2.5">Pending Shift Swaps</h4>
                      {shiftSwaps && shiftSwaps.filter(s => s.status === 'Pending').length === 0 ? (
                        <div className="py-4 text-center text-slate-400 font-semibold border border-dashed rounded-xl bg-slate-50/30">
                          No pending shift swaps.
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-[9px] uppercase font-bold text-slate-450 border-b border-slate-100 dark:border-slate-800">
                              <tr>
                                <th className="px-3 py-2">Employee</th>
                                <th className="px-3 py-2">Roster Date</th>
                                <th className="px-3 py-2">Proposed Partner</th>
                                <th className="px-3 py-2 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-855 text-slate-600 dark:text-slate-400">
                              {shiftSwaps && shiftSwaps.filter(s => s.status === 'Pending').map(req => (
                                <tr key={req.id} className="hover:bg-slate-50/30">
                                  <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white">{req.empName}</td>
                                  <td className="px-3 py-2.5 text-[10px] font-mono">{req.shiftDate}</td>
                                  <td className="px-3 py-2.5 font-medium">{req.requestWith}</td>
                                  <td className="px-3 py-2.5 text-right">
                                    <Button size="xs" onClick={() => navigate('/shifts')} variant="secondary" className="py-0.5 px-2 text-[10px]">Review</Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            )}
          </div>

          {/* Right Side: System Calendars & Log Logs */}
          <div className="space-y-6">
            {/* Upcoming Holidays Widget */}
            <Card className="p-5">
              <div className="mb-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Upcoming Holidays</h3>
                <span className="text-[10px] text-slate-400 font-semibold">Corporate calendar schedule</span>
              </div>
              <div className="space-y-3">
                {upcomingHolidays.map(holiday => (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="text-left">
                      <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {holiday.name}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                        Calendar: {holiday.calendar}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-bold text-primary dark:text-accent">
                        {new Date(holiday.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-505 font-bold border border-slate-200 dark:border-slate-700">
                        {holiday.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/holidays')}
                className="w-full mt-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-xl text-xs font-bold transition-all text-slate-655 dark:text-slate-350 cursor-pointer"
              >
                View Full Calendars
              </button>
            </Card>

            {currentRole === 'Security' ? (
              <Card className="p-5">
                <div className="mb-4">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">Live RFID scans</h3>
                  <span className="text-[10px] text-slate-400 font-semibold">Access gate entry list</span>
                </div>
                <div className="space-y-3">
                  {recentGateLogs.map(log => (
                    <div key={log.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-xs">
                      <div className="text-left">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{log.empName}</span>
                        <p className="text-[10px] text-slate-400">{log.timestamp}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                          log.type === 'Entry'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {log.type}
                        </span>
                        <p className="text-[9px] text-slate-455 mt-0.5">{log.gate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              ['HR', 'Manager'].includes(currentRole) && (
                <Card className="p-5">
                  <div className="mb-4">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">Outstanding Task Approvals</h3>
                    <span className="text-[10px] text-slate-400 font-semibold">Needs review and action</span>
                  </div>
                  {leaves.filter(l => l.status === 'Pending').length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 font-semibold">
                      No approvals pending at this time.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leaves.filter(l => l.status === 'Pending').slice(0, 3).map(req => (
                        <div key={req.id} className="p-3 border border-slate-150 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 text-xs flex justify-between items-center">
                          <div className="text-left">
                            <span className="font-bold text-slate-800 dark:text-slate-255">{req.empName}</span>
                            <p className="text-[10px] text-slate-550 dark:text-slate-400">{req.type} &bull; {req.startDate} to {req.endDate}</p>
                          </div>
                          <Button
                            onClick={() => navigate('/leaves')}
                            variant="secondary"
                            size="sm"
                            className="py-1 px-2.5 text-[11px]"
                          >
                            Review
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )
            )}
            
            {currentRole === 'Employee' && (
              <Card className="p-5">
                <div className="mb-4">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">My Recent Leave Requests</h3>
                  <span className="text-[10px] text-slate-400 font-semibold">Track details and approval status</span>
                </div>
                {leaves.filter(l => l.empId === user.employeeId).length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-405 font-semibold">
                    No leave requests logged yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaves.filter(l => l.empId === user.employeeId).slice(0, 3).map(req => (
                      <div key={req.id} className="p-3 border border-slate-155 dark:border-slate-800 rounded-lg text-xs flex justify-between items-center">
                        <div className="text-left">
                          <span className="font-bold text-slate-800 dark:text-slate-205">{req.type}</span>
                          <p className="text-[10px] text-slate-455 mt-0.5">{req.startDate} to {req.endDate}</p>
                        </div>
                        <Badge status={req.status} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
