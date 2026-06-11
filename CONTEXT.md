# CONTEXT — Pokémon Code Genesis (reprise depuis V1)

> Ce fichier résume une longue session de travail sur une V2 abandonnée.
> La V2 n'a **pas atteint** le niveau de qualité de la V1 (repo Poke-Collector).
> Ce qui suit, c'est ce que cette session a appris : pièges techniques, décisions
> structurantes à conserver, et erreurs à ne PAS reproduire.

---

## 1. Qui je suis, ce que je veux

- **Pseudo GitHub** : Medimed99 (machine `mehdipardo`)
- **Repo V1 de référence** : https://github.com/Medimed99/Poke-Collector
- **Profil** : perfectionniste, francophone. Je préfère qu'on me dise « ce module
  n'est pas prêt » plutôt que de recevoir du code qui passe le build mais
  ressemble à un brouillon.
- **Ce que je veux** : un jeu mobile fan-made Pokémon, gratuit, projet passion.
  La V1 « Poke-Collector » est déjà très solide. La V2 voulait étendre vers
  idle / roguelike / deckbuilder mais a perdu le focus sur la qualité.

---

## 2. Décision principale : on repart de la V1

La V2 (repo `Pokemon-genesis`) est **archivée / oubliée**.
Tout part désormais du repo V1 `Poke-Collector` et on l'améliore in-place.

**Avant de toucher au code**, je veux :
1. Un audit complet du repo V1.
2. Ma liste de choses à **supprimer**, **garder**, **améliorer**.
3. Ensuite seulement, on attaque module par module.

---

## 3. Ce que la V1 a déjà (à ne PAS réinventer)

La V1 (`app.js` monolithique ~23 500 lignes, déployée sur Vercel) contient déjà :

- **Système de capture** complet avec animation Pokéball, % par ball,
  baies (Framby/Pinap/Ceriz) avec effets corrects
- **Blind box quotidienne** (5/jour, Pokémon garanti non possédé)
- **Système de pêche**
- **Progression Kanto → Johto → Hoenn** par complétion du Pokédex
- **Quêtes quotidiennes** (pools easy/medium/hard)
- **Boutique style PokéMeow** : 24 articles, balls, baies, objets temporaires,
  pierres d'évolution, lootboxes avec contenu probabiliste
- **Système de shards** + **œuf mystère**
- **Streak de capture** avec bonus shiny
- **Niveau Archiviste + XP**
- **Profil joueur** : pseudo, avatar, titres, succès (visibles + cachés),
  cosmétiques (cadres, fonds, effets barre XP)
- **Économie à 2 monnaies** : Coins (capture/boutique) + Jetons de Luxe
- **Système d'évolution** par niveau et par pierre
- **Narration Porygon-Z / Prof Chen / Zéro-Glitch / Omni-Archive**
- **Catalogue de cartes Poké-Poker** (203 jokers/arcanes/planètes/spectrales)
  → `cards_catalogue.json`

