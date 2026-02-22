-- APAJ Database Schema v3 - Execute no Supabase SQL Editor

-- 1. Tabela de Objetivos
CREATE TABLE IF NOT EXISTS patient_goals (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, patient_id UUID REFERENCES patients(id) ON DELETE CASCADE, name TEXT NOT NULL, target_amount DECIMAL(10,2) NOT NULL, category TEXT DEFAULT 'material', icon TEXT DEFAULT '🎯', is_completed BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW());

-- 2. Tabela de Episódios (Recaída Assistida)
CREATE TABLE IF NOT EXISTS episodes (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, patient_id UUID REFERENCES patients(id) ON DELETE CASCADE, before TEXT, escape_reasons TEXT[], feelings_during TEXT, feelings_after TEXT, duration TEXT, amount DECIMAL(10,2) DEFAULT 0, learning TEXT, processed BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW());

-- 3. Cofre de Evidências
CREATE TABLE IF NOT EXISTS evidence_vault (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, patient_id UUID REFERENCES patients(id) ON DELETE CASCADE, type TEXT DEFAULT 'text', content TEXT, url TEXT, created_at TIMESTAMPTZ DEFAULT NOW());

-- 4. Contrato Comportamental
CREATE TABLE IF NOT EXISTS behavioral_contracts (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, patient_id UUID REFERENCES patients(id) ON DELETE CASCADE, commitments JSONB DEFAULT '[]', protection TEXT[] DEFAULT '{}', updated_at TIMESTAMPTZ DEFAULT NOW());

-- 5. Plano de Crise
CREATE TABLE IF NOT EXISTS crisis_plans (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, patient_id UUID REFERENCES patients(id) ON DELETE CASCADE, steps JSONB DEFAULT '[]', triggers TEXT, safe_activities TEXT, updated_at TIMESTAMPTZ DEFAULT NOW());

-- 6. Logs de SOS
CREATE TABLE IF NOT EXISTS sos_logs (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, patient_id UUID REFERENCES patients(id) ON DELETE CASCADE, created_at TIMESTAMPTZ DEFAULT NOW());

-- 7. Check-ins Noturnos
CREATE TABLE IF NOT EXISTS night_checkins (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, patient_id UUID REFERENCES patients(id) ON DELETE CASCADE, response TEXT, created_at TIMESTAMPTZ DEFAULT NOW());

-- 8. Mensagens Rápidas (Psicólogo -> Paciente)
CREATE TABLE IF NOT EXISTS quick_messages (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, patient_id UUID REFERENCES patients(id) ON DELETE CASCADE, psychologist_id UUID REFERENCES psychologists(id), message TEXT, sent_at TIMESTAMPTZ DEFAULT NOW(), read_at TIMESTAMPTZ);

-- 9. Sistema de Mentoria
CREATE TABLE IF NOT EXISTS mentors (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, patient_id UUID REFERENCES patients(id) ON DELETE CASCADE, available BOOLEAN DEFAULT TRUE, bio TEXT, created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS mentor_matches (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, mentor_id UUID REFERENCES mentors(id), mentee_id UUID REFERENCES patients(id), status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS mentor_messages (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, match_id UUID REFERENCES mentor_matches(id), sender_id UUID, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW());

-- 10. Vitórias Anônimas
CREATE TABLE IF NOT EXISTS anonymous_victories (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, type TEXT, message TEXT, created_at TIMESTAMPTZ DEFAULT NOW());

-- 11. Diário da Família
CREATE TABLE IF NOT EXISTS family_diary (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, family_id TEXT, content TEXT, created_at TIMESTAMPTZ DEFAULT NOW());

-- 12. Adicionar campos na tabela patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact JSONB;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS night_mode_settings JSONB;

-- Índices
CREATE INDEX IF NOT EXISTS idx_episodes_patient ON episodes(patient_id);
CREATE INDEX IF NOT EXISTS idx_vault_patient ON evidence_vault(patient_id);
CREATE INDEX IF NOT EXISTS idx_sos_patient ON sos_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_sos_created ON sos_logs(created_at);

-- RLS (ajustar conforme necessidade)
ALTER TABLE patient_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_victories ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_diary ENABLE ROW LEVEL SECURITY;

-- Policies básicas (paciente acessa próprios dados)
CREATE POLICY "patient_goals_policy" ON patient_goals FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "episodes_policy" ON episodes FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "vault_policy" ON evidence_vault FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "contracts_policy" ON behavioral_contracts FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "crisis_policy" ON crisis_plans FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "sos_policy" ON sos_logs FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "victories_insert" ON anonymous_victories FOR INSERT WITH CHECK (true);
CREATE POLICY "victories_select" ON anonymous_victories FOR SELECT USING (true);
