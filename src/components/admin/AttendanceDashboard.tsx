import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AlertCircle, Download, FileText, Loader2, LogOut, RefreshCw, Search, ShieldPlus, Users, ArrowDownAZ, ArrowUpZA, Calendar } from 'lucide-react';
import AttendanceTable, { type SortField, type SortOrder } from '@/components/admin/AttendanceTable';
import ManageAdminsDialog from '@/components/admin/ManageAdminsDialog';
import { fetchAttendance, type AttendanceRecord } from '@/lib/attendance';
import { exportAttendanceDocx, exportAttendancePdf } from '@/lib/exportAttendance';

interface AttendanceDashboardProps {
  onSignOut: () => void;
}

type LoadState = 'loading' | 'ready' | 'error';
type DateFilter = 'all' | 'today' | 'earlier';

function isToday(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default function AttendanceDashboard({ onSignOut }: AttendanceDashboardProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [exportError, setExportError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<'pdf' | 'docx' | null>(null);
  const [showManageAdmins, setShowManageAdmins] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoadState('loading');
    try {
      setRecords(await fetchAttendance());
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }

  const processedRecords = useMemo(() => {
    let result = [...records];

    // 1. Date filter
    if (dateFilter === 'today') {
      result = result.filter((r) => isToday(r.created_at));
    } else if (dateFilter === 'earlier') {
      result = result.filter((r) => !isToday(r.created_at));
    }

    // 2. Query search
    const term = query.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (record) =>
          record.full_name.toLowerCase().includes(term) ||
          record.phone_number.toLowerCase().includes(term) ||
          record.reg_number.toLowerCase().includes(term),
      );
    }

    // 3. Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === 'full_name') {
        comparison = a.full_name.localeCompare(b.full_name, undefined, { sensitivity: 'base' });
      } else if (sortField === 'reg_number') {
        comparison = a.reg_number.localeCompare(b.reg_number, undefined, { numeric: true });
      } else if (sortField === 'phone_number') {
        comparison = a.phone_number.localeCompare(b.phone_number);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [records, query, dateFilter, sortField, sortOrder]);

  const todayCount = useMemo(() => records.filter((record) => isToday(record.created_at)).length, [records]);

  async function handleExport(format: 'pdf' | 'docx') {
    setExportError(null);
    setExporting(format);
    try {
      if (format === 'pdf') {
        exportAttendancePdf(processedRecords);
      } else {
        await exportAttendanceDocx(processedRecords);
      }
    } catch {
      setExportError('The file could not be created. Please try again.');
    } finally {
      setExporting(null);
    }
  }

  const canExport = loadState === 'ready' && processedRecords.length > 0 && exporting === null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Attendance records</h2>
          <p className="text-sm text-slate-600">
            {sortField === 'created_at' && sortOrder === 'asc'
              ? 'Ordered by registration sequence (#1 is first registered).'
              : `Sorted by ${sortField.replace('_', ' ')} (${sortOrder === 'asc' ? 'ascending' : 'descending'}).`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowManageAdmins(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <ShieldPlus className="h-4 w-4" aria-hidden="true" />
            Manage admins
          </button>
          <button
            type="button"
            onClick={() => void loadRecords()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard icon={<Users className="h-5 w-5 text-teal-700" aria-hidden="true" />} label="Total registrations" value={records.length} />
        <StatCard icon={<Users className="h-5 w-5 text-sky-700" aria-hidden="true" />} label="Registered today" value={todayCount} />
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, phone or reg number"
              aria-label="Search attendance records"
              className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100"
            />
          </div>

          {/* Quick Date Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-medium text-slate-500">Filter:</span>
            {(['all', 'today', 'earlier'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setDateFilter(filter)}
                className={`rounded-md px-2.5 py-1.5 font-medium transition ${
                  dateFilter === filter
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter === 'all' ? 'All dates' : filter === 'today' ? 'Today only' : 'Before today'}
              </button>
            ))}
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-medium text-slate-500">Sort:</span>
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-') as [SortField, SortOrder];
                setSortField(f);
                setSortOrder(o);
              }}
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 focus:border-teal-600 focus:outline-none"
            >
              <option value="created_at-asc">Registration Order (#1 First Registered)</option>
              <option value="created_at-desc">Latest Registered First</option>
              <option value="full_name-asc">Name (A → Z)</option>
              <option value="full_name-desc">Name (Z → A)</option>
              <option value="reg_number-asc">Reg Number (Ascending)</option>
              <option value="reg_number-desc">Reg Number (Descending)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExportButton
            label="Download PDF"
            icon={<Download className="h-4 w-4" aria-hidden="true" />}
            busy={exporting === 'pdf'}
            disabled={!canExport}
            onClick={() => void handleExport('pdf')}
          />
          <ExportButton
            label="Download Word"
            icon={<FileText className="h-4 w-4" aria-hidden="true" />}
            busy={exporting === 'docx'}
            disabled={!canExport}
            onClick={() => void handleExport('docx')}
          />
        </div>
      </div>

      {exportError && (
        <p role="alert" className="text-sm text-red-600">
          {exportError}
        </p>
      )}

      {loadState === 'loading' && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-16 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          Loading records
        </div>
      )}

      {loadState === 'error' && (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 py-12 text-center">
          <AlertCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
          <p className="text-red-800">The records could not be loaded.</p>
          <button
            type="button"
            onClick={() => void loadRecords()}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm ring-1 ring-red-200 transition hover:bg-red-50"
          >
            Try again
          </button>
        </div>
      )}

      {loadState === 'ready' && records.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-600">
          No one has registered yet.
        </div>
      )}

      {loadState === 'ready' && records.length > 0 && processedRecords.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-slate-600">
          No records match your filter criteria.
        </div>
      )}

      {loadState === 'ready' && processedRecords.length > 0 && (
        <AttendanceTable
          records={processedRecords}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}

      {showManageAdmins && <ManageAdminsDialog onClose={() => setShowManageAdmins(false)} />}
    </div>
  );
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">{icon}</div>
      <div>
        <p className="text-sm text-slate-600">{label}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

interface ExportButtonProps {
  label: string;
  icon: ReactNode;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
}

function ExportButton({ label, icon, busy, disabled, onClick }: ExportButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : icon}
      {label}
    </button>
  );
}
