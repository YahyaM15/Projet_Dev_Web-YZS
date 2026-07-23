# Smart Resources API

Backend Express, Prisma et TypeScript destiné au client Frontend.

## Prérequis

- Node.js 20+ et npm
- PostgreSQL 16+ pour l'exécution locale, ou Docker Desktop pour l'environnement conteneurisé

Créez votre configuration locale à partir de [server/.env.example](server/.env.example) :

```bash
cd server
copy .env.example .env
npm install
```

`DATABASE_URL` définit la connexion PostgreSQL, `JWT_SECRET` doit être un secret long et aléatoire, et `PORT` vaut `5000` par défaut. Ne versionnez jamais `.env`.

## Lancer le projet

En développement :

```bash
cd server
npm run dev
```

Avec Docker (API et PostgreSQL) :

```bash
docker compose up
```

Ajoutez `--build` lors de la première exécution ou après une modification du Dockerfile.

L'API est alors disponible sur `http://localhost:5000` et Swagger UI sur [http://localhost:5000/api-docs](http://localhost:5000/api-docs).

## Authentification Frontend

Après un `POST /api/v1/auth/login`, le token est renvoyé dans `data.token` (et placé dans un cookie HTTP-only). Pour les requêtes API protégées, transmettez-le ainsi :

```http
Authorization: Bearer <token>
```

Les routes sont préfixées par `/api/v1` : par exemple `POST /api/v1/auth/register`, `POST /api/v1/auth/login` et `GET /api/v1/resources`.

## Vérifications

```bash
cd server
npm run build
npm test
```
