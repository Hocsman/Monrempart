-- Migration: Create agent_logs table for activity logging
-- Run this in Supabase SQL Editor

-- Table agent_logs pour stocker les logs d'activité des agents
CREATE TABLE IF NOT EXISTS agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error')),
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_agent_logs_agent_id ON agent_logs(agent_id);
CREATE INDEX idx_agent_logs_created_at ON agent_logs(created_at DESC);
CREATE INDEX idx_agent_logs_level ON agent_logs(level);

-- Commentaires
COMMENT ON TABLE agent_logs IS 'Logs d activité remontés par les agents';
COMMENT ON COLUMN agent_logs.level IS 'Niveau: info, warning, error';
COMMENT ON COLUMN agent_logs.details IS 'Données JSON additionnelles (stats Restic, etc.)';

-- Row Level Security (RLS)
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Politique RLS: L'utilisateur peut lire les logs de ses propres agents
-- Note: Nécessite une colonne user_id dans la table agents
CREATE POLICY "Users can view logs of their own agents"
    ON agent_logs
    FOR SELECT
    USING (
        agent_id IN (
            SELECT id FROM agents WHERE user_id = auth.uid()
        )
    );

-- Politique RLS: Insertion autorisée via service role uniquement (API)
CREATE POLICY "Service role can insert logs"
    ON agent_logs
    FOR INSERT
    WITH CHECK (true);

-- Fonction pour nettoyer les vieux logs (optionnel, garder 30 jours)
CREATE OR REPLACE FUNCTION cleanup_old_agent_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM agent_logs WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Vue pour les statistiques de logs par agent
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
