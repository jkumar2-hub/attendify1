'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Eye, EyeOff, ArrowLeft, User, Mail, Lock, CheckCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button, Input } from '@/components/ui';

const perks = [
  'Track attendance for all subjects',
  'Smart skip calculator included',
  'Free forever, no ads',
];

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useApp();
  const router = useRouter();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    
    const result = signup(form.name, form.email, form.password);
    setLoading(false);
    
    if (result.error) {
      setErrors({ general: result.error });
    } else {
      router.push('/setup');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-green-950/20 flex items-center justify-center p-4">
      <Link href="/" className="fixed top-6 left-6 flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl shadow-green-500/30 mb-4">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white">Create your account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Start tracking attendance in 2 minutes</p>
        </div>

        {/* Perks */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {perks.map(p => (
            <div key={p} className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
              <CheckCircle className="w-3 h-3" />
              {p}
            </div>
          ))}
        </div>

        <div className="glass rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl">
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-5 text-sm text-red-600 dark:text-red-400">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Riya Sharma"
              value={form.name}
              onChange={e => setForm(p => ({...p, name: e.target.value}))}
              error={errors.name}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="you@college.edu"
              value={form.email}
              onChange={e => setForm(p => ({...p, email: e.target.value}))}
              error={errors.email}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm(p => ({...p, password: e.target.value}))}
                  className={`input-field pr-11 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
            </div>
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={e => setForm(p => ({...p, confirm: e.target.value}))}
              error={errors.confirm}
            />

            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              Create Account & Continue →
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-green-600 dark:text-green-400 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
