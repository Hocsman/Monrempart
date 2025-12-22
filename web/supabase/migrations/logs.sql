-- =============================================================================
-- Migration: Create agent_logs table for activity logging
-- =============================================================================
-- Exécutez ce script dans Supabase SQL Editor
-- https://supabase.com/dashboard/project/[VOTRE_PROJET]/sql
-- =============================================================================

-- ÉTAPE 1: Ajouter user_id à la table agents si elle n'existe pas
-- =============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agents' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE agents ADD COLUMN user_id UUID REFERENCES auth.users(id);
        CREATE INDEX idx_agents_user_id ON agents(user_id);
        COMMENT ON COLUMN agents.user_id IS 'Propriétaire de cet agent (lié à auth.users)';
    END IF;
END $$;

-- Ajouter last_seen si elle n'existe pas (certaines versions ont last_seen_at)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agents' AND column_name = 'last_seen'
    ) THEN
        -- Vérifier si last_seen_at existe
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'agents' AND column_name = 'last_seen_at'
        ) THEN
            -- Renommer last_seen_at en last_seen
            ALTER TABLE agents RENAME COLUMN last_seen_at TO last_seen;
        ELSE
            -- Créer la colonne
            ALTER TABLE agents ADD COLUMN last_seen TIMESTAMPTZ DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- Ajouter os si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agents' AND column_name = 'os'
    ) THEN
        ALTER TABLE agents ADD COLUMN os TEXT DEFAULT 'unknown';
    END IF;
END $$;

-- =============================================================================
-- ÉTAPE 2: Mettre à jour backup_logs avec les nouvelles colonnes
-- =============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'backup_logs' AND column_name = 'files_new'
    ) THEN
        ALTER TABLE backup_logs ADD COLUMN files_new INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'backup_logs' AND column_name = 'files_changed'
    ) THEN
        ALTER TABLE backup_logs ADD COLUMN files_changed INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'backup_logs' AND column_name = 'data_added'
    ) THEN
        ALTER TABLE backup_logs ADD COLUMN data_added BIGINT DEFAULT 0;
    END IF;
END $$;

-- =============================================================================
-- ÉTAPE 3: Créer la table agent_logs
-- =============================================================================
CREATE TABLE IF NOT EXISTS agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error')),
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_id ON agent_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON agent_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_level ON agent_logs(level);

-- Commentaires
COMMENT ON TABLE agent_logs IS 'Logs d activité remontés par les agents';
COMMENT ON COLUMN agent_logs.level IS 'Niveau: info, warning, error';
COMMENT ON COLUMN agent_logs.details IS 'Données JSON additionnelles (stats Restic, etc.)';

-- =============================================================================
-- ÉTAPE 4: Row Level Security (RLS) - Optionnel
-- =============================================================================
-- Décommentez ces lignes pour activer RLS en production

-- ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Politique: L'utilisateur peut lire les logs de ses propres agents
-- CREATE POLICY "Users can view logs of their own agents"
--     ON agent_logs
--     FOR SELECT
--     USING (
--         agent_id IN (
--             SELECT id FROM agents WHERE user_id = auth.uid()
--         )
--     );

-- Politique: Insertion autorisée via service role uniquement (API)
-- CREATE POLICY "Service role can insert logs"
--     ON agent_logs
--     FOR INSERT
--     WITH CHECK (true);

-- =============================================================================
-- ÉTAPE 5: Vue pour les statistiques (optionnel)
-- =============================================================================
CREATE OR REPLACE VIEW agent_logs_stats AS
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
-- La migration est terminée.
-- Tables créées/modifiées:
-- ✅ agents (ajout user_id, last_seen, os)
-- ✅ backup_logs (ajout files_new, files_changed, data_added)
-- ✅ agent_logs (nouvelle table)
-- ✅ agent_logs_stats (vue)
