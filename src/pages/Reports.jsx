import React, { useState } from 'react';
import { useHRMS } from '../context/HRMSContext';
import { useAuth } from '../context/AuthContext';
import { BarChart3, FileSpreadsheet, Download, RefreshCw, Calendar, Users, Clock, DollarSign } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { toast } from 'react-hot-toast';

export default function Reports() {
  const { employees, leaves, attendance } = useHRMS();
  const { user } = useAuth();

  const [activeReport, setActiveReport] = useState('attendance'); // attendance, leaves, payroll, department
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);

  if (!user) return null;

  const runReport = (type) => {
    setLoading(true);
    setActiveReport(type);
    setTimeout(() => {
      let data = [];
      if (type === 'attendance') {
        data = [
          { name: 'David Miller', present: 22, late: 1, absent: 0, compliance: '96%' },
          { name: 'Sarah Jenkins', present: 21, late: 0, absent: 2, compliance: '91%' },
          { name: 'Marcus Chen', present: 23, late: 0, absent: 0, compliance: '100%' },
          { name: 'Jonathan Carter', present: 20, late: 2, absent: 1, compliance: '87%' },
          { name: 'Emily Watson', present: 18, late: 1, absent: 4, compliance: '80%' },
        ];
      } else if (type === 'leaves') {
        data = [
          { department: 'Engineering', annual: 12, sick: 4, casual: 6, total: 22 },
          { department: 'Product Design', annual: 8, sick: 2, casual: 4, total: 14 },
          { department: 'Human Resources', annual: 5, sick: 1, casual: 3, total: 9 },
          { department: 'Sales Division', annual: 15, sick: 6, casual: 8, total: 29 },
        ];
      } else if (type === 'payroll') {
        data = [
          { month: 'Jan 2026', gross: 125000, taxes: 18750, net: 106250 },
          { month: 'Feb 2026', gross: 125000, taxes: 18750, net: 106250 },
          { month: 'Mar 2026', gross: 128000, taxes: 19200, net: 108800 },
          { month: 'Apr 2026', gross: 128000, taxes: 19200, net: 108800 },
          { month: 'May 2026', gross: 135000, taxes: 20250, net: 114750 },
          { month: 'Jun 2026', gross: 135000, taxes: 20250, net: 114750 },
        ];
      } else if (type === 'department') {
        data = [
          { department: 'Engineering Division', employees: 3, budgetShare: '42%' },
          { department: 'Product Design', employees: 2, budgetShare: '25%' },
          { department: 'Human Resources', employees: 1, budgetShare: '12%' },
          { department: 'Loss Prevention', employees: 1, budgetShare: '8%' },
          { department: 'Sales Division', employees: 1, budgetShare: '13%' },
        ];
      }
      setReportData(data);
      setLoading(false);
      toast.success('Report compiled successfully.');
    }, 800);
  };

  // Compile initial report
  React.useEffect(() => {
    runReport('attendance');
  }, []);

  const handleDownload = () => {
    toast.success('Compiling Secure CSV export sheet...');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Business Intelligence Reports</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Compile operational performance reports, payroll expenditure trends, and roster compliance charts.
          </p>
        </div>
        <Button onClick={handleDownload} variant="primary" icon={Download}>
          Download Export (CSV)
        </Button>
      </div>

      {/* Grid: Selector / Settings & Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar categories */}
        <Card className="lg:col-span-1 p-4 space-y-2 h-fit">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
            Report Classifications
          </span>
          
          <button
            onClick={() => runReport('attendance')}
            className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 ${
              activeReport === 'attendance'
                ? 'bg-primary text-white dark:bg-accent'
                : 'text-slate-655 hover:bg-slate-50 dark:hover:bg-slate-900/50 dark:text-slate-350'
            }`}
          >
            <Clock size={14} />
            <span>Attendance Reports</span>
          </button>

          <button
            onClick={() => runReport('leaves')}
            className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 ${
              activeReport === 'leaves'
                ? 'bg-primary text-white dark:bg-accent'
                : 'text-slate-655 hover:bg-slate-50 dark:hover:bg-slate-900/50 dark:text-slate-350'
            }`}
          >
            <Calendar size={14} />
            <span>Leave Analytics</span>
          </button>

          <button
            onClick={() => runReport('payroll')}
            className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 ${
              activeReport === 'payroll'
                ? 'bg-primary text-white dark:bg-accent'
                : 'text-slate-655 hover:bg-slate-50 dark:hover:bg-slate-900/50 dark:text-slate-350'
            }`}
          >
            <DollarSign size={14} />
            <span>Payroll Ledgers</span>
          </button>

          <button
            onClick={() => runReport('department')}
            className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2.5 ${
              activeReport === 'department'
                ? 'bg-primary text-white dark:bg-accent'
                : 'text-slate-655 hover:bg-slate-50 dark:hover:bg-slate-900/50 dark:text-slate-350'
            }`}
          >
            <Users size={14} />
            <span>Department Metrics</span>
          </button>
        </Card>

        {/* Content & Visual Chart */}
        <div className="lg:col-span-3 space-y-6">
          {/* Recharts visualizations */}
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white capitalize">{activeReport} Analysis chart</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Visual statistics compilation</span>
            </div>
            
            <div className="h-64">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <RefreshCw size={24} className="animate-spin text-primary dark:text-accent" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {activeReport === 'attendance' ? (
                    <BarChart data={reportData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar name="Days Present" dataKey="present" fill="#2E75B6" radius={[4, 4, 0, 0]} />
                      <Bar name="Late arrivals" dataKey="late" fill="#B8860B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : activeReport === 'leaves' ? (
                    <BarChart data={reportData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="department" stroke="#94A3B8" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar name="Annual Leave" dataKey="annual" fill="#1F3A5F" />
                      <Bar name="Sick Leave" dataKey="sick" fill="#B3261E" />
                      <Bar name="Casual Leave" dataKey="casual" fill="#B8860B" />
                    </BarChart>
                  ) : activeReport === 'payroll' ? (
                    <BarChart data={reportData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar name="Gross Expenses ($)" dataKey="gross" fill="#1F3A5F" />
                      <Bar name="Net Disbursed ($)" dataKey="net" fill="#2E7D32" />
                    </BarChart>
                  ) : (
                    <BarChart data={reportData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="department" stroke="#94A3B8" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar name="Staff Count" dataKey="employees" fill="#2E75B6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Grid Preview Table */}
          <Card className="p-5">
            <div className="mb-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Report Preview Data</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Live compilation of values</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  {activeReport === 'attendance' ? (
                    <tr>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Days Present</th>
                      <th className="px-4 py-3">Late Clock-Ins</th>
                      <th className="px-4 py-3">Days Absent</th>
                      <th className="px-4 py-3">Compliance Rate</th>
                    </tr>
                  ) : activeReport === 'leaves' ? (
                    <tr>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Annual Leaves</th>
                      <th className="px-4 py-3">Sick Leaves</th>
                      <th className="px-4 py-3">Casual Leaves</th>
                      <th className="px-4 py-3">Total Leaves</th>
                    </tr>
                  ) : activeReport === 'payroll' ? (
                    <tr>
                      <th className="px-4 py-3">Billing Cycle</th>
                      <th className="px-4 py-3">Gross Salaries</th>
                      <th className="px-4 py-3">Withholding Tax</th>
                      <th className="px-4 py-3">Net Disbursed</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Active Headcount</th>
                      <th className="px-4 py-3">Payroll Budget share</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-slate-400 font-semibold">
                        Compiling records...
                      </td>
                    </tr>
                  ) : reportData.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-slate-400 font-semibold">
                        No report compile logs.
                      </td>
                    </tr>
                  ) : activeReport === 'attendance' ? (
                    reportData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.name}</td>
                        <td className="px-4 py-3">{row.present} days</td>
                        <td className="px-4 py-3 text-warning font-semibold">{row.late}</td>
                        <td className="px-4 py-3 text-danger font-semibold">{row.absent}</td>
                        <td className="px-4 py-3"><Badge status="Approved">{row.compliance}</Badge></td>
                      </tr>
                    ))
                  ) : activeReport === 'leaves' ? (
                    reportData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.department}</td>
                        <td className="px-4 py-3">{row.annual}</td>
                        <td className="px-4 py-3">{row.sick}</td>
                        <td className="px-4 py-3">{row.casual}</td>
                        <td className="px-4 py-3 font-bold text-primary dark:text-accent">{row.total} days</td>
                      </tr>
                    ))
                  ) : activeReport === 'payroll' ? (
                    reportData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{row.month}</td>
                        <td className="px-4 py-3 font-bold">${row.gross.toLocaleString()}</td>
                        <td className="px-4 py-3 text-rose-600">-${row.taxes.toLocaleString()}</td>
                        <td className="px-4 py-3 font-extrabold text-emerald-600">${row.net.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    reportData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{row.department}</td>
                        <td className="px-4 py-3">{row.employees} employees</td>
                        <td className="px-4 py-3"><Badge status="Approved">{row.budgetShare}</Badge></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
