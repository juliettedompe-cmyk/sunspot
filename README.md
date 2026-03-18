# SunSpot ☀️

> Trouvez une terrasse parisienne en plein soleil — maintenant ou à n'importe quelle heure de la journée.

SunSpot calcule en temps réel l'exposition solaire de 15 terrasses parisiennes à partir de leur orientation (azimut), de la position astronomique du soleil (SunCalc) et d'un algorithme de score géométrique. L'utilisateur peut scrubber l'heure pour anticiper où le soleil sera dans 2 heures, filtrer par niveau d'ensoleillement, et se localiser pour voir les terrasses à proximité.

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Framework | Next.js 15 (App Router, Server Components) |
| UI | React 19, Tailwind CSS 3.4, MapLibre GL 4.7 |
| Langage | TypeScript 5 (mode strict) |
| Base de données | Supabase (PostgreSQL 15 + PostGIS) |
| Calcul solaire | SunCalc 1.9 |
| Tests unitaires | Vitest 2.1 + React Testing Library |
| Tests E2E | Playwright 1.49 |

---

## Architecture MVC

```
src/
├── controllers/     → Validation HTTP (datetime, codes d'erreur 400/500)
├── services/        → Logique métier pure (calcul solaire, filtres, enrichissement)
├── models/          → Accès données (Supabase client, repository, mapping)
├── views/           → Interface React (composants, hooks, MapLibre)
└── types/           → Interfaces TypeScript partagées
```

**Flux d'une requête GET /api/terraces?datetime=…**

```
route.ts → terraceController → terraceService → terraceRepository (Supabase)
                                             ↘ sunService (SunCalc + score)
```

---

## Structure du projet

```
sunspot/
├── e2e/                              # Tests E2E Playwright
│   └── main-flow.spec.ts
├── supabase/
│   └── migrations/
│       ├── 001_create_terraces.sql   # Schéma : table, PostGIS, RLS, trigger
│       └── 002_seed_terraces.sql     # 15 terrasses parisiennes réelles
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── terraces/route.ts     # GET /api/terraces?datetime=<ISO8601>
│   │   │   └── health/route.ts       # GET /api/health
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── controllers/
│   │   └── terraceController.ts
│   ├── services/
│   │   ├── sunService.ts             # Orchestrateur : computeSunInfo()
│   │   ├── sunExposure.ts            # Position solaire, statut, durée restante
│   │   ├── terraceService.ts         # Pipeline d'enrichissement
│   │   ├── terraceFilters.ts         # Filtres primitifs (exposition, distance, durée)
│   │   ├── filterService.ts          # Presets nommés (filterInSunNow, etc.)
│   │   ├── distanceService.ts        # Enrichissement de distance
│   │   ├── distance.ts               # Formule de Haversine (pure)
│   │   └── getSunnyTerraces.ts       # @deprecated — délègue à terraceService
│   ├── models/
│   │   ├── supabaseClient.ts
│   │   ├── terraceRepository.ts      # getAllTerraces() → Terrace[]
│   │   ├── terraceMapping.ts         # TerraceRow → Terrace
│   │   └── terraceRow.ts             # Interface miroir du schéma DB
│   ├── types/
│   │   ├── terrace.ts                # Terrace, TerraceWithSunInfo, SunStatus
│   │   ├── sun.ts                    # SunInfo
│   │   └── filters.ts                # Filters, DEFAULT_FILTERS
│   ├── lib/
│   │   └── popupContent.ts           # Génération HTML popup MapLibre (XSS-safe)
│   └── views/
│       ├── MapView.tsx               # Composant racine (orchestrateur d'état)
│       ├── components/
│       │   ├── FilterBar.tsx         # Chips d'exposition + durée + proximité
│       │   ├── LocationButton.tsx    # Géolocalisation à la demande
│       │   ├── StatusBar.tsx         # Compteur ☀️ N · 🌤 N / N terrasses
│       │   ├── TerraceCard.tsx       # Item de liste
│       │   ├── TerraceDetails.tsx    # Fiche détail (statut, distance, horaires)
│       │   ├── TerraceList.tsx       # Liste scrollable avec états loading/error/empty
│       │   └── TimeSlider.tsx        # Scrubber 00:00–23:45 par pas de 15 min
│       └── hooks/
│           ├── useTerraces.ts        # Fetch /api/terraces (debounce 300 ms)
│           ├── useGeolocation.ts     # watchPosition à la demande (privacy-first)
│           ├── useMapLibre.ts        # Initialisation de la carte
│           ├── useMapMarkers.ts      # Cycle de vie des markers
│           ├── useUserMarker.ts      # Marker de position utilisateur
│           └── useTerraceDistance.ts # Calcul de distance (mémoïsé)
├── .env.example
├── playwright.config.ts
├── vitest.config.ts
├── next.config.ts
└── tailwind.config.ts
```

