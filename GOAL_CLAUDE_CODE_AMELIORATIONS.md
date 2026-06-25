# GOAL — Améliorations Game Design : dynamisme, rétention, progression fluide

## Contexte
Repo `Medimed99/Poke-Collector`, vanilla JS (pas de build), déployé sur Vercel.
Le jeu est riche et fonctionnel (storytelling engine, intégrité du monde,
économie rééquilibrée, 7+ modules). Ce goal **active le potentiel existant** :
rendre chaque action plus satisfaisante, donner une raison de revenir chaque
jour, fluidifier la progression. On n'ajoute PAS de gros contenu neuf, on
améliore le ressenti et les boucles.

**Réf** : `ANALYSE_GAMEDESIGN_AMELIORATIONS.md` (lis-le en entier d'abord).
**Hors scope** : le système de Prestige (volontairement exclu pour l'instant).

## Règles de travail (importantes pour éviter les erreurs)
- **Une amélioration = un commit** avec message clair. Pas de méga-commit.
- **Build/test local avant chaque push.** Vérifier le déploiement Vercel après.
- **Rétrocompatibilité des saves** : chaque nouveau champ de `gameState` doit
  avoir une valeur par défaut au chargement (un save existant ne doit ni crasher
  ni perdre de données). Sérialiser correctement les `Set`.
- **Mobile-first** : tout doit être lisible et fluide sur écran ≤480px.
- **Pas d'émojis** dans les nouvelles UI : sprites via API (voir section ASSETS).
- **Ne pas casser l'existant** : avant de modifier une fonction partagée
  (`saveGame`, `updateUI`, `selectPokemon`…), vérifier qui l'appelle. Rappel :
  certaines fonctions d'`app.js` sont réécrites par `gamemaster.js` /
  `*_overhaul.js` — modifier la bonne version.
- En cas de bug, **reproduire et diagnostiquer** (pas de devinette). Pour les
  erreurs JS obscures, tester en console navigateur (code non minifié).

---

## ASSETS — Règle d'illustration/animation (à appliquer partout)

Hiérarchie à respecter pour toute illustration/animation :

1. **Par défaut : sprites animés PokeAPI** (Gen V animated GIF) :
   `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/{id}.gif`
   (shiny : `.../animated/shiny/{id}.gif`). Fallback statique si absent.

2. **Pour les moments "compagnon / personnage vivant" (Buddy, Porygon-Z) :
   sprites Pokémon Donjon Mystère (PMD)** — vérifiés disponibles et accessibles.
   Dépôt : `PMDCollab/SpriteCollab`. Pour un Pokémon, id sur 4 chiffres (ex.
   Porygon-Z = `0474`, Pikachu = `0025`) :
   - Animations dispo : `Idle`, `Walk`, `Attack`, `Sleep`, `Hurt`, `Charge`,
     `Shoot`, etc. Fichier :
     `https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/sprite/{id4}/{Anim}-Anim.png`
   - Métadonnées :
     `https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/sprite/{id4}/AnimData.xml`
     → contient `<FrameWidth>`, `<FrameHeight>`, et `<Durations>` (durée de
     chaque frame, en ticks) par animation.
   - **Format** : chaque `{Anim}-Anim.png` est une grille où **les lignes =
     directions** (8 directions, ordre Down, Down-Right, Right, …) et **les
     colonnes = frames** de l'animation. On joue une ligne (ex. direction "Down"
     = face caméra) en parcourant ses colonnes au rythme des `<Durations>`.
   - **Portraits** (émotions, pour les dialogues) :
     `https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/portrait/{id4}/Normal.png`
     (+ variantes émotionnelles : Happy, Angry, Sad, Surprised, Pain…). Idéal
     pour donner une vraie présence à Porygon-Z dans les dialogues narratifs.

   **Implémentation** : créer un petit lecteur `PMDSprite` réutilisable qui
   prend (id, animation, direction) + lit AnimData.xml pour cadencer les frames
   via `<canvas>` ou background-position animé. Style "Donjon Mystère" parfait
   pour le Buddy affiché à l'écran et pour Porygon-Z guide.

3. **Animations de scènes-clés (Data Guardians, etc.)** : spritesheets pixel
   art générées (fournies séparément), jouées par un lecteur `steps()`.

Recommandation d'usage : **Buddy compagnon = PMD Idle/Walk** (vivant, mignon,
très "Pokémon"). **Porygon-Z guide = portraits PMD** pour les émotions en
dialogue + sprite PMD pour sa présence. Le reste du jeu (captures, collection,
combats) reste sur sprites PokeAPI animés pour la cohérence.

