import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
const C = { trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff', blackRobe: '#2b2b2b', white: '#ffffff', success: '#28a068' }
export default function VictoryWall({ onClose }) {
  const [victories, setVictories] = useState([])
  useEffect(() => { loadVictories() }, [])
  const loadVictories = async () => {
    const { data } = await supabase.from('anonymous_victories').select('*').order('created_at', { ascending: false }).limit(20)
    if (data) setVictories(data)
  }
  const icons = { days: '📅', debt: '💰', milestone: '🏆', achievement: '⭐' }
  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button>
      <h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 8, fontWeight: 600 }}>🎉 Mural de Vitórias</h1>
      <p style={{ color: C.blackRobe, opacity: 0.7, fontSize: 13, marginBottom: 20 }}>Conquistas anônimas da comunidade APAJ.</p>
      <div style={{ background: C.iceMelt, borderRadius: 12, padding: 14, marginBottom: 20 }}>
        <p style={{ color: C.trueBlue, fontSize: 12, margin: 0, textAlign: 'center' }}>Sem perfis. Sem comentários. Apenas inspiração coletiva.</p>
      </div>
      {victories.length === 0 ? (
        <div style={{ background: C.white, borderRadius: 14, padding: 32, textAlign: 'center' }}><p style={{ color: C.blackRobe, opacity: 0.6 }}>Nenhuma vitória ainda</p></div>
      ) : victories.map(v => (
        <div key={v.id} style={{ background: C.white, borderRadius: 14, padding: 16, marginBottom: 12, display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ fontSize: 32 }}>{icons[v.type] || '⭐'}</span>
          <div style={{ flex: 1 }}>
            <p style={{ color: C.trueBlue, fontSize: 14, margin: 0, fontWeight: 600 }}>{v.message}</p>
            <p style={{ color: C.blackRobe, opacity: 0.5, fontSize: 11, margin: '4px 0 0' }}>{new Date(v.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
export const publishVictory = async (type, message) => {
  try { await supabase.from('anonymous_victories').insert({ type, message }) } catch (e) { console.error(e) }
}
