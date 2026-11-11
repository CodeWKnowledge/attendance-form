import type { AttendanceRecord } from '@/lib/attendance';
import { formatDateTime } from '@/lib/formatDateTime';

interface AttendanceTableProps {
  records: AttendanceRecord[];
}

export default function AttendanceTable({ records }: AttendanceTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th scope="col" className="px-4 py-3">#</th>
            <th scope="col" className="px-4 py-3">Full name</th>
            <th scope="col" className="px-4 py-3">Phone number</th>
            <th scope="col" className="px-4 py-3">Reg number</th>
            <th scope="col" className="px-4 py-3">Signed in at</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.map((record, index) => (
            <tr key={record.id} className="transition hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-500">{index + 1}</td>
              <td className="px-4 py-3 font-medium text-slate-900">{record.full_name}</td>
              <td className="px-4 py-3 text-slate-700">{record.phone_number}</td>
              <td className="px-4 py-3 font-mono text-slate-700">{record.reg_number}</td>
              <td className="px-4 py-3 text-slate-700">{formatDateTime(record.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
