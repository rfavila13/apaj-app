import { supabase } from './supabase'
export const patientService = {
  getMyProfile: (id) => supabase.from('patients').select('*').eq('id', id).single(),
  updateProfile: (id, data) => supabase.from('patients').update(data).eq('id', id).select().single(),
  getMyRelapses: (id) => supabase.from('relapses').select('*').eq('patient_id', id).order('date', { ascending: false }),
  addRelapse: (id, data) => supabase.from('relapses').insert({ patient_id: id, ...data }).select().single(),
  calcDays: (start, relapses) => {
    if (!start) return 0
    const s = new Date(start)
    const last = relapses?.length ? new Date(Math.max(...relapses.map(r => new Date(r.date)))) : null
    const ref = last && last > s ? last : s
    return Math.floor((new Date() - ref) / 86400000)
  },
  calcSavings: (start, amt, relapses) => {
    if (!start || !amt) return { total: 0 }
    const s = new Date(start)
    const months = Math.max(1, (new Date().getFullYear() - s.getFullYear()) * 12 + new Date().getMonth() - s.getMonth() + 1)
    const lost = relapses?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0
    return { total: amt * months - lost }
  }
}
