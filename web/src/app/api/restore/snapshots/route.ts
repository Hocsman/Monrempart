import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client avec service role pour accès complet
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        return null;
    }

    return createClient(url, key);
}

interface Snapshot {
    id: string;
    agent_id: string;
    snapshot_id: string;
    short_id: string;
    snapshot_time: string;
    hostname: string;
    paths: string[];
    size_bytes: number;
}

/**
 * GET /api/restore/snapshots?agentId=xxx
 * Retourne la liste des snapshots pour un agent
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const supabase = getSupabaseAdmin();
        if (!supabase) {
            return NextResponse.json(
                { success: false, message: 'Supabase non configuré' },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(request.url);
        const agentId = searchParams.get('agentId');

        if (!agentId) {
            return NextResponse.json(
                { success: false, message: 'agentId requis' },
                { status: 400 }
            );
        }

        // Récupérer les snapshots pour cet agent
        const { data: snapshots, error } = await supabase
            .from('snapshots')
            .select('*')
            .eq('agent_id', agentId)
            .order('snapshot_time', { ascending: false });

        if (error) {
            console.error('Erreur récupération snapshots:', error);
            return NextResponse.json(
                { success: false, message: 'Erreur base de données' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            snapshots: snapshots as Snapshot[],
            count: snapshots?.length || 0
        });

    } catch (error) {
        console.error('Erreur API snapshots:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur interne' },
            { status: 500 }
        );
    }
}
