'use client';

import Link from 'next/link';
import { Shield, ArrowLeft, Mail, MessageCircle } from 'lucide-react';

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <header className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
                <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-emerald-500" />
                        <span className="text-xl font-bold text-white">Mon Rempart</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white">
                        <ArrowLeft className="w-4 h-4" /> Retour
                    </Link>
                </nav>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16">
                <div className="flex items-center gap-4 mb-8">
                    <MessageCircle className="w-10 h-10 text-emerald-500" />
                    <h1 className="text-3xl font-bold text-white">Support</h1>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <a href="mailto:support@mon-rempart.fr" className="bg-slate-800/30 border border-slate-700/50 hover:border-emerald-500/50 rounded-xl p-8 text-center transition-all">
                        <Mail className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Email</h2>
                        <p className="text-slate-400 mb-4">Réponse sous 24h (jours ouvrés)</p>
                        <span className="text-emerald-400">support@mon-rempart.fr</span>
                    </a>

                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 text-center">
                        <MessageCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">Téléphone</h2>
                        <p className="text-slate-400 mb-4">Plan Sérénité uniquement</p>
                        <span className="text-slate-500">Réservé aux abonnés</span>
                    </div>
                </div>

                <div className="mt-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-emerald-400 mb-2">Besoin d&apos;aide rapidement ?</h3>
                    <p className="text-slate-400">Consultez notre <Link href="/docs" className="text-emerald-400 hover:underline">documentation</Link> pour les questions fréquentes.</p>
                </div>
            </main>
        </div>
    );
}
