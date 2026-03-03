import React, { useState } from 'react'
import { APAJ_VIDEOS, OPERADORAS_AUTOEXCLUSAO, APAJ_PIX } from '../data/constants'

const C = { trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff', blackRobe: '#2b2b2b', blancDeBlanc: '#e9e9ea', white: '#ffffff', success: '#28a068', warning: '#e8a040', danger: '#d04040' }

export function VideoFeed({ suggestedVideo, category }) {
  const [filter, setFilter] = useState(category || 'todos')
  const categories = ['todos', 'crise', 'financeiro', 'emocional', 'relacionamentos', 'prático']
  
  const filtered = filter === 'todos' ? APAJ_VIDEOS : APAJ_VIDEOS.filter(v => v.category === filter || v.tags.some(t => t.includes(filter)))

  return (
    <div>
      <h2 style={{ color: C.trueBlue, fontSize: 18, margin: '0 0 16px', fontWeight: 600 }}>📚 Pílulas de Conhecimento</h2>
      
      {suggestedVideo && (
        <div style={{ background: C.warning + '20', border: '2px solid ' + C.warning, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <p style={{ color: C.warning, fontSize: 12, margin: '0 0 8px', fontWeight: 600 }}>⚠️ RECOMENDADO PARA VOCÊ</p>
          <VideoCard video={suggestedVideo} highlight />
        </div>
      )}
      
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{ background: filter === c ? C.trueBlue : C.blancDeBlanc, color: filter === c ? C.white : C.blackRobe, border: 'none', padding: '8px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</button>
        ))}
      </div>
      
      {filtered.map(v => <VideoCard key={v.id} video={v} />)}
    </div>
  )
}

function VideoCard({ video, highlight }) {
  const available = video.url && video.url !== '#'
  const inner = (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ width: 60, height: 60, background: available ? C.iceMelt : C.blancDeBlanc, borderRadius: 10, display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center', fontSize: available ? 24 : 16, color: available ? 'inherit' : '#aaa' }}>
        {available ? '▶️' : <><span>🎬</span><span style={{ fontSize: 8, marginTop: 2 }}>em breve</span></>}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 4px', fontWeight: 600 }}>{video.title}</h3>
        <p style={{ color: C.blackRobe, fontSize: 12, margin: '0 0 6px', opacity: 0.6 }}>{video.author} • {video.duration}</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {video.tags.slice(0, 2).map(t => <span key={t} style={{ background: C.iceMelt, color: C.trueBlue, padding: '2px 8px', borderRadius: 10, fontSize: 10 }}>{t}</span>)}
          {!available && <span style={{ background: '#fff3e0', color: C.warning, padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>Em produção</span>}
        </div>
      </div>
    </div>
  )
  if (!available) return <div style={{ background: C.white, borderRadius: 12, padding: 14, marginBottom: 10, opacity: 0.75 }}>{inner}</div>
  return (
    <a href={video.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', background: C.white, borderRadius: 12, padding: 14, marginBottom: 10, textDecoration: 'none', boxShadow: highlight ? '0 2px 12px rgba(232,160,64,0.3)' : 'none' }}>
      {inner}
    </a>
  )
}

export function AutoexclusaoCentral() {
  const [copied, setCopied] = useState(null)
  
  const copyLink = (url, name) => {
    navigator.clipboard.writeText(url)
    setCopied(name)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div>
      <h2 style={{ color: C.trueBlue, fontSize: 18, margin: '0 0 8px', fontWeight: 600 }}>🛡️ Central de Autoexclusão</h2>
      <p style={{ color: C.blackRobe, opacity: 0.7, fontSize: 13, margin: '0 0 16px' }}>Bloqueie seu acesso às plataformas de apostas</p>
      
      {OPERADORAS_AUTOEXCLUSAO.sort((a, b) => a.priority - b.priority).map((op, i) => (
        <div key={i} style={{ background: op.official ? C.trueBlue : C.white, borderRadius: 12, padding: 14, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: op.official ? C.white : C.trueBlue, fontSize: 14, margin: 0, fontWeight: 600 }}>{op.name}</h3>
            {op.official && <p style={{ color: C.white, opacity: 0.8, fontSize: 11, margin: '4px 0 0' }}>Sistema Oficial do Governo</p>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => copyLink(op.url, op.name)} style={{ background: op.official ? 'rgba(255,255,255,0.2)' : C.blancDeBlanc, border: 'none', padding: '8px 12px', borderRadius: 8, color: op.official ? C.white : C.blackRobe, fontSize: 12, cursor: 'pointer' }}>{copied === op.name ? '✓ Copiado' : '📋'}</button>
            <a href={op.url} target="_blank" rel="noopener noreferrer" style={{ background: op.official ? C.white : C.trueBlue, color: op.official ? C.trueBlue : C.white, textDecoration: 'none', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Acessar →</a>
          </div>
        </div>
      ))}
    </div>
  )
}

export function DoacaoAPAJ({ savings, milestone }) {
  const [copied, setCopied] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  const copyPix = () => {
    navigator.clipboard.writeText(APAJ_PIX.chave)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }
  
  const suggestedDonation = milestone ? Math.floor(savings * 0.01) : null

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, #1d3f77 0%, #66aae2 100%)', borderRadius: 16, padding: 20, color: C.white }}>
        <h2 style={{ fontSize: 16, margin: '0 0 8px', fontWeight: 600 }}>💙 Apoie a APAJ</h2>
        <p style={{ fontSize: 13, opacity: 0.9, margin: '0 0 16px' }}>Sua contribuição ajuda outras pessoas em recuperação</p>
        
        {suggestedDonation && suggestedDonation > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: 12, borderRadius: 10, marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>Você economizou R$ {savings.toLocaleString('pt-BR')}!</p>
            <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600 }}>Que tal doar 1%? R$ {suggestedDonation.toLocaleString('pt-BR')}</p>
          </div>
        )}
        
        <button onClick={() => setShowModal(true)} style={{ width: '100%', background: C.white, color: C.trueBlue, border: 'none', padding: 14, borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Doar via PIX</button>
      </div>
      
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: C.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 340, textAlign: 'center' }}>
            <h2 style={{ color: C.trueBlue, margin: '0 0 16px' }}>Doação PIX</h2>
            <div style={{ background: C.iceMelt, padding: 16, borderRadius: 12, marginBottom: 16 }}>
              <p style={{ color: C.blackRobe, fontSize: 12, margin: '0 0 8px', opacity: 0.6 }}>Chave PIX (E-mail)</p>
              <p style={{ color: C.trueBlue, fontSize: 16, margin: 0, fontWeight: 600, wordBreak: 'break-all' }}>{APAJ_PIX.chave}</p>
            </div>
            <p style={{ color: C.blackRobe, fontSize: 13, margin: '0 0 16px', opacity: 0.7 }}>{APAJ_PIX.nome}</p>
            <button onClick={copyPix} style={{ width: '100%', background: copied ? C.success : C.trueBlue, color: C.white, border: 'none', padding: 14, borderRadius: 10, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>{copied ? '✓ Chave Copiada!' : '📋 Copiar Chave PIX'}</button>
            <button onClick={() => setShowModal(false)} style={{ width: '100%', background: C.blancDeBlanc, color: C.blackRobe, border: 'none', padding: 14, borderRadius: 10, cursor: 'pointer' }}>Fechar</button>
          </div>
        </div>
      )}
    </>
  )
}
