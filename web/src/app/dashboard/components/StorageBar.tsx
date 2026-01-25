'use client';

import { motion } from 'framer-motion';
import { HardDrive, AlertTriangle } from 'lucide-react';

interface StorageBarProps {
    usedBytes: number;
    totalBytes: number;
    plan: 'free' | 'independant' | 'serenite';
}

const PLAN_STORAGE: Record<string, number> = {
    free: 10 * 1024 * 1024 * 1024, // 10 GB
    independant: 100 * 1024 * 1024 * 1024, // 100 GB
    serenite: 1024 * 1024 * 1024 * 1024, // 1 TB
};

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function StorageBar({ usedBytes, totalBytes, plan }: StorageBarProps) {
    const maxStorage = totalBytes || PLAN_STORAGE[plan] || PLAN_STORAGE.free;
    const percentage = Math.min((usedBytes / maxStorage) * 100, 100);
    const isWarning = percentage >= 80;
    const isCritical = percentage >= 95;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <HardDrive className={`w-5 h-5 ${isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'}`} />
                    <span className="text-white font-medium">Stockage utilisé</span>
                </div>
                <span className="text-slate-400 text-sm">
                    {formatBytes(usedBytes)} / {formatBytes(maxStorage)}
                </span>
            </div>

            {/* Barre de progression */}
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${isCritical
                            ? 'bg-gradient-to-r from-red-600 to-red-500'
                            : isWarning
                                ? 'bg-gradient-to-r from-amber-600 to-amber-500'
                                : 'bg-gradient-to-r from-emerald-600 to-emerald-500'
                        }`}
                />
            </div>

            {/* Message d'alerte */}
            {isWarning && (
                <div className={`mt-3 flex items-center gap-2 text-sm ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                    <AlertTriangle className="w-4 h-4" />
                    {isCritical
                        ? 'Stockage presque plein ! Libérez de l\'espace ou passez au plan supérieur.'
                        : 'Votre stockage atteint bientôt sa limite.'
                    }
                </div>
            )}

            {/* Pourcentage */}
            <div className="mt-2 text-right">
                <span className={`text-lg font-bold ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                    {percentage.toFixed(1)}%
                </span>
            </div>
        </motion.div>
    );
}
