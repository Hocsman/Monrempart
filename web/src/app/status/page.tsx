'use client';

import Link from 'next/link';
import { Shield, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

export default function StatusPage() {
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
                    <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse" />
                    <h1 className="text-3xl font-bold text-white">Statut des Services</h1>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                        <span className="text-lg font-semibold text-emerald-400">Tous les systèmes sont opérationnels</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {[
                        { name: 'Dashboard Web', status: 'ok' },
                        { name: 'API Agent', status: 'ok' },
                        { name: 'Stockage Scaleway', status: 'ok' },
                        { name: 'Authentification', status: 'ok' },
                    ].map((service, i) => (
                        <div key={i} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
                            <span className="text-white">{service.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-400 text-sm">Opérationnel</span>
                                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
