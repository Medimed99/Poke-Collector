# 📋 PLAN D'IMPLÉMENTATION - SYSTÈME BOSS BATTLE

## 🎯 OBJECTIF
Intégrer un système complet de combat de Boss (Data Guardians) avec :
- UI cyber-espace avec effets de glitch
- Système de Lore Files (fichiers corrompus)
- Terminal de Décryptage dans le Labo
- Unification économique (EO → Tickets → Boss → Shiny Tokens/Ancient Data)
- Refonte sémantique hybride (Balls + suffixe technique)

---

## 📦 ÉTAPES D'IMPLÉMENTATION

### **ÉTAPE 1 : STRUCTURES DE DONNÉES** ✅
- [x] Créer `BOSS_DATA` : Liste des Data Guardians avec HP, récompenses, Lore Files
- [x] Créer `LORE_FILES_DATA` : Fichiers corrompus avec contenu, coût décryptage, bonus
- [x] Créer `BOSS_SKILLS_DATA` : Skills des Pokémon du joueur
- [x] Ajouter `gameState.bossBattle` : État des combats, tickets, Lore Files possédés
- [x] Ajouter `gameState.loreFiles` : Inventaire des fichiers corrompus
- [x] Ajouter `gameState.passiveBonuses` : Bonus passifs débloqués via décryptage

### **ÉTAPE 2 : SYSTÈME DE TICKETS FIREWALL** ✅
- [x] Ajouter "Firewall Key" au shop du Labo (5000 EO)
- [x] Système de stockage des tickets dans `gameState.bossBattle.firewallTickets`
- [x] UI pour afficher les tickets disponibles
- [x] Vérification avant combat

### **ÉTAPE 3 : UI DE COMBAT BOSS** ✅
- [x] Créer page `boss-battle-page` dans index.html
- [x] Implémenter le CSS cyber-espace (grille, scanlines, couleurs)
- [x] Timeline en haut (portraits des unités)
- [x] Zone Boss (droite, avec effets de corruption)
- [x] Zone Équipe Joueur (gauche, avec unité active + support)
- [x] Control Deck (bas, avec skills et cooldowns)
- [x] Animations glitch et corruption

### **ÉTAPE 4 : SYSTÈME DE COMBAT** ✅
- [x] Fonction `startBossBattle(bossId)` : Initialise le combat
- [x] Fonction `selectBattleTeam()` : Sélection d'équipe (3 Pokémon)
- [x] Système de tours avec actions
- [x] Skills avec cooldowns
- [x] Calcul de dégâts basé sur types, rareté, niveau
- [x] Dégâts du Boss sur l'équipe
- [x] Système de HP pour chaque Pokémon
- [x] Fonction `processBossTurn()` : Actions automatiques du Boss
- [x] Fonction `defeatBoss()` : Récompenses et Lore Files

### **ÉTAPE 5 : SYSTÈME LORE FILES** ✅
- [x] Drop de Lore Files après victoire (RNG)
- [x] Stockage dans `gameState.loreFiles`
- [x] Affichage dans l'inventaire (Key Items)
- [x] Format : `journal_chen_404.enc`, `project_mewtwo_log.corrupt`

### **ÉTAPE 6 : TERMINAL DE DÉCRYPTAGE** ✅
- [x] Ajouter module "Terminal de Décryptage" dans le Labo
- [x] UI pour lister les Lore Files cryptés
- [x] Coût en EO pour décrypter
- [x] Animation de décryptage (style terminal)
- [x] Popup narrative avec le contenu décrypté
- [x] Déblocage du bonus passif associé

### **ÉTAPE 7 : BONUS PASSIFS** ✅
- [x] Système de stockage des bonus dans `gameState.passiveBonuses`
- [x] Application des bonus dans les calculs (XP, capture, etc.)
- [x] UI pour afficher les bonus actifs

### **ÉTAPE 8 : RÉCOMPENSES BOSS** ✅
- [x] Shiny Tokens (50-100 par boss)
- [x] Ancient Data (rare, 1-5 par boss)
- [x] Lore Files (chance variable)
- [x] Coins et XP
- [x] Animation de victoire

### **ÉTAPE 9 : REFONTE SÉMANTIQUE** ✅
- [x] Garder les noms de Balls
- [x] Ajouter suffixe technique dans tooltips (v1.0.exe, v2.5.zip, etc.)
- [x] Réécrire descriptions pour thème "data"
- [x] Mettre à jour les tooltips dans l'inventaire

### **ÉTAPE 10 : NAVIGATION & INTÉGRATION** ✅
- [x] Ajouter bouton "Data Guardians" dans le menu principal
- [x] Page de sélection de Boss
- [x] Intégration avec le système de navigation existant
- [x] Déblocage progressif (niveau requis par Boss)

### **ÉTAPE 11 : ANIMATIONS & EFFETS** ✅
- [x] Animations glitch CSS
- [x] Effets de corruption sur le Boss
- [x] Animations d'attaque
- [x] Particules et effets visuels
- [x] Transitions entre états

### **ÉTAPE 12 : TEST & POLISH** ✅
- [x] Tester le flux complet
- [x] Vérifier l'économie (EO → Tickets → Récompenses)
- [x] Tester les Lore Files et décryptage
- [x] Vérifier les bonus passifs
- [x] Polish UI/UX

---

## 📁 FICHIERS À MODIFIER/CRÉER

### **Modifications**
- `app.js` : Ajout des structures, fonctions de combat, système Lore Files
- `index.html` : Ajout de la page boss-battle, CSS cyber-espace
- `style.css` : Styles pour le combat (ou inline dans HTML)

### **Nouveaux fichiers (optionnels)**
- `boss_battle_data.js` : Données des Boss (si séparation souhaitée)
- `lore_files_data.js` : Données des Lore Files (si séparation souhaitée)

---

## 🔄 FLUX DE GAMEPLAY

1. **Labo** → Production d'EO
2. **Shop Labo** → Achat Firewall Key (5000 EO)
3. **Menu Boss** → Sélection d'un Data Guardian
4. **Sélection Équipe** → 3 Pokémon
5. **Combat** → Tours alternés, skills, cooldowns
6. **Victoire** → Récompenses (Shiny Tokens, Ancient Data, Lore File)
7. **Labo Terminal** → Décryptage du Lore File (coût EO)
8. **Bonus Passif** → Débloqué et appliqué
9. **Boutique** → Utilisation Shiny Tokens pour améliorations
10. **Capture** → Retour à la source avec meilleures Balls

---

## 🎨 STYLE VISUEL

- **Couleurs** : Vert cyber (#00ff9d), Rouge danger (#ff0055)
- **Fond** : Grille cyber, scanlines CRT
- **Police** : 'Share Tech Mono', monospace
- **Effets** : Glitch, corruption, pulsation
- **Layout** : Vertical (mobile-first)

---

## ✅ CHECKLIST FINALE

- [ ] Tous les Boss sont implémentés
- [ ] Le système de tickets fonctionne
- [ ] L'UI de combat est complète et responsive
- [ ] Les Lore Files sont lootables et décryptables
- [ ] Les bonus passifs sont appliqués correctement
- [ ] L'économie est équilibrée
- [ ] La refonte sémantique est complète
- [ ] Les animations sont fluides
- [ ] Le système est testé et fonctionnel

---

**Date de création** : 2024
**Version** : 1.0
**Statut** : En cours d'implémentation


