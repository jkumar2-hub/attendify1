'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calculator, Settings } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { clsx } from 'clsx';

const titles = {
  '/dashboard': 'Dashboard',
  '/calculator': 'Calculator',
  '/settings': 'Settings',
  '/setup': 'Setup',
};

export function Navbar() {
  const pathname = usePathname();
  const { user } = useApp();
  const title = titles[pathname] || 'Attendify';

  return (
    <header className="lg:ml-64 fixed top-0 right-0 left-0 h-16 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-20 flex items-center px-4 lg:px-8 gap-4">
      <div className="flex-1">
        <h1 className="font-display font-bold text-gray-900 dark:text-white hidden lg:block">{title}</h1>
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="font-display font-bold text-gray-900 dark:text-white">Attendify</span>
        </div>
      </div>
      {user && (
        <Link href="/settings">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow cursor-pointer hover:shadow-lg transition-all">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        </Link>
      )}
    </header>
  );
}

const mobileNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/calculator', icon: Calculator, label: 'Calc' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 pb-safe">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={clsx(
                'flex flex-col items-center gap-0.5 px-6 py-1 rounded-xl transition-all duration-200',
                active ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
              )}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
