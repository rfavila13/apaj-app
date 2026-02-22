import React, { useState, useEffect } from 'react'
import { APAJ_VIDEOS, PROTECTION_CHECKLIST } from '../data/constants'
import { supabase } from '../services/supabase'
const C = { trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff', blackRobe: '#2b2b2b', blancDeBlanc: '#e9e9ea', white: '#ffffff', success: '#28a068', warning: '#e8a040', danger: '#d04040' }
export default function FamilyPortal({ odisconnect }) {
  const [tab, setTab] = useState('learn')
  const [diary, setDiary] = useState([])
  const [entry, setEntry] = useState('')
  const [saving, setSaving] = useState(false)
  const familyId = 'family_' + Date.now() // Em produção, seria autenticado
  useEffect(() => { loadDiary() }, [])
  const loadDiary = async () => { const { data } = await supabase.from('family_diary').select('*').eq('family_id', familyId).order('created_at', { ascending: false }); if (data) setDiary(data) }
  const saveEntry = async () => {
    if (!entry.trim()) return; setSaving(true)
    try { await supabase.from('family_diary').insert({ family_id: familyId, content: entry }); setEntry(''); await loadDiary() }
    catch (e) { alert('Erro: ' + e.message) }
    finally { setSaving(false) }
  }
  const videos = APAJ_VIDEOS.filter(v => v.audience === 'familiar' || v.audience === 'ambos')
  return (
    <div style={{ minHeight: '100vh', background: C.iceMelt }}>
      <div style={{ background: C.trueBlue, padding: '20px 20px 60px', color: C.white, textAlign: 'center' }}>
        <img src="/logo-apaj.png" alt="APAJ" style={{ width: 80, filter: 'brightness(0) invert(1)', marginBottom: 12 }} />
        <h1 style={{ fontSize: 20, margin: 0 }}>Portal da Família</h1>
        <p style={{ opacity: 0.8, fontSize: 13, marginTop: 4 }}>Apoio para quem cuida</p>
      </div>
      <div style={{ margin: '-40px 16px 0', position: 'relative' }}>
        <div style={{ display: 'flex', background: C.white, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
          {[{ id: 'learn', label: '📚 Aprender' }, { id: 'diary', label: '📔 Meu Espaço' }, { id: 'protect', label: '🛡️ Proteção' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: tab === t.id ? C.trueBlue : C.white, color: tab === t.id ? C.white : C.blackRobe, border: 'none', padding: 14, fontSize: 12, cursor: 'pointer', fontWeight: tab === t.id ? 600 : 400 }}>{t.label}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: 16, paddingTop: 24 }}>
        {tab === 'learn' && (
          <div>
            <h2 style={{ color: C.trueBlue, fontSize: 16, margin: '0 0 16px' }}>Conteúdo para Familiares</h2>
            {videos.map(v => (
              <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: C.white, borderRadius: 12, padding: 14, marginBottom: 10, textDecoration: 'none' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 50, height: 50, background: C.iceMelt, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>▶️</div>
                  <div style={{ flex: 1 }}><h3 style={{ color: C.trueBlue, fontSize: 13, margin: '0 0 4px' }}>{v.title}</h3><p style={{ color: C.blackRobe, fontSize: 11, margin: 0, opacity: 0.6 }}>{v.author} • {v.duration}</p></div>
                </div>
              </a>
            ))}
            <div style={{ background: '#fff3e0', borderRadius: 12, padding: 16, marginTop: 16 }}>
              <h3 style={{ color: '#e65100', fontSize: 14, margin: '0 0 8px' }}>💡 Dica Importante</h3>
              <p style={{ color: C.blackRobe, fontSize: 13, margin: 0, lineHeight: 1.5 }}>Você não é responsável pela recuperação do seu familiar, mas pode criar um ambiente que facilite esse processo. Cuide de você também.</p>
            </div>
          </div>
        )}
        {tab === 'diary' && (
          <div>
            <h2 style={{ color: C.trueBlue, fontSize: 16, margin: '0 0 8px' }}>Meu Espaço Seguro</h2>
            <p style={{ color: C.blackRobe, opacity: 0.7, fontSize: 13, marginBottom: 16 }}>Este é um espaço privado para você processar suas emoções.</p>
            <div style={{ background: C.white, borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <textarea value={entry} onChange={e => setEntry(e.target.value)} placeholder="Como você está se sentindo hoje?" style={{ width: '100%', padding: 12, border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14, minHeight: 80, resize: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
              <button onClick={saveEntry} disabled={saving || !entry.trim()} style={{ width: '100%', background: C.trueBlue, color: C.white, border: 'none', padding: 12, borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>{saving ? '...' : 'Salvar'}</button>
            </div>
            {diary.map(d => (
              <div key={d.id} style={{ background: C.white, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <p style={{ color: C.blackRobe, fontSize: 13, margin: '0 0 8px', lineHeight: 1.5 }}>{d.content}</p>
                <p style={{ color: C.blackRobe, opacity: 0.5, fontSize: 11, margin: 0 }}>{new Date(d.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            ))}
          </div>
        )}
        {tab === 'protect' && (
          <div>
            <h2 style={{ color: C.trueBlue, fontSize: 16, margin: '0 0 8px' }}>Proteção Financeira</h2>
            <p style={{ color: C.blackRobe, opacity: 0.7, fontSize: 13, marginBottom: 16 }}>Medidas para proteger a família.</p>
            <div style={{ background: C.white, borderRadius: 12, padding: 16 }}>
              {PROTECTION_CHECKLIST.map(p => (
                <div key={p.id} style={{ padding: '12px 0', borderBottom: '1px solid ' + C.blancDeBlanc }}>
                  <p style={{ color: C.blackRobe, fontSize: 13, margin: 0 }}>{p.label}</p>
                </div>
              ))}
            </div>
            <div style={{ background: C.danger, borderRadius: 12, padding: 16, marginTop: 16, color: C.white }}>
              <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>⚠️ Sinais de Alerta</h3>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.6 }}>
                <li>Dinheiro sumindo sem explicação</li>
                <li>Mentiras sobre paradeiro</li>
                <li>Mudanças bruscas de humor</li>
                <li>Isolamento social</li>
                <li>Pedidos constantes de empréstimo</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
