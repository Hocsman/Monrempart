import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types pour les requêtes/réponses
interface LogPayload {
    agent_id?: string;
    hostname?: string;
    status: 'pending' | 'running' | 'success' | 'failed';
    message?: string;
    bytes_processed?: number;
    files_processed?: number;
    duration_seconds?: number;
}

interface LogResponse {
    success: boolean;
    log_id?: string;
    message?: string;
}

// Fonction pour créer le client Supabase (lazy loading)
function getSupabaseClient(): SupabaseClient | null {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return null;
    }

    return createClient(supabaseUrl, supabaseKey);
}

/**
 * POST /api/agent/log
 * Reçoit les logs de sauvegarde des agents
 */
export async function POST(request: NextRequest): Promise<NextResponse<LogResponse>> {
    try {
        const supabase = getSupabaseClient();
        if (!supabase) {
            return NextResponse.json({
                success: false,
                message: 'Supabase non configuré - Mode démo',
            });
        }

        const body: LogPayload = await request.json();

        // Validation
        if (!body.status) {
            return NextResponse.json(
                { success: false, message: 'Le champ status est requis' },
                { status: 400 }
            );
        }

        // Si agent_id n'est pas fourni mais hostname oui, on cherche l'agent
        let agentId = body.agent_id;

        if (!agentId && body.hostname) {
            const { data: agent } = await supabase
                .from('agents')
                .select('id')
                .eq('hostname', body.hostname)
                .single();

            if (agent) {
                agentId = agent.id;
            }
        }

        if (!agentId) {
            return NextResponse.json(
                { success: false, message: 'agent_id ou hostname requis' },
                { status: 400 }
            );
        }

        // Insertion du log
        const { data: newLog, error } = await supabase
            .from('backup_logs')
            .insert({
                agent_id: agentId,
                status: body.status,
                message: body.message || null,
                bytes_processed: body.bytes_processed || 0,
                files_processed: body.files_processed || 0,
                duration_seconds: body.duration_seconds || null,
                completed_at: body.status === 'success' || body.status === 'failed'
                    ? new Date().toISOString()
                    : null,
            })
            .select('id')
            .single();

        if (error) {
            console.error('Erreur insertion log:', error);
            return NextResponse.json(
                { success: false, message: 'Erreur de création du log' },
                { status: 500 }
            );
        }

        console.log(`📝 Log créé pour agent ${agentId}: ${body.status}`);

        return NextResponse.json({
            success: true,
            log_id: newLog?.id,
        }, { status: 201 });

    } catch (error) {
        console.error('Erreur log:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/agent/log
 * Récupère les derniers logs
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    const supabase = getSupabaseClient();

    if (!supabase) {
        return NextResponse.json({
            success: false,
            logs: [],
            message: 'Supabase non configuré',
        });
    }

    // Paramètre optionnel pour le nombre de logs
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const { data: logs, error } = await supabase
        .from('backup_logs')
        .select(`
      id,
      status,
      message,
      bytes_processed,
      files_processed,
      duration_seconds,
      created_at,
      completed_at,
      agents (
        id,
        hostname
      )
    `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Erreur récupération logs:', error);
        return NextResponse.json(
            { success: false, logs: [], message: 'Erreur de récupération' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        logs: logs || [],
    });
}
