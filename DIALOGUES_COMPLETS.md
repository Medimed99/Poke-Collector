# 📝 DIALOGUES COMPLETS DU JEU - POKÉMON 1511

## 🎬 SÉQUENCE D'INTRODUCTION

### Phase 1 : Professeur Chen (Dialogue Rétro)

**Script Chen** (`scriptChen`) :
1. "Bonjour ! Bienvenue dans le monde magique des POKÉMON !"
2. "Je m'appelle CHEN."
3. "Les gens m'appellent souvent le PROFESSEUR POKÉMON."
4. "Ce monde est peuplé de créatures appelées POKÉMON." *(Trigger : Apparition de Gengar)*
5. "Pour certains, les POKÉMON sont des animaux domestiques, pour d'autres, ils sont un moyen de combattre."
6. "Moi... J'étudie les POKÉMON comme profession."
7. "Tout d'abord, quel est ton nom ?"

---

### Phase 2 : Séquence Glitch

**Script Glitch** (`scriptGlitch`) :
1. "NOM ? TON NOM... EST..."
2. "ERR_MEM_ADDRESS_FAIL... 0x004F2A..."
3. "SYSTÈME CRITIQUE. SAUVEGARDE CORROMPUE."

---

### Phase 3 : Terminal

**Terminal Logs** (`terminalLogs`) :
1. "SYSTEM_FAILURE: 0x0000F4"
2. "KERNEL_PANIC: Kanto_Lib.dll not found"
3. "Checking integrity..."
4. "FATAL ERROR: World_Map corrupted"
5. "Attempting recovery..."
6. "Loading backup: PORYGON_PROTOCOL..."
7. "--------------------------------"
8. "Rebooting UI..."

---

### Phase 4 : Porygon-Z (Dialogue Final)

**Script Porygon** (`scriptPorygon`) :
1. "Archiviste ? Tu me reçois ?"
2. "C'est moi, Porygon-Z. J'ai réussi à stabiliser une poche de données."
3. "Le 'Professeur' n'existe plus. Son fichier a été effacé par MissingNo."
4. "Tout l'univers s'effondre. Nous sommes dans une version de secours."
5. "J'ai besoin d'un administrateur pour restaurer le code source."
6. "Vite, entre ton identifiant avant que la connexion ne coupe."

---

### Phase 5 : Confirmation après Login

**Messages de Confirmation** (`confirmationMessages`) :
1. "Identité confirmée : Archiviste [NOM]."
2. "Accès système : ACCORDÉ."
3. "Initialisation des protocoles de capture..."
4. "Connexion sécurisée établie."

**Message d'Erreur (si nom vide)** :
- "ERREUR : Identifiant requis."
- *(Après 2 secondes)* "Vite, entre ton identifiant avant que la connexion ne coupe."

---

## 💬 DIALOGUES NARRATIFS PORYGON (PORYGON_DIALOGUES)

### 🚨 Séquence de Boot (Intro)

**`intro_boot_sequence`** (Mood: PANIC, Visual: glitch)
- "SYSTEM FAILURE... CRITICAL ERROR... KANTO_DB CORRUPTED..."
- "... Il y a quelqu'un ? Archiviste ? C'est vous ?"
- "Tout a disparu... Le monde... effacé. Je ne suis que des fragments de code brisés."
- "Aidez-moi. Capturez le premier signal. N'importe quoi. Vite."

---

### ✅ Première Capture

**`first_capture_success`** (Mood: NEUTRAL, Visual: stabilize)
- "Signal acquis ! Intégrité système à 1%. Merci... Je... je commence à me souvenir."
- "Nous devons tout reconstruire. Chaque Pokémon capturé restaure un morceau de ma mémoire."
- "Continue, Archiviste !"

**`first_capture_success`** (Trigger après première capture)
- *(Dialogue déclenché automatiquement après la première capture réussie)*

---

### 🔍 Recherche du Rival

