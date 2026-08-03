import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHRMS } from '../context/HRMSContext';
import { Search, TrendingUp, DollarSign, Info, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm ${className}`}>{children}</div>
);

function SalaryBreakdown({ emp }) {
  if (!emp) return null;
  const annual = emp.salary || 0;
  const monthly = annual / 12;
  const basic = monthly * 0.45;
  const hra = basic * 0.50;
  const special = monthly - basic - hra - (monthly * 0.12) - (monthly * 0.02) - 1500;
  const pf = monthly * 0.12;
  const pt = 1500;
  const tds = monthly * 0.15;
  const net = monthly - pf - pt - tds;

  const rows = [
    { label: 'Annual CTC', value: annual, type: 'total' },
    { label: '— Basic Salary (45%)', value: basic, type: 'earn' },
    { label: '— HRA (50% of Basic)', value: hra, type: 'earn' },
    { label: '— Special Allowance', value: special, type: 'earn' },
    { label: '— Provident Fund (12%)', value: -pf, type: 'deduct' },
    { label: '— Professional Tax', value: -pt, type: 'deduct' },
    { label: '— TDS (15% est.)', value: -tds, type: 'deduct' },
    { label: 'Monthly Net Pay', value: net, type: 'net' },
  ];

  return (
    <div className="space-y-1.5">
      {rows.map((r, i) => (
        <div key={i} className={`flex justify-between items-center px-3 py-2 rounded-lg text-xs font-semibold ${r.type === 'total' ? 'bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent font-extrabold' : r.type === 'net' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 font-extrabold border border-emerald-200 dark:border-emerald-800' : r.type === 'deduct' ? 'text-rose-600 bg-rose-50/50 dark:bg-rose-900/10' : 'text-slate-700 dark:text-slate-300'}`}>
          <span>{r.label}</span>
          <span className="font-mono">₹{Math.abs(Math.round(r.value)).toLocaleString()}{r.value < 0 ? ' Dr' : ''}</span>
        </div>
      ))}
    </div>
  );
}

export default function SalaryStructure() {
  const { user } = useAuth();
  const { employees } = useHRMS();
  const [searchId, setSearchId] = useState('');
  const [selectedEmp, setSelectedEmp] = useState(null);

  const role = user?.role;
  const canSearchOthers = ['Finance HR', 'Recruitment HR'].includes(role);
  const isEmployee = role === 'Employee';

  // If employee, show their own
  const myData = isEmployee ? employees.find(e => e.id === user.employeeId) : null;

  const handleSearch = () => {
    if (!searchId.trim()) return;
    const found = employees.find(e => e.id.toLowerCase() === searchId.toLowerCase() || e.name.toLowerCase().includes(searchId.toLowerCase()));
    if (found) {
      setSelectedEmp(found);
    } else {
      toast.error('Employee not found. Please check the ID or name.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Salary Structure</h2>
        <p className="text-slate-500 text-[11px] mt-0.5">
          {isEmployee ? 'Your personal CTC breakdown and statutory deductions.' : 'Search and view CTC structures for any employee.'}
        </p>
      </div>

      {/* Employee: show own salary */}
      {isEmployee && myData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent flex items-center justify-center font-extrabold text-base">
                {myData.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="font-extrabold text-slate-900 dark:text-white">{myData.name}</div>
                <div className="text-[10px] text-slate-400">{myData.designation} · {myData.id}</div>
              </div>
            </div>
            <SalaryBreakdown emp={myData} />
            <button onClick={() => toast.success('Payslip downloaded (demo)')} className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white dark:bg-accent dark:text-slate-950 rounded-xl font-bold text-xs cursor-pointer hover:opacity-90">
              <Download size={12} /> Download Latest Payslip
            </button>
          </Card>

          <Card className="p-5 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Key Benefits & Compliance</h4>
            <div className="space-y-3 text-xs">
              {[
                { label: 'PF Account Number', value: 'MH/BAN/0045678', icon: '🏦' },
                { label: 'UAN Number', value: 'UAN-101234567890', icon: '📋' },
                { label: 'IT Regime', value: 'New Regime (FY 2025-26)', icon: '📊' },
                { label: 'TDS Monthly', value: `₹${Math.round((myData.salary / 12) * 0.15).toLocaleString()}`, icon: '💸' },
                { label: 'Form 16 Status', value: 'Generated', icon: '✅' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <span className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-400">
                    <span>{item.icon}</span>{item.label}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Finance HR / Recruitment HR: search */}
      {canSearchOthers && (
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Employee CTC Lookup</h4>
            <div className="flex gap-2">
              <input
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Enter Employee ID (EMP-XXX) or Name..."
                className="flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button onClick={handleSearch} className="px-4 py-2 bg-primary text-white dark:bg-accent dark:text-slate-950 rounded-xl font-bold text-xs cursor-pointer">
                <Search size={14} />
              </button>
            </div>

            {/* Quick select list */}
            <div>
              <p className="text-[10px] text-slate-400 font-semibold mb-2">Quick Select:</p>
              <div className="flex flex-wrap gap-2">
                {employees.map(e => (
                  <button key={e.id} onClick={() => setSelectedEmp(e)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${selectedEmp?.id === e.id ? 'bg-primary text-white dark:bg-accent dark:text-slate-950 border-primary' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary'}`}>
                    {e.name}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {selectedEmp && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent flex items-center justify-center font-extrabold text-base">
                    {selectedEmp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white">{selectedEmp.name}</div>
                    <div className="text-[10px] text-slate-400">{selectedEmp.designation} · {selectedEmp.id} · {selectedEmp.department}</div>
                  </div>
                </div>
                <SalaryBreakdown emp={selectedEmp} />
              </Card>

              <Card className="p-5 space-y-3">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Employee Details</h4>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {[
                    ['Joining Date', selectedEmp.joiningDate],
                    ['Location', selectedEmp.location],
                    ['Manager', selectedEmp.manager],
                    ['Annual CTC', `₹${(selectedEmp.salary || 0).toLocaleString()}`],
                    ['Monthly Gross', `₹${Math.round((selectedEmp.salary || 0) / 12).toLocaleString()}`],
                    ['Monthly Net (est.)', `₹${Math.round((selectedEmp.salary / 12) * 0.73).toLocaleString()}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <span className="text-slate-500 font-semibold">{k}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => toast.success('CTC report exported (demo)')} className="w-full flex items-center justify-center gap-2 py-2.5 border border-primary text-primary dark:border-accent dark:text-accent rounded-xl font-bold text-xs cursor-pointer hover:bg-primary/5">
                  <Download size={12} /> Export CTC Report
                </button>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Others: access denied */}
      {!isEmployee && !canSearchOthers && (
        <div className="py-24 text-center text-slate-400 font-semibold">
          Salary Structure access is restricted to Finance HR, Recruitment HR, and Employees (own data only).
        </div>
      )}
    </div>
  );
}
