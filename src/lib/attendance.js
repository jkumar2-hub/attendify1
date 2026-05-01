// lib/attendance.js — Core attendance calculation logic

import { format, eachDayOfInterval, isWithinInterval, parseISO, differenceInDays } from 'date-fns';

const DAY_MAP = {
  0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday',
  4: 'Thursday', 5: 'Friday', 6: 'Saturday'
};

/**
 * Parse a timetable structure
 * timetable format: { Monday: ['MATH101', 'CS201', null, 'PHY301'], ... }
 */

export function getAllSubjects(timetable) {
  const subjects = new Set();
  Object.values(timetable).forEach(slots => {
    slots.forEach(s => { if (s && s.trim()) subjects.add(s.trim()); });
  });
  return [...subjects];
}

export function getSlotsPerDayForSubject(timetable, subject) {
  const result = {};
  Object.entries(timetable).forEach(([day, slots]) => {
    const count = slots.filter(s => s && s.trim() === subject.trim()).length;
    if (count > 0) result[day] = count;
  });
  return result;
}

/**
 * Check if a date is a holiday
 */
export function isHoliday(date, holidays = []) {
  const dateStr = format(date, 'yyyy-MM-dd');
  return holidays.some(h => {
    if (h.start && h.end) {
      return isWithinInterval(date, {
        start: parseISO(h.start),
        end: parseISO(h.end)
      });
    }
    return h.date === dateStr;
  });
}

/**
 * Get all working days in range (days that have timetable entries, not holidays)
 */
export function getWorkingDays(startDate, endDate, timetable, holidays = []) {
  if (!startDate || !endDate || !timetable) return [];
  
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  if (start > end) return [];
  
  const timetableDays = Object.keys(timetable).filter(
    day => timetable[day].some(s => s && s.trim())
  );
  
  const days = eachDayOfInterval({ start, end });
  return days.filter(day => {
    const dayName = DAY_MAP[day.getDay()];
    return timetableDays.includes(dayName) && !isHoliday(day, holidays);
  });
}

/**
 * Calculate total classes per subject over a set of working days
 */
export function getClassesPerSubject(workingDays, timetable) {
  const counts = {};
  workingDays.forEach(day => {
    const dayName = DAY_MAP[day.getDay()];
    const slots = timetable[dayName] || [];
    slots.forEach(subject => {
      if (subject && subject.trim()) {
        const s = subject.trim();
        counts[s] = (counts[s] || 0) + 1;
      }
    });
  });
  return counts;
}

/**
 * Get total classes (all subjects) over working days
 */
export function getTotalClasses(workingDays, timetable) {
  const bySubject = getClassesPerSubject(workingDays, timetable);
  return Object.values(bySubject).reduce((a, b) => a + b, 0);
}

/**
 * Calculate attendance percentage
 */
export function calcPercentage(attended, total) {
  if (!total || total === 0) return 0;
  return Math.round((attended / total) * 100 * 10) / 10;
}

/**
 * Get attendance status
 */
export function getStatus(percentage) {
  if (percentage >= 75) return 'safe';
  if (percentage >= 65) return 'risk';
  return 'critical';
}

export function getStatusLabel(percentage) {
  if (percentage >= 75) return 'Safe ✓';
  if (percentage >= 65) return 'At Risk ⚠';
  return 'Critical ✗';
}

/**
 * Calculate safe leaves left (classes you can skip while staying at 75%)
 * Formula: attended/total >= 0.75
 * attended/(total + future) >= 0.75
 * Max skippable now: floor((attended - 0.75*total) / 0.75)
 */
export function getSafeLeavesLeft(attended, total) {
  if (total === 0) return 0;
  const safeMisses = Math.floor((attended - 0.75 * total) / 0.75);
  return Math.max(0, safeMisses);
}

/**
 * Calculate classes needed to reach 75%
 * (attended + x) / (total + x) = 0.75
 * attended + x = 0.75*total + 0.75*x
 * 0.25*x = 0.75*total - attended
 * x = (0.75*total - attended) / 0.25 = 3*total - 4*attended
 */
export function getClassesNeeded(attended, total) {
  const needed = Math.ceil(3 * total - 4 * attended);
  return Math.max(0, needed);
}

/**
 * TOOL 1: Date Range Attendance Calculator
 * Returns total classes and subject-wise classes in a date range
 */
export function calcDateRangeClasses(startDate, endDate, timetable, holidays = []) {
  const workingDays = getWorkingDays(startDate, endDate, timetable, holidays);
  const bySubject = getClassesPerSubject(workingDays, timetable);
  const total = Object.values(bySubject).reduce((a, b) => a + b, 0);
  return { total, bySubject, workingDays: workingDays.length };
}

/**
 * TOOL 2: Current Percentage Projection
 * Given current attendance %, project future attendance after attending a range
 */
export function projectAttendance({
  semesterStart, projectionEnd, currentPercent,
  timetable, holidays = [], rangeStart, rangeEnd
}) {
  // Classes from semester start to rangeStart (already happened)
  const pastDays = getWorkingDays(semesterStart, rangeStart, timetable, holidays);
  const pastClasses = getTotalClasses(pastDays, timetable);
  const estimatedAttended = Math.round((currentPercent / 100) * pastClasses);

  // Future classes in projection range
  const futureDays = getWorkingDays(rangeStart, rangeEnd, timetable, holidays);
  const futureClasses = getTotalClasses(futureDays, timetable);

  // Assume student attends all future classes
  const newTotal = pastClasses + futureClasses;
  const newAttended = estimatedAttended + futureClasses;
  const newPercent = calcPercentage(newAttended, newTotal);

  return {
    pastClasses, estimatedAttended, futureClasses,
    newTotal, newAttended, newPercent,
    currentPercent
  };
}

