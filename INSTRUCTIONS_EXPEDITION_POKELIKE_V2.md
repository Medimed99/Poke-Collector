# INSTRUCTIONS CLAUDE CODE — Refonte mode Expédition (cible : PokeLike.xyz)

Repo `Medimed99/Poke-Collector`. Fichiers : `expedition_pokelike.js` (rendu),
`expedition_battle.js` (combat), `style.css` (classes `.pl-*`), `index.html`
(`#expedition-container` ligne 1557).

## Diagnostic (vérifié dans le code + comparé aux captures PokeLike)

PokeLike (cible) = **une seule colonne plein écran** : un bandeau de combat
compact en HAUT (fixe), puis la carte verticale qui scrolle en dessous. Départ
EN HAUT, on descend. Pas de sidebars. Lisible, dense, immédiat.

Notre jeu (3 problèmes structurels) :
1. **Layout 3 colonnes desktop plaqué sur mobile.** `.pl-run` est une
   `grid-template-columns: 200px 1fr 180px` (TEAM | carte | ITEMS/BADGES). En
   media query mobile, les colonnes passent en `order:1/2/3` empilées
   verticalement → il faut scroller très bas pour voir équipe/combat. PokeLike
   n'a PAS de sidebars.
2. **Carte étirée + nœuds emmêlés.** `.pl-map-nodes` a `min-height:900px` mais
   le SVG `.pl-map-lines` est positionné sur `.pl-map-area` (`min-height:480px`)
   en `inset:0`. → **Deux référentiels de hauteur différents** : les lignes ne
   tombent jamais sur les nœuds. (Le commentaire "référentiel unique" est faux
   dans les faits.)
3. **Départ en bas.** `getY = (1 - row/maxRow)*88+4` inverse exprès. PokeLike
   commence en haut.

---

## FIX 1 — Sortir l'Expédition du flux de page (plein écran)

Le `#expedition-container` est une `.container` dans le flux normal, sous le
hub → c'est la cause nº1 du "scroll vers le bas pour jouer".

**À faire** : quand une run est active (`runState.active`), la vue Expédition
doit être un **overlay plein écran** (position fixed, 100dvh), pas un bloc dans
la page. Soit :
- ajouter une classe `pl-fullscreen` sur `#expedition-container` au lancement
  de la run (et la retirer au retour au hub), avec :
```css
#expedition-container.pl-fullscreen {
    position: fixed;
    inset: 0;
    z-index: 50;              /* sous la nav du bas si elle reste, sinon au-dessus */
    height: 100dvh;
    overflow: hidden;        /* le scroll se fait DANS la carte, pas la page */
    background: #0d1410;
    display: flex;
    flex-direction: column;
}
```
- au lancement (`startRunWithStarter`), `window.scrollTo(0,0)` puis ajouter la
  classe ; au `endPokelikeRun`/retour hub, la retirer.

**Résultat attendu** : dès qu'on lance une run, on est en plein écran, sans
jamais scroller la page. Tout le contenu de jeu tient dans le viewport.

---

## FIX 2 — Layout vertical mono-colonne (comme PokeLike)

Remplacer la grille 3 colonnes par un **empilement vertical simple** :

```
┌──────────────────────────┐
│  BANDEAU COMBAT (haut)    │  ← fixe, compact : sprites + datbox HP
├──────────────────────────┤
│                          │
│   CARTE (scroll vertical) │  ← prend tout l'espace restant
│                          │
└──────────────────────────┘
```

**À faire dans `renderRunUI`** : abandonner `.pl-run` 3 colonnes. Nouvelle
structure :
```html
<div class="pl-screen">
  <div class="pl-topbar">          <!-- compact, toujours visible -->
    <!-- En exploration : mini-résumé équipe (sprites + HP en ligne) + badges X/8 -->
    <!-- En combat : la datbox de combat (voir FIX 4) -->
  </div>
  <div class="pl-map-scroll">       <!-- flex:1, seul élément qui scrolle -->
    ${renderMapCanvas()}
  </div>
</div>
```
```css
.pl-screen { display:flex; flex-direction:column; height:100%; }
.pl-topbar { flex:0 0 auto; /* hauteur auto, contenu compact */ }
.pl-map-scroll { flex:1 1 auto; overflow-y:auto; position:relative; }
```

