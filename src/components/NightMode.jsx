import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
const C = { trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff', blackRobe: '#2b2b2b', blancDeBlanc: '#e9e9ea', white: '#ffffff', success: '#28a068', warning: '#e8a040', danger: '#d04040' }
export default function NightMode({ profile, isActive, onOpenSOS }) {
  const [showCheckin, setShowCheckin] = useState(false)
  const [response, setResponse] = useState('')
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setShowCheckin(true), 30000)
      return () => clearTimeout(timer)
    }
  }, [isActive])
  const sendCheckin = async () => {
    try { await supabase.from('night_checkins').insert({ patient_id: profile?.id, response, created_at: new Date().toISOString() }) } catch (e) { console.error(e) }
    setShowCheckin(false); setResponse('')
  }
  if (!isActive) return null
  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'linear-gradient(180deg, rgba(29,63,119,0.95) 0%, transparent 100%)', padding: '12px 20px', zIndex: 998 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>🌙</span><span style={{ color: C.white, fontSize: 13 }}>Modo Noturno Ativo</span></div>
          <button onClick={onOpenSOS} style={{ background: C.danger, color: C.white, border: 'none', padding: '6px 12px', borderRadius: 16, fontSize: 12, cursor: 'pointer' }}>🆘 SOS</button>
        </div>
      </div>
      {showCheckin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: C.white, borderRadius: 20, padding: 24, maxWidth: 320, width: '100%', textAlign: 'center' }}>
            <span style={{ fontSize: 48 }}>🌙</span>
            <h2 style={{ color: C.trueBlue, margin: '12px 0 8px' }}>Check-in Noturno</h2>
            <p style={{ color: C.blackRobe, opacity: 0.7, fontSize: 14, marginBottom: 16 }}>Como você está se sentindo agora?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Estou bem, só sem sono', 'Pensando em jogar', 'Precisando de apoio'].map(r => (
                <button key={r} onClick={() => { setResponse(r); if (r === 'Precisando de apoio') onOpenSOS(); else sendCheckin() }} style={{ background: r.includes('jogar') || r.includes('apoio') ? C.warning : C.iceMelt, color: r.includes('jogar') || r.includes('apoio') ? C.white : C.trueBlue, border: 'none', padding: 14, borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>{r}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export const isNightModeTime = (settings) => {
  if (!settings?.enabled) return false
  const now = new Date()
  const h = now.getHours()
  const start = parseInt(settings.start_hour || 23)
  const end = parseInt(settings.end_hour || 6)
  if (start > end) return h >= start || h < end
  return h >= start && h < end
}
