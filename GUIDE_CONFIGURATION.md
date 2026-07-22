# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║           GUIDE VISUEL — CONFIGURATION SUPABASE + GOOGLE OAUTH               ║
# ╚══════════════════════════════════════════════════════════════════════════════╝


═══════════════════════════════════════════════════════════════════════════════
 ÉTAPE 1 : SUPABASE — CRÉER LE PROJET ET RÉCUPÉRER LES CLÉS
═══════════════════════════════════════════════════════════════════════════════

1. Va sur https://supabase.com et connecte-toi (compte gratuit)

2. Clique sur "New Project"

3. Remplis :
   • Organization : (ta team perso)
   • Project name : trading-journal-sbo
   • Database password : (génère un mot de passe fort, note-le)
   • Region : Frankfurt (eu-central-1) — le plus proche de la France

4. Clique "Create new project"

5. Attends ~2 minutes que le projet soit prêt


─── RÉCUPÉRER LES CLÉS (Project Settings → API) ───

Dans le menu de gauche, clique sur l'icône ⚙️  "Project Settings"
Puis sur l'onglet "API" dans le sous-menu

Tu verras cette page :

┌─────────────────────────────────────────────────────────────────────┐
│  Project API keys                                                    │
│                                                                      │
│  URL:  https://xxxxxxxxxxxxxxxxxxxx.supabase.co   ← COPIE ÇA        │
│                                                                      │
│  anon public:                                                        │
│  eyJhbGciOiJIUzI1NiIs...xxxxxxxxxxxxxxxxxxxxxxxx   ← COPIE ÇA       │
└─────────────────────────────────────────────────────────────────────┘

COPIE CES 2 VALEURS dans ton fichier .env :

    VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
    VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...


═══════════════════════════════════════════════════════════════════════════════
 ÉTAPE 2 : EXÉCUTER LE SCHÉMA SQL
═══════════════════════════════════════════════════════════════════════════════

1. Dans Supabase, menu de gauche → clique sur "SQL Editor" (icône </>)

2. Clique "New query"

3. Ouvre le fichier du projet : supabase/schema.sql
   Copie tout le contenu (Ctrl+A, Ctrl+C)

4. Colle dans l'éditeur SQL de Supabase (Ctrl+V)

5. Clique le bouton vert "RUN"

✅ Tu verras "Success. No rows returned" en bas


═══════════════════════════════════════════════════════════════════════════════
 ÉTAPE 3 : CONFIGURER GOOGLE OAUTH
═══════════════════════════════════════════════════════════════════════════════

PARTIE A — Google Cloud Console (créer les identifiants OAuth)
───────────────────────────────────────────────────────────────────────────────

1. Va sur https://console.cloud.google.com/ et connecte-toi

2. Crée un nouveau projet (sélecteur en haut → "New Project")
   Nom : trading-journal-sbo

3. Dans le menu de gauche, va dans :
   "APIs & Services" → "OAuth consent screen"

4. Choisis "External" → "CREATE"

5. Remplis l'écran de consentement :
   • App name : Journal SBO Trading
   • User support email : (ton email)
   • Developer contact email : (ton email)
   • Clique "SAVE AND CONTINUE" 3 fois puis "BACK TO DASHBOARD"

6. Dans le menu de gauche : "APIs & Services" → "Credentials"
   Clique "+ CREATE CREDENTIALS" → "OAuth client ID"

7. Configure :
   • Application type : Web application
   • Name : Journal SBO Web

8. AJOUTE CES URLS dans "Authorized redirect URIs" :

   Pour le développement local :
   http://localhost:5173

   Pour la production (après déploiement Vercel) :
   https://ton-projet.vercel.app

9. Clique "CREATE"

10. Une fenêtre popup s'affiche avec :

┌─────────────────────────────────────────────────────────────────────┐
│  Your Client ID                                                     │
│  123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com   │
│                                                                     │
│  Your Client Secret                                                 │
│  GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx                          │
└─────────────────────────────────────────────────────────────────────┘

⚠️  NOTE CES 2 VALEURS (Client ID et Client Secret)
    Tu peux les retrouver plus tard dans "Credentials" si besoin


PARTIE B — Supabase (lier Google OAuth)
───────────────────────────────────────────────────────────────────────────────

1. Retourne dans Supabase

2. Menu de gauche → "Authentication" → clique sur "Providers"

3. Trouve "Google" dans la liste et clique dessus

4. Active le toggle "Enable Sign in with Google"

5. Colle tes identifiants :

   Client ID (from Google) :
   123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com

   Client Secret (from Google) :
   GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

6. Dans "Authorized Redirect URI" :
   Laisse la valeur par défaut qui contient déjà ton URL Supabase

7. Clique "Save"

✅ L'authentification Google est configurée !


═══════════════════════════════════════════════════════════════════════════════
 RÉCAPITULATIF — CE QUE TU DOIS COPIER DANS TON .ENV
═══════════════════════════════════════════════════════════════════════════════

Crée un fichier .env à la racine du projet (même niveau que package.json) :

┌─────────────────────────────────────────────────────────────────────────────┐
│  VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co                 │
│  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...xxxxxxxxxxxxxxxxxxxxxxxx   │
└─────────────────────────────────────────────────────────────────────────────┘

⚠️  Les identifiants Google (Client ID / Secret) ne vont PAS dans le .env
    Ils sont déjà configurés côté Supabase (étape 3B)
    L'appli les récupère automatiquement via Supabase Auth


═══════════════════════════════════════════════════════════════════════════════
 ÉTAPE 4 : VÉRIFIER LE BUCKET STORAGE
═══════════════════════════════════════════════════════════════════════════════

1. Supabase → menu de gauche → "Storage"

2. Tu devrais voir un bucket "trade-screenshots"
   (créé automatiquement par le schema.sql)

3. S'il n'existe pas, clique "New bucket" :
   • Name : trade-screenshots
   • Public bucket : ✅ COCHÉ
   • Clique "Save"


═══════════════════════════════════════════════════════════════════════════════
 ÉTAPE 5 : LANCER EN LOCAL
═══════════════════════════════════════════════════════════════════════════════

  cd trading-journal-sbo
  npm install
  npm run dev

  Ouvre http://localhost:5173 dans ton navigateur
  Clique "Continuer avec Google"
  Connecte-toi avec ton compte Google

  ✅ Si tout fonctionne, tu vois la page "Mes journaux"
