'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, CheckCircle, AlertTriangle, XCircle, Clock, Activity, Server, Database, Globe } from 'lucide-react';

const services = [
    { name: 'API Principale', status: 'operational', icon: Activity },
    { name: 'Base de données', status: 'operational', icon: Database },
    { name: 'Stockage S3', status: 'operational', icon: Server },
    { name: 'Site Web', status: 'operational', icon: Globe },
    { name: 'Système de notifications', status: 'operational', icon: Clock },
];

const incidents = [
    {
        id: 1,
        title: 'Maintenance planifiée',
        status: 'resolved',
        date: '20 Janvier 2024',
        description: 'Mise à jour des systèmes de sécurité. Aucune interruption de service constatée.'
    }
];

export default function StatusPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-emerald-500" />
                        <span className="font-bold text-white">Mon Rempart Status</span>
                    </Link>
                    <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                        Retour au site
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Global Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-500 text-white rounded-2xl p-8 mb-12 flex items-center justify-between shadow-lg shadow-emerald-500/20"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Tous les systèmes sont opérationnels</h1>
                            <p className="text-emerald-100">Dernière mise à jour : À l&apos;instant</p>
                        </div>
                    </div>
                </motion.div>

                {/* Services Grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-16">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between group hover:border-slate-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <service.icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                                <span className="text-slate-200 font-medium">{service.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                                <CheckCircle className="w-4 h-4" />
                                Opérationnel
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Historique */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6">Historique des incidents</h2>
                    <div className="space-y-6">
                        {incidents.map((incident) => (
                            <motion.div
                                key={incident.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-l-2 border-slate-800 pl-6 pb-6 relative"
                            >
                                <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-white font-medium">{incident.title}</h3>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                        Résolu
                                    </span>
                                </div>
                                <p className="text-slate-400 text-sm mb-2">{incident.description}</p>
                                <p className="text-slate-600 text-xs">{incident.date}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
