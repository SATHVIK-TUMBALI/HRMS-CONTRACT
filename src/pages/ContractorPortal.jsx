import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHRMS } from '../context/HRMSContext';
import { Users, Clock, TrendingUp, FileText, Upload, Plus, Search, AlertTriangle, Building, Download, CheckCircle, XCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm ${className}`}>{children}</div>
);
const Badge = ({ status, children }) => {
  const map = { Active: 'bg-emerald-100 text-emerald-700', Expired: 'bg-rose-100 text-rose-700', Pending: 'bg-amber-100 text-amber-700', Approved: 'bg-blue-100 text-blue-700' };
  const cls = map[status] || map[children] || 'bg-slate-100 text-slate-600';
  return <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${cls}`}>{children || status}</span>;
};

const AGENCIES = ['Techforce Services', 'Reliable Staffing', 'StaffPro Solutions'];

export default function ContractorPortal() {
  const { user, workforceMode } = useAuth();
  const { contractors, setContractors } = useHRMS();
  const [searchQuery, setSearchQuery] = useState('');
  const [agencyFilter, setAgencyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'site' | 'expiry'

  const [newCon, setNewCon] = useState({
    name: '', agency: 'Techforce Services', role: '', department: '', joiningDate: '', contractExpiry: '',
    ratePerHour: '', shift: 'General Shift (09:00 - 18:00)', manager: '', location: '', site: '', email: '', phone: '', contractType: 'Fixed-Term', poNumber: ''
  });

  const filtered = contractors.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase()) || c.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAgency = agencyFilter === 'All' || c.agency === agencyFilter;
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchAgency && matchStatus;
  });

  const activeCount = contractors.filter(c => c.status === 'Active').length;
  const expiredCount = contractors.filter(c => c.status === 'Expired').length;
  const expiringSoon = contractors.filter(c => {
    if (c.status !== 'Active') return false;
    const expiry = new Date(c.contractExpiry);
    const now = new Date();
    const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
    return diffDays <= 60 && diffDays > 0;
  });

  const totalMonthlyBill = contractors.filter(c => c.status === 'Active').reduce((sum, c) => sum + (c.ratePerHour * (c.hoursWorked || 176)), 0);

  const siteGroups = contractors.reduce((acc, c) => {
    if (!acc[c.site]) acc[c.site] = [];
    acc[c.site].push(c);
    return acc;
  }, {});

  const handleAddContractor = (e) => {
    e.preventDefault();
    const id = `CON-${String(contractors.length + 1).padStart(3, '0')}`;
    setContractors(prev => [...prev, { ...newCon, id, ratePerHour: parseInt(newCon.ratePerHour), hoursWorked: 0, status: 'Active', salary: parseInt(newCon.ratePerHour) * 176, isContractor: true, managerEmpId: '' }]);
    toast.success(`Contractor ${newCon.name} added successfully!`);
    setShowAddModal(false);
    setNewCon({ name: '', agency: 'Techforce Services', role: '', department: '', joiningDate: '', contractExpiry: '', ratePerHour: '', shift: 'General Shift (09:00 - 18:00)', manager: '', location: '', site: '', email: '', phone: '', contractType: 'Fixed-Term', poNumber: '' });
  };

  const handleBulkUpload = () => {
    const mockUploaded = [
      { id: `CON-${Date.now()}`, name: 'Kiran Rao', agency: 'Techforce Services', role: 'IT Support', department: 'Engineering Division', joiningDate: '2026-08-01', contractExpiry: '2027-01-31', ratePerHour: 280, hoursWorked: 0, shift: 'General Shift (09:00 - 18:00)', manager: 'David Miller', managerEmpId: 'EMP-012', location: 'San Francisco Hub', site: 'IT Lab', status: 'Active', salary: 49280, isContractor: true, phone: '+91 72345-67890', email: 'kiran.r@techforce.in', contractType: 'Fixed-Term', poNumber: 'PO-2026-BULK01' },
    ];
    setContractors(prev => [...prev, ...mockUploaded]);
    toast.success('Bulk upload simulation: 1 contractor added from CSV.');
    setShowBulkModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Contract Workforce Management</h2>
          <p className="text-slate-500 text-[11px] mt-0.5">Manage all contract employees, agencies, and billing — internal HR view only.</p>
        </div>
        {['Operational HR', 'Recruitment HR'].includes(user?.role) && (
          <div className="flex gap-2">
            <button onClick={() => setShowBulkModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-[11px] hover:bg-slate-200 transition-all cursor-pointer">
              <Upload size={12} /> Bulk Upload CSV
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white dark:bg-accent dark:text-slate-950 rounded-xl font-bold text-[11px] hover:opacity-90 transition-all cursor-pointer">
              <Plus size={12} /> Add Contractor
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Contractors', val: contractors.length, icon: Users, color: 'primary' },
          { label: 'Active', val: activeCount, icon: CheckCircle, color: 'success' },
          { label: 'Expiring in 60 Days', val: expiringSoon.length, icon: AlertTriangle, color: 'warning' },
          { label: 'Monthly Bill Est.', val: `₹${(totalMonthlyBill / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'info' },
        ].map((kpi, i) => (
          <Card key={i} className="p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${kpi.color === 'primary' ? 'bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent' : kpi.color === 'success' ? 'bg-emerald-100 text-emerald-600' : kpi.color === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
              <kpi.icon size={16} />
            </div>
            <div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">{kpi.val}</div>
              <div className="text-[10px] text-slate-500">{kpi.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Expiry Alert */}
      {expiringSoon.length > 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2">
          <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <strong className="text-amber-800 dark:text-amber-300 text-[11px]">{expiringSoon.length} contract(s) expiring within 60 days:</strong>
            <span className="text-amber-700 dark:text-amber-400 text-[10px] ml-1">{expiringSoon.map(c => `${c.name} (${c.contractExpiry})`).join(', ')}</span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[['list', 'Contractor List'], ['site', 'Site-wise View'], ['expiry', 'Contract Expiry Tracker']].map(([t, l]) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${activeTab === t ? 'bg-primary text-white dark:bg-accent dark:text-slate-950' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-900/40 dark:text-slate-400'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Contractor List Tab */}
      {activeTab === 'list' && (
        <Card className="overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name, ID, or role..." className="w-full pl-8 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-950 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <select value={agencyFilter} onChange={e => setAgencyFilter(e.target.value)} className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-950 dark:text-slate-300">
              <option value="All">All Agencies</option>
              {AGENCIES.map(a => <option key={a}>{a}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-950 dark:text-slate-300">
              <option value="All">All Status</option>
              <option>Active</option>
              <option>Expired</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-[9px] text-slate-500 uppercase font-extrabold tracking-wider">
                <tr>
                  {['ID', 'Name', 'Agency', 'Role', 'Department', 'Manager', 'Rate/Hr', 'Contract Expiry', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-[10px]">{c.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                      <div className="text-[10px] text-slate-400">{c.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.agency}</td>
                    <td className="px-4 py-3">{c.role}</td>
                    <td className="px-4 py-3 text-slate-500">{c.department}</td>
                    <td className="px-4 py-3 text-slate-500">{c.manager}</td>
                    <td className="px-4 py-3 font-bold text-primary dark:text-accent">₹{c.ratePerHour}/hr</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${new Date(c.contractExpiry) < new Date() ? 'text-rose-600' : new Date(c.contractExpiry) < new Date(Date.now() + 60 * 86400000) ? 'text-amber-600' : 'text-slate-600 dark:text-slate-400'}`}>
                        {c.contractExpiry}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Badge status={c.status}>{c.status}</Badge></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedContractor(c)} className="text-primary dark:text-accent font-bold hover:underline cursor-pointer">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="py-16 text-center text-slate-400 font-semibold">No contractors found matching your filters.</div>}
          </div>
        </Card>
      )}

      {/* Site View Tab */}
      {activeTab === 'site' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(siteGroups).map(([site, conts]) => (
            <Card key={site} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building size={14} className="text-primary dark:text-accent" />
                  <strong className="text-sm text-slate-800 dark:text-white">{site}</strong>
                </div>
                <span className="text-[10px] font-bold text-slate-500">{conts.filter(c => c.status === 'Active').length} Active</span>
              </div>
              <div className="space-y-2">
                {conts.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-[11px]">{c.name}</div>
                      <div className="text-[10px] text-slate-400">{c.role} · {c.agency}</div>
                    </div>
                    <Badge status={c.status}>{c.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Expiry Tracker Tab */}
      {activeTab === 'expiry' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Contract Expiry Tracker</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Monitor contract end dates and plan renewals proactively.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-[9px] text-slate-500 uppercase font-extrabold tracking-wider">
                <tr>
                  {['Contractor', 'Agency', 'Manager', 'Expiry Date', 'Days Remaining', 'Action'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[...contractors].sort((a, b) => new Date(a.contractExpiry) - new Date(b.contractExpiry)).map(c => {
                  const days = Math.round((new Date(c.contractExpiry) - new Date()) / 86400000);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{c.name}</td>
                      <td className="px-4 py-3 text-slate-500">{c.agency}</td>
                      <td className="px-4 py-3 text-slate-500">{c.manager}</td>
                      <td className="px-4 py-3 font-semibold">{c.contractExpiry}</td>
                      <td className="px-4 py-3">
                        <span className={`font-extrabold ${days < 0 ? 'text-rose-600' : days <= 30 ? 'text-rose-500' : days <= 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {days < 0 ? `${Math.abs(days)} days overdue` : `${days} days`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toast.success(`Renewal initiated for ${c.name}`)} className="text-primary dark:text-accent font-bold text-[10px] hover:underline cursor-pointer">Renew</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Contractor Detail Modal */}
      {selectedContractor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedContractor(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{selectedContractor.name}</h3>
                <p className="text-[11px] text-slate-400">{selectedContractor.id} · {selectedContractor.agency}</p>
              </div>
              <Badge status={selectedContractor.status}>{selectedContractor.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                ['Role', selectedContractor.role],
                ['Department', selectedContractor.department],
                ['Manager', selectedContractor.manager],
                ['Location', selectedContractor.location],
                ['Site', selectedContractor.site],
                ['Shift', selectedContractor.shift],
                ['Rate/Hour', `₹${selectedContractor.ratePerHour}`],
                ['Contract Type', selectedContractor.contractType],
                ['PO Number', selectedContractor.poNumber],
                ['Joining Date', selectedContractor.joiningDate],
                ['Contract Expiry', selectedContractor.contractExpiry],
                ['Monthly Estimate', `₹${(selectedContractor.ratePerHour * 176).toLocaleString()}`],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">{k}</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{v}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { toast.success('Renewal initiated!'); setSelectedContractor(null); }} className="px-4 py-2 bg-primary text-white dark:bg-accent dark:text-slate-950 rounded-xl font-bold text-xs cursor-pointer">Renew Contract</button>
              <button onClick={() => setSelectedContractor(null)} className="px-4 py-2 border rounded-xl font-bold text-xs cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contractor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">Add New Contractor</h3>
            <form onSubmit={handleAddContractor} className="grid grid-cols-2 gap-3 text-xs">
              {[
                ['name', 'Full Name', 'text'],
                ['email', 'Email', 'email'],
                ['phone', 'Phone', 'tel'],
                ['role', 'Role / Designation', 'text'],
                ['department', 'Department', 'text'],
                ['location', 'Location', 'text'],
                ['site', 'Site / Floor', 'text'],
                ['manager', 'Reporting Manager', 'text'],
                ['ratePerHour', 'Rate per Hour (₹)', 'number'],
                ['poNumber', 'PO Number', 'text'],
                ['joiningDate', 'Joining Date', 'date'],
                ['contractExpiry', 'Contract Expiry', 'date'],
              ].map(([key, label, type]) => (
                <div key={key}>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">{label}</label>
                  <input type={type} required value={newCon[key]} onChange={e => setNewCon(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              ))}
              <div className="col-span-2 flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-xl font-bold cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white dark:bg-accent dark:text-slate-950 rounded-xl font-bold cursor-pointer">Add Contractor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBulkModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Bulk Upload Contractors (CSV)</h3>
            <div className="p-4 border-2 border-dashed border-primary/30 rounded-xl text-center space-y-2">
              <Upload size={24} className="mx-auto text-primary dark:text-accent" />
              <p className="text-[11px] text-slate-500 font-semibold">Drop your CSV file here or click to browse</p>
              <p className="text-[10px] text-slate-400">Columns: name, agency, role, department, joiningDate, contractExpiry, ratePerHour, manager, location, site</p>
              <button onClick={handleBulkUpload} className="px-4 py-2 bg-primary text-white dark:bg-accent dark:text-slate-950 rounded-xl font-bold text-xs cursor-pointer">Simulate Upload (Demo)</button>
            </div>
            <button onClick={() => setShowBulkModal(false)} className="w-full py-2 border rounded-xl font-bold text-xs cursor-pointer">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
