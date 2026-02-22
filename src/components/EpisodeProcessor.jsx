import React, { useState } from 'react'
import { ESCAPE_REASONS } from '../data/constants'
import { supabase } from '../services/supabase'
const C = { trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff', blackRobe: '#2b2b2b', blancDeBlanc: '#e9e9ea', white: '#ffffff', success: '#28a068', warning: '#e8a040', danger: '#d04040' }
export default function EpisodeProcessor({ userId, onComplete, onCancel }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState({ before: '', escape_reasons: [], feelings_during: '', feelings_after: '', duration: '', amount: 0, learning: '' })
  const [saving, setSaving] = useState(false)
  const toggleReason = (id) => setData({ ...data, escape_reasons: data.escape_reasons.includes(id) ? data.escape_reasons.filter(r => r !== id) : [...data.escape_reasons, id] })
  const save = async () => {
    setSaving(true)
    try {
      await supabase.from('episodes').insert({ patient_id: userId, ...data, processed: true })
      await supabase.from('relapses').insert({ patient_id: userId, amount: data.amount || 0, notes: data.learning, date: new Date().toISOString() })
      if (onComplete) onComplete()
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSaving(false) }
  }
  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <button onClick={onCancel} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button>
      <h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 8, fontWeight: 600 }}>Processar Episódio</h1>
      <p style={{ color: C.blackRobe, opacity: 0.7, fontSize: 13, marginBottom: 20 }}>Isso não é uma falha. É uma oportunidade de aprendizado.</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>{[1, 2, 3, 4].map(s => <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? C.trueBlue : C.blancDeBlanc }} />)}</div>
      {step === 1 && (
        <div style={{ background: C.white, borderRadius: 14, padding: 20 }}>
          <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 12px', fontWeight: 600 }}>O que aconteceu antes?</h3>
          <textarea value={data.before} onChange={e => setData({ ...data, before: e.target.value })} placeholder="Descreva o contexto..." style={{ width: '100%', padding: 14, border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, minHeight: 100, resize: 'none', boxSizing: 'border-box', marginBottom: 16 }} />
          <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 12px', fontWeight: 600 }}>O que você estava evitando?</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ESCAPE_REASONS.map(r => (
              <button key={r.id} onClick={() => toggleReason(r.id)} style={{ background: data.escape_reasons.includes(r.id) ? C.alaskanBlue : C.blancDeBlanc, color: data.escape_reasons.includes(r.id) ? C.white : C.blackRobe, border: 'none', padding: '8px 12px', borderRadius: 16, fontSize: 12, cursor: 'pointer' }}>{r.icon} {r.label}</button>
            ))}
          </div>
          <button onClick={() => setStep(2)} style={{ width: '100%', marginTop: 20, background: C.trueBlue, color: C.white, border: 'none', padding: 14, borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Continuar →</button>
        </div>
      )}
      {step === 2 && (
        <div style={{ background: C.white, borderRadius: 14, padding: 20 }}>
          <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 12px', fontWeight: 600 }}>O que sentiu durante?</h3>
          <textarea value={data.feelings_during} onChange={e => setData({ ...data, feelings_during: e.target.value })} placeholder="Adrenalina, ansiedade, alívio temporário..." style={{ width: '100%', padding: 14, border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, minHeight: 80, resize: 'none', boxSizing: 'border-box', marginBottom: 16 }} />
          <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 12px', fontWeight: 600 }}>O que sentiu depois?</h3>
          <textarea value={data.feelings_after} onChange={e => setData({ ...data, feelings_after: e.target.value })} placeholder="Culpa, arrependimento, vazio..." style={{ width: '100%', padding: 14, border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, minHeight: 80, resize: 'none', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, background: C.blancDeBlanc, border: 'none', padding: 14, borderRadius: 10, cursor: 'pointer' }}>← Voltar</button>
            <button onClick={() => setStep(3)} style={{ flex: 1, background: C.trueBlue, color: C.white, border: 'none', padding: 14, borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Continuar →</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div style={{ background: C.white, borderRadius: 14, padding: 20 }}>
          <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 12px', fontWeight: 600 }}>Quanto tempo durou?</h3>
          <select value={data.duration} onChange={e => setData({ ...data, duration: e.target.value })} style={{ width: '100%', padding: 12, border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }}>
            <option value="">Selecione</option>
            <option value="menos_1h">Menos de 1 hora</option>
            <option value="1_3h">1 a 3 horas</option>
            <option value="3_6h">3 a 6 horas</option>
            <option value="mais_6h">Mais de 6 horas</option>
            <option value="varios_dias">Vários dias</option>
          </select>
          <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 12px', fontWeight: 600 }}>Quanto perdeu? (R$)</h3>
          <input type="number" value={data.amount} onChange={e => setData({ ...data, amount: parseFloat(e.target.value) || 0 })} placeholder="0" style={{ width: '100%', padding: 12, border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button onClick={() => setStep(2)} style={{ flex: 1, background: C.blancDeBlanc, border: 'none', padding: 14, borderRadius: 10, cursor: 'pointer' }}>← Voltar</button>
            <button onClick={() => setStep(4)} style={{ flex: 1, background: C.trueBlue, color: C.white, border: 'none', padding: 14, borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Continuar →</button>
          </div>
        </div>
      )}
      {step === 4 && (
        <div style={{ background: C.white, borderRadius: 14, padding: 20 }}>
          <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 12px', fontWeight: 600 }}>O que você aprendeu?</h3>
          <textarea value={data.learning} onChange={e => setData({ ...data, learning: e.target.value })} placeholder="O que pode fazer diferente na próxima vez?" style={{ width: '100%', padding: 14, border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, minHeight: 100, resize: 'none', boxSizing: 'border-box' }} />
          <div style={{ background: C.iceMelt, borderRadius: 10, padding: 14, marginTop: 16 }}>
            <p style={{ color: C.trueBlue, fontSize: 13, margin: 0 }}>💡 Este episódio será registrado como aprendizado, não como falha. Seu progresso continua.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button onClick={() => setStep(3)} style={{ flex: 1, background: C.blancDeBlanc, border: 'none', padding: 14, borderRadius: 10, cursor: 'pointer' }}>← Voltar</button>
            <button onClick={save} disabled={saving} style={{ flex: 1, background: C.success, color: C.white, border: 'none', padding: 14, borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Salvando...' : '✓ Finalizar'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
