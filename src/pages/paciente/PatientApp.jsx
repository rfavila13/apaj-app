import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/patientService';
import { publicService } from '../../services/publicService';

const COLORS = { primary: '#1a3a6a', primaryLight: '#2a4a8a', primaryDark: '#0f2847', accent: '#5b9bd5', success: '#28a068', warning: '#e8a040', danger: '#d04040', light: '#f0f4f8', border: '#d0d8e0', text: '#1a2a3a', textLight: '#5a6a7a', white: '#fff' };

const PatientApp = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [profile, setProfile] = useState(null);
  const [relapses, setRelapses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [user]);

  const loadData = async () => {
    try {
      const { data: profileData } = await patientService.getMyProfile(user.id);
      if (profileData) setProfile(profileData);
      const { data: relapsesData } = await patientService.getMyRelapses(user.id);
      if (relapsesData) setRelapses(relapsesData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const soberDays = profile?.sober_start_date ? patientService.calculateSoberDays(profile.sober_start_date, relapses) : 0;
  const savings = profile?.sober_start_date && profile?.previous_gambling_amount ? patientService.calculateSavings(profile.sober_start_date, profile.previous_gambling_amount, relapses) : { total: 0 };

  const NavBar = () => (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, padding: '10px 0 12px', display: 'flex', justifyContent: 'space-around', boxShadow: '0 -4px 20px rgba(26,58,106,0.2)', zIndex: 1000, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
      {[
        { id: 'home', icon: '🏠', label: 'Início' },
        { id: 'counter', icon: '📊', label: 'Progresso' },
        { id: 'tips', icon: '💡', label: 'Dicas' },
        { id: 'help', icon: '🆘', label: 'Ajuda' },
        { id: 'profile', icon: '👤', label: 'Perfil' }
      ].map(item => (
        <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{ background: currentPage === item.id ? 'rgba(255,255,255,0.2)' : 'transparent', border: 'none', color: COLORS.white, padding: '8px 14px', borderRadius: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '22px' }}>{item.icon}</span>
          <span style={{ fontSize: '10px', fontWeight: currentPage === item.id ? '600' : '400', opacity: currentPage === item.id ? 1 : 0.8 }}>{item.label}</span>
        </button>
      ))}
    </nav>
  );

  const HomePage = () => (
    <div style={{ padding: '24px', paddingBottom: '100px' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ width: '90px', height: '90px', margin: '0 auto 16px', background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 25px rgba(26,58,106,0.25)' }}>
          <svg width="54" height="54" viewBox="0 0 100 100" fill="none"><path d="M50 20 C35 20 20 32 20 48 C20 72 50 82 50 82 C50 82 80 72 80 48 C80 32 65 20 50 20 Z" stroke="white" strokeWidth="3" fill="none"/><path d="M32 48 L42 48 L42 38 C42 34 45 32 48 32 L48 58 L42 58 L42 52 L32 52 Z" fill="white"/><path d="M68 48 L58 48 L58 38 C58 34 55 32 52 32 L52 58 L58 58 L58 52 L68 52 Z" fill="white"/></svg>
        </div>
        <h1 style={{ fontSize: '26px', color: COLORS.primary, fontFamily: 'Poppins, sans-serif', fontWeight: '700', margin: '0 0 6px' }}>APAJ</h1>
        <p style={{ color: COLORS.textLight, fontSize: '14px' }}>Olá, {profile?.name?.split(' ')[0] || 'Bem-vindo'}! 👋</p>
      </div>

      {profile?.sober_start_date ? (
        <div style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, borderRadius: '24px', padding: '28px', marginBottom: '24px', color: COLORS.white, boxShadow: '0 8px 30px rgba(26,58,106,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '56px', fontWeight: '700' }}>{soberDays}</span>
            <p style={{ fontSize: '16px', opacity: 0.9, margin: '4px 0 0' }}>dias de vitória</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '22px', fontWeight: '700' }}>R$ {savings.total.toLocaleString('pt-BR')}</span>
              <p style={{ fontSize: '12px', opacity: 0.85, margin: '4px 0 0' }}>Economizado</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '22px', fontWeight: '700' }}>{relapses.length}</span>
              <p style={{ fontSize: '12px', opacity: 0.85, margin: '4px 0 0' }}>Recaídas</p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: COLORS.white, borderRadius: '24px', padding: '32px', textAlign: 'center', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <span style={{ fontSize: '48px' }}>🌟</span>
          <h2 style={{ color: COLORS.primary, fontSize: '20px', marginTop: '16px', fontWeight: '600' }}>Comece sua jornada</h2>
          <p style={{ color: COLORS.textLight, fontSize: '14px', margin: '12px 0 20px' }}>Configure seu perfil para acompanhar seu progresso</p>
          <button onClick={() => setCurrentPage('setup')} style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, color: COLORS.white, border: 'none', padding: '14px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(26,58,106,0.3)' }}>Configurar Agora</button>
        </div>
      )}

      <div style={{ display: 'grid', gap: '14px' }}>
        {[
          { icon: '📝', title: 'Auto-avaliação', desc: 'Avalie sua relação com jogos', page: 'selftest', color: '#e8f4fd' },
          { icon: '💚', title: 'Dicas de Prevenção', desc: 'Estratégias de proteção', page: 'tips', color: '#e8f5e9' },
          { icon: '🏥', title: 'Rede de Apoio', desc: 'Recursos e suporte', page: 'help', color: '#fff3e0' }
        ].map((item, i) => (
          <button key={i} onClick={() => setCurrentPage(item.page)} style={{ background: COLORS.white, border: 'none', borderRadius: '18px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '32px', width: '60px', height: '60px', background: item.color, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>
            <div><h3 style={{ color: COLORS.text, fontSize: '16px', fontWeight: '600', margin: '0 0 4px' }}>{item.title}</h3><p style={{ color: COLORS.textLight, fontSize: '13px', margin: 0 }}>{item.desc}</p></div>
          </button>
        ))}
      </div>
    </div>
  );

  const SetupPage = () => {
    const [formData, setFormData] = useState({ name: profile?.name || '', monthly_income: profile?.monthly_income || '', previous_gambling_amount: profile?.previous_gambling_amount || '', sober_start_date: profile?.sober_start_date || new Date().toISOString().split('T')[0] });
    const [saving, setSaving] = useState(false);
    const handleSave = async () => {
      setSaving(true);
      try { await patientService.updateProfile(user.id, { name: formData.name, monthly_income: parseFloat(formData.monthly_income) || 0, previous_gambling_amount: parseFloat(formData.previous_gambling_amount) || 0, sober_start_date: formData.sober_start_date }); await loadData(); setCurrentPage('home'); }
      catch (err) { alert('Erro: ' + err.message); }
      finally { setSaving(false); }
    };
    return (
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        <button onClick={() => setCurrentPage('home')} style={{ background: 'none', border: 'none', color: COLORS.primary, fontSize: '15px', cursor: 'pointer', marginBottom: '20px', fontWeight: '500' }}>← Voltar</button>
        <h1 style={{ color: COLORS.primary, fontSize: '24px', marginBottom: '24px', fontWeight: '600' }}>Configurar Perfil</h1>
        <div style={{ background: COLORS.white, borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {[
            { label: 'Seu nome', type: 'text', key: 'name' },
            { label: 'Renda mensal (R$)', type: 'number', key: 'monthly_income' },
            { label: 'Quanto gastava por mês em jogos? (R$)', type: 'number', key: 'previous_gambling_amount' },
            { label: 'Data de início da jornada', type: 'date', key: 'sober_start_date' }
          ].map((field, i) => (
            <div key={i} style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: COLORS.text, fontWeight: '500', marginBottom: '8px', fontSize: '14px' }}>{field.label}</label>
              <input type={field.type} value={formData[field.key]} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} style={{ width: '100%', padding: '14px 16px', border: `2px solid ${COLORS.border}`, borderRadius: '12px', fontSize: '16px', boxSizing: 'border-box' }} />
            </div>
          ))}
          <button onClick={handleSave} disabled={saving} style={{ width: '100%', background: saving ? COLORS.textLight : `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, color: COLORS.white, border: 'none', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </div>
    );
  };

  const CounterPage = () => {
    const [showRelapseForm, setShowRelapseForm] = useState(false);
    const [relapseAmount, setRelapseAmount] = useState('');
    const [relapseNote, setRelapseNote] = useState('');
    const [saving, setSaving] = useState(false);
    const handleRelapse = async () => {
      setSaving(true);
      try { await patientService.addRelapse(user.id, { amount: parseFloat(relapseAmount) || 0, notes: relapseNote }); await loadData(); setShowRelapseForm(false); setRelapseAmount(''); setRelapseNote(''); }
      catch (err) { alert('Erro: ' + err.message); }
      finally { setSaving(false); }
    };
    if (!profile?.sober_start_date) return (<div style={{ padding: '24px', paddingBottom: '100px', textAlign: 'center' }}><span style={{ fontSize: '64px' }}>📊</span><h2 style={{ color: COLORS.primary, marginTop: '24px' }}>Configure seu perfil</h2><button onClick={() => setCurrentPage('setup')} style={{ marginTop: '20px', background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, color: COLORS.white, border: 'none', padding: '14px 32px', borderRadius: '12px', fontSize: '16px', cursor: 'pointer' }}>Configurar</button></div>);
    return (
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        <h1 style={{ color: COLORS.primary, fontSize: '24px', marginBottom: '24px', textAlign: 'center', fontWeight: '600' }}>Seu Progresso</h1>
        <div style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, borderRadius: '24px', padding: '32px', textAlign: 'center', marginBottom: '24px', color: COLORS.white }}>
          <p style={{ fontSize: '14px', opacity: 0.85 }}>Dias sem jogar</p>
          <span style={{ fontSize: '72px', fontWeight: '700' }}>{soberDays}</span>
          <p style={{ fontSize: '14px', opacity: 0.85, marginTop: '8px' }}>Desde {new Date(profile.sober_start_date).toLocaleDateString('pt-BR')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
          <div style={{ background: COLORS.white, borderRadius: '18px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}><span style={{ fontSize: '26px' }}>💰</span><p style={{ fontSize: '24px', fontWeight: '700', color: COLORS.success, margin: '8px 0 4px' }}>R$ {savings.total.toLocaleString('pt-BR')}</p><p style={{ fontSize: '12px', color: COLORS.textLight }}>Economizado</p></div>
          <div style={{ background: COLORS.white, borderRadius: '18px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}><span style={{ fontSize: '26px' }}>↩️</span><p style={{ fontSize: '24px', fontWeight: '700', color: relapses.length > 0 ? COLORS.warning : COLORS.success, margin: '8px 0 4px' }}>{relapses.length}</p><p style={{ fontSize: '12px', color: COLORS.textLight }}>Recaídas</p></div>
        </div>
        {!showRelapseForm ? <button onClick={() => setShowRelapseForm(true)} style={{ width: '100%', background: COLORS.white, border: `2px solid ${COLORS.warning}`, color: COLORS.warning, padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>Registrar Recaída</button> : (
          <div style={{ background: COLORS.white, borderRadius: '18px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: COLORS.text, marginBottom: '12px' }}>Registrar Recaída</h3>
            <p style={{ color: COLORS.textLight, fontSize: '13px', marginBottom: '16px' }}>Recaídas fazem parte do processo. O importante é continuar.</p>
            <input type="number" placeholder="Valor gasto (R$)" value={relapseAmount} onChange={(e) => setRelapseAmount(e.target.value)} style={{ width: '100%', padding: '12px', border: `2px solid ${COLORS.border}`, borderRadius: '10px', marginBottom: '12px', fontSize: '16px', boxSizing: 'border-box' }} />
            <textarea placeholder="O que aconteceu? (opcional)" value={relapseNote} onChange={(e) => setRelapseNote(e.target.value)} style={{ width: '100%', padding: '12px', border: `2px solid ${COLORS.border}`, borderRadius: '10px', marginBottom: '16px', fontSize: '14px', minHeight: '80px', resize: 'none', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '12px' }}><button onClick={() => setShowRelapseForm(false)} style={{ flex: 1, background: COLORS.light, border: 'none', color: COLORS.textLight, padding: '12px', borderRadius: '10px', cursor: 'pointer' }}>Cancelar</button><button onClick={handleRelapse} disabled={saving} style={{ flex: 1, background: COLORS.warning, border: 'none', color: COLORS.white, padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>{saving ? 'Salvando...' : 'Registrar'}</button></div>
          </div>
        )}
        {relapses.length > 0 && <div style={{ background: COLORS.white, borderRadius: '18px', padding: '20px', marginTop: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}><h3 style={{ color: COLORS.text, fontSize: '16px', marginBottom: '16px' }}>Histórico</h3>{relapses.slice(0, 5).map((r, i) => (<div key={i} style={{ padding: '12px', background: COLORS.light, borderRadius: '10px', marginBottom: '8px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: COLORS.textLight, fontSize: '13px' }}>{new Date(r.date).toLocaleDateString('pt-BR')}</span><span style={{ color: COLORS.danger, fontWeight: '600' }}>R$ {r.amount?.toLocaleString('pt-BR') || 0}</span></div>{r.notes && <p style={{ color: COLORS.textLight, fontSize: '12px', marginTop: '4px' }}>{r.notes}</p>}</div>))}</div>}
      </div>
    );
  };

  const TipsPage = () => {
    const tips = [
      { icon: '🛡️', title: 'Bloqueie o acesso', content: 'Use apps como Gamban ou BetBlocker. Delete apps de apostas do celular.' },
      { icon: '💳', title: 'Controle financeiro', content: 'Deixe cartões com alguém de confiança. Configure limites no banco.' },
      { icon: '⏰', title: 'Identifique gatilhos', content: 'Anote quando sente vontade. Identifique emoções e situações de risco.' },
      { icon: '🧘', title: 'Substitua o hábito', content: 'Exercícios, hobbies, voluntariado. Encontre prazer em outras atividades.' },
      { icon: '👥', title: 'Rede de apoio', content: 'Conte para pessoas de confiança. Participe de grupos. Busque ajuda profissional.' },
      { icon: '🆘', title: 'Na hora da fissura', content: 'Respire fundo. A vontade passa em 15-20 min. Ligue para alguém. Saia do local.' }
    ];
    return (
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        <h1 style={{ color: COLORS.primary, fontSize: '24px', marginBottom: '24px', fontWeight: '600' }}>Dicas de Prevenção</h1>
        <div style={{ display: 'grid', gap: '14px' }}>
          {tips.map((tip, i) => (
            <div key={i} style={{ background: COLORS.white, borderRadius: '18px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}><span style={{ fontSize: '28px' }}>{tip.icon}</span><h3 style={{ color: COLORS.text, fontSize: '16px', margin: 0, fontWeight: '600' }}>{tip.title}</h3></div>
              <p style={{ color: COLORS.textLight, fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{tip.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const HelpPage = () => {
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactData, setContactData] = useState({ name: profile?.name || '', phone: profile?.phone || '', message: '', urgency: 'normal' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const handleSendContact = async () => { setSending(true); try { await publicService.sendContactRequest(contactData); setSent(true); } catch (err) { alert('Erro: ' + err.message); } finally { setSending(false); } };
    if (sent) return (<div style={{ padding: '24px', paddingBottom: '100px', textAlign: 'center' }}><span style={{ fontSize: '64px' }}>💙</span><h2 style={{ color: COLORS.primary, margin: '24px 0 16px' }}>Solicitação Enviada!</h2><p style={{ color: COLORS.textLight }}>Em breve entraremos em contato.</p><button onClick={() => { setSent(false); setShowContactForm(false); }} style={{ marginTop: '24px', background: COLORS.primary, color: COLORS.white, border: 'none', padding: '14px 32px', borderRadius: '12px', cursor: 'pointer' }}>Voltar</button></div>);
    if (showContactForm) return (
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        <button onClick={() => setShowContactForm(false)} style={{ background: 'none', border: 'none', color: COLORS.primary, marginBottom: '20px', cursor: 'pointer', fontWeight: '500' }}>← Voltar</button>
        <h1 style={{ color: COLORS.primary, fontSize: '24px', marginBottom: '24px', fontWeight: '600' }}>Falar com Psicólogo</h1>
        <div style={{ background: COLORS.white, borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <input type="text" placeholder="Seu nome" value={contactData.name} onChange={(e) => setContactData({ ...contactData, name: e.target.value })} style={{ width: '100%', padding: '14px', border: `2px solid ${COLORS.border}`, borderRadius: '12px', marginBottom: '16px', boxSizing: 'border-box' }} />
          <input type="tel" placeholder="Telefone (WhatsApp)" value={contactData.phone} onChange={(e) => setContactData({ ...contactData, phone: e.target.value })} style={{ width: '100%', padding: '14px', border: `2px solid ${COLORS.border}`, borderRadius: '12px', marginBottom: '16px', boxSizing: 'border-box' }} />
          <textarea placeholder="Sua mensagem (opcional)" value={contactData.message} onChange={(e) => setContactData({ ...contactData, message: e.target.value })} style={{ width: '100%', padding: '14px', border: `2px solid ${COLORS.border}`, borderRadius: '12px', marginBottom: '16px', minHeight: '100px', resize: 'none', boxSizing: 'border-box' }} />
          <button onClick={handleSendContact} disabled={sending || !contactData.phone} style={{ width: '100%', background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, color: COLORS.white, border: 'none', padding: '16px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>{sending ? 'Enviando...' : 'Enviar Solicitação'}</button>
        </div>
      </div>
    );
    return (
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        <h1 style={{ color: COLORS.primary, fontSize: '24px', marginBottom: '24px', fontWeight: '600' }}>Rede de Apoio</h1>
        <div style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, borderRadius: '20px', padding: '24px', marginBottom: '20px', color: COLORS.white }}>
          <h2 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: '600' }}>🆘 Precisa de ajuda?</h2>
          <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '16px' }}>Entre em contato com a equipe APAJ</p>
          <button onClick={() => setShowContactForm(true)} style={{ background: COLORS.white, color: COLORS.primary, border: 'none', padding: '14px 24px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>Solicitar Conversa</button>
        </div>
        <div style={{ background: COLORS.white, borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h2 style={{ color: COLORS.text, fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>🏥 Recursos</h2>
          {[
            { icon: '📞', name: 'CVV - Ligue 188', desc: 'Centro de Valorização da Vida - 24h' },
            { icon: '🧠', name: 'CAPS', desc: 'Centro de Atenção Psicossocial' },
            { icon: '🤝', name: 'Jogadores Anônimos', desc: 'jogadoresanonimos.com.br' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: COLORS.light, borderRadius: '14px', marginBottom: '12px' }}>
              <span style={{ fontSize: '28px' }}>{item.icon}</span>
              <div><h3 style={{ color: COLORS.text, fontSize: '15px', margin: '0 0 2px', fontWeight: '600' }}>{item.name}</h3><p style={{ color: COLORS.textLight, fontSize: '13px', margin: 0 }}>{item.desc}</p></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SelfTestPage = () => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState([]);
    const questions = ['Você já apostou mais do que podia perder?','Você precisou apostar valores maiores para ter a mesma emoção?','Você voltou a apostar para recuperar dinheiro perdido?','Você pediu dinheiro emprestado para apostar?','Você sentiu que poderia ter um problema com jogo?','O jogo causou problemas de saúde ou estresse?','Pessoas criticaram suas apostas?','O jogo causou problemas financeiros?','Você se sentiu culpado sobre apostas?'];
    const options = [{ label: 'Nunca', value: 0 },{ label: 'Às vezes', value: 1 },{ label: 'Frequentemente', value: 2 },{ label: 'Quase sempre', value: 3 }];
    const handleAnswer = async (value) => { const newAnswers = [...answers, value]; setAnswers(newAnswers); if (step < questions.length - 1) setStep(step + 1); else { const score = newAnswers.reduce((a, b) => a + b, 0); await patientService.saveTestResult(user.id, score, score <= 2 ? 'low' : score <= 7 ? 'moderate' : 'high', newAnswers); setStep('result'); } };
    if (step === 'result') { const score = answers.reduce((a, b) => a + b, 0); const result = score <= 2 ? { level: 'Risco Baixo', color: COLORS.success, icon: '✅' } : score <= 7 ? { level: 'Risco Moderado', color: COLORS.warning, icon: '⚠️' } : { level: 'Risco Alto', color: COLORS.danger, icon: '🔴' }; return (<div style={{ padding: '24px', paddingBottom: '100px', textAlign: 'center' }}><span style={{ fontSize: '64px' }}>{result.icon}</span><h2 style={{ color: result.color, fontSize: '24px', marginTop: '16px' }}>{result.level}</h2><p style={{ color: COLORS.textLight, margin: '16px 0' }}>Pontuação: {score} de 27</p>{score > 7 && <button onClick={() => setCurrentPage('help')} style={{ background: COLORS.primary, color: COLORS.white, border: 'none', padding: '14px 32px', borderRadius: '12px', cursor: 'pointer', marginTop: '16px' }}>Buscar Ajuda</button>}<button onClick={() => { setStep(0); setAnswers([]); }} style={{ display: 'block', margin: '16px auto', background: 'none', border: 'none', color: COLORS.primary, cursor: 'pointer', fontWeight: '500' }}>Refazer teste</button></div>); }
    return (
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        <button onClick={() => setCurrentPage('home')} style={{ background: 'none', border: 'none', color: COLORS.primary, marginBottom: '20px', cursor: 'pointer', fontWeight: '500' }}>← Voltar</button>
        <div style={{ background: COLORS.border, borderRadius: '10px', padding: '4px', marginBottom: '24px' }}><div style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, borderRadius: '8px', height: '8px', width: `${((step + 1) / questions.length) * 100}%`, transition: 'width 0.3s' }} /></div>
        <p style={{ color: COLORS.textLight, fontSize: '14px', marginBottom: '8px' }}>Pergunta {step + 1} de {questions.length}</p>
        <div style={{ background: COLORS.white, borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h2 style={{ color: COLORS.text, fontSize: '18px', marginBottom: '24px', lineHeight: '1.5', fontWeight: '500' }}>{questions[step]}</h2>
          <div style={{ display: 'grid', gap: '12px' }}>{options.map((opt, i) => (<button key={i} onClick={() => handleAnswer(opt.value)} style={{ background: COLORS.light, border: `2px solid ${COLORS.border}`, borderRadius: '14px', padding: '16px 20px', textAlign: 'left', cursor: 'pointer', fontSize: '15px', color: COLORS.text, transition: 'all 0.2s' }} onMouseOver={e => { e.target.style.borderColor = COLORS.primary; e.target.style.background = '#e8f0f8'; }} onMouseOut={e => { e.target.style.borderColor = COLORS.border; e.target.style.background = COLORS.light; }}>{opt.label}</button>))}</div>
        </div>
      </div>
    );
  };

  const ProfilePage = () => (
    <div style={{ padding: '24px', paddingBottom: '100px' }}>
      <h1 style={{ color: COLORS.primary, fontSize: '24px', marginBottom: '24px', fontWeight: '600' }}>Perfil</h1>
      <div style={{ background: COLORS.white, borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '70px', height: '70px', background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: COLORS.white, fontWeight: '600' }}>{profile?.name ? profile.name.charAt(0).toUpperCase() : '👤'}</div>
          <div><h2 style={{ color: COLORS.text, fontSize: '20px', margin: '0 0 4px', fontWeight: '600' }}>{profile?.name || 'Usuário'}</h2><p style={{ color: COLORS.textLight, fontSize: '14px', margin: 0 }}>{user.email}</p></div>
        </div>
        <button onClick={() => setCurrentPage('setup')} style={{ width: '100%', padding: '14px', background: COLORS.light, border: 'none', borderRadius: '12px', cursor: 'pointer', marginBottom: '12px', color: COLORS.text, fontWeight: '500' }}>⚙️ Editar Configurações</button>
        <button onClick={onLogout} style={{ width: '100%', padding: '14px', background: '#ffebee', border: 'none', borderRadius: '12px', color: COLORS.danger, cursor: 'pointer', fontWeight: '500' }}>Sair da Conta</button>
      </div>
      <p style={{ color: COLORS.textLight, fontSize: '12px', textAlign: 'center' }}>APAJ - Versão 2.0</p>
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'setup': return <SetupPage />;
      case 'counter': return <CounterPage />;
      case 'tips': return <TipsPage />;
      case 'help': return <HelpPage />;
      case 'selftest': return <SelfTestPage />;
      case 'profile': return <ProfilePage />;
      default: return <HomePage />;
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.light }}><p style={{ color: COLORS.primary }}>Carregando...</p></div>;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: COLORS.light, minHeight: '100vh', maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
      {renderPage()}
      <NavBar />
    </div>
  );
};

export default PatientApp;
