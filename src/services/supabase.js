import { createClient } from '@supabase/supabase-js'
const url = 'https://knomjaygrqspgwpddgvx.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtub21qYXlncnFzcGd3cGRkZ3Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzYwNjYsImV4cCI6MjA4NTAxMjA2Nn0.kN048sXyFuRPW5Zsf-53g8SSghRG7YCHW1sLwGaTG3M'
export const supabase = createClient(url, key)
export const signIn = (email, pw) => supabase.auth.signInWithPassword({ email, password: pw })
export const signUp = (email, pw, data) => supabase.auth.signUp({ email, password: pw, options: { data } })
export const signOut = () => supabase.auth.signOut()
export const checkUserType = async (id) => {
  const { data: p } = await supabase.from('psychologists').select('id,name').eq('id', id).single()
  if (p) return { type: 'psychologist', data: p }
  const { data: pt } = await supabase.from('patients').select('id,name').eq('id', id).single()
  if (pt) return { type: 'patient', data: pt }
  return { type: null }
}