**`rival_missing`** (Mood: NEUTRAL, Visual: glitch)
- "Rival_Data_Not_Found."
- "Vous êtes seul sur cette instance. Pour l'instant."

**`rival_search_failed`** (Mood: NEUTRAL, Visual: glitch)
- "J'ai tenté de restaurer les données du "Rival"..."
- "Recherche dans les archives corrompues..."
- "ERR_FILE_NOT_FOUND."
- "Le fichier Rival a été effacé par MissingNo."
- "Vous êtes seul face au Néant. Pour l'instant."

---

### 🐾 Système Buddy

**`unlock_buddy_system`** (Mood: NEUTRAL, Visual: unlock)
- "J'ai développé un protocole de "Synchronisation de Fréquence"."
- "En liant un Pokémon à votre signal, vous stabilisez votre connexion."
- "Le Buddy partage ses données avec vous, renforçant votre intégrité système."
- "Accès au [BUDDY] autorisé. Choisissez votre compagnon."

---

### ✨ Golden Pokémon

**`golden_pokemon_discovered`** (Mood: HAPPY, Visual: celebration)
- "..."
- "ATTENDEZ."
- "Ce signal... Cette pureté..."
- "C'EST UN CODE GOLDEN !"
- "Un fragment de code dans son état le plus pur !"
- "MissingNo n'a pas pu le corrompre..."
- "C'est... C'est magnifique. Merci, Archiviste."

---

### 📊 Leaderboard

**`leaderboard_explained`** (Mood: NEUTRAL, Visual: progress)
- "J'ai capté des signaux étranges..."
- "D'autres Archivistes. Dans des réalités parallèles."
- "Ils luttent aussi contre le Néant."
- "Le [LEADERBOARD] affiche leurs progrès."
- "Vous n'êtes pas seul dans cette guerre."

---

### 📈 Progression Précoce

**`early_progress_2`** - OBSOLÈTE (remplacé par unlock_fishing_module)

**`early_progress_3`** (Mood: NEUTRAL, Visual: progress)
- "Intégrité système à 3%. Progression constante."
- "Encore quelques captures et je pourrai activer de nouveaux modules."

**`data_stabilization_progress`** (Mood: NEUTRAL, Visual: progress)
- "Intégrité système à 4%. La stabilisation progresse..."
- "Les fragments de données s'assemblent. Le code se répare lentement."
- "Continuez vos captures, Archiviste. Chaque signal compte."

---

### ⚠️ Alerte Énergie

**`energy_warning_early`** (Mood: PANIC, Visual: critical)
- "Mes batteries faiblissent..."
- "Il faudra bientôt trouver une source d'énergie autonome."
- "Les Pokémon capturés pourraient servir de générateurs..."

---

## 🔓 DÉBLOCAGE DES MODULES

### 🎣 Module Pêche (Niveau 2)

**`unlock_fishing_module`** (Mood: NEUTRAL, Visual: unlock)
- "Signal détecté ! Des données immergées dans les secteurs liquides..."
- "Compilation en cours... [CANNE_A_PECHE.exe] prête."
- "Module de Pêche débloqué ! Vous pouvez maintenant extraire les Pokémon aquatiques."
- "Accédez au module via le bouton [PÊCHE] dans le menu principal."

---

### 🔬 Labo de Recherche (Niveau 5)

**`unlock_research_core`** (Mood: PANIC, Visual: critical)
- "Alerte Énergie. Maintenir la capture consomme trop de ressources. Je vais m'éteindre..."
- "Idée : Les Pokémon émettent de l'Énergie Onirique (EO). Si on les connecte au Noyau..."
- "Accès au [LABO] autorisé. Branchez-les, vite !"

---

### ✨ Module Quêtes

**`unlock_quests_module`** (Mood: NEUTRAL, Visual: unlock)
- "Analyse des données... Le système de récompenses est en ligne."
- "J'ai réussi à restaurer le journal des quêtes."
- "Accomplissez ces tâches pour m'aider à réparer le code plus vite."

