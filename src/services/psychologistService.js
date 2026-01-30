import { supabase } from './supabase';
export const psychologistService = {
  async getMyProfile(userId) { const { data, error } = await supabase.from('psychologists').select('*').eq('id', userId).single(); return { data, error }; },
  async getAllPatients() { const { data, error } = await supabase.from('patients').select('*').order('name'); return { data, error }; },
  async getPatientRelapses(patientId) { const { data, error } = await supabase.from('relapses').select('*').eq('patient_id', patientId).order('date', { ascending: false }); return { data, error }; },
  async getPatientSessions(patientId) { const { data, error } = await supabase.from('individual_sessions').select('*').eq('patient_id', patientId).order('session_date', { ascending: false }); return { data, error }; },
  async createSession(sessionData) { const { data, error } = await supabase.from('individual_sessions').insert(sessionData).select().single(); return { data, error }; },
  async getMyGroups(psychologistId) { const { data, error } = await supabase.from('therapy_groups').select('*, group_participants(patient_id, patients(id, name))').eq('psychologist_id', psychologistId).eq('is_active', true); return { data, error }; },
  async createGroup(groupData) { const { data, error } = await supabase.from('therapy_groups').insert(groupData).select().single(); return { data, error }; },
  async getContactRequests() { const { data, error } = await supabase.from('contact_requests').select('*').order('created_at', { ascending: false }); return { data, error }; },
  async updateContactRequest(requestId, updates, odId) { const { data, error } = await supabase.from('contact_requests').update({ ...updates, handled_by: odId, handled_at: new Date().toISOString() }).eq('id', requestId).select().single(); return { data, error }; },
  async getDashboardStats(odId) {
    const { count: activePatients } = await supabase.from('patients').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { count: criticalPatients } = await supabase.from('patients').select('*', { count: 'exact', head: true }).eq('risk_level', 'high');
    const { count: pendingRequests } = await supabase.from('contact_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    return { activePatients: activePatients || 0, criticalPatients: criticalPatients || 0, pendingRequests: pendingRequests || 0 };
  }
};
export default psychologistService;
