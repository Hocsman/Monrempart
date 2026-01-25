'use client';

import { useState } from 'react';
import { FileDown, FileText, Table, RefreshCw } from 'lucide-react';

interface BackupLog {
    id: string;
    status: string;
    created_at: string;
    files_new: number;
    files_changed: number;
    data_added: number;
    duration_seconds: number;
    agents?: { hostname: string };
}

interface ExportButtonsProps {
    logs: BackupLog[];
}

export default function ExportButtons({ logs }: ExportButtonsProps) {
    const [exporting, setExporting] = useState<'csv' | 'json' | null>(null);

    const exportToCSV = () => {
        setExporting('csv');

        const headers = ['Date', 'Agent', 'Status', 'Fichiers nouveaux', 'Fichiers modifiés', 'Données ajoutées (bytes)', 'Durée (s)'];
        const rows = logs.map(log => [
            new Date(log.created_at).toLocaleString('fr-FR'),
            log.agents?.hostname || 'Inconnu',
            log.status,
            log.files_new,
            log.files_changed,
            log.data_added,
            log.duration_seconds
        ]);

        const csvContent = [
            headers.join(';'),
            ...rows.map(row => row.join(';'))
        ].join('\n');

        downloadFile(csvContent, 'rapport-sauvegardes.csv', 'text/csv');
        setExporting(null);
    };

    const exportToJSON = () => {
        setExporting('json');

        const data = logs.map(log => ({
            date: log.created_at,
            agent: log.agents?.hostname || 'Inconnu',
            status: log.status,
            files_new: log.files_new,
            files_changed: log.files_changed,
            data_added: log.data_added,
            duration_seconds: log.duration_seconds
        }));

        const jsonContent = JSON.stringify(data, null, 2);
        downloadFile(jsonContent, 'rapport-sauvegardes.json', 'application/json');
        setExporting(null);
    };

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type: `${type};charset=utf-8;` });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={exportToCSV}
                disabled={exporting !== null || logs.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
                {exporting === 'csv' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                    <Table className="w-4 h-4" />
                )}
                CSV
            </button>
            <button
                onClick={exportToJSON}
                disabled={exporting !== null || logs.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
                {exporting === 'json' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                    <FileText className="w-4 h-4" />
                )}
                JSON
            </button>
            <span className="text-slate-500 text-sm ml-2 hidden sm:inline">
                <FileDown className="w-4 h-4 inline mr-1" />
                {logs.length} entrées
            </span>
        </div>
    );
}
