/* ==========================================
   PÊCHE 2.0 - ABYSSES & TRÉSORS (V9)
   ========================================== */

const FISHING_CONFIG = {
    baseDifficulty: { speed: 1.0, barSize: 25 }, 
    lootTable: [
        { type: 'pokemon', chance: 0.65 },
        { type: 'item', chance: 0.25 },
        { type: 'treasure', chance: 0.10 } // Augmenté un peu pour le fun
    ],
    treasures: [
        { id: 'pearl', name: 'Perle', value: 1000, icon: '⚪', desc: 'Une jolie perle. Se vend bon prix.' },
        { id: 'big_pearl', name: 'Grande Perle', value: 4000, icon: '⚪', desc: 'Une perle énorme. Très précieuse.' },
        { id: 'stardust', name: 'Poussière Étoile', value: 2000, icon: '✨', desc: 'Sable rouge magnifique. Se vend bien.' },
        { id: 'star_piece', name: 'Morceau Étoile', value: 6000, icon: '⭐', desc: 'Un fragment de joyau spatial.' },
        { id: 'heart_scale', name: 'Écaille Cœur', value: 500, icon: '💖', desc: 'Une écaille rare. Les collectionneurs l\'adorent.' },
        { id: 'golden_magikarp', name: 'Statue Dorée', value: 15000, icon: '🏆', desc: 'Une statuette en or massif.' }
    ]
};

let fishingState = {
    active: false,
    progress: 0,
    tension: 0,
    fishPosition: 50,
    barPosition: 50,
    barVelocity: 0,
    difficulty: 1,
    target: null,
    lootType: null,
    isReeling: false,
    animationId: null
};

// Lancement de la pêche
window.startFishing = function() {
    // Vérifications pré-requis
    if (gameState.level < 2) {
        showToast('Niveau 2 requis pour pêcher !', 'error');
        return;
    }
    if (gameState.inventory.fishingTokens <= 0) {
        showToast('Plus de jetons ! (Recharge : 1/heure)', 'error');
        return;
    }

    // Tutoriel (Première fois)
    if (!gameState.tutorials || !gameState.tutorials.fishing) {
        showFishingTutorial();
        return;
    }

    // Setup du loot
    const rand = Math.random();
    let lootType = 'pokemon';
    if (rand > 0.90) lootType = 'treasure';
    else if (rand > 0.65) lootType = 'item';

    // Génération du contenu
    const target = determineFishingLoot(lootType);
    
    // Difficulté adaptative
    let difficulty = 1.0;
    if (lootType === 'treasure') difficulty = 1.4;
    if (lootType === 'pokemon') {
        if (target.rarity === 'rare') difficulty = 1.3;
        if (target.rarity === 'super_rare') difficulty = 1.6;
        if (target.rarity === 'legendary') difficulty = 2.2; // Boss fight !
    }

    // Initialisation État
    fishingState = {
        active: true,
        progress: 30, // Commence à 30%
        tension: 0,
        fishPosition: 50,
        fishVelocity: 0,
        fishTarget: 50,
        barPosition: 50,
        difficulty: difficulty,
        lootType: lootType,
        target: target,
        isReeling: false
    };

    // Consommer jeton
    gameState.inventory.fishingTokens--;
    saveGame();
    updateUI();

    // UI
    showFishingMinigameUI();
    requestAnimationFrame(fishingGameLoop);
};

