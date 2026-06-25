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

// CHANTIER 5 — Génère un jeu de compétences variées et lisibles pour le Boss,
// dont une grosse attaque AoE télégraphiée (le joueur doit réagir).
function buildBossSkills(boss) {
    const skills = [
        { id: 'b_strike', name: 'Frappe Données', type: 'damage_single', damage: 0.6, cooldown: 0 },
        { id: 'b_wave', name: 'Vague Corrompue', type: 'damage_aoe', damage: 0.45, cooldown: 3, telegraph: true, big: true },
        { id: 'b_overload', name: 'Surcharge', type: 'def_up', cooldown: 5 }
    ];
    if ((boss.attackPattern || 'balanced') === 'aggressive') {
        skills.push({ id: 'b_burst', name: 'Annihilation', type: 'damage_single', damage: 0.95, cooldown: 4, telegraph: true, big: true });
    }
    if ((boss.attackPattern || 'balanced') === 'defensive') {
        skills.push({ id: 'b_shield', name: 'Pare-feu', type: 'shield', cooldown: 5 });
    }
    return skills.map(s => ({ ...s, currentCooldown: 0 }));
}

// Fonction pour initialiser le combat
function initializeBossBattle(boss, team) {
    // Créer les BattleUnits
    const playerUnits = team.map(p => createBattleUnit(p.id, p.isShiny));

    // CHANTIER 5 — Phases réelles : le HP total est découpé en N phases.
    const totalPhases = boss.phases || ((boss.level || 1) >= 3 ? 3 : 2);
    const totalHp = boss.hp || boss.maxHp || 50000;
    const hpPerPhase = Math.round(totalHp / totalPhases);

    // Types du boss dérivés de l'espèce (POKEMON_TYPES, en FR) pour l'efficacité de type.
    const bossTypes = boss.types || POKEMON_TYPES[boss.pokemonId] || ['Normal'];
    const bossLevel = boss.level || 1;

    // Initialiser l'état du combat
    currentBattleState = {
        boss: {
            ...boss,
            types: bossTypes,
            currentHp: totalHp,
            maxHp: totalHp,
            hpPerPhase: hpPerPhase,
            currentPhase: 1,
            totalPhases: totalPhases,
            atb: 0,
            atk: 200 + bossLevel * 50,           // attaque physique
            spAtk: 220 + bossLevel * 55,         // attaque spéciale
            stats: { def: 120 + bossLevel * 30, spDef: 130 + bossLevel * 30 },
            stunnedTurns: 0,
            shield: 0,
            skills: (boss.skills && boss.skills.length ? boss.skills.map(s => ({ ...s, currentCooldown: 0 })) : buildBossSkills(boss)),
            nextSkill: null
        },
        playerTeam: playerUnits,
        activeUnitIndex: 0,
        isPlayerTurn: false,
        taunt: null,            // { index, turns }
        battleLog: [],
        turnCount: 0
    };

    // Télégraphe la première intention du boss.
    chooseBossNextSkill();

    // Message de début de combat
    addBattleLog(`Combat contre ${boss.name} commencé !`, 'info');
    addBattleLog(`Phase ${currentBattleState.boss.currentPhase}/${totalPhases}`, 'info');

    // Afficher l'interface de combat
    renderBattleInterface();

    // Démarrer le moteur ATB
    startATBEngine();
}

// Couleur d'un type (pastille). S'appuie sur TYPE_COLORS (app.js).
function getTypeColor(type) {
    return (typeof TYPE_COLORS !== 'undefined' && TYPE_COLORS[type]) || '#888';
}

// Libellé court de la catégorie de skill (pour les non-attaques).
function getSkillTag(skill) {
    switch (skill.type) {
        case 'heal': return 'SOIN';
        case 'taunt': return 'PROVOC';
        case 'stun': return 'STUN';
        case 'buff_team': return 'BUFF';
        case 'shield': return 'BOUCLIER';
        case 'damage_aoe': return 'AoE';
        default: return null;
    }
}

// Barre HP : classe couleur selon le %.
function hpColorClass(pct) {
    return pct > 50 ? 'hp-green' : pct > 20 ? 'hp-orange' : 'hp-red';
}

