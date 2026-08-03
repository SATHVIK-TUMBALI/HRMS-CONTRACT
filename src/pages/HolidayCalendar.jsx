import React, { useState } from 'react';
import { useHRMS } from '../context/HRMSContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, Plus, ShieldCheck, Flag, Check, Landmark } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import { toast } from 'react-hot-toast';

export default function HolidayCalendar() {
  const { holidays, addHoliday } = useHRMS();
  const { user } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [hName, setHName] = useState('');
  const [hDate, setHDate] = useState('');
  const [hType, setHType] = useState('Public');
  const [hCalendar, setHCalendar] = useState('National Calendar');

  if (!user) return null;

  const isHR = ['HR', 'Operational HR'].includes(user.role);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hName || !hDate) {
      toast.error('Please enter name and date.');
      return;
    }
    addHoliday({
      name: hName,
      date: hDate,
      type: hType,
      calendar: hCalendar
    });
    setIsAddModalOpen(false);
    setHName('');
    setHDate('');
    toast.success(`Holiday '${hName}' published to calendar successfully.`);
  };

  const handlePublishAll = () => {
    toast.success('All calendar slots finalized and published to Active Directory.');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Statutory Holiday Calendars</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Manage state-wise public calendars, restricted holiday rosters, and branch assignment lists.
          </p>
        </div>
        <div className="flex gap-2">
          {isHR && (
            <>
              <Button onClick={handlePublishAll} variant="outline" icon={ShieldCheck}>
                Publish Calendars
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)} variant="primary" icon={Plus}>
                Add Holiday
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Grid: Calendars List & Holidays List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Calendars List */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Active Regional Calendars</h3>
              <span className="text-[10px] text-slate-400 font-semibold">Branch and department mappings</span>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 border border-primary/20 bg-primary/5 dark:border-accent/20 dark:bg-slate-900 rounded-xl flex items-center justify-between text-xs">
                <div className="text-left">
                  <span className="font-bold text-slate-800 dark:text-slate-200">National Calendar</span>
                  <p className="text-[10px] text-slate-400">Default &bull; All US Headquarters</p>
                </div>
                <Badge status="Active">6 Holidays</Badge>
              </div>

              <div className="p-3 border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-xl flex items-center justify-between text-xs cursor-pointer">
                <div className="text-left">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Regional Calendar A</span>
                  <p className="text-[10px] text-slate-400">California Hub Offices</p>
                </div>
                <Badge status="Active">7 Holidays</Badge>
              </div>

              <div className="p-3 border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-xl flex items-center justify-between text-xs cursor-pointer">
                <div className="text-left">
                  <span className="font-bold text-slate-800 dark:text-slate-200">APAC Roster Calendar</span>
                  <p className="text-[10px] text-slate-400">India/Singapore Roster</p>
                </div>
                <Badge status="Active">5 Holidays</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-slate-250 uppercase text-[10px]">Statutory Guidelines</h4>
            <p className="text-slate-500 leading-relaxed">
              According to Federal statutory codes, employees are allocated 8 public holidays. Restricted holidays allow individuals to substitute religious days with approval.
            </p>
          </Card>
        </div>

        {/* Right Side: Holidays Table */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Holiday Calendar Ledger</h3>
            <span className="text-[10px] text-slate-400 font-semibold">Listing statutory days configured in the HRMS</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-450 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Holiday Name</th>
                  <th className="px-4 py-3">Scheduled Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Calendar Mapping</th>
                  <th className="px-4 py-3">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {holidays.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {h.name}
                    </td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-semibold">
                      {new Date(h.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                        h.type === 'Public'
                          ? 'bg-primary/5 text-primary border-primary/20 dark:bg-accent/15 dark:text-accent'
                          : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                      }`}>
                        {h.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {h.calendar}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status="Approved" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* ADD HOLIDAY MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Publish New Statutory Holiday">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Holiday Title"
            value={hName}
            onChange={(e) => setHName(e.target.value)}
            placeholder="e.g. Independence Day Roster"
            required
          />
          <Input
            label="Scheduled Date"
            type="date"
            value={hDate}
            onChange={(e) => setHDate(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Holiday Classification"
              value={hType}
              onChange={(e) => setHType(e.target.value)}
              options={['Public', 'Restricted', 'Roster-OFF']}
            />
            <Select
              label="Calendar Mapping Scope"
              value={hCalendar}
              onChange={(e) => setHCalendar(e.target.value)}
              options={['All', 'National Calendar', 'Regional Calendar A', 'APAC Roster Calendar']}
            />
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end gap-2">
            <Button onClick={() => setIsAddModalOpen(false)} variant="secondary">Cancel</Button>
            <Button type="submit" variant="primary">Publish Holiday</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
