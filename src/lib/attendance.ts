import { supabase } from '@/lib/supabase';
import { normalizeAttendanceInput, type AttendanceInput } from '@/lib/attendanceValidation';

export interface AttendanceRecord {
  id: string;
  full_name: string;
  phone_number: string;
  reg_number: string;
  created_at: string;
}

export async function submitAttendance(input: AttendanceInput): Promise<void> {
  const normalized = normalizeAttendanceInput(input);
  const { error } = await supabase.from('attendance').insert({
    full_name: normalized.fullName,
    phone_number: normalized.phoneNumber,
    reg_number: normalized.regNumber,
  });
  if (error) {
    throw new Error('We could not record your attendance. Please try again.');
  }
}

export async function fetchAttendance(): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('id, full_name, phone_number, reg_number, created_at')
    .order('created_at', { ascending: false });
  if (error || !Array.isArray(data)) {
    throw new Error('Could not load attendance records.');
  }
  return data as AttendanceRecord[];
}

export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) {
    throw new Error('Could not verify admin access.');
  }
  return data === true;
}
