'use client';

import { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react';

interface BackupLog {
    id: string;
    status: string;
    data_added: number;
    created_at: string;
}

interface Agent {
    id: string;
    status: string;
}

interface StatsChartsProps {
    backupLogs: BackupLog[];
    agents: Agent[];
}

const COLORS = {
    success: '#10B981',
    failed: '#EF4444',
    pending: '#F59E0B',
    online: '#10B981',
    offline: '#EF4444',
};

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Graphique: Volume de sauvegardes sur 7 jours
function BackupVolumeChart({ backupLogs }: { backupLogs: BackupLog[] }) {
    const data = useMemo(() => {
        const last7Days: { date: string; volume: number; count: number }[] = [];
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayLogs = backupLogs.filter(log => {
                const logDate = new Date(log.created_at).toISOString().split('T')[0];
                return logDate === dateStr;
            });

            const totalVolume = dayLogs.reduce((sum, log) => sum + (log.data_added || 0), 0);

            last7Days.push({
                date: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
                volume: totalVolume,
                count: dayLogs.length
            });
        }

        return last7Days;
    }, [backupLogs]);

    return (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                Volume sauvegardé (7 jours)
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={12}
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
                        <Line
                            type="monotone"
                            dataKey="volume"
                            stroke="#10B981"
                            strokeWidth={3}
                            dot={{ fill: '#10B981', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#10B981' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// Graphique: Taux de succès des sauvegardes
function BackupSuccessChart({ backupLogs }: { backupLogs: BackupLog[] }) {
    const data = useMemo(() => {
        const success = backupLogs.filter(l => l.status === 'success').length;
        const failed = backupLogs.filter(l => l.status === 'failed').length;
        const pending = backupLogs.filter(l => l.status === 'pending' || l.status === 'running').length;

        return [
            { name: 'Réussies', value: success, color: COLORS.success },
            { name: 'Échouées', value: failed, color: COLORS.failed },
            { name: 'En cours', value: pending, color: COLORS.pending },
        ].filter(item => item.value > 0);
    }, [backupLogs]);

    const total = backupLogs.length;
    const successRate = total > 0
        ? Math.round((backupLogs.filter(l => l.status === 'success').length / total) * 100)
        : 0;

    return (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-emerald-500" />
                Taux de succès
            </h3>
            <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Pourcentage au centre */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginBottom: '36px' }}>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-emerald-400">{successRate}%</p>
                        <p className="text-slate-400 text-xs">succès</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Graphique: État des agents
function AgentStatusChart({ agents }: { agents: Agent[] }) {
    const online = agents.filter(a => a.status === 'online').length;
    const offline = agents.filter(a => a.status !== 'online').length;
    const total = agents.length;
    const onlinePercent = total > 0 ? Math.round((online / total) * 100) : 0;

    return (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                État des agents
            </h3>
            <div className="flex flex-col items-center justify-center h-64">
                {/* Jauge circulaire */}
                <div className="relative w-40 h-40">
                    <svg className="transform -rotate-90 w-40 h-40" viewBox="0 0 100 100">
                        {/* Cercle de fond */}
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#334155"
                            strokeWidth="12"
                        />
                        {/* Cercle de progression */}
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#10B981"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={`${onlinePercent * 2.51} 251`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-white">{online}/{total}</p>
                            <p className="text-slate-400 text-xs">en ligne</p>
                        </div>
                    </div>
                </div>

                {/* Légende */}
                <div className="mt-6 flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-slate-300 text-sm">En ligne ({online})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-slate-300 text-sm">Hors ligne ({offline})</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Composant principal exporté
export default function StatsCharts({ backupLogs, agents }: StatsChartsProps) {
    return (
        <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">📊 Statistiques</h2>
            <div className="grid md:grid-cols-3 gap-6">
                <BackupVolumeChart backupLogs={backupLogs} />
                <BackupSuccessChart backupLogs={backupLogs} />
                <AgentStatusChart agents={agents} />
            </div>
        </section>
    );
}
