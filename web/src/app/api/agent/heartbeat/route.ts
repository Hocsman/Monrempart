import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types pour les requêtes/réponses
interface HeartbeatPayload {
    hostname: string;
    status: 'online' | 'offline' | 'error';
    ip_address?: string;
}

interface HeartbeatResponse {
    success: boolean;
    command: 'idle' | 'backup_now' | 'update' | 'shutdown' | 'restore' | 'sync_snapshots';
    message?: string;
    agent_id?: string;
    restore_config?: {
        request_id: string;
        snapshot_id: string;
        target_path: string;
    };
}

// Fonction pour créer le client Supabase (lazy loading)
function getSupabaseClient(): SupabaseClient | null {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn('⚠️ Variables Supabase non configurées');
        return null;
    }

    return createClient(supabaseUrl, supabaseKey);
}

/**
 * POST /api/agent/heartbeat
 * Reçoit les signaux de vie des agents et met à jour leur statut
 */
export async function POST(request: NextRequest): Promise<NextResponse<HeartbeatResponse>> {
    try {
        // Vérification de la configuration Supabase
        const supabase = getSupabaseClient();
        if (!supabase) {
            return NextResponse.json({
                success: false,
                command: 'idle',
                message: 'Supabase non configuré - Mode démo',
            });
        }

        // Parsing du body JSON
        const body: HeartbeatPayload = await request.json();

        // Validation des champs requis
        if (!body.hostname) {
            return NextResponse.json(
                { success: false, command: 'idle', message: 'Le champ hostname est requis' },
                { status: 400 }
            );
        }

        // Récupération de l'IP depuis les headers (si disponible)
        const ipAddress = body.ip_address ||
            request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            null;

        // Recherche de l'agent existant par hostname
        const { data: existingAgent } = await supabase
            .from('agents')
            .select('id')
            .eq('hostname', body.hostname)
            .single();

        let agentId: string;

        if (existingAgent) {
            // Agent existant : mise à jour du statut et last_seen_at
            const { error: updateError } = await supabase
                .from('agents')
                .update({
                    status: body.status || 'online',
                    last_seen_at: new Date().toISOString(),
                    ip_address: ipAddress,
                })
                .eq('id', existingAgent.id);

            if (updateError) {
                console.error('Erreur mise à jour agent:', updateError);
                return NextResponse.json(
                    { success: false, command: 'idle', message: 'Erreur de mise à jour' },
                    { status: 500 }
                );
            }

            agentId = existingAgent.id;
            console.log(`✅ Agent "${body.hostname}" mis à jour (ID: ${agentId})`);
        } else {
            // Nouvel agent : création de l'entrée
            const { data: newAgent, error: insertError } = await supabase
                .from('agents')
                .insert({
                    hostname: body.hostname,
                    status: body.status || 'online',
                    last_seen_at: new Date().toISOString(),
                    ip_address: ipAddress,
                })
                .select('id')
                .single();

            if (insertError || !newAgent) {
                console.error('Erreur création agent:', insertError);
                return NextResponse.json(
                    { success: false, command: 'idle', message: 'Erreur de création' },
                    { status: 500 }
                );
            }

            agentId = newAgent.id;
            console.log(`🆕 Nouvel agent "${body.hostname}" créé (ID: ${agentId})`);
        }

        // Vérifier s'il y a une demande de restauration en attente
        const { data: pendingRestore } = await supabase
            .from('restore_requests')
            .select('id, snapshot_id, target_path')
            .eq('agent_id', agentId)
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

        if (pendingRestore) {
            // Marquer comme "running"
            await supabase
                .from('restore_requests')
                .update({ status: 'running', started_at: new Date().toISOString() })
                .eq('id', pendingRestore.id);

            console.log(`🔄 Envoi commande restore à "${body.hostname}" - Snapshot: ${pendingRestore.snapshot_id}`);

            return NextResponse.json({
                success: true,
                command: 'restore',
                agent_id: agentId,
                restore_config: {
                    request_id: pendingRestore.id,
                    snapshot_id: pendingRestore.snapshot_id,
                    target_path: pendingRestore.target_path
                }
            });
        }

        // Réponse normale - idle
        return NextResponse.json({
            success: true,
            command: 'idle',
            agent_id: agentId,
        });

    } catch (error) {
        console.error('Erreur heartbeat:', error);
        return NextResponse.json(
            { success: false, command: 'idle', message: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/agent/heartbeat
 * Endpoint de test pour vérifier que l'API est en ligne
 */
export async function GET(): Promise<NextResponse> {
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

    return NextResponse.json({
        status: 'ok',
        message: 'API Heartbeat Mon Rempart opérationnelle',
        supabase_configured: hasSupabase,
        timestamp: new Date().toISOString(),
    });
}
