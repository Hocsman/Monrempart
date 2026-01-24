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

interface SnapshotPayload {
    agent_id: string;
    hostname: string;
    snapshots: Array<{
        id: string;
        short_id: string;
        time: string;
        hostname: string;
        paths: string[];
        tags?: string[];
    }>;
}

/**
 * POST /api/agent/snapshots
 * Reçoit la liste des snapshots d'un agent et les synchronise en DB
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const supabase = getSupabaseAdmin();
        if (!supabase) {
            return NextResponse.json(
                { success: false, message: 'Supabase non configuré' },
                { status: 500 }
            );
        }

        const body: SnapshotPayload = await request.json();
        const { agent_id, hostname, snapshots } = body;

        if (!agent_id || !snapshots) {
            return NextResponse.json(
                { success: false, message: 'agent_id et snapshots requis' },
                { status: 400 }
            );
        }

        console.log(`📸 Sync snapshots pour agent "${hostname}": ${snapshots.length} snapshots`);

        // Supprimer les anciens snapshots de cet agent pour resync complet
        await supabase
            .from('snapshots')
            .delete()
            .eq('agent_id', agent_id);

        // Insérer les nouveaux snapshots
        if (snapshots.length > 0) {
            const snapshotRows = snapshots.map(s => ({
                agent_id: agent_id,
                snapshot_id: s.id,
                short_id: s.short_id,
                snapshot_time: s.time,
                hostname: s.hostname,
                paths: s.paths,
                tags: s.tags || [],
                synced_at: new Date().toISOString()
            }));

            const { error: insertError } = await supabase
                .from('snapshots')
                .insert(snapshotRows);

            if (insertError) {
                console.error('Erreur insertion snapshots:', insertError);
                return NextResponse.json(
                    { success: false, message: 'Erreur insertion snapshots' },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({
            success: true,
            message: `${snapshots.length} snapshots synchronisés`,
            count: snapshots.length
        });

    } catch (error) {
        console.error('Erreur API agent snapshots:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur interne' },
            { status: 500 }
        );
    }
}