function determineFishingLoot(type) {
    if (type === 'pokemon') {
        // Check pour Kyogre (Hoenn unlocked + rare chance)
        const hoennUnlocked = gameState.unlockedRegions && gameState.unlockedRegions.has('Hoenn');
        if (hoennUnlocked && Math.random() < 0.02) { // 2% chance si Hoenn
            return { id: 382, name: 'Kyogre', rarity: 'legendary', isShiny: false }; 
        }
        
        // Check pour Léviator Rouge (Shiny Gyarados) - 0.6% chance, EXCLUSIF à la pêche
        if (Math.random() < 0.006) {
            return { id: 130, name: 'Léviator', rarity: 'super_rare', isShiny: true };
        }

        return selectPokemon('spawn', true); // Pool Eau standard
    } 
    else if (type === 'treasure') {
        return FISHING_CONFIG.treasures[Math.floor(Math.random() * FISHING_CONFIG.treasures.length)];
    } 
    else {
        const items = ['pokeball', 'greatball', 'diveball', 'framby', 'pinap', 'marin_lure'];
        const id = items[Math.floor(Math.random() * items.length)];
        return { id: id, name: ALL_ITEMS[id].name, icon: ALL_ITEMS[id].icon, qty: Math.floor(Math.random() * 2) + 1 };
    }
}

// Boucle Physique (60 FPS)
function fishingGameLoop() {
    if (!fishingState.active) return;

    // 1. Physique du Poisson (Cible)
    // Le poisson se déplace vers une cible aléatoire qui change régulièrement
    if (Math.random() < 0.05) {
        fishingState.fishTarget = Math.random() * 90;
    }
    // Lissage du mouvement (Lerp) - Ralenti pour plus de contrôle
    const speed = (0.5 + (fishingState.difficulty * 0.5)) * 0.3; // Réduit de 0.5 à 0.3
    fishingState.fishPosition += (fishingState.fishTarget - fishingState.fishPosition) * (0.015 * speed); // Réduit de 0.025 à 0.015
    
    // Sursauts aléatoires pour les poissons difficiles
    if (fishingState.difficulty > 1.5 && Math.random() < 0.03) {
        fishingState.fishPosition += (Math.random() - 0.5) * 30;
    }

    // Bornes Poisson
    fishingState.fishPosition = Math.max(0, Math.min(90, fishingState.fishPosition));

    // 2. Physique de la Barre (Joueur)
    if (fishingState.isReeling) {
        fishingState.barPosition += 0.8; // Ralenti de 1.5 à 0.8
    } else {
        fishingState.barPosition -= 0.6; // Ralenti de 1.2 à 0.6
    }
    fishingState.barPosition = Math.max(0, Math.min(85, fishingState.barPosition));

    // 3. Collision & Progrès
    const barTop = fishingState.barPosition + 15; // Taille barre
    const barBottom = fishingState.barPosition;
    const fishCenter = fishingState.fishPosition + 5;

    const isInZone = fishCenter >= barBottom && fishCenter <= barTop;
    
    if (isInZone) {
        fishingState.progress += 0.2; // Ralenti de 0.3 à 0.2
        fishingState.tension = Math.max(0, fishingState.tension - 0.5);
    } else {
        fishingState.progress -= 0.1; // Ralenti de 0.15 à 0.1
        // La tension monte si on est hors zone trop longtemps ? 
        // Pour l'instant on utilise juste la barre de progrès qui descend.
    }

    // 4. Conditions Fin
    if (fishingState.progress >= 100) {
        endFishing(true);
        return;
    } else if (fishingState.progress <= 0) {
        endFishing(false);
        return;
    }

    // 5. Rendu
    updateFishingUI(isInZone);
    requestAnimationFrame(fishingGameLoop);
}

