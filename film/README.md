# Film Uploader Ultra-Sécurisé

Ce projet permet d'uploader des vidéos (max 5 Go) dans un environnement ultra-sécurisé.

## Fonctionnalités principales
- Authentification avec 2FA (Google Authenticator)
- Upload de vidéos (max 5 Go, formats vidéo uniquement)
- Stockage local sécurisé
- Sécurité titanesque (voir plus bas)

## Prérequis
- Node.js >= 18
- npm
- Un hébergement compatible Node.js (VPS, mutualisé avec Node, etc.)

## Installation
1. Clonez le repo sur votre serveur :
   ```
   git clone ...
   cd film
   ```
2. Copiez le fichier `.env.example` en `.env` et remplissez-le :
   ```
   cp .env.example .env
   ```
3. Installez les dépendances :
   ```
   npm install
   ```
4. Lancez le serveur :
   ```
   npm start
   ```

## Sécurité
- Toutes les routes sont protégées (auth + 2FA)
- Upload limité à 5 Go, scan antivirus, vérification MIME
- Headers HTTP sécurisés (CSP, HSTS, etc.)
- Rate limiting, logs, brute force protection
- Secrets dans `.env` (jamais versionné)

## Déploiement
- Déployez le code via SFTP/FTPS
- Les vidéos sont stockées dans le dossier `uploads` (non accessible publiquement)

## Pour toute question, contactez l'auteur. 