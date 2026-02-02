import React, { useState, useEffect } from 'react'
import { psychologistService } from '../../services/psychologistService'
import { supabase } from '../../services/supabase'

// Cores oficiais APAJ
const C = { 
  trueBlue: '#1d3f77',
  alaskanBlue: '#66aae2',
  iceMelt: '#d4eaff',
  blackRobe: '#2b2b2b',
  blancDeBlanc: '#e9e9ea',
  white: '#ffffff',
  success: '#28a068',
  warning: '#e8a040',
  danger: '#d04040'
}

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

  const card = { background: C.white, borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }
  const btn = { background: C.trueBlue, color: C.white, border: 'none', padding: '12px 24px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }
  const input = { width: '100%', padding: '12px 16px', border: `1px solid ${C.blancDeBlanc}`, borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }

  const Sidebar = () => (
    <aside style={{ width: 260, background: C.trueBlue, minHeight: '100vh', padding: '24px 0', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 24px', marginBottom: 32, textAlign: 'center' }}>
        <img src="/logo-apaj.png" alt="APAJ" style={{ width: 120, height: 'auto', filter: 'brightness(0) invert(1)' }} />
      </div>
      <nav style={{ padding: '0 12px', flex: 1 }}>
        {[{ id: 'dashboard', icon: '📊', label: 'Dashboard' }, { id: 'patients', icon: '👥', label: 'Pacientes' }, { id: 'groups', icon: '🗓️', label: 'Grupos' }, { id: 'requests', icon: '📩', label: 'Solicitações', badge: pending }, { id: 'team', icon: '🏥', label: 'Equipe' }].map(i => (
          <button key={i.id} onClick={() => { setPage(i.id); setSelectedPatient(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: page === i.id ? 'rgba(255,255,255,0.12)' : 'transparent', border: 'none', borderRadius: 10, color: C.white, cursor: 'pointer', marginBottom: 4, position: 'relative', textAlign: 'left', opacity: page === i.id ? 1 : 0.75 }}>
            <span style={{ fontSize: 20 }}>{i.icon}</span><span style={{ fontSize: 14 }}>{i.label}</span>
            {i.badge > 0 && <span style={{ position: 'absolute', right: 12, background: C.danger, color: C.white, fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>{i.badge}</span>}
          </button>
        ))}
      </nav>
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 42, height: 42, background: C.alaskanBlue, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 600 }}>{profile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'PS'}</div>
          <div><p style={{ color: C.white, fontSize: 14, margin: 0 }}>{profile?.name}</p><p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>{profile?.crp}</p></div>
        </div>
        <button onClick={onLogout} style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>Sair</button>
      </div>
    </aside>
  )

  const Dashboard = () => (
    <div>
      <h1 style={{ fontSize: 28, color: C.trueBlue, marginBottom: 32, fontWeight: 600 }}>Olá, {profile?.name?.split(' ')[0]}! 👋</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        {[{ label: 'Pacientes', value: patients.length, icon: '👥', color: C.trueBlue }, { label: 'Alto Risco', value: patients.filter(p => p.risk_level === 'high').length, icon: '⚠️', color: C.danger }, { label: 'Solicitações', value: pending, icon: '📩', color: C.alaskanBlue }, { label: 'Equipe', value: team.length, icon: '🏥', color: C.success }].map((s, i) => (
          <div key={i} style={card}><span style={{ fontSize: 32 }}>{s.icon}</span><p style={{ fontSize: 36, fontWeight: 700, color: s.color, margin: '12px 0 4px' }}>{s.value}</p><p style={{ fontSize: 14, color: C.blackRobe, margin: 0, opacity: 0.6 }}>{s.label}</p></div>
        ))}
      </div>
    </div>
  )

  const Patients = () => (
    <div>
      <h1 style={{ fontSize: 28, color: C.trueBlue, marginBottom: 24, fontWeight: 600 }}>Pacientes</h1>
      <input type="text" placeholder="🔍 Buscar paciente..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...input, marginBottom: 24 }} />
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: C.iceMelt }}><th style={{ padding: '16px 20px', textAlign: 'left', color: C.trueBlue, fontSize: 13, fontWeight: 600 }}>Paciente</th><th style={{ padding: '16px 20px', textAlign: 'left', color: C.trueBlue, fontSize: 13, fontWeight: 600 }}>Telefone</th><th style={{ padding: '16px 20px', textAlign: 'left', color: C.trueBlue, fontSize: 13, fontWeight: 600 }}>Risco</th><th style={{ padding: '16px 20px', textAlign: 'right', color: C.trueBlue, fontSize: 13, fontWeight: 600 }}>Ação</th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderTop: `1px solid ${C.blancDeBlanc}` }}>
                <td style={{ padding: '16px 20px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 42, height: 42, background: C.trueBlue, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 600 }}>{p.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div><div><p style={{ fontWeight: 600, color: C.trueBlue, margin: 0 }}>{p.name}</p><p style={{ fontSize: 12, color: C.blackRobe, margin: 0, opacity: 0.6 }}>{p.email}</p></div></div></td>
                <td style={{ padding: '16px 20px', color: C.blackRobe, opacity: 0.7 }}>{p.phone || '-'}</td>
                <td style={{ padding: '16px 20px' }}><span style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: p.risk_level === 'high' ? '#ffe0e0' : C.iceMelt, color: p.risk_level === 'high' ? C.danger : C.trueBlue }}>{p.risk_level === 'high' ? 'Alto' : 'Baixo'}</span></td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}><button onClick={() => loadPatient(p)} style={{ background: C.iceMelt, border: 'none', padding: '10px 18px', borderRadius: 8, color: C.trueBlue, cursor: 'pointer', fontWeight: 500 }}>Ver Ficha</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p style={{ padding: 48, textAlign: 'center', color: C.blackRobe, opacity: 0.6 }}>Nenhum paciente</p>}
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
        <button onClick={() => { setSelectedPatient(null); setPage('patients') }} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 20, fontWeight: 500 }}>← Voltar</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 80, height: 80, background: C.trueBlue, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 700, fontSize: 28 }}>{p.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
            <div><h1 style={{ fontSize: 28, color: C.trueBlue, margin: 0, fontWeight: 600 }}>{p.name}</h1><p style={{ color: C.blackRobe, margin: '4px 0 0', opacity: 0.6 }}>{p.email} • {p.phone}</p></div>
          </div>
          <button onClick={() => setShowForm(true)} style={btn}>+ Nova Sessão</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={card}><h3 style={{ marginBottom: 16, color: C.trueBlue, fontWeight: 600 }}>Recaídas ({patientRelapses.length})</h3>{patientRelapses.length === 0 ? <p style={{ color: C.blackRobe, opacity: 0.6 }}>Nenhuma 🎉</p> : patientRelapses.slice(0, 5).map(r => <div key={r.id} style={{ padding: 12, background: '#fff8f8', borderRadius: 8, marginBottom: 8, borderLeft: `4px solid ${C.danger}` }}><span style={{ color: C.blackRobe, opacity: 0.6 }}>{new Date(r.date).toLocaleDateString('pt-BR')}</span> - <span style={{ color: C.danger, fontWeight: 600 }}>R$ {r.amount || 0}</span></div>)}</div>
          <div style={card}><h3 style={{ marginBottom: 16, color: C.trueBlue, fontWeight: 600 }}>Sessões ({patientSessions.length})</h3>{patientSessions.length === 0 ? <p style={{ color: C.blackRobe, opacity: 0.6 }}>Nenhuma</p> : patientSessions.slice(0, 5).map(s => <div key={s.id} style={{ padding: 12, background: C.iceMelt, borderRadius: 8, marginBottom: 8 }}><span style={{ color: C.blackRobe, opacity: 0.6 }}>{new Date(s.session_date).toLocaleDateString('pt-BR')}</span><p style={{ margin: '4px 0 0', color: C.trueBlue, fontSize: 14 }}>{s.session_notes?.slice(0, 50) || 'Sem notas'}...</p></div>)}</div>
        </div>
        {showForm && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><div style={{ background: C.white, borderRadius: 20, padding: 32, width: '100%', maxWidth: 500 }}><h2 style={{ marginBottom: 24, color: C.trueBlue, fontWeight: 600 }}>Nova Sessão</h2><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anotações da sessão..." style={{ ...input, minHeight: 150, marginBottom: 24 }} /><div style={{ display: 'flex', gap: 12 }}><button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 14, background: C.blancDeBlanc, border: 'none', borderRadius: 10, cursor: 'pointer' }}>Cancelar</button><button onClick={save} disabled={saving} style={{ ...btn, flex: 1 }}>{saving ? 'Salvando...' : 'Salvar'}</button></div></div></div>}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}><h1 style={{ fontSize: 28, color: C.trueBlue, margin: 0, fontWeight: 600 }}>Grupos</h1><button onClick={() => setShowForm(true)} style={btn}>+ Novo Grupo</button></div>
        {groups.length === 0 ? <div style={{ ...card, textAlign: 'center', padding: 60 }}><p style={{ color: C.blackRobe, fontSize: 16, opacity: 0.6 }}>Nenhum grupo</p></div> : groups.map(g => <div key={g.id} style={{ ...card, marginBottom: 16 }}><h3 style={{ color: C.trueBlue, margin: '0 0 8px', fontWeight: 600 }}>{g.name}</h3><p style={{ color: C.blackRobe, margin: 0, opacity: 0.6 }}>{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][g.day_of_week]} às {g.time?.slice(0, 5)}</p>{g.meeting_link && <a href={g.meeting_link} target="_blank" rel="noopener noreferrer" style={{ color: C.alaskanBlue, display: 'inline-block', marginTop: 12, fontWeight: 500 }}>Abrir reunião →</a>}</div>)}
        {showForm && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><div style={{ background: C.white, borderRadius: 20, padding: 32, width: '100%', maxWidth: 400 }}><h2 style={{ marginBottom: 24, color: C.trueBlue, fontWeight: 600 }}>Novo Grupo</h2><input type="text" placeholder="Nome do grupo" value={name} onChange={e => setName(e.target.value)} style={{ ...input, marginBottom: 16 }} /><select value={day} onChange={e => setDay(parseInt(e.target.value))} style={{ ...input, marginBottom: 16 }}>{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => <option key={i} value={i}>{d}</option>)}</select><input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ ...input, marginBottom: 16 }} /><input type="url" placeholder="Link da reunião" value={link} onChange={e => setLink(e.target.value)} style={{ ...input, marginBottom: 24 }} /><div style={{ display: 'flex', gap: 12 }}><button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 14, background: C.blancDeBlanc, border: 'none', borderRadius: 10, cursor: 'pointer' }}>Cancelar</button><button onClick={create} disabled={saving || !name} style={{ ...btn, flex: 1 }}>{saving ? '...' : 'Criar'}</button></div></div></div>}
      </div>
    )
  }

  const Requests = () => {
    const update = async (id, status) => { await psychologistService.updateContactRequest(id, { status }, user.id); const { data } = await psychologistService.getContactRequests(); setContactRequests(data || []) }
    return (
      <div>
        <h1 style={{ fontSize: 28, color: C.trueBlue, marginBottom: 24, fontWeight: 600 }}>Solicitações</h1>
        {contactRequests.length === 0 ? <div style={{ ...card, textAlign: 'center', padding: 60 }}><p style={{ color: C.blackRobe, opacity: 0.6 }}>Nenhuma solicitação</p></div> : contactRequests.map(r => <div key={r.id} style={{ ...card, marginBottom: 16, borderLeft: `4px solid ${r.urgency === 'urgent' ? C.warning : C.alaskanBlue}`, opacity: r.status === 'pending' ? 1 : 0.6 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><h3 style={{ color: C.trueBlue, margin: 0, fontWeight: 600 }}>{r.name}</h3><span style={{ color: C.blackRobe, fontSize: 13, opacity: 0.6 }}>{new Date(r.created_at).toLocaleDateString('pt-BR')}</span></div><p style={{ color: C.blackRobe, margin: '0 0 12px', opacity: 0.6 }}>{r.phone} • {r.email}</p>{r.message && <p style={{ background: C.iceMelt, padding: 12, borderRadius: 8, margin: '0 0 16px', color: C.trueBlue }}>"{r.message}"</p>}{r.status === 'pending' && <div style={{ display: 'flex', gap: 12 }}><button onClick={() => update(r.id, 'contacted')} style={{ ...btn, flex: 1, padding: 10 }}>Contatado</button><button onClick={() => update(r.id, 'archived')} style={{ flex: 1, padding: 10, background: C.blancDeBlanc, border: 'none', borderRadius: 10, cursor: 'pointer' }}>Arquivar</button></div>}</div>)}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}><h1 style={{ fontSize: 28, color: C.trueBlue, margin: 0, fontWeight: 600 }}>Equipe</h1><button onClick={() => setShowForm(true)} style={btn}>+ Novo Psicólogo</button></div>
        {team.map(p => <div key={p.id} style={{ ...card, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}><div style={{ width: 56, height: 56, background: C.trueBlue, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 600, fontSize: 18 }}>{p.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div><div><h3 style={{ color: C.trueBlue, margin: '0 0 4px', fontWeight: 600 }}>{p.name}</h3><p style={{ color: C.blackRobe, margin: 0, fontSize: 14, opacity: 0.6 }}>{p.crp} • {p.email}</p></div></div>)}
        {showForm && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><div style={{ background: C.white, borderRadius: 20, padding: 32, width: '100%', maxWidth: 400 }}><h2 style={{ marginBottom: 24, color: C.trueBlue, fontWeight: 600 }}>Novo Psicólogo</h2><input type="text" placeholder="Nome completo" value={name} onChange={e => setName(e.target.value)} style={{ ...input, marginBottom: 16 }} /><input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ ...input, marginBottom: 16 }} /><input type="text" placeholder="CRP" value={crp} onChange={e => setCrp(e.target.value)} style={{ ...input, marginBottom: 16 }} /><input type="tel" placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} style={{ ...input, marginBottom: 24 }} /><div style={{ display: 'flex', gap: 12 }}><button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 14, background: C.blancDeBlanc, border: 'none', borderRadius: 10, cursor: 'pointer' }}>Cancelar</button><button onClick={create} disabled={saving} style={{ ...btn, flex: 1 }}>{saving ? '...' : 'Cadastrar'}</button></div></div></div>}
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

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.iceMelt }}><p style={{ color: C.trueBlue }}>Carregando...</p></div>

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: C.iceMelt, minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 260, padding: '32px 40px' }}>{renderPage()}</main>
    </div>
  )
}