// Fonction pour afficher l'interface de combat (CHANTIER 1 — mobile-first plein écran)
function renderBattleInterface() {
    const container = document.getElementById('boss-battle-container');
    if (!container || !currentBattleState) return;

    container.classList.add('bb-fullscreen');
    if (typeof hideBottomNavForBattle === 'function') hideBottomNavForBattle();

    const boss = currentBattleState.boss;
    const activeUnit = currentBattleState.playerTeam[currentBattleState.activeUnitIndex];
    const bossHpPct = (boss.currentHp / boss.maxHp) * 100;
    const next = boss.nextSkill;
    const telegraph = next && next.telegraph
        ? `<div class="bb-telegraph">⚠ ${boss.name.replace(/\/\/\//g, '').trim()} prépare : <strong>${next.name}</strong></div>`
        : '';

    const html = `
        <div class="bb-stage">
            <!-- BOSS -->
            <div class="bb-boss" id="bb-boss-zone">
                <div class="bb-boss-head">
                    <span class="bb-boss-name" id="bb-boss-name">${boss.name}</span>
                    <span class="bb-boss-phase" id="bb-boss-phase">Phase ${boss.currentPhase}/${boss.totalPhases}</span>
                </div>
                <div class="bb-hpbar bb-hpbar--boss">
                    <div class="bb-hpfill ${hpColorClass(bossHpPct)}" id="boss-hp-fill" style="width:${bossHpPct}%"></div>
                </div>
                <div class="bb-boss-types">
                    ${(boss.types || []).map(t => `<span class="bb-typepill" style="background:${getTypeColor(t)}">${t}</span>`).join('')}
                </div>
                <div class="bb-boss-visual" id="bb-boss-visual">
                    <div class="bb-boss-aura"></div>
                    <img src="${getAnimatedSpriteUrl(boss.pokemonId, false)}" class="boss-sprite bb-boss-sprite" alt="${boss.name}">
                </div>
                ${telegraph}
            </div>

            <!-- TIMELINE ATB -->
            <div class="bb-timeline" id="battle-timeline"></div>

            <!-- ÉQUIPE -->
            <div class="bb-team" id="bb-team">
                ${currentBattleState.playerTeam.map((unit, index) => {
                    const isActive = index === currentBattleState.activeUnitIndex && currentBattleState.isPlayerTurn;
                    const ko = unit.currentHp <= 0;
                    const pct = (unit.currentHp / unit.maxHp) * 100;
                    const spriteUrl = getAnimatedSpriteUrl(unit.id, unit.isShiny);
                    return `
                        <div class="bb-unit ${isActive ? 'bb-unit--active' : ''} ${ko ? 'bb-unit--ko' : ''}" id="player-unit-${index}">
                            <img src="${spriteUrl}" class="bb-unit-sprite" alt="${unit.name}">
                            <div class="bb-unit-name">${unit.name}</div>
                            <div class="bb-hpbar">
                                <div class="bb-hpfill ${hpColorClass(pct)}" id="player-hp-${index}" style="width:${pct}%"></div>
                            </div>
                            ${unit.shield > 0 ? '<div class="bb-shield-badge" id="shield-' + index + '">🛡</div>' : ''}
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- COMPÉTENCES -->
            <div class="bb-skills" id="battle-control-panel">
                ${currentBattleState.isPlayerTurn ? activeUnit.skills.map((skill, index) => {
                    const onCd = skill.currentCooldown > 0;
                    const color = getTypeColor(skill.moveType);
                    const tag = getSkillTag(skill);
                    return `
                        <button class="bb-skill ${onCd ? 'bb-skill--cd' : ''} ${skill.signature ? 'bb-skill--sig' : ''}"
                                onclick="useSkill(${index})" id="skill-btn-${index}" ${onCd ? 'disabled' : ''}>
                            <span class="bb-skill-pill" style="background:${color}">${skill.moveType || '•'}</span>
                            <span class="bb-skill-name">${skill.name}</span>
                            ${tag ? `<span class="bb-skill-tag">${tag}</span>` : ''}
                            ${onCd ? `<span class="bb-skill-cd">${skill.currentCooldown}</span>` : ''}
                        </button>
                    `;
                }).join('') : `<div class="bb-waiting">⏳ En attente du prochain tour…</div>`}
            </div>
        </div>
    `;

    container.innerHTML = html;
    updateBattleTimeline();
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
    
    timeline.innerHTML = `<span class="bb-tl-label">ORDRE</span>` + allUnits.filter(u => u.type === 'boss' || u.isAlive).map(unit => {
        const spriteUrl = unit.type === 'boss'
            ? getAnimatedSpriteUrl(currentBattleState.boss.pokemonId, false)
            : getAnimatedSpriteUrl(currentBattleState.playerTeam[unit.index].id, currentBattleState.playerTeam[unit.index].isShiny);

        return `
            <div class="bb-tl-portrait ${unit.type === 'boss' ? 'bb-tl-boss' : ''} ${unit.isActive ? 'bb-tl-active' : ''}"
                 style="opacity:${unit.isAlive === false ? 0.3 : 1};">
                <img src="${spriteUrl}" alt="${unit.name}">
                <span class="bb-tl-atb">${Math.round(unit.atb)}%</span>
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

// Applique des dégâts au boss en tenant compte de son bouclier éventuel.
function dealDamageToBoss(amount, isAOE) {
    const boss = currentBattleState.boss;
    let dmg = amount;
    if (boss.shield > 0) {
        const absorbed = Math.min(boss.shield, dmg);
        boss.shield -= absorbed;
        dmg -= absorbed;
        if (absorbed > 0) addBattleLog(`Le bouclier du boss absorbe ${absorbed} dégâts.`, 'info');
    }
    const before = boss.currentHp;
    boss.currentHp = Math.max(0, boss.currentHp - dmg);
    showDamageNumber(before - boss.currentHp, 'boss', isAOE);
}

// Fonction pour exécuter un skill (joueur). Tous les types sont gérés (CHANTIER 5).
function executeSkill(unit, skill) {
    const boss = currentBattleState.boss;

    switch (skill.type) {
        case 'damage_single': {
            const damage = calculateDamage(unit, boss, skill.multiplier || 1.0, skill.moveType);
            dealDamageToBoss(damage, false);
            addBattleLog(`${unit.name} utilise ${skill.name} et inflige ${damage} dégâts !`);
            animateUnitAttack(unit);
            break;
        }

        case 'damage_aoe': {
            // Contre un boss unique : grosse frappe (compétence signature).
            const aoeDamage = calculateDamage(unit, boss, skill.multiplier || 0.7, skill.moveType);
            dealDamageToBoss(aoeDamage, true);
            addBattleLog(`${unit.name} déchaîne ${skill.name} : ${aoeDamage} dégâts !`);
            animateUnitAttack(unit);
            break;
        }

        case 'heal': {
            const healAmount = Math.round(unit.maxHp * (skill.multiplier || 0.3));
            currentBattleState.playerTeam.forEach((teamUnit, index) => {
                if (teamUnit.currentHp > 0) {
                    const oldHp = teamUnit.currentHp;
                    teamUnit.currentHp = Math.min(teamUnit.maxHp, teamUnit.currentHp + healAmount);
                    showHealNumber(teamUnit.currentHp - oldHp, `player-unit-${index}`);
                }
            });
            addBattleLog(`${unit.name} soigne l'équipe de ${healAmount} PV !`);
            animateUnitHeal(unit);
            break;
        }

        case 'buff_team': {
            currentBattleState.playerTeam.forEach(teamUnit => {
                if (teamUnit.currentHp > 0) {
                    teamUnit.stats.atk = Math.round(teamUnit.stats.atk * 1.2);
                    teamUnit.stats.spAtk = Math.round((teamUnit.stats.spAtk || teamUnit.stats.atk) * 1.2);
                    teamUnit.stats.spd = Math.round(teamUnit.stats.spd * 1.1);
                }
            });
            addBattleLog(`${unit.name} renforce l'équipe (ATK/VIT) !`);
            animateUnitBuff(unit);
            break;
        }

        case 'taunt': {
            // Le boss ciblera ce Pokémon ; il gagne un bouclier.
            const idx = currentBattleState.activeUnitIndex;
            currentBattleState.taunt = { index: idx, turns: 2 };
            const shield = Math.round(unit.maxHp * (skill.shieldPct || 0.3));
            unit.shield = (unit.shield || 0) + shield;
            addBattleLog(`${unit.name} provoque le boss et lève un bouclier (${shield} PV) !`);
            animateUnitBuff(unit);
            break;
        }

        case 'stun': {
            // Petits dégâts + étourdit le boss (saute son prochain tour).
            if (skill.multiplier) {
                const dmg = calculateDamage(unit, boss, skill.multiplier, skill.moveType);
                dealDamageToBoss(dmg, false);
            }
            boss.stunnedTurns = Math.max(boss.stunnedTurns || 0, 1);
            addBattleLog(`${unit.name} étourdit ${boss.name} ! Le boss saute son tour.`, 'warning');
            animateUnitAttack(unit);
            break;
        }

        case 'shield': {
            const shield = Math.round(unit.maxHp * (skill.multiplier || 0.4));
            unit.shield = (unit.shield || 0) + shield;
            addBattleLog(`${unit.name} érige un bouclier (${shield} PV) !`);
            animateUnitBuff(unit);
            break;
        }

        default:
            addBattleLog(`${unit.name} utilise ${skill.name}.`);
            animateUnitAttack(unit);
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
    // target : 'boss' OU un id d'élément ('player-unit-N').
    const targetElement = target === 'boss'
        ? document.querySelector('.bb-boss-visual')
        : (document.getElementById(target) || document.getElementById(`player-unit-${currentBattleState.activeUnitIndex}`));

    if (!targetElement) return;

    const damageEl = document.createElement('div');
    damageEl.style.cssText = `
        position: fixed;
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
        position: fixed;
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

// CHANTIER 4 — Calcul de dégâts propre : STAB + efficacité de type FR complète
// (2 types défenseur) + split physique/spécial + variance + crit + feedback lisible.
function calculateDamage(attacker, defender, skillMultiplier, moveType) {
    // Type de l'ATTAQUE (pas forcément le type principal du Pokémon).
    const atkType = moveType || (attacker.types && attacker.types[0]) || 'Normal';
    const special = (typeof isSpecialType === 'function') ? isSpecialType(atkType) : false;

    // Stat offensive/défensive selon la catégorie de l'attaque.
    const atkStat = special ? (attacker.stats.spAtk || attacker.stats.atk) : attacker.stats.atk;
    const defStat = special
        ? (defender.stats?.spDef || defender.stats?.def || 120)
        : (defender.stats?.def || 120);

    // STAB : ×1.5 si le type de l'attaque correspond à un type du Pokémon.
    const stab = (attacker.types && attacker.types.includes(atkType)) ? 1.5 : 1.0;

    // Efficacité de type FR complète (multiplicatif sur les 2 types du boss).
    const defenderTypes = defender.types || ['Normal'];
    const eff = (typeof getTypeEffectivenessFR === 'function')
        ? getTypeEffectivenessFR(atkType, defenderTypes)
        : { multiplier: 1, label: 'normal' };

    // Variance ×0.85–1.0 (comme les vrais jeux).
    const variance = 0.85 + Math.random() * 0.15;

    let damage = atkStat * skillMultiplier * stab * eff.multiplier * (100 / (100 + defStat)) * variance;
    damage = Math.round(damage);

    // Critique 15% ×1.5.
    const isCrit = Math.random() < 0.15;
    if (isCrit) damage = Math.round(damage * 1.5);

    // Feedback clair.
    if (eff.label === 'super') addBattleLog('Super efficace !', 'super');
    else if (eff.label === 'notvery') addBattleLog('Pas très efficace…', 'notvery');
    else if (eff.label === 'immune') addBattleLog('Ça n\'affecte pas le boss…', 'immune');
    if (isCrit) addBattleLog('Coup critique !', 'crit');

    return Math.max(eff.label === 'immune' ? 0 : 1, damage);
}

// CHANTIER 5 — Choisit la PROCHAINE compétence du boss (télégraphe l'intention).
function chooseBossNextSkill() {
    const boss = currentBattleState.boss;
    const available = (boss.skills || []).filter(s => !s.currentCooldown || s.currentCooldown <= 0);
    const pattern = boss.attackPattern || 'balanced';
    let pick = null;

    if (available.length > 0) {
        if (pattern === 'aggressive') {
            const dmg = available.filter(s => s.type === 'damage_single' || s.type === 'damage_aoe');
            pick = (dmg.length ? dmg : available)[Math.floor(Math.random() * (dmg.length ? dmg.length : available.length))];
        } else if (pattern === 'defensive') {
            const def = available.filter(s => s.type === 'def_up' || s.type === 'shield');
            // Alterne entre se renforcer et frapper.
            pick = (def.length && Math.random() < 0.5 ? def : available)[Math.floor(Math.random() * (def.length && Math.random() < 0.5 ? def.length : available.length))];
        } else {
            pick = available[Math.floor(Math.random() * available.length)];
        }
    }
    boss.nextSkill = pick || { id: 'b_basic', name: 'Frappe', type: 'damage_single', damage: 0.6, cooldown: 0 };
    return boss.nextSkill;
}

// Fonction pour le tour du Boss
function processBossTurn() {
    const boss = currentBattleState.boss;
    currentBattleState.turnCount = (currentBattleState.turnCount || 0) + 1;

    // Vérifier les phases (transition de phase) AVANT d'agir.
    checkBossPhaseTransition();

    const aliveUnits = currentBattleState.playerTeam.filter(u => u.currentHp > 0);
    if (aliveUnits.length === 0) {
        checkBattleEnd();
        return;
    }

    // CHANTIER 5 — Si étourdi, le boss saute son tour.
    if (boss.stunnedTurns > 0) {
        boss.stunnedTurns--;
        addBattleLog(`${boss.name} est étourdi et ne peut pas agir !`, 'warning');
        boss.atb = 0;
        chooseBossNextSkill();
        checkBattleEnd();
        updateBattleInterface();
        return;
    }

    // Exécuter l'intention télégraphée (sinon attaque de base).
    const skillToUse = boss.nextSkill;
    if (skillToUse && skillToUse.type) {
        executeBossSkill(boss, skillToUse, aliveUnits);
        const ref = (boss.skills || []).find(s => s.id === skillToUse.id);
        if (ref) ref.currentCooldown = ref.cooldown || 0;
    } else {
        const target = pickBossTarget(aliveUnits);
        const damage = Math.round(boss.atk * 0.8);
        applyBossDamageToUnit(target, damage, false);
        addBattleLog(`${boss.name} attaque ${target.name} et inflige ${damage} dégâts !`);
    }

    // Réinitialiser l'ATB du Boss
    boss.atb = 0;

    // Décrémenter les cooldowns du Boss
    if (boss.skills) boss.skills.forEach(s => { if (s.currentCooldown > 0) s.currentCooldown--; });

    // Décrémenter la provocation
    if (currentBattleState.taunt) {
        currentBattleState.taunt.turns--;
        if (currentBattleState.taunt.turns <= 0) currentBattleState.taunt = null;
    }

    // Choisir et télégraphier la prochaine intention.
    chooseBossNextSkill();

    // Vérifier la fin du combat
    checkBattleEnd();
    updateBattleInterface();
}

// Cible du boss : respecte la provocation (taunt) si active et l'unité est vivante.
function pickBossTarget(aliveUnits) {
    const taunt = currentBattleState.taunt;
    if (taunt) {
        const tu = currentBattleState.playerTeam[taunt.index];
        if (tu && tu.currentHp > 0) return tu;
    }
    return aliveUnits[Math.floor(Math.random() * aliveUnits.length)];
}

// Applique des dégâts à une unité joueur, en absorbant via son bouclier.
function applyBossDamageToUnit(unit, amount, isAOE) {
    let dmg = amount;
    if (unit.shield > 0) {
        const absorbed = Math.min(unit.shield, dmg);
        unit.shield -= absorbed;
        dmg -= absorbed;
    }
    unit.currentHp = Math.max(0, unit.currentHp - dmg);
    const index = currentBattleState.playerTeam.findIndex(u => u === unit);
    if (index >= 0) {
        showDamageNumber(amount, `player-unit-${index}`, isAOE);
        animateUnitDamage(index);
    }
}

// Fonction pour exécuter un skill du Boss (tous types fonctionnels — CHANTIER 5)
function executeBossSkill(boss, skill, aliveUnits) {
    switch (skill.type) {
        case 'damage_single': {
            const target = pickBossTarget(aliveUnits);
            const singleDamage = Math.round(boss.atk * (skill.damage || 0.5));
            applyBossDamageToUnit(target, singleDamage, false);
            addBattleLog(`${boss.name} utilise ${skill.name} sur ${target.name} : ${singleDamage} dégâts !`);
            break;
        }

        case 'damage_aoe': {
            const aoeDamage = Math.round(boss.atk * (skill.damage || 0.3));
            aliveUnits.forEach(unit => applyBossDamageToUnit(unit, aoeDamage, true));
            addBattleLog(`${boss.name} utilise ${skill.name} ! Toute l'équipe subit ${aoeDamage} dégâts !`, 'warning');
            break;
        }

        case 'def_up': {
            boss.atk = Math.round(boss.atk * 1.2);
            boss.spAtk = Math.round((boss.spAtk || boss.atk) * 1.2);
            addBattleLog(`${boss.name} utilise ${skill.name} ! Sa puissance augmente !`);
            flashBossVisual();
            break;
        }

        case 'shield': {
            const shield = Math.round(boss.maxHp * 0.06);
            boss.shield = (boss.shield || 0) + shield;
            addBattleLog(`${boss.name} active ${skill.name} ! Bouclier de ${shield} PV.`);
            flashBossVisual();
            break;
        }

        default: {
            const target = pickBossTarget(aliveUnits);
            const damage = Math.round(boss.atk * 0.6);
            applyBossDamageToUnit(target, damage, false);
            addBattleLog(`${boss.name} attaque ${target.name} : ${damage} dégâts !`);
        }
    }
}

