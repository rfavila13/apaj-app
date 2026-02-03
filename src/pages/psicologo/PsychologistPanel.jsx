import React, { useState, useEffect } from 'react'
import { psychologistService } from '../../services/psychologistService'
import { supabase } from '../../services/supabase'

const C = { 
  trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff', blackRobe: '#2b2b2b',
  blancDeBlanc: '#e9e9ea', white: '#ffffff', success: '#28a068', warning: '#e8a040', danger: '#d04040'
}

const getLevel = (xp) => {
  if (xp >= 15000) return { level: 10, nome: 'Mestre' }
  if (xp >= 10000) return { level: 9, nome: 'Veterano' }
  if (xp >= 7500) return { level: 8, nome: 'Experiente' }
  if (xp >= 5000) return { level: 7, nome: 'Avançado' }
  if (xp >= 2000) return { level: 6, nome: 'Intermediário' }
  if (xp >= 1000) return { level: 5, nome: 'Dedicado' }
  if (xp >= 600) return { level: 4, nome: 'Persistente' }
  if (xp >= 300) return { level: 3, nome: 'Comprometido' }
  if (xp >= 100) return { level: 2, nome: 'Iniciante' }
  return { level: 1, nome: 'Novato' }
}

const CONQUISTAS = [
  { dias: 1, xp: 10 }, { dias: 3, xp: 30 }, { dias: 7, xp: 70 }, { dias: 14, xp: 150 },
  { dias: 30, xp: 300 }, { dias: 60, xp: 600 }, { dias: 90, xp: 1000 }, { dias: 180, xp: 2000 },
  { dias: 365, xp: 5000 }, { dias: 548, xp: 7500 }, { dias: 730, xp: 10000 }
]

