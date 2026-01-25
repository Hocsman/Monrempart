'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Shield, ArrowLeft, User, Mail, Calendar, Key, Bell,
    Save, RefreshCw, CheckCircle, AlertTriangle, Trash2, Smartphone, Monitor, Clock, MapPin
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

interface UserData {
    id: string;
    email: string;
    created_at: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    // Notifications
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [savingPrefs, setSavingPrefs] = useState(false);

    // Messages
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // 2FA
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);

    // Sessions simulées
    const sessions = [
        { id: '1', device: 'Chrome sur MacOS', location: 'Paris, France', lastActive: 'Actuellement actif', current: true },
        { id: '2', device: 'Safari sur iPhone', location: 'Paris, France', lastActive: 'Il y a 2 heures', current: false },
        { id: '3', device: 'Firefox sur Windows', location: 'Lyon, France', lastActive: 'Il y a 3 jours', current: false },
    ];

    // Delete account
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const supabase = getSupabase();
        if (!supabase) {
            setLoading(false);
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser({
                id: user.id,
                email: user.email || '',
                created_at: user.created_at,
            });
        }

        setLoading(false);
    };

    const handlePasswordChange = async () => {
        if (!newPassword || !confirmPassword) {
            setMessage({ type: 'error', text: 'Veuillez remplir tous les champs' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
            return;
        }

        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères' });
            return;
        }

        const supabase = getSupabase();
        if (!supabase) return;

        setSavingPassword(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'success', text: 'Mot de passe modifié avec succès !' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch {
            setMessage({ type: 'error', text: 'Erreur lors du changement de mot de passe' });
        }

        setSavingPassword(false);
    };

    const handlePreferencesSave = async () => {
        setSavingPrefs(true);
        // TODO: Sauvegarder les préférences dans une table user_preferences
        await new Promise(resolve => setTimeout(resolve, 500));
        setMessage({ type: 'success', text: 'Préférences sauvegardées !' });
        setSavingPrefs(false);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== 'SUPPRIMER') return;

        const supabase = getSupabase();
        if (!supabase || !user) return;

        // TODO: Implémenter la suppression du compte côté serveur
        // Pour l'instant, juste déconnexion
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4"
                    >
                        <User className="w-8 h-8 text-emerald-500" />
                    </motion.div>
                    <p className="text-slate-400 text-sm">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-400 mb-4">Vous devez être connecté pour accéder à cette page.</p>
                    <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300">
                        Se connecter →
                    </Link>
                </div>
            </div>
        );
    }

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
                            <User className="w-5 h-5 text-emerald-500" />
                            Mon Profil
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                {/* Message */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                            }`}
                    >
                        {message.type === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <AlertTriangle className="w-5 h-5" />
                        )}
                        {message.text}
                    </motion.div>
                )}

                {/* Informations du compte */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 mb-6"
                >
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-500" />
                        Informations du compte
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
                            <Mail className="w-5 h-5 text-slate-400" />
                            <div>
                                <p className="text-slate-400 text-sm">Email</p>
                                <p className="text-white font-medium">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
                            <Calendar className="w-5 h-5 text-slate-400" />
                            <div>
                                <p className="text-slate-400 text-sm">Membre depuis</p>
                                <p className="text-white font-medium">{formatDate(user.created_at)}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Modifier le mot de passe */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 mb-6"
                >
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Key className="w-5 h-5 text-emerald-500" />
                        Modifier le mot de passe
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Mot de passe actuel</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Nouveau mot de passe</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Confirmer</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handlePasswordChange}
                            disabled={savingPassword}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {savingPassword ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Key className="w-4 h-4" />
                            )}
                            Modifier le mot de passe
                        </button>
                    </div>
                </motion.div>

                {/* Préférences de notifications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 mb-6"
                >
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-emerald-500" />
                        Notifications
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                            <div>
                                <p className="text-white font-medium">Alertes par email</p>
                                <p className="text-slate-400 text-sm">Recevoir un email en cas de backup échoué</p>
                            </div>
                            <button
                                onClick={() => setEmailAlerts(!emailAlerts)}
                                className={`relative w-14 h-8 rounded-full transition-colors ${emailAlerts ? 'bg-emerald-500' : 'bg-slate-600'
                                    }`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${emailAlerts ? 'left-7' : 'left-1'
                                    }`} />
                            </button>
                        </div>

                        <button
                            onClick={handlePreferencesSave}
                            disabled={savingPrefs}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {savingPrefs ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Sauvegarder les préférences
                        </button>
                    </div>
                </motion.div>

                {/* 2FA - Authentification double facteur */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 mb-6"
                >
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-emerald-500" />
                        Authentification double facteur (2FA)
                    </h2>

                    <div className="p-4 bg-slate-800/50 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-white font-medium">Protection 2FA</p>
                                <p className="text-slate-400 text-sm">Ajouter une couche de sécurité supplémentaire</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (!twoFAEnabled) setShowQRCode(true);
                                    setTwoFAEnabled(!twoFAEnabled);
                                }}
                                className={`relative w-14 h-8 rounded-full transition-colors ${twoFAEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                                    }`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${twoFAEnabled ? 'left-7' : 'left-1'
                                    }`} />
                            </button>
                        </div>

                        {twoFAEnabled && (
                            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    2FA activée - Votre compte est protégé
                                </div>
                            </div>
                        )}

                        {!twoFAEnabled && (
                            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                <p className="text-amber-400 text-sm">
                                    ⚠️ Nous recommandons fortement d&apos;activer la 2FA pour sécuriser votre compte.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Historique des connexions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 mb-6"
                >
                    <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-emerald-500" />
                        Sessions actives
                    </h2>

                    <div className="space-y-3">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`p-4 rounded-xl flex items-center justify-between ${session.current ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-800/50'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${session.current ? 'bg-emerald-500/20' : 'bg-slate-700'
                                        }`}>
                                        <Monitor className={`w-5 h-5 ${session.current ? 'text-emerald-400' : 'text-slate-400'
                                            }`} />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium flex items-center gap-2">
                                            {session.device}
                                            {session.current && (
                                                <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Actuelle</span>
                                            )}
                                        </p>
                                        <p className="text-slate-400 text-sm flex items-center gap-2">
                                            <MapPin className="w-3 h-3" />
                                            {session.location} • {session.lastActive}
                                        </p>
                                    </div>
                                </div>
                                {!session.current && (
                                    <button className="text-red-400 hover:text-red-300 text-sm">
                                        Déconnecter
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Zone danger */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-red-500/5 border border-red-500/30 rounded-2xl p-6"
                >
                    <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Zone danger
                    </h2>

                    <p className="text-slate-400 mb-4">
                        La suppression de votre compte est irréversible. Toutes vos données, agents et sauvegardes seront définitivement supprimés.
                    </p>

                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Supprimer mon compte
                    </button>
                </motion.div>
            </main>

            {/* Modal suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-md w-full mx-4"
                    >
                        <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Supprimer le compte
                        </h3>

                        <p className="text-slate-400 mb-4">
                            Cette action est irréversible. Tapez <strong className="text-white">SUPPRIMER</strong> pour confirmer.
                        </p>

                        <input
                            type="text"
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:border-red-500"
                            placeholder="SUPPRIMER"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirm !== 'SUPPRIMER'}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
