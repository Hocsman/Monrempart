'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Shield, ArrowLeft, RefreshCw, Monitor, Clock, CheckCircle,
    AlertTriangle, XCircle, HardDrive, FileText, Activity,
    Info, AlertCircle, Server, Globe
} from 'lucide-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase client (lazy initialization)
let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
    if (typeof window === 'undefined') return null;

    if (!supabaseInstance) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (url && key) {
            supabaseInstance = createClient(url, key);
        }
    }
    return supabaseInstance;
}

interface Agent {
    id: string;
    hostname: string;
    os: string;
    status: string;
    last_seen: string;
    ip_address: string;
    created_at: string;
}

interface ActivityLog {
    id: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    details: Record<string, unknown>;
    created_at: string;
}

interface BackupLog {
    id: string;
    status: string;
    message: string;
    files_new: number;
    files_changed: number;
    data_added: number;
    duration_seconds: number;
    created_at: string;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
}

function timeAgo(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
}

function formatDate(date: string): string {
    return new Date(date).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'online':
            return <CheckCircle className="w-5 h-5 text-emerald-500" />;
        case 'offline':
            return <XCircle className="w-5 h-5 text-red-500" />;
        default:
            return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case 'online': return 'bg-emerald-500';
        case 'offline': return 'bg-red-500';
        default: return 'bg-amber-500';
    }
}

function getLevelIcon(level: string) {
    switch (level) {
        case 'info':
            return <Info className="w-4 h-4 text-blue-400" />;
        case 'warning':
            return <AlertTriangle className="w-4 h-4 text-amber-400" />;
        case 'error':
            return <AlertCircle className="w-4 h-4 text-red-400" />;
        default:
            return <Info className="w-4 h-4 text-slate-400" />;
    }
}

function getLevelColor(level: string) {
    switch (level) {
        case 'info': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
        case 'warning': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
        case 'error': return 'bg-red-500/10 border-red-500/30 text-red-400';
        default: return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
    }
}

export default function AgentDetailPage() {
    const params = useParams();
    const agentId = params.id as string;

    const [agent, setAgent] = useState<Agent | null>(null);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [backupLogs, setBackupLogs] = useState<BackupLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'activity' | 'backups'>('activity');

    const loadData = async () => {
        const supabase = getSupabase();
        if (!supabase || !agentId) {
            setLoading(false);
            return;
        }

        try {
            // Charger l'agent
            const { data: agentData } = await supabase
                .from('agents')
                .select('*')
                .eq('id', agentId)
                .single();

            if (agentData) {
                setAgent(agentData);
            }

            // Charger les logs d'activité
            const { data: activityData } = await supabase
                .from('agent_logs')
                .select('*')
                .eq('agent_id', agentId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (activityData) {
                setActivityLogs(activityData);
            }

            // Charger les logs de backup
            const { data: backupData } = await supabase
                .from('backup_logs')
                .select('*')
                .eq('agent_id', agentId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (backupData) {
                setBackupLogs(backupData);
            }
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, [agentId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Agent non trouvé</h1>
                    <Link href="/dashboard" className="text-emerald-400 hover:underline">
                        Retour au dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Stats
    const errorCount = activityLogs.filter(l => l.level === 'error').length;
    const successfulBackups = backupLogs.filter(l => l.status === 'success').length;

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <Link href="/" className="flex items-center gap-3">
                            <Shield className="w-8 h-8 text-emerald-500" />
                            <span className="text-xl font-bold text-white">Mon Rempart</span>
                        </Link>
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Actualiser
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Agent Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 mb-8"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center">
                                <Monitor className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-bold text-white">{agent.hostname}</h1>
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                                    {getStatusIcon(agent.status)}
                                </div>
                                <div className="flex items-center gap-6 text-slate-400 text-sm">
                                    <span className="flex items-center gap-2">
                                        <Server className="w-4 h-4" />
                                        {agent.os}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        {agent.ip_address}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Vu {timeAgo(agent.last_seen)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats mini */}
                    <div className="grid grid-cols-4 gap-4 mt-8">
                        <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-white">{activityLogs.length}</p>
                            <p className="text-slate-400 text-sm">Logs activité</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-white">{backupLogs.length}</p>
                            <p className="text-slate-400 text-sm">Sauvegardes</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-emerald-400">{successfulBackups}</p>
                            <p className="text-slate-400 text-sm">Réussies</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-red-400">{errorCount}</p>
                            <p className="text-slate-400 text-sm">Erreurs</p>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'activity'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        <Activity className="w-4 h-4" />
                        Historique d&apos;activité
                    </button>
                    <button
                        onClick={() => setActiveTab('backups')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'backups'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                    >
                        <HardDrive className="w-4 h-4" />
                        Sauvegardes
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'activity' ? (
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-emerald-500" />
                            50 derniers logs d&apos;activité
                        </h2>

                        {activityLogs.length === 0 ? (
                            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center">
                                <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400">Aucun log d&apos;activité pour cet agent</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {activityLogs.map((log, i) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.02 }}
                                        className={`border rounded-lg p-4 ${getLevelColor(log.level)}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {getLevelIcon(log.level)}
                                                <span className="font-medium">{log.message}</span>
                                            </div>
                                            <span className="text-sm opacity-70">{formatDate(log.created_at)}</span>
                                        </div>
                                        {log.details && Object.keys(log.details).length > 0 && (
                                            <div className="mt-2 text-sm opacity-70 font-mono">
                                                {JSON.stringify(log.details)}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </section>
                ) : (
                    <section>
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <HardDrive className="w-5 h-5 text-emerald-500" />
                            Historique des sauvegardes
                        </h2>

                        {backupLogs.length === 0 ? (
                            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center">
                                <HardDrive className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400">Aucune sauvegarde pour cet agent</p>
                            </div>
                        ) : (
                            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-800/50">
                                        <tr>
                                            <th className="text-left text-slate-400 text-sm font-medium px-6 py-3">Date</th>
                                            <th className="text-left text-slate-400 text-sm font-medium px-6 py-3">Statut</th>
                                            <th className="text-left text-slate-400 text-sm font-medium px-6 py-3">Fichiers</th>
                                            <th className="text-left text-slate-400 text-sm font-medium px-6 py-3">Données</th>
                                            <th className="text-left text-slate-400 text-sm font-medium px-6 py-3">Durée</th>
                                            <th className="text-left text-slate-400 text-sm font-medium px-6 py-3">Message</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {backupLogs.map((log) => (
                                            <tr key={log.id}>
                                                <td className="px-6 py-4 text-slate-300">{formatDate(log.created_at)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${log.status === 'success'
                                                            ? 'bg-emerald-500/20 text-emerald-400'
                                                            : log.status === 'failed'
                                                                ? 'bg-red-500/20 text-red-400'
                                                                : 'bg-amber-500/20 text-amber-400'
                                                        }`}>
                                                        {log.status === 'success' ? 'Réussi' : log.status === 'failed' ? 'Échec' : log.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-300">
                                                    +{log.files_new} / ~{log.files_changed}
                                                </td>
                                                <td className="px-6 py-4 text-slate-300">{formatBytes(log.data_added)}</td>
                                                <td className="px-6 py-4 text-slate-300">{formatDuration(log.duration_seconds)}</td>
                                                <td className="px-6 py-4 text-slate-400 text-sm max-w-xs truncate">
                                                    {log.message || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}
