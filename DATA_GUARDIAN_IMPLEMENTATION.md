# 🛡️ PROTOCOLE "DATA GUARDIAN" - PLAN D'IMPLÉMENTATION COMPLET

## 📋 VUE D'ENSEMBLE

Implémentation d'un système de combat de Boss (Data Guardians) au tour par tour (3vs1) inspiré de Summoners War, avec :
- Moteur ATB (Attack Time Bar) dynamique
- Système d'archétypes pour les skills
- UI cyber-espace avec effets de corruption
- Lore Files et décryptage
- Économie unifiée (Labo → EO → Tickets → Boss → Récompenses)

---

## 🎯 PHASE 1 : FONDATIONS (Structure de données)

### 1.1 Structure BattleUnit
- Conversion Pokémon → BattleUnit avec stats calculées
- Formule : `Stats = Base * (1 + BuddyMultiplier) * TypeBonus`
- Stats : HP, ATK, DEF, SPD, CRIT_RATE (15% base), CRIT_DMG (50% base)

### 1.2 Mapping Archétypes
- Créer `POKEMON_ARCHETYPES` : Map ID → Archétype
- 4 archétypes : Attacker, Tank, Support, Disruptor
- Génération automatique des skills selon archétype

### 1.3 Base de données Boss
- `BOSS_DATA` : Liste des Data Guardians
- HP multiples (phases), Skills, Récompenses, Lore Files

---

## 🎯 PHASE 2 : MOTEUR DE COMBAT

### 2.1 Système ATB
- Boucle de tick : `atb += SPD * 0.07` par tick
- Quand `atb >= 100` → Tour de l'unité
- Pause automatique pour actions joueur

### 2.2 Table des Types
- Avantage : +20% Dégâts, +15% Crit
- Désavantage : -20% Dégâts, risque Glancing Hit
- Trinité : Feu > Plante > Eau > Feu

### 2.3 Calcul de Dégâts
- Base : `ATK * SkillMultiplier`
- Type : Avantage/Désavantage
- Crit : `Dégâts * 1.5` si critique
- Glancing : Dégâts réduits de 50%

---

## 🎯 PHASE 3 : UI & VISUEL

### 3.1 Page de Sélection
- Liste des Boss disponibles
- Récompenses affichées
- Bouton "COMPILE & FIGHT"

### 3.2 Team Builder
- 3 slots d'équipe
- Filtres (Type, Buddy Level)
- Indicateur de puissance

### 3.3 Arène de Combat
- Timeline en haut (portraits ATB)
- Zone Boss (droite, avec corruption)
- Zone Équipe (gauche, unité active + support)
- Control Deck (bas, skills)

### 3.4 Effets Visuels
- Filtres CSS corruption (grayscale, sepia, hue-rotate)
- Animations glitch
- Particules et feedback

---

## 🎯 PHASE 4 : LORE & ÉCONOMIE

### 4.1 Lore Files
- Drop après victoire (RNG)
- Format : `journal_chen_404.enc`
- Stockage dans inventaire Key Items

### 4.2 Terminal de Décryptage
- Module dans Labo
- Coût EO pour décrypter
- Popup narrative
- Bonus passif débloqué

### 4.3 Économie Unifiée
- Labo produit EO
- Shop Labo : Firewall Key (5000 EO)
- Boss drop : Shiny Tokens, Ancient Data, Lore Files
- Boucle complète : Labo → Tickets → Boss → Récompenses → Améliorations

### 4.4 Refonte Sémantique
- Garder noms Balls
- Ajouter suffixes techniques (v1.0.exe, ROOT_ACCESS)
- Réécrire descriptions (thème data)

---

## 📁 STRUCTURE DES FICHIERS

### Modifications
- `app.js` : Toutes les fonctions de combat, structures de données
- `index.html` : Page boss-battle, CSS cyber-espace
- `style.css` : Styles combat (ou inline)

### Nouveaux (optionnels)
- `data/boss_data.js` : Données des Boss
- `data/archetypes_data.js` : Mapping archétypes
- `data/lore_files_data.js` : Lore Files

---

## 🔄 FLUX DE GAMEPLAY

1. **Labo** → Production EO
2. **Shop Labo** → Achat Firewall Key (5000 EO)
3. **Menu Boss** → Sélection Data Guardian
4. **Team Builder** → Sélection 3 Pokémon
5. **Combat** → ATB, Skills, Tours
6. **Victoire** → Récompenses + Lore File (chance)
7. **Labo Terminal** → Décryptage Lore File (coût EO)
8. **Bonus Passif** → Débloqué et appliqué
9. **Boutique** → Utilisation Shiny Tokens
10. **Capture** → Retour à la source

---

## ✅ CHECKLIST D'IMPLÉMENTATION

### Phase 1
- [ ] Structure BattleUnit
- [ ] Mapping archétypes
- [ ] Base de données Boss
- [ ] Calcul de stats dynamique

### Phase 2
- [ ] Moteur ATB
- [ ] Table des types
- [ ] Calcul de dégâts
- [ ] IA Boss

### Phase 3
- [ ] UI sélection équipe
- [ ] UI combat
- [ ] Effets visuels
- [ ] Animations

### Phase 4
- [ ] Système Lore Files
- [ ] Terminal décryptage
- [ ] Bonus passifs
- [ ] Économie unifiée
- [ ] Refonte sémantique

---

**Date** : 2024
**Version** : 1.0
**Statut** : En cours

