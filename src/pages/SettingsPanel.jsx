import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHRMS } from '../context/HRMSContext';
import {
  Settings, Building2, ShieldCheck, GitFork, History, Upload,
  Landmark, RefreshCw, Check, AlertTriangle, Plus, Shield, UserCheck,
  KeySquare, Calendar
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import { toast } from 'react-hot-toast';

function LeaveOffRosterView({ orgData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');

  const rosterData = [
    { name: 'Alexander Wright', branch: 'New York HQ (Main)', dept: 'Executive Board', status: 'On Duty', details: 'Active' },
    { name: 'Rebecca Vance', branch: 'New York HQ (Main)', dept: 'Human Resources', status: 'On Duty', details: 'Active' },
    { name: 'David Miller', branch: 'New York HQ (Main)', dept: 'Engineering', status: 'Weekly Off', details: 'Roster Off' },
    { name: 'Sarah Jenkins', branch: 'San Francisco Innovation Hub', dept: 'Product Design', status: 'On Leave', details: 'Annual Leave (Aug 2-5)' },
    { name: 'Emily Stone', branch: 'Austin Dev Center', dept: 'Engineering', status: 'On Leave', details: 'Sick Leave (Aug 3-4)' },
    { name: 'Marcus Chen', branch: 'New York HQ (Main)', dept: 'Loss Prevention', status: 'On Duty', details: 'Active' },
    { name: 'Jonathan Doe', branch: 'San Francisco Innovation Hub', dept: 'Product Design', status: 'Weekly Off', details: 'Roster Off' },
    { name: 'Robert Blake', branch: 'Austin Dev Center', dept: 'Engineering', status: 'On Duty', details: 'Active' }
  ];

  const filteredRoster = rosterData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.dept.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === 'All' || item.branch.includes(selectedBranch);
    return matchesSearch && matchesBranch;
  });

  return (
    <div className="space-y-4 text-xs text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-white">Leave & Off Roster Search</h3>
          <p className="text-slate-400 font-semibold mt-0.5">Track which employee or branch currently has scheduled off-days or active leave.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search employee or dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-xs py-1.5 px-3 border dark:border-slate-850 rounded bg-white dark:bg-slate-950 dark:text-slate-350 w-48"
          />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="text-xs py-1.5 px-3 border dark:border-slate-850 rounded bg-white dark:bg-slate-950 dark:text-slate-350"
          >
            <option value="All">All Branches</option>
            <option value="New York">New York HQ</option>
            <option value="San Francisco">San Francisco Hub</option>
            <option value="Austin">Austin Dev Center</option>
          </select>
        </div>
      </div>

      <Card className="overflow-hidden animate-fade-in">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-3">Employee Name</th>
              <th className="px-6 py-3">Branch Location</th>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Details / Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-650 dark:text-slate-400">
            {filteredRoster.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">{item.name}</td>
                <td className="px-6 py-3.5 font-semibold">{item.branch}</td>
                <td className="px-6 py-3.5">{item.dept}</td>
                <td className="px-6 py-3.5">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    item.status === 'On Duty'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : item.status === 'On Leave'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-slate-450 font-medium">{item.details}</td>
              </tr>
            ))}
            {filteredRoster.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-450 font-bold">
                  No records found matching search filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default function SettingsPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { employees } = useHRMS();
  const isAdmin = user?.role === 'Admin';

  // Active tab derived from pathname
  const [activeTab, setActiveTab] = useState('profile');
  const [orgSubTab, setOrgSubTab] = useState('companies');
  const [policySubTab, setPolicySubTab] = useState('leave');

  // Org Hierarchy State
  const [orgData, setOrgData] = useState({
    companies: [
      { id: 'COM-1', name: 'Enterprise Global Corp', code: 'EGC', status: 'Active', parent: 'None' },
      { id: 'COM-2', name: 'APAC Division Ltd', code: 'APDL', status: 'Active', parent: 'None' }
    ],
    branches: [
      { id: 'BR-1', name: 'New York HQ (Main)', code: 'NY-01', status: 'Active', parent: 'Enterprise Global Corp' },
      { id: 'BR-2', name: 'San Francisco Innovation Hub', code: 'SF-02', status: 'Active', parent: 'Enterprise Global Corp' },
      { id: 'BR-3', name: 'Austin Dev Center', code: 'ATX-03', status: 'Active', parent: 'Enterprise Global Corp' }
    ],
    departments: [
      { id: 'DEP-1', name: 'Engineering & Development', code: 'ENG', status: 'Active', parent: 'New York HQ (Main)' },
      { id: 'DEP-2', name: 'Product UX/UI Design', code: 'DSN', status: 'Active', parent: 'New York HQ (Main)' },
      { id: 'DEP-3', name: 'Loss Prevention & Security', code: 'SEC', status: 'Active', parent: 'New York HQ (Main)' }
    ],
    locations: [
      { id: 'LOC-1', name: '75 Wall Street, Manhattan', code: 'WALL-NYC', status: 'Active', parent: 'New York HQ (Main)' },
      { id: 'LOC-2', name: 'Market Street, Suite 500', code: 'MKT-SF', status: 'Active', parent: 'San Francisco Innovation Hub' }
    ],
    designations: [
      { id: 'DSG-1', name: 'Managing Director & VP', code: 'MD-VP', status: 'Active', parent: 'None' },
      { id: 'DSG-2', name: 'Chief HR Officer', code: 'CHRO', status: 'Active', parent: 'None' },
      { id: 'DSG-3', name: 'Engineering Manager', code: 'ENG-MGR', status: 'Active', parent: 'None' },
      { id: 'DSG-4', name: 'Senior UI/UX Designer', code: 'SR-DSN', status: 'Active', parent: 'None' }
    ]
  });

  const [selectedNode, setSelectedNode] = useState(null);
  
  // Organization Edit details
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [editParent, setEditParent] = useState('');

  // Add Org Modal states
  const [isAddOrgModalOpen, setIsAddOrgModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgCode, setNewOrgCode] = useState('');
  const [newOrgParent, setNewOrgParent] = useState('None');

  // Statutory Policies state
  const [leaveAccrualRate, setLeaveAccrualRate] = useState(1.6);
  const [carryForwardCap, setCarryForwardCap] = useState(24);
  const [sandwichLeaveActive, setSandwichLeaveActive] = useState(true);
  const [otWeekdayMultiplier, setOtWeekdayMultiplier] = useState(1.5);
  const [otWeekendMultiplier, setOtWeekendMultiplier] = useState(2.0);
  const [otMaxShiftHours, setOtMaxShiftHours] = useState(8);
  const [policyEffectiveDate, setPolicyEffectiveDate] = useState('2026-08-01');
  const [sickLeaveSlabs, setSickLeaveSlabs] = useState([
    { id: 1, fromDays: 1, toDays: 50, payPct: 100 },
    { id: 2, fromDays: 51, toDays: 75, payPct: 75 },
    { id: 3, fromDays: 76, toDays: 120, payPct: 50 }
  ]);

  // Bulk Import state
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const [importHistory, setImportHistory] = useState([
    { id: 'JOB-901', filename: 'nyc_onboarding_q3.csv', timestamp: '2026-07-28 10:15 AM', total: 15, valid: 15, errors: 0, status: 'Completed' },
    { id: 'JOB-902', filename: 'contractors_import.xlsx', timestamp: '2026-07-29 02:40 PM', total: 12, valid: 10, errors: 2, status: 'Completed with Errors' }
  ]);

  // FNF Selection state
  const [exitEmpId, setExitEmpId] = useState('EMP-108'); // default Sarah Jenkins
  const [clearanceAssets, setClearanceAssets] = useState(true);
  const [clearanceIT, setClearanceIT] = useState(true);
  const [clearanceGratuity, setClearanceGratuity] = useState(false);
  const [fnfExecuted, setFnfExecuted] = useState(false);

  // Permissions state matrix
  const [permissionMatrix, setPermissionMatrix] = useState({
    Admin: { directory: true, attendance: true, leaves: true, payroll: true, gateAccess: true, departmentNav: true, approvalsNav: true },
    HR: { directory: true, attendance: true, leaves: true, payroll: true, gateAccess: false, departmentNav: true, approvalsNav: true },
    Manager: { directory: true, attendance: true, leaves: true, payroll: false, gateAccess: false, departmentNav: false, approvalsNav: true },
    Employee: { directory: false, attendance: true, leaves: true, payroll: false, gateAccess: false, departmentNav: false, approvalsNav: false },
    Security: { directory: false, attendance: false, leaves: false, payroll: false, gateAccess: true, departmentNav: false, approvalsNav: false },
  });

  // Mapped audit logs
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'User Sign-In (SSO)', user: 'Alexander Wright', ip: '192.168.1.49', timestamp: '2026-07-30 08:32 AM', status: 'Success' },
    { id: 2, action: 'Role Switch Sim', user: 'Rebecca Vance (HR)', ip: '192.168.1.12', timestamp: '2026-07-30 09:15 AM', status: 'Success' },
    { id: 3, action: 'Modified Employee Dossier', user: 'Rebecca Vance (HR)', ip: '192.168.1.12', timestamp: '2026-07-30 10:02 AM', status: 'Success' },
    { id: 4, action: 'Leave Request Approval', user: 'David Miller (Manager)', ip: '192.168.2.14', timestamp: '2026-07-30 11:22 AM', status: 'Success' },
    { id: 5, action: 'Simulated Payroll Run', user: 'Alexander Wright', ip: '192.168.1.49', timestamp: '2026-07-30 02:30 PM', status: 'Success' }
  ]);

  // Sync tab based on path URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/org/')) {
      setActiveTab('org');
      if (path.includes('/org/companies')) {
        setOrgSubTab('companies');
      } else if (path.includes('/org/branches')) {
        setOrgSubTab('branches');
      } else if (path.includes('/org/departments')) {
        setOrgSubTab('departments');
      } else if (path.includes('/org/locations')) {
        setOrgSubTab('locations');
      } else if (path.includes('/org/designations')) {
        setOrgSubTab('designations');
      }
    } else if (path.includes('/admin/permissions')) {
      setActiveTab('permissions');
    } else if (path.includes('/policies/')) {
      setActiveTab('policies');
      if (path.includes('/policies/leave')) {
        setPolicySubTab('leave');
      } else if (path.includes('/policies/ot')) {
        setPolicySubTab('ot');
      } else if (path.includes('/policies/salary')) {
        setPolicySubTab('salary');
      }
    } else if (path.includes('/admin/credentials')) {
      setActiveTab('credentials');
    } else if (path.includes('/admin/roster-leaves')) {
      setActiveTab('roster-leaves');
    } else if (path.includes('/admin/workflow')) {
      setActiveTab('workflow');
    } else if (path.includes('/admin/audit-logs')) {
      setActiveTab('audit-logs');
    } else if (path.includes('/employees/import')) {
      setActiveTab('import');
    } else if (path.includes('/payroll/fnf')) {
      setActiveTab('fnf');
    } else if (path.includes('/payroll/cost-centers')) {
      setActiveTab('cost-centers');
    } else {
      setActiveTab('profile');
    }
  }, [location.pathname]);

  // Sync selected node form when selectedNode changes
  useEffect(() => {
    if (selectedNode) {
      setEditName(selectedNode.name);
      setEditCode(selectedNode.code);
      setEditStatus(selectedNode.status);
      setEditParent(selectedNode.parent);
    } else {
      setEditName('');
      setEditCode('');
      setEditStatus('Active');
      setEditParent('');
    }
  }, [selectedNode]);

  // Initialize selectedNode when subtab changes
  useEffect(() => {
    if (orgSubTab && orgData[orgSubTab] && orgData[orgSubTab].length > 0) {
      setSelectedNode(orgData[orgSubTab][0]);
    } else {
      setSelectedNode(null);
    }
  }, [orgSubTab, orgData]);

  if (!user) return null;

  const togglePermission = (role, module) => {
    setPermissionMatrix(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: !prev[role][module]
      }
    }));
    toast.success(`Access permissions updated for ${role}.`);
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    if (!importFile) {
      toast.error('Please drag and drop or upload a CSV file.');
      return;
    }
    setIsImporting(true);
    setImportSummary(null);
    setImportErrors([]);
    setTimeout(() => {
      setIsImporting(false);
      setImportFile(null);
      
      // Load mock reports
      setImportSummary({
        total: 10,
        valid: 8,
        errors: 2,
        imported: 8
      });
      setImportErrors([
        { row: 3, field: 'Email Address', message: 'sarah.jenkins@corp.com is already in use', reason: 'Duplicate Record' },
        { row: 7, field: 'Department Code', message: 'FIN-90 department code was not resolved in Master registry', reason: 'Unresolved Hierarchy Reference' }
      ]);
      setImportHistory(prev => [
        { id: `JOB-${Date.now()}`, filename: importFile.name, timestamp: 'Just now', total: 10, valid: 8, errors: 2, status: 'Completed with Errors' },
        ...prev
      ]);
      toast.error('Bulk Import processed with 2 validation errors. Read checklist report below.');
    }, 1500);
  };

  const handleSaveOrgNode = (e) => {
    e.preventDefault();
    if (!selectedNode) return;
    setOrgData(prev => {
      const list = prev[orgSubTab].map(item => {
        if (item.id === selectedNode.id) {
          return { ...item, name: editName, code: editCode, status: editStatus, parent: editParent };
        }
        return item;
      });
      return { ...prev, [orgSubTab]: list };
    });
    toast.success(`Updated ${orgSubTab.slice(0, -1)}: ${editName}`);
  };

  const handleAddOrgNode = (e) => {
    e.preventDefault();
    if (!newOrgName || !newOrgCode) {
      toast.error('Please fill in Name and Code.');
      return;
    }
    const newNode = {
      id: `${orgSubTab.slice(0, 3).toUpperCase()}-${Date.now()}`,
      name: newOrgName,
      code: newOrgCode,
      status: 'Active',
      parent: newOrgParent
    };
    setOrgData(prev => ({
      ...prev,
      [orgSubTab]: [...prev[orgSubTab], newNode]
    }));
    setIsAddOrgModalOpen(false);
    setNewOrgName('');
    setNewOrgCode('');
    setNewOrgParent('None');
    toast.success(`Successfully added new ${orgSubTab.slice(0, -1)}: ${newOrgName}`);
  };

  const handleDeleteOrgNode = (id) => {
    setOrgData(prev => ({
      ...prev,
      [orgSubTab]: prev[orgSubTab].filter(item => item.id !== id)
    }));
    toast.success(`Deleted ${orgSubTab.slice(0, -1)} successfully.`);
  };

  // Slabs handlers
  const handleAddSlab = () => {
    const nextId = sickLeaveSlabs.length > 0 ? Math.max(...sickLeaveSlabs.map(s => s.id)) + 1 : 1;
    setSickLeaveSlabs(prev => [...prev, { id: nextId, fromDays: 0, toDays: 0, payPct: 100 }]);
  };

  const handleUpdateSlab = (id, field, val) => {
    setSickLeaveSlabs(prev => prev.map(s => s.id === id ? { ...s, [field]: parseInt(val) || 0 } : s));
  };

  const handleDeleteSlab = (id) => {
    setSickLeaveSlabs(prev => prev.filter(s => s.id !== id));
  };

  const getSingularName = (tab) => {
    switch (tab) {
      case 'companies': return 'Company';
      case 'branches': return 'Branch';
      case 'departments': return 'Department';
      case 'locations': return 'Location';
      case 'designations': return 'Designation';
      default: return 'Entity';
    }
  };

  // Render sub panels
  const renderTabContent = () => {
    switch (activeTab) {
      case 'org':
        const getEmployeesForNode = (node, category) => {
          if (!node) return [];
          const nameLower = node.name.toLowerCase();
          const codeLower = node.code.toLowerCase();
          
          return employees.filter(emp => {
            if (category === 'companies') {
              if (codeLower === 'egc') {
                return emp.location !== 'APAC';
              }
              if (codeLower === 'apdl') {
                return emp.location === 'APAC';
              }
              return false;
            }
            
            if (category === 'branches') {
              const empLoc = emp.location.toLowerCase();
              return nameLower.includes(empLoc) || empLoc.includes(nameLower) || 
                     nameLower.replace(/[^a-z]/g, '').includes(empLoc.replace(/[^a-z]/g, '')) ||
                     empLoc.replace(/[^a-z]/g, '').includes(nameLower.replace(/[^a-z]/g, ''));
            }
            
            if (category === 'departments') {
              const empDept = emp.department.toLowerCase();
              const keywords = ['engineering', 'design', 'security', 'resources', 'board', 'marketing', 'sales', 'operations'];
              const matchedKeyword = keywords.find(k => nameLower.includes(k) && empDept.includes(k));
              if (matchedKeyword) return true;
              return nameLower.includes(empDept) || empDept.includes(nameLower);
            }
            
            if (category === 'locations') {
              const parentLower = node.parent.toLowerCase();
              const empLoc = emp.location.toLowerCase();
              return empLoc.includes(parentLower) || parentLower.includes(empLoc) || 
                     nameLower.includes(empLoc) || empLoc.includes(nameLower);
            }
            
            if (category === 'designations') {
              const empDesig = emp.designation.toLowerCase();
              return nameLower.includes(empDesig) || empDesig.includes(nameLower);
            }
            
            return false;
          });
        };

        const nodeEmployees = selectedNode ? getEmployeesForNode(selectedNode, orgSubTab) : [];

        return (
          <div className="space-y-6 text-xs text-left animate-fade-in">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Organization Hierarchy Setup</h3>
                <p className="text-slate-400 font-semibold mt-0.5">Define corporate nodes: companies, branches, departments, locations, and designations.</p>
              </div>
              {!isAdmin && (
                <Button onClick={() => setIsAddOrgModalOpen(true)} variant="primary" icon={Plus}>
                  Add New {getSingularName(orgSubTab)}
                </Button>
              )}
            </div>

            {/* Inline Sub-Navigation for Org Registry Levels */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5 overflow-x-auto">
              {['companies', 'branches', 'departments', 'locations', 'designations'].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setOrgSubTab(tab);
                    navigate(`/org/${tab}`);
                  }}
                  className={`py-1.5 px-3.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    orgSubTab === tab
                      ? 'bg-primary text-white dark:bg-accent dark:text-slate-950 shadow-xs'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:bg-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel: Entity list hierarchy */}
              <Card className="lg:col-span-1 p-4 space-y-4">
                <div>
                  <h4 className="font-bold text-primary dark:text-accent uppercase text-[10px] tracking-wider mb-2">
                    {getSingularName(orgSubTab)} Registry List
                  </h4>
                  <p className="text-[10px] text-slate-400">Click to select and view node details</p>
                </div>
                
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {orgData[orgSubTab].map(node => {
                    const isSelected = selectedNode && selectedNode.id === node.id;
                    const nodeHeadcount = getEmployeesForNode(node, orgSubTab).length;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 dark:border-accent dark:bg-slate-900'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                        }`}
                      >
                        <div className="text-left">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">{node.name}</span>
                          <span className="text-[10px] text-slate-455">Code: {node.code} &bull; Headcount: <strong className="text-primary dark:text-accent">{nodeHeadcount}</strong></span>
                        </div>
                        <Badge status={node.status} />
                      </div>
                    );
                  })}
                  {orgData[orgSubTab].length === 0 && (
                    <div className="py-8 text-center text-slate-455 font-semibold">
                      No {orgSubTab} configured. Click Add New.
                    </div>
                  )}
                </div>
              </Card>

              {/* Right Panel: Detail form */}
              <Card className="lg:col-span-2 p-5">
                {selectedNode ? (
                  <>
                    <form onSubmit={handleSaveOrgNode} className="space-y-4">
                      <div>
                        <h4 className="font-bold text-slate-850 dark:text-white text-[11px] uppercase tracking-wider mb-3">
                          {isAdmin ? 'View' : 'Edit'} {getSingularName(orgSubTab)}: <span className="text-primary dark:text-accent font-extrabold">{selectedNode.name}</span>
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <Input
                          label="Entity Name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          required
                          disabled={isAdmin}
                        />
                        <Input
                          label="System Code"
                          value={editCode}
                          onChange={(e) => setEditCode(e.target.value)}
                          required
                          disabled={isAdmin}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        {['branches', 'departments', 'locations'].includes(orgSubTab) ? (
                          <Select
                            label="Parent Association Node"
                            value={editParent}
                            onChange={(e) => setEditParent(e.target.value)}
                            options={[
                              'None',
                              ...(orgSubTab === 'branches' ? orgData.companies.map(c => c.name) : []),
                              ...(orgSubTab === 'departments' ? orgData.branches.map(b => b.name) : []),
                              ...(orgSubTab === 'locations' ? orgData.branches.map(b => b.name) : [])
                            ]}
                            disabled={isAdmin}
                          />
                        ) : (
                          <Input label="Parent Association" value="None" disabled />
                        )}

                        <Select
                          label="Active Status Flag"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          options={['Active', 'Inactive']}
                          disabled={isAdmin}
                        />
                      </div>

                      {isAdmin ? (
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                          <div className="p-3 bg-amber-50 dark:bg-amber-955/20 text-amber-850 dark:text-amber-300 rounded-xl text-center font-semibold text-xs border border-amber-250/30">
                            Read-Only View: As Administrator, you can view the organizational structure but edits are restricted to HR.
                          </div>
                        </div>
                      ) : (
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between">
                          <Button
                            type="button"
                            onClick={() => handleDeleteOrgNode(selectedNode.id)}
                            variant="secondary"
                            className="text-rose-650 border border-slate-200 hover:bg-rose-50"
                          >
                            Deactivate / Delete Node
                          </Button>
                          <Button type="submit" variant="primary">
                            Save Registry Changes
                          </Button>
                        </div>
                      )}
                    </form>

                    {/* Employee Headcount & Roster Directory */}
                    <div className="border-t border-slate-150 dark:border-slate-800 pt-5 mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                            Node Headcount & Workforce
                          </h5>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            List of active personnel assigned to this node hierarchy.
                          </p>
                        </div>
                        <Badge status="Active">
                          {nodeEmployees.length} {nodeEmployees.length === 1 ? 'Employee' : 'Employees'}
                        </Badge>
                      </div>

                      {nodeEmployees.length > 0 ? (
                        <div className="overflow-x-auto max-h-[250px] overflow-y-auto border border-slate-150 dark:border-slate-800 rounded-xl">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-[9px] text-slate-450 uppercase font-bold tracking-wider border-b border-slate-150 dark:border-slate-800">
                              <tr>
                                <th className="px-4 py-2">Employee Name</th>
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Department</th>
                                <th className="px-4 py-2">Designation</th>
                                <th className="px-4 py-2">Location</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                              {nodeEmployees.map(emp => (
                                <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                                  <td className="px-4 py-2.5 font-bold text-slate-950 dark:text-white flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary dark:bg-accent/15 dark:text-accent flex items-center justify-center text-[10px] font-black uppercase">
                                      {emp.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    {emp.name}
                                  </td>
                                  <td className="px-4 py-2.5 font-mono text-[10px] font-bold">{emp.id}</td>
                                  <td className="px-4 py-2.5 text-slate-500 font-semibold">{emp.department}</td>
                                  <td className="px-4 py-2.5 text-slate-500">{emp.designation}</td>
                                  <td className="px-4 py-2.5 text-slate-455 font-medium">{emp.location}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-slate-455 font-semibold border border-dashed rounded-xl bg-slate-50/30">
                          No employees currently assigned to this node.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-24 text-center text-slate-455 font-semibold">
                    Select a node from the registry list to edit its details.
                  </div>
                )}
              </Card>
            </div>

            {/* Add Node Modal */}
            <Modal isOpen={isAddOrgModalOpen} onClose={() => setIsAddOrgModalOpen(false)} title={`Create Statutory ${getSingularName(orgSubTab)}`}>
              <form onSubmit={handleAddOrgNode} className="space-y-4">
                <Input
                  label="Name / Identifier"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder={`e.g. Finance Division, EMEA ${getSingularName(orgSubTab)}...`}
                  required
                />
                <Input
                  label="Unique Roster Code"
                  value={newOrgCode}
                  onChange={(e) => setNewOrgCode(e.target.value)}
                  placeholder="e.g. FIN-CC, EMEA-02"
                  required
                />

                {['branches', 'departments', 'locations'].includes(orgSubTab) && (
                  <Select
                    label="Parent Association Mapping"
                    value={newOrgParent}
                    onChange={(e) => setNewOrgParent(e.target.value)}
                    options={[
                      'None',
                      ...(orgSubTab === 'branches' ? orgData.companies.map(c => c.name) : []),
                      ...(orgSubTab === 'departments' ? orgData.branches.map(b => b.name) : []),
                      ...(orgSubTab === 'locations' ? orgData.branches.map(b => b.name) : [])
                    ]}
                  />
                )}

                <div className="border-t border-slate-150 dark:border-slate-800 pt-4 flex justify-end gap-2 text-left">
                  <Button onClick={() => setIsAddOrgModalOpen(false)} variant="secondary">Cancel</Button>
                  <Button type="submit" variant="primary">Add Node</Button>
                </div>
              </form>
            </Modal>
          </div>
        );
      
      case 'permissions':
        if (!isAdmin) return <div className="p-6 text-center text-rose-500 font-bold border border-rose-250 bg-rose-50 rounded-xl">Access Denied: Permissions management is restricted to Administrators.</div>;
        return (
          <div className="space-y-6 text-xs text-left animate-fade-in">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Access Roles & Security Permissions</h3>
              <p className="text-slate-400 font-semibold mt-0.5">Define statutory modules permissions, page navigations, and approval routing controls.</p>
            </div>

            <Card className="overflow-hidden">
              <table className="w-full border-collapse text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Access Role</th>
                    <th className="px-6 py-3 text-center">Directory Roster</th>
                    <th className="px-6 py-3 text-center">Attendance Logs</th>
                    <th className="px-6 py-3 text-center">Leave Console</th>
                    <th className="px-6 py-3 text-center">Payroll Disburse</th>
                    <th className="px-6 py-3 text-center">Gate Terminal</th>
                    <th className="px-6 py-3 text-center">Department Nav</th>
                    <th className="px-6 py-3 text-center">Approvals Nav</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.entries(permissionMatrix).map(([role, mods]) => (
                    <tr key={role} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{role} View</td>
                      {Object.keys(mods).map(mod => (
                        <td key={mod} className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={mods[mod]}
                            onChange={() => togglePermission(role, mod)}
                            className="rounded-sm border-slate-300 text-primary focus:ring-primary h-4.5 w-4.5 cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        );

      case 'policies':
        if (!['HR', 'Finance HR', 'Operational HR'].includes(user.role)) return <div className="p-6 text-center text-rose-500 font-bold border border-rose-250 bg-rose-50 rounded-xl">Access Denied: Policies configuration is managed by Finance or Operational HR.</div>;
        return (
          <div className="space-y-6 text-xs text-left animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Compliance & Statutory Policies Builder</h3>
                <p className="text-slate-400 font-semibold mt-0.5">Edit accrual parameters, overtime scales, sandwich rules, and payment slabs.</p>
              </div>
            </div>

            {/* Inline Sub-Navigation for Policies */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5 overflow-x-auto">
              {[
                { id: 'leave', label: 'Leave Policies' },
                { id: 'ot', label: 'Overtime (OT) Policies' },
                { id: 'salary', label: 'Salary Components' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setPolicySubTab(tab.id);
                    navigate(`/policies/${tab.id}`);
                  }}
                  className={`py-1.5 px-3.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                    policySubTab === tab.id
                      ? 'bg-primary text-white dark:bg-accent dark:text-slate-950 shadow-xs'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:bg-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {policySubTab === 'leave' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Parameter Settings Form */}
                <Card className="lg:col-span-2 p-5 space-y-4">
                  <div>
                    <h4 className="font-bold text-primary dark:text-accent uppercase text-[10px] tracking-wider border-b pb-1.5 mb-3">
                      Leave Accrual & Sandwich Leave Rules
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <Input
                      label="Monthly Accrual Rate (Days)"
                      type="number"
                      step="0.1"
                      value={leaveAccrualRate}
                      onChange={(e) => setLeaveAccrualRate(parseFloat(e.target.value) || 0)}
                    />
                    <Input
                      label="Carry Forward Cap (Days)"
                      type="number"
                      value={carryForwardCap}
                      onChange={(e) => setCarryForwardCap(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl flex items-center justify-between">
                    <div className="text-left">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">Sandwich Leave Rule Logic</span>
                      <p className="text-[10px] text-slate-450">Bridges weekend/holiday gap if leave spans both sides.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sandwichLeaveActive}
                        onChange={(e) => setSandwichLeaveActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="border-t pt-4 flex justify-end">
                    <Button onClick={() => toast.success('Leave policies saved.')} variant="primary">
                      Save Leave Rules
                    </Button>
                  </div>
                </Card>

                {/* Extended Sick Leave Slab Builder */}
                <Card className="lg:col-span-1 p-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-1.5">
                      <h4 className="font-bold text-primary dark:text-accent uppercase text-[10px] tracking-wider">
                        Extended Sick Slabs
                      </h4>
                      <Button onClick={handleAddSlab} size="sm" variant="outline" className="py-0.5 px-2 text-[9px] font-bold">
                        + Add Slab
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                      {sickLeaveSlabs.map((slab, idx) => (
                        <div key={slab.id} className="p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl space-y-2 text-left relative">
                          <button
                            type="button"
                            onClick={() => handleDeleteSlab(slab.id)}
                            className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 font-bold text-[10px] cursor-pointer"
                          >
                            Delete
                          </button>
                          <span className="font-bold text-[10px] text-slate-400">SLAB LEVEL {idx + 1}</span>
                          <div className="grid grid-cols-3 gap-1.5">
                            <div>
                              <label className="text-[9px] text-slate-400 font-bold block mb-0.5">From Day</label>
                              <input
                                type="number"
                                value={slab.fromDays}
                                onChange={(e) => handleUpdateSlab(slab.id, 'fromDays', e.target.value)}
                                className="w-full text-xs py-1 px-1.5 border dark:border-slate-800 rounded bg-white dark:bg-slate-950 dark:text-slate-350"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-bold block mb-0.5">To Day</label>
                              <input
                                type="number"
                                value={slab.toDays}
                                onChange={(e) => handleUpdateSlab(slab.id, 'toDays', e.target.value)}
                                className="w-full text-xs py-1 px-1.5 border dark:border-slate-800 rounded bg-white dark:bg-slate-950 dark:text-slate-350"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-400 font-bold block mb-0.5">% Pay</label>
                              <input
                                type="number"
                                value={slab.payPct}
                                onChange={(e) => handleUpdateSlab(slab.id, 'payPct', e.target.value)}
                                className="w-full text-xs py-1 px-1.5 border dark:border-slate-800 rounded bg-white dark:bg-slate-950 dark:text-slate-350"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-[9px] text-slate-400 mt-4 text-center font-semibold italic">
                    Changes here affect next calendar month payroll run calculation slabs.
                  </div>
                </Card>
              </div>
            )}

            {policySubTab === 'ot' && (
              <Card className="p-5 space-y-4 max-w-3xl animate-fade-in">
                <div>
                  <h4 className="font-bold text-primary dark:text-accent uppercase text-[10px] tracking-wider border-b pb-1.5 mb-3">
                    Overtime Multipliers & Safety Limits
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <Input
                    label="Weekday OT Multiplier"
                    type="number"
                    step="0.1"
                    value={otWeekdayMultiplier}
                    onChange={(e) => setOtWeekdayMultiplier(parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    label="Weekend OT Multiplier"
                    type="number"
                    step="0.1"
                    value={otWeekendMultiplier}
                    onChange={(e) => setOtWeekendMultiplier(parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    label="Max OT Limit (hrs/shift)"
                    type="number"
                    value={otMaxShiftHours}
                    onChange={(e) => setOtMaxShiftHours(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <Input
                    label="Night Shift Premium Multiplier"
                    type="number"
                    step="0.05"
                    defaultValue={1.15}
                  />
                  <Select
                    label="OT Pre-Approval Requirement"
                    defaultValue="Always Required"
                    options={['Always Required', 'Only for Weekends', 'Auto-Approved under 2hrs', 'No Approval Required']}
                  />
                </div>

                <div className="border-t pt-4 flex justify-end">
                  <Button onClick={() => toast.success('OT policies saved.')} variant="primary">
                    Save OT Rules
                  </Button>
                </div>
              </Card>
            )}

            {policySubTab === 'salary' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Statutory Salary Components</h4>
                    <p className="text-slate-450 text-[11px] font-medium">Define structures for gross salary calculation, benefits, and tax deductions.</p>
                  </div>
                  <Button onClick={() => toast.success('Salary component builder simulation active.')} variant="primary" icon={Plus}>
                    Add Component
                  </Button>
                </div>

                <Card className="overflow-hidden">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-6 py-3">Component Name</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Calculation Basis</th>
                        <th className="px-6 py-3">Value / Formula</th>
                        <th className="px-6 py-3">Taxable</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-650 dark:text-slate-400">
                      {[
                        { name: 'Basic Salary', type: 'Earning', basis: 'Percentage of CTC', value: '45%', tax: 'Yes', status: 'Active' },
                        { name: 'House Rent Allowance (HRA)', type: 'Earning', basis: 'Percentage of Basic', value: '50%', tax: 'Partial', status: 'Active' },
                        { name: 'Provident Fund (PF)', type: 'Deduction', basis: 'Percentage of Basic', value: '12%', tax: 'Exempt', status: 'Active' },
                        { name: 'Special Allowance', type: 'Earning', basis: 'Fixed / Balancing', value: 'Variable', tax: 'Yes', status: 'Active' },
                        { name: 'Professional Tax (PT)', type: 'Deduction', basis: 'Slab-based', value: 'Up to $20/mo', tax: 'Exempt', status: 'Active' }
                      ].map((comp, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{comp.name}</td>
                          <td className="px-6 py-4 font-semibold">{comp.type}</td>
                          <td className="px-6 py-4 text-slate-500">{comp.basis}</td>
                          <td className="px-6 py-4 font-mono">{comp.value}</td>
                          <td className="px-6 py-4">{comp.tax}</td>
                          <td className="px-6 py-4"><Badge status="Active">{comp.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            )}
          </div>
        );

      case 'credentials':
        if (!isAdmin) return <div className="p-6 text-center text-rose-500 font-bold border border-rose-250 bg-rose-50 rounded-xl">Access Denied: Login & credentials management is restricted to Administrators.</div>;
        return (
          <div className="space-y-6 text-xs text-left animate-fade-in">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Login & Credentials Management</h3>
              <p className="text-slate-400 font-semibold mt-0.5">Manage user credentials, SSO connections, and multi-factor authentication (MFA) policies.</p>
            </div>

            <Card className="overflow-hidden">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Employee Name</th>
                    <th className="px-6 py-3">Username / Email</th>
                    <th className="px-6 py-3">SSO Status</th>
                    <th className="px-6 py-3">MFA Status</th>
                    <th className="px-6 py-3">Account Security</th>
                    <th className="px-6 py-3 text-right w-64">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-650 dark:text-slate-400">
                  {[
                    { name: 'Alexander Wright', email: 'a.wright@enterprise.corp', sso: 'Enforced', mfa: 'Enabled (App)', locked: false },
                    { name: 'Rebecca Vance', email: 'r.vance@enterprise.corp', sso: 'Enforced', mfa: 'Enabled (SMS)', locked: false },
                    { name: 'David Miller', email: 'd.miller@enterprise.corp', sso: 'Optional', mfa: 'Disabled', locked: false },
                    { name: 'Sarah Jenkins', email: 's.jenkins@enterprise.corp', sso: 'Optional', mfa: 'Enabled (App)', locked: true },
                    { name: 'Marcus Chen', email: 'm.chen@security.corp', sso: 'Bypassed', mfa: 'Enabled (Key)', locked: false }
                  ].map((acc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">{acc.name}</td>
                      <td className="px-6 py-3.5 font-mono">{acc.email}</td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md ${
                          acc.sso === 'Enforced' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                        }`}>
                          {acc.sso}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${
                          acc.mfa.startsWith('Enabled') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-955/20'
                        }`}>
                          {acc.mfa}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${
                          acc.locked ? 'bg-rose-50 text-rose-700 dark:bg-rose-955/20' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-955/20'
                        }`}>
                          {acc.locked ? 'LOCKED / DISABLED' : 'ACTIVE / UNLOCKED'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right w-64">
                        <div className="flex justify-end gap-2 w-full">
                          <Button size="sm" variant="outline" className="w-22 justify-center" onClick={() => toast.success(`Password reset link dispatched to ${acc.email}`)}>
                            Reset PW
                          </Button>
                          <Button size="sm" variant={acc.locked ? 'primary' : 'secondary'} className={`w-28 justify-center ${acc.locked ? 'bg-primary border-none text-slate-950 hover:bg-primary/90' : 'text-rose-650 hover:bg-rose-50 border-rose-200'}`} onClick={() => toast.success(`Account security status modified for ${acc.name}`)}>
                            {acc.locked ? 'Unlock' : 'Lock Account'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        );

      case 'roster-leaves':
        if (!isAdmin) return <div className="p-6 text-center text-rose-500 font-bold border border-rose-250 bg-rose-50 rounded-xl">Access Denied: Leave & off roster search is restricted to Administrators.</div>;
        return (
          <div className="space-y-6 text-xs text-left animate-fade-in">
            <LeaveOffRosterView orgData={orgData} />
          </div>
        );

      case 'workflow':
        return <div className="p-6 text-center text-rose-500 font-bold border border-rose-250 bg-rose-50 rounded-xl">Access Denied: Workflow Configuration is deprecated and disabled.</div>;
      
      case 'audit-logs':
        if (!isAdmin) return <div className="p-6 text-center text-rose-500 font-bold border border-rose-250 bg-rose-50 rounded-xl">Access Denied: Restricted to Administrator.</div>;
        return (
          <div className="space-y-6 text-xs text-left animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">System Security & Audit Logs</h3>
                <p className="text-slate-400 font-semibold mt-0.5">Real-time audit trace logs of all database operations and active SSL/SSO encryption states.</p>
              </div>
              <div className="flex gap-2 text-[10px] font-bold text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-450 px-3 py-1.5 rounded-xl border border-emerald-250/20 shadow-xs">
                SSL: ACTIVE (TLS 1.3) &bull; Token Expiry: 8h
              </div>
            </div>

            <Card className="overflow-hidden">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Audit Event</th>
                    <th className="px-6 py-3">User Account</th>
                    <th className="px-6 py-3">Client IP Address</th>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Event Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-650 dark:text-slate-400">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">{log.action}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-800 dark:text-slate-300">{log.user}</td>
                      <td className="px-6 py-3.5 font-mono">{log.ip}</td>
                      <td className="px-6 py-3.5">{log.timestamp}</td>
                      <td className="px-6 py-3.5"><Badge status="Approved">{log.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        );

      case 'import':
        if (!['HR', 'Recruitment HR'].includes(user.role)) return <div className="p-6 text-center text-rose-500 font-bold border border-rose-250 bg-rose-50 rounded-xl">Access Denied: Bulk onboarding console is managed by Recruitment HR.</div>;
        return (
          <div className="space-y-6 text-xs text-left animate-fade-in">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Bulk Import employee directory</h3>
              <p className="text-slate-400 font-semibold mt-0.5">Upload a CSV or JSON file to batch import user profiles.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upload Form Panel */}
              <Card className="lg:col-span-1 p-5 space-y-4">
                <form onSubmit={handleImportSubmit} className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-6 text-center bg-slate-50 dark:bg-slate-900/35 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={(e) => {
                        if (e.target.files.length > 0) {
                          setImportFile(e.target.files[0]);
                          toast.success(`Loaded file: ${e.target.files[0].name}`);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="mx-auto text-slate-400 mb-2" size={28} />
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {importFile ? importFile.name : 'Drag and drop CSV here'}
                    </p>
                    <span className="text-[9px] text-slate-400 mt-1 block">Maximum size limit: 5MB</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border text-[10px] text-slate-450 font-semibold">
                    CSV file MUST contain headers: Name, Email, Department, Designation, Salary, Shift.
                  </div>

                  <Button type="submit" disabled={isImporting} variant="primary" className="w-full">
                    {isImporting ? 'Parsing CSV Records...' : 'Execute Bulk Onboarding'}
                  </Button>
                </form>

                {importSummary && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
                    <h4 className="font-bold text-[10px] text-slate-450 uppercase tracking-wider">Onboarding Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-bold">
                      <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <span className="block text-[9px] text-slate-400 font-semibold">Total Rows</span>
                        {importSummary.total}
                      </div>
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-lg">
                        <span className="block text-[9px] text-slate-400 font-semibold">Imported</span>
                        {importSummary.imported}
                      </div>
                      <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-lg col-span-2">
                        <span className="block text-[9px] text-slate-400 font-semibold">Validation Errors</span>
                        {importSummary.errors}
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Validation Errors & Logs List */}
              <div className="lg:col-span-2 space-y-6">
                {importErrors.length > 0 && (
                  <Card className="p-5 border-rose-250 dark:border-rose-900/40">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-rose-800 dark:text-rose-455">Validation Failure Report</h4>
                        <span className="text-[10px] text-slate-400">Fix these warnings and retry parsing</span>
                      </div>
                      <Badge status="Rejected">{importErrors.length} Errors</Badge>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-rose-50/50 dark:bg-rose-950/10 text-[9px] text-rose-800 dark:text-rose-400 uppercase font-bold tracking-wider">
                          <tr>
                            <th className="px-4 py-2">Row</th>
                            <th className="px-4 py-2">Target Field</th>
                            <th className="px-4 py-2">Validation Failure details</th>
                            <th className="px-4 py-2">Reason Code</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-650 dark:text-slate-400">
                          {importErrors.map((err, idx) => (
                            <tr key={idx} className="hover:bg-rose-50/10 transition-colors">
                              <td className="px-4 py-2.5 font-bold font-mono">{err.row}</td>
                              <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200">{err.field}</td>
                              <td className="px-4 py-2.5 text-rose-600 dark:text-rose-400">{err.message}</td>
                              <td className="px-4 py-2.5"><Badge status="Rejected">{err.reason}</Badge></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

                <Card className="p-5">
                  <div className="mb-4">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">Batch Import Job History</h3>
                    <span className="text-[10px] text-slate-400 font-semibold">Audit logs of all bulk data onboarding runs</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Job ID</th>
                          <th className="px-4 py-3">Source File</th>
                          <th className="px-4 py-3">Run Timestamp</th>
                          <th className="px-4 py-3">Roster split</th>
                          <th className="px-4 py-3">Job Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-650 dark:text-slate-400">
                        {importHistory.map(job => (
                          <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold">{job.id}</td>
                            <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{job.filename}</td>
                            <td className="px-4 py-3 text-slate-500">{job.timestamp}</td>
                            <td className="px-4 py-3 font-semibold">
                              {job.total} (Valid: {job.valid} | Err: {job.errors})
                            </td>
                            <td className="px-4 py-3">
                              <Badge status={job.errors > 0 ? 'Pending' : 'Approved'}>
                                {job.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'fnf':
        if (!['HR', 'Finance HR'].includes(user.role)) return <div className="p-6 text-center text-rose-500 font-bold border border-rose-250 bg-rose-50 rounded-xl">Access Denied: Full & Final settlement (F&F) console is managed by Finance HR.</div>;
        const exitingEmployee = employees.find(e => e.id === exitEmpId) || { name: 'Unknown', salary: 0, department: 'N/A' };
        
        // FNF Payout Calculations
        const exitGross = exitingEmployee.salary ? (exitingEmployee.salary / 12) : 5000;
        const exitLeaveEncashment = exitGross * 0.45; // calculated based on leave accruals
        const exitGratuity = exitGross * 1.5; // statutory gratuity match
        const exitRecovery = clearanceAssets ? 0 : 750; // Recovery amount for missing assets
        const exitNetSettlement = exitGross + exitLeaveEncashment + exitGratuity - exitRecovery;

        return (
          <div className="space-y-6 text-xs text-left animate-fade-in">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Full & Final settlement (F&F) Console</h3>
              <p className="text-slate-400 font-semibold mt-0.5">Offboard personnel, audit recoveries, and disburse statutory gratuities.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Employee & Clearances selection */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="p-5 space-y-4">
                  <div>
                    <h4 className="font-bold text-primary dark:text-accent uppercase text-[10px] tracking-wider mb-2">
                      Offboarding checklist & selection
                    </h4>
                  </div>

                  <Select
                    label="Select Exiting Employee"
                    value={exitEmpId}
                    onChange={(e) => {
                      setExitEmpId(e.target.value);
                      setFnfExecuted(false);
                    }}
                    options={employees.map(e => ({ value: e.id, label: `${e.name} (${e.id})` }))}
                  />
                  
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                    <h5 className="font-bold text-slate-850 dark:text-slate-200 text-[10px] uppercase mb-1">Clearance Checklist</h5>
                    
                    <label className="flex items-center gap-2 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={clearanceAssets}
                        onChange={(e) => setClearanceAssets(e.target.checked)}
                        className="rounded-sm border-slate-355"
                      />
                      <span>Company Assets Recovered (Laptop, Keys)</span>
                    </label>
                    <label className="flex items-center gap-2 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={clearanceIT}
                        onChange={(e) => setClearanceIT(e.target.checked)}
                        className="rounded-sm border-slate-355"
                      />
                      <span>IT Corporate Access Revoked (Email/AWS)</span>
                    </label>
                    <label className="flex items-center gap-2 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={clearanceGratuity}
                        onChange={(e) => setClearanceGratuity(e.target.checked)}
                        className="rounded-sm border-slate-355"
                      />
                      <span>Verify Gratuity Eligibility Criteria</span>
                    </label>
                  </div>
                  
                  <Button
                    onClick={() => {
                      setFnfExecuted(true);
                      toast.success(`Full & Final disbursed for ${exitingEmployee.name}. Release settlement post successful.`);
                    }}
                    variant="primary"
                    className="w-full"
                    disabled={!clearanceAssets || !clearanceIT}
                  >
                    Execute F&F Release Pay
                  </Button>
                </Card>

                {/* Approval Trail */}
                <Card className="p-4 space-y-3">
                  <h4 className="font-bold text-primary dark:text-accent uppercase text-[10px] tracking-wider border-b pb-1.5">
                    Settlement Sign-off trail
                  </h4>
                  <div className="space-y-2 text-[11px] font-medium">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-450">HR Auditor Audit:</span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-md text-[9px]">
                        APPROVED (Reb Vance)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-450">Finance Controller:</span>
                      <span className={`px-2 py-0.5 border rounded-md text-[9px] font-bold ${
                        fnfExecuted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {fnfExecuted ? 'POSTED TO LEDGER' : 'AWAITING DISBURSE'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-450">Executive Board VP:</span>
                      <span className={`px-2 py-0.5 border rounded-md text-[9px] font-bold ${
                        fnfExecuted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {fnfExecuted ? 'SIGN-OFF OK' : 'PENDING FINAL OK'}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Settlement calculation breakdown */}
              <Card className="lg:col-span-2 p-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">Settlement Account Ledger Statement</h3>
                  <span className="text-[10px] text-slate-400 font-semibold">Breakdown calculation audit for offboarded employees</span>
                </div>

                <div className="my-4 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-850">
                      <tr>
                        <th className="px-4 py-3">Compensation Line Item</th>
                        <th className="px-4 py-3">Calculated Value</th>
                        <th className="px-4 py-3">Statutory Withholding</th>
                        <th className="px-4 py-3 text-right">Net Credit/Debit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-medium">
                      <tr>
                        <td className="px-4 py-3 font-bold text-slate-850 dark:text-slate-200">Gross Monthly Salary (Pending)</td>
                        <td className="px-4 py-3 text-slate-500">${exitGross.toLocaleString([], { maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-slate-450">Exempted</td>
                        <td className="px-4 py-3 text-emerald-600 text-right font-bold">+${exitGross.toLocaleString([], { maximumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">Leave Encashment (Accrued quota)</td>
                        <td className="px-4 py-3 text-slate-500">${exitLeaveEncashment.toLocaleString([], { maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-slate-450">TDS Withheld (15%)</td>
                        <td className="px-4 py-3 text-emerald-600 text-right font-bold">+${(exitLeaveEncashment * 0.85).toLocaleString([], { maximumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold text-slate-855 dark:text-slate-200">Statutory Gratuity (Tenure benefit)</td>
                        <td className="px-4 py-3 text-slate-500">
                          {clearanceGratuity ? `$${exitGratuity.toLocaleString([], { maximumFractionDigits: 2 })}` : '$0.00'}
                        </td>
                        <td className="px-4 py-3 text-slate-450">Exempted</td>
                        <td className="px-4 py-3 text-emerald-600 text-right font-bold">
                          +{clearanceGratuity ? `$${exitGratuity.toLocaleString([], { maximumFractionDigits: 2 })}` : '$0.00'}
                        </td>
                      </tr>
                      <tr className={exitRecovery > 0 ? "text-rose-650" : "text-slate-500"}>
                        <td className="px-4 py-3 font-bold text-slate-850 dark:text-slate-200">Asset Recovery charge</td>
                        <td className="px-4 py-3">${exitRecovery.toFixed(2)}</td>
                        <td className="px-4 py-3 text-slate-450">N/A</td>
                        <td className="px-4 py-3 text-right font-bold">-${exitRecovery.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t-2 border-slate-200 dark:border-slate-855 text-sm font-extrabold bg-slate-50 dark:bg-slate-900/50">
                        <td colSpan="3" className="px-4 py-3 text-primary dark:text-accent">NET DISBURSED SETTLEMENT RELEASE</td>
                        <td className="px-4 py-3 text-primary dark:text-accent text-right font-black">
                          ${(exitNetSettlement - (exitLeaveEncashment * 0.15) - (clearanceGratuity ? 0 : exitGratuity)).toLocaleString([], { maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-[10px] text-slate-400 text-right font-semibold italic mt-2">
                  Compliance Audit references: Exit ledger code US-HCM F&F-33 &bull; IRS Section 401
                </div>
              </Card>
            </div>
          </div>
        );

      case 'cost-centers':
        if (!['HR', 'Finance HR'].includes(user.role)) return <div className="p-6 text-center text-rose-500 font-bold border border-rose-250 bg-rose-50 rounded-xl">Access Denied: Cost centers console is managed by Finance HR.</div>;
        return (
          <div className="space-y-6 text-xs text-left animate-fade-in">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Corporate Cost Centers</h3>
              <p className="text-slate-400 font-semibold mt-0.5">Review operational expenditure codes and financial department divisions.</p>
            </div>

            <Card className="overflow-hidden">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Cost Center Code</th>
                    <th className="px-6 py-3">Department Division</th>
                    <th className="px-6 py-3">Allocated Annual Budget</th>
                    <th className="px-6 py-3">Current Spent YTD</th>
                    <th className="px-6 py-3">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-650 dark:text-slate-400">
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900 dark:text-white">CC-101</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800 dark:text-slate-300">Engineering & Development</td>
                    <td className="px-6 py-3.5">$1,850,000</td>
                    <td className="px-6 py-3.5 text-rose-600">$895,000</td>
                    <td className="px-6 py-3.5 text-emerald-600 font-bold">$955,000</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900 dark:text-white">CC-102</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800 dark:text-slate-300">Product UX/UI Design</td>
                    <td className="px-6 py-3.5">$650,000</td>
                    <td className="px-6 py-3.5 text-rose-600">$342,000</td>
                    <td className="px-6 py-3.5 text-emerald-600 font-bold">$308,000</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900 dark:text-white">CC-901</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800 dark:text-slate-300">Loss Prevention & Security</td>
                    <td className="px-6 py-3.5">$220,000</td>
                    <td className="px-6 py-3.5 text-rose-600">$105,000</td>
                    <td className="px-6 py-3.5 text-emerald-600 font-bold">$115,000</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </div>
        );

      default:
        // Profile view
        return (
          <div className="space-y-6 text-xs text-left">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Account profile Settings</h3>
              <p className="text-slate-400 font-semibold mt-0.5">Manage your corporate credentials, SSO links, and profile details.</p>
            </div>

            <Card className="p-6 space-y-4 max-w-xl">
              <div className="flex items-center gap-4 border-b pb-4">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-16 w-16 rounded-full border object-cover"
                />
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{user.name}</h4>
                  <p className="text-xs text-slate-450">{user.designation} &bull; {user.department}</p>
                  <Badge status="Active" className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Corporate Email Address" value={user.email} disabled />
                <Input label="Roster Access Code" value={user.employeeId} disabled />
                <Input label="Access Role" value={user.role} disabled />
                <Input label="Roster Site Location" value="New York HQ" disabled />
              </div>

              <div className="border-t pt-4 flex justify-end">
                <Button onClick={() => toast.success('Profile configurations stored.')} variant="primary">
                  Save Settings
                </Button>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Dynamic Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl text-primary dark:text-accent border border-primary/20 dark:border-accent/20">
          <Settings size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isAdmin ? 'System Configuration' : 'HR Configuration & Settings'}
          </h2>
          <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider">
            Active view: {activeTab === 'org' ? 'Organization Structure' : activeTab === 'permissions' ? 'Roles & Permissions' : activeTab === 'credentials' ? 'Login & Credentials' : activeTab === 'roster-leaves' ? 'Leave & Off Roster' : activeTab === 'audit-logs' ? 'System Security & Audit Logs' : activeTab === 'policies' ? 'Statutory Policies' : activeTab === 'import' ? 'Bulk Import' : activeTab === 'fnf' ? 'F&F Settlement' : activeTab === 'cost-centers' ? 'Cost Centers' : 'My Profile'}
          </span>
        </div>
      </div>

      {/* Tabs Layout */}
      {!isAdmin && (
        <div className="border-b border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto pb-px">
          <button
            onClick={() => { setActiveTab('profile'); navigate('/settings'); }}
            className={`py-2 px-4 text-xs font-bold whitespace-nowrap cursor-pointer transition-all border-b-2 ${
              activeTab === 'profile'
                ? 'border-primary text-primary dark:border-accent dark:text-accent font-semibold'
                : 'border-transparent text-slate-450 hover:text-slate-850 hover:border-slate-300'
            }`}
          >
            My Profile
          </button>

          {['HR', 'Recruitment HR', 'Operational HR'].includes(user.role) && (
            <button
              onClick={() => { setActiveTab('org'); navigate('/org/companies'); }}
              className={`py-2 px-4 text-xs font-bold whitespace-nowrap cursor-pointer transition-all border-b-2 ${
                activeTab === 'org'
                  ? 'border-primary text-primary dark:border-accent dark:text-accent font-semibold'
                  : 'border-transparent text-slate-455 hover:text-slate-855 hover:border-slate-300'
              }`}
            >
              Organization Structure
            </button>
          )}

          {['HR', 'Finance HR', 'Operational HR'].includes(user.role) && (
            <button
              onClick={() => {
                const defaultSub = user.role === 'Finance HR' ? 'salary' : 'leave';
                setActiveTab('policies');
                navigate(`/policies/${defaultSub}`);
              }}
              className={`py-2 px-4 text-xs font-bold whitespace-nowrap cursor-pointer transition-all border-b-2 ${
                activeTab === 'policies'
                  ? 'border-primary text-primary dark:border-accent dark:text-accent font-semibold'
                  : 'border-transparent text-slate-455 hover:text-slate-855 hover:border-slate-300'
              }`}
            >
              Statutory Policies
            </button>
          )}

          {['HR', 'Recruitment HR'].includes(user.role) && (
            <button
              onClick={() => { setActiveTab('import'); navigate('/employees/import'); }}
              className={`py-2 px-4 text-xs font-bold whitespace-nowrap cursor-pointer transition-all border-b-2 ${
                activeTab === 'import'
                  ? 'border-primary text-primary dark:border-accent dark:text-accent font-semibold'
                  : 'border-transparent text-slate-455 hover:text-slate-855 hover:border-slate-300'
              }`}
            >
              Bulk Import
            </button>
          )}

          {['HR', 'Finance HR'].includes(user.role) && (
            <>
              <button
                onClick={() => { setActiveTab('fnf'); navigate('/payroll/fnf'); }}
                className={`py-2 px-4 text-xs font-bold whitespace-nowrap cursor-pointer transition-all border-b-2 ${
                  activeTab === 'fnf'
                    ? 'border-primary text-primary dark:border-accent dark:text-accent font-semibold'
                    : 'border-transparent text-slate-455 hover:text-slate-855 hover:border-slate-300'
                }`}
              >
                F&F Settlement
              </button>

              <button
                onClick={() => { setActiveTab('cost-centers'); navigate('/payroll/cost-centers'); }}
                className={`py-2 px-4 text-xs font-bold whitespace-nowrap cursor-pointer transition-all border-b-2 ${
                  activeTab === 'cost-centers'
                    ? 'border-primary text-primary dark:border-accent dark:text-accent font-semibold'
                    : 'border-transparent text-slate-455 hover:text-slate-855 hover:border-slate-300'
                }`}
              >
                Cost Centers
              </button>
            </>
          )}
        </div>
      )}

      {/* Tab Panel */}
      <div className="pt-2">
        {renderTabContent()}
      </div>
    </div>
  );
}
