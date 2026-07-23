# Smart Resources

Application web full-stack de gestion et de supervision de ressources, principalement l’eau et l’électricité.

Smart Resources permet de centraliser les compteurs, suivre les consommations, détecter les anomalies, gérer les alertes, visualiser les équipements sur une carte interactive et consulter les événements de sécurité.

---

## Sommaire

1. [Description du projet](#1-description-du-projet)
2. [Fonctionnalités principales](#2-fonctionnalités-principales)
3. [Cas d’utilisation](#3-cas-dutilisation)
4. [Membres du projet](#4-membres-du-projet)
5. [Architecture globale](#5-architecture-globale)
6. [Technologies utilisées](#6-technologies-utilisées)
7. [Organisation du code source](#7-organisation-du-code-source)
8. [Conventions de développement](#8-conventions-de-développement)
9. [Gestion Git et travail collaboratif](#9-gestion-git-et-travail-collaboratif)
10. [Installation et lancement](#10-installation-et-lancement)
11. [Gestion des erreurs et expérience utilisateur](#11-gestion-des-erreurs-et-expérience-utilisateur)
12. [Validation des données](#12-validation-des-données)
13. [Sécurité](#13-sécurité)
14. [Tests et intégration continue](#14-tests-et-intégration-continue)
15. [Compatibilité multiplateforme](#15-compatibilité-multiplateforme)
16. [Accessibilité](#16-accessibilité)
17. [Gestion de la configuration](#17-gestion-de-la-configuration)
18. [Conteneurisation](#18-conteneurisation)
19. [Documentation et maintenance](#19-documentation-et-maintenance)
20. [Démonstration vidéo](#20-démonstration-vidéo)
21. [État actuel et améliorations prévues](#21-état-actuel-et-améliorations-prévues)

---

## 1. Description du projet

### 1.1 Contexte

La gestion de la consommation d’eau et d’électricité nécessite une vision centralisée, fiable et facile à exploiter. Les relevés provenant de plusieurs compteurs doivent pouvoir être consultés, comparés et surveillés afin d’identifier rapidement une consommation excessive, une fuite potentielle ou une anomalie.

Smart Resources répond à ce besoin au moyen d’une plateforme web sécurisée réunissant la supervision des compteurs, l’analyse des consommations, la gestion des alertes et la traçabilité des opérations.

### 1.2 Objectifs

Les principaux objectifs du projet sont :

- centraliser les compteurs d’eau et d’électricité ;
- consulter les relevés et les indicateurs de consommation ;
- calculer des statistiques et des estimations de facturation ;
- détecter et signaler les consommations anormales ;
- configurer et gérer des seuils d’alerte ;
- localiser les compteurs sur une carte interactive ;
- sécuriser l’accès aux données par authentification et autorisation ;
- conserver un journal des événements importants ;
- proposer une interface claire, responsive et simple à utiliser ;
- fournir une API REST documentée et réutilisable.

---

## 2. Fonctionnalités principales

### Authentification et gestion des accès

- inscription d’un utilisateur ;
- connexion et déconnexion ;
- récupération du profil de l’utilisateur connecté ;
- protection des routes privées ;
- gestion de rôles : `ADMIN`, `MANAGER` et `RESIDENTIAL`.

### Tableau de bord

- nombre total de compteurs ;
- consommation totale ;
- consommation moyenne par compteur ;
- nombre d’alertes actives ;
- graphique de prévision de consommation ;
- estimation des factures d’eau et d’électricité ;
- affichage des derniers compteurs et des alertes récentes.

### Gestion des compteurs

- consultation de la liste des compteurs ;
- recherche par numéro de série ou adresse ;
- création d’un compteur ;
- modification des informations d’un compteur ;
- consultation des détails et des statistiques de consommation ;
- distinction entre les compteurs d’eau et d’électricité.

### Gestion des alertes

- affichage des alertes actives ou résolues ;
- filtrage des alertes ;
- classification par gravité : `LOW`, `MEDIUM`, `HIGH` et `CRITICAL` ;
- résolution d’une alerte ;
- configuration de seuils de consommation.

### Carte interactive

- affichage des compteurs sur une carte OpenStreetMap ;
- navigation, déplacement et zoom ;
- distinction visuelle des compteurs d’eau et d’électricité ;
- indication des compteurs possédant une alerte active ;
- affichage des informations du compteur au clic ;
- filtres : tous, eau, électricité et compteurs avec alerte.

### Sécurité et audit

- journalisation des événements importants ;
- affichage des connexions, échecs, anomalies et actions administratives ;
- accès au journal d’audit réservé aux rôles autorisés.

### Documentation de l’API

- documentation Swagger disponible depuis l’application backend ;
- routes organisées sous le préfixe `/api/v1`.

---

## 3. Cas d’utilisation

### Utilisateur non authentifié

- créer un compte ;
- se connecter ;
- consulter les messages d’erreur liés à l’authentification.

### Utilisateur authentifié

- consulter le tableau de bord ;
- afficher les compteurs et leurs détails ;
- rechercher un compteur ;
- consulter les consommations et les estimations ;
- afficher les alertes ;
- consulter la carte interactive ;
- se déconnecter.

### Gestionnaire ou administrateur

- gérer les compteurs ;
- configurer les seuils ;
- résoudre les alertes ;
- consulter les journaux d’audit ;
- superviser les anomalies et les événements de sécurité.

> Les autorisations exactes doivent rester cohérentes entre l’interface utilisateur et les règles RBAC appliquées par l’API.

---

## 4. Membres du projet

Le projet a été réalisé de manière collaborative. Chaque membre a participé au développement front-end, à l’intégration avec le back-end, aux tests et à la documentation, avec une responsabilité principale sur certaines parties.

| Membre | Rôle principal | Responsabilités et contributions principales |
|---|---|---|
| Yahya MORABET — `YahyaM15` | Développeur full-stack — API et données | Conception de l’architecture générale, développement des routes et services Express, modélisation Prisma, gestion de PostgreSQL, authentification et autorisation, intégration des API avec le front-end, configuration Swagger, Docker et participation aux tests de l’application |
| Zineb CHAFIK — `ZinebChafik` | Développeuse full-stack — interfaces et fonctionnalités métier | Conception des interfaces React, réalisation du tableau de bord et des pages de gestion, intégration des données provenant de l’API, gestion des formulaires et des états utilisateur, participation à la validation des données, aux tests des fonctionnalités et à l’amélioration de l’expérience utilisateur |
| Mohammed KEHAL — `mohammedkehal` | Développeur full-stack — cartographie et qualité logicielle | Intégration de Leaflet et OpenStreetMap, développement de la carte et des filtres interactifs, exploitation des données fournies par les API, correction de la compatibilité Vite, gestion des erreurs d’affichage, tests de compilation, maintenance Git et amélioration de la documentation générale |

### Organisation du travail

Les responsabilités ont été réparties de façon complémentaire :

- développement et intégration des composants front-end ;
- conception et consommation des routes back-end ;
- gestion et validation des données ;
- tests fonctionnels et vérification des compilations ;
- résolution des erreurs techniques ;
- utilisation de Git, des branches et des Pull Requests ;
- documentation et préparation de la démonstration.

---

## 5. Architecture globale

Le projet adopte une architecture client–serveur avec séparation des préoccupations :

- le **front-end** est responsable de l’affichage, de la navigation et des interactions ;
- le **back-end** contient les règles métier, la sécurité, la validation et l’accès aux données ;
- **PostgreSQL** assure la persistance ;
- **Prisma ORM** constitue la couche d’accès à la base de données ;
- l’échange entre le client et le serveur se fait via une API REST en JSON.

```mermaid
flowchart LR
    U[Utilisateur] --> B[Navigateur Web]

    subgraph FRONT[Front-end]
        B --> R[React + TypeScript]
        R --> UI[Tailwind CSS]
        R --> MAP[React Leaflet / OpenStreetMap]
        R --> AX[Axios]
    end

    AX -->|HTTPS / JSON| API

    subgraph BACK[Back-end]
        API[API REST Express]
        API --> MID[Middlewares<br/>Authentification · RBAC · Validation · Erreurs]
        MID --> CTRL[Contrôleurs]
        CTRL --> SERV[Services métier]
        SERV --> DAO[DAO]
        DAO --> PRISMA[Prisma ORM]
    end

    PRISMA --> DB[(PostgreSQL)]
    API --> SWAGGER[Swagger UI]
```

### Flux simplifié d’une requête

1. L’utilisateur réalise une action dans l’interface React.
2. Axios envoie une requête HTTP à l’API.
3. Les middlewares vérifient l’authentification, les autorisations et les données.
4. Le contrôleur transmet le traitement au service métier.
5. Le service utilise un DAO et Prisma pour accéder à PostgreSQL.
6. L’API retourne une réponse JSON normalisée.
7. Le front-end affiche le résultat, un état de chargement ou un message d’erreur.

---

## 6. Technologies utilisées

### Front-end

| Technologie | Utilisation et justification |
|---|---|
| React 18 | Construction d’une interface en composants réutilisables |
| TypeScript | Typage statique et réduction des erreurs de développement |
| Vite | Serveur de développement rapide et compilation optimisée |
| React Router | Navigation entre les pages sans rechargement complet |
| Axios | Communication avec l’API REST et gestion centralisée des erreurs HTTP |
| Tailwind CSS | Mise en page responsive et cohérence visuelle |
| Recharts | Graphiques de consommation et de prévision |
| Lucide React | Icônes homogènes et légères |
| Leaflet / React Leaflet | Carte interactive et affichage des compteurs |
| OpenStreetMap | Fond cartographique libre avec attribution |

### Back-end

| Technologie | Utilisation et justification |
|---|---|
| Node.js | Environnement d’exécution JavaScript côté serveur |
| Express | Création de l’API REST et organisation des routes/middlewares |
| TypeScript | Typage des contrôleurs, services et données |
| Prisma ORM | Modélisation des données et accès sécurisé à PostgreSQL |
| PostgreSQL | Base relationnelle robuste pour les utilisateurs, compteurs, relevés et alertes |
| Zod | Validation des données reçues par l’API |
| JSON Web Token | Authentification stateless et protection des routes |
| Argon2 | Hachage sécurisé des mots de passe |
| Helmet | Ajout d’en-têtes HTTP de sécurité |
| CORS | Restriction des origines autorisées |
| Swagger / OpenAPI | Documentation interactive de l’API |
| Jest et Supertest | Tests automatisés du comportement HTTP |

### Outils et déploiement

- Git et GitHub ;
- Docker Desktop ;
- Docker Compose ;
- Visual Studio Code ;
- npm.

---

## 7. Organisation du code source

```text
Projet_Dev_Web-YZS/
│
├── .github/
│   └── ...
│
├── client/
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   ├── context/          # Contexte d’authentification
│   │   ├── hooks/            # Hooks personnalisés
│   │   ├── pages/            # Pages de l’application
│   │   ├── services/         # Appels Axios vers l’API
│   │   ├── types/            # Types et interfaces TypeScript
│   │   ├── App.tsx           # Routes principales
│   │   ├── index.css         # Styles globaux
│   │   └── main.tsx          # Point d’entrée React
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/
│   ├── prisma/
│   │   ├── migrations/       # Historique du schéma PostgreSQL
│   │   ├── schema.prisma     # Modèles de données
│   │   └── seed.ts           # Données initiales
│   ├── src/
│   │   ├── config/           # Swagger et configuration
│   │   ├── controllers/      # Couche HTTP
│   │   ├── dao/              # Accès aux données
│   │   ├── errors/           # Classes d’erreur
│   │   ├── middlewares/      # Auth, RBAC, validation, erreurs
│   │   ├── routes/           # Routes REST
│   │   ├── schemas/          # Schémas Zod
│   │   ├── services/         # Règles métier
│   │   ├── app.ts            # Configuration Express
│   │   └── index.ts          # Démarrage du serveur
│   ├── tests/                # Tests Jest/Supertest
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

### Séparation des responsabilités côté back-end

- **Routes** : définissent les URL et les middlewares.
- **Contrôleurs** : lisent la requête et produisent la réponse HTTP.
- **Services** : appliquent les règles métier.
- **DAO** : centralisent les opérations de lecture et d’écriture.
- **Prisma** : communique avec PostgreSQL.
- **Schémas Zod** : contrôlent les données entrantes.
- **Middlewares** : assurent la sécurité, la validation et la gestion des erreurs.

---

## 8. Conventions de développement

### Nommage

- composants React : `PascalCase`, par exemple `ConfirmDialog.tsx` ;
- fonctions et variables : `camelCase` ;
- types et interfaces : `PascalCase` ;
- routes API : noms de ressources au pluriel ;
- branches Git : `type/description-membre` ;
- fichiers back-end : noms explicites par couche, par exemple `auth.service.ts`.

### Messages de commit

Le projet utilise des messages proches de Conventional Commits :

```text
feat(map): ajouter des filtres interactifs
fix(frontend): corriger la compatibilité Vite
docs: compléter le README
test(auth): ajouter un test de validation
chore(git): ignorer les fichiers temporaires
```

### Qualité du code

- utilisation de TypeScript côté client et serveur ;
- séparation des couches ;
- composants réutilisables ;
- fonctions courtes et nommées explicitement ;
- centralisation des appels API ;
- gestion centralisée des erreurs back-end ;
- vérification de compilation avant fusion.

---

## 9. Gestion Git et travail collaboratif

### Branches principales

- `main` : version stable ou livrable final ;
- `develop` : branche d’intégration ;
- `feature/...` : développement d’une fonctionnalité ;
- `fix/...` : correction d’un problème ;
- `docs/...` : documentation ;
- `test/...` : ajout ou modification de tests.

### Stratégie de synchronisation

Avant de commencer une contribution :

```bash
git switch develop
git pull origin develop
git switch -c feature/nom-fonctionnalite
```

Après développement et vérification :

```bash
git add .
git commit -m "feat: description claire"
git push -u origin feature/nom-fonctionnalite
```

La contribution est ensuite intégrée par Pull Request :

```text
feature/... → develop
```

La Pull Request doit être relue, testée et dépourvue de conflits avant fusion.

### Bonnes pratiques

- ne pas développer directement dans `main` ;
- éviter les commits sans objectif ;
- réaliser des commits cohérents et limités à une modification ;
- récupérer régulièrement les changements de `develop` ;
- résoudre les conflits localement puis relancer les tests ;
- ne jamais versionner `.env`, `node_modules`, `dist` ou les fichiers temporaires.

---

## 10. Installation et lancement

### 10.1 Prérequis

- Git ;
- Node.js 20 ou version supérieure ;
- npm ;
- Docker Desktop ;
- navigateur récent.

Vérification :

```bash
git --version
node --version
npm --version
docker --version
```

### 10.2 Cloner la branche de développement

```bash
git clone -b develop https://github.com/YahyaM15/Projet_Dev_Web-YZS.git
cd Projet_Dev_Web-YZS
```

### 10.3 Démarrer PostgreSQL avec Docker

À la racine du projet :

```bash
docker compose up -d database
docker compose ps
```

### 10.4 Configurer et lancer le back-end

Dans un deuxième terminal :

```bash
cd server
```

Sous Windows PowerShell :

```powershell
Copy-Item .env.example .env -Force
```

Sous Linux ou macOS :

```bash
cp .env.example .env
```

Installer et initialiser :

```bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

L’API est accessible sur :

```text
http://localhost:5000
```

Swagger UI :

```text
http://localhost:5000/api-docs
```

### 10.5 Lancer le front-end

Dans un troisième terminal :

```bash
cd client
npm install
npm run dev
```

Application :

```text
http://localhost:3000
```

Carte :

```text
http://localhost:3000/map
```

### 10.6 Compte de démonstration

```text
Email : admin@example.com
Mot de passe : TestPassword123!
```

> Ces identifiants sont réservés à l’environnement local de démonstration. Ils ne doivent pas être utilisés en production.

### 10.7 Arrêter le projet

Arrêter les serveurs Node.js avec `Ctrl + C`, puis :

```bash
docker compose down
```

Pour supprimer également les données PostgreSQL locales :

```bash
docker compose down -v
```

---

## 11. Gestion des erreurs et expérience utilisateur

### Côté front-end

L’interface utilise plusieurs mécanismes :

- intercepteur Axios pour traiter les réponses HTTP ;
- redirection vers `/login` lorsqu’une session n’est plus valide ;
- messages d’erreur sur les formulaires ;
- notifications de succès ou d’échec ;
- squelettes pendant le chargement ;
- états vides lorsqu’aucune donnée n’existe ;
- désactivation des boutons pendant une opération ;
- boîte de confirmation avant une action sensible ;
- messages explicites lorsque l’API est indisponible ;
- compteur du nombre de résultats visibles sur la carte.

### Côté back-end

- gestionnaire global des erreurs ;
- réponses JSON cohérentes ;
- codes HTTP adaptés ;
- gestion des erreurs de validation ;
- traitement des erreurs JWT ;
- traitement des erreurs Prisma ;
- masquage des détails internes lors d’une erreur serveur.

Format général d’une erreur :

```json
{
  "success": false,
  "message": "Description de l’erreur"
}
```

En cas de validation :

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "path": "email",
      "message": "Invalid email address",
      "code": "invalid_format"
    }
  ]
}
```

---

## 12. Validation des données

### Validation côté back-end

Zod contrôle notamment :

- le format des adresses e-mail ;
- la robustesse minimale du mot de passe ;
- le nom complet ;
- les rôles autorisés ;
- le type de compteur ;
- le numéro de série ;
- l’adresse ;
- les identifiants UUID ;
- les valeurs de consommation positives ;
- les seuils d’alerte ;
- les filtres d’alertes.

Les données invalides sont refusées avant l’exécution des services métier.

### Validation côté front-end

Le client utilise actuellement :

- les types HTML adaptés : `email`, `password`, etc. ;
- les champs obligatoires ;
- des contrôles avant soumission ;
- l’affichage des erreurs renvoyées par l’API ;
- TypeScript pour contrôler les structures de données.

### Amélioration recommandée

Afin d’obtenir une validation identique des deux côtés, le front-end peut être renforcé par :

- Zod ;
- React Hook Form ;
- messages champ par champ ;
- contrôle des formats et contraintes avant l’envoi.

---

## 13. Sécurité

### Mesures mises en place

#### Authentification

- JWT signé avec une variable `JWT_SECRET` ;
- durée de validité du token ;
- token accepté depuis un cookie ou l’en-tête `Authorization` ;
- cookie `httpOnly` ;
- cookie `secure` en production ;
- politique `SameSite`.

#### Mots de passe

- hachage avec Argon2 ;
- absence de stockage en clair ;
- politique minimale lors de l’inscription :
  - huit caractères minimum ;
  - une minuscule ;
  - une majuscule ;
  - un chiffre ;
  - un caractère spécial.

#### Autorisation

- middleware d’authentification ;
- contrôle des rôles RBAC ;
- journal d’audit réservé aux rôles `ADMIN` et `MANAGER`.

#### Protection de l’API

- Helmet pour les en-têtes HTTP ;
- CORS limité aux origines locales autorisées ;
- validation Zod ;
- Prisma pour limiter les requêtes SQL construites manuellement ;
- gestion centralisée des erreurs ;
- documentation des routes via Swagger.

#### Protection des données sensibles

- variables sensibles dans `.env` ;
- modèle `.env.example` sans secret réel ;
- `.env` ignoré par Git ;
- secret JWT à remplacer par une valeur longue et aléatoire.

### Risques et améliorations à finaliser

- vérifier que le rate limiter est appliqué sur les routes d’authentification ;
- ajouter une protection CSRF dédiée si l’authentification repose principalement sur les cookies ;
- ne jamais utiliser les secrets de démonstration en production ;
- ajouter une politique stricte de rotation des secrets ;
- limiter davantage certaines opérations selon le rôle ;
- ajouter des tests de sécurité et un audit des dépendances ;
- utiliser HTTPS en production ;
- configurer précisément la Content Security Policy selon l’environnement ;
- éviter d’exposer Swagger publiquement sans contrôle dans un déploiement sensible.

---

## 14. Tests et intégration continue

### Tests existants

Le back-end utilise Jest et Supertest. Les tests présents vérifient notamment :

- le rejet d’une inscription avec une adresse e-mail invalide ;
- le rejet d’une connexion avec des identifiants incorrects.

Exécution :

```bash
cd server
npm test
```

### Vérification des compilations

Back-end :

```bash
cd server
npm run build
```

Front-end :

```bash
cd client
npm run build
```

### Tests à compléter

- tests unitaires des services métier ;
- tests des DAO avec une base isolée ;
- tests d’intégration des compteurs ;
- tests d’intégration des alertes ;
- tests des rôles et permissions ;
- tests frontend des composants et formulaires ;
- tests end-to-end des principaux scénarios ;
- tests de compatibilité et d’accessibilité.

### Intégration continue

La pipeline CI attendue sur GitHub Actions doit au minimum :

1. récupérer le dépôt ;
2. installer les dépendances du client ;
3. compiler le client ;
4. installer les dépendances du serveur ;
5. générer Prisma ;
6. compiler le serveur ;
7. exécuter les tests ;
8. échouer si une étape ne passe pas.

> Au moment de la livraison, vérifier qu’un fichier tel que `.github/workflows/ci.yml` est bien présent. Ne pas annoncer une CI opérationnelle tant que le workflow n’a pas été ajouté et exécuté avec succès.

---

## 15. Compatibilité multiplateforme

### Environnements visés

- Windows 10 et 11 ;
- Linux ;
- macOS ;
- Docker Desktop ;
- Chrome ;
- Microsoft Edge ;
- Firefox ;
- Safari récent.

### Responsive design

Tailwind CSS permet d’adapter les grilles, formulaires, tableaux et composants à plusieurs largeurs d’écran.

Les tests doivent couvrir au minimum :

| Appareil | Largeur indicative | Vérification |
|---|---:|---|
| Smartphone | 320–480 px | Navigation, formulaires, boutons, absence de débordement |
| Tablette | 768–1024 px | Grilles, carte, tableaux |
| Ordinateur | 1280 px et plus | Tableau de bord complet et navigation |
| Grand écran | 1920 px | Répartition des espaces et lisibilité |

### Points à vérifier avant livraison

- menu latéral sur petit écran ;
- tableaux horizontalement défilables ;
- carte utilisable sur écran tactile ;
- compatibilité Safari ;
- absence de contenu coupé ;
- zoom du navigateur à 200 %.

---

## 16. Accessibilité

Les principes appliqués ou visés sont :

- contraste suffisant entre le texte et le fond ;
- libellés visibles pour les formulaires ;
- boutons utilisables au clavier ;
- indication visuelle du focus ;
- icônes accompagnées d’un texte lorsque nécessaire ;
- messages d’erreur explicites ;
- hiérarchie logique des titres ;
- tailles de texte lisibles ;
- zones cliquables suffisamment grandes ;
- ne pas transmettre une information uniquement par la couleur.

### Améliorations recommandées

- ajouter `aria-label` aux boutons composés uniquement d’une icône ;
- définir les rôles ARIA des boîtes modales et notifications ;
- gérer le focus lors de l’ouverture et de la fermeture d’une modale ;
- tester toute l’application au clavier ;
- tester avec NVDA ou VoiceOver ;
- réaliser un audit Lighthouse ou WAVE ;
- fournir une alternative accessible aux données cartographiques.

---

## 17. Gestion de la configuration

Le serveur utilise les variables suivantes :

```env
PORT=5000
DATABASE_URL="postgresql://smart_user:smart_password@localhost:5432/smart_resources?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
NODE_ENV=development
```

Le client peut utiliser :

```env
VITE_API_URL=/api/v1
```

Règles :

- `.env.example` est versionné ;
- `.env` ne doit jamais être versionné ;
- les secrets de production sont stockés dans le gestionnaire de secrets de la plateforme ;
- les environnements développement, test et production utilisent des configurations séparées ;
- aucune clé sensible ne doit être écrite directement dans le code ;
- les valeurs par défaut de démonstration doivent être remplacées en production.

---

## 18. Conteneurisation

Le fichier `docker-compose.yml` orchestre actuellement :

- le back-end Node.js/Express ;
- PostgreSQL 16 ;
- un volume persistant pour les données ;
- un contrôle de santé de PostgreSQL ;
- la dépendance du back-end envers la base de données.

Lancement :

```bash
docker compose up --build
```

Arrière-plan :

```bash
docker compose up -d --build
```

Vérification :

```bash
docker compose ps
docker compose logs -f
```

Arrêt :

```bash
docker compose down
```

### Limites actuelles

- le front-end n’est pas encore défini comme service Docker ;
- les secrets Docker de démonstration doivent être remplacés ;
- Kubernetes n’est pas mis en place ;
- les images doivent être testées avant livraison sur les plateformes visées.

### Améliorations possibles

- ajouter un Dockerfile pour le client ;
- servir le build React avec Nginx ;
- ajouter un reverse proxy ;
- utiliser des secrets injectés à l’exécution ;
- ajouter des profils développement/production ;
- publier les images dans un registre ;
- préparer des manifests Kubernetes si le bonus est poursuivi.

---

## 19. Documentation et maintenance

### Documentation disponible

- présent README ;
- Swagger UI pour l’API ;
- schéma Prisma ;
- commentaires sur les parties complexes ;
- historique Git et Pull Requests.

### Procédure de mise à jour

```bash
git switch develop
git pull origin develop
npm install
```

Après une modification du schéma Prisma :

```bash
cd server
npx prisma generate
npx prisma db push
```

Pour les migrations destinées à être versionnées :

```bash
npx prisma migrate dev --name description_migration
```

### Maintenance régulière

```bash
npm outdated
npm audit
```

Avant une livraison :

```bash
cd client
npm run build

cd ../server
npm run build
npm test
```

Les mises à jour majeures doivent être réalisées dans une branche séparée et accompagnées de tests.

---

## 20. Démonstration vidéo

Lien vers la démonstration :

```text
https://drive.google.com/drive/folders/1g-nGFSXrg1KeW9gsnS0S_HsKnNTW4drq?usp=sharing
```

La vidéo montre :

1. l’inscription ou la connexion ;
2. le tableau de bord ;
3. la liste des compteurs ;
4. les détails d’un compteur ;
5. la carte OpenStreetMap ;
6. les filtres de la carte ;
7. les alertes ;
8. la résolution d’une alerte ;
9. la page Sécurité et Audit ;
10. Swagger UI ;
11. le lancement du projet dans les terminaux.

---

## 21. État actuel et améliorations prévues

| Domaine | État |
|---|---|
| Architecture front-end/back-end séparée | Réalisé |
| Authentification JWT | Réalisé |
| Hachage Argon2 | Réalisé |
| Validation back-end Zod | Réalisé |
| Tableau de bord | Réalisé |
| Gestion des compteurs | Réalisé |
| Gestion des alertes | Réalisé |
| Journal d’audit | Réalisé |
| Carte OpenStreetMap | Réalisé |
| Filtres cartographiques | Réalisé |
| Swagger | Réalisé |
| Docker back-end + PostgreSQL | Réalisé |
| Tests back-end de base | Partiel |
| Tests frontend | À ajouter |
| Validation avancée front-end | À renforcer |
| Pipeline GitHub Actions | À vérifier ou à ajouter |
| Protection CSRF dédiée | À ajouter selon le mode d’authentification |
| Audit complet d’accessibilité | À réaliser |
| Responsive mobile complet | À vérifier et améliorer |
| Conteneurisation du front-end | À ajouter |
| Kubernetes | Bonus non réalisé |
| Vidéo de démonstration | Lien à ajouter |

---


