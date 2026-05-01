# 🎓 Attendify — Smart Student Attendance Calculator

A full-stack Next.js app for college students to track attendance, plan skips, and stay above 75%.

---

## ✨ Features

- 📤 **OCR Timetable Upload** — Photo of your timetable → auto-parsed
- 📊 **Beautiful Dashboard** — Charts, subject cards, progress rings
- 🧮 **6 Calculator Tools** — Date range, projection, absence planner, recovery calc
- 🎨 **Gen Z UI** — Glassmorphism, dark mode, smooth animations
- 📱 **Mobile Responsive** — Bottom nav, touch-optimised
- 🏖️ **Holiday Support** — Single dates or date ranges excluded from counts
- 💾 **Local Storage** — No backend needed, data stays on your device

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (https://nodejs.org)
- **npm** or **yarn**

### 1. Install Dependencies

```bash
cd attendify
npm install
```

> This installs Next.js 14, Tailwind CSS, Recharts, Framer Motion, Tesseract.js, and all other dependencies.

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
attendify/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.js             # Landing page (/)
│   │   ├── login/page.js       # Login (/login)
│   │   ├── signup/page.js      # Signup (/signup)
│   │   ├── setup/page.js       # First-time setup (/setup)
│   │   ├── dashboard/page.js   # Main dashboard (/dashboard)
│   │   ├── calculator/page.js  # 6 calculator tools (/calculator)
│   │   ├── subjects/page.js    # Subject-wise attendance (/subjects)
│   │   ├── settings/page.js    # Settings & data management (/settings)
│   │   ├── layout.js           # Root layout
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── layout/             # Sidebar, Navbar, AppLayout
│   │   ├── ui/                 # Button, Card, Modal, Badge, etc.
│   │   └── dashboard/          # Charts, AttendanceCards, TimetableGrid
│   ├── contexts/
│   │   └── AppContext.js       # Global state management
│   └── lib/
│       ├── attendance.js       # Core calculation logic
│       ├── storage.js          # localStorage utilities
│       └── ocr.js              # Tesseract.js OCR utilities
├── public/
│   └── favicon.svg
├── tailwind.config.js
├── next.config.mjs
└── package.json
```

---

## 🧮 Calculator Tools

| # | Tool | Description |
|---|------|-------------|
| 1 | Date Range | How many classes in a date range |
| 2 | Projection | Projected % if you attend all future classes |
| 3 | Absence Planner | Impact of planned leaves |
| 4 | Subject Detail | Per-subject deep analysis |
| 5 | Skip Planner | Max classes you can skip |
| 6 | Recovery Calc | Classes needed to reach 75% |

---

## 🎨 Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 | React framework with App Router |
| Tailwind CSS | Utility-first styling |
| Recharts | Attendance charts |
| Lucide React | Icons |
| Tesseract.js | OCR for timetable parsing |
| date-fns | Date calculations |
| localStorage | Data persistence (no backend) |

---

## 📱 Pages

- `/` — Landing page
- `/login` — Login
- `/signup` — Create account
- `/setup` — Timetable setup (first time)
- `/dashboard` — Main dashboard
- `/calculator` — All 6 calculator tools
- `/subjects` — Subject-wise attendance
- `/settings` — Settings, edit timetable, data management

---

## 🏗️ Future Enhancements

- Firebase / Supabase backend auth
- Cloud sync across devices
- Push notifications for attendance alerts
- Semester-wise history
- Export to PDF
- Share attendance report

---

## 📝 How Attendance Is Calculated

- Each filled timetable slot = 1 class
- Practicals in 2 slots = 2 classes (counted separately)
- Only days with timetable entries are counted
- Holidays (single or range) are automatically excluded
- Safe leave formula: `floor((attended - 0.75 × total) / 0.75)`
- Recovery formula: `ceil(3 × total - 4 × attended)`

---

Made with 💚 for college students who want to study smart.
