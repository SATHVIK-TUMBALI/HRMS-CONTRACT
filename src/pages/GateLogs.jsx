import React, { useState } from 'react';
import { useHRMS } from '../context/HRMSContext';
import { useAuth } from '../context/AuthContext';
import { Clock, ShieldCheck, DoorOpen, Radio, Check, X, Search, LogIn, LogOut, RefreshCw } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { toast } from 'react-hot-toast';

export default function GateLogs() {
  const { gateLogs, overtime, shiftSwaps, employees, addGateLog } = useHRMS();
  const { user } = useAuth();

  const [scanEmpId, setScanEmpId] = useState('');
  const [scanType, setScanType] = useState('Entry');
  const [scanGate, setScanGate] = useState('Gate A (Main)');
  
  if (!user) return null;

  const isSecurity = user.role === 'Security';

  // Filter logs for Today
  const todayDate = new Date().toISOString().split('T')[0];

  // 1. Today's Approved OT list (Approved OT on today's date)
  const approvedOTToday = overtime.filter(ot => ot.status === 'Approved' && ot.date === todayDate);

  // 2. Approved Comp-Off Work List (mocking based on OT with comp-off or custom list)
  // Let's also include mock comp-off workers for a realistic view
  const approvedCompOffToday = [
    { id: 'CO-912', empId: 'EMP-103', empName: 'Emily Watson', task: 'Roster backup support', approvedBy: 'David Miller' }
  ];

  // 3. Shift Change Log (Shift swaps approved for today)
  const shiftChangesToday = shiftSwaps.filter(swap => swap.status === 'Approved' && swap.shiftDate === todayDate);

  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (!scanEmpId) {
      toast.error('Please select or input an Employee ID.');
      return;
    }

    const employeeExists = employees.find(emp => emp.id === scanEmpId);
    if (!employeeExists) {
      toast.error(`Invalid Employee ID: ${scanEmpId}`);
      return;
    }

    addGateLog(scanEmpId, scanType, scanGate);
    toast.success(`RFID Swiped: ${scanType} registered for ${employeeExists.name} at ${scanGate}`);
    setScanEmpId('');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Security Gate Access & Operational Console
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Monitor real-time gate entry/exit logs, verify pre-authorized overtime shifts, and execute manual biometric overrides.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/40 shrink-0">
          <Radio size={12} className="animate-pulse" />
          <span className="font-bold text-[10px] uppercase">Roster Reader Online</span>
        </div>
      </div>

      {/* Main Grid: Control Panel vs Today's Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Panel: Entry/Exit Confirmation Terminal */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-5 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Entry/Exit Confirmation</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Manual RFID override swipe log</p>
            </div>

            <form onSubmit={handleScanSubmit} className="space-y-4">
              <Select
                label="Select Employee at Gate"
                value={scanEmpId}
                onChange={(e) => setScanEmpId(e.target.value)}
                options={[
                  { value: '', label: 'Select Employee...' },
                  ...employees.map(emp => ({ value: emp.id, label: `${emp.name} (${emp.id} - ${emp.department})` }))
                ]}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider block mb-1">Log Type</label>
                  <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setScanType('Entry')}
                      className={`flex-1 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        scanType === 'Entry'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-550 hover:text-slate-800 dark:hover:text-slate-350'
                      }`}
                    >
                      <LogIn size={12} />
                      <span>Entry</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScanType('Exit')}
                      className={`flex-1 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        scanType === 'Exit'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-550 hover:text-slate-800 dark:hover:text-slate-350'
                      }`}
                    >
                      <LogOut size={12} />
                      <span>Exit</span>
                    </button>
                  </div>
                </div>

                <Select
                  label="Select Gate"
                  value={scanGate}
                  onChange={(e) => setScanGate(e.target.value)}
                  options={[
                    { value: 'Gate A (Main)', label: 'Gate A (Main)' },
                    { value: 'Gate B (Staff)', label: 'Gate B (Staff)' },
                    { value: 'Gate C (Logistics)', label: 'Gate C (Logistics)' },
                    { value: 'Executive Elevator', label: 'Executive Elevator' }
                  ]}
                />
              </div>

              <Button type="submit" variant="primary" className="w-full" icon={ShieldCheck}>
                Log Manual Gate Swipe
              </Button>
            </form>
          </Card>

          <Card className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-850 text-xs">
            <h4 className="font-bold text-slate-850 dark:text-slate-200 text-[10px] uppercase mb-1.5 font-bold">Operational Protocol</h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-500 font-medium">
              <li>All entries outside normal shift hours must have approved Overtime or Comp-Off schedules.</li>
              <li>In case of badge failure, perform visual verification against database photo before manual override.</li>
              <li>Any security event logged here is synced immediately to HR Auditing logs.</li>
            </ul>
          </Card>
        </div>

        {/* Right Panel: Operational Schedule Views */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Schedules Widgets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Today's Approved OT */}
            <Card className="p-4 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[10px] text-primary dark:text-accent uppercase tracking-wider mb-2">Approved OT (Today)</h4>
                <div className="space-y-2">
                  {approvedOTToday.length === 0 ? (
                    <div className="py-4 text-center text-[10px] text-slate-400 font-semibold">
                      No approved OT scheduled today.
                    </div>
                  ) : (
                    approvedOTToday.map(ot => (
                      <div key={ot.id} className="p-2 bg-primary/5 dark:bg-slate-900 border border-primary/10 rounded-lg text-left text-[11px]">
                        <span className="font-bold text-slate-800 dark:text-slate-250 block">{ot.empName}</span>
                        <p className="text-[10px] text-slate-450 mt-0.5">{ot.hours} hrs &bull; Appr: {ot.approvedBy}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>

            {/* Approved Comp-Off Work List */}
            <Card className="p-4 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[10px] text-amber-600 uppercase tracking-wider mb-2">Comp-Off Duty (Today)</h4>
                <div className="space-y-2">
                  {approvedCompOffToday.length === 0 ? (
                    <div className="py-4 text-center text-[10px] text-slate-400 font-semibold">
                      No comp-off works today.
                    </div>
                  ) : (
                    approvedCompOffToday.map(co => (
                      <div key={co.id} className="p-2 bg-amber-500/5 dark:bg-slate-900 border border-amber-500/10 rounded-lg text-left text-[11px]">
                        <span className="font-bold text-slate-800 dark:text-slate-250 block">{co.empName}</span>
                        <p className="text-[10px] text-slate-450 mt-0.5">{co.task} &bull; Appr: {co.approvedBy}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>

            {/* Today's Shift Changes Log */}
            <Card className="p-4 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[10px] text-purple-650 dark:text-purple-400 uppercase tracking-wider mb-2">Approved Shift Swaps</h4>
                <div className="space-y-2">
                  {shiftChangesToday.length === 0 ? (
                    <div className="py-4 text-center text-[10px] text-slate-400 font-semibold">
                      No shift swaps scheduled for today.
                    </div>
                  ) : (
                    shiftChangesToday.map(swap => (
                      <div key={swap.id} className="p-2 bg-purple-500/5 dark:bg-slate-900 border border-purple-500/10 rounded-lg text-left text-[11px]">
                        <span className="font-bold text-slate-800 dark:text-slate-250 block">{swap.empName} &rarr; {swap.requestWith}</span>
                        <p className="text-[10px] text-slate-450 mt-0.5">Shift: {swap.targetShift}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Master RFID Gate Scans Log */}
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">RFID Gate Scans Log Ledger</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Ledger of all security terminal badge scans</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Log ID</th>
                    <th className="px-4 py-3">Employee Name</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Log Type</th>
                    <th className="px-4 py-3">Security Gate</th>
                    <th className="px-4 py-3">Verification Mechanism</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {gateLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="px-4 py-3 text-slate-450 font-semibold">{log.id}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {log.empName} <span className="text-[10px] text-slate-400 font-normal">({log.empId})</span>
                      </td>
                      <td className="px-4 py-3 text-slate-550">{log.timestamp}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          log.type === 'Entry'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{log.gate}</td>
                      <td className="px-4 py-3 text-slate-450 italic flex items-center gap-1.5">
                        <ShieldCheck size={12} className="text-emerald-500" />
                        <span>{log.verifiedBy}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
