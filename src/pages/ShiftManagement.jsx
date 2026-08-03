import React, { useState } from 'react';
import { useHRMS } from '../context/HRMSContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, RefreshCw, Check, X, ShieldAlert } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { toast } from 'react-hot-toast';

export default function ShiftManagement() {
  const { shifts, shiftSwaps, requestShiftSwap, updateShiftSwapStatus, employees } = useHRMS();
  const { user } = useAuth();

  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [swapDate, setSwapDate] = useState('');
  const [currentShift, setCurrentShift] = useState('General Shift');
  const [targetShift, setTargetShift] = useState('Morning Shift');
  const [swapEmployee, setSwapEmployee] = useState('');

  if (!user) return null;

  const isEmployee = user.role === 'Employee';

  // Filters Swaps
  const selfSwaps = shiftSwaps.filter(s => s.empId === user.employeeId);
  const allSwaps = shiftSwaps;

  // Other employees to swap with - FILTER to show only employees from other shifts!
  const eligibleEmployees = employees.filter(e => {
    if (e.id === user.employeeId) return false;
    if (e.status !== 'Active') return false;

    // Filter out employees in the same shift as currentShift
    const colShift = e.shift || '';
    if (currentShift === 'General Shift') {
      return !colShift.startsWith('General');
    } else if (currentShift === 'Morning Shift') {
      return !colShift.startsWith('Morning');
    } else if (currentShift === 'Evening Shift') {
      return !colShift.startsWith('Evening');
    } else if (currentShift === 'Night Shift') {
      return !colShift.startsWith('Night');
    }
    return true;
  });

  const getShiftCode = (name) => {
    if (name === 'General Shift') return 'GS';
    if (name === 'Morning Shift') return 'MS';
    if (name === 'Evening Shift') return 'ES';
    if (name === 'Night Shift') return 'NS';
    return 'GS';
  };

  const handleSwapSubmit = (e) => {
    e.preventDefault();
    if (!swapDate || !swapEmployee) {
      toast.error('Please fill in all swap details.');
      return;
    }
    const colleague = employees.find(emp => emp.name === swapEmployee);
    if (!colleague) {
      toast.error('Colleague not found.');
      return;
    }
    
    requestShiftSwap(
      swapDate, 
      currentShift, 
      targetShift, 
      swapEmployee, 
      new Date(swapDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
      colleague.id,
      getShiftCode(currentShift),
      getShiftCode(targetShift)
    );
    setIsSwapModalOpen(false);
    setSwapDate('');
    setSwapEmployee('');
  };

  // Multi-stage approval mapping: My request --> other employee --> target manager --> origin manager
  const getPendingActionSwaps = () => {
    return shiftSwaps.filter(s => {
      if (s.status === 'Pending Employee') {
        return s.requestWith === user.name;
      }
      if (s.status === 'Pending Target Manager') {
        const targetEmp = employees.find(e => e.name === s.requestWith);
        return targetEmp && targetEmp.manager === user.name;
      }
      if (s.status === 'Pending Origin Manager') {
        const originEmp = employees.find(e => e.id === s.empId);
        return originEmp && originEmp.manager === user.name;
      }
      return false;
    });
  };

  const activePendingSwaps = getPendingActionSwaps();

  const getShiftFullLabel = (code) => {
    const map = {
      'GS': 'General Shift (09:00 - 18:00)',
      'MS': 'Morning Shift (06:00 - 14:00)',
      'ES': 'Evening Shift (14:00 - 22:00)',
      'NS': 'Night Shift (22:00 - 06:00)',
      'OFF': 'WEEKEND OFF'
    };
    return map[code] || code;
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Shift Planning & Swaps</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Track weekly shift rosters, manage swap requests, and check attendance allocations.
          </p>
        </div>
        {isEmployee && (
          <Button onClick={() => setIsSwapModalOpen(true)} variant="primary" icon={RefreshCw}>
            Request Shift Swap
          </Button>
        )}
      </div>

      {/* Roster Codes Legend Card */}
      <Card className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-50 dark:bg-slate-900/50">
        <div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase">GS</span>
          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">General Shift (9am-6pm)</span>
        </div>
        <div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase">MS</span>
          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Morning Shift (6am-2pm)</span>
        </div>
        <div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase">ES</span>
          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Evening Shift (2pm-10pm)</span>
        </div>
        <div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase">NS</span>
          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Night Shift (10pm-6am)</span>
        </div>
        <div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase">OFF</span>
          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Weekend Rest Days</span>
        </div>
      </Card>

      {/* Multi-stage shift swap approvals queue */}
      {activePendingSwaps.length > 0 && (
        <Card className="p-5 border-l-4 border-l-amber-500 bg-amber-50/10">
          <div className="mb-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Outstanding Shift Swap Actions</h3>
            <span className="text-[10px] text-slate-400 font-semibold">Review and action multi-stage roster swap requests</span>
          </div>
          <div className="space-y-3">
            {activePendingSwaps.map(req => {
              const originEmp = employees.find(e => e.id === req.empId);
              const targetEmp = employees.find(e => e.name === req.requestWith);
              const roleTag = req.status === 'Pending Employee' ? 'TargetEmployee' :
                              req.status === 'Pending Target Manager' ? 'TargetManager' : 'OriginManager';

              return (
                <div key={req.id} className="p-4 border border-amber-200/50 dark:border-amber-900/30 rounded-xl bg-white dark:bg-slate-900/40 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="text-left space-y-1 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-250 dark:bg-amber-950/20 dark:text-amber-400">Next Action: {req.status}</span>
                      <span className="font-bold text-slate-450">Swap ID: {req.id}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border mt-1.5 font-medium">
                      <div>
                        <span className="block text-[8.5px] uppercase font-bold text-slate-400">Requesting Employee</span>
                        <strong className="text-slate-850 dark:text-slate-200">{originEmp ? originEmp.name : req.empName}</strong>
                        <span className="block text-[10px] text-slate-400">{originEmp ? originEmp.department : 'Operations'} &bull; {req.currentShift}</span>
                      </div>
                      <div className="border-l pl-3 border-slate-200/60 dark:border-slate-800">
                        <span className="block text-[8.5px] uppercase font-bold text-slate-400">Proposed Swap Partner</span>
                        <strong className="text-slate-850 dark:text-slate-200">{targetEmp ? targetEmp.name : req.requestWith}</strong>
                        <span className="block text-[10px] text-slate-400">{targetEmp ? targetEmp.department : 'Operations'} &bull; {req.targetShift}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Roster Swap Date: {req.shiftDate}</p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button
                      onClick={() => {
                        updateShiftSwapStatus(req.id, 'reject', roleTag);
                        toast.success('Swap request declined.');
                      }}
                      variant="secondary"
                      size="sm"
                      icon={X}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => {
                        updateShiftSwapStatus(req.id, 'approve', roleTag);
                        toast.success('Swap request approved.');
                      }}
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      icon={Check}
                    >
                      {req.status === 'Pending Employee' ? 'Accept' : 'Approve'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Weekly Shift Roster Grid */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">Weekly Shift Roster</h3>
          <span className="text-[10px] text-slate-400 font-semibold">Allocated shifts for current cycle</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Employee Name</th>
                <th className="px-4 py-3">Mon</th>
                <th className="px-4 py-3">Tue</th>
                <th className="px-4 py-3">Wed</th>
                <th className="px-4 py-3">Thu</th>
                <th className="px-4 py-3">Fri</th>
                <th className="px-4 py-3 bg-slate-100/50 dark:bg-slate-900/10">Sat</th>
                <th className="px-4 py-3 bg-slate-100/50 dark:bg-slate-900/10">Sun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {shifts.map(row => {
                const isSelf = row.empId === user.employeeId;
                return (
                  <tr key={row.empId} className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors ${
                    isSelf ? 'bg-primary/5 dark:bg-slate-800/20 font-semibold' : ''
                  }`}>
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                      {row.empName} {isSelf && <span className="text-[9px] font-bold text-primary dark:text-accent">(You)</span>}
                    </td>
                    <td className="px-4 py-3"><span className="px-1.5 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350">{row.monday}</span></td>
                    <td className="px-4 py-3"><span className="px-1.5 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350">{row.tuesday}</span></td>
                    <td className="px-4 py-3"><span className="px-1.5 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350">{row.wednesday}</span></td>
                    <td className="px-4 py-3"><span className="px-1.5 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350">{row.thursday}</span></td>
                    <td className="px-4 py-3"><span className="px-1.5 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350">{row.friday}</span></td>
                    <td className="px-4 py-3 bg-slate-50/30 dark:bg-slate-900/5"><span className="px-1.5 py-0.5 rounded-md font-bold text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-450 dark:text-slate-400">{row.saturday}</span></td>
                    <td className="px-4 py-3 bg-slate-50/30 dark:bg-slate-900/5"><span className="px-1.5 py-0.5 rounded-md font-bold text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-450 dark:text-slate-400">{row.sunday}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Swaps History */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">Shift Swap Log history</h3>
          <span className="text-[10px] text-slate-400 font-semibold">Audit logs of shift change processes</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                {!isEmployee && <th className="px-4 py-3">Employee</th>}
                <th className="px-4 py-3">Roster Date</th>
                <th className="px-4 py-3">Current Shift</th>
                <th className="px-4 py-3">Proposed Shift</th>
                <th className="px-4 py-3">Swap Partner</th>
                <th className="px-4 py-3">Swap Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {(isEmployee ? selfSwaps : allSwaps).length === 0 ? (
                <tr>
                  <td colSpan={isEmployee ? 5 : 6} className="px-4 py-8 text-center text-slate-455 font-semibold">
                    No roster swaps recorded in log.
                  </td>
                </tr>
              ) : (
                (isEmployee ? selfSwaps : allSwaps).map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    {!isEmployee && (
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {log.empName}
                      </td>
                    )}
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-semibold">
                      {log.shiftDate}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {log.currentShift}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-medium">
                      {log.targetShift}
                    </td>
                    <td className="px-4 py-3 text-slate-550">
                      {log.requestWith}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={log.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SWAP REQUEST MODAL */}
      <Modal isOpen={isSwapModalOpen} onClose={() => setIsSwapModalOpen(false)} title="Request Shift Swap">
        <form onSubmit={handleSwapSubmit} className="space-y-4">
          <Input
            label="Roster Date for Swap"
            type="date"
            value={swapDate}
            onChange={(e) => setSwapDate(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Your Current Shift"
              value={currentShift}
              onChange={(e) => setCurrentShift(e.target.value)}
              options={['General Shift', 'Morning Shift', 'Evening Shift', 'Night Shift']}
            />
            <Select
              label="Desired Target Shift"
              value={targetShift}
              onChange={(e) => setTargetShift(e.target.value)}
              options={['General Shift', 'Morning Shift', 'Evening Shift', 'Night Shift']}
            />
          </div>
          <Select
            label="Swap Shift With (Eligible Colleague on Other Shifts)"
            value={swapEmployee}
            onChange={(e) => setSwapEmployee(e.target.value)}
            options={['', ...eligibleEmployees.map(e => ({ value: e.name, label: `${e.name} (${e.shift ? e.shift.split(' ')[0] : 'Other'} Shift)` }))]}
            required
          />
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-2">
            <Button onClick={() => setIsSwapModalOpen(false)} variant="secondary">Cancel</Button>
            <Button type="submit" variant="primary">Submit Swap Request</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
