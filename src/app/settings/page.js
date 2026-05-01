'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Calendar, Trash2, Moon, Sun, User, LogOut, Save, AlertTriangle, UserX } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import AppLayout from '@/components/layout/AppLayout';
import { Button, Input, Modal, SectionHeader } from '@/components/ui';
import { TimetableEditor } from '@/components/dashboard/TimetableGrid';
import { clsx } from 'clsx';

function SettingRow({ icon: Icon, iconColor, iconBg, title, description, action, danger }) {
  return (
    <div className={clsx(
      'flex items-center gap-4 px-5 py-4 transition-all',
      danger ? 'hover:bg-red-50 dark:hover:bg-red-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
    )}>
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        <Icon className={clsx('w-5 h-5', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={clsx('text-sm font-semibold', danger ? 'text-red-700 dark:text-red-400' : 'text-gray-800 dark:text-white')}>{title}</div>
        {description && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</div>}
      </div>
      <div className="flex-shrink-0">{action}</div>
    </div>
  );
}

export default function SettingsPage() {
  const {
    user, timetable, semesterStart, preferences,
    setTheme, setSemesterStart, setTimetable,
    resetData, deleteAccount, logout, addToast
  } = useApp();

  const [editTimetable, setEditTimetable]     = useState(false);
  const [editDate, setEditDate]               = useState(false);
  const [newDate, setNewDate]                 = useState(semesterStart || '');
  const [confirmReset, setConfirmReset]       = useState(false);  // reset timetable+holidays
  const [confirmDelete, setConfirmDelete]     = useState(false);  // delete account
  const router = useRouter();

  const handleSaveTimetable = (tt) => {
    setTimetable(tt);
    setEditTimetable(false);
    addToast('Timetable updated!');
  };

  const handleSaveDate = () => {
    if (!newDate) return;
    setSemesterStart(newDate);
    setEditDate(false);
    addToast('Semester start date updated!');
  };

  // Reset = clear timetable + holidays, keep account
  const handleReset = () => {
    resetData();          // clears timetable, holidays, semester, setupDone — logs out too
    setConfirmReset(false);
    router.push('/setup'); // send back to setup since timetable is gone
  };

  // Delete = remove account entirely
  const handleDeleteAccount = () => {
    deleteAccount();
    setConfirmDelete(false);
    router.push('/');
  };

  const sections = [
    {
      title: 'Profile',
      items: [{
        icon: User, iconColor: 'text-blue-600', iconBg: 'bg-blue-50 dark:bg-blue-900/20',
        title: user?.name || 'Your Name',
        description: user?.email || 'your@email.com',
        action: (
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : ''}
          </span>
        ),
      }],
    },
    {
      title: 'Appearance',
      items: [{
        icon: preferences.theme === 'dark' ? Moon : Sun,
        iconColor: preferences.theme === 'dark' ? 'text-indigo-500' : 'text-yellow-500',
        iconBg: preferences.theme === 'dark' ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20',
        title: 'Theme',
        description: `Currently ${preferences.theme} mode`,
        action: (
          <button
            onClick={() => setTheme(preferences.theme === 'dark' ? 'light' : 'dark')}
            className={clsx(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300',
              preferences.theme === 'dark' ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
            )}
          >
            <span className={clsx(
              'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300',
              preferences.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
            )} />
          </button>
        ),
      }],
    },
    {
      title: 'Timetable & Semester',
      items: [
        {
          icon: Edit2, iconColor: 'text-purple-600', iconBg: 'bg-purple-50 dark:bg-purple-900/20',
          title: 'Edit Timetable',
          description: timetable ? `${Object.keys(timetable).length} days configured` : 'No timetable set',
          action: <Button size="sm" variant="outline" onClick={() => setEditTimetable(true)}>Edit</Button>,
        },
        {
          icon: Calendar, iconColor: 'text-green-600', iconBg: 'bg-green-50 dark:bg-green-900/20',
          title: 'Semester Start Date',
          description: semesterStart
            ? new Date(semesterStart).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
            : 'Not set — needed for Projection & Skip tools',
          action: (
            <Button size="sm" variant="outline" onClick={() => { setNewDate(semesterStart || ''); setEditDate(true); }}>
              Change
            </Button>
          ),
        },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        {
          icon: Trash2, iconColor: 'text-orange-500', iconBg: 'bg-orange-50 dark:bg-orange-900/20',
          title: 'Reset Timetable & Holidays',
          description: 'Clears your timetable and all holidays. Your account is kept.',
          action: <Button size="sm" variant="danger" onClick={() => setConfirmReset(true)}>Reset</Button>,
          danger: true,
        },
        {
          icon: UserX, iconColor: 'text-red-600', iconBg: 'bg-red-50 dark:bg-red-900/20',
          title: 'Delete Account',
          description: 'Permanently deletes your account, timetable, and all data.',
          action: <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>Delete</Button>,
          danger: true,
        },
      ],
    },
    {
      title: 'Account',
      items: [{
        icon: LogOut, iconColor: 'text-gray-500', iconBg: 'bg-gray-100 dark:bg-gray-800',
        title: 'Logout',
        description: 'Sign out — your data stays saved for next login',
        action: (
          <Button size="sm" variant="secondary" onClick={() => { logout(); router.push('/'); }}>
            Logout
          </Button>
        ),
      }],
    },
  ];

  return (
    <AppLayout>
      <SectionHeader title="Settings" subtitle="Manage your timetable, semester dates and preferences" />

      <div className="space-y-6 max-w-2xl">
        {sections.map(section => (
          <div key={section.title}>
            <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
              {section.title}
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-card divide-y divide-gray-50 dark:divide-gray-800/50">
              {section.items.map((item, i) => <SettingRow key={i} {...item} />)}
            </div>
          </div>
        ))}

        <div className="text-center pb-4">
          <div className="text-xs text-gray-400">Attendify v3 · Pure calculator · All data stored locally</div>
        </div>
      </div>

      {/* ── Edit Timetable Modal ── */}
      <Modal isOpen={editTimetable} onClose={() => setEditTimetable(false)} title="Edit Timetable" size="xl">
        <TimetableEditor
          initialTimetable={timetable}
          onSave={handleSaveTimetable}
          onCancel={() => setEditTimetable(false)}
        />
      </Modal>

      {/* ── Edit Semester Date Modal ── */}
      <Modal isOpen={editDate} onClose={() => setEditDate(false)} title="Change Semester Start Date" size="sm">
        <div className="space-y-5">
          <Input label="Semester Start Date" type="date" value={newDate}
            onChange={e => setNewDate(e.target.value)} hint="First day classes began this semester" />
          {newDate && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 text-sm text-green-700 dark:text-green-400">
              {new Date(newDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          )}
          <div className="flex gap-3">
            <Button onClick={handleSaveDate} disabled={!newDate} className="flex-1">
              <Save className="w-4 h-4" /> Save
            </Button>
            <Button variant="secondary" onClick={() => setEditDate(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* ── Confirm Reset (timetable + holidays only) ── */}
      <Modal isOpen={confirmReset} onClose={() => setConfirmReset(false)} title="Reset Timetable & Holidays?" size="sm">
        <div className="space-y-5">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-4 text-sm text-orange-700 dark:text-orange-400">
            <div className="font-semibold mb-2">This will delete:</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Your timetable</li>
              <li>All saved holidays</li>
              <li>Semester start date</li>
            </ul>
            <div className="mt-3 font-semibold">Your account (email + password) will be kept.</div>
          </div>
          <div className="flex gap-3">
            <Button variant="danger" onClick={handleReset} className="flex-1">
              <Trash2 className="w-4 h-4" /> Yes, Reset
            </Button>
            <Button variant="secondary" onClick={() => setConfirmReset(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* ── Confirm Delete Account ── */}
      <Modal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete Account?" size="sm">
        <div className="space-y-5">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-4 text-sm text-red-700 dark:text-red-400">
            <div className="font-semibold mb-2">⚠ This will permanently delete:</div>
            <ul className="space-y-1 list-disc list-inside">
              <li>Your account ({user?.email})</li>
              <li>Your timetable and holidays</li>
              <li>All settings and data</li>
            </ul>
            <div className="mt-3 font-bold">This cannot be undone.</div>
          </div>
          <div className="flex gap-3">
            <Button variant="danger" onClick={handleDeleteAccount} className="flex-1">
              <UserX className="w-4 h-4" /> Yes, Delete Account
            </Button>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
