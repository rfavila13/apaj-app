// Dados estáticos - Feed APAJ, Operadoras, Cartões SOS
export const APAJ_VIDEOS = [
  { id: 1, title: 'O que é Ludopatia?', author: 'Dr. Rafael Ávila', duration: '3:42', category: 'educacional', tags: ['introdução', 'diagnóstico'], url: 'https://youtube.com/watch?v=example1' },
  { id: 2, title: 'Técnicas para lidar com a Fissura', author: 'Dra. Ana Santos', duration: '5:18', category: 'crise', tags: ['fissura', 'técnicas', 'urgência'], url: 'https://youtube.com/watch?v=example2' },
  { id: 3, title: 'Reconstruindo Finanças após o Vício', author: 'Dr. Carlos Lima', duration: '7:25', category: 'financeiro', tags: ['dívidas', 'finanças', 'recuperação'], url: 'https://youtube.com/watch?v=example3' },
  { id: 4, title: 'Família e Recuperação', author: 'Dra. Maria Oliveira', duration: '6:10', category: 'relacionamentos', tags: ['família', 'confiança', 'relacionamentos'], url: 'https://youtube.com/watch?v=example4' },
  { id: 5, title: 'Lidando com Tédio e Solidão', author: 'Dr. Paulo Mendes', duration: '4:55', category: 'emocional', tags: ['tédio', 'solidão', 'isolamento'], url: 'https://youtube.com/watch?v=example5' },
  { id: 6, title: 'Estresse e Gatilhos de Recaída', author: 'Dra. Ana Santos', duration: '5:30', category: 'gatilhos', tags: ['estresse', 'trabalho', 'gatilhos'], url: 'https://youtube.com/watch?v=example6' },
  { id: 7, title: 'Autoexclusão: Passo a Passo', author: 'APAJ', duration: '4:12', category: 'prático', tags: ['autoexclusão', 'bloqueio', 'proteção'], url: 'https://youtube.com/watch?v=example7' },
  { id: 8, title: 'Euforia e Pensamento Mágico', author: 'Dr. Rafael Ávila', duration: '6:45', category: 'cognitivo', tags: ['euforia', 'ilusão', 'pensamento'], url: 'https://youtube.com/watch?v=example8' }
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
  {
    id: 'respiracao',
    title: 'Respiração 4-7-8',
    icon: '🫁',
    color: '#4CAF50',
    steps: ['Inspire pelo nariz contando até 4', 'Segure a respiração contando até 7', 'Expire pela boca contando até 8', 'Repita 4 vezes'],
    duration: 60
  },
  {
    id: 'grounding',
    title: 'Técnica 5-4-3-2-1',
    icon: '👁️',
    color: '#2196F3',
    steps: ['Identifique 5 coisas que você VÊ', 'Identifique 4 coisas que você TOCA', 'Identifique 3 coisas que você OUVE', 'Identifique 2 coisas que você CHEIRA', 'Identifique 1 coisa que você SENTE o gosto'],
    duration: 120
  },
  {
    id: 'fisico',
    title: 'Descarga Física',
    icon: '💪',
    color: '#FF5722',
    steps: ['Faça 20 polichinelos', 'Segure uma prancha por 30 segundos', 'Faça 10 agachamentos', 'Sacuda braços e pernas por 15 segundos'],
    duration: 90
  },
  {
    id: 'agua_fria',
    title: 'Choque Térmico',
    icon: '🧊',
    color: '#00BCD4',
    steps: ['Vá ao banheiro agora', 'Lave o rosto com água bem gelada', 'Segure gelo nas mãos por 30 segundos', 'Respire fundo 5 vezes'],
    duration: 60
  },
  {
    id: 'cognitivo',
    title: 'Tarefa Cognitiva',
    icon: '🧠',
    color: '#9C27B0',
    steps: ['Conte de 100 até 0 de 7 em 7', 'Liste 10 países que começam com a letra do seu nome', 'Recite o alfabeto de trás para frente', 'Multiplique 7x8, depois some 15, depois divida por 3'],
    duration: 180
  },
  {
    id: 'lugar_seguro',
    title: 'Visualização Segura',
    icon: '🏝️',
    color: '#795548',
    steps: ['Feche os olhos', 'Imagine um lugar onde você se sente completamente seguro', 'Visualize os detalhes: cores, sons, cheiros', 'Permaneça nesse lugar por 2 minutos respirando devagar'],
    duration: 120
  }
]

export const TRIGGER_KEYWORDS = {
  financeiro: ['dívida', 'divida', 'conta', 'boleto', 'dinheiro', 'salário', 'salario', 'empréstimo', 'emprestimo', 'banco', 'cartão', 'cartao', 'crédito', 'credito', 'cobrança', 'cobranca', 'agiota', 'nome sujo', 'serasa', 'spc'],
  estresse: ['estresse', 'pressão', 'pressao', 'trabalho', 'chefe', 'demissão', 'demissao', 'desemprego', 'cansado', 'exausto', 'esgotado', 'burnout', 'ansioso', 'ansiedade', 'nervoso'],
  isolamento: ['sozinho', 'solidão', 'solidao', 'ninguém', 'ninguem', 'isolado', 'abandonado', 'rejeitado', 'ignorado', 'invisível', 'invisivel'],
  tedio: ['tédio', 'tedio', 'entediado', 'nada pra fazer', 'sem fazer nada', 'monotonia', 'rotina', 'vazio', 'aborrecido'],
  euforia: ['euforia', 'eufórico', 'euforico', 'animado demais', 'vai dar certo', 'certeza', 'pressentimento', 'sorte', 'intuição', 'intuicao', 'palpite', 'feeling'],
  relacionamento: ['briga', 'discussão', 'discussao', 'separação', 'separacao', 'divórcio', 'divorcio', 'traição', 'traicao', 'término', 'termino', 'ex-', 'cônjuge', 'conjuge', 'esposa', 'esposo', 'marido', 'mulher'],
  fissura: ['fissura', 'vontade', 'urgência', 'urgencia', 'precisando', 'louco pra', 'doido pra', 'só mais uma', 'última vez', 'ultima vez', 'recuperar', 'descontar']
}

export const APAJ_PIX = {
  chave: 'apaj@apaj.org.br',
  nome: 'Associação de Proteção e Apoio ao Jogador',
  cidade: 'São Paulo',
  mensagem: 'Doação APAJ'
}
