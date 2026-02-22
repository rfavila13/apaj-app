import React, { useState } from 'react'
import { supabase } from '../services/supabase'
const C = { trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff', blackRobe: '#2b2b2b', blancDeBlanc: '#e9e9ea', white: '#ffffff', success: '#28a068', warning: '#e8a040', danger: '#d04040' }
export default function VaultManager({ userId, vault, onUpdate, onClose }) {
  const [showAdd, setShowAdd] = useState(false)
  const [type, setType] = useState('text')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const save = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      await supabase.from('evidence_vault').insert({ patient_id: userId, type, content, created_at: new Date().toISOString() })
      setContent(''); setShowAdd(false)
      if (onUpdate) onUpdate()
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSaving(false) }
  }
  const remove = async (id) => {
    if (!confirm('Remover esta evidência?')) return
    await supabase.from('evidence_vault').delete().eq('id', id)
    if (onUpdate) onUpdate()
  }
  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button>
      <h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 8, fontWeight: 600 }}>📦 Cofre de Evidências</h1>
      <p style={{ color: C.blackRobe, opacity: 0.7, fontSize: 13, marginBottom: 20 }}>Grave lembretes para você mesmo ver nos momentos de fissura.</p>
      {!showAdd ? (
        <button onClick={() => setShowAdd(true)} style={{ width: '100%', background: C.trueBlue, color: C.white, border: 'none', padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 20 }}>+ Adicionar ao Cofre</button>
      ) : (
        <div style={{ background: C.white, borderRadius: 14, padding: 18, marginBottom: 20 }}>
          <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 12px', fontWeight: 600 }}>Nova Evidência</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[{ id: 'text', label: '📝 Texto' }, { id: 'reminder', label: '💬 Lembrete' }].map(t => (
              <button key={t.id} onClick={() => setType(t.id)} style={{ flex: 1, background: type === t.id ? C.alaskanBlue : C.blancDeBlanc, color: type === t.id ? C.white : C.blackRobe, border: 'none', padding: '10px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>{t.label}</button>
            ))}
          </div>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={type === 'text' ? 'Escreva uma carta para você mesmo nos momentos difíceis...' : 'Ex: "Lembra quando você perdeu o dinheiro do aluguel?"'} style={{ width: '100%', padding: 14, border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, minHeight: 100, resize: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowAdd(false)} style={{ flex: 1, background: C.blancDeBlanc, border: 'none', padding: 12, borderRadius: 8, cursor: 'pointer' }}>Cancelar</button>
            <button onClick={save} disabled={saving || !content.trim()} style={{ flex: 1, background: C.trueBlue, color: C.white, border: 'none', padding: 12, borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>{saving ? '...' : 'Salvar'}</button>
          </div>
        </div>
      )}
      {(!vault || vault.length === 0) ? (
        <div style={{ background: C.white, borderRadius: 14, padding: 32, textAlign: 'center' }}>
          <span style={{ fontSize: 40 }}>📦</span>
          <p style={{ color: C.blackRobe, opacity: 0.6, marginTop: 12 }}>Seu cofre está vazio. Adicione lembretes para os momentos difíceis.</p>
        </div>
      ) : vault.map(v => (
        <div key={v.id} style={{ background: C.white, borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 11, color: C.alaskanBlue, fontWeight: 600 }}>{v.type === 'text' ? '📝 CARTA' : '💬 LEMBRETE'}</span>
              <p style={{ color: C.blackRobe, fontSize: 14, margin: '8px 0 0', lineHeight: 1.5 }}>{v.content}</p>
              <p style={{ color: C.blackRobe, opacity: 0.5, fontSize: 11, marginTop: 8 }}>{new Date(v.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
            <button onClick={() => remove(v.id)} style={{ background: 'none', border: 'none', color: C.blackRobe, opacity: 0.4, cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
      ))}
    </div>
  )
}
