import { supabase } from './supabase'
export const publicService = {
  sendContactRequest: (data) => supabase.from('contact_requests').insert(data).select().single()
}