⚠ Avant usage massif PMD : vérifier les conditions d'attribution du dépôt
PMDCollab (crédit des artistes communautaires généralement requis) et ajouter
un crédit dans le jeu (écran "À propos"/crédits). À confirmer côté projet.

---

## PHASE 1 — JUICE & GAME FEEL (cœur du jeu plus satisfaisant)
Effort modéré, impact fort. Rendre l'action répétée (capture) jouissive.

1. **Juice sur CHAQUE capture réussie** (pas que les events rares) :
   - Léger screen-shake, sprite qui "pop" (scale bounce), et `FX.coins(...)`
     qui fait voler les pièces vers le compteur (la fonction existe — l'appeler
     sur chaque capture, intensité proportionnelle aux coins gagnés).
   - Son court satisfaisant (si système audio présent ; sinon prévoir un hook
     audio simple, désactivable).
2. **Vibration haptique mobile** (absente aujourd'hui) :
   - `navigator.vibrate(40)` sur capture réussie.
   - `navigator.vibrate([80,40,80])` sur shiny / légendaire / level-up.
   - Garde-fou : vérifier `('vibrate' in navigator)` ; option on/off dans les
     réglages.
3. **Échelonner l'intensité** : capture normale = petit juice ; rare = moyen ;
   shiny/légendaire = gros (confetti + shake fort + vibration longue). La montée
   en intensité fait la valeur perçue.

## PHASE 2 — COMBO DE CAPTURE SPECTACULAIRE
La streak existe (bonus shiny) mais est invisible. La rendre ressentie.

1. **Compteur de combo à l'écran** pendant les captures : un "x{streak}" animé
   qui grossit/pulse à chaque capture enchaînée.
2. **Paliers visuels** : changement de couleur et d'effet à x5, x10, x25, x50
   (ex. x25 = halo de feu autour du compteur, x50 = écran qui vibre légèrement
   en continu). Le joueur doit *sentir* qu'il est sur une série précieuse.
3. **Tension de rupture** : quand une fuite casse la streak, feedback marqué
   (le combo se brise visuellement) — sans être punitif au point de frustrer.
4. **Corriger l'équilibrage shiny** au passage : unifier la formule à
   `Math.floor(streak / 10) * 0.005` (cap ~+2.5%) partout — supprimer toute
   occurrence restante de `streak / 5 * 0.01` (trop généreux : ~+10% à streak 50).

## PHASE 3 — RÉTENTION (revenir chaque jour) — priorité haute
Le plus gros levier manquant.

1. **Gains hors-ligne + écran "Welcome back"** :
   - À la reconnexion, calculer le temps écoulé (`lastOnline` existe) et
     accorder des gains passifs plafonnés : Énergie Onirique du module research,
     captures du catchbot (déjà modélisé), etc. Plafond raisonnable (ex. 8-12 h)
     pour ne pas casser l'économie.
   - Afficher un **écran de retour** clair : "Pendant ton absence : +X EO,
     +Y captures, +Z coins" avec un bouton "Récupérer" satisfaisant (juice).
   - C'est LA fonctionnalité de rétention nº1, à soigner.
2. **Notifications push PWA** (SW déjà enregistré) :
   - Demander la permission au bon moment (après quelques sessions, pas au 1er
     lancement).
   - Notifs utiles, non spam : "PokéBox quotidienne prête", "Œuf éclos",
     "Énergie pleine, viens récolter", "Tickets d'expédition rechargés".
   - Programmables via le SW. Option de désactivation dans les réglages.
3. **Calendrier de connexion en escalier** :
   - `loginStreak` est tracké — le **valoriser** par un calendrier visuel
     (J1→J7 puis cycle), récompenses croissantes, gros lot J7 (Master Ball /
     radar légendaire). Montrer la récompense de DEMAIN (incitation à revenir).
4. **Événements à durée limitée (FOMO sain)** :
   - Système d'events temporels simples : "week-end shiny ×2", "Pokémon vedette
     du jour avec bonus coins", "légendaire rôde dans le DeepNet aujourd'hui".
   - Même un seul event tournant par jour suffit à donner une raison fraîche
     de jouer. Bannière visible sur le hub avec compte à rebours.

## PHASE 4 — PROGRESSION FLUIDE (supprimer les murs)
1. **Adoucir la courbe XP** : remplacer `xpToNext = level * 250` (linéaire, mur
   tardif) par une courbe douce, ex. `Math.floor(250 * Math.pow(level, 1.15))`,
   ET faire scaler les sources d'XP (captures de régions avancées valent plus).
   Objectif : jamais de plateau brutal, le prochain niveau toujours proche.
2. **Re-séquencer les déblocages early** :
   - Avancer **blindbox** à L2-3 (pilier de collection, trop tard à L4).
   - Lisser l'ensemble pour qu'il y ait *toujours* un prochain module en vue,
     sans tout livrer entre L2 et L8 puis désert L15→L25. Étaler régulièrement.
   - Montrer les modules verrouillés (silhouette + "débloqué au niveau X") pour
     créer de l'anticipation.
3. **Jalons de collection célébrés** : découper "Kanto 151" en paliers tous les
   25 Pokémon → récompense + réaction de Porygon + tick d'intégrité visible.
   Les petits wins fréquents maintiennent la motivation.
4. **Premier Data Guardian visible tôt** : afficher Mewtwo corrompu verrouillé
   ("atteins le niveau 8") comme carotte précoce dès l'early game.

## PHASE 5 — DYNAMISME & COMPAGNON
1. **Les 3 objectifs toujours visibles** : s'assurer que le panneau objectifs
   (court = quête du jour / moyen = prochain Guardian ou % région / long =
   intégrité) est **toujours à l'écran et à jour**. Zéro temps mort "je fais
   quoi maintenant ?".
2. **Buddy compagnon vivant** (gros potentiel d'attachement) :
   - Afficher le Buddy actif sur le hub avec une **animation PMD** (Idle/Walk,
     voir section ASSETS). Style Donjon Mystère = parfait ici.
   - Le faire réagir aux events (capture, level-up) avec une anim ponctuelle
     (Attack/Charge) + éventuellement un portrait émotionnel.
   - Renforcer ses bonus et les rendre lisibles (pourquoi je veux le faire
     monter).
3. **Synergies entre modules** (casser les silos) : créer 2-3 liens concrets,
   ex. pêche → matériaux d'incubation ; poker → jokers boostant la capture ;
   expédition → shards pour le research. Quand les modules se nourrissent, le
   joueur tourne entre eux (durée de vie ↑ sans contenu neuf).

## PHASE 6 — PORYGON-Z VIVANT (liant narratif)
1. Donner à Porygon-Z une **présence émotionnelle** dans les dialogues via les
   **portraits PMD** (Normal/Happy/Angry/Sad/Surprised selon `porygonMood` qui
   existe déjà). Le guide devient expressif au lieu d'un texte neutre.
2. Synchroniser son humeur avec l'état du monde (intégrité basse = portraits
   inquiets ; monde restauré = portraits confiants).

---

## ORDRE D'EXÉCUTION RECOMMANDÉ
1. **Phase 1** (juice + vibration) — rapide, gros gain de ressenti, peu risqué.
2. **Phase 3** (rétention : offline + push + login + events) — plus gros levier.
3. **Phase 2** (combo spectaculaire) — addiction + correctif shiny.
4. **Phase 4** (progression fluide) — supprime les murs.
5. **Phase 5** (objectifs + buddy PMD + synergies).
6. **Phase 6** (Porygon-Z portraits PMD).

Commence par me montrer : (a) un test de faisabilité du lecteur PMD sur 1
Pokémon (Buddy ou Porygon) pour valider l'approche sprite Donjon Mystère, et
(b) le plan détaillé de la Phase 3 (offline/push) AVANT de coder en masse.

## CRITÈRE DE RÉUSSITE
- Chaque capture est satisfaisante (juice + vibration), la streak crée de la
  tension, on a une raison de revenir chaque jour (offline + push + login +
  event), la progression ne bute jamais sur un mur, et le Buddy/Porygon donnent
  une présence vivante au jeu. Aucune régression ni perte de save.
