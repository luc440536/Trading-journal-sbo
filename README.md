# 📊 Journal de Trading SBO

Web app de journal de trading manuel encodant la stratégie **SBO (Structure Break of Asia)**.

## 🚀 Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19 + Vite |
| Routing | React Router v7 |
| Style | Tailwind CSS v4 |
| Graphiques | Recharts |
| Backend | Supabase (PostgreSQL) |
| Auth | Supabase Auth — Google OAuth exclusivement |
| Stockage | Supabase Storage |
| Hébergement | Vercel |

## 📦 Installation

```bash
# 1. Cloner le projet
git clone <repo>
cd trading-journal-sbo

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# 4. Lancer en développement
npm run dev
```

## 🔧 Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter le schéma SQL dans l'éditeur SQL : `supabase/schema.sql`
3. Activer l'authentification Google :
   - Google Cloud Console → Créer un ID client OAuth
   - Supabase Auth → Providers → Google → Renseigner Client ID / Secret
   - Ajouter l'URL de redirection autorisée
4. Créer le bucket `trade-screenshots` dans Storage

## 🗂️ Structure du projet

```
src/
├── components/
│   ├── auth/          # LoginPage
│   ├── trades/        # TradeForm
│   ├── ui/            # StatCard, RiskBar, SessionTimeline, Navbar, ProtectedRoute
│   ├── dashboard/     # (composants dashboard)
│   ├── calendar/      # (composants calendrier)
│   ├── analysis/      # (composants analyse)
│   └── settings/      # (composants paramètres)
├── contexts/          # AuthContext, ThemeContext, JournalContext
├── hooks/             # useJournals, useTrades, useCustomFields, useErrorTypes
├── lib/               # supabase client, database types, utils
├── pages/             # JournalsPage, DashboardPage, TradesPage, CalendarPage, AnalysisPage, ReportPage, SettingsPage
├── types/             # Types TypeScript
└── utils/             # Calculations (stats, equity, risk, etc.)
```

## 🎯 Fonctionnalités

- ✅ Authentification Google (OAuth 2.0)
- ✅ Multi-journaux (démo / réel)
- ✅ Saisie complète des trades avec 9 garde-fous SBO
- ✅ Champs personnalisés et types d'erreur par journal
- ✅ Upload de captures d'écran (compression client)
- ✅ Tableau de bord avec stats, courbe d'équité, résultats mensuels
- ✅ Frise horaire de session (Asie / Exécution / Gestion / Clôture)
- ✅ Barres de risque (jour / semaine / mois)
- ✅ Calendrier mensuel avec trades colorés
- ✅ Analyse par symbole, jour de semaine, émotion, erreurs
- ✅ Rapport de conformité (comparaison conforme vs écarts)
- ✅ Paramètres du journal avec suppression
- ✅ Mode sombre/clair
- ✅ PWA installable

## 📄 License

MIT