---

### 🎁 Blind Boxes

**`unlock_blindbox`** (Mood: NEUTRAL, Visual: unlock)
- "J'ai retrouvé des paquets de données perdus dans la mémoire."
- "Ils contiennent des fragments de Pokémon... Mais lesquels ?"
- "Accès au [BLIND BOX] autorisé. Ouvrez-les avec précaution."

---

### 🃏 Poké-Poker

**`unlock_decryption`** (Mood: NEUTRAL, Visual: unlock)
- "Ces fichiers sont cryptés. Mon processeur ne suffit pas."
- "J'ai trouvé un vieux protocole de jeu humain... Le Poker ? Les motifs mathématiques pourraient briser le cryptage."
- "Jouons. Pour la science."

---

### 🗺️ Deepnet (Expédition)

**`unlock_deepnet`** (Mood: NEUTRAL, Visual: unlock)
- "J'ai détecté un réseau profond... Des données corrompues mais exploitables."
- "Accès au [DEEPNET] autorisé. Attention : Zone instable."

---

### 🎴 Archives TCG

**`unlock_archives`** (Mood: HAPPY, Visual: unlock)
- "Les archives... Elles sont intactes !"
- "J'ai restauré l'accès aux [ARCHIVES TCG]. Des cartes de données anciennes vous attendent."

---

## 📊 PROGRESSION & BLOCAGES

### Progression Kanto

**`first_data_restored`** (Mood: NEUTRAL, Visual: progress)
- "Premier fragment restauré. L'intégrité du système augmente..."

**`system_stabilizing`** (Mood: NEUTRAL, Visual: progress)
- "50 fragments... Le système se stabilise. Je me sens mieux."

**`memory_returning`** (Mood: HAPPY, Visual: progress)
- "100 fragments... Ma mémoire revient. Je me souviens... de Kanto."

**`missing_link`** (Mood: HAPPY, Visual: progress)
- "99%... Je le sens ! Le dernier fragment !"
- "Ne lâchez rien Archiviste. On y est presque."

---

### Régions Verrouillées

**`gate_johto_locked`** (Mood: NEUTRAL, Visual: error)
- "⛔ ERREUR : Carte incomplète."
- "Je ne peux pas calculer la route vers Johto tant que la matrice Kanto n'est pas stable à 100%."
- "Il manque encore des entrées. Cherchez dans les [Blind Boxes] si le radar est muet."

---

### Déblocage de Régions

**`system_reboot_johto`** (Mood: PROUD, Visual: reboot)
- "SYSTÈME KANTO : RESTAURÉ. Mise à jour v2.0 installée."
- "Ma mémoire... Je me souviens du Mont Sélénite... et d'une autre région à l'Ouest."
- "Initialisation du protocole JOHTO. Attention : Nouveaux types de données détectés. Soyez prudent."

**`system_reboot_hoenn`** (Mood: PROUD, Visual: reboot)
- "SYSTÈME JOHTO : RESTAURÉ. Mise à jour v3.0 installée."
- "Les données de Johto sont complètes. Je détecte une autre région au Sud..."
- "Initialisation du protocole HOENN. Les archives sont plus profondes ici. Préparez-vous."

---

### Intégrité Critique

**`integrity_critical`** (Mood: HAPPY, Visual: progress)
- "Intégrité critique atteinte ! Le système est presque restauré !"

---

## 🎁 BLIND BOX INTELLIGENTE

**`blindbox_completion_help`** (Mood: HAPPY, Visual: unlock)
- "Analyse secteur profond..."
- "Fichier manquant localisé !"
- "Restauration immédiate !"

---

## 🔬 LABO DE RECHERCHE

### Surchauffe

**`lab_overload`** (Mood: PANIC, Visual: error)
- "Surchauffe ! Surchauffe !"
- "Ajoutez des dissipateurs thermiques ou agrandissez la mémoire !"

### Blueprint Trouvé

