// lib/ocr.js — OCR with Tesseract.js

/**
 * Extract text from an image using Tesseract.js
 * Returns the raw text and a parsed timetable attempt
 */
export async function extractTextFromImage(imageFile, onProgress) {
  // Dynamically import Tesseract.js (avoid SSR issues)
  const Tesseract = (await import('tesseract.js')).default;
  
  const result = await Tesseract.recognize(
    imageFile,
    'eng',
    {
      logger: m => {
        if (onProgress && m.progress !== undefined) {
          onProgress(Math.round(m.progress * 100));
        }
      },
    }
  );
  
  return {
    text: result.data.text,
    confidence: result.data.confidence,
    lines: result.data.lines,
  };
}

/**
 * Parse timetable from OCR output text
 * Handles college timetable formats
 */
export function parseTimetableFromOCR(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayAbbr = {
    'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday',
    'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday',
    'MON': 'Monday', 'TUE': 'Tuesday', 'WED': 'Wednesday',
    'THU': 'Thursday', 'FRI': 'Friday', 'SAT': 'Saturday',
  };

  // Course ID patterns
  const coursePattern = /(?:[A-Z]{2,6}\s*\d{3,8}[A-Z]?P?(?:\/[A-Z]{1,3})?)/g;
  const timetable = {};
  let currentDay = null;

  lines.forEach((line, i) => {
    // Check if line contains a day name
    let foundDay = null;
    
    for (const day of days) {
      if (line.toLowerCase().startsWith(day.toLowerCase()) ||
          new RegExp(`\\b${day}\\b`, 'i').test(line)) {
        foundDay = day;
        break;
      }
    }
    
    for (const [abbr, full] of Object.entries(dayAbbr)) {
      if (line.startsWith(abbr) || line.toLowerCase().startsWith(abbr.toLowerCase())) {
        foundDay = full;
        break;
      }
    }
    
    if (foundDay) {
      currentDay = foundDay;
      if (!timetable[currentDay]) timetable[currentDay] = [];
    }
    
    // Extract course IDs from the line
    const matches = [...(line.matchAll(coursePattern) || [])].map(m => m[0].replace(/\s+/g, ''));
    
    if (matches.length > 0) {
      if (currentDay) {
        timetable[currentDay] = [
          ...(timetable[currentDay] || []),
          ...matches
        ];
      } else {
        // If no day context yet, put in a "Unknown" bucket for user to sort
      }
    }
  });

  return timetable;
}

/**
 * Try to extract a structured timetable table from OCR output
 * This handles the case where we can detect a proper table structure
 */
export function extractTimetableTable(ocrText) {
  const lines = ocrText.split('\n').map(l => l.trim()).filter(Boolean);
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timetable = {};
  
  // Find header row (time slots)
  let headerLine = null;
  let headerIndex = -1;
  
  lines.forEach((line, i) => {
    if (/\d{1,2}[:.]?\d{0,2}\s*(AM|PM|am|pm)/i.test(line) ||
        /period\s*\d/i.test(line) ||
        /slot\s*\d/i.test(line)) {
      headerLine = line;
      headerIndex = i;
    }
  });
  
  // Parse rows after header
  const coursePattern = /[A-Z0-9]{4,12}(?:P|L|T)?/g;
  
  lines.forEach(line => {
    const dayMatch = days.find(d => new RegExp(`^${d}|^${d.slice(0,3)}`, 'i').test(line));
    if (dayMatch) {
      const rest = line.replace(new RegExp(dayMatch, 'i'), '').trim();
      const courses = [...(rest.matchAll(coursePattern) || [])].map(m => m[0]);
      // Filter out obvious non-course matches (all numbers, too short)
      const filtered = courses.filter(c => c.length >= 4 && /[A-Z]/.test(c) && /\d/.test(c));
      timetable[dayMatch] = filtered;
    }
  });
  
  return Object.keys(timetable).length > 0 ? timetable : parseTimetableFromOCR(ocrText);
}

/**
 * Create an empty timetable template
 */
export function createEmptyTimetable(days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], periods = 6) {
  const tt = {};
  days.forEach(day => {
    tt[day] = Array(periods).fill('');
  });
  return tt;
}
