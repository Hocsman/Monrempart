'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
            <div className="text-center max-w-lg">
                {/* Animation 404 */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="relative">
                        <motion.h1
                            className="text-[150px] font-black text-slate-800 leading-none"
                            animate={{
                                textShadow: [
                                    '0 0 0px rgba(16, 185, 129, 0)',
                                    '0 0 20px rgba(16, 185, 129, 0.3)',
                                    '0 0 0px rgba(16, 185, 129, 0)',
                                ],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                            }}
                        >
                            404
                        </motion.h1>
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            animate={{
                                y: [0, -10, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        >
                            <Shield className="w-16 h-16 text-emerald-500" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Message */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Page introuvable
                    </h2>
                    <p className="text-slate-400 mb-8">
                        Oups ! La page que vous recherchez semble avoir été déplacée ou n&apos;existe pas.
                        Pas de panique, vos sauvegardes sont en sécurité.
                    </p>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all hover:scale-105"
                    >
                        <Home className="w-5 h-5" />
                        Retour à l&apos;accueil
                    </Link>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Mon dashboard
                    </Link>
                </motion.div>

                {/* Illustration décorative */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 pt-8 border-t border-slate-800"
                >
                    <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                        <Search className="w-4 h-4" />
                        <span>Besoin d&apos;aide ?</span>
                        <Link href="/support" className="text-emerald-400 hover:text-emerald-300">
                            Contactez le support
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
