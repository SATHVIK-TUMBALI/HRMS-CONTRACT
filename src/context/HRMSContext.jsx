import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const HRMSContext = createContext();

const INITIAL_EMPLOYEES = [
  { id: 'EMP-001', name: 'Alexander Wright', email: 'a.wright@enterprise.corp', department: 'Executive Board', designation: 'Managing Director & VP', manager: 'Board of Directors', status: 'Active', salary: 285000, shift: 'General Shift (09:00 - 18:00)', holidayCalendar: 'National Calendar', joiningDate: '2021-01-15', location: 'New York HQ', phone: '+1 (555) 019-2831' },
  { id: 'EMP-004', name: 'Rebecca Vance', email: 'r.vance@enterprise.corp', department: 'Human Resources', designation: 'Chief HR Officer', manager: 'Alexander Wright', status: 'Active', salary: 165000, shift: 'General Shift (09:00 - 18:00)', holidayCalendar: 'National Calendar', joiningDate: '2021-08-10', location: 'New York HQ', phone: '+1 (555) 019-5832' },
  { id: 'EMP-012', name: 'David Miller', email: 'd.miller@enterprise.corp', department: 'Engineering Division', designation: 'Engineering Manager', manager: 'Alexander Wright', status: 'Active', salary: 145000, shift: 'General Shift (09:00 - 18:00)', holidayCalendar: 'National Calendar', joiningDate: '2022-03-01', location: 'San Francisco Hub', phone: '+1 (555) 018-4921' },
  { id: 'EMP-108', name: 'Sarah Jenkins', email: 's.jenkins@enterprise.corp', department: 'Product Design', designation: 'Senior UI/UX Designer', manager: 'David Miller', status: 'Active', salary: 98000, shift: 'Evening Shift (14:00 - 22:00)', holidayCalendar: 'Regional Calendar A', joiningDate: '2023-05-12', location: 'San Francisco Hub', phone: '+1 (555) 017-3819' },
  { id: 'EMP-902', name: 'Marcus Chen', email: 'm.chen@security.corp', department: 'Loss Prevention', designation: 'Safety & Access Lead', manager: 'Rebecca Vance', status: 'Active', salary: 72000, shift: 'Morning Shift (06:00 - 14:00)', holidayCalendar: 'National Calendar', joiningDate: '2022-11-20', location: 'New York HQ', phone: '+1 (555) 014-9988' },
  { id: 'EMP-102', name: 'Jonathan Carter', email: 'j.carter@enterprise.corp', department: 'Engineering Division', designation: 'Senior Devops Engineer', manager: 'David Miller', status: 'Active', salary: 125000, shift: 'Night Shift (22:00 - 06:00)', holidayCalendar: 'National Calendar', joiningDate: '2022-06-15', location: 'Austin Office', phone: '+1 (555) 012-7492' },
  { id: 'EMP-103', name: 'Emily Watson', email: 'e.watson@enterprise.corp', department: 'Product Design', designation: 'Interaction Designer', manager: 'Sarah Jenkins', status: 'Active', salary: 82000, shift: 'Morning Shift (06:00 - 14:00)', holidayCalendar: 'Regional Calendar A', joiningDate: '2024-02-10', location: 'Remote', phone: '+1 (555) 011-8402' },
  { id: 'EMP-104', name: 'Michael Novak', email: 'm.novak@enterprise.corp', department: 'Marketing', designation: 'Growth Director', manager: 'Alexander Wright', status: 'Active', salary: 110000, shift: 'Evening Shift (14:00 - 22:00)', holidayCalendar: 'National Calendar', joiningDate: '2023-01-22', location: 'New York HQ', phone: '+1 (555) 013-6492' },
  { id: 'EMP-105', name: 'Jessica Patel', email: 'j.patel@enterprise.corp', department: 'Sales Division', designation: 'Account Executive', manager: 'Michael Novak', status: 'Active', salary: 85000, shift: 'Night Shift (22:00 - 06:00)', holidayCalendar: 'National Calendar', joiningDate: '2023-09-01', location: 'Chicago Hub', phone: '+1 (555) 015-8492' },
  { id: 'EMP-106', name: 'Tyler Durden', email: 't.durden@enterprise.corp', department: 'Operations', designation: 'Operations Specialist', manager: 'Alexander Wright', status: 'Inactive', salary: 90000, shift: 'Night Shift (22:00 - 06:00)', holidayCalendar: 'National Calendar', joiningDate: '2022-02-15', location: 'New York HQ', phone: '+1 (555) 016-9281' },
];

