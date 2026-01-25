'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Download, Terminal, CheckCircle, ArrowRight, ArrowLeft,
    Monitor, Apple, Laptop, Copy, Check, RefreshCw, Sparkles
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

const steps = [
    { id: 1, title: 'Télécharger', icon: Download },
    { id: 2, title: 'Installer', icon: Terminal },
    { id: 3, title: 'Vérifier', icon: CheckCircle },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedOS, setSelectedOS] = useState<'windows' | 'mac' | 'linux' | null>(null);
    const [copied, setCopied] = useState(false);
    const [checking, setChecking] = useState(false);
    const [agentConnected, setAgentConnected] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            const supabase = getSupabase();
            if (!supabase) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        loadUser();
    }, []);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const checkAgentConnection = async () => {
        if (!userId) return;

        setChecking(true);
        const supabase = getSupabase();

        if (supabase) {
            // Vérifier si un agent est connecté pour cet utilisateur
            const { data } = await supabase
                .from('agents')
                .select('id')
                .eq('user_id', userId)
                .eq('status', 'online')
                .limit(1);

            if (data && data.length > 0) {
                setAgentConnected(true);
            }
        }

        setChecking(false);
    };

    const handleFinish = () => {
        router.push('/dashboard');
    };

    const handleSkip = () => {
        router.push('/dashboard');
    };

    const getInstallCommand = () => {
        switch (selectedOS) {
            case 'windows':
                return 'powershell -c "irm https://monrempart.fr/install.ps1 | iex"';
            case 'mac':
                return 'curl -sSL https://monrempart.fr/install.sh | bash';
            case 'linux':
                return 'curl -sSL https://monrempart.fr/install.sh | sudo bash';
            default:
                return '';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-emerald-500" />
                        <span className="text-xl font-bold text-white">Mon Rempart</span>
                    </div>
                    <button
                        onClick={handleSkip}
                        className="text-slate-400 hover:text-white transition-colors text-sm"
                    >
                        Passer cette étape →
                    </button>
                </div>
            </header>

            {/* Progress */}
            <div className="max-w-4xl mx-auto px-6 py-8 w-full">
                <div className="flex items-center justify-between mb-12">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className={`flex items-center gap-3 ${currentStep >= step.id ? 'text-emerald-400' : 'text-slate-500'
                                }`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep > step.id
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : currentStep === step.id
                                            ? 'border-emerald-500 bg-emerald-500/20'
                                            : 'border-slate-600'
                                    }`}>
                                    {currentStep > step.id ? (
                                        <Check className="w-5 h-5 text-white" />
                                    ) : (
                                        <step.icon className="w-5 h-5" />
                                    )}
                                </div>
                                <span className="font-medium hidden sm:block">{step.title}</span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`w-16 sm:w-32 h-0.5 mx-4 ${currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-700'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-center"
                        >
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Download className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-4">
                                Téléchargez l&apos;agent Mon Rempart
                            </h1>
                            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                                Choisissez votre système d&apos;exploitation pour télécharger l&apos;agent de sauvegarde.
                            </p>

                            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                                <button
                                    onClick={() => setSelectedOS('windows')}
                                    className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${selectedOS === 'windows'
                                            ? 'border-emerald-500 bg-emerald-500/10'
                                            : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                                        }`}
                                >
                                    <Monitor className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                                    <p className="text-white font-medium">Windows</p>
                                    <p className="text-slate-500 text-sm">10 / 11</p>
                                </button>

                                <button
                                    onClick={() => setSelectedOS('mac')}
                                    className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${selectedOS === 'mac'
                                            ? 'border-emerald-500 bg-emerald-500/10'
                                            : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                                        }`}
                                >
                                    <Apple className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-white font-medium">macOS</p>
                                    <p className="text-slate-500 text-sm">Monterey+</p>
                                </button>

                                <button
                                    onClick={() => setSelectedOS('linux')}
                                    className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${selectedOS === 'linux'
                                            ? 'border-emerald-500 bg-emerald-500/10'
                                            : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                                        }`}
                                >
                                    <Laptop className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                                    <p className="text-white font-medium">Linux</p>
                                    <p className="text-slate-500 text-sm">Ubuntu, Debian...</p>
                                </button>
                            </div>

                            <button
                                onClick={() => setCurrentStep(2)}
                                disabled={!selectedOS}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continuer
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-center"
                        >
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Terminal className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-4">
                                Installez l&apos;agent
                            </h1>
                            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                                Ouvrez un terminal et exécutez la commande suivante :
                            </p>

                            <div className="max-w-2xl mx-auto mb-8">
                                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 relative">
                                    <div className="flex items-center gap-2 mb-3 text-slate-500 text-sm">
                                        <Terminal className="w-4 h-4" />
                                        {selectedOS === 'windows' ? 'PowerShell' : 'Terminal'}
                                    </div>
                                    <code className="text-emerald-400 text-sm sm:text-base break-all">
                                        {getInstallCommand()}
                                    </code>
                                    <button
                                        onClick={() => handleCopy(getInstallCommand())}
                                        className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        {copied ? (
                                            <Check className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-slate-400" />
                                        )}
                                    </button>
                                </div>

                                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-left">
                                    <p className="text-blue-400 text-sm">
                                        💡 <strong>Conseil :</strong> L&apos;agent s&apos;installera automatiquement et démarrera en arrière-plan.
                                        Il vous sera demandé votre clé API lors de la première exécution.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Retour
                                </button>
                                <button
                                    onClick={() => setCurrentStep(3)}
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all hover:scale-105"
                                >
                                    J&apos;ai installé l&apos;agent
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-center"
                        >
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${agentConnected ? 'bg-emerald-500' : 'bg-emerald-500/10'
                                }`}>
                                {agentConnected ? (
                                    <Sparkles className="w-10 h-10 text-white" />
                                ) : (
                                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                                )}
                            </div>

                            {agentConnected ? (
                                <>
                                    <h1 className="text-3xl font-bold text-white mb-4">
                                        🎉 Félicitations !
                                    </h1>
                                    <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                                        Votre agent est connecté et prêt à protéger vos données.
                                        Vous pouvez maintenant accéder à votre dashboard.
                                    </p>
                                    <button
                                        onClick={handleFinish}
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all hover:scale-105"
                                    >
                                        Accéder au Dashboard
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h1 className="text-3xl font-bold text-white mb-4">
                                        Vérification de la connexion
                                    </h1>
                                    <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                                        Cliquez sur le bouton ci-dessous pour vérifier que votre agent est bien connecté.
                                    </p>

                                    <div className="flex flex-col items-center gap-4">
                                        <button
                                            onClick={checkAgentConnection}
                                            disabled={checking}
                                            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50"
                                        >
                                            {checking ? (
                                                <>
                                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                                    Vérification...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="w-5 h-5" />
                                                    Vérifier la connexion
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={handleFinish}
                                            className="text-slate-400 hover:text-white transition-colors text-sm"
                                        >
                                            Continuer sans vérifier →
                                        </button>
                                    </div>

                                    <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl max-w-lg mx-auto text-left">
                                        <p className="text-amber-400 text-sm">
                                            ⏳ <strong>L&apos;agent n&apos;apparaît pas ?</strong> Attendez quelques secondes
                                            puis réessayez. Assurez-vous que l&apos;installation s&apos;est bien terminée.
                                        </p>
                                    </div>
                                </>
                            )}

                            {!agentConnected && (
                                <div className="mt-6">
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                        Retour
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