---

## Setup local

### Prérequis

- Node.js ≥ 20
- npm ≥ 10

### Installation

```bash
git clone git@github.com:juliettedompe-cmyk/sunspot.git
cd sunspot
npm install
```

### Variables d'environnement

Copier le template et renseigner les valeurs :

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase (`https://<ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé publique Supabase (anciennement `anon key`) |

### Connexion au projet Supabase existant

Le projet Supabase est déjà provisionné :

- **Référence projet** : `trmwcrkwbdjzvtyopmrc`
- **URL** : `https://trmwcrkwbdjzvtyopmrc.supabase.co`

Récupérer la publishable key dans **Project Settings → API → Project API keys**.

`.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=https://trmwcrkwbdjzvtyopmrc.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<votre-clé-ici>
```

### Appliquer les migrations (première fois)

Si la table `terraces` n'existe pas encore dans votre projet Supabase :

```bash
# Via la CLI Supabase (si installée)
supabase db push

# Ou manuellement dans l'éditeur SQL Supabase :
# 1. Coller le contenu de supabase/migrations/001_create_terraces.sql
# 2. Coller le contenu de supabase/migrations/002_seed_terraces.sql
```

### Lancement

```bash
npm run dev        # Serveur de développement → http://localhost:3000
npm run build      # Build de production
npm run start      # Serveur de production (après build)
npm run lint       # ESLint
```

---

## Seed

Le fichier `supabase/migrations/002_seed_terraces.sql` insère 15 terrasses parisiennes réelles avec leurs coordonnées GPS, orientations et horaires d'ouverture :

| Terrasse | Arrondissement | Orientation |
|----------|---------------|-------------|
| Café de Flore | 6e | 195° (SSO) |
| Les Deux Magots | 6e | 180° (S) |
| Le Consulat | 18e | 200° (SSO) |
| Café de la Paix | 9e | 180° (S) |
| Rosa Bonheur sur Seine | 7e | 180° (S) |
| Chez Prune | 10e | 225° (SO) |
| Café Marly | 1er | 270° (O) |
| Brasserie Lipp | 6e | 0° (N) |
| Terrasse de la Sainte-Chapelle | 1er | 270° (O) |
| Le Grand Véfour | 1er | 90° (E) |
| Café Procope | 6e | 90° (E) |
| Pavillon de la Fontaine | 6e | 135° (SE) |
| Le Baron Rouge | 12e | 90° (E) |
| Café des Anges | 11e | 180° (S) |
| Terrasse du Parc de Belleville | 20e | 315° (NO) |

---

## Stratégie de tests

### Tests unitaires (Vitest)

```bash
npm run test              # Passe unique
npm run test:watch        # Mode watch
npm run test:coverage     # Rapport de couverture (Istanbul/V8)
npm run test:ui           # UI interactive Vitest
```

**204 tests** couvrant toutes les couches :

| Couche | Fichier | Tests |
|--------|---------|-------|
| Calcul solaire | `sunExposure.test.ts` | 27 |
| Calcul solaire | `sunService.test.ts` | 27 |
| Enrichissement | `terraceService.test.ts` | 15 |
| Filtres primitifs | `terraceFilters.test.ts` | 19 |
| Filtres presets | `filterService.test.ts` | 20 |
| Distance | `distance.test.ts` | 6 |
| Compat. dépréciée | `getSunnyTerraces.test.ts` | 8 |
| Repository | `terraceRepository.test.ts` | 6 |
| Mapping DB→domaine | `terraceMapping.test.ts` | 6 |
| Popup HTML | `popupContent.test.ts` | 11 |
| API route | `route.test.ts` | 5 |
| Vue FilterBar | `FilterBar.test.tsx` | 14 |
| Vue TerraceList | `TerraceList.test.tsx` | 11 |
| Vue TerraceDetails | `TerraceDetails.test.tsx` | 14 |
| Vue TimeSlider | `TimeSlider.test.tsx` | 11 |

### Tests E2E (Playwright)

```bash
npm run test:e2e                      # Chromium headless
npx playwright test --headed          # Avec interface navigateur
npx playwright test --ui              # UI interactive Playwright
npx playwright show-report            # Rapport HTML après exécution
```

**17 tests E2E** organisés en 4 suites :

1. **Chargement de l'app** — titre, sous-titre, canvas MapLibre visible
2. **Navigation temporelle** — slider `aria-label="Heure"`, bouton Maintenant, changement du label
3. **Filtres d'exposition** — chips Toutes/Ensoleillées/Plein soleil, `aria-pressed`, sélecteur de durée
4. **Liste et fiche terrasse** — chargement de la liste, ouverture d'une fiche, bouton Fermer

---

## Algorithme solaire (MVP)

### Hypothèses documentées

1. **Terrain plat** — pas d'occlusion par bâtiments ou topographie
2. **Façade = exposition** — l'orientation de la terrasse est l'angle normal à sa façade principale
3. **Position solaire par terrasse** — SunCalc calculé pour les coordonnées exactes de chaque terrasse
4. **Horizon de scan : 4 heures** — `sunUntil` est plafonné à `now + 4 h`
5. **Seuil d'altitude : 5°** — en dessous, le soleil est considéré sous l'horizon effectif
6. **Pas de scan : 5 minutes** — résolution pour estimer `sunUntil`

### Statuts

| Statut | Condition |
|--------|-----------|
| `sunny` | altitude > 5° **et** diff azimut < 60° |
| `partial` | altitude > 5° **et** 60° ≤ diff azimut < 90° |
| `shady` | altitude ≤ 5° **ou** diff azimut ≥ 90° |

### Score solaire (0–100)

```
angularFactor  = max(0, (90 − angularDiff) / 90)
altitudeFactor = clamp((altitudeDeg − 5) / 55, 0, 1)
score          = round(angularFactor × altitudeFactor × 100)
```

---

## Limites connues du MVP

- **Pas d'occlusion** : les bâtiments voisins, murs, stores et parasols sont ignorés. Une terrasse en cour intérieure sera marquée « ensoleillée » si l'azimut solaire correspond à son orientation.
- **Terrain plat supposé** : les terrasses en hauteur (ex. Butte Montmartre) ou en contrebas ne sont pas modélisées différemment.
- **Horizon de 4 heures** : `sunUntil` et `sunRemainingMinutes` sont approximatifs au-delà de 4 h.
- **Données statiques** : les 15 terrasses sont fixes, sans mise à jour en temps réel des horaires ni ajout collaboratif.
- **Météo ignorée** : un ciel couvert n'affecte pas le score — il reste purement astronomique.
- **Géolocalisation optionnelle** : le filtre « À 1 km » n'est disponible qu'après consentement explicite de l'utilisateur.

---

## Roadmap V2

- **Occlusion par bâtiments** — intégration de l'API Google Maps Shadow ou d'un modèle 3D Paris (IGN/BDTOPO)
- **Météo en temps réel** — croisement avec Open-Meteo pour pondérer le score par la couverture nuageuse
- **Terrasses contributives** — formulaire d'ajout + validation modérée (déduplication PostGIS)
- **Notifications push** — alerte quand une terrasse sauvegardée passe en plein soleil
- **Score personnalisé** — préférences utilisateur (terrasse couverte, intérieur/extérieur, type de lieu)
- **Données temps réel** — estimation d'affluence via Google Popular Times
- **Extension géographique** — Lyon, Bordeaux, Marseille avec données OpenStreetMap

---

## Licence

Projet privé — © 2024 Juliette Dompé
