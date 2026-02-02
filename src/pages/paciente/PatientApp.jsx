import React, { useState, useEffect } from 'react'
import { patientService } from '../../services/patientService'
import { publicService } from '../../services/publicService'

const C = { primary: '#1a3a6a', dark: '#0f2847', accent: '#5b9bd5', success: '#28a068', warning: '#e8a040', danger: '#d04040', light: '#f0f4f8', border: '#d0d8e0', text: '#1a2a3a', textLight: '#5a6a7a', white: '#fff' }

export default function PatientApp({ user, onLogout }) {
  const [page, setPage] = useState('home')
  const [profile, setProfile] = useState(null)
  const [relapses, setRelapses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [user])

  const loadData = async () => {
    try {
      const { data: p } = await patientService.getMyProfile(user.id)
      if (p) setProfile(p)
      const { data: r } = await patientService.getMyRelapses(user.id)
      if (r) setRelapses(r)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const days = profile?.sober_start_date ? patientService.calcDays(profile.sober_start_date, relapses) : 0
  const savings = profile?.sober_start_date && profile?.previous_gambling_amount ? patientService.calcSavings(profile.sober_start_date, profile.previous_gambling_amount, relapses) : { total: 0 }

  const NavBar = () => (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`, padding: '10px 0 12px', display: 'flex', justifyContent: 'space-around', zIndex: 1000, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
      {[{ id: 'home', icon: '🏠', label: 'Início' }, { id: 'progress', icon: '📊', label: 'Progresso' }, { id: 'tips', icon: '💡', label: 'Dicas' }, { id: 'help', icon: '🆘', label: 'Ajuda' }, { id: 'profile', icon: '👤', label: 'Perfil' }].map(i => (
        <button key={i.id} onClick={() => setPage(i.id)} style={{ background: page === i.id ? 'rgba(255,255,255,0.2)' : 'transparent', border: 'none', color: C.white, padding: '8px 14px', borderRadius: 14, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 22 }}>{i.icon}</span>
          <span style={{ fontSize: 10, fontWeight: page === i.id ? 600 : 400 }}>{i.label}</span>
        </button>
      ))}
    </nav>
  )

  const Home = () => (
    <div style={{ padding: 24, paddingBottom: 100 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <img src="/logo-apaj.png" alt="APAJ" style={{ width: 120, height: 'auto', marginBottom: 8 }} />
        <p style={{ color: C.textLight, fontSize: 14 }}>Olá, {profile?.name?.split(' ')[0] || 'Bem-vindo'}! 👋</p>
      </div>
      {profile?.sober_start_date ? (
        <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`, borderRadius: 24, padding: 28, marginBottom: 24, color: C.white }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 56, fontWeight: 700 }}>{days}</span>
            <p style={{ fontSize: 16, opacity: 0.9, margin: '4px 0 0' }}>dias de vitória</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 16, textAlign: 'center' }}>
              <span style={{ fontSize: 22, fontWeight: 700 }}>R$ {savings.total.toLocaleString('pt-BR')}</span>
              <p style={{ fontSize: 12, opacity: 0.85, margin: '4px 0 0' }}>Economizado</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 16, textAlign: 'center' }}>
              <span style={{ fontSize: 22, fontWeight: 700 }}>{relapses.length}</span>
              <p style={{ fontSize: 12, opacity: 0.85, margin: '4px 0 0' }}>Recaídas</p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: C.white, borderRadius: 24, padding: 32, textAlign: 'center', marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <span style={{ fontSize: 48 }}>🌟</span>
          <h2 style={{ color: C.primary, fontSize: 20, marginTop: 16 }}>Comece sua jornada</h2>
          <p style={{ color: C.textLight, fontSize: 14, margin: '12px 0 20px' }}>Configure seu perfil para acompanhar seu progresso</p>
          <button onClick={() => setPage('setup')} style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`, color: C.white, border: 'none', padding: '14px 32px', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>Configurar Agora</button>
        </div>
      )}
      <div style={{ display: 'grid', gap: 14 }}>
        {[{ icon: '💚', title: 'Dicas de Prevenção', desc: 'Estratégias de proteção', p: 'tips', color: '#e8f5e9' }, { icon: '🏥', title: 'Rede de Apoio', desc: 'Recursos e suporte', p: 'help', color: '#fff3e0' }].map((i, idx) => (
          <button key={idx} onClick={() => setPage(i.p)} style={{ background: C.white, border: 'none', borderRadius: 18, padding: 20, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: 32, width: 60, height: 60, background: i.color, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i.icon}</span>
            <div><h3 style={{ color: C.text, fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>{i.title}</h3><p style={{ color: C.textLight, fontSize: 13, margin: 0 }}>{i.desc}</p></div>
          </button>
        ))}
      </div>
    </div>
  )

  const Setup = () => {
    const [f, setF] = useState({ name: profile?.name || '', monthly_income: profile?.monthly_income || '', previous_gambling_amount: profile?.previous_gambling_amount || '', sober_start_date: profile?.sober_start_date || new Date().toISOString().split('T')[0] })
    const [saving, setSaving] = useState(false)
    const save = async () => {
      setSaving(true)
      try { await patientService.updateProfile(user.id, { name: f.name, monthly_income: parseFloat(f.monthly_income) || 0, previous_gambling_amount: parseFloat(f.previous_gambling_amount) || 0, sober_start_date: f.sober_start_date }); await loadData(); setPage('home') }
      catch (e) { alert('Erro: ' + e.message) }
      finally { setSaving(false) }
    }
    return (
      <div style={{ padding: 24, paddingBottom: 100 }}>
        <button onClick={() => setPage('home')} style={{ background: 'none', border: 'none', color: C.primary, fontSize: 15, cursor: 'pointer', marginBottom: 20 }}>← Voltar</button>
        <h1 style={{ color: C.primary, fontSize: 24, marginBottom: 24 }}>Configurar Perfil</h1>
        <div style={{ background: C.white, borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {[{ l: 'Seu nome', k: 'name', t: 'text' }, { l: 'Renda mensal (R$)', k: 'monthly_income', t: 'number' }, { l: 'Quanto gastava/mês em jogos? (R$)', k: 'previous_gambling_amount', t: 'number' }, { l: 'Data de início', k: 'sober_start_date', t: 'date' }].map((i, idx) => (
            <div key={idx} style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: C.text, marginBottom: 8, fontSize: 14 }}>{i.l}</label>
              <input type={i.t} value={f[i.k]} onChange={e => setF({ ...f, [i.k]: e.target.value })} style={{ width: '100%', padding: '14px 16px', border: `2px solid ${C.border}`, borderRadius: 12, fontSize: 16, boxSizing: 'border-box' }} />
            </div>
          ))}
          <button onClick={save} disabled={saving} style={{ width: '100%', background: saving ? C.textLight : `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`, color: C.white, border: 'none', padding: 16, borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </div>
    )
  }

  const Progress = () => {
    const [showForm, setShowForm] = useState(false)
    const [amt, setAmt] = useState('')
    const [note, setNote] = useState('')
    const [saving, setSaving] = useState(false)
    const add = async () => {
      setSaving(true)
      try { await patientService.addRelapse(user.id, { amount: parseFloat(amt) || 0, notes: note }); await loadData(); setShowForm(false); setAmt(''); setNote('') }
      catch (e) { alert('Erro: ' + e.message) }
      finally { setSaving(false) }
    }
    if (!profile?.sober_start_date) return <div style={{ padding: 24, paddingBottom: 100, textAlign: 'center' }}><span style={{ fontSize: 64 }}>📊</span><h2 style={{ color: C.primary, marginTop: 24 }}>Configure seu perfil</h2><button onClick={() => setPage('setup')} style={{ marginTop: 20, background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`, color: C.white, border: 'none', padding: '14px 32px', borderRadius: 12, fontSize: 16, cursor: 'pointer' }}>Configurar</button></div>
    return (
      <div style={{ padding: 24, paddingBottom: 100 }}>
        <h1 style={{ color: C.primary, fontSize: 24, marginBottom: 24, textAlign: 'center' }}>Seu Progresso</h1>
        <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`, borderRadius: 24, padding: 32, textAlign: 'center', marginBottom: 24, color: C.white }}>
          <p style={{ fontSize: 14, opacity: 0.85 }}>Dias sem jogar</p>
          <span style={{ fontSize: 72, fontWeight: 700 }}>{days}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
          <div style={{ background: C.white, borderRadius: 18, padding: 20, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}><span style={{ fontSize: 26 }}>💰</span><p style={{ fontSize: 24, fontWeight: 700, color: C.success, margin: '8px 0 4px' }}>R$ {savings.total.toLocaleString('pt-BR')}</p><p style={{ fontSize: 12, color: C.textLight }}>Economizado</p></div>
          <div style={{ background: C.white, borderRadius: 18, padding: 20, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}><span style={{ fontSize: 26 }}>↩️</span><p style={{ fontSize: 24, fontWeight: 700, color: relapses.length > 0 ? C.warning : C.success, margin: '8px 0 4px' }}>{relapses.length}</p><p style={{ fontSize: 12, color: C.textLight }}>Recaídas</p></div>
        </div>
        {!showForm ? <button onClick={() => setShowForm(true)} style={{ width: '100%', background: C.white, border: `2px solid ${C.warning}`, color: C.warning, padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Registrar Recaída</button> : (
          <div style={{ background: C.white, borderRadius: 18, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: C.text, marginBottom: 12 }}>Registrar Recaída</h3>
            <input type="number" placeholder="Valor gasto (R$)" value={amt} onChange={e => setAmt(e.target.value)} style={{ width: '100%', padding: 12, border: `2px solid ${C.border}`, borderRadius: 10, marginBottom: 12, fontSize: 16, boxSizing: 'border-box' }} />
            <textarea placeholder="O que aconteceu? (opcional)" value={note} onChange={e => setNote(e.target.value)} style={{ width: '100%', padding: 12, border: `2px solid ${C.border}`, borderRadius: 10, marginBottom: 16, fontSize: 14, minHeight: 80, resize: 'none', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 12 }}><button onClick={() => setShowForm(false)} style={{ flex: 1, background: C.light, border: 'none', color: C.textLight, padding: 12, borderRadius: 10, cursor: 'pointer' }}>Cancelar</button><button onClick={add} disabled={saving} style={{ flex: 1, background: C.warning, border: 'none', color: C.white, padding: 12, borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>{saving ? 'Salvando...' : 'Registrar'}</button></div>
          </div>
        )}
      </div>
    )
  }

  const Tips = () => (
    <div style={{ padding: 24, paddingBottom: 100 }}>
      <h1 style={{ color: C.primary, fontSize: 24, marginBottom: 24 }}>Dicas de Prevenção</h1>
      <div style={{ display: 'grid', gap: 14 }}>
        {[{ icon: '🛡️', title: 'Bloqueie o acesso', content: 'Use apps como Gamban ou BetBlocker.' }, { icon: '💳', title: 'Controle financeiro', content: 'Deixe cartões com alguém de confiança.' }, { icon: '⏰', title: 'Identifique gatilhos', content: 'Anote quando sente vontade de jogar.' }, { icon: '🧘', title: 'Substitua o hábito', content: 'Exercícios, hobbies, voluntariado.' }, { icon: '👥', title: 'Rede de apoio', content: 'Conte para pessoas de confiança.' }, { icon: '🆘', title: 'Na hora da fissura', content: 'Respire fundo. A vontade passa em 15-20 min.' }].map((t, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 18, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}><span style={{ fontSize: 28 }}>{t.icon}</span><h3 style={{ color: C.text, fontSize: 16, margin: 0 }}>{t.title}</h3></div>
            <p style={{ color: C.textLight, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{t.content}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const Help = () => {
    const [showForm, setShowForm] = useState(false)
    const [f, setF] = useState({ name: profile?.name || '', phone: profile?.phone || '', message: '' })
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const send = async () => { setSending(true); try { await publicService.sendContactRequest(f); setSent(true) } catch (e) { alert('Erro: ' + e.message) } finally { setSending(false) } }
    if (sent) return <div style={{ padding: 24, paddingBottom: 100, textAlign: 'center' }}><span style={{ fontSize: 64 }}>💙</span><h2 style={{ color: C.primary, margin: '24px 0 16px' }}>Solicitação Enviada!</h2><p style={{ color: C.textLight }}>Em breve entraremos em contato.</p><button onClick={() => { setSent(false); setShowForm(false) }} style={{ marginTop: 24, background: C.primary, color: C.white, border: 'none', padding: '14px 32px', borderRadius: 12, cursor: 'pointer' }}>Voltar</button></div>
    if (showForm) return (
      <div style={{ padding: 24, paddingBottom: 100 }}>
        <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: C.primary, marginBottom: 20, cursor: 'pointer' }}>← Voltar</button>
        <h1 style={{ color: C.primary, fontSize: 24, marginBottom: 24 }}>Falar com Psicólogo</h1>
        <div style={{ background: C.white, borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <input type="text" placeholder="Seu nome" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} style={{ width: '100%', padding: 14, border: `2px solid ${C.border}`, borderRadius: 12, marginBottom: 16, boxSizing: 'border-box' }} />
          <input type="tel" placeholder="Telefone (WhatsApp)" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} style={{ width: '100%', padding: 14, border: `2px solid ${C.border}`, borderRadius: 12, marginBottom: 16, boxSizing: 'border-box' }} />
          <textarea placeholder="Sua mensagem (opcional)" value={f.message} onChange={e => setF({ ...f, message: e.target.value })} style={{ width: '100%', padding: 14, border: `2px solid ${C.border}`, borderRadius: 12, marginBottom: 16, minHeight: 100, resize: 'none', boxSizing: 'border-box' }} />
          <button onClick={send} disabled={sending || !f.phone} style={{ width: '100%', background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`, color: C.white, border: 'none', padding: 16, borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>{sending ? 'Enviando...' : 'Enviar Solicitação'}</button>
        </div>
      </div>
    )
    return (
      <div style={{ padding: 24, paddingBottom: 100 }}>
        <h1 style={{ color: C.primary, fontSize: 24, marginBottom: 24 }}>Rede de Apoio</h1>
        <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`, borderRadius: 20, padding: 24, marginBottom: 20, color: C.white }}>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>🆘 Precisa de ajuda?</h2>
          <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 16 }}>Entre em contato com a equipe APAJ</p>
          <button onClick={() => setShowForm(true)} style={{ background: C.white, color: C.primary, border: 'none', padding: '14px 24px', borderRadius: 12, fontWeight: 600, cursor: 'pointer', width: '100%' }}>Solicitar Conversa</button>
        </div>
        <div style={{ background: C.white, borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h2 style={{ color: C.text, fontSize: 18, marginBottom: 16 }}>🏥 Recursos</h2>
          {[{ icon: '📞', name: 'CVV - Ligue 188', desc: '24 horas' }, { icon: '🧠', name: 'CAPS', desc: 'Centro de Atenção Psicossocial' }, { icon: '🤝', name: 'Jogadores Anônimos', desc: 'jogadoresanonimos.com.br' }].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: C.light, borderRadius: 14, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{r.icon}</span>
              <div><h3 style={{ color: C.text, fontSize: 15, margin: '0 0 2px' }}>{r.name}</h3><p style={{ color: C.textLight, fontSize: 13, margin: 0 }}>{r.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const Profile = () => (
    <div style={{ padding: 24, paddingBottom: 100 }}>
      <h1 style={{ color: C.primary, fontSize: 24, marginBottom: 24 }}>Perfil</h1>
      <div style={{ background: C.white, borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 70, height: 70, background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: C.white, fontWeight: 600 }}>{profile?.name ? profile.name.charAt(0).toUpperCase() : '👤'}</div>
          <div><h2 style={{ color: C.text, fontSize: 20, margin: '0 0 4px' }}>{profile?.name || 'Usuário'}</h2><p style={{ color: C.textLight, fontSize: 14, margin: 0 }}>{user.email}</p></div>
        </div>
        <button onClick={() => setPage('setup')} style={{ width: '100%', padding: 14, background: C.light, border: 'none', borderRadius: 12, cursor: 'pointer', marginBottom: 12, color: C.text }}>⚙️ Editar Configurações</button>
        <button onClick={onLogout} style={{ width: '100%', padding: 14, background: '#ffebee', border: 'none', borderRadius: 12, color: C.danger, cursor: 'pointer' }}>Sair da Conta</button>
      </div>
    </div>
  )

  const renderPage = () => {
    switch (page) {
      case 'home': return <Home />
      case 'setup': return <Setup />
      case 'progress': return <Progress />
      case 'tips': return <Tips />
      case 'help': return <Help />
      case 'profile': return <Profile />
      default: return <Home />
    }
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.light }}><p style={{ color: C.primary }}>Carregando...</p></div>

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: C.light, minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      {renderPage()}
      <NavBar />
    </div>
  )
}
