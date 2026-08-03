import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import {
  Bell, Search, Plus, Sun, Moon, LogOut, Settings, User,
  Globe, Briefcase, ChevronDown, Check, Menu, Clock
} from 'lucide-react';

export default function Navbar({ onMenuToggle, isCollapsed }) {
  const {
    user, activeCompany, setActiveCompany, activePortal, setActivePortal,
    theme, toggleTheme, notifications, markAllRead, logout, switchRole,
    viewMode, toggleViewMode, statutoryRole
  } = useAuth();
  
  const { isCheckedIn, checkInTime, toggleCheckIn } = useHRMS();
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showPortalMenu, setShowPortalMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  if (!user) return null;

  const COMPANIES = ['Enterprise Global', 'APAC Division', 'EMEA Division', 'Americas Corp'];
  
  const PORTALS = [
    'Core HR & Employee Suite',
    'Payroll & Benefits Portal',
    'Performance & Growth Suite',
    'Recruiting & ATS Portal'
  ];

  const unreadCount = notifications.filter(n => !n.read).length;



  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-950 text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-850 z-40 flex items-center justify-between px-4 shadow-xs">
      
      {/* Left section: Logo & Sidebar Toggler */}
      <div className="flex items-center gap-3">
        {user.role !== 'Admin' && (
          <button
            onClick={onMenuToggle}
            className="p-1.5 rounded-lg text-slate-650 hover:bg-slate-100 dark:text-slate-350 dark:hover:bg-slate-800 lg:hidden cursor-pointer focus:outline-hidden"
          >
            <Menu size={20} />
          </button>
        )}
        
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center text-white shadow-xs shrink-0">
            <Briefcase size={16} />
          </div>
          <div className="hidden sm:block text-left">
            <span className="font-extrabold text-base tracking-tight block leading-tight text-slate-900 dark:text-white">HRMS Portal</span>
            <span className="text-[9px] text-accent font-bold block -mt-0.5 tracking-wider">HRMS ENTERPRISE</span>
          </div>
        </div>

        {/* Company Switcher */}
        <div className="relative hidden md:block pl-4 border-l border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              setShowCompanyMenu(!showCompanyMenu);
              setShowPortalMenu(false);
            }}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            <Globe size={13} className="text-accent" />
            <span>{activeCompany}</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
          {showCompanyMenu && (
            <div className="absolute left-4 top-10 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-50 text-slate-700 dark:text-slate-200">
              {COMPANIES.map(company => (
                <button
                  key={company}
                  onClick={() => {
                    setActiveCompany(company);
                    setShowCompanyMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 font-medium flex items-center justify-between"
                >
                  {company}
                  {activeCompany === company && <Check size={12} className="text-primary dark:text-accent" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Portal Switcher */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => {
              setShowPortalMenu(!showPortalMenu);
              setShowCompanyMenu(false);
            }}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            <Briefcase size={13} className="text-accent" />
            <span>{activePortal}</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
          {showPortalMenu && (
            <div className="absolute left-0 top-10 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-50 text-slate-700 dark:text-slate-200">
              {PORTALS.map(portal => (
                <button
                  key={portal}
                  onClick={() => {
                    setActivePortal(portal);
                    setShowPortalMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 font-medium flex items-center justify-between"
                >
                  {portal}
                  {activePortal === portal && <Check size={12} className="text-primary dark:text-accent" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle section: Global Search */}
      <div className="hidden sm:flex items-center w-60 lg:w-80 relative bg-slate-50 dark:bg-slate-900 text-slate-850 dark:text-slate-150 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 focus-within:bg-white focus-within:border-primary/20 transition-all">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Global Search (Ctrl + K)..."
          className="bg-transparent border-none text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 w-full pl-2 focus:outline-hidden"
        />
      </div>

      {/* Right section: System Utilities, Theme, Alerts, Profiles */}
      <div className="flex items-center gap-2 md:gap-3.5">
        {/* Quick Add Actions */}
        <div className="relative">
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="p-2 bg-accent/10 hover:bg-accent/20 rounded-lg text-accent border border-accent/20 transition-colors cursor-pointer"
            title="Quick Action"
          >
            <Plus size={16} />
          </button>
          {showQuickAdd && (
            <div className="absolute right-0 top-10 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-50 text-slate-700 dark:text-slate-200">
              <span className="block px-3.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Create & Apply
              </span>
              <button
                onClick={() => { setShowQuickAdd(false); navigate('/leaves'); }}
                className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Apply Leave
              </button>
              <button
                onClick={() => { setShowQuickAdd(false); navigate('/overtime'); }}
                className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Request Overtime
              </button>
              
              {(['HR', 'Recruitment HR'].includes(user.role) || ['HR', 'Operational HR'].includes(user.role)) && (
                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
              )}
              
              {['HR', 'Recruitment HR'].includes(user.role) && (
                <button
                  onClick={() => { setShowQuickAdd(false); navigate('/wizard'); }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-primary dark:text-accent"
                >
                  Onboard Employee
                </button>
              )}
              
              {['HR', 'Operational HR'].includes(user.role) && (
                <button
                  onClick={() => { setShowQuickAdd(false); navigate('/holidays'); }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Publish Holiday
                </button>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-450 dark:hover:text-slate-200 dark:hover:bg-slate-900 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-450 dark:hover:text-slate-200 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 bg-danger rounded-full text-[9px] font-bold flex items-center justify-center text-white border border-white dark:border-slate-950">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotificationMenu && (
            <div className="absolute right-0 top-10 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden text-slate-800 dark:text-slate-150">
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    className="text-xs text-primary dark:text-accent hover:underline font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors ${
                        !n.read ? 'bg-primary/5 dark:bg-slate-800/10' : ''
                      }`}
                    >
                      <div className="flex justify-between font-semibold text-slate-900 dark:text-white mb-0.5">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-450">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-855 text-center bg-slate-50 dark:bg-slate-900/30">
                <span className="text-[10px] text-slate-450 font-medium">Enterprise Notification Service</span>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotificationMenu(false);
            }}
            className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 px-2 py-1 rounded-lg cursor-pointer transition-colors"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800 object-cover"
            />
            <span className="hidden xl:inline text-xs font-semibold text-slate-700 dark:text-slate-350">{user.name}</span>
            <ChevronDown size={12} className="hidden xl:inline text-slate-400" />
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 top-11 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 text-slate-700 dark:text-slate-200">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-850">
                <span className="block font-bold text-xs text-slate-900 dark:text-white">{user.name}</span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-450 truncate">{user.email}</span>
                <span className="inline-block mt-1 text-[9px] font-bold bg-accent/15 text-primary dark:bg-accent/20 dark:text-accent px-2 py-0.5 rounded-full uppercase">
                  {user.role} View
                </span>
              </div>

              {/* Toggle statutory role vs employee view */}
              {statutoryRole !== 'Employee' && (
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-850">
                  <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    View Mode Portal
                  </span>
                  <div className="flex bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-850 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (viewMode !== 'role') {
                          toggleViewMode();
                          setShowProfileMenu(false);
                          navigate('/dashboard');
                        }
                      }}
                      className={`flex-1 py-1 text-[10px] font-extrabold rounded-md text-center cursor-pointer transition-all uppercase tracking-wider ${
                        viewMode === 'role'
                          ? 'bg-primary text-white dark:bg-accent dark:text-slate-950 shadow-xs'
                          : 'text-slate-550 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350'
                      }`}
                    >
                      {statutoryRole}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (viewMode !== 'employee') {
                          toggleViewMode();
                          setShowProfileMenu(false);
                          navigate('/dashboard');
                        }
                      }}
                      className={`flex-1 py-1 text-[10px] font-extrabold rounded-md text-center cursor-pointer transition-all uppercase tracking-wider ${
                        viewMode === 'employee'
                          ? 'bg-primary text-white dark:bg-accent dark:text-slate-950 shadow-xs'
                          : 'text-slate-550 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350'
                      }`}
                    >
                      Employee
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => { setShowProfileMenu(false); navigate(`/profile/${user.employeeId}`); }}
                className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <User size={13} />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <Settings size={13} />
                <span>Account Settings</span>
              </button>
              <div className="border-t border-slate-100 dark:border-slate-850 my-1" />
              <button
                onClick={() => { setShowProfileMenu(false); logout(); navigate('/login'); }}
                className="w-full text-left px-4 py-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 font-semibold"
              >
                <LogOut size={13} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
