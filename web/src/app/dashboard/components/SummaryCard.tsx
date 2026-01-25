'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertTriangle, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface BackupLog {
    id: string;
    status: string;
    created_at: string;
    agents?: { hostname: string };
}

interface SummaryCardProps {
    lastBackup: BackupLog | null;
    nextBackupTime: string;
    totalBackups: number;
    successRate: number;
}

function timeAgo(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
}

export default function SummaryCard({ lastBackup, nextBackupTime, totalBackups, successRate }: SummaryCardProps) {
    const isSuccess = lastBackup?.status === 'success';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6"
        >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                Résumé des sauvegardes
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
                {/* Dernière sauvegarde */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        {isSuccess ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : lastBackup ? (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                        ) : (
                            <Clock className="w-4 h-4 text-slate-500" />
                        )}
                        <span className="text-slate-400 text-sm">Dernière sauvegarde</span>
                    </div>
                    {lastBackup ? (
                        <>
                            <p className={`text-lg font-semibold ${isSuccess ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isSuccess ? 'Réussie' : 'Échouée'}
                            </p>
                            <p className="text-slate-500 text-sm">
                                {timeAgo(lastBackup.created_at)}
                                {lastBackup.agents?.hostname && ` • ${lastBackup.agents.hostname}`}
                            </p>
                        </>
                    ) : (
                        <p className="text-slate-500">Aucune sauvegarde</p>
                    )}
                </div>

                {/* Prochaine sauvegarde */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-slate-400 text-sm">Prochaine sauvegarde</span>
                    </div>
                    <p className="text-lg font-semibold text-blue-400">{nextBackupTime}</p>
                    <p className="text-slate-500 text-sm">Automatique</p>
                </div>

                {/* Total backups */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span className="text-slate-400 text-sm">Total sauvegardes</span>
                    </div>
                    <p className="text-lg font-semibold text-white">{totalBackups}</p>
                    <p className="text-slate-500 text-sm">Ce mois-ci</p>
                </div>

                {/* Taux de réussite */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-slate-400 text-sm">Taux de réussite</span>
                    </div>
                    <p className={`text-lg font-semibold ${successRate >= 90 ? 'text-emerald-400' : successRate >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                        {successRate.toFixed(1)}%
                    </p>
                    <p className="text-slate-500 text-sm">Sur les 30 derniers jours</p>
                </div>
            </div>

            {/* Lien vers historique */}
            <Link
                href="/dashboard/restore"
                className="mt-4 flex items-center justify-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-sm"
            >
                Voir l&apos;historique complet
                <ArrowRight className="w-4 h-4" />
            </Link>
        </motion.div>
    );
}