**À garder absolument** : l'identité visuelle/narrative, l'équilibrage économique
(prix V1 = 500 Coins/×10 Poké Balls etc., j'y avais longuement réfléchi),
la fidélité aux mécaniques Pokémon classiques.

---

## 4. Décisions de game design à respecter

- **Progression de région : 100% strict.** Compléter Kanto (151/151) débloque
  Johto, etc. La PokéBox quotidienne garantit qu'on n'est jamais soft-locké.
- **Coins ≠ EO.** Coins = monnaie de capture/boutique. EO = monnaie idle
  (si on garde l'aspect idle de la V2, ce qui reste à décider).
- **Capture commune ne doit PAS s'auto-financer.** Sinon l'économie tourne
  à vide. Les vrais moteurs de Coins early game = PokéBox gratuite +
  quêtes + daily.
- **Ceriz Berry** : capture 100% sur **Shiny uniquement** (V1).
- **Streak** : +0.5% shiny par palier de 10. Cassée par une fuite.
- **Tout via PokéAPI.** AUCUN émoji dans l'UI. Tout sprite (Pokémon, items,
  balls, baies, pierres, monnaies, badges) passe par PokéAPI. Si un sprite
  manque, on cherche dans PokéAPI un sprite cohérent thématiquement (ex:
  Comet Shard pour EO, Up-Grade pour Porygon/data).

---

## 5. Pièges techniques rencontrés (à éviter)

### React error #185 — boucle infinie de renders
**Cause typique** : un sélecteur Zustand qui retourne un nouvel objet à chaque
appel. Trois patterns interdits :

```ts
// ❌ Sélecteur-objet
const { a, b } = useGame((s) => ({ a: s.a, b: s.b }));

// ❌ Sélecteur qui appelle une fonction du store (retourne nouvel objet)
const level = useGame((s) => s.levelInfo());

// ❌ Sélecteur avec filter/map
const claimable = useGame((s) => s.quests.filter((q) => q.done));
```

**À faire à la place** :
```ts
// ✅ Sélecteurs primitifs séparés
const a = useGame((s) => s.a);
const b = useGame((s) => s.b);

// ✅ Calcul en local après sélection de la valeur stable
const totalXp = useGame((s) => s.totalXp);
const level = levelFromXp(totalXp);
```

### WebGL context lost (si on garde un Canvas Three.js)
Si le projet utilise react-three-fiber, **ne jamais démonter/remonter le Canvas**
en changeant d'écran. Garder la vue avec le Canvas montée en permanence et
cacher via `display: none` quand on navigue ailleurs.

### Getters JavaScript dans Zustand
**Interdit** : `get active() { return ... }` dans le state Zustand.
Utiliser un booléen mis à jour explicitement par les actions.

### Apostrophes françaises dans des strings TS
Les `'` dans `'j'ai'` (single-quoted) cassent le parse. Toujours utiliser
des template strings ou double quotes pour le français.

### Fichiers orphelins lors d'un refacto
Quand on remplace un système (ex: ancien combat tour-par-tour → autobattler),
**supprimer explicitement** les anciens fichiers (`BattleView.tsx`, `DraftView.tsx`...).
Sinon Vercel cassera le build sur les références orphelines.

### URLs sprites PokéAPI utilisées
- Pokémon : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png`
- Shiny : `.../sprites/pokemon/shiny/{id}.png`
- Items : `.../sprites/items/{name}.png`
- Animés Gen V : `.../sprites/pokemon/versions/generation-v/black-white/animated/{id}.gif`

### Pas de sprites de dresseurs dans PokéAPI
Si on veut représenter un dresseur ennemi, utiliser un Pokémon emblématique
comme avatar plutôt que d'inventer ou de mettre un émoji.

### Modal CSS — toujours définir `.modal-overlay`
Erreur stupide mais fatale : on peut écrire un modal en JSX sans qu'il ne
s'affiche jamais si la classe `.modal-overlay` n'a pas `position: fixed`
+ `z-index`. À vérifier dès qu'un modal "ne s'ouvre pas".

### Mobile responsive
Le viewport mobile (≤480px) doit être pensé dès le départ. Sinon : boutons trop
petits, modaux qui débordent, grilles à 5 colonnes illisibles. Une media query
`@media (max-width: 480px)` doit ajuster paddings, tailles, grilles.

---

## 6. Workflow recommandé pour cette nouvelle phase

1. **Audit du repo V1** d'abord. Pas de code avant l'audit.
2. Quand tu modifies, **commit souvent** par changement logique.
3. **Build local + test visuel** avant de pousser. Le cycle « push → Vercel
   cassé → debug » est coûteux.
4. Pour tout bug obscur, **build en mode dev non-minifié** pour avoir le
   message d'erreur React complet. Ne pas deviner.
5. Si je dis « je veux X comme Pokelike/Balatro/PokéMeow », je peux fournir
   des captures de référence. Demande-les si tu en as besoin.

---

## 7. Ce que la V2 (abandonnée) avait essayé d'apporter

À titre informatif, pour piocher des idées **uniquement si elles ont du sens**
dans la V1, sans copier-coller :

- Roguelike "Expédition Arcanes" avec carte ramifiée façon Pokelike
  (carte SVG, nœuds Sauvage/Dresseur/Capture/Objet/Soin/Boss reliés en pointillés,
  combats autobattler, objets équipables, évolutions auto)
- Deckbuilder "Poké-Poker" façon Balatro (4 antes × 3 blinds, 4 mains/3 défausses,
  deck 48 cartes Pokémon par type, mains renommées Monotype/Quinte Shiny, etc.)
- Moteur économique modulaire en TypeScript (`src/engine/`)
- Séquence d'intro narrative animée (Chen GBA → glitch → PZ → setup pseudo+avatar)

Ces mécaniques peuvent être pertinentes ou non. **À discuter avant
d'implémenter**, pas à transplanter aveuglément.

---

## 8. Première action attendue

Quand tu démarres la session, **commence par cloner et lire le repo V1**.
Puis donne-moi un audit structuré :
- ce qui marche bien et qu'on garde
- ce qui pose problème (bugs, code mort, dette technique)
- ce qui pourrait être étendu/amélioré
- une proposition d'ordre d'attaque

Pas de code avant qu'on soit aligné sur le plan.
