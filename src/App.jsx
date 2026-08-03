import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HRMSProvider } from './context/HRMSContext';

// Layout & Pages
import EnterpriseLayout from './components/layout/EnterpriseLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeDirectory from './pages/EmployeeDirectory';
import EmployeeWizard from './pages/EmployeeWizard';
import Attendance from './pages/Attendance';
import LeaveManagement from './pages/LeaveManagement';
import ShiftManagement from './pages/ShiftManagement';
import OvertimeCompOff from './pages/OvertimeCompOff';
import Payroll from './pages/Payroll';
import Reports from './pages/Reports';
import HolidayCalendar from './pages/HolidayCalendar';
import SettingsPanel from './pages/SettingsPanel';
import GateLogs from './pages/GateLogs';
import ContractorPortal from './pages/ContractorPortal';
import SalaryStructure from './pages/SalaryStructure';
import IncomeTax from './pages/IncomeTax';
import BankingPayments from './pages/BankingPayments';
import LoansAdvances from './pages/LoansAdvances';
import GratuityPage from './pages/GratuityPage';

// Route protector
function ProtectedRoute({ children, allowedRoles }) {
  const { user, statutoryRole } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const effectiveRole = statutoryRole || user.role;
  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    return <Navigate to="/login" replace />;
  }
  return <EnterpriseLayout>{children}</EnterpriseLayout>;
}

function HomeRedirect() {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <HRMSProvider>
        <Router>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/directory" element={<ProtectedRoute allowedRoles={['HR', 'Recruitment HR', 'Manager', 'Admin', 'Operational HR', 'Finance HR']}><EmployeeDirectory /></ProtectedRoute>} />
            <Route path="/wizard" element={<ProtectedRoute allowedRoles={['HR', 'Recruitment HR']}><EmployeeWizard /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute allowedRoles={['HR', 'Operational HR', 'Manager', 'Employee', 'Security']}><Attendance /></ProtectedRoute>} />
            <Route path="/leaves" element={<ProtectedRoute allowedRoles={['HR', 'Operational HR', 'Manager', 'Employee']}><LeaveManagement /></ProtectedRoute>} />
            <Route path="/shifts" element={<ProtectedRoute allowedRoles={['HR', 'Operational HR', 'Manager', 'Employee']}><ShiftManagement /></ProtectedRoute>} />
            <Route path="/overtime" element={<ProtectedRoute allowedRoles={['HR', 'Operational HR', 'Manager', 'Employee', 'Security']}><OvertimeCompOff /></ProtectedRoute>} />
            <Route path="/gate-logs" element={<ProtectedRoute allowedRoles={['HR', 'Security']}><GateLogs /></ProtectedRoute>} />

            {/* Payroll routes */}
            <Route path="/payroll/fnf" element={<ProtectedRoute allowedRoles={['HR', 'Finance HR']}><SettingsPanel /></ProtectedRoute>} />
            <Route path="/payroll/cost-centers" element={<ProtectedRoute allowedRoles={['HR', 'Finance HR']}><SettingsPanel /></ProtectedRoute>} />
            <Route path="/payroll" element={<ProtectedRoute allowedRoles={['HR', 'Finance HR', 'Operational HR', 'Employee']}><Payroll /></ProtectedRoute>} />
            <Route path="/payroll/*" element={<ProtectedRoute allowedRoles={['HR', 'Finance HR', 'Operational HR']}><Payroll /></ProtectedRoute>} />

            {/* New Financial Modules */}
            <Route path="/contractors" element={<ProtectedRoute allowedRoles={['HR', 'Operational HR', 'Finance HR', 'Recruitment HR', 'Admin', 'Manager']}><ContractorPortal /></ProtectedRoute>} />
            <Route path="/salary-structure" element={<ProtectedRoute allowedRoles={['Finance HR', 'Recruitment HR', 'Employee', 'Admin']}><SalaryStructure /></ProtectedRoute>} />
            <Route path="/income-tax" element={<ProtectedRoute allowedRoles={['Finance HR', 'Employee', 'Admin']}><IncomeTax /></ProtectedRoute>} />
            <Route path="/banking" element={<ProtectedRoute allowedRoles={['Finance HR', 'Admin']}><BankingPayments /></ProtectedRoute>} />
            <Route path="/loans" element={<ProtectedRoute allowedRoles={['Finance HR', 'Employee', 'Admin']}><LoansAdvances /></ProtectedRoute>} />
            <Route path="/gratuity" element={<ProtectedRoute allowedRoles={['Finance HR', 'Employee', 'Admin']}><GratuityPage /></ProtectedRoute>} />

            {/* Reports */}
            <Route path="/reports" element={<ProtectedRoute allowedRoles={['HR', 'Finance HR', 'Recruitment HR', 'Operational HR', 'Manager']}><Reports /></ProtectedRoute>} />
            <Route path="/holidays" element={<ProtectedRoute allowedRoles={['HR', 'Operational HR', 'Employee']}><HolidayCalendar /></ProtectedRoute>} />

            {/* Configuration mappings (Admin, HR, etc.) */}
            <Route path="/settings" element={<ProtectedRoute><SettingsPanel /></ProtectedRoute>} />
            <Route path="/org/*" element={<ProtectedRoute allowedRoles={['HR', 'Recruitment HR', 'Operational HR', 'Admin', 'Employee', 'Manager', 'Finance HR']}><SettingsPanel /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['Admin']}><SettingsPanel /></ProtectedRoute>} />
            <Route path="/policies/*" element={<ProtectedRoute allowedRoles={['HR', 'Finance HR', 'Operational HR']}><SettingsPanel /></ProtectedRoute>} />
            <Route path="/employees/*" element={<ProtectedRoute allowedRoles={['HR', 'Recruitment HR']}><SettingsPanel /></ProtectedRoute>} />
            <Route path="/profile/*" element={<ProtectedRoute><SettingsPanel /></ProtectedRoute>} />

            {/* Fallbacks */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>

        {/* Global Toaster for HRMS Alert Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1E293B',
              color: '#FFF',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '12px',
              border: '1px solid #334155'
            }
          }}
        />
      </HRMSProvider>
    </AuthProvider>
  );
}
