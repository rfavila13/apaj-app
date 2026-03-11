import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '../services/supabase'
import { C } from '../theme/colors'

const card = { background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px rgba(29,63,119,0.07)', padding: 20 }
const btnPrimary = { background: 'linear-gradient(135deg, #1d3f77 0%, #274d9c 100%)', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: 14, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(29,63,119,0.28)' }

const ALL_MISSIONS = [
  { key: 'breathe_5', emoji: '🌬️', title: 'Respiração Consciente', desc: 'Faça 5 minutos de respiração profunda: inspire por 4s, segure por 4s, expire por 4s.', cat: 'Mindfulness', time: '5 min' },
  { key: 'gratitude_3', emoji: '🙏', title: '3 Gratidões do Dia', desc: 'Escreva ou pense em 3 coisas pelas quais você é grato hoje. Podem ser pequenas.', cat: 'Mindfulness', time: '3 min' },
  { key: 'walk_20', emoji: '🚶', title: 'Caminhada de 20 minutos', desc: 'Saia para uma caminhada ao ar livre. Exercício físico libera endorfinas e reduz ansiedade.', cat: 'Físico', time: '20 min' },
  { key: 'water_8', emoji: '💧', title: 'Hidratação completa', desc: 'Beba pelo menos 8 copos de água hoje. A desidratação aumenta o estresse e a impulsividade.', cat: 'Físico', time: 'Dia todo' },
  { key: 'call_loved', emoji: '📞', title: 'Ligue para alguém querido', desc: 'Fale com um familiar ou amigo por pelo menos 10 minutos. Conexão humana é protetora.', cat: 'Social', time: '10 min' },
  { key: 'diary_entry', emoji: '📔', title: 'Escreva no Diário', desc: 'Abra o diário do app e registre como você está se sentindo agora. A escrita organiza emoções.', cat: 'Recuperação', time: '10 min' },
  { key: 'triggers_2', emoji: '🎯', title: 'Mapeie seus Gatilhos', desc: 'Identifique 2 situações que podem te tentar hoje e pense em como vai lidar com cada uma.', cat: 'Recuperação', time: '5 min' },
  { key: 'read_15', emoji: '📚', title: 'Leitura Terapêutica', desc: 'Leia 15 minutos de um livro sobre recuperação ou bem-estar. Use nossa Biblioteca de Recursos.', cat: 'Recuperação', time: '15 min' },
  { key: 'spend_log', emoji: '📒', title: 'Registre seus Gastos', desc: 'Anote todos os gastos do dia. Consciência financeira é parte fundamental da recuperação.', cat: 'Financeiro', time: '5 min' },
  { key: 'save_today', emoji: '🏦', title: 'Guarde um valor hoje', desc: 'Separe qualquer quantia para poupança, mesmo que R$1. O hábito é mais importante que o valor.', cat: 'Financeiro', time: '2 min' },
  { key: 'meditate_10', emoji: '🧘', title: 'Meditação Guiada', desc: 'Sente-se em silêncio por 10 minutos focando na respiração. Se a mente divagar, gentilmente volte.', cat: 'Mindfulness', time: '10 min' },
  { key: 'sleep_before_23', emoji: '😴', title: 'Sono Saudável', desc: 'Comprometa-se a dormir antes das 23h. Privação de sono aumenta impulsividade e risco de recaída.', cat: 'Físico', time: 'Noite' },
  { key: 'kindness', emoji: '🤝', title: 'Ato de Bondade', desc: 'Faça algo gentil por alguém hoje — um elogio, uma ajuda, uma mensagem de carinho.', cat: 'Social', time: 'Variável' },
  { key: 'future_vision', emoji: '✨', title: 'Visualize seu Futuro', desc: 'Feche os olhos por 5 minutos e imagine como será sua vida daqui a 1 ano sem o jogo.', cat: 'Recuperação', time: '5 min' },
  { key: 'budget_review', emoji: '💡', title: 'Revise seu Orçamento', desc: 'Verifique suas contas: quanto entrou, quanto saiu. Conhecimento das finanças traz controle.', cat: 'Financeiro', time: '10 min' },
  { key: 'share_progress', emoji: '💬', title: 'Compartilhe seu Progresso', desc: 'Conte para alguém de confiança sobre seu progresso, mesmo que seja pequeno. Transparência fortalece.', cat: 'Social', time: '5 min' },
  { key: 'cold_shower', emoji: '🚿', title: 'Ducha Refrescante', desc: 'Termine seu banho com 30 segundos de água fria. Estimula disposição e reduz compulsividade.', cat: 'Físico', time: '30 seg' },
  { key: 'affirmation', emoji: '🌟', title: 'Afirmação Positiva', desc: 'Repita 5 vezes: "Eu sou capaz de superar este desafio. Cada dia sou mais forte." Acredite.', cat: 'Mindfulness', time: '2 min' },
]

const CAT_COLORS = {
  'Mindfulness': '#4a90d9',
  'Físico': '#22c55e',
  'Social': '#f59e0b',
  'Financeiro': '#8b5cf6',
  'Recuperação': '#1d3f77',
}

const CAT_BG = {
  'Mindfulness': 'rgba(74,144,217,0.1)',
  'Físico': 'rgba(34,197,94,0.1)',
  'Social': 'rgba(245,158,11,0.1)',
  'Financeiro': 'rgba(139,92,246,0.1)',
  'Recuperação': 'rgba(29,63,119,0.1)',
}

const getDailyMissions = () => {
  const d = new Date()
  const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000)
  const seed = d.getFullYear() * 400 + dayOfYear
  const selected = []
  const used = new Set()
  const steps = [3, 7, 11]
  for (let i = 0; i < 3; i++) {
    let idx = (seed + steps[i]) % ALL_MISSIONS.length
    while (used.has(idx)) idx = (idx + 1) % ALL_MISSIONS.length
    used.add(idx)
    selected.push(ALL_MISSIONS[idx])
  }
  return selected
}

export default function DailyMissions({ userId, onClose, compact = false }) {
  const [completions, setCompletions] = useState([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(null)
  const [lastCompleted, setLastCompleted] = useState(null)

  const missions = useMemo(() => getDailyMissions(), [])
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { loadCompletions() }, [])

  const loadCompletions = async () => {
    const { data } = await supabase
      .from('daily_mission_completions')
      .select('mission_key')
      .eq('patient_id', userId)
      .eq('completed_date', today)
    if (data) setCompletions(data.map(d => d.mission_key))
    setLoading(false)
  }

  const completeMission = async (mission) => {
    if (completions.includes(mission.key)) return
    setCompleting(mission.key)
    try {
      const { error } = await supabase.from('daily_mission_completions').insert({
        patient_id: userId, mission_key: mission.key,
        completed_date: today, xp_earned: 0
      })
      if (!error) {
        setCompletions(prev => [...prev, mission.key])
        setLastCompleted(mission.key)
        setTimeout(() => setLastCompleted(null), 3000)
      }
    } catch (e) { console.error(e) }
    finally { setCompleting(null) }
  }

  const doneCount = missions.filter(m => completions.includes(m.key)).length

  if (compact) {
    return (
      <div style={{ background: C.white, borderRadius: 20, boxShadow: '0 2px 16px rgba(29,63,119,0.07)', padding: 18, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ color: C.trueBlue, fontSize: 14, margin: 0, fontWeight: 700 }}>🎯 Práticas do Dia</h3>
          <span style={{ color: C.success, fontSize: 12, fontWeight: 700, background: 'rgba(34,197,94,0.1)', padding: '3px 10px', borderRadius: 20 }}>{doneCount}/3</span>
        </div>
        <div style={{ background: C.blancDeBlanc, borderRadius: 8, height: 6, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ width: (doneCount / 3 * 100) + '%', height: '100%', background: 'linear-gradient(90deg, #1d3f77, #22c55e)', borderRadius: 8, transition: 'width 0.5s ease' }} />
        </div>
        {lastCompleted && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, padding: '8px 12px', marginBottom: 10, textAlign: 'center' }}>
            <p style={{ color: C.success, fontSize: 12, margin: 0, fontWeight: 600 }}>✅ Prática concluída! Continue nessa jornada.</p>
          </div>
        )}
        {loading ? (
          <p style={{ color: C.textSec, fontSize: 12, textAlign: 'center' }}>Carregando...</p>
        ) : missions.map((m, idx) => {
          const done = completions.includes(m.key)
          return (
            <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: idx < 2 ? '1px solid ' + C.blancDeBlanc : 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: done ? 'rgba(34,197,94,0.1)' : C.softBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{m.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: done ? C.success : C.blackRobe, fontSize: 12, margin: '0 0 2px', fontWeight: 600, textDecoration: done ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</p>
                <p style={{ color: CAT_COLORS[m.cat], fontSize: 10, margin: 0, fontWeight: 600 }}>{m.cat} · {m.time}</p>
              </div>
              <button onClick={() => completeMission(m)} disabled={done || completing === m.key}
                style={{ background: done ? 'rgba(34,197,94,0.1)' : 'linear-gradient(135deg, #1d3f77, #274d9c)', color: done ? C.success : C.white, border: 'none', borderRadius: 10, padding: '7px 12px', fontSize: 11, cursor: done ? 'default' : 'pointer', fontWeight: 700, flexShrink: 0, boxShadow: done ? 'none' : '0 2px 8px rgba(29,63,119,0.2)' }}>
                {done ? '✓' : completing === m.key ? '...' : 'Feito'}
              </button>
            </div>
          )
        })}
        {onClose && (
          <button onClick={onClose} style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: C.alaskanBlue, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Ver detalhes →</button>
        )}
      </div>
    )
  }

  return (
    <div style={{ background: C.softBg, minHeight: '100vh', paddingBottom: 110 }}>
      <div style={{ background: 'linear-gradient(135deg, #1d3f77, #274d9c)', padding: '52px 24px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(102,170,226,0.12)', pointerEvents: 'none' }} />
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: C.white, cursor: 'pointer', marginBottom: 16, fontWeight: 600, borderRadius: 10, padding: '6px 14px', fontSize: 13, position: 'relative' }}>← Voltar</button>
        <h1 style={{ color: C.white, fontSize: 22, fontWeight: 700, margin: '0 0 4px', position: 'relative' }}>🎯 Práticas Diárias</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: 0, position: 'relative' }}>3 práticas renovadas todo dia para a comunidade</p>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* Progress card */}
        <div style={{ background: 'linear-gradient(135deg, #0d2b5e 0%, #1d3f77 50%, #2a5298 100%)', borderRadius: 20, padding: 20, marginBottom: 16, color: C.white, boxShadow: '0 6px 24px rgba(29,63,119,0.25)' }}>
          <p style={{ margin: '0 0 4px', fontSize: 13, opacity: 0.75 }}>Progresso de hoje</p>
          <p style={{ margin: '0 0 16px', fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>{doneCount} <span style={{ fontSize: 16, opacity: 0.7, fontWeight: 400 }}>/ 3 práticas</span></p>
          <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 10, height: 8, overflow: 'hidden' }}>
            <div style={{ width: (doneCount / 3 * 100) + '%', height: '100%', background: doneCount === 3 ? C.success : C.alaskanBlue, borderRadius: 10, transition: 'width 0.5s ease' }} />
          </div>
          {doneCount === 3 && (
            <p style={{ margin: '12px 0 0', textAlign: 'center', fontSize: 14, fontWeight: 600, opacity: 0.95 }}>🌟 Você cuidou de você hoje. Isso é o que importa.</p>
          )}
        </div>

        {/* Mission cards */}
        {loading ? (
          <div style={{ ...card, textAlign: 'center', padding: 32 }}>
            <p style={{ color: C.textSec, margin: 0 }}>Carregando práticas...</p>
          </div>
        ) : (
          missions.map((m) => {
            const done = completions.includes(m.key)
            return (
              <div key={m.key} style={{ background: done ? 'rgba(34,197,94,0.04)' : C.white, borderRadius: 20, padding: 20, marginBottom: 12, boxShadow: '0 2px 16px rgba(29,63,119,0.07)', border: done ? '1.5px solid rgba(34,197,94,0.25)' : '1.5px solid transparent' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: done ? 'rgba(34,197,94,0.1)' : CAT_BG[m.cat], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{m.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ background: CAT_BG[m.cat], color: CAT_COLORS[m.cat], padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{m.cat}</span>
                      <span style={{ background: C.softBg, color: C.textSec, padding: '3px 10px', borderRadius: 20, fontSize: 10 }}>⏱ {m.time}</span>
                    </div>
                    <h3 style={{ color: done ? C.success : C.trueBlue, fontSize: 15, margin: '0 0 6px', fontWeight: 700 }}>{done && '✓ '}{m.title}</h3>
                    <p style={{ color: C.textSec, fontSize: 13, margin: '0 0 16px', lineHeight: 1.6 }}>{m.desc}</p>
                    <button onClick={() => completeMission(m)} disabled={done || completing === m.key}
                      style={{ width: '100%', background: done ? 'rgba(34,197,94,0.12)' : 'linear-gradient(135deg, #1d3f77 0%, #274d9c 100%)', color: done ? C.success : C.white, border: done ? '1.5px solid rgba(34,197,94,0.3)' : 'none', padding: '13px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: done ? 'default' : 'pointer', boxShadow: done ? 'none' : '0 4px 14px rgba(29,63,119,0.28)' }}>
                      {done ? '✓ Prática Realizada' : completing === m.key ? 'Registrando...' : 'Marcar como Realizada'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}

        <div style={{ background: C.iceMelt, borderRadius: 14, padding: 16, marginTop: 4 }}>
          <p style={{ color: C.trueBlue, fontSize: 12, margin: 0, lineHeight: 1.6 }}>
            💡 <strong>Prática coletiva:</strong> Todos os pacientes APAJ realizam as mesmas 3 práticas por dia. Você não está sozinho nessa jornada.
          </p>
        </div>
      </div>
    </div>
  )
}
