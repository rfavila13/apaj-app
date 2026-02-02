import React, { useState, useEffect } from 'react'
import { patientService } from '../../services/patientService'
import { publicService } from '../../services/publicService'
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

// Frases motivacionais rotativas
const FRASES_MOTIVACIONAIS = [
  "Cada dia sem apostar é uma vitória. Continue firme!",
  "Você é mais forte do que imagina. A recuperação é possível.",
  "O dinheiro guardado hoje constrói o amanhã que você merece.",
  "Liberdade é não depender do jogo para se sentir bem.",
  "Sua família e seu futuro agradecem cada escolha consciente.",
  "O vício mente. Você não precisa do jogo para ser feliz.",
  "Recuperação não é linear, mas cada passo conta.",
  "Hoje você escolhe a vida real, não a ilusão do jogo.",
  "Suas emoções são válidas. Enfrente-as, não as esconda no jogo.",
  "O melhor investimento é em você mesmo."
]

// Sistema de XP e conquistas
const CONQUISTAS = [
  { dias: 1, nome: '1º Dia', xp: 10 },
  { dias: 3, nome: '3 Dias', xp: 30 },
  { dias: 7, nome: '1 Semana', xp: 70 },
  { dias: 14, nome: '2 Semanas', xp: 150 },
  { dias: 30, nome: '1 Mês', xp: 300 },
  { dias: 60, nome: '2 Meses', xp: 600 },
  { dias: 90, nome: '3 Meses', xp: 1000 },
  { dias: 180, nome: '6 Meses', xp: 2000 },
  { dias: 365, nome: '1 Ano', xp: 5000 },
  { dias: 548, nome: '1 Ano e Meio', xp: 7500 },
  { dias: 730, nome: '2 Anos', xp: 10000 },
  { dias: 913, nome: '2 Anos e Meio', xp: 12500 },
  { dias: 1095, nome: '3 Anos', xp: 15000 }
]

const XP_POR_REAL_ECONOMIZADO = 0.1

