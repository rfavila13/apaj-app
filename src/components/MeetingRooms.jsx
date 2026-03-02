import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const C = {
  trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff',
  blackRobe: '#2b2b2b', blancDeBlanc: '#e9e9ea', white: '#ffffff',
  success: '#28a068', warning: '#e8a040', danger: '#d04040'
}

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const ONLINE_MEETINGS = [
  { org: 'Jogadores Anônimos Brasil', type: 'Reunião Online Aberta', days: 'Segunda, Quarta e Sexta', time: '20h00', format: 'Video + Chat', lang: '🇧🇷 Português', color: C.iceMelt },
  { org: 'Jogadores Anônimos Brasil', type: 'Reunião Online Fechada', days: 'Terça e Quinta', time: '19h30', format: 'Video', lang: '🇧🇷 Português', color: '#e8f5e9' },
  { org: 'Gam-Anon (Familiares)', type: 'Reunião para Famílias', days: 'Sábado', time: '10h00', format: 'Video + Chat', lang: '🇧🇷 Português', color: '#fff9e6' },
  { org: 'Gamblers Anonymous International', type: 'Reunião Internacional', days: 'Todos os dias', time: 'Vários horários', format: 'Video', lang: '🌎 Inglês/Espanhol', color: '#f3e5f5' },
]

const TIPS_MEETING = [
  '💡 Reuniões abertas: qualquer pessoa pode participar, inclusive familiares',
  '🔒 Reuniões fechadas: apenas pessoas com problemas de jogo',
  '🎙️ Não é obrigado a falar. Ouvir já ajuda muito',
  '🕵️ Você pode usar apenas o primeiro nome — anonimato total',
  '📱 Para participar das reuniões online dos JA, acesse jogadoresanonimos.org.br e vá em "Reuniões Online"',
]

