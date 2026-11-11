import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { submitAttendance } from '@/lib/attendance';
import {
  validateAttendanceInput,
  type AttendanceErrors,
  type AttendanceInput,
} from '@/lib/attendanceValidation';

const EMPTY_FORM: AttendanceInput = { fullName: '', phoneNumber: '', regNumber: '' };

type SubmitStatus = 'idle' | 'submitting' | 'success';

export default function AttendanceForm() {
  const [form, setForm] = useState<AttendanceInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<AttendanceErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitStatus>('idle');

  function updateField(field: keyof AttendanceInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const found = validateAttendanceInput(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus('submitting');
    try {
      await submitAttendance(form);
      setForm(EMPTY_FORM);
      setStatus('success');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('idle');
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-slate-900">You are signed in</h2>
        <p className="mt-2 text-slate-600">Your attendance has been recorded. Thank you.</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-8 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
        >
          Sign in another person
        </button>
      </div>
    );
  }

  const isSubmitting = status === 'submitting';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Field
        id="fullName"
        label="Full name"
        error={errors.fullName}
        value={form.fullName}
        onChange={(value) => updateField('fullName', value)}
        autoComplete="name"
        placeholder="e.g. Ada Okafor"
      />
      <Field
        id="phoneNumber"
        label="Phone number"
        type="tel"
        inputMode="tel"
        error={errors.phoneNumber}
        value={form.phoneNumber}
        onChange={(value) => updateField('phoneNumber', value)}
        autoComplete="tel"
        placeholder="e.g. 0803 123 4567"
      />
      <Field
        id="regNumber"
        label="Registration number"
        error={errors.regNumber}
        value={form.regNumber}
        onChange={(value) => updateField('regNumber', value)}
        autoCapitalize="characters"
        spellCheck={false}
        placeholder="e.g. 202660623441GA"
        hint="12 digits followed by 2 letters"
      />

      {submitError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-teal-400"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Submitting
          </>
        ) : (
          <>
            <Send className="h-4 w-4" aria-hidden="true" />
            Mark my attendance
          </>
        )}
      </button>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  type?: string;
  inputMode?: 'tel' | 'text';
  autoComplete?: string;
  autoCapitalize?: 'characters' | 'none';
  spellCheck?: boolean;
  placeholder?: string;
}

function Field({ id, label, value, onChange, error, hint, ...inputProps }: FieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`mt-2 block w-full rounded-lg border bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-400 focus:ring-red-200'
            : 'border-slate-300 focus:border-teal-600 focus:ring-teal-100'
        }`}
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-600">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-2 text-sm text-slate-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