// UI
function showFishingMinigameUI() {
    const modal = document.createElement('div');
    modal.id = 'fishing-modal';
    modal.className = 'modal active';
    modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,10,30,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; user-select: none; touch-action: none;`;

    modal.innerHTML = `
        <div style="position: relative; width: 300px; text-align: center;">
            <h2 style="color: white; text-shadow: 0 0 10px #00ffff; margin-bottom: 20px; font-size: 1.5em;">🎣 Pêche en cours !</h2>
            
            <div style="display: flex; height: 350px; gap: 20px; justify-content: center;">
                <!-- Jauge de Succès -->
                <div style="width: 30px; height: 100%; background: #1a1a1a; border: 2px solid #444; border-radius: 15px; overflow: hidden; position: relative;">
                    <div id="fish-progress" style="position: absolute; bottom: 0; width: 100%; height: 30%; background: linear-gradient(to top, #4CAF50, #8BC34A); transition: height 0.1s;"></div>
                </div>

                <!-- Zone de l'Eau -->
                <div style="width: 80px; height: 100%; background: rgba(0, 100, 255, 0.3); border: 3px solid #20d5d2; border-radius: 40px; position: relative; overflow: hidden; box-shadow: inset 0 0 20px rgba(0,0,0,0.5);">
                    <!-- Fond animé -->
                    <div class="bubbles" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; opacity: 0.3;"></div>
                    
                    <!-- Barre du Joueur -->
                    <div id="fish-bar" style="position: absolute; bottom: 50%; left: 5%; width: 90%; height: 15%; background: rgba(255, 255, 255, 0.8); border-radius: 10px; box-shadow: 0 0 15px rgba(255,255,255,0.5); transition: bottom 0.05s linear;"></div>
                    
                    <!-- Le Poisson -->
                    <div id="fish-target" style="position: absolute; bottom: 50%; left: 50%; transform: translateX(-50%); font-size: 24px; transition: bottom 0.1s linear; text-shadow: 0 2px 5px rgba(0,0,0,0.5);">🐟</div>
                </div>
            </div>

            <div style="margin-top: 20px; color: rgba(255,255,255,0.6); font-size: 0.9em; animation: pulse 1s infinite;">
                Maintenez pour monter<br>Relâchez pour descendre
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Contrôles (Optimisé Mobile & PC)
    const start = (e) => { if(e.cancelable) e.preventDefault(); fishingState.isReeling = true; };
    const end = (e) => { if(e.cancelable) e.preventDefault(); fishingState.isReeling = false; };

    document.addEventListener('mousedown', start);
    document.addEventListener('mouseup', end);
    document.addEventListener('touchstart', start, {passive: false});
    document.addEventListener('touchend', end, {passive: false});

    fishingState.cleanup = () => {
        document.removeEventListener('mousedown', start);
        document.removeEventListener('mouseup', end);
        document.removeEventListener('touchstart', start);
        document.removeEventListener('touchend', end);
    };
}

function updateFishingUI(isInZone) {
    const bar = document.getElementById('fish-bar');
    const fish = document.getElementById('fish-target');
    const prog = document.getElementById('fish-progress');

    if (bar) {
        bar.style.bottom = fishingState.barPosition + '%';
        bar.style.backgroundColor = isInZone ? '#4ade80' : '#ef4444'; // Vert si bon, Rouge si mauvais
        bar.style.opacity = isInZone ? '0.9' : '0.6';
    }
    if (fish) {
        fish.style.bottom = fishingState.fishPosition + '%';
    }
    if (prog) {
        prog.style.height = fishingState.progress + '%';
        // Changer couleur selon danger
        if (fishingState.progress < 20) prog.style.background = '#ef4444';
        else if (fishingState.progress > 80) prog.style.background = '#ffd700';
        else prog.style.background = '#4CAF50';
    }
}

