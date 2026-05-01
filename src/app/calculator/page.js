'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Calendar, TrendingUp, AlertTriangle, Zap, Plus, Trash2, ArrowRight, CheckCircle, XCircle, Info, Hash } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import AppLayout from '@/components/layout/AppLayout';
import { Button, Input } from '@/components/ui';
import {
  getWorkingDays, getTotalClasses, getClassesPerSubject,
  calcPercentage, DAY_MAP
} from '@/lib/attendance';
import { eachDayOfInterval, parseISO } from 'date-fns';
import { clsx } from 'clsx';

// ── Order: Projection, Absence, Skip, Class Counter (last) ────────
const TOOLS = [
  { id: 'projection', icon: TrendingUp,    label: 'Projection',     color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20',  desc: 'Project your future attendance %' },
  { id: 'absence',    icon: AlertTriangle,  label: 'Absence Planner',color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', desc: 'How much % drops if you are absent?' },
  { id: 'skip',       icon: Zap,            label: 'Skip Planner',   color: 'text-pink-600',   bg: 'bg-pink-50 dark:bg-pink-900/20',    desc: 'Max classes you can skip and stay ≥75%' },
  { id: 'class-count',icon: Hash,           label: 'Class Counter',  color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20',    desc: 'Count total classes in a date range' },
];

// ── Helpers ───────────────────────────────────────────────────────
function buildExclusions(list) {
  return list.map(item => {
    if (item.start && item.end) return { start: item.start, end: item.end };
    if (item.date) return { date: item.date };
    return null;
  }).filter(Boolean);
}

function countAbsentClasses(absentList, timetable) {
  let total = 0;
  absentList.forEach(item => {
    let days = [];
    if (item.start && item.end) {
      days = eachDayOfInterval({ start: parseISO(item.start), end: parseISO(item.end) });
    } else if (item.date) {
      days = [parseISO(item.date)];
    }
    days.forEach(day => {
      const dayName = DAY_MAP[day.getDay()];
      const slots = timetable[dayName] || [];
      total += slots.filter(s => s && s.trim()).length;
    });
  });
  return total;
}

// ── Result Box ────────────────────────────────────────────────────
function ResultBox({ title, value, sub, color = 'green' }) {
  const palette = {
    green:  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400',
    red:    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400',
    blue:   'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
    gray:   'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300',
  };
  return (
    <div className={clsx('rounded-2xl border p-5 text-center', palette[color])}>
      <div className="font-display font-extrabold text-3xl mb-1">{value}</div>
      <div className="font-semibold text-sm">{title}</div>
      {sub && <div className="text-xs opacity-70 mt-1">{sub}</div>}
    </div>
  );
}

// ── Shared Exclusion List (holidays / absent days) ─────────────────
function ExclusionList({ title, icon, items, onAdd, onRemove, colorClass, bgClass, borderClass, showClassCount = false }) {
  const [type, setType] = useState('single');
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [count, setCount] = useState('');

  const handleAdd = () => {
    if (type === 'count') {
      if (!count || parseInt(count) <= 0) return;
      onAdd({ classCount: parseInt(count) });
      setCount('');
      return;
    }
    if (type === 'single' && !date) return;
    if (type === 'range' && (!start || !end)) return;
    onAdd(type === 'single' ? { date } : { start, end });
    setDate(''); setStart(''); setEnd('');
  };

  const tabs = showClassCount
    ? [{ v: 'single', l: '📅 Single Day' }, { v: 'range', l: '📆 Range' }, { v: 'count', l: '🔢 No. of Classes' }]
    : [{ v: 'single', l: '📅 Single Day' }, { v: 'range', l: '📆 Range' }];

  return (
    <div className={clsx('rounded-2xl border p-4', bgClass, borderClass)}>
      <div className={clsx('text-sm font-bold mb-3 flex items-center gap-2', colorClass)}>
        {icon} {title}
      </div>

      {/* Type tabs */}
      <div className="flex gap-1.5 mb-3">
        {tabs.map(({ v, l }) => (
          <button key={v} onClick={() => setType(v)}
            className={clsx(
              'flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border',
              type === v
                ? 'bg-white dark:bg-gray-800 shadow text-gray-800 dark:text-white border-gray-300 dark:border-gray-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50'
            )}>{l}</button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex gap-2 items-end">
        {type === 'single' && (
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex-1 input-field py-2 text-sm" />
        )}
        {type === 'range' && (
          <>
            <input type="date" value={start} onChange={e => setStart(e.target.value)} className="flex-1 input-field py-2 text-sm" />
            <span className="text-gray-400 text-xs pb-2">→</span>
            <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="flex-1 input-field py-2 text-sm" />
          </>
        )}
        {type === 'count' && (
          <div className="flex-1 relative">
            <input type="number" min="1" placeholder="e.g. 3" value={count} onChange={e => setCount(e.target.value)}
              className="input-field py-2 text-sm w-full" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">classes</span>
          </div>
        )}
        <button onClick={handleAdd}
          className="px-3 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-bold flex items-center gap-1 transition-all flex-shrink-0">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Added items */}
      {items.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between bg-white/70 dark:bg-gray-800/60 rounded-xl px-3 py-1.5">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {item.classCount != null
                  ? `${item.classCount} class${item.classCount > 1 ? 'es' : ''} skipped`
                  : item.date || `${item.start} → ${item.end}`}
              </span>
              <button onClick={() => onRemove(i)} className="text-gray-400 hover:text-red-500 transition-colors ml-2">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Helper: sum absent classes from mixed list ─────────────────────
function calcTotalAbsent(absentList, timetable) {
  let total = 0;
  absentList.forEach(item => {
    if (item.classCount != null) {
      total += item.classCount;
    } else {
      total += countAbsentClasses([item], timetable);
    }
  });
  return total;
}

// ═══════════════════════════════════════════════════════════════════
// TOOL 1 — Projection
// ═══════════════════════════════════════════════════════════════════
function ProjectionTool({ timetable, semesterStart, globalHolidays }) {
  const [currentPct, setCurrentPct] = useState('');
  const [rangeStart, setRangeStart]  = useState('');
  const [rangeEnd, setRangeEnd]      = useState('');
  const [holidays, setHolidays]      = useState([]);
  const [absents, setAbsents]        = useState([]);
  const [result, setResult]          = useState(null);

  const allExclusions = [...buildExclusions(globalHolidays), ...buildExclusions(holidays)];

  const calculate = () => {
    if (!currentPct || !rangeStart || !rangeEnd || !timetable || !semesterStart) return;
    const pct = parseFloat(currentPct);

    const pastDays    = getWorkingDays(semesterStart, rangeStart, timetable, buildExclusions(globalHolidays));
    const pastTotal   = getTotalClasses(pastDays, timetable);
    const pastAttended = Math.round((pct / 100) * pastTotal);

    const futureDays    = getWorkingDays(rangeStart, rangeEnd, timetable, allExclusions);
    const futureTotal   = getTotalClasses(futureDays, timetable);
    const absentClasses = calcTotalAbsent(absents, timetable);
    const futureAttended = Math.max(0, futureTotal - absentClasses);

    const newTotal    = pastTotal + futureTotal;
    const newAttended = pastAttended + futureAttended;
    const newPct      = calcPercentage(newAttended, newTotal);

    setResult({ currentPct: pct, pastTotal, pastAttended, futureTotal, futureAttended, absentClasses, newTotal, newAttended, newPct });
  };

  const safeFlag = result ? (result.newPct >= 75 ? 'green' : result.newPct >= 65 ? 'orange' : 'red') : 'green';

  return (
    <div className="space-y-5">
      {/* Current % */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Your Current Attendance %</label>
        <div className="relative">
          <input type="number" min="0" max="100" step="0.1" placeholder="e.g. 72.5"
            value={currentPct} onChange={e => setCurrentPct(e.target.value)}
            className="input-field pr-10 text-lg font-bold" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">As shown in your college portal</p>
      </div>

      {/* Future range */}
      <div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Future Period to Project</div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="From" type="date" value={rangeStart} onChange={e => setRangeStart(e.target.value)} />
          <Input label="To"   type="date" value={rangeEnd}   onChange={e => setRangeEnd(e.target.value)} />
        </div>
      </div>

      {/* Holidays in this period */}
      <ExclusionList
        title="Holidays in this period"
        icon="🏖️"
        items={holidays}
        onAdd={h => setHolidays(p => [...p, h])}
        onRemove={i => setHolidays(p => p.filter((_, idx) => idx !== i))}
        colorClass="text-orange-600"
        bgClass="bg-orange-50 dark:bg-orange-900/10"
        borderClass="border-orange-200 dark:border-orange-800"
      />

      {/* Absents — with 3 options: single, range, class count */}
      <ExclusionList
        title="Days / Classes You Plan to Skip"
        icon="🙅"
        items={absents}
        onAdd={a => setAbsents(p => [...p, a])}
        onRemove={i => setAbsents(p => p.filter((_, idx) => idx !== i))}
        colorClass="text-red-600"
        bgClass="bg-red-50 dark:bg-red-900/10"
        borderClass="border-red-200 dark:border-red-800"
        showClassCount={true}
      />

      {!semesterStart && (
        <div className="text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-3 py-2 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          Semester start date not set — go to Settings to add it.
        </div>
      )}

      {globalHolidays.length > 0 && (
        <div className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          {globalHolidays.length} global holiday(s) from your dashboard are excluded automatically.
        </div>
      )}

      <Button onClick={calculate} disabled={!currentPct || !rangeStart || !rangeEnd} size="lg" className="w-full">
        Project My Attendance <ArrowRight className="w-4 h-4" />
      </Button>

      {result && (
        <div className="space-y-4 animate-fade-in pt-2">
          <div className="grid grid-cols-3 gap-3">
            <ResultBox title="Now" value={`${result.currentPct}%`} color="blue" />
            <ResultBox title="Future Classes" value={result.futureTotal} sub={`${result.absentClasses} skipped`} color="gray" />
            <ResultBox title="Projected" value={`${result.newPct}%`}
              sub={result.newPct >= 75 ? '✓ Safe' : result.newPct >= 65 ? '⚠ Risk' : '✗ Critical'}
              color={safeFlag} />
          </div>
          <div className={clsx('rounded-2xl px-5 py-4 border text-sm font-semibold',
            safeFlag === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' :
            safeFlag === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400' :
            'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
          )}>
            {safeFlag === 'green'
              ? `✓ Great! After this period your attendance will be ${result.newPct}% — safely above 75%.`
              : safeFlag === 'orange'
                ? `⚠ Your attendance will fall to ${result.newPct}% — getting close to the danger zone.`
                : `✗ Your attendance will drop to ${result.newPct}% — below the 75% requirement!`}
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div>Semester so far: ~{result.pastAttended} attended / {result.pastTotal} classes</div>
            <div>Future range: {result.futureAttended} attending / {result.futureTotal} classes</div>
            <div>Combined: {result.newAttended}/{result.newTotal} = <strong className="text-gray-700 dark:text-gray-300">{result.newPct}%</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TOOL 2 — Absence Planner
// ═══════════════════════════════════════════════════════════════════
function AbsenceTool({ timetable, semesterStart, globalHolidays }) {
  const [currentPct, setCurrentPct]   = useState('');
  const [absStart, setAbsStart]       = useState('');
  const [absEnd, setAbsEnd]           = useState('');
  const [extraAbsents, setExtraAbsents] = useState([]);
  const [result, setResult]           = useState(null);

  const calculate = () => {
    if (!currentPct || !absStart || !absEnd || !timetable || !semesterStart) return;
    const pct = parseFloat(currentPct);
    const today = new Date().toISOString().slice(0, 10);

    const allGlobalExcl = buildExclusions(globalHolidays);
    const pastDays     = getWorkingDays(semesterStart, today, timetable, allGlobalExcl);
    const currentTotal = getTotalClasses(pastDays, timetable);
    const currentAttended = Math.round((pct / 100) * currentTotal);

    const absenceDays    = getWorkingDays(absStart, absEnd, timetable, allGlobalExcl);
    const absenceClasses = getTotalClasses(absenceDays, timetable);
    const extraMissed    = calcTotalAbsent(extraAbsents, timetable);
    const totalMissed    = absenceClasses + extraMissed;

    const newTotal    = currentTotal + absenceClasses;
    const newAttended = currentAttended;
    const newPct      = calcPercentage(newAttended, newTotal);
    const maxSafe     = Math.max(0, Math.floor((currentAttended - 0.75 * currentTotal) / 0.75));

    setResult({ pct, currentTotal, currentAttended, absenceClasses, extraMissed, totalMissed, newTotal, newPct, maxSafe, absenceDays: absenceDays.length });
  };

  const safeFlag = result ? (result.newPct >= 75 ? 'green' : result.newPct >= 65 ? 'orange' : 'red') : 'green';

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Your Current Attendance %</label>
        <div className="relative">
          <input type="number" min="0" max="100" step="0.1" placeholder="e.g. 82"
            value={currentPct} onChange={e => setCurrentPct(e.target.value)}
            className="input-field pr-10 text-lg font-bold" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
        </div>
      </div>

      <div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Planned Absence Period</div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="From" type="date" value={absStart} onChange={e => setAbsStart(e.target.value)} />
          <Input label="To"   type="date" value={absEnd}   onChange={e => setAbsEnd(e.target.value)} />
        </div>
      </div>

      <ExclusionList
        title="Any additional absent days outside the range"
        icon="➕"
        items={extraAbsents}
        onAdd={a => setExtraAbsents(p => [...p, a])}
        onRemove={i => setExtraAbsents(p => p.filter((_, idx) => idx !== i))}
        colorClass="text-red-600"
        bgClass="bg-red-50 dark:bg-red-900/10"
        borderClass="border-red-200 dark:border-red-800"
        showClassCount={true}
      />

      <Button onClick={calculate} disabled={!currentPct || !absStart || !absEnd} size="lg" className="w-full">
        Calculate Impact <ArrowRight className="w-4 h-4" />
      </Button>

      {result && (
        <div className="space-y-4 animate-fade-in pt-2">
          <div className="grid grid-cols-2 gap-3">
            <ResultBox title="Classes You'll Miss" value={result.totalMissed} sub={`${result.absenceDays} working days`} color="red" />
            <ResultBox title="New Attendance %" value={`${result.newPct}%`}
              sub={result.newPct >= 75 ? '✓ Still safe' : '⚠ Below 75%'}
              color={safeFlag} />
          </div>
          <div className={clsx('rounded-2xl px-5 py-4 border',
            safeFlag === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
            safeFlag === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
            'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          )}>
            <div className={clsx('font-bold text-sm mb-1',
              safeFlag === 'green' ? 'text-green-700 dark:text-green-400' :
              safeFlag === 'orange' ? 'text-orange-700 dark:text-orange-400' : 'text-red-700 dark:text-red-400'
            )}>
              {safeFlag === 'green'
                ? `✓ Safe! Your attendance will be ${result.newPct}% even after this absence.`
                : safeFlag === 'orange'
                  ? `⚠ Your attendance will drop to ${result.newPct}% — getting risky.`
                  : `✗ Your attendance will drop to ${result.newPct}% — critical zone!`}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              Drop: <strong>{result.pct}%</strong> → <strong>{result.newPct}%</strong>
              {' '}(−{(result.pct - result.newPct).toFixed(1)} pts)
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div>Current: ~{result.currentAttended} attended / {result.currentTotal} total</div>
            <div>After absence: {result.currentAttended} attended / {result.newTotal} total = {result.newPct}%</div>
            <div>Safe skip buffer right now: <strong className="text-green-600 dark:text-green-400">{result.maxSafe} classes</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TOOL 3 — Skip Planner
// ═══════════════════════════════════════════════════════════════════
function SkipPlannerTool({ timetable, semesterStart, globalHolidays }) {
  const [currentPct, setCurrentPct] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd]     = useState('');
  const [holidays, setHolidays]     = useState([]);
  const [result, setResult]         = useState(null);

  const allExclusions = [...buildExclusions(globalHolidays), ...buildExclusions(holidays)];

  const calculate = () => {
    if (!currentPct || !rangeStart || !rangeEnd || !timetable || !semesterStart) return;
    const pct   = parseFloat(currentPct);
    const today = new Date().toISOString().slice(0, 10);

    const pastDays      = getWorkingDays(semesterStart, today, timetable, buildExclusions(globalHolidays));
    const currentTotal  = getTotalClasses(pastDays, timetable);
    const currentAttended = Math.round((pct / 100) * currentTotal);

    const futureDays    = getWorkingDays(rangeStart, rangeEnd, timetable, allExclusions);
    const futureClasses = getTotalClasses(futureDays, timetable);

    const minAttend  = Math.ceil(0.75 * (currentTotal + futureClasses) - currentAttended);
    const maxSkip    = Math.max(0, futureClasses - minAttend);
    const mustAttend = Math.max(0, minAttend);

    const newPctIfSkipAll   = calcPercentage(currentAttended, currentTotal + futureClasses);
    const newPctIfAttendAll = calcPercentage(currentAttended + futureClasses, currentTotal + futureClasses);

    setResult({ pct, futureClasses, maxSkip, mustAttend, futureDays: futureDays.length, newPctIfSkipAll, newPctIfAttendAll });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Your Current Attendance %</label>
        <div className="relative">
          <input type="number" min="0" max="100" step="0.1" placeholder="e.g. 78"
            value={currentPct} onChange={e => setCurrentPct(e.target.value)}
            className="input-field pr-10 text-lg font-bold" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Enter your current attendance from the college portal</p>
      </div>

      <div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Future Date Range</div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="From" type="date" value={rangeStart} onChange={e => setRangeStart(e.target.value)} />
          <Input label="To"   type="date" value={rangeEnd}   onChange={e => setRangeEnd(e.target.value)} />
        </div>
      </div>

      <ExclusionList
        title="Holidays in this future period"
        icon="🏖️"
        items={holidays}
        onAdd={h => setHolidays(p => [...p, h])}
        onRemove={i => setHolidays(p => p.filter((_, idx) => idx !== i))}
        colorClass="text-orange-600"
        bgClass="bg-orange-50 dark:bg-orange-900/10"
        borderClass="border-orange-200 dark:border-orange-800"
      />

      <Button onClick={calculate} disabled={!currentPct || !rangeStart || !rangeEnd} size="lg" className="w-full">
        Calculate Skip Limit <Zap className="w-4 h-4" />
      </Button>

      {result && (
        <div className="space-y-4 animate-fade-in pt-2">
          <div className="grid grid-cols-2 gap-3">
            <ResultBox title="Total Classes in Range" value={result.futureClasses} sub={`${result.futureDays} working days`} color="blue" />
            <ResultBox title="Max You Can Skip" value={result.maxSkip}
              sub={result.maxSkip === 0 ? 'Cannot skip any!' : 'and still stay ≥75%'}
              color={result.maxSkip > 0 ? 'green' : 'red'} />
          </div>

          <div className={clsx('rounded-2xl px-5 py-5 text-center border',
            result.maxSkip > 0
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          )}>
            {result.maxSkip > 0 ? (
              <>
                <div className="text-4xl font-display font-extrabold text-green-600 dark:text-green-400">{result.maxSkip}</div>
                <div className="font-semibold text-green-700 dark:text-green-400 mt-1">classes you can skip</div>
                <div className="text-sm text-green-600/80 dark:text-green-500 mt-1">Must still attend at least <strong>{result.mustAttend}</strong> of {result.futureClasses}</div>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">😬</div>
                <div className="font-bold text-red-700 dark:text-red-400">Cannot skip any classes</div>
                <div className="text-sm text-red-600/80 mt-1">Attend all {result.futureClasses} to stay ≥75%</div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="font-bold text-lg text-gray-800 dark:text-white">{result.newPctIfAttendAll}%</div>
              <div className="text-xs text-gray-500 mt-0.5">If you attend ALL</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="font-bold text-lg text-red-600">{result.newPctIfSkipAll}%</div>
              <div className="text-xs text-gray-500 mt-0.5">If you skip ALL</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TOOL 4 — Class Counter (was Date Range, now last + renamed)
// ═══════════════════════════════════════════════════════════════════
function ClassCounterTool({ timetable, globalHolidays }) {
  const [start, setStart]       = useState('');
  const [end, setEnd]           = useState('');
  const [holidays, setHolidays] = useState([]);
  const [result, setResult]     = useState(null);

  const allExclusions = [...buildExclusions(globalHolidays), ...buildExclusions(holidays)];

  const calculate = () => {
    if (!start || !end || !timetable) return;
    const workingDays  = getWorkingDays(start, end, timetable, allExclusions);
    const totalClasses = getTotalClasses(workingDays, timetable);
    const bySubject    = getClassesPerSubject(workingDays, timetable);
    setResult({ totalClasses, workingDays: workingDays.length, bySubject });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Start Date" type="date" value={start} onChange={e => setStart(e.target.value)} />
        <Input label="End Date"   type="date" value={end}   onChange={e => setEnd(e.target.value)} />
      </div>

      <ExclusionList
        title="Holidays / Days Off in this range"
        icon="🏖️"
        items={holidays}
        onAdd={h => setHolidays(p => [...p, h])}
        onRemove={i => setHolidays(p => p.filter((_, idx) => idx !== i))}
        colorClass="text-orange-600"
        bgClass="bg-orange-50 dark:bg-orange-900/10"
        borderClass="border-orange-200 dark:border-orange-800"
      />

      {globalHolidays.length > 0 && (
        <div className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          {globalHolidays.length} global holiday(s) from dashboard are also excluded.
        </div>
      )}

      <Button onClick={calculate} disabled={!start || !end} size="lg" className="w-full">
        Count Classes <ArrowRight className="w-4 h-4" />
      </Button>

      {result && (
        <div className="space-y-4 animate-fade-in pt-2">
          {/* Big count result */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-center">
            <div className="font-display font-extrabold text-5xl text-blue-600 dark:text-blue-400 mb-1">
              {result.totalClasses}
            </div>
            <div className="font-semibold text-blue-700 dark:text-blue-300">Total Classes</div>
            <div className="text-sm text-blue-600/70 dark:text-blue-400/70 mt-1">
              across {result.workingDays} working days
            </div>
          </div>

          {/* Subject breakdown */}
          {Object.keys(result.bySubject).length > 0 && (
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Breakdown by Subject</div>
              <div className="space-y-2">
                {Object.entries(result.bySubject)
                  .sort(([, a], [, b]) => b - a)
                  .map(([sub, count]) => (
                    <div key={sub} className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">{sub}</span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{count} classes</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main Calculator Page
// ═══════════════════════════════════════════════════════════════════
function CalculatorContent() {
  const searchParams = useSearchParams();
  const [activeTool, setActiveTool] = useState(searchParams.get('tool') || 'projection');
  const { timetable, semesterStart, holidays: globalHolidays } = useApp();

  useEffect(() => {
    const t = searchParams.get('tool');
    if (t) setActiveTool(t);
  }, [searchParams]);

  const tool = TOOLS.find(t => t.id === activeTool);

  if (!timetable) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h3 className="font-display font-bold text-xl text-gray-800 dark:text-white mb-2">Timetable Required</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm">
          Set up your timetable first — it's used to count classes in each period.
        </p>
        <a href="/setup"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md">
          Set Up Timetable →
        </a>
      </div>
    );
  }

  return (
    <div>
      {/* Tool tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => setActiveTool(t.id)}
            className={clsx(
              'flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 text-center',
              activeTool === t.id
                ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                : 'border-transparent bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700 shadow-card'
            )}>
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', t.bg)}>
              <t.icon className={clsx('w-5 h-5', t.color)} />
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-tight">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Active tool */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-gray-800">
          {tool && (
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', tool.bg)}>
              <tool.icon className={clsx('w-5 h-5', tool.color)} />
            </div>
          )}
          <div>
            <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">{tool?.label}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{tool?.desc}</p>
          </div>
        </div>

        {activeTool === 'projection'  && <ProjectionTool  timetable={timetable} semesterStart={semesterStart} globalHolidays={globalHolidays} />}
        {activeTool === 'absence'     && <AbsenceTool     timetable={timetable} semesterStart={semesterStart} globalHolidays={globalHolidays} />}
        {activeTool === 'skip'        && <SkipPlannerTool timetable={timetable} semesterStart={semesterStart} globalHolidays={globalHolidays} />}
        {activeTool === 'class-count' && <ClassCounterTool timetable={timetable} globalHolidays={globalHolidays} />}
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white">Attendance Calculators</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Smart tools to plan and project your attendance</p>
      </div>
      <Suspense fallback={<div className="animate-pulse h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl" />}>
        <CalculatorContent />
      </Suspense>
    </AppLayout>
  );
}
