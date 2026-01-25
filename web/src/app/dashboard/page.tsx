'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Shield, Download, BookOpen, RefreshCw, Settings, LogOut,
    Monitor, Clock, CheckCircle, AlertTriangle, XCircle,
    HardDrive, FileText, Activity, ChevronRight, Plus, Pencil, X, Trash2, RotateCcw, CreditCard, User
} from 'lucide-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import StatsCharts from './components/StatsCharts';
import { NotificationProvider } from './components/NotificationContext';
import NotificationBell from './components/NotificationBell';
import NotificationToast from './components/NotificationToast';
import RealtimeNotifications from './components/RealtimeNotifications';
import StorageBar from './components/StorageBar';
import SummaryCard from './components/SummaryCard';
import ExportButtons from './components/ExportButtons';
import BackupCalendar from './components/BackupCalendar';

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
}

interface BackupLog {
    id: string;
    agent_id: string;
    status: string;
    files_new: number;
    files_changed: number;
    data_added: number;
    duration_seconds: number;
    created_at: string;
    agents?: { hostname: string };
}

interface EditFormData {
    hostname: string;
    os: string;
    ip_address: string;
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

function getStatusIcon(status: string) {
    switch (status) {
        case 'online':
            return <CheckCircle className="w-4 h-4 text-emerald-500" />;
        case 'offline':
            return <XCircle className="w-4 h-4 text-red-500" />;
        default:
            return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case 'online': return 'bg-emerald-500';
        case 'offline': return 'bg-red-500';
        default: return 'bg-amber-500';
    }
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

// Composant Empty State
function EmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
        >
            {/* Icône animée */}
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="relative mb-8"
            >
                <div className="w-32 h-32 bg-emerald-500/10 rounded-3xl flex items-center justify-center">
                    <Shield className="w-16 h-16 text-emerald-500" />
                </div>
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"
                >
                    <Plus className="w-5 h-5 text-white" />
                </motion.div>
            </motion.div>

            {/* Titre et texte */}
            <h2 className="text-3xl font-bold text-white mb-4">
                Bienvenue dans votre forteresse
            </h2>
            <p className="text-slate-400 text-lg max-w-md mb-8">
                Aucun ordinateur n&apos;est encore protégé. Installez votre premier agent pour commencer à sécuriser vos données.
            </p>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    href="/download"
                    className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
                >
                    <Download className="w-6 h-6" />
                    Télécharger l&apos;Agent
                </Link>
                <Link
                    href="/docs"
                    className="inline-flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-slate-700"
                >
                    <BookOpen className="w-5 h-5" />
                    Lire le guide
                </Link>
            </div>

            {/* Indicateurs de confiance */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Installation en 2 minutes
                </span>
                <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    Chiffrement AES-256
                </span>
                <span className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-emerald-500" />
                    Windows, Mac, Linux
                </span>
            </div>
        </motion.div>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [logs, setLogs] = useState<BackupLog[]>([]);
    const [allLogs, setAllLogs] = useState<BackupLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // État modale édition
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [editForm, setEditForm] = useState<EditFormData>({ hostname: '', os: '', ip_address: '' });
    const [saving, setSaving] = useState(false);

    // Toast notification
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleLogout = async () => {
        const supabase = getSupabase();
        if (supabase) {
            await supabase.auth.signOut();
        }
        router.push('/');
    };

    const handleEditClick = (agent: Agent, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingAgent(agent);
        setEditForm({
            hostname: agent.hostname,
            os: agent.os || '',
            ip_address: agent.ip_address || ''
        });
        setEditModalOpen(true);
    };

    const handleSaveAgent = async () => {
        if (!editingAgent) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/agents/${editingAgent.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            const data = await res.json();

            if (data.success) {
                showToast('Agent modifié avec succès', 'success');
                setEditModalOpen(false);
                loadData(); // Refresh list
            } else {
                showToast(data.message || 'Erreur lors de la modification', 'error');
            }
        } catch {
            showToast('Erreur de connexion', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAgent = async () => {
        if (!editingAgent) return;

        if (!confirm(`Supprimer l'agent "${editingAgent.hostname}" ?`)) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/agents/${editingAgent.id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (data.success) {
                showToast('Agent supprimé', 'success');
                setEditModalOpen(false);
                loadData();
            } else {
                showToast(data.message || 'Erreur lors de la suppression', 'error');
            }
        } catch {
            showToast('Erreur de connexion', 'error');
        } finally {
            setSaving(false);
        }
    };

    const loadData = async () => {
        const supabase = getSupabase();
        if (!supabase) {
            setLoading(false);
            return;
        }

        try {
            // Charger les agents
            const { data: agentsData } = await supabase
                .from('agents')
                .select('*')
                .order('last_seen', { ascending: false });

            if (agentsData) {
                setAgents(agentsData);
            }

            // Charger les logs pour le tableau (5 derniers)
            const { data: logsData } = await supabase
                .from('backup_logs')
                .select('*, agents(hostname)')
                .order('created_at', { ascending: false })
                .limit(5);

            if (logsData) {
                setLogs(logsData);
            }

            // Charger tous les logs pour les graphiques (50 derniers)
            const { data: allLogsData } = await supabase
                .from('backup_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (allLogsData) {
                setAllLogs(allLogsData);
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
        const interval = setInterval(loadData, 30000); // Refresh toutes les 30s
        return () => clearInterval(interval);
    }, []);

    // Statistiques
    const onlineAgents = agents.filter(a => a.status === 'online').length;
    const successfulBackups = logs.filter(l => l.status === 'success').length;

    return (
        <NotificationProvider>
            <div className="min-h-screen bg-slate-950">
                {/* Header */}
                <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3">
                            <Shield className="w-8 h-8 text-emerald-500" />
                            <span className="text-xl font-bold text-white">Mon Rempart</span>
                        </Link>

                        <nav className="flex items-center gap-4">
                            <Link href="/dashboard/restore" className="text-slate-400 hover:text-white transition-colors p-2" title="Restauration">
                                <RotateCcw className="w-5 h-5" />
                            </Link>
                            <NotificationBell />
                            <Link href="/dashboard/billing" className="text-slate-400 hover:text-white transition-colors p-2" title="Facturation">
                                <CreditCard className="w-5 h-5" />
                            </Link>
                            <Link href="/profile" className="text-slate-400 hover:text-white transition-colors p-2" title="Mon profil">
                                <User className="w-5 h-5" />
                            </Link>
                            <Link href="/settings" className="text-slate-400 hover:text-white transition-colors p-2" title="Configuration">
                                <Settings className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-slate-400 hover:text-red-400 transition-colors p-2"
                                title="Déconnexion"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </nav>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-6 py-8">
                    {loading ? (
                        <div className="flex items-center justify-center min-h-[60vh]">
                            <div className="text-center">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4"
                                >
                                    <Shield className="w-8 h-8 text-emerald-500" />
                                </motion.div>
                                <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mb-3">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                </div>
                                <p className="text-slate-400 text-sm">Chargement du dashboard...</p>
                            </div>
                        </div>
                    ) : agents.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Monitor className="w-5 h-5 text-emerald-500" />
                                        <span className="text-slate-400 text-sm">Agents</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{agents.length}</p>
                                </div>

                                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Activity className="w-5 h-5 text-emerald-500" />
                                        <span className="text-slate-400 text-sm">En ligne</span>
                                    </div>
                                    <p className="text-3xl font-bold text-emerald-400">{onlineAgents}</p>
                                </div>

                                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <HardDrive className="w-5 h-5 text-emerald-500" />
                                        <span className="text-slate-400 text-sm">Sauvegardes</span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">{logs.length}</p>
                                </div>

                                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        <span className="text-slate-400 text-sm">Réussies</span>
                                    </div>
                                    <p className="text-3xl font-bold text-emerald-400">{successfulBackups}</p>
                                </div>
                            </div>

                            {/* Graphiques de statistiques */}
                            <StatsCharts backupLogs={allLogs} agents={agents} />

                            {/* Nouvelles sections améliorées */}
                            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                                {/* Barre de stockage */}
                                <StorageBar
                                    usedBytes={allLogs.reduce((acc, log) => acc + (log.data_added || 0), 0)}
                                    totalBytes={100 * 1024 * 1024 * 1024}
                                    plan="independant"
                                />

                                {/* Carte synthèse */}
                                <SummaryCard
                                    lastBackup={logs[0] || null}
                                    nextBackupTime="Dans ~1h"
                                    totalBackups={allLogs.length}
                                    successRate={allLogs.length > 0 ? (successfulBackups / allLogs.length) * 100 : 100}
                                />
                            </div>

                            {/* Calendrier des backups */}
                            <div className="mb-8">
                                <BackupCalendar logs={allLogs} />
                            </div>

                            {/* Agents */}
                            <section className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <Monitor className="w-5 h-5 text-emerald-500" />
                                        Agents connectés
                                    </h2>
                                    <button
                                        onClick={handleRefresh}
                                        disabled={refreshing}
                                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                        Actualiser
                                    </button>
                                </div>

                                <div className="grid gap-4">
                                    {agents.map((agent) => (
                                        <Link
                                            key={agent.id}
                                            href={`/dashboard/agent/${agent.id}`}
                                            className="bg-slate-800/30 border border-slate-700/50 hover:border-emerald-500/50 rounded-xl p-6 flex items-center justify-between transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                                                <div>
                                                    <h3 className="text-white font-medium group-hover:text-emerald-400 transition-colors">{agent.hostname}</h3>
                                                    <p className="text-slate-400 text-sm">{agent.os} • {agent.ip_address}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-slate-400 text-sm flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    {timeAgo(agent.last_seen)}
                                                </span>
                                                {getStatusIcon(agent.status)}
                                                <button
                                                    onClick={(e) => handleEditClick(agent, e)}
                                                    className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-slate-700/50 rounded-lg transition-all"
                                                    title="Modifier"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>

                            {/* Logs récents */}
                            {logs.length > 0 && (
                                <section>
                                    <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                                        <FileText className="w-5 h-5 text-emerald-500" />
                                        Dernières sauvegardes
                                    </h2>

                                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-slate-800/50">
                                                <tr>
                                                    <th className="text-left text-slate-400 text-sm font-medium px-6 py-3">Machine</th>
                                                    <th className="text-left text-slate-400 text-sm font-medium px-6 py-3">Statut</th>
                                                    <th className="text-left text-slate-400 text-sm font-medium px-6 py-3">Fichiers</th>
                                                    <th className="text-left text-slate-400 text-sm font-medium px-6 py-3">Taille</th>
                                                    <th className="text-left text-slate-400 text-sm font-medium px-6 py-3">Durée</th>
                                                    <th className="text-left text-slate-400 text-sm font-medium px-6 py-3">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700/50">
                                                {logs.map((log) => (
                                                    <tr key={log.id}>
                                                        <td className="px-6 py-4 text-white">{log.agents?.hostname || 'N/A'}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${log.status === 'success'
                                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                                : 'bg-red-500/20 text-red-400'
                                                                }`}>
                                                                {log.status === 'success' ? 'Réussi' : 'Échec'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-300">
                                                            +{log.files_new} / ~{log.files_changed}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-300">{formatBytes(log.data_added)}</td>
                                                        <td className="px-6 py-4 text-slate-300">{formatDuration(log.duration_seconds)}</td>
                                                        <td className="px-6 py-4 text-slate-400">{timeAgo(log.created_at)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {/* Quick Actions */}
                            <div className="mt-8 flex gap-4">
                                <Link
                                    href="/download"
                                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Ajouter un agent
                                </Link>
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    Configuration
                                </Link>
                            </div>
                        </>
                    )}
                </main>

                {/* Toast Notification */}
                {toast && (
                    <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                        } text-white`}>
                        {toast.type === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <XCircle className="w-5 h-5" />
                        )}
                        {toast.message}
                    </div>
                )}

                {/* Modale Édition Agent */}
                {editModalOpen && editingAgent && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <Pencil className="w-5 h-5 text-emerald-500" />
                                    Modifier l&apos;agent
                                </h2>
                                <button
                                    onClick={() => setEditModalOpen(false)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Nom de l&apos;agent</label>
                                    <input
                                        type="text"
                                        value={editForm.hostname}
                                        onChange={(e) => setEditForm({ ...editForm, hostname: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                        placeholder="ex: PC-COMPTABILITE"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Système d&apos;exploitation</label>
                                    <input
                                        type="text"
                                        value={editForm.os}
                                        onChange={(e) => setEditForm({ ...editForm, os: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                        placeholder="ex: Windows 11"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Adresse IP</label>
                                    <input
                                        type="text"
                                        value={editForm.ip_address}
                                        onChange={(e) => setEditForm({ ...editForm, ip_address: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                                        placeholder="ex: 192.168.1.100"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={handleDeleteAgent}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Supprimer
                                </button>
                                <div className="flex-1" />
                                <button
                                    onClick={() => setEditModalOpen(false)}
                                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveAgent}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {saving ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4" />
                                    )}
                                    Enregistrer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Notification Toast */}
            <NotificationToast />

            {/* Realtime Subscriptions */}
            <RealtimeNotifications />
        </NotificationProvider>
    );
}
