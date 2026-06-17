# GOAL — Implémenter le storytelling & la progression (Pokémon Code Genesis)

## Contexte
Repo `Medimed99/Poke-Collector`, vanilla JS (pas de build), déployé sur Vercel.
Le jeu a une excellente base mécanique mais le storytelling et la progression
sont pauvres et dispersés. Ce goal implémente la vision validée (cf.
`VISION_STORYTELLING_GAMEDESIGN.md` à la racine — lis-le en entier d'abord).

**Point crucial** : beaucoup de contenu narratif existe DÉJÀ dans le code mais
n'est **jamais rencontré par le joueur** (ex. les notes/journaux de Chen, des
fichiers de lore, des dialogues). Une grande partie du travail est de
**CONNECTER l'existant**, pas de tout réécrire. Avant d'ajouter quoi que ce
soit, audite ce qui est déjà écrit et inutilisé.

## Principe directeur
Ne PAS refondre les mécaniques (capture, pêche, expédition, poker, clicker
fonctionnent). On ajoute une **couche narrative et de progression par-dessus**,
qui relie les systèmes existants autour d'une colonne vertébrale visible.

---

## PHASE 0 — Audit préalable (obligatoire avant de coder)
1. Recense tout le contenu narratif déjà présent mais non déclenché :
   - dialogues / lore dans `app.js` (cherche : `Chen`, `MissingNo`, `lore`,
     `corrupt`, `triggerNarrative`, `loreFiles`, `narrative`).
   - vérifie lesquels sont **réellement atteignables** en jeu vs morts.
2. Cartographie le système existant `gameState.system` (`integrity`,
   `glitchLevel`, `currentPhase`, `porygonMood`, `narrativeFlags`) : où est-il
   lu, où est-il écrit, est-il affiché ?
3. Liste les triggers narratifs épars (`triggerNarrative`, `showPorygonMessage`)
   et où ils sont appelés.
4. Produis un court rapport de ce qui est réutilisable avant d'implémenter.

---

## PHASE 1 — Rendre l'arc VISIBLE (priorité maximale, gros impact)
1. **Barre d'Intégrité du Monde** persistante en haut du hub, alimentée par
   `gameState.system.integrity` (0→100 %). Doit monter quand le joueur :
   capture une nouvelle espèce, vainc un Data Guardian, complète une région,
   décrypte un fichier de lore. Définis une formule claire et progressive.
2. **Le hub réagit à `glitchLevel`** : effets visuels CSS francs (artefacts,
   désaturation, lignes de scan) forts quand l'intégrité est basse, qui
   s'estompent à mesure qu'elle monte. Le monde doit visiblement « guérir ».
3. **Panneau "3 objectifs" toujours visible** :
   - court terme (quête/objectif du jour),
   - moyen terme (prochain Data Guardian ou % de la région courante),
   - long terme (intégrité du monde / acte en cours).
   Place-le de façon non intrusive mais consultable à tout moment.

## PHASE 2 — Moteur de paliers narratifs (centralisation)
1. Crée une fonction unique `checkStoryProgress()` appelée après chaque action
   majeure (capture, victoire de boss, complétion de région, montée de niveau).
2. Définis une **table de beats narratifs** : `{ id, condition, onTrigger }` où
   `condition` lit le `gameState` (ex. `integrity >= 25`, `region Kanto 100%`,
   `mewtwo_guardian vaincu`) et `onTrigger` déclenche cinématique + récompense +
   pose un flag dans `narrativeFlags` (anti-répétition).
3. **Migre les triggers existants** (`triggerNarrative`) dans ce moteur, et
   **branche le contenu orphelin** (notes de Chen, lore non atteignable) sur des
   beats appropriés. Rien d'écrit ne doit rester inaccessible.

## PHASE 3 — L'arc en 3 actes
Structure la narration selon `currentPhase` :
- **ACTE I — KANTO_RECOVERY** : intro Chen→glitch→Porygon ; objectif restaurer
  Kanto ; 1er Data Guardian = Mewtwo corrompu ; mystère « qui a réveillé
  MissingNo ? » via les notes de Chen.