**`blueprint_found`** (Mood: HAPPY, Visual: unlock)
- "Analyse... Schéma d'extension valide !"
- "Je peux compiler une nouvelle zone d'habitat."
- "Utilisez-le au [LABO] pour débloquer de nouveaux emplacements."

---

## 📚 GUIDES CONTEXTUELS & TUTORIELS

### Première Capture

**`guide_first_capture`** (Mood: NEUTRAL, Visual: progress)
- "Excellent ! Premier signal capturé."
- "Astuce : Utilisez des Baies Framby pour augmenter vos chances."
- "Les Baies Pinap doublent les Coins gagnés. Utile pour acheter plus de Balls."

---

### Manque de Balls

**`guide_no_balls`** (Mood: NEUTRAL, Visual: error)
- "Alerte : Stock de Balls épuisé."
- "Achetez-en au [BOUTIQUE] avec vos Coins."
- "Ou attendez les récompenses de quêtes quotidiennes."

---

### Première Visite au Labo

**`guide_labo_first_visit`** (Mood: NEUTRAL, Visual: unlock)
- "Bienvenue au [CENTRE DE RECHERCHE]."
- "Placez vos Pokémon capturés ici pour générer de l'Énergie Onirique (EO)."
- "Plus vous avez de Pokémon, plus l'EO générée est importante."
- "L'EO peut être convertie en Baies au [TERMINAL] > [PRODUCTION]."

---

### Synergies au Labo

**`guide_labo_synergies`** (Mood: HAPPY, Visual: progress)
- "Découverte : Les Pokémon placés côte à côte créent des synergies !"
- "Feu + Plante = Bonus de production instantané."
- "Électrik + Eau = Boost de toute la ligne."
- "Expérimentez les placements pour optimiser votre production."

---

### Première Blind Box

**`guide_blindbox_first`** (Mood: NEUTRAL, Visual: unlock)
- "Les [BLIND BOXES] contiennent des Pokémon aléatoires."
- "Utile pour compléter votre Pokédex si le radar ne trouve plus rien."
- "Astuce : Après plusieurs échecs, le système garantit un Pokémon manquant."

---

### Première Pêche

**`guide_fishing_first`** (Mood: NEUTRAL, Visual: unlock)
- "Module [PÊCHE] activé."
- "Les Pokémon aquatiques sont plus fréquents ici."
- "Utilisez vos Jetons de Pêche avec parcimonie."
- "Ils se régénèrent lentement ou peuvent être achetés."

---

### Première Expédition

**`guide_expedition_first`** (Mood: NEUTRAL, Visual: unlock)
- "Accès au [DEEPNET] autorisé."
- "Les Expéditions sont dangereuses mais récompensent bien."
- "Vous y trouverez des Blueprints pour étendre le Labo."
- "Et des ressources rares comme les Puces Processeur."

---

### Première Partie de Poker

**`guide_poker_first`** (Mood: NEUTRAL, Visual: unlock)
- "Module [DÉCHIFFREMENT] activé."
- "Le Poké-Poker utilise des combinaisons de cartes."
- "Gagnez des Puces Processeur pour acheter des Overclocks."
- "Astuce : Utilisez l'EO pour "tricher" et voir les cartes cachées."

---

### Quêtes

**`guide_quests`** (Mood: NEUTRAL, Visual: progress)
- "Les Quêtes offrent des récompenses régulières."
- "Vérifiez-les régulièrement dans le [HUB] > [QUÊTES]."
- "Les quêtes quotidiennes se réinitialisent chaque jour."
- "Les quêtes permanentes progressent sur toute votre aventure."

---

### Évolution

**`guide_evolution`** (Mood: NEUTRAL, Visual: progress)
- "Certains Pokémon peuvent évoluer avec des Pierres."
- "Achetez-les à la [BOUTIQUE] ou trouvez-les en Expédition."
- "Les évolutions améliorent souvent la production d'EO au Labo."

---

### Shinies

