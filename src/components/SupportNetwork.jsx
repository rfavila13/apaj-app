import React, { useState } from 'react'

const C = {
  trueBlue: '#1d3f77', alaskanBlue: '#66aae2', iceMelt: '#d4eaff',
  blackRobe: '#2b2b2b', blancDeBlanc: '#e9e9ea', white: '#ffffff',
  success: '#28a068', warning: '#e8a040', danger: '#d04040'
}

const SECTIONS = [
  { id: 'emergency', label: '🆘 Emergência', color: C.danger },
  { id: 'gambling', label: '🎲 Jogo Patológico', color: C.trueBlue },
  { id: 'sus', label: '🏥 SUS / CAPS', color: C.success },
  { id: 'policies', label: '⚖️ Políticas Públicas', color: C.warning },
  { id: 'financial', label: '💰 Apoio Financeiro', color: C.alaskanBlue },
]

const EMERGENCY = [
  {
    emoji: '💙', name: 'CVV — Centro de Valorização da Vida', number: '188',
    desc: 'Apoio emocional e prevenção ao suicídio. Disponível 24 horas por dia, 7 dias por semana. Gratuito de qualquer telefone fixo ou celular.',
    badge: '24h • Gratuito', color: '#e3f2fd'
  },
  {
    emoji: '🚑', name: 'SAMU — Serviço de Atendimento Móvel', number: '192',
    desc: 'Emergências médicas e psiquiátricas. Se você ou alguém estiver em crise aguda, ligue imediatamente.',
    badge: '24h • Gratuito', color: '#ffebee'
  },
  {
    emoji: '🏥', name: 'UPA / Pronto-Socorro', number: '192',
    desc: 'Para crises de saúde mental, você pode ir diretamente à UPA ou pronto-socorro do SUS mais próximo. Não é necessário agendamento.',
    badge: '24h • SUS', color: '#e8f5e9'
  },
  {
    emoji: '👮', name: 'Polícia Militar', number: '190',
    desc: 'Em caso de risco imediato à segurança própria ou de familiares. Pode acionar o SAMU simultaneamente.',
    badge: '24h • Gratuito', color: '#fff3e0'
  },
]

const GAMBLING = [
  {
    emoji: '🎲', name: 'Jogadores Anônimos Brasil', phone: '(11) 3392-9544',
    desc: 'Programa gratuito de 12 passos para jogadores compulsivos. Reuniões presenciais em todo o Brasil e online. Anonimato garantido.',
    detail: 'Busque "Jogadores Anônimos" na sua cidade. Reuniões abertas e fechadas disponíveis.',
    color: '#e3f2fd'
  },
  {
    emoji: '👨‍👩‍👧', name: 'Gam-Anon — Apoio à Família', phone: '(11) 3392-9544',
    desc: 'Grupo de apoio para familiares e amigos de jogadores compulsivos. Ajuda para entender a doença e estabelecer limites saudáveis.',
    detail: 'Parceiro oficial dos Jogadores Anônimos. Reuniões semanais em todo o Brasil.',
    color: '#e8f5e9'
  },
  {
    emoji: '🧠', name: 'CAPS AD — Tratamento Especializado', phone: 'Veja aba SUS/CAPS',
    desc: 'Os Centros de Atenção Psicossocial oferecem tratamento gratuito para jogo patológico, incluindo psicoterapia e suporte médico.',
    detail: 'Procure o CAPS AD da sua cidade. Não precisa de encaminhamento médico em muitas cidades.',
    color: '#fff9e6'
  },
  {
    emoji: '📞', name: 'IPOG — Instituto Psicologia do Jogo', phone: 'Contato via site',
    desc: 'Instituto especializado em pesquisa e tratamento de dependência de jogos no Brasil. Oferece orientações e encaminhamentos.',
    detail: 'Referência nacional em tratamento do jogo patológico.',
    color: '#f3e5f5'
  },
]

