'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button, Input } from '@/components/ui';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, setupDone, addToast } = useApp();
  const router = useRouter();

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 500)); // smooth UX delay
    
    const result = login(form.email, form.password);
    setLoading(false);
    
    if (result.error) {
      setErrors({ general: result.error });
    } else {
      router.push(setupDone ? '/dashboard' : '/setup');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-green-950/20 flex items-center justify-center p-4">
      {/* Back link */}
      <Link href="/" className="fixed top-6 left-6 flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl shadow-green-500/30 mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white">Welcome back!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Login to your Attendify account</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-5 text-sm text-red-600 dark:text-red-400">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 mt-3" />
              <div className="pt-6">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  error={errors.email}
                />
              </div>
            </div>

            <div className="relative">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(p => ({...p, password: e.target.value}))}
                    className={`input-field pr-11 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={e => setForm(p => ({...p, remember: e.target.checked}))}
                  className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-400 cursor-pointer"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <button type="button" className="text-sm text-green-600 dark:text-green-400 hover:underline">Forgot password?</button>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Login to Attendify
            </Button>
          </form>

          {/* Demo login */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-400">
            <strong>Demo:</strong> No account? <Link href="/signup" className="underline">Create one</Link> — or use any credentials after signing up (stored locally).
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-green-600 dark:text-green-400 font-semibold hover:underline">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
