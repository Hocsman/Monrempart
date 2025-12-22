'use client';

import { Shield, Download, Monitor, Apple, Terminal, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DownloadPage() {
    return (
        <div className="min-h-screen bg-bleu-marine">
            {/* Header */}
            <header className="bg-bleu-marine/80 backdrop-blur-md border-b border-white/10">
                <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-vert-emeraude" />
                        <span className="text-xl font-bold text-white">Mon Rempart</span>
                    </Link>
                    <Link
                        href="/dashboard"
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        Retour au Dashboard
                    </Link>
                </nav>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16">
                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-vert-emeraude/10 rounded-2xl mb-6">
                        <Download className="w-10 h-10 text-vert-emeraude" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Télécharger l&apos;Agent
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Installez l&apos;agent Mon Rempart sur vos postes de travail pour protéger vos données automatiquement.
                    </p>
                </div>

                {/* Étapes */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    <div className="bg-bleu-marine-clair rounded-xl border border-white/10 p-6 text-center">
                        <div className="w-10 h-10 bg-vert-emeraude rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                            1
                        </div>
                        <h3 className="text-white font-semibold mb-2">Téléchargez</h3>
                        <p className="text-gray-400 text-sm">Choisissez la version pour votre système</p>
                    </div>
                    <div className="bg-bleu-marine-clair rounded-xl border border-white/10 p-6 text-center">
                        <div className="w-10 h-10 bg-vert-emeraude rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                            2
                        </div>
                        <h3 className="text-white font-semibold mb-2">Exécutez</h3>
                        <p className="text-gray-400 text-sm">Lancez l&apos;agent en double-cliquant dessus</p>
                    </div>
                    <div className="bg-bleu-marine-clair rounded-xl border border-white/10 p-6 text-center">
                        <div className="w-10 h-10 bg-vert-emeraude rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                            3
                        </div>
                        <h3 className="text-white font-semibold mb-2">Protégé !</h3>
                        <p className="text-gray-400 text-sm">Vos sauvegardes démarrent automatiquement</p>
                    </div>
                </div>

                {/* Boutons de téléchargement */}
                <div className="space-y-6">
                    {/* Windows - Principal */}
                    <a
                        href="/downloads/mon-rempart-agent.exe"
                        className="group block bg-gradient-to-r from-vert-emeraude to-vert-emeraude-fonce p-8 rounded-2xl hover:scale-[1.02] transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Monitor className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">
                                        Télécharger pour Windows
                                    </h2>
                                    <p className="text-white/80">
                                        Windows 10/11 • 64 bits • ~8 Mo
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="w-8 h-8 text-white group-hover:translate-x-2 transition-transform" />
                        </div>
                    </a>

                    {/* Mac & Linux - Secondaires */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <a
                            href="/downloads/mon-rempart-agent-mac-arm64"
                            className="group bg-bleu-marine-clair border border-white/10 hover:border-vert-emeraude/50 p-6 rounded-xl transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-bleu-marine rounded-lg flex items-center justify-center">
                                    <Apple className="w-6 h-6 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">Mac (Apple Silicon)</h3>
                                    <p className="text-gray-500 text-sm">M1, M2, M3...</p>
                                </div>
                            </div>
                        </a>

                        <a
                            href="/downloads/mon-rempart-agent-mac-intel"
                            className="group bg-bleu-marine-clair border border-white/10 hover:border-vert-emeraude/50 p-6 rounded-xl transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-bleu-marine rounded-lg flex items-center justify-center">
                                    <Apple className="w-6 h-6 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">Mac (Intel)</h3>
                                    <p className="text-gray-500 text-sm">MacBook avant 2020</p>
                                </div>
                            </div>
                        </a>

                        <a
                            href="/downloads/mon-rempart-agent-linux"
                            className="group bg-bleu-marine-clair border border-white/10 hover:border-vert-emeraude/50 p-6 rounded-xl transition-all md:col-span-2"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-bleu-marine rounded-lg flex items-center justify-center">
                                    <Terminal className="w-6 h-6 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">Linux (x64)</h3>
                                    <p className="text-gray-500 text-sm">Ubuntu, Debian, CentOS...</p>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Prérequis */}
                <div className="mt-16 bg-bleu-marine-clair rounded-2xl border border-white/10 p-8">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-vert-emeraude" />
                        Prérequis
                    </h3>
                    <ul className="space-y-4 text-gray-300">
                        <li className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-vert-emeraude rounded-full mt-2" />
                            <span>
                                <strong className="text-white">Restic</strong> doit être installé sur la machine.{' '}
                                <a href="https://restic.net/" target="_blank" rel="noopener noreferrer" className="text-vert-emeraude hover:underline">
                                    Télécharger Restic →
                                </a>
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-vert-emeraude rounded-full mt-2" />
                            <span>
                                <strong className="text-white">Connexion réseau</strong> pour communiquer avec le Dashboard.
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-vert-emeraude rounded-full mt-2" />
                            <span>
                                <strong className="text-white">Configuration S3</strong> doit être faite dans{' '}
                                <Link href="/settings" className="text-vert-emeraude hover:underline">
                                    les paramètres
                                </Link>.
                            </span>
                        </li>
                    </ul>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 py-8 mt-16">
                <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
                    © 2024 Mon Rempart - Solution de cybersécurité souveraine
                </div>
            </footer>
        </div>
    );
}
