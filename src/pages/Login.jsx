import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, Users, UserCheck, Eye, EyeOff, Radio, Briefcase } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [email, setEmail] = useState('admin.wright@enterprise.corp');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const rolePresets = {
    Admin: { email: 'a.wright@enterprise.corp', name: 'Alexander Wright (Admin)' },
    'Finance HR': { email: 'r.finance@enterprise.corp', name: 'Rebecca Vance (Finance)' },
    'Recruitment HR': { email: 'r.recruiting@enterprise.corp', name: 'Rebecca Vance (Recruitment)' },
    'Operational HR': { email: 'r.ops@enterprise.corp', name: 'Rebecca Vance (Operational)' },
    Manager: { email: 'd.miller@enterprise.corp', name: 'David Miller (Manager)' },
    Employee: { email: 's.jenkins@enterprise.corp', name: 'Sarah Jenkins (Senior UI/UX)' },
    Security: { email: 'm.chen@security.corp', name: 'Marcus Chen (Security Lead)' }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setEmail(rolePresets[role].email);
    setPassword('enterprise-secret');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      login(selectedRole);
      setLoading(false);
      toast.success(`Welcome back, ${rolePresets[selectedRole].name}!`);
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Left side: Premium Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary dark:bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Abstract design elements */}
        <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-md">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white mb-0">HRMS Portal</h1>
            <span className="text-[10px] text-accent/80 font-bold uppercase tracking-wider">Enterprise HCM Suite</span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 my-auto text-left max-w-md">
          <span className="text-xs font-bold text-accent tracking-widest uppercase block mb-3">
            NEXT-GEN HUMAN RESOURCE PLATFORM
          </span>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Powering employee excellence at scale.
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
            Manage global payroll, State-wise compliance calendars, automated OT clock-ins, shift swap approvals, and roles-based hierarchies from a unified cloud system.
          </p>

          <div className="flex items-center gap-6 text-slate-200 mt-8 border-t border-white/10 pt-6">
            <div>
              <span className="block text-2xl font-bold text-white">12,500+</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Staff Members</span>
            </div>
            <div className="border-l border-white/10 pl-6">
              <span className="block text-2xl font-bold text-white">99.99%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">System Uptime</span>
            </div>
            <div className="border-l border-white/10 pl-6">
              <span className="block text-2xl font-bold text-white">ISO 27001</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Secured</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-slate-400 text-xs flex justify-between">
          <span>&copy; {new Date().getFullYear()} HRMS Corp.</span>
          <span>Version 1.2 Enterprise Build</span>
        </div>
      </div>

      {/* Right side: Login Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Header Mobile Title */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm">
              <Briefcase className="h-4.5 w-4.5" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-base tracking-tight block">HRMS Portal</span>
              <span className="text-[10px] text-accent/80 font-bold uppercase">HRMS</span>
            </div>
          </div>

          <div className="text-center lg:text-left mb-6">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Sign In to HR Portal</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
              Select a simulated role preset for instant portal switching.
            </p>
          </div>

          {/* Quick preset selector */}
          <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80 mb-6">
            <span className="block text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest text-left px-2 mb-1.5">
              Simulated Role Select
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
              {['Admin', 'Finance HR', 'Recruitment HR', 'Operational HR', 'Manager', 'Employee', 'Security'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={`py-1.5 px-1 rounded-lg text-[9px] font-bold cursor-pointer transition-all ${
                    selectedRole === r
                      ? 'bg-primary dark:bg-accent text-white shadow-xs'
                      : 'bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="mt-2 text-center">
              <span className="text-[10px] text-primary/80 dark:text-accent font-semibold">
                Simulating Login: <strong className="font-bold">{rolePresets[selectedRole].name}</strong>
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-350 block mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@enterprise.corp"
                  className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="text-left">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-350">
                  Security Password
                </label>
                <a href="#forgot" className="text-[10px] text-primary dark:text-accent font-bold hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded-md border-slate-300 text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-slate-500 dark:text-slate-400">Remember this device</span>
              </label>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Radio size={10} className="text-emerald-500 animate-pulse" />
                <span>Single Sign-On (SSO) Active</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-white py-2.5 rounded-lg text-sm font-semibold shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating via SSO...</span>
                </>
              ) : (
                <span>Sign In Securely</span>
              )}
            </button>
          </form>

          {/* Secure footer */}
          <div className="mt-8 text-center border-t border-slate-200 dark:border-slate-800 pt-6">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Shield size={12} className="text-emerald-500" />
              Protected by Enterprise Shield v2.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
