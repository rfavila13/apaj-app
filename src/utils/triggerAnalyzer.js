import { TRIGGER_KEYWORDS, APAJ_VIDEOS } from '../data/constants'
export const analyzeTriggers = (entries, limit = 5) => {
  if (!entries?.length) return { risk: 'low', triggers: [], suggestedVideo: null, score: 0 }
  const recent = entries.slice(0, limit)
  const text = recent.map(e => `${e.content || ''} ${e.mood || ''} ${(e.emotions || []).join(' ')}`).join(' ').toLowerCase()
  const detected = {}
  let score = 0
  Object.entries(TRIGGER_KEYWORDS).forEach(([cat, kws]) => {
    const matches = kws.filter(k => text.includes(k.toLowerCase()))
    if (matches.length) { detected[cat] = matches.length; score += matches.length * (cat === 'fissura' ? 4 : cat === 'financeiro' || cat === 'euforia' ? 3 : 2) }
  })
  const negMoods = recent.filter(e => ['Mal', 'Muito mal'].includes(e.mood)).length
  if (negMoods >= 2) { score += negMoods * 2; detected.humor_negativo = negMoods }
  const riskEmo = recent.flatMap(e => e.emotions || []).filter(em => ['Fissura', 'Ansiedade', 'Frustração', 'Solidão'].includes(em)).length
  if (riskEmo >= 3) { score += riskEmo; detected.emocoes_risco = riskEmo }
  const risk = score >= 10 ? 'high' : score >= 5 ? 'medium' : 'low'
  let video = null
  if (detected.fissura) video = APAJ_VIDEOS.find(v => v.category === 'crise')
  else if (detected.financeiro) video = APAJ_VIDEOS.find(v => v.category === 'financeiro')
  else if (detected.isolamento || detected.tedio) video = APAJ_VIDEOS.find(v => v.tags.includes('solidão') || v.tags.includes('tédio'))
  else if (detected.estresse) video = APAJ_VIDEOS.find(v => v.tags.includes('estresse'))
  else if (detected.euforia) video = APAJ_VIDEOS.find(v => v.tags.includes('euforia'))
  return { risk, score, triggers: Object.keys(detected), details: detected, suggestedVideo: video }
}
export const generateRiskReport = (a) => a.risk === 'low' ? null : { level: a.risk, message: a.risk === 'high' ? 'Padrões de alto risco detectados. Considere usar o SOS ou contatar apoio.' : 'Alguns gatilhos identificados. Fique atento.', video: a.suggestedVideo, triggers: a.triggers }
export const analyzeEscapePatterns = (episodes) => {
  if (!episodes?.length) return null
  const reasons = {}
  const times = { madrugada: 0, manha: 0, tarde: 0, noite: 0 }
  const days = { dom: 0, seg: 0, ter: 0, qua: 0, qui: 0, sex: 0, sab: 0 }
  episodes.forEach(ep => {
    (ep.escape_reasons || []).forEach(r => { reasons[r] = (reasons[r] || 0) + 1 })
    if (ep.created_at) {
      const d = new Date(ep.created_at)
      const h = d.getHours()
      if (h >= 0 && h < 6) times.madrugada++
      else if (h < 12) times.manha++
      else if (h < 18) times.tarde++
      else times.noite++
      const dayNames = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
      days[dayNames[d.getDay()]]++
    }
  })
  const topReasons = Object.entries(reasons).sort((a, b) => b[1] - a[1]).slice(0, 3)
  const peakTime = Object.entries(times).sort((a, b) => b[1] - a[1])[0]
  const peakDay = Object.entries(days).sort((a, b) => b[1] - a[1])[0]
  return { topReasons, peakTime: peakTime[1] > 0 ? peakTime[0] : null, peakDay: peakDay[1] > 0 ? peakDay[0] : null, total: episodes.length }
}