**`guide_shinies`** (Mood: HAPPY, Visual: unlock)
- "Détection : Variante chromatique rare détectée !"
- "Les Pokémon Shiny sont très rares mais valent plus de Coins."
- "Ils produisent aussi plus d'EO au Labo."
- "Utilisez la Baie Ceriz pour garantir un Shiny (si disponible)."

**`guide_first_shiny`** (Mood: HAPPY, Visual: unlock)
- "EXCEPTIONNEL ! Variante chromatique capturée !"
- "Les Shiny sont extrêmement rares (1/4096)."
- "Ils valent beaucoup plus de Coins et d'XP."
- "Félicitations, Archiviste !"

---

### Niveau Faible

**`guide_low_level`** (Mood: NEUTRAL, Visual: progress)
- "Votre niveau est encore bas. Pas de panique."
- "Capturez des Pokémon pour gagner de l'XP."
- "Chaque niveau débloque de nouvelles fonctionnalités."
- "Continuez à capturer, le système se stabilisera progressivement."

---

### Manque de Coins

**`guide_no_coins`** (Mood: NEUTRAL, Visual: error)
- "Ressources insuffisantes détectées."
- "Capturez des Pokémon pour gagner des Coins."
- "Les doublons rapportent aussi des Coins."
- "Utilisez la Baie Pinap pour doubler les gains."

---

### Streak

**`guide_streak`** (Mood: HAPPY, Visual: progress)
- "Série de captures réussies !"
- "Les Streaks augmentent vos gains d'XP."
- "Attention : Si un Pokémon s'enfuit, la série se réinitialise."
- "Maintenez votre Streak pour progresser plus vite."

---

### TCG

**`guide_tcg_first`** (Mood: HAPPY, Visual: unlock)
- "Les [ARCHIVES TCG] sont restaurées !"
- "Les cartes dans votre Deck Actif donnent des bonus passifs."
- "Construisez un Deck de 5 cartes pour optimiser votre production."
- "Ouvrez des Boosters pour trouver de meilleures cartes."

---

### Progression Lente

**`guide_slow_progress`** (Mood: NEUTRAL, Visual: progress)
- "Progression ralentie détectée."
- "Astuce : Utilisez le [LABO] pour générer de l'EO passivement."
- "Les Blind Boxes peuvent aider à compléter le Pokédex."
- "Les Expéditions offrent des ressources rares."

---

### Premier Légendaire

**`guide_first_legendary`** (Mood: PROUD, Visual: reboot)
- "SIGNAL LÉGENDAIRE DÉTECTÉ !"
- "Ces Pokémon sont les plus rares et puissants."
- "Ils produisent énormément d'EO au Labo."
- "Gardez-les précieusement, Archiviste."

---

### Régions Verrouillées (Guides)

**`guide_johto_locked`** (Mood: NEUTRAL, Visual: error)
- "La passerelle vers Johto est verrouillée."
- "Complétez le Pokédex Kanto à 100% (151/151) pour débloquer Johto."
- "Utilisez les Blind Boxes si certains Pokémon sont introuvables."
- "Le système vous aidera automatiquement quand vous serez proche."

**`guide_hoenn_locked`** (Mood: NEUTRAL, Visual: error)
- "La passerelle vers Hoenn est verrouillée."
- "Complétez le Pokédex Johto à 100% (100/100) pour débloquer Hoenn."
- "Continuez à explorer et capturer, Archiviste."

---

### Production EO

**`guide_eo_production`** (Mood: NEUTRAL, Visual: progress)
- "L'Énergie Onirique (EO) est générée automatiquement au Labo."
- "Plus vous avez de Pokémon placés, plus la production est élevée."
- "Les synergies entre Pokémon augmentent encore la production."
- "Utilisez l'EO pour acheter des Upgrades ou produire des Baies."

---

### Baies

