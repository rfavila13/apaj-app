export const APAJ_VIDEOS = [
  { id: 1, title: 'O que é Ludopatia?', author: 'Dr. Rafael Ávila', duration: '3:42', category: 'educacional', tags: ['introdução', 'diagnóstico'], url: '#', audience: 'paciente' },
  { id: 2, title: 'Técnicas para lidar com a Fissura', author: 'Dra. Ana Santos', duration: '5:18', category: 'crise', tags: ['fissura', 'técnicas'], url: '#', audience: 'paciente' },
  { id: 3, title: 'Reconstruindo Finanças após o Vício', author: 'Dr. Carlos Lima', duration: '7:25', category: 'financeiro', tags: ['dívidas', 'finanças'], url: '#', audience: 'paciente' },
  { id: 4, title: 'Família e Recuperação', author: 'Dra. Maria Oliveira', duration: '6:10', category: 'relacionamentos', tags: ['família', 'confiança'], url: '#', audience: 'ambos' },
  { id: 5, title: 'Lidando com Tédio e Solidão', author: 'Dr. Paulo Mendes', duration: '4:55', category: 'emocional', tags: ['tédio', 'solidão'], url: '#', audience: 'paciente' },
  { id: 6, title: 'Estresse e Gatilhos de Recaída', author: 'Dra. Ana Santos', duration: '5:30', category: 'gatilhos', tags: ['estresse', 'trabalho'], url: '#', audience: 'paciente' },
  { id: 7, title: 'Autoexclusão: Passo a Passo', author: 'APAJ', duration: '4:12', category: 'prático', tags: ['autoexclusão', 'proteção'], url: '#', audience: 'paciente' },
  { id: 8, title: 'Euforia e Pensamento Mágico', author: 'Dr. Rafael Ávila', duration: '6:45', category: 'cognitivo', tags: ['euforia', 'ilusão'], url: '#', audience: 'paciente' },
  { id: 9, title: 'Como Apoiar sem ser Cúmplice', author: 'Dra. Maria Oliveira', duration: '8:20', category: 'familia', tags: ['codependência', 'limites'], url: '#', audience: 'familiar' },
  { id: 10, title: 'Protegendo as Finanças da Família', author: 'Dr. Carlos Lima', duration: '6:50', category: 'familia', tags: ['proteção', 'finanças'], url: '#', audience: 'familiar' },
  { id: 11, title: 'Cuidando de Si Mesmo como Familiar', author: 'Dr. Paulo Mendes', duration: '5:40', category: 'familia', tags: ['autocuidado', 'saúde mental'], url: '#', audience: 'familiar' }
]
export const OPERADORAS_AUTOEXCLUSAO = [
  { name: 'Sistema Nacional (Gov.br)', url: 'https://gov.br/autoexclusaoapostas', official: true, priority: 1 },
  { name: 'Bet365', url: 'https://responsiblegambling.bet365.com', official: false, priority: 2 },
  { name: 'Betano', url: 'https://www.betano.com/jogo-responsavel', official: false, priority: 2 },
  { name: 'Sportingbet', url: 'https://sports.sportingbet.com/pt-br/jogo-responsavel', official: false, priority: 2 },
  { name: 'Pixbet', url: 'https://pixbet.com/jogo-responsavel', official: false, priority: 2 },
  { name: 'Blaze', url: 'https://blaze.com/responsible-gaming', official: false, priority: 2 },
  { name: 'Estrela Bet', url: 'https://estrelabet.com/jogo-responsavel', official: false, priority: 2 },
  { name: 'KTO', url: 'https://www.kto.com/jogo-responsavel', official: false, priority: 2 },
  { name: 'Novibet', url: 'https://www.novibet.com.br/jogo-responsavel', official: false, priority: 2 }
]
export const SOS_CARDS = [
  { id: 'respiracao', title: 'Respiração 4-7-8', icon: '🫁', color: '#4CAF50', steps: ['Inspire pelo nariz contando até 4', 'Segure a respiração contando até 7', 'Expire pela boca contando até 8', 'Repita 4 vezes'] },
  { id: 'grounding', title: 'Técnica 5-4-3-2-1', icon: '👁️', color: '#2196F3', steps: ['5 coisas que você VÊ', '4 coisas que você TOCA', '3 coisas que você OUVE', '2 coisas que você CHEIRA', '1 coisa que você SENTE o gosto'] },
  { id: 'fisico', title: 'Descarga Física', icon: '💪', color: '#FF5722', steps: ['20 polichinelos', 'Prancha 30 segundos', '10 agachamentos', 'Sacuda o corpo 15 segundos'] },
  { id: 'agua_fria', title: 'Choque Térmico', icon: '🧊', color: '#00BCD4', steps: ['Vá ao banheiro', 'Lave o rosto com água gelada', 'Segure gelo nas mãos 30s', 'Respire fundo 5 vezes'] },
  { id: 'cognitivo', title: 'Tarefa Cognitiva', icon: '🧠', color: '#9C27B0', steps: ['Conte de 100 até 0 de 7 em 7', 'Liste 10 países com letra do seu nome', 'Alfabeto de trás pra frente', 'Calcule: 7x8+15÷3'] },
  { id: 'lugar_seguro', title: 'Visualização Segura', icon: '🏝️', color: '#795548', steps: ['Feche os olhos', 'Imagine um lugar seguro', 'Visualize cores, sons, cheiros', 'Fique 2 minutos respirando'] }
]
export const TRIGGER_KEYWORDS = {
  financeiro: ['dívida', 'conta', 'boleto', 'dinheiro', 'salário', 'empréstimo', 'banco', 'cartão', 'crédito', 'cobrança', 'agiota', 'serasa', 'spc', 'nome sujo'],
  estresse: ['estresse', 'pressão', 'trabalho', 'chefe', 'demissão', 'desemprego', 'cansado', 'exausto', 'esgotado', 'burnout', 'ansioso', 'nervoso'],
  isolamento: ['sozinho', 'solidão', 'ninguém', 'isolado', 'abandonado', 'rejeitado', 'ignorado'],
  tedio: ['tédio', 'entediado', 'nada pra fazer', 'monotonia', 'rotina', 'vazio'],
  euforia: ['euforia', 'animado', 'vai dar certo', 'certeza', 'sorte', 'intuição', 'palpite', 'pressentimento'],
  relacionamento: ['briga', 'discussão', 'separação', 'divórcio', 'traição', 'término', 'ex-'],
  fissura: ['fissura', 'vontade', 'urgência', 'precisando', 'louco pra', 'só mais uma', 'última vez', 'recuperar']
}
export const ESCAPE_REASONS = [
  { id: 'conflito_familiar', label: 'Conflito familiar', icon: '👨‍👩‍👧' },
  { id: 'pressao_trabalho', label: 'Pressão no trabalho', icon: '💼' },
  { id: 'sensacao_fracasso', label: 'Sensação de fracasso', icon: '📉' },
  { id: 'tedio_existencial', label: 'Tédio existencial', icon: '😶' },
  { id: 'dor_emocional', label: 'Dor emocional', icon: '💔' },
  { id: 'dor_fisica', label: 'Dor física', icon: '🤕' },
  { id: 'comemoracao', label: 'Comemoração/Euforia', icon: '🎉' },
  { id: 'solidao', label: 'Solidão', icon: '🧍' },
  { id: 'insonia', label: 'Insônia/Madrugada', icon: '🌙' },
  { id: 'alcool_drogas', label: 'Uso de álcool/drogas', icon: '🍺' },
  { id: 'gatilho_visual', label: 'Vi propaganda/alguém jogando', icon: '📺' },
  { id: 'dinheiro_disponivel', label: 'Recebi dinheiro', icon: '💵' }
]
export const APAJ_PIX = { chave: 'apaj@apaj.org.br', nome: 'Associação de Proteção e Apoio ao Jogador' }
export const PROTECTION_CHECKLIST = [
  { id: 'cartao_entregue', label: 'Entreguei cartões de crédito/débito para pessoa de confiança' },
  { id: 'app_banco_removido', label: 'Removi apps de banco do celular' },
  { id: 'autoexclusao', label: 'Fiz autoexclusão nas casas de apostas' },
  { id: 'bloqueio_sites', label: 'Instalei bloqueador de sites de apostas' },
  { id: 'conta_conjunta', label: 'Conta bancária agora é conjunta ou supervisionada' },
  { id: 'limite_pix', label: 'Reduzi limite de PIX/transferências' },
  { id: 'salario_redirecionado', label: 'Salário vai para conta que não tenho acesso direto' },
  { id: 'familiar_ciente', label: 'Familiar sabe da situação e monitora' }
]
