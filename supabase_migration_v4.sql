-- APAJ Database Schema v4 - Funcionalidades de Comunidade
-- Execute no Supabase SQL Editor

-- 1. Histórias de Superação (anônimas, revisadas pela equipe APAJ)
CREATE TABLE IF NOT EXISTS recovery_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- 'superacao', 'familia', 'financeiro', 'recomeco', 'motivacao'
  milestone_days INTEGER DEFAULT 0,
  approved BOOLEAN DEFAULT FALSE, -- revisado pela equipe APAJ antes de publicar
  lights_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Reações às Histórias (cada paciente envia uma "luz" por história)
CREATE TABLE IF NOT EXISTS story_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES recovery_stories(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, patient_id)
);

-- 3. Desafios Comunitários (criados pela equipe APAJ via painel admin)
CREATE TABLE IF NOT EXISTS community_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tip TEXT, -- dica opcional para completar o desafio
  duration_days INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  participants_count INTEGER DEFAULT 0,
  completions_count INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 100, -- XP ganho ao completar
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Participações nos Desafios
CREATE TABLE IF NOT EXISTS challenge_participations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES community_challenges(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  checkins_done INTEGER DEFAULT 0,
  last_checkin DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, patient_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_stories_approved ON recovery_stories(approved);
CREATE INDEX IF NOT EXISTS idx_stories_patient ON recovery_stories(patient_id);
CREATE INDEX IF NOT EXISTS idx_reactions_story ON story_reactions(story_id);
CREATE INDEX IF NOT EXISTS idx_reactions_patient ON story_reactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON community_challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_participations_challenge ON challenge_participations(challenge_id);
CREATE INDEX IF NOT EXISTS idx_participations_patient ON challenge_participations(patient_id);

-- RLS
ALTER TABLE recovery_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participations ENABLE ROW LEVEL SECURITY;

-- Policies: histórias aprovadas são públicas para todos os pacientes autenticados
CREATE POLICY "stories_select_approved" ON recovery_stories
  FOR SELECT USING (approved = true OR auth.uid() = patient_id);

CREATE POLICY "stories_insert" ON recovery_stories
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Reações: qualquer paciente pode reagir, ver as próprias reações
CREATE POLICY "reactions_insert" ON story_reactions
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "reactions_select" ON story_reactions
  FOR SELECT USING (auth.uid() = patient_id);

-- Desafios: todos podem ver, apenas admins criam (via service_role)
CREATE POLICY "challenges_select" ON community_challenges
  FOR SELECT USING (true);

-- Participações: paciente vê e gerencia as próprias
CREATE POLICY "participations_all" ON challenge_participations
  FOR ALL USING (auth.uid() = patient_id);

-- Função para incrementar luzes de forma atômica (evita race conditions)
CREATE OR REPLACE FUNCTION increment_story_lights(story_id UUID)
RETURNS void AS $$
  UPDATE recovery_stories SET lights_count = lights_count + 1 WHERE id = story_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Dados de exemplo para desafio inicial (remova se não quiser dados de teste)
INSERT INTO community_challenges (title, description, tip, duration_days, is_active, start_date, end_date, xp_reward)
VALUES (
  '7 Dias Sem Apostar',
  'O desafio desta semana é simples e poderoso: passar 7 dias consecutivos sem apostar. Faça seu check-in diário para registrar sua vitória.',
  'Quando sentir vontade de apostar, venha ao app, respire com a técnica de respiração guiada e registre seu check-in.',
  7,
  true,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '7 days',
  150
)
ON CONFLICT DO NOTHING;
