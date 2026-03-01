import React, { useState, useEffect, useRef } from 'react'

const C = {
  trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff',
  blackRobe: '#2b2b2b', white: '#ffffff', success: '#28a068'
}

const TECHNIQUES = [
  {
    id: 'box',
    name: 'Respiração Quadrada',
    desc: 'Ideal para ansiedade aguda',
    phases: [
      { label: 'Inspire', duration: 4, color: '#66aae2' },
      { label: 'Segure', duration: 4, color: '#1d3f77' },
      { label: 'Expire', duration: 4, color: '#28a068' },
      { label: 'Segure', duration: 4, color: '#e8a040' }
    ]
  },
  {
    id: '478',
    name: 'Técnica 4-7-8',
    desc: 'Para relaxamento profundo',
    phases: [
      { label: 'Inspire', duration: 4, color: '#66aae2' },
      { label: 'Segure', duration: 7, color: '#1d3f77' },
      { label: 'Expire', duration: 8, color: '#28a068' }
    ]
  },
  {
    id: 'calm',
    name: 'Respiração Calmante',
    desc: 'Simples e eficaz',
    phases: [
      { label: 'Inspire', duration: 4, color: '#66aae2' },
      { label: 'Expire', duration: 6, color: '#28a068' }
    ]
  }
]

const GROUNDING = [
  { num: 5, sense: '👁️ Veja', verb: 'Nomeie', what: '5 coisas que você pode VER agora' },
  { num: 4, sense: '✋ Toque', verb: 'Sinta', what: '4 coisas que você pode TOCAR' },
  { num: 3, sense: '👂 Ouça', verb: 'Ouça', what: '3 sons que você pode OUVIR' },
  { num: 2, sense: '👃 Cheire', verb: 'Sinta', what: '2 cheiros que você percebe' },
  { num: 1, sense: '👅 Prove', verb: 'Sinta', what: '1 sabor que você percebe' }
]

