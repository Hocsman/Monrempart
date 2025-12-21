'use client';

import Link from 'next/link';
import { Shield, ArrowLeft, Lock } from 'lucide-react';

export default function PrivacyPage() {
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
                    <Lock className="w-10 h-10 text-emerald-500" />
                    <h1 className="text-3xl font-bold text-white">Politique de Confidentialité</h1>
                </div>

                <div className="prose prose-invert max-w-none">
                    <p className="text-slate-400 text-lg mb-8">
                        Dernière mise à jour : Décembre 2024
                    </p>

                    <div className="space-y-8 text-slate-300">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">1. Données collectées</h2>
                            <p>Nous collectons uniquement les données nécessaires au fonctionnement du service : email, nom de structure, et métadonnées de sauvegarde.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">2. Hébergement</h2>
                            <p>Vos données sont hébergées en France chez Scaleway, dans le respect du RGPD.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">3. Chiffrement</h2>
                            <p>Vos sauvegardes sont chiffrées en AES-256 sur votre machine avant transfert. Nous n&apos;avons pas accès au contenu de vos fichiers (Zero Knowledge).</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">4. Vos droits</h2>
                            <p>Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données. Contact : privacy@mon-rempart.fr</p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
