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

const C = {
  trueBlue: '#1d3f77',
  alaskanBlue: '#66aae2',
  iceMelt: '#d4eaff',
  softBg: '#f0f6ff',
  blackRobe: '#1a2a4a',
  textSec: '#64748b',
  blancDeBlanc: '#e4edf8',
  white: '#ffffff',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
}
// Tokens de estilo reutilizáveis
const card = { background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px rgba(29,63,119,0.07)', padding: 20 }
const cardSm = { background: '#fff', borderRadius: 16, boxShadow: '0 1px 8px rgba(29,63,119,0.06)', padding: 16 }
const btnPrimary = { background: 'linear-gradient(135deg, #1d3f77 0%, #274d9c 100%)', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(29,63,119,0.28)', letterSpacing: 0.2 }
const inputSt = { width: '100%', padding: '13px 16px', border: '1.5px solid #e4edf8', borderRadius: 12, fontSize: 14, boxSizing: 'border-box', background: '#f8fafd', outline: 'none', color: '#1a2a4a' }

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
  const [messages, setMessages] = useState([])
  const [riskDismissed, setRiskDismissed] = useState(() => {
    const d = localStorage.getItem('risk_dismissed')
    return d && Date.now() - parseInt(d) < 24 * 3600000
  })

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
      const [p, r, diary, dbt, purch, gls, vlt, ctr, cp, ep, msgs] = await Promise.all([
        patientService.getMyProfile(user.id),
        patientService.getMyRelapses(user.id),
        supabase.from('diary_entries').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }),
        supabase.from('patient_debts').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }),
        supabase.from('patient_purchases').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }),
        supabase.from('patient_goals').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }),
        supabase.from('evidence_vault').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }),
        supabase.from('behavioral_contracts').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('crisis_plans').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('episodes').select('*').eq('patient_id', user.id).order('created_at', { ascending: false }),
        supabase.from('quick_messages').select('*').eq('patient_id', user.id).order('sent_at', { ascending: false }).limit(20)
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
      if (msgs.data) setMessages(msgs.data)
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

  const markMessagesRead = async () => {
    const unread = messages.filter(m => !m.read_at)
    if (!unread.length) return
    try {
      await Promise.all(unread.map(m => supabase.from('quick_messages').update({ read_at: new Date().toISOString() }).eq('id', m.id)))
      setMessages(prev => prev.map(m => ({ ...m, read_at: m.read_at || new Date().toISOString() })))
    } catch (e) { console.error(e) }
  }

  const dismissRisk = () => {
    localStorage.setItem('risk_dismissed', Date.now().toString())
    setRiskDismissed(true)
  }

  const handleLogout = () => { if (onLogout) onLogout() }

  const days = profile?.sober_start_date ? patientService.calcDays(profile.sober_start_date, relapses) : 0
  const savings = profile?.sober_start_date && profile?.previous_gambling_amount ? patientService.calcSavings(profile.sober_start_date, profile.previous_gambling_amount, relapses) : { total: 0 }
  const getPhase = (d) => { if (d >= 365) return 'Superação'; if (d >= 180) return 'Transformação'; if (d >= 90) return 'Consolidação'; if (d >= 30) return 'Construção'; if (d >= 7) return 'Começo'; return 'Início' }
  const currentPhase = getPhase(days)

  const NavBar = () => {
    const unread = messages.filter(m => !m.read_at).length
    const tabs = [
      { id: 'home', icon: '🏠', label: 'Início' },
      { id: 'progress', icon: '📈', label: 'Progresso' },
      { id: 'diary', icon: '📔', label: 'Diário' },
      { id: 'tools', icon: '🔧', label: 'Ferramentas' },
      { id: 'profile', icon: '👤', label: 'Perfil' },
    ]
    return (
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.93)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(29,63,119,0.08)',
        boxShadow: '0 -4px 32px rgba(29,63,119,0.10)',
        padding: '10px 8px 16px',
        display: 'flex', justifyContent: 'space-around',
        zIndex: 1000,
      }}>
        {tabs.map(i => {
          const active = page === i.id
          return (
            <button key={i.id}
              onClick={() => { if (i.id === 'profile') markMessagesRead(); setPage(i.id) }}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                position: 'relative', padding: '4px 12px', borderRadius: 14,
                transition: 'all 0.15s',
              }}>
              <div style={{
                width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                background: active ? 'linear-gradient(135deg, #1d3f77, #274d9c)' : 'transparent',
                boxShadow: active ? '0 4px 12px rgba(29,63,119,0.25)' : 'none',
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: active ? 20 : 20, filter: active ? 'brightness(0) invert(1)' : 'none' }}>{i.icon}</span>
              </div>
              {i.id === 'profile' && unread > 0 && (
                <span style={{ position: 'absolute', top: 2, right: 8, background: C.danger, color: C.white, fontSize: 9, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, boxShadow: '0 1px 4px rgba(239,68,68,0.4)' }}>{unread}</span>
              )}
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, color: active ? C.trueBlue : C.textSec, letterSpacing: active ? 0.1 : 0 }}>{i.label}</span>
            </button>
          )
        })}
      </nav>
    )
  }

  const SOSButton = () => (
    <button onClick={() => setShowSOS(true)} style={{ position: 'fixed', bottom: 94, right: 18, width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #dc2626, #ef4444)', border: '3px solid rgba(255,255,255,0.9)', color: C.white, fontSize: 26, cursor: 'pointer', boxShadow: '0 4px 20px rgba(239,68,68,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse-ring 2.5s ease-out infinite, pulse-scale 2.5s ease-in-out infinite' }}>
      🆘
    </button>
  )

  const Home = () => (
    <div style={{ background: C.softBg, paddingBottom: 110 }}>
      {/* Header com gradiente */}
      <div style={{ background: 'linear-gradient(160deg, #0d2b5e 0%, #1d3f77 55%, #2a5298 100%)', padding: '52px 24px 32px', position: 'relative', overflow: 'hidden' }}>
        {/* Detalhe decorativo */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(102,170,226,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: 40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(102,170,226,0.07)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, position: 'relative' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: '0 0 4px', letterSpacing: 0.2 }}>Olá,</p>
            <h1 style={{ color: C.white, fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: -0.3 }}>
              {profile?.name?.split(' ')[0] || 'Bem-vindo'}! 👋
            </h1>
          </div>
          <img src="/logo-apaj.png" alt="APAJ" style={{ width: 56, opacity: 0.9, filter: 'brightness(0) invert(1)' }} />
        </div>

        {/* Frase motivacional */}
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 16px', position: 'relative' }}>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
            "{FRASES[fraseIndex]}"
          </p>
        </div>
      </div>

      {/* Alerta de risco */}
      {riskAlert && !riskDismissed && (
        <div style={{ margin: '16px 16px 0', background: riskAlert.level === 'high' ? C.danger : C.warning, borderRadius: 16, padding: 16, color: C.white, boxShadow: `0 4px 16px ${riskAlert.level === 'high' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>⚠️ {riskAlert.level === 'high' ? 'Alerta de Risco' : 'Atenção'}</p>
            <button onClick={dismissRisk} style={{ background: 'rgba(255,255,255,0.25)', border: 'none', color: C.white, borderRadius: 8, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Dispensar</button>
          </div>
          <p style={{ margin: '0 0 10px', fontSize: 13, opacity: 0.95, lineHeight: 1.5 }}>{riskAlert.message}</p>
          {riskAlert.video && (
            <a href={riskAlert.video.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: 'rgba(255,255,255,0.2)', padding: '10px 12px', borderRadius: 10, color: C.white, textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              ▶️ Assista: {riskAlert.video.title}
            </a>
          )}
        </div>
      )}

      <div style={{ padding: '20px 16px 0' }}>
        {/* Card principal — dias */}
        {profile?.sober_start_date ? (
          <div style={{ background: 'linear-gradient(135deg, #1d3f77 0%, #274d9c 50%, #2a5298 100%)', borderRadius: 24, padding: '28px 24px 24px', marginBottom: 16, color: C.white, boxShadow: '0 8px 32px rgba(29,63,119,0.3)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>{days}</span>
              <p style={{ fontSize: 14, opacity: 0.75, margin: '6px 0 0', letterSpacing: 0.3, fontWeight: 500 }}>dias sem apostar</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { value: `R$ ${Math.floor(savings.total).toLocaleString('pt-BR')}`, label: 'Economizado' },
                { value: diaryEntries.length, label: 'Reflexões' },
                { value: currentPhase, label: 'Sua fase', small: true },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.12)', padding: '12px 8px', borderRadius: 14, textAlign: 'center' }}>
                  <span style={{ fontSize: s.small ? 12 : 16, fontWeight: 700, display: 'block', lineHeight: 1.2 }}>{s.value}</span>
                  <p style={{ fontSize: 10, opacity: 0.7, margin: '5px 0 0', letterSpacing: 0.2 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ ...card, textAlign: 'center', marginBottom: 16, padding: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
            <h2 style={{ color: C.trueBlue, fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Comece sua jornada</h2>
            <p style={{ color: C.textSec, fontSize: 14, margin: '0 0 20px', lineHeight: 1.6 }}>Configure seu perfil para acompanhar cada dia de recuperação</p>
            <button onClick={() => setPage('setup')} style={{ ...btnPrimary, padding: '12px 32px' }}>Configurar Agora →</button>
          </div>
        )}

        {/* Acesso rápido */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { page: 'goals', icon: '🎯', label: 'Meus Objetivos', sub: `${goals.length} cadastrados` },
            { page: 'autoexclusao', icon: '🛡️', label: 'Autoexclusão', sub: 'Bloquear plataformas' },
          ].map(b => (
            <button key={b.page} onClick={() => setPage(b.page)} style={{ ...cardSm, border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ fontSize: 28 }}>{b.icon}</span>
              <h3 style={{ color: C.trueBlue, fontSize: 13, margin: '10px 0 3px', fontWeight: 700 }}>{b.label}</h3>
              <p style={{ color: C.textSec, fontSize: 11, margin: 0 }}>{b.sub}</p>
            </button>
          ))}
        </div>

        {/* Comunidade */}
        <p style={{ color: C.textSec, fontSize: 11, margin: '0 0 10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Comunidade</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { page: 'challenge', icon: '🏆', label: 'Desafio', bg: 'linear-gradient(135deg, #1d3f77, #274d9c)' },
            { page: 'stories', icon: '📖', label: 'Histórias', bg: 'linear-gradient(135deg, #4a90d9, #66aae2)' },
            { page: 'rooms', icon: '🗓️', label: 'Reuniões', bg: 'linear-gradient(135deg, #6b46c1, #7c5cbf)' },
          ].map(b => (
            <button key={b.page} onClick={() => setPage(b.page)} style={{ background: b.bg, border: 'none', borderRadius: 16, padding: '16px 8px', cursor: 'pointer', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              <span style={{ fontSize: 26 }}>{b.icon}</span>
              <p style={{ color: C.white, fontSize: 11, margin: '6px 0 0', fontWeight: 600, letterSpacing: 0.2 }}>{b.label}</p>
            </button>
          ))}
        </div>

        {/* Missões diárias */}
        <div style={{ marginBottom: 20 }}>
          <DailyMissions userId={user.id} onClose={() => setPage('missoes')} compact />
        </div>

        {/* Prompt onboarding do cofre */}
        {vault.length === 0 && profile?.sober_start_date && (
          <div style={{ background: 'linear-gradient(135deg, #fef9ec, #fffdf5)', border: '1.5px solid #fde68a', borderRadius: 16, padding: 16, marginBottom: 20 }}>
            <p style={{ color: C.blackRobe, fontWeight: 700, fontSize: 13, margin: '0 0 6px' }}>💡 Prepare seu Cofre SOS</p>
            <p style={{ color: C.textSec, fontSize: 12, margin: '0 0 12px', lineHeight: 1.5 }}>Adicione uma frase ou foto que te dê força quando a fissura aparecer.</p>
            <button onClick={() => setPage('vault')} style={{ background: C.warning, color: C.white, border: 'none', padding: '9px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(245,158,11,0.3)' }}>Adicionar ao Cofre →</button>
          </div>
        )}

        {/* Recursos */}
        <p style={{ color: C.textSec, fontSize: 11, margin: '0 0 10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Recursos & Apoio</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { page: 'biblioteca', icon: '📚', label: 'Biblioteca' },
            { page: 'rede-apoio', icon: '🏥', label: 'Rede de Apoio' },
          ].map(b => (
            <button key={b.page} onClick={() => setPage(b.page)} style={{ ...cardSm, border: 'none', cursor: 'pointer', textAlign: 'center', padding: 16 }}>
              <span style={{ fontSize: 28 }}>{b.icon}</span>
              <p style={{ color: C.trueBlue, fontSize: 12, margin: '8px 0 0', fontWeight: 600 }}>{b.label}</p>
            </button>
          ))}
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
    const lb = { display: 'block', color: C.blackRobe, marginBottom: 6, fontSize: 13, fontWeight: 600 }
    return (
      <div style={{ background: C.softBg, minHeight: '100vh', paddingBottom: 100 }}>
        <div style={{ background: 'linear-gradient(135deg, #1d3f77, #274d9c)', padding: '52px 24px 28px' }}>
          <button onClick={() => setPage('home')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: C.white, cursor: 'pointer', marginBottom: 16, fontWeight: 600, borderRadius: 10, padding: '6px 14px', fontSize: 13 }}>← Voltar</button>
          <h1 style={{ color: C.white, fontSize: 22, fontWeight: 700, margin: 0 }}>Configurar Perfil</h1>
        </div>
        <div style={{ padding: '20px 16px' }}>
          <form onSubmit={save} style={{ ...card, padding: 24 }}>
            <div style={{ marginBottom: 16 }}><label style={lb}>Seu nome</label><input type="text" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} style={inputSt} /></div>
            <div style={{ marginBottom: 16 }}><label style={lb}>Seu telefone</label><input type="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} style={inputSt} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div><label style={lb}>Renda mensal (R$)</label><input type="number" value={f.monthly_income} onChange={e => setF({ ...f, monthly_income: e.target.value })} style={inputSt} /></div>
              <div><label style={lb}>Gastava/mês em apostas</label><input type="number" value={f.previous_gambling_amount} onChange={e => setF({ ...f, previous_gambling_amount: e.target.value })} style={inputSt} /></div>
            </div>
            <div style={{ marginBottom: 20 }}><label style={lb}>Data de início da recuperação</label><input type="date" value={f.sober_start_date} onChange={e => setF({ ...f, sober_start_date: e.target.value })} style={inputSt} /></div>
            <div style={{ background: '#f0f6ff', border: '1.5px solid #d4eaff', borderRadius: 14, padding: 16, marginBottom: 20 }}>
              <p style={{ color: C.trueBlue, fontSize: 13, margin: '0 0 14px', fontWeight: 700 }}>📱 Contato de Emergência (SOS)</p>
              <div style={{ marginBottom: 12 }}><input type="text" placeholder="Nome do contato" value={f.emergency_contact_name} onChange={e => setF({ ...f, emergency_contact_name: e.target.value })} style={inputSt} /></div>
              <input type="tel" placeholder="WhatsApp (com DDD)" value={f.emergency_contact_phone} onChange={e => setF({ ...f, emergency_contact_phone: e.target.value })} style={inputSt} />
            </div>
            <button type="submit" disabled={saving} style={{ ...btnPrimary, width: '100%', opacity: saving ? 0.7 : 1 }}>{saving ? 'Salvando...' : 'Salvar Perfil'}</button>
          </form>
        </div>
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
      <div style={{ background: C.softBg, minHeight: '100vh', paddingBottom: 100 }}>
        <div style={{ background: 'linear-gradient(135deg, #1d3f77, #274d9c)', padding: '52px 24px 28px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(102,170,226,0.12)', pointerEvents: 'none' }} />
          <button onClick={() => setShowForm(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: C.white, cursor: 'pointer', marginBottom: 16, fontWeight: 600, borderRadius: 10, padding: '6px 14px', fontSize: 13, position: 'relative' }}>← Voltar</button>
          <h1 style={{ color: C.white, fontSize: 22, fontWeight: 700, margin: '0 0 4px', position: 'relative' }}>Nova Entrada</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: 0, position: 'relative' }}>Como você está se sentindo?</p>
        </div>
        <div style={{ padding: '20px 16px' }}>
          <form onSubmit={saveEntry}>
            <div style={{ ...card, marginBottom: 12 }}>
              <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 14px', fontWeight: 700 }}>Como você está? *</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                {Object.entries(MOOD_CONFIG).map(([m, cfg]) => (
                  <button key={m} type="button" onClick={() => setMood(m)} style={{ flex: 1, background: mood === m ? cfg.bg : C.softBg, border: mood === m ? '2px solid ' + cfg.color : '2px solid transparent', padding: '12px 4px', borderRadius: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 24 }}>{cfg.icon}</span>
                    <span style={{ fontSize: 9, color: mood === m ? cfg.color : C.textSec, fontWeight: mood === m ? 700 : 400 }}>{m}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ ...card, marginBottom: 12 }}>
              <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 12px', fontWeight: 700 }}>Emoções presentes</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {EMOTIONS.map(em => (
                  <button key={em} type="button" onClick={() => toggleEmotion(em)} style={{ background: emotions.includes(em) ? (em === 'Fissura' ? C.danger : C.alaskanBlue) : C.softBg, color: emotions.includes(em) ? C.white : C.blackRobe, border: 'none', padding: '8px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontWeight: emotions.includes(em) ? 600 : 400 }}>{em}</button>
                ))}
              </div>
            </div>
            <div style={{ ...card, marginBottom: 20 }}>
              <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 12px', fontWeight: 700 }}>Reflexões (opcional)</h3>
              <textarea value={entry} onChange={e => setEntry(e.target.value)} placeholder="O que está passando pela sua cabeça?" style={{ ...inputSt, minHeight: 100, resize: 'none' }} />
            </div>
            <button type="submit" disabled={saving || !mood} style={{ ...btnPrimary, width: '100%', opacity: saving || !mood ? 0.55 : 1 }}>{saving ? 'Salvando...' : 'Salvar Entrada'}</button>
          </form>
        </div>
      </div>
    )
    return (
      <div style={{ background: C.softBg, minHeight: '100vh', paddingBottom: 110 }}>
        <div style={{ background: 'linear-gradient(135deg, #1d3f77, #274d9c)', padding: '52px 24px 40px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(102,170,226,0.12)', pointerEvents: 'none' }} />
          <h1 style={{ color: C.white, fontSize: 22, fontWeight: 700, margin: '0 0 4px', position: 'relative' }}>Diário</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: 0, position: 'relative' }}>{diaryEntries.length} {diaryEntries.length === 1 ? 'reflexão' : 'reflexões'} registradas</p>
        </div>
        <div style={{ padding: '16px 16px 0' }}>
          <button onClick={() => setShowForm(true)} style={{ ...btnPrimary, width: '100%', marginBottom: 16, textAlign: 'center' }}>+ Nova Entrada</button>
          {diaryEntries.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📔</div>
              <p style={{ color: C.textSec, margin: 0, fontSize: 14, lineHeight: 1.6 }}>Seu diário está em branco.<br />Registre como você está se sentindo hoje.</p>
            </div>
          ) : diaryEntries.slice(0, 15).map(d => (
            <div key={d.id} style={{ ...cardSm, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: d.emotions?.length > 0 || d.content ? 10 : 0 }}>
                <span style={{ color: C.textSec, fontSize: 12 }}>{new Date(d.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                {d.mood && <span style={{ background: MOOD_CONFIG[d.mood]?.bg || C.iceMelt, color: MOOD_CONFIG[d.mood]?.color || C.trueBlue, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{MOOD_CONFIG[d.mood]?.icon} {d.mood}</span>}
              </div>
              {d.emotions?.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: d.content ? 8 : 0 }}>{d.emotions.map(em => <span key={em} style={{ background: em === 'Fissura' ? '#ffebee' : C.softBg, color: em === 'Fissura' ? C.danger : C.textSec, padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 500 }}>{em}</span>)}</div>}
              {d.content && <p style={{ color: C.blackRobe, fontSize: 13, lineHeight: 1.5, margin: 0 }}>{d.content.slice(0, 150)}{d.content.length > 150 ? '...' : ''}</p>}
            </div>
          ))}
        </div>
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
      <div style={{ background: C.softBg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <h2 style={{ color: C.trueBlue, margin: '0 0 8px', textAlign: 'center' }}>Configure seu perfil</h2>
        <p style={{ color: C.textSec, margin: '0 0 24px', textAlign: 'center', fontSize: 14 }}>Defina sua data de início para acompanhar seu progresso</p>
        <button onClick={() => setPage('setup')} style={{ ...btnPrimary }}>Configurar Agora →</button>
      </div>
    )
    return (
      <div style={{ background: C.softBg, minHeight: '100vh', paddingBottom: 110 }}>
        <div style={{ background: 'linear-gradient(160deg, #0d2b5e 0%, #1d3f77 55%, #2a5298 100%)', padding: '52px 24px 60px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(102,170,226,0.1)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, left: 20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(102,170,226,0.07)', pointerEvents: 'none' }} />
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <span style={{ fontSize: 72, fontWeight: 800, color: C.white, letterSpacing: -3, lineHeight: 1, display: 'block' }}>{days}</span>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, margin: '6px 0 24px', letterSpacing: 0.5 }}>dias sem apostar</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.12)', padding: '12px 8px', borderRadius: 14 }}>
                <span style={{ color: C.white, fontSize: 16, fontWeight: 700 }}>R$ {Math.floor(savings.total).toLocaleString('pt-BR')}</span>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, margin: '4px 0 0' }}>Economizado</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.12)', padding: '12px 8px', borderRadius: 14 }}>
                <span style={{ color: C.white, fontSize: 16, fontWeight: 700 }}>{diaryEntries.length}</span>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, margin: '4px 0 0' }}>Reflexões</p>
              </div>
            </div>
          </div>
        </div>
        <div style={{ margin: '-30px 16px 0', position: 'relative', zIndex: 1 }}>
          <div style={{ ...card, marginBottom: 14 }}>
            <p style={{ color: C.textSec, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 12px' }}>Registrar evento</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => setShowEpisode(true)} style={{ width: '100%', background: 'rgba(245,158,11,0.08)', border: '1.5px solid ' + C.warning, color: C.warning, padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>⚠️ Processar episódio difícil</button>
              {!showDebt ? (
                <button onClick={() => setShowDebt(true)} style={{ width: '100%', background: 'rgba(34,197,94,0.08)', border: '1.5px solid ' + C.success, color: C.success, padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>💰 Quitei uma dívida!</button>
              ) : (
                <div style={{ background: 'rgba(34,197,94,0.05)', border: '1.5px solid ' + C.success, borderRadius: 12, padding: 14 }}>
                  <p style={{ color: C.success, fontWeight: 700, fontSize: 13, margin: '0 0 10px' }}>💰 Registrar dívida quitada</p>
                  <input type="number" placeholder="Valor (R$)" value={amt} onChange={e => setAmt(e.target.value)} style={{ ...inputSt, marginBottom: 8 }} />
                  <textarea placeholder="Qual dívida?" value={note} onChange={e => setNote(e.target.value)} style={{ ...inputSt, minHeight: 60, resize: 'none', marginBottom: 10 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => setShowDebt(false)} style={{ flex: 1, background: C.softBg, border: 'none', padding: 10, borderRadius: 10, cursor: 'pointer', fontWeight: 600, color: C.textSec, fontSize: 13 }}>Cancelar</button>
                    <button onClick={addDebt} disabled={saving} style={{ flex: 2, background: C.success, color: C.white, border: 'none', padding: 10, borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{saving ? '...' : 'Salvar'}</button>
                  </div>
                </div>
              )}
              {!showPurchase ? (
                <button onClick={() => setShowPurchase(true)} style={{ width: '100%', background: 'rgba(102,170,226,0.08)', border: '1.5px solid ' + C.alaskanBlue, color: C.alaskanBlue, padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>🏆 Conquistei algo!</button>
              ) : (
                <div style={{ background: 'rgba(102,170,226,0.05)', border: '1.5px solid ' + C.alaskanBlue, borderRadius: 12, padding: 14 }}>
                  <p style={{ color: C.alaskanBlue, fontWeight: 700, fontSize: 13, margin: '0 0 10px' }}>🏆 Registrar conquista pessoal</p>
                  <input type="number" placeholder="Valor (R$) - opcional" value={amt} onChange={e => setAmt(e.target.value)} style={{ ...inputSt, marginBottom: 8 }} />
                  <textarea placeholder="O que conquistou?" value={note} onChange={e => setNote(e.target.value)} style={{ ...inputSt, minHeight: 60, resize: 'none', marginBottom: 10 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => setShowPurchase(false)} style={{ flex: 1, background: C.softBg, border: 'none', padding: 10, borderRadius: 10, cursor: 'pointer', fontWeight: 600, color: C.textSec, fontSize: 13 }}>Cancelar</button>
                    <button onClick={addPurchase} disabled={saving} style={{ flex: 2, background: C.alaskanBlue, color: C.white, border: 'none', padding: 10, borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{saving ? '...' : 'Salvar'}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {diaryEntries.length > 0 && (
            <div style={{ ...card, marginBottom: 14 }}>
              <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 16px', fontWeight: 700 }}>Humor — últimos 7 dias</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() - (6 - i))
                  const dateStr = date.toISOString().split('T')[0]
                  const entry = diaryEntries.find(e => e.created_at?.startsWith(dateStr))
                  const cfg = entry ? MOOD_CONFIG[entry.mood] : null
                  const isToday = i === 6
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: cfg ? cfg.bg : C.softBg, border: isToday ? '2.5px solid ' + C.trueBlue : cfg ? '2px solid ' + cfg.color + '66' : '2px solid ' + C.blancDeBlanc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: isToday ? '0 2px 8px rgba(29,63,119,0.2)' : 'none' }}>
                        {cfg ? cfg.icon : <span style={{ color: C.blancDeBlanc, fontSize: 12 }}>·</span>}
                      </div>
                      <span style={{ fontSize: 9, color: isToday ? C.trueBlue : C.textSec, fontWeight: isToday ? 700 : 400 }}>
                        {date.toLocaleDateString('pt-BR', { weekday: 'narrow' })}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p style={{ color: C.textSec, fontSize: 10, margin: '12px 0 0', textAlign: 'center' }}>Hoje marcado em azul · dias sem registro aparecem cinza</p>
            </div>
          )}
          <div style={{ ...card }}>
            <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 16px', fontWeight: 700 }}>Marcos de Recuperação</h3>
            {MARCOS.map((c, idx) => {
              const achieved = days >= c.dias
              return (
                <div key={c.dias} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: idx < MARCOS.length - 1 ? '1px solid ' + C.blancDeBlanc : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: achieved ? 'linear-gradient(135deg, #22c55e, #16a34a)' : C.softBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 13, boxShadow: achieved ? '0 2px 8px rgba(34,197,94,0.3)' : 'none', flexShrink: 0 }}>
                      {achieved ? '✓' : <span style={{ fontSize: 10, color: C.blancDeBlanc }}>○</span>}
                    </div>
                    <div>
                      <span style={{ color: achieved ? C.blackRobe : C.textSec, fontSize: 13, fontWeight: achieved ? 600 : 400 }}>{c.nome}</span>
                      <p style={{ color: C.textSec, fontSize: 10, margin: '1px 0 0' }}>{c.dias} {c.dias === 1 ? 'dia' : 'dias'}</p>
                    </div>
                  </div>
                  {achieved && <span style={{ color: C.success, fontSize: 12, fontWeight: 700 }}>✓ Alcançado</span>}
                </div>
              )
            })}
          </div>
          {episodes.length > 0 && <p style={{ color: C.textSec, fontSize: 11, margin: '12px 0 0', textAlign: 'center' }}>{episodes.length} episódio(s) processado(s)</p>}
        </div>
      </div>
    )
  }

  const Tools = () => {
    const toolGroups = [
      {
        label: 'Práticas Diárias',
        items: [
          { id: 'missoes', icon: '🎯', label: 'Práticas Diárias', desc: 'Desafios diários para toda a comunidade' },
          { id: 'breathing', icon: '🧘', label: 'Respiração Guiada', desc: 'Técnicas para momentos difíceis' },
        ]
      },
      {
        label: 'Recuperação',
        items: [
          { id: 'goals', icon: '🎯', label: 'Objetivos de Vida', desc: 'Transforme economia em metas concretas' },
          { id: 'vault', icon: '📦', label: 'Cofre de Evidências', desc: 'Lembretes para momentos de fissura' },
          { id: 'contract', icon: '📋', label: 'Contrato Comportamental', desc: 'Seus compromissos escritos' },
          { id: 'crisis', icon: '🚨', label: 'Plano de Crise', desc: 'Passos de emergência prontos' },
        ]
      },
      {
        label: 'Comunidade',
        items: [
          { id: 'rooms', icon: '🗓️', label: 'Salas & Reuniões', desc: 'Grupos de apoio e terapia' },
          { id: 'mentor', icon: '🤝', label: 'Mentoria', desc: days >= 180 ? 'Torne-se mentor ou supervisione' : 'Conecte-se com alguém que superou' },
          { id: 'stories', icon: '📖', label: 'Histórias de Superação', desc: 'Inspire-se e inspire a comunidade' },
          { id: 'challenge', icon: '🏆', label: 'Desafio da Semana', desc: 'Missão coletiva da comunidade' },
        ]
      },
      {
        label: 'Recursos & APAJ',
        items: [
          { id: 'biblioteca', icon: '📚', label: 'Biblioteca', desc: 'Livros, podcasts e artigos' },
          { id: 'rede-apoio', icon: '🏥', label: 'Rede de Apoio (SUS)', desc: 'CVV, CAPS, JA e seus direitos' },
          { id: 'videos', icon: '🎥', label: 'Pílulas de Conhecimento', desc: 'Vídeos dos especialistas APAJ' },
          { id: 'autoexclusao', icon: '🛡️', label: 'Central de Autoexclusão', desc: 'Bloqueie plataformas de apostas' },
          { id: 'donate', icon: '💙', label: 'Apoiar a APAJ', desc: 'Contribua com a causa' },
        ]
      }
    ]
    return (
      <div style={{ background: C.softBg, minHeight: '100vh', paddingBottom: 110 }}>
        <div style={{ background: 'linear-gradient(135deg, #1d3f77, #274d9c)', padding: '52px 24px 28px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(102,170,226,0.12)', pointerEvents: 'none' }} />
          <h1 style={{ color: C.white, fontSize: 22, fontWeight: 700, margin: '0 0 4px', position: 'relative' }}>Ferramentas</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: 0, position: 'relative' }}>Recursos para sua jornada</p>
        </div>
        <div style={{ padding: '20px 16px 0' }}>
          {toolGroups.map(group => (
            <div key={group.label} style={{ marginBottom: 20 }}>
              <p style={{ color: C.textSec, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 10px' }}>{group.label}</p>
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                {group.items.map((t, idx) => (
                  <button key={t.id} onClick={() => setPage(t.id)} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: idx < group.items.length - 1 ? '1px solid ' + C.blancDeBlanc : 'none', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: C.softBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{t.icon}</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ color: C.blackRobe, fontSize: 14, margin: '0 0 2px', fontWeight: 600 }}>{t.label}</h3>
                      <p style={{ color: C.textSec, fontSize: 12, margin: 0 }}>{t.desc}</p>
                    </div>
                    <span style={{ color: C.blancDeBlanc, fontSize: 20, flexShrink: 0 }}>›</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const Profile = () => (
    <div style={{ background: C.softBg, minHeight: '100vh', paddingBottom: 110 }}>
      <div style={{ background: 'linear-gradient(160deg, #0d2b5e 0%, #1d3f77 55%, #2a5298 100%)', padding: '52px 24px 60px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(102,170,226,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: 20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(102,170,226,0.07)', pointerEvents: 'none' }} />
        <div style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: C.white, fontWeight: 700, margin: '0 auto 12px', position: 'relative' }}>{profile?.name?.charAt(0) || '?'}</div>
        <h2 style={{ color: C.white, fontSize: 20, fontWeight: 700, margin: '0 0 4px', position: 'relative' }}>{profile?.name || 'Usuário'}</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '0 0 20px', position: 'relative' }}>{user.email}</p>
        <div style={{ display: 'inline-flex', gap: 24, background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '10px 24px', position: 'relative' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: C.white, fontSize: 20, fontWeight: 700, display: 'block' }}>{days}</span>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, margin: '2px 0 0' }}>dias</p>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: C.white, fontSize: 14, fontWeight: 700, display: 'block' }}>{currentPhase}</span>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, margin: '2px 0 0' }}>fase atual</p>
          </div>
        </div>
      </div>
      <div style={{ padding: '16px 16px 0' }}>
        {(profile?.emergency_contact?.phone || profile?.night_mode_settings?.enabled) && (
          <div style={{ ...cardSm, marginBottom: 12 }}>
            {profile?.emergency_contact?.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: profile?.night_mode_settings?.enabled ? 12 : 0, borderBottom: profile?.night_mode_settings?.enabled ? '1px solid ' + C.blancDeBlanc : 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📱</div>
                <div>
                  <p style={{ color: C.blackRobe, fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>Contato SOS</p>
                  <p style={{ color: C.textSec, fontSize: 12, margin: 0 }}>{profile.emergency_contact.name || profile.emergency_contact.phone}</p>
                </div>
              </div>
            )}
            {profile?.night_mode_settings?.enabled && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: profile?.emergency_contact?.phone ? 12 : 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(29,63,119,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🌙</div>
                <div>
                  <p style={{ color: C.blackRobe, fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>Modo Noturno</p>
                  <p style={{ color: C.textSec, fontSize: 12, margin: 0 }}>{profile.night_mode_settings.start_hour}h às {profile.night_mode_settings.end_hour}h</p>
                </div>
              </div>
            )}
          </div>
        )}
        <div style={{ ...cardSm, marginBottom: 12 }}>
          <button onClick={() => setPage('setup')} style={{ width: '100%', padding: '13px 0', background: 'transparent', border: 'none', borderBottom: '1px solid ' + C.blancDeBlanc, cursor: 'pointer', color: C.blackRobe, fontWeight: 600, fontSize: 14, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.softBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚙️</div>
            Editar Configurações
            <span style={{ marginLeft: 'auto', color: C.blancDeBlanc, fontSize: 20 }}>›</span>
          </button>
          <button onClick={handleLogout} style={{ width: '100%', padding: '13px 0', background: 'transparent', border: 'none', cursor: 'pointer', color: C.danger, fontWeight: 600, fontSize: 14, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚪</div>
            Sair da Conta
          </button>
        </div>
        {messages.length > 0 && (
          <div style={{ ...card }}>
            <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 14px', fontWeight: 700 }}>💬 Mensagens do Terapeuta</h3>
            {messages.slice(0, 5).map((m, idx) => (
              <div key={m.id} style={{ padding: '12px 0', borderBottom: idx < Math.min(messages.length, 5) - 1 ? '1px solid ' + C.blancDeBlanc : 'none' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.read_at ? 'transparent' : C.alaskanBlue, flexShrink: 0, marginTop: 5 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ color: C.blackRobe, fontSize: 13, margin: '0 0 5px', lineHeight: 1.5, fontWeight: m.read_at ? 400 : 600 }}>{m.message}</p>
                    <p style={{ color: C.textSec, fontSize: 11, margin: 0 }}>{new Date(m.sent_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #0d2b5e 0%, #1d3f77 55%, #2a5298 100%)' }}>
      <img src="/logo-apaj.png" alt="APAJ" style={{ width: 64, filter: 'brightness(0) invert(1)', marginBottom: 20, opacity: 0.9 }} />
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.6)', animation: `pulse-scale 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: C.softBg, minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      <NightMode profile={profile} isActive={nightActive} onOpenSOS={() => setShowSOS(true)} />
      {renderPage()}
      <SOSButton />
      <NavBar />
      {showSOS && <SOSFissura profile={profile} userId={user.id} vault={vault} onClose={() => setShowSOS(false)} />}
    </div>
  )
}
