'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Calendar, Calculator, TrendingUp, Zap, Plus, Trash2, AlertTriangle, Hash } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import AppLayout from '@/components/layout/AppLayout';
import { TimetableView } from '@/components/dashboard/TimetableGrid';
import { Button, Modal, Input, SectionHeader, EmptyState } from '@/components/ui';

function AddHolidayModal({ open, onClose, onAdd }) {
  const [type, setType] = useState('single');
  const [form, setForm] = useState({ date: '', start: '', end: '', label: '' });
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (type === 'single' && !form.date) { setError('Please select a date'); return; }
    if (type === 'range' && (!form.start || !form.end)) { setError('Please select both dates'); return; }
    if (type === 'range' && form.start > form.end) { setError('Start must be before end date'); return; }
    onAdd(type === 'single'
      ? { date: form.date, label: form.label || 'Holiday' }
      : { start: form.start, end: form.end, label: form.label || 'Holiday Break' }
    );
    onClose();
    setForm({ date: '', start: '', end: '', label: '' });
    setError('');
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Add Holiday / Break" size="sm">
      <div className="space-y-4">
        <div className="flex gap-2">
          {['single', 'range'].map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                type === t ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
              {t === 'single' ? '📅 Single Day' : '📆 Date Range'}
            </button>
          ))}
        </div>
        {type === 'single'
          ? <Input label="Holiday Date" type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} />
          : <div className="grid grid-cols-2 gap-3">
              <Input label="Start Date" type="date" value={form.start} onChange={e => setForm(p => ({...p, start: e.target.value}))} />
              <Input label="End Date" type="date" value={form.end} onChange={e => setForm(p => ({...p, end: e.target.value}))} />
            </div>
        }
        <Input label="Label (optional)" placeholder="e.g. Diwali Break" value={form.label} onChange={e => setForm(p => ({...p, label: e.target.value}))} />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-3">
          <Button onClick={handleAdd} className="flex-1">Add Holiday</Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}

export default function DashboardPage() {
  const { user, timetable, semesterStart, setupDone, addHoliday, removeHoliday, holidays, loading } = useApp();
  const [holidayModal, setHolidayModal] = useState(false);
  const router = useRouter();

  if (typeof window !== 'undefined' && !loading && !user) { router.push('/login'); return null; }
  if (!loading && user && !setupDone) { router.push('/setup'); return null; }

  const quickActions = [
    { href: '/calculator?tool=projection',  icon: TrendingUp,   label: 'Attendance Projection', desc: 'Project your future attendance %',          color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20' },
    { href: '/calculator?tool=absence',     icon: AlertTriangle, label: 'Absence Planner',       desc: 'How much will your % drop if absent?',      color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { href: '/calculator?tool=skip',        icon: Zap,           label: 'Skip Planner',          desc: 'Max classes you can skip to stay at 75%',   color: 'text-pink-600',   bg: 'bg-pink-50 dark:bg-pink-900/20' },
    { href: '/calculator?tool=class-count', icon: Hash,        label: 'Class Counter',         desc: 'Count total classes in a date range',       color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  ];

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white">
            Hey, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Use the calculators below to plan your attendance smartly.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <SectionHeader title="Calculators" subtitle="Pick a tool to get started" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map(a => (
            <Link key={a.href} href={a.href}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-card card-hover flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${a.bg} flex items-center justify-center flex-shrink-0`}>
                <a.icon className={`w-6 h-6 ${a.color}`} />
              </div>
              <div>
                <div className="font-display font-bold text-gray-900 dark:text-white">{a.label}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Timetable */}
      {timetable ? (
        <div className="mb-10">
          <SectionHeader
            title="Your Timetable"
            subtitle={semesterStart
              ? `Semester from ${new Date(semesterStart).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`
              : 'No semester date set'}
            action={
              <Link href="/settings">
                <Button variant="ghost" size="sm"><Edit2 className="w-4 h-4 mr-1" /> Edit</Button>
              </Link>
            }
          />
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-card">
            <TimetableView timetable={timetable} />
          </div>
        </div>
      ) : (
        <div className="mb-10">
          <EmptyState
            icon="📋"
            title="No timetable yet"
            description="Set up your timetable so the calculators can count your classes accurately."
            action={<Link href="/setup"><Button>Set Up Timetable →</Button></Link>}
          />
        </div>
      )}

      {/* Holidays */}
      <div className="mb-10">
        <SectionHeader
          title="Holidays & Breaks"
          subtitle="These are auto-excluded in all calculator tools"
          action={
            <Button size="sm" onClick={() => setHolidayModal(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Holiday
            </Button>
          }
        />
        {holidays.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="text-4xl mb-3">🏖️</div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No holidays added yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs mx-auto">
              Add holidays and breaks — they will be automatically excluded from class counts.
            </p>
            <Button size="sm" className="mt-4" onClick={() => setHolidayModal(true)}>
              <Plus className="w-4 h-4" /> Add Holiday
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {holidays.map((h, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-800 shadow-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-lg">
                    {h.start ? '📆' : '📅'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-white">{h.label || 'Holiday'}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {h.date || `${h.start} → ${h.end}`}
                    </div>
                  </div>
                </div>
                <button onClick={() => removeHoliday(i)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddHolidayModal open={holidayModal} onClose={() => setHolidayModal(false)} onAdd={addHoliday} />
    </AppLayout>
  );
}
