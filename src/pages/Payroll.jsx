import React, { useState } from 'react';
import { useHRMS } from '../context/HRMSContext';
import { useAuth } from '../context/AuthContext';
import { Wallet, Play, CheckCircle2, FileDown, Eye, Calculator, ArrowRight, Search, Plus, Trash, HelpCircle, Download } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { toast } from 'react-hot-toast';

export default function Payroll() {
  const { 
    employees, 
    contractors, 
    loans, 
    setLoans, 
    offcycleRuns, 
    setOffcycleRuns, 
    taxDeclarations, 
    setTaxDeclarations,
    adminConfigs 
  } = useHRMS();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('regular'); // 'regular', 'offcycle', 'contractors', 'loans', 'compliance'
  const [payrollStatus, setPayrollStatus] = useState('Pending Simulation'); // Pending Simulation, Simulated, Executed
  const [simulationSummary, setSimulationSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState(null); // Track employee targeted by active payslip view
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [individualRuns, setIndividualRuns] = useState({}); // e.g. { 'EMP-108': 'Simulated' }

  // Off-cycle form states
  const [isOffcycleModalOpen, setIsOffcycleModalOpen] = useState(false);
  const [offcycleEmpId, setOffcycleEmpId] = useState('');
  const [offcycleType, setOffcycleType] = useState('Bonus');
  const [offcycleAmount, setOffcycleAmount] = useState('');
  const [offcycleReason, setOffcycleReason] = useState('');

  // Loan form states
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [loanAmount, setLoanAmount] = useState('');
  const [loanTenure, setLoanTenure] = useState('12');
  const [loanType, setLoanType] = useState('Personal Loan');

  // Contractor states
  const [contractorFile, setContractorFile] = useState(null);
  const [contractorRunState, setContractorRunState] = useState('Pending Run'); // Pending Run, Simulated, Paid

  // Gratuity states
  const [gratuityEmpId, setGratuityEmpId] = useState('');
  const [gratuityResult, setGratuityResult] = useState(null);

  if (!user) return null;

  const isEmployee = user.role === 'Employee';
  const isFinanceHR = ['HR', 'Finance HR'].includes(user.role);

  // Logged-in employee details for standard portal view
  const empDetails = employees.find(e => e.id === user.employeeId) || user;

  // Active targeted details for modal calculation
  const activePayslipEmp = selectedPayslipEmp || empDetails;

  const monthlySalary = activePayslipEmp.salary ? (activePayslipEmp.salary / 12) : 5000;
  const hra = monthlySalary * 0.4;
  const pf = monthlySalary * 0.12;
  const tax = monthlySalary * 0.15;
  const netPay = monthlySalary - pf - tax;

  const employeePayslips = [
    { id: 'PAY-0626', period: 'June 2026', gross: monthlySalary, net: netPay, status: 'Paid', date: '2026-06-30' },
    { id: 'PAY-0526', period: 'May 2026', gross: monthlySalary, net: netPay, status: 'Paid', date: '2026-05-31' },
    { id: 'PAY-0426', period: 'April 2026', gross: monthlySalary, net: netPay, status: 'Paid', date: '2026-04-30' },
  ];

  // Simulating payroll run
  const runSimulation = () => {
    setLoading(true);
    setTimeout(() => {
      const activeCount = employees.filter(e => e.status === 'Active').length;
      const totalAnnualSalary = employees.filter(e => e.status === 'Active').reduce((sum, e) => sum + e.salary, 0);
      const monthlyGross = totalAnnualSalary / 12;
      const totalPF = monthlyGross * 0.12;
      const totalTax = monthlyGross * 0.15;
      const monthlyNet = monthlyGross - totalPF - totalTax;

      setSimulationSummary({
        activeCount,
        gross: monthlyGross,
        pf: totalPF,
        tax: totalTax,
        net: monthlyNet
      });
      setPayrollStatus('Simulated');
      setLoading(false);
      toast.success('FTE Payroll simulation completed successfully.');
    }, 800);
  };

  const executePayrollRun = () => {
    setLoading(true);
    setTimeout(() => {
      setPayrollStatus('Executed');
      setLoading(false);
      toast.success(`Regular Payroll processed & disbursed for ${simulationSummary.activeCount} employees!`);
    }, 800);
  };

  // NEFTRTGS File Generator
  const handleGenerateNEFT = () => {
    const list = employees.filter(e => e.status === 'Active');
    let csvContent = 'TransactionRef,BeneficiaryName,AccountNumber,IFSC,Amount\n';
    list.forEach((emp, index) => {
      const activeNet = (emp.salary || 60000) / 12 * 0.73;
      const dec = taxDeclarations.find(d => d.empId === emp.id) || { bankAccount: 'HDFC Bank - ****4829', ifsc: 'HDFC0000123' };
      csvContent += `TXN-JUL26-${index+100},${emp.name},${dec.bankAccount.replace(/[^\d]/g, '') || '48291029302'},${dec.ifsc},${activeNet.toFixed(2)}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'NEFT_RTGS_DISBURSEMENT_JULY2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('NEFT/RTGS payment gateway disbursement file downloaded!');
  };

  // Submit offcycle run request
  const handleOffcycleSubmit = (e) => {
    e.preventDefault();
    if (!offcycleEmpId || !offcycleAmount || !offcycleReason) {
      toast.error('Please complete all off-cycle form fields.');
      return;
    }
    const emp = employees.find(emp => emp.id === offcycleEmpId);
    const newOffcycle = {
      id: `OFF-${Date.now().toString().slice(-3)}`,
      type: offcycleType,
      empId: offcycleEmpId,
      empName: emp ? emp.name : 'Unknown',
      amount: parseFloat(offcycleAmount),
      date: new Date().toISOString().split('T')[0],
      managerName: user.name,
      status: isFinanceHR ? 'Approved' : 'Pending Approval',
      paidDate: isFinanceHR ? new Date().toISOString().split('T')[0] : ''
    };
    setOffcycleRuns(prev => [newOffcycle, ...prev]);
    setIsOffcycleModalOpen(false);
    setOffcycleEmpId('');
    setOffcycleAmount('');
    setOffcycleReason('');
    toast.success(isFinanceHR ? 'Offcycle run completed!' : 'Offcycle request sent to Finance HR.');
  };

  // Accrued Gratuity Act mathematics
  const handleCalculateGratuity = (e) => {
    e.preventDefault();
    const emp = employees.find(x => x.id === gratuityEmpId);
    if (!emp) {
      toast.error('Employee ID not found.');
      return;
    }

    const baseSalary = (emp.salary || 60000) / 12;
    const monthsWorked = 56; // Mock tenure months: 4.6 years
    const tenureYears = parseFloat((monthsWorked / 12).toFixed(1));
    const eligible = tenureYears >= 5.0;
    const accrued = eligible ? Math.round((baseSalary * 15 * tenureYears) / 26) : 0;

    setGratuityResult({
      name: emp.name,
      tenureYears,
      eligible,
      accrued
    });
  };

  // Employee apply for loan/advance
  const handleLoanSubmit = (e) => {
    e.preventDefault();
    if (!loanAmount || parseFloat(loanAmount) <= 0) {
      toast.error('Please enter a valid loan amount.');
      return;
    }
    const amt = parseFloat(loanAmount);
    const tenure = parseInt(loanTenure);
    const emi = Math.round((amt + amt * 0.06) / tenure); // 6% simple interest

    const newLoan = {
      id: `LN-${Date.now().toString().slice(-3)}`,
      empId: user.employeeId,
      empName: user.name,
      type: loanType,
      amount: amt,
      tenureMonths: tenure,
      interestRate: 6,
      emi,
      paidMonths: 0,
      remainingAmount: amt,
      status: 'Pending Approval'
    };
    setLoans(prev => [newLoan, ...prev]);
    setIsLoanModalOpen(false);
    setLoanAmount('');
    toast.success('Your loan application has been submitted to Finance HR.');
  };

  const handleDownloadPayslip = () => {
    toast.success('Disbursing secure payslip PDF download token...');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Enterprise Payroll & Compliance Suite</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Process regular/off-cycle payrolls, generate multi-bank NEFT/RTGS files, and track statutory compliance in Rupees (₹).
          </p>
        </div>
        {isFinanceHR && (
          <div className="flex gap-2">
            <button
              onClick={handleGenerateNEFT}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-50 hover:bg-slate-100 border rounded-lg text-slate-700 dark:bg-slate-900 dark:text-slate-350 cursor-pointer"
            >
              <Download size={14} />
              Export NEFT RTGS File
            </button>
            <button
              onClick={() => setIsOffcycleModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-primary text-white dark:bg-accent dark:text-slate-950 rounded-lg cursor-pointer"
            >
              <Plus size={14} />
              Off-Cycle Run
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      {isFinanceHR && (
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5 overflow-x-auto">
          {['regular', 'offcycle', 'contractors', 'loans', 'compliance'].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`py-1.5 px-3.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === t
                  ? 'bg-primary text-white dark:bg-accent dark:text-slate-950'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-900/40 dark:text-slate-400'
              }`}
            >
              {t === 'regular' ? 'Regular FTE Run' :
               t === 'offcycle' ? 'Off-Cycle Runs' :
               t === 'contractors' ? 'Contractor Billing' :
               t === 'loans' ? 'Loans & Advances' : 'Statutory & Gratuity'}
            </button>
          ))}
        </div>
      )}

      {/* REGULAR PAYROLL TAB OR EMPLOYEE VIEW */}
      {isFinanceHR && activeTab === 'regular' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls Card */}
            <Card className="p-5 lg:col-span-1 space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Active Payroll Cycle</h3>
                <span className="text-[10px] text-slate-400 font-semibold">Cycle: July 2026</span>
              </div>
              
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Status:</span>
                  <span className="font-bold text-primary dark:text-accent uppercase tracking-wider text-[10px]">
                    {payrollStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Eligible Employees:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {employees.filter(e => e.status === 'Active').length} Active
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {payrollStatus === 'Pending Simulation' && (
                  <Button
                    onClick={runSimulation}
                    disabled={loading}
                    variant="primary"
                    className="w-full"
                    icon={Calculator}
                  >
                    {loading ? 'Simulating calculations...' : 'Run Payroll Simulation'}
                  </Button>
                )}
                {payrollStatus === 'Simulated' && (
                  <>
                    <Button
                      onClick={executePayrollRun}
                      disabled={loading}
                      variant="primary"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      icon={CheckCircle2}
                    >
                      {loading ? 'Disbursing funds...' : 'Approve & Disburse Payroll'}
                    </Button>
                    <Button
                      onClick={() => setPayrollStatus('Pending Simulation')}
                      variant="outline"
                      className="w-full"
                    >
                      Reset Run
                    </Button>
                  </>
                )}
                {payrollStatus === 'Executed' && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-center rounded-xl border border-emerald-250 dark:border-emerald-900/40 text-xs font-semibold space-y-1">
                    <CheckCircle2 className="mx-auto text-emerald-500 mb-1" size={24} />
                    <p>Payroll Run Complete</p>
                    <span className="text-[10px] text-slate-450 font-normal">Disbursed on {new Date().toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Simulation Output Card */}
            <Card className="p-5 lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Simulation Ledger Output</h3>
                <span className="text-[10px] text-slate-400 font-semibold">Projected payroll cycle budgets (FTEs)</span>
              </div>

              {simulationSummary ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 text-xs">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800 text-left">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Gross Salaries</span>
                    <strong className="text-xl font-bold text-slate-850 dark:text-slate-100 block">
                      ₹{simulationSummary.gross.toLocaleString([], { maximumFractionDigits: 0 })}
                    </strong>
                    <span className="text-[10px] text-slate-455 block">Monthly operational salary cost</span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800 text-left">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">PF Contribution (12%)</span>
                    <strong className="text-xl font-bold text-slate-850 dark:text-slate-100 block">
                      ₹{simulationSummary.pf.toLocaleString([], { maximumFractionDigits: 0 })}
                    </strong>
                    <span className="text-[10px] text-slate-455 block">Provident fund corporate matches</span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800 text-left">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Estimated TDS/Tax (15%)</span>
                    <strong className="text-xl font-bold text-slate-850 dark:text-slate-100 block">
                      ₹{simulationSummary.tax.toLocaleString([], { maximumFractionDigits: 0 })}
                    </strong>
                    <span className="text-[10px] text-slate-455 block">Statutory withholding taxes</span>
                  </div>

                  <div className="p-4 bg-primary/5 dark:bg-accent/5 rounded-xl space-y-1.5 border border-primary/20 dark:border-accent/20 text-left">
                    <span className="text-[10px] text-primary dark:text-accent uppercase font-bold">Total Net Pay (Disbursed)</span>
                    <strong className="text-xl font-extrabold text-primary dark:text-accent block">
                      ₹{simulationSummary.net.toLocaleString([], { maximumFractionDigits: 0 })}
                    </strong>
                    <span className="text-[10px] text-slate-455 block">Net bank transfer budget amount</span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                  No active calculations to display. Run simulation.
                </div>
              )}
              
              <div className="text-[10px] text-slate-400 text-right mt-2 font-semibold">
                Statutory Compliance: PF Act 1952 &bull; Income Tax Act 1961
              </div>
            </Card>
          </div>

          {/* Individual Employee payroll list */}
          <Card className="p-5 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Individual Employee Payroll Runs</h3>
                <span className="text-[10px] text-slate-400 font-semibold">Search personnel to simulate, run, and view individual payslips</span>
              </div>
              
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="Search by ID or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg dark:text-slate-200 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-455 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Employee ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Annual CTC</th>
                    <th className="px-4 py-3">Monthly Net</th>
                    <th className="px-4 py-3">Run Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-650 dark:text-slate-400 font-medium">
                  {employees
                    .filter(e => {
                      const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.id.toLowerCase().includes(searchQuery.toLowerCase());
                      return e.status === 'Active' && matchesSearch;
                    })
                    .map(emp => {
                      const empGross = emp.salary ? (emp.salary / 12) : 5000;
                      const empPf = empGross * 0.12;
                      const empTax = empGross * 0.15;
                      const empNet = empGross - empPf - empTax;
                      const runState = individualRuns[emp.id] || 'Pending Simulation';

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{emp.id}</td>
                          <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{emp.name}</td>
                          <td className="px-4 py-3">{emp.department}</td>
                          <td className="px-4 py-3">₹{emp.salary ? emp.salary.toLocaleString() : '0'}/yr</td>
                          <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">₹{empNet.toLocaleString([], { maximumFractionDigits: 0 })}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase ${
                              runState === 'Executed'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                                : runState === 'Simulated'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                                : 'bg-slate-100 text-slate-550 dark:bg-slate-900 dark:text-slate-450'
                            }`}>
                              {runState}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              {runState === 'Pending Simulation' && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setIndividualRuns(prev => ({ ...prev, [emp.id]: 'Simulated' }));
                                    toast.success(`Payroll simulated for ${emp.name}.`);
                                  }}
                                >
                                  Simulate
                                </Button>
                              )}
                              {runState === 'Simulated' && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={() => {
                                    setIndividualRuns(prev => ({ ...prev, [emp.id]: 'Executed' }));
                                    toast.success(`Payroll processed & disbursed for ${emp.name}.`);
                                  }}
                                >
                                  Disburse
                                </Button>
                              )}
                              {runState === 'Executed' && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  icon={Eye}
                                  onClick={() => {
                                    setSelectedPayslipEmp(emp);
                                    setSelectedPayslip({
                                      id: `PAY-${emp.id}-${Date.now().toString().slice(-4)}`,
                                      period: 'July 2026',
                                      gross: empGross,
                                      net: empNet,
                                      status: 'Paid',
                                      date: new Date().toLocaleDateString()
                                    });
                                    setIsPayslipModalOpen(true);
                                  }}
                                >
                                  View Payslip
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* OFF-CYCLE RUNS TAB */}
      {isFinanceHR && activeTab === 'offcycle' && (
        <Card className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Off-Cycle Payroll Ledger</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Track bonus, incentive, and full settlements</span>
            </div>
            <Button onClick={() => setIsOffcycleModalOpen(true)} variant="primary" icon={Plus}>
              Initiate Off-Cycle Run
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-455 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Request Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Requested By</th>
                  <th className="px-4 py-3">Approval Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {offcycleRuns.map(run => (
                  <tr key={run.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{run.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{run.empName} ({run.empId})</td>
                    <td className="px-4 py-3 font-semibold">{run.type}</td>
                    <td className="px-4 py-3 text-slate-500">{run.date}</td>
                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">₹{run.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-500">{run.managerName}</td>
                    <td className="px-4 py-3">
                      <Badge status={run.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {run.status === 'Pending Approval' && (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setOffcycleRuns(prev => prev.map(r => r.id === run.id ? { ...r, status: 'Rejected' } : r));
                              toast.success('Off-cycle request rejected.');
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-lg cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              setOffcycleRuns(prev => prev.map(r => r.id === run.id ? { ...r, status: 'Approved', paidDate: new Date().toISOString().split('T')[0] } : r));
                              toast.success('Off-cycle request approved and disbursed.');
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      )}
                      {run.status === 'Approved' && (
                        <span className="text-[10px] text-slate-400 italic">Disbursed on {run.paidDate}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* CONTRACTOR BILLING TAB */}
      {isFinanceHR && activeTab === 'contractors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 space-y-4 lg:col-span-1">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Contractor Billing System</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Bulk upload attendance files and disburse billings</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Active Contractors:</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{contractors.length} Profiles</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Total Billable Hours:</span>
                <span className="font-bold text-slate-750 dark:text-slate-350">160 hrs (Accumulated)</span>
              </div>
            </div>

            <div className="flex flex-col text-left space-y-1">
              <label className="text-[10px] font-bold text-slate-455 uppercase">Bulk Attendance CSV Upload</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  if (e.target.files.length > 0) {
                    setContractorFile(e.target.files[0]);
                    toast.success(`CSV File Staged: ${e.target.files[0].name}`);
                  }
                }}
                className="text-xs border p-2 rounded-lg bg-white dark:bg-slate-900 dark:border-slate-850"
              />
            </div>

            <div className="space-y-2 pt-2">
              {contractorRunState === 'Pending Run' && (
                <Button
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => {
                      setContractorRunState('Simulated');
                      setLoading(false);
                      toast.success('Contractor bulk hours billing simulated.');
                    }, 800);
                  }}
                  variant="primary"
                  className="w-full"
                >
                  Simulate Contractor Billing
                </Button>
              )}
              {contractorRunState === 'Simulated' && (
                <Button
                  onClick={() => {
                    setContractorRunState('Paid');
                    toast.success('Contractor invoices processed and payouts initiated!');
                  }}
                  variant="primary"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
                >
                  Approve & Disburse Contractor Payouts
                </Button>
              )}
              {contractorRunState === 'Paid' && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-center font-bold text-xs border border-emerald-250">
                  Bulk Payout Complete
                </div>
              )}
            </div>
          </Card>

          <Card className="p-5 lg:col-span-2 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Active Contractor Billing Roster</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Active billing details for external agencies</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-455 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Contractor ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">agency</th>
                    <th className="px-4 py-3">Rate/Hour</th>
                    <th className="px-4 py-3">Total Billing</th>
                    <th className="px-4 py-3">Expiry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {contractors.map(c => {
                    const bill = c.ratePerHour * 45; // simulated hours
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{c.id}</td>
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{c.name}</td>
                        <td className="px-4 py-3">{c.agency}</td>
                        <td className="px-4 py-3">₹{c.ratePerHour}/hr</td>
                        <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">₹{bill.toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-500 font-medium">{c.contractExpiry}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* LOANS & ADVANCES TAB */}
      {isFinanceHR && activeTab === 'loans' && (
        <Card className="p-5 space-y-4">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Corporate Employee Loans Registry</h3>
            <span className="text-[10px] text-slate-400 font-semibold">Monitor active EMIs, interest rates, and loan balances</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-455 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Loan Type</th>
                  <th className="px-4 py-3">Principal Amount</th>
                  <th className="px-4 py-3">Rate</th>
                  <th className="px-4 py-3">Monthly EMI</th>
                  <th className="px-4 py-3">Outstanding</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {loans.map(ln => (
                  <tr key={ln.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{ln.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{ln.empName}</td>
                    <td className="px-4 py-3 font-semibold">{ln.type}</td>
                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">₹{ln.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-slate-500">{ln.interestRate}%</td>
                    <td className="px-4 py-3 font-bold text-slate-850 dark:text-slate-200">₹{ln.emi.toLocaleString()}/mo</td>
                    <td className="px-4 py-3 font-bold text-rose-600">₹{ln.remainingAmount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge status={ln.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {ln.status === 'Pending Approval' && (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setLoans(prev => prev.map(l => l.id === ln.id ? { ...l, status: 'Rejected' } : l));
                              toast.success('Loan application declined.');
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 border rounded-lg cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => {
                              setLoans(prev => prev.map(l => l.id === ln.id ? { ...l, status: 'Active' } : l));
                              toast.success('Loan application approved!');
                            }}
                            className="px-2 py-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      )}
                      {ln.status === 'Active' && (
                        <span className="text-[10px] text-slate-400 italic">EMI Recovery Mode</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* COMPLIANCE & GRATUITY TAB */}
      {isFinanceHR && activeTab === 'compliance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-5 lg:col-span-1 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Gratuity Accrual Inspector</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Payment of Gratuity Act 1972 math checks</span>
            </div>

            <form onSubmit={handleCalculateGratuity} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-455 block mb-1">Select Employee ID</label>
                <select
                  value={gratuityEmpId}
                  onChange={(e) => setGratuityEmpId(e.target.value)}
                  className="w-full py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border rounded-lg text-xs dark:text-slate-200"
                  required
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                  ))}
                </select>
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Verify Accrual Status
              </Button>
            </form>

            {gratuityResult && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs space-y-2 text-left font-medium">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-400">Employee:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{gratuityResult.name}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-400">Tenure Years:</span>
                  <span className="text-slate-800 dark:text-slate-200">{gratuityResult.tenureYears} yrs</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-slate-400">Eligible ({'>='} 5 yrs):</span>
                  <span className={`font-bold ${gratuityResult.eligible ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {gratuityResult.eligible ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400 font-bold">Accrued Payout:</span>
                  <strong className="text-primary dark:text-accent font-extrabold text-sm">₹{gratuityResult.accrued.toLocaleString()}</strong>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-5 lg:col-span-2 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Statutory Compliance master Control</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Auto-computed central & state statue match reports</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-xl text-left space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400">Provident Fund (PF) Matching</span>
                <strong className="text-lg font-bold block text-slate-850 dark:text-slate-200">12% Employee + 12% Employer</strong>
                <p className="text-[10px] text-slate-455">Regulated under EPF Act 1952.</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-xl text-left space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400">ESI Health Contributions</span>
                <strong className="text-lg font-bold block text-slate-850 dark:text-slate-200">0.75% Employee + 3.25% Employer</strong>
                <p className="text-[10px] text-slate-455">Statutory medical and sickness allowances.</p>
              </div>
            </div>

            <div className="overflow-x-auto text-[11px] font-medium">
              <table className="w-full text-left border">
                <thead className="bg-slate-50 dark:bg-slate-900/50 font-bold border-b text-[10px] text-slate-450 uppercase">
                  <tr>
                    <th className="p-2">Statute Registry</th>
                    <th className="p-2">central Form</th>
                    <th className="p-2">PF Challan</th>
                    <th className="p-2">status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-650 dark:text-slate-400">
                  <tr>
                    <td className="p-2 font-bold text-slate-800 dark:text-slate-200">EPFO Monthly Return</td>
                    <td className="p-2 font-mono">ECR Form 5</td>
                    <td className="p-2 text-emerald-600 font-semibold">Challan Filed</td>
                    <td className="p-2"><span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[8.5px] font-bold">SUCCESS</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-800 dark:text-slate-200">ESIC Monthly Return</td>
                    <td className="p-2 font-mono">Form 1 Challan</td>
                    <td className="p-2 text-emerald-600 font-semibold">Challan Filed</td>
                    <td className="p-2"><span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[8.5px] font-bold">SUCCESS</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-slate-800 dark:text-slate-200">Professional Tax (PT)</td>
                    <td className="p-2 font-mono">PT-Form VIII</td>
                    <td className="p-2 text-amber-600 font-semibold">Pending Payment</td>
                    <td className="p-2"><span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[8.5px] font-bold">DUE IN 4 DAYS</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* EMPLOYEE PORTAL VIEW */}
      {isEmployee && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active salary structure & breakdown */}
          <Card className="p-5 md:col-span-1 space-y-4 text-left">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">My Monthly salary structure</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Base pay, allowances, and statutory matching (Rupees ₹)</span>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500 font-medium">Annual CTC:</span>
                <strong className="text-slate-800 dark:text-slate-200">₹{empDetails.salary ? empDetails.salary.toLocaleString() : '0'}/yr</strong>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Gross Monthly:</span>
                <span className="text-slate-800 dark:text-slate-250">₹{monthlySalary.toLocaleString([], { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between border-b pb-2 text-rose-600">
                <span className="text-rose-500">PF Deduction (12%):</span>
                <span>-₹{pf.toLocaleString([], { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between border-b pb-2 text-rose-600">
                <span className="text-rose-500">Tax Withholding (15%):</span>
                <span>-₹{tax.toLocaleString([], { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between pt-1 text-primary dark:text-accent font-bold text-sm">
                <span>Net Disbursed Pay:</span>
                <span>₹{netPay.toLocaleString([], { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <div className="pt-2 border-t text-left">
              <button
                onClick={() => setIsLoanModalOpen(true)}
                className="w-full py-1.5 text-center text-xs font-bold bg-primary/10 hover:bg-primary/20 text-primary dark:text-accent dark:bg-accent/10 dark:hover:bg-accent/20 rounded-lg transition-all"
              >
                Request Salary Advance / Loan
              </button>
            </div>
          </Card>

          {/* Payslip list */}
          <Card className="p-5 md:col-span-2 text-left space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">My Monthly Payslips</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Download records for payroll cycles</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-455 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Reference ID</th>
                    <th className="px-4 py-3">Pay Period</th>
                    <th className="px-4 py-3">Disbursed Date</th>
                    <th className="px-4 py-3">Net Disbursed</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {employeePayslips.map(slip => (
                    <tr key={slip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="px-4 py-3 text-slate-455 font-semibold">{slip.id}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{slip.period}</td>
                      <td className="px-4 py-3 text-slate-550">{slip.date}</td>
                      <td className="px-4 py-3 font-bold text-slate-850 dark:text-slate-200">₹{slip.net.toLocaleString([], { maximumFractionDigits: 0 })}</td>
                      <td className="px-4 py-3">
                        <Badge status="Paid" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          onClick={() => handleOpenPayslip(slip)}
                          variant="secondary"
                          size="sm"
                          icon={Eye}
                          className="py-1 px-2.5 text-[11px]"
                        >
                          View Slip
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* OFF-CYCLE INITIATION MODAL */}
      <Modal isOpen={isOffcycleModalOpen} onClose={() => setIsOffcycleModalOpen(false)} title="Initiate Off-Cycle Payroll Run">
        <form onSubmit={handleOffcycleSubmit} className="space-y-4">
          <div className="flex flex-col text-left">
            <label className="text-xs font-semibold text-slate-755 dark:text-slate-355 mb-1">Select Beneficiary Employee</label>
            <select
              value={offcycleEmpId}
              onChange={(e) => setOffcycleEmpId(e.target.value)}
              className="w-full py-2 px-3 bg-white dark:bg-slate-900 border rounded-lg text-xs dark:text-slate-200"
              required
            >
              <option value="">-- Choose Employee --</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col text-left">
              <label className="text-xs font-semibold text-slate-755 dark:text-slate-355 mb-1">Payment Type</label>
              <select
                value={offcycleType}
                onChange={(e) => setOffcycleType(e.target.value)}
                className="w-full py-2 px-3 bg-white dark:bg-slate-900 border rounded-lg text-xs dark:text-slate-200"
                required
              >
                <option value="Bonus">Bonus</option>
                <option value="Incentive">Incentive</option>
                <option value="Arrears">Arrears</option>
                <option value="Settlement">Full & Final Settlement</option>
              </select>
            </div>
            <Input
              label="Disbursement Amount (₹)"
              type="number"
              value={offcycleAmount}
              onChange={(e) => setOffcycleAmount(e.target.value)}
              placeholder="e.g. 15000"
              required
            />
          </div>

          <div className="flex flex-col text-left">
            <label className="text-xs font-semibold text-slate-755 dark:text-slate-355 mb-1">Reason / Justification</label>
            <textarea
              value={offcycleReason}
              onChange={(e) => setOffcycleReason(e.target.value)}
              placeholder="e.g. Q3 Performance Bonus, approved by board..."
              className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg h-24 focus:outline-hidden dark:text-slate-200"
              required
            />
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-2">
            <Button onClick={() => setIsOffcycleModalOpen(false)} variant="secondary">Cancel</Button>
            <Button type="submit" variant="primary">Process Off-Cycle payment</Button>
          </div>
        </form>
      </Modal>

      {/* REQUEST LOAN MODAL */}
      <Modal isOpen={isLoanModalOpen} onClose={() => setIsLoanModalOpen(false)} title="Apply for Loan / Salary Advance">
        <form onSubmit={handleLoanSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col text-left">
              <label className="text-xs font-semibold text-slate-755 dark:text-slate-355 mb-1">Loan Category</label>
              <select
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
                className="w-full py-2 px-3 bg-white dark:bg-slate-900 border rounded-lg text-xs dark:text-slate-200"
                required
              >
                <option value="Personal Loan">Personal Loan</option>
                <option value="Salary Advance">Short-Term Salary Advance</option>
                <option value="Emergency Loan">Emergency medical Loan</option>
              </select>
            </div>
            <div className="flex flex-col text-left">
              <label className="text-xs font-semibold text-slate-755 dark:text-slate-355 mb-1">Recovery Tenure (Months)</label>
              <select
                value={loanTenure}
                onChange={(e) => setLoanTenure(e.target.value)}
                className="w-full py-2 px-3 bg-white dark:bg-slate-900 border rounded-lg text-xs dark:text-slate-200"
                required
              >
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
              </select>
            </div>
          </div>

          <Input
            label="Requested Principal Amount (₹)"
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="e.g. 50000"
            required
          />

          <div className="p-3 bg-slate-50 dark:bg-slate-900 border rounded-lg text-left text-[11px] font-medium text-slate-550 space-y-1">
            <strong className="block text-slate-800 dark:text-slate-200 text-[10px] uppercase">Corporate Interest Rate Policy</strong>
            <p>Loans are subject to a flat 6% simple interest rate annually, auto-deducted in monthly EMIs directly from payslips.</p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-2">
            <Button onClick={() => setIsLoanModalOpen(false)} variant="secondary">Cancel</Button>
            <Button type="submit" variant="primary">Submit Loan Application</Button>
          </div>
        </form>
      </Modal>

      {/* PAYSLIP DETAILED MODAL */}
      <Modal isOpen={isPayslipModalOpen} onClose={() => { setIsPayslipModalOpen(false); setSelectedPayslipEmp(null); }} title="Corporate Salary Payslip" size="lg">
        {selectedPayslip && (
          <div className="space-y-6 text-xs text-left p-2">
            {/* Payslip Header */}
            <div className="flex justify-between border-b pb-4">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Enterprise HRMS Solutions Inc.</h4>
                <p className="text-[10px] text-slate-455">75 Wall Street, New York HQ, NY 10005</p>
                <p className="text-[10px] text-slate-400">Secure HCM Code: PAY-IN-002930</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 border border-emerald-200 rounded-full text-[10px] uppercase">
                  Disbursed - Paid
                </span>
                <p className="text-[10px] text-slate-450 mt-1">Period: <strong className="text-slate-700 dark:text-slate-355">{selectedPayslip.period}</strong></p>
                <p className="text-[10px] text-slate-450">Disbursed on: {selectedPayslip.date}</p>
              </div>
            </div>

            {/* Employee info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Employee ID</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{activePayslipEmp.id || activePayslipEmp.employeeId}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Name</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{activePayslipEmp.name}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Department</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{activePayslipEmp.department}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Designation</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{activePayslipEmp.designation}</p>
              </div>
            </div>

            {/* Earnings / Deductions grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Earnings column */}
              <div className="space-y-2">
                <h5 className="font-bold text-[10px] text-primary dark:text-accent uppercase tracking-wider border-b pb-1">Earnings (Credits)</h5>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-slate-550">Basic Salary (60%):</span>
                  <span className="font-medium text-slate-800 dark:text-slate-300">₹{(selectedPayslip.gross * 0.6).toLocaleString([], { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-slate-550">HRA Allowance (30%):</span>
                  <span className="font-medium text-slate-800 dark:text-slate-300">₹{(selectedPayslip.gross * 0.3).toLocaleString([], { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-slate-550">Special Allowance (10%):</span>
                  <span className="font-medium text-slate-800 dark:text-slate-300">₹{(selectedPayslip.gross * 0.1).toLocaleString([], { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between pt-2 font-bold text-slate-900 dark:text-white">
                  <span>Total Gross Earnings:</span>
                  <span>₹{selectedPayslip.gross.toLocaleString([], { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              {/* Deductions column */}
              <div className="space-y-2">
                <h5 className="font-bold text-[10px] text-rose-600 uppercase tracking-wider border-b pb-1">Deductions (Debits)</h5>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-slate-550">Provident Fund (PF - 12%):</span>
                  <span className="font-medium text-slate-800 dark:text-slate-300">₹{pf.toLocaleString([], { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-slate-550">Withholding Tax (TDS - 15%):</span>
                  <span className="font-medium text-slate-800 dark:text-slate-300">₹{tax.toLocaleString([], { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between pt-2 font-bold text-rose-600">
                  <span>Total Deductions:</span>
                  <span>-₹{(pf + tax).toLocaleString([], { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            {/* Total Net box */}
            <div className="p-4 bg-primary/5 dark:bg-slate-900 border border-primary/20 dark:border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-bold text-primary dark:text-accent uppercase">Net Bank Transfer Amount</span>
                <span className="text-[10px] text-slate-450">Transfer code: #DISB-2901-DELHI</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-primary dark:text-accent">
                  ₹{selectedPayslip.net.toLocaleString([], { maximumFractionDigits: 0 })}
                </span>
                <span className="block text-[9px] text-slate-400">INR - Indian Rupee</span>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center">
              <span className="text-[9px] text-slate-400">Computer generated payslip. No physical signature required.</span>
              <div className="flex gap-2">
                <Button onClick={() => { setIsPayslipModalOpen(false); setSelectedPayslipEmp(null); }} variant="secondary">Close</Button>
                <Button onClick={handleDownloadPayslip} variant="primary" icon={FileDown}>Download PDF</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
