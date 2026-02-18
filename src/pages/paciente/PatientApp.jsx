import React, { useState, useEffect } from 'react'
import { patientService } from '../../services/patientService'
import { publicService } from '../../services/publicService'
import { supabase } from '../../services/supabase'
import { analyzeTriggers, generateRiskReport } from '../../utils/triggerAnalyzer'
import SOSFissura from '../../components/SOSFissura'
import GoalsTracker from '../../components/GoalsTracker'
import { VideoFeed, AutoexclusaoCentral, DoacaoAPAJ } from '../../components/APAJEcosystem'

const C = { trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff', blackRobe: '#2b2b2b', blancDeBlanc: '#e9e9ea', white: '#ffffff', success: '#28a068', warning: '#e8a040', danger: '#d04040' }

const FRASES = ["Cada dia sem apostar é uma vitória!", "Você é mais forte do que imagina.", "O dinheiro guardado constrói seu futuro.", "Liberdade é não depender do jogo.", "Sua família agradece cada escolha consciente."]
const CONQUISTAS = [{ dias: 1, nome: '1º Dia', xp: 10 }, { dias: 3, nome: '3 Dias', xp: 30 }, { dias: 7, nome: '1 Semana', xp: 70 }, { dias: 14, nome: '2 Semanas', xp: 150 }, { dias: 30, nome: '1 Mês', xp: 300 }, { dias: 60, nome: '2 Meses', xp: 600 }, { dias: 90, nome: '3 Meses', xp: 1000 }, { dias: 180, nome: '6 Meses', xp: 2000 }, { dias: 365, nome: '1 Ano', xp: 5000 }]
const XP_DIVIDA = 100, XP_CONQUISTA = 50, XP_DIARIO = 5
const MOOD_CONFIG = { 'Muito bem': { bg: '#c8e6c9', color: '#2e7d32', icon: '😌' }, 'Bem': { bg: '#dcedc8', color: '#558b2f', icon: '🙂' }, 'Neutro': { bg: '#fff9c4', color: '#f9a825', icon: '😐' }, 'Mal': { bg: '#ffccbc', color: '#e64a19', icon: '😕' }, 'Muito mal': { bg: '#ffcdd2', color: '#c62828', icon: '😔' } }
const EMOTIONS = ['Calma', 'Gratidão', 'Esperança', 'Ansiedade', 'Tristeza', 'Raiva', 'Medo', 'Frustração', 'Culpa', 'Solidão', 'Tédio', 'Fissura']

export default function PatientApp({ user, onLogout }) {
  const [page, setPage] = useState('home')
  const [profile, setProfile] = useState(null)
  const [relapses, setRelapses] = useState([])
  const [loading, setLoading] = useState(true)
  const [fraseIndex, setFraseIndex] = useState(0)
  const [diaryEntries, setDiaryEntries] = useState([])
  const [debts, setDebts] = useState([])
  const [purchases, setPurchases] = useState([])
  const [goals, setGoals] = useState([])
  const [showSOS, setShowSOS] = useState(false)
  const [riskAlert, setRiskAlert] = useState(null)

  useEffect(() => { loadData() }, [user])
  useEffect(() => { const i = setInterval(() => setFraseIndex(x => (x + 1) % FRASES.length), 10000); return () => clearInterval(i) }, [])

  const loadData = async () => {
    try {
      const [p, r, diary, dbt, purch, gls] = await Promise.all([
        patientService.getMyProfile(user.id),
        patientService.getMyRelapses(user.id),
        supabase.from('diary_entries').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }),
        supabase.from('patient_debts').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }),
        supabase.from('patient_purchases').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }),
        supabase.from('patient_goals').select('*').eq('patient_id', user.id).order('created_at', { ascending: false })
      ])
      if (p.data) setProfile(p.data)
      if (r.data) setRelapses(r.data)
      if (diary.data) { setDiaryEntries(diary.data); analyzeRisk(diary.data) }
      if (dbt.data) setDebts(dbt.data)
      if (purch.data) setPurchases(purch.data)
      if (gls.data) setGoals(gls.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const analyzeRisk = (entries) => {
    const analysis = analyzeTriggers(entries)
    const report = generateRiskReport(analysis)
    setRiskAlert(report)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); if (onLogout) onLogout() }

  const days = profile?.sober_start_date ? patientService.calcDays(profile.sober_start_date, relapses) : 0
  const savings = profile?.sober_start_date && profile?.previous_gambling_amount ? patientService.calcSavings(profile.sober_start_date, profile.previous_gambling_amount, relapses) : { total: 0 }
  const totalXP = CONQUISTAS.filter(c => days >= c.dias).reduce((sum, c) => sum + c.xp, 0) + Math.floor(savings.total * 0.1) + debts.length * XP_DIVIDA + purchases.length * XP_CONQUISTA + diaryEntries.length * XP_DIARIO
  const getLevel = (xp) => { if (xp >= 5000) return { level: 7, nome: 'Avançado' }; if (xp >= 2000) return { level: 6, nome: 'Intermediário' }; if (xp >= 1000) return { level: 5, nome: 'Dedicado' }; if (xp >= 600) return { level: 4, nome: 'Persistente' }; if (xp >= 300) return { level: 3, nome: 'Comprometido' }; if (xp >= 100) return { level: 2, nome: 'Iniciante' }; return { level: 1, nome: 'Novato' } }
  const currentLevel = getLevel(totalXP)

  const NavBar = () => (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.trueBlue, padding: '8px 0 12px', display: 'flex', justifyContent: 'space-around', zIndex: 1000, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
      {[{ id: 'home', icon: '🏠', label: 'Início' }, { id: 'progress', icon: '📈', label: 'Progresso' }, { id: 'diary', icon: '📔', label: 'Diário' }, { id: 'apaj', icon: '💙', label: 'APAJ' }, { id: 'profile', icon: '👤', label: 'Perfil' }].map(i => (
        <button key={i.id} onClick={() => setPage(i.id)} style={{ background: page === i.id ? 'rgba(255,255,255,0.15)' : 'transparent', border: 'none', color: C.white, padding: '6px 10px', borderRadius: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 20 }}>{i.icon}</span><span style={{ fontSize: 9, fontWeight: page === i.id ? 600 : 400 }}>{i.label}</span>
        </button>
      ))}
    </nav>
  )

  const SOSButton = () => (
    <button onClick={() => setShowSOS(true)} style={{ position: 'fixed', bottom: 90, right: 20, width: 60, height: 60, borderRadius: '50%', background: C.danger, border: 'none', color: C.white, fontSize: 24, cursor: 'pointer', boxShadow: '0 4px 20px rgba(208,64,64,0.4)', zIndex: 999, animation: 'pulse 2s infinite' }}>
      🆘
      <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }`}</style>
    </button>
  )

  const Home = () => (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <img src="/logo-apaj.png" alt="APAJ" style={{ width: 100, height: 'auto', marginBottom: 8 }} />
        <p style={{ color: C.blackRobe, fontSize: 14, opacity: 0.7 }}>Olá, {profile?.name?.split(' ')[0] || 'Bem-vindo'}!</p>
      </div>
      
      {riskAlert && (
        <div style={{ background: riskAlert.level === 'high' ? C.danger : C.warning, borderRadius: 14, padding: 16, marginBottom: 16, color: C.white }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600 }}>⚠️ {riskAlert.level === 'high' ? 'Alerta de Risco' : 'Atenção'}</p>
          <p style={{ margin: '0 0 12px', fontSize: 13, opacity: 0.95 }}>{riskAlert.message}</p>
          {riskAlert.video && (
            <a href={riskAlert.video.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 10, color: C.white, textDecoration: 'none', fontSize: 13 }}>
              ▶️ Assista: {riskAlert.video.title}
            </a>
          )}
        </div>
      )}
      
      <div style={{ background: C.alaskanBlue, borderRadius: 14, padding: '14px 18px', marginBottom: 16, textAlign: 'center' }}>
        <p style={{ color: C.white, fontSize: 13, fontStyle: 'italic', margin: 0 }}>"{FRASES[fraseIndex]}"</p>
      </div>
      
      {profile?.sober_start_date ? (
        <div style={{ background: C.trueBlue, borderRadius: 20, padding: 24, marginBottom: 16, color: C.white }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 52, fontWeight: 700 }}>{days}</span>
            <p style={{ fontSize: 14, opacity: 0.9, margin: '4px 0 0' }}>dias sem apostar</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>R$ {savings.total.toLocaleString('pt-BR')}</span>
              <p style={{ fontSize: 10, opacity: 0.8, margin: '4px 0 0' }}>Economizado</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{totalXP} XP</span>
              <p style={{ fontSize: 10, opacity: 0.8, margin: '4px 0 0' }}>Pontuação</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Nv. {currentLevel.level}</span>
              <p style={{ fontSize: 10, opacity: 0.8, margin: '4px 0 0' }}>{currentLevel.nome}</p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: C.white, borderRadius: 20, padding: 28, textAlign: 'center', marginBottom: 16 }}>
          <h2 style={{ color: C.trueBlue, fontSize: 17, marginTop: 0 }}>Comece sua jornada</h2>
          <p style={{ color: C.blackRobe, fontSize: 13, margin: '12px 0 20px', opacity: 0.6 }}>Configure seu perfil para acompanhar seu progresso</p>
          <button onClick={() => setPage('setup')} style={{ background: C.trueBlue, color: C.white, border: 'none', padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Configurar Agora</button>
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <button onClick={() => setPage('goals')} style={{ background: C.white, border: 'none', borderRadius: 14, padding: 16, cursor: 'pointer', textAlign: 'left' }}>
          <span style={{ fontSize: 24 }}>🎯</span>
          <h3 style={{ color: C.trueBlue, fontSize: 13, margin: '8px 0 2px', fontWeight: 600 }}>Meus Objetivos</h3>
          <p style={{ color: C.blackRobe, fontSize: 11, margin: 0, opacity: 0.6 }}>{goals.length} cadastrados</p>
        </button>
        <button onClick={() => setPage('autoexclusao')} style={{ background: C.white, border: 'none', borderRadius: 14, padding: 16, cursor: 'pointer', textAlign: 'left' }}>
          <span style={{ fontSize: 24 }}>🛡️</span>
          <h3 style={{ color: C.trueBlue, fontSize: 13, margin: '8px 0 2px', fontWeight: 600 }}>Autoexclusão</h3>
          <p style={{ color: C.blackRobe, fontSize: 11, margin: 0, opacity: 0.6 }}>Bloquear acessos</p>
        </button>
      </div>
    </div>
  )

  const Setup = () => {
    const [f, setF] = useState({ name: profile?.name || '', phone: profile?.phone || '', monthly_income: profile?.monthly_income || '', previous_gambling_amount: profile?.previous_gambling_amount || '', sober_start_date: profile?.sober_start_date || new Date().toISOString().split('T')[0], emergency_contact_name: profile?.emergency_contact?.name || '', emergency_contact_phone: profile?.emergency_contact?.phone || '' })
    const [saving, setSaving] = useState(false)
    const save = async (e) => {
      e.preventDefault(); setSaving(true)
      try { 
        await patientService.updateProfile(user.id, { name: f.name, phone: f.phone, monthly_income: parseFloat(f.monthly_income) || 0, previous_gambling_amount: parseFloat(f.previous_gambling_amount) || 0, sober_start_date: f.sober_start_date, emergency_contact: { name: f.emergency_contact_name, phone: f.emergency_contact_phone } })
        await loadData(); setPage('home') 
      } catch (e) { alert('Erro: ' + e.message) }
      finally { setSaving(false) }
    }
    return (
      <div style={{ padding: 20, paddingBottom: 100 }}>
        <button onClick={() => setPage('home')} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button>
        <h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 20, fontWeight: 600 }}>Configurar Perfil</h1>
        <form onSubmit={save} style={{ background: C.white, borderRadius: 16, padding: 20 }}>
          <div style={{ marginBottom: 14 }}><label style={{ display: 'block', color: C.blackRobe, marginBottom: 6, fontSize: 12, fontWeight: 500 }}>Seu nome</label><input type="text" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} style={{ width: '100%', padding: '11px 14px', border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }} /></div>
          <div style={{ marginBottom: 14 }}><label style={{ display: 'block', color: C.blackRobe, marginBottom: 6, fontSize: 12, fontWeight: 500 }}>Seu telefone</label><input type="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} style={{ width: '100%', padding: '11px 14px', border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }} /></div>
          <div style={{ marginBottom: 14 }}><label style={{ display: 'block', color: C.blackRobe, marginBottom: 6, fontSize: 12, fontWeight: 500 }}>Renda mensal (R$)</label><input type="number" value={f.monthly_income} onChange={e => setF({ ...f, monthly_income: e.target.value })} style={{ width: '100%', padding: '11px 14px', border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }} /></div>
          <div style={{ marginBottom: 14 }}><label style={{ display: 'block', color: C.blackRobe, marginBottom: 6, fontSize: 12, fontWeight: 500 }}>Quanto gastava/mês em apostas?</label><input type="number" value={f.previous_gambling_amount} onChange={e => setF({ ...f, previous_gambling_amount: e.target.value })} style={{ width: '100%', padding: '11px 14px', border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }} /></div>
          <div style={{ marginBottom: 14 }}><label style={{ display: 'block', color: C.blackRobe, marginBottom: 6, fontSize: 12, fontWeight: 500 }}>Data de início da recuperação</label><input type="date" value={f.sober_start_date} onChange={e => setF({ ...f, sober_start_date: e.target.value })} style={{ width: '100%', padding: '11px 14px', border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }} /></div>
          <div style={{ background: C.iceMelt, borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <p style={{ color: C.trueBlue, fontSize: 13, margin: '0 0 12px', fontWeight: 600 }}>📱 Contato de Emergência (SOS)</p>
            <input type="text" placeholder="Nome do contato" value={f.emergency_contact_name} onChange={e => setF({ ...f, emergency_contact_name: e.target.value })} style={{ width: '100%', padding: '11px 14px', border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, boxSizing: 'border-box', marginBottom: 10 }} />
            <input type="tel" placeholder="WhatsApp do contato (com DDD)" value={f.emergency_contact_phone} onChange={e => setF({ ...f, emergency_contact_phone: e.target.value })} style={{ width: '100%', padding: '11px 14px', border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={saving} style={{ width: '100%', background: saving ? C.blancDeBlanc : C.trueBlue, color: C.white, border: 'none', padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
        </form>
      </div>
    )
  }

  const Diary = () => {
    const [showForm, setShowForm] = useState(false)
    const [entry, setEntry] = useState('')
    const [mood, setMood] = useState('')
    const [emotions, setEmotions] = useState([])
    const [saving, setSaving] = useState(false)
    const toggleEmotion = (e) => setEmotions(emotions.includes(e) ? emotions.filter(x => x !== e) : [...emotions, e])
    const saveEntry = async (e) => {
      e.preventDefault(); if (!mood) { alert('Selecione como você está'); return }; setSaving(true)
      try {
        await supabase.from('diary_entries').insert({ patient_id: user.id, content: entry || null, mood, emotions: emotions.length > 0 ? emotions : null })
        const { data } = await supabase.from('diary_entries').select('*').eq('patient_id', user.id).order('created_at', { ascending: false })
        if (data) { setDiaryEntries(data); analyzeRisk(data) }
        setShowForm(false); setEntry(''); setMood(''); setEmotions([])
      } catch (e) { alert('Erro: ' + e.message) }
      finally { setSaving(false) }
    }
    if (showForm) return (
      <div style={{ padding: 20, paddingBottom: 100 }}>
        <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button>
        <h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 20, fontWeight: 600 }}>Nova Entrada</h1>
        <form onSubmit={saveEntry}>
          <div style={{ background: C.white, borderRadius: 14, padding: 18, marginBottom: 14 }}>
            <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 12px', fontWeight: 600 }}>Como você está? *</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
              {Object.entries(MOOD_CONFIG).map(([m, cfg]) => (
                <button key={m} type="button" onClick={() => setMood(m)} style={{ flex: 1, background: mood === m ? cfg.bg : C.blancDeBlanc, border: mood === m ? '2px solid ' + cfg.color : '2px solid transparent', padding: '10px 4px', borderRadius: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 22 }}>{cfg.icon}</span>
                  <span style={{ fontSize: 9, color: mood === m ? cfg.color : C.blackRobe }}>{m}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ background: C.white, borderRadius: 14, padding: 18, marginBottom: 14 }}>
            <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 12px', fontWeight: 600 }}>Emoções presentes</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EMOTIONS.map(e => (
                <button key={e} type="button" onClick={() => toggleEmotion(e)} style={{ background: emotions.includes(e) ? (e === 'Fissura' ? C.danger : C.alaskanBlue) : C.blancDeBlanc, color: emotions.includes(e) ? C.white : C.blackRobe, border: 'none', padding: '7px 12px', borderRadius: 16, fontSize: 12, cursor: 'pointer' }}>{e}</button>
              ))}
            </div>
          </div>
          <div style={{ background: C.white, borderRadius: 14, padding: 18, marginBottom: 14 }}>
            <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 12px', fontWeight: 600 }}>Reflexões (opcional)</h3>
            <textarea value={entry} onChange={e => setEntry(e.target.value)} placeholder="O que está passando pela sua cabeça?" style={{ width: '100%', padding: 14, border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, minHeight: 80, resize: 'none', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={saving || !mood} style={{ width: '100%', background: saving || !mood ? C.blancDeBlanc : C.trueBlue, color: C.white, border: 'none', padding: 15, borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Salvando...' : 'Salvar Entrada'}</button>
        </form>
      </div>
    )
    return (
      <div style={{ padding: 20, paddingBottom: 100 }}>
        <h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 16, fontWeight: 600 }}>Diário</h1>
        <button onClick={() => setShowForm(true)} style={{ width: '100%', background: C.trueBlue, color: C.white, border: 'none', padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 16 }}>+ Nova Entrada</button>
        {diaryEntries.length === 0 ? (
          <div style={{ background: C.white, borderRadius: 14, padding: 32, textAlign: 'center' }}><p style={{ color: C.blackRobe, opacity: 0.6 }}>Nenhuma entrada ainda</p></div>
        ) : diaryEntries.map(d => (
          <div key={d.id} style={{ background: C.white, borderRadius: 14, padding: 16, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: C.trueBlue, fontSize: 12, fontWeight: 600 }}>{new Date(d.created_at).toLocaleDateString('pt-BR')}</span>
              {d.mood && <span style={{ background: MOOD_CONFIG[d.mood]?.bg || C.iceMelt, color: MOOD_CONFIG[d.mood]?.color || C.trueBlue, padding: '3px 10px', borderRadius: 10, fontSize: 11 }}>{MOOD_CONFIG[d.mood]?.icon} {d.mood}</span>}
            </div>
            {d.emotions?.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>{d.emotions.map(e => <span key={e} style={{ background: e === 'Fissura' ? '#ffebee' : C.blancDeBlanc, color: e === 'Fissura' ? C.danger : C.blackRobe, padding: '2px 8px', borderRadius: 8, fontSize: 10 }}>{e}</span>)}</div>}
            {d.content && <p style={{ color: C.blackRobe, fontSize: 13, lineHeight: 1.5, margin: 0 }}>{d.content}</p>}
          </div>
        ))}
      </div>
    )
  }

  const Progress = () => {
    const [showRelapseForm, setShowRelapseForm] = useState(false)
    const [showDebtForm, setShowDebtForm] = useState(false)
    const [showPurchaseForm, setShowPurchaseForm] = useState(false)
    const [amt, setAmt] = useState('')
    const [note, setNote] = useState('')
    const [saving, setSaving] = useState(false)
    const addRelapse = async (e) => { e.preventDefault(); setSaving(true); try { await patientService.addRelapse(user.id, { amount: parseFloat(amt) || 0, notes: note }); await loadData(); setShowRelapseForm(false); setAmt(''); setNote('') } catch (e) { alert('Erro: ' + e.message) } finally { setSaving(false) } }
    const addDebt = async (e) => { e.preventDefault(); if (!note.trim()) { alert('Descreva a dívida'); return }; setSaving(true); try { await supabase.from('patient_debts').insert({ patient_id: user.id, amount: parseFloat(amt) || 0, description: note }); await loadData(); setShowDebtForm(false); setAmt(''); setNote('') } catch (e) { alert('Erro: ' + e.message) } finally { setSaving(false) } }
    const addPurchase = async (e) => { e.preventDefault(); if (!note.trim()) { alert('Descreva a conquista'); return }; setSaving(true); try { await supabase.from('patient_purchases').insert({ patient_id: user.id, amount: parseFloat(amt) || 0, description: note }); await loadData(); setShowPurchaseForm(false); setAmt(''); setNote('') } catch (e) { alert('Erro: ' + e.message) } finally { setSaving(false) } }
    if (!profile?.sober_start_date) return (<div style={{ padding: 20, paddingBottom: 100, textAlign: 'center' }}><h2 style={{ color: C.trueBlue, marginTop: 40 }}>Configure seu perfil</h2><button onClick={() => setPage('setup')} style={{ marginTop: 20, background: C.trueBlue, color: C.white, border: 'none', padding: '12px 28px', borderRadius: 10, cursor: 'pointer' }}>Configurar</button></div>)
    return (
      <div style={{ padding: 20, paddingBottom: 100 }}>
        <div style={{ background: C.trueBlue, borderRadius: 18, padding: 22, marginBottom: 16, color: C.white }}>
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <p style={{ fontSize: 12, opacity: 0.8, margin: '0 0 4px' }}>Dias sem apostar</p>
            <span style={{ fontSize: 56, fontWeight: 700 }}>{days}</span>
            <p style={{ fontSize: 13, margin: '8px 0 0' }}>Level {currentLevel.level} - {currentLevel.nome}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: 12, borderRadius: 10, textAlign: 'center' }}><span style={{ fontSize: 18, fontWeight: 700 }}>R$ {savings.total.toLocaleString('pt-BR')}</span><p style={{ fontSize: 10, opacity: 0.8, margin: '4px 0 0' }}>Economizado</p></div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: 12, borderRadius: 10, textAlign: 'center' }}><span style={{ fontSize: 18, fontWeight: 700 }}>{totalXP}</span><p style={{ fontSize: 10, opacity: 0.8, margin: '4px 0 0' }}>XP Total</p></div>
          </div>
        </div>
        {!showRelapseForm ? (<button onClick={() => setShowRelapseForm(true)} style={{ width: '100%', background: C.white, border: '1px solid ' + C.warning, color: C.warning, padding: 11, borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', marginBottom: 10 }}>Registrar Recaída</button>) : (<form onSubmit={addRelapse} style={{ background: C.white, borderRadius: 12, padding: 16, marginBottom: 10 }}><h3 style={{ color: C.trueBlue, marginBottom: 10, fontSize: 14, fontWeight: 600 }}>Registrar Recaída</h3><input type="number" placeholder="Valor gasto (R$)" value={amt} onChange={e => setAmt(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid ' + C.blancDeBlanc, borderRadius: 8, marginBottom: 8, fontSize: 13, boxSizing: 'border-box' }} /><textarea placeholder="O que aconteceu?" value={note} onChange={e => setNote(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid ' + C.blancDeBlanc, borderRadius: 8, marginBottom: 10, fontSize: 13, minHeight: 50, resize: 'none', boxSizing: 'border-box' }} /><div style={{ display: 'flex', gap: 8 }}><button type="button" onClick={() => setShowRelapseForm(false)} style={{ flex: 1, background: C.blancDeBlanc, border: 'none', padding: 10, borderRadius: 8, cursor: 'pointer' }}>Cancelar</button><button type="submit" disabled={saving} style={{ flex: 1, background: C.warning, border: 'none', color: C.white, padding: 10, borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{saving ? '...' : 'Registrar'}</button></div></form>)}
        {!showDebtForm ? (<button onClick={() => setShowDebtForm(true)} style={{ width: '100%', background: C.white, border: '1px solid ' + C.success, color: C.success, padding: 11, borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', marginBottom: 10 }}>💰 Quitou uma dívida?</button>) : (<form onSubmit={addDebt} style={{ background: C.white, borderRadius: 12, padding: 16, marginBottom: 10 }}><h3 style={{ color: C.trueBlue, marginBottom: 10, fontSize: 14, fontWeight: 600 }}>Dívida Quitada</h3><input type="number" placeholder="Valor (R$)" value={amt} onChange={e => setAmt(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid ' + C.blancDeBlanc, borderRadius: 8, marginBottom: 8, fontSize: 13, boxSizing: 'border-box' }} /><textarea placeholder="Qual dívida?" value={note} onChange={e => setNote(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid ' + C.blancDeBlanc, borderRadius: 8, marginBottom: 10, fontSize: 13, minHeight: 50, resize: 'none', boxSizing: 'border-box' }} /><div style={{ display: 'flex', gap: 8 }}><button type="button" onClick={() => setShowDebtForm(false)} style={{ flex: 1, background: C.blancDeBlanc, border: 'none', padding: 10, borderRadius: 8, cursor: 'pointer' }}>Cancelar</button><button type="submit" disabled={saving} style={{ flex: 1, background: C.success, border: 'none', color: C.white, padding: 10, borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{saving ? '...' : 'Registrar'}</button></div></form>)}
        {!showPurchaseForm ? (<button onClick={() => setShowPurchaseForm(true)} style={{ width: '100%', background: C.white, border: '1px solid ' + C.alaskanBlue, color: C.alaskanBlue, padding: 11, borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', marginBottom: 10 }}>🏆 Conquista pessoal</button>) : (<form onSubmit={addPurchase} style={{ background: C.white, borderRadius: 12, padding: 16, marginBottom: 10 }}><h3 style={{ color: C.trueBlue, marginBottom: 10, fontSize: 14, fontWeight: 600 }}>Conquista</h3><input type="number" placeholder="Valor (R$) - opcional" value={amt} onChange={e => setAmt(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid ' + C.blancDeBlanc, borderRadius: 8, marginBottom: 8, fontSize: 13, boxSizing: 'border-box' }} /><textarea placeholder="O que conquistou?" value={note} onChange={e => setNote(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid ' + C.blancDeBlanc, borderRadius: 8, marginBottom: 10, fontSize: 13, minHeight: 50, resize: 'none', boxSizing: 'border-box' }} /><div style={{ display: 'flex', gap: 8 }}><button type="button" onClick={() => setShowPurchaseForm(false)} style={{ flex: 1, background: C.blancDeBlanc, border: 'none', padding: 10, borderRadius: 8, cursor: 'pointer' }}>Cancelar</button><button type="submit" disabled={saving} style={{ flex: 1, background: C.alaskanBlue, border: 'none', color: C.white, padding: 10, borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{saving ? '...' : 'Registrar'}</button></div></form>)}
        <div style={{ background: C.white, borderRadius: 14, padding: 16, marginTop: 6 }}>
          <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 12px', fontWeight: 600 }}>Conquistas</h3>
          {CONQUISTAS.map(c => { const achieved = days >= c.dias; return (<div key={c.dias} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid ' + C.blancDeBlanc }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 22, height: 22, borderRadius: '50%', background: achieved ? C.success : C.blancDeBlanc, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 11 }}>{achieved ? '✓' : ''}</span><span style={{ color: achieved ? C.trueBlue : C.blackRobe, opacity: achieved ? 1 : 0.5, fontWeight: achieved ? 600 : 400, fontSize: 13 }}>{c.nome}</span></div><span style={{ color: achieved ? C.success : C.blackRobe, opacity: achieved ? 1 : 0.5, fontSize: 12 }}>+{c.xp} XP</span></div>) })}
        </div>
      </div>
    )
  }

  const Goals = () => (<div style={{ padding: 20, paddingBottom: 100 }}><button onClick={() => setPage('home')} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button><GoalsTracker userId={user.id} savings={savings} goals={goals} onUpdate={loadData} /></div>)
  const Autoexclusao = () => (<div style={{ padding: 20, paddingBottom: 100 }}><button onClick={() => setPage('home')} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button><AutoexclusaoCentral /></div>)
  const APAJ = () => (<div style={{ padding: 20, paddingBottom: 100 }}><VideoFeed suggestedVideo={riskAlert?.video} /><div style={{ marginTop: 20 }}><DoacaoAPAJ savings={savings.total} milestone={days >= 30} /></div></div>)
  const Profile = () => (<div style={{ padding: 20, paddingBottom: 100 }}><h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 16, fontWeight: 600 }}>Perfil</h1><div style={{ background: C.white, borderRadius: 14, padding: 18, marginBottom: 16 }}><div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}><div style={{ width: 56, height: 56, background: C.trueBlue, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: C.white, fontWeight: 600 }}>{profile?.name ? profile.name.charAt(0).toUpperCase() : '?'}</div><div><h2 style={{ color: C.trueBlue, fontSize: 16, margin: '0 0 4px', fontWeight: 600 }}>{profile?.name || 'Usuário'}</h2><p style={{ color: C.blackRobe, fontSize: 12, margin: 0, opacity: 0.6 }}>{user.email}</p></div></div><div style={{ background: C.iceMelt, borderRadius: 10, padding: 12, marginBottom: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: C.trueBlue, fontWeight: 600, fontSize: 13 }}>Level {currentLevel.level} - {currentLevel.nome}</span><span style={{ color: C.alaskanBlue, fontWeight: 700 }}>{totalXP} XP</span></div></div>{profile?.emergency_contact?.phone && <div style={{ background: '#e8f5e9', borderRadius: 10, padding: 12, marginBottom: 12 }}><p style={{ color: C.success, fontSize: 12, margin: 0 }}>📱 Contato SOS: {profile.emergency_contact.name || profile.emergency_contact.phone}</p></div>}<button onClick={() => setPage('setup')} style={{ width: '100%', padding: 11, background: C.iceMelt, border: 'none', borderRadius: 10, cursor: 'pointer', marginBottom: 8, color: C.trueBlue, fontWeight: 500, fontSize: 13 }}>Editar Configurações</button><button onClick={handleLogout} style={{ width: '100%', padding: 11, background: '#ffebee', border: 'none', borderRadius: 10, color: C.danger, cursor: 'pointer', fontWeight: 500, fontSize: 13 }}>Sair da Conta</button></div></div>)

  const renderPage = () => { switch (page) { case 'home': return <Home />; case 'setup': return <Setup />; case 'diary': return <Diary />; case 'progress': return <Progress />; case 'goals': return <Goals />; case 'autoexclusao': return <Autoexclusao />; case 'apaj': return <APAJ />; case 'profile': return <Profile />; default: return <Home /> } }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.iceMelt }}><p style={{ color: C.trueBlue }}>Carregando...</p></div>

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: C.iceMelt, minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      {renderPage()}
      <SOSButton />
      <NavBar />
      {showSOS && <SOSFissura profile={profile} onClose={() => setShowSOS(false)} />}
    </div>
  )
}
