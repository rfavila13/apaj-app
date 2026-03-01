import React, { useState } from 'react'

const C = {
  trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff',
  blackRobe: '#2b2b2b', blancDeBlanc: '#e9e9ea', white: '#ffffff',
  success: '#28a068', warning: '#e8a040', danger: '#d04040'
}

const BOOKS = [
  { id: 'b1', emoji: '🧠', title: 'Nação Dopamina', author: 'Anna Lembke', desc: 'Neurocientista de Stanford explica a ciência da dependência e como encontrar equilíbrio na era do excesso compulsivo.', tag: 'Neurociência', level: 'Essencial' },
  { id: 'b2', emoji: '⚛️', title: 'Hábitos Atômicos', author: 'James Clear', desc: 'Como pequenas mudanças produzem resultados extraordinários. Fundamental para substituir comportamentos compulsivos.', tag: 'Comportamento', level: 'Iniciante' },
  { id: 'b3', emoji: '💡', title: 'O Poder do Hábito', author: 'Charles Duhigg', desc: 'Entenda o ciclo gatilho-rotina-recompensa que sustenta qualquer vício e aprenda a reprogramá-lo.', tag: 'Comportamento', level: 'Iniciante' },
  { id: 'b4', emoji: '🌱', title: 'Em Busca de Sentido', author: 'Viktor Frankl', desc: 'Como encontrar propósito mesmo nas situações mais difíceis. Transformador para a jornada de recuperação.', tag: 'Psicologia', level: 'Todos' },
  { id: 'b5', emoji: '🤝', title: 'Conexões Perdidas', author: 'Johann Hari', desc: 'Por que dependências surgem de desconexão social e como reconectar-se é parte essencial da cura.', tag: 'Saúde Mental', level: 'Intermediário' },
  { id: 'b6', emoji: '💰', title: 'Me Poupe!', author: 'Nathalia Arcuri', desc: 'Guia prático para organizar finanças e sair das dívidas. Fundamental para a reconstrução financeira pós-jogo.', tag: 'Financeiro', level: 'Iniciante' },
  { id: 'b7', emoji: '🔥', title: 'A Vontade de Vencer', author: 'Kelly McGonigal', desc: 'Como a força de vontade funciona e como usá-la melhor. Baseado em pesquisas da Universidade Stanford.', tag: 'Autoconhecimento', level: 'Intermediário' },
  { id: 'b8', emoji: '🌊', title: 'Prevenção de Recaída', author: 'G. Alan Marlatt', desc: 'Técnicas de prevenção de recaída baseadas em mindfulness. Manual clínico adaptado para o público geral.', tag: 'Recuperação', level: 'Avançado' },
  { id: 'b9', emoji: '🏔️', title: 'O Homem que Calculava', author: 'Malba Tahan', desc: 'Reflexão sobre riscos, probabilidade e ilusão do controle — conceitos centrais no pensamento do jogador.', tag: 'Reflexão', level: 'Todos' },
  { id: 'b10', emoji: '🛤️', title: 'Os 12 Passos dos JA', author: 'Jogadores Anônimos', desc: 'O programa de recuperação de 12 passos adaptado para jogadores compulsivos. Base do tratamento dos JA.', tag: 'Recuperação', level: 'Essencial' },
]

const PODCASTS = [
  { id: 'p1', emoji: '🎙️', title: 'CBN Saúde', host: 'CBN', desc: 'Discussões semanais sobre saúde mental, comportamento e bem-estar com especialistas brasileiros.', freq: 'Semanal', plat: 'Spotify / CBN' },
  { id: 'p2', emoji: '🧘', title: 'Meditação Guiada em Português', host: 'Minutos Psíquicos', desc: 'Sessões guiadas de mindfulness em português para reduzir ansiedade e fissura no momento crítico.', freq: 'Diário', plat: 'Spotify' },
  { id: 'p3', emoji: '💬', title: 'Psicologia na Prática', host: 'CRP-SP', desc: 'Conteúdo educativo sobre saúde mental produzido por psicólogos do Conselho Regional de Psicologia.', freq: 'Quinzenal', plat: 'Spotify / Apple Podcasts' },
  { id: 'p4', emoji: '💸', title: 'Dinheiro Sem Tabu', host: 'Me Poupe!', desc: 'Como sair das dívidas, reorganizar as finanças e construir uma vida financeira saudável do zero.', freq: 'Semanal', plat: 'Spotify' },
  { id: 'p5', emoji: '🌿', title: 'Mente em Foco', host: 'Drauzio Varella', desc: 'Saúde mental, compulsões e estratégias práticas para lidar com vícios comportamentais.', freq: 'Semanal', plat: 'Spotify / Globoplay' },
  { id: 'p6', emoji: '🎧', title: 'Vício em Jogo — Série Especial', host: 'Rádio BandNews', desc: 'Série jornalística sobre o crescimento do jogo patológico no Brasil e histórias reais de recuperação.', freq: 'Série completa', plat: 'Spotify' },
]

