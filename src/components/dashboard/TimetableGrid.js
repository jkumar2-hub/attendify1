'use client';
import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { clsx } from 'clsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Color cycle for subjects
const SUBJECT_COLORS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
];

function getSubjectColor(subject, colorMap) {
  if (!subject) return '';
  if (!colorMap[subject]) {
    colorMap[subject] = SUBJECT_COLORS[Object.keys(colorMap).length % SUBJECT_COLORS.length];
  }
  return colorMap[subject];
}

export function TimetableView({ timetable }) {
  if (!timetable) return null;
  const colorMap = {};
  const days = Object.keys(timetable).filter(d => DAYS.includes(d));
  const maxPeriods = Math.max(...days.map(d => timetable[d]?.length || 0));

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
      <table className="w-full text-sm min-w-[500px]">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-900/50">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-28">Day</th>
            {Array.from({ length: maxPeriods }, (_, i) => (
              <th key={i} className="px-3 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                P{i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, di) => (
            <tr key={day} className={di % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-900/20'}>
              <td className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">{day.slice(0, 3)}</td>
              {Array.from({ length: maxPeriods }, (_, pi) => {
                const subject = timetable[day]?.[pi] || '';
                return (
                  <td key={pi} className="px-2 py-2 text-center">
                    {subject ? (
                      <span className={clsx(
                        'inline-block px-2 py-1 rounded-lg text-[11px] font-semibold',
                        getSubjectColor(subject, colorMap)
                      )}>
                        {subject}
                      </span>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-700 text-xs">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TimetableEditor({ initialTimetable, onSave, onCancel }) {
  const [timetable, setTimetable] = useState(() => {
    const tt = {};
    DAYS.forEach(day => {
      tt[day] = (initialTimetable?.[day] || Array(7).fill('')).map(s => s || '');
      // Ensure at least 7 slots
      while (tt[day].length < 7) tt[day].push('');
    });
    return tt;
  });
  const [periods, setPeriods] = useState(
    Math.max(7, ...Object.values(timetable).map(s => s.length))
  );

  const updateSlot = (day, idx, value) => {
    setTimetable(prev => ({
      ...prev,
      [day]: prev[day].map((s, i) => i === idx ? value.toUpperCase() : s)
    }));
  };

  const addPeriod = () => {
    setPeriods(p => p + 1);
    setTimetable(prev => {
      const next = { ...prev };
      DAYS.forEach(d => { next[d] = [...next[d], '']; });
      return next;
    });
  };

  const removePeriod = () => {
    if (periods <= 1) return;
    setPeriods(p => p - 1);
    setTimetable(prev => {
      const next = { ...prev };
      DAYS.forEach(d => { next[d] = next[d].slice(0, -1); });
      return next;
    });
  };

  const handleSave = () => {
    // Clean: remove days with no classes
    const cleaned = {};
    DAYS.forEach(day => {
      const slots = timetable[day].map(s => s.trim());
      if (slots.some(s => s)) cleaned[day] = slots;
    });
    onSave(cleaned);
  };

  return (
    <div className="space-y-4">
      {/* Period controls */}
      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Periods per day:</span>
        <button onClick={removePeriod} className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-600 transition-all font-bold">−</button>
        <span className="text-sm font-bold text-gray-800 dark:text-white w-6 text-center">{periods}</span>
        <button onClick={addPeriod} className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 hover:bg-green-200 transition-all font-bold">+</button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50">
              <th className="w-24 px-3 py-2 text-left text-xs font-semibold text-gray-500">Day</th>
              {Array.from({ length: periods }, (_, i) => (
                <th key={i} className="px-2 py-2 text-center text-xs font-semibold text-gray-500">P{i+1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day => (
              <tr key={day} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">{day.slice(0, 3)}</td>
                {Array.from({ length: periods }, (_, pi) => (
                  <td key={pi} className="px-1 py-1">
                    <input
                      value={timetable[day]?.[pi] || ''}
                      onChange={e => updateSlot(day, pi, e.target.value)}
                      placeholder="—"
                      className="w-full text-center text-xs font-semibold uppercase py-1.5 px-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 text-gray-800 dark:text-white"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 pt-2">
        <Button onClick={handleSave} size="md">
          <Save className="w-4 h-4" /> Save Timetable
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} size="md">
            <X className="w-4 h-4" /> Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
