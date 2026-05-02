'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage, auth } from '@/lib/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [timetable, setTimetableState] = useState(null);
  const [semesterStart, setSemesterStartState] = useState(null);
  const [holidays, setHolidaysState] = useState([]);
  const [preferences, setPreferencesState] = useState({ theme: 'light' });
  const [setupDone, setSetupDoneState] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Load all data for a given user email ──────────────────
  const loadUserData = useCallback((email) => {
    setTimetableState(storage.getTimetable(email));
    setSemesterStartState(storage.getSemesterStart(email));
    setHolidaysState(storage.getHolidays(email));
    setPreferencesState(storage.getPreferences(email));
    setSetupDoneState(storage.isSetupDone(email));
  }, []);

  // ── On mount: restore session + load global theme ────────
  useEffect(() => {
    // Theme is stored globally so it works on landing page without login
    const savedTheme = localStorage.getItem('attendify_theme') || 'light';
    setPreferencesState({ theme: savedTheme });

    const u = storage.getUser();
    if (u) {
      setUser(u);
      loadUserData(u.email);
      // Override with per-user saved theme preference if it exists
      const userPrefs = storage.getPreferences(u.email);
      if (userPrefs?.theme) {
        setPreferencesState({ theme: userPrefs.theme });
        localStorage.setItem('attendify_theme', userPrefs.theme);
      }
    }
    setLoading(false);
  }, [loadUserData]);

  // ── Apply theme whenever preferences change ──────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
  }, [preferences.theme]);

  // ── Toasts ────────────────────────────────────────────────
  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ── Auth ──────────────────────────────────────────────────
  const login = useCallback((email, password) => {
    const result = auth.login(email, password);
    if (result.user) {
      setUser(result.user);
      loadUserData(result.user.email); // load THIS user's data
      addToast(`Welcome back, ${result.user.name}! 👋`);
    }
    return result;
  }, [addToast, loadUserData]);

  const signup = useCallback((name, email, password) => {
    const result = auth.signup(name, email, password);
    if (result.user) {
      setUser(result.user);
      // New user — start with clean slate
      setTimetableState(null);
      setSemesterStartState(null);
      setHolidaysState([]);
      setPreferencesState({ theme: 'light' });
      setSetupDoneState(false);
      addToast(`Welcome to Attendify, ${name}! 🎉`);
    }
    return result;
  }, [addToast]);

  const logout = useCallback(() => {
    auth.logout();
    setUser(null);
    setTimetableState(null);
    setSemesterStartState(null);
    setHolidaysState([]);
    setPreferencesState({ theme: 'light' });
    setSetupDoneState(false);
    addToast('Logged out successfully', 'info');
  }, [addToast]);

  // ── Per-user data setters ─────────────────────────────────
  const setTimetable = useCallback((tt) => {
    if (!user) return;
    storage.setTimetable(user.email, tt);
    setTimetableState(tt);
  }, [user]);

  const setSemesterStart = useCallback((date) => {
    if (!user) return;
    storage.setSemesterStart(user.email, date);
    setSemesterStartState(date);
  }, [user]);

  const setHolidays = useCallback((hols) => {
    if (!user) return;
    storage.setHolidays(user.email, hols);
    setHolidaysState(hols);
  }, [user]);

  const addHoliday = useCallback((holiday) => {
    if (!user) return;
    const updated = [...holidays, holiday];
    storage.setHolidays(user.email, updated);
    setHolidaysState(updated);
    addToast('Holiday added!');
  }, [user, holidays, addToast]);

  const removeHoliday = useCallback((index) => {
    if (!user) return;
    const updated = holidays.filter((_, i) => i !== index);
    storage.setHolidays(user.email, updated);
    setHolidaysState(updated);
    addToast('Holiday removed', 'info');
  }, [user, holidays, addToast]);

  const setTheme = useCallback((theme) => {
    // Save theme globally (works on landing page even before login)
    localStorage.setItem('attendify_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    setPreferencesState({ theme });
    // Also save to per-user prefs if logged in
    if (user) {
      const updated = { ...preferences, theme };
      storage.setPreferences(user.email, updated);
    }
  }, [user, preferences]);

  const completeSetup = useCallback((timetableData, semesterDate) => {
    if (!user) return;
    storage.setTimetable(user.email, timetableData);
    storage.setSemesterStart(user.email, semesterDate);
    storage.setSetupDone(user.email, true);
    setTimetableState(timetableData);
    setSemesterStartState(semesterDate);
    setSetupDoneState(true);
    addToast('Setup complete! Welcome to your dashboard 🚀');
  }, [user, addToast]);

  const resetData = useCallback(() => {
    if (!user) return;
    // Only clear timetable/holidays/semester — keep account
    storage.clearUserData(user.email); // clears data keys but not account
    // Restore session (clearUserData removes the session too, re-set it)
    storage.setUser(user);
    setTimetableState(null);
    setSemesterStartState(null);
    setHolidaysState([]);
    setSetupDoneState(false);
    addToast('Timetable and holidays cleared', 'info');
  }, [user, addToast]);


  const deleteAccount = useCallback(() => {
    if (!user) return;
    // Remove this user's data
    storage.clearUserData(user.email);
    // Remove from accounts registry
    const accounts = JSON.parse(localStorage.getItem('attendify_accounts') || '{}');
    delete accounts[user.email];
    localStorage.setItem('attendify_accounts', JSON.stringify(accounts));
    // Clear state
    setUser(null);
    setTimetableState(null);
    setSemesterStartState(null);
    setHolidaysState([]);
    setSetupDoneState(false);
    addToast('Account deleted', 'info');
  }, [user, addToast]);

  const exportData = useCallback(() => {
    if (!user) return;
    const data = storage.exportData(user.email);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendify-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    addToast('Data exported!');
  }, [user, addToast]);

  const value = {
    user, timetable, semesterStart, holidays, preferences, setupDone, toasts, loading,
    login, signup, logout,
    setTimetable, setSemesterStart, setHolidays, addHoliday, removeHoliday,
    setTheme, completeSetup, resetData, deleteAccount, exportData,
    addToast, removeToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
