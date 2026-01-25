import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe, PRICE_TO_PLAN } from '@/lib/stripe';
import Stripe from 'stripe';

// Supabase admin client
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
}

/**
 * POST /api/stripe/webhook
 * Reçoit les événements Stripe et met à jour la base de données
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        if (!stripe) {
            return NextResponse.json(
                { success: false, message: 'Stripe non configuré' },
                { status: 500 }
            );
        }

        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            return NextResponse.json(
                { success: false, message: 'Signature manquante' },
                { status: 400 }
            );
        }

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('STRIPE_WEBHOOK_SECRET non configuré');
            return NextResponse.json(
                { success: false, message: 'Webhook non configuré' },
                { status: 500 }
            );
        }

        // Vérifier la signature
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error('Erreur vérification signature:', err);
            return NextResponse.json(
                { success: false, message: 'Signature invalide' },
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

        // Traiter les événements
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.user_id;
                const customerId = session.customer as string;
                const subscriptionId = session.subscription as string;

                if (!userId) {
                    console.error('user_id manquant dans metadata');
                    break;
                }

                // Récupérer les détails de l'abonnement
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const priceId = subscription.items.data[0]?.price.id;
                const plan = PRICE_TO_PLAN[priceId] || 'independant';

                // Upsert dans la table subscriptions
                const { error } = await supabase
                    .from('subscriptions')
                    .upsert({
                        user_id: userId,
                        stripe_customer_id: customerId,
                        stripe_subscription_id: subscriptionId,
                        stripe_price_id: priceId,
                        plan: plan,
                        status: 'active',
                        current_period_start: new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
                        current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
                    }, {
                        onConflict: 'user_id'
                    });

                if (error) {
                    console.error('Erreur upsert subscription:', error);
                } else {
                    console.log(`✅ Abonnement créé pour user ${userId}: ${plan}`);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const subscriptionId = subscription.id;
                const priceId = subscription.items.data[0]?.price.id;
                const plan = PRICE_TO_PLAN[priceId] || 'independant';

                const { error } = await supabase
                    .from('subscriptions')
                    .update({
                        stripe_price_id: priceId,
                        plan: plan,
                        status: subscription.status === 'active' ? 'active' : subscription.status,
                        current_period_start: new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
                        current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
                        cancel_at_period_end: subscription.cancel_at_period_end,
                    })
                    .eq('stripe_subscription_id', subscriptionId);

                if (error) {
                    console.error('Erreur update subscription:', error);
                } else {
                    console.log(`📝 Abonnement mis à jour: ${subscriptionId}`);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const subscriptionId = subscription.id;

                const { error } = await supabase
                    .from('subscriptions')
                    .update({
                        status: 'canceled',
                        plan: 'free',
                    })
                    .eq('stripe_subscription_id', subscriptionId);

                if (error) {
                    console.error('Erreur delete subscription:', error);
                } else {
                    console.log(`🛑 Abonnement annulé: ${subscriptionId}`);
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = (invoice as unknown as { subscription: string }).subscription;

                const { error } = await supabase
                    .from('subscriptions')
                    .update({
                        status: 'past_due',
                    })
                    .eq('stripe_subscription_id', subscriptionId);

                if (error) {
                    console.error('Erreur update payment failed:', error);
                } else {
                    console.log(`⚠️ Paiement échoué pour: ${subscriptionId}`);
                }
                break;
            }

            default:
                console.log(`Événement non géré: ${event.type}`);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Erreur webhook Stripe:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur interne' },
            { status: 500 }
        );
    }
}
