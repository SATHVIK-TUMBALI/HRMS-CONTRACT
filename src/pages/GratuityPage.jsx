import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHRMS } from '../context/HRMSContext';
import { Shield, TrendingUp, Clock, Info } from 'lucide-react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm ${className}`}>{children}</div>
);
const Badge = ({ color, children }) => {
  const colors = { green: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', blue: 'bg-blue-100 text-blue-700', slate: 'bg-slate-100 text-slate-600' };
  return <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors[color] || colors.slate}`}>{children}</span>;
};

export default function GratuityPage() {
  const { user } = useAuth();
  const { gratuityData } = useHRMS();
  const role = user?.role;
  const isEmployee = role === 'Employee';
  const isFinanceHR = role === 'Finance HR';

  const myGratuity = gratuityData.find(g => g.empId === user?.employeeId);
  const totalLiability = gratuityData.filter(g => g.eligible).reduce((s, g) => s + g.accrued, 0);

  // Gratuity Formula: (Basic Salary / 26) × 15 × Years of Service
  const calcGratuity = (basic, years) => Math.round((basic / 26) * 15 * Math.floor(years));

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Gratuity Management</h2>
        <p className="text-slate-500 text-[11px] mt-0.5">
          {isEmployee ? 'Track your gratuity eligibility and accrued amount.' : 'Organization-wide gratuity eligibility, accrual, and liability management per the Payment of Gratuity Act.'}
        </p>
      </div>

      {/* Info Banner */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-2">
        <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
        <div className="text-[11px] text-blue-700 dark:text-blue-300">
          <strong>Gratuity Act Compliance:</strong> Gratuity is applicable after 5 years of continuous service. Formula: <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">(Basic/26) × 15 × Years</code>. Maximum payout: ₹20 Lakhs.
        </div>
      </div>

      {/* Employee View */}
      {isEmployee && myGratuity && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">My Gratuity Status</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Service Tenure', val: `${myGratuity.tenureYears} Years` },
                { label: 'Eligibility', val: myGratuity.tenureYears >= 5 ? '✅ Eligible' : '⏳ Not Yet Eligible' },
                { label: 'Basic Salary', val: `₹${myGratuity.basicSalary.toLocaleString()}/mo` },
                { label: 'Accrued Amount', val: myGratuity.eligible ? `₹${myGratuity.accrued.toLocaleString()}` : 'N/A' },
              ].map(({ label, val }, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="text-[9px] font-bold text-slate-400 uppercase">{label}</div>
                  <div className="font-extrabold text-slate-900 dark:text-white mt-0.5">{val}</div>
                </div>
              ))}
            </div>
            {!myGratuity.eligible && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
                  You need {(5 - myGratuity.tenureYears).toFixed(1)} more years of continuous service to become eligible for gratuity.
                </p>
                <div className="mt-2 bg-amber-200 dark:bg-amber-800/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min((myGratuity.tenureYears / 5) * 100, 100)}%` }} />
                </div>
                <div className="flex justify-between text-[9px] text-amber-600 dark:text-amber-400 mt-1">
                  <span>{myGratuity.tenureYears} yrs</span><span>5 yrs target</span>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-5 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Gratuity Projection</h4>
            <div className="space-y-2">
              {[5, 7, 10, 15].map(yr => {
                const amt = calcGratuity(myGratuity.basicSalary, yr);
                return (
                  <div key={yr} className={`flex justify-between items-center p-3 rounded-xl ${Math.floor(myGratuity.tenureYears) === yr ? 'bg-primary/10 border border-primary/20 dark:bg-accent/10 dark:border-accent/20' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                    <span className="text-slate-600 dark:text-slate-300 font-semibold">At {yr} Years</span>
                    <span className="font-extrabold text-primary dark:text-accent">₹{amt.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 italic">*Projection based on current basic salary. Actual may vary with salary revisions.</p>
          </Card>
        </div>
      )}

      {/* Finance HR View */}
      {isFinanceHR && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Employees', val: gratuityData.length, color: 'text-primary dark:text-accent' },
              { label: 'Eligible (5+ Yrs)', val: gratuityData.filter(g => g.eligible).length, color: 'text-emerald-600' },
              { label: 'Not Yet Eligible', val: gratuityData.filter(g => !g.eligible && g.status !== 'Paid (FnF)').length, color: 'text-amber-600' },
              { label: 'Total Liability', val: `₹${(totalLiability / 100000).toFixed(1)}L`, color: 'text-rose-600' },
            ].map((k, i) => (
              <Card key={i} className="p-4 text-center">
                <div className={`text-xl font-extrabold ${k.color}`}>{k.val}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{k.label}</div>
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Gratuity Accrual Register</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[9px] text-slate-500 uppercase font-extrabold tracking-wider">
                  <tr>{['Employee', 'Joining Date', 'Tenure', 'Basic Salary', 'Accrued Gratuity', 'Status'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {gratuityData.map(g => (
                    <tr key={g.empId} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{g.empName}</td>
                      <td className="px-4 py-3 text-slate-500">{g.joiningDate}</td>
                      <td className="px-4 py-3 font-semibold">{g.tenureYears} yrs</td>
                      <td className="px-4 py-3 font-mono">₹{g.basicSalary.toLocaleString()}</td>
                      <td className="px-4 py-3 font-extrabold text-primary dark:text-accent">
                        {g.eligible ? `₹${g.accrued.toLocaleString()}` : g.status === 'Paid (FnF)' ? `₹${g.accrued.toLocaleString()} (Paid)` : 'Not Eligible'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={g.eligible ? 'green' : g.status === 'Paid (FnF)' ? 'slate' : 'amber'}>{g.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Others */}
      {!isEmployee && !isFinanceHR && (
        <div className="py-24 text-center text-slate-400 font-semibold">
          Gratuity management is available to Finance HR and individual employees.
        </div>
      )}
    </div>
  );
}
