'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, ArrowRight, Zap, Building2, Users, HelpCircle } from 'lucide-react';

const plans = [
    {
        name: 'Indépendant',
        price: '19',
        description: 'Pour les TPE et indépendants',
        icon: Users,
        color: 'blue',
        features: [
            '3 postes maximum',
            '100 Go de stockage',
            'Sauvegarde quotidienne',
            'Restauration illimitée',
            'Chiffrement AES-256',
            'Support par email',
        ],
        cta: 'Démarrer l\'essai',
        popular: false,
    },
    {
        name: 'Sérénité',
        price: '79',
        description: 'Pour les mairies et PME',
        icon: Building2,
        color: 'emerald',
        features: [
            'Postes illimités',
            '1 To de stockage',
            'Sauvegarde en temps réel',
            'Restauration prioritaire',
            'Chiffrement AES-256',
            'Support téléphonique dédié',
            'Rapports de conformité',
            'Formation incluse',
        ],
        cta: 'Nous contacter',
        popular: true,
    },
];

const faqs = [
    {
        question: 'Puis-je essayer gratuitement ?',
        answer: 'Oui ! Vous bénéficiez de 14 jours d\'essai gratuit sans carte bancaire. Toutes les fonctionnalités sont accessibles.'
    },
    {
        question: 'Mes données sont-elles vraiment en France ?',
        answer: 'Absolument. Nous utilisons Scaleway, un hébergeur français avec des datacenters à Paris, soumis au RGPD.'
    },
    {
        question: 'Que se passe-t-il si je dépasse mon quota ?',
        answer: 'Vous recevrez une notification. Vos sauvegardes continuent, et vous pouvez upgrader votre forfait à tout moment.'
    },
    {
        question: 'Comment fonctionne le support ?',
        answer: 'Email pour le plan Indépendant (réponse sous 24h), téléphone dédié pour le plan Sérénité (réponse sous 2h).'
    },
];

export default function PricingPage() {
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
                        <Link href="/security" className="text-slate-400 hover:text-white transition-colors">Sécurité</Link>
                        <Link href="/pricing" className="text-emerald-400 font-medium">Tarifs</Link>
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
                            Tarifs simples et transparents
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            14 jours d&apos;essai gratuit. Aucune carte bancaire requise.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Plans */}
            <section className="py-12">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative bg-slate-800/30 rounded-2xl border ${plan.popular ? 'border-emerald-500' : 'border-slate-700/50'
                                    } p-8`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="bg-emerald-500 text-white text-sm font-medium px-4 py-1 rounded-full flex items-center gap-1">
                                            <Zap className="w-4 h-4" />
                                            Recommandé
                                        </span>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <div className={`w-14 h-14 bg-${plan.color}-500/10 rounded-xl flex items-center justify-center mb-4`}>
                                        <plan.icon className={`w-7 h-7 text-${plan.color}-500`} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-1">{plan.name}</h2>
                                    <p className="text-slate-400">{plan.description}</p>
                                </div>

                                <div className="mb-8">
                                    <span className="text-5xl font-bold text-white">{plan.price}€</span>
                                    <span className="text-slate-400">/mois</span>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className="flex items-center gap-3 text-slate-300">
                                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={plan.popular ? '/contact' : '/auth/register'}
                                    className={`w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all hover:scale-[1.02] ${plan.popular
                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                                        }`}
                                >
                                    {plan.cta}
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Garantie */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-8 text-center"
                    >
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Garantie Satisfait ou Remboursé</h3>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            30 jours pour tester. Si Mon Rempart ne vous convient pas, nous vous remboursons intégralement, sans question.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-slate-900/30">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                            <HelpCircle className="w-8 h-8 text-emerald-500" />
                            Questions fréquentes
                        </h2>
                    </motion.div>

                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6"
                            >
                                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                                <p className="text-slate-400">{faq.answer}</p>
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
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">Prêt à sécuriser votre structure ?</h2>
                        <p className="text-slate-400 mb-8">Commencez votre essai gratuit dès maintenant.</p>
                        <Link
                            href="/auth/register"
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
                        >
                            Démarrer l&apos;essai gratuit
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-slate-800/50 text-center text-slate-500 text-sm">
                © 2024 Mon Rempart. Hébergé en France 🇫🇷
            </footer>
        </div>
    );
}
