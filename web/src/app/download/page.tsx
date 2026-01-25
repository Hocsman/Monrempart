'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Shield, Download, Terminal, Apple, Monitor, Laptop,
    ChevronRight, Copy, Check, ArrowRight
} from 'lucide-react';

export default function DownloadPage() {
    const [selectedOS, setSelectedOS] = useState<'windows' | 'mac' | 'linux'>('windows');
    const [copied, setCopied] = useState(false);

    const getCommand = () => {
        switch (selectedOS) {
            case 'windows': return 'powershell -c "irm https://monrempart.fr/install.ps1 | iex"';
            case 'mac': return 'curl -sSL https://monrempart.fr/install.sh | bash';
            case 'linux': return 'curl -sSL https://monrempart.fr/install.sh | sudo bash';
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getCommand());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-emerald-500" />
                        <span className="text-xl font-bold text-white">Mon Rempart</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/auth/login" className="text-slate-300 hover:text-white transition-colors hidden sm:block">
                            Connexion
                        </Link>
                        <Link href="/auth/register" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
                            Essai gratuit
                        </Link>
                    </div>
                </div>
            </header>

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold text-white mb-6"
                        >
                            Télécharger l&apos;Agent
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-400 max-w-2xl mx-auto"
                        >
                            Protégez vos serveurs en quelques minutes. Compatible avec Windows, macOS et Linux.
                        </motion.p>
                    </div>

                    {/* Sélecteur OS */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {[
                            { id: 'windows', name: 'Windows', icon: Monitor, desc: 'Windows 10, 11, Server 2016+' },
                            { id: 'mac', name: 'macOS', icon: Apple, desc: 'Monterey, Ventura, Sonoma' },
                            { id: 'linux', name: 'Linux', icon: Laptop, desc: 'Ubuntu, Debian, CentOS...' }
                        ].map((os) => (
                            <button
                                key={os.id}
                                onClick={() => setSelectedOS(os.id as 'windows' | 'mac' | 'linux')}
                                className={`p-6 rounded-2xl border-2 transition-all ${selectedOS === os.id
                                        ? 'bg-emerald-500/10 border-emerald-500'
                                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                    }`}
                            >
                                <os.icon className={`w-12 h-12 mb-4 ${selectedOS === os.id ? 'text-emerald-500' : 'text-slate-400'
                                    }`} />
                                <h3 className={`text-xl font-bold mb-2 ${selectedOS === os.id ? 'text-white' : 'text-slate-300'
                                    }`}>{os.name}</h3>
                                <p className="text-sm text-slate-500">{os.desc}</p>
                            </button>
                        ))}
                    </div>

                    {/* Zone d'installation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 mb-12"
                    >
                        <div className="flex flex-col md:flex-row gap-12">
                            {/* Colonne gauche : Instructions */}
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <Terminal className="w-6 h-6 text-emerald-500" />
                                    Installation rapide
                                </h2>

                                <div className="space-y-8">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold flex-shrink-0">
                                            1
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium mb-2">Copiez la commande</h3>
                                            <p className="text-slate-400 text-sm">
                                                Cette commande téléchargera et installera la dernière version de l&apos;agent.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold flex-shrink-0">
                                            2
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium mb-2">Lancez l&apos;installation</h3>
                                            <p className="text-slate-400 text-sm">
                                                Collez la commande dans votre terminal (PowerShell ou Bash).
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold flex-shrink-0">
                                            3
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium mb-2">Connectez votre agent</h3>
                                            <p className="text-slate-400 text-sm">
                                                L&apos;agent vous demandera votre clé API disponible dans le dashboard.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Colonne droite : Terminal */}
                            <div className="flex-1">
                                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl mb-6">
                                    <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                        <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                                        <span className="ml-2 text-xs text-slate-500 font-mono">Terminal</span>
                                    </div>
                                    <div className="p-6 relative group">
                                        <code className="text-emerald-400 font-mono text-sm break-all block min-h-[3rem]">
                                            {getCommand()}
                                        </code>

                                        <button
                                            onClick={handleCopy}
                                            className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors group-hover:opacity-100"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <h4 className="text-emerald-400 font-medium mb-2 flex items-center gap-2">
                                        <Download className="w-4 h-4" />
                                        Liens directs
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                                                Installateur .exe (64-bit)
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                                                Package .pkg (Universal)
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Footer Links */}
                    <div className="text-center text-slate-500 text-sm">
                        <Link href="/status" className="mx-3 hover:text-white transition-colors">État du service</Link> •
                        <Link href="/docs" className="mx-3 hover:text-white transition-colors">Documentation</Link> •
                        <Link href="/support" className="mx-3 hover:text-white transition-colors">Support</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
