'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Shield, Lock, Server, Globe, CheckCircle, ArrowRight,
    Key, Database, ShieldCheck, Fingerprint
} from 'lucide-react';

export default function SecurityPage() {
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
                        <Link href="/features" className="text-slate-400 hover:text-white transition-colors">Fonctionnalités</Link>
                        <Link href="/security" className="text-emerald-400 font-medium">Sécurité</Link>
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
                        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
                            <Lock className="w-4 h-4 text-emerald-500" />
                            <span className="text-emerald-400 text-sm font-medium">Architecture Zero-Trust</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                            Sécurité & Souveraineté
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Vos données ne passent jamais par nos serveurs. Elles sont chiffrées sur votre machine et envoyées directement vers le stockage sécurisé.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Architecture */}
            <section className="py-20 bg-slate-900/30">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Architecture Direct-to-Cloud
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Contrairement aux solutions traditionnelles, vos données chiffrées vont directement dans le cloud souverain, sans transiter par notre infrastructure.
                        </p>
                    </motion.div>

                    {/* Diagramme simplifié */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-8 mb-16"
                    >
                        <div className="grid md:grid-cols-3 gap-8 items-center">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Fingerprint className="w-10 h-10 text-blue-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">1. Chiffrement Local</h3>
                                <p className="text-slate-400 text-sm">AES-256 sur votre machine avant tout transfert</p>
                            </div>

                            <div className="hidden md:flex items-center justify-center">
                                <div className="w-full h-1 bg-gradient-to-r from-blue-500/20 via-emerald-500 to-purple-500/20 rounded" />
                            </div>

                            <div className="text-center">
                                <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Database className="w-10 h-10 text-purple-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">2. Stockage Souverain</h3>
                                <p className="text-slate-400 text-sm">Scaleway Paris - Données en France</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Points de sécurité */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                icon: Key,
                                title: 'Chiffrement AES-256',
                                description: 'Standard militaire. Vos données sont chiffrées avant de quitter votre machine. Même Mon Rempart ne peut pas y accéder.',
                                tag: 'Zero Knowledge'
                            },
                            {
                                icon: Lock,
                                title: 'Transfert TLS 1.3',
                                description: 'Communication sécurisée entre votre machine et le stockage cloud. Impossible d\'intercepter vos données en transit.',
                                tag: 'Chiffrement de bout en bout'
                            },
                            {
                                icon: Server,
                                title: 'Object Lock Scaleway',
                                description: 'Vos sauvegardes sont immuables. Même un ransomware avec accès administrateur ne peut pas les supprimer.',
                                tag: 'Protection Ransomware'
                            },
                            {
                                icon: Globe,
                                title: 'Hébergement France',
                                description: 'Données stockées à Paris chez Scaleway, un hébergeur français soumis au RGPD et à la législation européenne.',
                                tag: 'Souveraineté'
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-slate-800/30 p-8 rounded-2xl border border-slate-700/50"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <item.icon className="w-7 h-7 text-emerald-500" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                                            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full">
                                                {item.tag}
                                            </span>
                                        </div>
                                        <p className="text-slate-400">{item.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Certifications */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">Conformité & Certifications</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { icon: ShieldCheck, label: 'Conforme RGPD' },
                            { icon: Globe, label: 'Hébergement FR' },
                            { icon: Lock, label: 'Chiffrement AES' },
                            { icon: CheckCircle, label: 'ANSSI Ready' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 text-center"
                            >
                                <item.icon className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                                <span className="text-slate-300 font-medium">{item.label}</span>
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
                        <h2 className="text-3xl font-bold text-white mb-4">Questions sur la sécurité ?</h2>
                        <p className="text-emerald-100 mb-8">Notre équipe est à votre disposition pour vous accompagner.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/auth/register"
                                className="inline-flex items-center gap-2 bg-white text-emerald-700 px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
                            >
                                Essayer gratuitement
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="mailto:contact@mon-rempart.fr"
                                className="inline-flex items-center gap-2 bg-emerald-800 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:bg-emerald-900"
                            >
                                Nous contacter
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-slate-800/50 text-center text-slate-500 text-sm">
                © 2026 Mon Rempart. Hébergé en France 🇫🇷
            </footer>
        </div>
    );
}
