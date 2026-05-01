'use client';
import Sidebar from './Sidebar';
import { Navbar, BottomNav } from './Navbar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <Navbar />
      <main className="lg:ml-64 pt-16 pb-20 lg:pb-8 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
