import React, { useState, useEffect } from 'react'
import { supabase, checkUserType, signIn, signOut, signUp } from './services/supabase'
import PatientApp from './pages/paciente/PatientApp'
import PsychologistPanel from './pages/psicologo/PsychologistPanel'
import { C } from './theme/colors'

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  border: '1.5px solid #e4edf8',
  borderRadius: 12,
  fontSize: 15,
  boxSizing: 'border-box',
  background: '#f8fafd',
  color: C.blackRobe,
  transition: 'border-color 0.2s',
}

export default function App() {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (e, session) => {
      if (session?.user) {
        setUser(session.user)
        const { type } = await checkUserType(session.user.id)
        setUserType(type)
      } else {
        setUser(null)
        setUserType(null)
      }
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    setIsSuccess(false)
    try {
      if (isSignUp) {
        const { data, error } = await signUp(form.email, form.password, { name: form.name, phone: form.phone })
        if (error) throw error
        if (data.user) {
          await supabase.from('patients').insert({ id: data.user.id, email: form.email, name: form.name, phone: form.phone })
          setError('Cadastro realizado! Verifique seu email.')
          setIsSuccess(true)
          setIsSignUp(false)
        }
      } else {
        const { error } = await signIn(form.email, form.password)
        if (error) throw error
        // onAuthStateChange handles setting user and userType
      }
    } catch (err) {
      setError(err.message || 'Erro ao autenticar')
    } finally {
      setFormLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    setUserType(null)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0d2b5e 0%, #1d3f77 60%, #2a5298 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <img src="/logo-apaj.png" alt="APAJ" style={{ width: 120, filter: 'brightness(0) invert(1)', marginBottom: 24 }} />
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, letterSpacing: 0.3 }}>Carregando...</p>
      </div>
    </div>
  )

  if (user) {
    if (userType === 'psychologist') return <PsychologistPanel user={user} onLogout={handleLogout} />
    return <PatientApp user={user} onLogout={handleLogout} />
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0d2b5e 0%, #1d3f77 55%, #2a5298 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      fontFamily: 'inherit',
    }}>
      {/* Elementos decorativos de fundo */}
      <div style={{ position: 'fixed', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(102,170,226,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -80, left: -80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(102,170,226,0.06)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo + tagline */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src="/logo-apaj.png" alt="APAJ" style={{ width: 160, filter: 'brightness(0) invert(1)', margin: '0 auto 16px' }} />
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, letterSpacing: 0.3, lineHeight: 1.6 }}>
            Associação de Proteção e Apoio ao Jogador
          </p>
        </div>

        {/* Card principal */}
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 24,
          padding: '36px 32px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)',
        }}>
          <h1 style={{ color: C.trueBlue, fontSize: 22, fontWeight: 700, textAlign: 'center', margin: '0 0 6px' }}>
            {isSignUp ? 'Criar sua conta' : 'Bem-vindo de volta'}
          </h1>
          <p style={{ color: C.textSec, fontSize: 14, textAlign: 'center', margin: '0 0 28px', lineHeight: 1.5 }}>
            {isSignUp ? 'Sua jornada de recuperação começa aqui.' : 'Entre para continuar sua jornada.'}
          </p>

          {error && (
            <div style={{
              background: isSuccess ? '#f0fdf4' : '#fef2f2',
              color: isSuccess ? '#16a34a' : '#dc2626',
              border: `1px solid ${isSuccess ? '#bbf7d0' : '#fecaca'}`,
              padding: '12px 16px',
              borderRadius: 12,
              marginBottom: 20,
              fontSize: 13,
              textAlign: 'center',
              lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', color: C.blackRobe, fontWeight: 500, marginBottom: 6, fontSize: 13 }}>Nome completo</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Seu nome"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', color: C.blackRobe, fontWeight: 500, marginBottom: 6, fontSize: 13 }}>Telefone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', color: C.blackRobe, fontWeight: 500, marginBottom: 6, fontSize: 13 }}>E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                placeholder="seu@email.com"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ color: C.blackRobe, fontWeight: 500, fontSize: 13 }}>Senha</label>
                {!isSignUp && (
                  <button type="button" style={{ background: 'none', border: 'none', color: C.alaskanBlue, fontSize: 12, cursor: 'pointer', fontWeight: 500, padding: 0 }}>
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={formLoading}
              style={{
                width: '100%',
                background: formLoading ? '#94a3b8' : 'linear-gradient(135deg, #1d3f77 0%, #2a5298 100%)',
                color: C.white,
                border: 'none',
                padding: '15px 24px',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 600,
                cursor: formLoading ? 'not-allowed' : 'pointer',
                boxShadow: formLoading ? 'none' : '0 4px 16px rgba(29,63,119,0.35)',
                transition: 'all 0.2s',
                letterSpacing: 0.2,
              }}
            >
              {formLoading ? 'Aguarde...' : (isSignUp ? 'Criar Conta' : 'Entrar →')}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: C.textSec, fontSize: 13, marginTop: 20 }}>
            {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setIsSuccess(false) }}
              style={{ background: 'none', border: 'none', color: C.trueBlue, fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0 }}
            >
              {isSignUp ? 'Entrar' : 'Solicite acesso'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 28, lineHeight: 1.6 }}>
          © 2026 APAJ · Apoio gratuito e confidencial
        </p>
      </div>
    </div>
  )
}
