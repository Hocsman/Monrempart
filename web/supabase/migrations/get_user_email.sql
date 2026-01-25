-- =============================================================================
-- Fonction pour récupérer l'email d'un utilisateur
-- =============================================================================
-- Cette fonction permet de récupérer l'email depuis auth.users
-- Elle est nécessaire car auth.users n'est pas accessible directement via RLS
-- =============================================================================

CREATE OR REPLACE FUNCTION get_user_email(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_uuid;
    
    RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permettre au service role d'appeler cette fonction
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO service_role;

-- =============================================================================
-- Succès !
-- =============================================================================
-- ✅ Fonction get_user_email() créée
