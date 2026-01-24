'use client';

import { useEffect } from 'react';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { useNotifications } from './NotificationContext';

let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
    if (typeof window === 'undefined') return null;

    if (!supabaseInstance) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (url && key) {
            supabaseInstance = createClient(url, key);
        }
    }
    return supabaseInstance;
}

interface BackupLogPayload {
    new: {
        id: string;
        agent_id: string;
        status: string;
        message?: string;
    };
}

interface AgentLogPayload {
    new: {
        id: string;
        agent_id: string;
        level: 'info' | 'warning' | 'error';
        message: string;
    };
}

export default function RealtimeNotifications() {
    const { addNotification } = useNotifications();

    useEffect(() => {
        const supabase = getSupabase();
        if (!supabase) return;

        let channel: RealtimeChannel | null = null;

        // Create realtime channel
        channel = supabase
            .channel('dashboard-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'backup_logs',
                },
                (payload) => {
                    const data = payload as unknown as BackupLogPayload;
                    const { status, message } = data.new;

                    if (status === 'success') {
                        addNotification({
                            type: 'success',
                            title: 'Sauvegarde terminée',
                            message: message || 'La sauvegarde a été effectuée avec succès.',
                            agentId: data.new.agent_id,
                        });
                    } else if (status === 'failed') {
                        addNotification({
                            type: 'error',
                            title: 'Échec de sauvegarde',
                            message: message || 'La sauvegarde a échoué.',
                            agentId: data.new.agent_id,
                        });
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'agent_logs',
                },
                (payload) => {
                    const data = payload as unknown as AgentLogPayload;
                    const { level, message } = data.new;

                    if (level === 'error') {
                        addNotification({
                            type: 'error',
                            title: 'Erreur Agent',
                            message: message,
                            agentId: data.new.agent_id,
                        });
                    } else if (level === 'warning') {
                        addNotification({
                            type: 'warning',
                            title: 'Avertissement Agent',
                            message: message,
                            agentId: data.new.agent_id,
                        });
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Realtime notifications connected');
                }
            });

        // Cleanup
        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [addNotification]);

    // This component doesn't render anything
    return null;
}