const ARTICLES = [
  { id: 'a1', emoji: '📋', title: 'O que é o Jogo Patológico?', src: 'CFP - Conselho Federal de Psicologia', desc: 'Definição clínica, critérios diagnósticos e diferença entre jogo recreativo e patológico segundo o DSM-5 e CID-11.', time: '8 min', tags: ['Diagnóstico', 'CID-11'] },
  { id: 'a2', emoji: '🧪', title: 'TCC para Dependência de Jogos', src: 'Associação Brasileira de Psiquiatria', desc: 'Como a Terapia Cognitivo-Comportamental é aplicada no tratamento do jogo patológico no Brasil.', time: '12 min', tags: ['TCC', 'Tratamento'] },
  { id: 'a3', emoji: '👨‍👩‍👧', title: 'Como a Família Pode Ajudar', src: 'Jogadores Anônimos Brasil', desc: 'Guia prático para familiares de jogadores compulsivos: o que fazer, o que evitar e como buscar apoio.', time: '10 min', tags: ['Família', 'Suporte'] },
  { id: 'a4', emoji: '🏥', title: 'Tratamento Gratuito pelo SUS', src: 'Ministério da Saúde', desc: 'Como acessar tratamento para dependência de jogos através do SUS e dos CAPS AD em todo o Brasil.', time: '6 min', tags: ['SUS', 'CAPS', 'Gratuito'] },
  { id: 'a5', emoji: '💊', title: 'Medicamentos no Tratamento', src: 'Revista Psiquiatria Clínica USP', desc: 'Evidências sobre o uso de naltrexona e outros medicamentos no tratamento do jogo patológico.', time: '15 min', tags: ['Medicação', 'Psiquiatria'] },
  { id: 'a6', emoji: '💰', title: 'Recuperação Financeira Após o Jogo', src: 'Serasa / ANBC', desc: 'Passo a passo para reorganizar dívidas, negociar com credores e reconstruir sua saúde financeira.', time: '10 min', tags: ['Finanças', 'Dívidas'] },
  { id: 'a7', emoji: '📱', title: 'Bets Online: Riscos e Regulação', src: 'SENACON / Ministério da Justiça', desc: 'O que a lei brasileira diz sobre apostas esportivas, seus riscos e como o consumidor pode se proteger.', time: '8 min', tags: ['Lei', 'Bets', 'Regulação'] },
  { id: 'a8', emoji: '🧠', title: 'Mindfulness na Recuperação', src: 'UNIFESP - Psiquiatria', desc: 'Como práticas de atenção plena reduzem a fissura e previnem recaídas em jogadores compulsivos.', time: '9 min', tags: ['Mindfulness', 'Prevenção'] },
  { id: 'a9', emoji: '🌙', title: 'Sono e Controle de Impulsos', src: 'Instituto do Sono', desc: 'Como a privação de sono aumenta a impulsividade e o risco de recaída. Estratégias para dormir melhor.', time: '7 min', tags: ['Sono', 'Neurociência'] },
  { id: 'a10', emoji: '🤔', title: 'Falácias do Jogador', src: 'UFMG - Laboratório de Decisão', desc: 'Os erros cognitivos que mantêm o jogador na ilusão do controle: falácia do apostador, ilusão de controle e mais.', time: '11 min', tags: ['Cognição', 'Educação'] },
]

