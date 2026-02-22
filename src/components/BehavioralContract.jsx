import React, { useState } from 'react'
import { PROTECTION_CHECKLIST } from '../data/constants'
import { supabase } from '../services/supabase'
const C = { trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff', blackRobe: '#2b2b2b', blancDeBlanc: '#e9e9ea', white: '#ffffff', success: '#28a068', warning: '#e8a040' }
export default function BehavioralContract({ userId, contract, onUpdate, onClose }) {
  const [commitments, setCommitments] = useState(contract?.commitments || [])
  const [protection, setProtection] = useState(contract?.protection || [])
  const [newCommit, setNewCommit] = useState('')
  const [saving, setSaving] = useState(false)
  const addCommit = () => { if (newCommit.trim()) { setCommitments([...commitments, { text: newCommit, done: false }]); setNewCommit('') } }
  const toggleCommit = (i) => { const c = [...commitments]; c[i].done = !c[i].done; setCommitments(c) }
  const toggleProtection = (id) => setProtection(protection.includes(id) ? protection.filter(p => p !== id) : [...protection, id])
  const save = async () => {
    setSaving(true)
    try {
      const data = { patient_id: userId, commitments, protection, updated_at: new Date().toISOString() }
      if (contract?.id) await supabase.from('behavioral_contracts').update(data).eq('id', contract.id)
      else await supabase.from('behavioral_contracts').insert(data)
      if (onUpdate) onUpdate()
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSaving(false) }
  }
  const progress = commitments.length ? Math.round((commitments.filter(c => c.done).length / commitments.length) * 100) : 0
  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button>
      <h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 8, fontWeight: 600 }}>📋 Contrato Comportamental</h1>
      <p style={{ color: C.blackRobe, opacity: 0.7, fontSize: 13, marginBottom: 20 }}>Compromissos que você define para si mesmo.</p>
      {commitments.length > 0 && (
        <div style={{ background: C.trueBlue, borderRadius: 12, padding: 16, marginBottom: 20, color: C.white }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 13 }}>Adesão semanal</span><span style={{ fontWeight: 700 }}>{progress}%</span></div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 6, height: 8 }}><div style={{ background: C.white, height: '100%', width: `${progress}%`, borderRadius: 6 }} /></div>
        </div>
      )}
      <div style={{ background: C.white, borderRadius: 14, padding: 18, marginBottom: 16 }}>
        <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 14px', fontWeight: 600 }}>Meus Compromissos</h3>
        {commitments.map((c, i) => (
          <div key={i} onClick={() => toggleCommit(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid ' + C.blancDeBlanc, cursor: 'pointer' }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: c.done ? C.success : C.blancDeBlanc, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12 }}>{c.done ? '✓' : ''}</span>
            <span style={{ color: C.blackRobe, fontSize: 13, textDecoration: c.done ? 'line-through' : 'none', opacity: c.done ? 0.6 : 1 }}>{c.text}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <input value={newCommit} onChange={e => setNewCommit(e.target.value)} placeholder="Novo compromisso..." style={{ flex: 1, padding: 10, border: '1px solid ' + C.blancDeBlanc, borderRadius: 8, fontSize: 13 }} onKeyPress={e => e.key === 'Enter' && addCommit()} />
          <button onClick={addCommit} style={{ background: C.alaskanBlue, color: C.white, border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer' }}>+</button>
        </div>
      </div>
      <div style={{ background: C.white, borderRadius: 14, padding: 18, marginBottom: 20 }}>
        <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 14px', fontWeight: 600 }}>🛡️ Medidas de Proteção</h3>
        {PROTECTION_CHECKLIST.map(p => (
          <div key={p.id} onClick={() => toggleProtection(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid ' + C.blancDeBlanc, cursor: 'pointer' }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: protection.includes(p.id) ? C.success : C.blancDeBlanc, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white, fontSize: 12 }}>{protection.includes(p.id) ? '✓' : ''}</span>
            <span style={{ color: C.blackRobe, fontSize: 13 }}>{p.label}</span>
          </div>
        ))}
      </div>
      <button onClick={save} disabled={saving} style={{ width: '100%', background: C.trueBlue, color: C.white, border: 'none', padding: 14, borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>{saving ? 'Salvando...' : 'Salvar Contrato'}</button>
    </div>
  )
}
