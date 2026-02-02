import React, { useState, useEffect } from 'react'
import { supabase, checkUserType, signIn, signOut, signUp } from './services/supabase'
import PatientApp from './pages/paciente/PatientApp'
import PsychologistPanel from './pages/psicologo/PsychologistPanel'

// Cores oficiais APAJ
const C = { 
  trueBlue: '#1d3f77',      // Azul principal
  alaskanBlue: '#66aae2',   // Azul claro
  iceMelt: '#d4eaff',       // Azul bem claro (fundo)
  blackRobe: '#2b2b2b',     // Preto
  blancDeBlanc: '#e9e9ea',  // Cinza claro
  white: '#ffffff',
  success: '#28a068',
  danger: '#d04040'
}

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

  if (loading) return <div style={{ minHeight: '100vh', background: C.iceMelt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: C.trueBlue, fontFamily: 'system-ui' }}>Carregando...</p></div>

  if (user) {
    if (userType === 'psychologist') return <PsychologistPanel user={user} onLogout={handleLogout} />
    return <PatientApp user={user} onLogout={handleLogout} />
  }

  return (
    <div style={{ minHeight: '100vh', background: C.iceMelt, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/logo-apaj.png" alt="APAJ" style={{ width: 200, height: 'auto' }} />
        </div>

        {/* Card de Login */}
        <div style={{ background: C.white, borderRadius: 20, padding: '40px 36px', boxShadow: '0 4px 24px rgba(29,63,119,0.1)' }}>
          <h1 style={{ color: C.trueBlue, fontSize: 24, fontWeight: 700, textAlign: 'center', margin: '0 0 8px' }}>Bem-vindo de volta</h1>
          <p style={{ color: C.blackRobe, fontSize: 14, textAlign: 'center', margin: '0 0 28px', opacity: 0.6 }}>Entre com suas credenciais para acessar o painel</p>

          {error && <div style={{ background: error.includes('realizado') ? '#e8f5e9' : '#ffebee', color: error.includes('realizado') ? C.success : C.danger, padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14, textAlign: 'center' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: C.blackRobe, fontWeight: 500, marginBottom: 6, fontSize: 14 }}>Nome completo</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Seu nome" style={{ width: '100%', padding: '14px 16px', border: `1px solid ${C.blancDeBlanc}`, borderRadius: 10, fontSize: 15, boxSizing: 'border-box', background: C.white }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: C.blackRobe, fontWeight: 500, marginBottom: 6, fontSize: 14 }}>Telefone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" style={{ width: '100%', padding: '14px 16px', border: `1px solid ${C.blancDeBlanc}`, borderRadius: 10, fontSize: 15, boxSizing: 'border-box', background: C.white }} />
                </div>
              </>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: C.blackRobe, fontWeight: 500, marginBottom: 6, fontSize: 14 }}>E-mail</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="seu@email.com" style={{ width: '100%', padding: '14px 16px', border: `1px solid ${C.blancDeBlanc}`, borderRadius: 10, fontSize: 15, boxSizing: 'border-box', background: C.white }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ color: C.blackRobe, fontWeight: 500, fontSize: 14 }}>Senha</label>
                {!isSignUp && <a href="#" style={{ color: C.alaskanBlue, fontSize: 13, textDecoration: 'none' }}>Esqueceu a senha?</a>}
              </div>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} placeholder="••••••••" style={{ width: '100%', padding: '14px 16px', border: `1px solid ${C.blancDeBlanc}`, borderRadius: 10, fontSize: 15, boxSizing: 'border-box', background: C.white }} />
            </div>
            <button type="submit" disabled={formLoading} style={{ width: '100%', background: C.trueBlue, color: C.white, border: 'none', padding: 16, borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: formLoading ? 'not-allowed' : 'pointer', opacity: formLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{formLoading ? 'Aguarde...' : (isSignUp ? 'Criar Conta' : 'Entrar')} {!formLoading && <span>→</span>}</button>
          </form>

          <p style={{ textAlign: 'center', color: C.blackRobe, fontSize: 14, marginTop: 24, opacity: 0.7 }}>{isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'} <button onClick={() => { setIsSignUp(!isSignUp); setError('') }} style={{ background: 'none', border: 'none', color: C.trueBlue, fontWeight: 600, cursor: 'pointer' }}>{isSignUp ? 'Entrar' : 'Solicite acesso'}</button></p>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: C.trueBlue, fontSize: 13, marginTop: 32, opacity: 0.6 }}>© 2026 APAJ - Associação de Proteção e Apoio ao Jogador</p>
      </div>
    </div>
  )
}
