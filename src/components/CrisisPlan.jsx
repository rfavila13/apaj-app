import React, { useState } from 'react'
import { supabase } from '../services/supabase'
const C = { trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff', blackRobe: '#2b2b2b', blancDeBlanc: '#e9e9ea', white: '#ffffff', success: '#28a068', warning: '#e8a040', danger: '#d04040' }
export default function CrisisPlan({ userId, plan, onUpdate, onClose, viewOnly }) {
  const [steps, setSteps] = useState(plan?.steps || [{ order: 1, action: '', contact: '' }])
  const [triggers, setTriggers] = useState(plan?.triggers || '')
  const [safeActivities, setSafeActivities] = useState(plan?.safe_activities || '')
  const [saving, setSaving] = useState(false)
  const addStep = () => setSteps([...steps, { order: steps.length + 1, action: '', contact: '' }])
  const updateStep = (i, field, value) => { const s = [...steps]; s[i][field] = value; setSteps(s) }
  const removeStep = (i) => setSteps(steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx + 1 })))
  const save = async () => {
    setSaving(true)
    try {
      const data = { patient_id: userId, steps, triggers, safe_activities: safeActivities, updated_at: new Date().toISOString() }
      if (plan?.id) await supabase.from('crisis_plans').update(data).eq('id', plan.id)
      else await supabase.from('crisis_plans').insert(data)
      if (onUpdate) onUpdate()
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSaving(false) }
  }
  if (viewOnly && plan) {
    return (
      <div style={{ padding: 20, paddingBottom: 100 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button>
        <h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 20, fontWeight: 600 }}>🚨 Meu Plano de Crise</h1>
        <div style={{ background: C.danger, borderRadius: 14, padding: 18, marginBottom: 16, color: C.white }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>Passos em Ordem:</h3>
          {steps.map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: C.white, color: C.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{s.order}</span>
                <div><p style={{ margin: 0, fontWeight: 600 }}>{s.action}</p>{s.contact && <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: 13 }}>📞 {s.contact}</p>}</div>
              </div>
            </div>
          ))}
        </div>
        {triggers && <div style={{ background: C.white, borderRadius: 14, padding: 16, marginBottom: 12 }}><h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 8px' }}>⚠️ Meus Gatilhos</h3><p style={{ color: C.blackRobe, margin: 0, fontSize: 13 }}>{triggers}</p></div>}
        {safeActivities && <div style={{ background: C.white, borderRadius: 14, padding: 16 }}><h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 8px' }}>✅ Atividades Seguras</h3><p style={{ color: C.blackRobe, margin: 0, fontSize: 13 }}>{safeActivities}</p></div>}
      </div>
    )
  }
  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button>
      <h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 8, fontWeight: 600 }}>🚨 Plano de Crise</h1>
      <p style={{ color: C.blackRobe, opacity: 0.7, fontSize: 13, marginBottom: 20 }}>Crie seu plano personalizado com ajuda do seu psicólogo.</p>
      <div style={{ background: C.white, borderRadius: 14, padding: 18, marginBottom: 16 }}>
        <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 14px', fontWeight: 600 }}>Passos de Emergência</h3>
        {steps.map((s, i) => (
          <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid ' + C.blancDeBlanc }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: C.trueBlue, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{s.order}</span>
              <input value={s.action} onChange={e => updateStep(i, 'action', e.target.value)} placeholder="O que fazer..." style={{ flex: 1, padding: 10, border: '1px solid ' + C.blancDeBlanc, borderRadius: 8, fontSize: 13 }} />
              {steps.length > 1 && <button onClick={() => removeStep(i)} style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer' }}>✕</button>}
            </div>
            <input value={s.contact} onChange={e => updateStep(i, 'contact', e.target.value)} placeholder="Contato (opcional)" style={{ width: '100%', padding: 10, border: '1px solid ' + C.blancDeBlanc, borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }} />
          </div>
        ))}
        <button onClick={addStep} style={{ width: '100%', background: C.iceMelt, color: C.trueBlue, border: 'none', padding: 12, borderRadius: 8, cursor: 'pointer' }}>+ Adicionar Passo</button>
      </div>
      <div style={{ background: C.white, borderRadius: 14, padding: 18, marginBottom: 16 }}>
        <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 10px', fontWeight: 600 }}>⚠️ Meus Gatilhos Conhecidos</h3>
        <textarea value={triggers} onChange={e => setTriggers(e.target.value)} placeholder="Liste situações que te levam a querer jogar..." style={{ width: '100%', padding: 12, border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 13, minHeight: 70, resize: 'none', boxSizing: 'border-box' }} />
      </div>
      <div style={{ background: C.white, borderRadius: 14, padding: 18, marginBottom: 20 }}>
        <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 10px', fontWeight: 600 }}>✅ Atividades Seguras</h3>
        <textarea value={safeActivities} onChange={e => setSafeActivities(e.target.value)} placeholder="Atividades que te ajudam a desviar o foco..." style={{ width: '100%', padding: 12, border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 13, minHeight: 70, resize: 'none', boxSizing: 'border-box' }} />
      </div>
      <button onClick={save} disabled={saving} style={{ width: '100%', background: C.trueBlue, color: C.white, border: 'none', padding: 14, borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Salvando...' : 'Salvar Plano'}</button>
    </div>
  )
}