const SUS_SERVICES = [
  {
    emoji: '🏛️', name: 'CAPS AD — Centro de Atenção Psicossocial', highlight: true,
    desc: 'Principal porta de entrada para tratamento GRATUITO de dependência de jogos pelo SUS. Oferece psicoterapia individual e em grupo, acompanhamento psiquiátrico, suporte social e familiar.',
    how: '1. Vá à UBS (postinho) do seu bairro e peça encaminhamento\n2. Ou vá diretamente ao CAPS AD — muitas cidades aceitam entrada espontânea\n3. Leve RG e Cartão SUS\n4. Informe que o motivo é dependência de jogos/apostas',
    color: '#e8f5e9'
  },
  {
    emoji: '🏥', name: 'UBS — Unidade Básica de Saúde',
    desc: 'O postinho de saúde do seu bairro é o primeiro passo. Médicos de família podem iniciar o tratamento, prescrever medicação e encaminhar para especialistas sem custo.',
    how: 'Vá à UBS mais próxima e diga que precisa de apoio para dependência de jogos/apostas. O médico fará a avaliação inicial.',
    color: '#e3f2fd'
  },
  {
    emoji: '🌐', name: 'RAPS — Rede de Atenção Psicossocial',
    desc: 'Rede integrada do SUS com CAPS, UBS, hospitais e leitos especializados em saúde mental. Você tem direito a atendimento completo e gratuito.',
    how: 'Acesse pelo CAPS AD ou UBS da sua cidade. O próprio sistema te encaminhará para o nível de cuidado adequado.',
    color: '#fff3e0'
  },
  {
    emoji: '📲', name: 'ConecteSUS — App do Ministério da Saúde',
    desc: 'Plataforma digital do Ministério da Saúde para agendar consultas, ver histórico de atendimentos, acessar serviços de saúde e encontrar unidades próximas.',
    how: 'Baixe o app "ConecteSUS" na App Store ou Google Play. Faça login com o CPF e acesse seus dados de saúde.',
    color: '#f3e5f5'
  },
  {
    emoji: '🗺️', name: 'Como Encontrar o CAPS AD Mais Próximo',
    desc: 'Use o site do DATASUS ou o portal da Saúde do Governo Federal para localizar o CAPS AD mais próximo da sua residência.',
    how: 'Acesse "cnes.datasus.gov.br" e filtre por tipo: CAPS → CAPS AD. Ou pergunte no postinho de saúde do seu bairro.',
    color: '#e8f5e9'
  },
]

const POLICIES = [
  {
    emoji: '⚖️', name: 'Lei das Apostas Esportivas (13.756/2018 e Decreto 11.816/2023)',
    desc: 'Regulamenta apostas de quota fixa no Brasil. Empresas devem ser licenciadas pelo Ministério da Fazenda, implementar jogo responsável e oferecer autoexclusão.',
    rights: 'Direito à autoexclusão por até 5 anos em qualquer plataforma licenciada.'
  },
  {
    emoji: '🛡️', name: 'SENACON — Proteção do Consumidor nas Bets',
    desc: 'O SENACON (Secretaria Nacional do Consumidor, Ministério da Justiça) fiscaliza práticas abusivas das plataformas de apostas. Você pode registrar reclamações.',
    rights: 'Registre reclamações em consumidor.gov.br ou ligue 151 (Procon).'
  },
  {
    emoji: '💳', name: 'Restrição de Crédito para Apostas (Resolução BCB 2024)',
    desc: 'O Banco Central proibiu bancos de conceder crédito para apostas em plataformas não regulamentadas e limitou pagamentos com cartão de crédito em bets.',
    rights: 'Se seu banco desrespeitou esta regra, denuncie ao Banco Central em bcb.gov.br.'
  },
  {
    emoji: '🚫', name: 'Autoexclusão Obrigatória nas Plataformas',
    desc: 'Toda plataforma licenciada deve oferecer a opção de autoexclusão com prazo mínimo de 6 meses. A exclusão deve ser processada em até 48 horas.',
    rights: 'Acesse as configurações de conta na plataforma e procure "jogo responsável" ou "autoexclusão".'
  },
  {
    emoji: '🏛️', name: 'SENAD — Política Nacional sobre Drogas',
    desc: 'A Secretaria Nacional de Políticas sobre Drogas coordena ações de prevenção e tratamento de dependências, incluindo jogo patológico, em todo o Brasil.',
    rights: 'Acesse senad.mj.gov.br para informações sobre políticas e serviços disponíveis.'
  },
  {
    emoji: '📊', name: 'CID-11: Jogo Patológico como Doença',
    desc: 'O jogo patológico (Transtorno de Jogo, CID-11: 6C50) é reconhecido pela OMS como doença. Isso garante direito a tratamento pelo SUS e em planos de saúde.',
    rights: 'Peça ao médico o diagnóstico formal para garantir cobertura em planos de saúde.'
  },
]

