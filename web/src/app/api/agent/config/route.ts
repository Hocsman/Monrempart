import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Type pour la configuration
interface ConfigResponse {
    success: boolean;
    configured: boolean;
    endpoint?: string;
    bucket?: string;
    region?: string;
    accessKey?: string;
    secretKey?: string;
    repoPassword?: string;
    message?: string;
}

// Client Supabase lazy loading
function getSupabaseClient(): SupabaseClient | null {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return null;
    }

    return createClient(supabaseUrl, supabaseKey);
}

/**
 * GET /api/agent/config
 * Retourne la configuration S3/Restic pour les agents
 * 
 * TODO (Sécurité) : Vérifier un token d'agent dans les headers
 * pour s'assurer que seuls les agents autorisés peuvent récupérer la config.
 * Exemple: Authorization: Bearer <agent_token>
 */
export async function GET(): Promise<NextResponse<ConfigResponse>> {
    try {
        const supabase = getSupabaseClient();

        if (!supabase) {
            return NextResponse.json({
                success: false,
                configured: false,
                message: 'Supabase non configuré',
            });
        }

        // Récupération de la configuration
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Erreur récupération config:', error);
            return NextResponse.json({
                success: false,
                configured: false,
                message: 'Erreur de récupération de la configuration',
            }, { status: 500 });
        }

        // Vérification que la config est complète
        if (!data || !data.s3_bucket || !data.s3_access_key || !data.s3_secret_key || !data.restic_password) {
            return NextResponse.json({
                success: true,
                configured: false,
                message: 'Configuration incomplète. Veuillez configurer les paramètres dans le Dashboard.',
            });
        }

        // Configuration complète - on renvoie tout
        return NextResponse.json({
            success: true,
            configured: true,
            endpoint: data.s3_endpoint,
            bucket: data.s3_bucket,
            region: data.s3_region,
            accessKey: data.s3_access_key,
            secretKey: data.s3_secret_key,
            repoPassword: data.restic_password,
        });

    } catch (error) {
        console.error('Erreur config:', error);
        return NextResponse.json({
            success: false,
            configured: false,
            message: 'Erreur interne du serveur',
        }, { status: 500 });
    }
}
