import React, { useState, useEffect, useRef } from 'react'
import { SOS_CARDS } from '../data/constants'
import { supabase } from '../services/supabase'
const C = { trueBlue: '#1d3f77', alaskanBlue: '#66aae2', white: '#ffffff', success: '#28a068', warning: '#e8a040', danger: '#d04040' }
export default function SOSFissura({ profile, userId, vault, onClose }) {
  const [phase, setPhase] = useState('vault')
  const [time, setTime] = useState(15 * 60)
  const [card, setCard] = useState(0)
  const [step, setStep] = useState(0)
  const [sent, setSent] = useState(false)
  const ref = useRef(null)
  useEffect(() => { if (phase === 'timer' && time > 0) { ref.current = setInterval(() => setTime(t => t - 1), 1000); return () => clearInterval(ref.current) } }, [phase, time])
  useEffect(() => { if (userId) logSOSUsage() }, [])
  const logSOSUsage = async () => { try { await supabase.from('sos_logs').insert({ patient_id: userId }) } catch (e) { console.error(e) } }
  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  const sendSOS = () => {
    const c = profile?.emergency_contact
    if (!c?.phone) { alert('Configure um contato de emergência no perfil'); return }
    const msg = encodeURIComponent(`[APAJ SOS] ${profile?.name || 'Usuário'} está passando por um momento difícil e precisa de apoio. Mensagem automática do app APAJ.`)
    window.open(`https://wa.me/55${c.phone.replace(/\D/g, '')}?text=${msg}`, '_blank')
    setSent(true)
  }
  const hasVault = vault?.length > 0
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20, overflowY: 'auto' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: C.white, fontSize: 28, cursor: 'pointer' }}>✕</button>
      <h1 style={{ color: C.danger, fontSize: 24, margin: '0 0 8px', fontWeight: 700 }}>🆘 SOS FISSURA</h1>
      <p style={{ color: C.white, opacity: 0.8, marginBottom: 20, textAlign: 'center' }}>Você está no controle. Isso vai passar.</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[{ id: 'vault', label: '📦 Cofre', show: hasVault }, { id: 'timer', label: '⏱️ Timer' }, { id: 'cards', label: '🃏 Técnicas' }, { id: 'contact', label: '📱 Apoio' }].filter(t => t.show !== false).map(t => (
          <button key={t.id} onClick={() => setPhase(t.id)} style={{ background: phase === t.id ? C.danger : 'rgba(255,255,255,0.1)', color: C.white, border: 'none', padding: '10px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer' }}>{t.label}</button>
        ))}
      </div>
      {phase === 'vault' && hasVault && (
        <div style={{ textAlign: 'center', maxWidth: 340 }}>
          <p style={{ color: C.warning, fontSize: 14, marginBottom: 16 }}>Você gravou isso para este momento:</p>
          {vault.map((v, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              {v.type === 'text' && <p style={{ color: C.white, margin: 0, fontStyle: 'italic' }}>"{v.content}"</p>}
              {v.type === 'image' && <img src={v.url} alt="Evidência" style={{ maxWidth: '100%', borderRadius: 8 }} />}
              <p style={{ color: C.white, opacity: 0.5, fontSize: 11, marginTop: 8 }}>{new Date(v.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
          ))}
          <button onClick={() => setPhase('timer')} style={{ marginTop: 12, background: C.danger, color: C.white, border: 'none', padding: '14px 28px', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Continuar para Técnicas →</button>
        </div>
      )}
      {phase === 'timer' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 200, height: 200, borderRadius: '50%', border: `6px solid ${time > 300 ? C.danger : time > 60 ? C.warning : C.success}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span style={{ color: C.white, fontSize: 48, fontWeight: 700 }}>{fmt(time)}</span>
            <span style={{ color: C.white, opacity: 0.7, fontSize: 12 }}>para o pico passar</span>
          </div>
          <p style={{ color: C.white, opacity: 0.8, maxWidth: 280, margin: '0 auto', fontSize: 14, lineHeight: 1.5 }}>A fissura dura em média 15-20 minutos. Aguente firme.</p>
          {time <= 0 && <div style={{ background: C.success, padding: 14, borderRadius: 10, marginTop: 16 }}><p style={{ color: C.white, margin: 0, fontWeight: 600 }}>✓ Você conseguiu!</p></div>}
        </div>
      )}
      {phase === 'cards' && (
        <div style={{ width: '100%', maxWidth: 340 }}>
          <div style={{ background: SOS_CARDS[card].color, borderRadius: 16, padding: 20, minHeight: 280 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span style={{ fontSize: 36 }}>{SOS_CARDS[card].icon}</span><span style={{ color: C.white, opacity: 0.8, fontSize: 12 }}>{card + 1}/{SOS_CARDS.length}</span></div>
            <h2 style={{ color: C.white, fontSize: 20, margin: '0 0 16px', fontWeight: 700 }}>{SOS_CARDS[card].title}</h2>
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 14 }}>
              {SOS_CARDS[card].steps.map((s, i) => (
                <div key={i} onClick={() => setStep(i)} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < SOS_CARDS[card].steps.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none', cursor: 'pointer', opacity: step >= i ? 1 : 0.5 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: step >= i ? C.white : 'rgba(255,255,255,0.3)', color: SOS_CARDS[card].color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{step > i ? '✓' : i + 1}</span>
                  <span style={{ color: C.white, fontSize: 13 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
            <button onClick={() => { setStep(0); setCard((card - 1 + SOS_CARDS.length) % SOS_CARDS.length) }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: C.white, padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>← Anterior</button>
            <button onClick={() => { setStep(0); setCard((card + 1) % SOS_CARDS.length) }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: C.white, padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}>Próximo →</button>
          </div>
        </div>
      )}
      {phase === 'contact' && (
        <div style={{ textAlign: 'center', maxWidth: 300 }}>
          <span style={{ fontSize: 56 }}>📱</span>
          <h2 style={{ color: C.white, margin: '12px 0' }}>Rede de Apoio</h2>
          {profile?.emergency_contact?.phone ? (
            <>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: 14, borderRadius: 10, marginBottom: 16 }}>
                <p style={{ color: C.white, margin: 0 }}>Contato: <strong>{profile.emergency_contact.name || profile.emergency_contact.phone}</strong></p>
              </div>
              {!sent ? <button onClick={sendSOS} style={{ background: '#25D366', color: C.white, border: 'none', padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%' }}>📲 Enviar SOS via WhatsApp</button> : <div style={{ background: C.success, padding: 14, borderRadius: 10 }}><p style={{ color: C.white, margin: 0 }}>✓ Mensagem enviada!</p></div>}
            </>
          ) : <div style={{ background: C.warning, padding: 14, borderRadius: 10 }}><p style={{ color: C.white, margin: 0, fontSize: 13 }}>Configure um contato de emergência no perfil.</p></div>}
          <div style={{ marginTop: 20, padding: 14, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
            <p style={{ color: C.white, opacity: 0.7, margin: '0 0 10px', fontSize: 13 }}>Ajuda profissional urgente:</p>
            <a href="tel:188" style={{ display: 'block', background: C.danger, color: C.white, textDecoration: 'none', padding: 10, borderRadius: 8, fontWeight: 600, marginBottom: 8 }}>📞 CVV - 188</a>
            <a href="tel:192" style={{ display: 'block', background: C.trueBlue, color: C.white, textDecoration: 'none', padding: 10, borderRadius: 8, fontWeight: 600 }}>🚑 SAMU - 192</a>
          </div>
        </div>
      )}
    </div>
  )
}
