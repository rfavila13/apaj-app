-- Migração: Adicionar novas colunas à tabela diary_entries
-- Execute este SQL no Supabase SQL Editor

-- Adicionar coluna para registrar se teve fissura
ALTER TABLE diary_entries 
ADD COLUMN IF NOT EXISTS had_craving BOOLEAN DEFAULT NULL;

-- Adicionar coluna para intensidade da fissura (1-10)
ALTER TABLE diary_entries 
ADD COLUMN IF NOT EXISTS craving_intensity INTEGER DEFAULT NULL;

-- Adicionar coluna para gratidão
ALTER TABLE diary_entries 
ADD COLUMN IF NOT EXISTS gratitude TEXT DEFAULT NULL;

-- Adicionar coluna para gatilho/trigger
ALTER TABLE diary_entries 
ADD COLUMN IF NOT EXISTS trigger TEXT DEFAULT NULL;

-- Comentários para documentação
COMMENT ON COLUMN diary_entries.had_craving IS 'Se o paciente teve fissura neste dia';
COMMENT ON COLUMN diary_entries.craving_intensity IS 'Intensidade da fissura de 1 a 10';
COMMENT ON COLUMN diary_entries.gratitude IS 'Momento de gratidão - o que o paciente agradece';
COMMENT ON COLUMN diary_entries.trigger IS 'O que pode ter causado a fissura';
