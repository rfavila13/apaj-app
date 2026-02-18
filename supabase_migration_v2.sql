-- Migração v2: Novas tabelas para funcionalidades APAJ

-- Tabela de Objetivos de Vida
CREATE TABLE IF NOT EXISTS patient_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  category TEXT DEFAULT 'material',
  icon TEXT DEFAULT '🎯',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_patient_goals_patient ON patient_goals(patient_id);

-- Adicionar campo de contato de emergência na tabela patients (se não existir)
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT NULL;

-- Adicionar campo de telefone na tabela patients (se não existir)  
ALTER TABLE patients ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT NULL;

-- Comentários
COMMENT ON TABLE patient_goals IS 'Objetivos de vida do paciente - custo de oportunidade';
COMMENT ON COLUMN patients.emergency_contact IS 'Contato de emergência para SOS Fissura - formato: {name, phone}';

-- RLS para patient_goals
ALTER TABLE patient_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own goals" ON patient_goals FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Patients can insert own goals" ON patient_goals FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Patients can update own goals" ON patient_goals FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "Patients can delete own goals" ON patient_goals FOR DELETE USING (auth.uid() = patient_id);
