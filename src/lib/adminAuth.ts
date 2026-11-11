import { supabase } from '@/lib/supabase';

function friendlyAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Email or password is incorrect.';
  if (message.includes('already registered')) return 'An account with this email already exists. Sign in instead.';
  if (message.includes('Password should be at least')) return 'Password must be at least 8 characters.';
  return 'Something went wrong. Please try again.';
}

export async function signInAdmin(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(friendlyAuthError(error.message));
}

export async function signUpAdmin(email: string, password: string): Promise<{ hasSession: boolean }> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(friendlyAuthError(error.message));
  return { hasSession: data.session !== null };
}

export async function signOutAdmin(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error('Could not sign out. Please try again.');
}

export async function listAdmins(): Promise<string[]> {
  const { data, error } = await supabase.rpc('list_admins');
  if (error || !Array.isArray(data)) throw new Error('Could not load the admin list.');
  return data as string[];
}

export async function addAdmin(email: string): Promise<string> {
  const { data, error } = await supabase.rpc('add_admin', { new_email: email });
  if (error) {
    if (error.message.includes('valid email')) throw new Error('Please enter a valid email address.');
    throw new Error('Could not add this admin. Please try again.');
  }
  if (typeof data !== 'string') throw new Error('Could not add this admin. Please try again.');
  return data;
}
