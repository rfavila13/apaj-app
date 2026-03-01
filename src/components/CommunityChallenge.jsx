import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const C = {
  trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff',
  blackRobe: '#2b2b2b', blancDeBlanc: '#e9e9ea', white: '#ffffff',
  success: '#28a068', warning: '#e8a040', danger: '#d04040'
}

const DAYS_LEFT = (endDate) => {
  const diff = new Date(endDate) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function CommunityChallenge({ userId, onClose }) {
  const [challenge, setChallenge] = useState(null)
  const [myParticipation, setMyParticipation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [pastChallenges, setPastChallenges] = useState([])
  const [tab, setTab] = useState('current')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Desafio ativo
      const { data: active } = await supabase
        .from('community_challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (active) {
        setChallenge(active)
        // Participação do usuário
        const { data: participation } = await supabase
          .from('challenge_participations')
          .select('*')
          .eq('challenge_id', active.id)
          .eq('patient_id', userId)
          .maybeSingle()
        if (participation) setMyParticipation(participation)
      }

      // Desafios passados
      const { data: past } = await supabase
        .from('community_challenges')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: false })
        .limit(5)
      if (past) setPastChallenges(past)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const joinChallenge = async () => {
    if (!challenge) return
    setJoining(true)
    try {
      const { data } = await supabase.from('challenge_participations').insert({
        challenge_id: challenge.id,
        patient_id: userId,
        checkins_done: 0,
        completed: false
      }).select().single()
      if (data) setMyParticipation(data)
      // Incrementa participantes
      await supabase.from('community_challenges')
        .update({ participants_count: (challenge.participants_count || 0) + 1 })
        .eq('id', challenge.id)
      setChallenge(prev => ({ ...prev, participants_count: (prev.participants_count || 0) + 1 }))
    } catch (e) {
      alert('Erro ao participar: ' + e.message)
    } finally {
      setJoining(false)
    }
  }

  const doCheckin = async () => {
    if (!myParticipation) return
    const today = new Date().toISOString().split('T')[0]
    if (myParticipation.last_checkin === today) {
      alert('Você já fez o check-in de hoje! Volte amanhã. 💙')
      return
    }
    setCheckingIn(true)
    try {
      const newCount = (myParticipation.checkins_done || 0) + 1
      const completed = newCount >= (challenge?.duration_days || 7)
      const { data } = await supabase.from('challenge_participations')
        .update({ checkins_done: newCount, last_checkin: today, completed })
        .eq('id', myParticipation.id)
        .select()
        .single()
      if (data) setMyParticipation(data)
      if (completed) {
        await supabase.from('community_challenges')
          .update({ completions_count: (challenge.completions_count || 0) + 1 })
          .eq('id', challenge.id)
        setChallenge(prev => ({ ...prev, completions_count: (prev.completions_count || 0) + 1 }))
        alert('🎉 Parabéns! Você completou o desafio! Sua conquista foi registrada.')
      } else {
        alert(`✅ Check-in feito! Dia ${newCount} de ${challenge?.duration_days || 7}. Continue assim!`)
      }
    } catch (e) {
      alert('Erro: ' + e.message)
    } finally {
      setCheckingIn(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const alreadyCheckedIn = myParticipation?.last_checkin === today
  const progressPct = myParticipation ? Math.min(100, ((myParticipation.checkins_done || 0) / (challenge?.duration_days || 7)) * 100) : 0
  const communityPct = challenge ? Math.min(100, Math.round(((challenge.completions_count || 0) / Math.max(1, challenge.participants_count || 1)) * 100)) : 0

  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button>
      <h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 4, fontWeight: 600 }}>🏆 Desafio da Comunidade</h1>
      <p style={{ color: C.blackRobe, opacity: 0.7, fontSize: 13, marginBottom: 20 }}>Toda semana, um desafio novo para crescer juntos.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[{ id: 'current', label: '🔥 Atual' }, { id: 'past', label: '📜 Anteriores' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, background: tab === t.id ? C.trueBlue : C.white, color: tab === t.id ? C.white : C.blackRobe, border: 'none', padding: 12, borderRadius: 10, fontSize: 13, cursor: 'pointer', fontWeight: tab === t.id ? 600 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'current' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><p style={{ color: C.trueBlue }}>Carregando...</p></div>
          ) : !challenge ? (
            <div style={{ background: C.white, borderRadius: 16, padding: 32, textAlign: 'center' }}>
              <p style={{ fontSize: 40, margin: '0 0 12px' }}>⏳</p>
              <h3 style={{ color: C.trueBlue, fontSize: 16 }}>Nenhum desafio ativo</h3>
              <p style={{ color: C.blackRobe, opacity: 0.6, fontSize: 13 }}>A equipe APAJ está preparando o próximo desafio. Volte em breve!</p>
            </div>
          ) : (
            <div>
              {/* Card principal do desafio */}
              <div style={{ background: `linear-gradient(135deg, ${C.trueBlue}, ${C.alaskanBlue})`, borderRadius: 20, padding: 24, marginBottom: 16, color: C.white }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                    {challenge.duration_days || 7} dias • {DAYS_LEFT(challenge.end_date)} dias restantes
                  </span>
                  {myParticipation?.completed && (
                    <span style={{ background: C.success, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>✓ Concluído!</span>
                  )}
                </div>
                <h2 style={{ fontSize: 22, margin: '0 0 10px', fontWeight: 700, lineHeight: 1.3 }}>{challenge.title}</h2>
                <p style={{ fontSize: 13, opacity: 0.9, margin: 0, lineHeight: 1.5 }}>{challenge.description}</p>
              </div>

              {/* Stats da comunidade */}
              <div style={{ background: C.white, borderRadius: 16, padding: 18, marginBottom: 16 }}>
                <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 14px', fontWeight: 600 }}>👥 A Comunidade em Ação</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  <div style={{ background: C.iceMelt, borderRadius: 12, padding: 14, textAlign: 'center' }}>
                    <span style={{ fontSize: 24, fontWeight: 700, color: C.trueBlue }}>{challenge.participants_count || 0}</span>
                    <p style={{ color: C.trueBlue, fontSize: 11, margin: '4px 0 0', opacity: 0.8 }}>participando</p>
                  </div>
                  <div style={{ background: '#e8f5e9', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                    <span style={{ fontSize: 24, fontWeight: 700, color: C.success }}>{challenge.completions_count || 0}</span>
                    <p style={{ color: C.success, fontSize: 11, margin: '4px 0 0', opacity: 0.8 }}>concluíram</p>
                  </div>
                </div>
                {/* Barra de progresso coletiva */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: C.blackRobe, fontSize: 12, opacity: 0.7 }}>Conclusões da comunidade</span>
                    <span style={{ color: C.trueBlue, fontSize: 12, fontWeight: 600 }}>{communityPct}%</span>
                  </div>
                  <div style={{ background: C.blancDeBlanc, borderRadius: 8, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: communityPct + '%', height: '100%', background: `linear-gradient(90deg, ${C.alaskanBlue}, ${C.success})`, borderRadius: 8, transition: 'width 0.5s' }} />
                  </div>
                </div>
              </div>

              {/* Meu progresso */}
              {myParticipation ? (
                <div style={{ background: C.white, borderRadius: 16, padding: 18, marginBottom: 16 }}>
                  <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 14px', fontWeight: 600 }}>Meu Progresso</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: C.blackRobe, fontSize: 13 }}>
                      {myParticipation.checkins_done || 0} de {challenge.duration_days || 7} dias
                    </span>
                    <span style={{ color: C.trueBlue, fontWeight: 600, fontSize: 13 }}>{Math.round(progressPct)}%</span>
                  </div>
                  <div style={{ background: C.blancDeBlanc, borderRadius: 10, height: 12, overflow: 'hidden', marginBottom: 16 }}>
                    <div style={{ width: progressPct + '%', height: '100%', background: myParticipation.completed ? C.success : C.alaskanBlue, borderRadius: 10, transition: 'width 0.5s' }} />
                  </div>
                  {/* Grid de dias */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    {Array.from({ length: challenge.duration_days || 7 }).map((_, i) => (
                      <div key={i} style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: i < (myParticipation.checkins_done || 0) ? C.success : C.blancDeBlanc,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14
                      }}>
                        {i < (myParticipation.checkins_done || 0) ? '✓' : ''}
                      </div>
                    ))}
                  </div>
                  {!myParticipation.completed && (
                    <button onClick={doCheckin} disabled={checkingIn || alreadyCheckedIn}
                      style={{
                        width: '100%', background: alreadyCheckedIn ? '#e8f5e9' : C.success,
                        color: alreadyCheckedIn ? C.success : C.white, border: 'none',
                        padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 600,
                        cursor: alreadyCheckedIn ? 'default' : 'pointer'
                      }}>
                      {checkingIn ? 'Registrando...' : alreadyCheckedIn ? '✓ Check-in feito hoje!' : '✅ Fazer Check-in Hoje'}
                    </button>
                  )}
                  {myParticipation.completed && (
                    <div style={{ background: '#e8f5e9', borderRadius: 12, padding: 14, textAlign: 'center' }}>
                      <p style={{ color: C.success, fontSize: 15, margin: 0, fontWeight: 600 }}>🎉 Desafio Concluído! Parabéns!</p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ background: C.white, borderRadius: 16, padding: 20, textAlign: 'center' }}>
                  <p style={{ color: C.blackRobe, fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
                    Junte-se a <strong>{challenge.participants_count || 0}</strong> pessoas neste desafio!
                  </p>
                  <button onClick={joinChallenge} disabled={joining}
                    style={{ width: '100%', background: C.trueBlue, color: C.white, border: 'none', padding: 16, borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                    {joining ? 'Entrando...' : '🚀 Aceitar Desafio'}
                  </button>
                </div>
              )}

              {/* Dica do desafio */}
              {challenge.tip && (
                <div style={{ background: '#fff9e6', borderRadius: 14, padding: 16, border: '1px solid ' + C.warning + '44' }}>
                  <p style={{ color: '#c87d00', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                    💡 <strong>Dica:</strong> {challenge.tip}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'past' && (
        <div>
          {pastChallenges.length === 0 ? (
            <div style={{ background: C.white, borderRadius: 14, padding: 32, textAlign: 'center' }}>
              <p style={{ color: C.blackRobe, opacity: 0.6 }}>Nenhum desafio anterior ainda.</p>
            </div>
          ) : pastChallenges.map(c => (
            <div key={c.id} style={{ background: C.white, borderRadius: 14, padding: 16, marginBottom: 12 }}>
              <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 8px', fontWeight: 600 }}>{c.title}</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: C.blackRobe, opacity: 0.6, fontSize: 12 }}>👥 {c.participants_count || 0} participantes</span>
                <span style={{ color: C.success, fontSize: 12 }}>✓ {c.completions_count || 0} concluíram</span>
                <span style={{ color: C.blackRobe, opacity: 0.6, fontSize: 12 }}>{c.duration_days || 7} dias</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
