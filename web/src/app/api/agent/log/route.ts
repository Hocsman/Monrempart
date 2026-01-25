import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sendBackupFailedEmail } from '@/lib/resend';

// Types pour les requêtes/réponses
interface LogPayload {
    agent_id?: string;
    hostname?: string;
    // Pour backup_logs (sauvegardes)
    status?: 'pending' | 'running' | 'success' | 'failed';
    message?: string;
    bytes_processed?: number;
    files_processed?: number;
    files_new?: number;
    files_changed?: number;
    data_added?: number;
    duration_seconds?: number;
    // Pour agent_logs (activité générale)
    level?: 'info' | 'warning' | 'error';
    details?: Record<string, unknown>;
    log_type?: 'backup' | 'activity';
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
 * Reçoit les logs de sauvegarde et d'activité des agents
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

        // Mettre à jour last_seen de l'agent (prouve qu'il est en ligne)
        await supabase
            .from('agents')
            .update({
                last_seen: new Date().toISOString(),
                status: 'online'
            })
            .eq('id', agentId);

        // Déterminer le type de log
        const logType = body.log_type || (body.status ? 'backup' : 'activity');

        if (logType === 'activity' && body.level) {
            // Log d'activité générale -> table agent_logs
            const { data: newLog, error } = await supabase
                .from('agent_logs')
                .insert({
                    agent_id: agentId,
                    level: body.level,
                    message: body.message || '',
                    details: body.details || {},
                })
                .select('id')
                .single();

            if (error) {
                console.error('Erreur insertion agent_logs:', error);
                return NextResponse.json(
                    { success: false, message: 'Erreur de création du log' },
                    { status: 500 }
                );
            }

            console.log(`📝 Activity log créé pour agent ${agentId}: [${body.level}] ${body.message}`);

            return NextResponse.json({
                success: true,
                log_id: newLog?.id,
            }, { status: 201 });

        } else {
            // Log de sauvegarde -> table backup_logs
            if (!body.status) {
                return NextResponse.json(
                    { success: false, message: 'Le champ status est requis pour les logs de backup' },
                    { status: 400 }
                );
            }

            const { data: newLog, error } = await supabase
                .from('backup_logs')
                .insert({
                    agent_id: agentId,
                    status: body.status,
                    message: body.message || null,
                    files_new: body.files_new || body.files_processed || 0,
                    files_changed: body.files_changed || 0,
                    data_added: body.data_added || body.bytes_processed || 0,
                    duration_seconds: body.duration_seconds || 0,
                })
                .select('id')
                .single();

            if (error) {
                console.error('Erreur insertion backup_logs:', error);
                return NextResponse.json(
                    { success: false, message: 'Erreur de création du log' },
                    { status: 500 }
                );
            }

            // Aussi créer un log d'activité pour tracer l'événement
            const activityLevel = body.status === 'failed' ? 'error' :
                body.status === 'success' ? 'info' : 'info';
            const activityMessage = body.status === 'success'
                ? `Sauvegarde terminée avec succès`
                : body.status === 'failed'
                    ? `Échec de la sauvegarde: ${body.message || 'Erreur inconnue'}`
                    : `Sauvegarde ${body.status}`;

            await supabase
                .from('agent_logs')
                .insert({
                    agent_id: agentId,
                    level: activityLevel,
                    message: activityMessage,
                    details: {
                        backup_id: newLog?.id,
                        status: body.status,
                        files_new: body.files_new || 0,
                        files_changed: body.files_changed || 0,
                        data_added: body.data_added || 0,
                        duration_seconds: body.duration_seconds || 0,
                    },
                });

            console.log(`📦 Backup log créé pour agent ${agentId}: ${body.status}`);

            // Envoyer alerte email si backup échoué
            if (body.status === 'failed') {
                // Récupérer l'email de l'utilisateur propriétaire de l'agent
                const { data: agentData } = await supabase
                    .from('agents')
                    .select('hostname, user_id')
                    .eq('id', agentId)
                    .single();

                if (agentData?.user_id) {
                    // Récupérer l'email depuis auth.users
                    const { data: userData } = await supabase
                        .from('auth.users')
                        .select('email')
                        .eq('id', agentData.user_id)
                        .single();

                    // Fallback: utiliser une requête directe si la table auth.users n'est pas accessible
                    let userEmail = userData?.email;

                    if (!userEmail) {
                        // Essayer via la fonction RPC ou directement depuis subscriptions
                        const { data: subData } = await supabase
                            .rpc('get_user_email', { user_uuid: agentData.user_id })
                            .single();
                        userEmail = subData;
                    }

                    if (userEmail) {
                        await sendBackupFailedEmail({
                            to: userEmail,
                            hostname: agentData.hostname || body.hostname || 'Agent inconnu',
                            errorMessage: body.message || 'Erreur inconnue',
                            agentId: agentId,
                        });
                    } else {
                        console.log(`⚠️ Impossible d'envoyer l'alerte: email non trouvé pour user ${agentData.user_id}`);
                    }
                }
            }

            return NextResponse.json({
                success: true,
                log_id: newLog?.id,
            }, { status: 201 });
        }

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
 * Récupère les derniers logs (backup_logs ou agent_logs)
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const agentId = searchParams.get('agent_id');
    const type = searchParams.get('type') || 'backup'; // 'backup' ou 'activity'

    if (type === 'activity') {
        // Récupérer les agent_logs
        let query = supabase
            .from('agent_logs')
            .select(`
                id,
                level,
                message,
                details,
                created_at,
                agents (
                    id,
                    hostname
                )
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (agentId) {
            query = query.eq('agent_id', agentId);
        }

        const { data: logs, error } = await query;

        if (error) {
            console.error('Erreur récupération agent_logs:', error);
            return NextResponse.json(
                { success: false, logs: [], message: 'Erreur de récupération' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            logs: logs || [],
        });

    } else {
        // Récupérer les backup_logs (défaut)
        let query = supabase
            .from('backup_logs')
            .select(`
                id,
                status,
                message,
                files_new,
                files_changed,
                data_added,
                duration_seconds,
                created_at,
                agents (
                    id,
                    hostname
                )
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (agentId) {
            query = query.eq('agent_id', agentId);
        }

        const { data: logs, error } = await query;

        if (error) {
            console.error('Erreur récupération backup_logs:', error);
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
}
