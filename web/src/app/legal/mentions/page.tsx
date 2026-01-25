'use client';

import Link from 'next/link';
import { Shield, ArrowLeft, Building2 } from 'lucide-react';

export default function MentionsPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <header className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
                <nav className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-emerald-500" />
                        <span className="text-xl font-bold text-white">Mon Rempart</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
                    </Link>
                </nav>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16">
                <div className="flex items-center gap-4 mb-8">
                    <Building2 className="w-10 h-10 text-emerald-500" />
                    <h1 className="text-3xl font-bold text-white">Mentions Légales</h1>
                </div>

                <p className="text-slate-400 mb-12">
                    Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique (LCEN).
                </p>

                <div className="space-y-12 text-slate-300">
                    {/* Éditeur */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">1. Éditeur du site</h2>
                        <div className="space-y-3">
                            <p><strong className="text-white">Raison sociale :</strong> Mon Rempart SAS</p>
                            <p><strong className="text-white">Forme juridique :</strong> Société par Actions Simplifiée (SAS)</p>
                            <p><strong className="text-white">Capital social :</strong> 1 000 €</p>
                            <p><strong className="text-white">Siège social :</strong> France</p>
                            <p><strong className="text-white">SIRET :</strong> En cours d&apos;immatriculation</p>
                            <p><strong className="text-white">RCS :</strong> En cours d&apos;immatriculation</p>
                            <p><strong className="text-white">Numéro de TVA :</strong> En cours d&apos;attribution</p>
                            <p><strong className="text-white">Directeur de la publication :</strong> Le Président de la société</p>
                            <p><strong className="text-white">Contact :</strong> <a href="mailto:contact@mon-rempart.fr" className="text-emerald-400 hover:underline">contact@mon-rempart.fr</a></p>
                        </div>
                    </section>

                    {/* Hébergement Site */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">2. Hébergement du site web</h2>
                        <div className="space-y-3">
                            <p><strong className="text-white">Raison sociale :</strong> Vercel Inc.</p>
                            <p><strong className="text-white">Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                            <p><strong className="text-white">Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">https://vercel.com</a></p>
                        </div>
                    </section>

                    {/* Hébergement Données - IMPORTANT */}
                    <section className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">3. Hébergement des données de sauvegarde</h2>
                        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-4 mb-6">
                            <p className="text-emerald-300 font-medium">
                                🇫🇷 Vos données de sauvegarde sont exclusivement hébergées en France, chez un hébergeur français.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <p><strong className="text-white">Raison sociale :</strong> Scaleway SAS</p>
                            <p><strong className="text-white">Adresse :</strong> 8 rue de la Ville l&apos;Évêque, 75008 Paris, France</p>
                            <p><strong className="text-white">Datacenter :</strong> DC3 - Paris, France</p>
                            <p><strong className="text-white">Certifications :</strong> ISO 27001, SOC 2 Type II, HDS (Hébergeur de Données de Santé)</p>
                            <p><strong className="text-white">Site web :</strong> <a href="https://www.scaleway.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">https://www.scaleway.com</a></p>
                        </div>
                    </section>

                    {/* Propriété intellectuelle */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">4. Propriété intellectuelle</h2>
                        <p className="mb-4">
                            L&apos;ensemble du contenu du site Mon Rempart (textes, images, logos, icônes, logiciels) est la propriété exclusive de Mon Rempart SAS ou de ses partenaires, et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
                        </p>
                        <p>
                            Toute reproduction, représentation, modification ou distribution, totale ou partielle, du contenu de ce site sans autorisation préalable est strictement interdite.
                        </p>
                    </section>

                    {/* Liens externes */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">5. Liens hypertextes</h2>
                        <p>
                            Le site peut contenir des liens vers d&apos;autres sites internet. Mon Rempart SAS décline toute responsabilité quant au contenu de ces sites tiers.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">6. Contact</h2>
                        <p>Pour toute question relative aux présentes mentions légales :</p>
                        <p className="mt-4">
                            <a href="mailto:legal@mon-rempart.fr" className="text-emerald-400 hover:underline">legal@mon-rempart.fr</a>
                        </p>
                    </section>
                </div>

                <p className="text-slate-500 text-sm mt-12 text-center">
                    Dernière mise à jour : Janvier 2026
                </p>
            </main>
        </div>
    );
}
