'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  GraduationCap, Upload, Calculator, Calendar, Shield,
  ChevronDown, ArrowRight, Moon, Sun, TrendingUp, Zap,
  AlertTriangle, Hash, CheckCircle
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

function FloatingOrb({ size, color, top, left, delay = 0 }) {
  return (
    <div className="absolute rounded-full blur-3xl opacity-25 animate-float pointer-events-none"
      style={{ width: size, height: size, background: color, top, left, animationDelay: `${delay}s` }} />
  );
}

const features = [
  {
    icon: Upload, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20',
    title: 'Upload Your Timetable',
    desc: 'Take a photo of your college timetable. Our OCR reads the subjects, days and periods automatically — or enter it manually.'
  },
  {
    icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20',
    title: 'Projection Calculator',
    desc: 'Enter your current attendance %, a future date range, planned absences — and instantly see what your % will be.'
  },
  {
    icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20',
    title: 'Absence Planner',
    desc: 'Planning to skip a few days? See exactly how much your attendance drops — before it happens.'
  },
  {
    icon: Zap, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20',
    title: 'Skip Planner',
    desc: 'Know the maximum number of classes you can skip in any future period while still staying at or above 75%.'
  },
  {
    icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20',
    title: 'Holiday Support',
    desc: 'Add single holidays or date ranges like Diwali break. All calculators exclude them automatically.'
  },
  {
    icon: Hash, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    title: 'Class Counter',
    desc: 'Pick any date range and instantly see how many classes fall in it — broken down by subject.'
  },
];