const FINANCIAL = [
  {
    emoji: '💰', name: 'Serasa Limpa Nome',
    desc: 'Programa de negociação de dívidas com descontos de até 99%. Acesse pelo site ou app da Serasa para renegociar dívidas diretamente com os credores.',
    tip: 'Acesse "serasa.com.br/limpa-nome" ou o app Serasa. Totalmente gratuito.'
  },
  {
    emoji: '🏦', name: 'Renegociação Bancária — Direito do Consumidor',
    desc: 'O Banco Central exige que bancos ofereçam programas de reestruturação de dívidas. Vá à agência, explique a situação e peça reestruturação com redução de juros.',
    tip: 'Peça especificamente o "Programa de Reestruturação de Dívidas". É obrigatório por lei.'
  },
  {
    emoji: '👩‍⚖️', name: 'Defensoria Pública',
    desc: 'Assistência jurídica gratuita para quem não pode contratar advogado. Pode ajudar com dívidas abusivas, ações de cobrança indevida e questões legais relacionadas ao jogo.',
    tip: 'Vá à Defensoria Pública da sua cidade. Não precisa de dinheiro — é gratuita.'
  },
  {
    emoji: '📋', name: 'Procon — Defesa do Consumidor',
    desc: 'Se você foi lesado por uma plataforma de apostas (cobranças indevidas, depósitos não devolvidos, publicidade enganosa), o Procon pode ajudar.',
    tip: 'Ligue 151 ou acesse o site do Procon do seu estado. Gratuito.'
  },
  {
    emoji: '🏛️', name: 'INSS — Benefícios por Incapacidade',
    desc: 'Casos graves de transtorno de jogo com incapacidade laboral podem ter direito a benefício por incapacidade temporária (antigo auxílio-doença) pelo INSS.',
    tip: 'Consulte um médico para obter o laudo. Acesse "meu.inss.gov.br" para solicitar.'
  },
  {
    emoji: '🤝', name: 'Assistência Social — CRAS',
    desc: 'O Centro de Referência de Assistência Social oferece suporte social, orientação e acesso a benefícios para famílias em situação de vulnerabilidade.',
    tip: 'Procure o CRAS mais próximo da sua casa. Atendimento gratuito pelo SUAS.'
  },
]

