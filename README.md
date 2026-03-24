[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/ymdhk8vP)

# NutriGuide
**Ethan Touitou**
## Présentation
NutriGuide est un site web autour de la nutrition qui permet de :
- consulter des aliments et leurs valeurs nutritionnelles
- parcourir des recettes selon des régimes ou des objectifs nutritionnels
- utiliser un calculateur IMC / calories
- suivre son profil et ses repas
- administrer les contenus depuis un backoffice

Le projet a été réalisé avec Astro, Tailwind CSS et PocketBase.

Lien du site : https://nutriguide.ethantouitou.fr

## Stack technique
- `Astro`
- `Tailwind CSS`
- `PocketBase`
- `Node.js`

## Fonctionnalités principales
- page d’accueil reliée aux données PocketBase
- pages régimes, aliments, recettes et conseils
- pages dynamiques :
  - `/aliments/[id]`
  - `/recettes/[id]`
  - `/regimes/[id]`
  - `/recettes/regime/[slug]`
  - `/recettes/objectif/[slug]`
- recherche d’aliments et de recettes
- espace utilisateur :
  - connexion / création de compte
  - profil
  - calculateur IMC et calories journalières
  - suivi des repas
- backoffice admin :
  - connexion admin
  - ajout d’aliments
  - ajout de recettes
  - ajout des ingrédients liés aux recettes

## Base de données
Le projet utilise PocketBase avec plusieurs collections, notamment :
- `foods`
- `recipes`
- `recipe_ingredients`
- `diet_types`
- `nutrition_goals`
- `articles`
- `sponsored_links`
- `users`
- `meal_logs`

## Lancement en local
Installer les dépendances :

```bash
npm install
```

Lancer le projet :

```bash
npm run dev
```

Build de production :

```bash
npm run build
```

Prévisualisation :

```bash
npm run preview
```

## Variables d’environnement utiles
Exemple de configuration :

```env
SITE_URL=https://nutriguide.ethantouitou.fr
PB_URL=https://nutriguide.ethantouitou.fr
PUBLIC_PB_URL=https://nutriguide.ethantouitou.fr
```

Selon le déploiement, le site peut lire PocketBase :
- soit via l’API distante
- soit via la base locale en développement

## Organisation du projet
```text
src/
├── components/      composants réutilisables
├── layouts/         layout principal
├── lib/             logique PocketBase / helpers
├── pages/           pages Astro et routes API
│   └── api/admin/   routes utilisées par le backoffice
public/              assets statiques
backend/             PocketBase local et migrations
```

## Utilisation de l’IA
L’IA a été utilisée comme assistant de développement pour :
- accélérer certaines tâches de code
- aider à brancher PocketBase et le MCP
- proposer des corrections ciblées
- générer des idées de structure ou de petites transformations techniques

Je ne donne pas ici les prompts qui ont servi à faire des pages entières, mais seulement quelques exemples de petits prompts techniques réellement utilisés.

## Exemples de prompts utilisés
### Prompts code
- `Corrige le calculateur de portions pour que les quantites d ingredients et les kcal totales se recalculent selon le nombre de parts.`
- `Fais la route dynamique [slug] pour filtrer les recettes selon le regime selectionne.`
- `Ajoute un menu hamburger propre sur mobile sans casser la navigation desktop.`

### Prompts liés au MCP / PocketBase
- `Peux-tu me créer la collection recipe_ingredients avec recipe, food, quantity, unit et notes ?`
- `Ajoute diet_types et nutrition_goals dans PocketBase puis relie-les aux recettes et aliments existants.`
- `Remplace les images des collections foods et recipes par de vraies images plus cohérentes.`
- `Ajoute plusieurs recettes et aliments liés aux recettes dans PocketBase avec leurs relations.`