export default function PsychologistPanel({ user, onLogout }) {
  const [page, setPage] = useState('dashboard')
  const [profile, setProfile] = useState(null)
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientRelapses, setPatientRelapses] = useState([])
  const [patientSessions, setPatientSessions] = useState([])
  const [patientMoods, setPatientMoods] = useState([])
  const [patientDebts, setPatientDebts] = useState([])
  const [patientPurchases, setPatientPurchases] = useState([])
  const [contactRequests, setContactRequests] = useState([])
  const [groups, setGroups] = useState([])
  const [team, setTeam] = useState([])
  const [selectedTeamMember, setSelectedTeamMember] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [groupMembers, setGroupMembers] = useState([])
  const [groupAttendance, setGroupAttendance] = useState([])
  const [groupInterests, setGroupInterests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [news, setNews] = useState([])

  useEffect(() => { loadData() }, [user])

  const loadData = async () => {
    try {
      const [pr, pa, req, gr, tm, interests] = await Promise.all([
        psychologistService.getMyProfile(user.id),
        psychologistService.getAllPatients(),
        psychologistService.getContactRequests(),
        supabase.from('therapy_groups').select('*').order('name'),
        supabase.from('psychologists').select('*').order('name'),
        supabase.from('group_interest').select('*').order('created_at', { ascending: false })
      ])
      setProfile(pr.data)
      setPatients(pa.data || [])
      setContactRequests(req.data || [])
      setGroups(gr.data || [])
      setTeam(tm.data || [])
      setGroupInterests(interests.data || [])
      setNews([
        { title: 'Número de apostadores problemáticos cresce 30% no Brasil', source: 'G1', date: 'Hoje' },
        { title: 'Governo estuda novas medidas para regular apostas online', source: 'Folha', date: 'Hoje' },
        { title: 'Estudo revela perfil do apostador compulsivo brasileiro', source: 'UOL', date: 'Ontem' },
        { title: 'CAPS registra aumento na procura por tratamento de ludopatia', source: 'Estadão', date: 'Ontem' }
      ])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    if (onLogout) onLogout()
  }

  const loadPatient = async (p) => {
    setSelectedPatient(p)
    setPage('patient')
    const [r, s, moods, debts, purchases] = await Promise.all([
      psychologistService.getPatientRelapses(p.id),
      psychologistService.getPatientSessions(p.id),
      supabase.from('diary_entries').select('mood, created_at').eq('patient_id', p.id).not('mood', 'is', null).order('created_at', { ascending: false }).limit(10),
      supabase.from('patient_debts').select('*').eq('patient_id', p.id),
      supabase.from('patient_purchases').select('*').eq('patient_id', p.id)
    ])
    setPatientRelapses(r.data || [])
    setPatientSessions(s.data || [])
    setPatientMoods(moods.data || [])
    setPatientDebts(debts.data || [])
    setPatientPurchases(purchases.data || [])
  }
  
  const loadGroup = async (g) => {
    setSelectedGroup(g)
    setPage('group-detail')
    const [members, attendance] = await Promise.all([
      supabase.from('group_members').select('*, patients(*)').eq('group_id', g.id),
      supabase.from('session_attendance').select('*').eq('group_id', g.id)
    ])
    setGroupMembers(members.data || [])
    setGroupAttendance(attendance.data || [])
  }

  const calcDays = (soberDate, relapses) => {
    if (!soberDate) return 0
    const start = new Date(soberDate)
    const today = new Date()
    const lastRelapse = relapses?.length ? new Date(Math.max(...relapses.map(r => new Date(r.date)))) : null
    const ref = lastRelapse && lastRelapse > start ? lastRelapse : start
    return Math.floor((today - ref) / 86400000)
  }
  
  const calcXP = (days, savings) => {
    const xpFromDays = CONQUISTAS.filter(c => days >= c.dias).reduce((sum, c) => sum + c.xp, 0)
    return xpFromDays + Math.floor((savings || 0) * 0.1)
  }

  const pending = contactRequests.filter(r => r.status === 'pending').length
  const pendingInterests = groupInterests.filter(i => i.status === 'pending').length
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
        {[
          { id: 'dashboard', icon: '📊', label: 'Dashboard' },
          { id: 'patients', icon: '👥', label: 'Pacientes' },
          { id: 'groups', icon: '🗓️', label: 'Grupos', badge: pendingInterests },
          { id: 'requests', icon: '📩', label: 'Solicitações', badge: pending },
          { id: 'team', icon: '🏥', label: 'Equipe' }
        ].map(i => (
          <button key={i.id} onClick={() => { setPage(i.id); setSelectedPatient(null); setSelectedGroup(null); setSelectedTeamMember(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: page === i.id || page.startsWith(i.id) ? 'rgba(255,255,255,0.12)' : 'transparent', border: 'none', borderRadius: 10, color: C.white, cursor: 'pointer', marginBottom: 4, position: 'relative', textAlign: 'left', opacity: page === i.id || page.startsWith(i.id) ? 1 : 0.75 }}>
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
        <button onClick={handleLogout} style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>Sair</button>
      </div>
    </aside>
  )

  const Dashboard = () => (
    <div>
      <h1 style={{ fontSize: 28, color: C.trueBlue, marginBottom: 32, fontWeight: 600 }}>Olá, {profile?.name?.split(' ')[0]}!</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Pacientes', value: patients.length, icon: '👥', color: C.trueBlue },
          { label: 'Alto Risco', value: patients.filter(p => p.risk_level === 'high').length, icon: '⚠️', color: C.danger },
          { label: 'Solicitações', value: pending, icon: '📩', color: C.alaskanBlue },
          { label: 'Grupos', value: groups.length, icon: '🗓️', color: C.success }
        ].map((s, i) => (
          <div key={i} style={card}><span style={{ fontSize: 32 }}>{s.icon}</span><p style={{ fontSize: 36, fontWeight: 700, color: s.color, margin: '12px 0 4px' }}>{s.value}</p><p style={{ fontSize: 14, color: C.blackRobe, margin: 0, opacity: 0.6 }}>{s.label}</p></div>
        ))}
      </div>
      
      {/* Newsletter de notícias */}
      <div style={{ ...card, marginBottom: 24 }}>
        <h2 style={{ color: C.trueBlue, fontSize: 18, margin: '0 0 16px', fontWeight: 600 }}>Notícias sobre Ludopatia e Apostas</h2>
        {news.map((n, i) => (
          <div key={i} style={{ padding: '12px 0', borderBottom: i < news.length - 1 ? `1px solid ${C.blancDeBlanc}` : 'none' }}>
            <h3 style={{ color: C.blackRobe, fontSize: 14, margin: '0 0 4px', fontWeight: 500 }}>{n.title}</h3>
            <p style={{ color: C.blackRobe, fontSize: 12, margin: 0, opacity: 0.5 }}>{n.source} • {n.date}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const Patients = () => (
    <div>
      <h1 style={{ fontSize: 28, color: C.trueBlue, marginBottom: 24, fontWeight: 600 }}>Pacientes</h1>
      <input type="text" placeholder="Buscar paciente..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...input, marginBottom: 24 }} />
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: C.iceMelt }}><th style={{ padding: '16px 20px', textAlign: 'left', color: C.trueBlue, fontSize: 13 }}>Paciente</th><th style={{ padding: '16px 20px', textAlign: 'left', color: C.trueBlue, fontSize: 13 }}>Telefone</th><th style={{ padding: '16px 20px', textAlign: 'left', color: C.trueBlue, fontSize: 13 }}>Risco</th><th style={{ padding: '16px 20px', textAlign: 'right', color: C.trueBlue, fontSize: 13 }}>Ação</th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderTop: `1px solid ${C.blancDeBlanc}` }}>
                <td style={{ padding: '16px 20px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 42, height: 42, background: C.trueBlue, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 600 }}>{p.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div><div><p style={{ fontWeight: 600, color: C.trueBlue, margin: 0 }}>{p.name}</p><p style={{ fontSize: 12, color: C.blackRobe, margin: 0, opacity: 0.6 }}>{p.email}</p></div></div></td>
                <td style={{ padding: '16px 20px', color: C.blackRobe, opacity: 0.7 }}>{p.phone || '-'}</td>
                <td style={{ padding: '16px 20px' }}><span style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, background: p.risk_level === 'high' ? '#ffe0e0' : C.iceMelt, color: p.risk_level === 'high' ? C.danger : C.trueBlue }}>{p.risk_level === 'high' ? 'Alto' : 'Baixo'}</span></td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}><button onClick={() => loadPatient(p)} style={{ background: C.iceMelt, border: 'none', padding: '10px 18px', borderRadius: 8, color: C.trueBlue, cursor: 'pointer' }}>Ver Ficha</button></td>
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
    
    const days = calcDays(p.sober_start_date, patientRelapses)
    const savings = p.previous_gambling_amount ? days * (p.previous_gambling_amount / 30) : 0
    const xp = calcXP(days, savings)
    const level = getLevel(xp)
    
    const save = async () => {
      setSaving(true)
      try { 
        await psychologistService.createSession({ patient_id: p.id, psychologist_id: user.id, session_date: new Date().toISOString().split('T')[0], session_type: 'regular', session_notes: notes, status: 'completed' })
        const { data } = await psychologistService.getPatientSessions(p.id)
        setPatientSessions(data || [])
        setShowForm(false)
        setNotes('')
      } catch (e) { alert('Erro: ' + e.message) }
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
        
        {/* Status do paciente */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <div style={card}><p style={{ color: C.blackRobe, fontSize: 13, margin: '0 0 4px', opacity: 0.6 }}>Dias sem jogar</p><p style={{ color: C.trueBlue, fontSize: 28, fontWeight: 700, margin: 0 }}>{days}</p></div>
          <div style={card}><p style={{ color: C.blackRobe, fontSize: 13, margin: '0 0 4px', opacity: 0.6 }}>Economizado</p><p style={{ color: C.success, fontSize: 28, fontWeight: 700, margin: 0 }}>R$ {Math.floor(savings).toLocaleString('pt-BR')}</p></div>
          <div style={card}><p style={{ color: C.blackRobe, fontSize: 13, margin: '0 0 4px', opacity: 0.6 }}>Level</p><p style={{ color: C.alaskanBlue, fontSize: 28, fontWeight: 700, margin: 0 }}>{level.level}</p><p style={{ color: C.blackRobe, fontSize: 12, margin: 0, opacity: 0.5 }}>{level.nome}</p></div>
          <div style={card}><p style={{ color: C.blackRobe, fontSize: 13, margin: '0 0 4px', opacity: 0.6 }}>XP Total</p><p style={{ color: C.warning, fontSize: 28, fontWeight: 700, margin: 0 }}>{xp}</p></div>
        </div>
        
        {/* Humor recente */}
        {patientMoods.length > 0 && (
          <div style={{ ...card, marginBottom: 24 }}>
            <h3 style={{ color: C.trueBlue, margin: '0 0 16px', fontWeight: 600 }}>Humor Recente (Diário)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {patientMoods.map((m, i) => (
                <div key={i} style={{ background: m.mood === 'Muito bem' || m.mood === 'Bem' ? '#e8f5e9' : m.mood === 'Neutro' ? C.iceMelt : '#ffebee', padding: '6px 12px', borderRadius: 20, fontSize: 12 }}>
                  <span style={{ color: m.mood === 'Muito bem' || m.mood === 'Bem' ? C.success : m.mood === 'Neutro' ? C.trueBlue : C.danger }}>{m.mood}</span>
                  <span style={{ color: C.blackRobe, opacity: 0.5, marginLeft: 6 }}>{new Date(m.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Conquistas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div style={card}>
            <h3 style={{ marginBottom: 16, color: C.trueBlue, fontWeight: 600 }}>Dívidas Quitadas ({patientDebts.length})</h3>
            {patientDebts.length === 0 ? <p style={{ color: C.blackRobe, opacity: 0.6 }}>Nenhuma registrada</p> : patientDebts.slice(0, 3).map(d => (
              <div key={d.id} style={{ padding: '8px 0', borderBottom: `1px solid ${C.blancDeBlanc}` }}>
                <span style={{ color: C.blackRobe }}>{d.description}</span>
                <span style={{ color: C.success, float: 'right', fontWeight: 600 }}>R$ {d.amount?.toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
          <div style={card}>
            <h3 style={{ marginBottom: 16, color: C.trueBlue, fontWeight: 600 }}>Conquistas Pessoais ({patientPurchases.length})</h3>
            {patientPurchases.length === 0 ? <p style={{ color: C.blackRobe, opacity: 0.6 }}>Nenhuma registrada</p> : patientPurchases.slice(0, 3).map(p => (
              <div key={p.id} style={{ padding: '8px 0', borderBottom: `1px solid ${C.blancDeBlanc}` }}>
                <span style={{ color: C.blackRobe }}>{p.description}</span>
                {p.amount > 0 && <span style={{ color: C.alaskanBlue, float: 'right', fontWeight: 600 }}>R$ {p.amount?.toLocaleString('pt-BR')}</span>}
              </div>
            ))}
          </div>
        </div>
        
        {/* Recaídas e Sessões */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={card}><h3 style={{ marginBottom: 16, color: C.trueBlue, fontWeight: 600 }}>Recaídas ({patientRelapses.length})</h3>{patientRelapses.length === 0 ? <p style={{ color: C.blackRobe, opacity: 0.6 }}>Nenhuma</p> : patientRelapses.slice(0, 5).map(r => <div key={r.id} style={{ padding: 12, background: '#fff8f8', borderRadius: 8, marginBottom: 8, borderLeft: `4px solid ${C.danger}` }}><span style={{ color: C.blackRobe, opacity: 0.6 }}>{new Date(r.date).toLocaleDateString('pt-BR')}</span> - <span style={{ color: C.danger, fontWeight: 600 }}>R$ {r.amount || 0}</span></div>)}</div>
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
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    
    const create = async () => { 
      setSaving(true)
      try { 
        await supabase.from('therapy_groups').insert({ name, day_of_week: day, time, meeting_link: link, psychologist_id: user.id, is_active: true, max_participants: 12 })
        await loadData()
        setShowForm(false)
        setName('')
      } catch (e) { alert('Erro: ' + e.message) }
      finally { setSaving(false) }
    }
    
    const handleInterest = async (interest, action) => {
      if (action === 'accept') {
        // Adicionar ao grupo (simplificado - em produção teria seleção de grupo)
        await supabase.from('group_interest').update({ status: 'accepted' }).eq('id', interest.id)
      } else {
        await supabase.from('group_interest').update({ status: 'rejected' }).eq('id', interest.id)
      }
      await loadData()
    }
    
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}><h1 style={{ fontSize: 28, color: C.trueBlue, margin: 0, fontWeight: 600 }}>Grupos</h1><button onClick={() => setShowForm(true)} style={btn}>+ Novo Grupo</button></div>
        
        {/* Interesses pendentes */}
        {groupInterests.filter(i => i.status === 'pending').length > 0 && (
          <div style={{ ...card, marginBottom: 24, borderLeft: `4px solid ${C.warning}` }}>
            <h3 style={{ color: C.trueBlue, margin: '0 0 16px', fontWeight: 600 }}>Interessados em Participar ({groupInterests.filter(i => i.status === 'pending').length})</h3>
            {groupInterests.filter(i => i.status === 'pending').map(interest => (
              <div key={interest.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${C.blancDeBlanc}` }}>
                <div>
                  <p style={{ color: C.trueBlue, margin: 0, fontWeight: 500 }}>{interest.patient_name}</p>
                  <p style={{ color: C.blackRobe, margin: 0, fontSize: 12, opacity: 0.6 }}>{interest.patient_email}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleInterest(interest, 'accept')} style={{ background: C.success, color: C.white, border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Aceitar</button>
                  <button onClick={() => handleInterest(interest, 'reject')} style={{ background: C.blancDeBlanc, color: C.blackRobe, border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Recusar</button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {groups.length === 0 ? <div style={{ ...card, textAlign: 'center', padding: 60 }}><p style={{ color: C.blackRobe, fontSize: 16, opacity: 0.6 }}>Nenhum grupo</p></div> : groups.map(g => (
          <button key={g.id} onClick={() => loadGroup(g)} style={{ ...card, marginBottom: 16, width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none' }}>
            <h3 style={{ color: C.trueBlue, margin: '0 0 8px', fontWeight: 600 }}>{g.name}</h3>
            <p style={{ color: C.blackRobe, margin: 0, opacity: 0.6 }}>{diasSemana[g.day_of_week]} às {g.time?.slice(0, 5)}</p>
          </button>
        ))}
        
        {showForm && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><div style={{ background: C.white, borderRadius: 20, padding: 32, width: '100%', maxWidth: 400 }}><h2 style={{ marginBottom: 24, color: C.trueBlue, fontWeight: 600 }}>Novo Grupo</h2><input type="text" placeholder="Nome do grupo" value={name} onChange={e => setName(e.target.value)} style={{ ...input, marginBottom: 16 }} /><select value={day} onChange={e => setDay(parseInt(e.target.value))} style={{ ...input, marginBottom: 16 }}>{diasSemana.map((d, i) => <option key={i} value={i}>{d}</option>)}</select><input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ ...input, marginBottom: 16 }} /><input type="url" placeholder="Link da reunião" value={link} onChange={e => setLink(e.target.value)} style={{ ...input, marginBottom: 24 }} /><div style={{ display: 'flex', gap: 12 }}><button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 14, background: C.blancDeBlanc, border: 'none', borderRadius: 10, cursor: 'pointer' }}>Cancelar</button><button onClick={create} disabled={saving || !name} style={{ ...btn, flex: 1 }}>{saving ? '...' : 'Criar'}</button></div></div></div>}
      </div>
    )
  }
  
  const GroupDetail = () => {
    const g = selectedGroup
    if (!g) return null
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    
    // Calcular presenças por paciente
    const presenceByPatient = {}
    groupAttendance.forEach(a => {
      if (!presenceByPatient[a.patient_id]) presenceByPatient[a.patient_id] = { confirmed: 0, absent: 0 }
      if (a.status === 'confirmed') presenceByPatient[a.patient_id].confirmed++
      else presenceByPatient[a.patient_id].absent++
    })
    
    const totalSessions = new Set(groupAttendance.map(a => a.session_date)).size
    
    return (
      <div>
        <button onClick={() => { setSelectedGroup(null); setPage('groups') }} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 20, fontWeight: 500 }}>← Voltar</button>
        
        <div style={{ ...card, marginBottom: 24, background: C.trueBlue, color: C.white }}>
          <h1 style={{ fontSize: 24, margin: '0 0 8px', fontWeight: 600 }}>{g.name}</h1>
          <p style={{ fontSize: 14, opacity: 0.85, margin: 0 }}>{diasSemana[g.day_of_week]} às {g.time?.slice(0, 5)}</p>
          {g.meeting_link && <a href={g.meeting_link} target="_blank" rel="noopener noreferrer" style={{ color: C.alaskanBlue, display: 'inline-block', marginTop: 12 }}>Abrir link da reunião</a>}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          <div style={card}><p style={{ color: C.blackRobe, fontSize: 13, margin: '0 0 4px', opacity: 0.6 }}>Participantes</p><p style={{ color: C.trueBlue, fontSize: 28, fontWeight: 700, margin: 0 }}>{groupMembers.length}</p></div>
          <div style={card}><p style={{ color: C.blackRobe, fontSize: 13, margin: '0 0 4px', opacity: 0.6 }}>Sessões</p><p style={{ color: C.success, fontSize: 28, fontWeight: 700, margin: 0 }}>{totalSessions}</p></div>
          <div style={card}><p style={{ color: C.blackRobe, fontSize: 13, margin: '0 0 4px', opacity: 0.6 }}>Presenças hoje</p><p style={{ color: C.alaskanBlue, fontSize: 28, fontWeight: 700, margin: 0 }}>{groupAttendance.filter(a => a.session_date === new Date().toISOString().split('T')[0] && a.status === 'confirmed').length}</p></div>
        </div>
        
        <div style={card}>
          <h3 style={{ color: C.trueBlue, margin: '0 0 16px', fontWeight: 600 }}>Participantes</h3>
          {groupMembers.length === 0 ? <p style={{ color: C.blackRobe, opacity: 0.6 }}>Nenhum participante</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: C.iceMelt }}><th style={{ padding: 12, textAlign: 'left', color: C.trueBlue, fontSize: 13 }}>Nome</th><th style={{ padding: 12, textAlign: 'center', color: C.trueBlue, fontSize: 13 }}>Presenças</th><th style={{ padding: 12, textAlign: 'center', color: C.trueBlue, fontSize: 13 }}>Faltas</th><th style={{ padding: 12, textAlign: 'right', color: C.trueBlue, fontSize: 13 }}>Dias sem recaída</th></tr></thead>
              <tbody>
                {groupMembers.map(m => {
                  const patient = m.patients
                  const presence = presenceByPatient[m.patient_id] || { confirmed: 0, absent: 0 }
                  const daysSober = patient?.sober_start_date ? calcDays(patient.sober_start_date, []) : 0
                  return (
                    <tr key={m.id} style={{ borderTop: `1px solid ${C.blancDeBlanc}` }}>
                      <td style={{ padding: 12 }}>{patient?.name || 'N/A'}</td>
                      <td style={{ padding: 12, textAlign: 'center', color: C.success, fontWeight: 600 }}>{presence.confirmed}</td>
                      <td style={{ padding: 12, textAlign: 'center', color: C.danger, fontWeight: 600 }}>{presence.absent}</td>
                      <td style={{ padding: 12, textAlign: 'right', color: C.trueBlue, fontWeight: 600 }}>{daysSober} dias</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    )
  }

  const Requests = () => {
    const [replyTo, setReplyTo] = useState(null)
    const [replyText, setReplyText] = useState('')
    const [sending, setSending] = useState(false)
    
    const update = async (id, status) => { 
      await psychologistService.updateContactRequest(id, { status }, user.id)
      await loadData()
    }
    
    const sendReply = async () => {
      if (!replyText.trim()) return
      setSending(true)
      try {
        // Salvar resposta no banco
        await supabase.from('contact_responses').insert({
          contact_request_id: replyTo.id,
          psychologist_id: user.id,
          message: replyText,
          sent_to_email: replyTo.email
        })
        // Marcar como respondido
        await psychologistService.updateContactRequest(replyTo.id, { status: 'contacted' }, user.id)
        await loadData()
        setReplyTo(null)
        setReplyText('')
        alert('Resposta enviada para ' + replyTo.email)
      } catch (e) { alert('Erro: ' + e.message) }
      finally { setSending(false) }
    }
    
    return (
      <div>
        <h1 style={{ fontSize: 28, color: C.trueBlue, marginBottom: 24, fontWeight: 600 }}>Solicitações</h1>
        {contactRequests.length === 0 ? <div style={{ ...card, textAlign: 'center', padding: 60 }}><p style={{ color: C.blackRobe, opacity: 0.6 }}>Nenhuma solicitação</p></div> : contactRequests.map(r => (
          <div key={r.id} style={{ ...card, marginBottom: 16, borderLeft: `4px solid ${r.urgency === 'urgent' ? C.warning : C.alaskanBlue}`, opacity: r.status === 'pending' ? 1 : 0.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><h3 style={{ color: C.trueBlue, margin: 0, fontWeight: 600 }}>{r.name}</h3><span style={{ color: C.blackRobe, fontSize: 13, opacity: 0.6 }}>{new Date(r.created_at).toLocaleDateString('pt-BR')}</span></div>
            <p style={{ color: C.blackRobe, margin: '0 0 12px', opacity: 0.6 }}>{r.phone} • {r.email}</p>
            {r.message && <p style={{ background: C.iceMelt, padding: 12, borderRadius: 8, margin: '0 0 16px', color: C.trueBlue }}>"{r.message}"</p>}
            {r.status === 'pending' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setReplyTo(r)} style={{ ...btn, flex: 1, padding: 10 }}>Responder</button>
                <button onClick={() => update(r.id, 'contacted')} style={{ flex: 1, padding: 10, background: C.success, color: C.white, border: 'none', borderRadius: 10, cursor: 'pointer' }}>Marcar Contatado</button>
                <button onClick={() => update(r.id, 'archived')} style={{ flex: 1, padding: 10, background: C.blancDeBlanc, border: 'none', borderRadius: 10, cursor: 'pointer' }}>Arquivar</button>
              </div>
            )}
          </div>
        ))}
        
        {replyTo && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: C.white, borderRadius: 20, padding: 32, width: '100%', maxWidth: 500 }}>
              <h2 style={{ marginBottom: 8, color: C.trueBlue, fontWeight: 600 }}>Responder para {replyTo.name}</h2>
              <p style={{ color: C.blackRobe, opacity: 0.6, marginBottom: 20 }}>A resposta será enviada para: {replyTo.email}</p>
              <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Digite sua resposta..." style={{ ...input, minHeight: 150, marginBottom: 24 }} />
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => { setReplyTo(null); setReplyText('') }} style={{ flex: 1, padding: 14, background: C.blancDeBlanc, border: 'none', borderRadius: 10, cursor: 'pointer' }}>Cancelar</button>
                <button onClick={sendReply} disabled={sending} style={{ ...btn, flex: 1 }}>{sending ? 'Enviando...' : 'Enviar Resposta'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const Team = () => {
    const [showForm, setShowForm] = useState(false)
    const [f, setF] = useState({ name: '', email: '', crp: '', phone: '', specialty: '', availability: '', contract_type: '' })
    const [saving, setSaving] = useState(false)
    
    const create = async () => { 
      if (!f.email || !f.name || !f.crp) { alert('Preencha nome, email e CRP'); return }
      setSaving(true)
      try { 
        await supabase.from('psychologists').insert({ ...f, is_active: true, joined_at: new Date().toISOString() })
        await loadData()
        setShowForm(false)
        setF({ name: '', email: '', crp: '', phone: '', specialty: '', availability: '', contract_type: '' })
      } catch (e) { alert('Erro: ' + e.message) }
      finally { setSaving(false) }
    }
    
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}><h1 style={{ fontSize: 28, color: C.trueBlue, margin: 0, fontWeight: 600 }}>Equipe</h1><button onClick={() => setShowForm(true)} style={btn}>+ Novo Psicólogo</button></div>
        {team.map(p => (
          <button key={p.id} onClick={() => { setSelectedTeamMember(p); setPage('team-detail') }} style={{ ...card, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none' }}>
            <div style={{ width: 56, height: 56, background: C.trueBlue, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 600, fontSize: 18 }}>{p.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
            <div><h3 style={{ color: C.trueBlue, margin: '0 0 4px', fontWeight: 600 }}>{p.name}</h3><p style={{ color: C.blackRobe, margin: 0, fontSize: 14, opacity: 0.6 }}>{p.crp} • {p.email}</p></div>
          </button>
        ))}
        
        {showForm && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><div style={{ background: C.white, borderRadius: 20, padding: 32, width: '100%', maxWidth: 450 }}><h2 style={{ marginBottom: 24, color: C.trueBlue, fontWeight: 600 }}>Novo Psicólogo</h2>
          <input type="text" placeholder="Nome completo" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} style={{ ...input, marginBottom: 12 }} />
          <input type="email" placeholder="Email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} style={{ ...input, marginBottom: 12 }} />
          <input type="text" placeholder="CRP" value={f.crp} onChange={e => setF({ ...f, crp: e.target.value })} style={{ ...input, marginBottom: 12 }} />
          <input type="tel" placeholder="Telefone" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} style={{ ...input, marginBottom: 12 }} />
          <input type="text" placeholder="Especialidade" value={f.specialty} onChange={e => setF({ ...f, specialty: e.target.value })} style={{ ...input, marginBottom: 12 }} />
          <input type="text" placeholder="Horários disponíveis" value={f.availability} onChange={e => setF({ ...f, availability: e.target.value })} style={{ ...input, marginBottom: 12 }} />
          <select value={f.contract_type} onChange={e => setF({ ...f, contract_type: e.target.value })} style={{ ...input, marginBottom: 24 }}>
            <option value="">Modo de contratação</option>
            <option value="clt">CLT</option>
            <option value="pj">PJ</option>
            <option value="voluntario">Voluntário</option>
            <option value="estagiario">Estagiário</option>
          </select>
          <div style={{ display: 'flex', gap: 12 }}><button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 14, background: C.blancDeBlanc, border: 'none', borderRadius: 10, cursor: 'pointer' }}>Cancelar</button><button onClick={create} disabled={saving} style={{ ...btn, flex: 1 }}>{saving ? '...' : 'Cadastrar'}</button></div>
        </div></div>}
      </div>
    )
  }
  
  const TeamDetail = () => {
    const p = selectedTeamMember
    if (!p) return null
    
    const memberGroups = groups.filter(g => g.psychologist_id === p.id)
    
    return (
      <div>
        <button onClick={() => { setSelectedTeamMember(null); setPage('team') }} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 20, fontWeight: 500 }}>← Voltar</button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
          <div style={{ width: 100, height: 100, background: C.trueBlue, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 700, fontSize: 36 }}>{p.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
          <div>
            <h1 style={{ fontSize: 28, color: C.trueBlue, margin: '0 0 4px', fontWeight: 600 }}>{p.name}</h1>
            <p style={{ color: C.blackRobe, margin: 0, opacity: 0.6 }}>{p.crp}</p>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div style={card}>
            <h3 style={{ color: C.trueBlue, margin: '0 0 16px', fontWeight: 600 }}>Informações</h3>
            <div style={{ marginBottom: 12 }}><span style={{ color: C.blackRobe, opacity: 0.6, fontSize: 13 }}>Email</span><p style={{ color: C.trueBlue, margin: '4px 0 0' }}>{p.email}</p></div>
            <div style={{ marginBottom: 12 }}><span style={{ color: C.blackRobe, opacity: 0.6, fontSize: 13 }}>Telefone</span><p style={{ color: C.trueBlue, margin: '4px 0 0' }}>{p.phone || 'Não informado'}</p></div>
            <div style={{ marginBottom: 12 }}><span style={{ color: C.blackRobe, opacity: 0.6, fontSize: 13 }}>Especialidade</span><p style={{ color: C.trueBlue, margin: '4px 0 0' }}>{p.specialty || 'Não informada'}</p></div>
            <div style={{ marginBottom: 12 }}><span style={{ color: C.blackRobe, opacity: 0.6, fontSize: 13 }}>Horários</span><p style={{ color: C.trueBlue, margin: '4px 0 0' }}>{p.availability || 'Não informado'}</p></div>
            <div style={{ marginBottom: 12 }}><span style={{ color: C.blackRobe, opacity: 0.6, fontSize: 13 }}>Contratação</span><p style={{ color: C.trueBlue, margin: '4px 0 0' }}>{p.contract_type?.toUpperCase() || 'Não informado'}</p></div>
            <div><span style={{ color: C.blackRobe, opacity: 0.6, fontSize: 13 }}>Entrada</span><p style={{ color: C.trueBlue, margin: '4px 0 0' }}>{p.joined_at ? new Date(p.joined_at).toLocaleDateString('pt-BR') : 'Não informado'}</p></div>
          </div>
          
          <div style={card}>
            <h3 style={{ color: C.trueBlue, margin: '0 0 16px', fontWeight: 600 }}>Grupos Responsável ({memberGroups.length})</h3>
            {memberGroups.length === 0 ? <p style={{ color: C.blackRobe, opacity: 0.6 }}>Nenhum grupo</p> : memberGroups.map(g => (
              <div key={g.id} style={{ padding: '12px 0', borderBottom: `1px solid ${C.blancDeBlanc}` }}>
                <p style={{ color: C.trueBlue, margin: 0, fontWeight: 500 }}>{g.name}</p>
                <p style={{ color: C.blackRobe, margin: '4px 0 0', fontSize: 13, opacity: 0.6 }}>{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][g.day_of_week]} às {g.time?.slice(0, 5)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />
      case 'patients': return <Patients />
      case 'patient': return <Patient />
      case 'groups': return <Groups />
      case 'group-detail': return <GroupDetail />
      case 'requests': return <Requests />
      case 'team': return <Team />
      case 'team-detail': return <TeamDetail />
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
