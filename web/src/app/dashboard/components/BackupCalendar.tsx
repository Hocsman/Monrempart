'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react';

interface BackupLog {
    id: string;
    status: string;
    created_at: string;
    agents?: { hostname: string };
}

interface BackupCalendarProps {
    logs: BackupLog[];
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function BackupCalendar({ logs }: BackupCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Premier jour du mois
        const firstDay = new Date(year, month, 1);
        const startDay = (firstDay.getDay() + 6) % 7; // Lundi = 0

        // Nombre de jours dans le mois
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Créer les jours du calendrier
        const days: Array<{
            date: number;
            status: 'success' | 'failed' | 'none' | null;
            count: number;
        }> = [];

        // Jours vides au début
        for (let i = 0; i < startDay; i++) {
            days.push({ date: 0, status: null, count: 0 });
        }

        // Jours du mois
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayLogs = logs.filter(log => log.created_at.startsWith(dateStr));

            let status: 'success' | 'failed' | 'none' = 'none';
            if (dayLogs.length > 0) {
                const hasFailure = dayLogs.some(log => log.status === 'failed');
                status = hasFailure ? 'failed' : 'success';
            }

            days.push({ date: day, status, count: dayLogs.length });
        }

        return days;
    }, [currentDate, logs]);

    const goToPrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    Calendrier des sauvegardes
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPrevMonth}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={goToToday}
                        className="px-3 py-1 text-sm text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                    >
                        Aujourd&apos;hui
                    </button>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Mois/Année */}
            <p className="text-center text-white font-medium mb-4">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </p>

            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(day => (
                    <div key={day} className="text-center text-slate-500 text-xs font-medium py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Jours du mois */}
            <div className="grid grid-cols-7 gap-1">
                {calendarData.map((day, index) => (
                    <div
                        key={index}
                        className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative ${day.date === 0
                                ? ''
                                : day.status === 'success'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : day.status === 'failed'
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-slate-800/50 text-slate-400'
                            }`}
                    >
                        {day.date > 0 && (
                            <>
                                <span className="font-medium">{day.date}</span>
                                {day.count > 0 && (
                                    <span className="absolute bottom-1 flex items-center gap-0.5">
                                        {day.status === 'success' ? (
                                            <CheckCircle className="w-3 h-3" />
                                        ) : day.status === 'failed' ? (
                                            <XCircle className="w-3 h-3" />
                                        ) : (
                                            <Clock className="w-3 h-3" />
                                        )}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Légende */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-3 h-3 bg-emerald-500/20 rounded" />
                    Réussies
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-3 h-3 bg-red-500/20 rounded" />
                    Échouées
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-3 h-3 bg-slate-800 rounded" />
                    Aucune
                </div>
            </div>
        </motion.div>
    );
}
