# 📊 PLAYER FLOW COMPLET - POKÉMON 1511

## 🎬 PHASE 0 : INTRODUCTION

### Séquence d'intro
1. **Écran de démarrage** : "NOUVELLE PARTIE"
2. **Phase 1 - Prof Chen** : Dialogue rétro avec animation Pokémon (Gengar)
3. **Phase 2 - Terminal** : Séquence de boot système
4. **Phase 3 - Porygon-Z** : 
   - Dialogue avec Porygon
   - **Saisie du nom** (identifiant, max 12 caractères)
   - Messages de confirmation : "Identité confirmée", "Accès système : ACCORDÉ", etc.
   - **Bouton "INITIALISATION"** apparaît
   - Clic → Fondu de disparition de l'overlay
   - Apparition en fondu de la page de capture

### État initial
- **Niveau** : 1
- **XP** : 0 / 250 XP
- **Coins** : 3000
- **Glitch Level** : 1.0 (CRITIQUE - Glitch fort)
- **Région** : Kanto uniquement
- **Inventaire de départ** : 50 Pokéballs, 20 Super Balls, 10 Hyper Balls, 1 Master Ball

---

## 🎯 NIVEAU 1 : DÉBUT DE L'AVENTURE

### Objectifs principaux
- **Capturer des Pokémon** pour gagner de l'XP et stabiliser le système
- **Réduire le glitch** en capturant des Pokémon Kanto
- **Comprendre les mécaniques de base**

### Système de Glitch (Niveau 1)
- **État** : CRITIQUE (glitchLevel = 1.0)
- **Effet visuel** : Animation glitch forte, filtre de couleur, contraste élevé
- **Progression** : `glitchLevel = 1.0 - (kantoCaught / 151)`
- **Objectif** : Capturer des Pokémon Kanto pour réduire le glitch

### Mécaniques disponibles
- ⚾ **Capture** : Système principal de progression
  - Taux de rareté : Commun (55%), Peu Commun (25%), Rare (12%), Super Rare (6%), Légendaire (2%)
  - XP gagné : Commun (10), Peu Commun (20), Rare (50), Super Rare (100), Légendaire (200)
  - Coins gagnés : Variable selon rareté
  - Streak : Système de chaîne (meilleur streak enregistré)

### Quêtes disponibles
- **Première Capture** : 1 Pokémon → 500💰 + 50 XP + 10 Pokéballs
- **Éclosion Mystère** : 50 Pokémon → 2000💰 + 500 XP + 1 Œuf Mystère
- **Centuple Capture** : 100 Pokémon → 5000💰 + 500 XP + 1 Rare Box

### Progression XP
- **Niveau 1 → 2** : 250 XP requis
- **Formule** : `xpToNext = level * 250`

### Événements narratifs
- **1ère capture** : Trigger "first_data_restored"
- **50 captures** : Trigger "system_stabilizing"
- **100 captures** : Trigger "memory_returning"
- **150 captures** : Trigger "missing_link"

---

## 🎣 NIVEAU 2 : DÉBLOCAGE DE LA PÊCHE

### Déblocage
- **Condition** : Atteindre le niveau 2
- **Notification** : "🎣 Pêche débloquée au niveau 2!"
- **Narrative** : "unlock_fishing_module"

### Nouvelles mécaniques
- 🎣 **Pêche** : 
  - Jetons de pêche : 10 au départ, régénération automatique
  - Pool spécialisé : Pokémon Eau uniquement
  - Taux de rareté améliorés pour les Pokémon Eau
  - Guide narratif : "guide_fishing_first"

### Récompenses niveau 2
- 1300💰 + 1 Framby

### Système de Glitch (Niveau 2-4)
- **État** : INSTABLE (glitchLevel entre 0.7 et 0.3)
- **Effet visuel** : Glitch moyen, filtre sepia léger
- **Transition** : Quand glitchLevel < 0.7

### Quêtes quotidiennes débloquées
- **Faciles** : Capturer 5/10 Pokémon, Gagner 1000 coins, 15 échecs
- **Moyennes** : Capturer 20 Pokémon, Pêcher 3 Pokémon, Gagner 2000 coins, 1 Shiny, 2 Rares

---

## ✨ NIVEAU 3 : DÉBLOCAGE DES QUÊTES

### Déblocage
- **Condition** : Atteindre le niveau 3
- **Notification** : Module Quêtes débloqué
- **Narrative** : "unlock_quests_module" + "guide_quests"

