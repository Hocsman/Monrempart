'use client';

import Link from 'next/link';
import { Shield, ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';

export default function DocsPage() {
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
                    <BookOpen className="w-10 h-10 text-emerald-500" />
                    <h1 className="text-3xl font-bold text-white">Documentation</h1>
                </div>

                <div className="grid gap-6">
                    <Link href="/download" className="bg-slate-800/30 border border-slate-700/50 hover:border-emerald-500/50 rounded-xl p-6 transition-all">
                        <h2 className="text-xl font-semibold text-white mb-2">Installation de l&apos;agent</h2>
                        <p className="text-slate-400">Téléchargez et installez l&apos;agent Mon Rempart sur vos postes.</p>
                    </Link>

                    <Link href="/settings" className="bg-slate-800/30 border border-slate-700/50 hover:border-emerald-500/50 rounded-xl p-6 transition-all">
                        <h2 className="text-xl font-semibold text-white mb-2">Configuration</h2>
                        <p className="text-slate-400">Configurez vos paramètres S3 et Restic.</p>
                    </Link>

                    <a href="https://restic.net" target="_blank" rel="noopener noreferrer" className="bg-slate-800/30 border border-slate-700/50 hover:border-emerald-500/50 rounded-xl p-6 transition-all flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-2">Documentation Restic</h2>
                            <p className="text-slate-400">Documentation officielle de Restic.</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-slate-400" />
                    </a>
                </div>
            </main>
        </div>
    );
}
