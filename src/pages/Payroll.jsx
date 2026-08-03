import React, { useState } from 'react';
import { useHRMS } from '../context/HRMSContext';
import { useAuth } from '../context/AuthContext';
import { Wallet, Play, CheckCircle2, FileDown, Eye, Calculator, ArrowRight, Search } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { toast } from 'react-hot-toast';

export default function Payroll() {
  const { employees } = useHRMS();
  const { user } = useAuth();

  const [payrollStatus, setPayrollStatus] = useState('Pending Simulation'); // Pending Simulation, Simulated, Executed
  const [simulationSummary, setSimulationSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState(null); // Track employee targeted by active payslip view
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [individualRuns, setIndividualRuns] = useState({}); // e.g. { 'EMP-108': 'Simulated' }

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
      // Calculate active count and budget
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
      toast.success('Payroll simulation completed successfully.');
    }, 1200);
  };

  const executePayrollRun = () => {
    setLoading(true);
    setTimeout(() => {
      setPayrollStatus('Executed');
      setLoading(false);
      toast.success(`Payroll processed & disbursed for ${simulationSummary.activeCount} employees!`);
    }, 1500);
  };

  const handleOpenPayslip = (payslip) => {
    setSelectedPayslipEmp(null);
    setSelectedPayslip(payslip);
    setIsPayslipModalOpen(true);
  };

  const handleDownloadPayslip = () => {
    toast.success('Disbursing secure payslip PDF download token...');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Enterprise Payroll Engine</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
          Simulate payroll configurations, verify tax compliance audits, and download secure payslips.
        </p>
      </div>

      {/* HR/Admin Console */}
      {isFinanceHR ? (
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
              <span className="text-[10px] text-slate-400 font-semibold">Projected payroll cycle budgets</span>
            </div>

            {simulationSummary ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800 text-left">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Gross Salaries</span>
                  <strong className="text-xl font-bold text-slate-850 dark:text-slate-100 block">
                    ${simulationSummary.gross.toLocaleString([], { maximumFractionDigits: 2 })}
                  </strong>
                  <span className="text-[10px] text-slate-450 block">Monthly operational salary cost</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800 text-left">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">PF Contribution (12%)</span>
                  <strong className="text-xl font-bold text-slate-850 dark:text-slate-100 block">
                    ${simulationSummary.pf.toLocaleString([], { maximumFractionDigits: 2 })}
                  </strong>
                  <span className="text-[10px] text-slate-450 block">Provident fund corporate matches</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800 text-left">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Estimated TDS/Tax (15%)</span>
                  <strong className="text-xl font-bold text-slate-850 dark:text-slate-100 block">
                    ${simulationSummary.tax.toLocaleString([], { maximumFractionDigits: 2 })}
                  </strong>
                  <span className="text-[10px] text-slate-450 block">Statutory withholding taxes</span>
                </div>

                <div className="p-4 bg-primary/5 dark:bg-accent/5 rounded-xl space-y-1.5 border border-primary/20 dark:border-accent/20 text-left">
                  <span className="text-[10px] text-primary dark:text-accent uppercase font-bold">Total Net Pay (Disbursed)</span>
                  <strong className="text-xl font-extrabold text-primary dark:text-accent block">
                    ${simulationSummary.net.toLocaleString([], { maximumFractionDigits: 2 })}
                  </strong>
                  <span className="text-[10px] text-slate-450 block">Net bank transfer budget amount</span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                No active calculations to display. Run simulation.
              </div>
            )}
            
            <div className="text-[10px] text-slate-400 text-right mt-2 font-semibold">
              Tax laws compliance code: US-IRC Section 3402 &bull; PF Act 1952
            </div>
          </Card>
        </div>

        {/* Individual Employee Payroll Console */}
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
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg dark:text-slate-200 focus:outline-hidden focus:border-primary"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
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
                        <td className="px-4 py-3">${emp.salary ? emp.salary.toLocaleString() : '0'}/yr</td>
                        <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">${empNet.toLocaleString([], { maximumFractionDigits: 1 })}</td>
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
    ) : isEmployee ? (
        /* Employee Portal */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active components breakdown */}
          <Card className="p-5 md:col-span-1 space-y-4 text-left">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Active salary breakdown</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Base pay and allowances</span>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500 font-medium">Annual CTC:</span>
                <strong className="text-slate-800 dark:text-slate-200">${empDetails.salary.toLocaleString()}/yr</strong>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Gross Monthly:</span>
                <span className="text-slate-800 dark:text-slate-250">${monthlySalary.toLocaleString([], { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-b pb-2 text-rose-600">
                <span className="text-rose-500">PF Deduction (12%):</span>
                <span>-${pf.toLocaleString([], { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-b pb-2 text-rose-600">
                <span className="text-rose-500">Tax Withholding (15%):</span>
                <span>-${tax.toLocaleString([], { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between pt-1 text-primary dark:text-accent font-bold text-sm">
                <span>Net Disbursed Pay:</span>
                <span>${netPay.toLocaleString([], { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </Card>

          {/* Payslip list */}
          <Card className="p-5 md:col-span-2 text-left">
            <div className="mb-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">My Monthly Payslips</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Download records for payroll cycles</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
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
                      <td className="px-4 py-3 text-slate-450 font-semibold">{slip.id}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{slip.period}</td>
                      <td className="px-4 py-3 text-slate-500">{slip.date}</td>
                      <td className="px-4 py-3 font-bold text-slate-850 dark:text-slate-200">${slip.net.toLocaleString([], { maximumFractionDigits: 2 })}</td>
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
      ) : (
        <div className="p-6 text-center text-rose-550 font-bold border border-rose-250 bg-rose-50 rounded-xl">
          Access Denied: Payroll Engine is managed exclusively by Finance HR.
        </div>
      )}

      {/* PAYSLIP DETAILED MODAL */}
      <Modal isOpen={isPayslipModalOpen} onClose={() => { setIsPayslipModalOpen(false); setSelectedPayslipEmp(null); }} title="Corporate Salary Payslip" size="lg">
        {selectedPayslip && (
          <div className="space-y-6 text-xs text-left p-2">
            {/* Payslip Header */}
            <div className="flex justify-between border-b pb-4">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Enterprise HRMS Solutions Inc.</h4>
                <p className="text-[10px] text-slate-450">75 Wall Street, New York HQ, NY 10005</p>
                <p className="text-[10px] text-slate-400">Secure HCM Code: PAY-NYC-00192</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 border border-emerald-200 rounded-full text-[10px] uppercase">
                  Disbursed - Paid
                </span>
                <p className="text-[10px] text-slate-450 mt-1">Period: <strong className="text-slate-700 dark:text-slate-350">{selectedPayslip.period}</strong></p>
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
                  <span className="text-slate-550">Basic Salary:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-300">${(selectedPayslip.gross * 0.6).toLocaleString([], { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-slate-550">HRA Allowance:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-300">${(selectedPayslip.gross * 0.3).toLocaleString([], { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-slate-550">Special Allowance:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-300">${(selectedPayslip.gross * 0.1).toLocaleString([], { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between pt-2 font-bold text-slate-900 dark:text-white">
                  <span>Total Earnings:</span>
                  <span>${selectedPayslip.gross.toLocaleString([], { maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Deductions column */}
              <div className="space-y-2">
                <h5 className="font-bold text-[10px] text-rose-600 uppercase tracking-wider border-b pb-1">Deductions (Debits)</h5>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-slate-550">Provident Fund (PF):</span>
                  <span className="font-medium text-slate-800 dark:text-slate-300">${pf.toLocaleString([], { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-slate-550">Withholding Tax (TDS):</span>
                  <span className="font-medium text-slate-800 dark:text-slate-300">${tax.toLocaleString([], { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between pt-2 font-bold text-rose-600">
                  <span>Total Deductions:</span>
                  <span>-${(pf + tax).toLocaleString([], { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Total Net box */}
            <div className="p-4 bg-primary/5 dark:bg-slate-900 border border-primary/20 dark:border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-bold text-primary dark:text-accent uppercase">Net Bank Transfer Amount</span>
                <span className="text-[10px] text-slate-450">Transfer code: #DISB-2901-NYC</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-extrabold text-primary dark:text-accent">
                  ${selectedPayslip.net.toLocaleString([], { maximumFractionDigits: 2 })}
                </span>
                <span className="block text-[9px] text-slate-400">USD - United States Dollar</span>
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
