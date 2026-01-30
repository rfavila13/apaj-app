import React, { useState, useEffect } from 'react';
import { psychologistService } from '../../services/psychologistService';
import { supabase } from '../../services/supabase';

const COLORS = { primary: '#1a3a6a', primaryDark: '#0f2847', accent: '#5b9bd5', success: '#28a068', warning: '#e8a040', danger: '#d04040', light: '#f0f4f8', border: '#d0d8e0', text: '#1a2a3a', textLight: '#5a6a7a', white: '#fff' };

const PsychologistPanel = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRelapses, setPatientRelapses] = useState([]);
  const [patientSessions, setPatientSessions] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [groups, setGroups] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadData(); }, [user]);

  const loadData = async () => {
    try {
      const [profileRes, patientsRes, requestsRes, groupsRes, teamRes] = await Promise.all([
        psychologistService.getMyProfile(user.id), psychologistService.getAllPatients(), psychologistService.getContactRequests(), psychologistService.getMyGroups(user.id), supabase.from('psychologists').select('*').order('name')
      ]);
      setProfile(profileRes.data); setPatients(patientsRes.data || []); setContactRequests(requestsRes.data || []); setGroups(groupsRes.data || []); setTeam(teamRes.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const loadPatientDetails = async (patient) => {
    setSelectedPatient(patient); setCurrentPage('patient-detail');
    const [relapsesRes, sessionsRes] = await Promise.all([psychologistService.getPatientRelapses(patient.id), psychologistService.getPatientSessions(patient.id)]);
    setPatientRelapses(relapsesRes.data || []); setPatientSessions(sessionsRes.data || []);
  };

  const pendingRequests = contactRequests.filter(r => r.status === 'pending').length;
  const filteredPatients = patients.filter(p => !searchTerm || p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  const cardStyle = { background: COLORS.white, borderRadius: '16px', padding: '24px', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' };
  const btnPrimary = { background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, color: COLORS.white, border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' };
  const inputStyle = { width: '100%', padding: '12px 16px', border: `2px solid ${COLORS.border}`, borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' };

  const Sidebar = () => (
    <aside style={{ width: '260px', background: `linear-gradient(180deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, minHeight: '100vh', padding: '24px 0', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 24px', marginBottom: '36px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.15)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🤝</div>
        <div><h1 style={{ color: COLORS.white, fontSize: '22px', margin: 0, fontWeight: '700' }}>APAJ</h1><p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', margin: 0 }}>Painel Profissional</p></div>
      </div>
      <nav style={{ padding: '0 12px', flex: 1 }}>
        {[{ id: 'dashboard', icon: '📊', label: 'Dashboard' },{ id: 'patients', icon: '👥', label: 'Pacientes' },{ id: 'groups', icon: '🗓️', label: 'Grupos' },{ id: 'requests', icon: '📩', label: 'Solicitações', badge: pendingRequests },{ id: 'team', icon: '🏥', label: 'Equipe' }].map(item => (
          <button key={item.id} onClick={() => { setCurrentPage(item.id); setSelectedPatient(null); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: currentPage === item.id ? 'rgba(255,255,255,0.15)' : 'transparent', border: 'none', borderRadius: '10px', color: currentPage === item.id ? COLORS.white : 'rgba(255,255,255,0.7)', cursor: 'pointer', marginBottom: '4px', position: 'relative', textAlign: 'left' }}>
            <span style={{ fontSize: '20px' }}>{item.icon}</span><span style={{ fontSize: '14px' }}>{item.label}</span>
            {item.badge > 0 && <span style={{ position: 'absolute', right: '12px', background: COLORS.danger, color: COLORS.white, fontSize: '11px', padding: '2px 8px', borderRadius: '10px' }}>{item.badge}</span>}
          </button>
        ))}
      </nav>
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '42px', height: '42px', background: COLORS.accent, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.white, fontWeight: '600' }}>{profile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'PS'}</div>
          <div><p style={{ color: COLORS.white, fontSize: '14px', margin: 0 }}>{profile?.name}</p><p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>{profile?.crp}</p></div>
        </div>
        <button onClick={onLogout} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>Sair</button>
      </div>
    </aside>
  );

  const Dashboard = () => (
    <div>
      <h1 style={{ fontSize: '28px', color: COLORS.text, marginBottom: '32px' }}>Olá, {profile?.name?.split(' ')[0]}! 👋</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {[{ label: 'Pacientes', value: patients.length, icon: '👥', color: COLORS.primary },{ label: 'Alto Risco', value: patients.filter(p => p.risk_level === 'high').length, icon: '⚠️', color: COLORS.danger },{ label: 'Solicitações', value: pendingRequests, icon: '📩', color: COLORS.accent },{ label: 'Equipe', value: team.length, icon: '🏥', color: COLORS.success }].map((s, i) => (
          <div key={i} style={cardStyle}><span style={{ fontSize: '32px' }}>{s.icon}</span><p style={{ fontSize: '36px', fontWeight: '700', color: s.color, margin: '12px 0 4px' }}>{s.value}</p><p style={{ fontSize: '14px', color: COLORS.textLight, margin: 0 }}>{s.label}</p></div>
        ))}
      </div>
    </div>
  );

  const PatientsList = () => (
    <div>
      <h1 style={{ fontSize: '28px', color: COLORS.text, marginBottom: '24px' }}>Pacientes</h1>
      <input type="text" placeholder="🔍 Buscar paciente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...inputStyle, marginBottom: '24px' }} />
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: COLORS.light }}><th style={{ padding: '16px 20px', textAlign: 'left', color: COLORS.textLight, fontSize: '13px' }}>Paciente</th><th style={{ padding: '16px 20px', textAlign: 'left', color: COLORS.textLight, fontSize: '13px' }}>Telefone</th><th style={{ padding: '16px 20px', textAlign: 'left', color: COLORS.textLight, fontSize: '13px' }}>Risco</th><th style={{ padding: '16px 20px', textAlign: 'right', color: COLORS.textLight, fontSize: '13px' }}>Ação</th></tr></thead>
          <tbody>
            {filteredPatients.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: '16px 20px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '42px', height: '42px', background: COLORS.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.white, fontWeight: '600' }}>{p.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}</div><div><p style={{ fontWeight: '600', color: COLORS.text, margin: 0 }}>{p.name}</p><p style={{ fontSize: '12px', color: COLORS.textLight, margin: 0 }}>{p.email}</p></div></div></td>
                <td style={{ padding: '16px 20px', color: COLORS.textLight }}>{p.phone || '-'}</td>
                <td style={{ padding: '16px 20px' }}><span style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', background: p.risk_level === 'high' ? '#ffe0e0' : '#e0f0ff', color: p.risk_level === 'high' ? COLORS.danger : COLORS.primary }}>{p.risk_level === 'high' ? 'Alto' : 'Baixo'}</span></td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}><button onClick={() => loadPatientDetails(p)} style={{ background: COLORS.light, border: 'none', padding: '10px 18px', borderRadius: '8px', color: COLORS.primary, cursor: 'pointer' }}>Ver Ficha</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPatients.length === 0 && <p style={{ padding: '48px', textAlign: 'center', color: COLORS.textLight }}>Nenhum paciente encontrado</p>}
      </div>
    </div>
  );

  const PatientDetail = () => {
    const [showSessionForm, setShowSessionForm] = useState(false);
    const [sessionNotes, setSessionNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const p = selectedPatient; if (!p) return null;
    const handleSaveSession = async () => { setSaving(true); try { await psychologistService.createSession({ patient_id: p.id, psychologist_id: user.id, session_date: new Date().toISOString().split('T')[0], session_type: 'regular', session_notes: sessionNotes, status: 'completed' }); const { data } = await psychologistService.getPatientSessions(p.id); setPatientSessions(data || []); setShowSessionForm(false); setSessionNotes(''); } catch (err) { alert('Erro: ' + err.message); } finally { setSaving(false); } };
    return (
      <div>
        <button onClick={() => { setSelectedPatient(null); setCurrentPage('patients'); }} style={{ background: 'none', border: 'none', color: COLORS.primary, cursor: 'pointer', marginBottom: '20px' }}>← Voltar</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', background: COLORS.primary, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.white, fontWeight: '700', fontSize: '28px' }}>{p.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
            <div><h1 style={{ fontSize: '28px', color: COLORS.text, margin: 0 }}>{p.name}</h1><p style={{ color: COLORS.textLight, margin: '4px 0 0' }}>{p.email} • {p.phone}</p></div>
          </div>
          <button onClick={() => setShowSessionForm(true)} style={btnPrimary}>+ Nova Sessão</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={cardStyle}><h3 style={{ marginBottom: '16px', color: COLORS.text }}>Recaídas ({patientRelapses.length})</h3>{patientRelapses.length === 0 ? <p style={{ color: COLORS.textLight }}>Nenhuma 🎉</p> : patientRelapses.slice(0,5).map(r => (<div key={r.id} style={{ padding: '12px', background: '#fff8f8', borderRadius: '8px', marginBottom: '8px', borderLeft: '4px solid ' + COLORS.danger }}><span style={{ color: COLORS.textLight }}>{new Date(r.date).toLocaleDateString('pt-BR')}</span> - <span style={{ color: COLORS.danger }}>R$ {r.amount || 0}</span></div>))}</div>
          <div style={cardStyle}><h3 style={{ marginBottom: '16px', color: COLORS.text }}>Sessões ({patientSessions.length})</h3>{patientSessions.length === 0 ? <p style={{ color: COLORS.textLight }}>Nenhuma</p> : patientSessions.slice(0,5).map(s => (<div key={s.id} style={{ padding: '12px', background: COLORS.light, borderRadius: '8px', marginBottom: '8px' }}><span style={{ color: COLORS.textLight }}>{new Date(s.session_date).toLocaleDateString('pt-BR')}</span><p style={{ margin: '4px 0 0', color: COLORS.text, fontSize: '14px' }}>{s.session_notes?.slice(0,50) || 'Sem notas'}...</p></div>))}</div>
        </div>
        {showSessionForm && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><div style={{ background: COLORS.white, borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '500px' }}><h2 style={{ marginBottom: '24px', color: COLORS.text }}>Nova Sessão</h2><textarea value={sessionNotes} onChange={e => setSessionNotes(e.target.value)} placeholder="Anotações da sessão..." style={{ ...inputStyle, minHeight: '150px', marginBottom: '24px' }} /><div style={{ display: 'flex', gap: '12px' }}><button onClick={() => setShowSessionForm(false)} style={{ flex: 1, padding: '14px', background: COLORS.light, border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Cancelar</button><button onClick={handleSaveSession} disabled={saving} style={{ ...btnPrimary, flex: 1 }}>{saving ? 'Salvando...' : 'Salvar'}</button></div></div></div>}
      </div>
    );
  };

  const GroupsPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [formName, setFormName] = useState('');
    const [formDay, setFormDay] = useState(1);
    const [formTime, setFormTime] = useState('19:00');
    const [formLink, setFormLink] = useState('');
    const [saving, setSaving] = useState(false);
    const handleCreate = async () => { setSaving(true); try { await psychologistService.createGroup({ name: formName, day_of_week: formDay, time: formTime, meeting_link: formLink, psychologist_id: user.id, is_active: true, max_participants: 12 }); const { data } = await psychologistService.getMyGroups(user.id); setGroups(data || []); setShowForm(false); setFormName(''); } catch (err) { alert('Erro: ' + err.message); } finally { setSaving(false); } };
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}><h1 style={{ fontSize: '28px', color: COLORS.text, margin: 0 }}>Grupos</h1><button onClick={() => setShowForm(true)} style={btnPrimary}>+ Novo Grupo</button></div>
        {groups.length === 0 ? <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}><p style={{ color: COLORS.textLight, fontSize: '16px' }}>Nenhum grupo cadastrado</p></div> : groups.map(g => (<div key={g.id} style={{ ...cardStyle, marginBottom: '16px' }}><h3 style={{ color: COLORS.text, margin: '0 0 8px' }}>{g.name}</h3><p style={{ color: COLORS.textLight, margin: 0 }}>{['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][g.day_of_week]} às {g.time?.slice(0,5)}</p>{g.meeting_link && <a href={g.meeting_link} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.primary, display: 'inline-block', marginTop: '12px' }}>Abrir reunião →</a>}</div>))}
        {showForm && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><div style={{ background: COLORS.white, borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '400px' }}><h2 style={{ marginBottom: '24px', color: COLORS.text }}>Novo Grupo</h2><input type="text" placeholder="Nome do grupo" value={formName} onChange={e => setFormName(e.target.value)} style={{ ...inputStyle, marginBottom: '16px' }} /><select value={formDay} onChange={e => setFormDay(parseInt(e.target.value))} style={{ ...inputStyle, marginBottom: '16px' }}>{['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((d,i) => <option key={i} value={i}>{d}</option>)}</select><input type="time" value={formTime} onChange={e => setFormTime(e.target.value)} style={{ ...inputStyle, marginBottom: '16px' }} /><input type="url" placeholder="Link da reunião" value={formLink} onChange={e => setFormLink(e.target.value)} style={{ ...inputStyle, marginBottom: '24px' }} /><div style={{ display: 'flex', gap: '12px' }}><button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '14px', background: COLORS.light, border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Cancelar</button><button onClick={handleCreate} disabled={saving || !formName} style={{ ...btnPrimary, flex: 1 }}>{saving ? '...' : 'Criar'}</button></div></div></div>}
      </div>
    );
  };

  const RequestsPage = () => {
    const handleUpdate = async (id, status) => { await psychologistService.updateContactRequest(id, { status }, user.id); const { data } = await psychologistService.getContactRequests(); setContactRequests(data || []); };
    return (
      <div>
        <h1 style={{ fontSize: '28px', color: COLORS.text, marginBottom: '24px' }}>Solicitações</h1>
        {contactRequests.length === 0 ? <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}><p style={{ color: COLORS.textLight }}>Nenhuma solicitação</p></div> : contactRequests.map(r => (<div key={r.id} style={{ ...cardStyle, marginBottom: '16px', borderLeft: '4px solid ' + (r.urgency === 'urgent' ? COLORS.warning : COLORS.primary), opacity: r.status === 'pending' ? 1 : 0.6 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><h3 style={{ color: COLORS.text, margin: 0 }}>{r.name}</h3><span style={{ color: COLORS.textLight, fontSize: '13px' }}>{new Date(r.created_at).toLocaleDateString('pt-BR')}</span></div><p style={{ color: COLORS.textLight, margin: '0 0 12px' }}>{r.phone} • {r.email}</p>{r.message && <p style={{ background: COLORS.light, padding: '12px', borderRadius: '8px', margin: '0 0 16px', color: COLORS.text }}>"{r.message}"</p>}{r.status === 'pending' && <div style={{ display: 'flex', gap: '12px' }}><button onClick={() => handleUpdate(r.id, 'contacted')} style={{ ...btnPrimary, flex: 1, padding: '10px' }}>Contatado</button><button onClick={() => handleUpdate(r.id, 'archived')} style={{ flex: 1, padding: '10px', background: COLORS.light, border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Arquivar</button></div>}</div>))}
      </div>
    );
  };

  const TeamPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formCrp, setFormCrp] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const handleCreate = async () => { if (!formEmail || !formName || !formCrp) { alert('Preencha nome, email e CRP'); return; } setSaving(true); try { await supabase.from('psychologists').insert({ name: formName, email: formEmail, crp: formCrp, phone: formPhone, is_active: true }); const { data } = await supabase.from('psychologists').select('*').order('name'); setTeam(data || []); setShowForm(false); setFormName(''); setFormEmail(''); setFormCrp(''); setFormPhone(''); alert('Cadastrado! O psicólogo deve criar conta com este email.'); } catch (err) { alert('Erro: ' + err.message); } finally { setSaving(false); } };
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}><h1 style={{ fontSize: '28px', color: COLORS.text, margin: 0 }}>Equipe</h1><button onClick={() => setShowForm(true)} style={btnPrimary}>+ Novo Psicólogo</button></div>
        {team.map(p => (<div key={p.id} style={{ ...cardStyle, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}><div style={{ width: '56px', height: '56px', background: COLORS.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.white, fontWeight: '600', fontSize: '18px' }}>{p.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div><div><h3 style={{ color: COLORS.text, margin: '0 0 4px' }}>{p.name}</h3><p style={{ color: COLORS.textLight, margin: 0, fontSize: '14px' }}>{p.crp} • {p.email}</p></div></div>))}
        {showForm && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><div style={{ background: COLORS.white, borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '400px' }}><h2 style={{ marginBottom: '24px', color: COLORS.text }}>Novo Psicólogo</h2><input type="text" placeholder="Nome completo" value={formName} onChange={e => setFormName(e.target.value)} style={{ ...inputStyle, marginBottom: '16px' }} /><input type="email" placeholder="Email" value={formEmail} onChange={e => setFormEmail(e.target.value)} style={{ ...inputStyle, marginBottom: '16px' }} /><input type="text" placeholder="CRP" value={formCrp} onChange={e => setFormCrp(e.target.value)} style={{ ...inputStyle, marginBottom: '16px' }} /><input type="tel" placeholder="Telefone" value={formPhone} onChange={e => setFormPhone(e.target.value)} style={{ ...inputStyle, marginBottom: '24px' }} /><div style={{ display: 'flex', gap: '12px' }}><button onClick={() => setShowForm(false)} style={{ flex: 1, padding: '14px', background: COLORS.light, border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Cancelar</button><button onClick={handleCreate} disabled={saving} style={{ ...btnPrimary, flex: 1 }}>{saving ? '...' : 'Cadastrar'}</button></div></div></div>}
      </div>
    );
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'patients': return <PatientsList />;
      case 'patient-detail': return <PatientDetail />;
      case 'groups': return <GroupsPage />;
      case 'requests': return <RequestsPage />;
      case 'team': return <TeamPage />;
      default: return <Dashboard />;
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.light }}><p style={{ color: COLORS.primary }}>Carregando...</p></div>;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: COLORS.light, minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: '260px', padding: '32px 40px' }}>{renderPage()}</main>
    </div>
  );
};

export default PsychologistPanel;
