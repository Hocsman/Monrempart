'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Building2, Hash, ArrowRight, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase client (lazy initialization)
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

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        structureName: '',
        structureType: 'entreprise',
        email: '',
        password: '',
        confirmPassword: '',
        siret: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation
        if (!formData.structureName || !formData.email || !formData.password) {
            setError('Veuillez remplir tous les champs obligatoires');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            setLoading(false);
            return;
        }

        const supabase = getSupabase();
        if (!supabase) {
            setError('Configuration Supabase manquante');
            setLoading(false);
            return;
        }

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        structure_name: formData.structureName,
                        structure_type: formData.structureType,
                        siret: formData.siret || null,
                    }
                }
            });

            if (signUpError) {
                throw signUpError;
            }

            if (data.user) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/onboarding');
                }, 2000);
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Panneau gauche - Formulaire */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 mb-8">
                        <Shield className="w-10 h-10 text-emerald-500" />
                        <span className="text-2xl font-bold text-white">Mon Rempart</span>
                    </Link>

                    <h1 className="text-3xl font-bold text-white mb-2">Créer un compte</h1>
                    <p className="text-slate-400 mb-8">
                        Protégez votre structure en quelques minutes.
                    </p>

                    {/* Messages */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400"
                        >
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-400"
                        >
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            Compte créé avec succès ! Redirection...
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Nom de la structure */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Nom de la structure *</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    name="structureName"
                                    value={formData.structureName}
                                    onChange={handleChange}
                                    placeholder="Mairie de... / Mon Entreprise"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Type de structure */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Type de structure *</label>
                            <select
                                name="structureType"
                                value={formData.structureType}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            >
                                <option value="entreprise">TPE / PME / Indépendant</option>
                                <option value="mairie">Mairie / Collectivité</option>
                                <option value="association">Association</option>
                                <option value="autre">Autre</option>
                            </select>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Email *</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="vous@exemple.fr"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Mot de passe *</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Minimum 8 caractères"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Confirmation mot de passe */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Confirmer le mot de passe *</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirmez votre mot de passe"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* SIRET (optionnel) */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">SIRET (optionnel)</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    name="siret"
                                    value={formData.siret}
                                    onChange={handleChange}
                                    placeholder="123 456 789 00012"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Bouton */}
                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white py-4 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Création en cours...
                                </>
                            ) : (
                                <>
                                    Créer mon compte
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-slate-500 text-center mt-8">
                        Déjà un compte ?{' '}
                        <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                            Se connecter
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Panneau droit - Visuel */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-900/20 to-slate-900 items-center justify-center p-12 border-l border-slate-800">
                <div className="max-w-md text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <div className="w-32 h-32 mx-auto bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6">
                            <Shield className="w-16 h-16 text-emerald-500" />
                        </div>
                    </motion.div>

                    <h2 className="text-2xl font-bold text-white mb-4">
                        Essai gratuit 14 jours
                    </h2>
                    <p className="text-slate-400 mb-8">
                        Testez toutes les fonctionnalités sans engagement.
                        Aucune carte bancaire requise.
                    </p>

                    <ul className="text-left space-y-4">
                        {[
                            'Sauvegarde automatique illimitée',
                            'Chiffrement AES-256',
                            'Support prioritaire',
                            'Hébergement en France'
                        ].map((item, i) => (
                            <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="flex items-center gap-3 text-slate-300"
                            >
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                {item}
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