const INITIAL_ATTENDANCE = [
  { id: 'ATT-101', empId: 'EMP-108', date: '2026-07-30', checkIn: '02:00 PM', checkOut: '10:00 PM', workingHours: '8.0 hrs', status: 'Present', late: false },
  { id: 'ATT-102', empId: 'EMP-012', date: '2026-07-30', checkIn: '08:58 AM', checkOut: '06:12 PM', workingHours: '9.2 hrs', status: 'Present', late: false },
  { id: 'ATT-103', empId: 'EMP-004', date: '2026-07-30', checkIn: '09:15 AM', checkOut: '05:30 PM', workingHours: '8.2 hrs', status: 'Late', late: true },
  { id: 'ATT-104', empId: 'EMP-102', date: '2026-07-30', checkIn: '10:02 PM', checkOut: '06:00 AM', workingHours: '8.0 hrs', status: 'Present', late: false },
  { id: 'ATT-105', empId: 'EMP-103', date: '2026-07-30', checkIn: '--', checkOut: '--', workingHours: '0.0 hrs', status: 'Absent', late: false },
  { id: 'ATT-106', empId: 'EMP-105', date: '2026-07-30', checkIn: '09:45 PM', checkOut: '06:00 AM', workingHours: '8.2 hrs', status: 'Present', late: false },
  { id: 'ATT-107', empId: 'EMP-902', date: '2026-07-30', checkIn: '05:50 AM', checkOut: '02:05 PM', workingHours: '8.2 hrs', status: 'Present', late: false },

  // Previous days
  { id: 'ATT-201', empId: 'EMP-108', date: '2026-07-29', checkIn: '01:55 PM', checkOut: '10:02 PM', workingHours: '8.1 hrs', status: 'Present', late: false },
  { id: 'ATT-202', empId: 'EMP-012', date: '2026-07-29', checkIn: '09:05 AM', checkOut: '06:00 PM', workingHours: '8.9 hrs', status: 'Present', late: false },
  { id: 'ATT-203', empId: 'EMP-004', date: '2026-07-29', checkIn: '08:48 AM', checkOut: '06:00 PM', workingHours: '9.2 hrs', status: 'Present', late: false },
];

const INITIAL_LEAVES = [
  { id: 'LV-101', empId: 'EMP-108', empName: 'Sarah Jenkins', type: 'Annual Leave', startDate: '2026-08-15', endDate: '2026-08-18', reason: 'Family vacation trip', status: 'Approved', comments: 'Have a great trip!', branch: 'San Francisco Hub', managerName: 'David Miller' },
  { id: 'LV-102', empId: 'EMP-103', empName: 'Emily Watson', type: 'Sick Leave', startDate: '2026-07-31', endDate: '2026-08-01', reason: 'High fever and flu', status: 'Pending', comments: '', branch: 'Remote', managerName: 'Sarah Jenkins' },
  { id: 'LV-103', empId: 'EMP-102', empName: 'Jonathan Carter', type: 'Casual Leave', startDate: '2026-07-20', endDate: '2026-07-21', reason: 'Personal work at hometown', status: 'Approved', comments: 'Approved by DM', branch: 'Austin Office', managerName: 'David Miller' },
  { id: 'LV-104', empId: 'EMP-105', empName: 'Jessica Patel', type: 'Maternity Leave', startDate: '2026-09-01', endDate: '2026-11-30', reason: 'Maternity period', status: 'Pending', comments: '', branch: 'Chicago Hub', managerName: 'Michael Novak' },
];

