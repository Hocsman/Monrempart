'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Lock, Server, Cloud, CheckCircle, ArrowRight, RefreshCw, Monitor, AlertCircle, FileText, Clock, HardDrive, Settings } from "lucide-react";
import { supabase } from '@/lib/supabase';

// Type pour les agents
interface Agent {
  id: string;
  hostname: string;
  ip_address: string | null;
  status: string;
  last_seen_at: string | null;
  created_at: string;
}

// Type pour les logs de sauvegarde
interface BackupLog {
  id: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  message: string | null;
  bytes_processed: number;
  files_processed: number;
  duration_seconds: number | null;
  created_at: string;
  completed_at: string | null;
  agents: {
    id: string;
    hostname: string;
  } | null;
}

// Composant pour afficher le statut d'un agent
function AgentStatusBadge({ lastSeenAt }: { lastSeenAt: string | null }) {
  if (!lastSeenAt) {
    return (
      <span className="flex items-center gap-2 text-gray-400 text-sm">
        <div className="w-2 h-2 bg-gray-500 rounded-full" />
        Jamais vu
      </span>
    );
  }

  const lastSeen = new Date(lastSeenAt);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));

  // Statut basé sur le temps depuis la dernière connexion
  const isOnline = diffMinutes < 5;

  return (
    <span className={`flex items-center gap-2 text-sm ${isOnline ? 'text-vert-emeraude' : 'text-rouge-alerte'}`}>
      <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-vert-emeraude' : 'bg-rouge-alerte'}`} />
      {isOnline ? 'En ligne' : `Hors ligne (${diffMinutes}min)`}
    </span>
  );
}

