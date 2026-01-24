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

interface RestoreStatusBody {
    request_id: string;
    status: 'pending' | 'running' | 'success' | 'failed';
    message?: string;
}

/**
 * POST /api/restore/status
 * Reçoit les mises à jour de statut de restauration depuis un agent
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

        const body: RestoreStatusBody = await request.json();
        const { request_id, status, message } = body;

        if (!request_id || !status) {
            return NextResponse.json(
                { success: false, message: 'request_id et status requis' },
                { status: 400 }
            );
        }

        // Préparer les données de mise à jour
        const updateData: Record<string, unknown> = {
            status: status,
            message: message || null,
        };

        // Si le statut est final, ajouter la date de complétion
        if (status === 'success' || status === 'failed') {
            updateData.completed_at = new Date().toISOString();
        }

        // Mise à jour de la demande de restauration
        const { error } = await supabase
            .from('restore_requests')
            .update(updateData)
            .eq('id', request_id);

        if (error) {
            console.error('Erreur mise à jour restore_request:', error);
            return NextResponse.json(
                { success: false, message: 'Erreur mise à jour' },
                { status: 500 }
            );
        }

        console.log(`📝 Restore status mis à jour: ${request_id} → ${status}`);

        return NextResponse.json({
            success: true,
            message: `Statut mis à jour: ${status}`
        });

    } catch (error) {
        console.error('Erreur API restore status:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur interne' },
            { status: 500 }
        );
    }
}
