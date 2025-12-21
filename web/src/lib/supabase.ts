import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton pour le client Supabase
let supabaseInstance: SupabaseClient | null = null;
let isInitialized = false;

/**
 * Retourne une instance du client Supabase
 * Utilise un pattern singleton pour éviter de créer plusieurs instances
 */
export function getSupabase(): SupabaseClient | null {
    // Retourne l'instance existante si déjà initialisé
    if (isInitialized) {
        return supabaseInstance;
    }

    // Marque comme initialisé
    isInitialized = true;

    // Vérification des variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('⚠️ Configuration Supabase manquante. Copiez env.example vers .env.local');
        supabaseInstance = null;
        return null;
    }

    // Création du client
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
}

// Objet mock pour les requêtes quand Supabase n'est pas configuré
const createMockBuilder = () => {
    const mockResult = { data: [] as never[], error: null };
    const builder = {
        select: () => builder,
        insert: () => builder,
        update: () => builder,
        delete: () => builder,
        eq: () => builder,
        neq: () => builder,
        gt: () => builder,
        lt: () => builder,
        gte: () => builder,
        lte: () => builder,
        order: () => builder,
        limit: () => builder,
        single: () => Promise.resolve(mockResult),
        then: (resolve: (value: typeof mockResult) => void) => Promise.resolve(mockResult).then(resolve),
    };
    return builder;
};

// Client proxy qui utilise getSupabase() de manière lazy
export const supabase = {
    from: (table: string) => {
        const client = getSupabase();
        if (!client) {
            return createMockBuilder();
        }
        return client.from(table);
    },
    auth: {
        getSession: () => getSupabase()?.auth.getSession() ?? Promise.resolve({ data: { session: null }, error: null }),
        signIn: () => Promise.resolve({ data: null, error: { message: 'Supabase non configuré' } }),
        signOut: () => Promise.resolve({ error: null }),
    },
};

// Types pour les tables de la base de données
export interface Agent {
    id: string;
    hostname: string;
    ip_address: string | null;
    status: 'online' | 'offline' | 'error';
    last_seen_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface BackupLog {
    id: string;
    agent_id: string;
    status: 'pending' | 'running' | 'success' | 'failed';
    bytes_processed: number;
    files_processed: number;
    duration_seconds: number | null;
    message: string | null;
    created_at: string;
    completed_at: string | null;
}

export interface Organisation {
    id: string;
    nom: string;
    type: 'mairie' | 'tpe' | 'autre';
    abonnement: 'gratuit' | 'standard' | 'premium';
    created_at: string;
}
