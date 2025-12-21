# 🚀 Guide de Déploiement Vercel - Mon Rempart

## 1. Configuration Vercel

### Root Directory
Dans l'interface Vercel, configurez :
```
Root Directory: web
```

### Framework Preset
```
Framework: Next.js
```

### Build & Output Settings
```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

---

## 2. Variables d'Environnement

Ajoutez ces variables dans **Settings > Environment Variables** :

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase | ✅ Oui |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (anon) Supabase | ✅ Oui |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service (privée) - API côté serveur | ⚠️ Recommandé |

### Où trouver ces clés ?
1. Allez sur [supabase.com](https://supabase.com)
2. Ouvrez votre projet
3. **Settings > API**
4. Copiez les valeurs

---

## 3. Déploiement

### Option A : Via GitHub (Recommandé)
1. Connectez votre repo GitHub à Vercel
2. Vercel détecte automatiquement le monorepo
3. Configurez le **Root Directory** sur `web`
4. Ajoutez les variables d'environnement
5. **Deploy** 🚀

### Option B : Via CLI
```bash
cd web
npx vercel
```

---

## 4. Après le Déploiement

### Configurez Supabase
1. Allez dans **Supabase > Authentication > URL Configuration**
2. Ajoutez votre domaine Vercel dans **Site URL** :
   ```
   https://votre-projet.vercel.app
   ```
3. Ajoutez-le aussi dans **Redirect URLs**

### Testez
- [ ] Page d'accueil charge correctement
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Agents s'affichent (si configurés)

---

## 5. Domaine Personnalisé (Optionnel)

1. **Vercel > Settings > Domains**
2. Ajoutez votre domaine (ex: `mon-rempart.fr`)
3. Configurez les DNS chez votre registrar :
   ```
   Type: CNAME
   Nom: @
   Valeur: cname.vercel-dns.com
   ```

---

## 📝 Notes

- Le fichier `vercel.json` ignore les modifications du dossier `agent/`
- Seuls les changements dans `web/` déclenchent un redéploiement
- Le build prend environ 30-60 secondes

---

## 🆘 Problèmes Courants

| Erreur | Solution |
|--------|----------|
| `Module not found` | Vérifiez les imports, relancez le build local |
| `Environment variable not found` | Ajoutez les variables dans Vercel |
| `Auth redirect error` | Configurez l'URL dans Supabase |

---

**Bonne mise en production ! 🛡️**
