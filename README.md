# Mon Rempart 🛡️

**La Citadelle de vos données** - SaaS de sauvegarde et cybersécurité souverain destiné aux Mairies et TPE françaises.

## Architecture Zero-Trust

```
┌────────────────────┐     ┌─────────────────────────────────────────┐
│   PC Client        │     │            Cloud Souverain              │
│                    │     │                                         │
│  ┌──────────────┐  │     │  ┌─────────────┐    ┌──────────────┐   │
│  │  Agent Go    │  │     │  │  Scaleway   │    │   Supabase   │   │
│  │  + Restic    │──┼────►│  │  S3 Bucket  │    │  (Auth + DB) │   │
│  └──────────────┘  │     │  └─────────────┘    └──────────────┘   │
│                    │     │                            ▲            │
└────────────────────┘     │                            │            │
                           │  ┌─────────────────────────┴──────┐    │
                           │  │      Dashboard Next.js         │    │
                           │  │   (Visualisation & Gestion)    │    │
                           │  └────────────────────────────────┘    │
                           └─────────────────────────────────────────┘
```

**Principe "Direct-to-Cloud" :**
1. L'Agent chiffre et déduplique les données localement via Restic
2. Les données vont directement dans le bucket S3 (pas de transit serveur)
3. Le Dashboard affiche les statuts et gère les abonnements

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ et npm
- Go 1.21+
- Restic (optionnel pour tests)

### Dashboard Web

```bash
cd web
npm install
cp .env.local.example .env.local
# Modifier .env.local avec vos clés Supabase
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Agent Go

```bash
cd agent
go build -o mon-rempart-agent .
./mon-rempart-agent
```

---

## 📁 Structure du Projet

```
/
├── web/                    # Dashboard Next.js
│   ├── src/
│   │   ├── app/           # Pages (App Router)
│   │   └── lib/           # Utilitaires (Supabase client)
│   └── .env.local.example
│
├── agent/                  # Agent Go
│   ├── main.go            # Point d'entrée
│   └── config/            # Configuration
│
└── README.md
```

---

## 🎨 Palette de Couleurs

| Couleur        | Hex       | Usage                     |
|----------------|-----------|---------------------------|
| Bleu Marine    | `#0A192F` | Fond principal            |
| Blanc          | `#FFFFFF` | Texte & éléments          |
| Vert Émeraude  | `#10B981` | Statuts sécurité (OK)     |
| Rouge          | `#EF4444` | Statuts alerte            |

---

## 📜 Licence

Propriétaire - Mon Rempart © 2024
