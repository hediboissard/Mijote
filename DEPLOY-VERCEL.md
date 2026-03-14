# Déployer PostForge sur Vercel

Guide étape par étape pour mettre ton site en ligne et ajouter le lien sur ton portfolio.

---

## Partie 1 : Préparer le projet

### 1. Pousser le code sur GitHub

Si ce n’est pas déjà fait :

1. Crée un dépôt sur [github.com](https://github.com) (ex. `postforge`).
2. Dans le dossier du projet, ouvre un terminal et exécute :

```bash
git remote add origin https://github.com/TON_USERNAME/postforge.git
git add .
git commit -m "Prepare for Vercel deploy"
git push -u origin main
```

(Remplace `TON_USERNAME` par ton pseudo GitHub et `main` par ta branche si tu utilises une autre.)

### 2. Ne pas commiter le fichier `.env`

Vérifie que `.env` est bien dans `.gitignore` (c’est le cas par défaut). Les secrets seront renseignés dans Vercel.

---

## Partie 2 : Déployer sur Vercel

### 1. Créer un compte Vercel

- Va sur [vercel.com](https://vercel.com).
- Clique sur **Sign Up** et connecte-toi avec **GitHub**.

### 2. Importer le projet

1. Dans le tableau de bord Vercel, clique sur **Add New…** → **Project**.
2. Choisis le dépôt **PostForge** (il apparaît si tu as donné l’accès à tes repos GitHub).
3. Clique sur **Import**.

### 3. Configurer le projet

- **Framework Preset** : Next.js (détecté automatiquement).
- **Root Directory** : laisse par défaut.
- **Build Command** : `pnpm run build` (ou `npm run build` si tu utilises npm).
- **Output Directory** : laisse par défaut.

### 4. Ajouter les variables d’environnement

Dans la même page, section **Environment Variables**, ajoute **toutes** ces variables (en cochant **Production**, **Preview** et **Development** si tu veux les mêmes partout) :

| Nom | Valeur | Note |
|-----|--------|------|
| `DATABASE_URL` | Chaîne PostgreSQL (Supabase, Neon, etc.) | **En prod (Vercel), utilise l’URL « poolée »** (Supabase : mode Session, port 6543 ; Neon : option Pooled) pour éviter l’erreur « too many connections ». |
| `NEXTAUTH_SECRET` | Ton secret (ex. celui du `.env`) | Générer un nouveau si tu préfères : `openssl rand -base64 32` |
| `NEXTAUTH_URL` | **À remplir après le 1er déploiement** | Voir étape 5 ci‑dessous |
| `GOOGLE_CLIENT_ID` | Ton Client ID Google | Idem `.env` |
| `GOOGLE_CLIENT_SECRET` | Ton Client Secret Google | Idem `.env` |

Pour le premier déploiement, tu peux mettre une URL temporaire pour `NEXTAUTH_URL`, par ex. :

`https://postforge-xxx.vercel.app`  
(ou laisse vide et tu la mettras après.)

Clique sur **Deploy**.

### 5. Récupérer l’URL du site et finaliser NEXTAUTH_URL

1. Une fois le déploiement terminé, Vercel t’affiche l’URL du site (ex. `https://postforge-abc123.vercel.app`).
2. Va dans **Project** → **Settings** → **Environment Variables**.
3. Modifie `NEXTAUTH_URL` et mets exactement cette URL (sans slash à la fin), ex. :  
   `https://postforge-abc123.vercel.app`
4. **Redeploy** : onglet **Deployments** → menu **⋯** sur le dernier déploiement → **Redeploy**.

### 6. (Optionnel) Migrations Prisma en production

Si ta base est vide en prod et que tu utilises des migrations :

1. En local, assure-toi que `DATABASE_URL` pointe vers ta base Supabase (celle que tu utilises pour Vercel).
2. Exécute une fois :  
   `pnpm prisma migrate deploy`  
   (ou `npx prisma migrate deploy`).

Tu peux aussi configurer un script dans Vercel (Build Command ou un job) pour lancer `prisma migrate deploy` avant `next build` si tu préfères tout automatiser.

---

## Partie 3 : Mettre le lien sur ton portfolio

1. Copie l’URL finale de ton site Vercel (ex. `https://postforge-abc123.vercel.app` ou ton domaine personnalisé).
2. Ouvre le projet de ton **portfolio** (le site où tu listes tes projets).
3. Dans la section “Projets” (ou équivalent), ajoute une nouvelle carte / ligne pour **PostForge** :
   - **Titre** : PostForge (ou “Blog PostForge”, etc.).
   - **Lien** : l’URL Vercel.
   - **Description** : par ex. “Blog minimaliste avec articles, commentaires, likes et auth (Next.js, Prisma, NextAuth).”
   - **Technos** : Next.js, Prisma, NextAuth, Tailwind, etc.
4. Sauvegarde et déploie ton portfolio si besoin.

Tu peux aussi ajouter un bouton “Voir le projet” ou une icône lien qui pointe vers cette URL.

---

## Résumé des URLs à retenir

- **Vercel** : [vercel.com](https://vercel.com) → ton projet → onglet **Deployments** ou **Domains** pour l’URL.
- **Variables d’environnement** : **Settings** → **Environment Variables**.
- Après chaque modification des variables, un **Redeploy** peut être nécessaire pour que les changements soient pris en compte.

Si tu veux un **nom de domaine personnalisé** (ex. `postforge.tondomaine.com`), tu peux l’ajouter dans **Settings** → **Domains** et suivre les instructions Vercel.
