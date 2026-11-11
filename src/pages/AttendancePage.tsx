import { useState, useEffect } from 'react';
import { ClipboardCheck } from 'lucide-react';
import AttendanceForm from '@/components/attendance/AttendanceForm';

export default function AttendancePage() {
  const [logoClicks, setLogoClicks] = useState(0);

  // Secret keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A on Mac)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        window.location.href = '/admin';
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Secret multi-click: clicking the header logo 5 times within 3 seconds
  function handleLogoClick() {
    setLogoClicks((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        window.location.href = '/admin';
        return 0;
      }
      return next;
    });
  }

  // Reset click count after 3 seconds of inactivity
  useEffect(() => {
    if (logoClicks > 0) {
      const timer = setTimeout(() => setLogoClicks(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [logoClicks]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-12 sm:py-20">
        <header className="flex items-center gap-3">
          <div
            onClick={handleLogoClick}
            className="flex h-11 w-11 cursor-pointer select-none items-center justify-center rounded-xl bg-teal-700 transition active:scale-95"
            title="Department Attendance"
          >
            <ClipboardCheck className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-teal-700">Department Attendance</p>
            <h1 className="text-2xl font-semibold text-slate-900">Sign in for today</h1>
          </div>
        </header>

        <main className="mt-8 flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-6 text-slate-600">
            Enter your details below. Your registration number is used to record your attendance.
          </p>
          <AttendanceForm />
        </main>

        <footer className="mt-8 text-center text-xs text-slate-400 select-none">
          © {new Date().getFullYear()} Department Attendance System
        </footer>
      </div>
    </div>
  );
}