const INITIAL_OT = [
  { id: 'OT-101', empId: 'EMP-108', empName: 'Sarah Jenkins', date: '2026-07-28', hours: 4, reason: 'Q3 UI design sprint delivery', status: 'Approved', approvedBy: 'David Miller', branch: 'San Francisco Hub', managerName: 'David Miller' },
  { id: 'OT-102', empId: 'EMP-102', empName: 'Jonathan Carter', date: '2026-07-29', hours: 6, reason: 'Production server migration patch', status: 'Pending Manager', approvedBy: '', branch: 'Austin Office', managerName: 'David Miller' },
  { id: 'OT-103', empId: 'EMP-902', empName: 'Marcus Chen', date: '2026-07-30', hours: 8, reason: 'Double shift support coverage', status: 'Approved', approvedBy: 'Rebecca Vance', branch: 'New York HQ', managerName: 'Rebecca Vance' }
];

const INITIAL_SHIFTS = [
  { empId: 'EMP-001', empName: 'Alexander Wright', monday: 'GS', tuesday: 'GS', wednesday: 'GS', thursday: 'GS', friday: 'GS', saturday: 'OFF', sunday: 'OFF' },
  { empId: 'EMP-004', empName: 'Rebecca Vance', monday: 'GS', tuesday: 'GS', wednesday: 'GS', thursday: 'GS', friday: 'GS', saturday: 'OFF', sunday: 'OFF' },
  { empId: 'EMP-012', empName: 'David Miller', monday: 'GS', tuesday: 'GS', wednesday: 'GS', thursday: 'GS', friday: 'GS', saturday: 'OFF', sunday: 'OFF' },
  { empId: 'EMP-108', empName: 'Sarah Jenkins', monday: 'ES', tuesday: 'ES', wednesday: 'ES', thursday: 'ES', friday: 'ES', saturday: 'OFF', sunday: 'OFF' },
  { empId: 'EMP-902', empName: 'Marcus Chen', monday: 'MS', tuesday: 'MS', wednesday: 'MS', thursday: 'MS', friday: 'MS', saturday: 'OFF', sunday: 'OFF' },
  { empId: 'EMP-102', empName: 'Jonathan Carter', monday: 'NS', tuesday: 'NS', wednesday: 'NS', thursday: 'NS', friday: 'NS', saturday: 'OFF', sunday: 'OFF' },
  { empId: 'EMP-103', empName: 'Emily Watson', monday: 'MS', tuesday: 'MS', wednesday: 'MS', thursday: 'MS', friday: 'MS', saturday: 'OFF', sunday: 'OFF' },
  { empId: 'EMP-104', empName: 'Michael Novak', monday: 'ES', tuesday: 'ES', wednesday: 'ES', thursday: 'ES', friday: 'ES', saturday: 'OFF', sunday: 'OFF' },
  { empId: 'EMP-105', empName: 'Jessica Patel', monday: 'NS', tuesday: 'NS', wednesday: 'NS', thursday: 'NS', friday: 'NS', saturday: 'OFF', sunday: 'OFF' },
  { empId: 'EMP-106', empName: 'Tyler Durden', monday: 'NS', tuesday: 'NS', wednesday: 'NS', thursday: 'NS', friday: 'NS', saturday: 'OFF', sunday: 'OFF' }
];

const INITIAL_HOLIDAYS = [
  { id: 'H-1', name: 'New Year\'s Day', date: '2026-01-01', type: 'Public', calendar: 'All' },
  { id: 'H-2', name: 'Good Friday', date: '2026-04-03', type: 'Public', calendar: 'All' },
  { id: 'H-3', name: 'Memorial Day', date: '2026-05-25', type: 'Public', calendar: 'National Calendar' },
  { id: 'H-4', name: 'Independence Day', date: '2026-07-04', type: 'Public', calendar: 'All' },
  { id: 'H-5', name: 'Founder\'s Day Celebration', date: '2026-08-10', type: 'Restricted', calendar: 'Regional Calendar A' },
  { id: 'H-6', name: 'Labor Day', date: '2026-09-07', type: 'Public', calendar: 'All' },
  { id: 'H-7', name: 'Thanksgiving Day', date: '2026-11-26', type: 'Public', calendar: 'All' },
  { id: 'H-8', name: 'Christmas Day', date: '2026-12-25', type: 'Public', calendar: 'All' }
];

