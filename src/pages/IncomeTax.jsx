import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHRMS } from '../context/HRMSContext';
import { FileText, Upload, CheckCircle, Clock, Download, PlusCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm ${className}`}>{children}</div>
);
const Badge = ({ color, children }) => {
  const colors = { green: 'bg-emerald-100 text-emerald-700', amber: 'bg-amber-100 text-amber-700', blue: 'bg-blue-100 text-blue-700', rose: 'bg-rose-100 text-rose-700' };
  return <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors[color] || colors.blue}`}>{children}</span>;
};

const INVESTMENT_HEADS = [
  { head: '80C', desc: 'PPF, ELSS, LIC Premium, NSC', limit: 150000 },
  { head: '80D', desc: 'Health Insurance Premium', limit: 25000 },
  { head: '80CCD(1B)', desc: 'NPS Additional Contribution', limit: 50000 },
  { head: '24(b)', desc: 'Home Loan Interest', limit: 200000 },
  { head: 'HRA', desc: 'House Rent Allowance Exemption', limit: 60000 },
];

export default function IncomeTax() {
  const { user } = useAuth();
  const { taxDeclarations, setTaxDeclarations, employees } = useHRMS();
  const role = user?.role;
  const isEmployee = role === 'Employee';
  const isFinanceHR = role === 'Finance HR';

  const myDeclaration = taxDeclarations.find(t => t.empId === user?.employeeId);
  const [activeTab, setActiveTab] = useState(isEmployee ? 'declaration' : 'overview');
  const [regime, setRegime] = useState(myDeclaration?.regime || 'New');
  const [declarations, setDeclarations] = useState(
    INVESTMENT_HEADS.reduce((acc, h) => ({ ...acc, [h.head]: 0 }), {})
  );
  const [proofUploaded, setProofUploaded] = useState({});

  const totalDeclared = Object.values(declarations).reduce((sum, v) => sum + (parseInt(v) || 0), 0);
  const estimatedTaxSaving = regime === 'Old' ? Math.min(totalDeclared * 0.30, 135000) : 0;

  const handleSave = () => {
    const newDecl = { empId: user.employeeId, empName: user.name, regime, totalExemptions: totalDeclared, proofsSubmitted: Object.values(proofUploaded).filter(Boolean).length, status: 'Pending Verification', bankAccount: myDeclaration?.bankAccount || 'Not Set', ifsc: myDeclaration?.ifsc || '', bankName: myDeclaration?.bankName || '', accountNo: myDeclaration?.accountNo || '', panNo: myDeclaration?.panNo || '', form16Status: 'Pending' };
    setTaxDeclarations(prev => {
      const idx = prev.findIndex(t => t.empId === user.employeeId);
      if (idx !== -1) { const u = [...prev]; u[idx] = { ...u[idx], ...newDecl }; return u; }
      return [...prev, newDecl];
    });
    toast.success('IT Declaration saved! Finance HR will verify your proofs.');
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Income Tax Management</h2>
          <p className="text-slate-500 text-[11px] mt-0.5">
            {isEmployee ? 'Manage your IT declarations, proofs, and track Form 16 status.' : 'Income Tax compliance dashboard — declarations, verifications, and Form 16 generation.'}
          </p>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {(isEmployee ? [['declaration', 'My Declaration'], ['form16', 'Form 16']] :
          [['overview', 'Overview'], ['declarations', 'All Declarations'], ['form16', 'Form 16 Status']]).map(([t, l]) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider cursor-pointer ${activeTab === t ? 'bg-primary text-white dark:bg-accent dark:text-slate-950' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-900/40 dark:text-slate-400'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Finance HR Overview */}
      {isFinanceHR && activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Employees', val: taxDeclarations.length, color: 'text-primary dark:text-accent' },
              { label: 'Verified', val: taxDeclarations.filter(t => t.status === 'Verified').length, color: 'text-emerald-600' },
              { label: 'Pending Verification', val: taxDeclarations.filter(t => t.status === 'Pending Verification').length, color: 'text-amber-600' },
              { label: 'Form 16 Generated', val: taxDeclarations.filter(t => t.form16Status === 'Generated').length, color: 'text-blue-600' },
            ].map((k, i) => (
              <Card key={i} className="p-4 text-center">
                <div className={`text-2xl font-extrabold ${k.color}`}>{k.val}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{k.label}</div>
              </Card>
            ))}
          </div>

          <Card className="p-5 space-y-3">
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Regime Engine Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
                <div className="text-xl font-extrabold text-blue-700 dark:text-blue-300">{taxDeclarations.filter(t => t.regime === 'New').length}</div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">New Regime Employees</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl text-center">
                <div className="text-xl font-extrabold text-purple-700 dark:text-purple-300">{taxDeclarations.filter(t => t.regime === 'Old').length}</div>
                <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Old Regime Employees</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Finance HR — All Declarations */}
      {isFinanceHR && activeTab === 'declarations' && (
        <Card className="overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-[9px] text-slate-500 uppercase font-extrabold tracking-wider">
              <tr>{['Employee', 'Regime', 'Total Exemptions', 'Proofs', 'Status', 'Action'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {taxDeclarations.map(t => (
                <tr key={t.empId} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{t.empName || t.empId}</td>
                  <td className="px-4 py-3"><Badge color={t.regime === 'New' ? 'blue' : 'amber'}>{t.regime} Regime</Badge></td>
                  <td className="px-4 py-3 font-mono font-bold">₹{(t.totalExemptions || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">{t.proofsSubmitted} uploaded</td>
                  <td className="px-4 py-3"><Badge color={t.status === 'Verified' ? 'green' : 'amber'}>{t.status}</Badge></td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setTaxDeclarations(prev => prev.map(d => d.empId === t.empId ? { ...d, status: 'Verified' } : d)); toast.success('Verified!'); }}
                      className="text-primary dark:text-accent font-bold text-[10px] hover:underline cursor-pointer">Verify</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Form 16 */}
      {activeTab === 'form16' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between">
            <div>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Form 16 Status</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">{isEmployee ? 'Your Form 16 for FY 2025-26' : 'Form 16 generation status for all employees'}</p>
            </div>
            {isFinanceHR && <button onClick={() => toast.success('Bulk Form 16 generation initiated!')} className="px-3 py-2 bg-primary text-white dark:bg-accent dark:text-slate-950 rounded-xl font-bold text-[11px] cursor-pointer">Generate All Form 16</button>}
          </div>
          {isEmployee ? (
            <div className="p-6 flex flex-col items-center gap-4">
              <CheckCircle size={40} className="text-emerald-500" />
              <div className="text-center">
                <div className="font-extrabold text-slate-900 dark:text-white">Form 16 — FY 2025-26</div>
                <div className="text-[11px] text-slate-400 mt-1">Generated and available for download</div>
              </div>
              <button onClick={() => toast.success('Form 16 PDF downloaded (demo)')} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white dark:bg-accent dark:text-slate-950 rounded-xl font-bold text-xs cursor-pointer">
                <Download size={14} /> Download Form 16 PDF
              </button>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-[9px] text-slate-500 uppercase font-extrabold tracking-wider">
                <tr>{['Employee', 'PAN', 'Status', 'Action'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {taxDeclarations.map(t => (
                  <tr key={t.empId} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{t.empName || t.empId}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{t.panNo || 'N/A'}</td>
                    <td className="px-4 py-3"><Badge color={t.form16Status === 'Generated' ? 'green' : 'amber'}>{t.form16Status || 'Pending'}</Badge></td>
                    <td className="px-4 py-3">
                      <button onClick={() => toast.success(`Form 16 for ${t.empName} downloaded (demo)`)} className="text-primary dark:text-accent font-bold text-[10px] hover:underline cursor-pointer">Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* Employee Declaration */}
      {isEmployee && activeTab === 'declaration' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-5 space-y-4">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Tax Regime Selection</h4>
              <div className="grid grid-cols-2 gap-3">
                {['New', 'Old'].map(r => (
                  <button key={r} onClick={() => setRegime(r)}
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${regime === r ? 'border-primary bg-primary/5 dark:border-accent dark:bg-accent/5' : 'border-slate-200 dark:border-slate-700'}`}>
                    <div className="font-extrabold text-slate-900 dark:text-white text-[12px]">{r} Tax Regime</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{r === 'New' ? 'Lower slabs, no exemptions' : 'Higher slabs, allows all exemptions'}</div>
                  </button>
                ))}
              </div>
            </Card>

            {regime === 'Old' && (
              <Card className="p-5 space-y-3">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Investment Declarations</h4>
                {INVESTMENT_HEADS.map(h => (
                  <div key={h.head} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="flex-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{h.head} — {h.desc}</div>
                      <div className="text-[9px] text-slate-400">Max limit: ₹{h.limit.toLocaleString()}</div>
                    </div>
                    <input
                      type="number" min={0} max={h.limit}
                      value={declarations[h.head] || ''}
                      onChange={e => setDeclarations(p => ({ ...p, [h.head]: Math.min(parseInt(e.target.value) || 0, h.limit) }))}
                      className="w-32 px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-right font-mono bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="0"
                    />
                    <button onClick={() => { setProofUploaded(p => ({ ...p, [h.head]: true })); toast.success(`Proof uploaded for ${h.head} (demo)`); }}
                      className={`p-1.5 rounded-lg cursor-pointer ${proofUploaded[h.head] ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'}`}>
                      <Upload size={12} />
                    </button>
                  </div>
                ))}
              </Card>
            )}

            <button onClick={handleSave} className="w-full py-3 bg-primary text-white dark:bg-accent dark:text-slate-950 rounded-xl font-extrabold cursor-pointer hover:opacity-90">
              Save IT Declaration
            </button>
          </div>

          <div className="space-y-4">
            <Card className="p-4 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Declaration Summary</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Selected Regime</span><Badge color={regime === 'New' ? 'blue' : 'amber'}>{regime} Regime</Badge></div>
                <div className="flex justify-between"><span className="text-slate-500">Total Declared</span><span className="font-bold text-slate-900 dark:text-white">₹{totalDeclared.toLocaleString()}</span></div>
                {regime === 'Old' && <div className="flex justify-between"><span className="text-slate-500">Est. Tax Saving</span><span className="font-bold text-emerald-600">₹{estimatedTaxSaving.toLocaleString()}</span></div>}
                <div className="flex justify-between"><span className="text-slate-500">Proofs Uploaded</span><span className="font-bold">{Object.values(proofUploaded).filter(Boolean).length}</span></div>
              </div>
            </Card>

            {myDeclaration && (
              <Card className="p-4 space-y-2">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">Last Submission Status</h4>
                <Badge color={myDeclaration.status === 'Verified' ? 'green' : 'amber'}>{myDeclaration.status}</Badge>
                <p className="text-[10px] text-slate-400">Submitted for FY 2025-26</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
