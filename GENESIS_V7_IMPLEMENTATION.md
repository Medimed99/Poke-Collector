# Architecture V7.0 "Genesis" - Implémentation

## Résumé des Changements

Ce document récapitule l'implémentation de l'Architecture V7.0 "Genesis" selon les spécifications techniques et narratives fournies.

---

## ✅ 1. Système de Fuite Binaire

### Implémentation
- **Fichier** : `app.js` (fonction `attemptCapture` réécrite)
- **Logique** : Échec du calcul = Fuite immédiate (pas de tentatives multiples)

### Caractéristiques
- Taux de base calibrés selon la rareté :
  - Common : 70%
  - Uncommon : 50%
  - Rare : 30%
  - Super Rare : 15%
  - Legendary : 5%
- Multiplicateurs de Balls :
  - Pokéball : x1.0
  - Superball : x1.5
  - Hyperball : x2.0
  - Masterball : x1000.0 (garantit capture)
- Safety Nets :
  - Baie Ceriz : Annule la fuite, permet un nouveau tour
  - Buddy Protector : Annule la fuite (si talent disponible)

### Messages Narratifs
- Utilisation de `NARRATIVE_DB.EVENTS.FLEE` pour les messages de fuite
- Messages diégétiques : "CONNEXION PERDUE", "ERREUR CRITIQUE", etc.

---

## ✅ 2. Architecture Zéro-Asset (API-First)

### Configuration
- **Fichier** : `config/api_endpoints.js`
- **Sources** :
  - Sprites Pokémon : PokeAPI (Génération 5 animés)
  - Icônes d'objets : PokeAPI Items
  - Icônes de types : Pokémon Showdown

### Fonctions Utilitaires
- `getSpriteUrl(id, isShiny, isBack)` : Génère l'URL du sprite
- `getStaticSpriteUrl(id)` : Fallback statique
- `getItemIconUrl(itemId)` : URL de l'icône d'objet
- `getTypeIconUrl(typeFr)` : URL de l'icône de type

### Intégration
- Scripts ajoutés dans `index.html` avant `app.js`
- Mapping des IDs internes vers les noms API

---

## ✅ 3. Fonds CSS Procéduraux

### Implémentation
- **Fichier** : `style.css`
- **Remplace** : `room_*.png`

### Ambiances Créées
1. **Plaine (Common)** : Gradient vert avec particules flottantes
2. **Océan (Water)** : Gradient bleu avec animation de vagues
3. **Grotte (Cave)** : Gradient conique avec effet torche (flicker)
4. **Salle Boss (Legendary)** : Motif répétitif avec pulsation de danger
5. **The Void (Flee)** : Fond sombre avec effet glitch RGB

### Animations CSS
- `floatingParticles` : Mouvement des particules (plaine)
- `waveMotion` : Mouvement des vagues (océan)
- `flicker` : Effet de torche (grotte)
- `dangerPulse` : Pulsation de danger (boss)
- `glitchEffect` : Effet de glitch RGB (void)

---

## ✅ 4. Bible Narrative Complète

### Fichier
- **Fichier** : `data/narrative_db.js`
- **Structure** : Objet `NARRATIVE_DB` avec toutes les catégories

### Contenu
1. **Séquence d'Introduction** :
   - Boot Screen
   - Contact Porygon-Z
   - Ordre de Mission

2. **Événements de Jeu** :
   - Fuite (Fail State)
   - Capture Réussie
   - Shiny Détecté
   - Évolution
   - Blind Box

3. **Descriptions d'Objets** :
   - Tous les objets avec descriptions diégétiques ("Tech")

4. **Quêtes** :
   - Quêtes Quotidiennes (10 quêtes)
   - Quêtes Spéciales (3 quêtes)

5. **Safety Nets** :
   - Messages pour Baie Ceriz et Buddy Protector

---

## 🔄 5. À Compléter

### Service Worker
- Mettre à jour `sw.js` pour le Runtime Caching des API
- Stratégie "Cache First" pour les assets PokeAPI

### Remplacement des Textes
- Remplacer tous les `showToast` et `alert` par les textes de `NARRATIVE_DB`
- Créer une fonction `SystemLog.display(id)` pour afficher les textes avec effet "machine à écrire"

### Quêtes
- Mettre à jour les quêtes existantes avec les nouveaux textes narratifs
- Implémenter les quêtes spéciales (Mystery Egg, Complete Kanto, Hunt 3 Legendaries)

### Pêche 2.0
- Adapter le système de pêche pour utiliser les fonds CSS procéduraux
- Implémenter la barre de progression avec zone verte

### Mode Expédition
- Adapter pour utiliser les fonds CSS
- Simplifier la carte en ligne de nœuds CSS

---

## 📝 Notes Techniques

### Variables Ajoutées
- `window.ASSET_SOURCES` : Configuration des API
- `window.NARRATIVE_DB` : Base de données narrative
- Fonctions utilitaires pour les URLs d'assets

### Changements Majeurs
- `attemptCapture` : Réécriture complète selon le système binaire
- `calculateCaptureRate` : À mettre à jour pour utiliser les nouveaux taux de base
- Messages : Utilisation de `NARRATIVE_DB` au lieu de textes hardcodés

### Compatibilité
- Les anciens systèmes (skill shot, etc.) sont toujours fonctionnels
- Les nouveaux systèmes sont progressivement intégrés

---

## 🎯 Prochaines Étapes

1. **Mettre à jour le Service Worker** pour le cache API
2. **Créer la fonction SystemLog.display()** pour les textes narratifs
3. **Remplacer tous les textes hardcodés** par les versions diégétiques
4. **Mettre à jour les quêtes** avec les nouveaux textes
5. **Adapter la pêche** pour utiliser les fonds CSS
6. **Tester le système de fuite binaire** en conditions réelles

---

**Date de création** : 2024
**Version** : 7.0 (Genesis)
**Statut** : En développement actif