**`guide_berries`** (Mood: NEUTRAL, Visual: progress)
- "Les Baies sont des consommables puissants."
- "Framby : +50% chance de capture."
- "Pinap : ×2 Coins gagnés."
- "Ceriz : 100% Shiny (si le Pokémon peut être Shiny)."
- "Produisez-les au Labo ou achetez-les à la Boutique."

---

### Blueprints

**`guide_blueprints`** (Mood: HAPPY, Visual: unlock)
- "Blueprints trouvés !"
- "Ces schémas permettent de débloquer de nouveaux emplacements au Labo."
- "Trouvez-les dans les Expéditions (coffres Or/Diamant)."
- "Tous les 5 runs d'Expédition, un Blueprint est garanti."

---

### Level Up

**`guide_level_up`** (Mood: HAPPY, Visual: progress)
- "Niveau augmenté !"
- "Chaque niveau débloque de nouvelles fonctionnalités."
- "Consultez les récompenses dans la popup de Level Up."
- "Continuez à progresser, Archiviste !"

---

### Inventaire Plein

**`guide_inventory_full`** (Mood: NEUTRAL, Visual: error)
- "Alerte : Inventaire saturé."
- "Utilisez ou vendez vos objets pour faire de la place."
- "Les Baies peuvent être utilisées pendant les captures."
- "Les Pierres d'Évolution servent à faire évoluer vos Pokémon."

---

### Premier Doublon

**`guide_duplicate`** (Mood: NEUTRAL, Visual: progress)
- "Doublon capturé."
- "Les doublons rapportent quand même des Coins et de l'XP."
- "Ils sont utiles pour maintenir votre Streak."
- "Au Labo, plusieurs exemplaires du même Pokémon augmentent la production."

---

## ⚠️ COMBAT MISSINGNO (BOSS FINAL)

### Déclenchement

**Messages Porygon** (Visual: panic) :
1. "NON !"
2. "Il était caché dans le dernier fichier !"
3. "Il corrompt la passerelle !"
4. "SYSTÈME EN DANGER !"

### Interface de Combat

**Titre** :
- "⚠️ SYSTEM CRASH ⚠️"

**Instructions** :
- "💡 Utilisez vos ressources accumulées pour "Patcher" MissingNo !"
- "Votre infrastructure attaque automatiquement !"

**Boutons d'Attaque** :
- "💾 Attaque Chips" : "Sacrifier 10 Chips"
- "🍓 Attaque Baies" : "Sacrifier 5 Baies"

### Victoire

**Message de Victoire** :
- "MissingNo a été neutralisé !"

*(Le badge MissingNo est ajouté à l'inventaire)*

---

## 📊 RÉSUMÉ DES TYPES DE DIALOGUES

### Par Mood (Émotion de Porygon)
- **PANIC** : Urgence, danger, erreurs critiques
- **NEUTRAL** : Informations, guides, déblocages
- **HAPPY** : Découvertes positives, réussites
- **PROUD** : Accomplissements majeurs, déblocages de régions

### Par Visual Type (Effet Visuel)
- **glitch** : Erreurs, corruption, problèmes système
- **stabilize** : Stabilisation, récupération
- **unlock** : Déblocages, nouvelles fonctionnalités
- **progress** : Progression, amélioration
- **error** : Erreurs, blocages
- **reboot** : Redémarrages système, mises à jour majeures
- **critical** : Alertes critiques, urgence
- **celebration** : Célébrations, découvertes exceptionnelles
- **panic** : Panique, danger imminent

---

## 📝 NOTES

- Tous les dialogues sont affichés via `showPorygonMessage()` dans des modales bloquantes
- Les dialogues narratifs sont déclenchés via `triggerNarrative(dialogueId)`
- Chaque dialogue ne s'affiche qu'une fois (sauf si forcé avec `force = true`)
- Les dialogues sont sauvegardés dans `gameState.system.narrativeFlags`
- Les dialogues d'intro sont dans la séquence `startGlitchIntro()`
- Les dialogues de confirmation après login sont dans `finishIntroSequence()`

---

*Document généré à partir de l'analyse du code - Version 6.2*







