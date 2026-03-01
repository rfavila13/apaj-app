import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const C = {
  trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff',
  blackRobe: '#2b2b2b', blancDeBlanc: '#e9e9ea', white: '#ffffff',
  success: '#28a068', warning: '#e8a040', danger: '#d04040'
}

const STORY_CATEGORIES = [
  { id: 'superacao', label: '🌟 Superação', desc: 'Como superei um momento difícil' },
  { id: 'familia', label: '👨‍👩‍👧 Família', desc: 'O impacto na minha família' },
  { id: 'financeiro', label: '💰 Financeiro', desc: 'Recuperação financeira' },
  { id: 'recomeço', label: '🌱 Recomeço', desc: 'Meu novo começo' },
  { id: 'motivacao', label: '💪 Motivação', desc: 'O que me mantém firme' }
]

export default function StoryWall({ userId, days, onClose }) {
  const [stories, setStories] = useState([])
  const [tab, setTab] = useState('wall')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [myReactions, setMyReactions] = useState(new Set())
  const [form, setForm] = useState({ title: '', content: '', category: '', milestone: '' })

  useEffect(() => { loadStories(); loadMyReactions() }, [])

  const loadStories = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('recovery_stories')
      .select('*')
      .eq('approved', true)
      .order('lights_count', { ascending: false })
      .limit(30)
    if (data) setStories(data)
    setLoading(false)
  }

  const loadMyReactions = async () => {
    const { data } = await supabase
      .from('story_reactions')
      .select('story_id')
      .eq('patient_id', userId)
    if (data) setMyReactions(new Set(data.map(r => r.story_id)))
  }

  const submitStory = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim() || !form.category) {
      alert('Preencha título, categoria e história')
      return
    }
    setSubmitting(true)
    try {
      await supabase.from('recovery_stories').insert({
        patient_id: userId,
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category,
        milestone_days: days || parseInt(form.milestone) || 0,
        approved: false,
        lights_count: 0
      })
      setForm({ title: '', content: '', category: '', milestone: '' })
      setTab('wall')
      alert('Sua história foi enviada para revisão pela equipe APAJ. Obrigado por compartilhar! 💙')
    } catch (err) {
      alert('Erro ao enviar: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const sendLight = async (storyId) => {
    if (myReactions.has(storyId)) return
    try {
      await supabase.from('story_reactions').insert({ story_id: storyId, patient_id: userId })
      await supabase.rpc('increment_story_lights', { story_id: storyId })
      setMyReactions(prev => new Set([...prev, storyId]))
      setStories(prev => prev.map(s => s.id === storyId ? { ...s, lights_count: (s.lights_count || 0) + 1 } : s))
    } catch {
      // fallback se RPC não existe: update direto
      const story = stories.find(s => s.id === storyId)
      if (story) {
        await supabase.from('recovery_stories').update({ lights_count: (story.lights_count || 0) + 1 }).eq('id', storyId)
        setMyReactions(prev => new Set([...prev, storyId]))
        setStories(prev => prev.map(s => s.id === storyId ? { ...s, lights_count: (s.lights_count || 0) + 1 } : s))
      }
    }
  }

  const getCategoryLabel = (id) => STORY_CATEGORIES.find(c => c.id === id)?.label || '📖'
  const getMilestoneLabel = (d) => {
    if (!d) return null
    if (d >= 365) return `${Math.floor(d / 365)} ano(s)`
    if (d >= 30) return `${Math.floor(d / 30)} mês(es)`
    return `${d} dias`
  }

  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button>
      <h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 4, fontWeight: 600 }}>📖 Histórias de Superação</h1>
      <p style={{ color: C.blackRobe, opacity: 0.7, fontSize: 13, marginBottom: 20 }}>Histórias anônimas de quem está nessa jornada.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[{ id: 'wall', label: '📖 Histórias' }, { id: 'share', label: '✍️ Compartilhar' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, background: tab === t.id ? C.trueBlue : C.white, color: tab === t.id ? C.white : C.blackRobe, border: 'none', padding: 12, borderRadius: 10, fontSize: 13, cursor: 'pointer', fontWeight: tab === t.id ? 600 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'wall' && (
        <div>
          <div style={{ background: C.iceMelt, borderRadius: 12, padding: 12, marginBottom: 16, textAlign: 'center' }}>
            <p style={{ color: C.trueBlue, fontSize: 12, margin: 0 }}>
              Histórias revisadas pela equipe APAJ. Identidades 100% protegidas.
            </p>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><p style={{ color: C.trueBlue }}>Carregando histórias...</p></div>
          ) : stories.length === 0 ? (
            <div style={{ background: C.white, borderRadius: 14, padding: 32, textAlign: 'center' }}>
              <p style={{ fontSize: 40, margin: '0 0 12px' }}>📖</p>
              <p style={{ color: C.blackRobe, opacity: 0.6, fontSize: 14 }}>Nenhuma história ainda.</p>
              <p style={{ color: C.blackRobe, opacity: 0.5, fontSize: 12 }}>Seja o(a) primeiro(a) a compartilhar!</p>
              <button onClick={() => setTab('share')}
                style={{ marginTop: 16, background: C.trueBlue, color: C.white, border: 'none', padding: '10px 24px', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                Compartilhar minha história
              </button>
            </div>
          ) : stories.map(story => (
            <div key={story.id} style={{ background: C.white, borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <span style={{ background: C.iceMelt, color: C.trueBlue, padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500 }}>
                    {getCategoryLabel(story.category)}
                  </span>
                  {story.milestone_days > 0 && (
                    <span style={{ background: '#e8f5e9', color: C.success, padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500, marginLeft: 6 }}>
                      {getMilestoneLabel(story.milestone_days)} de recuperação
                    </span>
                  )}
                </div>
                <span style={{ color: C.blackRobe, opacity: 0.4, fontSize: 10 }}>
                  {new Date(story.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 10px', fontWeight: 600, lineHeight: 1.3 }}>{story.title}</h3>
              <p style={{ color: C.blackRobe, fontSize: 13, lineHeight: 1.6, margin: '0 0 14px', opacity: 0.85 }}>
                {story.content.slice(0, 300)}{story.content.length > 300 ? '...' : ''}
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => sendLight(story.id)} disabled={myReactions.has(story.id)}
                  style={{
                    background: myReactions.has(story.id) ? '#e3f2fd' : C.alaskanBlue,
                    color: myReactions.has(story.id) ? C.alaskanBlue : C.white,
                    border: 'none', padding: '8px 16px', borderRadius: 20,
                    fontSize: 13, fontWeight: 600, cursor: myReactions.has(story.id) ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                  }}>
                  💙 {myReactions.has(story.id) ? 'Luz enviada' : 'Enviar Luz'} · {story.lights_count || 0}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'share' && (
        <div>
          <div style={{ background: '#e8f5e9', borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <p style={{ color: C.success, fontSize: 13, margin: 0, lineHeight: 1.5 }}>
              ✅ Sua história será anônima. A equipe APAJ revisa antes de publicar para garantir que está segura para a comunidade.
            </p>
          </div>
          <form onSubmit={submitStory}>
            <div style={{ background: C.white, borderRadius: 14, padding: 18, marginBottom: 12 }}>
              <label style={{ display: 'block', color: C.blackRobe, fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Categoria *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                {STORY_CATEGORIES.map(cat => (
                  <button key={cat.id} type="button" onClick={() => setForm({ ...form, category: cat.id })}
                    style={{ background: form.category === cat.id ? C.trueBlue : C.blancDeBlanc, color: form.category === cat.id ? C.white : C.blackRobe, border: 'none', padding: '8px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontWeight: form.category === cat.id ? 600 : 400 }}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: C.white, borderRadius: 14, padding: 18, marginBottom: 12 }}>
              <label style={{ display: 'block', color: C.blackRobe, fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Título da sua história *</label>
              <input
                type="text" maxLength={100}
                placeholder="Ex: Como recuperei minha família"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ background: C.white, borderRadius: 14, padding: 18, marginBottom: 12 }}>
              <label style={{ display: 'block', color: C.blackRobe, fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Sua história * (mín. 100 caracteres)</label>
              <textarea
                placeholder="Compartilhe o que te ajudou, o que você superou, como está hoje... Sua experiência pode ser a luz que outra pessoa precisa."
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                style={{ width: '100%', padding: 14, border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 13, minHeight: 140, resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
              />
              <p style={{ color: C.blackRobe, opacity: 0.4, fontSize: 11, margin: '6px 0 0', textAlign: 'right' }}>{form.content.length} caracteres</p>
            </div>
            <button
              type="submit"
              disabled={submitting || !form.title.trim() || form.content.length < 100 || !form.category}
              style={{ width: '100%', background: submitting || !form.title.trim() || form.content.length < 100 || !form.category ? C.blancDeBlanc : C.trueBlue, color: C.white, border: 'none', padding: 15, borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              {submitting ? 'Enviando...' : '📖 Enviar para Revisão'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
