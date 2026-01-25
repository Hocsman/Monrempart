-- =============================================================================
-- Migration: Table subscriptions pour Stripe
-- =============================================================================
-- Exécutez ce script dans Supabase SQL Editor
-- =============================================================================

-- =============================================================================
-- Table : subscriptions
-- =============================================================================
-- Stocke les informations d'abonnement Stripe des utilisateurs

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,                          -- ID client Stripe
    stripe_subscription_id TEXT UNIQUE,               -- ID abonnement Stripe
    stripe_price_id TEXT,                             -- ID du prix Stripe
    plan TEXT NOT NULL DEFAULT 'free',                -- 'free' | 'independant' | 'serenite'
    status TEXT NOT NULL DEFAULT 'inactive',          -- 'active' | 'canceled' | 'past_due' | 'inactive'
    current_period_start TIMESTAMPTZ,                 -- Début période actuelle
    current_period_end TIMESTAMPTZ,                   -- Fin période actuelle
    cancel_at_period_end BOOLEAN DEFAULT FALSE,       -- Annulation programmée
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_subscription_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_updated_at();

-- Commentaires
COMMENT ON TABLE subscriptions IS 'Abonnements Stripe des utilisateurs';
COMMENT ON COLUMN subscriptions.plan IS 'Plan: free, independant (19€), serenite (79€)';
COMMENT ON COLUMN subscriptions.status IS 'Statut Stripe: active, canceled, past_due, inactive';

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leur propre abonnement
CREATE POLICY "Users can view own subscription"
    ON subscriptions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Service role a accès complet (pour webhooks)
CREATE POLICY "Service role has full access to subscriptions"
    ON subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- Fonction helper pour vérifier le plan d'un utilisateur
-- =============================================================================

CREATE OR REPLACE FUNCTION get_user_plan(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_plan TEXT;
BEGIN
    SELECT plan INTO user_plan
    FROM subscriptions
    WHERE user_id = p_user_id
    AND status = 'active';
    
    RETURN COALESCE(user_plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- Succès !
-- =============================================================================
-- ✅ Table subscriptions créée
-- ✅ RLS activé
-- ✅ Fonction get_user_plan() créée
