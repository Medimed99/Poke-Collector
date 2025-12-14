// ===== PROTOCOLE "DATA GUARDIAN" - SYSTÈME DE COMBAT COMPLET =====
// Ce fichier contient toutes les fonctions de combat de Boss

// État du combat actuel
let currentBattleState = null;
let battleATBInterval = null;

// Fonction pour sélectionner un Boss et afficher le Team Builder
window.selectBossForBattle = function(bossId) {
    const boss = BOSS_DATA[bossId];
    if (!boss) {
        showToast('Boss introuvable!', 'error');
        return;
    }
    
    // Vérifier les tickets
    if ((gameState.bossBattle?.firewallTickets || 0) <= 0) {
        showToast('Vous n\'avez pas de Ticket Firewall! Achetez-en au Labo (5000 EO).', 'error');
        return;
    }
    
    // Afficher le Team Builder
    showTeamBuilder(boss);
};

// Fonction pour afficher le Team Builder
function showTeamBuilder(boss) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.cssText = 'display: flex !important; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 10000; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;';
    
    // Récupérer les Pokémon capturés
    const capturedPokemon = Array.from(gameState.captured).map(id => ({
        id: id,
        name: FRENCH_NAMES[id] || `Pokémon #${id}`,
        rarity: getRarity(id),
        types: POKEMON_TYPES[id] || ['Normal'],
        isShiny: gameState.shinies.has(id),
        buddyLevel: gameState.buddy?.buddies[id]?.level || 0
    })).sort((a, b) => {
        // Trier par niveau Buddy décroissant, puis par rareté
        if (b.buddyLevel !== a.buddyLevel) return b.buddyLevel - a.buddyLevel;
        const rarityOrder = { legendary: 5, super_rare: 4, rare: 3, uncommon: 2, common: 1 };
        return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
    });
    
    modal.id = 'team-builder-modal-' + Date.now();
    const modalId = modal.id;
    
    let html = `
        <div style="background: rgba(20, 25, 40, 0.95); border: 2px solid #00ff9d; border-radius: 20px; padding: 30px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; font-family: 'Share Tech Mono', monospace;">
            <h2 style="color: #00ff9d; text-align: center; margin-bottom: 20px;">
                SÉLECTION D'ÉQUIPE
            </h2>
            
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #ff0055;">
                <div style="color: #ff0055; font-weight: bold; margin-bottom: 5px;">${boss.name}</div>
                <div style="color: rgba(255,255,255,0.7); font-size: 0.9em;">${boss.description || ''}</div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: white; margin-bottom: 10px;">Équipe (<span id="team-count">0</span>/3)</h3>
                <div id="selected-team-display" style="display: flex; gap: 10px; margin-bottom: 15px; min-height: 100px; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px;">
                    ${Array(3).fill(0).map((_, i) => `
                        <div id="team-slot-${i}" style="flex: 1; min-height: 80px; border: 2px dashed rgba(255,255,255,0.3); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.5); cursor: pointer;"
                             onclick="removeFromTeam(${i}, '${modalId}')">
                            Slot ${i + 1}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: white; margin-bottom: 10px;">Pokémon Disponibles</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; max-height: 400px; overflow-y: auto;">
    `;
    
    capturedPokemon.forEach(pokemon => {
        const spriteUrl = getAnimatedSpriteUrl(pokemon.id, pokemon.isShiny);
        
        html += `
            <div onclick="addToTeam(${pokemon.id}, '${modalId}')" 
                 style="background: rgba(255,255,255,0.1); 
                        border: 2px solid rgba(255,255,255,0.2); 
                        border-radius: 8px; padding: 10px; cursor: pointer; text-align: center;
                        transition: all 0.2s;"
                 onmouseenter="this.style.borderColor='#00ff9d'; this.style.transform='scale(1.05)';"
                 onmouseleave="this.style.borderColor='rgba(255,255,255,0.2)'; this.style.transform='scale(1)';">
                <img src="${spriteUrl}" style="width: 64px; height: 64px; image-rendering: pixelated; object-fit: contain;" 
                     onerror="this.style.display='none';">
                <div style="color: white; font-size: 0.85em; margin-top: 5px; font-weight: bold;">
                    ${pokemon.name}${pokemon.isShiny ? ' ✨' : ''}
                </div>
                ${pokemon.buddyLevel > 0 ? `<div style="color: #00ff9d; font-size: 0.75em;">Buddy Lv.${pokemon.buddyLevel}</div>` : ''}
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="this.closest('.modal').remove()" 
                        style="padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; 
                               border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; cursor: pointer;">
                    Annuler
                </button>
                <button id="start-battle-btn" onclick="startBossBattle('${boss.id}', '${modalId}')" 
                        disabled
                        style="padding: 12px 24px; background: #ff0055; color: white; 
                               border: none; border-radius: 6px; cursor: pointer; font-weight: bold;
                               opacity: 0.5;">
                    DÉMARRER LE COMBAT
                </button>
            </div>
        </div>
    `;
    
    modal.innerHTML = html;
    document.body.appendChild(modal);
    
    // Stocker l'équipe sélectionnée dans le modal
    modal.selectedTeam = [];
    
    // Fonction pour ajouter un Pokémon à l'équipe
    window.addToTeam = function(pokemonId, modalId) {
        const modalEl = document.getElementById(modalId);
        if (!modalEl) return;
        
        const team = modalEl.selectedTeam || [];
        
        // Vérifier si déjà dans l'équipe
        if (team.some(p => p.id === pokemonId)) {
            showToast('Ce Pokémon est déjà dans l\'équipe!', 'error');
            return;
        }
        
        // Ajouter à l'équipe (max 3)
        if (team.length >= 3) {
            showToast('Équipe complète (3 Pokémon maximum)', 'error');
            return;
        }
        
        const pokemon = capturedPokemon.find(p => p.id === pokemonId);
        if (pokemon) {
            team.push(pokemon);
            modalEl.selectedTeam = team;
            updateTeamDisplay(modalEl, team);
        }
    };
    
    // Fonction pour retirer un Pokémon de l'équipe
    window.removeFromTeam = function(slotIndex, modalId) {
        const modalEl = document.getElementById(modalId);
        if (!modalEl) return;
        
        const team = modalEl.selectedTeam || [];
        if (team[slotIndex]) {
            team.splice(slotIndex, 1);
            modalEl.selectedTeam = team;
            updateTeamDisplay(modalEl, team);
        }
    };
    
    // Fonction pour mettre à jour l'affichage de l'équipe
    function updateTeamDisplay(modalEl, team) {
        const teamCount = document.getElementById('team-count');
        if (teamCount) teamCount.textContent = team.length;
        
        for (let i = 0; i < 3; i++) {
            const slot = document.getElementById(`team-slot-${i}`);
            if (!slot) continue;
            
            if (team[i]) {
                const pokemon = team[i];
                const spriteUrl = getAnimatedSpriteUrl(pokemon.id, pokemon.isShiny);
                slot.innerHTML = `
                    <div style="text-align: center; width: 100%;">
                        <img src="${spriteUrl}" style="width: 48px; height: 48px; image-rendering: pixelated; object-fit: contain;" 
                             onerror="this.style.display='none';">
                        <div style="color: white; font-size: 0.75em; margin-top: 5px;">${pokemon.name}${pokemon.isShiny ? ' ✨' : ''}</div>
                        <div style="color: #888; font-size: 0.7em; margin-top: 2px;">Cliquer pour retirer</div>
                    </div>
                `;
                slot.style.border = '2px solid #00ff9d';
                slot.style.background = 'rgba(0,255,157,0.1)';
            } else {
                slot.innerHTML = `Slot ${i + 1}`;
                slot.style.border = '2px dashed rgba(255,255,255,0.3)';
                slot.style.background = 'transparent';
            }
        }
        
        // Activer/désactiver le bouton de démarrage
        const startBtn = document.getElementById('start-battle-btn');
        if (startBtn) {
            if (team.length === 3) {
                startBtn.disabled = false;
                startBtn.style.opacity = '1';
            } else {
                startBtn.disabled = true;
                startBtn.style.opacity = '0.5';
            }
        }
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
};

// Fonction pour démarrer le combat
window.startBossBattle = function(bossId, modalId) {
    const modalEl = document.getElementById(modalId);
    if (!modalEl) return;
    
    const team = modalEl.selectedTeam || [];
    if (team.length !== 3) {
        showToast('Sélectionnez 3 Pokémon!', 'error');
        return;
    }
    
    const boss = BOSS_DATA[bossId];
    if (!boss) {
        showToast('Boss introuvable!', 'error');
        return;
    }
    
    // Vérifier les tickets
    if ((gameState.bossBattle?.firewallTickets || 0) <= 0) {
        showToast('Vous n\'avez pas de Ticket Firewall!', 'error');
        return;
    }
    
    // Consommer un ticket
    gameState.bossBattle.firewallTickets--;
    saveGame();
    
    // Fermer le modal
    modalEl.remove();
    
    // Initialiser le combat
    initializeBossBattle(boss, team);
};

// Fonction pour initialiser le combat
function initializeBossBattle(boss, team) {
    // Créer les BattleUnits
    const playerUnits = team.map(p => createBattleUnit(p.id, p.isShiny));
    
    // Calculer le HP total du Boss (phases)
    const totalPhases = boss.phases || 1;
    const hpPerPhase = boss.hpPerPhase || (boss.hp || 5000);
    const totalHp = totalPhases * hpPerPhase;
    
    // Initialiser l'état du combat
    currentBattleState = {
        boss: {
            ...boss,
            currentHp: totalHp,
            maxHp: totalHp,
            hpPerPhase: hpPerPhase,
            currentPhase: 1,
            totalPhases: totalPhases,
            atb: 0,
            atk: 200 + (boss.level || 1) * 50, // Attaque de base du Boss (scalée par niveau)
            skills: boss.skills ? boss.skills.map(s => ({ ...s, currentCooldown: 0 })) : []
        },
        playerTeam: playerUnits,
        activeUnitIndex: 0,
        isPlayerTurn: false,
        battleLog: [],
        turnCount: 0
    };
    
    // Message de début de combat
    addBattleLog(`⚔️ Combat contre ${boss.name} commencé!`, 'info');
    addBattleLog(`Phase ${currentBattleState.boss.currentPhase}/${totalPhases}`, 'info');
    
    // Afficher l'interface de combat
    renderBattleInterface();
    
    // Démarrer le moteur ATB
    startATBEngine();
}

// Fonction pour afficher l'interface de combat
function renderBattleInterface() {
    const container = document.getElementById('boss-battle-container');
    if (!container || !currentBattleState) return;
    
    const boss = currentBattleState.boss;
    const activeUnit = currentBattleState.playerTeam[currentBattleState.activeUnitIndex];
    
    let html = `
        <div class="boss-battle-stage">
            <!-- Timeline -->
            <div class="boss-timeline" id="battle-timeline">
                <!-- Sera mis à jour dynamiquement -->
            </div>
            
            <!-- Boss Zone -->
            <div class="boss-zone">
                <div class="boss-card">
                    <div class="boss-name">${boss.name}</div>
                    <div class="boss-hp-bar">
                        <div class="boss-hp-fill" id="boss-hp-fill" style="width: ${(boss.currentHp / boss.maxHp) * 100}%"></div>
                    </div>
                </div>
                <div class="boss-visual">
                    <div class="boss-aura"></div>
                    <img src="${getAnimatedSpriteUrl(boss.pokemonId, false)}" class="boss-sprite" alt="${boss.name}">
                </div>
            </div>
            
            <!-- Player Zone -->
            <div class="player-zone">
                <div class="team-formation">
                    ${currentBattleState.playerTeam.map((unit, index) => {
                        const isActive = index === currentBattleState.activeUnitIndex;
                        const spriteUrl = getAnimatedSpriteUrl(unit.id, unit.isShiny);
                        return `
                            <div class="${isActive ? 'active-unit' : `support-unit s${index}`}" id="player-unit-${index}">
                                ${isActive ? `
                                    <div class="player-hud">
                                        <div class="player-name">${unit.name}</div>
                                        <div class="player-hp-bar">
                                            <div class="player-hp-fill" id="player-hp-${index}" style="width: ${(unit.currentHp / unit.maxHp) * 100}%"></div>
                                        </div>
                                    </div>
                                ` : ''}
                                <img src="${spriteUrl}" class="${isActive ? 'active-sprite' : ''}" alt="${unit.name}">
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- Control Panel -->
            <div class="boss-control-panel" id="battle-control-panel">
                ${activeUnit.skills.map((skill, index) => `
                    <button class="action-btn ${skill.currentCooldown > 0 ? 'disabled' : ''}" 
                            onclick="useSkill(${index})" 
                            id="skill-btn-${index}">
                        <span class="btn-icon">${getSkillIcon(skill.type)}</span>
                        <span class="btn-label">${skill.name}</span>
                        ${skill.currentCooldown > 0 ? `<span class="cooldown-indicator">${skill.currentCooldown}</span>` : ''}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Mettre à jour la timeline
    updateBattleTimeline();
}

// Fonction pour obtenir l'icône d'un skill
function getSkillIcon(skillType) {
    const icons = {
        'damage_single': '⚔️',
        'damage_aoe': '💥',
        'heal': '💚',
        'buff_team': '⬆️',
        'taunt': '🛡️',
        'stun': '💫',
        'shield': '🔰'
    };
    return icons[skillType] || '⚡';
}

// Fonction pour mettre à jour la timeline
function updateBattleTimeline() {
    const timeline = document.getElementById('battle-timeline');
    if (!timeline || !currentBattleState) return;
    
    // Créer la liste des unités (Boss + Équipe)
    const allUnits = [
        { type: 'boss', atb: currentBattleState.boss.atb || 0, name: currentBattleState.boss.name },
        ...currentBattleState.playerTeam.map((unit, index) => ({
            type: 'player',
            index: index,
            atb: unit.atb,
            name: unit.name,
            isActive: index === currentBattleState.activeUnitIndex,
            isAlive: unit.currentHp > 0
        }))
    ];
    
    // Trier par ATB décroissant
    allUnits.sort((a, b) => b.atb - a.atb);
    
    timeline.innerHTML = allUnits.filter(u => u.type === 'boss' || u.isAlive).map(unit => {
        const spriteUrl = unit.type === 'boss' 
            ? getAnimatedSpriteUrl(currentBattleState.boss.pokemonId, false)
            : getAnimatedSpriteUrl(currentBattleState.playerTeam[unit.index].id, currentBattleState.playerTeam[unit.index].isShiny);
        
        return `
            <div class="timeline-portrait ${unit.type === 'boss' ? 'boss' : ''} ${unit.isActive ? 'active' : ''}" 
                 style="opacity: ${unit.isAlive === false ? 0.3 : 1};">
                <img src="${spriteUrl}" alt="${unit.name}">
                <div style="position: absolute; bottom: -15px; left: 50%; transform: translateX(-50%); font-size: 8px; color: #00ff9d;">
                    ${Math.round(unit.atb)}%
                </div>
            </div>
        `;
    }).join('');
}

// Fonction pour démarrer le moteur ATB
function startATBEngine() {
    if (battleATBInterval) clearInterval(battleATBInterval);
    
    battleATBInterval = setInterval(() => {
        if (!currentBattleState) {
            clearInterval(battleATBInterval);
            return;
        }
        
        // Mettre à jour l'ATB de toutes les unités
        currentBattleState.playerTeam.forEach(unit => {
            if (unit.currentHp > 0) {
                unit.atb += unit.stats.spd * 0.07;
                if (unit.atb >= 100) {
                    unit.atb = 100;
                }
            }
        });
        
        // Mettre à jour l'ATB du Boss
        if (!currentBattleState.boss.atb) currentBattleState.boss.atb = 0;
        const bossSpeed = 80; // Vitesse de base du Boss
        currentBattleState.boss.atb += bossSpeed * 0.07;
        if (currentBattleState.boss.atb >= 100) {
            currentBattleState.boss.atb = 100;
            // Tour du Boss
            if (!currentBattleState.isPlayerTurn) {
                processBossTurn();
            }
        }
        
        // Vérifier si une unité du joueur peut agir
        const readyUnit = currentBattleState.playerTeam.findIndex(unit => unit.atb >= 100 && unit.currentHp > 0);
        if (readyUnit >= 0 && !currentBattleState.isPlayerTurn) {
            currentBattleState.isPlayerTurn = true;
            currentBattleState.activeUnitIndex = readyUnit;
            updateBattleTimeline();
            renderBattleInterface();
        }
        
        // Mettre à jour la timeline visuellement
        updateBattleTimeline();
    }, 100); // Tick toutes les 100ms
}

// Fonction pour utiliser un skill
window.useSkill = function(skillIndex) {
    if (!currentBattleState || !currentBattleState.isPlayerTurn) return;
    
    const activeUnit = currentBattleState.playerTeam[currentBattleState.activeUnitIndex];
    if (!activeUnit || activeUnit.currentHp <= 0) return;
    
    const skill = activeUnit.skills[skillIndex];
    if (!skill || skill.currentCooldown > 0) return;
    
    // Exécuter le skill
    executeSkill(activeUnit, skill);
    
    // Réinitialiser l'ATB
    activeUnit.atb = 0;
    currentBattleState.isPlayerTurn = false;
    
    // Mettre à jour les cooldowns
    activeUnit.skills.forEach(s => {
        if (s.currentCooldown > 0) s.currentCooldown--;
    });
    
    // Mettre à jour l'interface
    renderBattleInterface();
};

// Fonction pour exécuter un skill
function executeSkill(unit, skill) {
    const boss = currentBattleState.boss;
    
    switch (skill.type) {
        case 'damage_single':
            const damage = calculateDamage(unit, boss, skill.multiplier || 1.0);
            boss.currentHp = Math.max(0, boss.currentHp - damage);
            addBattleLog(`${unit.name} utilise ${skill.name} et inflige ${damage} dégâts!`);
            // Animation de dégâts
            showDamageNumber(boss.currentHp > 0 ? damage : boss.currentHp + damage, 'boss', false);
            // Animation d'attaque sur l'unité active
            animateUnitAttack(unit);
            break;
            
        case 'damage_aoe':
            // Dégâts de zone
            const aoeDamage = calculateDamage(unit, boss, (skill.multiplier || 0.7) * 0.8);
            boss.currentHp = Math.max(0, boss.currentHp - aoeDamage);
            addBattleLog(`${unit.name} utilise ${skill.name} et inflige ${aoeDamage} dégâts de zone!`);
            showDamageNumber(boss.currentHp > 0 ? aoeDamage : boss.currentHp + aoeDamage, 'boss', true);
            animateUnitAttack(unit);
            break;
            
        case 'heal':
            const healAmount = Math.round(unit.maxHp * (skill.multiplier || 0.3));
            currentBattleState.playerTeam.forEach((teamUnit, index) => {
                if (teamUnit.currentHp > 0) {
                    const oldHp = teamUnit.currentHp;
                    teamUnit.currentHp = Math.min(teamUnit.maxHp, teamUnit.currentHp + healAmount);
                    // Animation de soin
                    showHealNumber(teamUnit.currentHp - oldHp, `player-unit-${index}`);
                }
            });
            addBattleLog(`${unit.name} soigne l'équipe de ${healAmount} PV!`);
            animateUnitHeal(unit);
            break;
            
        case 'buff_team':
            currentBattleState.playerTeam.forEach(teamUnit => {
                if (teamUnit.currentHp > 0) {
                    // Appliquer buff (simplifié)
                    teamUnit.stats.atk = Math.round(teamUnit.stats.atk * 1.2);
                    teamUnit.stats.spd = Math.round(teamUnit.stats.spd * 1.1);
                }
            });
            addBattleLog(`${unit.name} renforce l'équipe!`);
            animateUnitBuff(unit);
            break;
    }
    
    // Mettre le skill en cooldown
    skill.currentCooldown = skill.cooldown || 0;
    
    // Vérifier la victoire/défaite
    checkBattleEnd();
    
    // Mettre à jour l'interface
    updateBattleInterface();
}

// Fonction pour afficher un nombre de dégâts flottant
function showDamageNumber(damage, target, isAOE) {
    const targetElement = target === 'boss' 
        ? document.querySelector('.boss-visual')
        : document.getElementById(`player-unit-${currentBattleState.activeUnitIndex}`);
    
    if (!targetElement) return;
    
    const damageEl = document.createElement('div');
    damageEl.style.cssText = `
        position: absolute;
        color: ${isAOE ? '#ff6b6b' : '#ff0055'};
        font-size: 24px;
        font-weight: bold;
        font-family: 'Share Tech Mono', monospace;
        text-shadow: 0 0 10px currentColor, 2px 2px 4px rgba(0,0,0,0.8);
        pointer-events: none;
        z-index: 1000;
        animation: damageFloat 1.5s ease-out forwards;
    `;
    damageEl.textContent = `-${damage}`;
    
    // Positionner au centre de la cible
    const rect = targetElement.getBoundingClientRect();
    damageEl.style.left = `${rect.left + rect.width / 2}px`;
    damageEl.style.top = `${rect.top + rect.height / 2}px`;
    damageEl.style.transform = 'translate(-50%, -50%)';
    
    document.body.appendChild(damageEl);
    
    setTimeout(() => damageEl.remove(), 1500);
}

// Fonction pour afficher un nombre de soin flottant
function showHealNumber(heal, targetId) {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;
    
    const healEl = document.createElement('div');
    healEl.style.cssText = `
        position: absolute;
        color: #00ff9d;
        font-size: 20px;
        font-weight: bold;
        font-family: 'Share Tech Mono', monospace;
        text-shadow: 0 0 10px currentColor;
        pointer-events: none;
        z-index: 1000;
        animation: healFloat 1.5s ease-out forwards;
    `;
    healEl.textContent = `+${heal}`;
    
    const rect = targetElement.getBoundingClientRect();
    healEl.style.left = `${rect.left + rect.width / 2}px`;
    healEl.style.top = `${rect.top + rect.height / 2}px`;
    healEl.style.transform = 'translate(-50%, -50%)';
    
    document.body.appendChild(healEl);
    
    setTimeout(() => healEl.remove(), 1500);
}

// Fonction pour animer une attaque
function animateUnitAttack(unit) {
    const unitEl = document.getElementById(`player-unit-${currentBattleState.activeUnitIndex}`);
    if (!unitEl) return;
    
    unitEl.style.animation = 'none';
    setTimeout(() => {
        unitEl.style.animation = 'attackPulse 0.5s ease';
    }, 10);
}

// Fonction pour animer un soin
function animateUnitHeal(unit) {
    const unitEl = document.getElementById(`player-unit-${currentBattleState.activeUnitIndex}`);
    if (!unitEl) return;
    
    unitEl.style.animation = 'none';
    setTimeout(() => {
        unitEl.style.animation = 'healGlow 1s ease';
    }, 10);
}

// Fonction pour animer un buff
function animateUnitBuff(unit) {
    const unitEl = document.getElementById(`player-unit-${currentBattleState.activeUnitIndex}`);
    if (!unitEl) return;
    
    unitEl.style.animation = 'none';
    setTimeout(() => {
        unitEl.style.animation = 'buffShine 1s ease';
    }, 10);
}

// Fonction pour calculer les dégâts
function calculateDamage(attacker, defender, skillMultiplier) {
    const baseDamage = attacker.stats.atk * skillMultiplier;
    
    // Calculer l'efficacité des types
    const attackerType = attacker.types[0]; // Type principal
    const defenderTypes = defender.types || [defender.dominantType || 'Normal'];
    const typeEffect = calculateTypeEffectiveness(attackerType, defenderTypes);
    
    // Calculer les dégâts avec la défense
    const defenseReduction = defender.stats?.def || 100;
    const damage = Math.round(baseDamage * typeEffect.multiplier * (100 / (100 + defenseReduction)));
    
    // Chance de critique
    const critRate = 0.15; // 15% de base
    const isCrit = Math.random() < critRate;
    const finalDamage = isCrit ? Math.round(damage * 1.5) : damage;
    
    if (isCrit) {
        addBattleLog('✨ COUP CRITIQUE! ✨', 'crit');
    }
    if (typeEffect.isGlancing) {
        addBattleLog('⚡ Coup éraflé!', 'glancing');
    }
    
    return finalDamage;
}

// Fonction pour le tour du Boss
function processBossTurn() {
    const boss = currentBattleState.boss;
    currentBattleState.turnCount = (currentBattleState.turnCount || 0) + 1;
    
    // Vérifier les phases (transition de phase)
    checkBossPhaseTransition();
    
    // Choisir un skill selon l'IA du Boss
    const availableSkills = boss.skills?.filter(s => !s.currentCooldown || s.currentCooldown <= 0) || [];
    const aliveUnits = currentBattleState.playerTeam.filter(u => u.currentHp > 0);
    
    if (aliveUnits.length === 0) {
        checkBattleEnd();
        return;
    }
    
    // IA selon le pattern d'attaque
    let skillToUse = null;
    const attackPattern = boss.attackPattern || 'balanced';
    
    if (availableSkills.length > 0) {
        // Pattern agressif : privilégie les dégâts
        if (attackPattern === 'aggressive') {
            const damageSkills = availableSkills.filter(s => s.type === 'damage_single' || s.type === 'damage_aoe');
            skillToUse = damageSkills.length > 0 
                ? damageSkills[Math.floor(Math.random() * damageSkills.length)]
                : availableSkills[0];
        }
        // Pattern défensif : privilégie les buffs
        else if (attackPattern === 'defensive') {
            const buffSkills = availableSkills.filter(s => s.type === 'def_up' || s.type === 'shield');
            skillToUse = buffSkills.length > 0 
                ? buffSkills[Math.floor(Math.random() * buffSkills.length)]
                : availableSkills[0];
        }
        // Pattern équilibré : aléatoire
        else {
            skillToUse = availableSkills[Math.floor(Math.random() * availableSkills.length)];
        }
    }
    
    // Exécuter l'action
    if (skillToUse) {
        executeBossSkill(boss, skillToUse, aliveUnits);
        skillToUse.currentCooldown = skillToUse.cooldown || 0;
    } else {
        // Attaque de base
        const target = aliveUnits[Math.floor(Math.random() * aliveUnits.length)];
        const damage = Math.round(boss.atk * 0.8);
        target.currentHp = Math.max(0, target.currentHp - damage);
        addBattleLog(`${boss.name} attaque ${target.name} et inflige ${damage} dégâts!`);
    }
    
    // Réinitialiser l'ATB du Boss
    boss.atb = 0;
    
    // Mettre à jour les cooldowns du Boss
    if (boss.skills) {
        boss.skills.forEach(s => {
            if (s.currentCooldown) s.currentCooldown--;
        });
    }
    
    // Vérifier la fin du combat
    checkBattleEnd();
    updateBattleInterface();
}

// Fonction pour exécuter un skill du Boss
function executeBossSkill(boss, skill, aliveUnits) {
    switch (skill.type) {
        case 'damage_single':
            const target = aliveUnits[Math.floor(Math.random() * aliveUnits.length)];
            const targetIndex = currentBattleState.playerTeam.findIndex(u => u.id === target.id);
            const singleDamage = Math.round(boss.atk * (skill.damage || 0.5));
            target.currentHp = Math.max(0, target.currentHp - singleDamage);
            addBattleLog(`${boss.name} utilise ${skill.name} sur ${target.name} et inflige ${singleDamage} dégâts!`);
            // Animation de dégâts
            showDamageNumber(singleDamage, `player-unit-${targetIndex}`, false);
            // Animation de shake
            animateUnitDamage(targetIndex);
            break;
            
        case 'damage_aoe':
            const aoeDamage = Math.round(boss.atk * (skill.damage || 0.3));
            aliveUnits.forEach((unit, index) => {
                const unitIndex = currentBattleState.playerTeam.findIndex(u => u.id === unit.id);
                unit.currentHp = Math.max(0, unit.currentHp - aoeDamage);
                showDamageNumber(aoeDamage, `player-unit-${unitIndex}`, true);
                animateUnitDamage(unitIndex);
            });
            addBattleLog(`${boss.name} utilise ${skill.name}! Tous les Pokémon subissent ${aoeDamage} dégâts!`);
            break;
            
        case 'def_up':
            // Le Boss se buff (simplifié pour l'instant)
            boss.atk = Math.round(boss.atk * 1.2);
            addBattleLog(`${boss.name} utilise ${skill.name}! Sa puissance augmente!`);
            // Animation sur le Boss
            const bossVisual = document.querySelector('.boss-visual');
            if (bossVisual) {
                bossVisual.style.animation = 'none';
                setTimeout(() => {
                    bossVisual.style.animation = 'boss-float 4s ease-in-out infinite, boss-glitch 3s infinite linear alternate-reverse, buffShine 1s ease';
                }, 10);
            }
            break;
            
        case 'shield':
            // Le Boss se protège (simplifié)
            addBattleLog(`${boss.name} utilise ${skill.name}! Il est protégé!`);
            break;
    }
}

// Fonction pour animer les dégâts reçus
function animateUnitDamage(unitIndex) {
    const unitEl = document.getElementById(`player-unit-${unitIndex}`);
    if (!unitEl) return;
    
    unitEl.style.animation = 'none';
    setTimeout(() => {
        unitEl.style.animation = 'damageShake 0.5s ease';
    }, 10);
}

// Fonction pour vérifier la transition de phase
function checkBossPhaseTransition() {
    const boss = currentBattleState.boss;
    const hpPerPhase = boss.hpPerPhase;
    const currentPhaseHp = boss.currentHp % hpPerPhase;
    const expectedPhase = Math.ceil(boss.currentHp / hpPerPhase);
    
    if (expectedPhase < boss.currentPhase && boss.currentPhase > 1) {
        // Transition vers une phase précédente (régénération - ne devrait pas arriver)
        return;
    }
    
    if (expectedPhase > boss.currentPhase) {
        // Nouvelle phase !
        boss.currentPhase = expectedPhase;
        addBattleLog(`⚠️ ${boss.name} entre en Phase ${boss.currentPhase}!`, 'warning');
        
        // Buff du Boss en phase supérieure
        boss.atk = Math.round(boss.atk * 1.15); // +15% d'attaque par phase
        
        // Animation visuelle (à implémenter)
        const bossVisual = document.querySelector('.boss-visual');
        if (bossVisual) {
            bossVisual.style.animation = 'none';
            setTimeout(() => {
                bossVisual.style.animation = 'boss-float 4s ease-in-out infinite, boss-glitch 3s infinite linear alternate-reverse';
            }, 10);
        }
    }
}

// Fonction pour vérifier la fin du combat
function checkBattleEnd() {
    const boss = currentBattleState.boss;
    const team = currentBattleState.playerTeam;
    
    // Vérifier la défaite
    const allDead = team.every(unit => unit.currentHp <= 0);
    if (allDead) {
        endBattle(false);
        return;
    }
    
    // Vérifier la victoire
    if (boss.currentHp <= 0) {
        endBattle(true);
        return;
    }
}

// Fonction pour terminer le combat
function endBattle(victory) {
    if (battleATBInterval) {
        clearInterval(battleATBInterval);
        battleATBInterval = null;
    }
    
    const boss = currentBattleState.boss;
    
    if (victory) {
        // Récompenses
        const rewards = boss.rewards || {};
        let rewardText = '🎉 VICTOIRE! 🎉\n\nRécompenses:\n';
        
        // Shiny Tokens
        if (rewards.shinyTokens) {
            const tokens = Math.floor(Math.random() * (rewards.shinyTokens.max - rewards.shinyTokens.min + 1)) + rewards.shinyTokens.min;
            gameState.rogue.totalShinyTokens = (gameState.rogue.totalShinyTokens || 0) + tokens;
            rewardText += `💎 ${tokens} Shiny Tokens\n`;
        }
        
        // Coins et XP
        if (rewards.coins) {
            gameState.coins += rewards.coins;
            rewardText += `💰 ${rewards.coins} Coins\n`;
        }
        if (rewards.xp) {
            gameState.xp += rewards.xp;
            rewardText += `⭐ ${rewards.xp} XP\n`;
        }
        
        // Lore File (chance)
        if (boss.loreFiles && boss.loreFiles.length > 0) {
            boss.loreFiles.forEach(loreFile => {
                if (Math.random() < (loreFile.chance || 0.5)) {
                    if (!gameState.loreFiles) gameState.loreFiles = [];
                    gameState.loreFiles.push(loreFile.id);
                    rewardText += `📜 ${loreFile.id} obtenu!\n`;
                }
            });
        }
        
        gameState.bossBattle.battlesWon = (gameState.bossBattle.battlesWon || 0) + 1;
        saveGame();
        
        showToast(rewardText, 'success');
    } else {
        showToast('💀 Défaite... Les Data Guardians sont trop puissants.', 'error');
    }
    
    gameState.bossBattle.battlesCompleted = (gameState.bossBattle.battlesCompleted || 0) + 1;
    saveGame();
    
    // Réinitialiser l'état
    currentBattleState = null;
    
    // Retourner à la page de sélection
    setTimeout(() => {
        renderBossBattlePage();
    }, 2000);
}

// Fonction pour ajouter un log de combat
function addBattleLog(message, type = 'info') {
    if (!currentBattleState) return;
    currentBattleState.battleLog.push({ message, type, timestamp: Date.now() });
    // Limiter à 20 logs
    if (currentBattleState.battleLog.length > 20) {
        currentBattleState.battleLog.shift();
    }
    // Afficher dans la console pour debug
    console.log(`[BATTLE] ${message}`);
}

// Fonction pour mettre à jour l'interface de combat
function updateBattleInterface() {
    if (!currentBattleState) return;
    
    const boss = currentBattleState.boss;
    const bossHpFill = document.getElementById('boss-hp-fill');
    if (bossHpFill) {
        const hpPercent = (boss.currentHp / boss.maxHp) * 100;
        bossHpFill.style.width = `${hpPercent}%`;
        
        // Mettre à jour le nom du Boss avec la phase
        const bossName = document.querySelector('.boss-name');
        if (bossName) {
            bossName.textContent = `${boss.name} - Phase ${boss.currentPhase}/${boss.totalPhases}`;
        }
    }
    
    currentBattleState.playerTeam.forEach((unit, index) => {
        const hpFill = document.getElementById(`player-hp-${index}`);
        if (hpFill) {
            hpFill.style.width = `${(unit.currentHp / unit.maxHp) * 100}%`;
        }
    });
    
    updateBattleTimeline();
}

