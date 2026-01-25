'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Shield, ArrowLeft, CreditCard, CheckCircle, AlertTriangle,
    RefreshCw, ExternalLink, Calendar, Zap
} from 'lucide-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase client
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

interface Subscription {
    id: string;
    plan: string;
    status: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
}

const PLAN_DETAILS: Record<string, { name: string; price: string; color: string }> = {
    free: { name: 'Gratuit', price: '0€', color: 'slate' },
    independant: { name: 'Indépendant', price: '19€', color: 'blue' },
    serenite: { name: 'Sérénité', price: '79€', color: 'emerald' },
};

export default function BillingPage() {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingPortal, setLoadingPortal] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const loadSubscription = async () => {
            const supabase = getSupabase();
            if (!supabase) {
                setLoading(false);
                return;
            }

            // Récupérer l'utilisateur
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            setUserId(user.id);

            // Récupérer l'abonnement
            const { data } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (data) {
                setSubscription(data);
            }

            setLoading(false);
        };

        loadSubscription();
    }, []);

    const handleManageSubscription = async () => {
        if (!userId) return;

        setLoadingPortal(true);
        try {
            const response = await fetch('/api/stripe/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();
            if (data.success && data.url) {
                window.location.href = data.url;
            } else {
                alert(data.message || 'Erreur ouverture portail');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur ouverture portail');
        }
        setLoadingPortal(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    const plan = subscription?.plan || 'free';
    const planInfo = PLAN_DETAILS[plan] || PLAN_DETAILS.free;
    const isActive = subscription?.status === 'active';

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <Link href="/" className="flex items-center gap-3">
                            <Shield className="w-8 h-8 text-emerald-500" />
                            <span className="text-xl font-bold text-white">Mon Rempart</span>
                        </Link>
                        <span className="text-slate-500 px-3">|</span>
                        <h1 className="text-white font-semibold flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-emerald-500" />
                            Facturation
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                {/* Plan actuel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 mb-8"
                >
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Plan {planInfo.name}
                            </h2>
                            <p className="text-slate-400">
                                {planInfo.price}/mois
                            </p>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isActive
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-slate-500/20 text-slate-400'
                            }`}>
                            {isActive ? (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Actif
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="w-4 h-4" />
                                    {subscription?.status || 'Inactif'}
                                </>
                            )}
                        </div>
                    </div>

                    {subscription?.current_period_end && (
                        <div className="flex items-center gap-2 text-slate-400 mb-6">
                            <Calendar className="w-4 h-4" />
                            <span>
                                {subscription.cancel_at_period_end
                                    ? 'Se termine le'
                                    : 'Prochain renouvellement le'
                                } {new Date(subscription.current_period_end).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    )}

                    {subscription?.cancel_at_period_end && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-amber-400">
                                    Votre abonnement est annulé et ne sera pas renouvelé.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        {isActive ? (
                            <button
                                onClick={handleManageSubscription}
                                disabled={loadingPortal}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {loadingPortal ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ExternalLink className="w-4 h-4" />
                                )}
                                Gérer l&apos;abonnement
                            </button>
                        ) : (
                            <Link
                                href="/pricing"
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
                            >
                                <Zap className="w-4 h-4" />
                                Choisir un plan
                            </Link>
                        )}
                    </div>
                </motion.div>

                {/* Informations */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Besoin d&apos;aide ?
                    </h3>
                    <ul className="space-y-3 text-slate-400">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>Vous pouvez changer de plan à tout moment</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>Annulation possible sans engagement</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>Factures disponibles dans le portail Stripe</span>
                        </li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <Link href="/support" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                            Contacter le support →
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
