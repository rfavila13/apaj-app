import React, { useState, useEffect } from 'react'
import { patientService } from '../../services/patientService'
import { supabase } from '../../services/supabase'
import { analyzeTriggers, generateRiskReport } from '../../utils/triggerAnalyzer'
import SOSFissura from '../../components/SOSFissura'
import GoalsTracker from '../../components/GoalsTracker'
import EpisodeProcessor from '../../components/EpisodeProcessor'
import NightMode from '../../components/NightMode'
import VaultManager from '../../components/VaultManager'
import BehavioralContract from '../../components/BehavioralContract'
import CrisisPlan from '../../components/CrisisPlan'
import MentorSystem from '../../components/MentorSystem'
import VictoryWall from '../../components/VictoryWall'
import StoryWall from '../../components/StoryWall'
import CommunityChallenge from '../../components/CommunityChallenge'
import BreathingMode from '../../components/BreathingMode'
import { VideoFeed, AutoexclusaoCentral, DoacaoAPAJ } from '../../components/APAJEcosystem'
import ResourceLibrary from '../../components/ResourceLibrary'
import SupportNetwork from '../../components/SupportNetwork'
import DailyMissions from '../../components/DailyMissions'
import MeetingRooms from '../../components/MeetingRooms'

const C = { trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff', blackRobe: '#2b2b2b', blancDeBlanc: '#e9e9ea', white: '#ffffff', success: '#28a068', warning: '#e8a040', danger: '#d04040' }

const FRASES = ["Cada dia sem apostar é uma vitória!", "Você é mais forte do que imagina.", "O dinheiro guardado constrói seu futuro.", "Liberdade é não depender do jogo.", "Sua família agradece cada escolha consciente."]
const MARCOS = [{ dias: 1, nome: '1º Dia' }, { dias: 3, nome: '3 Dias' }, { dias: 7, nome: '1 Semana' }, { dias: 14, nome: '2 Semanas' }, { dias: 30, nome: '1 Mês' }, { dias: 60, nome: '2 Meses' }, { dias: 90, nome: '3 Meses' }, { dias: 180, nome: '6 Meses' }, { dias: 365, nome: '1 Ano' }]
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
  const [vault, setVault] = useState([])
  const [contract, setContract] = useState(null)
  const [crisisPlan, setCrisisPlan] = useState(null)
  const [episodes, setEpisodes] = useState([])
  const [nightActive, setNightActive] = useState(false)

  useEffect(() => { loadData() }, [user])
  useEffect(() => { const i = setInterval(() => setFraseIndex(x => (x + 1) % FRASES.length), 10000); return () => clearInterval(i) }, [])
  useEffect(() => {
    if (!profile?.night_mode_settings?.enabled) { setNightActive(false); return }
    const check = () => {
      const h = new Date().getHours()
      const { start_hour, end_hour } = profile.night_mode_settings
      setNightActive(start_hour < end_hour ? (h >= start_hour && h < end_hour) : (h >= start_hour || h < end_hour))
    }
    check()
    const i = setInterval(check, 60000)
    return () => clearInterval(i)
  }, [profile])

  const loadData = async () => {
    try {
      const [p, r, diary, dbt, purch, gls, vlt, ctr, cp, ep] = await Promise.all([
        patientService.getMyProfile(user.id),
        patientService.getMyRelapses(user.id),
        supabase.from('diary_entries').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }),
        supabase.from('patient_debts').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }),
        supabase.from('patient_purchases').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }),
        supabase.from('patient_goals').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }),
        supabase.from('evidence_vault').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }),
        supabase.from('behavioral_contracts').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('crisis_plans').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('episodes').select('*').eq('patient_id', user.id).order('created_at', { ascending: false })
      ])
      if (p.data) setProfile(p.data)
      if (r.data) setRelapses(r.data)
      if (diary.data) { setDiaryEntries(diary.data); analyzeRisk(diary.data) }
      if (dbt.data) setDebts(dbt.data)
      if (purch.data) setPurchases(purch.data)
      if (gls.data) setGoals(gls.data)
      if (vlt.data) setVault(vlt.data)
      if (ctr.data) setContract(ctr.data)
      if (cp.data) setCrisisPlan(cp.data)
      if (ep.data) setEpisodes(ep.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const analyzeRisk = (entries) => {
    const analysis = analyzeTriggers(entries)
    const report = generateRiskReport(analysis)
    setRiskAlert(report)
  }

  const publishVictory = async (type, message) => {
    try { await supabase.from('anonymous_victories').insert({ type, message }) }
    catch (e) { console.error('Erro ao publicar vitória:', e) }
  }

  const handleLogout = () => { if (onLogout) onLogout() }

  const days = profile?.sober_start_date ? patientService.calcDays(profile.sober_start_date, relapses) : 0
  const savings = profile?.sober_start_date && profile?.previous_gambling_amount ? patientService.calcSavings(profile.sober_start_date, profile.previous_gambling_amount, relapses) : { total: 0 }
  const getPhase = (d) => { if (d >= 365) return 'Superação'; if (d >= 180) return 'Transformação'; if (d >= 90) return 'Consolidação'; if (d >= 30) return 'Construção'; if (d >= 7) return 'Começo'; return 'Início' }
  const currentPhase = getPhase(days)

  const NavBar = () => (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.trueBlue, padding: '8px 0 12px', display: 'flex', justifyContent: 'space-around', zIndex: 1000, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
      {[{ id: 'home', icon: '🏠', label: 'Início' }, { id: 'progress', icon: '📈', label: 'Progresso' }, { id: 'diary', icon: '📔', label: 'Diário' }, { id: 'tools', icon: '🔧', label: 'Ferramentas' }, { id: 'profile', icon: '👤', label: 'Perfil' }].map(i => (
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
              <span style={{ fontSize: 15, fontWeight: 700 }}>R$ {Math.floor(savings.total).toLocaleString('pt-BR')}</span>
              <p style={{ fontSize: 10, opacity: 0.8, margin: '4px 0 0' }}>Economizado</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{diaryEntries.length}</span>
              <p style={{ fontSize: 10, opacity: 0.8, margin: '4px 0 0' }}>Reflexões</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{currentPhase}</span>
              <p style={{ fontSize: 10, opacity: 0.8, margin: '4px 0 0' }}>Sua fase</p>
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
      <div style={{ marginTop: 12 }}>
        <p style={{ color: C.blackRobe, fontSize: 11, opacity: 0.5, margin: '0 0 10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Comunidade</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <button onClick={() => setPage('challenge')} style={{ background: C.trueBlue, border: 'none', borderRadius: 14, padding: '14px 10px', cursor: 'pointer', textAlign: 'center' }}>
            <span style={{ fontSize: 24 }}>🏆</span>
            <p style={{ color: C.white, fontSize: 10, margin: '6px 0 0', fontWeight: 600 }}>Desafio</p>
          </button>
          <button onClick={() => setPage('stories')} style={{ background: C.alaskanBlue, border: 'none', borderRadius: 14, padding: '14px 10px', cursor: 'pointer', textAlign: 'center' }}>
            <span style={{ fontSize: 24 }}>📖</span>
            <p style={{ color: C.white, fontSize: 10, margin: '6px 0 0', fontWeight: 600 }}>Histórias</p>
          </button>
          <button onClick={() => setPage('rooms')} style={{ background: '#7b5ea7', border: 'none', borderRadius: 14, padding: '14px 10px', cursor: 'pointer', textAlign: 'center' }}>
            <span style={{ fontSize: 24 }}>🗓️</span>
            <p style={{ color: C.white, fontSize: 10, margin: '6px 0 0', fontWeight: 600 }}>Reuniões</p>
          </button>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <DailyMissions userId={user.id} onClose={() => setPage('missoes')} compact />
      </div>
      <div style={{ marginTop: 4 }}>
        <p style={{ color: C.blackRobe, fontSize: 11, opacity: 0.5, margin: '0 0 10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Recursos & Apoio</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={() => setPage('biblioteca')} style={{ background: C.white, border: 'none', borderRadius: 14, padding: '14px 10px', cursor: 'pointer', textAlign: 'center' }}>
            <span style={{ fontSize: 24 }}>📚</span>
            <p style={{ color: C.trueBlue, fontSize: 10, margin: '6px 0 0', fontWeight: 600 }}>Biblioteca</p>
          </button>
          <button onClick={() => setPage('rede-apoio')} style={{ background: C.white, border: 'none', borderRadius: 14, padding: '14px 10px', cursor: 'pointer', textAlign: 'center' }}>
            <span style={{ fontSize: 24 }}>🏥</span>
            <p style={{ color: C.trueBlue, fontSize: 10, margin: '6px 0 0', fontWeight: 600 }}>Rede de Apoio</p>
          </button>
        </div>
      </div>
    </div>
  )

  const Setup = () => {
    const [f, setF] = useState({
      name: profile?.name || '',
      phone: profile?.phone || '',
      monthly_income: profile?.monthly_income || '',
      previous_gambling_amount: profile?.previous_gambling_amount || '',
      sober_start_date: profile?.sober_start_date || new Date().toISOString().split('T')[0],
      emergency_contact_name: profile?.emergency_contact?.name || '',
      emergency_contact_phone: profile?.emergency_contact?.phone || ''
    })
    const [saving, setSaving] = useState(false)
    const save = async (e) => {
      e.preventDefault()
      setSaving(true)
      try {
        await patientService.updateProfile(user.id, {
          name: f.name, phone: f.phone,
          monthly_income: parseFloat(f.monthly_income) || 0,
          previous_gambling_amount: parseFloat(f.previous_gambling_amount) || 0,
          sober_start_date: f.sober_start_date,
          emergency_contact: { name: f.emergency_contact_name, phone: f.emergency_contact_phone }
        })
        await loadData()
        setPage('home')
      } catch (err) { alert('Erro: ' + err.message) }
      finally { setSaving(false) }
    }
    const inputStyle = { width: '100%', padding: '11px 14px', border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }
    const labelStyle = { display: 'block', color: C.blackRobe, marginBottom: 6, fontSize: 12, fontWeight: 500 }
    return (
      <div style={{ padding: 20, paddingBottom: 100 }}>
        <button onClick={() => setPage('home')} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button>
        <h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 20, fontWeight: 600 }}>Configurar Perfil</h1>
        <form onSubmit={save} style={{ background: C.white, borderRadius: 16, padding: 20 }}>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Seu nome</label><input type="text" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} style={inputStyle} /></div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Seu telefone</label><input type="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} style={inputStyle} /></div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Renda mensal (R$)</label><input type="number" value={f.monthly_income} onChange={e => setF({ ...f, monthly_income: e.target.value })} style={inputStyle} /></div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Quanto gastava/mês em apostas?</label><input type="number" value={f.previous_gambling_amount} onChange={e => setF({ ...f, previous_gambling_amount: e.target.value })} style={inputStyle} /></div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>Data de início da recuperação</label><input type="date" value={f.sober_start_date} onChange={e => setF({ ...f, sober_start_date: e.target.value })} style={inputStyle} /></div>
          <div style={{ background: C.iceMelt, borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <p style={{ color: C.trueBlue, fontSize: 13, margin: '0 0 12px', fontWeight: 600 }}>📱 Contato de Emergência (SOS)</p>
            <input type="text" placeholder="Nome do contato" value={f.emergency_contact_name} onChange={e => setF({ ...f, emergency_contact_name: e.target.value })} style={{ ...inputStyle, marginBottom: 10 }} />
            <input type="tel" placeholder="WhatsApp do contato (com DDD)" value={f.emergency_contact_phone} onChange={e => setF({ ...f, emergency_contact_phone: e.target.value })} style={inputStyle} />
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
      e.preventDefault()
      if (!mood) { alert('Selecione como você está'); return }
      setSaving(true)
      try {
        await supabase.from('diary_entries').insert({ patient_id: user.id, content: entry || null, mood, emotions: emotions.length > 0 ? emotions : null })
        const { data } = await supabase.from('diary_entries').select('*').eq('patient_id', user.id).order('created_at', { ascending: false })
        if (data) { setDiaryEntries(data); analyzeRisk(data) }
        setShowForm(false); setEntry(''); setMood(''); setEmotions([])
      } catch (err) { alert('Erro: ' + err.message) }
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
              {EMOTIONS.map(em => (
                <button key={em} type="button" onClick={() => toggleEmotion(em)} style={{ background: emotions.includes(em) ? (em === 'Fissura' ? C.danger : C.alaskanBlue) : C.blancDeBlanc, color: emotions.includes(em) ? C.white : C.blackRobe, border: 'none', padding: '7px 12px', borderRadius: 16, fontSize: 12, cursor: 'pointer' }}>{em}</button>
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
        <h1 style={{ color: C.trueBlue, fontSize: 18, marginBottom: 14, fontWeight: 600 }}>Diário</h1>
        <button onClick={() => setShowForm(true)} style={{ width: '100%', background: C.trueBlue, color: C.white, border: 'none', padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 14 }}>+ Nova Entrada</button>
        {diaryEntries.length === 0 ? (
          <div style={{ background: C.white, borderRadius: 12, padding: 28, textAlign: 'center' }}><p style={{ color: C.blackRobe, opacity: 0.6, margin: 0 }}>Nenhuma entrada</p></div>
        ) : diaryEntries.slice(0, 15).map(d => (
          <div key={d.id} style={{ background: C.white, borderRadius: 12, padding: 14, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: C.trueBlue, fontSize: 11, fontWeight: 600 }}>{new Date(d.created_at).toLocaleDateString('pt-BR')}</span>
              {d.mood && <span style={{ background: MOOD_CONFIG[d.mood]?.bg || C.iceMelt, color: MOOD_CONFIG[d.mood]?.color || C.trueBlue, padding: '2px 8px', borderRadius: 8, fontSize: 10 }}>{MOOD_CONFIG[d.mood]?.icon} {d.mood}</span>}
            </div>
            {d.emotions?.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>{d.emotions.map(em => <span key={em} style={{ background: em === 'Fissura' ? '#ffebee' : C.blancDeBlanc, color: em === 'Fissura' ? C.danger : C.blackRobe, padding: '2px 6px', borderRadius: 6, fontSize: 9 }}>{em}</span>)}</div>}
            {d.content && <p style={{ color: C.blackRobe, fontSize: 12, lineHeight: 1.4, margin: 0 }}>{d.content.slice(0, 150)}{d.content.length > 150 ? '...' : ''}</p>}
          </div>
        ))}
      </div>
    )
  }

  const Progress = () => {
    const [showEpisode, setShowEpisode] = useState(false)
    const [showDebt, setShowDebt] = useState(false)
    const [showPurchase, setShowPurchase] = useState(false)
    const [amt, setAmt] = useState('')
    const [note, setNote] = useState('')
    const [saving, setSaving] = useState(false)
    const addDebt = async (e) => {
      e.preventDefault()
      if (!note.trim()) return
      setSaving(true)
      try {
        await supabase.from('patient_debts').insert({ patient_id: user.id, amount: parseFloat(amt) || 0, description: note })
        await publishVictory('debt', `Alguém quitou uma dívida de R$ ${(parseFloat(amt) || 0).toLocaleString('pt-BR')}`)
        await loadData()
        setShowDebt(false); setAmt(''); setNote('')
      } catch (err) { alert('Erro: ' + err.message) }
      finally { setSaving(false) }
    }
    const addPurchase = async (e) => {
      e.preventDefault()
      if (!note.trim()) return
      setSaving(true)
      try {
        await supabase.from('patient_purchases').insert({ patient_id: user.id, amount: parseFloat(amt) || 0, description: note })
        await publishVictory('achievement', 'Alguém registrou uma conquista!')
        await loadData()
        setShowPurchase(false); setAmt(''); setNote('')
      } catch (err) { alert('Erro: ' + err.message) }
      finally { setSaving(false) }
    }
    if (showEpisode) return <EpisodeProcessor userId={user.id} onComplete={() => { setShowEpisode(false); loadData() }} onCancel={() => setShowEpisode(false)} />
    if (!profile?.sober_start_date) return (
      <div style={{ padding: 20, paddingBottom: 100, textAlign: 'center' }}>
        <h2 style={{ color: C.trueBlue, marginTop: 40 }}>Configure seu perfil</h2>
        <button onClick={() => setPage('setup')} style={{ marginTop: 16, background: C.trueBlue, color: C.white, border: 'none', padding: '12px 24px', borderRadius: 10, cursor: 'pointer' }}>Configurar</button>
      </div>
    )
    return (
      <div style={{ padding: 20, paddingBottom: 100 }}>
        <div style={{ background: C.trueBlue, borderRadius: 16, padding: 20, marginBottom: 14, color: C.white }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 52, fontWeight: 700 }}>{days}</span>
            <p style={{ fontSize: 12, margin: '4px 0 0' }}>dias de progresso</p>
            {episodes.length > 0 && <p style={{ fontSize: 11, opacity: 0.7, margin: '4px 0 0' }}>{episodes.length} episódio(s) processado(s)</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: 10, borderRadius: 10, textAlign: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>R$ {Math.floor(savings.total).toLocaleString('pt-BR')}</span>
              <p style={{ fontSize: 9, opacity: 0.8, margin: '2px 0 0' }}>Economizado</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: 10, borderRadius: 10, textAlign: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{diaryEntries.length}</span>
              <p style={{ fontSize: 9, opacity: 0.8, margin: '2px 0 0' }}>Reflexões</p>
            </div>
          </div>
        </div>
        <button onClick={() => setShowEpisode(true)} style={{ width: '100%', background: C.white, border: '1px solid ' + C.warning, color: C.warning, padding: 11, borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: 'pointer', marginBottom: 8 }}>Preciso Processar Algo</button>
        {!showDebt ? (
          <button onClick={() => setShowDebt(true)} style={{ width: '100%', background: C.white, border: '1px solid ' + C.success, color: C.success, padding: 11, borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: 'pointer', marginBottom: 8 }}>💰 Quitou dívida?</button>
        ) : (
          <form onSubmit={addDebt} style={{ background: C.white, borderRadius: 10, padding: 14, marginBottom: 8 }}>
            <input type="number" placeholder="Valor (R$)" value={amt} onChange={e => setAmt(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid ' + C.blancDeBlanc, borderRadius: 8, marginBottom: 8, fontSize: 12, boxSizing: 'border-box' }} />
            <textarea placeholder="Qual dívida?" value={note} onChange={e => setNote(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid ' + C.blancDeBlanc, borderRadius: 8, marginBottom: 8, fontSize: 12, minHeight: 50, resize: 'none', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setShowDebt(false)} style={{ flex: 1, background: C.blancDeBlanc, border: 'none', padding: 10, borderRadius: 8, cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" disabled={saving} style={{ flex: 1, background: C.success, color: C.white, border: 'none', padding: 10, borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{saving ? '...' : 'Salvar'}</button>
            </div>
          </form>
        )}
        {!showPurchase ? (
          <button onClick={() => setShowPurchase(true)} style={{ width: '100%', background: C.white, border: '1px solid ' + C.alaskanBlue, color: C.alaskanBlue, padding: 11, borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: 'pointer', marginBottom: 8 }}>🏆 Conquista pessoal</button>
        ) : (
          <form onSubmit={addPurchase} style={{ background: C.white, borderRadius: 10, padding: 14, marginBottom: 8 }}>
            <input type="number" placeholder="Valor (R$) - opcional" value={amt} onChange={e => setAmt(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid ' + C.blancDeBlanc, borderRadius: 8, marginBottom: 8, fontSize: 12, boxSizing: 'border-box' }} />
            <textarea placeholder="O que conquistou?" value={note} onChange={e => setNote(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid ' + C.blancDeBlanc, borderRadius: 8, marginBottom: 8, fontSize: 12, minHeight: 50, resize: 'none', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setShowPurchase(false)} style={{ flex: 1, background: C.blancDeBlanc, border: 'none', padding: 10, borderRadius: 8, cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" disabled={saving} style={{ flex: 1, background: C.alaskanBlue, color: C.white, border: 'none', padding: 10, borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{saving ? '...' : 'Salvar'}</button>
            </div>
          </form>
        )}
        <div style={{ background: C.white, borderRadius: 12, padding: 14, marginTop: 6 }}>
          <h3 style={{ color: C.trueBlue, fontSize: 13, margin: '0 0 10px', fontWeight: 600 }}>Marcos</h3>
          {MARCOS.map(c => {
            const achieved = days >= c.dias
            return (
              <div key={c.dias} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid ' + C.blancDeBlanc }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: achieved ? C.success : C.blancDeBlanc, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 10 }}>{achieved ? '✓' : ''}</span>
                  <span style={{ color: achieved ? C.trueBlue : C.blackRobe, opacity: achieved ? 1 : 0.5, fontSize: 12 }}>{c.nome}</span>
                </div>
                {achieved && <span style={{ color: C.success, fontSize: 11, fontWeight: 600 }}>Alcançado ✓</span>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const Tools = () => (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <h1 style={{ color: C.trueBlue, fontSize: 18, marginBottom: 14, fontWeight: 600 }}>Ferramentas</h1>
      <div style={{ display: 'grid', gap: 10 }}>
        {[
          { id: 'missoes', icon: '🎯', label: 'Missões Diárias', desc: 'Desafios diários para toda a comunidade' },
          { id: 'biblioteca', icon: '📚', label: 'Biblioteca de Recursos', desc: 'Livros, podcasts, artigos e vídeos' },
          { id: 'rede-apoio', icon: '🏥', label: 'Rede de Apoio (SUS)', desc: 'CVV, CAPS, JA, direitos e políticas' },
          { id: 'rooms', icon: '🗓️', label: 'Salas & Reuniões', desc: 'Grupos de terapia e mural da comunidade' },
          { id: 'breathing', icon: '🧘', label: 'Respiração Guiada', desc: 'Técnicas para momentos difíceis' },
          { id: 'videos', icon: '🎥', label: 'Pílulas de Conhecimento', desc: 'Vídeos dos especialistas APAJ' },
          { id: 'autoexclusao', icon: '🛡️', label: 'Central de Autoexclusão', desc: 'Bloqueie acesso às plataformas' },
          { id: 'goals', icon: '🎯', label: 'Objetivos de Vida', desc: 'Transforme economia em metas' },
          { id: 'vault', icon: '📦', label: 'Cofre de Evidências', desc: 'Lembretes para momentos difíceis' },
          { id: 'contract', icon: '📋', label: 'Contrato Comportamental', desc: 'Seus compromissos' },
          { id: 'crisis', icon: '🚨', label: 'Plano de Crise', desc: 'Passos de emergência' },
          { id: 'stories', icon: '📖', label: 'Histórias de Superação', desc: 'Inspire-se e inspire a comunidade' },
          { id: 'challenge', icon: '🏆', label: 'Desafio da Semana', desc: 'Missão coletiva da comunidade' },
          { id: 'donate', icon: '💙', label: 'Apoiar a APAJ', desc: 'Contribua com a causa' }
        ].map(t => (
          <button key={t.id} onClick={() => setPage(t.id)} style={{ background: C.white, border: 'none', borderRadius: 12, padding: 14, cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 28 }}>{t.icon}</span>
            <div>
              <h3 style={{ color: C.trueBlue, fontSize: 13, margin: '0 0 2px', fontWeight: 600 }}>{t.label}</h3>
              <p style={{ color: C.blackRobe, fontSize: 11, margin: 0, opacity: 0.6 }}>{t.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )

  const Profile = () => (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <h1 style={{ color: C.trueBlue, fontSize: 18, marginBottom: 14, fontWeight: 600 }}>Perfil</h1>
      <div style={{ background: C.white, borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 50, height: 50, background: C.trueBlue, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: C.white, fontWeight: 600 }}>{profile?.name?.charAt(0) || '?'}</div>
          <div>
            <h2 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 2px', fontWeight: 600 }}>{profile?.name || 'Usuário'}</h2>
            <p style={{ color: C.blackRobe, fontSize: 11, margin: 0, opacity: 0.6 }}>{user.email}</p>
          </div>
        </div>
        <div style={{ background: C.iceMelt, borderRadius: 10, padding: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: C.trueBlue, fontWeight: 600, fontSize: 12 }}>{days} dias de recuperação</span>
            <span style={{ color: C.alaskanBlue, fontWeight: 700 }}>{currentPhase}</span>
          </div>
        </div>
        {profile?.emergency_contact?.phone && (
          <div style={{ background: '#e8f5e9', borderRadius: 10, padding: 10, marginBottom: 10 }}>
            <p style={{ color: C.success, fontSize: 11, margin: 0 }}>📱 SOS: {profile.emergency_contact.name || profile.emergency_contact.phone}</p>
          </div>
        )}
        {profile?.night_mode_settings?.enabled && (
          <div style={{ background: '#e3f2fd', borderRadius: 10, padding: 10, marginBottom: 10 }}>
            <p style={{ color: C.trueBlue, fontSize: 11, margin: 0 }}>🌙 Modo Noturno: {profile.night_mode_settings.start_hour}h às {profile.night_mode_settings.end_hour}h</p>
          </div>
        )}
        <button onClick={() => setPage('setup')} style={{ width: '100%', padding: 10, background: C.iceMelt, border: 'none', borderRadius: 8, cursor: 'pointer', color: C.trueBlue, fontWeight: 500, fontSize: 12, marginBottom: 8 }}>Editar Configurações</button>
        <button onClick={handleLogout} style={{ width: '100%', padding: 10, background: '#ffebee', border: 'none', borderRadius: 8, color: C.danger, cursor: 'pointer', fontWeight: 500, fontSize: 12 }}>Sair</button>
      </div>
    </div>
  )

  const BackButton = ({ to }) => (
    <button onClick={() => setPage(to)} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button>
  )

  const renderPage = () => {
    switch (page) {
      case 'home': return <Home />
      case 'setup': return <Setup />
      case 'diary': return <Diary />
      case 'progress': return <Progress />
      case 'tools': return <Tools />
      case 'profile': return <Profile />
      case 'goals': return <div style={{ padding: 20, paddingBottom: 100 }}><BackButton to="home" /><GoalsTracker userId={user.id} savings={savings} goals={goals} onUpdate={loadData} /></div>
      case 'vault': return <VaultManager userId={user.id} vault={vault} onUpdate={loadData} onClose={() => setPage('tools')} />
      case 'contract': return <BehavioralContract userId={user.id} contract={contract} onUpdate={loadData} onClose={() => setPage('tools')} />
      case 'crisis': return <CrisisPlan userId={user.id} plan={crisisPlan} onUpdate={loadData} onClose={() => setPage('tools')} viewOnly={false} />
      case 'autoexclusao': return <div style={{ padding: 20, paddingBottom: 100 }}><BackButton to="tools" /><AutoexclusaoCentral /></div>
      case 'videos': return <div style={{ padding: 20, paddingBottom: 100 }}><BackButton to="tools" /><VideoFeed suggestedVideo={riskAlert?.video} /></div>
      case 'donate': return <div style={{ padding: 20, paddingBottom: 100 }}><BackButton to="tools" /><DoacaoAPAJ savings={savings.total} milestone={days >= 30} /></div>
      case 'mentor': return <MentorSystem userId={user.id} days={days} profile={profile} onClose={() => setPage('home')} />
      case 'victories': return <VictoryWall onClose={() => setPage('home')} />
      case 'stories': return <StoryWall userId={user.id} days={days} onClose={() => setPage('tools')} />
      case 'challenge': return <CommunityChallenge userId={user.id} onClose={() => setPage('tools')} />
      case 'breathing': return <BreathingMode onClose={() => setPage('tools')} />
      case 'biblioteca': return <ResourceLibrary onClose={() => setPage('tools')} />
      case 'rede-apoio': return <SupportNetwork onClose={() => setPage('tools')} />
      case 'missoes': return <DailyMissions userId={user.id} onClose={() => setPage('tools')} />
      case 'rooms': return <MeetingRooms userId={user.id} onClose={() => setPage('tools')} />
      default: return <Home />
    }
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.iceMelt }}><p style={{ color: C.trueBlue }}>Carregando...</p></div>

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: C.iceMelt, minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      <NightMode profile={profile} isActive={nightActive} onOpenSOS={() => setShowSOS(true)} />
      {renderPage()}
      <SOSButton />
      <NavBar />
      {showSOS && <SOSFissura profile={profile} userId={user.id} vault={vault} onClose={() => setShowSOS(false)} />}
    </div>
  )
}
