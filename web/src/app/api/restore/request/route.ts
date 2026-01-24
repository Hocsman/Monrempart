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

interface RestoreRequestBody {
    agentId: string;
    snapshotId: string;
    targetPath: string;
}

/**
 * POST /api/restore/request
 * Crée une demande de restauration
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

        const body: RestoreRequestBody = await request.json();
        const { agentId, snapshotId, targetPath } = body;

        // Validation
        if (!agentId || !snapshotId || !targetPath) {
            return NextResponse.json(
                { success: false, message: 'agentId, snapshotId et targetPath requis' },
                { status: 400 }
            );
        }

        // Vérifier que l'agent existe
        const { data: agent, error: agentError } = await supabase
            .from('agents')
            .select('id, hostname')
            .eq('id', agentId)
            .single();

        if (agentError || !agent) {
            return NextResponse.json(
                { success: false, message: 'Agent non trouvé' },
                { status: 404 }
            );
        }

        // Vérifier qu'il n'y a pas déjà une restauration en cours
        const { data: existingRequest } = await supabase
            .from('restore_requests')
            .select('id')
            .eq('agent_id', agentId)
            .in('status', ['pending', 'running'])
            .single();

        if (existingRequest) {
            return NextResponse.json(
                { success: false, message: 'Une restauration est déjà en cours pour cet agent' },
                { status: 409 }
            );
        }

        // Créer la demande de restauration
        const { data: restoreRequest, error: insertError } = await supabase
            .from('restore_requests')
            .insert({
                agent_id: agentId,
                snapshot_id: snapshotId,
                target_path: targetPath,
                status: 'pending'
            })
            .select()
            .single();

        if (insertError) {
            console.error('Erreur création restore_request:', insertError);
            return NextResponse.json(
                { success: false, message: 'Erreur lors de la création de la demande' },
                { status: 500 }
            );
        }

        console.log(`🔄 Restauration demandée pour agent "${agent.hostname}" - Snapshot: ${snapshotId}`);

        return NextResponse.json({
            success: true,
            message: 'Demande de restauration créée',
            requestId: restoreRequest.id,
            agentHostname: agent.hostname
        });

    } catch (error) {
        console.error('Erreur API restore request:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur interne' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/restore/request?agentId=xxx
 * Récupère les demandes de restauration pour un agent
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

        const { data: requests, error } = await supabase
            .from('restore_requests')
            .select('*')
            .eq('agent_id', agentId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            return NextResponse.json(
                { success: false, message: 'Erreur base de données' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            requests: requests || []
        });

    } catch (error) {
        console.error('Erreur API restore requests:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur interne' },
            { status: 500 }
        );
    }
}
