'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { useNotifications } from '../app/dashboard/components/NotificationContext';

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

export function useRealtimeSubscription() {
    const { addNotification } = useNotifications();
    const channelRef = useRef<RealtimeChannel | null>(null);

    const handleBackupLog = useCallback((payload: BackupLogPayload) => {
        const { status, message } = payload.new;

        if (status === 'success') {
            addNotification({
                type: 'success',
                title: 'Sauvegarde terminée',
                message: message || 'La sauvegarde a été effectuée avec succès.',
                agentId: payload.new.agent_id,
            });
        } else if (status === 'failed') {
            addNotification({
                type: 'error',
                title: 'Échec de sauvegarde',
                message: message || 'La sauvegarde a échoué. Vérifiez les logs.',
                agentId: payload.new.agent_id,
            });
        }
    }, [addNotification]);

    const handleAgentLog = useCallback((payload: AgentLogPayload) => {
        const { level, message } = payload.new;

        // Only notify for warnings and errors
        if (level === 'error') {
            addNotification({
                type: 'error',
                title: 'Erreur Agent',
                message: message,
                agentId: payload.new.agent_id,
            });
        } else if (level === 'warning') {
            addNotification({
                type: 'warning',
                title: 'Avertissement Agent',
                message: message,
                agentId: payload.new.agent_id,
            });
        }
    }, [addNotification]);

    useEffect(() => {
        const supabase = getSupabase();
        if (!supabase) return;

        // Create realtime channel
        const channel = supabase
            .channel('dashboard-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'backup_logs',
                },
                (payload) => handleBackupLog(payload as unknown as BackupLogPayload)
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'agent_logs',
                },
                (payload) => handleAgentLog(payload as unknown as AgentLogPayload)
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Realtime notifications connected');
                }
            });

        channelRef.current = channel;

        // Cleanup
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [handleBackupLog, handleAgentLog]);
}
