'use client';

import Link from 'next/link';
import { Shield, ArrowLeft, Lock, CheckCircle, Globe, Key, UserCheck, Trash2, FileEdit, Mail } from 'lucide-react';

export default function PrivacyPage() {
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
                    <Lock className="w-10 h-10 text-emerald-500" />
                    <h1 className="text-3xl font-bold text-white">Politique de Confidentialité</h1>
                </div>

                <p className="text-slate-400 mb-12">
                    Conformément au Règlement Général sur la Protection des Données (RGPD) - Règlement (UE) 2016/679.
                </p>

                <div className="space-y-12 text-slate-300">
                    {/* Introduction */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">1. Responsable du traitement</h2>
                        <p className="mb-4">
                            Mon Rempart SAS est responsable du traitement des données personnelles collectées sur ce site et via notre service de sauvegarde.
                        </p>
                        <p>
                            <strong className="text-white">Contact DPO :</strong>{' '}
                            <a href="mailto:privacy@mon-rempart.fr" className="text-emerald-400 hover:underline">privacy@mon-rempart.fr</a>
                        </p>
                    </section>

                    {/* Architecture Zero Knowledge - CRUCIAL */}
                    <section className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Key className="w-6 h-6 text-emerald-500" />
                            <h2 className="text-xl font-semibold text-emerald-400">2. Architecture Zero Knowledge</h2>
                        </div>

                        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-6 mb-6">
                            <p className="text-emerald-200 font-medium text-lg mb-4">
                                🔐 Nous ne pouvons pas accéder au contenu de vos sauvegardes.
                            </p>
                            <p className="text-emerald-300">
                                Vos données sont chiffrées localement sur votre machine avec l&apos;algorithme <strong>AES-256</strong> avant tout transfert.
                                La clé de chiffrement est détenue uniquement par vous et n&apos;est jamais transmise à nos serveurs.
                            </p>
                        </div>

                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span><strong className="text-white">Chiffrement côté client :</strong> Les données sont chiffrées avant de quitter votre ordinateur.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span><strong className="text-white">Clé privée :</strong> Votre mot de passe de chiffrement n&apos;est jamais stocké ni transmis.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span><strong className="text-white">Zero Knowledge :</strong> Même sous contrainte légale, nous ne pouvons pas déchiffrer vos fichiers.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Hébergement France */}
                    <section className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Globe className="w-6 h-6 text-emerald-500" />
                            <h2 className="text-xl font-semibold text-emerald-400">3. Localisation des données</h2>
                        </div>

                        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-6 mb-6">
                            <p className="text-emerald-200 font-medium text-lg">
                                🇫🇷 Vos données de sauvegarde sont stockées exclusivement en France.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <p><strong className="text-white">Hébergeur :</strong> Scaleway SAS (Paris, France)</p>
                            <p><strong className="text-white">Datacenter :</strong> DC3 - Paris</p>
                            <p><strong className="text-white">Législation applicable :</strong> Droit français et Règlement européen RGPD</p>
                            <p className="mt-4 text-slate-400">
                                Aucun transfert de données hors de l&apos;Union Européenne n&apos;est effectué pour vos sauvegardes.
                            </p>
                        </div>
                    </section>

                    {/* Données collectées */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">4. Données personnelles collectées</h2>

                        <h3 className="text-white font-medium mb-4">Données d&apos;identification :</h3>
                        <ul className="list-disc list-inside space-y-2 mb-6 text-slate-400">
                            <li>Adresse email</li>
                            <li>Nom de la structure (Mairie, entreprise...)</li>
                            <li>Numéro SIRET (optionnel)</li>
                        </ul>

                        <h3 className="text-white font-medium mb-4">Données techniques :</h3>
                        <ul className="list-disc list-inside space-y-2 mb-6 text-slate-400">
                            <li>Adresse IP de connexion</li>
                            <li>Nom des machines (hostname)</li>
                            <li>Métadonnées de sauvegarde (taille, date, nombre de fichiers)</li>
                        </ul>

                        <h3 className="text-white font-medium mb-4">Données NON collectées :</h3>
                        <ul className="list-disc list-inside space-y-2 text-emerald-400">
                            <li>Contenu de vos fichiers (chiffré, inaccessible)</li>
                            <li>Mots de passe de chiffrement</li>
                            <li>Clés de déchiffrement</li>
                        </ul>
                    </section>

                    {/* Droits RGPD */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">5. Vos droits (RGPD)</h2>
                        <p className="mb-6">Conformément au RGPD, vous disposez des droits suivants :</p>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-slate-900/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <UserCheck className="w-5 h-5 text-emerald-500" />
                                    <h3 className="text-white font-medium">Droit d&apos;accès</h3>
                                </div>
                                <p className="text-slate-400 text-sm">Obtenir une copie de vos données personnelles.</p>
                            </div>

                            <div className="bg-slate-900/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileEdit className="w-5 h-5 text-emerald-500" />
                                    <h3 className="text-white font-medium">Droit de rectification</h3>
                                </div>
                                <p className="text-slate-400 text-sm">Corriger des données inexactes.</p>
                            </div>

                            <div className="bg-slate-900/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Trash2 className="w-5 h-5 text-emerald-500" />
                                    <h3 className="text-white font-medium">Droit à l&apos;effacement</h3>
                                </div>
                                <p className="text-slate-400 text-sm">Supprimer vos données personnelles.</p>
                            </div>

                            <div className="bg-slate-900/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lock className="w-5 h-5 text-emerald-500" />
                                    <h3 className="text-white font-medium">Droit à la portabilité</h3>
                                </div>
                                <p className="text-slate-400 text-sm">Récupérer vos données dans un format standard.</p>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-slate-900/50 rounded-lg">
                            <p className="flex items-center gap-2">
                                <Mail className="w-5 h-5 text-emerald-500" />
                                <span>Pour exercer vos droits : <a href="mailto:privacy@mon-rempart.fr" className="text-emerald-400 hover:underline">privacy@mon-rempart.fr</a></span>
                            </p>
                            <p className="text-slate-400 text-sm mt-2">
                                Délai de réponse : 30 jours maximum conformément au RGPD.
                            </p>
                        </div>
                    </section>

                    {/* Conservation */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">6. Durée de conservation</h2>
                        <ul className="space-y-3">
                            <li><strong className="text-white">Données de compte :</strong> Conservées pendant la durée de l&apos;abonnement + 3 ans.</li>
                            <li><strong className="text-white">Données de sauvegarde :</strong> Conservées selon votre politique de rétention, supprimées à la résiliation.</li>
                            <li><strong className="text-white">Logs techniques :</strong> 12 mois maximum.</li>
                        </ul>
                    </section>

                    {/* Réclamation */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-emerald-400 mb-6">7. Réclamation</h2>
                        <p>
                            Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL :
                        </p>
                        <p className="mt-4">
                            <strong className="text-white">Commission Nationale de l&apos;Informatique et des Libertés</strong><br />
                            3 Place de Fontenoy, TSA 80715<br />
                            75334 Paris Cedex 07<br />
                            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">www.cnil.fr</a>
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
