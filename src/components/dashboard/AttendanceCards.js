'use client';
import { TrendingUp, Calendar, AlertTriangle, CheckCircle, BookOpen, Trophy } from 'lucide-react';
import { ProgressRing } from '@/components/ui';
import { clsx } from 'clsx';

function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub, trend, className }) {
  return (
    <div className={clsx('bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-card card-hover', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon className={clsx('w-5 h-5', iconColor)} />
        </div>
        {trend !== undefined && (
          <span className={clsx(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-0.5 animate-count">{value}</div>
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

export function DashboardTopCards({ stats }) {
  if (!stats) return null;
  const { overallPercent, safeLeavesLeft, classesNeeded, totalClasses, totalAttended } = stats;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Overall % with ring */}
      <div className="col-span-2 sm:col-span-1 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-card card-hover flex items-center gap-5">
        <ProgressRing percentage={overallPercent} size={72} strokeWidth={7} />
        <div>
          <div className="font-display font-bold text-xl text-gray-900 dark:text-white">{overallPercent}%</div>
          <div className="text-sm font-medium text-gray-500">Overall Attendance</div>
          <div className={clsx(
            'text-xs font-semibold mt-1 px-2 py-0.5 rounded-full inline-block',
            overallPercent >= 75 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : overallPercent >= 65 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
          )}>
            {overallPercent >= 75 ? '✓ Safe Zone' : overallPercent >= 65 ? '⚠ At Risk' : '✗ Critical'}
          </div>
        </div>
      </div>

      <StatCard
        icon={CheckCircle}
        iconBg={safeLeavesLeft > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}
        iconColor={safeLeavesLeft > 0 ? 'text-green-600' : 'text-red-500'}
        label="Safe Leaves Left"
        value={safeLeavesLeft}
        sub={safeLeavesLeft === 0 ? "Don't skip any class!" : `You can skip ${safeLeavesLeft} more`}
      />

      <StatCard
        icon={AlertTriangle}
        iconBg="bg-orange-100 dark:bg-orange-900/30"
        iconColor="text-orange-500"
        label={classesNeeded > 0 ? "Classes Needed" : "Above Target!"}
        value={classesNeeded > 0 ? classesNeeded : '🎉'}
        sub={classesNeeded > 0 ? "to reach 75%" : "Keep it up!"}
      />

      <StatCard
        icon={BookOpen}
        iconBg="bg-blue-100 dark:bg-blue-900/30"
        iconColor="text-blue-500"
        label="Total Classes"
        value={totalClasses}
        sub={`${totalAttended} attended · ${totalClasses - totalAttended} missed`}
      />
    </div>
  );
}

export function SubjectCard({ subjectStat, onClick }) {
  const { subject, percentage, attended, total, missed, status, safeLeavesLeft, classesNeeded } = subjectStat;
  
  const barColor = percentage >= 75 ? 'bg-green-500' : percentage >= 65 ? 'bg-yellow-500' : 'bg-red-500';
  const statusColors = {
    safe: 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
    risk: 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
    critical: 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div 
      className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-card card-hover cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-display font-bold text-sm text-gray-900 dark:text-white">{subject}</div>
          <div className="text-xs text-gray-500 mt-0.5">{total} total classes</div>
        </div>
        <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold', statusColors[status])}>
          {status === 'safe' ? '✓ Safe' : status === 'risk' ? '⚠ Risk' : '✗ Critical'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{attended} attended</span>
          <span className="font-bold text-gray-800 dark:text-white">{percentage}%</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all duration-700', barColor)}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg py-1.5">
          <div className="text-xs font-bold text-gray-800 dark:text-white">{attended}</div>
          <div className="text-[10px] text-gray-500">Present</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg py-1.5">
          <div className="text-xs font-bold text-gray-800 dark:text-white">{missed}</div>
          <div className="text-[10px] text-gray-500">Absent</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg py-1.5">
          <div className="text-xs font-bold text-green-600 dark:text-green-400">{safeLeavesLeft}</div>
          <div className="text-[10px] text-gray-500">Can Skip</div>
        </div>
      </div>
    </div>
  );
}