const INITIAL_GATE_LOGS = [
  { id: 'GL-01', empId: 'EMP-902', empName: 'Marcus Chen', timestamp: '2026-07-30 05:48 AM', type: 'Entry', gate: 'Gate A (Main)', verifiedBy: 'System Scan' },
  { id: 'GL-02', empId: 'EMP-108', empName: 'Sarah Jenkins', timestamp: '2026-07-30 08:50 AM', type: 'Entry', gate: 'Gate A (Main)', verifiedBy: 'RFID Badge' },
  { id: 'GL-03', empId: 'EMP-012', empName: 'David Miller', timestamp: '2026-07-30 08:55 AM', type: 'Entry', gate: 'Gate B (Staff)', verifiedBy: 'RFID Badge' },
  { id: 'GL-04', empId: 'EMP-004', empName: 'Rebecca Vance', timestamp: '2026-07-30 09:12 AM', type: 'Entry', gate: 'Gate A (Main)', verifiedBy: 'RFID Badge' },
  { id: 'GL-05', empId: 'EMP-902', empName: 'Marcus Chen', timestamp: '2026-07-30 02:08 PM', type: 'Exit', gate: 'Gate B (Staff)', verifiedBy: 'System Scan' }
];

const SHIFT_SWAPS = [
  { id: 'SS-101', empId: 'EMP-108', empName: 'Sarah Jenkins', shiftDate: '2026-08-04', currentShift: 'General Shift', targetShift: 'Morning Shift', requestWith: 'Marcus Chen', status: 'Pending', empDept: 'Product Design', currentShiftCode: 'GS', targetShiftCode: 'MS', targetEmpId: 'EMP-902' }
];

const INITIAL_CONTRACTORS = [
  { id: 'CON-001', name: 'Rohan Sharma', agency: 'Techforce Services', role: 'Data Entry Operator', department: 'Operations', joiningDate: '2025-06-10', contractExpiry: '2026-12-31', ratePerHour: 250, shift: 'General Shift (09:00 - 18:00)', manager: 'David Miller', location: 'San Francisco Hub', site: 'Floor 3 Hub', status: 'Active', salary: 40000, isContractor: true },
  { id: 'CON-002', name: 'Ananya Roy', agency: 'Reliable Staffing', role: 'Support Representative', department: 'Loss Prevention', joiningDate: '2025-08-15', contractExpiry: '2026-08-14', ratePerHour: 200, shift: 'Morning Shift (06:00 - 14:00)', manager: 'Marcus Chen', location: 'New York HQ', site: 'Front Access Gate', status: 'Active', salary: 32000, isContractor: true },
  { id: 'CON-003', name: 'Vikram Singh', agency: 'Techforce Services', role: 'Quality Analyst', department: 'Product Design', joiningDate: '2026-02-01', contractExpiry: '2026-07-31', ratePerHour: 300, shift: 'Evening Shift (14:00 - 22:00)', manager: 'Sarah Jenkins', location: 'San Francisco Hub', site: 'Floor 4 Hub', status: 'Active', salary: 48000, isContractor: true },
];