// Formater la date de dernière connexion
function formatLastSeen(lastSeenAt: string | null): string {
  if (!lastSeenAt) return 'Jamais';

  const date = new Date(lastSeenAt);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// Formater les octets en format lisible
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 octets';
  const k = 1024;
  const sizes = ['octets', 'Ko', 'Mo', 'Go', 'To'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Formater la durée en format lisible
function formatDuration(seconds: number | null): string {
  if (!seconds) return '-';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [logs, setLogs] = useState<BackupLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fonction pour charger les agents
  const loadAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('last_seen_at', { ascending: false });

      if (error) throw error;

      setAgents(data || []);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Erreur chargement agents:', err);
      setError('Impossible de charger les agents. Vérifiez votre configuration Supabase.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger les logs
  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('backup_logs')
        .select(`
          id,
          status,
          message,
          bytes_processed,
          files_processed,
          duration_seconds,
          created_at,
          completed_at,
          agents (
            id,
            hostname
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setLogs((data as BackupLog[]) || []);
    } catch (err) {
      console.error('Erreur chargement logs:', err);
    }
  };

  // Chargement initial et rafraîchissement automatique
  useEffect(() => {
    loadAgents();
    loadLogs();

    // Rafraîchissement toutes les 30 secondes
    const interval = setInterval(() => {
      loadAgents();
      loadLogs();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Compteurs pour les statistiques
  const onlineCount = agents.filter(a => {
    if (!a.last_seen_at) return false;
    const diffMinutes = (new Date().getTime() - new Date(a.last_seen_at).getTime()) / (1000 * 60);
    return diffMinutes < 5;
  }).length;

  const offlineCount = agents.length - onlineCount;
  const protectionRate = agents.length > 0 ? Math.round((onlineCount / agents.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-bleu-marine">
      {/* Header / Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-bleu-marine/80 backdrop-blur-md border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-vert-emeraude" />
            <span className="text-xl font-bold text-white">Mon Rempart</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#agents" className="text-gray-300 hover:text-white transition-colors">
              Agents
            </a>
            <a href="#fonctionnalites" className="text-gray-300 hover:text-white transition-colors">
              Fonctionnalités
            </a>
            <a href="#securite" className="text-gray-300 hover:text-white transition-colors">
              Sécurité
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/download"
              className="flex items-center gap-2 text-gray-300 hover:text-vert-emeraude transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="hidden md:inline">Télécharger</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Configuration</span>
            </Link>
            <button className="bg-vert-emeraude hover:bg-vert-emeraude-fonce text-white px-6 py-2 rounded-full font-medium transition-all hover:scale-105">
              Connexion
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="pt-24">
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Texte */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-vert-emeraude/10 border border-vert-emeraude/30 rounded-full px-4 py-2">
                <CheckCircle className="w-4 h-4 text-vert-emeraude" />
                <span className="text-vert-emeraude text-sm font-medium">
                  Solution 100% Souveraine
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Mon Rempart
                <span className="block text-vert-emeraude mt-2">
                  La Citadelle de vos données
                </span>
              </h1>

              <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
                Sauvegarde automatique et sécurisée pour les <strong className="text-white">Mairies</strong> et{" "}
                <strong className="text-white">TPE françaises</strong>. Vos données sont chiffrées localement et
                stockées en France.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group bg-vert-emeraude hover:bg-vert-emeraude-fonce text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                  Démarrer gratuitement
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a href="#agents" className="border border-white/30 hover:border-white text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:bg-white/5 text-center">
                  Voir les agents
                </a>
              </div>
            </div>

            {/* Stats en temps réel */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bleu-marine-clair p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-vert-emeraude/20 rounded-lg flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-vert-emeraude" />
                  </div>
                  <span className="text-gray-400 text-sm">Agents en ligne</span>
                </div>
                <div className="text-4xl font-bold text-vert-emeraude">{onlineCount}</div>
              </div>

              <div className="bg-bleu-marine-clair p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-rouge-alerte/20 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-rouge-alerte" />
                  </div>
                  <span className="text-gray-400 text-sm">Hors ligne</span>
                </div>
                <div className="text-4xl font-bold text-rouge-alerte">{offlineCount}</div>
              </div>

              <div className="col-span-2 bg-bleu-marine-clair p-6 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">Taux de protection</span>
                  <span className="text-2xl font-bold text-vert-emeraude">{protectionRate}%</span>
                </div>
                <div className="w-full bg-bleu-marine rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-vert-emeraude to-vert-emeraude-fonce h-3 rounded-full transition-all duration-500"
                    style={{ width: `${protectionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Agents en temps réel */}
        <section id="agents" className="bg-bleu-marine-clair py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Agents connectés
                </h2>
                <p className="text-gray-400">
                  Dernière mise à jour: {lastRefresh.toLocaleTimeString('fr-FR')}
                </p>
              </div>
              <button
                onClick={loadAgents}
                disabled={loading}
                className="flex items-center gap-2 bg-bleu-marine px-4 py-2 rounded-lg border border-white/10 text-white hover:border-vert-emeraude/50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-rouge-alerte/10 border border-rouge-alerte/30 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 text-rouge-alerte">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Astuce: Copiez <code className="bg-bleu-marine px-2 py-1 rounded">env.example</code> vers <code className="bg-bleu-marine px-2 py-1 rounded">.env.local</code> et configurez vos clés Supabase.
                </p>
              </div>
            )}

            {/* Liste des agents */}
            {agents.length > 0 ? (
              <div className="grid gap-4">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="bg-bleu-marine p-6 rounded-xl border border-white/10 hover:border-vert-emeraude/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-bleu-marine-clair rounded-xl flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-vert-emeraude" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{agent.hostname}</h3>
                        {agent.ip_address && (
                          <p className="text-gray-500 text-sm">{agent.ip_address}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Dernière connexion</p>
                        <p className="text-gray-300 text-sm">{formatLastSeen(agent.last_seen_at)}</p>
                      </div>
                      <AgentStatusBadge lastSeenAt={agent.last_seen_at} />
                    </div>
                  </div>
                ))}
              </div>
            ) : !loading && !error ? (
              <div className="bg-bleu-marine rounded-xl border border-white/10 p-12 text-center">
                <Server className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Aucun agent connecté</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Installez l&apos;agent Mon Rempart sur vos postes de travail pour les voir apparaître ici.
                </p>
              </div>
            ) : null}

            {/* Section Derniers Logs */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FileText className="w-6 h-6 text-vert-emeraude" />
                Derniers Logs de Sauvegarde
              </h3>

              {logs.length > 0 ? (
                <div className="bg-bleu-marine rounded-xl border border-white/10 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-bleu-marine-clair/50">
                      <tr>
                        <th className="text-left text-gray-400 text-xs uppercase tracking-wide px-6 py-3">Agent</th>
                        <th className="text-left text-gray-400 text-xs uppercase tracking-wide px-6 py-3">Statut</th>
                        <th className="text-left text-gray-400 text-xs uppercase tracking-wide px-6 py-3 hidden md:table-cell">Taille</th>
                        <th className="text-left text-gray-400 text-xs uppercase tracking-wide px-6 py-3 hidden lg:table-cell">Durée</th>
                        <th className="text-left text-gray-400 text-xs uppercase tracking-wide px-6 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Monitor className="w-4 h-4 text-gray-500" />
                              <span className="text-white font-medium">
                                {log.agents?.hostname || 'Agent inconnu'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${log.status === 'success'
                              ? 'bg-vert-emeraude/20 text-vert-emeraude'
                              : log.status === 'failed'
                                ? 'bg-rouge-alerte/20 text-rouge-alerte'
                                : log.status === 'running'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}>
                              {log.status === 'success' && <CheckCircle className="w-3 h-3" />}
                              {log.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                              {log.status === 'success' ? 'Succès' :
                                log.status === 'failed' ? 'Échec' :
                                  log.status === 'running' ? 'En cours' : 'En attente'}
                            </span>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-2 text-gray-300">
                              <HardDrive className="w-4 h-4 text-gray-500" />
                              {formatBytes(log.bytes_processed)}
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <div className="flex items-center gap-2 text-gray-300">
                              <Clock className="w-4 h-4 text-gray-500" />
                              {formatDuration(log.duration_seconds)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {new Date(log.created_at).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-bleu-marine rounded-xl border border-white/10 p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Aucun log de sauvegarde pour le moment</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section Fonctionnalités */}
        <section id="fonctionnalites" className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Architecture Zero-Trust
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Vos données ne passent jamais par nos serveurs. Elles sont chiffrées sur votre machine
                et envoyées directement vers le stockage sécurisé.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-bleu-marine-clair p-8 rounded-2xl border border-white/10 hover:border-vert-emeraude/50 transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-vert-emeraude/10 rounded-xl flex items-center justify-center mb-6">
                  <Lock className="w-7 h-7 text-vert-emeraude" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Chiffrement Local
                </h3>
                <p className="text-gray-400">
                  Vos données sont chiffrées et dédupliquées directement sur votre machine avant tout transfert.
                </p>
              </div>

              <div className="bg-bleu-marine-clair p-8 rounded-2xl border border-white/10 hover:border-vert-emeraude/50 transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-vert-emeraude/10 rounded-xl flex items-center justify-center mb-6">
                  <Cloud className="w-7 h-7 text-vert-emeraude" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Stockage Souverain
                </h3>
                <p className="text-gray-400">
                  Hébergement chez Scaleway, data centers en France. Conformité RGPD garantie.
                </p>
              </div>

              <div className="bg-bleu-marine-clair p-8 rounded-2xl border border-white/10 hover:border-vert-emeraude/50 transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-vert-emeraude/10 rounded-xl flex items-center justify-center mb-6">
                  <Server className="w-7 h-7 text-vert-emeraude" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Direct-to-Cloud
                </h3>
                <p className="text-gray-400">
                  Économisez votre bande passante. Les sauvegardes vont directement au cloud, sans intermédiaire.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-vert-emeraude" />
              <span className="text-white font-semibold">Mon Rempart</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 Mon Rempart. Solution de cybersécurité souveraine.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
