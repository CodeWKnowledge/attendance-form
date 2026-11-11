import { supabase } from '@/lib/supabase';

function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid grant')) {
    return 'Email or password is incorrect. If you haven’t created your admin account yet, click "Create account" first.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please check your email and confirm your address before signing in, or disable email confirmation in Supabase.';
  }
  if (lower.includes('already registered')) {
    return 'An account with this email already exists. Sign in instead.';
  }
  if (lower.includes('password should be at least')) {
    return 'Password must be at least 8 characters.';
  }
  if (lower.includes('user not found')) {
    return 'No account found with this email. Click "Create account" to set up your password.';
  }
  return message || 'Something went wrong. Please try again.';
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
