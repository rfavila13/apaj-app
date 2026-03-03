-- APAJ Database Schema v5 - Fix RLS para aprovação de histórias pelo psicólogo
-- Execute no Supabase SQL Editor

-- Problema: A política atual só permite que o psicólogo veja histórias aprovadas,
-- mas ele precisa ver as pendentes (approved = false) para poder aprová-las.
-- Também faltam políticas de UPDATE e DELETE para o psicólogo.

-- Política de SELECT: psicólogo vê todas as histórias (incluindo pendentes)
CREATE POLICY "stories_select_psychologist" ON recovery_stories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM psychologists WHERE id = auth.uid())
  );

-- Política de UPDATE: psicólogo pode aprovar/rejeitar histórias
CREATE POLICY "stories_update_psychologist" ON recovery_stories
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM psychologists WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM psychologists WHERE id = auth.uid()));

-- Política de DELETE: psicólogo pode remover histórias
CREATE POLICY "stories_delete_psychologist" ON recovery_stories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM psychologists WHERE id = auth.uid())
  );