// Petit flash visuel sur le boss (buff/bouclier).
function flashBossVisual() {
    const bossVisual = document.querySelector('.bb-boss-visual');
    if (!bossVisual) return;
    bossVisual.classList.remove('bb-boss-flash');
    void bossVisual.offsetWidth; // reflow pour relancer l'animation
    bossVisual.classList.add('bb-boss-flash');
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

// Fonction pour vérifier la transition de phase (la phase MONTE quand les PV baissent).
function checkBossPhaseTransition() {
    const boss = currentBattleState.boss;
    const hpPerPhase = boss.hpPerPhase || boss.maxHp;
    // Phases franchies = total - (nb de tranches de PV restantes) + 1.
    const remainingChunks = Math.max(1, Math.ceil(boss.currentHp / hpPerPhase));
    const newPhase = Math.min(boss.totalPhases, boss.totalPhases - remainingChunks + 1);

    if (newPhase > boss.currentPhase) {
        boss.currentPhase = newPhase;
        addBattleLog(`⚠️ ${boss.name} entre en Phase ${boss.currentPhase}/${boss.totalPhases} !`, 'warning');

        // Buff de phase : +15% attaque, devient plus agressif.
        boss.atk = Math.round(boss.atk * 1.15);
        boss.spAtk = Math.round((boss.spAtk || boss.atk) * 1.15);
        if (boss.currentPhase >= boss.totalPhases) boss.attackPattern = 'aggressive';

        // Marquage visuel fort de la transition.
        const stage = document.querySelector('.bb-stage');
        if (stage) {
            stage.classList.remove('bb-phase-flash');
            void stage.offsetWidth;
            stage.classList.add('bb-phase-flash');
        }
        flashBossVisual();
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

    // Sortir du mode plein écran.
    document.getElementById('boss-battle-container')?.classList.remove('bb-fullscreen');

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

// Met à jour une barre HP (largeur + classe couleur).
function refreshHpBar(el, pct) {
    if (!el) return;
    el.style.width = `${Math.max(0, pct)}%`;
    el.classList.remove('hp-green', 'hp-orange', 'hp-red');
    el.classList.add(hpColorClass(pct));
}

// Fonction pour mettre à jour l'interface de combat (rafraîchissement léger)
function updateBattleInterface() {
    if (!currentBattleState) return;

    const boss = currentBattleState.boss;
    refreshHpBar(document.getElementById('boss-hp-fill'), (boss.currentHp / boss.maxHp) * 100);

    const phaseEl = document.getElementById('bb-boss-phase');
    if (phaseEl) phaseEl.textContent = `Phase ${boss.currentPhase}/${boss.totalPhases}`;

    // Télégraphe de la prochaine attaque du boss.
    const zone = document.getElementById('bb-boss-zone');
    if (zone) {
        let tEl = zone.querySelector('.bb-telegraph');
        if (boss.nextSkill && boss.nextSkill.telegraph) {
            const txt = `⚠ ${boss.name.replace(/\/\/\//g, '').trim()} prépare : `;
            if (!tEl) {
                tEl = document.createElement('div');
                tEl.className = 'bb-telegraph';
                zone.appendChild(tEl);
            }
            tEl.innerHTML = `${txt}<strong>${boss.nextSkill.name}</strong>`;
        } else if (tEl) {
            tEl.remove();
        }
    }

    currentBattleState.playerTeam.forEach((unit, index) => {
        refreshHpBar(document.getElementById(`player-hp-${index}`), (unit.currentHp / unit.maxHp) * 100);
        const unitEl = document.getElementById(`player-unit-${index}`);
        if (unitEl) unitEl.classList.toggle('bb-unit--ko', unit.currentHp <= 0);
    });

    updateBattleTimeline();
}

