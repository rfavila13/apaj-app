import React, { useState } from 'react'
import { supabase } from '../services/supabase'

const C = { trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff', blackRobe: '#2b2b2b', blancDeBlanc: '#e9e9ea', white: '#ffffff', success: '#28a068', warning: '#e8a040' }

export default function GoalsTracker({ userId, savings, goals, onUpdate }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', target_amount: '', category: 'material', icon: '🎯' })
  const [saving, setSaving] = useState(false)

  const icons = ['🎯', '✈️', '🚗', '🏠', '📱', '💻', '🎓', '💳', '👶', '💍', '🏖️', '🎸']
  const categories = [
    { id: 'material', name: 'Bem Material' },
    { id: 'experiencia', name: 'Experiência' },
    { id: 'divida', name: 'Quitar Dívida' },
    { id: 'reserva', name: 'Reserva de Emergência' }
  ]

  const addGoal = async (e) => {
    e.preventDefault()
    if (!form.name || !form.target_amount) return
    setSaving(true)
    try {
      await supabase.from('patient_goals').insert({ patient_id: userId, name: form.name, target_amount: parseFloat(form.target_amount), category: form.category, icon: form.icon, is_completed: false })
      setShowForm(false)
      setForm({ name: '', target_amount: '', category: 'material', icon: '🎯' })
      if (onUpdate) onUpdate()
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSaving(false) }
  }

  const toggleComplete = async (goal) => {
    await supabase.from('patient_goals').update({ is_completed: !goal.is_completed }).eq('id', goal.id)
    if (onUpdate) onUpdate()
  }

  const deleteGoal = async (id) => {
    if (!confirm('Remover este objetivo?')) return
    await supabase.from('patient_goals').delete().eq('id', id)
    if (onUpdate) onUpdate()
  }

  const totalSaved = savings?.total || 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ color: C.trueBlue, fontSize: 18, margin: 0, fontWeight: 600 }}>Objetivos de Vida</h2>
        <button onClick={() => setShowForm(true)} style={{ background: C.trueBlue, color: C.white, border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>+ Novo</button>
      </div>

      {/* Resumo */}
      <div style={{ background: C.trueBlue, borderRadius: 14, padding: 16, marginBottom: 16, color: C.white }}>
        <p style={{ margin: '0 0 4px', opacity: 0.8, fontSize: 13 }}>Dinheiro que deixou de ser perdido</p>
        <p style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>R$ {totalSaved.toLocaleString('pt-BR')}</p>
      </div>

      {/* Lista de Objetivos */}
      {(!goals || goals.length === 0) ? (
        <div style={{ background: C.white, borderRadius: 14, padding: 32, textAlign: 'center' }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>🎯</span>
          <p style={{ color: C.blackRobe, opacity: 0.6, margin: 0 }}>Adicione objetivos para visualizar seu progresso</p>
        </div>
      ) : (
        goals.map(goal => {
          const progress = Math.min(100, (totalSaved / goal.target_amount) * 100)
          const remaining = Math.max(0, goal.target_amount - totalSaved)
          return (
            <div key={goal.id} style={{ background: C.white, borderRadius: 14, padding: 16, marginBottom: 12, opacity: goal.is_completed ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 28 }}>{goal.icon}</span>
                  <div>
                    <h3 style={{ color: C.trueBlue, margin: 0, fontSize: 15, fontWeight: 600, textDecoration: goal.is_completed ? 'line-through' : 'none' }}>{goal.name}</h3>
                    <p style={{ color: C.blackRobe, margin: '4px 0 0', fontSize: 12, opacity: 0.6 }}>{categories.find(c => c.id === goal.category)?.name}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => toggleComplete(goal)} style={{ background: goal.is_completed ? C.blancDeBlanc : C.success, color: goal.is_completed ? C.blackRobe : C.white, border: 'none', padding: '6px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>{goal.is_completed ? 'Reabrir' : '✓ Concluir'}</button>
                  <button onClick={() => deleteGoal(goal.id)} style={{ background: 'none', border: 'none', color: C.blackRobe, opacity: 0.4, cursor: 'pointer' }}>✕</button>
                </div>
              </div>
              
              {!goal.is_completed && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: C.blackRobe, opacity: 0.6 }}>R$ {totalSaved.toLocaleString('pt-BR')} / R$ {goal.target_amount.toLocaleString('pt-BR')}</span>
                    <span style={{ color: progress >= 100 ? C.success : C.trueBlue, fontWeight: 600 }}>{progress.toFixed(0)}%</span>
                  </div>
                  <div style={{ background: C.blancDeBlanc, borderRadius: 6, height: 10, overflow: 'hidden' }}>
                    <div style={{ background: progress >= 100 ? C.success : C.alaskanBlue, height: '100%', width: `${progress}%`, borderRadius: 6, transition: 'width 0.5s' }} />
                  </div>
                  {progress < 100 && (
                    <p style={{ color: C.blackRobe, opacity: 0.6, fontSize: 12, margin: '8px 0 0' }}>Faltam R$ {remaining.toLocaleString('pt-BR')}</p>
                  )}
                  {progress >= 100 && (
                    <p style={{ color: C.success, fontSize: 13, margin: '8px 0 0', fontWeight: 600 }}>🎉 Meta atingida! Você pode realizar este objetivo!</p>
                  )}
                </>
              )}
            </div>
          )
        })
      )}

      {/* Modal Form */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <form onSubmit={addGoal} style={{ background: C.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 360 }}>
            <h2 style={{ color: C.trueBlue, margin: '0 0 20px', fontSize: 18 }}>Novo Objetivo</h2>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: C.blackRobe, marginBottom: 6, fontSize: 13 }}>Ícone</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {icons.map(ic => (
                  <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })} style={{ width: 40, height: 40, border: form.icon === ic ? `2px solid ${C.trueBlue}` : '1px solid ' + C.blancDeBlanc, borderRadius: 10, background: form.icon === ic ? C.iceMelt : C.white, fontSize: 20, cursor: 'pointer' }}>{ic}</button>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: C.blackRobe, marginBottom: 6, fontSize: 13 }}>Nome do objetivo</label>
              <input type="text" placeholder="Ex: Viagem para o litoral" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: 12, border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: C.blackRobe, marginBottom: 6, fontSize: 13 }}>Valor necessário (R$)</label>
              <input type="number" placeholder="2000" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} style={{ width: '100%', padding: 12, border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: C.blackRobe, marginBottom: 6, fontSize: 13 }}>Categoria</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: 12, border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: 14, background: C.blancDeBlanc, border: 'none', borderRadius: 10, cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" disabled={saving} style={{ flex: 1, padding: 14, background: C.trueBlue, color: C.white, border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>{saving ? '...' : 'Criar'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
