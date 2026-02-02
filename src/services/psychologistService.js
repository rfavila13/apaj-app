import { supabase } from './supabase'
export const psychologistService = {
  getMyProfile: (id) => supabase.from('psychologists').select('*').eq('id', id).single(),
  getAllPatients: () => supabase.from('patients').select('*').order('name'),
  getPatientRelapses: (id) => supabase.from('relapses').select('*').eq('patient_id', id).order('date', { ascending: false }),
  getPatientSessions: (id) => supabase.from('individual_sessions').select('*').eq('patient_id', id).order('session_date', { ascending: false }),
  createSession: (data) => supabase.from('individual_sessions').insert(data).select().single(),
  getMyGroups: (id) => supabase.from('therapy_groups').select('*').eq('psychologist_id', id),
  createGroup: (data) => supabase.from('therapy_groups').insert(data).select().single(),
  getContactRequests: () => supabase.from('contact_requests').select('*').order('created_at', { ascending: false }),
  updateContactRequest: (id, data, odId) => supabase.from('contact_requests').update({ ...data, handled_by: odId }).eq('id', id).select().single()
}
