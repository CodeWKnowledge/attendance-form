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

  // Check if reg_number or phone_number is already registered
  const { data: existing, error: checkError } = await supabase
    .from('attendance')
    .select('reg_number, phone_number')
    .or(`reg_number.eq.${normalized.regNumber},phone_number.eq.${normalized.phoneNumber}`)
    .limit(1);

  if (checkError) {
    // If SELECT is restricted by RLS for anon visitors, proceed to insert
    // where database-level unique constraints will reject duplicates.
    console.warn('Pre-check attendance error:', checkError);
  } else if (existing && existing.length > 0) {
    if (existing[0].reg_number === normalized.regNumber) {
      throw new Error('This registration number has already been registered.');
    }
    if (existing[0].phone_number === normalized.phoneNumber) {
      throw new Error('This phone number has already been registered.');
    }
  }

  const { error } = await supabase.from('attendance').insert({
    full_name: normalized.fullName,
    phone_number: normalized.phoneNumber,
    reg_number: normalized.regNumber,
  });

  if (error) {
    // Handle Postgres unique violation error code (23505)
    if (error.code === '23505') {
      if (error.message?.includes('reg_number') || error.details?.includes('reg_number')) {
        throw new Error('This registration number has already been registered.');
      }
      if (error.message?.includes('phone_number') || error.details?.includes('phone_number')) {
        throw new Error('This phone number has already been registered.');
      }
      throw new Error('This registration number or phone number has already been registered.');
    }
    throw new Error('We could not record your attendance. Please try again.');
  }
}

export async function fetchAttendance(): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from('attendance')
    .select('id, full_name, phone_number, reg_number, created_at')
    .order('created_at', { ascending: true });
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
