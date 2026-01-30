import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://knomjaygrqspgwpddgvx.supabase.co';
const supabaseAnonKey = 'sb_publishable_gWxZpb02QQmNAmcxqb1T8A_qVkWPnlS';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const signUp = async (email, password, userData) => { const { data, error } = await supabase.auth.signUp({ email, password, options: { data: userData } }); return { data, error }; };
export const signIn = async (email, password) => { const { data, error } = await supabase.auth.signInWithPassword({ email, password }); return { data, error }; };
export const signOut = async () => { const { error } = await supabase.auth.signOut(); return { error }; };
export const checkUserType = async (userId) => {
  const { data: psy } = await supabase.from('psychologists').select('id, name').eq('id', userId).single();
  if (psy) return { type: 'psychologist', data: psy };
  const { data: pat } = await supabase.from('patients').select('id, name').eq('id', userId).single();
  if (pat) return { type: 'patient', data: pat };
  return { type: null, data: null };
};
export default supabase;