/**
 * TOOL 3: Planned Absence Calculator
 * What happens to attendance if you miss X classes in a range?
 */
export function calcPlannedAbsence({
  semesterStart, rangeStart, rangeEnd,
  currentAttended, currentTotal,
  plannedMisses, timetable, holidays = []
}) {
  const futureDays = getWorkingDays(rangeStart, rangeEnd, timetable, holidays);
  const futureTotal = getTotalClasses(futureDays, timetable);
  const futureAttended = Math.max(0, futureTotal - plannedMisses);
  
  const newTotal = currentTotal + futureTotal;
  const newAttended = currentAttended + futureAttended;
  const newPercent = calcPercentage(newAttended, newTotal);
  
  return {
    futureTotal, futureAttended, newTotal,
    newAttended, newPercent,
    status: getStatus(newPercent),
    isRisky: newPercent < 75
  };
}

/**
 * TOOL 4: Individual Subject Attendance
 */
export function getSubjectDetail(subject, timetable, semesterStart, holidays = [], attendanceData = {}) {
  const today = new Date();
  const workingDays = getWorkingDays(semesterStart, today, timetable, holidays);
  const bySubject = getClassesPerSubject(workingDays, timetable);
  const total = bySubject[subject] || 0;
  const attended = attendanceData[subject]?.attended || 0;
  const missed = total - attended;
  const percentage = calcPercentage(attended, total);
  const safeLeavesLeft = getSafeLeavesLeft(attended, total);
  const classesNeeded = getClassesNeeded(attended, total);

  return {
    subject, total, attended, missed,
    percentage, safeLeavesLeft, classesNeeded,
    status: getStatus(percentage)
  };
}

/**
 * TOOL 5: How many classes can I skip?
 * For total attendance across all subjects
 */
export function calcMaxSkippable(currentAttended, currentTotal, futureClasses) {
  // Need: (attended + future_attended) / (total + future) >= 0.75
  // Maximize future_misses s.t. (attended + future - future_misses) / (total + future) >= 0.75
  // future_misses <= attended + future - 0.75*(total+future)
  const maxMissable = Math.floor(
    currentAttended + futureClasses - 0.75 * (currentTotal + futureClasses)
  );
  return Math.max(0, maxMissable);
}

/**
 * TOOL 6: How many consecutive classes must I attend?
 * To recover to 75%
 */
export function calcClassesToRecover(currentAttended, currentTotal) {
  const needed = getClassesNeeded(currentAttended, currentTotal);
  return needed;
}

/**
 * Get overall dashboard stats
 */
export function getDashboardStats(timetable, semesterStart, attendanceData = {}, holidays = []) {
  if (!timetable || !semesterStart) return null;
  
  const today = new Date();
  const workingDays = getWorkingDays(semesterStart, today, timetable, holidays);
  const bySubject = getClassesPerSubject(workingDays, timetable);
  
  const totalClasses = Object.values(bySubject).reduce((a, b) => a + b, 0);
  const subjects = Object.keys(bySubject);
  
  let totalAttended = 0;
  subjects.forEach(s => {
    totalAttended += attendanceData[s]?.attended || 0;
  });
  
  const overallPercent = calcPercentage(totalAttended, totalClasses);
  const safeLeavesLeft = getSafeLeavesLeft(totalAttended, totalClasses);
  const classesNeeded = getClassesNeeded(totalAttended, totalClasses);
  
  // Per-subject stats
  const subjectStats = subjects.map(s => {
    const total = bySubject[s];
    const attended = attendanceData[s]?.attended || 0;
    const percent = calcPercentage(attended, total);
    return {
      subject: s,
      total,
      attended,
      missed: total - attended,
      percentage: percent,
      status: getStatus(percent),
      safeLeavesLeft: getSafeLeavesLeft(attended, total),
      classesNeeded: getClassesNeeded(attended, total),
    };
  });
  
  return {
    overallPercent,
    totalClasses,
    totalAttended,
    safeLeavesLeft,
    classesNeeded,
    workingDaysCount: workingDays.length,
    subjectStats,
    status: getStatus(overallPercent),
  };
}

/**
 * Parse timetable from OCR text (fallback heuristic)
 */
export function parseTimetableFromText(text) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const coursePattern = /[A-Z]{2,6}\s*\d{3,7}[A-Z]?P?/g;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  const timetable = {};
  let currentDay = null;
  
  lines.forEach(line => {
    const dayFound = days.find(d => line.toLowerCase().includes(d.toLowerCase()));
    if (dayFound) {
      currentDay = dayFound;
      if (!timetable[currentDay]) timetable[currentDay] = [];
    }
    
    const matches = line.match(coursePattern) || [];
    if (currentDay && matches.length > 0) {
      timetable[currentDay] = [...(timetable[currentDay] || []), ...matches.map(m => m.replace(/\s+/g, ''))];
    }
  });
  
  return timetable;
}

export { DAY_MAP };
