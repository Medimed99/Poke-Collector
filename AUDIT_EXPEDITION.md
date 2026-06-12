# AUDIT — Module Expédition (expedition_pokelike.js)

927 lignes, bien isolé, IIFE propre. Architecture saine.
Mais l'expérience de combat reste opaque et la simulation est simplifiée.
Classement : 🔴 bloquant pour le ressenti · 🟠 important · 🟡 polish.

---

## 1. LE COMBAT — le point faible majeur

### 🔴 1.1 Le combat est un défilement de logs texte
`showBattlePanel` affiche les sprites ennemis en haut, puis un `<div>` qui
empile des lignes texte (`X inflige Y à Z`) toutes les 90 ms. **On ne voit pas
les Pokémon s'affronter, pas de barres de vie qui descendent, pas de sprite du
joueur.** C'est exactement la critique que tu avais sur la V2. Pokelike montre
les deux Pokémon face à face, les HP qui fondent, l'effet de type.

**Reco — refondre showBattlePanel en arène visuelle :**
- Sprite **joueur** (actif) en bas-gauche, sprite **ennemi** en haut-droite,
  tous deux animés (`getAnimatedSpriteUrl` existe déjà et est utilisé pour
  l'ennemi — l'étendre au joueur).
- **Barre de HP par combattant**, qui descend avec transition CSS à chaque coup.
- Rejouer le combat **étape par étape** depuis les logs déjà produits par
  `simulateAutoBattle` : à chaque coup, animer l'attaquant (lunge), faire
  trembler le défenseur, baisser sa barre, afficher le texte de l'effet de type
  (« Super efficace ! » / « Peu efficace… »).
- Le switch de Pokémon KO doit être visible (fade-out + entrée du suivant).
- L'info `simulateAutoBattle` doit remonter assez de données pour rejouer :
  actuellement `onLog` ne donne qu'une string. → Enrichir le log en objets
  `{ attacker, defender, dmg, effectiveness, hpAfter, ko, side }` pour piloter
  l'animation proprement (sinon il faut re-parser les strings, fragile).

### 🟠 1.2 La formule de dégâts ignore des stats clés
`getEffectiveDamage` n'utilise que `atk` (physique) et `def` du défenseur :
```
dmg = atk * typeEff * (100/(100+def)) * random(.85–1)
```
- **Pas de distinction Atk physique / Atk Spéciale** : un Pokémon spécial
  (Alakazam, Ectoplasma) tape avec son atk physique, ce qui inverse des
  matchups. Les stats existent (`createRunPokemon` ne génère que atk/def/spd/hp,
  donc spatk/spdef ont été **supprimées**). → Réintroduire spatk/spdef et
  choisir le camp offensif/défensif selon le type de l'attaque ou la meilleure
  stat offensive du Pokémon.
- **STAB absent** (Same-Type Attack Bonus ×1.5 quand le type de l'attaque =
  type du Pokémon). Mécanique Pokémon fondamentale, facile à ajouter.
- **Seul `types[0]` est considéré** pour l'attaque ET la défense. Les Pokémon
  double-type sont donc mal calculés en attaque (on ignore leur 2e type) — la
  défense, elle, passe bien `defender.types` complet à
  `calculateTypeEffectiveness`, donc c'est incohérent.
- Crit à 12% × 1.5 : ok, mais pourrait être affiché dans le combat visuel.

### 🟠 1.3 Stats compressées arbitrairement
`createRunPokemon` applique des coefficients magiques :
`hp ×0.35, atk ×0.4, def ×0.35, spd ×0.4` sur `base × levelMult`.
Ces multiplicateurs « au feeling » écrasent les écarts entre Pokémon (un
légendaire et un commun finissent proches). → Recommander une formule inspirée
des vrais jeux (même simplifiée) à partir des **BST réels** plutôt que de
`BASE_STATS_BY_RARITY` (qui met tous les Pokémon d'une rareté au même niveau —
un Roucool et un Nidoran commun ont les mêmes stats, ce qui tue la diversité de
draft). Utiliser les stats individuelles déjà présentes dans le jeu principal.

---

## 2. CARTE & PROGRESSION

### 🟢 2.1 Génération de carte — bien faite
20 rangées, 1–3 nœuds/rangée, connexions « en éventail » cohérentes (chaque
nœud relie 1–3 nœuds de la rangée suivante selon la position). Gyms aux rangées
paires, Elite Four rangée 18, Champion rangée 19. C'est propre et lisible.
**À garder.**

