import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const C = {
  trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff',
  blackRobe: '#2b2b2b', blancDeBlanc: '#e9e9ea', white: '#ffffff',
  success: '#28a068', warning: '#e8a040', danger: '#d04040'
}

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
  'Mindfulness': C.alaskanBlue, 'Físico': C.success,
  'Social': C.warning, 'Financeiro': '#9c27b0', 'Recuperação': C.trueBlue
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

  const missions = getDailyMissions()
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
        alert('✅ Missão concluída! Continue nessa jornada.')
      }
    } catch (e) { console.error(e) }
    finally { setCompleting(null) }
  }

  const doneCount = missions.filter(m => completions.includes(m.key)).length

  if (compact) {
    return (
      <div style={{ background: C.white, borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ color: C.trueBlue, fontSize: 14, margin: 0, fontWeight: 700 }}>🎯 Missões do Dia</h3>
          <span style={{ color: C.success, fontSize: 12, fontWeight: 600 }}>{doneCount}/3 concluídas</span>
        </div>
        <div style={{ background: C.blancDeBlanc, borderRadius: 8, height: 6, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ width: (doneCount / 3 * 100) + '%', height: '100%', background: `linear-gradient(90deg, ${C.alaskanBlue}, ${C.success})`, borderRadius: 8, transition: 'width 0.5s' }} />
        </div>
        {loading ? <p style={{ color: C.blackRobe, opacity: 0.5, fontSize: 12 }}>Carregando...</p> : missions.map(m => (
          <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid ' + C.blancDeBlanc }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{m.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: completions.includes(m.key) ? C.success : C.trueBlue, fontSize: 12, margin: 0, fontWeight: 600, textDecoration: completions.includes(m.key) ? 'line-through' : 'none' }}>{m.title}</p>
              <p style={{ color: CAT_COLORS[m.cat], fontSize: 10, margin: 0 }}>{m.cat} • {m.time}</p>
            </div>
            <button onClick={() => completeMission(m)} disabled={completions.includes(m.key) || completing === m.key}
              style={{ background: completions.includes(m.key) ? '#e8f5e9' : C.trueBlue, color: completions.includes(m.key) ? C.success : C.white, border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 11, cursor: completions.includes(m.key) ? 'default' : 'pointer', fontWeight: 600 }}>
              {completions.includes(m.key) ? '✓' : completing === m.key ? '...' : 'Feito'}
            </button>
          </div>
        ))}
        {onClose && <button onClick={onClose} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: C.alaskanBlue, fontSize: 12, cursor: 'pointer' }}>Ver detalhes →</button>}
      </div>
    )
  }

  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 12, fontWeight: 500 }}>← Voltar</button>
      <h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 4, fontWeight: 700 }}>🎯 Missões Diárias</h1>
      <p style={{ color: C.blackRobe, opacity: 0.6, fontSize: 13, marginBottom: 20 }}>3 práticas renovadas todo dia. Toda a comunidade APAJ realiza as mesmas missões juntos.</p>

      <div style={{ background: `linear-gradient(135deg, ${C.trueBlue}, ${C.alaskanBlue})`, borderRadius: 20, padding: 20, marginBottom: 20, color: C.white }}>
        <p style={{ margin: '0 0 8px', fontSize: 13, opacity: 0.8 }}>Progresso de hoje</p>
        <p style={{ margin: '0 0 16px', fontSize: 28, fontWeight: 700 }}>{doneCount} / 3 práticas</p>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, height: 10, overflow: 'hidden' }}>
          <div style={{ width: (doneCount / 3 * 100) + '%', height: '100%', background: C.white, borderRadius: 10, transition: 'width 0.5s' }} />
        </div>
        {doneCount === 3 && (
          <p style={{ margin: '12px 0 0', textAlign: 'center', fontSize: 14, fontWeight: 600 }}>Você cuidou de você hoje. Isso é o que importa.</p>
        )}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: C.trueBlue }}>Carregando missões...</p>
      ) : (
        missions.map((m) => {
          const done = completions.includes(m.key)
          return (
            <div key={m.key} style={{ background: done ? '#e8f5e9' : C.white, borderRadius: 20, padding: 20, marginBottom: 14, borderLeft: done ? '4px solid ' + C.success : 'none', transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 38, flexShrink: 0 }}>{m.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ background: CAT_COLORS[m.cat] + '22', color: CAT_COLORS[m.cat], padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{m.cat}</span>
                    <span style={{ background: C.iceMelt, color: C.trueBlue, padding: '2px 10px', borderRadius: 20, fontSize: 10 }}>⏱ {m.time}</span>
                  </div>
                  <h3 style={{ color: done ? C.success : C.trueBlue, fontSize: 15, margin: '0 0 6px', fontWeight: 700 }}>{done && '✓ '}{m.title}</h3>
                  <p style={{ color: C.blackRobe, fontSize: 12, margin: '0 0 16px', lineHeight: 1.6, opacity: 0.8 }}>{m.desc}</p>
                  <button onClick={() => completeMission(m)} disabled={done || completing === m.key}
                    style={{ width: '100%', background: done ? C.success : C.trueBlue, color: C.white, border: 'none', padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: done ? 'default' : 'pointer', opacity: done ? 0.7 : 1 }}>
                    {done ? '✓ Prática Realizada' : completing === m.key ? 'Registrando...' : 'Marcar como Realizada'}
                  </button>
                </div>
              </div>
            </div>
          )
        })
      )}

      <div style={{ background: C.iceMelt, borderRadius: 14, padding: 16, marginTop: 8 }}>
        <p style={{ color: C.trueBlue, fontSize: 12, margin: 0, lineHeight: 1.5 }}>
          💡 <strong>Prática coletiva:</strong> Todos os pacientes APAJ realizam as mesmas 3 práticas por dia. Você não está sozinho nessa jornada.
        </p>
      </div>
    </div>
  )
}
