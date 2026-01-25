import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

// Supabase admin client
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
}

interface PortalBody {
    userId: string;
}

/**
 * POST /api/stripe/portal
 * Crée un lien vers le portail client Stripe
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        if (!stripe) {
            return NextResponse.json(
                { success: false, message: 'Stripe non configuré' },
                { status: 500 }
            );
        }

        const body: PortalBody = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'userId requis' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();
        if (!supabase) {
            return NextResponse.json(
                { success: false, message: 'Supabase non configuré' },
                { status: 500 }
            );
        }

        // Récupérer le customer ID
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', userId)
            .single();

        if (!subscription?.stripe_customer_id) {
            return NextResponse.json(
                { success: false, message: 'Aucun abonnement trouvé' },
                { status: 404 }
            );
        }

        // URL de retour
        const origin = request.headers.get('origin') || 'http://localhost:3000';
        const returnUrl = `${origin}/dashboard/billing`;

        // Créer la session du portail
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: subscription.stripe_customer_id,
            return_url: returnUrl,
        });

        return NextResponse.json({
            success: true,
            url: portalSession.url,
        });

    } catch (error) {
        console.error('Erreur Stripe portal:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur création portail' },
            { status: 500 }
        );
    }
}