// Fonction pour afficher l'écran "Oh! ça mord!"
function showFishingBiteScreen() {
    const biteModal = document.createElement('div');
    biteModal.className = 'modal active fishing-bite-screen';
    biteModal.style.cssText = 'display: flex !important; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10002; align-items: center; justify-content: center;';
    
    biteModal.innerHTML = `
        <div style="text-align: center; animation: fadeInScale 0.5s ease-out;">
            <div style="font-size: 4em; margin-bottom: 20px; animation: bounce 1s infinite;">🎣</div>
            <div style="font-size: 3em; font-weight: bold; color: #ffd700; text-shadow: 0 0 20px rgba(255, 215, 0, 0.8); margin-bottom: 10px; animation: pulse 1.5s ease-in-out infinite;">
                Oh ! Ça mord !
            </div>
            <div style="font-size: 1.2em; color: rgba(255,255,255,0.8); margin-top: 20px;">
                Un Pokémon a mordu à l'hameçon !
            </div>
        </div>
    `;
    
    document.body.appendChild(biteModal);
    
    // Afficher le Pokémon après 2 secondes
    setTimeout(() => {
        biteModal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            biteModal.remove();
            // Lancer la capture
            currentFishingPokemon = fishingState.target;
            if (window.showFishingEncounter) {
                window.currentFishingPokemon = fishingState.target;
                window.showFishingEncounter();
            }
        }, 300);
    }, 2000);
}

function endFishing(success) {
    fishingState.active = false;
    if (fishingState.cleanup) fishingState.cleanup();
    document.getElementById('fishing-modal')?.remove();

    if (success) {
        // Succès !
        if (window.FX) FX.confetti(window.innerWidth/2, window.innerHeight/2, 50); // Petits confettis
        
        if (fishingState.lootType === 'pokemon') {
            // Afficher l'écran "Oh! ça mord!" (clin d'œil au jeu Pokémon)
            showFishingBiteScreen();
        } else {
            // Item ou Trésor direct
            const loot = fishingState.target;
            if (fishingState.lootType === 'treasure') {
                // Ajouter à l'inventaire pour qu'il puisse les vendre manuellement
                gameState.inventory[loot.id] = (gameState.inventory[loot.id] || 0) + 1;
                
                showCelebration(
                    'TRÉSOR DES ABYSSES !', 
                    `Vous avez remonté : ${loot.name}\nValeur estimée : ${loot.value} 💰`, 
                    'legendary'
                );
            } else {
                gameState.inventory[loot.id] = (gameState.inventory[loot.id] || 0) + loot.qty;
                showToast(`🎣 Pêche réussie : +${loot.qty} ${loot.name}`, 'success');
            }
            saveGame();
            updateUI();
        }
    } else {
        showToast('Le poisson a cassé la ligne...', 'info');
    }
}

// Tutoriel Pêche
function showFishingTutorial() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.cssText = 'display: flex !important; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 10001; align-items: center; justify-content: center; padding: 20px;';
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #0ea5e9, #2563eb); padding: 30px; border-radius: 20px; max-width: 400px; text-align: center; border: 2px solid white;">
            <div style="font-size: 4em; margin-bottom: 20px;">🎣</div>
            <h2 style="color: white; margin-bottom: 15px;">École de Pêche</h2>
            <p style="color: white; margin-bottom: 15px; line-height: 1.5;">
                Le secret d'un bon pêcheur, c'est la <strong>TENSION</strong>.
            </p>
            <ul style="text-align: left; color: rgba(255,255,255,0.9); margin-bottom: 20px; list-style: none; padding: 0;">
                <li style="margin-bottom: 10px;">👆 <strong>Maintenez</strong> pour faire monter la barre verte.</li>
                <li style="margin-bottom: 10px;">👇 <strong>Relâchez</strong> pour la laisser descendre.</li>
                <li style="margin-bottom: 10px;">🐟 Gardez le <strong>Poisson</strong> à l'intérieur de la zone verte !</li>
            </ul>
            <p style="font-style: italic; color: #ffd700; font-size: 0.9em; margin-bottom: 20px;">
                "On raconte que des créatures légendaires rôdent dans les eaux profondes..."
            </p>
            <button onclick="this.closest('.modal').remove(); if(!gameState.tutorials) gameState.tutorials = {}; gameState.tutorials.fishing = true; saveGame(); startFishing();" class="btn btn--primary" style="background: white; color: #0ea5e9; font-weight: bold; width: 100%; padding: 12px;">
                Compris, je lance la ligne !
            </button>
        </div>
    `;
    document.body.appendChild(modal);
}


