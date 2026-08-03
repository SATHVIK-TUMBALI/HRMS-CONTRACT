import React, { useState } from 'react';
import { useHRMS } from '../context/HRMSContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, Plus, Check, X, FileText, BarChart } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { toast } from 'react-hot-toast';

export default function LeaveManagement() {
  const { leaves, leaveBalances, applyLeave, updateLeaveStatus, employees, holidays } = useHRMS();
  const { user } = useAuth();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);

  // Manager Approval Comment State
  const [approvalComment, setApprovalComment] = useState('');
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState('Approve'); // Approve or Reject

  if (!user) return null;

  const isEmployee = user.role === 'Employee';

  // Filter leave history
  const selfHistory = leaves.filter(l => l.empId === user.employeeId);
  const pendingApprovals = leaves.filter(l => l.status === 'Pending');
  const allHistory = leaves;

  // Sandwich Leave & Balance Impact logic
  const requesterBal = leaveBalances[leaveType] || { allocated: 0, used: 0, pending: 0 };
  const currentAvailable = leaveType === 'Loss of Pay (LOP)' ? 999 : (requesterBal.allocated - requesterBal.used);
  
  let requestedDays = 0;
  let weekendDays = 0;
  let holidayDays = 0;
  let isSandwich = false;
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start <= end) {
      let current = new Date(start);
      while (current <= end) {
        requestedDays++;
        const dayOfWeek = current.getDay();
        const currentStr = current.toISOString().split('T')[0];
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isHoliday = holidays && holidays.some(h => h.date === currentStr);
        
        if (isWeekend) {
          weekendDays++;
        } else if (isHoliday) {
          holidayDays++;
        }
        current.setDate(current.getDate() + 1);
      }
      isSandwich = weekendDays > 0 || holidayDays > 0;
    }
  }

  const balanceAfter = leaveType === 'Loss of Pay (LOP)' ? 999 : (currentAvailable - requestedDays);
  const isInsufficient = leaveType !== 'Loss of Pay (LOP)' && balanceAfter < 0;

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      toast.error('Please fill in all details.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start Date must be before End Date.');
      return;
    }
    if (isInsufficient) {
      toast.error('Insufficient leave balance. Please apply for Loss of Pay (LOP) instead.');
      return;
    }
    if (leaveType === 'Sick Leave' && requestedDays > 2 && !attachedFile) {
      toast.error('Medical certificate document attachment is mandatory for sick leave exceeding 2 days.');
      return;
    }
    applyLeave(leaveType, startDate, endDate, reason);
    setIsApplyModalOpen(false);
    // Reset fields
    setStartDate('');
    setEndDate('');
    setReason('');
    setAttachedFile(null);
  };

  const handleOpenAction = (id, type) => {
    setSelectedLeaveId(id);
    setActionType(type);
    setApprovalComment('');
    setIsActionModalOpen(true);
  };

  const handleConfirmAction = (e) => {
    e.preventDefault();
    const finalStatus = actionType === 'Approve' ? 'Approved' : 'Rejected';
    updateLeaveStatus(selectedLeaveId, finalStatus, approvalComment);
    setIsActionModalOpen(false);
    toast.success(`Leave request ${finalStatus.toLowerCase()} successfully.`);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Leave & Time-Off Management</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Track statutory leave quotas, request time-off, and manage line approvals.
          </p>
        </div>
        {isEmployee && (
          <Button onClick={() => setIsApplyModalOpen(true)} variant="primary" icon={Plus}>
            Apply Time Off
          </Button>
        )}
      </div>

      {/* Leave Balances Grid (Only useful for Employee) */}
      {isEmployee && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(leaveBalances).map(([type, bal]) => {
            const available = bal.allocated - bal.used;
            return (
              <Card className="p-5 flex items-center justify-between border-l-4 border-l-primary" key={type}>
                <div className="text-left">
                  <span className="block text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">{type} Balance</span>
                  <span className="block text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {available.toFixed(1)} <span className="text-xs text-slate-400 font-semibold">/ {bal.allocated} Days</span>
                  </span>
                  <span className="block text-[9px] text-slate-400 mt-1">
                    {bal.used} used &bull; {bal.pending} pending approval
                  </span>
                </div>
                <div className="h-10 w-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary dark:text-accent">
                  <Calendar size={18} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Leave Approvals Panel for Managers/HR */}
      {!isEmployee && (
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Pending Team Leave Requests</h3>
            <span className="text-[10px] text-slate-400 font-semibold">Needs review and action</span>
          </div>
          {pendingApprovals.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-semibold text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No pending leave requests in your inbox.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map(req => {
                const requester = employees.find(e => e.id === req.empId);
                return (
                  <div key={req.id} className="p-4 border border-slate-150 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 dark:text-white text-xs">{req.empName}</strong>
                        <span className="text-[10px] text-slate-400">({req.empId})</span>
                        <Badge status="Pending" />
                      </div>
                      <p className="text-xs text-slate-650 dark:text-slate-350">
                        Requested: <strong className="font-semibold text-primary dark:text-accent">{req.type}</strong>
                      </p>
                      <p className="text-[10px] text-slate-450">
                        Duration: {req.startDate} to {req.endDate}
                      </p>
                      <p className="text-[11px] bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-850 italic text-slate-500 max-w-lg mt-1">
                        Reason: "{req.reason}"
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleOpenAction(req.id, 'Reject')}
                        variant="secondary"
                        size="sm"
                        className="text-rose-600 border border-slate-200 hover:bg-rose-50"
                        icon={X}
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleOpenAction(req.id, 'Approve')}
                        variant="primary"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        icon={Check}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Leave History logs */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">Leave History</h3>
          <span className="text-[10px] text-slate-400 font-semibold">Audit logs of all leave requests</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                {!isEmployee && <th className="px-4 py-3">Employee</th>}
                <th className="px-4 py-3">Leave Type</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {(isEmployee ? selfHistory : allHistory).length === 0 ? (
                <tr>
                  <td colSpan={isEmployee ? 6 : 7} className="px-4 py-8 text-center text-slate-450 font-semibold">
                    No time-off logs registered.
                  </td>
                </tr>
              ) : (
                (isEmployee ? selfHistory : allHistory).map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    {!isEmployee && (
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                        {log.empName}
                      </td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">
                      {log.type}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {log.startDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {log.endDate}
                    </td>
                    <td className="px-4 py-3 truncate max-w-[200px]" title={log.reason}>
                      {log.reason}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge status={log.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-450 italic">
                      {log.comments || '--'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* APPLY TIME OFF MODAL */}
      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title="Apply Time-Off Request">
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <Select
            label="Select Leave Type"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            options={['Annual Leave', 'Sick Leave', 'Casual Leave', 'Compensatory Off', 'Optional Holiday', 'Loss of Pay (LOP)']}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          {/* Sandwich Leave Warning */}
          {isSandwich && !isInsufficient && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/40 rounded-xl text-left text-[11px] text-amber-800 dark:text-amber-400 space-y-1">
              <span className="font-bold uppercase tracking-wider block text-[9px]">&bull; Sandwich Leave Warning</span>
              <p className="font-medium">
                This leave bridges weekends or holidays ({weekendDays} rest days, {holidayDays} holidays). 
                Under company policy, these rest days are deducted as leave. Total charged: <strong>{requestedDays} days</strong>.
              </p>
            </div>
          )}

          {/* Insufficient Balance Blocking Alert */}
          {isInsufficient && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-250 dark:border-rose-900/40 rounded-xl text-left text-[11px] text-rose-800 dark:text-rose-450 space-y-1">
              <span className="font-bold uppercase tracking-wider block text-[9px]">&bull; Quota Limit Violation</span>
              <p className="font-medium">
                Insufficient leave balance! Available: <strong>{currentAvailable.toFixed(1)} days</strong>, but this request requires <strong>{requestedDays.toFixed(1)} days</strong> (including sandwich charges).
              </p>
              <p className="text-[10px] text-rose-700 dark:text-rose-400 font-bold mt-1">
                Please select "Loss of Pay (LOP)" from the type dropdown instead.
              </p>
            </div>
          )}

          {/* Live Balance Impact Preview */}
          {startDate && endDate && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-left">
              <h5 className="font-bold text-[10px] uppercase text-slate-450 mb-2">Live Balance Impact Preview</h5>
              <div className="space-y-1.5 font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-450">Current Quota Available:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">
                    {leaveType === 'Loss of Pay (LOP)' ? 'Unlimited (Unpaid)' : `${currentAvailable.toFixed(1)} Days`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">Requested Duration:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{requestedDays.toFixed(1)} Days</span>
                </div>
                <div className="flex justify-between border-t pt-1.5 font-bold">
                  <span className="text-slate-450">Balance After Approval:</span>
                  <span className={balanceAfter >= 0 ? "text-emerald-600" : "text-rose-600"}>
                    {leaveType === 'Loss of Pay (LOP)' ? 'Unchanged' : `${balanceAfter.toFixed(1)} Days`}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col text-left">
            <label className="text-xs font-semibold text-slate-750 dark:text-slate-350 mb-1">
              Attach Supporting Document {leaveType === 'Sick Leave' && requestedDays > 2 ? <span className="text-rose-500 font-bold">(Mandatory for >2 days)*</span> : '(Optional)'}
            </label>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  setAttachedFile(e.target.files[0]);
                  toast.success(`Attached file: ${e.target.files[0].name}`);
                }
              }}
              required={leaveType === 'Sick Leave' && requestedDays > 2}
              className="text-xs text-slate-500 border border-slate-300 dark:border-slate-800 rounded-lg p-2 bg-white dark:bg-slate-900"
            />
          </div>

          <div className="flex flex-col text-left">
            <label className="text-xs font-semibold text-slate-750 dark:text-slate-350 mb-1">Reason for Leave Request</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a detailed description for audit records..."
              className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg h-24 focus:outline-hidden dark:text-slate-250 focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-2">
            <Button onClick={() => setIsApplyModalOpen(false)} variant="secondary">Cancel</Button>
            <Button type="submit" variant="primary" disabled={isInsufficient}>Submit Application</Button>
          </div>
        </form>
      </Modal>

      {/* APPROVAL ACTION MODAL */}
      <Modal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} title={`${actionType} Leave Request`}>
        <form onSubmit={handleConfirmAction} className="space-y-4">
          <p className="text-xs text-slate-500">
            Confirming the {actionType.toLowerCase()} process for this request. Please add a comment below.
          </p>
          <div className="flex flex-col text-left">
            <label className="text-xs font-semibold text-slate-750 dark:text-slate-350 mb-1">Reviewer's Comments / Feedback</label>
            <textarea
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              placeholder="e.g. Approved. Cover shift arranged with team lead."
              className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg h-20 focus:outline-hidden dark:text-slate-250 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-2">
            <Button onClick={() => setIsActionModalOpen(false)} variant="secondary">Cancel</Button>
            <Button
              type="submit"
              className={actionType === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}
            >
              Confirm {actionType}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