export const HRMSProvider = ({ children }) => {
  const { user, addNotification } = useAuth();
  
  // State buckets
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [contractors, setContractors] = useState(INITIAL_CONTRACTORS);
  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
  const [leaves, setLeaves] = useState(INITIAL_LEAVES);
  const [overtime, setOvertime] = useState(INITIAL_OT);
  const [shifts, setShifts] = useState(INITIAL_SHIFTS);
  const [holidays, setHolidays] = useState(INITIAL_HOLIDAYS);
  const [gateLogs, setGateLogs] = useState(INITIAL_GATE_LOGS);
  const [shiftSwaps, setShiftSwaps] = useState(SHIFT_SWAPS);

  // Dynamic values calculated based on logged in user
  const [leaveBalances, setLeaveBalances] = useState({
    'Annual Leave': { allocated: 20, used: 4, pending: 0 },
    'Sick Leave': { allocated: 12, used: 2, pending: 1 },
    'Casual Leave': { allocated: 10, used: 2, pending: 0 },
    'Compensatory Off': { allocated: 5, used: 1, pending: 0 },
    'Optional Holiday': { allocated: 3, used: 1, pending: 0 }
  });

  const [managerInvites, setManagerInvites] = useState([
    { id: 'INV-101', empId: 'EMP-108', empName: 'Sarah Jenkins', date: '2026-08-05', type: 'Overtime', hours: 4, reason: 'Emergency design layout fix', managerName: 'David Miller', status: 'Pending' },
  ]);

  const [loans, setLoans] = useState([
    { id: 'LN-101', empId: 'EMP-108', empName: 'Sarah Jenkins', type: 'Salary Advance', amount: 50000, tenureMonths: 10, interestRate: 5, emi: 5208, paidMonths: 3, remainingAmount: 34376, status: 'Active' },
    { id: 'LN-102', empId: 'EMP-103', empName: 'Emily Watson', type: 'Personal Loan', amount: 100000, tenureMonths: 12, interestRate: 8, emi: 8700, paidMonths: 0, remainingAmount: 100000, status: 'Pending Approval' }
  ]);

  const [offcycleRuns, setOffcycleRuns] = useState([
    { id: 'OFF-101', type: 'Bonus', empId: 'EMP-108', empName: 'Sarah Jenkins', amount: 15000, date: '2026-07-28', managerName: 'David Miller', status: 'Approved', paidDate: '2026-07-29' },
    { id: 'OFF-102', type: 'Incentive', empId: 'EMP-103', empName: 'Emily Watson', amount: 8000, date: '2026-08-02', managerName: 'Sarah Jenkins', status: 'Pending Approval' }
  ]);

  const [taxDeclarations, setTaxDeclarations] = useState([
    { empId: 'EMP-108', regime: 'New', totalExemptions: 150000, proofsSubmitted: 2, status: 'Verified', bankAccount: 'HDFC Bank - ****4829', ifsc: 'HDFC0000123' },
    { empId: 'EMP-103', regime: 'Old', totalExemptions: 80000, proofsSubmitted: 1, status: 'Pending Verification', bankAccount: 'SBI - ****9012', ifsc: 'SBIN0000456' }
  ]);

  const [adminConfigs, setAdminConfigs] = useState({
    enableLoans: true,
    enableTaxProofs: true,
    enableShiftSwaps: true,
    enableGratuity: true,
    enableOffcycle: true,
    contractorApprovalChain: 'Manager+HR'
  });

  // Current checked-in status of current user
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);

  // Sync check in status for active user from current day's logs
  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const todayLog = attendance.find(a => a.empId === user.employeeId && a.date === today);
      if (todayLog && todayLog.checkIn !== '--') {
        setIsCheckedIn(true);
        setCheckInTime(todayLog.checkIn);
      } else {
        setIsCheckedIn(false);
        setCheckInTime(null);
      }
    }
  }, [user, attendance]);

  // Methods
  const addEmployee = (newEmployee) => {
    setEmployees(prev => [
      {
        ...newEmployee,
        status: 'Active',
        id: `EMP-${Math.floor(100 + Math.random() * 900)}`
      },
      ...prev
    ]);
    addNotification(
      'New Employee Registered',
      `${newEmployee.name} has been added as ${newEmployee.designation} in ${newEmployee.department}.`,
      'info',
      'HR'
    );
  };

  const deleteEmployee = (id) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const updateEmployee = (id, updatedFields) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updatedFields } : emp));
  };

  const toggleCheckIn = () => {
    if (!user) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = now.toISOString().split('T')[0];

    if (!isCheckedIn) {
      // Clock in
      setIsCheckedIn(true);
      setCheckInTime(timeStr);
      
      // Update attendance list
      setAttendance(prev => {
        const filtered = prev.filter(a => !(a.empId === user.employeeId && a.date === today));
        return [
          {
            id: `ATT-${Date.now()}`,
            empId: user.employeeId,
            date: today,
            checkIn: timeStr,
            checkOut: '--',
            workingHours: 'In progress',
            status: 'Present',
            late: now.getHours() >= 9 && now.getMinutes() > 15
          },
          ...filtered
        ];
      });

      // Add security gate entry log
      setGateLogs(prev => [
        {
          id: `GL-${Date.now()}`,
          empId: user.employeeId,
          empName: user.name,
          timestamp: `${today} ${timeStr}`,
          type: 'Entry',
          gate: 'Gate A (Main)',
          verifiedBy: 'System Clock-In'
        },
        ...prev
      ]);

      addNotification('Check In Successful', `You clocked in at ${timeStr}.`, 'info');
    } else {
      // Clock out
      setIsCheckedIn(false);
      
      // Update attendance list
      setAttendance(prev => {
        return prev.map(item => {
          if (item.empId === user.employeeId && item.date === today) {
            // Estimate hours
            const startHour = parseInt(item.checkIn.split(':')[0]) + (item.checkIn.includes('PM') && !item.checkIn.startsWith('12') ? 12 : 0);
            const startMin = parseInt(item.checkIn.split(':')[1].split(' ')[0]);
            const elapsedHours = Math.abs(now.getHours() - startHour) + (now.getMinutes() - startMin) / 60;
            return {
              ...item,
              checkOut: timeStr,
              workingHours: `${elapsedHours.toFixed(1)} hrs`,
              status: item.late ? 'Late' : 'Present'
            };
          }
          return item;
        });
      });

      // Add security gate exit log
      setGateLogs(prev => [
        {
          id: `GL-${Date.now()}`,
          empId: user.employeeId,
          empName: user.name,
          timestamp: `${today} ${timeStr}`,
          type: 'Exit',
          gate: 'Gate A (Main)',
          verifiedBy: 'System Clock-Out'
        },
        ...prev
      ]);

      addNotification('Check Out Successful', `You clocked out at ${timeStr}.`, 'info');
      setCheckInTime(null);
    }
  };

  const applyLeave = (leaveType, startDate, endDate, reason) => {
    if (!user) return;
    const newLeave = {
      id: `LV-${Date.now().toString().slice(-3)}`,
      empId: user.employeeId,
      empName: user.name,
      type: leaveType,
      startDate,
      endDate,
      reason,
      status: 'Pending',
      comments: '',
      branch: user.location || 'HQ',
      managerName: user.manager || 'David Miller'
    };
    setLeaves(prev => [newLeave, ...prev]);
    
    // Update pending count in balance
    setLeaveBalances(prev => {
      const current = prev[leaveType];
      if (current) {
        return {
          ...prev,
          [leaveType]: { ...current, pending: current.pending + 1 }
        };
      }
      return prev;
    });

    addNotification(
      'Leave Applied Successfully',
      `Your request for ${leaveType} (${startDate} to ${endDate}) has been submitted.`,
      'info'
    );
    
    // Add alert notification for Managers
    addNotification(
      'New Leave Approval Needed',
      `${user.name} applied for ${leaveType} starting ${startDate}.`,
      'pending',
      'Manager'
    );
  };

  const updateLeaveStatus = (id, newStatus, comments = '') => {
    let affectedLeave = null;
    setLeaves(prev => prev.map(leave => {
      if (leave.id === id) {
        affectedLeave = leave;
        return { ...leave, status: newStatus, comments };
      }
      return leave;
    }));

    if (affectedLeave) {
      // Update balances if approved
      if (newStatus === 'Approved') {
        setLeaveBalances(prev => {
          const type = affectedLeave.type;
          const current = prev[type];
          if (current) {
            // Calculate days between
            const sDate = new Date(affectedLeave.startDate);
            const eDate = new Date(affectedLeave.endDate);
            const days = Math.round((eDate - sDate) / (1000 * 60 * 60 * 24)) + 1;
            return {
              ...prev,
              [type]: {
                ...current,
                used: current.used + days,
                pending: Math.max(0, current.pending - 1)
              }
            };
          }
          return prev;
        });
      } else if (newStatus === 'Rejected') {
        setLeaveBalances(prev => {
          const type = affectedLeave.type;
          const current = prev[type];
          if (current) {
            return {
              ...prev,
              [type]: { ...current, pending: Math.max(0, current.pending - 1) }
            };
          }
          return prev;
        });
      }

      // Notify the applicant
      addNotification(
        `Leave Request ${newStatus}`,
        `Your request for ${affectedLeave.type} has been ${newStatus.toLowerCase()}.`,
        newStatus === 'Approved' ? 'info' : 'warning'
      );
    }
  };

  const applyOvertime = (date, hours, reason) => {
    if (!user) return;
    const newOT = {
      id: `OT-${Date.now().toString().slice(-3)}`,
      empId: user.employeeId,
      empName: user.name,
      date,
      hours: parseInt(hours),
      reason,
      status: 'Pending Manager',
      approvedBy: '',
      branch: user.location || 'HQ',
      managerName: user.manager || 'David Miller'
    };
    setOvertime(prev => [newOT, ...prev]);

    addNotification(
      'OT Request Submitted',
      `Requested ${hours} hrs of overtime for ${date}.`,
      'info'
    );
  };

  const updateOTStatus = (id, action, isHRRole = false) => {
    let affectedOT = null;
    setOvertime(prev => prev.map(ot => {
      if (ot.id === id) {
        let newStatus = ot.status;
        if (isHRRole) {
          newStatus = action === 'approve' ? 'Approved' : 'Rejected';
        } else {
          newStatus = action === 'approve' ? 'Pending HR' : 'Rejected';
        }
        affectedOT = { ...ot, status: newStatus };
        return { ...ot, status: newStatus, approvedBy: isHRRole ? user.name : ot.approvedBy };
      }
      return ot;
    }));

    if (affectedOT) {
      const nextStep = affectedOT.status === 'Pending HR' ? 'submitted to HR for final approval' : affectedOT.status.toLowerCase();
      addNotification(
        `Overtime ${affectedOT.status}`,
        `Overtime request of ${affectedOT.hours} hrs for ${affectedOT.date} has been ${nextStep}.`,
        affectedOT.status === 'Rejected' ? 'warning' : 'info'
      );

      if (affectedOT.status === 'Approved') {
        addNotification(
          `OT Access Pre-authorized`,
          `${affectedOT.empName} approved for ${affectedOT.hours} hrs OT on ${affectedOT.date}. Access allowed.`,
          'info',
          'Security'
        );
      }
    }
  };

  const sendManagerInvite = (empId, date, type, hours, reason) => {
    const emp = employees.find(e => e.id === empId) || contractors.find(c => c.id === empId);
    const newInvite = {
      id: `INV-${Date.now().toString().slice(-3)}`,
      empId,
      empName: emp ? emp.name : 'Unknown',
      date,
      type,
      hours: parseInt(hours),
      reason,
      managerName: user.name,
      status: 'Pending'
    };
    setManagerInvites(prev => [newInvite, ...prev]);
    addNotification(
      'OT/Comp-Off Call Issued',
      `Sent ${type} duty request to ${newInvite.empName} for ${date}.`,
      'info'
    );
  };

  const respondToInvite = (inviteId, accept) => {
    setManagerInvites(prev => prev.map(inv => {
      if (inv.id === inviteId) {
        const newStatus = accept ? 'Accepted' : 'Rejected';
        if (accept) {
          // Auto approve and insert into records
          if (inv.type === 'Overtime') {
            const newOT = {
              id: `OT-${Date.now().toString().slice(-3)}`,
              empId: inv.empId,
              empName: inv.empName,
              date: inv.date,
              hours: inv.hours,
              reason: inv.reason,
              status: 'Approved',
              approvedBy: inv.managerName,
              branch: 'Operations',
              managerName: inv.managerName
            };
            setOvertime(prevOT => [newOT, ...prevOT]);
          } else {
            // Add a comp off leave credit
            setLeaveBalances(prev => {
              const current = prev['Compensatory Off'];
              if (current) {
                return {
                  ...prev,
                  'Compensatory Off': { ...current, allocated: current.allocated + 1 }
                };
              }
              return prev;
            });
          }
        }
        return { ...inv, status: newStatus };
      }
      return inv;
    }));
  };

  const requestShiftSwap = (shiftDate, currentShift, targetShift, swapWithEmployee, dayOfWeek, targetEmpId, currentShiftCode, targetShiftCode) => {
    if (!user) return;
    const newSwap = {
      id: `SS-${Date.now().toString().slice(-3)}`,
      empId: user.employeeId,
      empName: user.name,
      empDept: user.department,
      shiftDate,
      currentShift,
      targetShift,
      requestWith: swapWithEmployee,
      status: 'Pending Employee',
      dayOfWeek: dayOfWeek || 'monday',
      targetEmpId,
      currentShiftCode,
      targetShiftCode
    };
    setShiftSwaps(prev => [newSwap, ...prev]);
    addNotification('Shift Swap Requested', `Swap request submitted to ${swapWithEmployee}.`, 'info');
  };

  const updateShiftSwapStatus = (id, action, roleType) => {
    setShiftSwaps(prev => prev.map(swap => {
      if (swap.id === id) {
        let newStatus = swap.status;
        if (roleType === 'TargetEmployee') {
          newStatus = action === 'accept' ? 'Pending Target Manager' : 'Rejected';
        } else if (roleType === 'TargetManager') {
          newStatus = action === 'approve' ? 'Pending Origin Manager' : 'Rejected';
        } else if (roleType === 'OriginManager') {
          if (action === 'approve') {
            newStatus = 'Approved';
            // Perform shift swapping in database
            setShifts(prevShifts => prevShifts.map(s => {
              if (s.empId === swap.empId) {
                return { ...s, [swap.dayOfWeek]: swap.targetShiftCode };
              }
              if (s.empId === swap.targetEmpId) {
                return { ...s, [swap.dayOfWeek]: swap.currentShiftCode };
              }
              return s;
            }));
          } else {
            newStatus = 'Rejected';
          }
        }
        return { ...swap, status: newStatus };
      }
      return swap;
    }));
  };

  const addGateLog = (empId, type, gate) => {
    const emp = employees.find(e => e.id === empId);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = now.toISOString().split('T')[0];
    
    const newLog = {
      id: `GL-${Date.now()}`,
      empId,
      empName: emp ? emp.name : 'Unknown Employee',
      timestamp: `${today} ${timeStr}`,
      type,
      gate: gate || 'Gate A (Main)',
      verifiedBy: 'Security Manual Scan'
    };
    
    setGateLogs(prev => [newLog, ...prev]);
    addNotification(
      'Gate Event Logged',
      `${newLog.empName} registered for ${type} at ${newLog.gate}.`,
      'info',
      'HR'
    );
  };

  const overwriteAttendance = (empId, date, checkIn, checkOut, status, reason) => {
    let workingHours = '8.0 hrs';
    try {
      if (checkIn && checkOut && checkIn !== '--' && checkOut !== '--') {
        const parseTime = (timeStr) => {
          const [time, modifier] = timeStr.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (modifier === 'PM' && hours < 12) hours += 12;
          if (modifier === 'AM' && hours === 12) hours = 0;
          return hours * 60 + minutes;
        };
        const minDiff = parseTime(checkOut) - parseTime(checkIn);
        if (minDiff > 0) {
          workingHours = `${(minDiff / 60).toFixed(1)} hrs`;
        }
      }
    } catch (err) {
      console.error('Error calculating hours', err);
    }

    setAttendance(prev => {
      const existingIdx = prev.findIndex(a => a.empId === empId && a.date === date);
      const newRecord = {
        id: existingIdx !== -1 ? prev[existingIdx].id : `ATT-${Date.now()}`,
        empId,
        date,
        checkIn: checkIn || '--',
        checkOut: checkOut || '--',
        workingHours,
        status: status || 'Present',
        reasonOverride: reason,
        late: status === 'Late'
      };

      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = newRecord;
        return updated;
      } else {
        return [newRecord, ...prev];
      }
    });

    const empObj = employees.find(e => e.id === empId);
    const empName = empObj ? empObj.name : empId;

    addNotification(
      'Attendance Override',
      `Attendance record for ${empName} on ${date} was updated by HR. Reason: ${reason}`,
      'warning',
      'HR'
    );
  };

  return (
    <HRMSContext.Provider value={{
      employees,
      contractors,
      setContractors,
      attendance,
      overwriteAttendance,
      leaves,
      overtime,
      shifts,
      holidays,
      gateLogs,
      shiftSwaps,
      leaveBalances,
      isCheckedIn,
      checkInTime,
      toggleCheckIn,
      addEmployee,
      deleteEmployee,
      updateEmployee,
      applyLeave,
      updateLeaveStatus,
      applyOvertime,
      updateOTStatus,
      addHoliday,
      requestShiftSwap,
      updateShiftSwapStatus,
      addGateLog,
      managerInvites,
      setManagerInvites,
      sendManagerInvite,
      respondToInvite,
      loans,
      setLoans,
      offcycleRuns,
      setOffcycleRuns,
      taxDeclarations,
      setTaxDeclarations,
      adminConfigs,
      setAdminConfigs
    }}>
      {children}
    </HRMSContext.Provider>
  );
};

export const useHRMS = () => useContext(HRMSContext);
