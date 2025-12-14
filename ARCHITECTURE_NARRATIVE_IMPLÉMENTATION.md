# Architecture Narrative - Implémentation

## Résumé des Changements Implémentés

Ce document récapitule les améliorations narratives et émotionnelles implémentées selon le document "Projet 1511 : Architecture Narrative et Design Émotionnel Avancé".

---

## ✅ 1. Système de Murmures d'Entropie

### Implémentation
- **Fichier** : `app.js` (lignes ~230-350)
- **Fonction** : `triggerAmbientNarrative(context, variables)`
- **Fonction d'affichage** : `showAmbientWhisper(message)`

### Caractéristiques
- Dialogues non bloquants affichés en style terminal (vert sur fond noir)
- Probabilité de déclenchement : 1-5% selon le contexte
- Cooldown de 1 minute entre les murmures du même type
- Intégré dans :
  - Captures de Pokémon (eau, feu, rare, shiny, légendaire)
  - Pêche réussie
  - Streaks élevés
  - Échecs répétés

### CSS
- Animations `whisperFadeIn` et `whisperFadeOut` dans `style.css`
- Style terminal avec bordure verte et ombre lumineuse

---

## ✅ 2. Système d'Ombre de Glitch (MissingNo)

### Implémentation
- **Fichier** : `app.js` (lignes ~1026-1060)
- **Fonction** : `triggerGlitchShadow()`

### Caractéristiques
- Apparition rare (1-5%) lors de captures avec streak élevé ou légendaire
- Effet visuel : silhouette de MissingNo en arrière-plan pendant 2 secondes
- Distorsion de l'UI (hue-rotate)
- Réaction immédiate de Porygon avec message de panique
- Cooldown de 5 minutes entre les apparitions

### CSS
- Classe `.glitch-shadow` avec animations `glitchShadowAppear` et `glitchShadowDisappear`
- Filtre d'inversion et flou pour l'effet fantomatique

---

## ✅ 3. Système Override (Surcharge Système)

### Implémentation
- **Fichier** : `app.js` (lignes ~1062-1100)
- **Fonction** : `window.triggerSystemOverride(eventType, callback)`

