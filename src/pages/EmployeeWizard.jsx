import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHRMS } from '../context/HRMSContext';
import { Check, ChevronRight, ChevronLeft, Save, User, Briefcase, DollarSign, Clock, Calendar, CheckSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { toast } from 'react-hot-toast';

export default function EmployeeWizard() {
  const { addEmployee } = useHRMS();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal
    name: '',
    email: '',
    phone: '',
    dob: '',
    // Step 2: Employment
    department: 'Engineering Division',
    designation: 'Software Engineer',
    manager: 'David Miller',
    joiningDate: new Date().toISOString().split('T')[0],
    location: 'New York HQ',
    // Step 3: Salary
    salary: '95000',
    hra: '15000',
    pf: '5000',
    // Step 4: Shift
    shift: 'General Shift (09:00 - 18:00)',
    hoursPerWeek: '40',
    // Step 5: Holiday Calendar
    holidayCalendar: 'National Calendar'
  });

  const steps = [
    { num: 1, name: 'Personal Details', icon: User },
    { num: 2, name: 'Employment Details', icon: Briefcase },
    { num: 3, name: 'Compensations', icon: DollarSign },
    { num: 4, name: 'Work Shift', icon: Clock },
    { num: 5, name: 'Holiday Calendar', icon: Calendar },
    { num: 6, name: 'Review Dossier', icon: CheckSquare },
  ];

  const handleNext = () => {
    // Basic validation before going next
    if (activeStep === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Please complete all required fields.');
        return;
      }
    }
    if (activeStep === 3) {
      if (!formData.salary) {
        toast.error('Salary is a required compensation component.');
        return;
      }
    }
    setActiveStep(prev => Math.min(steps.length, prev + 1));
  };

  const handlePrev = () => {
    setActiveStep(prev => Math.max(1, prev - 1));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleComplete = () => {
    // Add to HRMS Context database
    const finalEmployee = {
      name: formData.name,
      email: formData.email,
      department: formData.department,
      designation: formData.designation,
      manager: formData.manager,
      status: 'Active',
      salary: parseFloat(formData.salary),
      shift: formData.shift,
      holidayCalendar: formData.holidayCalendar,
      joiningDate: formData.joiningDate,
      location: formData.location,
      phone: formData.phone
    };

    addEmployee(finalEmployee);
    toast.success(`${formData.name} successfully onboarded!`);
    navigate('/directory');
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b pb-2 mb-3">Step 1: Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-350 block mb-1">
                  Full Legal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Johnathan Doe"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-850 rounded-lg dark:text-slate-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-350 block mb-1">
                  Corporate Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="j.doe@enterprise.corp"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-850 rounded-lg dark:text-slate-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-350 block mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 019-8392"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-850 rounded-lg dark:text-slate-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-350 block mb-1">Birth Date</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-850 rounded-lg dark:text-slate-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b pb-2 mb-3">Step 2: Employment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-350 block mb-1">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-850 rounded-lg dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="Executive Board">Executive Board</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Engineering Division">Engineering Division</option>
                  <option value="Product Design">Product Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales Division">Sales Division</option>
                  <option value="Loss Prevention">Loss Prevention</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-350 block mb-1">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Software Engineer II"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-850 rounded-lg dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-350 block mb-1">Direct Line Manager</label>
                <select
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-850 rounded-lg dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="Alexander Wright">Alexander Wright (Managing Director)</option>
                  <option value="Rebecca Vance">Rebecca Vance (CHRO)</option>
                  <option value="David Miller">David Miller (Engineering Manager)</option>
                  <option value="Sarah Jenkins">Sarah Jenkins (Design Lead)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-350 block mb-1">Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-850 rounded-lg dark:text-slate-200"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-350 block mb-1">Corporate Office Location</label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-850 rounded-lg dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="New York HQ">New York HQ</option>
                  <option value="San Francisco Hub">San Francisco Hub</option>
                  <option value="Austin Office">Austin Office</option>
                  <option value="Chicago Hub">Chicago Hub</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b pb-2 mb-3">Step 3: Salary Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-350 block mb-1">Base Annual Pay ($) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-850 rounded-lg dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-350 block mb-1">HRA Allowance ($)</label>
                <input
                  type="number"
                  name="hra"
                  value={formData.hra}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-850 rounded-lg dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-350 block mb-1">Provident Fund (PF) ($)</label>
                <input
                  type="number"
                  name="pf"
                  value={formData.pf}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-850 rounded-lg dark:text-slate-200"
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b pb-2 mb-3">Step 4: Shift Roster Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-350 block mb-1">Roster Shift Code</label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-850 rounded-lg dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="General Shift (09:00 - 18:00)">General Shift (09:00 AM - 06:00 PM)</option>
                  <option value="Morning Shift (06:00 - 14:00)">Morning Shift (06:00 AM - 02:00 PM)</option>
                  <option value="Evening Shift (14:00 - 22:00)">Evening Shift (02:00 PM - 10:00 PM)</option>
                  <option value="Night Shift (22:00 - 06:00)">Night Shift (10:00 PM - 06:00 AM)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-650 dark:text-slate-350 block mb-1">Target Hours / Week</label>
                <input
                  type="number"
                  name="hoursPerWeek"
                  value={formData.hoursPerWeek}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-850 rounded-lg dark:text-slate-200"
                />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b pb-2 mb-3">Step 5: Holiday Calendar</h3>
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-650 dark:text-slate-350 block">Allocate State/Region Holiday Calendar</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['National Calendar', 'Regional Calendar A', 'APAC Roster Calendar', 'EMEA Global Calendar'].map(cal => (
                  <div
                    key={cal}
                    onClick={() => setFormData(prev => ({ ...prev, holidayCalendar: cal }))}
                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                      formData.holidayCalendar === cal
                        ? 'border-primary bg-primary/5 dark:border-accent dark:bg-slate-900/60 font-semibold'
                        : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850/30'
                    }`}
                  >
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">{cal}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Includes statutory regional public holidays.</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b pb-2 mb-3">Step 6: Review Dossier</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-850">
                <h4 className="font-bold text-primary dark:text-accent uppercase text-[10px] tracking-wider mb-2">Personal & Contract</h4>
                <p><span className="text-slate-400 font-medium">Name:</span> <strong className="text-slate-800 dark:text-slate-200">{formData.name}</strong></p>
                <p><span className="text-slate-400 font-medium">Email:</span> <strong className="text-slate-850 dark:text-slate-200">{formData.email}</strong></p>
                <p><span className="text-slate-400 font-medium">Phone:</span> <strong className="text-slate-800 dark:text-slate-200">{formData.phone}</strong></p>
                <p><span className="text-slate-400 font-medium">Joining Date:</span> <strong className="text-slate-800 dark:text-slate-200">{formData.joiningDate}</strong></p>
                <p><span className="text-slate-400 font-medium">Location:</span> <strong className="text-slate-800 dark:text-slate-200">{formData.location}</strong></p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-850">
                <h4 className="font-bold text-primary dark:text-accent uppercase text-[10px] tracking-wider mb-2">Compensations & Roster</h4>
                <p><span className="text-slate-400 font-medium">Department:</span> <strong className="text-slate-800 dark:text-slate-200">{formData.department}</strong></p>
                <p><span className="text-slate-400 font-medium">Designation:</span> <strong className="text-slate-800 dark:text-slate-200">{formData.designation}</strong></p>
                <p><span className="text-slate-400 font-medium">Reporting Manager:</span> <strong className="text-slate-800 dark:text-slate-200">{formData.manager}</strong></p>
                <p><span className="text-slate-400 font-medium">Gross Annual Salary:</span> <strong className="text-slate-800 dark:text-slate-200">${parseFloat(formData.salary).toLocaleString()}</strong></p>
                <p><span className="text-slate-400 font-medium">Shift Code:</span> <strong className="text-slate-800 dark:text-slate-200 truncate inline-block max-w-[150px]">{formData.shift}</strong></p>
              </div>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-[10px] rounded-lg border border-amber-250 dark:border-amber-900/40 font-medium">
              Important: Submitting this dossier will immediately activate the employee profile within the HRMS engine and publish check-in roster tasks.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Onboard New Employee</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
          Complete the multi-step onboarding wizard to register personal, financial, and shift records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Steps Indicator Roster */}
        <Card className="p-4 lg:col-span-1 h-fit">
          <div className="space-y-4">
            {steps.map(step => {
              const StepIcon = step.icon;
              const isCompleted = activeStep > step.num;
              const isActive = activeStep === step.num;
              return (
                <div key={step.num} className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all border ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                      : isActive
                        ? 'bg-primary border-primary text-white dark:bg-accent dark:border-accent'
                        : 'bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-400'
                  }`}>
                    {isCompleted ? <Check size={14} /> : step.num}
                  </div>
                  <div className="text-left">
                    <span className={`block text-xs font-bold ${
                      isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                    }`}>
                      {step.name}
                    </span>
                    <span className="text-[9px] text-slate-400 block -mt-0.5">Stage {step.num} of 6</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Side: Step Form Content */}
        <Card className="lg:col-span-3 p-6 flex flex-col justify-between min-h-[380px]">
          <div>
            {renderStepContent()}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-850 pt-6 mt-6 flex justify-between">
            <Button
              onClick={handlePrev}
              disabled={activeStep === 1}
              variant="outline"
              icon={ChevronLeft}
            >
              Previous
            </Button>
            
            {activeStep === steps.length ? (
              <Button
                onClick={handleComplete}
                variant="primary"
                icon={Save}
              >
                Complete Onboarding
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                variant="primary"
                className="bg-primary hover:bg-primary/95 text-white"
              >
                <span>Continue</span>
                <ChevronRight size={14} className="ml-1.5" />
              </Button>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}