export default function SupportNetwork({ onClose }) {
  const [section, setSection] = useState('emergency')
  const [expanded, setExpanded] = useState({})

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const sectionColor = SECTIONS.find(s => s.id === section)?.color || C.trueBlue

  return (
    <div style={{ padding: 20, paddingBottom: 100 }}>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.trueBlue, cursor: 'pointer', marginBottom: 12, fontWeight: 500 }}>← Voltar</button>
      <h1 style={{ color: C.trueBlue, fontSize: 20, marginBottom: 4, fontWeight: 700 }}>🏥 Rede de Apoio</h1>
      <p style={{ color: C.blackRobe, opacity: 0.6, fontSize: 13, marginBottom: 16 }}>Serviços gratuitos, direitos e recursos públicos para a sua recuperação.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)} style={{ background: section === s.id ? s.color : C.white, color: section === s.id ? C.white : C.blackRobe, border: 'none', padding: '10px 14px', borderRadius: 10, fontSize: 11, fontWeight: section === s.id ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {s.label}
          </button>
        ))}
      </div>

      {section === 'emergency' && (
        <div>
          <div style={{ background: C.danger + '15', borderRadius: 14, padding: 14, marginBottom: 16, borderLeft: '4px solid ' + C.danger }}>
            <p style={{ color: C.danger, fontSize: 13, margin: 0, fontWeight: 600 }}>⚡ Em situação de emergência, ligue imediatamente. Não hesite.</p>
          </div>
          {EMERGENCY.map((e, i) => (
            <div key={i} style={{ background: e.color, borderRadius: 16, padding: 18, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 30 }}>{e.emoji}</span>
                  <div>
                    <h3 style={{ color: C.trueBlue, fontSize: 13, margin: '0 0 4px', fontWeight: 700 }}>{e.name}</h3>
                    <span style={{ background: C.danger + '22', color: C.danger, padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>{e.badge}</span>
                  </div>
                </div>
                <a href={'tel:' + e.number.replace(/\D/g, '')} style={{ background: C.danger, color: C.white, border: 'none', padding: '10px 16px', borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: 'none', cursor: 'pointer', flexShrink: 0 }}>
                  📞 {e.number}
                </a>
              </div>
              <p style={{ color: C.blackRobe, fontSize: 12, margin: 0, lineHeight: 1.5, opacity: 0.8 }}>{e.desc}</p>
            </div>
          ))}
        </div>
      )}

      {section === 'gambling' && GAMBLING.map((g, i) => (
        <div key={i} style={{ background: g.color, borderRadius: 16, padding: 18, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
            <span style={{ fontSize: 30, flexShrink: 0 }}>{g.emoji}</span>
            <div>
              <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 4px', fontWeight: 700 }}>{g.name}</h3>
              {g.phone && <p style={{ color: C.trueBlue, fontSize: 13, margin: '0 0 8px', fontWeight: 600 }}>📞 {g.phone}</p>}
            </div>
          </div>
          <p style={{ color: C.blackRobe, fontSize: 12, margin: '0 0 8px', lineHeight: 1.5, opacity: 0.8 }}>{g.desc}</p>
          <p style={{ color: C.trueBlue, fontSize: 11, margin: 0, fontStyle: 'italic', opacity: 0.7 }}>💡 {g.detail}</p>
        </div>
      ))}

      {section === 'sus' && SUS_SERVICES.map((s, i) => (
        <div key={i} style={{ background: s.color, borderRadius: 16, padding: 18, marginBottom: 12, borderLeft: s.highlight ? '4px solid ' + C.success : 'none' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
            <span style={{ fontSize: 30, flexShrink: 0 }}>{s.emoji}</span>
            <div>
              <h3 style={{ color: C.trueBlue, fontSize: 14, margin: '0 0 4px', fontWeight: 700 }}>{s.name}</h3>
              {s.highlight && <span style={{ background: C.success + '22', color: C.success, padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700 }}>GRATUITO • SUS</span>}
            </div>
          </div>
          <p style={{ color: C.blackRobe, fontSize: 12, margin: '0 0 12px', lineHeight: 1.5, opacity: 0.8 }}>{s.desc}</p>
          <button onClick={() => toggle('sus_' + i)} style={{ background: 'rgba(29,63,119,0.08)', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 12, color: C.trueBlue, fontWeight: 600 }}>
            {expanded['sus_' + i] ? '▲ Ocultar' : '▼ Como Acessar'}
          </button>
          {expanded['sus_' + i] && (
            <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: 12, marginTop: 10 }}>
              {s.how.split('\n').map((line, j) => (
                <p key={j} style={{ color: C.blackRobe, fontSize: 12, margin: j === 0 ? '0 0 4px' : '4px 0', lineHeight: 1.5 }}>{line}</p>
              ))}
            </div>
          )}
        </div>
      ))}

      {section === 'policies' && POLICIES.map((p, i) => (
        <div key={i} style={{ background: C.white, borderRadius: 16, padding: 18, marginBottom: 12, borderLeft: '3px solid ' + C.warning }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>{p.emoji}</span>
            <h3 style={{ color: C.trueBlue, fontSize: 13, margin: 0, fontWeight: 700, lineHeight: 1.4 }}>{p.name}</h3>
          </div>
          <p style={{ color: C.blackRobe, fontSize: 12, margin: '0 0 10px', lineHeight: 1.5, opacity: 0.8 }}>{p.desc}</p>
          <div style={{ background: C.iceMelt, borderRadius: 10, padding: 10 }}>
            <p style={{ color: C.trueBlue, fontSize: 11, margin: 0, fontWeight: 600 }}>⚡ Seu direito: {p.rights}</p>
          </div>
        </div>
      ))}

      {section === 'financial' && FINANCIAL.map((f, i) => (
        <div key={i} style={{ background: C.white, borderRadius: 16, padding: 18, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>{f.emoji}</span>
            <h3 style={{ color: C.trueBlue, fontSize: 14, margin: 0, fontWeight: 700 }}>{f.name}</h3>
          </div>
          <p style={{ color: C.blackRobe, fontSize: 12, margin: '0 0 10px', lineHeight: 1.5, opacity: 0.8 }}>{f.desc}</p>
          <div style={{ background: '#e8f5e9', borderRadius: 10, padding: 10 }}>
            <p style={{ color: C.success, fontSize: 11, margin: 0, fontWeight: 600 }}>💡 Como acessar: {f.tip}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
