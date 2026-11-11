import type { AttendanceRecord } from '@/lib/attendance';
import { formatDateTime } from '@/lib/formatDateTime';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export type SortField = 'created_at' | 'full_name' | 'reg_number' | 'phone_number';
export type SortOrder = 'asc' | 'desc';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export default function AttendanceTable({
  records,
  sortField,
  sortOrder,
  onSort,
}: AttendanceTableProps) {
  function renderSortIcon(field: SortField) {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 text-slate-400 opacity-60" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-teal-700 font-bold" />
    ) : (
      <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-teal-700 font-bold" />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th scope="col" className="px-4 py-3">#</th>
            <th scope="col" className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition" onClick={() => onSort('full_name')}>
              <div className="flex items-center">
                Full name
                {renderSortIcon('full_name')}
              </div>
            </th>
            <th scope="col" className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition" onClick={() => onSort('phone_number')}>
              <div className="flex items-center">
                Phone number
                {renderSortIcon('phone_number')}
              </div>
            </th>
            <th scope="col" className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition" onClick={() => onSort('reg_number')}>
              <div className="flex items-center">
                Reg number
                {renderSortIcon('reg_number')}
              </div>
            </th>
            <th scope="col" className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 transition" onClick={() => onSort('created_at')}>
              <div className="flex items-center">
                Signed in at
                {renderSortIcon('created_at')}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.map((record, index) => (
            <tr key={record.id} className="transition hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-500 font-medium">{index + 1}</td>
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
