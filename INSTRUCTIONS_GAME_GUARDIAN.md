# INSTRUCTIONS CLAUDE CODE — Refonte du mode Game Guardian (Boss Battle)

Repo `Medimed99/Poke-Collector`. Fichiers : `boss_battle_system.js` (946 l,
moteur + UI), `app.js` (`createBattleUnit` l.416, `ARCHETYPE_SKILLS` l.279,
`getPokemonArchetype` l.245, `BASE_STATS_BY_RARITY` l.190), `style.css`.

## Diagnostic (vérifié dans le code)

Le système est **ambitieux** (ATB temps réel, phases de boss, compétences,
timeline) mais bancal sur ses fondations. 4 problèmes racines :

1. **Layout non optimisé mobile.** Le CSS boss n'a quasiment AUCUNE règle de
   positionnement (`grep` ne trouve que `.boss-sprite`) et **zéro media query
   mobile**. `renderBattleInterface` produit boss-zone / player-zone /
   control-panel sans structure responsive → sprites mal placés, contrôles mal
   dimensionnés sur mobile. C'est pourquoi "les sprites ne sont pas bien placés".

2. **Movesets génériques (le gros problème).** Les compétences viennent de
   `ARCHETYPE_SKILLS[archetype]` : il n'existe que **4 archétypes** (attacker,
   tank, support, disruptor), chacun avec **3 skills fixes**. Donc les 386
   Pokémon se partagent 4 jeux d'attaques identiques. Un Dracaufeu et un
   Pikachu "attacker" ont exactement les mêmes moves ("Attaque", "Assaut",
   "Précision"), sans rapport avec leur type. → "Les set moves sont quasiment
   inexistants" : c'est exactement ça.

3. **Stats par rareté, pas individuelles.** `createBattleUnit` lit
   `BASE_STATS_BY_RARITY[rarity]` → tous les communs ont les MÊMES stats. Aucune
   différenciation entre Pokémon. La stratégie d'équipe n'a pas de support réel.

4. **Dégâts/stratégie imprécis.** `calculateDamage` n'utilise que `atk` (pas de
   distinction physique/spécial), `types[0]` seulement (ignore le 2e type en
   attaque), pas de STAB, crit fixe 15%. Les attaques "ne sont pas propres".

---

## OBJECTIF

Faire de ce mode un **combat de boss tactique et lisible sur mobile** : une
équipe de Pokémon (avec de vraies identités) affronte un boss en plusieurs
phases, via des compétences qui ont du sens (type, rôle), avec une UI claire et
des dégâts justes. Garder le squelette qui marche (ATB, phases, timeline), mais
refonder movesets, stats, dégâts et layout.

---

## CHANTIER 1 — LAYOUT MOBILE (priorité : rendre jouable)

Refondre `renderBattleInterface` + CSS pour un combat **vertical mobile-first**,
plein écran, sans scroll :

```
┌──────────────────────────┐
│  BOSS (sprite + HP + phase)│  ← haut, large, impactant
│   [aura/animation]        │
├──────────────────────────┤
│  TIMELINE ATB (ordre tour) │  ← bandeau fin
├──────────────────────────┤
│  ÉQUIPE (sprites + HP)     │  ← rangée, l'actif mis en avant
├──────────────────────────┤
│  COMPÉTENCES (gros boutons)│  ← bas, tap-friendly (44px+),
│  [skill1][skill2][skill3] │     cooldown visible, icône+nom
└──────────────────────────┘
```

Exigences :
- **Plein écran** (position fixed / 100dvh), aucun scroll pour jouer.
- **Boutons de compétence tap-friendly** (≥44px), état désactivé (cooldown)
  clair, cible sélectionnable si besoin.
- **Barres de HP** boss et équipe animées (transition CSS), couleur
  verte→orange→rouge.
- **Sprites bien placés** : boss en haut centré (grand), équipe en bas, l'unité
  active distinguée (taille/halo).
- **Media queries** ≤480px obligatoires (actuellement absentes).
- Sprites PokeAPI animés (déjà utilisés via `getAnimatedSpriteUrl`) — garder.

---

## CHANTIER 2 — VRAIS MOVESETS (le cœur du problème)

Remplacer `ARCHETYPE_SKILLS` (4 jeux génériques) par des compétences **fondées
sur le TYPE et le rôle** du Pokémon, pour que chaque équipier ait une identité.

Approche recommandée (pragmatique, pas besoin des vrais moves Pokémon) :
1. **Une attaque de type** par Pokémon, dérivée de son type principal :
   ex. Feu → "Lance-Flammes", Eau → "Hydrocanon", Électrik → "Tonnerre",
   Plante → "Tranch'Herbe", etc. (table type → nom + élément d'attaque).
   Cette attaque applique l'efficacité de type contre le boss + STAB.
2. **Une compétence de rôle** selon l'archétype (garder la notion de rôle, mais
   en complément, pas en substitution) : tank → provocation/bouclier,
   support → soin/buff, attacker → gros coup à cooldown, disruptor →
   ralentissement/stun.