const tools = [
  { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', name: 'Projection', desc: 'Projected % after a future period' },
  { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', name: 'Absence Planner', desc: 'Impact of planned absences' },
  { icon: Zap, color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/30', name: 'Skip Planner', desc: 'Max classes you can skip' },
  { icon: Hash, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', name: 'Class Counter', desc: 'Count classes in a date range' },
];

const faqs = [
  { q: 'How does the timetable upload work?', a: 'You upload a JPG or PNG photo of your college timetable. Our OCR reads subjects, days and periods automatically. You can then review and correct any mistakes in an editable grid before saving.' },
  { q: 'Do I need to manually enter my attendance every day?', a: 'No! Attendify is a pure calculator — not a tracker. You just tell it your current attendance % (from your college portal) and it does all the maths for you. No daily logging required.' },
  { q: 'What is the 75% attendance rule?', a: 'Most Indian colleges require at least 75% attendance to sit exams. Attendify helps you plan around this threshold — projecting your % and telling you exactly how much you can skip.' },
  { q: 'Can I add holidays and semester breaks?', a: 'Yes! Add single holidays or full date ranges (like Diwali, Pongal, mid-sem break). They are automatically excluded from class counts in every calculator tool.' },
  { q: 'How does the Projection tool work?', a: 'Enter your current % from the college portal, pick a future date range, add any holidays or days you plan to skip — and it shows you what your attendance will be at the end of that period.' },
  { q: 'Is my data private?', a: 'Yes. All data is stored locally on your device. Nothing is sent to any server. Each account\'s data is completely separate — creating a new account starts with a clean slate.' },
];

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <button className="w-full flex items-center justify-between px-6 py-4 text-left" onClick={onToggle}>
        <span className="font-semibold text-gray-800 dark:text-white text-sm pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const { preferences, setTheme } = useApp();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">

      {/* ── Navbar ───────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md shadow-green-500/30">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-gray-900 dark:text-white text-lg">Attendify</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setTheme(preferences.theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all">
              {preferences.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/login" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors px-3 py-1.5">Login</Link>
            <Link href="/signup" className="text-sm font-semibold bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-green-500/25">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <FloatingOrb size="500px" color="linear-gradient(135deg,#22c55e,#4ade80)" top="-120px" left="-100px" delay={0} />
        <FloatingOrb size="350px" color="linear-gradient(135deg,#3b82f6,#22c55e)" top="80px" left="65%" delay={2} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-4 py-2 rounded-full text-sm font-semibold text-green-700 dark:text-green-400 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Smart Attendance Calculator for College Students
          </div>

          <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-gray-900 dark:text-white leading-tight mb-6">
            Plan Your Attendance.{' '}
            <span className="gradient-text">Skip Smart.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            Upload your timetable once. Then use 4 powerful calculator tools to project your attendance, plan absences, and know exactly how many classes you can skip — while staying safely above 75%.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-10">
            No daily tracking. No manual logging. Just enter your current % and calculate.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-green-500/25 hover:-translate-y-0.5 text-base">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login"
              className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-8 py-4 rounded-2xl transition-all hover:-translate-y-0.5 text-base shadow-card">
              Login to Account
            </Link>
          </div>

          {/* Dashboard mockup */}
          <div className="relative mx-auto max-w-3xl">
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-3xl p-4 border border-gray-200 dark:border-gray-700 shadow-2xl">
              <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm font-display font-bold text-gray-700 dark:text-gray-300">Attendance Calculators</span>
                  <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full font-semibold">4 Tools</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {tools.map(t => (
                    <div key={t.name} className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 text-center">
                      <div className={`w-8 h-8 rounded-lg ${t.bg} flex items-center justify-center mx-auto mb-2`}>
                        <t.icon className={`w-4 h-4 ${t.color}`} />
                      </div>
                      <div className="text-xs font-bold text-gray-800 dark:text-white">{t.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{t.desc}</div>
                    </div>
                  ))}
                </div>
                {/* Mini projection preview */}
                <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Projection result</div>
                    <div className="text-sm font-bold text-gray-800 dark:text-white">Current: 72% → Projected: <span className="text-green-600">78.4%</span></div>
                    <div className="text-xs text-green-600 font-semibold mt-0.5">✓ You can skip 3 more classes safely</div>
                  </div>
                  <div className="text-3xl">🎉</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gradient-to-br from-green-50 to-white dark:from-green-950/10 dark:to-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-extrabold text-4xl text-gray-900 dark:text-white mb-4">How it works</h2>
            <p className="text-gray-500 dark:text-gray-400">Three simple steps — takes under 5 minutes</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { n: '1', icon: Upload, title: 'Upload Your Timetable', desc: 'Photo or manual entry. OCR reads your subjects and schedule automatically. Fix any mistakes in the live grid.' },
              { n: '2', icon: Calendar, title: 'Set Your Semester Date', desc: 'Tell us when your semester started. That\'s all the setup you need — no daily logging ever.' },
              { n: '3', icon: Calculator, title: 'Use the Calculators', desc: 'Enter your current % from college portal. Pick any future dates. Instantly see projections, skip limits, and impact of absences.' },
            ].map(step => (
              <div key={step.n} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-display font-extrabold text-2xl mx-auto mb-5 shadow-lg shadow-green-500/25">
                  {step.n}
                </div>
                <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The 4 Tools ──────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">4 Calculator Tools</div>
            <h2 className="font-display font-extrabold text-4xl text-gray-900 dark:text-white mb-4">Everything you need to plan smarter</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">No tracking, no logging — just smart calculations from your current attendance %.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-card card-hover">
                <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-display font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Key differentiator ────────────────────────────────── */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-extrabold text-3xl text-gray-900 dark:text-white mb-8">Why Attendify is different</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {[
              { yes: 'Enter current % once, get instant results', no: 'No daily attendance logging' },
              { yes: 'Works with your college portal %', no: 'No manual class-by-class entry' },
              { yes: 'Holiday-aware calculations', no: 'No server, no tracking, no ads' },
              { yes: 'Separate data per account', no: 'No subscriptions — free forever' },
            ].map((row, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 font-semibold">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />{row.yes}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                  <span className="w-4 h-4 flex-shrink-0 text-center text-xs">✗</span>{row.no}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-extrabold text-4xl text-gray-900 dark:text-white mb-4">FAQ</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-12 shadow-2xl shadow-green-500/25 text-white">
            <div className="text-5xl mb-4">🎓</div>
            <h2 className="font-display font-extrabold text-3xl mb-4">Stop guessing. Start planning.</h2>
            <p className="text-green-100 mb-8 max-w-md mx-auto">Join students who plan their attendance the smart way — no logs, no stress, just maths.</p>
            <Link href="/signup"
              className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-8 py-3.5 rounded-2xl hover:bg-green-50 transition-all shadow-lg">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-gray-700 dark:text-gray-300">Attendify</span>
          </div>
          <span>© 2026 Attendify · All data stored locally · No server · No ads</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-green-600 transition-colors">Login</Link>
            <Link href="/signup" className="hover:text-green-600 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
