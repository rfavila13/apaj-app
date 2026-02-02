import React, { useState, useEffect } from 'react'
import { supabase, checkUserType, signIn, signOut, signUp } from './services/supabase'
import PatientApp from './pages/paciente/PatientApp'
import PsychologistPanel from './pages/psicologo/PsychologistPanel'

const C = { primary: '#1a3a6a', dark: '#0f2847', light: '#f0f4f8', border: '#d0d8e0', text: '#1a2a3a', textLight: '#5a6a7a', white: '#fff', success: '#28a068', danger: '#d04040' }

export default function App() {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        const { type } = await checkUserType(session.user.id)
        setUserType(type)
      }
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (e, session) => {
      if (e === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        const { type } = await checkUserType(session.user.id)
        setUserType(type)
      } else if (e === 'SIGNED_OUT') {
        setUser(null)
        setUserType(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    try {
      if (isSignUp) {
        const { data, error } = await signUp(form.email, form.password, { name: form.name, phone: form.phone })
        if (error) throw error
        if (data.user) {
          await supabase.from('patients').insert({ id: data.user.id, email: form.email, name: form.name, phone: form.phone })
          setError('Cadastro realizado! Verifique seu email.')
          setIsSignUp(false)
        }
      } else {
        const { data, error } = await signIn(form.email, form.password)
        if (error) throw error
        setUser(data.user)
        const { type } = await checkUserType(data.user.id)
        setUserType(type)
      }
    } catch (err) {
      setError(err.message || 'Erro')
    } finally {
      setFormLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    setUserType(null)
  }

  if (loading) return <div style={{ minHeight: '100vh', background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: C.primary }}>Carregando...</p></div>

  if (user) {
    if (userType === 'psychologist') return <PsychologistPanel user={user} onLogout={handleLogout} />
    return <PatientApp user={user} onLogout={handleLogout} />
  }

  return (
    <div style={{ minHeight: '100vh', background: C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: C.white, borderRadius: 24, padding: '48px 40px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(26,58,106,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 100, height: 100, margin: '0 auto 20px', background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🤝</div>
          <h1 style={{ fontSize: 28, color: C.primary, fontWeight: 700, margin: '0 0 8px' }}>APAJ</h1>
          <p style={{ color: C.textLight, fontSize: 14, margin: 0 }}>Associação de Proteção e Apoio ao Jogador</p>
        </div>
        {error && <div style={{ background: error.includes('realizado') ? '#e8f5e9' : '#ffebee', color: error.includes('realizado') ? C.success : C.danger, padding: '14px 18px', borderRadius: 12, marginBottom: 24, fontSize: 14, textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', color: C.text, fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Nome completo</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ width: '100%', padding: '14px 18px', border: `2px solid ${C.border}`, borderRadius: 12, fontSize: 16, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', color: C.text, fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Telefone</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', padding: '14px 18px', border: `2px solid ${C.border}`, borderRadius: 12, fontSize: 16, boxSizing: 'border-box' }} />
              </div>
            </>
          )}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', color: C.text, fontWeight: 500, marginBottom: 8, fontSize: 14 }}>E-mail</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={{ width: '100%', padding: '14px 18px', border: `2px solid ${C.border}`, borderRadius: 12, fontSize: 16, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', color: C.text, fontWeight: 500, marginBottom: 8, fontSize: 14 }}>Senha</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} style={{ width: '100%', padding: '14px 18px', border: `2px solid ${C.border}`, borderRadius: 12, fontSize: 16, boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={formLoading} style={{ width: '100%', background: formLoading ? C.textLight : `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`, color: C.white, border: 'none', padding: 16, borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: formLoading ? 'not-allowed' : 'pointer', marginBottom: 20 }}>{formLoading ? 'Aguarde...' : (isSignUp ? 'Criar Conta' : 'Entrar')}</button>
        </form>
        <p style={{ textAlign: 'center', color: C.textLight, fontSize: 14 }}>{isSignUp ? 'Já tem conta?' : 'Não tem conta?'} <button onClick={() => { setIsSignUp(!isSignUp); setError('') }} style={{ background: 'none', border: 'none', color: C.primary, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>{isSignUp ? 'Entrar' : 'Cadastre-se'}</button></p>
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
          <p style={{ color: C.textLight, fontSize: 13, margin: '0 0 8px' }}>Precisa de ajuda urgente?</p>
          <p style={{ color: C.primary, fontSize: 15, fontWeight: 600, margin: 0 }}>📞 CVV: 188 (24h)</p>
        </div>
      </div>
    </div>
  )
}
