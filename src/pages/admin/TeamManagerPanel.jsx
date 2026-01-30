import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

// ============================================
// PALETA DE CORES APAJ - Azul
// ============================================
const colors = {
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    primaryLight: '#3b82f6',
    accent: '#0ea5e9',
    background: '#f0f9ff',
    surface: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    border: '#e2e8f0',
    sidebarBg: 'linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)',
    sidebarText: '#94a3b8',
    sidebarActive: 'rgba(37, 99, 235, 0.2)',
};

const TeamManagerPanel = ({ user, onLogout }) => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [psychologists, setPsychologists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        crp: '',
        phone: '',
        specialty: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadPsychologists();
    }, []);

    const loadPsychologists = async () => {
        try {
            const { data, error } = await supabase
                .from('psychologists')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPsychologists(data || []);
        } catch (err) {
            console.error('Erro ao carregar psicólogos:', err);
        } finally {
            setLoading(false);
        }
    };

    const createPsychologist = async (e) => {
        e.preventDefault();
        setCreating(true);
        setError('');
        setSuccess('');

        try {
            // 1. Criar usuário no Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: formData.email,
                password: formData.password,
                email_confirm: true // Confirma o email automaticamente
            });

            // Se não tiver permissão de admin, tentar criar via signUp normal
            if (authError) {
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password
                });

                if (signUpError) throw signUpError;

                if (signUpData.user) {
                    // Criar perfil do psicólogo
                    const { error: insertError } = await supabase.from('psychologists').insert({
                        id: signUpData.user.id,
                        email: formData.email,
                        name: formData.name,
                        crp: formData.crp,
                        phone: formData.phone,
                        specialty: formData.specialty,
                        status: 'active',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });

                    if (insertError) throw insertError;
                }
            } else if (authData.user) {
                // Criar perfil do psicólogo
                const { error: insertError } = await supabase.from('psychologists').insert({
                    id: authData.user.id,
                    email: formData.email,
                    name: formData.name,
                    crp: formData.crp,
                    phone: formData.phone,
                    specialty: formData.specialty,
                    status: 'active',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

                if (insertError) throw insertError;
            }

            setSuccess(`✅ Psicólogo ${formData.name} criado com sucesso!`);
            setFormData({ email: '', password: '', name: '', crp: '', phone: '', specialty: '' });
            setShowCreateForm(false);
            loadPsychologists();
        } catch (err) {
            setError(err.message || 'Erro ao criar psicólogo. Tente novamente.');
        } finally {
            setCreating(false);
        }
    };

    // Styles
    const cardStyle = {
        background: colors.surface,
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(37, 99, 235, 0.08)',
        border: `1px solid ${colors.border}`
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 18px',
        border: `2px solid ${colors.border}`,
        borderRadius: '12px',
        fontSize: '15px',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease',
        background: colors.surface
    };

    const btnPrimary = {
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        color: '#fff',
        border: 'none',
        padding: '14px 28px',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '15px',
        boxShadow: `0 4px 12px ${colors.primary}30`,
        transition: 'all 0.3s ease'
    };

    // Sidebar
    const Sidebar = () => (
        <aside style={{ width: '270px', background: colors.sidebarBg, minHeight: '100vh', padding: '28px 0', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0 24px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '52px', height: '52px', background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', boxShadow: `0 8px 16px ${colors.primary}40` }}>💙</div>
                <div><h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '700' }}>APAJ</h1><p style={{ color: colors.sidebarText, fontSize: '12px' }}>Gerenciador de Equipe</p></div>
            </div>
            <nav style={{ padding: '0 14px', flex: 1 }}>
                {[
                    { id: 'dashboard', icon: '📊', label: 'Painel' },
                    { id: 'psychologists', icon: '👨‍⚕️', label: 'Psicólogos' },
                    { id: 'stats', icon: '📈', label: 'Estatísticas' }
                ].map(item => (
                    <button key={item.id} onClick={() => setCurrentPage(item.id)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: currentPage === item.id ? colors.sidebarActive : 'transparent', border: 'none', borderRadius: '12px', color: currentPage === item.id ? '#fff' : colors.sidebarText, cursor: 'pointer', marginBottom: '6px', textAlign: 'left', transition: 'all 0.2s ease' }}>
                        <span style={{ fontSize: '22px' }}>{item.icon}</span>
                        <span style={{ fontSize: '15px', fontWeight: currentPage === item.id ? '600' : '400' }}>{item.label}</span>
                    </button>
                ))}
            </nav>
            <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ width: '44px', height: '44px', background: `linear-gradient(135deg, ${colors.warning} 0%, #ea580c 100%)`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '15px' }}>👑</div>
                    <div><p style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>Administrador</p><p style={{ color: colors.sidebarText, fontSize: '12px' }}>Team Manager</p></div>
                </div>
                <button onClick={onLogout} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: colors.sidebarText, cursor: 'pointer', fontWeight: '500' }}>Sair do Sistema</button>
            </div>
        </aside>
    );

    // Dashboard
    const Dashboard = () => (
        <div>
            <h1 style={{ fontSize: '32px', color: colors.textPrimary, marginBottom: '8px', fontWeight: '700' }}>Gerenciador de Equipe 👑</h1>
            <p style={{ color: colors.textSecondary, marginBottom: '32px', fontSize: '16px' }}>Gerencie os profissionais da sua equipe</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                <div style={cardStyle}>
                    <span style={{ fontSize: '32px' }}>👨‍⚕️</span>
                    <p style={{ fontSize: '40px', fontWeight: '700', color: colors.primary, margin: '12px 0 6px' }}>{psychologists.length}</p>
                    <p style={{ fontSize: '14px', color: colors.textSecondary }}>Psicólogos Ativos</p>
                </div>
                <div style={cardStyle}>
                    <span style={{ fontSize: '32px' }}>👥</span>
                    <p style={{ fontSize: '40px', fontWeight: '700', color: colors.success, margin: '12px 0 6px' }}>--</p>
                    <p style={{ fontSize: '14px', color: colors.textSecondary }}>Total de Pacientes</p>
                </div>
                <div style={cardStyle}>
                    <span style={{ fontSize: '32px' }}>📅</span>
                    <p style={{ fontSize: '40px', fontWeight: '700', color: colors.accent, margin: '12px 0 6px' }}>--</p>
                    <p style={{ fontSize: '14px', color: colors.textSecondary }}>Sessões este Mês</p>
                </div>
            </div>

            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', color: colors.textPrimary, fontWeight: '600' }}>Psicólogos Recentes</h2>
                    <button onClick={() => setCurrentPage('psychologists')} style={{ ...btnPrimary, padding: '10px 20px', fontSize: '14px' }}>Ver Todos</button>
                </div>
                {psychologists.slice(0, 3).map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: colors.background, borderRadius: '14px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '48px', height: '48px', background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '15px' }}>{p.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'PS'}</div>
                            <div><p style={{ fontWeight: '600', color: colors.textPrimary }}>{p.name}</p><p style={{ fontSize: '13px', color: colors.textSecondary }}>{p.crp}</p></div>
                        </div>
                        <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: `${colors.success}15`, color: colors.success }}>Ativo</span>
                    </div>
                ))}
                {psychologists.length === 0 && <p style={{ textAlign: 'center', color: colors.textMuted, padding: '24px' }}>Nenhum psicólogo cadastrado ainda</p>}
            </div>
        </div>
    );

    // Lista de Psicólogos
    const PsychologistsList = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', color: colors.textPrimary, fontWeight: '700' }}>Psicólogos</h1>
                    <p style={{ color: colors.textSecondary, fontSize: '15px' }}>{psychologists.length} profissional{psychologists.length !== 1 ? 'is' : ''} cadastrado{psychologists.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setShowCreateForm(true)} style={btnPrimary}>+ Novo Psicólogo</button>
            </div>

            {error && <div style={{ background: '#fef2f2', color: colors.error, padding: '14px 18px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>{error}</div>}
            {success && <div style={{ background: `${colors.success}15`, color: colors.success, padding: '14px 18px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>{success}</div>}

            {showCreateForm && (
                <div style={{ ...cardStyle, marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', color: colors.textPrimary, marginBottom: '24px', fontWeight: '600' }}>Cadastrar Novo Psicólogo</h2>
                    <form onSubmit={createPsychologist}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', color: colors.textPrimary, fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Nome Completo *</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Dr. João Silva" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: colors.textPrimary, fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>CRP *</label>
                                <input type="text" value={formData.crp} onChange={(e) => setFormData({ ...formData, crp: e.target.value })} required placeholder="00/00000" style={inputStyle} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', color: colors.textPrimary, fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>E-mail *</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required placeholder="psicologo@email.com" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: colors.textPrimary, fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Senha *</label>
                                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} placeholder="Mínimo 6 caracteres" style={inputStyle} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', color: colors.textPrimary, fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Telefone</label>
                                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 00000-0000" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: colors.textPrimary, fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>Especialidade</label>
                                <input type="text" value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} placeholder="Ex: Dependência Química" style={inputStyle} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" disabled={creating} style={{ ...btnPrimary, opacity: creating ? 0.7 : 1 }}>{creating ? '⏳ Criando...' : 'Criar Psicólogo'}</button>
                            <button type="button" onClick={() => setShowCreateForm(false)} style={{ ...btnPrimary, background: colors.textMuted }}>Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: colors.background }}>
                        <th style={{ padding: '18px 24px', textAlign: 'left', color: colors.textSecondary, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Profissional</th>
                        <th style={{ padding: '18px 24px', textAlign: 'left', color: colors.textSecondary, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CRP</th>
                        <th style={{ padding: '18px 24px', textAlign: 'left', color: colors.textSecondary, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contato</th>
                        <th style={{ padding: '18px 24px', textAlign: 'left', color: colors.textSecondary, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                    </tr></thead>
                    <tbody>
                        {psychologists.map(p => (
                            <tr key={p.id} style={{ borderTop: `1px solid ${colors.border}` }}>
                                <td style={{ padding: '18px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{ width: '44px', height: '44px', background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '14px' }}>{p.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'PS'}</div>
                                        <div><p style={{ fontWeight: '600', color: colors.textPrimary }}>{p.name}</p><p style={{ fontSize: '13px', color: colors.textSecondary }}>{p.specialty || 'Psicologia Geral'}</p></div>
                                    </div>
                                </td>
                                <td style={{ padding: '18px 24px', color: colors.textPrimary, fontWeight: '500' }}>{p.crp}</td>
                                <td style={{ padding: '18px 24px' }}>
                                    <p style={{ color: colors.textPrimary, fontSize: '14px' }}>{p.email}</p>
                                    <p style={{ color: colors.textSecondary, fontSize: '13px' }}>{p.phone || '-'}</p>
                                </td>
                                <td style={{ padding: '18px 24px' }}>
                                    <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: p.status === 'active' ? `${colors.success}15` : '#f1f5f9', color: p.status === 'active' ? colors.success : colors.textMuted }}>{p.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {psychologists.length === 0 && <p style={{ padding: '48px', textAlign: 'center', color: colors.textMuted, fontSize: '15px' }}>Nenhum psicólogo cadastrado. Clique em "Novo Psicólogo" para adicionar.</p>}
            </div>
        </div>
    );

    // Render
    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard': return <Dashboard />;
            case 'psychologists': return <PsychologistsList />;
            case 'stats': return <div style={cardStyle}><h2 style={{ color: colors.textPrimary }}>📈 Estatísticas</h2><p style={{ color: colors.textSecondary, marginTop: '12px' }}>Em breve: relatórios detalhados sobre a equipe.</p></div>;
            default: return <Dashboard />;
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${colors.background} 0%, #dbeafe 100%)` }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px', boxShadow: `0 8px 20px ${colors.primary}30` }}>👑</div>
                <p style={{ color: colors.textSecondary, fontSize: '15px' }}>Carregando...</p>
            </div>
        </div>
    );

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", background: colors.background, minHeight: '100vh', display: 'flex' }}>
            <Sidebar />
            <main style={{ flex: 1, marginLeft: '270px', padding: '36px 44px' }}>{renderPage()}</main>
        </div>
    );
};

export default TeamManagerPanel;
