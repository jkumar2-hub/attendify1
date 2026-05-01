// lib/storage.js — per-user scoped localStorage

function safeGet(key) {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

function safeSet(key, value) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function safeRemove(key) {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(key); } catch {}
}

// ── Per-user key builder ──────────────────────────────────────────
// All user data is scoped to their email so switching accounts
// never leaks one user's data into another's session.
function userKey(email, suffix) {
  return `attendify_${email}_${suffix}`;
}

// ── User-scoped storage ───────────────────────────────────────────
export const storage = {
  // Active session (not scoped — just who is currently logged in)
  getUser: () => safeGet('attendify_session'),
  setUser: (user) => safeSet('attendify_session', user),
  removeUser: () => safeRemove('attendify_session'),

  // All the below are scoped by email
  getTimetable: (email) => safeGet(userKey(email, 'timetable')),
  setTimetable: (email, tt) => safeSet(userKey(email, 'timetable'), tt),

  getSemesterStart: (email) => safeGet(userKey(email, 'semesterStart')),
  setSemesterStart: (email, date) => safeSet(userKey(email, 'semesterStart'), date),

  getHolidays: (email) => safeGet(userKey(email, 'holidays')) || [],
  setHolidays: (email, h) => safeSet(userKey(email, 'holidays'), h),

  getPreferences: (email) => safeGet(userKey(email, 'preferences')) || { theme: 'light' },
  setPreferences: (email, prefs) => safeSet(userKey(email, 'preferences'), prefs),

  isSetupDone: (email) => !!safeGet(userKey(email, 'setupDone')),
  setSetupDone: (email, val = true) => safeSet(userKey(email, 'setupDone'), val),

  // Clear only this user's data (not other users' data, not accounts list)
  clearUserData: (email) => {
    ['timetable', 'semesterStart', 'holidays', 'preferences', 'setupDone'].forEach(suffix => {
      safeRemove(userKey(email, suffix));
    });
    safeRemove('attendify_session');
  },

  // Export this user's data
  exportData: (email) => ({
    timetable:     safeGet(userKey(email, 'timetable')),
    semesterStart: safeGet(userKey(email, 'semesterStart')),
    holidays:      safeGet(userKey(email, 'holidays')),
    preferences:   safeGet(userKey(email, 'preferences')),
  }),
};

// ── Auth (accounts stored globally, data stored per-user) ─────────
export const auth = {
  signup: (name, email, password) => {
    const accounts = safeGet('attendify_accounts') || {};
    if (accounts[email]) return { error: 'Email already registered' };
    accounts[email] = { name, email, password, createdAt: new Date().toISOString() };
    safeSet('attendify_accounts', accounts);
    const user = { name, email, createdAt: new Date().toISOString() };
    safeSet('attendify_session', user);
    return { user };
  },

  login: (email, password) => {
    const accounts = safeGet('attendify_accounts') || {};
    const account = accounts[email];
    if (!account) return { error: 'No account found with this email' };
    if (account.password !== password) return { error: 'Incorrect password' };
    const user = { name: account.name, email, createdAt: account.createdAt };
    safeSet('attendify_session', user);
    return { user };
  },

  logout: () => safeRemove('attendify_session'),

  getSession: () => safeGet('attendify_session'),
};
