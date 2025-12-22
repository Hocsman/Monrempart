'use client';

import { useEffect, useState } from 'react';
import { Shield, Settings, Save, AlertCircle, CheckCircle, ArrowLeft, Server, Key, Lock } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Type pour les settings
interface SettingsData {
    id?: string;
    s3_endpoint: string;
    s3_bucket: string;
    s3_region: string;
    s3_access_key: string;
    s3_secret_key: string;
    restic_password: string;
}

// Valeurs par défaut
const defaultSettings: SettingsData = {
    s3_endpoint: 's3.fr-par.scw.cloud',
    s3_bucket: '',
    s3_region: 'fr-par',
    s3_access_key: '',
    s3_secret_key: '',
    restic_password: '',
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<SettingsData>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Chargement des settings
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                setSettings({
                    id: data.id,
                    s3_endpoint: data.s3_endpoint || defaultSettings.s3_endpoint,
                    s3_bucket: data.s3_bucket || '',
                    s3_region: data.s3_region || defaultSettings.s3_region,
                    s3_access_key: data.s3_access_key || '',
                    s3_secret_key: data.s3_secret_key || '',
                    restic_password: data.restic_password || '',
                });
            }
        } catch (err) {
            console.error('Erreur chargement settings:', err);
            setMessage({ type: 'error', text: 'Impossible de charger la configuration' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage(null);

            // Validation
            if (!settings.s3_bucket) {
                setMessage({ type: 'error', text: 'Le nom du bucket est requis' });
                return;
            }
            if (!settings.s3_access_key || !settings.s3_secret_key) {
                setMessage({ type: 'error', text: 'Les clés d\'accès S3 sont requises' });
                return;
            }
            if (!settings.restic_password) {
                setMessage({ type: 'error', text: 'Le mot de passe Restic est requis' });
                return;
            }

            if (settings.id) {
                // Mise à jour
                const { error } = await supabase
                    .from('settings')
                    .update({
                        s3_endpoint: settings.s3_endpoint,
                        s3_bucket: settings.s3_bucket,
                        s3_region: settings.s3_region,
                        s3_access_key: settings.s3_access_key,
                        s3_secret_key: settings.s3_secret_key,
                        restic_password: settings.restic_password,
                    })
                    .eq('id', settings.id);

                if (error) throw error;
            } else {
                // Création
                const { data, error } = await supabase
                    .from('settings')
                    .insert({
                        s3_endpoint: settings.s3_endpoint,
                        s3_bucket: settings.s3_bucket,
                        s3_region: settings.s3_region,
                        s3_access_key: settings.s3_access_key,
                        s3_secret_key: settings.s3_secret_key,
                        restic_password: settings.restic_password,
                    })
                    .select('id')
                    .single();

                if (error) throw error;
                if (data && 'id' in data) {
                    setSettings(prev => ({ ...prev, id: (data as { id: string }).id }));
                }
            }

            setMessage({ type: 'success', text: 'Configuration sauvegardée avec succès !' });
        } catch (err) {
            console.error('Erreur sauvegarde settings:', err);
            setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: keyof SettingsData, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
        setMessage(null);
    };

    return (
        <div className="min-h-screen bg-bleu-marine">
            {/* Header */}
            <header className="bg-bleu-marine/80 backdrop-blur-md border-b border-white/10">
                <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-vert-emeraude" />
                        <span className="text-xl font-bold text-white">Mon Rempart</span>
                    </div>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour au Dashboard
                    </Link>
                </nav>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Titre */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-vert-emeraude/10 rounded-xl flex items-center justify-center">
                        <Settings className="w-7 h-7 text-vert-emeraude" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Configuration</h1>
                        <p className="text-gray-400">Paramètres de stockage Scaleway S3 et Restic</p>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-vert-emeraude/10 border-vert-emeraude/30 text-vert-emeraude'
                        : 'bg-rouge-alerte/10 border-rouge-alerte/30 text-rouge-alerte'
                        }`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {message.text}
                    </div>
                )}

                {loading ? (
                    <div className="bg-bleu-marine-clair rounded-2xl border border-white/10 p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-vert-emeraude border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-400">Chargement de la configuration...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Section Scaleway S3 */}
                        <div className="bg-bleu-marine-clair rounded-2xl border border-white/10 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Server className="w-5 h-5 text-vert-emeraude" />
                                <h2 className="text-xl font-semibold text-white">Stockage Scaleway S3</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Endpoint S3</label>
                                    <input
                                        type="text"
                                        value={settings.s3_endpoint}
                                        onChange={(e) => handleChange('s3_endpoint', e.target.value)}
                                        className="w-full bg-bleu-marine border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-vert-emeraude/50 focus:outline-none transition-colors"
                                        placeholder="s3.fr-par.scw.cloud"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Région</label>
                                    <select
                                        value={settings.s3_region}
                                        onChange={(e) => handleChange('s3_region', e.target.value)}
                                        className="w-full bg-bleu-marine border border-white/10 rounded-lg px-4 py-3 text-white focus:border-vert-emeraude/50 focus:outline-none transition-colors"
                                    >
                                        <option value="fr-par">France - Paris (fr-par)</option>
                                        <option value="nl-ams">Pays-Bas - Amsterdam (nl-ams)</option>
                                        <option value="pl-waw">Pologne - Varsovie (pl-waw)</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-400 mb-2">Nom du Bucket *</label>
                                    <input
                                        type="text"
                                        value={settings.s3_bucket}
                                        onChange={(e) => handleChange('s3_bucket', e.target.value)}
                                        className="w-full bg-bleu-marine border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-vert-emeraude/50 focus:outline-none transition-colors"
                                        placeholder="mon-rempart-backups"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section Clés d'accès */}
                        <div className="bg-bleu-marine-clair rounded-2xl border border-white/10 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Key className="w-5 h-5 text-vert-emeraude" />
                                <h2 className="text-xl font-semibold text-white">Clés d&apos;accès S3</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Access Key *</label>
                                    <input
                                        type="text"
                                        value={settings.s3_access_key}
                                        onChange={(e) => handleChange('s3_access_key', e.target.value)}
                                        className="w-full bg-bleu-marine border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-vert-emeraude/50 focus:outline-none transition-colors font-mono text-sm"
                                        placeholder="SCWxxxxxxxxxxxxxxxxxx"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Secret Key *</label>
                                    <input
                                        type="password"
                                        value={settings.s3_secret_key}
                                        onChange={(e) => handleChange('s3_secret_key', e.target.value)}
                                        className="w-full bg-bleu-marine border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-vert-emeraude/50 focus:outline-none transition-colors font-mono text-sm"
                                        placeholder="••••••••••••••••••••••••••••••••"
                                    />
                                </div>
                            </div>

                            <p className="text-gray-500 text-sm mt-4">
                                💡 Créez vos clés dans la console Scaleway : Project Settings &gt; API Keys
                            </p>
                        </div>

                        {/* Section Restic */}
                        <div className="bg-bleu-marine-clair rounded-2xl border border-white/10 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Lock className="w-5 h-5 text-vert-emeraude" />
                                <h2 className="text-xl font-semibold text-white">Chiffrement Restic</h2>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Mot de passe de chiffrement *</label>
                                <input
                                    type="password"
                                    value={settings.restic_password}
                                    onChange={(e) => handleChange('restic_password', e.target.value)}
                                    className="w-full bg-bleu-marine border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-vert-emeraude/50 focus:outline-none transition-colors"
                                    placeholder="Mot de passe fort pour chiffrer les sauvegardes"
                                />
                            </div>

                            <div className="mt-4 p-4 bg-rouge-alerte/10 border border-rouge-alerte/30 rounded-lg">
                                <p className="text-rouge-alerte text-sm">
                                    ⚠️ <strong>Important :</strong> Ce mot de passe est utilisé pour chiffrer toutes vos sauvegardes.
                                    Si vous le perdez, vous ne pourrez plus restaurer vos données. Conservez-le en lieu sûr.
                                </p>
                            </div>
                        </div>

                        {/* Bouton Sauvegarder */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-vert-emeraude hover:bg-vert-emeraude-fonce text-white py-4 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                    Sauvegarde en cours...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Sauvegarder la configuration
                                </>
                            )}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
