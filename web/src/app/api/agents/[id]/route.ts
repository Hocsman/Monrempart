import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types
interface UpdateAgentPayload {
    hostname?: string;
    os?: string;
    ip_address?: string;
    status?: string;
}

// Fonction pour créer le client Supabase
function getSupabaseClient(): SupabaseClient | null {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return null;
    }

    return createClient(supabaseUrl, supabaseKey);
}

/**
 * GET /api/agents/[id]
 * Récupère les détails d'un agent
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const { id } = await params;

    const supabase = getSupabaseClient();
    if (!supabase) {
        return NextResponse.json(
            { success: false, message: 'Supabase non configuré' },
            { status: 500 }
        );
    }

    const { data: agent, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !agent) {
        return NextResponse.json(
            { success: false, message: 'Agent non trouvé' },
            { status: 404 }
        );
    }

    return NextResponse.json({ success: true, agent });
}

/**
 * PATCH /api/agents/[id]
 * Met à jour un agent
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const { id } = await params;

    const supabase = getSupabaseClient();
    if (!supabase) {
        return NextResponse.json(
            { success: false, message: 'Supabase non configuré' },
            { status: 500 }
        );
    }

    try {
        const body: UpdateAgentPayload = await request.json();

        // Validation basique
        if (Object.keys(body).length === 0) {
            return NextResponse.json(
                { success: false, message: 'Aucune donnée à mettre à jour' },
                { status: 400 }
            );
        }

        // Mise à jour de l'agent
        const { data: agent, error } = await supabase
            .from('agents')
            .update({
                ...body,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Erreur mise à jour agent:', error);
            return NextResponse.json(
                { success: false, message: 'Erreur lors de la mise à jour' },
                { status: 500 }
            );
        }

        console.log(`✏️ Agent ${id} mis à jour`);

        return NextResponse.json({
            success: true,
            message: 'Agent modifié avec succès',
            agent
        });

    } catch (error) {
        console.error('Erreur PATCH agent:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/agents/[id]
 * Supprime un agent
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const { id } = await params;

    const supabase = getSupabaseClient();
    if (!supabase) {
        return NextResponse.json(
            { success: false, message: 'Supabase non configuré' },
            { status: 500 }
        );
    }

    const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Erreur suppression agent:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur lors de la suppression' },
            { status: 500 }
        );
    }

    console.log(`🗑️ Agent ${id} supprimé`);

    return NextResponse.json({
        success: true,
        message: 'Agent supprimé avec succès'
    });
}
