'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calculator, Settings, LogOut, GraduationCap, Sun, Moon, ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { clsx } from 'clsx';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/calculator', icon: Calculator, label: 'Calculator' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, preferences, setTheme } = useApp();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 z-30">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md shadow-green-500/20">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-display font-bold text-gray-900 dark:text-white text-lg">Attendify</span>
          <div className="text-[10px] text-green-500 font-semibold uppercase tracking-wider -mt-0.5">Attendance Planner</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                active
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200'
              )}>
              <Icon className={clsx('w-5 h-5 flex-shrink-0', active ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300')} />
              <span>{label}</span>
              {active && <ChevronRight className="w-4 h-4 ml-auto text-green-500" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 space-y-2 border-t border-gray-100 dark:border-gray-800">
        <button onClick={() => setTheme(preferences.theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
          {preferences.theme === 'dark'
            ? <><Sun className="w-5 h-5 text-yellow-500" /><span>Light Mode</span></>
            : <><Moon className="w-5 h-5 text-indigo-400" /><span>Dark Mode</span></>}
        </button>

        {user && (
          <div className="glass rounded-xl px-3 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user.name}</div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