export default function PatientApp({ user, onLogout }) {
  const [page, setPage] = useState('home')
  const [profile, setProfile] = useState(null)
  const [relapses, setRelapses] = useState([])
  const [loading, setLoading] = useState(true)
  const [fraseIndex, setFraseIndex] = useState(0)
  const [diaryEntries, setDiaryEntries] = useState([])
  const [achievements, setAchievements] = useState([])
  const [debts, setDebts] = useState([])
  const [purchases, setPurchases] = useState([])
  const [nextSession, setNextSession] = useState(null)
  const [myGroups, setMyGroups] = useState([])

  useEffect(() => { loadData() }, [user])
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFraseIndex(i => (i + 1) % FRASES_MOTIVACIONAIS.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const { data: p } = await patientService.getMyProfile(user.id)
      if (p) setProfile(p)
      const { data: r } = await patientService.getMyRelapses(user.id)
      if (r) setRelapses(r)
      
      // Carregar diário
      const { data: diary } = await supabase.from('diary_entries').select('*').eq('patient_id', user.id).order('created_at', { ascending: false })
      if (diary) setDiaryEntries(diary)
      
      // Carregar conquistas pessoais
      const { data: ach } = await supabase.from('patient_achievements').select('*').eq('patient_id', user.id).order('created_at', { ascending: false })
      if (ach) setAchievements(ach)
      
      // Carregar dívidas quitadas
      const { data: dbt } = await supabase.from('patient_debts').select('*').eq('patient_id', user.id).order('created_at', { ascending: false })
      if (dbt) setDebts(dbt)
      
      // Carregar compras/conquistas materiais
      const { data: purch } = await supabase.from('patient_purchases').select('*').eq('patient_id', user.id).order('created_at', { ascending: false })
      if (purch) setPurchases(purch)
      
      // Carregar grupos do paciente
      const { data: groups } = await supabase.from('group_members').select('*, therapy_groups(*)').eq('patient_id', user.id)
      if (groups) {
        setMyGroups(groups.map(g => g.therapy_groups).filter(Boolean))
        // Encontrar próxima sessão
        const today = new Date()
        const dayOfWeek = today.getDay()
        const activeGroups = groups.map(g => g.therapy_groups).filter(Boolean)
        if (activeGroups.length > 0) {
          const sorted = activeGroups.sort((a, b) => {
            const daysUntilA = (a.day_of_week - dayOfWeek + 7) % 7 || 7
            const daysUntilB = (b.day_of_week - dayOfWeek + 7) % 7 || 7
            return daysUntilA - daysUntilB
          })
          setNextSession(sorted[0])
        }
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const days = profile?.sober_start_date ? patientService.calcDays(profile.sober_start_date, relapses) : 0
  const savings = profile?.sober_start_date && profile?.previous_gambling_amount ? patientService.calcSavings(profile.sober_start_date, profile.previous_gambling_amount, relapses) : { total: 0 }
  
  // Calcular XP total
  const xpFromDays = CONQUISTAS.filter(c => days >= c.dias).reduce((sum, c) => sum + c.xp, 0)
  const xpFromSavings = Math.floor(savings.total * XP_POR_REAL_ECONOMIZADO)
  const totalXP = xpFromDays + xpFromSavings

  const NavBar = () => (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.trueBlue, padding: '8px 0 12px', display: 'flex', justifyContent: 'space-around', zIndex: 1000, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
      {[
        { id: 'home', icon: '🏠', label: 'Início' },
        { id: 'progress', icon: '📈', label: 'Progresso' },
        { id: 'diary', icon: '📔', label: 'Diário' },
        { id: 'groups', icon: '👥', label: 'Grupos' },
        { id: 'tips', icon: '💡', label: 'Dicas' },
        { id: 'help', icon: '❓', label: 'Ajuda' },
        { id: 'profile', icon: '👤', label: 'Perfil' }
      ].map(i => (
        <button key={i.id} onClick={() => setPage(i.id)} style={{ background: page === i.id ? 'rgba(255,255,255,0.15)' : 'transparent', border: 'none', color: C.white, padding: '6px 10px', borderRadius: 12, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: 20 }}>{i.icon}</span>
          <span style={{ fontSize: 9, fontWeight: page === i.id ? 600 : 400, opacity: page === i.id ? 1 : 0.7 }}>{i.label}</span>
        </button>
      ))}
    </nav>
  )

  // ========== HOME ==========
  const Home = () => {
    const [confirming, setConfirming] = useState(false)
    
    const confirmPresence = async (status) => {
      setConfirming(true)
      try {
        await supabase.from('session_attendance').insert({
          patient_id: user.id,
          group_id: nextSession.id,
          session_date: new Date().toISOString().split('T')[0],
          status: status
        })
        alert(status === 'confirmed' ? 'Presença confirmada!' : 'Ausência registrada.')
      } catch (e) { console.error(e) }
      finally { setConfirming(false) }
    }
    
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
    
    return (
      <div style={{ padding: 20, paddingBottom: 100 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <img src="/logo-apaj.png" alt="APAJ" style={{ width: 120, height: 'auto', marginBottom: 8 }} />
          <p style={{ color: C.blackRobe, fontSize: 15, opacity: 0.7 }}>Olá, {profile?.name?.split(' ')[0] || 'Bem-vindo'}!</p>
        </div>
        
        {/* Frase Motivacional */}
        <div style={{ background: C.alaskanBlue, borderRadius: 16, padding: '16px 20px', marginBottom: 20, textAlign: 'center' }}>
          <p style={{ color: C.white, fontSize: 14, fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
            "{FRASES_MOTIVACIONAIS[fraseIndex]}"
          </p>
        </div>

        {/* Contador de dias */}
        {profile?.sober_start_date ? (
          <div style={{ background: C.trueBlue, borderRadius: 20, padding: 24, marginBottom: 20, color: C.white }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 56, fontWeight: 700 }}>{days}</span>
              <p style={{ fontSize: 15, opacity: 0.9, margin: '4px 0 0' }}>dias de vitória</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.12)', padding: 14, borderRadius: 14, textAlign: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>R$ {savings.total.toLocaleString('pt-BR')}</span>
                <p style={{ fontSize: 11, opacity: 0.8, margin: '4px 0 0' }}>Economizado</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.12)', padding: 14, borderRadius: 14, textAlign: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>{totalXP} XP</span>
                <p style={{ fontSize: 11, opacity: 0.8, margin: '4px 0 0' }}>Pontuação</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: C.white, borderRadius: 20, padding: 28, textAlign: 'center', marginBottom: 20, boxShadow: '0 2px 16px rgba(29,63,119,0.08)' }}>
            <h2 style={{ color: C.trueBlue, fontSize: 18, marginTop: 0, fontWeight: 600 }}>Comece sua jornada</h2>
            <p style={{ color: C.blackRobe, fontSize: 14, margin: '12px 0 20px', opacity: 0.6 }}>Configure seu perfil para acompanhar seu progresso</p>
            <button onClick={() => setPage('setup')} style={{ background: C.trueBlue, color: C.white, border: 'none', padding: '12px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Configurar Agora</button>
          </div>
        )}

        {/* Próxima Sessão */}
        {nextSession && (
          <div style={{ background: C.white, borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
            <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 12px', fontWeight: 600 }}>Próxima Sessão de Grupo</h3>
            <p style={{ color: C.blackRobe, fontSize: 14, margin: '0 0 4px' }}><strong>{nextSession.name}</strong></p>
            <p style={{ color: C.blackRobe, fontSize: 13, margin: '0 0 12px', opacity: 0.7 }}>
              {diasSemana[nextSession.day_of_week]} às {nextSession.time?.slice(0, 5)}
            </p>
            {nextSession.meeting_link && (
              <a href={nextSession.meeting_link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: C.alaskanBlue, color: C.white, textDecoration: 'none', padding: '10px 16px', borderRadius: 8, textAlign: 'center', fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
                Acessar Reunião
              </a>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => confirmPresence('confirmed')} disabled={confirming} style={{ flex: 1, background: C.success, color: C.white, border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                Confirmar Presença
              </button>
              <button onClick={() => confirmPresence('absent')} disabled={confirming} style={{ flex: 1, background: C.blancDeBlanc, color: C.blackRobe, border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                Relatar Ausência
              </button>
            </div>
          </div>
        )}

        {/* Atalho para Ajuda */}
        <button onClick={() => setPage('help')} style={{ background: C.white, border: 'none', borderRadius: 16, padding: 18, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 12px rgba(29,63,119,0.06)', width: '100%' }}>
          <span style={{ fontSize: 28, width: 50, height: 50, background: '#fff3e0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>❓</span>
          <div>
            <h3 style={{ color: C.trueBlue, fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Como buscar ajuda</h3>
            <p style={{ color: C.blackRobe, fontSize: 13, margin: 0, opacity: 0.6 }}>Recursos e suporte disponíveis</p>
          </div>
        </button>
      </div>
    )
  }

  // ========== SETUP ==========
  const Setup = () => {
    const [f, setF] = useState({ name: profile?.name || '', monthly_income: profile?.monthly_income || '', previous_gambling_amount: profile?.previous_gambling_amount || '', sober_start_date: profile?.sober_start_date || new Date().toISOString().split('T')[0] })
    const [saving, setSaving] = useState(false)
    const save = async () => {
      setSaving(true)
      try { 
        await patientService.updateProfile(user.id, { name: f.name, monthly_income: parseFloat(f.monthly_income) || 0, previous_gambling_amount: parseFloat(f.previous_gambling_amount) || 0, sober_start_date: f.sober_start_date })
        await loadData()
        setPage('home') 
      }
      catch (e) { alert('Erro: ' + e.message) }
      finally { setSaving(false) }
    }
    return (
      <div style={{ padding: 20, paddingBottom: 100 }}>
        <button onClick={() => setPage('home')} style={{ background: 'none', border: 'none', color: C.trueBlue, fontSize: 14, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button>
        <h1 style={{ color: C.trueBlue, fontSize: 22, marginBottom: 20, fontWeight: 600 }}>Configurar Perfil</h1>
        <div style={{ background: C.white, borderRadius: 16, padding: 20, boxShadow: '0 2px 16px rgba(29,63,119,0.08)' }}>
          {[{ l: 'Seu nome', k: 'name', t: 'text' }, { l: 'Renda mensal (R$)', k: 'monthly_income', t: 'number' }, { l: 'Quanto gastava/mês em jogos? (R$)', k: 'previous_gambling_amount', t: 'number' }, { l: 'Data de início da jornada', k: 'sober_start_date', t: 'date' }].map((i, idx) => (
            <div key={idx} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: C.blackRobe, marginBottom: 6, fontSize: 13, fontWeight: 500 }}>{i.l}</label>
              <input type={i.t} value={f[i.k]} onChange={e => setF({ ...f, [i.k]: e.target.value })} style={{ width: '100%', padding: '12px 14px', border: `1px solid ${C.blancDeBlanc}`, borderRadius: 10, fontSize: 15, boxSizing: 'border-box' }} />
            </div>
          ))}
          <button onClick={save} disabled={saving} style={{ width: '100%', background: saving ? C.blancDeBlanc : C.trueBlue, color: C.white, border: 'none', padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', marginTop: 8 }}>{saving ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </div>
    )
  }

  // ========== DIÁRIO ==========
  const Diary = () => {
    const [showForm, setShowForm] = useState(false)
    const [entry, setEntry] = useState('')
    const [mood, setMood] = useState('')
    const [emotions, setEmotions] = useState([])
    const [saving, setSaving] = useState(false)
    
    const moods = ['Muito bem', 'Bem', 'Neutro', 'Mal', 'Muito mal']
    const emotionOptions = ['Ansiedade', 'Calma', 'Tristeza', 'Alegria', 'Raiva', 'Medo', 'Esperança', 'Frustração', 'Gratidão', 'Culpa', 'Orgulho', 'Solidão']
    
    const toggleEmotion = (e) => {
      if (emotions.includes(e)) {
        setEmotions(emotions.filter(x => x !== e))
      } else {
        setEmotions([...emotions, e])
      }
    }
    
    const saveEntry = async () => {
      if (!entry.trim()) return
      setSaving(true)
      try {
        await supabase.from('diary_entries').insert({
          patient_id: user.id,
          content: entry,
          mood: mood,
          emotions: emotions
        })
        await loadData()
        setShowForm(false)
        setEntry('')
        setMood('')
        setEmotions([])
      } catch (e) { alert('Erro: ' + e.message) }
      finally { setSaving(false) }
    }
    
    if (showForm) {
      return (
        <div style={{ padding: 20, paddingBottom: 100 }}>
          <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: C.trueBlue, fontSize: 14, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button>
          <h1 style={{ color: C.trueBlue, fontSize: 22, marginBottom: 20, fontWeight: 600 }}>Nova Entrada</h1>
          
          {/* Humor */}
          <div style={{ background: C.white, borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
            <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 12px', fontWeight: 600 }}>Como você está se sentindo hoje?</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {moods.map(m => (
                <button key={m} onClick={() => setMood(m)} style={{ background: mood === m ? C.trueBlue : C.iceMelt, color: mood === m ? C.white : C.trueBlue, border: 'none', padding: '8px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>{m}</button>
              ))}
            </div>
          </div>
          
          {/* Emoções */}
          <div style={{ background: C.white, borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
            <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 12px', fontWeight: 600 }}>Quais emoções você sentiu?</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {emotionOptions.map(e => (
                <button key={e} onClick={() => toggleEmotion(e)} style={{ background: emotions.includes(e) ? C.alaskanBlue : C.blancDeBlanc, color: emotions.includes(e) ? C.white : C.blackRobe, border: 'none', padding: '8px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer' }}>{e}</button>
              ))}
            </div>
          </div>
          
          {/* Texto */}
          <div style={{ background: C.white, borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
            <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 12px', fontWeight: 600 }}>Escreva suas reflexões</h3>
            <textarea 
              value={entry} 
              onChange={e => setEntry(e.target.value)} 
              placeholder="O que você sentiu hoje? O que tem a agradecer? Como foi seu dia? Quais desafios enfrentou?"
              style={{ width: '100%', padding: 14, border: `1px solid ${C.blancDeBlanc}`, borderRadius: 10, fontSize: 14, minHeight: 150, resize: 'none', boxSizing: 'border-box', lineHeight: 1.5 }} 
            />
          </div>
          
          <button onClick={saveEntry} disabled={saving || !entry.trim()} style={{ width: '100%', background: saving ? C.blancDeBlanc : C.trueBlue, color: C.white, border: 'none', padding: 14, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Salvando...' : 'Salvar Entrada'}</button>
        </div>
      )
    }
    
    return (
      <div style={{ padding: 20, paddingBottom: 100 }}>
        <h1 style={{ color: C.trueBlue, fontSize: 22, marginBottom: 20, fontWeight: 600 }}>Meu Diário</h1>
        
        <button onClick={() => setShowForm(true)} style={{ width: '100%', background: C.trueBlue, color: C.white, border: 'none', padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 20 }}>
          + Nova Entrada
        </button>
        
        {diaryEntries.length === 0 ? (
          <div style={{ background: C.white, borderRadius: 16, padding: 32, textAlign: 'center', boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
            <p style={{ color: C.blackRobe, opacity: 0.6 }}>Nenhuma entrada ainda. Comece a registrar suas reflexões!</p>
          </div>
        ) : (
          diaryEntries.map(d => (
            <div key={d.id} style={{ background: C.white, borderRadius: 16, padding: 18, marginBottom: 12, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: C.trueBlue, fontSize: 13, fontWeight: 600 }}>{new Date(d.created_at).toLocaleDateString('pt-BR')}</span>
                {d.mood && <span style={{ background: C.iceMelt, color: C.trueBlue, padding: '4px 10px', borderRadius: 12, fontSize: 12 }}>{d.mood}</span>}
              </div>
              {d.emotions?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {d.emotions.map(e => <span key={e} style={{ background: C.blancDeBlanc, color: C.blackRobe, padding: '3px 8px', borderRadius: 10, fontSize: 11 }}>{e}</span>)}
                </div>
              )}
              <p style={{ color: C.blackRobe, fontSize: 14, lineHeight: 1.5, margin: 0 }}>{d.content}</p>
            </div>
          ))
        )}
      </div>
    )
  }

  // ========== PROGRESSO ==========
  const Progress = () => {
    const [showRelapseForm, setShowRelapseForm] = useState(false)
    const [showDebtForm, setShowDebtForm] = useState(false)
    const [showPurchaseForm, setShowPurchaseForm] = useState(false)
    const [tab, setTab] = useState('progresso')
    const [amt, setAmt] = useState('')
    const [note, setNote] = useState('')
    const [saving, setSaving] = useState(false)
    
    const addRelapse = async () => {
      setSaving(true)
      try { 
        await patientService.addRelapse(user.id, { amount: parseFloat(amt) || 0, notes: note })
        await loadData()
        setShowRelapseForm(false)
        setAmt('')
        setNote('')
      }
      catch (e) { alert('Erro: ' + e.message) }
      finally { setSaving(false) }
    }
    
    const addDebt = async () => {
      setSaving(true)
      try {
        await supabase.from('patient_debts').insert({ patient_id: user.id, amount: parseFloat(amt) || 0, description: note })
        await loadData()
        setShowDebtForm(false)
        setAmt('')
        setNote('')
      } catch (e) { alert('Erro: ' + e.message) }
      finally { setSaving(false) }
    }
    
    const addPurchase = async () => {
      setSaving(true)
      try {
        await supabase.from('patient_purchases').insert({ patient_id: user.id, amount: parseFloat(amt) || 0, description: note })
        await loadData()
        setShowPurchaseForm(false)
        setAmt('')
        setNote('')
      } catch (e) { alert('Erro: ' + e.message) }
      finally { setSaving(false) }
    }

    if (!profile?.sober_start_date) {
      return (
        <div style={{ padding: 20, paddingBottom: 100, textAlign: 'center' }}>
          <h2 style={{ color: C.trueBlue, marginTop: 40 }}>Configure seu perfil</h2>
          <p style={{ color: C.blackRobe, opacity: 0.6 }}>Para acompanhar seu progresso</p>
          <button onClick={() => setPage('setup')} style={{ marginTop: 20, background: C.trueBlue, color: C.white, border: 'none', padding: '12px 28px', borderRadius: 10, fontSize: 15, cursor: 'pointer' }}>Configurar</button>
        </div>
      )
    }
    
    // Encontrar próxima conquista
    const nextAchievement = CONQUISTAS.find(c => days < c.dias)
    const prevAchievement = [...CONQUISTAS].reverse().find(c => days >= c.dias)
    const progressPercent = nextAchievement && prevAchievement 
      ? ((days - prevAchievement.dias) / (nextAchievement.dias - prevAchievement.dias)) * 100
      : nextAchievement ? (days / nextAchievement.dias) * 100 : 100

    return (
      <div style={{ padding: 20, paddingBottom: 100 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['progresso', 'conquistas'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, background: tab === t ? C.trueBlue : C.white, color: tab === t ? C.white : C.trueBlue, border: 'none', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {t === 'progresso' ? 'Progresso' : 'Conquistas'}
            </button>
          ))}
        </div>
        
        {tab === 'progresso' ? (
          <>
            {/* Card principal */}
            <div style={{ background: C.trueBlue, borderRadius: 20, padding: 24, marginBottom: 20, color: C.white }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 13, opacity: 0.8, margin: '0 0 4px' }}>Dias sem jogar</p>
                <span style={{ fontSize: 64, fontWeight: 700 }}>{days}</span>
              </div>
              
              {/* Barra de progresso */}
              {nextAchievement && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.8, marginBottom: 6 }}>
                    <span>{prevAchievement?.nome || 'Início'}</span>
                    <span>{nextAchievement.nome}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, height: 10, overflow: 'hidden' }}>
                    <div style={{ background: C.alaskanBlue, height: '100%', width: `${Math.min(progressPercent, 100)}%`, borderRadius: 10, transition: 'width 0.5s' }} />
                  </div>
                  <p style={{ fontSize: 12, opacity: 0.8, textAlign: 'center', marginTop: 8 }}>
                    Faltam {nextAchievement.dias - days} dias para a próxima conquista (+{nextAchievement.xp} XP)
                  </p>
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(255,255,255,0.12)', padding: 14, borderRadius: 12, textAlign: 'center' }}>
                  <span style={{ fontSize: 20, fontWeight: 700 }}>R$ {savings.total.toLocaleString('pt-BR')}</span>
                  <p style={{ fontSize: 11, opacity: 0.8, margin: '4px 0 0' }}>Economizado</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.12)', padding: 14, borderRadius: 12, textAlign: 'center' }}>
                  <span style={{ fontSize: 20, fontWeight: 700 }}>{totalXP}</span>
                  <p style={{ fontSize: 11, opacity: 0.8, margin: '4px 0 0' }}>XP Total</p>
                </div>
              </div>
            </div>
            
            {/* Registrar recaída */}
            {!showRelapseForm ? (
              <button onClick={() => setShowRelapseForm(true)} style={{ width: '100%', background: C.white, border: `1px solid ${C.warning}`, color: C.warning, padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 12 }}>
                Registrar Recaída
              </button>
            ) : (
              <div style={{ background: C.white, borderRadius: 14, padding: 18, marginBottom: 12, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
                <h3 style={{ color: C.trueBlue, marginBottom: 12, fontSize: 15, fontWeight: 600 }}>Registrar Recaída</h3>
                <input type="number" placeholder="Valor gasto (R$)" value={amt} onChange={e => setAmt(e.target.value)} style={{ width: '100%', padding: 12, border: `1px solid ${C.blancDeBlanc}`, borderRadius: 8, marginBottom: 10, fontSize: 14, boxSizing: 'border-box' }} />
                <textarea placeholder="O que aconteceu?" value={note} onChange={e => setNote(e.target.value)} style={{ width: '100%', padding: 12, border: `1px solid ${C.blancDeBlanc}`, borderRadius: 8, marginBottom: 12, fontSize: 14, minHeight: 60, resize: 'none', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowRelapseForm(false)} style={{ flex: 1, background: C.blancDeBlanc, border: 'none', color: C.blackRobe, padding: 10, borderRadius: 8, cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={addRelapse} disabled={saving} style={{ flex: 1, background: C.warning, border: 'none', color: C.white, padding: 10, borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{saving ? '...' : 'Registrar'}</button>
                </div>
              </div>
            )}
            
            {/* Quitou dívida */}
            {!showDebtForm ? (
              <button onClick={() => setShowDebtForm(true)} style={{ width: '100%', background: C.white, border: `1px solid ${C.success}`, color: C.success, padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 12 }}>
                Quitou uma dívida? Registre aqui!
              </button>
            ) : (
              <div style={{ background: C.white, borderRadius: 14, padding: 18, marginBottom: 12, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
                <h3 style={{ color: C.trueBlue, marginBottom: 12, fontSize: 15, fontWeight: 600 }}>Registrar Dívida Quitada</h3>
                <input type="number" placeholder="Valor (R$)" value={amt} onChange={e => setAmt(e.target.value)} style={{ width: '100%', padding: 12, border: `1px solid ${C.blancDeBlanc}`, borderRadius: 8, marginBottom: 10, fontSize: 14, boxSizing: 'border-box' }} />
                <textarea placeholder="Qual dívida você quitou?" value={note} onChange={e => setNote(e.target.value)} style={{ width: '100%', padding: 12, border: `1px solid ${C.blancDeBlanc}`, borderRadius: 8, marginBottom: 12, fontSize: 14, minHeight: 60, resize: 'none', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowDebtForm(false)} style={{ flex: 1, background: C.blancDeBlanc, border: 'none', color: C.blackRobe, padding: 10, borderRadius: 8, cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={addDebt} disabled={saving} style={{ flex: 1, background: C.success, border: 'none', color: C.white, padding: 10, borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{saving ? '...' : 'Registrar'}</button>
                </div>
              </div>
            )}
            
            {/* Conquista material */}
            {!showPurchaseForm ? (
              <button onClick={() => setShowPurchaseForm(true)} style={{ width: '100%', background: C.white, border: `1px solid ${C.alaskanBlue}`, color: C.alaskanBlue, padding: 12, borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 12 }}>
                Teve uma conquista ou comprou algo? Registre aqui!
              </button>
            ) : (
              <div style={{ background: C.white, borderRadius: 14, padding: 18, marginBottom: 12, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
                <h3 style={{ color: C.trueBlue, marginBottom: 12, fontSize: 15, fontWeight: 600 }}>Registrar Conquista</h3>
                <input type="number" placeholder="Valor (R$) - opcional" value={amt} onChange={e => setAmt(e.target.value)} style={{ width: '100%', padding: 12, border: `1px solid ${C.blancDeBlanc}`, borderRadius: 8, marginBottom: 10, fontSize: 14, boxSizing: 'border-box' }} />
                <textarea placeholder="O que você conquistou ou comprou?" value={note} onChange={e => setNote(e.target.value)} style={{ width: '100%', padding: 12, border: `1px solid ${C.blancDeBlanc}`, borderRadius: 8, marginBottom: 12, fontSize: 14, minHeight: 60, resize: 'none', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowPurchaseForm(false)} style={{ flex: 1, background: C.blancDeBlanc, border: 'none', color: C.blackRobe, padding: 10, borderRadius: 8, cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={addPurchase} disabled={saving} style={{ flex: 1, background: C.alaskanBlue, border: 'none', color: C.white, padding: 10, borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{saving ? '...' : 'Registrar'}</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Aba Conquistas */}
            <div style={{ background: C.white, borderRadius: 16, padding: 18, marginBottom: 16, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
              <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 14px', fontWeight: 600 }}>Metas de Tempo</h3>
              {CONQUISTAS.map(c => {
                const achieved = days >= c.dias
                return (
                  <div key={c.dias} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.blancDeBlanc}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ width: 24, height: 24, borderRadius: '50%', background: achieved ? C.success : C.blancDeBlanc, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12 }}>
                        {achieved ? '✓' : ''}
                      </span>
                      <span style={{ color: achieved ? C.trueBlue : C.blackRobe, opacity: achieved ? 1 : 0.5, fontWeight: achieved ? 600 : 400 }}>{c.nome}</span>
                    </div>
                    <span style={{ color: achieved ? C.success : C.blackRobe, opacity: achieved ? 1 : 0.5, fontSize: 13 }}>+{c.xp} XP</span>
                  </div>
                )
              })}
            </div>
            
            {/* Dívidas quitadas */}
            {debts.length > 0 && (
              <div style={{ background: C.white, borderRadius: 16, padding: 18, marginBottom: 16, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
                <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 14px', fontWeight: 600 }}>Dívidas Quitadas</h3>
                {debts.map(d => (
                  <div key={d.id} style={{ padding: '10px 0', borderBottom: `1px solid ${C.blancDeBlanc}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: C.blackRobe, fontSize: 14 }}>{d.description}</span>
                      <span style={{ color: C.success, fontWeight: 600 }}>R$ {d.amount?.toLocaleString('pt-BR')}</span>
                    </div>
                    <span style={{ color: C.blackRobe, fontSize: 12, opacity: 0.5 }}>{new Date(d.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Compras/Conquistas */}
            {purchases.length > 0 && (
              <div style={{ background: C.white, borderRadius: 16, padding: 18, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
                <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 14px', fontWeight: 600 }}>Conquistas Pessoais</h3>
                {purchases.map(p => (
                  <div key={p.id} style={{ padding: '10px 0', borderBottom: `1px solid ${C.blancDeBlanc}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: C.blackRobe, fontSize: 14 }}>{p.description}</span>
                      {p.amount > 0 && <span style={{ color: C.alaskanBlue, fontWeight: 600 }}>R$ {p.amount?.toLocaleString('pt-BR')}</span>}
                    </div>
                    <span style={{ color: C.blackRobe, fontSize: 12, opacity: 0.5 }}>{new Date(p.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // ========== GRUPOS ==========
  const Groups = () => {
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [notes, setNotes] = useState('')
    const [saving, setSaving] = useState(false)
    const [groupNotes, setGroupNotes] = useState([])
    const [attendance, setAttendance] = useState([])
    
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
    
    const loadGroupDetails = async (group) => {
      setSelectedGroup(group)
      const { data: notes } = await supabase.from('patient_group_notes').select('*').eq('patient_id', user.id).eq('group_id', group.id).order('created_at', { ascending: false })
      if (notes) setGroupNotes(notes)
      const { data: att } = await supabase.from('session_attendance').select('*').eq('patient_id', user.id).eq('group_id', group.id).order('session_date', { ascending: false })
      if (att) setAttendance(att)
    }
    
    const saveNote = async () => {
      if (!notes.trim()) return
      setSaving(true)
      try {
        await supabase.from('patient_group_notes').insert({
          patient_id: user.id,
          group_id: selectedGroup.id,
          content: notes
        })
        setNotes('')
        await loadGroupDetails(selectedGroup)
      } catch (e) { alert('Erro: ' + e.message) }
      finally { setSaving(false) }
    }
    
    if (selectedGroup) {
      return (
        <div style={{ padding: 20, paddingBottom: 100 }}>
          <button onClick={() => setSelectedGroup(null)} style={{ background: 'none', border: 'none', color: C.trueBlue, fontSize: 14, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button>
          
          <div style={{ background: C.trueBlue, borderRadius: 16, padding: 20, marginBottom: 20, color: C.white }}>
            <h2 style={{ fontSize: 18, margin: '0 0 8px', fontWeight: 600 }}>{selectedGroup.name}</h2>
            <p style={{ fontSize: 14, opacity: 0.85, margin: 0 }}>{diasSemana[selectedGroup.day_of_week]} às {selectedGroup.time?.slice(0, 5)}</p>
          </div>
          
          {/* Anotações */}
          <div style={{ background: C.white, borderRadius: 16, padding: 18, marginBottom: 16, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
            <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 12px', fontWeight: 600 }}>Minhas Anotações</h3>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="Faça anotações sobre a sessão..."
              style={{ width: '100%', padding: 12, border: `1px solid ${C.blancDeBlanc}`, borderRadius: 8, fontSize: 14, minHeight: 80, resize: 'none', boxSizing: 'border-box', marginBottom: 10 }} 
            />
            <button onClick={saveNote} disabled={saving} style={{ width: '100%', background: C.trueBlue, color: C.white, border: 'none', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {saving ? 'Salvando...' : 'Salvar Anotação'}
            </button>
            
            {groupNotes.length > 0 && (
              <div style={{ marginTop: 16 }}>
                {groupNotes.map(n => (
                  <div key={n.id} style={{ padding: 12, background: C.iceMelt, borderRadius: 8, marginBottom: 8 }}>
                    <span style={{ color: C.blackRobe, fontSize: 12, opacity: 0.6 }}>{new Date(n.created_at).toLocaleDateString('pt-BR')}</span>
                    <p style={{ color: C.blackRobe, fontSize: 14, margin: '6px 0 0' }}>{n.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Presenças */}
          <div style={{ background: C.white, borderRadius: 16, padding: 18, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
            <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 12px', fontWeight: 600 }}>Histórico de Presenças</h3>
            {attendance.length === 0 ? (
              <p style={{ color: C.blackRobe, opacity: 0.6, fontSize: 14 }}>Nenhum registro ainda</p>
            ) : (
              attendance.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.blancDeBlanc}` }}>
                  <span style={{ color: C.blackRobe, fontSize: 14 }}>{new Date(a.session_date).toLocaleDateString('pt-BR')}</span>
                  <span style={{ background: a.status === 'confirmed' ? '#e8f5e9' : '#ffebee', color: a.status === 'confirmed' ? C.success : C.danger, padding: '4px 10px', borderRadius: 12, fontSize: 12 }}>
                    {a.status === 'confirmed' ? 'Presente' : 'Ausente'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )
    }
    
    return (
      <div style={{ padding: 20, paddingBottom: 100 }}>
        <h1 style={{ color: C.trueBlue, fontSize: 22, marginBottom: 20, fontWeight: 600 }}>Meus Grupos</h1>
        
        {myGroups.length === 0 ? (
          <div style={{ background: C.white, borderRadius: 16, padding: 32, textAlign: 'center', boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
            <p style={{ color: C.blackRobe, opacity: 0.6 }}>Você ainda não participa de nenhum grupo de apoio.</p>
          </div>
        ) : (
          myGroups.map(g => (
            <button key={g.id} onClick={() => loadGroupDetails(g)} style={{ width: '100%', background: C.white, border: 'none', borderRadius: 16, padding: 18, marginBottom: 12, textAlign: 'left', cursor: 'pointer', boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
              <h3 style={{ color: C.trueBlue, fontSize: 16, margin: '0 0 6px', fontWeight: 600 }}>{g.name}</h3>
              <p style={{ color: C.blackRobe, fontSize: 14, margin: 0, opacity: 0.6 }}>{diasSemana[g.day_of_week]} às {g.time?.slice(0, 5)}</p>
            </button>
          ))
        )}
      </div>
    )
  }

  // ========== DICAS ==========
  const Tips = () => (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <h1 style={{ color: C.trueBlue, fontSize: 22, marginBottom: 20, fontWeight: 600 }}>Dicas de Prevenção</h1>
      
      {/* Bloqueie o acesso */}
      <div style={{ background: C.white, borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
        <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 10px', fontWeight: 600 }}>Bloqueie o seu acesso às casas de apostas</h3>
        <p style={{ color: C.blackRobe, fontSize: 14, lineHeight: 1.5, margin: '0 0 14px', opacity: 0.7 }}>
          Utilize ferramentas de bloqueio para impedir o acesso a sites e apps de apostas.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="https://www.excludenow.com/apaj" target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'block', background: C.iceMelt, padding: '12px', borderRadius: 10, textAlign: 'center', textDecoration: 'none', color: C.trueBlue, fontWeight: 500, fontSize: 14 }}>
            Gamban
          </a>
          <a href="https://betblocker.org" target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'block', background: C.iceMelt, padding: '12px', borderRadius: 10, textAlign: 'center', textDecoration: 'none', color: C.trueBlue, fontWeight: 500, fontSize: 14 }}>
            BetBlocker
          </a>
        </div>
      </div>
      
      {/* Controle financeiro */}
      <div style={{ background: C.white, borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
        <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 10px', fontWeight: 600 }}>Controle financeiro</h3>
        <p style={{ color: C.blackRobe, fontSize: 14, lineHeight: 1.5, margin: 0, opacity: 0.7 }}>
          Diminua ou bloqueie o seu limite de Pix para empresas/CNPJ. Essa é uma das estratégias mais eficazes para evitar o impulso de depositar. Caso não saiba como fazer, entre em contato com o suporte do seu banco.
        </p>
      </div>
      
      {/* Identifique gatilhos */}
      <div style={{ background: C.white, borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
        <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 10px', fontWeight: 600 }}>Identifique gatilhos</h3>
        <p style={{ color: C.blackRobe, fontSize: 14, lineHeight: 1.5, margin: 0, opacity: 0.7 }}>
          Se antecipe! Conheça seus gatilhos, os horários e sentimentos que trazem a vontade de jogar, e crie estratégias para se antecipar à vontade.
        </p>
      </div>
      
      {/* Substitua o hábito */}
      <div style={{ background: C.white, borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
        <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 10px', fontWeight: 600 }}>Substitua o hábito</h3>
        <p style={{ color: C.blackRobe, fontSize: 14, lineHeight: 1.5, margin: 0, opacity: 0.7 }}>
          Encontre atividades que ocupem sua mente e corpo: Yoga, corrida, esportes em grupo, leitura. Descubra novos hobbies que tragam prazer e bem-estar.
        </p>
      </div>
      
      {/* Rede de apoio */}
      <div style={{ background: C.white, borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
        <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 10px', fontWeight: 600 }}>Rede de apoio</h3>
        <p style={{ color: C.blackRobe, fontSize: 14, lineHeight: 1.5, margin: 0, opacity: 0.7 }}>
          Contar para as pessoas de confiança é uma etapa importante do processo de superação do vício em jogos e apostas. Compartilhar sua jornada fortalece seus laços e sua recuperação.
        </p>
      </div>
      
      {/* Na hora da fissura */}
      <div style={{ background: C.white, borderRadius: 16, padding: 18, boxShadow: '0 2px 12px rgba(29,63,119,0.06)' }}>
        <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 10px', fontWeight: 600 }}>Na hora da fissura</h3>
        <p style={{ color: C.blackRobe, fontSize: 14, lineHeight: 1.5, margin: '0 0 12px', opacity: 0.7 }}>
          A vontade intensa de jogar passa em 15-20 minutos. Tente estas estratégias:
        </p>
        <ul style={{ color: C.blackRobe, fontSize: 14, lineHeight: 1.8, margin: 0, paddingLeft: 20, opacity: 0.7 }}>
          <li>Respire fundo: inspire por 4 segundos, segure por 4, expire por 4</li>
          <li>Ligue para alguém de confiança imediatamente</li>
          <li>Saia do ambiente onde está</li>
          <li>Tome um banho gelado</li>
          <li>Faça exercício físico intenso</li>
          <li>Escreva no diário o que está sentindo</li>
          <li>Relembre suas conquistas e o que já perdeu com o jogo</li>
        </ul>
      </div>
    </div>
  )

  // ========== AJUDA ==========
  const Help = () => {
    const [showForm, setShowForm] = useState(false)
    const [f, setF] = useState({ name: profile?.name || '', phone: profile?.phone || '', message: '' })
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    
    const send = async () => { 
      setSending(true)
      try { 
        await publicService.sendContactRequest(f)
        setSent(true) 
      } catch (e) { alert('Erro: ' + e.message) } 
      finally { setSending(false) } 
    }
    
    if (sent) return (
      <div style={{ padding: 20, paddingBottom: 100, textAlign: 'center' }}>
        <h2 style={{ color: C.trueBlue, margin: '40px 0 16px' }}>Solicitação Enviada!</h2>
        <p style={{ color: C.blackRobe, opacity: 0.6 }}>Em breve entraremos em contato.</p>
        <button onClick={() => { setSent(false); setShowForm(false) }} style={{ marginTop: 24, background: C.trueBlue, color: C.white, border: 'none', padding: '12px 28px', borderRadius: 10, cursor: 'pointer' }}>Voltar</button>
      </div>
    )
    
    if (showForm) return (
      <div style={{ padding: 20, paddingBottom: 100 }}>
        <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: C.trueBlue, marginBottom: 16, cursor: 'pointer', fontWeight: 500 }}>← Voltar</button>
        <h1 style={{ color: C.trueBlue, fontSize: 22, marginBottom: 20, fontWeight: 600 }}>Falar com a APAJ</h1>
        <div style={{ background: C.white, borderRadius: 16, padding: 20, boxShadow: '0 2px 16px rgba(29,63,119,0.08)' }}>
          <input type="text" placeholder="Seu nome" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} style={{ width: '100%', padding: 12, border: `1px solid ${C.blancDeBlanc}`, borderRadius: 10, marginBottom: 12, boxSizing: 'border-box' }} />
          <input type="tel" placeholder="Telefone (WhatsApp)" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} style={{ width: '100%', padding: 12, border: `1px solid ${C.blancDeBlanc}`, borderRadius: 10, marginBottom: 12, boxSizing: 'border-box' }} />
          <textarea placeholder="Conte sua história..." value={f.message} onChange={e => setF({ ...f, message: e.target.value })} style={{ width: '100%', padding: 12, border: `1px solid ${C.blancDeBlanc}`, borderRadius: 10, marginBottom: 14, minHeight: 100, resize: 'none', boxSizing: 'border-box' }} />
          <button onClick={send} disabled={sending || !f.phone} style={{ width: '100%', background: C.trueBlue, color: C.white, border: 'none', padding: 14, borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>{sending ? 'Enviando...' : 'Enviar Solicitação'}</button>
        </div>
      </div>
    )
    
    return (
      <div style={{ padding: 20, paddingBottom: 100 }}>
        <h1 style={{ color: C.trueBlue, fontSize: 22, marginBottom: 20, fontWeight: 600 }}>Como buscar ajuda</h1>
        
        {/* Alerta Urgente */}
        <div style={{ background: C.danger, borderRadius: 16, padding: 18, marginBottom: 20, color: C.white }}>
          <h2 style={{ fontSize: 15, margin: '0 0 10px', fontWeight: 700 }}>PRECISA DE AJUDA URGENTE?</h2>
          <p style={{ fontSize: 14, margin: '0 0 12px', opacity: 0.95 }}>Entre em contato com o 192 ou se encaminhe para uma UPA</p>
          <a href="https://meususdigital.saude.gov.br/rede-saude" target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: C.white, color: C.danger, textDecoration: 'none', padding: '12px 16px', borderRadius: 10, textAlign: 'center', fontSize: 14, fontWeight: 600 }}>
            Encontre a UPA mais próxima
          </a>
        </div>
        
        {/* APAJ */}
        <div style={{ background: C.trueBlue, borderRadius: 16, padding: 20, marginBottom: 20, color: C.white }}>
          <h2 style={{ fontSize: 16, margin: '0 0 8px', fontWeight: 600 }}>Como a APAJ pode te ajudar?</h2>
          <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 14 }}>Nos conte a sua história e deixe-nos ajudá-lo.</p>
          <button onClick={() => setShowForm(true)} style={{ background: C.white, color: C.trueBlue, border: 'none', padding: '12px 20px', borderRadius: 10, fontWeight: 600, cursor: 'pointer', width: '100%' }}>Solicitar Conversa</button>
        </div>
        
        {/* Alternativas de Ajuda */}
        <div style={{ background: C.white, borderRadius: 16, padding: 20, boxShadow: '0 2px 16px rgba(29,63,119,0.08)' }}>
          <h2 style={{ color: C.trueBlue, fontSize: 16, marginBottom: 16, fontWeight: 600 }}>Alternativas de Ajuda</h2>
          
          <a href="https://meususdigital.saude.gov.br/rede-saude" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: C.iceMelt, borderRadius: 12, marginBottom: 10, textDecoration: 'none' }}>
            <span style={{ fontSize: 24 }}>🏥</span>
            <div>
              <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 2px', fontWeight: 600 }}>Sistema Único de Saúde (SUS)</h3>
              <p style={{ color: C.blackRobe, fontSize: 12, margin: 0, opacity: 0.6 }}>Encontre a unidade mais próxima</p>
            </div>
          </a>
          
          <a href="https://iaapostador.org" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: C.iceMelt, borderRadius: 12, marginBottom: 10, textDecoration: 'none' }}>
            <span style={{ fontSize: 24 }}>🤝</span>
            <div>
              <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 2px', fontWeight: 600 }}>Instituto de Apoio ao Apostador</h3>
              <p style={{ color: C.blackRobe, fontSize: 12, margin: 0, opacity: 0.6 }}>iaapostador.org</p>
            </div>
          </a>
          
          <a href="https://gov.br/bets" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: C.iceMelt, borderRadius: 12, textDecoration: 'none' }}>
            <span style={{ fontSize: 24 }}>📋</span>
            <div>
              <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 2px', fontWeight: 600 }}>Informações sobre jogos e apostas</h3>
              <p style={{ color: C.blackRobe, fontSize: 12, margin: 0, opacity: 0.6 }}>gov.br/bets</p>
            </div>
          </a>
        </div>
      </div>
    )
  }

  // ========== PERFIL ==========
  const Profile = () => (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <h1 style={{ color: C.trueBlue, fontSize: 22, marginBottom: 20, fontWeight: 600 }}>Perfil</h1>
      <div style={{ background: C.white, borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: '0 2px 16px rgba(29,63,119,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 60, height: 60, background: C.trueBlue, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: C.white, fontWeight: 600 }}>{profile?.name ? profile.name.charAt(0).toUpperCase() : '?'}</div>
          <div>
            <h2 style={{ color: C.trueBlue, fontSize: 18, margin: '0 0 4px', fontWeight: 600 }}>{profile?.name || 'Usuário'}</h2>
            <p style={{ color: C.blackRobe, fontSize: 13, margin: 0, opacity: 0.6 }}>{user.email}</p>
          </div>
        </div>
        <button onClick={() => setPage('setup')} style={{ width: '100%', padding: 12, background: C.iceMelt, border: 'none', borderRadius: 10, cursor: 'pointer', marginBottom: 10, color: C.trueBlue, fontWeight: 500 }}>Editar Configurações</button>
        <button onClick={onLogout} style={{ width: '100%', padding: 12, background: '#ffebee', border: 'none', borderRadius: 10, color: C.danger, cursor: 'pointer', fontWeight: 500 }}>Sair da Conta</button>
      </div>
    </div>
  )

  const renderPage = () => {
    switch (page) {
      case 'home': return <Home />
      case 'setup': return <Setup />
      case 'diary': return <Diary />
      case 'progress': return <Progress />
      case 'groups': return <Groups />
      case 'tips': return <Tips />
      case 'help': return <Help />
      case 'profile': return <Profile />
      default: return <Home />
    }
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.iceMelt }}><p style={{ color: C.trueBlue }}>Carregando...</p></div>

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: C.iceMelt, minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      {renderPage()}
      <NavBar />
    </div>
  )
}