### Nouvelles mécaniques
- ✨ **Système de Quêtes** :
  - **Quotidiennes** : Générées chaque jour (pool easy/medium/hard/expert)
  - **Spéciales** : Quêtes uniques avec récompenses importantes
  - **Permanentes** : Objectifs à long terme, répétables

### Quêtes spéciales disponibles
- **Shiny Hunter** : 10 Shinies → 15000💰 + 2000 XP + Lucky Charm + Rare Box
- **Chasseur d'Étoiles** : 3 Légendaires → 10000💰 + 1000 XP + Legendary Radar

### Récompenses niveau 3
- 1300💰 + 5 Pokéballs

---

## 🔬 NIVEAU 5 : DÉBLOCAGE DU LABO DE RECHERCHE

### Déblocage
- **Condition** : Atteindre le niveau 5
- **Narrative** : "unlock_research_core"

### Nouvelles mécaniques
- 🔬 **Labo de Recherche** :
  - **Système d'Énergie Onirique (EO)** : Monnaie principale du labo
    - Production passive automatique basée sur les Pokémon placés
    - Production active par clics
    - Synergies entre types de Pokémon augmentent la production
  
  - **Habitats** : Zones pour placer les Pokémon
    - **Jardin** : Grille principale (9 plots de base, extensible jusqu'à 36)
    - **Centrale Électrique** : Débloquée via Tech Tree (Hydro-Refroidissement)
    - Types de sols : Argile (1.0x), Gravier (0.8x), Fertilisant (1.5x), Terreau Riche (2.0x)
  
  - **Tech Tree** : Arbre de recherche avec upgrades permanents
    - **Node 101 - Réseau Mycélien** : Types Plante boostent Insecte adjacents +50%
    - **Node 102 - Hydro-Refroidissement** : Débloque Centrale +20% production Eau
    - **Node 103 - Symbiose Végétale** : Pokémon Plante +30% si adjacents à une Baie
    - **Node 201 - Overclock Permanent** : +5% production passive globale
    - Coûts en EO : 1000-10000 EO selon le node
  
  - **Anomalies (Glitchs)** : Effets temporaires à collecter
    - **Frenzy** : Production x7 pendant 77s (commun, 40% spawn)
    - **Click Frenzy** : Clic x777 pendant 13s (rare, 20% spawn)
    - **Synergie de Type** : Production x(1 + 0.1 × Nb Pokémon Type X) pendant 30s (peu commun, 30% spawn)
    - **Chaîne Glitch** : Série rapide de clics bonus (rare, 10% spawn, disparaît en 3s)
  
  - **Production de Baies** : Conversion EO → Baies
    - Terminal > Production
    - Coûts variables selon le type de baie
  
  - **Automatisation** :
    - **Chercheurs** : Auto-clic automatique (achat en EO)
    - **Auto-Clickers** : Production passive supplémentaire
  
  - **Système de Prestige (Deepnet)** :
    - **Hard Reset** : Reboot système après 1,000,000 EO produite
    - **Ancient Data** : Monnaie de prestige (formule : ∛(Total EO / 1,000,000))
    - **Upgrades Permanents** :
      - **Overclock Permanent** : +1% efficacité par niveau (max 100)
      - **Slot de Sauvegarde** : Garder 1-3 plantes après reset (max 3)
      - **Boost Ancestral** : +5% multiplicateur passif par niveau (max 20)
      - **Expansion du Jardin** : +3 plots par niveau (max 9 = 27 plots supplémentaires)
      - **Boost de Mutation** : +10% chance de mutation par niveau (max 10)
    - Multiplicateur passif permanent : +10% par Ancient Data

### Système de Glitch (Niveau 5-9)
- **État** : STABLE (glitchLevel < 0.3)
- **Effet visuel** : Glitch léger, filtre sepia très léger
- **Transition** : Quand glitchLevel < 0.3

### Récompenses niveau 5
- 1500💰 + 5 Super Balls

### Événements narratifs
- **Niveau 6-7** : "rival_search_failed" (recherche du rival échoue)

---

## 🎁 NIVEAU 4 : DÉBLOCAGE DES BLIND BOXES

### Déblocage
- **Condition** : Atteindre le niveau 4
- **Narrative** : "unlock_blindbox"

### Nouvelles mécaniques
- 🎁 **Blind Boxes** :
  - 5 slots disponibles (recharge automatique)
  - Taux améliorés : Peu Commun (60%), Rare (25%), Super Rare (12%), Légendaire (3%)
  - Système de Pity : 0/20 vers Légendaire garanti
  - Historique des ouvertures
  - Guide narratif : "guide_blindbox_first"

### Récompenses niveau 4
- 1400💰 + 1 Pinap

---

## 🃏 NIVEAU 10 : DÉBLOCAGE DU POKÉ-POKER

### Déblocage
- **Condition** : Atteindre le niveau 10
- **Narrative** : "unlock_decryption" + "guide_poker_first"

### Nouvelles mécaniques
- 🃏 **Poké-Poker** :
  - Mode roguelike avec Antes (1-8)
  - Système de Jokers (cartes spéciales)
  - Badges à débloquer (8 Antes pour débloquer la Ligue)
  - Économie de Shiny Tokens
  - Glitch Draw (transformation en Joker)

### Système de Glitch (Niveau 10+)
- **État** : OPTIMISÉ (glitchLevel très bas)
- **Effet visuel** : Presque propre, pas d'animation
- **Transition** : Quand niveau >= 10

### Récompenses niveau 10
- 2000💰 + 2 Hyper Balls

---

## 🗺️ NIVEAU 12 : DÉBLOCAGE DE L'EXPÉDITION (ROGUELIKE)

### Déblocage
- **Condition** : Atteindre le niveau 12
- **Narrative** : "unlock_deepnet" + "guide_expedition_first"

### Nouvelles mécaniques
- 🗺️ **Expédition Arcanes** :
  - Mode roguelike avec 10 étages
  - Système de Buddy (compagnon)
  - Chaînes de capture (shiny bonus)
  - Événements : Rencontres, Coffres, Sanctuaires, Marchands, Pièges, Puzzles
  - Tickets d'expédition (régénération quotidienne)
  - Shiny Tokens comme monnaie
  - Système de Full Clear (objectif)

### Système de Glitch (Niveau 12+)
- **État** : AVANCÉ (glitchLevel minimal)
- **Effet visuel** : Interface propre, pas de glitch
- **Transition** : Quand niveau >= 12

### Récompenses niveau 12
- 2200💰 + 3 Framby

### Quêtes spéciales
- **Maître Explorateur** : 10 Full Clear → 10000💰 + 1000 XP + 50 Shards

---

## 🏆 NIVEAU 15 : MILESTONE IMPORTANT

### Récompenses niveau 15
- 2500💰 + 3 Hyper Balls + 1 Œuf Mystère

### Progression Kanto
- **50 captures Kanto** : Système se stabilise
- **100 captures Kanto** : Mémoires reviennent
- **150 captures Kanto** : Lien manquant détecté
- **151/151 Kanto** : **DÉBLOCAGE DE JOHTO** 🎉

---

## 🌋 DÉBLOCAGE DE JOHTO (151/151 Kanto)

### Condition
- **Compléter le Pokédex Kanto** : 151/151 Pokémon

### Déblocage
- **Notification** : "🎉 Région Johto débloquée !"
- **Narrative** : "system_reboot_johto"
- **Phase système** : "KANTO_RECOVERY"

### Nouvelles possibilités
- **Pokémon Johto** : IDs 152-251 (100 Pokémon)
- **Nouvelle région** dans le Pokédex
- **Quête spéciale** : "Compléter Kanto" → 25000💰 + 1500 XP + Super Rare Box + Badge "Kanto Collector"

### Progression Glitch
- **Glitch Level** : Réduit significativement (Kanto complété)
- **Intégrité système** : 100% pour Kanto

---

## 🗺️ NIVEAU 20 : EXPÉDITION AVANCÉE

### Condition supplémentaire
- **Niveau 20** + **Johto débloqué** → Module Expédition avancé (si pas déjà débloqué)

### Récompenses niveau 20
- 3000💰 + 1 Master Ball

### Progression
- **Buddy System** : Niveaux 1-20 disponibles
- **Talents Buddy** : Débloqués aux niveaux 3, 6, 10, 15, 20

---

## 🌊 DÉBLOCAGE DE HOENN (100/100 Johto)

### Condition
- **Compléter le Pokédex Johto** : 100/100 Pokémon (IDs 152-251)

### Déblocage
- **Notification** : "🎉 Région Hoenn débloquée !"
- **Narrative** : "system_reboot_hoenn"
- **Mise à jour** : "SYSTÈME JOHTO : RESTAURÉ. Mise à jour v3.0 installée."

### Nouvelles possibilités
- **Pokémon Hoenn** : IDs 252-386 (135 Pokémon)
- **Nouvelle région** dans le Pokédex
- **Archives plus profondes** : Hoenn est plus difficile

---

## 🎴 NIVEAU 25 : DÉBLOCAGE DU TCG (ARCHIVES)

### Déblocage
- **Condition** : Atteindre le niveau 25
- **Narrative** : "unlock_archives" + "guide_tcg_first"

### Nouvelles mécaniques
- 🎴 **Archives TCG** :
  - Système de cartes à collectionner
  - Défis spéciaux
  - Collection complète

### Récompenses niveau 25
- 3500💰 + 5 Hyper Balls

---

## 📈 NIVEAUX 25-50 : PROGRESSION AVANCÉE

### Système de progression
- **XP requis** : `level * 250` (ex: Niveau 30 = 7500 XP)
- **Niveau maximum** : 50 (plafond)
- **Récompenses** : Augmentation progressive de coins et items

### Récompenses clés
- **Niveau 27** : Exp Charm (boost XP permanent)
- **Niveau 28** : Lucky Charm (boost shiny)
- **Niveau 29-33** : Pierres d'évolution (Fire, Water, Thunder, Moon, Leaf)
- **Niveau 50** : Charm Collection + Ultra Box (récompense finale)

### Quêtes permanentes importantes
- **Millennial** : 1000 captures → 50000💰 + 3000 XP + Super Rare Box + Charm Collection
- **Maître de Streak** : Streak de 50 → 10000💰 + 1000 XP + Lucky Charm
- **Légendaire +5** : 5 Légendaires → 20000💰 + 2000 XP + Legendary Radar + Ultra Box
- **Maître de l'Expédition** : 50 runs roguelike → 25000💰 + 2000 XP + Legendary Radar

---

## 🎯 OBJECTIFS FINAUX & ENDGAME

### Objectifs de collection
1. **Pokédex Kanto** : 151/151 ✅
2. **Pokédex Johto** : 100/100 ✅
3. **Pokédex Hoenn** : 135/135 ✅
4. **Total** : 386 Pokémon disponibles

### Objectifs de progression
- **Niveau maximum** : 50
- **Glitch Level** : 0.0 (système complètement stabilisé)
- **Intégrité système** : 100% pour toutes les régions
- **Phase système** : "KANTO_RECOVERY" → "JOHTO_RECOVERY" → "HOENN_RECOVERY"

### Systèmes endgame
- **Poké-Poker** : Compléter les 8 Antes + Ligue
- **Expédition** : Full Clear répétés, Buddy niveau 20
- **Quêtes** : Toutes les quêtes permanentes complétées
- **Shinies** : Collection complète
- **Légendaires** : Tous les légendaires capturés
- **Labo de Recherche** : Prestige multiple, Ancient Data accumulé

### Métriques de fin de jeu
- **Total capturé** : 1000+ (quête Millennial)
- **Shinies** : 10+ (quête Shiny Hunter)
- **Légendaires** : 5+ (quête Légendaire +5)
- **Streak** : 50+ (quête Maître de Streak)
- **Runs Expédition** : 50+ (quête Maître de l'Expédition)

---

## ⚠️ COMBAT FINAL : MISSINGNO (BOSS ENDGAME)

### Déclenchement
- **Condition** : Compléter le Pokédex Kanto (151/151)
- **Trigger** : Automatique après la 151ème capture
- **Délai** : 2 secondes après l'animation de capture

### Contexte narratif
- **Trame** : MissingNo a causé la perte de données du jeu Pokémon
- **Événement** : MissingNo apparaît dans le dernier fichier Kanto
- **Message Porygon** : "NON ! Il était caché dans le dernier fichier ! Il corrompt la passerelle ! SYSTÈME EN DANGER !"

### Mécaniques du combat
- **Type** : Combat de boss avec DPS automatique
- **HP du Boss** : 500,000 HP
- **Durée estimée** : 5-10 minutes

### Système de combat
1. **DPS Automatique** :
   - Basé sur la production d'Énergie Onirique (EO) du Labo
   - 1 EO/s = 1 DPS
   - Attaque continue tant que le labo produit de l'EO

2. **Attaques Spéciales** :
   - **💾 Attaque Chips** : Sacrifier 10 Chips (Processor Chips) → 10,000 dégâts
   - **🍓 Attaque Baies** : Sacrifier 5 Baies → 5,000 dégâts
   - Cooldown entre attaques

3. **Effets visuels** :
   - Écran noir initial
   - Animation de glitch sur toute l'interface
   - Tremblement de l'écran (20 fois)
   - Sprite MissingNo animé avec effet glitch
   - Barre de vie avec dégradé magenta

### Récompenses de victoire
- **Badge MissingNo** : Ajouté à l'inventaire (`missingno_badge`)
- **Message de victoire** : "MissingNo a été neutralisé !"
- **Accès** : Bouton pour terminer l'événement

### Stratégie recommandée
- **Préparation** : Accumuler de l'EO au Labo avant de compléter Kanto
- **Ressources** : Stocker des Chips et Baies pour les attaques spéciales
- **Optimisation** : Maximiser la production EO pour augmenter le DPS automatique

---

## 📊 RÉSUMÉ DES DÉBLOCAGES PAR NIVEAU

| Niveau | Déblocage | Mécanique Principale |
|--------|-----------|----------------------|
| **1** | Début | Capture, Glitch CRITIQUE |
| **2** | 🎣 Pêche | Jetons de pêche, Pokémon Eau |
| **3** | ✨ Quêtes | Quotidiennes, Spéciales, Permanentes |
| **4** | 🎁 Blind Boxes | 5 slots, Pity système |
| **5** | 🔬 Labo Recherche | Énergie Onirique, Habitats, Tech Tree, Prestige |
| **10** | 🃏 Poké-Poker | Mode roguelike, Jokers, Badges |
| **12** | 🗺️ Expédition | Roguelike, Buddy, Shiny Tokens |
| **20** | Expédition Avancée | (Si Johto débloqué) |
| **25** | 🎴 Archives TCG | Collection de cartes |

---

## 🌍 DÉBLOCAGES DE RÉGIONS

| Région | Condition | Pokémon | IDs |
|--------|-----------|---------|-----|
| **Kanto** | Début | 151 | 1-151 |
| **Johto** | 151/151 Kanto | 100 | 152-251 |
| **Hoenn** | 100/100 Johto | 135 | 252-386 |

---

## 🎮 SYSTÈME DE GLITCH - PROGRESSION

| Niveau | État Glitch | glitchLevel | Effet Visuel |
|--------|-------------|-------------|--------------|
| **1** | CRITIQUE | 1.0 - 0.7 | Animation forte, filtre couleur |
| **2-4** | INSTABLE | 0.7 - 0.3 | Glitch moyen, sepia |
| **5-9** | STABLE | < 0.3 | Glitch léger, sepia très léger |
| **10-11** | OPTIMISÉ | Très bas | Presque propre |
| **12+** | AVANCÉ | Minimal | Interface propre |

**Formule** : `glitchLevel = 1.0 - (kantoCaught / 151)`

---

## 💰 ÉCONOMIE & RESSOURCES

### Monnaies
- **Coins** : Capture, quêtes, boutique
- **Shiny Tokens** : Expédition, Poké-Poker
- **Énergie Onirique (EO)** : Labo de Recherche

### Items clés
- **Pokéballs** : Capture basique
- **Super Balls** : Meilleur taux
- **Hyper Balls** : Taux élevé
- **Master Ball** : Capture garantie
- **Baies** : Framby, Pinap, Ceriz
- **Charmes** : Exp Charm, Lucky Charm, Charm Collection
- **Pierres d'évolution** : Fire, Water, Thunder, Moon, Leaf

---

## 🎯 QUÊTES IMPORTANTES

### Spéciales (Uniques)
- **Première Capture** : 1 Pokémon
- **Éclosion Mystère** : 50 Pokémon → Œuf Mystère
- **Compléter Kanto** : 151/151 → Badge "Kanto Collector"
- **Shiny Hunter** : 10 Shinies
- **Chasseur d'Étoiles** : 3 Légendaires
- **Maître Explorateur** : 10 Full Clear

### Permanentes (Répétables)
- **Centuple Capture** : 100 Pokémon
- **Millennial** : 1000 Pokémon
- **Maître de Streak** : Streak 50
- **Légendaire +5** : 5 Légendaires
- **Maître de l'Expédition** : 50 runs

---

## 📝 NOTES POUR ENRICHISSEMENT NARRATIF

### Vides de gameplay identifiés
1. **Niveau 4, 6-7, 9, 11, 13-14, 16-19, 21-24, 26-49** : Pas de nouveaux déblocages majeurs
2. **Entre les régions** : Transition narrative possible
3. **Milestones de captures** : 25, 75, 125, etc. (entre les triggers existants)
4. **Progression Buddy** : Moments narratifs possibles
5. **Quêtes quotidiennes** : Peuvent être enrichies narrativement

### Opportunités narratives
- **Événements aléatoires** : Rencontres spéciales, anomalies
- **Histoire du rival** : Recherche échouée (niveau 6-7) → suite possible
- **Progression du système** : Messages Porygon selon l'intégrité
- **Découvertes** : Nouveaux types de Pokémon, zones secrètes
- **Relations Buddy** : Évolution de la relation avec le compagnon

---

*Document généré à partir de l'analyse du code - Version 6.2*

