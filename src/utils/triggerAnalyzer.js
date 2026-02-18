// Motor de Análise de Vulnerabilidade - Processamento local, sem envio de dados
import { TRIGGER_KEYWORDS, APAJ_VIDEOS } from '../data/constants'

export const analyzeTriggers = (entries, limit = 5) => {
  if (!entries || entries.length === 0) return { risk: 'low', triggers: [], suggestedVideo: null }
  
  const recentEntries = entries.slice(0, limit)
  const allText = recentEntries.map(e => `${e.content || ''} ${e.mood || ''} ${(e.emotions || []).join(' ')}`).join(' ').toLowerCase()
  
  const detected = {}
  let totalScore = 0
  
  Object.entries(TRIGGER_KEYWORDS).forEach(([category, keywords]) => {
    const matches = keywords.filter(kw => allText.includes(kw.toLowerCase()))
    if (matches.length > 0) {
      detected[category] = { count: matches.length, keywords: matches }
      totalScore += matches.length * getCategoryWeight(category)
    }
  })
  
  // Análise de humor negativo recente
  const negativeModds = recentEntries.filter(e => ['Mal', 'Muito mal'].includes(e.mood)).length
  if (negativeModds >= 2) {
    totalScore += negativeModds * 2
    detected.humor_negativo = { count: negativeModds }
  }
  
  // Análise de emoções de risco
  const riskEmotions = ['Fissura', 'Ansiedade', 'Frustração', 'Solidão', 'Raiva']
  const emotionCount = recentEntries.flatMap(e => e.emotions || []).filter(em => riskEmotions.includes(em)).length
  if (emotionCount >= 3) {
    totalScore += emotionCount
    detected.emocoes_risco = { count: emotionCount }
  }
  
  const riskLevel = totalScore >= 10 ? 'high' : totalScore >= 5 ? 'medium' : 'low'
  const suggestedVideo = getSuggestedVideo(detected)
  
  return {
    risk: riskLevel,
    score: totalScore,
    triggers: Object.keys(detected),
    details: detected,
    suggestedVideo
  }
}

const getCategoryWeight = (category) => {
  const weights = { fissura: 4, financeiro: 3, euforia: 3, isolamento: 2, estresse: 2, tedio: 1, relacionamento: 2 }
  return weights[category] || 1
}

const getSuggestedVideo = (triggers) => {
  if (triggers.fissura) return APAJ_VIDEOS.find(v => v.category === 'crise')
  if (triggers.financeiro) return APAJ_VIDEOS.find(v => v.category === 'financeiro')
  if (triggers.isolamento || triggers.tedio) return APAJ_VIDEOS.find(v => v.tags.includes('solidão') || v.tags.includes('tédio'))
  if (triggers.estresse) return APAJ_VIDEOS.find(v => v.tags.includes('estresse'))
  if (triggers.euforia) return APAJ_VIDEOS.find(v => v.tags.includes('euforia'))
  if (triggers.relacionamento) return APAJ_VIDEOS.find(v => v.category === 'relacionamentos')
  return null
}

export const generateRiskReport = (analysis) => {
  if (analysis.risk === 'low') return null
  
  const messages = {
    high: 'Identificamos padrões de alto risco nas suas últimas entradas. Considere acionar o SOS Fissura ou contatar seu apoio.',
    medium: 'Alguns gatilhos foram identificados. Fique atento e utilize as ferramentas de prevenção.'
  }
  
  return {
    level: analysis.risk,
    message: messages[analysis.risk],
    video: analysis.suggestedVideo,
    triggers: analysis.triggers
  }
}
