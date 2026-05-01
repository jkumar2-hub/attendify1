'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Camera, Edit2, CheckCircle, Loader, AlertCircle, ArrowRight, Calendar, GraduationCap, RotateCcw, ArrowLeft } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button, Input } from '@/components/ui';
import { TimetableEditor } from '@/components/dashboard/TimetableGrid';
import { extractTextFromImage, extractTimetableTable, createEmptyTimetable } from '@/lib/ocr';

const STEPS = ['Upload / Manual', 'Review & Edit', 'Semester Date'];

export default function SetupPage() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState(null);       // 'upload' | 'manual'
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrError, setOcrError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [timetable, setTimetable] = useState(null);
  const [semesterStart, setSemStart] = useState('');
  const fileRef = useRef();
  const { completeSetup, user } = useApp();
  const router = useRouter();

  if (!user) {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }

  // ── Reset back to upload step ──────────────────────────────
  const handleReupload = () => {
    setStep(0);
    setMode(null);
    setOcrError('');
    setPreviewUrl('');
    setTimetable(null);
    setOcrProgress(0);
    // Small delay then trigger file picker
    setTimeout(() => fileRef.current?.click(), 100);
  };

  // ── OCR upload handler ─────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Reset file input so same file can be re-selected
    e.target.value = '';

    setOcrError('');
    setPreviewUrl(URL.createObjectURL(file));
    setOcrLoading(true);
    setOcrProgress(0);
    setMode('upload');

    try {
      const { text } = await extractTextFromImage(file, setOcrProgress);
      const parsed = extractTimetableTable(text);

      if (Object.keys(parsed).length === 0) {
        setOcrError('Could not auto-detect subjects. The grid is ready for you to fill in manually.');
        setTimetable(createEmptyTimetable());
      } else {
        setTimetable(parsed);
      }
      setStep(1);
    } catch (err) {
      setOcrError('OCR failed. Please fill in the timetable manually below.');
      setTimetable(createEmptyTimetable());
      setStep(1);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleManualMode = () => {
    setTimetable(createEmptyTimetable());
    setMode('manual');
    setStep(1);
  };

  const handleTimetableSave = (tt) => {
    setTimetable(tt);
    setStep(2);
  };

  const handleFinish = () => {
    if (!semesterStart) return;
    completeSetup(timetable, semesterStart);
    router.push('/dashboard');
  };

  // ── Step indicator ─────────────────────────────────────────
  const StepBar = () => (
    <div className="flex items-center gap-2 mb-10 justify-center">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
            i < step  ? 'bg-green-500 text-white' :
            i === step ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 ring-2 ring-green-400' :
            'bg-gray-100 dark:bg-gray-800 text-gray-400'
          }`}>
            {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          <span className={`text-xs font-semibold hidden sm:block ${i === step ? 'text-green-700 dark:text-green-400' : 'text-gray-400'}`}>{label}</span>
          {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-8 px-4">
      {/* Hidden file input — always in DOM so ref always works */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg mx-auto mb-4">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display font-extrabold text-3xl text-gray-900 dark:text-white">Set Up Your Timetable</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">One-time setup · takes about 3 minutes</p>
        </div>

        <StepBar />

        {/* ════════ STEP 0: Upload or Manual ════════ */}
        {step === 0 && (
          <div className="space-y-6">
            {/* Upload card */}
            <div
              onClick={() => fileRef.current?.click()}
              className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-green-300 dark:border-green-700 p-10 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-display font-bold text-lg text-gray-800 dark:text-white mb-2">Upload Timetable Image</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-sm mx-auto">
                Take a photo or screenshot of your printed / digital timetable. OCR will auto-detect subjects and days.
              </p>
              <div className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-green-500/25">
                <Camera className="w-4 h-4" /> Choose Image
              </div>
            </div>

            {/* Loading state */}
            {ocrLoading && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Loader className="w-5 h-5 text-green-500 animate-spin" />
                  <span className="font-semibold text-gray-800 dark:text-white">Reading your timetable…</span>
                </div>
                {previewUrl && (
                  <img src={previewUrl} alt="Uploaded" className="w-full max-h-48 object-contain rounded-xl mb-4 bg-gray-50 dark:bg-gray-800" />
                )}
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
                </div>
                <div className="text-right text-xs text-gray-500 mt-1">{ocrProgress}%</div>
              </div>
            )}

            {/* Divider + Manual entry */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-sm text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="text-center">
                <button onClick={handleManualMode}
                  className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                  <Edit2 className="w-4 h-4 text-gray-400" /> Enter Timetable Manually
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════ STEP 1: Review / Edit Timetable ════════ */}
        {step === 1 && timetable && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-card">

            {/* Header row with back/reupload */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <Edit2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-display font-bold text-lg text-gray-800 dark:text-white">
                    {mode === 'manual' ? 'Enter Your Timetable' : 'Review Detected Timetable'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {mode === 'manual'
                      ? 'Fill in course IDs for each period. Leave blank for free/break periods.'
                      : 'OCR result shown below — correct any mistakes then click Save.'}
                  </p>
                </div>
              </div>

              {/* Re-upload button — only shown when OCR was used */}
              {mode === 'upload' && (
                <button
                  onClick={handleReupload}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 px-3 py-2 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Re-upload Image
                </button>
              )}
            </div>

            {/* Image preview (if uploaded) */}
            {previewUrl && mode === 'upload' && (
              <div className="mb-4 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <img src={previewUrl} alt="Uploaded timetable" className="w-full max-h-40 object-contain" />
              </div>
            )}

            {/* OCR status banners */}
            {ocrError && (
              <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-3 mb-4 text-sm text-yellow-700 dark:text-yellow-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{ocrError}</span>
              </div>
            )}
            {previewUrl && !ocrError && (
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 mb-4 text-xs text-green-700 dark:text-green-400">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                OCR complete! Review the grid below and correct any mistakes.
              </div>
            )}

            <TimetableEditor initialTimetable={timetable} onSave={handleTimetableSave} />

            {/* Go back to upload from manual */}
            {mode === 'manual' && (
              <button
                onClick={() => { setStep(0); setMode(null); }}
                className="mt-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to upload
              </button>
            )}
          </div>
        )}

        {/* ════════ STEP 2: Semester Date ════════ */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-card max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-5 h-5 text-green-500" />
              <div>
                <h2 className="font-display font-bold text-lg text-gray-800 dark:text-white">When did your semester start?</h2>
                <p className="text-xs text-gray-500 mt-0.5">Used by the Projection and Skip Planner tools</p>
              </div>
            </div>

            <div className="space-y-5">
              <Input
                label="Semester Start Date"
                type="date"
                value={semesterStart}
                onChange={e => setSemStart(e.target.value)}
                hint="The first day classes began this semester"
              />

              {semesterStart && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <div className="text-xs text-green-700 dark:text-green-400 font-semibold mb-0.5">📅 Semester start</div>
                  <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                    {new Date(semesterStart).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              )}

              <div className="pt-2 space-y-3">
                <Button onClick={handleFinish} disabled={!semesterStart} size="lg" className="w-full">
                  <CheckCircle className="w-4 h-4" /> Complete Setup & Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <button onClick={() => setStep(1)}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors py-2">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to timetable
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
