-- =============================================================================
-- Mon Rempart - Schéma de Base de Données Supabase
-- =============================================================================
-- Ce fichier contient les instructions SQL pour créer les tables nécessaires
-- au fonctionnement du système de sauvegarde Mon Rempart.
-- 
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase :
-- https://supabase.com/dashboard/project/[VOTRE_PROJET]/sql
-- =============================================================================

-- Activation de l'extension UUID si pas déjà active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- Table : agents
-- =============================================================================
-- Stocke les informations sur chaque agent (PC client) connecté au système.
-- Chaque agent envoie un heartbeat pour signaler sa présence.

CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostname TEXT NOT NULL UNIQUE,           -- Nom du PC (identifiant unique)
    ip_address TEXT,                          -- Adresse IP (optionnel)
    status TEXT NOT NULL DEFAULT 'offline',   -- Statut: online, offline, error
    last_seen_at TIMESTAMPTZ,                 -- Dernière connexion reçue
    created_at TIMESTAMPTZ DEFAULT NOW(),     -- Date de création de l'enregistrement
    updated_at TIMESTAMPTZ DEFAULT NOW()      -- Date de dernière modification
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_agents_hostname ON agents(hostname);
CREATE INDEX IF NOT EXISTS idx_agents_last_seen ON agents(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Commentaires de documentation
COMMENT ON TABLE agents IS 'Agents de sauvegarde Mon Rempart installés sur les postes clients';
COMMENT ON COLUMN agents.hostname IS 'Nom unique du PC client';
COMMENT ON COLUMN agents.status IS 'Statut actuel: online, offline, error';
COMMENT ON COLUMN agents.last_seen_at IS 'Timestamp du dernier heartbeat reçu';

-- =============================================================================
-- Table : backup_logs
-- =============================================================================
-- Historique de toutes les sauvegardes effectuées par les agents.

CREATE TABLE IF NOT EXISTS backup_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',   -- Statut: pending, running, success, failed
    bytes_processed BIGINT DEFAULT 0,         -- Taille des données traitées en octets
    files_processed INTEGER DEFAULT 0,        -- Nombre de fichiers traités
    duration_seconds INTEGER,                 -- Durée de la sauvegarde en secondes
    message TEXT,                             -- Message de statut ou d'erreur
    created_at TIMESTAMPTZ DEFAULT NOW(),     -- Début de la sauvegarde
    completed_at TIMESTAMPTZ                  -- Fin de la sauvegarde
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_backup_logs_agent ON backup_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_backup_logs_status ON backup_logs(status);
CREATE INDEX IF NOT EXISTS idx_backup_logs_created ON backup_logs(created_at DESC);

-- Commentaires de documentation
COMMENT ON TABLE backup_logs IS 'Journal des sauvegardes effectuées par les agents';
COMMENT ON COLUMN backup_logs.bytes_processed IS 'Volume de données traitées en octets';
COMMENT ON COLUMN backup_logs.status IS 'Statut: pending, running, success, failed';

-- =============================================================================
-- Row Level Security (RLS) - Sécurité au niveau des lignes
-- =============================================================================
-- À activer en production pour un contrôle d'accès granulaire.

-- ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

-- Politique exemple : Lecture publique pour les agents authentifiés
-- CREATE POLICY "Lecture agents authentifiés" ON agents
--     FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================================================
-- Données de test (optionnel, à supprimer en production)
-- =============================================================================
-- INSERT INTO agents (hostname, status, last_seen_at) VALUES
--     ('PC-MAIRIE-01', 'online', NOW()),
--     ('PC-COMPTABILITE', 'online', NOW() - INTERVAL '2 minutes'),
--     ('PC-ACCUEIL', 'offline', NOW() - INTERVAL '30 minutes');
