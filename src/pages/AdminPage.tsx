import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Loader2, LogOut, ShieldCheck, ClipboardCheck } from 'lucide-react';
import AdminAuthForm from '@/components/admin/AdminAuthForm';
import AttendanceDashboard from '@/components/admin/AttendanceDashboard';
import { checkIsAdmin } from '@/lib/attendance';
import { signOutAdmin } from '@/lib/adminAuth';
import { supabase } from '@/lib/supabase';

type AccessState = 'checking' | 'signed_out' | 'not_admin' | 'admin' | 'error';

export default function AdminPage() {
  const [access, setAccess] = useState<AccessState>('checking');
  const [signOutError, setSignOutError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolveAccess(session: Session | null) {
      if (!session) {
        setAccess('signed_out');
        return;
      }
      setAccess('checking');
      try {
        const isAdmin = await checkIsAdmin();
        if (!cancelled) setAccess(isAdmin ? 'admin' : 'not_admin');
      } catch {
        if (!cancelled) setAccess('error');
      }
    }

    supabase.auth.getSession().then(({ data }) => resolveAccess(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        await resolveAccess(session);
      })();
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    setSignOutError(null);
    try {
      await signOutAdmin();
    } catch (err) {
      setSignOutError(err instanceof Error ? err.message : 'Could not sign out.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700">
              <ClipboardCheck className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <span className="font-semibold text-slate-900">Attendance Admin</span>
          </div>
          <a href="/" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
            Back to attendance form
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {access === 'checking' && (
          <div className="flex items-center justify-center gap-2 py-24 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Checking access
          </div>
        )}

        {access === 'signed_out' && (
          <div className="mx-auto flex max-w-md flex-col items-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
              <ShieldCheck className="h-7 w-7 text-teal-700" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Admin sign in</h1>
            <p className="mb-8 mt-2 text-center text-slate-600">
              Sign in to view and download the attendance register.
            </p>
            <AdminAuthForm />
          </div>
        )}

        {(access === 'not_admin' || access === 'error') && (
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-slate-900">
              {access === 'not_admin' ? 'No admin access' : 'Access could not be checked'}
            </h1>
            <p className="mt-2 text-slate-600">
              {access === 'not_admin'
                ? 'This account is not on the admin list. Ask the department to add your email address.'
                : 'Something went wrong while checking your access. Please sign out and try again.'}
            </p>
            {signOutError && <p role="alert" className="mt-4 text-sm text-red-600">{signOutError}</p>}
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        )}

        {access === 'admin' && (
          <>
            {signOutError && <p role="alert" className="mb-4 text-sm text-red-600">{signOutError}</p>}
            <AttendanceDashboard onSignOut={() => void handleSignOut()} />
          </>
        )}
      </main>
    </div>
  );
}