export default function BreathingMode({ onClose }) {
  const [mode, setMode] = useState('menu') // menu | breathing | grounding
  const [selectedTech, setSelectedTech] = useState(TECHNIQUES[0])
  const [isRunning, setIsRunning] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const [groundingStep, setGroundingStep] = useState(0)
  const [scale, setScale] = useState(1)
  const intervalRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    if (!isRunning) return

    const phase = selectedTech.phases[phaseIndex]
    setSecondsLeft(phase.duration)

    // Animação do círculo
    const isInhale = phase.label === 'Inspire'
    const isExhale = phase.label === 'Expire'
    if (isInhale) setScale(1.4)
    else if (isExhale) setScale(0.8)
    else setScale(scale) // segure - mantém

    let counter = phase.duration
    intervalRef.current = setInterval(() => {
      counter--
      setSecondsLeft(counter)
      if (counter <= 0) {
        clearInterval(intervalRef.current)
        const nextPhase = (phaseIndex + 1) % selectedTech.phases.length
        if (nextPhase === 0) setCycleCount(c => c + 1)
        setPhaseIndex(nextPhase)
      }
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [isRunning, phaseIndex, selectedTech])

  const startBreathing = (tech) => {
    setSelectedTech(tech)
    setPhaseIndex(0)
    setSecondsLeft(tech.phases[0].duration)
    setCycleCount(0)
    setScale(1)
    setIsRunning(true)
    setMode('breathing')
  }

  const stopBreathing = () => {
    clearInterval(intervalRef.current)
    setIsRunning(false)
    setMode('menu')
    setPhaseIndex(0)
    setScale(1)
  }

  const currentPhase = selectedTech.phases[phaseIndex]

  return (
    <div style={{ padding: 20, paddingBottom: 100, minHeight: '80vh' }}>
      <button onClick={mode === 'menu' ? onClose : stopBreathing}
        style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>
        ← {mode === 'menu' ? 'Voltar' : 'Parar'}
      </button>

      {mode === 'menu' && (
        <div>
          <h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 4, fontWeight: 600 }}>🧘 Respire Comigo</h1>
          <p style={{ color: C.blackRobe, opacity: 0.7, fontSize: 13, marginBottom: 24 }}>Técnicas de respiração para momentos difíceis.</p>

          <h3 style={{ color: C.trueBlue, fontSize: 14, marginBottom: 12, fontWeight: 600 }}>Técnicas de Respiração</h3>
          {TECHNIQUES.map(tech => (
            <button key={tech.id} onClick={() => startBreathing(tech)}
              style={{ width: '100%', background: C.white, border: 'none', borderRadius: 14, padding: 18, marginBottom: 10, cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: C.iceMelt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🫁</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 4px', fontWeight: 600 }}>{tech.name}</h3>
                <p style={{ color: C.blackRobe, fontSize: 12, margin: '0 0 6px', opacity: 0.6 }}>{tech.desc}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {tech.phases.map((p, i) => (
                    <span key={i} style={{ background: p.color + '22', color: p.color, padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 500 }}>
                      {p.label} {p.duration}s
                    </span>
                  ))}
                </div>
              </div>
              <span style={{ color: C.alaskanBlue, fontSize: 18 }}>▶</span>
            </button>
          ))}

          <div style={{ height: 1, background: C.blancDeBlanc, margin: '20px 0' }} />

          <h3 style={{ color: C.trueBlue, fontSize: 14, marginBottom: 12, fontWeight: 600 }}>Técnica de Aterramento</h3>
          <button onClick={() => { setGroundingStep(0); setMode('grounding') }}
            style={{ width: '100%', background: C.white, border: 'none', borderRadius: 14, padding: 18, cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🌿</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 4px', fontWeight: 600 }}>Método 5-4-3-2-1</h3>
              <p style={{ color: C.blackRobe, fontSize: 12, margin: 0, opacity: 0.6 }}>Retorne ao presente usando os 5 sentidos</p>
            </div>
            <span style={{ color: C.alaskanBlue, fontSize: 18 }}>▶</span>
          </button>

          <div style={{ background: C.iceMelt, borderRadius: 14, padding: 16, marginTop: 20 }}>
            <p style={{ color: C.trueBlue, fontSize: 12, margin: 0, lineHeight: 1.6, textAlign: 'center' }}>
              Respiração controlada reduz os níveis de cortisol e ativa o sistema nervoso parassimpático, diminuindo a fissura em minutos.
            </p>
          </div>
        </div>
      )}

      {mode === 'breathing' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20 }}>
          <h2 style={{ color: C.trueBlue, fontSize: 18, marginBottom: 4 }}>{selectedTech.name}</h2>
          <p style={{ color: C.blackRobe, opacity: 0.6, fontSize: 13, marginBottom: 40 }}>
            {cycleCount > 0 ? `${cycleCount} ciclo(s) completo(s)` : 'Siga o ritmo do círculo'}
          </p>

          {/* Círculo animado */}
          <div style={{ position: 'relative', marginBottom: 48 }}>
            {/* Anel externo pulsando */}
            <div style={{
              width: 220, height: 220, borderRadius: '50%',
              border: `3px solid ${currentPhase?.color || C.alaskanBlue}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative'
            }}>
              {/* Círculo principal */}
              <div style={{
                width: scale === 1.4 ? 180 : scale === 0.8 ? 110 : 145,
                height: scale === 1.4 ? 180 : scale === 0.8 ? 110 : 145,
                borderRadius: '50%',
                background: `radial-gradient(circle at 40% 40%, ${currentPhase?.color || C.alaskanBlue}cc, ${currentPhase?.color || C.alaskanBlue})`,
                transition: `all ${currentPhase?.duration || 4}s ease-in-out`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 40px ${currentPhase?.color || C.alaskanBlue}66`
              }}>
                <span style={{ color: C.white, fontSize: 36, fontWeight: 300, lineHeight: 1 }}>{secondsLeft}</span>
                <span style={{ color: C.white, fontSize: 13, fontWeight: 500, marginTop: 4, opacity: 0.9 }}>
                  {currentPhase?.label}
                </span>
              </div>
            </div>
          </div>

          {/* Fases */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            {selectedTech.phases.map((p, i) => (
              <div key={i} style={{
                padding: '6px 14px', borderRadius: 20,
                background: i === phaseIndex ? p.color : C.blancDeBlanc,
                color: i === phaseIndex ? C.white : C.blackRobe,
                fontSize: 12, fontWeight: i === phaseIndex ? 600 : 400,
                opacity: i === phaseIndex ? 1 : 0.5,
                transition: 'all 0.3s'
              }}>
                {p.label} {p.duration}s
              </div>
            ))}
          </div>

          <div style={{ background: C.iceMelt, borderRadius: 12, padding: 14, maxWidth: 300, textAlign: 'center' }}>
            <p style={{ color: C.trueBlue, fontSize: 12, margin: 0 }}>
              Feche os olhos se possível. Respire pelo nariz e expire pela boca.
            </p>
          </div>

          <button onClick={stopBreathing}
            style={{ marginTop: 32, background: 'transparent', border: '1px solid ' + C.blancDeBlanc, color: C.blackRobe, padding: '10px 28px', borderRadius: 20, fontSize: 13, cursor: 'pointer', opacity: 0.7 }}>
            Parar
          </button>
        </div>
      )}

      {mode === 'grounding' && (
        <div>
          <h2 style={{ color: C.trueBlue, fontSize: 18, marginBottom: 4, fontWeight: 600 }}>🌿 Método 5-4-3-2-1</h2>
          <p style={{ color: C.blackRobe, opacity: 0.7, fontSize: 13, marginBottom: 24 }}>Retorne ao momento presente usando seus sentidos.</p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
            {GROUNDING.map((g, i) => (
              <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: i <= groundingStep ? C.trueBlue : C.blancDeBlanc, color: i <= groundingStep ? C.white : C.blackRobe, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, transition: 'all 0.3s' }}>
                {g.num}
              </div>
            ))}
          </div>

          {GROUNDING.slice(0, groundingStep + 1).map((g, i) => (
            <div key={i} style={{ background: i === groundingStep ? C.trueBlue : C.white, borderRadius: 16, padding: 20, marginBottom: 12, transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ fontSize: 36 }}>{g.sense.split(' ')[0]}</span>
                <div>
                  <p style={{ color: i === groundingStep ? C.white : C.blackRobe, fontSize: 14, margin: '0 0 4px', fontWeight: i === groundingStep ? 600 : 400 }}>{g.what}</p>
                  {i === groundingStep && (
                    <p style={{ color: C.white, fontSize: 12, margin: 0, opacity: 0.8 }}>
                      Nomeie cada um mentalmente, sem julgamento.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {groundingStep < GROUNDING.length - 1 ? (
            <button onClick={() => setGroundingStep(s => s + 1)}
              style={{ width: '100%', background: C.trueBlue, color: C.white, border: 'none', padding: 15, borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
              Próximo →
            </button>
          ) : (
            <div>
              <div style={{ background: '#e8f5e9', borderRadius: 16, padding: 20, textAlign: 'center', marginTop: 8 }}>
                <p style={{ fontSize: 32, margin: '0 0 8px' }}>🌟</p>
                <h3 style={{ color: C.success, fontSize: 16, margin: '0 0 8px' }}>Muito bem!</h3>
                <p style={{ color: C.blackRobe, fontSize: 13, margin: 0, opacity: 0.8 }}>Você está presente. A fissura passa. Você consegue.</p>
              </div>
              <button onClick={() => { setGroundingStep(0); setMode('menu') }}
                style={{ width: '100%', background: C.white, border: '1px solid ' + C.blancDeBlanc, color: C.trueBlue, padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: 'pointer', marginTop: 12 }}>
                Recomeçar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
