'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface LoadingScreenProps {
    message?: string;
}

export default function LoadingScreen({ message = 'Chargement...' }: LoadingScreenProps) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                {/* Logo animé */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="mb-8"
                >
                    <div className="w-24 h-24 mx-auto bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                        <Shield className="w-12 h-12 text-emerald-500" />
                    </div>
                </motion.div>

                {/* Barre de progression */}
                <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden mb-4">
                    <motion.div
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                        animate={{
                            x: ['-100%', '100%'],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                </div>

                {/* Message */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-400"
                >
                    {message}
                </motion.p>

                {/* Points animés */}
                <div className="flex items-center justify-center gap-1 mt-3">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-emerald-500 rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
