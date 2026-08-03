import React, { useState } from 'react';
import { useHRMS } from '../context/HRMSContext';
import { useAuth } from '../context/AuthContext';
import { Download, Building, CheckCircle, Clock, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm ${className}`}>{children}</div>
);
const Badge = ({ color, children }) => {
  const colors = { green: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', blue: 'bg-blue-100 text-blue-700' };
  return <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors[color] || colors.blue}`}>{children}</span>;
};

const BANK_NAMES = ['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda'];

export default function BankingPayments() {
  const { user } = useAuth();
  const { employees, taxDeclarations } = useHRMS();
  const [activeTab, setActiveTab] = useState('neft');
  const [generationStatus, setGenerationStatus] = useState(null);

  const bankGroups = employees.filter(e => e.status === 'Active').reduce((acc, emp) => {
    const decl = taxDeclarations.find(t => t.empId === emp.id);
    const bankName = decl?.bankName || 'HDFC Bank';
    if (!acc[bankName]) acc[bankName] = [];
    acc[bankName].push({ ...emp, bankName, accountNo: decl?.accountNo || '****0000', ifsc: decl?.ifsc || 'HDFC0000000', net: Math.round((emp.salary / 12) * 0.73) });
    return acc;
  }, {});

  const totalDisbursement = employees.filter(e => e.status === 'Active').reduce((sum, e) => sum + Math.round((e.salary / 12) * 0.73), 0);

  const handleGenerateFile = (type) => {
    setGenerationStatus('generating');
    setTimeout(() => {
      setGenerationStatus('done');
      toast.success(`${type} file generated successfully! Ready for bank upload.`);
    }, 1200);
  };

  const handleDownloadCSV = () => {
    const rows = [['Employee ID', 'Name', 'Bank', 'Account No', 'IFSC', 'Amount (INR)', 'Narration']];
    employees.filter(e => e.status === 'Active').forEach(emp => {
      const decl = taxDeclarations.find(t => t.empId === emp.id);
      rows.push([emp.id, emp.name, decl?.bankName || 'HDFC Bank', decl?.accountNo || '****0000', decl?.ifsc || 'HDFC0000000', Math.round((emp.salary / 12) * 0.73), `SALARY/AUG2026/${emp.id}`]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'NEFT_Salary_Aug2026.csv'; a.click();
    toast.success('NEFT/RTGS CSV file downloaded!');
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Banking & Payment Disbursement</h2>
          <p className="text-slate-500 text-[11px] mt-0.5">Generate NEFT/RTGS payment files and manage multi-bank salary disbursements.</p>
        </div>
        <button onClick={handleDownloadCSV} className="flex items-center gap-2 px-4 py-2 bg-primary text-white dark:bg-accent dark:text-slate-950 rounded-xl font-bold text-[11px] cursor-pointer hover:opacity-90">
          <Download size={12} /> Export NEFT/RTGS File
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Disbursement', val: `₹${(totalDisbursement / 100000).toFixed(2)}L`, color: 'text-primary dark:text-accent' },
          { label: 'Active Employees', val: employees.filter(e => e.status === 'Active').length, color: 'text-emerald-600' },
          { label: 'Banks Involved', val: Object.keys(bankGroups).length, color: 'text-blue-600' },
          { label: 'Transfer Status', val: 'Pending', color: 'text-amber-600' },
        ].map((k, i) => (
          <Card key={i} className="p-4 text-center">
            <div className={`text-xl font-extrabold ${k.color}`}>{k.val}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{k.label}</div>
          </Card>
        ))}
      </div>

      {/* Tab Nav */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[['neft', 'NEFT/RTGS Generation'], ['multibank', 'Multi-Bank Breakdown'], ['history', 'Transfer History']].map(([t, l]) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider cursor-pointer ${activeTab === t ? 'bg-primary text-white dark:bg-accent dark:text-slate-950' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-900/40 dark:text-slate-400'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* NEFT Generation */}
      {activeTab === 'neft' && (
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Generate Payment File</h4>
            <p className="text-[11px] text-slate-400">Generate bank-ready NEFT/RTGS file for current payroll cycle (August 2026).</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { type: 'NEFT', desc: 'National Electronic Funds Transfer — standard same-day transfers', color: 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' },
                { type: 'RTGS', desc: 'Real-Time Gross Settlement — for high-value transfers above ₹2L', color: 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20' },
                { type: 'IMPS', desc: 'Immediate Payment Service — 24×7 instant transfers', color: 'border-purple-300 bg-purple-50 dark:bg-purple-900/20' },
              ].map(item => (
                <div key={item.type} className={`p-4 border rounded-xl space-y-3 ${item.color}`}>
                  <div className="font-extrabold text-slate-800 dark:text-slate-200">{item.type} Transfer</div>
                  <p className="text-[10px] text-slate-500">{item.desc}</p>
                  <button onClick={() => handleGenerateFile(item.type)}
                    className="w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-[11px] hover:bg-slate-50 cursor-pointer transition-all">
                    Generate {item.type} File
                  </button>
                </div>
              ))}
            </div>

            {generationStatus === 'done' && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <CheckCircle size={14} className="text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">File generated successfully! Click "Export NEFT/RTGS File" to download.</span>
              </div>
            )}
          </Card>

          <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Disbursement Register — August 2026</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[9px] text-slate-500 uppercase font-extrabold tracking-wider">
                  <tr>{['Employee', 'Bank', 'Account', 'IFSC', 'Net Pay', 'Status'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {employees.filter(e => e.status === 'Active').map(emp => {
                    const decl = taxDeclarations.find(t => t.empId === emp.id);
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{emp.name}</td>
                        <td className="px-4 py-3 text-slate-500">{decl?.bankName || 'HDFC Bank'}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{decl?.accountNo || '****0000'}</td>
                        <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{decl?.ifsc || 'HDFC0000000'}</td>
                        <td className="px-4 py-3 font-extrabold text-primary dark:text-accent">₹{Math.round((emp.salary / 12) * 0.73).toLocaleString()}</td>
                        <td className="px-4 py-3"><Badge color="amber">Pending</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Multi-bank breakdown */}
      {activeTab === 'multibank' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(bankGroups).map(([bank, emps]) => {
            const total = emps.reduce((sum, e) => sum + e.net, 0);
            return (
              <Card key={bank} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building size={16} className="text-primary dark:text-accent" />
                    <strong className="text-sm text-slate-800 dark:text-white">{bank}</strong>
                  </div>
                  <span className="text-[11px] font-extrabold text-primary dark:text-accent">₹{total.toLocaleString()}</span>
                </div>
                <div className="space-y-2">
                  {emps.map(e => (
                    <div key={e.id} className="flex justify-between text-xs p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{e.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white">₹{e.net.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs p-2 bg-primary/5 dark:bg-accent/5 border border-primary/20 dark:border-accent/20 rounded-xl font-extrabold">
                    <span>Total Transfer</span>
                    <span className="text-primary dark:text-accent">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Transfer History */}
      {activeTab === 'history' && (
        <Card className="overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-[9px] text-slate-500 uppercase font-extrabold tracking-wider">
              <tr>{['Cycle', 'Amount', 'Employees', 'Transfer Date', 'Method', 'Status'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { cycle: 'Jul 2026', amount: 612500, emp: 9, date: '2026-07-31', method: 'NEFT', status: 'Completed' },
                { cycle: 'Jun 2026', amount: 598000, emp: 9, date: '2026-06-30', method: 'NEFT', status: 'Completed' },
                { cycle: 'May 2026', amount: 612500, emp: 9, date: '2026-05-31', method: 'RTGS', status: 'Completed' },
              ].map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{r.cycle}</td>
                  <td className="px-4 py-3 font-extrabold text-primary dark:text-accent">₹{r.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">{r.emp} employees</td>
                  <td className="px-4 py-3 text-slate-500">{r.date}</td>
                  <td className="px-4 py-3"><Badge color="blue">{r.method}</Badge></td>
                  <td className="px-4 py-3"><Badge color="green">{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
