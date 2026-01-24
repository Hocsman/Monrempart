'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, AlertTriangle, AlertCircle, Info, X, Check } from 'lucide-react';
import { useNotifications, Notification } from './NotificationContext';

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
}

function getIcon(type: Notification['type']) {
    switch (type) {
        case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
        case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
        case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
        default: return <Info className="w-5 h-5 text-blue-400" />;
    }
}

function getTypeColor(type: Notification['type']) {
    switch (type) {
        case 'success': return 'border-emerald-500/30 bg-emerald-500/5';
        case 'warning': return 'border-amber-500/30 bg-amber-500/5';
        case 'error': return 'border-red-500/30 bg-red-500/5';
        default: return 'border-blue-500/30 bg-blue-500/5';
    }
}

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        // Could navigate to agent detail here if needed
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                            <h3 className="font-semibold text-white">Notifications</h3>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                                    >
                                        <Check className="w-3 h-3" />
                                        Tout lire
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearNotifications}
                                        className="text-xs text-slate-400 hover:text-slate-300"
                                    >
                                        Effacer
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center text-slate-500">
                                    <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p>Aucune notification</p>
                                </div>
                            ) : (
                                notifications.slice(0, 10).map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`px-4 py-3 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors ${!notification.read ? 'bg-slate-800/30' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`flex-shrink-0 p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-white text-sm truncate">
                                                        {notification.title}
                                                    </p>
                                                    {!notification.read && (
                                                        <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-slate-500 text-xs mt-1">
                                                    {formatTimeAgo(notification.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
