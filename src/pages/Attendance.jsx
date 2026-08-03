import React, { useState } from 'react';
import { useHRMS } from '../context/HRMSContext';
import { useAuth } from '../context/AuthContext';
import { Clock, Calendar, Search, CheckCircle, ShieldAlert, Award, FileText, Upload, Users } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { toast } from 'react-hot-toast';

export default function Attendance() {
  const { attendance, employees, holidays, overwriteAttendance, contractors, contractorAttendance, setContractorAttendance } = useHRMS();
  const { user, workforceMode, setWorkforceMode } = useAuth();
  const [localMode, setLocalMode] = useState(workforceMode || 'fte');
  const switchMode = (m) => { setLocalMode(m); setWorkforceMode(m); };

  const getInitialSearchEmp = () => {
    if (!user) return '';
    if (user.role === 'Employee') return user.employeeId;
    if (user.role === 'Manager') {
      const team = employees.filter(emp => emp.manager === user.name || (emp.department === user.department && emp.id !== user.employeeId));
      return team.length > 0 ? team[0].id : '';
    }
    return '';
  };

  const [searchEmployee, setSearchEmployee] = useState(getInitialSearchEmp);
  const [inspectDate, setInspectDate] = useState('2026-07-30');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(6); // 6 = July
  
  // Overwrite Form State
  const [overwriteEmpId, setOverwriteEmpId] = useState('');
  const [overwriteDate, setOverwriteDate] = useState('2026-07-30');
  const [overwriteCheckIn, setOverwriteCheckIn] = useState('09:00 AM');
  const [overwriteCheckOut, setOverwriteCheckOut] = useState('06:00 PM');
  const [overwriteStatus, setOverwriteStatus] = useState('Present');
  const [overwriteReason, setOverwriteReason] = useState('Forgot to Punch In');

  if (!user) return null;

  const isHR = ['HR', 'Finance HR', 'Recruitment HR', 'Operational HR'].includes(user.role);
  const isManager = user.role === 'Manager';
  const teamEmployees = employees.filter(emp => emp.manager === user.name || (emp.department === user.department && emp.id !== user.employeeId));

  // Active target for search query
  const activeSearchId = user.role === 'Employee' ? user.employeeId : searchEmployee.trim();

  // Find targeted employee record
  const targetEmployee = employees.find(
    e => e.id.toLowerCase() === activeSearchId.toLowerCase()
  );

  // Generate calendar days dynamically for selected year and month
  const getDynamicDays = () => {
    const days = [];
    const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay(); // Sunday=0, Monday=1, ...
    const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    
    for (let i = 0; i < offset; i++) {
      days.push(null);
    }
    
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = (selectedMonth + 1) < 10 ? `0${selectedMonth + 1}` : `${selectedMonth + 1}`;
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      days.push(`${selectedYear}-${monthStr}-${dayStr}`);
    }
    return days;
  };

  const handleOverwriteSubmit = (e) => {
    e.preventDefault();
    if (!overwriteEmpId) {
      toast.error('Please specify a valid Employee ID.');
      return;
    }
    const empExists = employees.some(emp => emp.id.toLowerCase() === overwriteEmpId.trim().toLowerCase())
      || contractors.some(c => c.id.toLowerCase() === overwriteEmpId.trim().toLowerCase());
    if (!empExists) {
      toast.error(`Employee/Contractor ID "${overwriteEmpId}" not found.`);
      return;
    }
    overwriteAttendance(
      overwriteEmpId.trim().toUpperCase(),
      overwriteDate,
      overwriteCheckIn,
      overwriteCheckOut,
      overwriteStatus,
      overwriteReason
    );
    toast.success(`Manual override applied successfully for ${overwriteEmpId.trim().toUpperCase()}.`);
  };

  // Contractor attendance view for Operational HR / Manager
  const showContractorMode = localMode === 'contractor' && ['Operational HR', 'Manager'].includes(user.role);
  const todayContractorAtt = contractorAttendance.filter(a => a.date === '2026-07-30');
  const contractorWithAtt = contractors.map(c => {
    const att = todayContractorAtt.find(a => a.empId === c.id);
    return { ...c, checkIn: att?.checkIn || '--', checkOut: att?.checkOut || '--', hours: att?.hoursWorked || 0, attStatus: att?.status || 'Not Marked', site: att?.site || c.site };
  });

  const handleBulkContractorAtt = () => {
    const today = '2026-07-30';
    const newLogs = contractors.filter(c => c.status === 'Active').map((c, i) => ({
      id: `CATT-BULK-${i}`, empId: c.id, date: today, checkIn: '09:00 AM', checkOut: '06:00 PM', hoursWorked: 9, status: 'Present', site: c.site, markedBy: 'Operational HR'
    }));
    setContractorAttendance(prev => [
      ...prev.filter(a => a.date !== today),
      ...newLogs
    ]);
    toast.success('Bulk contractor attendance marked for today!');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Corporate Attendance &amp; Time Calendar</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
            View monthly attendance rosters and process manual timing corrections for biometric overrides.
          </p>
        </div>

        {/* FTE / Contractor Toggle */}
        {['Operational HR', 'Manager'].includes(user.role) && (
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 gap-1 self-start">
            <button onClick={() => switchMode('fte')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${localMode === 'fte' ? 'bg-primary text-white dark:bg-accent dark:text-slate-950' : 'text-slate-500 hover:text-slate-700'}`}>
              FTE
            </button>
            <button onClick={() => switchMode('contractor')}
              className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all ${localMode === 'contractor' ? 'bg-primary text-white dark:bg-accent dark:text-slate-950' : 'text-slate-500 hover:text-slate-700'}`}>
              Contractors
            </button>
          </div>
        )}
      </div>

      {/* Contractor Attendance View */}
      {showContractorMode && (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Contractor Attendance — July 30, 2026</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Attendance marked by Operational HR. Edit individual records below.</p>
              </div>
              <button onClick={handleBulkContractorAtt} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white dark:bg-accent dark:text-slate-950 rounded-xl font-bold text-[11px] cursor-pointer">
                <Upload size={12} /> Bulk Mark Present
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[9px] text-slate-500 uppercase font-extrabold tracking-wider">
                  <tr>{['ID', 'Contractor', 'Agency', 'Site', 'Check In', 'Check Out', 'Hours', 'Status', 'Action'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {contractorWithAtt.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                      <td className="px-4 py-3 font-mono font-bold text-[10px]">{c.id}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{c.name}</td>
                      <td className="px-4 py-3 text-slate-500">{c.agency}</td>
                      <td className="px-4 py-3 text-slate-500">{c.site}</td>
                      <td className="px-4 py-3">{c.checkIn}</td>
                      <td className="px-4 py-3">{c.checkOut}</td>
                      <td className="px-4 py-3 font-bold">{c.hours ? `${c.hours}h` : '--'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          c.attStatus === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                          c.attStatus === 'Absent' ? 'bg-rose-100 text-rose-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>{c.attStatus}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => {
                          setContractorAttendance(prev => {
                            const existing = prev.findIndex(a => a.empId === c.id && a.date === '2026-07-30');
                            const record = { id: `CATT-EDIT-${c.id}`, empId: c.id, date: '2026-07-30', checkIn: '09:00 AM', checkOut: '06:00 PM', hoursWorked: 9, status: 'Present', site: c.site, markedBy: 'Manual Override' };
                            if (existing !== -1) { const u = [...prev]; u[existing] = record; return u; }
                            return [...prev, record];
                          });
                          toast.success(`Attendance corrected for ${c.name}`);
                        }} className="text-primary dark:text-accent font-bold text-[10px] hover:underline cursor-pointer">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle: Calendar Search and Month View */}
        <div className="lg:col-span-2 space-y-6">
          {user.role !== 'Employee' && (
            <Card className="p-5">
              <div className="max-w-xl text-left space-y-2">
                <label className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest block">
                  Search Employee Attendance Record
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Enter Employee ID (e.g. EMP-108 or EMP-012)..."
                    value={searchEmployee}
                    onChange={(e) => setSearchEmployee(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden dark:text-slate-200 focus:border-primary focus:bg-white"
                  />
                </div>
                <span className="text-[9.5px] text-slate-400 font-medium block">
                  Only when a valid Employee ID matches will the calendar status log become visible below.
                </span>
              </div>
            </Card>
          )}

          {targetEmployee ? (
            <Card className="p-6 space-y-4">
              {/* Profile Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary dark:text-accent font-extrabold flex items-center justify-center text-sm border">
                    {targetEmployee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {targetEmployee.name} <span className="text-[11px] font-normal text-slate-455">({targetEmployee.id})</span>
                    </h3>
                    <p className="text-[10.5px] text-slate-400 font-semibold">{targetEmployee.designation} &bull; {targetEmployee.department}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end gap-1 text-left sm:text-right">
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Select Month & Year</span>
                  <div className="flex gap-2 mt-0.5">
                    <select
                      value={selectedMonth}
                      onChange={(e) => {
                        const m = parseInt(e.target.value);
                        setSelectedMonth(m);
                        const monthStr = (m + 1) < 10 ? `0${m + 1}` : `${m + 1}`;
                        setInspectDate(`${selectedYear}-${monthStr}-01`);
                      }}
                      className="py-1 px-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10.5px] cursor-pointer font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden"
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((mName, mIdx) => (
                        <option key={mIdx} value={mIdx}>{mName}</option>
                      ))}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        const y = parseInt(e.target.value);
                        setSelectedYear(y);
                        const monthStr = (selectedMonth + 1) < 10 ? `0${selectedMonth + 1}` : `${selectedMonth + 1}`;
                        setInspectDate(`${y}-${monthStr}-01`);
                      }}
                      className="py-1 px-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10.5px] cursor-pointer font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden"
                    >
                      {[2025, 2026, 2027].map(yr => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Attendance Month Calendar Grid */}
              <div>
                <div className="grid grid-cols-7 gap-2.5 text-center text-[10px] font-bold text-slate-400 uppercase mb-3">
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div className="text-rose-500">Sat</div>
                  <div className="text-rose-500">Sun</div>
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {getDynamicDays().map((dayStr, idx) => {
                    if (!dayStr) {
                      return (
                        <div
                          key={`empty-${idx}`}
                          className="bg-slate-50/50 dark:bg-slate-900/5 min-h-20 rounded-xl border border-slate-100 dark:border-slate-800/40"
                        />
                      );
                    }

                    const dayNum = parseInt(dayStr.split('-')[2]);
                    const dateObj = new Date(dayStr);
                    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                    const holiday = holidays.find(h => h.date === dayStr);
                    const log = attendance.find(a => a.empId === targetEmployee.id && a.date === dayStr);

                    let cellBg = 'bg-white dark:bg-slate-955 border-slate-200 dark:border-slate-850';
                    let statusLabel = '';
                    let badgeColor = '';
                    let timeStr = '';

                    if (log) {
                      if (log.status === 'Present') {
                        statusLabel = 'Present';
                        badgeColor = 'bg-emerald-500/10 text-emerald-600';
                        cellBg = 'bg-emerald-50/20 dark:bg-emerald-950/5 border-emerald-200/60 dark:border-emerald-900/30';
                      } else if (log.status === 'Late') {
                        statusLabel = 'Late Punch';
                        badgeColor = 'bg-amber-500/10 text-amber-600 font-bold';
                        cellBg = 'bg-amber-50/20 dark:bg-amber-955/5 border-amber-200/60 dark:border-amber-900/30';
                      } else {
                        statusLabel = 'Absent';
                        badgeColor = 'bg-rose-500/10 text-rose-600';
                        cellBg = 'bg-rose-50/20 dark:bg-rose-955/5 border-rose-200/60 dark:border-rose-900/30';
                      }
                      if (log.checkIn !== '--') {
                        timeStr = `${log.checkIn} - ${log.checkOut || '--'}`;
                      }
                    } else if (holiday) {
                      statusLabel = holiday.name;
                      badgeColor = 'bg-blue-500/10 text-blue-600';
                      cellBg = 'bg-blue-50/20 dark:bg-blue-950/5 border-blue-200/60 dark:border-blue-900/30';
                    } else if (isWeekend) {
                      statusLabel = 'Weekly Off';
                      badgeColor = 'bg-slate-400/10 text-slate-500';
                      cellBg = 'bg-slate-50/40 dark:bg-slate-900/10 border-slate-150 dark:border-slate-850';
                    } else {
                      statusLabel = 'Absent';
                      badgeColor = 'bg-rose-500/10 text-rose-600';
                      cellBg = 'bg-rose-50/10 dark:bg-rose-955/5 border-rose-100 dark:border-rose-900/10';
                    }

                    const isInspected = inspectDate === dayStr;
                    return (
                      <div
                        key={dayStr}
                        onClick={() => setInspectDate(dayStr)}
                        className={`min-h-20 p-2 text-left border rounded-xl flex flex-col justify-between transition-all hover:scale-102 hover:shadow-xs cursor-pointer ${cellBg} ${
                          isInspected ? 'ring-2 ring-primary dark:ring-accent scale-102 shadow-xs' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-slate-850 dark:text-slate-250 text-xs">{dayNum}</span>
                          {statusLabel && (
                            <span className={`text-[7.5px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tight shrink-0 ${badgeColor}`}>
                              {statusLabel.length > 9 ? statusLabel.substring(0, 8) + '..' : statusLabel}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 space-y-0.5">
                          {timeStr ? (
                            <>
                              <span className="block text-[8px] font-mono font-bold text-slate-700 dark:text-slate-350">{timeStr}</span>
                              {log.workingHours && (
                                <span className="block text-[7.5px] font-semibold text-slate-400">{log.workingHours}</span>
                              )}
                            </>
                          ) : (
                            <span className="block text-[8px] text-slate-400 font-medium">--</span>
                          )}
                          {log && log.reasonOverride && (
                            <span className="block text-[7px] text-purple-600 dark:text-purple-400 font-extrabold uppercase tracking-tighter">
                              Override: {log.reasonOverride}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="py-12 px-6 text-center border-dashed border-2 text-slate-450">
              <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Roster Calendar View Offline</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 font-semibold">
                {user.role === 'Employee'
                  ? 'No registry shift logs found for your account profile.'
                  : 'Please search or select a valid corporate employee ID in the text input box above to load their active status roster logs.'
                }
              </p>
            </Card>
          )}
        </div>

        {/* Right Side: HR manual Override Console / Manager Team List */}
        <div className="space-y-6">
          {isManager && (
            <>
              {/* My Team Members Card */}
              <Card className="p-5">
                <div className="mb-4 text-left">
                  <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">My Team Members</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Click to view their monthly calendar logs.</p>
                </div>
                {teamEmployees.length === 0 ? (
                  <div className="text-slate-450 italic text-xs text-center py-4">No team members reporting.</div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {teamEmployees.map(emp => {
                      const isSelected = emp.id.toLowerCase() === activeSearchId.toLowerCase();
                      return (
                        <button
                          key={emp.id}
                          onClick={() => setSearchEmployee(emp.id)}
                          className={`w-full p-2 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary/5 border-primary/45 dark:bg-accent/5 dark:border-accent/40 shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`h-7 w-7 rounded-full font-bold flex items-center justify-center text-xs border ${
                              isSelected ? 'bg-primary text-white dark:bg-accent dark:text-slate-950' : 'bg-slate-100 text-slate-550'
                            }`}>
                              {emp.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <strong className="block text-[11px] text-slate-800 dark:text-slate-200">{emp.name}</strong>
                              <span className="block text-[9px] text-slate-400 font-medium">{emp.designation}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono font-bold text-slate-450">{emp.id}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Day Attendance Inspector Card */}
              <Card className="p-5 space-y-4">
                <div className="text-left">
                  <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">Day Attendance Inspector</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Select a date to audit specific in/out timings.</p>
                </div>

                <div className="text-left">
                  <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase block mb-1">
                    Select Roster Date
                  </label>
                  <input
                    type="date"
                    min="2026-07-01"
                    max="2026-07-31"
                    value={inspectDate}
                    onChange={(e) => setInspectDate(e.target.value)}
                    className="w-full py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs dark:text-slate-250 cursor-pointer"
                  />
                </div>

                {targetEmployee ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 text-left space-y-2.5 text-xs">
                    <div className="flex justify-between border-b pb-1.5 border-slate-200/40">
                      <span className="text-slate-400 font-semibold">Inspect Date:</span>
                      <strong className="text-slate-850 dark:text-slate-200 font-bold">{inspectDate}</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1.5 border-slate-200/40">
                      <span className="text-slate-400 font-semibold">Daily Status:</span>
                      <span className="font-bold">
                        {(() => {
                          const inspectLog = attendance.find(a => a.empId === targetEmployee.id && a.date === inspectDate);
                          const inspectHoliday = holidays.find(h => h.date === inspectDate);
                          const inspectWeekend = new Date(inspectDate).getDay() === 0 || new Date(inspectDate).getDay() === 6;

                          if (inspectLog) {
                            return (
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                inspectLog.status === 'Present' ? 'bg-emerald-50 text-emerald-700' :
                                inspectLog.status === 'Late' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {inspectLog.status}
                              </span>
                            );
                          } else if (inspectHoliday) {
                            return (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-50 text-blue-700">
                                {inspectHoliday.name}
                              </span>
                            );
                          } else if (inspectWeekend) {
                            return (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-slate-100 text-slate-600">
                                Weekly Off
                              </span>
                            );
                          } else {
                            return (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-rose-50 text-rose-700">
                                Absent
                              </span>
                            );
                          }
                        })()}
                      </span>
                    </div>
                    {(() => {
                      const inspectLog = attendance.find(a => a.empId === targetEmployee.id && a.date === inspectDate);
                      return (
                        <>
                          <div className="flex justify-between border-b pb-1.5 border-slate-200/40">
                            <span className="text-slate-400 font-semibold">Clock In:</span>
                            <strong className="text-slate-800 dark:text-slate-250 font-mono">
                              {inspectLog ? inspectLog.checkIn : '--'}
                            </strong>
                          </div>
                          <div className="flex justify-between border-b pb-1.5 border-slate-200/40">
                            <span className="text-slate-400 font-semibold">Clock Out:</span>
                            <strong className="text-slate-800 dark:text-slate-250 font-mono">
                              {inspectLog ? inspectLog.checkOut : '--'}
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-semibold">Working Hours:</span>
                            <strong className="text-slate-850 dark:text-slate-200 font-bold">
                              {inspectLog ? inspectLog.workingHours : '0.0 hrs'}
                            </strong>
                          </div>
                          {inspectLog && inspectLog.reasonOverride && (
                            <div className="p-2 bg-purple-50 dark:bg-purple-950/20 border border-purple-250 dark:border-purple-900/30 rounded-lg mt-1 text-[10px] text-purple-700 dark:text-purple-400 font-medium">
                              <strong>HR Override Reason:</strong> {inspectLog.reasonOverride}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-slate-450 italic text-[11px] text-center">No employee selected.</div>
                )}
              </Card>
            </>
          )}

          {isHR && (
            <Card className="p-5">
              <div className="mb-4 text-left">
                <h3 className="font-extrabold text-sm text-slate-850 dark:text-white">HR Manual Punch Overwrite</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Correct biometric punch failures and overwrite timings.</p>
              </div>

              <form onSubmit={handleOverwriteSubmit} className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase block mb-1">
                    Employee ID
                  </label>
                  <select
                    value={overwriteEmpId}
                    onChange={(e) => setOverwriteEmpId(e.target.value)}
                    className="w-full py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs dark:text-slate-250 cursor-pointer"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase block mb-1">
                    Roster Date
                  </label>
                  <input
                    type="date"
                    min="2026-07-01"
                    max="2026-07-31"
                    value={overwriteDate}
                    onChange={(e) => setOverwriteDate(e.target.value)}
                    className="w-full py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs dark:text-slate-250"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase block mb-1">
                      Check-In Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 09:00 AM"
                      value={overwriteCheckIn}
                      onChange={(e) => setOverwriteCheckIn(e.target.value)}
                      className="w-full py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs dark:text-slate-250"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase block mb-1">
                      Check-Out Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 06:00 PM"
                      value={overwriteCheckOut}
                      onChange={(e) => setOverwriteCheckOut(e.target.value)}
                      className="w-full py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs dark:text-slate-250"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase block mb-1">
                      Roster Status
                    </label>
                    <select
                      value={overwriteStatus}
                      onChange={(e) => setOverwriteStatus(e.target.value)}
                      className="w-full py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs dark:text-slate-250 cursor-pointer"
                    >
                      <option value="Present">Present</option>
                      <option value="Late">Late</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase block mb-1">
                      Reason for Override
                    </label>
                    <select
                      value={overwriteReason}
                      onChange={(e) => setOverwriteReason(e.target.value)}
                      className="w-full py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs dark:text-slate-250 cursor-pointer"
                    >
                      <option value="Forgot Punch">Forgot Punch</option>
                      <option value="Biometric Failure">Biometric Failure</option>
                      <option value="Device Malfunction">Device Malfunction</option>
                      <option value="Client Site Duty">Client Site Duty</option>
                      <option value="Roster Error Correction">System Roster Error</option>
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  icon={Clock}
                >
                  Overwrite Timing
                </Button>
              </form>
            </Card>
          )}

          {/* Quick FAQ info panel */}
          <Card className="p-5 text-left space-y-3">
            <h4 className="font-bold text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-accent" />
              Corporate Punch Policy
            </h4>
            <ul className="text-[10.5px] text-slate-450 space-y-2 list-disc pl-4 font-medium">
              <li>Biometric punches are captured at active RFID office gateway turnstiles automatically.</li>
              <li>Employees no longer have direct self-service punch switches to safeguard system data.</li>
              <li>Corrections must be processed by HR using valid reason codes for compliance records.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