export default function MeetingRooms({ userId, onClose }) {
  const [tab, setTab] = useState('my_groups')
  const [myGroups, setMyGroups] = useState([])
  const [allGroups, setAllGroups] = useState([])
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [liking, setLiking] = useState(null)
  const [myLikes, setMyLikes] = useState([])
  const [interestSent, setInterestSent] = useState({})
  const [myProfile, setMyProfile] = useState(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [profileRes, myGroupsRes, allGroupsRes, boardRes, likesRes, interestRes] = await Promise.all([
        supabase.from('patients').select('name, email').eq('id', userId).single(),
        supabase.from('group_members').select('group_id, therapy_groups(*)').eq('patient_id', userId),
        supabase.from('therapy_groups').select('*, psychologists(name)').order('name'),
        supabase.from('community_board').select('*').order('created_at', { ascending: false }).limit(30),
        supabase.from('board_likes').select('post_id').eq('patient_id', userId),
        supabase.from('group_interest').select('group_id').eq('patient_id', userId)
      ])
      if (profileRes.data) setMyProfile(profileRes.data)
      setMyGroups(myGroupsRes.data?.map(r => r.therapy_groups).filter(Boolean) || [])
      setAllGroups(allGroupsRes.data || [])
      setPosts(boardRes.data || [])
      setMyLikes(likesRes.data?.map(l => l.post_id) || [])
      const interests = {}
      interestRes.data?.forEach(r => { interests[r.group_id] = true })
      setInterestSent(interests)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const sendPost = async () => {
    if (!newPost.trim() || newPost.trim().length < 5) return
    setPosting(true)
    try {
      const { data, error } = await supabase.from('community_board').insert({
        patient_id: userId, message: newPost.trim(), likes_count: 0
      }).select().single()
      if (!error && data) {
        setPosts(prev => [data, ...prev])
        setNewPost('')
      } else if (error) {
        alert('Erro ao publicar: ' + error.message)
      }
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setPosting(false) }
  }

  const likePost = async (post) => {
    if (myLikes.includes(post.id) || liking === post.id) return
    setLiking(post.id)
    try {
      const { error } = await supabase.from('board_likes').insert({ post_id: post.id, patient_id: userId })
      if (!error) {
        await supabase.from('community_board').update({ likes_count: (post.likes_count || 0) + 1 }).eq('id', post.id)
        setMyLikes(prev => [...prev, post.id])
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p))
      }
    } catch (e) { console.error(e) }
    finally { setLiking(null) }
  }

  const sendGroupInterest = async (group) => {
    if (interestSent[group.id]) return
    try {
      const { error } = await supabase.from('group_interest').insert({
        group_id: group.id, patient_id: userId,
        patient_name: myProfile?.name || 'Paciente',
        patient_email: myProfile?.email || '',
        status: 'pending'
      })
      if (!error) setInterestSent(prev => ({ ...prev, [group.id]: true }))
      else alert('Erro ao enviar interesse: ' + error.message)
    } catch (e) { alert('Erro: ' + e.message) }
  }

  const todayDayOfWeek = new Date().getDay()
  const nextSessionDays = (groupDay) => {
    const diff = (groupDay - todayDayOfWeek + 7) % 7
    if (diff === 0) return 'Hoje'
    if (diff === 1) return 'Amanhã'
    return `Em ${diff} dias (${DAYS_SHORT[groupDay]})`
  }

  const tabs = [
    { id: 'my_groups', label: '📅 Meus Grupos' },
    { id: 'find_group', label: '🔍 Buscar Grupo' },
    { id: 'online', label: '🌐 Reuniões Online' },
    { id: 'board', label: '💬 Mural da Comunidade' },
  ]

  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 12, fontWeight: 500 }}>← Voltar</button>
      <h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 4, fontWeight: 700 }}>🗓️ Salas & Comunidade</h1>
      <p style={{ color: C.blackRobe, opacity: 0.6, fontSize: 13, marginBottom: 16 }}>Grupos terapêuticos, reuniões de apoio e conexão com a comunidade.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? C.trueBlue : C.white, color: tab === t.id ? C.white : C.blackRobe, border: 'none', padding: '10px 14px', borderRadius: 10, fontSize: 12, fontWeight: tab === t.id ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* MEUS GRUPOS */}
      {tab === 'my_groups' && (
        <div>
          {loading ? <p style={{ textAlign: 'center', color: C.trueBlue }}>Carregando...</p> : myGroups.length === 0 ? (
            <div style={{ background: C.white, borderRadius: 16, padding: 28, textAlign: 'center' }}>
              <p style={{ fontSize: 40, margin: '0 0 12px' }}>📅</p>
              <h3 style={{ color: C.trueBlue, fontSize: 16, marginBottom: 8 }}>Você não está em nenhum grupo ainda</h3>
              <p style={{ color: C.blackRobe, opacity: 0.6, fontSize: 13, marginBottom: 16 }}>Grupos de terapia aumentam muito as chances de recuperação. Peça ao seu psicólogo para ser incluído ou busque um grupo disponível.</p>
              <button onClick={() => setTab('find_group')} style={{ background: C.trueBlue, color: C.white, border: 'none', padding: '12px 24px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Buscar Grupos Disponíveis</button>
            </div>
          ) : myGroups.map(g => {
            const next = nextSessionDays(g.day_of_week)
            const isToday = next === 'Hoje'
            return (
              <div key={g.id} style={{ background: C.white, borderRadius: 20, padding: 20, marginBottom: 14, borderLeft: '4px solid ' + (isToday ? C.success : C.trueBlue) }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 4px', fontWeight: 700 }}>{g.name}</h3>
                    <p style={{ color: C.blackRobe, opacity: 0.6, fontSize: 12, margin: 0 }}>{DAYS[g.day_of_week]} às {g.time?.slice(0, 5)}</p>
                  </div>
                  <span style={{ background: isToday ? '#e8f5e9' : C.iceMelt, color: isToday ? C.success : C.trueBlue, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {isToday ? '● Hoje!' : next}
                  </span>
                </div>
                {g.meeting_link && (
                  <a href={g.meeting_link} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', background: isToday ? C.success : C.trueBlue, color: C.white, padding: 12, borderRadius: 12, textDecoration: 'none', textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
                    {isToday ? '🎥 Entrar na Reunião Agora' : '🔗 Link da Reunião'}
                  </a>
                )}
                {!g.meeting_link && (
                  <div style={{ background: C.iceMelt, borderRadius: 10, padding: 10 }}>
                    <p style={{ color: C.trueBlue, fontSize: 12, margin: 0 }}>📍 Reunião presencial. Confirme o local com seu psicólogo.</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* BUSCAR GRUPO */}
      {tab === 'find_group' && (
        <div>
          <div style={{ background: C.iceMelt, borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <p style={{ color: C.trueBlue, fontSize: 12, margin: 0 }}>💡 Demonstre interesse em um grupo. O psicólogo responsável analisará sua solicitação e entrará em contato.</p>
          </div>
          {loading ? <p style={{ textAlign: 'center', color: C.trueBlue }}>Carregando...</p> : allGroups.length === 0 ? (
            <div style={{ background: C.white, borderRadius: 14, padding: 24, textAlign: 'center' }}>
              <p style={{ color: C.blackRobe, opacity: 0.6 }}>Nenhum grupo cadastrado ainda.</p>
            </div>
          ) : allGroups.map(g => {
            const alreadyIn = myGroups.some(mg => mg.id === g.id)
            const sent = interestSent[g.id]
            return (
              <div key={g.id} style={{ background: C.white, borderRadius: 16, padding: 18, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 4px', fontWeight: 700 }}>{g.name}</h3>
                    <p style={{ color: C.blackRobe, opacity: 0.6, fontSize: 12, margin: 0 }}>{DAYS[g.day_of_week]} às {g.time?.slice(0, 5)}</p>
                    {g.psychologists?.name && <p style={{ color: C.alaskanBlue, fontSize: 11, margin: '4px 0 0' }}>Conduzido por {g.psychologists.name}</p>}
                  </div>
                  {alreadyIn ? (
                    <span style={{ background: '#e8f5e9', color: C.success, padding: '4px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>✓ Participando</span>
                  ) : (
                    <button onClick={() => sendGroupInterest(g)} disabled={sent}
                      style={{ background: sent ? C.blancDeBlanc : C.trueBlue, color: sent ? C.blackRobe : C.white, border: 'none', padding: '8px 14px', borderRadius: 10, cursor: sent ? 'default' : 'pointer', fontSize: 12, fontWeight: 600 }}>
                      {sent ? '✓ Interesse enviado' : 'Tenho Interesse'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* REUNIÕES ONLINE */}
      {tab === 'online' && (
        <div>
          <div style={{ background: '#e8f5e9', borderRadius: 14, padding: 14, marginBottom: 16, borderLeft: '4px solid ' + C.success }}>
            <p style={{ color: C.success, fontSize: 12, margin: '0 0 6px', fontWeight: 700 }}>✅ Reuniões dos Jogadores Anônimos são totalmente gratuitas</p>
            <p style={{ color: C.blackRobe, fontSize: 12, margin: 0, opacity: 0.8 }}>Para participar das reuniões online, acesse o site oficial dos Jogadores Anônimos Brasil e clique em "Reuniões Online".</p>
          </div>

          {ONLINE_MEETINGS.map((m, i) => (
            <div key={i} style={{ background: m.color, borderRadius: 16, padding: 18, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <p style={{ color: C.trueBlue, fontSize: 10, margin: '0 0 4px', fontWeight: 600, opacity: 0.7, textTransform: 'uppercase' }}>{m.org}</p>
                  <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 6px', fontWeight: 700 }}>{m.type}</h3>
                </div>
                <span style={{ background: C.white, color: C.trueBlue, padding: '4px 10px', borderRadius: 10, fontSize: 11 }}>{m.lang}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(29,63,119,0.08)', color: C.trueBlue, padding: '4px 10px', borderRadius: 20, fontSize: 11 }}>📅 {m.days}</span>
                <span style={{ background: 'rgba(29,63,119,0.08)', color: C.trueBlue, padding: '4px 10px', borderRadius: 20, fontSize: 11 }}>⏰ {m.time}</span>
                <span style={{ background: 'rgba(29,63,119,0.08)', color: C.trueBlue, padding: '4px 10px', borderRadius: 20, fontSize: 11 }}>🖥️ {m.format}</span>
              </div>
            </div>
          ))}

          <div style={{ background: C.white, borderRadius: 16, padding: 18, marginTop: 8 }}>
            <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 14px', fontWeight: 700 }}>💡 Dicas para sua primeira reunião</h3>
            {TIPS_MEETING.map((tip, i) => (
              <p key={i} style={{ color: C.blackRobe, fontSize: 12, margin: '0 0 10px', lineHeight: 1.5, opacity: 0.8 }}>{tip}</p>
            ))}
          </div>
        </div>
      )}

      {/* MURAL DA COMUNIDADE */}
      {tab === 'board' && (
        <div>
          <div style={{ background: C.white, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <p style={{ color: C.blackRobe, fontSize: 12, margin: '0 0 10px', opacity: 0.6 }}>Compartilhe uma mensagem anônima com a comunidade. Palavras de encorajamento fazem diferença.</p>
            <textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="Escreva uma palavra de apoio, um pensamento positivo ou seu progresso de hoje..."
              maxLength={300}
              style={{ width: '100%', padding: 12, border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 13, resize: 'none', minHeight: 80, boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <span style={{ color: C.blackRobe, fontSize: 11, opacity: 0.4 }}>{newPost.length}/300</span>
              <button onClick={sendPost} disabled={posting || newPost.trim().length < 5}
                style={{ background: newPost.trim().length < 5 ? C.blancDeBlanc : C.trueBlue, color: newPost.trim().length < 5 ? C.blackRobe : C.white, border: 'none', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {posting ? 'Publicando...' : '💬 Publicar'}
              </button>
            </div>
          </div>

          {loading ? <p style={{ textAlign: 'center', color: C.trueBlue }}>Carregando...</p> : posts.length === 0 ? (
            <div style={{ background: C.white, borderRadius: 14, padding: 24, textAlign: 'center' }}>
              <p style={{ fontSize: 36, margin: '0 0 8px' }}>💬</p>
              <p style={{ color: C.blackRobe, opacity: 0.6 }}>Seja o primeiro a compartilhar algo!</p>
            </div>
          ) : posts.map(post => {
            const liked = myLikes.includes(post.id)
            const timeAgo = (() => {
              const diff = Date.now() - new Date(post.created_at)
              const h = Math.floor(diff / 3600000)
              const d = Math.floor(diff / 86400000)
              if (d > 0) return `${d}d atrás`
              if (h > 0) return `${h}h atrás`
              return 'agora'
            })()
            return (
              <div key={post.id} style={{ background: C.white, borderRadius: 16, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, background: C.iceMelt, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🌟</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: C.trueBlue, fontSize: 12, fontWeight: 600 }}>Membro da Comunidade</span>
                      <span style={{ color: C.blackRobe, fontSize: 11, opacity: 0.5 }}>{timeAgo}</span>
                    </div>
                    <p style={{ color: C.blackRobe, fontSize: 13, margin: '0 0 10px', lineHeight: 1.5 }}>{post.message}</p>
                    <button onClick={() => likePost(post)} disabled={liked || liking === post.id}
                      style={{ background: liked ? '#e3f2fd' : C.blancDeBlanc, color: liked ? C.alaskanBlue : C.blackRobe, border: 'none', padding: '6px 12px', borderRadius: 8, cursor: liked ? 'default' : 'pointer', fontSize: 12 }}>
                      💙 {post.likes_count || 0} {liked ? 'Curtido' : 'Curtir'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
