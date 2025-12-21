'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Shield, Lock, Zap, Server, RefreshCw, Clock,
    Database, Cloud, CheckCircle, ArrowRight, Eye, FileCheck
} from 'lucide-react';

const features = [
    {
        icon: Lock,
        title: 'Sauvegarde Immuable',
        description: 'Vos données sont versionnées et protégées contre toute modification. Basée sur Restic, une technologie open-source éprouvée.',
        benefits: [
            'Déduplication intelligente',
            'Historique des versions illimité',
            'Restauration granulaire'
        ],
        color: 'emerald'
    },
    {
        icon: Zap,
        title: 'Protection Anti-Ransomware',
        description: 'En cas d\'attaque, restaurez vos fichiers en quelques clics depuis une version saine antérieure.',
        benefits: [
            'Détection des fichiers chiffrés',
            'Restauration en un clic',
            'Isolation des sauvegardes'
        ],
        color: 'amber'
    },
    {
        icon: Clock,
        title: 'Simplicité Absolue',
        description: 'Installation en 5 minutes. L\'agent fonctionne en arrière-plan, invisible et silencieux.',
        benefits: [
            'Interface intuitive',
            'Configuration automatique',
            'Aucune compétence technique requise'
        ],
        color: 'blue'
    }
];

const additionalFeatures = [
    { icon: RefreshCw, title: 'Sauvegarde automatique', description: 'Programmez vos sauvegardes quotidiennes, hebdomadaires...' },
    { icon: Eye, title: 'Monitoring temps réel', description: 'Suivez l\'état de vos agents depuis le Dashboard' },
    { icon: Database, title: 'Stockage évolutif', description: 'Votre espace s\'adapte à vos besoins' },
    { icon: FileCheck, title: 'Vérification d\'intégrité', description: 'Contrôle automatique de vos sauvegardes' },
    { icon: Cloud, title: 'Multi-postes', description: 'Gérez tous vos postes depuis une seule interface' },
    { icon: Server, title: 'API complète', description: 'Intégrez Mon Rempart à vos outils existants' },
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            {/* Navigation */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
                <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-emerald-500" />
                        <span className="text-xl font-bold text-white">Mon Rempart</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/features" className="text-emerald-400 font-medium">Fonctionnalités</Link>
                        <Link href="/security" className="text-slate-400 hover:text-white transition-colors">Sécurité</Link>
                        <Link href="/pricing" className="text-slate-400 hover:text-white transition-colors">Tarifs</Link>
                    </div>
                    <Link href="/auth/register" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-full font-medium transition-all hover:scale-105">
                        Essai gratuit
                    </Link>
                </nav>
            </header>

            {/* Hero */}
            <section className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            Fonctionnalités
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Découvrez comment Mon Rempart protège vos données avec une technologie de pointe rendue accessible à tous.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Fonctionnalités principales */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid gap-12">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`grid md:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                            >
                                <div className={`order-2 ${i % 2 === 1 ? 'md:order-1' : 'md:order-2'}`}>
                                    <div className={`w-full aspect-video bg-gradient-to-br from-${feature.color}-500/10 to-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center`}>
                                        <feature.icon className={`w-24 h-24 text-${feature.color}-500`} />
                                    </div>
                                </div>

                                <div className={`order-1 ${i % 2 === 1 ? 'md:order-2' : 'md:order-1'}`}>
                                    <div className={`inline-flex items-center gap-2 bg-${feature.color}-500/10 px-4 py-2 rounded-full mb-4`}>
                                        <feature.icon className={`w-5 h-5 text-${feature.color}-500`} />
                                        <span className={`text-${feature.color}-400 text-sm font-medium`}>Fonctionnalité clé</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-4">{feature.title}</h2>
                                    <p className="text-slate-400 text-lg mb-6">{feature.description}</p>
                                    <ul className="space-y-3">
                                        {feature.benefits.map((benefit, j) => (
                                            <li key={j} className="flex items-center gap-3 text-slate-300">
                                                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                                {benefit}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Autres fonctionnalités */}
            <section className="py-20 bg-slate-900/30">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Et bien plus encore...</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {additionalFeatures.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 hover:border-emerald-500/30 transition-all"
                            >
                                <feature.icon className="w-8 h-8 text-emerald-500 mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-slate-400 text-sm">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-12"
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">Prêt à protéger vos données ?</h2>
                        <p className="text-emerald-100 mb-8">Essai gratuit 14 jours, sans carte bancaire.</p>
                        <Link
                            href="/auth/register"
                            className="inline-flex items-center gap-2 bg-white text-emerald-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
                        >
                            Commencer maintenant
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer simple */}
            <footer className="py-8 border-t border-slate-800/50 text-center text-slate-500 text-sm">
                © 2024 Mon Rempart. Hébergé en France 🇫🇷
            </footer>
        </div>
    );
}
