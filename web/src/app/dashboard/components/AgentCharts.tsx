'use client';

import { useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Heart, Shield, AlertTriangle } from 'lucide-react';

interface BackupLog {
    id: string;
    status: string;
    data_added: number;
    created_at: string;
}

interface ActivityLog {
    level: 'info' | 'warning' | 'error';
    created_at: string;
}

interface AgentChartsProps {
    backupLogs: BackupLog[];
    activityLogs: ActivityLog[];
    agentCreatedAt: string;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Timeline des sauvegardes sur 14 jours
function BackupTimelineChart({ backupLogs }: { backupLogs: BackupLog[] }) {
    const data = useMemo(() => {
        const last14Days: { date: string; volume: number; count: number; success: number }[] = [];
        const now = new Date();

        for (let i = 13; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayLogs = backupLogs.filter(log => {
                const logDate = new Date(log.created_at).toISOString().split('T')[0];
                return logDate === dateStr;
            });

            const totalVolume = dayLogs.reduce((sum, log) => sum + (log.data_added || 0), 0);
            const successCount = dayLogs.filter(l => l.status === 'success').length;

            last14Days.push({
                date: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
                volume: totalVolume,
                count: dayLogs.length,
                success: successCount
            });
        }

        return last14Days;
    }, [backupLogs]);

    const totalVolume = backupLogs.reduce((sum, log) => sum + (log.data_added || 0), 0);

    return (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Volume sauvegardé (14 jours)
                </h3>
                <span className="text-slate-400 text-sm">{formatBytes(totalVolume)} au total</span>
            </div>
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            tickFormatter={(value) => formatBytes(value)}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            formatter={(value: number | undefined) => [formatBytes(value ?? 0), 'Volume']}
                        />
                        <Area
                            type="monotone"
                            dataKey="volume"
                            stroke="#10B981"
                            strokeWidth={2}
                            fill="url(#colorVolume)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// Score de santé de l'agent
function HealthScore({ backupLogs, activityLogs, agentCreatedAt }: {
    backupLogs: BackupLog[];
    activityLogs: ActivityLog[];
    agentCreatedAt: string;
}) {
    const score = useMemo(() => {
        let points = 100;

        // Pénalité pour les erreurs récentes (7 derniers jours)
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 7);

        const recentErrors = activityLogs.filter(log =>
            log.level === 'error' && new Date(log.created_at) > recentDate
        ).length;

        const recentWarnings = activityLogs.filter(log =>
            log.level === 'warning' && new Date(log.created_at) > recentDate
        ).length;

        points -= recentErrors * 10;  // -10 par erreur
        points -= recentWarnings * 3;  // -3 par warning

        // Bonus pour les sauvegardes réussies
        const recentBackups = backupLogs.filter(log =>
            new Date(log.created_at) > recentDate
        );
        const successRate = recentBackups.length > 0
            ? recentBackups.filter(l => l.status === 'success').length / recentBackups.length
            : 0;

        if (successRate < 0.8) points -= 20;
        if (successRate < 0.5) points -= 20;

        // Bonus pour l'ancienneté (agent stable)
        const daysSinceCreation = Math.floor(
            (Date.now() - new Date(agentCreatedAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceCreation > 30) points += 5;
        if (daysSinceCreation > 90) points += 5;

        return Math.max(0, Math.min(100, points));
    }, [backupLogs, activityLogs, agentCreatedAt]);

    const getScoreColor = (s: number) => {
        if (s >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-400', label: 'Excellent' };
        if (s >= 60) return { bg: 'bg-amber-500', text: 'text-amber-400', label: 'Correct' };
        return { bg: 'bg-red-500', text: 'text-red-400', label: 'Attention requise' };
    };

    const colors = getScoreColor(score);

    return (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-emerald-500" />
                Score de santé
            </h3>
            <div className="flex items-center gap-6">
                {/* Jauge circulaire */}
                <div className="relative w-24 h-24">
                    <svg className="transform -rotate-90 w-24 h-24" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#334155"
                            strokeWidth="10"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${score * 2.51} 251`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-2xl font-bold ${colors.text}`}>{score}</span>
                    </div>
                </div>

                {/* Détails */}
                <div className="flex-1">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors.bg}/20 ${colors.text} text-sm font-medium mb-2`}>
                        {score >= 80 ? (
                            <Shield className="w-4 h-4" />
                        ) : (
                            <AlertTriangle className="w-4 h-4" />
                        )}
                        {colors.label}
                    </div>
                    <p className="text-slate-400 text-sm">
                        Basé sur les erreurs récentes, le taux de succès des sauvegardes, et la stabilité de l&apos;agent.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function AgentCharts({ backupLogs, activityLogs, agentCreatedAt }: AgentChartsProps) {
    return (
        <div className="grid md:grid-cols-2 gap-6 mb-8">
            <BackupTimelineChart backupLogs={backupLogs} />
            <HealthScore
                backupLogs={backupLogs}
                activityLogs={activityLogs}
                agentCreatedAt={agentCreatedAt}
            />
        </div>
    );
}
