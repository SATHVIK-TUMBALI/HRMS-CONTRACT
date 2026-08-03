import React, { useState } from 'react';
import { useHRMS } from '../context/HRMSContext';
import { useAuth } from '../context/AuthContext';
import { Clock, Check, X, FileText, Compass, KeySquare, Radio, ShieldCheck, Plus } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { toast } from 'react-hot-toast';

export default function OvertimeCompOff() {
  const { 
    overtime, 
    applyOvertime, 
    updateOTStatus, 
    gateLogs, 
    managerInvites, 
    sendManagerInvite, 
    respondToInvite,
    employees,
    contractors,
    contractorOT,
    setContractorOT 
  } = useHRMS();
  const { user, workforceMode, setWorkforceMode } = useAuth();
  const [localMode, setLocalMode] = useState(workforceMode || 'fte');
  const switchMode = (m) => { setLocalMode(m); setWorkforceMode(m); };
  const showContractorOT = localMode === 'contractor' && ['Operational HR', 'Manager'].includes(user.role);

  const [activeTab, setActiveTab] = useState('ot'); // 'ot' or 'comp-off'

  // Overtime states
  const [isOTModalOpen, setIsOTModalOpen] = useState(false);
  const [otDate, setOtDate] = useState('');
  const [otHours, setOtHours] = useState('');
  const [otReason, setOtReason] = useState('');

  // Manager Call for OT states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmpId, setInviteEmpId] = useState('');
  const [inviteDate, setInviteDate] = useState('');
  const [inviteType, setInviteType] = useState('Overtime');
  const [inviteHours, setInviteHours] = useState('4');
  const [inviteReason, setInviteReason] = useState('');

  // Compensatory Off (Comp-Off) states
  const [compOffClaims, setCompOffClaims] = useState([
    { id: 'CO-302', empId: 'EMP-108', empName: 'Sarah Jenkins', workDate: '2026-07-04', claimDate: '2026-07-06', reason: 'Weekend Server Deployment Support', status: 'Approved', approvedBy: 'David Miller' },
    { id: 'CO-303', empId: 'EMP-108', empName: 'Sarah Jenkins', workDate: '2026-07-11', claimDate: '2026-07-13', reason: 'Client Onsite Production Issue', status: 'Pending', approvedBy: '' },
    { id: 'CO-304', empId: 'EMP-012', empName: 'David Miller', workDate: '2026-07-12', claimDate: '2026-07-14', reason: 'Urgent Project Board Review', status: 'Approved', approvedBy: 'Alexander Wright' },
  ]);
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compWorkDate, setCompWorkDate] = useState('');
  const [compClaimDate, setCompClaimDate] = useState('');
  const [compReason, setCompReason] = useState('');

  // FTE vs Contractors Toggle State
  const [workforceType, setWorkforceType] = useState('FTE');

  if (!user) return null;

  const isEmployee = user.role === 'Employee';
  const isSecurity = user.role === 'Security';
  const isManager = user.role === 'Manager';
  const isHR = ['HR', 'Finance HR', 'Recruitment HR', 'Operational HR'].includes(user.role);

  // Filter lists based on FTE vs Contractors toggle
  const getWorkforceIds = () => {
    if (workforceType === 'FTE') {
      return new Set(employees.map(e => e.id));
    } else {
      return new Set(contractors.map(c => c.id));
    }
  };

  const activeWorkforceIds = getWorkforceIds();

  // Filter OT requests
  const selfOT = overtime.filter(o => o.empId === user.employeeId);
  const pendingOT = overtime.filter(o => {
    const matchesWorkforce = activeWorkforceIds.has(o.empId);
    if (!matchesWorkforce) return false;
    
    if (isHR) {
      return o.status === 'Pending HR';
    } else if (isManager) {
      // Show if pending manager approval and is team member
      const emp = employees.find(e => e.id === o.empId) || contractors.find(c => c.id === o.empId);
      return o.status === 'Pending Manager' && emp && emp.manager === user.name;
    }
    return o.status === 'Pending';
  });

  const allOT = overtime.filter(o => activeWorkforceIds.has(o.empId));

  // Filter Comp-Off requests
  const selfComp = compOffClaims.filter(c => c.empId === user.employeeId);
  const pendingComp = compOffClaims.filter(c => {
    const matchesWorkforce = activeWorkforceIds.has(c.empId);
    if (!matchesWorkforce) return false;
    
    if (isHR || isManager) {
      return c.status === 'Pending';
    }
    return false;
  });
  const allComp = compOffClaims.filter(c => activeWorkforceIds.has(c.empId));

  // Active invitations for logged in employee
  const activeInvites = managerInvites ? managerInvites.filter(inv => inv.empId === user.employeeId && inv.status === 'Pending') : [];

  // Team employees under manager
  const teamEmployees = [...employees, ...contractors].filter(emp => emp.manager === user.name);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otDate || !otHours || !otReason) {
      toast.error('Please complete all overtime details.');
      return;
    }
    const hrs = parseInt(otHours);
    if (hrs < 1 || hrs > 8) {
      toast.error('Overtime hours must be between 1 and 8 hours (No decimals allowed).');
      return;
    }
    applyOvertime(otDate, hrs, otReason);
    setIsOTModalOpen(false);
    setOtDate('');
    setOtHours('');
    setOtReason('');
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteEmpId || !inviteDate || !inviteReason) {
      toast.error('Please complete all invitation fields.');
      return;
    }
    const hrs = parseInt(inviteHours);
    if (hrs < 1 || hrs > 8) {
      toast.error('Overtime hours must be between 1 and 8.');
      return;
    }
    sendManagerInvite(inviteEmpId, inviteDate, inviteType, hrs, inviteReason);
    setIsInviteModalOpen(false);
    setInviteEmpId('');
    setInviteDate('');
    setInviteReason('');
    toast.success(`OT/Comp-off request issued successfully.`);
  };

  const handleCompSubmit = (e) => {
    e.preventDefault();
    if (!compWorkDate || !compClaimDate || !compReason) {
      toast.error('Please fill in all compensatory off request details.');
      return;
    }
    const newClaim = {
      id: `CO-${Date.now().toString().slice(-3)}`,
      empId: user.employeeId || 'EMP-004',
      empName: user.name,
      workDate: compWorkDate,
      claimDate: compClaimDate,
      reason: compReason,
      status: 'Pending',
      approvedBy: ''
    };
    setCompOffClaims(prev => [newClaim, ...prev]);
    setIsCompModalOpen(false);
    setCompWorkDate('');
    setCompClaimDate('');
    setCompReason('');
    toast.success('Compensatory Off claim submitted successfully.');
  };

  const handleOTAction = (id, actionStatus) => {
    // If actionStatus is reject ➔ 'reject', else ➔ 'approve'
    const isApproved = actionStatus === 'Approved';
    updateOTStatus(id, isApproved ? 'approve' : 'reject', isHR);
    toast.success(`Overtime request ${isApproved ? 'approved' : 'rejected'}.`);
  };

  const handleCompAction = (id, status) => {
    setCompOffClaims(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status, approvedBy: user.name };
      }
      return c;
    }));
    toast.success(`Comp-Off request ${status.toLowerCase()}.`);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isSecurity ? 'Gate Access & OT Authorization Portal' : 'Overtime & Compensatory Offs'}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            {isSecurity 
              ? 'Review authorized overtime entries, clock RFID gate tags, and verify visitor entry tokens.'
              : 'Submit claims for extra duty hours, check balances, and manage team approvals.'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isManager && (
            <Button onClick={() => setIsInviteModalOpen(true)} variant="secondary" icon={Plus}>
              Call for OT/Comp-Off
            </Button>
          )}
          {isEmployee && !isSecurity && (
            <>
              {activeTab === 'ot' ? (
                <Button onClick={() => setIsOTModalOpen(true)} variant="primary" icon={Clock}>
                  Request Overtime
                </Button>
              ) : (
                <Button onClick={() => setIsCompModalOpen(true)} variant="primary" icon={Clock}>
                  Request Comp-Off
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* FTE vs Contractors Dashboard Switch (Visible to HR/Manager) */}
      {!isEmployee && !isSecurity && (
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-350">
            Workforce Filter: <span className="text-primary dark:text-accent font-extrabold">{workforceType} Overtime Logs</span>
          </div>
          <div className="flex bg-slate-250 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300/40">
            <button
              onClick={() => setWorkforceType('FTE')}
              className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                workforceType === 'FTE' ? 'bg-white text-slate-850 dark:bg-slate-700 dark:text-white shadow-xs' : 'text-slate-400'
              }`}
            >
              FTE
            </button>
            <button
              onClick={() => setWorkforceType('Contractors')}
              className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                workforceType === 'Contractors' ? 'bg-white text-slate-850 dark:bg-slate-700 dark:text-white shadow-xs' : 'text-slate-400'
              }`}
            >
              Contractors
            </button>
          </div>
        </div>
      )}

      {/* Employee Manager Invitations Dashboard Card */}
      {isEmployee && activeInvites.length > 0 && (
        <Card className="p-5 border-l-4 border-l-purple-500 bg-purple-50/10">
          <div className="mb-3 text-left">
            <h3 className="font-extrabold text-sm text-purple-750 dark:text-purple-400">Incoming OT / Comp-Off Calls from Manager</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Please accept or decline extra duty calls from your manager.</p>
          </div>
          <div className="space-y-3">
            {activeInvites.map(inv => (
              <div key={inv.id} className="p-3 border border-purple-200/50 dark:border-purple-900/30 rounded-xl bg-purple-50/5 dark:bg-purple-950/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div className="text-left">
                  <span className="font-bold text-slate-850 dark:text-slate-200">{inv.managerName} called you for {inv.type}</span>
                  <p className="text-slate-450 text-[11px] mt-0.5">Date: <strong>{inv.date}</strong> &bull; Hours: <strong>{inv.hours} hrs</strong> &bull; Reason: "{inv.reason}"</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      respondToInvite(inv.id, false);
                      toast.success('Call declined.');
                    }}
                    className="px-2.5 py-1 text-[10px] font-bold text-slate-650 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-all"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => {
                      respondToInvite(inv.id, true);
                      toast.success('Call accepted! Recorded in your claims.');
                    }}
                    className="px-2.5 py-1 text-[10px] font-bold text-white bg-purple-650 hover:bg-purple-700 rounded-lg cursor-pointer transition-all animate-pulse"
                  >
                    Accept Call
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Inline Tabs Navigation */}
      {!isSecurity && (
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ot')}
            className={`py-1.5 px-3.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'ot'
                ? 'bg-primary text-white dark:bg-accent dark:text-slate-950 shadow-xs'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:bg-slate-900'
            }`}
          >
            Overtime (OT) Claims & Requests
          </button>
          <button
            onClick={() => setActiveTab('comp-off')}
            className={`py-1.5 px-3.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'comp-off'
                ? 'bg-primary text-white dark:bg-accent dark:text-slate-950 shadow-xs'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:bg-slate-900'
            }`}
          >
            Compensatory Off (Comp-Off) Claims
          </button>
        </div>
      )}

      {/* Security Gate Access Log Roster */}
      {isSecurity && (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">RFID Gate Scans Today</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Live stream of biometric reader entries</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-250 dark:border-emerald-900/40">
              <Radio size={12} className="animate-pulse" />
              <span className="font-bold text-[10px] uppercase">Roster Reader Online</span>
            </div>
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
                    <td className="px-4 py-3 text-slate-455 font-semibold">{log.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{log.empName} <span className="text-[10px] text-slate-400 font-normal">({log.empId})</span></td>
                    <td className="px-4 py-3 text-slate-500">{log.timestamp}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        log.type === 'Entry'
                          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-955/20 dark:text-rose-400 dark:border-rose-900/30'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-550">{log.gate}</td>
                    <td className="px-4 py-3 text-slate-455 italic flex items-center gap-1.5">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      <span>{log.verifiedBy}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* OVERTIME TAB SECTION */}
      {activeTab === 'ot' && !isSecurity && (
        <>
          {/* Approvals Panel for Managers/HR */}
          {!isEmployee && (
            <Card className="p-5">
              <div className="mb-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Pending Overtime Claims & Requests</h3>
                <span className="text-[10px] text-slate-400 font-semibold">Needs review and sign-off</span>
              </div>
              {pendingOT.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-semibold border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No pending overtime requests in inbox for {workforceType}.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingOT.map(req => (
                    <div key={req.id} className="p-4 border border-slate-155 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                      <div className="text-left space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-slate-900 dark:text-white">{req.empName}</strong>
                          <span className="text-[10px] text-slate-450">({req.empId})</span>
                          <span className="px-1.5 py-0.2 rounded-sm text-[8.5px] font-extrabold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">Branch: {req.branch || 'Operations'}</span>
                          <span className="px-1.5 py-0.2 rounded-sm text-[8.5px] font-extrabold uppercase bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400">Manager: {req.managerName || 'David Miller'}</span>
                          <Badge status={req.status} />
                        </div>
                        <p className="text-slate-650 dark:text-slate-350">
                          OT date: <strong className="font-bold text-primary dark:text-accent">{req.date}</strong> &bull; Requested: <strong className="font-bold text-emerald-600">{req.hours} hours</strong>
                        </p>
                        <p className="text-[11px] italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-850 text-slate-500 mt-1 max-w-lg">
                          Reason: "{req.reason}"
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleOTAction(req.id, 'Rejected')}
                          variant="secondary"
                          size="sm"
                          icon={X}
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleOTAction(req.id, 'Approved')}
                          variant="primary"
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          icon={Check}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Overtime Ledger table */}
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Overtime Claims Ledger</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Ledger of all overtime audit requests</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    {(!isEmployee) && <th className="px-4 py-3">Employee</th>}
                    <th className="px-4 py-3">OT Log Date</th>
                    <th className="px-4 py-3">Claimed Hours</th>
                    <th className="px-4 py-3">Description / Project</th>
                    <th className="px-4 py-3">Claim Status</th>
                    <th className="px-4 py-3">Authorized By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {(isEmployee ? selfOT : allOT).length === 0 ? (
                    <tr>
                      <td colSpan={isEmployee ? 5 : 6} className="px-4 py-8 text-center text-slate-450 font-semibold">
                        No overtime claims recorded in log.
                      </td>
                    </tr>
                  ) : (
                    (isEmployee ? selfOT : allOT).map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        {(!isEmployee) && (
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            {log.empName}
                          </td>
                        )}
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                          {log.date}
                        </td>
                        <td className="px-4 py-3 text-slate-800 dark:text-slate-300 font-bold">
                          {log.hours} hrs
                        </td>
                        <td className="px-4 py-3 text-slate-550 truncate max-w-[200px]" title={log.reason}>
                          {log.reason}
                        </td>
                        <td className="px-4 py-3">
                          <Badge status={log.status} />
                        </td>
                        <td className="px-4 py-3 text-slate-450 italic">
                          {log.approvedBy || '--'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* COMP-OFF TAB SECTION */}
      {activeTab === 'comp-off' && !isSecurity && (
        <>
          {/* Approvals Panel for Managers/HR */}
          {!isEmployee && (
            <Card className="p-5">
              <div className="mb-4">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Pending Compensatory Off Requests</h3>
                <span className="text-[10px] text-slate-400 font-semibold">Requires holiday working audits and sign-off</span>
              </div>
              {pendingComp.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-semibold border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No pending compensatory off claims in inbox.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingComp.map(req => (
                    <div key={req.id} className="p-4 border border-slate-155 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                      <div className="text-left space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 dark:text-white">{req.empName}</strong>
                          <span className="text-[10px] text-slate-455">({req.empId})</span>
                          <Badge status="Pending" />
                        </div>
                        <p className="text-slate-650 dark:text-slate-350">
                          Worked Date: <strong className="font-bold text-primary dark:text-accent">{req.workDate}</strong> &bull; Requested Rest Date: <strong className="font-bold text-emerald-600">{req.claimDate}</strong>
                        </p>
                        <p className="text-[11px] italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-850 text-slate-500 mt-1 max-w-lg">
                          Reason for Weekend Duty: "{req.reason}"
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCompAction(req.id, 'Rejected')}
                          variant="secondary"
                          size="sm"
                          icon={X}
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleCompAction(req.id, 'Approved')}
                          variant="primary"
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          icon={Check}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Comp-Off Claims Ledger table */}
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Compensatory Off Claims Ledger</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Ledger of all compensatory rest logs</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    {(!isEmployee) && <th className="px-4 py-3">Employee</th>}
                    <th className="px-4 py-3">Worked Weekend/Holiday Date</th>
                    <th className="px-4 py-3">Requested Rest Date</th>
                    <th className="px-4 py-3">Description / Reason</th>
                    <th className="px-4 py-3">Claim Status</th>
                    <th className="px-4 py-3">Authorized By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {(isEmployee ? selfComp : allComp).length === 0 ? (
                    <tr>
                      <td colSpan={isEmployee ? 5 : 6} className="px-4 py-8 text-center text-slate-455 font-semibold">
                        No compensatory off claims recorded in log.
                      </td>
                    </tr>
                  ) : (
                    (isEmployee ? selfComp : allComp).map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        {(!isEmployee) && (
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            {log.empName}
                          </td>
                        )}
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                          {log.workDate}
                        </td>
                        <td className="px-4 py-3 text-slate-800 dark:text-slate-300 font-bold">
                          {log.claimDate}
                        </td>
                        <td className="px-4 py-3 text-slate-550 truncate max-w-[200px]" title={log.reason}>
                          {log.reason}
                        </td>
                        <td className="px-4 py-3">
                          <Badge status={log.status} />
                        </td>
                        <td className="px-4 py-3 text-slate-450 italic">
                          {log.approvedBy || '--'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* REQUEST OT MODAL */}
      <Modal isOpen={isOTModalOpen} onClose={() => setIsOTModalOpen(false)} title="Submit Overtime Claim">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date of Duty"
              type="date"
              value={otDate}
              onChange={(e) => setOtDate(e.target.value)}
              required
            />
            <div className="flex flex-col text-left">
              <label className="text-xs font-semibold text-slate-755 dark:text-slate-355 mb-1">Claimed Hours (Max 8)</label>
              <select
                value={otHours}
                onChange={(e) => setOtHours(e.target.value)}
                className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                required
              >
                <option value="">-- Select Hours --</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                  <option key={h} value={h}>{h} hr{h > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col text-left">
            <label className="text-xs font-semibold text-slate-755 dark:text-slate-355 mb-1">Detailed Reason for Extra Duty</label>
            <textarea
              value={otReason}
              onChange={(e) => setOtReason(e.target.value)}
              placeholder="e.g. Request to work on holiday, urgent server patches..."
              className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg h-24 focus:outline-hidden dark:text-slate-200 focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-2">
            <Button onClick={() => setIsOTModalOpen(false)} variant="secondary">Cancel</Button>
            <Button type="submit" variant="primary">Submit Overtime Request</Button>
          </div>
        </form>
      </Modal>

      {/* MANAGER INVITATION / CALL FOR OT MODAL */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Call Team Member for Overtime / Comp-Off Duty">
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div className="flex flex-col text-left">
            <label className="text-xs font-semibold text-slate-755 dark:text-slate-355 mb-1">Select Reporting Employee</label>
            <select
              value={inviteEmpId}
              onChange={(e) => setInviteEmpId(e.target.value)}
              className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              required
            >
              <option value="">-- Choose Employee --</option>
              {teamEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.id}) - {emp.isContractor ? 'Contractor' : 'FTE'}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col text-left">
              <label className="text-xs font-semibold text-slate-755 dark:text-slate-355 mb-1">Duty Type</label>
              <select
                value={inviteType}
                onChange={(e) => setInviteType(e.target.value)}
                className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                required
              >
                <option value="Overtime">Overtime</option>
                <option value="Comp-Off">Comp-Off</option>
              </select>
            </div>
            
            <div className="flex flex-col text-left">
              <label className="text-xs font-semibold text-slate-755 dark:text-slate-355 mb-1">Date of Duty</label>
              <input
                type="date"
                value={inviteDate}
                onChange={(e) => setInviteDate(e.target.value)}
                className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div className="flex flex-col text-left">
              <label className="text-xs font-semibold text-slate-755 dark:text-slate-355 mb-1">Allocated Hours (Max 8)</label>
              <select
                value={inviteHours}
                onChange={(e) => setInviteHours(e.target.value)}
                className="w-full py-2 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-xs dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                  <option key={h} value={h}>{h} hr{h > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col text-left">
            <label className="text-xs font-semibold text-slate-755 dark:text-slate-355 mb-1">Justification for extra hours</label>
            <textarea
              value={inviteReason}
              onChange={(e) => setInviteReason(e.target.value)}
              placeholder="e.g. Critical release patches, weekend backup validation duty..."
              className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg h-24 focus:outline-hidden dark:text-slate-200 focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-2">
            <Button onClick={() => setIsInviteModalOpen(false)} variant="secondary">Cancel</Button>
            <Button type="submit" variant="primary">Send Overtime Call</Button>
          </div>
        </form>
      </Modal>

      {/* REQUEST COMP-OFF MODAL */}
      <Modal isOpen={isCompModalOpen} onClose={() => setIsCompModalOpen(false)} title="Submit Compensatory Off (Comp-Off) Claim">
        <form onSubmit={handleCompSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Worked Weekend/Holiday Date"
              type="date"
              value={compWorkDate}
              onChange={(e) => setCompWorkDate(e.target.value)}
              required
            />
            <Input
              label="Requested Rest Date"
              type="date"
              value={compClaimDate}
              onChange={(e) => setCompClaimDate(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col text-left">
            <label className="text-xs font-semibold text-slate-755 dark:text-slate-355 mb-1">Detailed Reason for Weekend/Holiday Duty</label>
            <textarea
              value={compReason}
              onChange={(e) => setCompReason(e.target.value)}
              placeholder="e.g. Completed migration testing during weekend window, manager approved..."
              className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg h-24 focus:outline-hidden dark:text-slate-200 focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-2">
            <Button onClick={() => setIsCompModalOpen(false)} variant="secondary">Cancel</Button>
            <Button type="submit" variant="primary">Submit Comp-Off Claim</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
