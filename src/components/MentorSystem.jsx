import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
const C = { trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff', blackRobe: '#2b2b2b', blancDeBlanc: '#e9e9ea', white: '#ffffff', success: '#28a068', warning: '#e8a040' }
export default function MentorSystem({ userId, days, profile, onClose }) {
  const [tab, setTab] = useState('info')
  const [isMentor, setIsMentor] = useState(false)
  const [myMentor, setMyMentor] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const canBeMentor = days >= 180
  useEffect(() => { loadData() }, [])
  const loadData = async () => {
    const { data: mentorData } = await supabase.from('mentors').select('*').eq('patient_id', userId).single()
    if (mentorData) setIsMentor(true)
    const { data: matchData } = await supabase.from('mentor_matches').select('*, mentors(patients(*))').eq('mentee_id', userId).eq('status', 'active').single()
    if (matchData) { setMyMentor(matchData); loadMessages(matchData.id) }
  }
  const loadMessages = async (matchId) => { const { data } = await supabase.from('mentor_messages').select('*').eq('match_id', matchId).order('created_at', { ascending: true }); if (data) setMessages(data) }
  const becomeMentor = async () => {
    try {
      await supabase.from('mentors').insert({ patient_id: userId, available: true, bio: '' })
      setIsMentor(true); alert('Você agora é um mentor voluntário!')
    } catch (e) { alert('Erro: ' + e.message) }
  }
  const requestMentor = async () => {
    try {
      const { data: mentors } = await supabase.from('mentors').select('*').eq('available', true).neq('patient_id', userId).limit(1)
      if (!mentors?.length) { alert('Nenhum mentor disponível no momento'); return }
      await supabase.from('mentor_matches').insert({ mentor_id: mentors[0].id, mentee_id: userId, status: 'pending' })
      alert('Solicitação enviada! Aguarde aprovação.')
    } catch (e) { alert('Erro: ' + e.message) }
  }
  const sendMessage = async () => {
    if (!newMsg.trim() || !myMentor) return; setSending(true)
    try {
      await supabase.from('mentor_messages').insert({ match_id: myMentor.id, sender_id: userId, content: newMsg })
      setNewMsg(''); await loadMessages(myMentor.id)
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setSending(false) }
  }
  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}>← Voltar</button>
      <h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 8, fontWeight: 600 }}>🤝 Mentoria entre Pares</h1>
      <p style={{ color: C.blackRobe, opacity: 0.7, fontSize: 13, marginBottom: 20 }}>Apoio de quem já passou por isso.</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[{ id: 'info', label: 'Sobre' }, { id: 'chat', label: 'Mensagens', show: !!myMentor }].filter(t => t.show !== false).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: tab === t.id ? C.trueBlue : C.blancDeBlanc, color: tab === t.id ? C.white : C.blackRobe, border: 'none', padding: 12, borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>{t.label}</button>
        ))}
      </div>
      {tab === 'info' && (
        <div>
          <div style={{ background: C.white, borderRadius: 14, padding: 18, marginBottom: 16 }}>
            <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 12px' }}>Como funciona?</h3>
            <p style={{ color: C.blackRobe, fontSize: 13, lineHeight: 1.6, margin: 0 }}>Mentores são pessoas em recuperação há mais de 6 meses que se voluntariam para apoiar quem está começando. A comunicação é assíncrona e supervisionada pela equipe APAJ.</p>
          </div>
          {!myMentor && !isMentor && (
            <button onClick={requestMentor} style={{ width: '100%', background: C.alaskanBlue, color: C.white, border: 'none', padding: 14, borderRadius: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 12 }}>Solicitar um Mentor</button>
          )}
          {myMentor && (
            <div style={{ background: C.success + '20', border: '2px solid ' + C.success, borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <p style={{ color: C.success, fontSize: 13, margin: 0 }}>✓ Você tem um mentor! Vá para "Mensagens" para conversar.</p>
            </div>
          )}
          {canBeMentor && !isMentor && (
            <div style={{ background: C.iceMelt, borderRadius: 14, padding: 18 }}>
              <h3 style={{ color: C.trueBlue, fontSize: 15, margin: '0 0 8px' }}>🌟 Seja um Mentor</h3>
              <p style={{ color: C.blackRobe, fontSize: 13, marginBottom: 14 }}>Com {days} dias de recuperação, você pode ajudar outras pessoas.</p>
              <button onClick={becomeMentor} style={{ width: '100%', background: C.trueBlue, color: C.white, border: 'none', padding: 12, borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Quero ser Mentor</button>
            </div>
          )}
          {isMentor && (
            <div style={{ background: C.success + '20', borderRadius: 14, padding: 16 }}>
              <p style={{ color: C.success, fontSize: 14, margin: 0, fontWeight: 600 }}>🌟 Você é um mentor voluntário. Obrigado!</p>
            </div>
          )}
        </div>
      )}
      {tab === 'chat' && myMentor && (
        <div>
          <div style={{ background: C.white, borderRadius: 14, padding: 16, minHeight: 300, maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}>
            {messages.length === 0 ? (
              <p style={{ color: C.blackRobe, opacity: 0.6, textAlign: 'center', marginTop: 60 }}>Nenhuma mensagem ainda. Comece a conversa!</p>
            ) : messages.map(m => (
              <div key={m.id} style={{ marginBottom: 12, textAlign: m.sender_id === userId ? 'right' : 'left' }}>
                <div style={{ display: 'inline-block', background: m.sender_id === userId ? C.trueBlue : C.iceMelt, color: m.sender_id === userId ? C.white : C.blackRobe, padding: '10px 14px', borderRadius: 14, maxWidth: '80%', fontSize: 13 }}>{m.content}</div>
                <p style={{ color: C.blackRobe, opacity: 0.5, fontSize: 10, margin: '4px 8px 0' }}>{new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Escreva sua mensagem..." style={{ flex: 1, padding: 12, border: '1px solid ' + C.blancDeBlanc, borderRadius: 10, fontSize: 14 }} onKeyPress={e => e.key === 'Enter' && sendMessage()} />
            <button onClick={sendMessage} disabled={sending || !newMsg.trim()} style={{ background: C.trueBlue, color: C.white, border: 'none', padding: '12px 20px', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>{sending ? '...' : '→'}</button>
          </div>
          <p style={{ color: C.blackRobe, opacity: 0.5, fontSize: 11, marginTop: 8, textAlign: 'center' }}>Mensagens são supervisionadas pela equipe APAJ</p>
        </div>
      )}
    </div>
  )
}
