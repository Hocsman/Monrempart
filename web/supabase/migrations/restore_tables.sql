-- =============================================================================
-- Migration: Tables pour la fonctionnalité de restauration
-- =============================================================================
-- Exécutez ce script dans Supabase SQL Editor
-- https://supabase.com/dashboard/project/[VOTRE_PROJET]/sql
-- =============================================================================

-- =============================================================================
-- Table : snapshots
-- =============================================================================
-- Stocke les informations sur les snapshots Restic synchronisés par les agents

CREATE TABLE IF NOT EXISTS snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    snapshot_id TEXT NOT NULL,                    -- ID complet du snapshot Restic
    short_id TEXT,                                -- ID court (8 caractères)
    snapshot_time TIMESTAMPTZ,                    -- Date de création du snapshot
    hostname TEXT,                                -- Hostname de l'agent
    paths TEXT[],                                 -- Chemins sauvegardés
    tags TEXT[],                                  -- Tags du snapshot
    size_bytes BIGINT DEFAULT 0,                  -- Taille estimée
    synced_at TIMESTAMPTZ DEFAULT NOW(),          -- Date de synchronisation
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agent_id, snapshot_id)
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_snapshots_agent ON snapshots(agent_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_time ON snapshots(snapshot_time DESC);

-- Commentaires
COMMENT ON TABLE snapshots IS 'Snapshots Restic synchronisés depuis les agents';
COMMENT ON COLUMN snapshots.snapshot_id IS 'ID complet du snapshot Restic';
COMMENT ON COLUMN snapshots.paths IS 'Liste des chemins sauvegardés dans ce snapshot';

-- =============================================================================
-- Table : restore_requests
-- =============================================================================
-- Stocke les demandes de restauration en attente ou terminées

CREATE TABLE IF NOT EXISTS restore_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),       -- Utilisateur qui a demandé
    snapshot_id TEXT NOT NULL,                    -- Snapshot à restaurer
    target_path TEXT NOT NULL,                    -- Chemin de destination
    status TEXT NOT NULL DEFAULT 'pending',       -- pending, running, success, failed
    message TEXT,                                 -- Message de résultat
    files_restored INTEGER,                       -- Nombre de fichiers restaurés
    bytes_restored BIGINT,                        -- Taille restaurée
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,                       -- Début de la restauration
    completed_at TIMESTAMPTZ                      -- Fin de la restauration
);

-- Index
CREATE INDEX IF NOT EXISTS idx_restore_requests_agent ON restore_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_restore_requests_status ON restore_requests(status);
CREATE INDEX IF NOT EXISTS idx_restore_requests_created ON restore_requests(created_at DESC);

-- Commentaires
COMMENT ON TABLE restore_requests IS 'Demandes de restauration de sauvegardes';
COMMENT ON COLUMN restore_requests.status IS 'Statut: pending, running, success, failed';

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE restore_requests ENABLE ROW LEVEL SECURITY;

-- Policies pour snapshots
CREATE POLICY "Users can view snapshots of their agents"
    ON snapshots
    FOR SELECT
    TO authenticated
    USING (
        agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid())
    );

CREATE POLICY "Service role has full access to snapshots"
    ON snapshots
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policies pour restore_requests
CREATE POLICY "Users can view their restore requests"
    ON restore_requests
    FOR SELECT
    TO authenticated
    USING (
        agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create restore requests for their agents"
    ON restore_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid())
    );

CREATE POLICY "Service role has full access to restore_requests"
    ON restore_requests
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- Succès !
-- =============================================================================
-- ✅ Table snapshots créée avec RLS
-- ✅ Table restore_requests créée avec RLS
