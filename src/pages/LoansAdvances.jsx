import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHRMS } from '../context/HRMSContext';
import { DollarSign, PlusCircle, CheckCircle, Clock, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm ${className}`}>{children}</div>
);
const Badge = ({ color, children }) => {
  const colors = { green: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', blue: 'bg-blue-100 text-blue-700', rose: 'bg-rose-100 text-rose-700', slate: 'bg-slate-100 text-slate-600' };
  return <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors[color] || colors.blue}`}>{children}</span>;
};

function statusColor(s) { return s === 'Active' ? 'green' : s === 'Pending Approval' ? 'amber' : s === 'Closed' ? 'slate' : 'blue'; }

export default function LoansAdvances() {
  const { user } = useAuth();
  const { loans, setLoans } = useHRMS();
  const role = user?.role;
  const isEmployee = role === 'Employee';
  const isFinanceHR = role === 'Finance HR';

  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ type: 'Salary Advance', amount: '', tenureMonths: 6, reason: '' });

  const myLoans = loans.filter(l => l.empId === user?.employeeId);
  const allLoans = loans;
  const displayLoans = isEmployee ? myLoans : allLoans;

  const totalOutstanding = displayLoans.filter(l => l.status === 'Active').reduce((s, l) => s + l.remainingAmount, 0);
  const pendingApproval = displayLoans.filter(l => l.status === 'Pending Approval').length;

  const handleApply = (e) => {
    e.preventDefault();
    const emi = Math.round(parseInt(form.amount) / form.tenureMonths);
    const newLoan = { id: `LN-${Date.now()}`, empId: user.employeeId, empName: user.name, type: form.type, amount: parseInt(form.amount), tenureMonths: form.tenureMonths, interestRate: form.type === 'Salary Advance' ? 0 : 8, emi, paidMonths: 0, remainingAmount: parseInt(form.amount), status: 'Pending Approval', appliedDate: new Date().toISOString().split('T')[0] };
    setLoans(prev => [...prev, newLoan]);
    toast.success('Loan/Advance application submitted! Finance HR will review shortly.');
    setShowApply(false);
    setForm({ type: 'Salary Advance', amount: '', tenureMonths: 6, reason: '' });
  };

  const handleApprove = (id) => {
    setLoans(prev => prev.map(l => l.id === id ? { ...l, status: 'Active' } : l));
    toast.success('Loan approved and EMI recovery activated!');
  };
  const handleReject = (id) => {
    setLoans(prev => prev.filter(l => l.id !== id));
    toast.error('Loan application rejected.');
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Loans & Advances</h2>
          <p className="text-slate-500 text-[11px] mt-0.5">
            {isEmployee ? 'Apply for salary advances or loans. Track your EMI recovery.' : 'Manage employee loan accounts, approvals, and EMI recovery schedule.'}
          </p>
        </div>
        {isEmployee && (
          <button onClick={() => setShowApply(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white dark:bg-accent dark:text-slate-950 rounded-xl font-bold text-[11px] cursor-pointer hover:opacity-90">
            <PlusCircle size={12} /> Apply for Loan/Advance
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Loans', val: displayLoans.length, color: 'text-primary dark:text-accent' },
          { label: 'Active Loans', val: displayLoans.filter(l => l.status === 'Active').length, color: 'text-emerald-600' },
          { label: 'Pending Approval', val: pendingApproval, color: 'text-amber-600' },
          { label: 'Total Outstanding', val: `₹${(totalOutstanding / 1000).toFixed(0)}K`, color: 'text-rose-600' },
        ].map((k, i) => (
          <Card key={i} className="p-4 text-center">
            <div className={`text-xl font-extrabold ${k.color}`}>{k.val}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{k.label}</div>
          </Card>
        ))}
      </div>

      {/* Loans Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">{isEmployee ? 'My Loan Accounts' : 'All Employee Loans'}</h4>
        </div>
        {displayLoans.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-semibold">No loan records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-[9px] text-slate-500 uppercase font-extrabold tracking-wider">
                <tr>
                  {['ID', ...(isFinanceHR ? ['Employee'] : []), 'Type', 'Amount', 'EMI/Month', 'Paid', 'Outstanding', 'Status', ...(isFinanceHR ? ['Action'] : [])].map(h => <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayLoans.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="px-4 py-3 font-mono font-bold text-[10px]">{l.id}</td>
                    {isFinanceHR && <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{l.empName}</td>}
                    <td className="px-4 py-3">{l.type}</td>
                    <td className="px-4 py-3 font-bold">₹{l.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold">₹{l.emi.toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-600">{l.paidMonths}/{l.tenureMonths} months</td>
                    <td className="px-4 py-3 font-bold text-rose-600">₹{l.remainingAmount.toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge color={statusColor(l.status)}>{l.status}</Badge></td>
                    {isFinanceHR && (
                      <td className="px-4 py-3">
                        {l.status === 'Pending Approval' ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleApprove(l.id)} className="text-emerald-600 font-bold hover:underline cursor-pointer">Approve</button>
                            <button onClick={() => handleReject(l.id)} className="text-rose-500 font-bold hover:underline cursor-pointer">Reject</button>
                          </div>
                        ) : (
                          <button onClick={() => toast.success('Loan statement exported (demo)')} className="text-primary dark:text-accent font-bold hover:underline cursor-pointer text-[10px]">Statement</button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* EMI Recovery Schedule (Finance HR) */}
      {isFinanceHR && (
        <Card className="p-5 space-y-3">
          <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Monthly EMI Recovery Summary — August 2026</h4>
          <div className="space-y-2">
            {loans.filter(l => l.status === 'Active').map(l => (
              <div key={l.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{l.empName}</span>
                  <span className="text-slate-400 ml-2">· {l.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-600">-₹{l.emi.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400">from salary</span>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center p-3 bg-primary/5 dark:bg-accent/5 border border-primary/20 dark:border-accent/20 rounded-xl font-extrabold text-xs">
              <span>Total EMI Recoveries This Month</span>
              <span className="text-primary dark:text-accent">₹{loans.filter(l => l.status === 'Active').reduce((s, l) => s + l.emi, 0).toLocaleString()}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Apply Modal */}
      {showApply && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowApply(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Apply for Loan / Advance</h3>
            <form onSubmit={handleApply} className="space-y-3 text-xs">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 focus:outline-none">
                  <option>Salary Advance</option>
                  <option>Personal Loan</option>
                  <option>Vehicle Loan</option>
                  <option>Medical Loan</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Amount (₹)</label>
                <input required type="number" min={5000} value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 focus:outline-none" placeholder="e.g. 50000" />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Tenure (Months): {form.tenureMonths}</label>
                <input type="range" min={1} max={24} value={form.tenureMonths} onChange={e => setForm(p => ({ ...p, tenureMonths: parseInt(e.target.value) }))} className="w-full cursor-pointer" />
                <div className="flex justify-between text-[9px] text-slate-400"><span>1 month</span><span>24 months</span></div>
              </div>
              {form.amount && (
                <div className="p-3 bg-primary/5 dark:bg-accent/5 border border-primary/20 dark:border-accent/20 rounded-xl text-center">
                  <div className="text-[10px] text-slate-500">Estimated Monthly EMI</div>
                  <div className="font-extrabold text-primary dark:text-accent text-base">₹{Math.round(parseInt(form.amount) / form.tenureMonths).toLocaleString()}</div>
                </div>
              )}
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Reason</label>
                <textarea required value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 focus:outline-none resize-none" />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowApply(false)} className="px-4 py-2 border rounded-xl font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white dark:bg-accent dark:text-slate-950 rounded-xl font-bold cursor-pointer">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
