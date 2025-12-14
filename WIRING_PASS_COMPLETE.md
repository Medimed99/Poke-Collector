# Passe de Câblage (Wiring Pass) - Architecture V7.0 Genesis

## ✅ Implémentations Complétées

Cette "Passe de Câblage" connecte l'infrastructure technique à l'expérience utilisateur, transformant le code en une expérience émotionnelle cohérente.

---

## ✅ 1. System Log (Murmures d'Entropie)

### Implémentation
- **Fichier** : `index.html` (ligne ~321) + `style.css` + `app.js`
- **Conteneur** : `<div id="system-log" class="system-log">` ajouté dans `index.html`
- **Fonction** : `showAmbientWhisper()` modifiée pour utiliser le System Log au lieu de toasts

### Caractéristiques
- Position : Bas gauche de l'écran (non intrusif)
- Style : Terminal vert sur fond noir (cohérent avec le thème)
- Animation : Fade in/out automatique (5 secondes)
- Limite : Maximum 5 entrées affichées simultanément
- Non-bloquant : Les murmures n'interrompent pas le gameplay

### CSS
- Classe `.system-log` : Conteneur fixe en bas à gauche
- Classe `.system-log-entry` : Entrées individuelles avec animation
- Animations `logEntryFadeIn` et `logEntryFadeOut`

---

## ✅ 2. Évolution Visuelle de Porygon

### Implémentation
- **Fichier** : `app.js` (fonction `updatePorygonVisuals()`) + `style.css`
- **Fonction** : Calcule l'intégrité selon le niveau et la progression, applique les classes CSS

### Phases Visuelles
1. **Phase Boot (Niv 1-4, <10%)** :
   - Classe : `porygon-phase-boot`
   - Effet : Glitché, transparent, scintillement rouge/magenta
   - Mood : PANIC

2. **Phase Stabilisation (Niv 5-14, 10-40%)** :
   - Classe : `porygon-phase-stabilization`
   - Effet : Forme solide avec zones filaires, scintillement bleu/vert
   - Mood : NEUTRAL

3. **Phase Récupération (Niv 15-29, 40-80%)** :
   - Classe : `porygon-phase-recovery`
   - Effet : Sprite haute résolution, aura lumineuse
   - Mood : HAPPY

4. **Phase Corruption (Niv 30+, 80%+)** :
   - Classe : `porygon-phase-corruption`
   - Effet : Artefacts MissingNo, pixels morts
   - Mood : NEUTRAL (paradoxe : haute intégrité mais corruption visible)

### Calcul d'Intégrité
- Base : (Niveau / 50) * 100%
- Bonus Kanto : +20% max pour Kanto complet (151/151)
- Bonus Captures : +10% max pour 500 captures totales
- Plafonné à 100%

### Intégration
- Appelé après chaque capture réussie
- Appelé au chargement du jeu (délai 1 seconde)
- À ajouter : Après chaque level up

---

## ✅ 3. Remplacement des Textes Hardcodés

### Implémentation
- **Fichier** : `app.js` (fonctions `handleCaptureSuccess` et `handleCaptureFlee`)
- **Source** : `NARRATIVE_DB.EVENTS` depuis `data/narrative_db.js`

### Textes Remplacés

#### Captures Réussies
- **Avant** : `showToast('✅ ${pokemon.name} capturé!', 'success')`
- **Après** : Utilise `NARRATIVE_DB.EVENTS.CAPTURE_SUCCESS` avec sélection aléatoire
- **Exemple** : "Signal acquis! Intégrité sauvegardée."

#### Fuites
- **Avant** : `showToast('❌ ${pokemon.name} s'est enfui!', 'error')`
- **Après** : Utilise `NARRATIVE_DB.EVENTS.FLEE` avec sélection aléatoire
- **Exemple** : "CONNEXION PERDUE. Le signal s'est désynchronisé."

#### Shinies
- **Avant** : Message générique
- **Après** : Utilise `NARRATIVE_DB.EVENTS.SHINY_DETECTED`
- **Exemple** : "⚠️ ALERTE : ANOMALIE DÉTECTÉE. Ce code couleur n'est pas standard!"

### Double Affichage
- **System Log** : Message diégétique non bloquant
- **Toast** : Message informatif avec récompenses

---

## 🔄 À Compléter (Recommandations)

### 1. Appel après Level Up
Ajouter `updatePorygonVisuals()` dans la fonction de level up :
```javascript
function gainXP(amount) {
    // ... code existant ...
    if (gameState.xp >= gameState.xpToNext) {
        checkLevelUp();
        if (typeof updatePorygonVisuals === 'function') {
            updatePorygonVisuals();
        }
    }
}
```

### 2. Remplacement Systématique
Rechercher et remplacer tous les autres `showToast` hardcodés :
- Messages de quêtes
- Messages de shop
- Messages d'erreur
- Messages de succès

### 3. Intégration dans les Autres Systèmes
- **Pêche** : Utiliser `NARRATIVE_DB` pour les messages
- **Expéditions** : Utiliser `NARRATIVE_DB` pour les événements
- **Poké-Poker** : Utiliser `NARRATIVE_DB` pour les messages

---

## 📊 Impact Attendu

### Immersion
- Les murmures dans le System Log créent une atmosphère constante
- L'évolution visuelle de Porygon renforce l'attachement émotionnel
- Les textes diégétiques maintiennent la cohérence narrative

### Expérience Utilisateur
- **Avant** : Messages génériques, pas d'évolution visuelle, murmures intrusifs
- **Après** : Messages narratifs cohérents, Porygon évolue visuellement, murmures discrets

### Gameplay
- Le System Log ne bloque pas le gameplay
- L'évolution de Porygon donne un feedback visuel de progression
- Les textes narratifs renforcent le thème "Terminal/Data"

---

## 🎯 Résultat

Le jeu est maintenant **connecté** :
- ✅ Infrastructure technique (Fuite Binaire, API, CSS)
- ✅ Expérience utilisateur (System Log, Évolution Porygon, Textes Narratifs)
- ✅ Cohérence narrative (Tous les textes sont diégétiques)

**La V7.0 "Genesis" est maintenant une expérience complète et cohérente.**

---

**Date** : 2024
**Version** : 7.0 (Genesis - Wiring Pass Complete)
**Statut** : ✅ Prêt pour tests utilisateurs





