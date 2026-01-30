import { supabase } from './supabase';
export const publicService = {
  async sendContactRequest(requestData) {
    const { data, error } = await supabase.from('contact_requests').insert({ name: requestData.name, email: requestData.email || null, phone: requestData.phone, message: requestData.message || null, urgency: requestData.urgency || 'normal' }).select().single();
    return { data, error };
  }
};
export default publicService;
