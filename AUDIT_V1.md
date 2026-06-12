# AUDIT V1 — Poke-Collector (12/06/2026)

Audit du repo `Medimed99/Poke-Collector` (dernier commit `5080f4a "big fix"`).
14 fichiers JS chargés, tous passent le check de syntaxe. Build sain.
Classement : 🔴 critique · 🟠 important · 🟡 à discuter.

---

## A. BUGS FLAGGÉS

### 🔴 A1. Deux `saveGame` divergents dans app.js
- `app.js:14744` → `function saveGame()` : save locale + Supabase **débouncé 3s** + `updateLeaderboardScores()`
- `app.js:15410` → `window.saveGame = function()` : save locale + Supabase **immédiat**, sans leaderboard
Les appels nus `saveGame()` résolvent la déclaration hoistée (1ère), les appels
`window.saveGame()` la 2ème. **Deux chemins de sauvegarde différents coexistent**
selon le style d'appel. Risque : leaderboard pas mis à jour selon le chemin,
double save Supabase concurrent. → Garder UNE implémentation, supprimer l'autre.

### 🔴 A2. 15 collisions de fonctions globales (monkey-patching fragile)
`gamemaster.js`, `expedition_pokelike.js`, `fishing_overhaul.js` redéfinissent des
fonctions d'app.js : `saveGame, showToast, updateUI, checkLevelUp,
unlockFeaturesByLevel, updateHubLockStates, updateNavigationVisibility,
updateQuestsVisibility, updateUIFishing, startFishing, renderExpeditionPage,
startExpeditionRun, showExpeditionPrepModal, showExpeditionTutorial, showTutorial`.
L'ordre de chargement (app.js d'abord, overhauls ensuite) fait que les overhauls
gagnent — c'est voulu, MAIS :
1. Les anciennes versions restent dans app.js = **code mort trompeur** : modifier
   `startFishing` dans app.js n'a AUCUN effet (fishing_overhaul l'écrase).
2. Tout changement d'ordre de script dans index.html casse silencieusement le jeu.
→ Soit supprimer les anciennes versions d'app.js, soit fusionner les overhauls.

### 🟠 A3. Module TCG fantôme
`gameState.modules.tcg` annonce un déblocage **niveau 25** avec dialogue
(`unlock_archives`), 33 références au state `gameState.tcg`… mais **aucune UI
n'existe** (pas de `renderTcg`, pas de page). Un joueur qui grind jusqu'au
niveau 25 débloque un module **vide**. → Supprimer le déblocage annoncé OU
implémenter. Ne pas laisser une promesse cassée.

### 🟠 A4. Catchbot semi-fantôme
Logique de capture passive présente (`gameState.catchbot.storage` se remplit)
mais `active: false` par défaut et pas d'UI claire d'activation/collecte
repérée. → Vérifier en jeu ; supprimer ou finir.

### 🟠 A5. Incubation partielle
`hatchEgg` existe, `incubatorPrice: 500` Shiny Tokens défini, `mystery_egg`
dans les lootboxes… mais le flux complet achat-incubation-éclosion semble
incomplet. → À tester de bout en bout, c'était dans ta liste de souhaits.

### 🟡 A6. Poker chargé via Babel runtime
`poker-game-full.jsx` (133 Ko) est fetché puis **transpilé par Babel standalone
dans le navigateur** à l'ouverture. Sur mobile : latence sensible à chaque
session + Babel (~3 Mo) chargé en prod. → Pré-compiler le JSX en JS une fois
pour toutes (one-shot, faisable par Claude Code en 5 min).

### 🟡 A7. Poids de page global
- `app.js` : 1,2 Mo non minifié (23 534 lignes), chargé d'un bloc
- `style.css` : 192 Ko
- Tailwind via CDN runtime (officiellement déconseillé en production)
- React UMD + Babel standalone + Three.js r128 + Supabase
Sur mobile 4G, le premier chargement est lourd. → Pas urgent, mais minification
+ Tailwind buildé seraient des quick wins de perf.

### 🟡 A8. Fichiers orphelins
`auto-generate-icons.js`, `poker-game-full-temp.jsx` (59 octets), et ~10 fichiers
MD de notes d'implémentation à la racine. Pas nuisible, mais pollue le repo.
`sw.js` est OK (enregistré dans index.html:1998).

---

## B. GAME DESIGN

### 🟠 B1. Économie : les Coins gonflent vite
Gains de capture (`app.js:10100`) : commun **120**, uncommon 200, rare 600,
super-rare 1000, légendaire 3500 (Pinap ×2). Coût d'une Poké Ball : 50
(500/×10). **Une capture commune rapporte 2,4× son coût en ball** — chaque
capture est rentable, et avec le taux de réussite, les Coins s'accumulent sans
friction. Conséquence : passé le early game, les prix boutique (500–10 000)
deviennent triviaux, les choix d'achat perdent leur poids.
→ Pistes : soit baisser les gains communs (~50-60), soit ajouter des sinks
récurrents (rerolls de quêtes, upgrades permanents chers, cosmétiques en Coins),
soit assumer une économie généreuse et déplacer la rareté sur les Shiny Tokens.
**À trancher avant tout rééquilibrage.**

### 🟠 B2. Streak shiny très généreuse
`app.js:8248` : base 1/256 + **1% par palier de 5** de streak. À streak 50 :
~10,4% de shiny par rencontre. Les shiny perdent leur statut d'événement rare
pour les joueurs réguliers (et l'inflation déborde sur le Pokédex doré/golden).
→ Suggéré : +0,5%/palier de 10 (cap ~+2,5%), ou cap dur du bonus à +3-4%.

### 🟠 B3. Courbe de déblocage des modules discutable
`fishing` niv.2 → `research` niv.5 → `blindbox` **niv.8** → `bossBattle` niv.8 →
`poker` niv.12 → `rogue` niv.20 + Johto → `tcg` niv.25 (fantôme).
Deux problèmes :
1. **Blindbox au niveau 8** : c'est un pilier de la boucle de collection
   (garantie d'un nouveau Pokémon). La verrouiller si tard appauvrit l'early
   game, qui ne repose que sur capture + pêche.
2. **Rogue à niv.20 + Johto débloqué** : Johto exige Kanto 100% (151 captures).
   La double condition rend l'Expédition quasi end-game alors que c'est un
   module à forte rejouabilité. → Suggéré : blindbox niv.3-4, rogue niv.15 sans
   condition de région (ou Kanto ≥ 60%).

### 🟡 B4. Habitats / Research (idle)
Système d'habitats (forêt/océan/grotte/volcan/centrale/cimetière) avec
blueprints en inventaire — 140 références, donc bien implémenté. Mais seule la
Forêt est unlocked par défaut et les blueprints ne semblent achetables nulle
part en boutique principale (drops ?). → Vérifier la boucle d'acquisition des
blueprints : si le joueur ne peut pas en obtenir, c'est un système mort-né.

### 🟡 B5. Départ très généreux
`coins: 3000`, 50 Poké Balls, 20 Great, 10 Ultra, **1 Master Ball** dès le
départ. La Master Ball jour 1 désamorce la tension du premier légendaire.
→ Suggéré : la Master Ball devrait être un earn (quête spéciale, premier boss),
pas un cadeau de départ.

### 🟡 B6. Doc & dette de specs
10+ fichiers MD de plans d'implémentation à la racine (BOSS_BATTLE_PLAN,
BUGFIX_V7.1, WIRING_PASS…) : utile comme historique, mais aucun ne fait
autorité. → Consolider en un seul `DESIGN.md` à jour + archiver le reste dans
`/docs`, sinon Claude Code (ou toi dans 3 mois) ne saura pas quoi croire.

---

## C. CE QUI EST SAIN (à ne pas toucher)

- Syntaxe : 14/14 fichiers JS parsent ✓
- Save robuste : Sets sérialisés correctement, fallback 5 Pokéballs si ruiné,
  reset quotidien Paris-timezone, pity blindbox + pity expédition ✓
- Quêtes : pools easy/medium/hard/expert, anti-répétition de la veille ✓
- Expédition pokelike : module récent, propre, bien isolé ✓
- Boss battle system : module séparé, bien câblé ✓
- Timers : plus de clearInterval que de setInterval, pas de fuite évidente ✓
- PWA : manifest + SW enregistrés ✓

---

## D. ORDRE D'ATTAQUE SUGGÉRÉ

1. **A1** (saveGame dupliqué) — risque de corruption/incohérence de save, 30 min
2. **A2** (nettoyage code mort des fonctions écrasées) — assainit toute la suite
3. **A3/A4/A5** (TCG/catchbot/incubation) — décider : finir ou supprimer
4. **B1/B2** (économie + streak) — passes d'équilibrage avec tes arbitrages
5. **B3** (courbe de déblocage) — re-séquencer l'early game
6. **A6/A7** (perf poker + poids) — quick wins de confort mobile
