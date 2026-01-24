'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useNotifications, Notification } from './NotificationContext';

function getIcon(type: Notification['type']) {
    switch (type) {
        case 'success': return <CheckCircle className="w-5 h-5" />;
        case 'warning': return <AlertTriangle className="w-5 h-5" />;
        case 'error': return <AlertCircle className="w-5 h-5" />;
        default: return <Info className="w-5 h-5" />;
    }
}

function getToastStyles(type: Notification['type']) {
    switch (type) {
        case 'success':
            return 'bg-emerald-600 text-white';
        case 'warning':
            return 'bg-amber-500 text-white';
        case 'error':
            return 'bg-red-600 text-white';
        default:
            return 'bg-blue-600 text-white';
    }
}

export default function NotificationToast() {
    const { showToast, dismissToast } = useNotifications();

    return (
        <AnimatePresence>
            {showToast && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: 50 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 50, x: 50 }}
                    className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-xl shadow-2xl ${getToastStyles(showToast.type)}`}
                >
                    <div className="flex items-start gap-3 p-4">
                        <div className="flex-shrink-0 mt-0.5">
                            {getIcon(showToast.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold">{showToast.title}</p>
                            <p className="text-sm opacity-90 mt-1">{showToast.message}</p>
                        </div>
                        <button
                            onClick={dismissToast}
                            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
