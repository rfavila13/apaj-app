import React, { useState, useEffect } from 'react'
import { psychologistService } from '../../services/psychologistService'
import { supabase } from '../../services/supabase'
import { analyzeTriggers, analyzeEscapePatterns } from '../../utils/triggerAnalyzer'

const C = { trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff', blackRobe: '#2b2b2b', blancDeBlanc: '#e9e9ea', white: '#ffffff', success: '#28a068', warning: '#e8a040', danger: '#d04040' }

export default function PsychologistPanel({ user, onLogout }) {
  const [page, setPage] = useState('dashboard')
  const [profile, setProfile] = useState(null)
  const [patients, setPatients] = useState([])
  const [patientsRisk, setPatientsRisk] = useState({})
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientData, setPatientData] = useState({})
  const [contactRequests, setContactRequests] = useState([])
  const [groups, setGroups] = useState([])
  const [groupInterests, setGroupInterests] = useState([])
  const [sosLogs, setSosLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadData() }, [user])

  const loadData = async () => {
    try {
      const [pr, pa, req, gr, interests, sos] = await Promise.all([
        psychologistService.getMyProfile(user.id),
        psychologistService.getAllPatients(),
        psychologistService.getContactRequests(),
        supabase.from('therapy_groups').select('*').order('name'),
        supabase.from('group_interest').select('*').order('created_at', { ascending: false }),
        supabase.from('sos_logs').select('*, patients(name)').order('created_at', { ascending: false }).limit(50)
      ])
      setProfile(pr.data)
      setPatients(pa.data || [])
      setContactRequests(req.data || [])
      setGroups(gr.data || [])
      setGroupInterests(interests.data || [])
      setSosLogs(sos.data || [])
      if (pa.data) calculateRisks(pa.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const calculateRisks = async (patientsList) => {
    const risks = {}
    for (const p of patientsList) {
      const { data: diary } = await supabase.from('diary_entries').select('*').eq('patient_id', p.id).order('created_at', { ascending: false }).limit(5)
      const { data: episodes } = await supabase.from('episodes').select('*').eq('patient_id', p.id)
      const analysis = analyzeTriggers(diary || [])
      const lastEntry = diary?.[0]
      const daysSinceEntry = lastEntry ? Math.floor((new Date() - new Date(lastEntry.created_at)) / 86400000) : 999
      let risk = 'low'
      if (analysis.risk === 'high' || daysSinceEntry > 7 || (episodes?.length > 0 && new Date() - new Date(episodes[0].created_at) < 7 * 86400000)) risk = 'high'
      else if (analysis.risk === 'medium' || daysSinceEntry > 3) risk = 'medium'
      risks[p.id] = { level: risk, analysis, daysSinceEntry, recentEpisode: episodes?.[0] }
    }
    setPatientsRisk(risks)
  }

  const loadPatient = async (p) => {
    setSelectedPatient(p)
    setPage('patient')
    const [relapses, sessions, diary, debts, purchases, episodes, vault, contract, crisis] = await Promise.all([
      psychologistService.getPatientRelapses(p.id),
      psychologistService.getPatientSessions(p.id),
      supabase.from('diary_entries').select('*').eq('patient_id', p.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('patient_debts').select('*').eq('patient_id', p.id),
      supabase.from('patient_purchases').select('*').eq('patient_id', p.id),
      supabase.from('episodes').select('*').eq('patient_id', p.id).order('created_at', { ascending: false }),
      supabase.from('evidence_vault').select('*').eq('patient_id', p.id),
      supabase.from('behavioral_contracts').select('*').eq('patient_id', p.id).single(),
      supabase.from('crisis_plans').select('*').eq('patient_id', p.id).single()
    ])
    const escapePattern = analyzeEscapePatterns(episodes.data || [])
    setPatientData({ relapses: relapses.data || [], sessions: sessions.data || [], diary: diary.data || [], debts: debts.data || [], purchases: purchases.data || [], episodes: episodes.data || [], vault: vault.data || [], contract: contract.data, crisis: crisis.data, escapePattern })
  }

  const sendQuickMessage = async (patientId, template) => {
    const p = patients.find(pt => pt.id === patientId)
    if (!p?.email) return
    const templates = {
      thinking: 'Olá! Estou pensando em você. Como está se sentindo hoje?',
      checkin: 'Percebi que faz alguns dias que você não escreve no diário. Está tudo bem?',
      support: 'Lembre-se: você não está sozinho nessa jornada. Estou aqui se precisar conversar.'
    }
    try {
      await supabase.from('quick_messages').insert({ patient_id: patientId, psychologist_id: user.id, message: templates[template], sent_at: new Date().toISOString() })
      alert('Mensagem enviada!')
    } catch (e) { alert('Erro: ' + e.message) }
  }

  const handleLogout = async () => { await supabase.auth.signOut(); if (onLogout) onLogout() }

  const pending = contactRequests.filter(r => r.status === 'pending').length
  const highRiskCount = Object.values(patientsRisk).filter(r => r.level === 'high').length
  const recentSOS = sosLogs.filter(s => new Date() - new Date(s.created_at) < 24 * 60 * 60 * 1000).length
  const filtered = patients.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()))
  const card = { background: C.white, borderRadius: 14, padding: 20, boxShadow: '0 2px 10px rgba(29,63,119,0.05)' }
  const btn = { background: C.trueBlue, color: C.white, border: 'none', padding: '11px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13 }
  const input = { width: '100%', padding: '11px 14px', border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 13, boxSizing: 'border-box' }

  const Sidebar = () => (
    <aside style={{ width: 240, background: C.trueBlue, minHeight: '100vh', padding: '20px 0', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 20px', marginBottom: 28, textAlign: 'center' }}><img src="/logo-apaj.png" alt="APAJ" style={{ width: 100, filter: 'brightness(0) invert(1)' }} /></div>
      <nav style={{ padding: '0 10px', flex: 1 }}>
        {[{ id: 'dashboard', icon: '📊', label: 'Dashboard' }, { id: 'radar', icon: '🎯', label: 'Radar de Risco', badge: highRiskCount }, { id: 'patients', icon: '👥', label: 'Pacientes' }, { id: 'groups', icon: '🗓️', label: 'Grupos' }, { id: 'requests', icon: '📩', label: 'Solicitações', badge: pending }, { id: 'sos', icon: '🆘', label: 'Alertas SOS', badge: recentSOS }].map(i => (
          <button key={i.id} onClick={() => { setPage(i.id); setSelectedPatient(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: page === i.id ? 'rgba(255,255,255,0.12)' : 'transparent', border: 'none', borderRadius: 10, color: C.white, cursor: 'pointer', marginBottom: 4, position: 'relative', textAlign: 'left', opacity: page === i.id ? 1 : 0.75 }}>
            <span style={{ fontSize: 18 }}>{i.icon}</span><span style={{ fontSize: 13 }}>{i.label}</span>
            {i.badge > 0 && <span style={{ position: 'absolute', right: 10, background: i.id === 'radar' || i.id === 'sos' ? C.danger : C.warning, color: C.white, fontSize: 10, padding: '2px 7px', borderRadius: 10 }}>{i.badge}</span>}
          </button>
        ))}
      </nav>
      <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ color: C.white, fontSize: 13, margin: '0 0 8px' }}>{profile?.name}</p>
        <button onClick={handleLogout} style={{ width: '100%', padding: 9, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 12 }}>Sair</button>
      </div>
    </aside>
  )

  const Dashboard = () => (
    <div>
      <h1 style={{ fontSize: 24, color: C.trueBlue, marginBottom: 24, fontWeight: 600 }}>Olá, {profile?.name?.split(' ')[0]}!</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[{ label: 'Pacientes', value: patients.length, icon: '👥', color: C.trueBlue }, { label: 'Alto Risco', value: highRiskCount, icon: '⚠️', color: C.danger }, { label: 'SOS Hoje', value: recentSOS, icon: '🆘', color: C.warning }, { label: 'Grupos', value: groups.length, icon: '🗓️', color: C.success }].map((s, i) => (
          <div key={i} style={card}><span style={{ fontSize: 28 }}>{s.icon}</span><p style={{ fontSize: 32, fontWeight: 700, color: s.color, margin: '10px 0 4px' }}>{s.value}</p><p style={{ fontSize: 12, color: C.blackRobe, margin: 0, opacity: 0.6 }}>{s.label}</p></div>
        ))}
      </div>
      {recentSOS > 0 && (
        <div style={{ ...card, borderLeft: '4px solid ' + C.danger, marginBottom: 20 }}>
          <h3 style={{ color: C.danger, margin: '0 0 12px', fontSize: 14 }}>🆘 SOS Acionados nas últimas 24h</h3>
          {sosLogs.filter(s => new Date() - new Date(s.created_at) < 24 * 60 * 60 * 1000).map(s => (
            <div key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid ' + C.blancDeBlanc }}><span style={{ color: C.trueBlue, fontWeight: 600 }}>{s.patients?.name || 'Paciente'}</span> - <span style={{ color: C.blackRobe, opacity: 0.6 }}>{new Date(s.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></div>
          ))}
        </div>
      )}
    </div>
  )

  const Radar = () => {
    const sorted = [...patients].sort((a, b) => { const order = { high: 0, medium: 1, low: 2 }; return (order[patientsRisk[a.id]?.level] || 2) - (order[patientsRisk[b.id]?.level] || 2) })
    return (
      <div>
        <h1 style={{ fontSize: 24, color: C.trueBlue, marginBottom: 8, fontWeight: 600 }}>Radar de Risco</h1>
        <p style={{ color: C.blackRobe, opacity: 0.7, marginBottom: 20, fontSize: 13 }}>Monitoramento preditivo baseado em padrões do diário e episódios.</p>
        {sorted.map(p => {
          const risk = patientsRisk[p.id] || { level: 'low' }
          const colors = { high: C.danger, medium: C.warning, low: C.success }
          const labels = { high: 'ALTO', medium: 'MÉDIO', low: 'BAIXO' }
          return (
            <div key={p.id} style={{ ...card, marginBottom: 12, borderLeft: `4px solid ${colors[risk.level]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h3 style={{ color: C.trueBlue, margin: 0, fontSize: 14 }}>{p.name}</h3>
                  <span style={{ background: colors[risk.level] + '20', color: colors[risk.level], padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>{labels[risk.level]}</span>
                </div>
                <p style={{ color: C.blackRobe, opacity: 0.6, margin: 0, fontSize: 12 }}>
                  {risk.daysSinceEntry < 999 ? `Última entrada: ${risk.daysSinceEntry} dia(s)` : 'Sem entradas'}
                  {risk.analysis?.triggers?.length > 0 && ` • Gatilhos: ${risk.analysis.triggers.join(', ')}`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => sendQuickMessage(p.id, 'thinking')} style={{ background: C.iceMelt, border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 11 }} title="Enviar mensagem">💬</button>
                <button onClick={() => loadPatient(p)} style={{ background: C.trueBlue, color: C.white, border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 11 }}>Ver</button>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const Patients = () => (
    <div>
      <h1 style={{ fontSize: 24, color: C.trueBlue, marginBottom: 20, fontWeight: 600 }}>Pacientes</h1>
      <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...input, marginBottom: 20 }} />
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: C.iceMelt }}><th style={{ padding: '14px 16px', textAlign: 'left', color: C.trueBlue, fontSize: 12 }}>Paciente</th><th style={{ padding: '14px 16px', textAlign: 'left', color: C.trueBlue, fontSize: 12 }}>Risco</th><th style={{ padding: '14px 16px', textAlign: 'left', color: C.trueBlue, fontSize: 12 }}>Engajamento</th><th style={{ padding: '14px 16px', textAlign: 'right', color: C.trueBlue, fontSize: 12 }}>Ações</th></tr></thead>
          <tbody>{filtered.map(p => {
            const risk = patientsRisk[p.id] || { level: 'low', daysSinceEntry: 999 }
            const colors = { high: C.danger, medium: C.warning, low: C.success }
            return (
              <tr key={p.id} style={{ borderTop: '1px solid ' + C.blancDeBlanc }}>
                <td style={{ padding: '14px 16px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 36, height: 36, background: C.trueBlue, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 600, fontSize: 13 }}>{p.name?.charAt(0)}</div><div><p style={{ fontWeight: 600, color: C.trueBlue, margin: 0, fontSize: 13 }}>{p.name}</p><p style={{ fontSize: 11, color: C.blackRobe, margin: 0, opacity: 0.6 }}>{p.email}</p></div></div></td>
                <td style={{ padding: '14px 16px' }}><span style={{ padding: '4px 10px', borderRadius: 16, fontSize: 11, background: colors[risk.level] + '20', color: colors[risk.level] }}>{risk.level === 'high' ? 'Alto' : risk.level === 'medium' ? 'Médio' : 'Baixo'}</span></td>
                <td style={{ padding: '14px 16px', color: C.blackRobe, opacity: 0.7, fontSize: 12 }}>{risk.daysSinceEntry < 999 ? `${risk.daysSinceEntry}d atrás` : 'Inativo'}</td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}><button onClick={() => loadPatient(p)} style={{ background: C.iceMelt, border: 'none', padding: '8px 14px', borderRadius: 8, color: C.trueBlue, cursor: 'pointer', fontSize: 12 }}>Ver Ficha</button></td>
              </tr>
            )
          })}</tbody>
        </table>
      </div>
    </div>
  )

  const Patient = () => {
    const [tab, setTab] = useState('overview')
    const [showSession, setShowSession] = useState(false)
    const [notes, setNotes] = useState('')
    const [saving, setSaving] = useState(false)
    const p = selectedPatient
    if (!p) return null
    const d = patientData
    const risk = patientsRisk[p.id] || {}
    const days = p.sober_start_date ? Math.floor((new Date() - new Date(p.sober_start_date)) / 86400000) : 0
    const saveSession = async (e) => { e.preventDefault(); setSaving(true); try { await psychologistService.createSession({ patient_id: p.id, psychologist_id: user.id, session_date: new Date().toISOString().split('T')[0], session_notes: notes, status: 'completed' }); await loadPatient(p); setShowSession(false); setNotes('') } catch (e) { alert('Erro') } finally { setSaving(false) } }
    return (
      <div>
        <button onClick={() => { setSelectedPatient(null); setPage('patients') }} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, background: C.trueBlue, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontWeight: 700, fontSize: 24 }}>{p.name?.charAt(0)}</div>
            <div><h1 style={{ fontSize: 22, color: C.trueBlue, margin: 0, fontWeight: 600 }}>{p.name}</h1><p style={{ color: C.blackRobe, margin: '4px 0 0', opacity: 0.6, fontSize: 13 }}>{p.email}</p></div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => sendQuickMessage(p.id, 'support')} style={{ ...btn, background: C.alaskanBlue }}>💬 Mensagem</button>
            <button onClick={() => setShowSession(true)} style={btn}>+ Sessão</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>{[{ id: 'overview', label: 'Visão Geral' }, { id: 'timeline', label: 'Linha do Tempo' }, { id: 'patterns', label: 'Padrões' }, { id: 'tools', label: 'Ferramentas' }].map(t => (<button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? C.trueBlue : C.blancDeBlanc, color: tab === t.id ? C.white : C.blackRobe, border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>{t.label}</button>))}</div>
        {tab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
              <div style={card}><p style={{ color: C.blackRobe, fontSize: 11, margin: '0 0 4px', opacity: 0.6 }}>Dias</p><p style={{ color: C.trueBlue, fontSize: 24, fontWeight: 700, margin: 0 }}>{days}</p></div>
              <div style={card}><p style={{ color: C.blackRobe, fontSize: 11, margin: '0 0 4px', opacity: 0.6 }}>Episódios</p><p style={{ color: C.warning, fontSize: 24, fontWeight: 700, margin: 0 }}>{d.episodes?.length || 0}</p></div>
              <div style={card}><p style={{ color: C.blackRobe, fontSize: 11, margin: '0 0 4px', opacity: 0.6 }}>Sessões</p><p style={{ color: C.alaskanBlue, fontSize: 24, fontWeight: 700, margin: 0 }}>{d.sessions?.length || 0}</p></div>
              <div style={card}><p style={{ color: C.blackRobe, fontSize: 11, margin: '0 0 4px', opacity: 0.6 }}>Entradas Diário</p><p style={{ color: C.success, fontSize: 24, fontWeight: 700, margin: 0 }}>{d.diary?.length || 0}</p></div>
            </div>
            {risk.level === 'high' && <div style={{ ...card, background: C.danger + '15', borderLeft: '4px solid ' + C.danger, marginBottom: 20 }}><p style={{ color: C.danger, margin: 0, fontWeight: 600, fontSize: 13 }}>⚠️ Paciente em alto risco. Gatilhos: {risk.analysis?.triggers?.join(', ') || 'N/A'}</p></div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={card}><h3 style={{ color: C.trueBlue, fontSize: 13, margin: '0 0 12px' }}>Últimas Entradas</h3>{d.diary?.slice(0, 5).map(e => (<div key={e.id} style={{ padding: '8px 0', borderBottom: '1px solid ' + C.blancDeBlanc }}><span style={{ fontSize: 11, color: C.blackRobe, opacity: 0.6 }}>{new Date(e.created_at).toLocaleDateString('pt-BR')}</span> - <span style={{ fontSize: 12 }}>{e.mood}</span>{e.emotions?.includes('Fissura') && <span style={{ background: C.danger + '20', color: C.danger, padding: '2px 6px', borderRadius: 8, fontSize: 10, marginLeft: 6 }}>Fissura</span>}</div>))}</div>
              <div style={card}><h3 style={{ color: C.trueBlue, fontSize: 13, margin: '0 0 12px' }}>Episódios Processados</h3>{d.episodes?.length === 0 ? <p style={{ color: C.blackRobe, opacity: 0.6, fontSize: 12 }}>Nenhum</p> : d.episodes?.slice(0, 5).map(e => (<div key={e.id} style={{ padding: '8px 0', borderBottom: '1px solid ' + C.blancDeBlanc }}><span style={{ fontSize: 11, color: C.blackRobe, opacity: 0.6 }}>{new Date(e.created_at).toLocaleDateString('pt-BR')}</span><p style={{ margin: '4px 0 0', fontSize: 12, color: C.blackRobe }}>{e.learning?.slice(0, 60) || 'Sem aprendizado registrado'}...</p></div>))}</div>
            </div>
          </>
        )}
        {tab === 'timeline' && (
          <div style={card}>
            <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 16px' }}>Linha do Tempo</h3>
            {[...(d.diary?.map(e => ({ ...e, type: 'diary', date: e.created_at })) || []), ...(d.episodes?.map(e => ({ ...e, type: 'episode', date: e.created_at })) || []), ...(d.sessions?.map(e => ({ ...e, type: 'session', date: e.session_date })) || [])].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20).map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid ' + C.blancDeBlanc }}>
                <span style={{ width: 32, height: 32, borderRadius: '50%', background: e.type === 'diary' ? C.alaskanBlue : e.type === 'episode' ? C.warning : C.success, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{e.type === 'diary' ? '📔' : e.type === 'episode' ? '⚡' : '👤'}</span>
                <div style={{ flex: 1 }}><p style={{ margin: 0, fontSize: 12, color: C.blackRobe, opacity: 0.6 }}>{new Date(e.date).toLocaleDateString('pt-BR')}</p><p style={{ margin: '4px 0 0', fontSize: 13, color: C.trueBlue }}>{e.type === 'diary' ? `Humor: ${e.mood}` : e.type === 'episode' ? `Episódio - R$ ${e.amount || 0}` : 'Sessão'}</p></div>
              </div>
            ))}
          </div>
        )}
        {tab === 'patterns' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={card}>
              <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 16px' }}>Anatomia da Fuga</h3>
              {d.escapePattern ? (
                <>
                  <p style={{ color: C.blackRobe, fontSize: 12, marginBottom: 12 }}><strong>Principais motivos:</strong></p>
                  {d.escapePattern.topReasons?.map(([reason, count]) => (<div key={reason} style={{ padding: '6px 0', display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 12 }}>{reason}</span><span style={{ color: C.trueBlue, fontWeight: 600 }}>{count}x</span></div>))}
                  {d.escapePattern.peakTime && <p style={{ color: C.blackRobe, fontSize: 12, marginTop: 12 }}><strong>Horário crítico:</strong> {d.escapePattern.peakTime}</p>}
                  {d.escapePattern.peakDay && <p style={{ color: C.blackRobe, fontSize: 12 }}><strong>Dia crítico:</strong> {d.escapePattern.peakDay}</p>}
                </>
              ) : <p style={{ color: C.blackRobe, opacity: 0.6, fontSize: 12 }}>Dados insuficientes</p>}
            </div>
            <div style={card}>
              <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 16px' }}>Gatilhos Detectados</h3>
              {risk.analysis?.triggers?.length > 0 ? risk.analysis.triggers.map(t => (<div key={t} style={{ padding: '8px 12px', background: C.iceMelt, borderRadius: 8, marginBottom: 8, fontSize: 12 }}>{t}</div>)) : <p style={{ color: C.blackRobe, opacity: 0.6, fontSize: 12 }}>Nenhum detectado</p>}
            </div>
          </div>
        )}
        {tab === 'tools' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={card}><h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 12px' }}>📋 Contrato Comportamental</h3>{d.contract ? (<><p style={{ fontSize: 12, color: C.blackRobe, marginBottom: 8 }}>{d.contract.commitments?.length || 0} compromissos</p><p style={{ fontSize: 12, color: C.blackRobe }}>{d.contract.protection?.length || 0} medidas de proteção</p></>) : <p style={{ color: C.blackRobe, opacity: 0.6, fontSize: 12 }}>Não configurado</p>}</div>
            <div style={card}><h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 12px' }}>🚨 Plano de Crise</h3>{d.crisis ? (<p style={{ fontSize: 12, color: C.blackRobe }}>{d.crisis.steps?.length || 0} passos configurados</p>) : <p style={{ color: C.blackRobe, opacity: 0.6, fontSize: 12 }}>Não configurado</p>}</div>
            <div style={card}><h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 12px' }}>📦 Cofre de Evidências</h3><p style={{ fontSize: 12, color: C.blackRobe }}>{d.vault?.length || 0} itens salvos</p></div>
            <div style={card}><h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 12px' }}>💰 Finanças</h3><p style={{ fontSize: 12, color: C.blackRobe }}>{d.debts?.length || 0} dívidas quitadas</p><p style={{ fontSize: 12, color: C.blackRobe }}>{d.purchases?.length || 0} conquistas</p></div>
          </div>
        )}
        {showSession && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><form onSubmit={saveSession} style={{ background: C.white, borderRadius: 16, padding: 24, width: '100%', maxWidth: 450 }}><h2 style={{ color: C.trueBlue, marginBottom: 16, fontSize: 18 }}>Nova Sessão</h2><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anotações..." style={{ ...input, minHeight: 120, marginBottom: 16 }} /><div style={{ display: 'flex', gap: 10 }}><button type="button" onClick={() => setShowSession(false)} style={{ flex: 1, padding: 12, background: C.blancDeBlanc, border: 'none', borderRadius: 10, cursor: 'pointer' }}>Cancelar</button><button type="submit" disabled={saving} style={{ ...btn, flex: 1 }}>{saving ? '...' : 'Salvar'}</button></div></form></div>}
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
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const create = async (e) => { e.preventDefault(); setSaving(true); try { await supabase.from('therapy_groups').insert({ name, day_of_week: day, time, meeting_link: link, psychologist_id: user.id }); await loadData(); setShowForm(false); setName('') } catch (e) { alert('Erro') } finally { setSaving(false) } }
    const acceptInterest = async (interest, groupId) => { try { const { data: pt } = await supabase.from('patients').select('id').eq('email', interest.patient_email).single(); if (pt) await supabase.from('group_members').insert({ group_id: groupId, patient_id: pt.id }); await supabase.from('group_interest').update({ status: 'accepted' }).eq('id', interest.id); await loadData() } catch (e) { alert('Erro') } }
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}><h1 style={{ fontSize: 24, color: C.trueBlue, margin: 0, fontWeight: 600 }}>Grupos</h1><button onClick={() => setShowForm(true)} style={btn}>+ Novo</button></div>
        {groupInterests.filter(i => i.status === 'pending').length > 0 && (
          <div style={{ ...card, marginBottom: 20, borderLeft: '4px solid ' + C.warning }}><h3 style={{ color: C.trueBlue, margin: '0 0 12px', fontSize: 14 }}>Interessados</h3>
            {groupInterests.filter(i => i.status === 'pending').map(i => (
              <div key={i.id} style={{ padding: 12, background: C.iceMelt, borderRadius: 10, marginBottom: 8 }}><p style={{ margin: 0, fontWeight: 600, color: C.trueBlue, fontSize: 13 }}>{i.patient_name}</p><p style={{ margin: '4px 0 10px', fontSize: 11, color: C.blackRobe, opacity: 0.6 }}>{i.patient_email}</p><select onChange={e => { if (e.target.value) acceptInterest(i, e.target.value) }} style={{ ...input, padding: 8 }} defaultValue=""><option value="" disabled>Selecione grupo</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
            ))}
          </div>
        )}
        {groups.map(g => (<div key={g.id} style={{ ...card, marginBottom: 12 }}><h3 style={{ color: C.trueBlue, margin: '0 0 6px', fontSize: 14 }}>{g.name}</h3><p style={{ color: C.blackRobe, margin: 0, opacity: 0.6, fontSize: 12 }}>{dias[g.day_of_week]} às {g.time?.slice(0, 5)}</p></div>))}
        {showForm && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><form onSubmit={create} style={{ background: C.white, borderRadius: 16, padding: 24, width: '100%', maxWidth: 380 }}><h2 style={{ color: C.trueBlue, marginBottom: 16, fontSize: 18 }}>Novo Grupo</h2><input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} style={{ ...input, marginBottom: 12 }} /><select value={day} onChange={e => setDay(parseInt(e.target.value))} style={{ ...input, marginBottom: 12 }}>{dias.map((d, i) => <option key={i} value={i}>{d}</option>)}</select><input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ ...input, marginBottom: 12 }} /><input placeholder="Link da reunião" value={link} onChange={e => setLink(e.target.value)} style={{ ...input, marginBottom: 16 }} /><div style={{ display: 'flex', gap: 10 }}><button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: 12, background: C.blancDeBlanc, border: 'none', borderRadius: 10, cursor: 'pointer' }}>Cancelar</button><button type="submit" disabled={saving || !name} style={{ ...btn, flex: 1 }}>{saving ? '...' : 'Criar'}</button></div></form></div>}
      </div>
    )
  }

  const Requests = () => { const update = async (id, status) => { await psychologistService.updateContactRequest(id, { status }, user.id); await loadData() }; return (<div><h1 style={{ fontSize: 24, color: C.trueBlue, marginBottom: 20, fontWeight: 600 }}>Solicitações</h1>{contactRequests.length === 0 ? <div style={{ ...card, textAlign: 'center', padding: 40 }}><p style={{ color: C.blackRobe, opacity: 0.6 }}>Nenhuma</p></div> : contactRequests.map(r => (<div key={r.id} style={{ ...card, marginBottom: 12, opacity: r.status === 'pending' ? 1 : 0.6 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><h3 style={{ color: C.trueBlue, margin: 0, fontSize: 14 }}>{r.name}</h3><span style={{ color: C.blackRobe, fontSize: 11, opacity: 0.6 }}>{new Date(r.created_at).toLocaleDateString('pt-BR')}</span></div><p style={{ color: C.blackRobe, margin: '0 0 10px', opacity: 0.6, fontSize: 12 }}>{r.phone} • {r.email}</p>{r.message && <p style={{ background: C.iceMelt, padding: 10, borderRadius: 8, margin: '0 0 12px', fontSize: 12 }}>"{r.message}"</p>}{r.status === 'pending' && <div style={{ display: 'flex', gap: 8 }}><button onClick={() => window.open('mailto:' + r.email)} style={{ ...btn, flex: 1, padding: 10 }}>📧 Responder</button><button onClick={() => update(r.id, 'contacted')} style={{ flex: 1, padding: 10, background: C.success, color: C.white, border: 'none', borderRadius: 10, cursor: 'pointer' }}>Contatado</button></div>}</div>))}</div>) }

  const SOS = () => (<div><h1 style={{ fontSize: 24, color: C.trueBlue, marginBottom: 8, fontWeight: 600 }}>Alertas SOS</h1><p style={{ color: C.blackRobe, opacity: 0.7, marginBottom: 20, fontSize: 13 }}>Pacientes que acionaram o botão de emergência.</p>{sosLogs.length === 0 ? <div style={{ ...card, textAlign: 'center', padding: 40 }}><p style={{ color: C.blackRobe, opacity: 0.6 }}>Nenhum registro</p></div> : sosLogs.slice(0, 30).map(s => (<div key={s.id} style={{ ...card, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><p style={{ color: C.trueBlue, margin: 0, fontWeight: 600, fontSize: 13 }}>{s.patients?.name || 'Paciente'}</p><p style={{ color: C.blackRobe, margin: '4px 0 0', opacity: 0.6, fontSize: 11 }}>{new Date(s.created_at).toLocaleString('pt-BR')}</p></div><button onClick={() => { const p = patients.find(pt => pt.id === s.patient_id); if (p) loadPatient(p) }} style={{ background: C.iceMelt, border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 11 }}>Ver paciente</button></div>))}</div>)

  const renderPage = () => { switch (page) { case 'dashboard': return <Dashboard />; case 'radar': return <Radar />; case 'patients': return <Patients />; case 'patient': return <Patient />; case 'groups': return <Groups />; case 'requests': return <Requests />; case 'sos': return <SOS />; default: return <Dashboard /> } }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.iceMelt }}><p style={{ color: C.trueBlue }}>Carregando...</p></div>

  return (<div style={{ fontFamily: 'system-ui, sans-serif', background: C.iceMelt, minHeight: '100vh' }}><Sidebar /><main style={{ marginLeft: 240, padding: '28px 32px' }}>{renderPage()}</main></div>)
}
