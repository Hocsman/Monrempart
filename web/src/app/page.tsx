'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield, Lock, Server, CheckCircle, ArrowRight,
  Building2, Users, Zap, Database, Globe, ShieldCheck,
  ChevronRight, Play, Star
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  : null;

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-500" />
            <span className="text-xl font-bold text-white">Mon Rempart</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-slate-400 hover:text-white transition-colors">
              Fonctionnalités
            </Link>
            <Link href="/security" className="text-slate-400 hover:text-white transition-colors">
              Sécurité
            </Link>
            <Link href="/pricing" className="text-slate-400 hover:text-white transition-colors">
              Tarifs
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/settings" className="text-slate-400 hover:text-white transition-colors">
                  Configuration
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-slate-400 hover:text-white transition-colors">
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-full font-medium transition-all hover:scale-105"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Texte */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-sm font-medium">Solution 100% Française</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                La Citadelle<br />
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                  de vos données.
                </span>
              </h1>

              <p className="text-xl text-slate-400 max-w-xl">
                Sauvegarde immuable et Cybersécurité souveraine pour Mairies et TPE.
                Protégez votre structure contre les ransomwares avec une solution simple et conforme RGPD.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/register"
                  className="group inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
                >
                  Essayer gratuitement
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-slate-700"
                >
                  <Play className="w-5 h-5" />
                  Voir les fonctionnalités
                </Link>
              </div>

              {/* Stats rapides */}
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-white">99.9%</div>
                  <div className="text-slate-500 text-sm">Disponibilité</div>
                </div>
                <div className="w-px h-12 bg-slate-800" />
                <div>
                  <div className="text-3xl font-bold text-white">AES-256</div>
                  <div className="text-slate-500 text-sm">Chiffrement</div>
                </div>
                <div className="w-px h-12 bg-slate-800" />
                <div>
                  <div className="text-3xl font-bold text-white">🇫🇷</div>
                  <div className="text-slate-500 text-sm">Hébergement</div>
                </div>
              </div>
            </motion.div>

            {/* Shield animé */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex items-center justify-center"
            >
              <div
                className="relative cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Cercles de fond */}
                <motion.div
                  animate={{
                    scale: isHovered ? [1, 1.1, 1] : 1,
                    opacity: isHovered ? [0.3, 0.5, 0.3] : 0.3
                  }}
                  transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
                  className="absolute inset-0 m-auto w-72 h-72 bg-emerald-500/20 rounded-full blur-xl"
                />
                <motion.div
                  animate={{
                    scale: isHovered ? [1, 1.2, 1] : 1,
                    opacity: isHovered ? [0.2, 0.4, 0.2] : 0.2
                  }}
                  transition={{ duration: 2.5, repeat: isHovered ? Infinity : 0, delay: 0.3 }}
                  className="absolute inset-0 m-auto w-96 h-96 bg-emerald-600/10 rounded-full blur-2xl"
                />

                {/* Shield principal */}
                <motion.div
                  animate={{
                    y: isHovered ? -10 : 0,
                    rotateY: isHovered ? 15 : 0
                  }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 flex items-center justify-center shadow-2xl"
                >
                  <motion.div
                    animate={{
                      scale: isHovered ? 1.1 : 1,
                      filter: isHovered ? 'drop-shadow(0 0 30px rgba(16, 185, 129, 0.6))' : 'drop-shadow(0 0 0px rgba(16, 185, 129, 0))'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Shield className="w-32 h-32 md:w-40 md:h-40 text-emerald-500" />
                  </motion.div>

                  {/* Particules */}
                  {isHovered && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: [0, 1, 0], y: -50 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute top-1/3 left-1/4 w-2 h-2 bg-emerald-400 rounded-full"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: [0, 1, 0], y: -40 }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                        className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-emerald-300 rounded-full"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: [0, 1, 0], y: -60 }}
                        transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
                        className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-emerald-500 rounded-full"
                      />
                    </>
                  )}
                </motion.div>

                {/* Badge flottant */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
                >
                  ✓ Protégé
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bandeau de confiance */}
      <section className="py-12 border-y border-slate-800/50 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-emerald-500" />
              <span className="text-slate-300 font-medium">Données hébergées en France 🇫🇷</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              <span className="text-slate-300 font-medium">Conforme RGPD</span>
            </div>
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-emerald-500" />
              <span className="text-slate-300 font-medium">Chiffrement Zero-Knowledge</span>
            </div>
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-emerald-500" />
              <span className="text-slate-300 font-medium">Infrastructure Souveraine</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section Pour qui */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Conçu pour les structures qui comptent
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Une solution adaptée aux besoins spécifiques des collectivités et des petites entreprises françaises.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-all group"
            >
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <Building2 className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Mairies & Collectivités</h3>
              <p className="text-slate-400 mb-6">
                Protégez l&apos;état civil, les documents administratifs et les données des citoyens.
                Conformité garantie avec les exigences de l&apos;ANSSI.
              </p>
              <ul className="space-y-3">
                {['Sauvegarde automatique quotidienne', 'Récupération en cas de sinistre', 'Support prioritaire dédié'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-all group"
            >
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">TPE & Indépendants</h3>
              <p className="text-slate-400 mb-6">
                Sécurisez vos fichiers clients, comptabilité et documents essentiels.
                Simple à installer, aucune compétence technique requise.
              </p>
              <ul className="space-y-3">
                {['Installation en 5 minutes', 'Fonctionne en arrière-plan', 'Tarif accessible'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Protection complète, simplicité absolue
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Technologie de pointe rendue accessible à tous.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: 'Sauvegarde Immuable',
                description: 'Vos données sont versionnées et protégées contre toute modification. Même un ransomware ne peut pas les altérer.',
                color: 'emerald'
              },
              {
                icon: Zap,
                title: 'Protection Anti-Ransomware',
                description: 'En cas d\'attaque, restaurez vos fichiers en quelques clics depuis une version saine antérieure.',
                color: 'amber'
              },
              {
                icon: Server,
                title: 'Stockage Souverain',
                description: 'Hébergement chez Scaleway à Paris. Vos données restent en France, sous législation européenne.',
                color: 'blue'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-800/30 p-8 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-all hover:-translate-y-1"
              >
                <div className={`w-14 h-14 bg-${feature.color}-500/10 rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-7 h-7 text-${feature.color}-500`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Découvrir toutes les fonctionnalités
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-12 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Prêt à sécuriser votre structure ?
              </h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
                Essayez Mon Rempart gratuitement pendant 14 jours. Aucune carte bancaire requise.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 bg-white text-emerald-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                Commencer l&apos;essai gratuit
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-emerald-500" />
                <span className="text-xl font-bold text-white">Mon Rempart</span>
              </div>
              <p className="text-slate-400 text-sm">
                Solution souveraine de sauvegarde et cybersécurité pour les structures françaises.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Produit</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Sécurité</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
                <li><Link href="/download" className="hover:text-white transition-colors">Télécharger</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Ressources</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">Statut des services</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Légal</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Confidentialité</Link></li>
                <li><Link href="/legal/terms" className="hover:text-white transition-colors">CGU</Link></li>
                <li><Link href="/legal/mentions" className="hover:text-white transition-colors">Mentions légales</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800/50 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2026 Mon Rempart. Tous droits réservés. Hébergé en France 🇫🇷
            </p>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400 text-sm">Confiance de + de 100 structures</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
