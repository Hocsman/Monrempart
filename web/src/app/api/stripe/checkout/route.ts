import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe, STRIPE_PRICES, getStripeUrls } from '@/lib/stripe';

// Supabase admin client
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
}

interface CheckoutBody {
    priceId: string;
    userId: string;
    email: string;
}

/**
 * POST /api/stripe/checkout
 * Crée une session Stripe Checkout pour l'abonnement
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        if (!stripe) {
            return NextResponse.json(
                { success: false, message: 'Stripe non configuré' },
                { status: 500 }
            );
        }

        const body: CheckoutBody = await request.json();
        const { priceId, userId, email } = body;

        if (!priceId || !userId || !email) {
            return NextResponse.json(
                { success: false, message: 'priceId, userId et email requis' },
                { status: 400 }
            );
        }

        // Vérifier que le prix est valide
        const validPrices = Object.values(STRIPE_PRICES);
        if (!validPrices.includes(priceId)) {
            return NextResponse.json(
                { success: false, message: 'Prix invalide' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();

        // Vérifier si l'utilisateur a déjà un customer Stripe
        let customerId: string | undefined;

        if (supabase) {
            const { data: subscription } = await supabase
                .from('subscriptions')
                .select('stripe_customer_id')
                .eq('user_id', userId)
                .single();

            if (subscription?.stripe_customer_id) {
                customerId = subscription.stripe_customer_id;
            }
        }

        // URLs de redirection
        const origin = request.headers.get('origin') || 'http://localhost:3000';
        const urls = getStripeUrls(origin);

        // Créer la session Checkout
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer: customerId,
            customer_email: customerId ? undefined : email,
            success_url: urls.success,
            cancel_url: urls.cancel,
            metadata: {
                user_id: userId,
            },
            subscription_data: {
                metadata: {
                    user_id: userId,
                },
            },
        });

        return NextResponse.json({
            success: true,
            url: session.url,
            sessionId: session.id,
        });

    } catch (error) {
        console.error('Erreur Stripe checkout:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur création session' },
            { status: 500 }
        );
    }
}
