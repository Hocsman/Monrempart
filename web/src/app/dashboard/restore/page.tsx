'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, ArrowLeft, RefreshCw, Monitor, Clock, HardDrive,
    Calendar, FolderOpen, RotateCcw, CheckCircle, XCircle,
    AlertTriangle, Search, Filter
} from 'lucide-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase client
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
    status: string;
    last_seen: string;
}

interface Snapshot {
    id: string;
    agent_id: string;
    snapshot_id: string;
    short_id: string;
    snapshot_time: string;
    hostname: string;
    paths: string[];
    size_bytes: number;
}

interface RestoreRequest {
    id: string;
    snapshot_id: string;
    target_path: string;
    status: string;
    created_at: string;
    completed_at: string | null;
}

function formatBytes(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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

export default function RestorePage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [restoreHistory, setRestoreHistory] = useState<RestoreRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingSnapshots, setLoadingSnapshots] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
    const [targetPath, setTargetPath] = useState('');
    const [showModal, setShowModal] = useState(false);

    // Charger les agents
    useEffect(() => {
        const loadAgents = async () => {
            const supabase = getSupabase();
            if (!supabase) {
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from('agents')
                .select('*')
                .order('hostname');

            if (data) {
                setAgents(data);
            }
            setLoading(false);
        };

        loadAgents();
    }, []);

    // Charger les snapshots quand un agent est sélectionné
    const loadSnapshots = async (agentId: string) => {
        setLoadingSnapshots(true);
        try {
            const response = await fetch(`/api/restore/snapshots?agentId=${agentId}`);
            const data = await response.json();
            if (data.success) {
                setSnapshots(data.snapshots);
            }

            // Charger l'historique des restaurations
            const histResponse = await fetch(`/api/restore/request?agentId=${agentId}`);
            const histData = await histResponse.json();
            if (histData.success) {
                setRestoreHistory(histData.requests);
            }
        } catch (error) {
            console.error('Erreur chargement snapshots:', error);
        }
        setLoadingSnapshots(false);
    };

    const handleAgentSelect = (agent: Agent) => {
        setSelectedAgent(agent);
        setSnapshots([]);
        loadSnapshots(agent.id);
    };

    const handleRestoreClick = (snapshot: Snapshot) => {
        setSelectedSnapshot(snapshot);
        setTargetPath(snapshot.paths[0] || '/restore');
        setShowModal(true);
    };

    const handleRestoreConfirm = async () => {
        if (!selectedAgent || !selectedSnapshot || !targetPath) return;

        setRestoring(true);
        try {
            const response = await fetch('/api/restore/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: selectedAgent.id,
                    snapshotId: selectedSnapshot.snapshot_id,
                    targetPath: targetPath
                })
            });

            const data = await response.json();
            if (data.success) {
                setShowModal(false);
                // Recharger l'historique
                loadSnapshots(selectedAgent.id);
            } else {
                alert(data.message || 'Erreur lors de la demande de restauration');
            }
        } catch (error) {
            console.error('Erreur restauration:', error);
            alert('Erreur lors de la demande de restauration');
        }
        setRestoring(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

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
                        <span className="text-slate-500 px-3">|</span>
                        <h1 className="text-white font-semibold flex items-center gap-2">
                            <RotateCcw className="w-5 h-5 text-emerald-500" />
                            Restauration
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Liste des agents */}
                    <div className="md:col-span-1">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-emerald-500" />
                            Agents
                        </h2>
                        <div className="space-y-2">
                            {agents.length === 0 ? (
                                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 text-center text-slate-400">
                                    Aucun agent disponible
                                </div>
                            ) : (
                                agents.map((agent) => (
                                    <button
                                        key={agent.id}
                                        onClick={() => handleAgentSelect(agent)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${selectedAgent?.id === agent.id
                                                ? 'bg-emerald-500/10 border-emerald-500/50'
                                                : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${agent.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'
                                                }`} />
                                            <div>
                                                <p className="font-medium text-white">{agent.hostname}</p>
                                                <p className="text-slate-400 text-sm">
                                                    {timeAgo(agent.last_seen)}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Snapshots */}
                    <div className="md:col-span-2">
                        {!selectedAgent ? (
                            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center">
                                <HardDrive className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400 text-lg">
                                    Sélectionnez un agent pour voir ses sauvegardes
                                </p>
                            </div>
                        ) : loadingSnapshots ? (
                            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center">
                                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                            </div>
                        ) : (
                            <>
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-emerald-500" />
                                    Snapshots de {selectedAgent.hostname}
                                </h2>

                                {snapshots.length === 0 ? (
                                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 text-center mb-6">
                                        <HardDrive className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-400">
                                            Aucun snapshot disponible pour cet agent.
                                        </p>
                                        <p className="text-slate-500 text-sm mt-2">
                                            Les snapshots apparaîtront après la première sauvegarde.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 mb-8">
                                        {snapshots.map((snapshot, i) => (
                                            <motion.div
                                                key={snapshot.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/50 transition-all"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                                            <HardDrive className="w-6 h-6 text-emerald-500" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-mono text-white">{snapshot.short_id}</p>
                                                                <span className="text-slate-500">•</span>
                                                                <span className="text-slate-400 text-sm">
                                                                    {formatDate(snapshot.snapshot_time)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                                                                <FolderOpen className="w-4 h-4" />
                                                                {snapshot.paths?.join(', ') || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRestoreClick(snapshot)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
                                                    >
                                                        <RotateCcw className="w-4 h-4" />
                                                        Restaurer
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {/* Historique des restaurations */}
                                {restoreHistory.length > 0 && (
                                    <>
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-emerald-500" />
                                            Historique des restaurations
                                        </h3>
                                        <div className="space-y-2">
                                            {restoreHistory.map((request) => (
                                                <div
                                                    key={request.id}
                                                    className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {request.status === 'success' ? (
                                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                        ) : request.status === 'failed' ? (
                                                            <XCircle className="w-5 h-5 text-red-500" />
                                                        ) : request.status === 'running' ? (
                                                            <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />
                                                        ) : (
                                                            <Clock className="w-5 h-5 text-slate-400" />
                                                        )}
                                                        <div>
                                                            <p className="text-white text-sm font-mono">
                                                                {request.snapshot_id.substring(0, 8)}
                                                            </p>
                                                            <p className="text-slate-400 text-xs">
                                                                → {request.target_path}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded ${request.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            request.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                                                request.status === 'running' ? 'bg-amber-500/20 text-amber-400' :
                                                                    'bg-slate-500/20 text-slate-400'
                                                        }`}>
                                                        {request.status === 'success' ? 'Terminé' :
                                                            request.status === 'failed' ? 'Échec' :
                                                                request.status === 'running' ? 'En cours' : 'En attente'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal de confirmation */}
            <AnimatePresence>
                {showModal && selectedSnapshot && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full mx-4"
                        >
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <RotateCcw className="w-5 h-5 text-emerald-500" />
                                Confirmer la restauration
                            </h3>

                            <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                                <p className="text-slate-400 text-sm">Snapshot</p>
                                <p className="text-white font-mono">{selectedSnapshot.short_id}</p>
                                <p className="text-slate-400 text-sm mt-2">Date</p>
                                <p className="text-white">{formatDate(selectedSnapshot.snapshot_time)}</p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-slate-400 text-sm mb-2">
                                    Chemin de destination
                                </label>
                                <input
                                    type="text"
                                    value={targetPath}
                                    onChange={(e) => setTargetPath(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                    placeholder="/chemin/restauration"
                                />
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-6">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-amber-400 text-sm">
                                        Les fichiers existants dans le chemin de destination seront écrasés.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleRestoreConfirm}
                                    disabled={restoring || !targetPath}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {restoring ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <RotateCcw className="w-4 h-4" />
                                    )}
                                    Restaurer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