const VIDEOS = [
  { id: 'v1', emoji: '🎬', title: 'Jogo Patológico — O que é e como tratar', ch: 'Psiquiatria Fácil', desc: 'Psiquiatra explica causas neurobiológicas, critérios diagnósticos e tratamentos disponíveis no Brasil.', dur: '22 min', type: 'Educativo' },
  { id: 'v2', emoji: '📺', title: 'Depoimento: 5 Anos Sem Jogar', ch: 'Jogadores Anônimos Brasil', desc: 'Relato real de recuperação de um jogador compulsivo que encontrou ajuda e reconstruiu sua vida.', dur: '35 min', type: 'Depoimento' },
  { id: 'v3', emoji: '🎥', title: 'A Ciência da Dependência', ch: 'TED em Português', desc: 'Neurocientista explica como vícios funcionam no cérebro e por que certas pessoas são mais vulneráveis.', dur: '18 min', type: 'TED Talk' },
  { id: 'v4', emoji: '📹', title: 'Meditação para Momento de Fissura', ch: 'Mente Sã', desc: 'Exercício guiado de 10 minutos para quando a vontade de jogar aparecer. Técnica baseada em mindfulness.', dur: '10 min', type: 'Prático' },
  { id: 'v5', emoji: '🌟', title: 'Como Acessar o CAPS pelo SUS', ch: 'Ministério da Saúde', desc: 'Passo a passo para buscar tratamento gratuito nos Centros de Atenção Psicossocial da sua cidade.', dur: '8 min', type: 'Tutorial' },
  { id: 'v6', emoji: '💰', title: 'Como Sair das Dívidas do Jogo', ch: 'Nathalia Arcuri', desc: 'Estratégia prática para reorganizar as finanças, priorizar dívidas e recomeçar financeiramente.', dur: '28 min', type: 'Financeiro' },
  { id: 'v7', emoji: '🧘', title: 'Técnica de Respiração 4-7-8', ch: 'Instituto de Mindfulness', desc: 'Aprenda a técnica respiratória que reduz ansiedade em minutos. Cientificamente validada contra compulsões.', dur: '12 min', type: 'Prático' },
]

const TABS = [
  { id: 'books', label: '📚 Livros', count: BOOKS.length },
  { id: 'podcasts', label: '🎙️ Podcasts', count: PODCASTS.length },
  { id: 'articles', label: '📰 Artigos', count: ARTICLES.length },
  { id: 'videos', label: '🎬 Vídeos', count: VIDEOS.length },
]

