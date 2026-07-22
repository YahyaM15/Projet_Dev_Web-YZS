# CONSIGNES ARCHITECTURE ET SÉCURITÉ - MASTER 2I2S

Projet : Plateforme Web de Gestion Intelligente des Ressources (Eau / Électricité).
Équipe : Yahia Morabet (Tech Lead & DAO/Services), Zineb Chefik (Views/UI), Mohammed El Kehal (Controllers/DevOps).

## ARCHITECTURE EN 4 COUCHES DÉCOUPLÉES
1. Views Layer (`client/src/views/`) : React 18 + TypeScript + TailwindCSS.
2. Controllers Layer (`server/src/controllers/`) : Routes REST Express.js + validation DTO (Zod) + gestion des erreurs.
3. Services Layer (`server/src/services/`) : Logique métier (calculs d'index chronologique, détection de fuites/surconsommation).
4. DAO Layer (`server/src/dao/`) : Accès aux données avec Prisma ORM / PostgreSQL.

## SÉCURITÉ
- Aucun SQL brut concaténé (requêtes paramétrées via DAO).
- Authentification JWT avec cookies HttpOnly.
- Mots de passe hachés avec Argon2id ou Bcrypt.