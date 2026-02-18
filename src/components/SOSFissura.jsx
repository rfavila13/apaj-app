import React, { useState, useEffect, useRef } from 'react'
import { SOS_CARDS } from '../data/constants'

const C = { trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff', blackRobe: '#2b2b2b', white: '#ffffff', success: '#28a068', warning: '#e8a040', danger: '#d04040' }

export default function SOSFissura({ profile, onClose }) {
  const [phase, setPhase] = useState('timer') // timer, cards, contact
  const [timeLeft, setTimeLeft] = useState(15 * 60)
  const [activeCard, setActiveCard] = useState(0)
  const [cardStep, setCardStep] = useState(0)
  const [messageSent, setMessageSent] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (phase === 'timer' && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000)
      return () => clearInterval(intervalRef.current)
    }
  }, [phase, timeLeft])

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  
  const sendEmergencyMessage = async () => {
    const contact = profile?.emergency_contact
    if (!contact?.phone) { alert('Configure um contato de emergência no perfil'); return }
    
    const msg = encodeURIComponent(`[APAJ SOS] ${profile?.name || 'Um usuário'} está enfrentando um momento difícil e precisa de apoio. Esta é uma mensagem automática do app APAJ.`)
    window.open(`https://wa.me/${contact.phone.replace(/\D/g, '')}?text=${msg}`, '_blank')
    setMessageSent(true)
  }

  const nextCard = () => {
    setCardStep(0)
    setActiveCard((activeCard + 1) % SOS_CARDS.length)
  }

  const prevCard = () => {
    setCardStep(0)
    setActiveCard((activeCard - 1 + SOS_CARDS.length) % SOS_CARDS.length)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: C.white, fontSize: 28, cursor: 'pointer' }}>✕</button>
      
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ color: C.danger, fontSize: 28, margin: 0, fontWeight: 700 }}>🆘 SOS FISSURA</h1>
        <p style={{ color: C.white, opacity: 0.8, marginTop: 8 }}>Você está no controle. Isso vai passar.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[{ id: 'timer', label: '⏱️ Timer' }, { id: 'cards', label: '🃏 Técnicas' }, { id: 'contact', label: '📱 Apoio' }].map(t => (
          <button key={t.id} onClick={() => setPhase(t.id)} style={{ background: phase === t.id ? C.danger : 'rgba(255,255,255,0.1)', color: C.white, border: 'none', padding: '10px 20px', borderRadius: 20, fontSize: 14, cursor: 'pointer' }}>{t.label}</button>
        ))}
      </div>

      {/* Timer Phase */}
      {phase === 'timer' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 220, height: 220, borderRadius: '50%', border: `8px solid ${timeLeft > 300 ? C.danger : timeLeft > 60 ? C.warning : C.success}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <span style={{ color: C.white, fontSize: 56, fontWeight: 700 }}>{formatTime(timeLeft)}</span>
            <span style={{ color: C.white, opacity: 0.7, fontSize: 14 }}>para o pico passar</span>
          </div>
          <p style={{ color: C.white, opacity: 0.8, maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>
            A neurociência mostra que o pico da fissura dura em média 15-20 minutos. Aguente firme. Use as técnicas ao lado.
          </p>
          {timeLeft <= 0 && (
            <div style={{ background: C.success, padding: 16, borderRadius: 12, marginTop: 20 }}>
              <p style={{ color: C.white, margin: 0, fontWeight: 600 }}>✓ Você conseguiu! A fissura passou.</p>
            </div>
          )}
        </div>
      )}

      {/* Cards Phase */}
      {phase === 'cards' && (
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ background: SOS_CARDS[activeCard].color, borderRadius: 20, padding: 24, minHeight: 320 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 40 }}>{SOS_CARDS[activeCard].icon}</span>
              <span style={{ color: C.white, opacity: 0.8, fontSize: 13 }}>{activeCard + 1}/{SOS_CARDS.length}</span>
            </div>
            <h2 style={{ color: C.white, fontSize: 22, margin: '0 0 20px', fontWeight: 700 }}>{SOS_CARDS[activeCard].title}</h2>
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 16 }}>
              {SOS_CARDS[activeCard].steps.map((step, i) => (
                <div key={i} onClick={() => setCardStep(i)} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < SOS_CARDS[activeCard].steps.length - 1 ? '1px solid rgba(255,255,255,0.2)' : 'none', cursor: 'pointer', opacity: cardStep >= i ? 1 : 0.5 }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: cardStep >= i ? C.white : 'rgba(255,255,255,0.3)', color: SOS_CARDS[activeCard].color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{cardStep > i ? '✓' : i + 1}</span>
                  <span style={{ color: C.white, fontSize: 14, flex: 1 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button onClick={prevCard} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: C.white, padding: '12px 24px', borderRadius: 10, cursor: 'pointer' }}>← Anterior</button>
            <button onClick={nextCard} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: C.white, padding: '12px 24px', borderRadius: 10, cursor: 'pointer' }}>Próximo →</button>
          </div>
        </div>
      )}

      {/* Contact Phase */}
      {phase === 'contact' && (
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📱</div>
          <h2 style={{ color: C.white, margin: '0 0 12px' }}>Rede de Apoio</h2>
          <p style={{ color: C.white, opacity: 0.7, marginBottom: 24 }}>Envie uma mensagem automática para seu contato de confiança via WhatsApp.</p>
          
          {profile?.emergency_contact?.phone ? (
            <>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, marginBottom: 20 }}>
                <p style={{ color: C.white, margin: 0 }}>Contato: <strong>{profile.emergency_contact.name || profile.emergency_contact.phone}</strong></p>
              </div>
              {!messageSent ? (
                <button onClick={sendEmergencyMessage} style={{ background: '#25D366', color: C.white, border: 'none', padding: '16px 32px', borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                  📲 Enviar SOS via WhatsApp
                </button>
              ) : (
                <div style={{ background: C.success, padding: 16, borderRadius: 12 }}>
                  <p style={{ color: C.white, margin: 0 }}>✓ Mensagem enviada! Aguarde contato.</p>
                </div>
              )}
            </>
          ) : (
            <div style={{ background: C.warning, padding: 16, borderRadius: 12 }}>
              <p style={{ color: C.white, margin: 0 }}>Configure um contato de emergência no seu perfil para usar esta função.</p>
            </div>
          )}
          
          <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
            <p style={{ color: C.white, opacity: 0.7, margin: '0 0 12px', fontSize: 14 }}>Precisa de ajuda profissional urgente?</p>
            <a href="tel:188" style={{ display: 'block', background: C.danger, color: C.white, textDecoration: 'none', padding: '12px', borderRadius: 8, fontWeight: 600, marginBottom: 8 }}>📞 CVV - 188</a>
            <a href="tel:192" style={{ display: 'block', background: C.trueBlue, color: C.white, textDecoration: 'none', padding: '12px', borderRadius: 8, fontWeight: 600 }}>🚑 SAMU - 192</a>
          </div>
        </div>
      )}
    </div>
  )
}
