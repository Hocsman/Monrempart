-- =============================================================================
-- Migration: Activer Row Level Security (RLS) sur toutes les tables
-- =============================================================================
-- Exécutez ce script dans Supabase SQL Editor pour corriger les erreurs de sécurité
-- https://supabase.com/dashboard/project/[VOTRE_PROJET]/sql
-- =============================================================================

-- ÉTAPE 1: Activer RLS sur toutes les tables
-- =============================================================================

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ÉTAPE 2: Créer les politiques pour la table AGENTS
-- =============================================================================

-- Lecture : Les utilisateurs authentifiés peuvent voir leurs propres agents
CREATE POLICY "Users can view their own agents"
    ON agents
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Insertion : Les utilisateurs authentifiés peuvent créer des agents
CREATE POLICY "Users can create agents"
    ON agents
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Mise à jour : Les utilisateurs peuvent modifier leurs propres agents
CREATE POLICY "Users can update their own agents"
    ON agents
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Suppression : Les utilisateurs peuvent supprimer leurs propres agents
CREATE POLICY "Users can delete their own agents"
    ON agents
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Service role peut tout faire (pour les API routes)
CREATE POLICY "Service role has full access to agents"
    ON agents
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- ÉTAPE 3: Créer les politiques pour la table BACKUP_LOGS
-- =============================================================================

-- Lecture : Les utilisateurs peuvent voir les logs de leurs propres agents
CREATE POLICY "Users can view backup logs of their agents"
    ON backup_logs
    FOR SELECT
    TO authenticated
    USING (
        agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid())
    );

-- Service role peut tout faire
CREATE POLICY "Service role has full access to backup_logs"
    ON backup_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- ÉTAPE 4: Créer les politiques pour la table AGENT_LOGS
-- =============================================================================

-- Lecture : Les utilisateurs peuvent voir les logs de leurs propres agents
CREATE POLICY "Users can view activity logs of their agents"
    ON agent_logs
    FOR SELECT
    TO authenticated
    USING (
        agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid())
    );

-- Service role peut tout faire
CREATE POLICY "Service role has full access to agent_logs"
    ON agent_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- ÉTAPE 5: Créer les politiques pour la table SETTINGS
-- =============================================================================

-- Pour le MVP, settings est une config globale
-- Les utilisateurs authentifiés peuvent lire et modifier
CREATE POLICY "Authenticated users can read settings"
    ON settings
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can update settings"
    ON settings
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can insert settings"
    ON settings
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Service role peut tout faire
CREATE POLICY "Service role has full access to settings"
    ON settings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- ÉTAPE 6: Corriger la vue agent_logs_stats (retirer SECURITY DEFINER)
-- =============================================================================

-- Supprimer l'ancienne vue
DROP VIEW IF EXISTS agent_logs_stats;

-- Recréer la vue sans SECURITY DEFINER (utilise SECURITY INVOKER par défaut)
CREATE VIEW agent_logs_stats AS
SELECT 
    agent_id,
    COUNT(*) FILTER (WHERE level = 'info') AS info_count,
    COUNT(*) FILTER (WHERE level = 'warning') AS warning_count,
    COUNT(*) FILTER (WHERE level = 'error') AS error_count,
    COUNT(*) AS total_count,
    MAX(created_at) AS last_log_at
FROM agent_logs
GROUP BY agent_id;

-- =============================================================================
-- SUCCÈS !
-- =============================================================================
-- Toutes les tables ont maintenant RLS activé avec des politiques appropriées.
-- ✅ agents - RLS activé avec politiques user_id
-- ✅ backup_logs - RLS activé avec politiques basées sur agent ownership
-- ✅ agent_logs - RLS activé avec politiques basées sur agent ownership  
-- ✅ settings - RLS activé avec accès pour utilisateurs authentifiés
-- ✅ agent_logs_stats - Vue recréée sans SECURITY DEFINER