### Caractéristiques
- Blackout audio-visuel complet
- Couche terminal avec effet Matrix (pluie de données)
- Animation de surcharge système (inversion, distorsion, skew)
- Pause de la musique de fond
- Utilisé pour :
  - Déblocage de Johto
  - Déblocage de Hoenn
  - (À étendre pour d'autres événements majeurs)

### CSS
- Animation `system-override` avec transformations complexes
- Classe `.matrix-overlay` pour l'effet de pluie de données
- Animation `matrixRain` pour le défilement vertical

---

## ✅ 4. Nouveaux Dialogues Narratifs

### Arcs Implémentés

#### Arc du Fantôme du Rival (Niveaux 6-9)
- **Niveau 6** : `rival_signal_detected` - Détection d'un second signal
- **Niveau 7** : `rival_corrupted_ball_found` - Découverte d'une Pokéball corrompue
- **Niveau 8** : `rival_signal_decrypted` - Décryptage du signal (écho/fantôme)
- **Niveau 9** : `rival_ghost_battle` + `rival_badge_earned` - Combat fantôme et badge (+5% XP)

#### Arc de Préparation au Deepnet (Niveaux 13-14)
- **Niveau 13** : `deepnet_encryption_thickening` - Épaississement du cryptage
- **Niveau 14** : `deepnet_firewall` - Pare-feu nécessitant 3 Expéditions complétées

#### Arc de la Fuite de Mémoire (Niveaux 21-24)
- **Niveau 21** : `porygon_memory_loss_1` - Porygon commence à oublier
- **Niveau 22** : `porygon_memory_loss_2` - Glitchs visuels dans l'UI
- **Niveau 23** : `porygon_defrag_needed` - Besoin de défragmentation
- **Niveau 24** : `porygon_defrag_success` - Défragmentation réussie

#### Réactions Dynamiques
- `reaction_flee_streak` - Réaction aux échecs répétés
- `reaction_time_away` - Réaction au retour après absence
- `reaction_specific_pokemon` - Réaction à des Pokémon spécifiques (ex: Pikachu)

---

## ✅ 5. Amélioration du Combat MissingNo

### Phases Dramatiques Implémentées

#### Phase 2 : Le Sacrifice de Porygon
- Porygon intercepte l'attaque finale
- Message dramatique : "Je ne peux pas laisser l'Archiviste être supprimé"
- Animation de sacrifice avec effet visuel

#### Phase 3 : La Restauration
- Utilisation de l'Énergie Onirique accumulée
- Restauration de Porygon (intégrité à 100%)
- Réduction du glitchLevel à 0
- Message de victoire amélioré

### À Implémenter (Phase 1)
- **Phase 1 : L'Effacement** - MissingNo grise les éléments de l'UI
  - Désactiver le bouton "Item"
  - Obscurcir le bouton "Fuite"
  - Effet de "mangé" sur l'interface

---

## ✅ 6. Intégration des Murmures dans le Gameplay

### Captures
- Murmures contextuels selon le type (eau, feu)
- Murmures pour rareté (rare, super_rare, légendaire)
- Murmures pour shiny
- Murmures pour streaks élevés

### Pêche
- Murmure "fishing_success" lors de captures réussies
- Contexte narratif : "Lac de Données" et "Stockage Profond"

---

## 🔄 7. Système d'Évolution Visuelle de Porygon (En Cours)

### Phases Définies
1. **Boot (Niv 1-4)** : Glitché, transparent, scintillement rouge/magenta
2. **Stabilisation (Niv 5-14)** : Forme solide avec zones filaires, scintillement bleu/vert
3. **Récupération (Niv 15-29)** : Sprite haute résolution, aura lumineuse
4. **Corruption (Niv 30+)** : Artefacts MissingNo, pixels morts

### Statut
- Structure de données prête dans `gameState.system`
- Dialogues créés
- **À faire** : Implémenter les changements visuels du sprite selon la phase

---

## 🔄 8. Récontextualisation Narrative des Mini-Jeux

### Poké-Poker
- **À faire** : Renommer "Chips" en "Clés Cryptographiques" dans le texte narratif
- **À faire** : Renommer "Jokers" en "Patches" ou "Sous-programmes"
- **À faire** : Renommer "Boss Blinds" en "Démons de Sécurité"

### Pêche
- **Fait** : Murmures d'entropie intégrés
- **À faire** : Ajouter des "Fichiers Texte Corrompus" comme objets de lore rares

### Labo de Recherche
- **À faire** : Renommer "Énergie Onirique" en "Puissance de Calcul" dans le contexte narratif
- **À faire** : Visualiser le "Cœur" de Porygon qui bat selon la production d'EO

---

## 📝 Notes Techniques

### Variables Ajoutées à `gameState`
```javascript
gameState.system.entropy = 0; // Corruption globale (0-100)
gameState.narrative.ambientQueue = []; // File d'attente pour histoires non bloquantes
gameState.narrative.porygonAffection = 0; // Relation avec le guide
gameState.system.lastGlitchShadow = 0; // Timestamp du dernier ombre
gameState.system.firewallActive = false; // Pare-feu actif (Niveau 14)
gameState.system.defragAvailable = false; // Défragmentation disponible
gameState.system.porygonIntegrity = 0; // Intégrité de Porygon (0-100)
```

### Nouvelles Fonctions Globales
- `triggerAmbientNarrative(context, variables)`
- `showAmbientWhisper(message)`
- `triggerGlitchShadow()`
- `window.triggerSystemOverride(eventType, callback)`

---

## 🎯 Prochaines Étapes Recommandées

1. **Implémenter la Phase 1 du Combat MissingNo** (L'Effacement de l'UI)
2. **Créer le système d'évolution visuelle de Porygon** (changements de sprite)
3. **Ajouter les "Fichiers Texte Corrompus"** dans la pêche
4. **Récontextualiser complètement le Poké-Poker** (renommer les éléments)
5. **Créer le système de "Plongée Mémorielle"** pour les quêtes majeures
6. **Implémenter la réaction au temps** (retour après 24h)
7. **Ajouter la réaction aux Pokémon spécifiques** (ex: Pikachu)

---

## 📊 Impact Attendu

### Immersion
- Les murmures d'entropie créent une atmosphère constante de "monde corrompu"
- L'ombre de glitch ajoute une tension paranoïaque
- Les arcs narratifs comblent les "zones mortes" de progression

### Attachement Émotionnel
- Le sacrifice de Porygon dans le combat MissingNo crée une dette émotionnelle
- Les arcs de mémoire perdue humanisent Porygon
- Les réactions dynamiques font sentir que Porygon "vit" et réagit

### Gameplay
- Les arcs narratifs ajoutent des objectifs intermédiaires
- Le pare-feu au niveau 14 force l'engagement avec les Expéditions
- La défragmentation au niveau 23 crée une mécanique de "caretaking"

---

## 🔧 Maintenance

### Tests Recommandés
- Vérifier que les murmures ne s'affichent pas trop fréquemment
- Tester les cooldowns entre les ombres de glitch
- Valider que les System Override ne bloquent pas le gameplay
- Vérifier que les arcs narratifs se déclenchent au bon niveau

### Optimisations Possibles
- Pool de murmures plus large pour éviter la répétition
- Variantes visuelles pour les différentes phases de Porygon
- Cache pour les dialogues déjà vus (éviter les répétitions)

---

**Date de création** : 2024
**Version** : 1.0
**Statut** : En développement actif






