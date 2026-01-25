'use client';

import { motion } from 'framer-motion';

// Skeleton générique
export function Skeleton({ className = '' }: { className?: string }) {
    return (
        <motion.div
            className={`bg-slate-800 rounded ${className}`}
            animate={{
                opacity: [0.5, 1, 0.5],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        />
    );
}

// Skeleton pour une carte d'agent
export function AgentCardSkeleton() {
    return (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-4">
                <Skeleton className="w-3 h-3 rounded-full" />
                <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
            </div>
        </div>
    );
}

// Skeleton pour les stats
export function StatCardSkeleton() {
    return (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-8 w-12" />
        </div>
    );
}

// Skeleton pour un log de backup
export function BackupLogSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-slate-800">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-16" />
        </div>
    );
}

// Skeleton pour le dashboard complet
export function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>

            {/* Charts placeholder */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                </div>
            </div>

            {/* Agents list */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-32 mb-4" />
                {[...Array(3)].map((_, i) => (
                    <AgentCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

// Skeleton pour une page de formulaire
export function FormSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div>
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-24 w-full rounded-lg" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
        </div>
    );
}