### 🟠 2.2 20 rangées = run très longue
Avec 8 gyms + Elite + Champion sur 20 rangées, une run complète demande ~20
combats automatiques minimum. Si chaque combat est rejoué visuellement, ça peut
devenir long. → Prévoir un **bouton "passer l'animation"** (skip vers le
résultat) ET envisager de raccourcir à 12–15 rangées, ou rendre la longueur
configurable selon la difficulté choisie.

### 🟡 2.3 Pas de visibilité sur le contenu des nœuds à venir
Le joueur choisit son chemin mais ne sait pas ce que valent les branches.
Dans les bons roguelikes (Slay the Spire), on **voit toute la carte** et on
planifie sa route (passer par un soin avant un boss, viser les nœuds objet).
→ Vérifier que la carte montre bien tous les types de nœuds à l'avance
(le code stocke `type` par nœud, donc l'info est là — question de rendu).

### 🟡 2.4 `checkRunEvolution` à moitié branchée
La fonction gère l'évolution par niveau mais le bloc pierre de lune
(`pokemon.id === 133 && moon_stone`) `return null` sans rien faire — code mort.
Les évolutions par pierre en run ne sont pas implémentées. → Soit finir, soit
retirer le bloc trompeur.

---

## 3. ÉCONOMIE & RÉCOMPENSES DE RUN

### 🟠 3.1 Récompenses de victoire fixes
`victoryCoins: 2500, victoryXp: 500` en dur, quelle que soit la performance.
Aucune récompense scalée sur : nombre de badges obtenus, Pokémon capturés en
route, Pokémon survivants, vitesse. → Une run où tu perds 5 Pokémon et une où
tu finis sans dégâts rapportent pareil. Récompenser la performance (bonus par
badge, par survivant, par capture) donnerait du sens aux choix de route.

### 🟡 3.2 Le pity expédition existe mais à vérifier
`gameState.rogue.pityCounter` est incrémenté (app.js:14513) et reset
(app.js:13938), avec `EXPEDITION_CONFIG.pityBonus`. Bon réflexe de design.
→ Vérifier que le bonus de pity est lisible par le joueur (« plus tu perds,
plus la prochaine run est généreuse »).

### 🟡 3.3 Items de run vs objectif
Les objets tenus (TYPE_ITEMS +50% par type, quick_claw, kings_rock, lucky_egg)
sont bien là. Mais `equipItemToTeam` assigne au **premier Pokémon sans objet**
automatiquement — le joueur ne **choisit pas** qui équipe quoi. → Laisser le
joueur assigner manuellement (tap sur un Pokémon de l'équipe), c'est un levier
stratégique gratuit.

---

## 4. POLISH / DIVERS

- 🟡 **4.1 Émojis dans NODE_META** (`🌿 👤 🔴 📦 🏥 🔄 ⚔️`). Cohérent avec ta
  volonté de tout passer en sprites PokéAPI : remplacer par des sprites d'items
  (poke-ball, potion, town-map…) comme tu l'as demandé pour le reste du jeu.
- 🟡 **4.2 Nœud "trade" (échange)** : présent dans la génération mais vérifier
  qu'il apporte un vrai choix intéressant (sinon le fusionner avec "event").
- 🟡 **4.3 `maxTurns = 100`** : si deux équipes tankent, le combat peut tourner
  longtemps avant le cap. Peu probable vu la formule, mais un combat qui atteint
  100 tours devrait trancher au % de HP restant, pas se terminer en `won=false`
  arbitraire (enemyIdx jamais < 0).
- 🟢 **4.4 Tickets quotidiens (5/jour)** : bon gating, cohérent avec le reste.

---

## 5. PRIORITÉS POUR CLAUDE CODE

1. **🔴 Combat visuel** (§1.1) — c'est LE point qui sépare « logs » de
   « Pokelike ». Refonte de `showBattlePanel` + enrichir le retour de
   `simulateAutoBattle` en données structurées.
2. **🟠 Formule de dégâts** (§1.2) — STAB, spatk/spdef, double-type. Rend les
   matchups vrais et le draft signifiant.
3. **🟠 Stats individuelles** (§1.3) — sortir de `BASE_STATS_BY_RARITY`, utiliser
   les vraies stats pour diversifier les Pokémon.
4. **🟠 Récompenses scalées** (§3.1) + **assignation manuelle d'objets** (§3.3).
5. **🟡 Sprites au lieu d'émojis** (§4.1), évolutions pierre (§2.4), carte
   planifiable (§2.3).

Le squelette est bon. Le travail est de rendre le combat **lisible et juste** —
le reste est du polish incrémental.
