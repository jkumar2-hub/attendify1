'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, RadialBarChart, RadialBar
} from 'recharts';

const COLORS = ['#22c55e', '#16a34a', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'];
const STATUS_COLORS = { safe: '#22c55e', risk: '#eab308', critical: '#ef4444' };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg px-4 py-3">
        {label && <div className="text-xs font-semibold text-gray-500 mb-1">{label}</div>}
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              {p.name}: <span className="font-bold">{p.value}{p.unit || ''}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function SubjectAttendanceBar({ subjectStats }) {
  const data = (subjectStats || []).map(s => ({
    name: s.subject.length > 12 ? s.subject.slice(0, 12) + '…' : s.subject,
    fullName: s.subject,
    Attendance: s.percentage,
    Target: 75,
    fill: STATUS_COLORS[s.status],
  }));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-card">
      <div className="font-display font-bold text-base text-gray-800 dark:text-white mb-4">Subject Attendance Comparison</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} unit="%" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Attendance" radius={[6, 6, 0, 0]} unit="%">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
          {/* 75% reference line */}
          <Bar dataKey="Target" fill="transparent" radius={[6, 6, 0, 0]} unit="%" opacity={0} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 justify-center mt-2">
        {['safe', 'risk', 'critical'].map(s => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }} />
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PresentAbsentPie({ totalAttended, totalClasses }) {
  const missed = totalClasses - totalAttended;
  const data = [
    { name: 'Present', value: totalAttended },
    { name: 'Absent', value: missed },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-card">
      <div className="font-display font-bold text-base text-gray-800 dark:text-white mb-4">Present vs Absent</div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            <Cell fill="#22c55e" />
            <Cell fill="#fee2e2" />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v) => <span className="text-xs text-gray-600 dark:text-gray-400">{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AttendanceTrendLine({ subjectStats }) {
  // Simulated trend data based on subjects
  const data = (subjectStats || []).map((s, i) => ({
    name: s.subject.slice(0, 8),
    percentage: s.percentage,
    target: 75,
  }));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-card">
      <div className="font-display font-bold text-base text-gray-800 dark:text-white mb-4">Attendance Overview</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} unit="%" />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="percentage" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: '#22c55e' }} name="Attendance" unit="%" />
          <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Target" unit="%" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
