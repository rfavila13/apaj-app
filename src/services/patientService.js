import { supabase } from './supabase';
export const patientService = {
  async getMyProfile(userId) { const { data, error } = await supabase.from('patients').select('*').eq('id', userId).single(); return { data, error }; },
  async createProfile(userId, profileData) { const { data, error } = await supabase.from('patients').insert({ id: userId, ...profileData }).select().single(); return { data, error }; },
  async updateProfile(userId, updates) { const { data, error } = await supabase.from('patients').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', userId).select().single(); return { data, error }; },
  async addRelapse(userId, relapseData) { const { data, error } = await supabase.from('relapses').insert({ patient_id: userId, ...relapseData }).select().single(); return { data, error }; },
  async getMyRelapses(userId) { const { data, error } = await supabase.from('relapses').select('*').eq('patient_id', userId).order('date', { ascending: false }); return { data, error }; },
  async saveTestResult(userId, score, riskLevel, answers) { const { data, error } = await supabase.from('self_test_results').insert({ patient_id: userId, score, risk_level: riskLevel, answers }).select().single(); return { data, error }; },
  calculateSoberDays(soberStartDate, relapses) {
    if (!soberStartDate) return 0;
    const start = new Date(soberStartDate);
    const today = new Date();
    let lastRelapseDate = null;
    if (relapses && relapses.length > 0) { const dates = relapses.map(r => new Date(r.date)); lastRelapseDate = new Date(Math.max(...dates)); }
    const referenceDate = lastRelapseDate && lastRelapseDate > start ? lastRelapseDate : start;
    return Math.floor((today - referenceDate) / (1000 * 60 * 60 * 24));
  },
  calculateSavings(soberStartDate, previousGamblingAmount, relapses) {
    if (!soberStartDate || !previousGamblingAmount) return { total: 0, potential: 0, lost: 0 };
    const start = new Date(soberStartDate);
    const today = new Date();
    const months = Math.max(1, (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth()) + 1);
    const potential = previousGamblingAmount * months;
    const lost = relapses ? relapses.reduce((sum, r) => sum + (r.amount || 0), 0) : 0;
    return { total: potential - lost, potential, lost };
  }
};
export default patientService;
