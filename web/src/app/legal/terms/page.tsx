'use client';

import Link from 'next/link';
import { Shield, ArrowLeft, FileText, AlertTriangle } from 'lucide-react';

export default function TermsPage() {
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
                    <FileText className="w-10 h-10 text-emerald-500" />
                    <h1 className="text-3xl font-bold text-white">Conditions Générales d&apos;Utilisation</h1>
                </div>

                <p className="text-slate-400 mb-12">
                    Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;utilisation du service Mon Rempart.
                </p>

                <div className="space-y-12 text-slate-300">
                    {/* Objet */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">Article 1 - Objet</h2>
                        <p className="mb-4">
                            Les présentes CGU définissent les conditions d&apos;accès et d&apos;utilisation du service de sauvegarde et de cybersécurité Mon Rempart, édité par Mon Rempart SAS.
                        </p>
                        <p>
                            En créant un compte ou en utilisant le service, l&apos;Utilisateur accepte sans réserve les présentes CGU.
                        </p>
                    </section>

                    {/* Description du service */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">Article 2 - Description du service</h2>
                        <p className="mb-4">Mon Rempart propose :</p>
                        <ul className="list-disc list-inside space-y-2 text-slate-400">
                            <li>Un agent logiciel à installer sur les postes de travail Windows, Mac et Linux</li>
                            <li>Un service de sauvegarde automatisée et chiffrée vers un stockage cloud sécurisé</li>
                            <li>Un tableau de bord de supervision accessible via navigateur web</li>
                            <li>Un système de restauration des données sauvegardées</li>
                        </ul>
                    </section>

                    {/* Inscription */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">Article 3 - Inscription et compte</h2>
                        <p className="mb-4">
                            L&apos;utilisation du service nécessite la création d&apos;un compte. L&apos;Utilisateur s&apos;engage à fournir des informations exactes et à jour.
                        </p>
                        <p className="mb-4">
                            L&apos;Utilisateur est seul responsable de la confidentialité de ses identifiants de connexion et de toute utilisation de son compte.
                        </p>
                        <p>
                            En cas de suspicion d&apos;utilisation frauduleuse, l&apos;Utilisateur doit en informer immédiatement Mon Rempart SAS.
                        </p>
                    </section>

                    {/* CLAUSE CRUCIALE - Clé de chiffrement */}
                    <section className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                            <h2 className="text-xl font-semibold text-amber-400">Article 4 - Clé de chiffrement et responsabilité</h2>
                        </div>

                        <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-6 mb-6">
                            <p className="text-amber-200 font-medium text-lg mb-4">
                                ⚠️ CLAUSE IMPORTANTE - LISEZ ATTENTIVEMENT
                            </p>
                            <p className="text-amber-300">
                                Le service Mon Rempart utilise une architecture de chiffrement « Zero Knowledge ».
                                Cela signifie que votre mot de passe de chiffrement (clé Restic) n&apos;est jamais stocké ni transmis à Mon Rempart SAS.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <p>
                                <strong className="text-white">4.1</strong> L&apos;Utilisateur est seul détenteur de sa clé de chiffrement (mot de passe Restic).
                                Cette clé est indispensable pour restaurer les données sauvegardées.
                            </p>

                            <p>
                                <strong className="text-white">4.2</strong> Mon Rempart SAS ne dispose d&apos;aucun moyen technique pour récupérer,
                                réinitialiser ou contourner une clé de chiffrement perdue.
                            </p>

                            <p className="text-amber-400 font-medium">
                                <strong className="text-white">4.3</strong> En conséquence, Mon Rempart SAS décline toute responsabilité en cas de perte de la clé de chiffrement par l&apos;Utilisateur.
                                La perte de cette clé entraîne l&apos;impossibilité définitive de restaurer les données sauvegardées.
                            </p>

                            <p>
                                <strong className="text-white">4.4</strong> Il est de la responsabilité de l&apos;Utilisateur de conserver sa clé de chiffrement en lieu sûr,
                                de préférence dans un gestionnaire de mots de passe ou un coffre-fort numérique.
                            </p>
                        </div>
                    </section>

                    {/* Obligations de l'utilisateur */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">Article 5 - Obligations de l&apos;Utilisateur</h2>
                        <p className="mb-4">L&apos;Utilisateur s&apos;engage à :</p>
                        <ul className="list-disc list-inside space-y-2 text-slate-400">
                            <li>Utiliser le service conformément à sa destination et aux présentes CGU</li>
                            <li>Ne pas utiliser le service à des fins illicites ou contraires à l&apos;ordre public</li>
                            <li>Ne pas tenter de contourner les mesures de sécurité du service</li>
                            <li>Ne pas stocker de contenus illégaux (contenus pédopornographiques, contrefaçon, etc.)</li>
                            <li>Conserver sa clé de chiffrement en lieu sûr</li>
                            <li>Maintenir à jour les informations de son compte</li>
                        </ul>
                    </section>

                    {/* Disponibilité */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">Article 6 - Disponibilité du service</h2>
                        <p className="mb-4">
                            Mon Rempart SAS s&apos;efforce de maintenir le service accessible 24h/24, 7j/7, avec un objectif de disponibilité de 99,9%.
                        </p>
                        <p className="mb-4">
                            Toutefois, le service peut être temporairement interrompu pour des raisons de maintenance, de mise à jour, ou en cas de force majeure.
                        </p>
                        <p>
                            Mon Rempart SAS ne saurait être tenue responsable des conséquences d&apos;une indisponibilité temporaire du service.
                        </p>
                    </section>

                    {/* Tarification */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">Article 7 - Tarification et paiement</h2>
                        <p className="mb-4">
                            Les tarifs en vigueur sont disponibles sur la page <Link href="/pricing" className="text-emerald-400 hover:underline">Tarifs</Link>.
                        </p>
                        <p className="mb-4">
                            L&apos;abonnement est payable mensuellement ou annuellement selon l&apos;offre choisie.
                        </p>
                        <p>
                            Toute modification tarifaire sera notifiée à l&apos;Utilisateur avec un préavis de 30 jours.
                        </p>
                    </section>

                    {/* Résiliation */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">Article 8 - Résiliation</h2>
                        <p className="mb-4">
                            L&apos;Utilisateur peut résilier son abonnement à tout moment depuis son espace client.
                            La résiliation prend effet à la fin de la période de facturation en cours.
                        </p>
                        <p className="mb-4">
                            Mon Rempart SAS peut résilier le compte d&apos;un Utilisateur en cas de violation des présentes CGU,
                            avec un préavis de 15 jours sauf en cas de manquement grave.
                        </p>
                        <p>
                            À la résiliation, les données de sauvegarde sont conservées 30 jours, puis définitivement supprimées.
                        </p>
                    </section>

                    {/* Limitation de responsabilité */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">Article 9 - Limitation de responsabilité</h2>
                        <p className="mb-4">
                            Mon Rempart SAS met en œuvre tous les moyens raisonnables pour assurer la sécurité et l&apos;intégrité des données sauvegardées.
                        </p>
                        <p className="mb-4">
                            Toutefois, la responsabilité de Mon Rempart SAS ne saurait être engagée en cas de :
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-400 mb-4">
                            <li>Perte de la clé de chiffrement par l&apos;Utilisateur</li>
                            <li>Dommages résultant d&apos;une utilisation non conforme du service</li>
                            <li>Dommages causés par des tiers (attaques informatiques, etc.)</li>
                            <li>Cas de force majeure</li>
                        </ul>
                        <p>
                            La responsabilité de Mon Rempart SAS est limitée au montant des sommes versées par l&apos;Utilisateur au cours des 12 derniers mois.
                        </p>
                    </section>

                    {/* Droit applicable */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">Article 10 - Droit applicable et juridiction</h2>
                        <p className="mb-4">
                            Les présentes CGU sont régies par le droit français.
                        </p>
                        <p>
                            En cas de litige, les parties s&apos;engagent à rechercher une solution amiable.
                            À défaut, les tribunaux compétents de Paris seront seuls compétents.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">Article 11 - Contact</h2>
                        <p>
                            Pour toute question relative aux présentes CGU :{' '}
                            <a href="mailto:legal@mon-rempart.fr" className="text-emerald-400 hover:underline">legal@mon-rempart.fr</a>
                        </p>
                    </section>
                </div>

                <p className="text-slate-500 text-sm mt-12 text-center">
                    Dernière mise à jour : Décembre 2024
                </p>
            </main>
        </div>
    );
}
