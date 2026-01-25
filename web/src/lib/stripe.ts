import Stripe from 'stripe';

// Initialiser Stripe avec la clé secrète
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
    console.warn('⚠️ STRIPE_SECRET_KEY non configurée');
}

export const stripe = stripeSecretKey
    ? new Stripe(stripeSecretKey)
    : null;

// Prix Stripe (à remplacer par vos vrais IDs après création sur Stripe)
export const STRIPE_PRICES = {
    independant: process.env.STRIPE_PRICE_INDEPENDANT || 'price_independant',
    serenite: process.env.STRIPE_PRICE_SERENITE || 'price_serenite',
} as const;

// Mapping prix -> plan
export const PRICE_TO_PLAN: Record<string, string> = {
    [STRIPE_PRICES.independant]: 'independant',
    [STRIPE_PRICES.serenite]: 'serenite',
};

// URLs de redirection
export const getStripeUrls = (origin: string) => ({
    success: `${origin}/dashboard?subscription=success`,
    cancel: `${origin}/pricing?subscription=canceled`,
});