3. **Une 3e compétence signature** optionnelle pour les Pokémon rares/légendaires
   (différencie les pièces maîtresses).

Définir une table `TYPE_MOVES` (type → { nom, multiplicateur, effet }) et
composer le moveset = [attaque de type] + [compétence de rôle] + [signature?].
Ainsi un Dracaufeu (Feu) a "Lance-Flammes" + rôle attacker, un Tortank (Eau) a
"Hydrocanon" + rôle tank — chacun son identité, lisible par le joueur.

Bonus : afficher le **type de chaque compétence** (couleur/pastille) sur le
bouton, pour que le joueur fasse des choix tactiques selon le boss.

---

## CHANTIER 3 — STATS INDIVIDUELLES

Dans `createBattleUnit`, cesser de lire uniquement `BASE_STATS_BY_RARITY`.
Utiliser des **stats individuelles par Pokémon** (le jeu a forcément une source
de stats/BST par espèce — sinon dériver du BST réel). Garder le multiplicateur
Buddy (+10%/niveau, bonne idée) par-dessus. Objectif : un Léviator ≠ un Magicarpe,
la composition d'équipe devient un vrai choix stratégique.

---

## CHANTIER 4 — DÉGÂTS & COMBAT PROPRES

Refondre `calculateDamage` pour des combats justes et lisibles :
- **STAB** : ×1.5 si le type de l'attaque = un type du Pokémon.
- **Efficacité de type complète** : prendre en compte les DEUX types du boss
  (déjà partiellement fait côté défense) ET le bon type de l'attaque utilisée
  (pas `attacker.types[0]` systématiquement — utiliser le type de la COMPÉTENCE).
- **Distinction physique/spécial** (optionnel mais recommandé) : si les stats
  le permettent, utiliser atk vs def pour les moves physiques, et une stat
  spéciale pour les moves spéciaux. Sinon, au minimum, des multiplicateurs
  cohérents par compétence.
- **Variance** légère (×0.85–1.0) comme les vrais jeux, crit conservé.
- **Feedback clair** : afficher "Super efficace !" / "Pas très efficace…" à
  chaque coup, les nombres de dégâts qui pop sur le sprite touché (le code a
  `showDamageNumber` — s'assurer qu'il est bien positionné en mobile).

---

## CHANTIER 5 — STRATÉGIE & LISIBILITÉ DU BOSS

- **Phases de boss** : déjà présent (`checkBossPhaseTransition`). S'assurer que
  le passage de phase est **visible et marquant** (changement visuel, message,
  éventuel changement de pattern d'attaque du boss).
- **Pattern du boss** : `processBossTurn`/`executeBossSkill` existent — vérifier
  que le boss a de vraies compétences variées (pas juste une attaque répétée) et
  que ses intentions sont lisibles (télégraphier la grosse attaque pour que le
  joueur réagisse : soigner, protéger).
- **Compétences qui ne marchent pas** : auditer chaque `type` de skill
  (damage_single, damage_aoe, heal, taunt, buff_team, stun, passive…) et vérifier
  que `executeSkill` les gère TOUS correctement. Lister celles qui sont
  no-op/buguées et les implémenter ou retirer. (Beaucoup de fonctions "ne
  marchent pas/mal" selon le retour utilisateur — faire le tri exhaustif.)

---

## ORDRE DE TRAVAIL (commits séparés, test local + push à chaque étape)
1. **CHANTIER 1** (layout mobile) — rend le mode jouable, impact immédiat.
2. **CHANTIER 4** (dégâts propres : STAB, type, efficacité) — combats justes.
3. **CHANTIER 2** (vrais movesets par type) — identité et stratégie.
4. **CHANTIER 3** (stats individuelles) — différenciation d'équipe.
5. **CHANTIER 5** (audit des skills + boss patterns) — finitions tactiques.

Avant de coder en masse, **audite et liste** : (a) tous les `type` de skill et
lesquels sont réellement implémentés dans `executeSkill`, (b) la source de stats
par espèce disponible dans le code. Montre-moi ce rapport + ton plan avant
d'attaquer.

## GARDE-FOUS (bugs récurrents du projet)
- Tester sur mobile (≤480px) ET desktop après chaque chantier.
- Ne pas casser la save ni l'état de combat en cours.
- `createBattleUnit` est dans `app.js` mais utilisé par `boss_battle_system.js` —
  vérifier les deux fichiers à chaque modif.
- Sprites via PokeAPI ; remplacer les émojis restants des skills/logs par des
  pastilles de type ou icônes propres.
- `clearInterval(battleATBInterval)` bien appelé à la fin du combat (éviter les
  fuites de timer ATB).
- Pour tout bug, reproduire + diagnostiquer (console, code non minifié).

## CRITÈRE DE RÉUSSITE
Un combat de boss se joue entièrement dans le viewport mobile, les sprites sont
bien placés, chaque Pokémon a des compétences qui correspondent à son type et
son rôle, les dégâts reflètent l'efficacité de type (STAB, faiblesses), le boss
a des phases et des patterns lisibles, et toutes les compétences fonctionnent.
Le joueur ressent un vrai combat tactique, pas un échange d'attaques génériques.
