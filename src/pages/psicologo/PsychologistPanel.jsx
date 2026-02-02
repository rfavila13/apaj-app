import React, { useState, useEffect } from 'react'
import { psychologistService } from '../../services/psychologistService'
import { supabase } from '../../services/supabase'

const C = { primary: '#1a3a6a', dark: '#0f2847', accent: '#5b9bd5', success: '#28a068', warning: '#e8a040', danger: '#d04040', light: '#f0f4f8', border: '#d0d8e0', text: '#1a2a3a', textLight: '#5a6a7a', white: '#fff' }

export default function PsychologistPanel({ user, onLogout }) {
  const [page, setPage] = useState('dashboard')
  const [profile, setProfile] = useState(null)
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientRelapses, setPatientRelapses] = useState([])
  const [patientSessions, setPatientSessions] = useState([])
  const [contactRequests, setContactRequests] = useState([])
  const [groups, setGroups] = useState([])
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadData() }, [user])

  const loadData = async () => {
    try {
      const [pr, pa, req, gr, tm] = await Promise.all([
        psychologistService.getMyProfile(user.id),
        psychologistService.getAllPatients(),
        psychologistService.getContactRequests(),
        psychologistService.getMyGroups(user.id),
        supabase.from('psychologists').select('*').order('name')
      ])
      setProfile(pr.data)
      setPatients(pa.data || [])
      setContactRequests(req.data || [])
      setGroups(gr.data || [])
      setTeam(tm.data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const loadPatient = async (p) => {
    setSelectedPatient(p)
    setPage('patient')
    const [r, s] = await Promise.all([psychologistService.getPatientRelapses(p.id), psychologistService.getPatientSessions(p.id)])
    setPatientRelapses(r.data || [])
    setPatientSessions(s.data || [])
  }

  const pending = contactRequests.filter(r => r.status === 'pending').length
  const filtered = patients.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()))

  const card = { background: C.white, borderRadius: 16, padding: 24, boxShadow: '0 2px 15px rgba(0,0,0,0.05)' }
  const btn = { background: `linear-gradient(135deg, ${C.primary} 0%, ${C.dark} 100%)`, color: C.white, border: 'none', padding: '12px 24px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }
  const input = { width: '100%', padding: '12px 16px', border: `2px solid ${C.border}`, borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }

  const Sidebar = () => (
    <aside style={{ width: 260, background: `linear-gradient(180deg, ${C.primary} 0%, ${C.dark} 100%)`, minHeight: '100vh', padding: '24px 0', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 24px', marginBottom: 36, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 50, height: 50, background: 'rgba(255,255,255,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🤝</div>
        <div><h1 style={{ color: C.white, fontSize: 22, margin: 0, fontWeight: 700 }}>APAJ</h1><p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, margin: 0 }}>Painel Profissional</p></div>
      </div>
      <nav style={{ padding: '0 12px', flex: 1 }}>
        {[{ id: 'dashboard', icon: '📊', label: 'Dashboard' }, { id: 'patients', icon: '👥', label: 'Pacientes' }, { id: 'groups', icon: '🗓️', label: 'Grupos' }, { id: 'requests', icon: '📩', label: 'Solicitações', badge: pending }, { id: 'team', icon: '🏥', label: 'Equipe' }].map(i => (
          <button key={i.id} onClick={() => { setPage(i.id); setSelectedPatient(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: page === i.id ? 'rgba(255,255,255,0.15)' : 'transparent', border: 'none', borderRadius: 10, color: page === i.id ? C.white : 'rgba(255,255,255,0.7)', cursor: 'pointer', marginBottom: 4, position: 'relative', textAlign: 'left' }}>
            <span style={{ fontSize: 20 }}>{i.icon}</span><span style={{ fontSize: 14 }}>{i.label}</span>
            {i.badge > 0 && <span style={{ position: 'absolute', right: 12, background: C.danger, color: C.white, fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>{i.badge}</span>}
          </button>
        ))}
      </nav>
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 42, height: 42, background: C.accent, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 600 }}>{profile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'PS'}</div>
          <div><p style={{ color: C.white, fontSize: 14, margin: 0 }}>{profile?.name}</p><p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>{profile?.crp}</p></div>
        </div>
        <button onClick={onLogout} style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>Sair</button>
      </div>
    </aside>
  )

  const Dashboard = () => (
    <div>
      <h1 style={{ fontSize: 28, color: C.text, marginBottom: 32 }}>Olá, {profile?.name?.split(' ')[0]}! 👋</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        {[{ label: 'Pacientes', value: patients.length, icon: '👥', color: C.primary }, { label: 'Alto Risco', value: patients.filter(p => p.risk_level === 'high').length, icon: '⚠️', color: C.danger }, { label: 'Solicitações', value: pending, icon: '📩', color: C.accent }, { label: 'Equipe', value: team.length, icon: '🏥', color: C.success }].map((s, i) => (
          <div key={i} style={card}><span style={{ fontSize: 32 }}>{s.icon}</span><p style={{ fontSize: 36, fontWeight: 700, color: s.color, margin: '12px 0 4px' }}>{s.value}</p><p style={{ fontSize: 14, color: C.textLight, margin: 0 }}>{s.label}</p></div>
        ))}
      </div>
    </div>
  )

  const Patients = () => (
    <div>
      <h1 style={{ fontSize: 28, color: C.text, marginBottom: 24 }}>Pacientes</h1>
      <input type="text" placeholder="🔍 Buscar paciente..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...input, marginBottom: 24 }} />
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: C.light }}><th style={{ padding: '16px 20px', textAlign: 'left', color: C.textLight, fontSize: 13 }}>Paciente</th><th style={{ padding: '16px 20px', textAlign: 'left', color: C.textLight, fontSize: 13 }}>Telefone</th><th style={{ padding: '16px 20px', textAlign: 'left', color: C.textLight, fontSize: 13 }}>Risco</th><th style={{ padding: '16px 20px', textAlign: 'right', color: C.textLight, fontSize: 13 }}>Ação</th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: '16px 20px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 42, height: 42, background: C.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 600 }}>{p.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div><div><p style={{ fontWeight: 600, color: C.text, margin: 0 }}>{p.name}</p><p style={{ fontSize: 12, color: C.textLight, margin: 0 }}>{p.email}</p></div></div></td>
                <td style={{ padding: '16px 20px', color: C.textLight }}>{p.phone || '-'}</td>
                <td style={{ padding: '16px 20px' }}><span style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, background: p.risk_level === 'high' ? '#ffe0e0' : '#e0f0ff', color: p.risk_level === 'high' ? C.danger : C.primary }}>{p.risk_level === 'high' ? 'Alto' : 'Baixo'}</span></td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}><button onClick={() => loadPatient(p)} style={{ background: C.light, border: 'none', padding: '10px 18px', borderRadius: 8, color: C.primary, cursor: 'pointer' }}>Ver Ficha</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p style={{ padding: 48, textAlign: 'center', color: C.textLight }}>Nenhum paciente</p>}
      </div>
    </div>
  )

  const Patient = () => {
    const [showForm, setShowForm] = useState(false)
    const [notes, setNotes] = useState('')
    const [saving, setSaving] = useState(false)
    const p = selectedPatient
    if (!p) return null
    const save = async () => {
      setSaving(true)
      try { await psychologistService.createSession({ patient_id: p.id, psychologist_id: user.id, session_date: new Date().toISOString().split('T')[0], session_type: 'regular', session_notes: notes, status: 'completed' }); const { data } = await psychologistService.getPatientSessions(p.id); setPatientSessions(data || []); setShowForm(false); setNotes('') }
      catch (e) { alert('Erro: ' + e.message) }
      finally { setSaving(false) }
    }
    return (
      <div>
        <button onClick={() => { setSelectedPatient(null); setPage('patients') }} style={{ background: 'none', border: 'none', color: C.primary, cursor: 'pointer', marginBottom: 20 }}>← Voltar</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 80, height: 80, background: C.primary, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 700, fontSize: 28 }}>{p.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
            <div><h1 style={{ fontSize: 28, color: C.text, margin: 0 }}>{p.name}</h1><p style={{ color: C.textLight, margin: '4px 0 0' }}>{p.email} • {p.phone}</p></div>
          </div>
          <button onClick={() => setShowForm(true)} style={btn}>+ Nova Sessão</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={card}><h3 style={{ marginBottom: 16, color: C.text }}>Recaídas ({patientRelapses.length})</h3>{patientRelapses.length === 0 ? <p style={{ color: C.textLight }}>Nenhuma 🎉</p> : patientRelapses.slice(0, 5).map(r => <div key={r.id} style={{ padding: 12, background: '#fff8f8', borderRadius: 8, marginBottom: 8, borderLeft: `4px solid ${C.danger}` }}><span style={{ color: C.textLight }}>{new Date(r.date).toLocaleDateString('pt-BR')}</span> - <span style={{ color: C.danger }}>R$ {r.amount || 0}</span></div>)}</div>
          <div style={card}><h3 style={{ marginBottom: 16, color: C.text }}>Sessões ({patientSessions.length})</h3>{patientSessions.length === 0 ? <p style={{ color: C.textLight }}>Nenhuma</p> : patientSessions.slice(0, 5).map(s => <div key={s.id} style={{ padding: 12, background: C.light, borderRadius: 8, marginBottom: 8 }}><span style={{ color: C.textLight }}>{new Date(s.session_date).toLocaleDateString('pt-BR')}</span><p style={{ margin: '4px 0 0', color: C.text, fontSize: 14 }}>{s.session_notes?.slice(0, 50) || 'Sem notas'}...</p></div>)}</div>
        </div>
        {showForm && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><div style={{ background: C.white, borderRadius: 20, padding: 32, width: '100%', maxWidth: 500 }}><h2 style={{ marginBottom: 24, color: C.text }}>Nova Sessão</h2><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anotações da sessão..." style={{ ...input, minHeight: 150, marginBottom: 24 }} /><div style={{ display: 'flex', gap: 12 }}><button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 14, background: C.light, border: 'none', borderRadius: 10, cursor: 'pointer' }}>Cancelar</button><button onClick={save} disabled={saving} style={{ ...btn, flex: 1 }}>{saving ? 'Salvando...' : 'Salvar'}</button></div></div></div>}
      </div>
    )
  }

  const Groups = () => {
    const [showForm, setShowForm] = useState(false)
    const [name, setName] = useState('')
    const [day, setDay] = useState(1)
    const [time, setTime] = useState('19:00')
    const [link, setLink] = useState('')
    const [saving, setSaving] = useState(false)
    const create = async () => { setSaving(true); try { await psychologistService.createGroup({ name, day_of_week: day, time, meeting_link: link, psychologist_id: user.id, is_active: true, max_participants: 12 }); const { data } = await psychologistService.getMyGroups(user.id); setGroups(data || []); setShowForm(false); setName('') } catch (e) { alert('Erro: ' + e.message) } finally { setSaving(false) } }
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}><h1 style={{ fontSize: 28, color: C.text, margin: 0 }}>Grupos</h1><button onClick={() => setShowForm(true)} style={btn}>+ Novo Grupo</button></div>
        {groups.length === 0 ? <div style={{ ...card, textAlign: 'center', padding: 60 }}><p style={{ color: C.textLight, fontSize: 16 }}>Nenhum grupo</p></div> : groups.map(g => <div key={g.id} style={{ ...card, marginBottom: 16 }}><h3 style={{ color: C.text, margin: '0 0 8px' }}>{g.name}</h3><p style={{ color: C.textLight, margin: 0 }}>{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][g.day_of_week]} às {g.time?.slice(0, 5)}</p>{g.meeting_link && <a href={g.meeting_link} target="_blank" rel="noopener noreferrer" style={{ color: C.primary, display: 'inline-block', marginTop: 12 }}>Abrir reunião →</a>}</div>)}
        {showForm && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><div style={{ background: C.white, borderRadius: 20, padding: 32, width: '100%', maxWidth: 400 }}><h2 style={{ marginBottom: 24, color: C.text }}>Novo Grupo</h2><input type="text" placeholder="Nome do grupo" value={name} onChange={e => setName(e.target.value)} style={{ ...input, marginBottom: 16 }} /><select value={day} onChange={e => setDay(parseInt(e.target.value))} style={{ ...input, marginBottom: 16 }}>{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => <option key={i} value={i}>{d}</option>)}</select><input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ ...input, marginBottom: 16 }} /><input type="url" placeholder="Link da reunião" value={link} onChange={e => setLink(e.target.value)} style={{ ...input, marginBottom: 24 }} /><div style={{ display: 'flex', gap: 12 }}><button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 14, background: C.light, border: 'none', borderRadius: 10, cursor: 'pointer' }}>Cancelar</button><button onClick={create} disabled={saving || !name} style={{ ...btn, flex: 1 }}>{saving ? '...' : 'Criar'}</button></div></div></div>}
      </div>
    )
  }

  const Requests = () => {
    const update = async (id, status) => { await psychologistService.updateContactRequest(id, { status }, user.id); const { data } = await psychologistService.getContactRequests(); setContactRequests(data || []) }
    return (
      <div>
        <h1 style={{ fontSize: 28, color: C.text, marginBottom: 24 }}>Solicitações</h1>
        {contactRequests.length === 0 ? <div style={{ ...card, textAlign: 'center', padding: 60 }}><p style={{ color: C.textLight }}>Nenhuma solicitação</p></div> : contactRequests.map(r => <div key={r.id} style={{ ...card, marginBottom: 16, borderLeft: `4px solid ${r.urgency === 'urgent' ? C.warning : C.primary}`, opacity: r.status === 'pending' ? 1 : 0.6 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><h3 style={{ color: C.text, margin: 0 }}>{r.name}</h3><span style={{ color: C.textLight, fontSize: 13 }}>{new Date(r.created_at).toLocaleDateString('pt-BR')}</span></div><p style={{ color: C.textLight, margin: '0 0 12px' }}>{r.phone} • {r.email}</p>{r.message && <p style={{ background: C.light, padding: 12, borderRadius: 8, margin: '0 0 16px', color: C.text }}>"{r.message}"</p>}{r.status === 'pending' && <div style={{ display: 'flex', gap: 12 }}><button onClick={() => update(r.id, 'contacted')} style={{ ...btn, flex: 1, padding: 10 }}>Contatado</button><button onClick={() => update(r.id, 'archived')} style={{ flex: 1, padding: 10, background: C.light, border: 'none', borderRadius: 10, cursor: 'pointer' }}>Arquivar</button></div>}</div>)}
      </div>
    )
  }

  const Team = () => {
    const [showForm, setShowForm] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [crp, setCrp] = useState('')
    const [phone, setPhone] = useState('')
    const [saving, setSaving] = useState(false)
    const create = async () => { if (!email || !name || !crp) { alert('Preencha nome, email e CRP'); return } setSaving(true); try { await supabase.from('psychologists').insert({ name, email, crp, phone, is_active: true }); const { data } = await supabase.from('psychologists').select('*').order('name'); setTeam(data || []); setShowForm(false); setName(''); setEmail(''); setCrp(''); setPhone(''); alert('Cadastrado!') } catch (e) { alert('Erro: ' + e.message) } finally { setSaving(false) } }
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}><h1 style={{ fontSize: 28, color: C.text, margin: 0 }}>Equipe</h1><button onClick={() => setShowForm(true)} style={btn}>+ Novo Psicólogo</button></div>
        {team.map(p => <div key={p.id} style={{ ...card, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}><div style={{ width: 56, height: 56, background: C.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 600, fontSize: 18 }}>{p.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div><div><h3 style={{ color: C.text, margin: '0 0 4px' }}>{p.name}</h3><p style={{ color: C.textLight, margin: 0, fontSize: 14 }}>{p.crp} • {p.email}</p></div></div>)}
        {showForm && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><div style={{ background: C.white, borderRadius: 20, padding: 32, width: '100%', maxWidth: 400 }}><h2 style={{ marginBottom: 24, color: C.text }}>Novo Psicólogo</h2><input type="text" placeholder="Nome completo" value={name} onChange={e => setName(e.target.value)} style={{ ...input, marginBottom: 16 }} /><input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ ...input, marginBottom: 16 }} /><input type="text" placeholder="CRP" value={crp} onChange={e => setCrp(e.target.value)} style={{ ...input, marginBottom: 16 }} /><input type="tel" placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} style={{ ...input, marginBottom: 24 }} /><div style={{ display: 'flex', gap: 12 }}><button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 14, background: C.light, border: 'none', borderRadius: 10, cursor: 'pointer' }}>Cancelar</button><button onClick={create} disabled={saving} style={{ ...btn, flex: 1 }}>{saving ? '...' : 'Cadastrar'}</button></div></div></div>}
      </div>
    )
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />
      case 'patients': return <Patients />
      case 'patient': return <Patient />
      case 'groups': return <Groups />
      case 'requests': return <Requests />
      case 'team': return <Team />
      default: return <Dashboard />
    }
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.light }}><p style={{ color: C.primary }}>Carregando...</p></div>

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: C.light, minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 260, padding: '32px 40px' }}>{renderPage()}</main>
    </div>
  )
}