**Supprimer les sidebars** TEAM / ITEMS / BADGES en colonnes. Les remplacer par :
- **Équipe** : une rangée horizontale compacte de mini-sprites + barres HP dans
  le `.pl-topbar` (comme PokeLike montre l'équipe en haut). Tap = détails.
- **Items / Badges** : accessibles via un petit bouton/onglet (icône) qui ouvre
  un panneau en overlay, PAS une colonne permanente. Sur PokeLike l'écran de
  jeu est épuré ; les détails sont à la demande.

---

## FIX 3 — Carte : référentiel unique, départ en haut, lisible

### 3a. Un seul référentiel de hauteur (corrige les nœuds emmêlés)
Le SVG des lignes et les nœuds doivent vivre dans le MÊME conteneur avec la
MÊME hauteur. `renderMapCanvas` met déjà SVG + nœuds dans `.pl-map-nodes` —
donc forcer le SVG à 100% de `.pl-map-nodes` (et non `.pl-map-area`) :
```css
.pl-map-nodes { position:relative; height: var(--map-h); }  /* hauteur calculée */
.pl-map-lines { position:absolute; inset:0; width:100%; height:100%; }
```
Calculer `--map-h` = `mapRows * espacement` (ex. 14 rangées × 80px = 1120px) et
l'appliquer au conteneur. Les `y` des nœuds ET des lignes utilisent la même base
(% de cette hauteur). Vérifier visuellement que chaque ligne relie bien deux
nœuds.

### 3b. Départ en HAUT (comme PokeLike)
Inverser `getY` :
```js
// row 0 (départ/Pokémon Center) en HAUT, dernière rangée (Champion) en BAS
const getY = row => (row / maxRow) * 92 + 4;
```
Et l'auto-scroll initial doit pointer **en haut** (`scrollTop = 0`), puis suivre
le nœud courant à mesure qu'on descend.

### 3c. Réduire l'étirement + densité lisible
- Passer `mapRows: 20` → **14** (runs plus lisibles, moins étirées). Ajuster
  `gymRows` en conséquence (ex. [2,4,6,8,10,12] + elite 13 + champion 13… à
  recalibrer selon le nb de badges visés).
- Espacement vertical constant et raisonnable (~80px/rangée) pour que 2-3
  rangées soient visibles à l'écran à la fois, comme PokeLike.
- `getNodeX` : garder 10%–90% mais s'assurer que les colonnes sont alignées
  verticalement entre rangées (PokeLike a des colonnes nettes, pas des nœuds
  qui flottent à des X aléatoires). Idéalement : positions de colonnes FIXES
  (ex. pour 3 nœuds : 20% / 50% / 80% toujours), pour un treillis régulier.

### 3d. Connexions courtes (pas de zigzag)
Ne relier que les nœuds **horizontalement proches** de la rangée suivante
(distance X faible), pour des pointillés courts et lisibles. Aucune ligne ne
doit traverser toute la largeur. (Voir la logique de tri par proximité déjà
suggérée précédemment.)

### 3e. Nœuds : garder les sprites, soigner les 4 états
Les sprites PokeAPI sur les nœuds sont bons (Pokémon pour combats, items pour
capture/objet/soin). Garder, mais rendre les **4 états** très lisibles :
- **courant** : marqueur évident (anneau lumineux / flèche au-dessus),
- **disponible** : pleine couleur + halo + pulsation,
- **complété** : estompé + coché,
- **verrouillé** : sombre/désaturé.
(Le code a déjà ces classes — renforcer le contraste visuel entre elles.)

---

## FIX 4 — Combat : bandeau en HAUT (pas un panneau sous la carte)

Actuellement `showBattlePanel` passe l'arène en `extraPanel`, inséré SOUS la
carte → il faut scroller pour voir le combat. Sur PokeLike (capture combat), le
**combat occupe le HAUT de l'écran** (deux datbox + sprites), la carte reste
visible/derrière.

**À faire** : pendant un combat, afficher l'arène dans le `.pl-topbar` (haut
fixe) OU en overlay plein écran dédié — mais **visible immédiatement sans
scroll**. Garder ce qui marche déjà : sprites animés PokeAPI, datbox HP,
barres qui descendent (`pl-hp-bar`), bouton "Passer". Le rejeu pas-à-pas est
déjà là — juste le **repositionner en haut** et s'assurer qu'il est dans le
viewport au déclenchement.

Vérifier aussi : le message de combat (`Racaillou inflige 50 pts à Carapuce`)
est bien lisible et les barres de vie s'animent à chaque coup (déjà partiellement
fait). Garder le bouton "Passer" pour les runs longues.

---

## FIX 5 — Événements (capture/objet/soin) : en overlay, pas sous la carte

Même principe que le combat : l'"Opportunité de capture" (Salamèche veut
rejoindre) et les events s'affichent actuellement sous la carte (scroll requis).
Les passer en **modal/overlay centré** (position fixed, centré viewport) pour
qu'ils soient immédiatement visibles et actionnables. Réutiliser le système
`.modal-overlay` global s'il existe (vérifier qu'il a bien `position:fixed`).

---

## Ordre de travail (commits séparés, test local + push à chaque étape)
1. **FIX 1** (plein écran) — supprime le problème nº1 (scroll). Impact immédiat.
2. **FIX 2** (mono-colonne, virer les sidebars) — la structure PokeLike.
3. **FIX 4 + FIX 5** (combat & events en haut/overlay) — plus de scroll pour
   jouer.
4. **FIX 3** (carte : référentiel unique + départ haut + densité) — le rendu
   visuel PokeLike.

## Garde-fous (bugs déjà rencontrés sur ce projet)
- Tester sur viewport mobile réel (≤480px) ET desktop après chaque fix.
- Ne pas casser la sauvegarde ni l'état de run en cours.
- `expedition_pokelike.js` et `expedition_battle.js` peuvent partager des
  fonctions globales — vérifier qui appelle quoi avant de renommer/déplacer.
- Sprites via PokeAPI uniquement, pas d'émoji dans les nouvelles UI (remplacer
  les `NODE_META.icon` émojis restants par sprites si présents).
- Pour tout bug, reproduire + diagnostiquer (console, code non minifié), pas de
  devinette.

## Critère de réussite (comparer à pokelike.xyz)
Lancer une run → on est immédiatement en plein écran, le combat/équipe est en
HAUT sans scroller, la carte verticale part du HAUT, les chemins sont clairs
(nœuds reliés proprement, 4 états lisibles), et l'ensemble tient dans le
viewport mobile comme sur PokeLike. Plus aucun "scroll vers le bas pour jouer".
