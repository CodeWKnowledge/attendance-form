import { useEffect, useState, type FormEvent } from 'react';
import { AlertCircle, Loader2, Mail, ShieldCheck, UserPlus, X } from 'lucide-react';
import { addAdmin, listAdmins } from '@/lib/adminAuth';

interface ManageAdminsDialogProps {
  onClose: () => void;
}

type LoadState = 'loading' | 'ready' | 'error';

export default function ManageAdminsDialog({ onClose }: ManageAdminsDialogProps) {
  const [admins, setAdmins] = useState<string[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listAdmins()
      .then((list) => {
        if (cancelled) return;
        setAdmins(list);
        setLoadState('ready');
      })
      .catch(() => {
        if (!cancelled) setLoadState('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isAdding) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdding, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccess(null);

    const trimmed = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setFormError('Enter a valid email address.');
      return;
    }
    if (admins.includes(trimmed)) {
      setFormError('This person is already an admin.');
      return;
    }

    setIsAdding(true);
    try {
      const added = await addAdmin(trimmed);
      const refreshed = await listAdmins();
      setAdmins(refreshed);
      setLoadState('ready');
      setEmail('');
      setSuccess(`${added} is now an admin.`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not add this admin.');
    } finally {
      setIsAdding(false);
    }
  }

  const inputClass =
    'block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isAdding) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-admins-title"
        className="w-full max-w-lg rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 id="manage-admins-title" className="text-lg font-semibold text-slate-900">
              Manage admins
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Admins can view, download and add other admins.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isAdding}
            aria-label="Close"
            className="-mr-2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <label htmlFor="new-admin-email" className="block text-sm font-medium text-slate-700">
              Add an admin by email
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="new-admin-email"
                  type="email"
                  autoComplete="off"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={isAdding || email.trim() === ''}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-teal-200 disabled:text-teal-800"
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                )}
                Add admin
              </button>
            </div>
            <p className="text-sm text-slate-500">
              If the person has not created an account yet, they become an admin as soon as they sign up with this email.
            </p>
            {formError && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </p>
            )}
            {success && (
              <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {success}
              </p>
            )}
          </form>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Current admins</h3>
            {loadState === 'loading' && (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Loading admins
              </div>
            )}
            {loadState === 'error' && (
              <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                The admin list could not be loaded.
              </p>
            )}
            {loadState === 'ready' && (
              <ul className="mt-3 max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                {admins.map((adminEmail) => (
                  <li key={adminEmail} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50">
                      <ShieldCheck className="h-4 w-4 text-teal-700" aria-hidden="true" />
                    </div>
                    <span className="truncate text-sm text-slate-800">{adminEmail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
