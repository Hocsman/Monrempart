'use client';

import Link from 'next/link';
import { Shield, ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
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
                    <FileText className="w-10 h-10 text-emerald-500" />
                    <h1 className="text-3xl font-bold text-white">Conditions Générales d&apos;Utilisation</h1>
                </div>

                <div className="prose prose-invert max-w-none">
                    <p className="text-slate-400 text-lg mb-8">
                        Dernière mise à jour : Décembre 2024
                    </p>

                    <div className="space-y-8 text-slate-300">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">1. Objet</h2>
                            <p>Les présentes Conditions Générales d&apos;Utilisation régissent l&apos;accès et l&apos;utilisation du service Mon Rempart, solution de sauvegarde et cybersécurité.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">2. Description du service</h2>
                            <p>Mon Rempart propose un service de sauvegarde automatisée et sécurisée de vos données, avec hébergement en France chez Scaleway.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">3. Inscription</h2>
                            <p>L&apos;utilisation du service nécessite la création d&apos;un compte. Vous êtes responsable de la confidentialité de vos identifiants.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">4. Tarification</h2>
                            <p>Les tarifs en vigueur sont disponibles sur la page Tarifs. Toute modification sera communiquée avec un préavis de 30 jours.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">5. Contact</h2>
                            <p>Pour toute question : contact@mon-rempart.fr</p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
