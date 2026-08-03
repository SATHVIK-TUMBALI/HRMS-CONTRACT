import React, { useState } from 'react';
import { useHRMS } from '../context/HRMSContext';
import { useAuth } from '../context/AuthContext';
import { Search, ChevronDown, ChevronUp, Download, Plus, Trash2, Eye, Edit3, X, User } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function EmployeeDirectory() {
  const { employees, deleteEmployee, updateEmployee } = useHRMS();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Sorting
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // View / Edit Modals
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editSalary, setEditSalary] = useState(0);
  const [editStatus, setEditStatus] = useState('Active');

  // Extract unique departments
  const departments = ['All', ...new Set(employees.map(emp => emp.department))];

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter & Search Logics
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    const matchesStatus = selectedStatus === 'All' || emp.status === selectedStatus;
    
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Sort Logic
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const paginatedEmployees = sortedEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Action methods
  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to offboard ${name}?`)) {
      deleteEmployee(id);
      toast.success(`${name} offboarded successfully.`);
    }
  };

  const handleView = (emp) => {
    setSelectedEmp(emp);
    setIsViewModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmp(emp);
    setEditName(emp.name);
    setEditDesignation(emp.designation);
    setEditSalary(emp.salary);
    setEditStatus(emp.status);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateEmployee(selectedEmp.id, {
      name: editName,
      designation: editDesignation,
      salary: parseFloat(editSalary),
      status: editStatus
    });
    setIsEditModalOpen(false);
    toast.success('Employee records updated successfully.');
  };

  // Mock Export to CSV
  const handleExport = () => {
    const headers = ['Employee ID,Employee Name,Email,Department,Designation,Manager,Status,Salary,Joining Date\n'];
    const rows = filteredEmployees.map(emp => 
      `"${emp.id}","${emp.name}","${emp.email}","${emp.department}","${emp.designation}","${emp.manager}","${emp.status}",$${emp.salary},"${emp.joiningDate}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'HRMS_Employee_Roster.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Directory exported to CSV.');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Employee Directory</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Manage corporate headcount directories, sorting, filtering, and offboarding logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExport} variant="outline" icon={Download}>
            Export CSV
          </Button>
          {['Admin', 'HR', 'Recruitment HR'].includes(user.role) && (
            <Button onClick={() => navigate('/wizard')} variant="primary" icon={Plus}>
              Add Employee
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1 text-left">
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Search Employee</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search by ID, name, title..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/20 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Dept Filter */}
        <div className="w-full md:w-48 text-left">
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Filter Department</label>
          <select
            value={selectedDept}
            onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
            className="w-full py-1.5 px-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-250 cursor-pointer focus:outline-hidden"
          >
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48 text-left">
          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Filter Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
            className="w-full py-1.5 px-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-250 cursor-pointer focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </Card>

      {/* Directory Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-slate-550 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider border-b border-slate-250/60 dark:border-slate-850">
              <tr>
                <th className="px-6 py-4">Photo</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('id')}>
                  <div className="flex items-center gap-1">
                    <span>Employee ID</span>
                    {sortField === 'id' && (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>Full Name</span>
                    {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Direct Manager</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400 font-semibold">
                    No corporate records matched your filters.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    {/* Photo */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-9 w-9 rounded-full bg-primary/10 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-primary dark:text-accent">
                        {emp.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                    </td>
                    {/* ID */}
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                      {emp.id}
                    </td>
                    {/* Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{emp.name}</span>
                        <p className="text-[10px] text-slate-400">{emp.email}</p>
                      </div>
                    </td>
                    {/* Dept */}
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                      {emp.department}
                    </td>
                    {/* Desg */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {emp.designation}
                    </td>
                    {/* Manager */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {emp.manager}
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge status={emp.status} />
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-400">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleView(emp)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          title="View Profile"
                        >
                          <Eye size={14} />
                        </button>
                        {['Admin', 'HR', 'Recruitment HR'].includes(user.role) && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(emp)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-primary hover:text-primary/95 transition-colors cursor-pointer"
                              title="Edit Records"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(emp.id, emp.name)}
                              className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md text-danger transition-colors cursor-pointer"
                              title="Offboard Employee"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-slate-400 text-xs">
          <span>
            Showing <strong className="font-semibold text-slate-700 dark:text-slate-300">
              {filteredEmployees.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </strong> to <strong className="font-semibold text-slate-700 dark:text-slate-300">
              {Math.min(currentPage * itemsPerPage, filteredEmployees.length)}
            </strong> of <strong className="font-semibold text-slate-700 dark:text-slate-300">{filteredEmployees.length}</strong> employees
          </span>
          <div className="flex gap-1.5">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Prev
            </Button>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* VIEW MODAL */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Employee Corporate Dossier">
        {selectedEmp && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary dark:text-accent text-2xl border border-slate-200 dark:border-slate-800">
                {selectedEmp.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div className="text-left">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{selectedEmp.name}</h4>
                <p className="text-xs text-slate-450">{selectedEmp.designation} &bull; {selectedEmp.department}</p>
                <div className="mt-1.5 flex gap-2">
                  <Badge status={selectedEmp.status} />
                  <Badge status="Approved">{selectedEmp.location}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-left">
                <span className="font-bold text-slate-400 block uppercase text-[10px]">Employee ID</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedEmp.id}</span>
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-400 block uppercase text-[10px]">Office Email</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedEmp.email}</span>
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-400 block uppercase text-[10px]">Phone Number</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedEmp.phone || '+1 (555) 019-2831'}</span>
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-400 block uppercase text-[10px]">Joining Date</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedEmp.joiningDate}</span>
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-400 block uppercase text-[10px]">Direct Manager</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedEmp.manager}</span>
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-400 block uppercase text-[10px]">Work Roster Shift</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium truncate block">{selectedEmp.shift}</span>
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-400 block uppercase text-[10px]">Base Gross Salary</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">${selectedEmp.salary.toLocaleString()}/yr</span>
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-400 block uppercase text-[10px]">Holiday Calendar</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{selectedEmp.holidayCalendar}</span>
              </div>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end">
              <Button onClick={() => setIsViewModalOpen(false)} variant="secondary">Close Dossier</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Employee Records">
        {selectedEmp && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <Input
              label="Full Employee Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Designation/Title"
                value={editDesignation}
                onChange={(e) => setEditDesignation(e.target.value)}
                required
              />
              <Input
                label="Base Annual Salary ($)"
                type="number"
                value={editSalary}
                onChange={(e) => setEditSalary(e.target.value)}
                required
              />
            </div>
            <Select
              label="Roster Status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              options={['Active', 'Inactive']}
            />
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-2">
              <Button onClick={() => setIsEditModalOpen(false)} variant="secondary">Cancel</Button>
              <Button type="submit" variant="primary">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
