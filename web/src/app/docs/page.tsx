'use client';

import Link from 'next/link';
import {
    Shield, ArrowLeft, BookOpen, Download, Play, CheckCircle,
    Monitor, Apple, Terminal, HelpCircle, AlertTriangle,
    Globe, Key, ChevronDown, ChevronRight, ExternalLink
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Composant FAQ
function FAQItem({ question, answer, warning = false }: { question: string; answer: string; warning?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`border rounded-xl overflow-hidden ${warning ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-700/50 bg-slate-800/30'}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
            >
                <span className={`font-medium ${warning ? 'text-amber-400' : 'text-white'}`}>{question}</span>
                {isOpen ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className={`px-6 pb-4 ${warning ? 'text-amber-300' : 'text-slate-400'}`}>
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <header className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
                <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-emerald-500" />
                        <span className="text-xl font-bold text-white">Mon Rempart</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
                    </Link>
                </nav>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-16">
                {/* Titre */}
                <div className="flex items-center gap-4 mb-4">
                    <BookOpen className="w-10 h-10 text-emerald-500" />
                    <h1 className="text-3xl font-bold text-white">Guide d&apos;installation rapide</h1>
                </div>
                <p className="text-slate-400 text-lg mb-12">
                    Installez l&apos;agent Mon Rempart en quelques minutes et protégez vos données automatiquement.
                </p>

                {/* Prérequis */}
                <section className="mb-16">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        Avant de commencer
                    </h2>
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                        <ul className="space-y-3 text-slate-300">
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-emerald-400 text-sm font-bold">1</span>
                                </div>
                                <span>Créez un compte sur <Link href="/auth/register" className="text-emerald-400 hover:underline">mon-rempart.fr</Link></span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-emerald-400 text-sm font-bold">2</span>
                                </div>
                                <span>Configurez vos paramètres S3 dans <Link href="/settings" className="text-emerald-400 hover:underline">Configuration</Link></span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-emerald-400 text-sm font-bold">3</span>
                                </div>
                                <span>Installez <a href="https://restic.net" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Restic</a> sur votre machine</span>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Installation Windows */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                            <Monitor className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Installation Windows</h2>
                            <p className="text-slate-400 text-sm">Windows 10/11 • 64 bits</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Étape 1 */}
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
                            <div className="bg-slate-800/50 px-6 py-3 border-b border-slate-700/50">
                                <span className="text-emerald-400 font-medium">Étape 1</span>
                                <span className="text-white ml-2">Téléchargez l&apos;agent</span>
                            </div>
                            <div className="p-6">
                                <p className="text-slate-300 mb-4">
                                    Téléchargez le fichier <code className="bg-slate-700 px-2 py-1 rounded text-emerald-400">mon-rempart-agent.exe</code>
                                </p>
                                <Link
                                    href="/download"
                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-all"
                                >
                                    <Download className="w-5 h-5" />
                                    Télécharger pour Windows
                                </Link>

                                {/* Placeholder capture */}
                                <div className="mt-6 bg-slate-900 border border-slate-700 rounded-lg p-8 text-center">
                                    <div className="w-16 h-16 bg-slate-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                        <Download className="w-8 h-8 text-slate-600" />
                                    </div>
                                    <p className="text-slate-500 text-sm">Capture : Page de téléchargement</p>
                                </div>
                            </div>
                        </div>

                        {/* Étape 2 */}
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
                            <div className="bg-slate-800/50 px-6 py-3 border-b border-slate-700/50">
                                <span className="text-emerald-400 font-medium">Étape 2</span>
                                <span className="text-white ml-2">Lancez l&apos;installation</span>
                            </div>
                            <div className="p-6">
                                <p className="text-slate-300 mb-4">
                                    Double-cliquez sur le fichier téléchargé pour lancer l&apos;agent.
                                </p>

                                {/* Alerte SmartScreen */}
                                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-amber-400 font-medium mb-2">Alerte Windows SmartScreen</p>
                                            <p className="text-amber-300 text-sm">
                                                Si Windows affiche un avertissement « Windows a protégé votre ordinateur »,
                                                cliquez sur <strong>« Informations complémentaires »</strong> puis <strong>« Exécuter quand même »</strong>.
                                            </p>
                                            <p className="text-amber-400/70 text-sm mt-2">
                                                Cette alerte apparaît car l&apos;application n&apos;est pas encore signée avec un certificat payant.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Placeholder capture SmartScreen */}
                                <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center">
                                    <div className="w-16 h-16 bg-amber-500/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                        <AlertTriangle className="w-8 h-8 text-amber-500/50" />
                                    </div>
                                    <p className="text-slate-500 text-sm">Capture : Alerte Windows SmartScreen</p>
                                </div>
                            </div>
                        </div>

                        {/* Étape 3 */}
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
                            <div className="bg-slate-800/50 px-6 py-3 border-b border-slate-700/50">
                                <span className="text-emerald-400 font-medium">Étape 3</span>
                                <span className="text-white ml-2">Connexion automatique</span>
                            </div>
                            <div className="p-6">
                                <p className="text-slate-300 mb-4">
                                    L&apos;agent se connecte automatiquement au Dashboard. Vous verrez apparaître votre machine dans la liste des agents.
                                </p>

                                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                                    <span className="text-emerald-400">L&apos;agent envoie un signal de vie toutes les 60 secondes</span>
                                </div>

                                {/* Placeholder capture Dashboard */}
                                <div className="mt-6 bg-slate-900 border border-slate-700 rounded-lg p-8 text-center">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                        <Shield className="w-8 h-8 text-emerald-500/50" />
                                    </div>
                                    <p className="text-slate-500 text-sm">Capture : Agent visible dans le Dashboard</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Installation Mac/Linux */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center">
                            <Terminal className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Installation Mac / Linux</h2>
                            <p className="text-slate-400 text-sm">Via le terminal</p>
                        </div>
                    </div>

                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                        {/* Mac Apple Silicon */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Apple className="w-5 h-5 text-slate-400" />
                                <h3 className="text-white font-medium">Mac (Apple Silicon - M1/M2/M3)</h3>
                            </div>
                            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                                <p className="text-slate-400"># Télécharger et rendre exécutable</p>
                                <p className="text-emerald-400">curl -L https://mon-rempart.fr/downloads/mon-rempart-agent-mac-arm64 -o mon-rempart-agent</p>
                                <p className="text-emerald-400">chmod +x mon-rempart-agent</p>
                                <p className="text-slate-400 mt-2"># Lancer l&apos;agent</p>
                                <p className="text-emerald-400">./mon-rempart-agent</p>
                            </div>
                        </div>

                        {/* Mac Intel */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Apple className="w-5 h-5 text-slate-400" />
                                <h3 className="text-white font-medium">Mac (Intel)</h3>
                            </div>
                            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                                <p className="text-emerald-400">curl -L https://mon-rempart.fr/downloads/mon-rempart-agent-mac-intel -o mon-rempart-agent</p>
                                <p className="text-emerald-400">chmod +x mon-rempart-agent && ./mon-rempart-agent</p>
                            </div>
                        </div>

                        {/* Linux */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Terminal className="w-5 h-5 text-slate-400" />
                                <h3 className="text-white font-medium">Linux (Ubuntu, Debian, CentOS...)</h3>
                            </div>
                            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                                <p className="text-emerald-400">curl -L https://mon-rempart.fr/downloads/mon-rempart-agent-linux -o mon-rempart-agent</p>
                                <p className="text-emerald-400">chmod +x mon-rempart-agent && ./mon-rempart-agent</p>
                            </div>

                            <div className="mt-4 text-slate-400 text-sm">
                                💡 <strong className="text-white">Conseil :</strong> Pour exécuter en arrière-plan : <code className="bg-slate-700 px-2 py-1 rounded text-emerald-400">nohup ./mon-rempart-agent &amp;</code>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <HelpCircle className="w-8 h-8 text-emerald-500" />
                        <h2 className="text-xl font-semibold text-white">Questions fréquentes</h2>
                    </div>

                    <div className="space-y-4">
                        <FAQItem
                            question="Que faire si je perds mon mot de passe de chiffrement ?"
                            answer="⚠️ Malheureusement, vos données sont définitivement perdues. C'est le principe de sécurité 'Zero Knowledge' : nous n'avons aucun moyen de déchiffrer vos sauvegardes sans votre clé. Conservez TOUJOURS votre mot de passe dans un lieu sûr (gestionnaire de mots de passe, coffre-fort numérique)."
                            warning={true}
                        />

                        <FAQItem
                            question="Où sont stockées mes données ?"
                            answer="Vos données chiffrées sont stockées chez Scaleway, un hébergeur français, dans leur datacenter de Paris (DC3). Elles ne quittent jamais le territoire français et sont soumises au RGPD."
                        />

                        <FAQItem
                            question="Est-ce que Mon Rempart peut lire mes fichiers ?"
                            answer="Non, absolument pas. Vos fichiers sont chiffrés avec l'algorithme AES-256 directement sur votre machine, avant tout transfert. La clé de chiffrement reste sur votre poste. Même nos équipes techniques ne peuvent pas accéder au contenu de vos sauvegardes."
                        />

                        <FAQItem
                            question="L'agent ralentit-il mon ordinateur ?"
                            answer="Non. L'agent Mon Rempart est très léger (environ 8 Mo) et fonctionne en arrière-plan avec une consommation minimale de ressources. Les sauvegardes sont dédupliquées et incrémentales, ce qui réduit considérablement la bande passante et le temps de traitement."
                        />

                        <FAQItem
                            question="Puis-je restaurer mes fichiers sans l'agent ?"
                            answer="Oui ! Vos sauvegardes utilisent le format Restic, un outil open-source. Vous pouvez toujours restaurer vos données directement avec la commande 'restic restore' si nécessaire."
                        />

                        <FAQItem
                            question="Que se passe-t-il si je résilie mon abonnement ?"
                            answer="Vos données de sauvegarde sont conservées 30 jours après la résiliation, vous laissant le temps de les récupérer. Passé ce délai, elles sont définitivement supprimées de nos serveurs."
                        />
                    </div>
                </section>

                {/* Ressources externes */}
                <section>
                    <h2 className="text-xl font-semibold text-white mb-6">Ressources utiles</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <a
                            href="https://restic.net"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-800/30 border border-slate-700/50 hover:border-emerald-500/50 rounded-xl p-6 transition-all flex items-center justify-between"
                        >
                            <div>
                                <h3 className="text-white font-medium mb-1">Documentation Restic</h3>
                                <p className="text-slate-400 text-sm">Guide officiel de l&apos;outil de sauvegarde</p>
                            </div>
                            <ExternalLink className="w-5 h-5 text-slate-400" />
                        </a>

                        <Link
                            href="/support"
                            className="bg-slate-800/30 border border-slate-700/50 hover:border-emerald-500/50 rounded-xl p-6 transition-all flex items-center justify-between"
                        >
                            <div>
                                <h3 className="text-white font-medium mb-1">Contacter le support</h3>
                                <p className="text-slate-400 text-sm">Besoin d&apos;aide ? Nous sommes là</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="py-8 border-t border-slate-800/50 text-center text-slate-500 text-sm">
                © 2024 Mon Rempart. Hébergé en France 🇫🇷
            </footer>
        </div>
    );
}
