import React, { useState, useEffect } from 'react';
import { supabase, checkUserType, signIn, signOut, signUp } from './services/supabase';
import PatientApp from './pages/paciente/PatientApp';
import PsychologistPanel from './pages/psicologo/PsychologistPanel';

const COLORS = { primary: '#1a3a6a', primaryLight: '#2a4a8a', primaryDark: '#0f2847', accent: '#5b9bd5', success: '#28a068', warning: '#e8a040', danger: '#d04040', light: '#f0f4f8', border: '#d0d8e0', text: '#1a2a3a', textLight: '#5a6a7a', white: '#fff' };

const Logo = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 15 C30 15 15 30 15 45 C15 70 50 85 50 85 C50 85 85 70 85 45 C85 30 70 15 50 15 Z" stroke={COLORS.primary} strokeWidth="3" fill="none"/>
    <path d="M35 42 C35 38 38 35 42 35 L45 35 L45 55 L42 55 C38 55 35 52 35 48 Z" fill={COLORS.primary}/>
    <path d="M55 35 L58 35 C62 35 65 38 65 42 L65 48 C65 52 62 55 58 55 L55 55 Z" fill={COLORS.primary}/>
    <path d="M45 42 L55 42 L55 48 L45 48 Z" fill={COLORS.primary}/>
    <circle cx="42" cy="60" r="3" fill={COLORS.primary}/>
    <circle cx="58" cy="60" r="3" fill={COLORS.primary}/>
    <path d="M42 63 Q50 70 58 63" stroke={COLORS.primary} strokeWidth="2" fill="none"/>
  </svg>
);

const LoginPage = ({ onLogin, error, setError }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        const { data, error } = await signUp(formData.email, formData.password, { name: formData.name, phone: formData.phone });
        if (error) throw error;
        if (data.user) {
          await supabase.from('patients').insert({ id: data.user.id, email: formData.email, name: formData.name, phone: formData.phone });
          setError('Cadastro realizado! Verifique seu email para confirmar.');
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        onLogin(data.user);
      }
    } catch (err) { setError(err.message || 'Erro. Tente novamente.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${COLORS.light} 0%, #e0e8f0 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: COLORS.white, borderRadius: '24px', padding: '48px 40px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(26,58,106,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ width: '100px', height: '100px', margin: '0 auto 20px', background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(26,58,106,0.3)' }}>
            <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
              <path d="M50 20 C35 20 20 32 20 48 C20 72 50 82 50 82 C50 82 80 72 80 48 C80 32 65 20 50 20 Z" stroke="white" strokeWidth="3" fill="none"/>
              <path d="M32 48 L42 48 L42 38 C42 34 45 32 48 32 L48 58 L42 58 L42 52 L32 52 Z" fill="white"/>
              <path d="M68 48 L58 48 L58 38 C58 34 55 32 52 32 L52 58 L58 58 L58 52 L68 52 Z" fill="white"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '28px', color: COLORS.primary, fontFamily: 'Poppins, sans-serif', fontWeight: '700', margin: '0 0 8px' }}>APAJ</h1>
          <p style={{ color: COLORS.textLight, fontSize: '14px', margin: 0 }}>Associação de Proteção e Apoio ao Jogador</p>
        </div>

        {error && <div style={{ background: error.includes('realizado') ? '#e8f5e9' : '#ffebee', color: error.includes('realizado') ? COLORS.success : COLORS.danger, padding: '14px 18px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', color: COLORS.text, fontWeight: '500', marginBottom: '8px', fontSize: '14px' }}>Nome completo</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '14px 18px', border: `2px solid ${COLORS.border}`, borderRadius: '12px', fontSize: '16px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border} />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', color: COLORS.text, fontWeight: '500', marginBottom: '8px', fontSize: '14px' }}>Telefone (WhatsApp)</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '14px 18px', border: `2px solid ${COLORS.border}`, borderRadius: '12px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </>
          )}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', color: COLORS.text, fontWeight: '500', marginBottom: '8px', fontSize: '14px' }}>E-mail</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required style={{ width: '100%', padding: '14px 18px', border: `2px solid ${COLORS.border}`, borderRadius: '12px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', color: COLORS.text, fontWeight: '500', marginBottom: '8px', fontSize: '14px' }}>Senha</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} style={{ width: '100%', padding: '14px 18px', border: `2px solid ${COLORS.border}`, borderRadius: '12px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? COLORS.textLight : `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, color: COLORS.white, border: 'none', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '20px', boxShadow: loading ? 'none' : '0 4px 15px rgba(26,58,106,0.3)' }}>{loading ? 'Aguarde...' : (isSignUp ? 'Criar Conta' : 'Entrar')}</button>
        </form>

        <p style={{ textAlign: 'center', color: COLORS.textLight, fontSize: '14px' }}>{isSignUp ? 'Já tem conta?' : 'Não tem conta?'}{' '}<button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} style={{ background: 'none', border: 'none', color: COLORS.primary, fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}>{isSignUp ? 'Entrar' : 'Cadastre-se'}</button></p>

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <p style={{ color: COLORS.textLight, fontSize: '13px', margin: '0 0 8px' }}>Precisa de ajuda urgente?</p>
          <p style={{ color: COLORS.primary, fontSize: '15px', fontWeight: '600', margin: 0 }}>📞 CVV: 188 (24h)</p>
        </div>
      </div>
    </div>
  );
};

const LoadingScreen = () => (
  <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${COLORS.light} 0%, #e0e8f0 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
    <div style={{ width: '80px', height: '80px', background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2s infinite' }}>
      <svg width="48" height="48" viewBox="0 0 100 100" fill="none"><path d="M50 20 C35 20 20 32 20 48 C20 72 50 82 50 82 C50 82 80 72 80 48 C80 32 65 20 50 20 Z" stroke="white" strokeWidth="3" fill="none"/></svg>
    </div>
    <p style={{ color: COLORS.primary, fontWeight: '500' }}>Carregando...</p>
    <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }`}</style>
  </div>
);

const App = () => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) { setUser(session.user); const { type } = await checkUserType(session.user.id); setUserType(type); }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) { setUser(session.user); const { type } = await checkUserType(session.user.id); setUserType(type); }
      else if (event === 'SIGNED_OUT') { setUser(null); setUserType(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (user) => { setUser(user); const { type } = await checkUserType(user.id); setUserType(type); };
  const handleLogout = async () => { await signOut(); setUser(null); setUserType(null); };

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginPage onLogin={handleLogin} error={error} setError={setError} />;
  if (userType === 'psychologist') return <PsychologistPanel user={user} onLogout={handleLogout} />;
  return <PatientApp user={user} onLogout={handleLogout} />;
};

export default App;
