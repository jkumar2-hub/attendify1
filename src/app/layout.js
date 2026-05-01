import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import ToastContainer from '@/components/ui/ToastContainer';

export const metadata = {
  title: 'Attendify — Smart Attendance Calculator',
  description: 'Track your college attendance, know how many classes you can skip, and stay above 75%.',
  keywords: 'attendance calculator, college attendance, student app, 75% attendance',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Attendify — Smart Attendance Calculator',
    description: 'Upload timetable, track attendance, plan smart.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="font-body antialiased">
        <AppProvider>
          {children}
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
