'use client';

import Link from 'next/link';
import { Shield, ArrowLeft, Building2 } from 'lucide-react';

export default function MentionsPage() {
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
                    <Building2 className="w-10 h-10 text-emerald-500" />
                    <h1 className="text-3xl font-bold text-white">Mentions Légales</h1>
                </div>

                <div className="space-y-8 text-slate-300">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">Éditeur</h2>
                        <p>Mon Rempart SAS<br />
                            France<br />
                            contact@mon-rempart.fr</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">Hébergement</h2>
                        <p>Vercel Inc.<br />
                            340 S Lemon Ave #4133<br />
                            Walnut, CA 91789, USA</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">Stockage des données</h2>
                        <p>Scaleway SAS<br />
                            8 rue de la Ville l&apos;Évêque<br />
                            75008 Paris, France</p>
                    </section>
                </div>
            </main>
        </div>
    );
}