- **ACTE II — JOHTO_DESCENT** (débloqué à Kanto 100 %) : descente dans le
  DeepNet ; Data Guardian = Lugia ; révélation : MissingNo est un vestige
  réveillé, pas créé ; Porygon-Z commence à se dégrader.
- **ACTE III — FINAL_PATCH** : Data Guardian = Rayquaza ; climax MissingNo
  (DÉJÀ écrit dans le code ~ligne 23017, le finaliser et le brancher
  proprement) ; sacrifice de Porygon ; restauration via l'Énergie Onirique.
Donne à **Porygon-Z une courbe émotionnelle** via `porygonMood`
(PANIC→confiance→dégradation→sacrifice→renaissance ambiguë). Fais intervenir
**MissingNo** par des glitchs/messages corrompus dans l'UI aux pics de tension.

## PHASE 4 — Reskin narratif des modules (texte, pas mécanique)
À l'entrée de chaque module, une phrase de contexte qui le relie à l'histoire :
pêche = sonder les couches profondes ; expédition = incursions en zone
corrompue ; Poké-Poker = décryptage de fragments de code ; clicker/recherche =
production d'Énergie Onirique (celle qui sauvera Porygon au climax — appuyer ce
lien). Ne change PAS les mécaniques, seulement l'habillage narratif.

## PHASE 5 — Points d'ancrage pour animations pixel art
Je fournirai des spritesheets pixel art (générées séparément). Prépare les
**points d'intégration** pour ces 6 scènes-clés, avec un lecteur de spritesheet
réutilisable (CSS `steps()` ou `<canvas>`), format standard à définir
(ex. frames 96×96, N frames, PNG transparent) :
1. Intro (Chen bugue → Genesis), 2. Apparition Porygon-Z,
3. Restauration de région (×3 variantes), 4. Combat Data Guardian (×3),
5. Sacrifice de Porygon-Z, 6. Révélation MissingNo.
Crée la fonction `playCutscene(sceneId)` qui affiche la scène en overlay, et
branche-la sur les beats narratifs correspondants. Prévois un fallback propre
si l'asset n'est pas encore présent (ne pas casser le jeu).

## PHASE 6 — Boucler l'endgame & rejouabilité
1. Finalise le climax MissingNo et son enchaînement vers le post-game.
2. Branche le **prestige "Outsiders"** (déjà amorcé ~ligne 16665) comme
   rejouabilité narrative : reset avec bonus permanent + nouvelle couche de
   récit (« et si la restauration n'était pas la bonne voie ? »).
3. Vérifie que les 3 objectifs (court/moyen/long) restent toujours alimentés,
   y compris en post-game (living dex, maîtrise des modules, ligues).

---

## Contraintes techniques (issues des bugs déjà rencontrés)
- **Sauvegarde** : intègre tous les nouveaux champs narratifs dans le système de
  save/load existant (sérialise les `Set`, ajoute des valeurs par défaut pour les
  vieux saves — un joueur existant ne doit pas crasher ni perdre sa partie).
- **Pas de régression** : teste qu'un save existant se charge correctement après
  l'ajout des champs.
- **Tout via PokéAPI** pour les sprites de Pokémon/items ; **aucun émoji** dans
  les nouvelles UI (cohérent avec le reste du jeu).
- **Mobile-first** : la barre d'intégrité, le panneau d'objectifs et les
  cutscenes doivent être lisibles et non intrusifs sur écran ≤480px.
- **Build local + test** avant chaque commit. **Commits séparés par phase**,
  messages explicites. Vérifie le déploiement Vercel après push.
- N'attribue jamais une régression à une cause non vérifiée : reproduis,
  diagnostique (build dev non-minifié pour les erreurs claires), corrige.

## Ordre d'exécution
Phase 0 (audit) → 1 (visible) → 2 (moteur) → 3 (arc) → 4 (reskin) →
5 (ancrages anim) → 6 (endgame). Montre-moi le rapport de Phase 0 et le plan
de Phase 1 AVANT de coder en masse, pour validation.

## Critère de réussite
Un nouveau joueur comprend en quelques minutes : qui il est, ce qui se passe
(le monde est corrompu), ce qu'il doit faire (restaurer l'intégrité), et ressent
une progression narrative rythmée par des paliers — pas juste un empilement de
modules. Aucun contenu narratif écrit ne reste inaccessible.
