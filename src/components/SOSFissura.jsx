import React, { useState, useEffect, useRef } from 'react'
import { SOS_CARDS } from '../data/constants'
import { supabase } from '../services/supabase'
import { C } from '../theme/colors'

export default function SOSFissura({ profile, userId, vault, onClose }) {
  const [phase, setPhase] = useState('vault')
  const [time, setTime] = useState(15 * 60)
  const [card, setCard] = useState(0)
  const [step, setStep] = useState(0)
  const [sent, setSent] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (phase === 'timer' && time > 0) {
      ref.current = setInterval(() => setTime(t => t - 1), 1000)
    } else {
      clearInterval(ref.current)
    }
    return () => clearInterval(ref.current)
  }, [phase, time])

  useEffect(() => { if (userId) logSOSUsage() }, [userId])

  const logSOSUsage = async () => {
    try { await supabase.from('sos_logs').insert({ patient_id: userId }) } catch (e) { console.error(e) }
  }

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const sendSOS = () => {
    const c = profile?.emergency_contact
    if (!c?.phone) { alert('Configure um contato de emergência no perfil'); return }
    const msg = encodeURIComponent(`[APAJ SOS] ${profile?.name || 'Usuário'} está passando por um momento difícil e precisa de apoio. Mensagem automática do app APAJ.`)
    window.open(`https://wa.me/55${c.phone.replace(/\D/g, '')}?text=${msg}`, '_blank')
    setSent(true)
  }

  const hasVault = vault?.length > 0
  const timerColor = time > 600 ? C.danger : time > 180 ? C.warning : C.success
  const timerPct = ((15 * 60 - time) / (15 * 60)) * 100

  const tabs = [
    { id: 'vault', label: '📦 Cofre', show: hasVault },
    { id: 'timer', label: '⏱️ Timer' },
    { id: 'cards', label: '🃏 Técnicas' },
    { id: 'contact', label: '📱 Apoio' },
  ].filter(t => t.show !== false)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(160deg, #0a0f1e 0%, #0d1929 50%, #0f1e33 100%)', zIndex: 9999, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 20px', textAlign: 'center', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', color: C.white, fontSize: 20, cursor: 'pointer', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🆘</div>
        <h1 style={{ color: C.white, fontSize: 22, fontWeight: 800, margin: '0 0 6px', letterSpacing: -0.5 }}>Você está no controle.</h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>A fissura vai passar. Use uma das técnicas abaixo.</p>
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setPhase(t.id)} style={{ background: phase === t.id ? 'rgba(239,68,68,0.85)' : 'rgba(255,255,255,0.08)', color: C.white, border: phase === t.id ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.1)', padding: '10px 18px', borderRadius: 24, fontSize: 13, cursor: 'pointer', fontWeight: phase === t.id ? 700 : 400, backdropFilter: 'blur(8px)' }}>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '0 16px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Vault */}
        {phase === 'vault' && hasVault && (
          <div style={{ width: '100%', maxWidth: 380 }}>
            <p style={{ color: 'rgba(245,158,11,0.9)', fontSize: 14, marginBottom: 16, textAlign: 'center', fontStyle: 'italic' }}>
              Você gravou isso para este momento:
            </p>
            {vault.map((v, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, marginBottom: 12, backdropFilter: 'blur(8px)' }}>
                {v.type === 'text' && <p style={{ color: C.white, margin: '0 0 10px', fontStyle: 'italic', lineHeight: 1.6, fontSize: 15 }}>"{v.content}"</p>}
                {v.type === 'image' && <img src={v.url} alt="Evidência" style={{ maxWidth: '100%', borderRadius: 10, marginBottom: 10 }} />}
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, margin: 0 }}>{new Date(v.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            ))}
            <button onClick={() => setPhase('timer')} style={{ width: '100%', background: 'rgba(239,68,68,0.8)', border: 'none', color: C.white, padding: '14px 28px', borderRadius: 14, fontWeight: 700, cursor: 'pointer', fontSize: 15, marginTop: 4 }}>Continuar para Técnicas →</button>
          </div>
        )}

        {/* Timer */}
        {phase === 'timer' && (
          <div style={{ textAlign: 'center', width: '100%', maxWidth: 340 }}>
            <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto 28px' }}>
              <svg width="220" height="220" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="110" cy="110" r="98" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                <circle cx="110" cy="110" r="98" fill="none" stroke={timerColor} strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 98}`}
                  strokeDashoffset={`${2 * Math.PI * 98 * (1 - timerPct / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: C.white, fontSize: 52, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>{fmt(time)}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 6 }}>para o pico passar</span>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
              A fissura dura em média 15–20 minutos.<br />Você <strong style={{ color: C.white }}>consegue</strong> atravessar isso.
            </p>
            {time <= 0 && (
              <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', padding: 16, borderRadius: 14 }}>
                <p style={{ color: C.success, margin: 0, fontWeight: 700, fontSize: 16 }}>✓ Você conseguiu passar!</p>
              </div>
            )}
          </div>
        )}

        {/* Cards */}
        {phase === 'cards' && (
          <div style={{ width: '100%', maxWidth: 380 }}>
            <div style={{ background: SOS_CARDS[card].color, borderRadius: 20, padding: 22, marginBottom: 14, minHeight: 300, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 40 }}>{SOS_CARDS[card].icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, background: 'rgba(0,0,0,0.2)', padding: '4px 10px', borderRadius: 10 }}>{card + 1}/{SOS_CARDS.length}</span>
              </div>
              <h2 style={{ color: C.white, fontSize: 20, margin: '0 0 18px', fontWeight: 700 }}>{SOS_CARDS[card].title}</h2>
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 14, backdropFilter: 'blur(4px)' }}>
                {SOS_CARDS[card].steps.map((s, i) => (
                  <div key={i} onClick={() => setStep(i)} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < SOS_CARDS[card].steps.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none', cursor: 'pointer', opacity: step >= i ? 1 : 0.45 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: step >= i ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)', color: SOS_CARDS[card].color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                      {step > i ? '✓' : i + 1}
                    </div>
                    <span style={{ color: C.white, fontSize: 13, lineHeight: 1.4, paddingTop: 3 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setStep(0); setCard((card - 1 + SOS_CARDS.length) % SOS_CARDS.length) }} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: C.white, padding: '12px', borderRadius: 12, cursor: 'pointer', fontSize: 14 }}>← Anterior</button>
              <button onClick={() => { setStep(0); setCard((card + 1) % SOS_CARDS.length) }} style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: C.white, padding: '12px', borderRadius: 12, cursor: 'pointer', fontSize: 14 }}>Próximo →</button>
            </div>
          </div>
        )}

        {/* Contact */}
        {phase === 'contact' && (
          <div style={{ width: '100%', maxWidth: 340 }}>
            {profile?.emergency_contact?.phone ? (
              <>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 18, marginBottom: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>👤</div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '0 0 6px' }}>Seu contato de emergência</p>
                  <p style={{ color: C.white, fontSize: 16, fontWeight: 700, margin: 0 }}>{profile.emergency_contact.name || profile.emergency_contact.phone}</p>
                </div>
                {!sent ? (
                  <button onClick={sendSOS} style={{ width: '100%', background: '#25D366', border: 'none', color: C.white, padding: '16px', borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 12, boxShadow: '0 4px 20px rgba(37,211,102,0.3)' }}>📲 Enviar SOS via WhatsApp</button>
                ) : (
                  <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', padding: 16, borderRadius: 14, marginBottom: 12, textAlign: 'center' }}>
                    <p style={{ color: C.success, margin: 0, fontWeight: 700, fontSize: 15 }}>✓ Mensagem enviada! Alguém está a caminho.</p>
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', padding: 16, borderRadius: 14, marginBottom: 14, textAlign: 'center' }}>
                <p style={{ color: C.warning, margin: 0, fontSize: 13 }}>⚠️ Configure um contato de emergência no seu perfil.</p>
              </div>
            )}

            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16 }}>
              <p style={{ color: 'rgba(255,255,255,0.55)', margin: '0 0 12px', fontSize: 13, textAlign: 'center' }}>Ajuda profissional urgente:</p>
              <a href="tel:188" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(239,68,68,0.7)', color: C.white, textDecoration: 'none', padding: '14px', borderRadius: 12, fontWeight: 700, marginBottom: 10, fontSize: 15 }}>📞 CVV — 188</a>
              <a href="tel:192" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(29,63,119,0.7)', color: C.white, textDecoration: 'none', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: 15 }}>🚑 SAMU — 192</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