export default function ResourceLibrary({ onClose }) {
  const [tab, setTab] = useState('books')
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem('apaj_saved') || '{}') } catch { return {} }
  })
  const [filter, setFilter] = useState('')

  const toggleSave = (id) => {
    const next = { ...saved, [id]: !saved[id] }
    setSaved(next)
    localStorage.setItem('apaj_saved', JSON.stringify(next))
  }

  const card = { background: C.white, borderRadius: 16, padding: 18, marginBottom: 14, position: 'relative' }
  const tagStyle = (color) => ({ background: color + '22', color, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600 })

  const SaveBtn = ({ id }) => (
    <button onClick={() => toggleSave(id)} style={{ position: 'absolute', top: 14, right: 14, background: saved[id] ? '#fff9e6' : C.blancDeBlanc, border: 'none', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', fontSize: 14 }}>
      {saved[id] ? '🔖' : '📌'}
    </button>
  )

  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 12, fontWeight: 500 }}>← Voltar</button>
      <h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 4, fontWeight: 700 }}>📚 Biblioteca de Recursos</h1>
      <p style={{ color: C.blackRobe, opacity: 0.6, fontSize: 13, marginBottom: 16 }}>Curadoria de conteúdo especializado em recuperação do jogo patológico.</p>

      <input
        placeholder="Buscar conteúdo..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        style={{ width: '100%', padding: '10px 14px', border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 13, marginBottom: 16, boxSizing: 'border-box' }}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? C.trueBlue : C.white, color: tab === t.id ? C.white : C.blackRobe, border: 'none', padding: '10px 14px', borderRadius: 10, fontSize: 12, cursor: 'pointer', fontWeight: tab === t.id ? 600 : 400, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {t.label} <span style={{ opacity: 0.7 }}>({t.count})</span>
          </button>
        ))}
      </div>

      {tab === 'books' && BOOKS.filter(b => !filter || b.title.toLowerCase().includes(filter.toLowerCase()) || b.author.toLowerCase().includes(filter.toLowerCase())).map(b => (
        <div key={b.id} style={card}>
          <SaveBtn id={b.id} />
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', paddingRight: 36 }}>
            <span style={{ fontSize: 38, flexShrink: 0 }}>{b.emoji}</span>
            <div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={tagStyle(C.trueBlue)}>{b.tag}</span>
                <span style={tagStyle(b.level === 'Essencial' ? C.danger : b.level === 'Avançado' ? C.warning : C.success)}>{b.level}</span>
              </div>
              <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 4px', fontWeight: 700 }}>{b.title}</h3>
              <p style={{ color: C.blackRobe, fontSize: 11, margin: '0 0 8px', opacity: 0.6, fontStyle: 'italic' }}>por {b.author}</p>
              <p style={{ color: C.blackRobe, fontSize: 12, margin: 0, lineHeight: 1.5, opacity: 0.8 }}>{b.desc}</p>
            </div>
          </div>
        </div>
      ))}

      {tab === 'podcasts' && PODCASTS.filter(p => !filter || p.title.toLowerCase().includes(filter.toLowerCase())).map(p => (
        <div key={p.id} style={card}>
          <SaveBtn id={p.id} />
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', paddingRight: 36 }}>
            <span style={{ fontSize: 38, flexShrink: 0 }}>{p.emoji}</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 2px', fontWeight: 700 }}>{p.title}</h3>
              <p style={{ color: C.blackRobe, fontSize: 11, margin: '0 0 8px', opacity: 0.6 }}>por {p.host}</p>
              <p style={{ color: C.blackRobe, fontSize: 12, margin: '0 0 10px', lineHeight: 1.5, opacity: 0.8 }}>{p.desc}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={tagStyle(C.trueBlue)}>{p.freq}</span>
                <span style={tagStyle(C.success)}>{p.plat}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {tab === 'articles' && ARTICLES.filter(a => !filter || a.title.toLowerCase().includes(filter.toLowerCase())).map(a => (
        <div key={a.id} style={card}>
          <SaveBtn id={a.id} />
          <div style={{ paddingRight: 36 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>{a.emoji}</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {a.tags.map(t => <span key={t} style={tagStyle(C.alaskanBlue)}>{t}</span>)}
                <span style={tagStyle(C.success)}>⏱ {a.time}</span>
              </div>
            </div>
            <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 4px', fontWeight: 700 }}>{a.title}</h3>
            <p style={{ color: C.blackRobe, fontSize: 11, margin: '0 0 8px', opacity: 0.55, fontStyle: 'italic' }}>{a.src}</p>
            <p style={{ color: C.blackRobe, fontSize: 12, margin: 0, lineHeight: 1.5, opacity: 0.8 }}>{a.desc}</p>
          </div>
        </div>
      ))}

      {tab === 'videos' && VIDEOS.filter(v => !filter || v.title.toLowerCase().includes(filter.toLowerCase())).map(v => (
        <div key={v.id} style={card}>
          <SaveBtn id={v.id} />
          <div style={{ paddingRight: 36 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 28 }}>{v.emoji}</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={tagStyle(C.danger)}>{v.type}</span>
                <span style={tagStyle(C.success)}>▶ {v.dur}</span>
              </div>
            </div>
            <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 2px', fontWeight: 700 }}>{v.title}</h3>
            <p style={{ color: C.blackRobe, fontSize: 11, margin: '0 0 8px', opacity: 0.55, fontStyle: 'italic' }}>{v.ch}</p>
            <p style={{ color: C.blackRobe, fontSize: 12, margin: 0, lineHeight: 1.5, opacity: 0.8 }}>{v.desc}</p>
            <p style={{ color: C.blackRobe, fontSize: 11, margin: '10px 0 0', opacity: 0.5 }}>🔍 Busque pelo título no YouTube ou Spotify</p>
          </div>
        </div>
      ))}

      {saved && Object.values(saved).some(Boolean) && (
        <div style={{ background: '#fff9e6', borderRadius: 14, padding: 14, marginTop: 8 }}>
          <p style={{ color: '#c87d00', fontSize: 12, margin: 0, fontWeight: 600 }}>🔖 {Object.values(saved).filter(Boolean).length} item(s) salvos nos marcadores</p>
        </div>
      )}
    </div>
  )
}
