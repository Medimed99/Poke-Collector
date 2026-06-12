/* ==========================================
   EXPEDITION BATTLE SYSTEM
   Combat visuel pour l'Expédition Arcanes
   ========================================== */

// Déterminer si un Pokémon est "spécial" offensivement selon son ID
const SPECIAL_POKEMON_IDS = new Set([
    12, 36, 38, 54, 63, 64, 65, 79, 80, 92, 93, 94, 102, 103, 113, 121, 122, 124, 131,
    137, 150, 151, 154, 157, 160, 176, 178, 182, 184, 196, 197, 199, 202, 203, 210, 229,
    233, 242, 249, 250, 251, 282, 302, 315, 330, 340, 354, 358, 380, 381
]);

// Variante de stats par pokémonId pour briser l'uniformité par rareté
function getPokemonStatVariance(pokemonId) {
    const seed = ((pokemonId * 2654435761) >>> 0) % 1000;
    return 0.8 + (seed / 1000) * 0.4; // variance entre 0.8 et 1.2
}

// Créer un Pokémon de run avec stats individualisées
window.createRunPokemon = function(pokemonId, level, rarity) {
    const rarity_ = rarity || 'common';
    const baseStats = (typeof BASE_STATS_BY_RARITY !== 'undefined' ? BASE_STATS_BY_RARITY : {})[rarity_] || { hp: 800, atk: 120, def: 100, spd: 80 };
    const levelMult = 0.5 + (level / 20);
    const variance = getPokemonStatVariance(pokemonId);
    const isSpecial = SPECIAL_POKEMON_IDS.has(pokemonId);

    return {
        id: pokemonId,
        name: (typeof FRENCH_NAMES !== 'undefined' ? FRENCH_NAMES[pokemonId] : null) || `Pokémon #${pokemonId}`,
        rarity: rarity_,
        hp: Math.floor(baseStats.hp * levelMult * variance),
        maxHp: Math.floor(baseStats.hp * levelMult * variance),
        atk: Math.floor(baseStats.atk * levelMult * (isSpecial ? 0.7 : 1.0) * variance),
        def: Math.floor(baseStats.def * levelMult * variance),
        spatk: Math.floor(baseStats.atk * levelMult * (isSpecial ? 1.2 : 0.8) * variance),
        spdef: Math.floor(baseStats.def * levelMult * (isSpecial ? 1.1 : 0.9) * variance),
        spd: Math.floor(baseStats.spd * levelMult * variance),
        types: getRunPokemonTypes(pokemonId)
    };
};

// Récupérer les types approximatifs d'un Pokémon via les TYPE_ITEMS du jeu
function getRunPokemonTypes(pokemonId) {
    if (typeof TYPE_BONUS_POKEMON !== 'undefined') {
        for (const [type, ids] of Object.entries(TYPE_BONUS_POKEMON)) {
            if (ids.includes(pokemonId)) return [type];
        }
    }
    return ['normal'];
}

// Formule de dégâts avec STAB, spatk/spdef, double-type (§1.2)
window.getEffectiveDamage = function(attacker, defender, moveType) {
    const typeEff = (typeof calculateTypeEffectiveness === 'function')
        ? calculateTypeEffectiveness(moveType, defender.types)
        : 1.0;

    // STAB : bonus 1.5× si le type de l'attaque correspond à un type du Pokémon
    const stab = attacker.types && attacker.types.includes(moveType) ? 1.5 : 1.0;

    // Choisir Atk physique ou Spéciale selon le Pokémon
    const useSpecial = (attacker.spatk || 0) > (attacker.atk || 0);
    const atkStat = useSpecial ? (attacker.spatk || attacker.atk || 100) : (attacker.atk || 100);
    const defStat = useSpecial ? (defender.spdef || defender.def || 100) : (defender.def || 100);

    const crit = Math.random() < 0.12;
    const critMult = crit ? 1.5 : 1.0;
    const randomFactor = 0.85 + Math.random() * 0.15;

    const dmg = Math.max(1, Math.floor(atkStat * typeEff * stab * critMult * randomFactor * (100 / (100 + defStat))));
    return { dmg, typeEff, stab, crit, useSpecial };
};

// Simuler un combat auto et retourner des données structurées (§1.1)
window.simulateAutoBattle = function(playerTeam, enemyTeam) {
    const logs = [];
    let playerIdx = 0;
    let enemyIdx = 0;
    let turn = 0;
    const maxTurns = 100;

    // Cloner pour ne pas modifier les originaux
    const pTeam = playerTeam.map(p => ({ ...p, hp: p.maxHp || p.hp }));
    const eTeam = enemyTeam.map(p => ({ ...p, hp: p.maxHp || p.hp }));

    while (playerIdx < pTeam.length && enemyIdx < eTeam.length && turn < maxTurns) {
        turn++;
        const attacker = pTeam[playerIdx];
        const defender = eTeam[enemyIdx];
        const atkEnemy = eTeam[enemyIdx];
        const defPlayer = pTeam[playerIdx];

        // Tour du joueur
        const moveType = attacker.types ? attacker.types[0] : 'normal';
        const playerHit = window.getEffectiveDamage(attacker, defender, moveType);
        defender.hp = Math.max(0, defender.hp - playerHit.dmg);
        logs.push({
            attacker: attacker.id, defender: defender.id,
            dmg: playerHit.dmg, effectiveness: playerHit.typeEff,
            hpAfter: defender.hp, ko: defender.hp <= 0, side: 'player',
            stab: playerHit.stab, crit: playerHit.crit
        });

        if (defender.hp <= 0) {
            enemyIdx++;
            if (enemyIdx < eTeam.length) {
                logs.push({ switch: true, side: 'enemy', incoming: eTeam[enemyIdx].id });
            }
            continue;
        }

        // Tour de l'ennemi
        const enemyMoveType = atkEnemy.types ? atkEnemy.types[0] : 'normal';
        const enemyHit = window.getEffectiveDamage(atkEnemy, defPlayer, enemyMoveType);
        defPlayer.hp = Math.max(0, defPlayer.hp - enemyHit.dmg);
        logs.push({
            attacker: atkEnemy.id, defender: defPlayer.id,
            dmg: enemyHit.dmg, effectiveness: enemyHit.typeEff,
            hpAfter: defPlayer.hp, ko: defPlayer.hp <= 0, side: 'enemy',
            stab: enemyHit.stab, crit: enemyHit.crit
        });

        if (defPlayer.hp <= 0) {
            playerIdx++;
            if (playerIdx < pTeam.length) {
                logs.push({ switch: true, side: 'player', incoming: pTeam[playerIdx].id });
            }
        }
    }

    // Tie-break au % de HP restants (§4.3)
    const won = playerIdx < pTeam.length;
    const playerHpLeft = pTeam.slice(playerIdx).reduce((sum, p) => sum + p.hp, 0);
    const enemyHpLeft = eTeam.slice(enemyIdx).reduce((sum, p) => sum + p.hp, 0);
    const tiebreak = turn >= maxTurns ? playerHpLeft > enemyHpLeft : null;

    return { won: turn >= maxTurns ? tiebreak : won, logs, turns: turn, playerTeam: pTeam, enemyTeam: eTeam };
};

// Interface de combat visuel (§1.1)
window.showBattlePanel = function(playerPokemon, enemyPokemon, onBattleEnd) {
    const existingPanel = document.getElementById('battle-panel-container');
    if (existingPanel) existingPanel.remove();

    const container = document.createElement('div');
    container.id = 'battle-panel-container';
    container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #1a1a2e; z-index: 10002; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px;';

    const playerSprite = typeof getAnimatedSpriteUrl === 'function' ? getAnimatedSpriteUrl(playerPokemon.id, false) : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${playerPokemon.id}.png`;
    const enemySprite = typeof getAnimatedSpriteUrl === 'function' ? getAnimatedSpriteUrl(enemyPokemon.id, false) : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${enemyPokemon.id}.png`;

    container.innerHTML = `
        <div style="width: 100%; max-width: 600px; background: rgba(0,0,0,0.6); border-radius: 16px; padding: 20px; border: 1px solid rgba(102,126,234,0.3);">
            <!-- HP ennemi -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="color: white; font-weight: bold;">${enemyPokemon.name}</span>
                <span id="enemy-hp-text" style="color: #ef4444;">HP: ${enemyPokemon.hp || enemyPokemon.maxHp}</span>
            </div>
            <div style="width: 100%; height: 8px; background: #333; border-radius: 4px; margin-bottom: 20px; overflow: hidden;">
                <div id="enemy-hp-bar" style="height: 100%; width: 100%; background: #ef4444; transition: width 0.5s ease; border-radius: 4px;"></div>
            </div>

            <!-- Sprites -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; min-height: 120px;">
                <div style="text-align: center;">
                    <img id="player-sprite" src="${playerSprite}" style="width: 96px; height: 96px; image-rendering: pixelated; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));" alt="${playerPokemon.name}">
                    <div style="color: rgba(255,255,255,0.7); font-size: 0.8em; margin-top: 4px;">Vous</div>
                </div>
                <div style="color: rgba(255,255,255,0.3); font-size: 1.5em;">VS</div>
                <div style="text-align: center;">
                    <img id="enemy-sprite" src="${enemySprite}" style="width: 96px; height: 96px; image-rendering: pixelated; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));" alt="${enemyPokemon.name}">
                    <div style="color: rgba(255,255,255,0.7); font-size: 0.8em; margin-top: 4px;">${enemyPokemon.name}</div>
                </div>
            </div>

            <!-- HP joueur -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="color: white; font-weight: bold;">${playerPokemon.name}</span>
                <span id="player-hp-text" style="color: #10b981;">HP: ${playerPokemon.hp || playerPokemon.maxHp}</span>
            </div>
            <div style="width: 100%; height: 8px; background: #333; border-radius: 4px; margin-bottom: 20px; overflow: hidden;">
                <div id="player-hp-bar" style="height: 100%; width: 100%; background: #10b981; transition: width 0.5s ease; border-radius: 4px;"></div>
            </div>

            <!-- Log de combat -->
            <div id="battle-log" style="background: rgba(0,0,0,0.4); border-radius: 8px; padding: 10px; height: 80px; overflow-y: auto; font-size: 0.85em; color: rgba(255,255,255,0.8); margin-bottom: 15px;"></div>

            <!-- Boutons -->
            <div style="display: flex; gap: 10px;">
                <button id="battle-auto-btn" onclick="window.runBattleAuto()" class="btn btn--primary" style="flex: 1; padding: 12px;">⚔️ Combat Auto</button>
                <button id="battle-skip-btn" onclick="window.skipBattleAnim()" class="btn btn--outline" style="padding: 12px;">⏭ Passer</button>
            </div>
        </div>
    `;

    document.body.appendChild(container);

    // Stocker le contexte du combat
    container._battleContext = {
        playerPokemon: { ...playerPokemon, hp: playerPokemon.maxHp || playerPokemon.hp },
        enemyPokemon: { ...enemyPokemon, hp: enemyPokemon.maxHp || enemyPokemon.hp },
        onBattleEnd,
        logs: null,
        logIndex: 0
    };
};

// Lancer le combat auto et rejouer les logs
window.runBattleAuto = function() {
    const container = document.getElementById('battle-panel-container');
    if (!container || !container._battleContext) return;
    const ctx = container._battleContext;

    document.getElementById('battle-auto-btn').disabled = true;
    document.getElementById('battle-skip-btn').disabled = true;

    const result = window.simulateAutoBattle([ctx.playerPokemon], [ctx.enemyPokemon]);
    ctx.logs = result.logs;
    ctx.result = result;
    ctx.logIndex = 0;
    ctx.playerMaxHp = ctx.playerPokemon.hp;
    ctx.enemyMaxHp = ctx.enemyPokemon.hp;

    window._replayBattleStep();
};

window._replayBattleStep = function() {
    const container = document.getElementById('battle-panel-container');
    if (!container || !container._battleContext) return;
    const ctx = container._battleContext;

    if (ctx.logIndex >= ctx.logs.length) {
        // Combat terminé
        setTimeout(() => {
            const container = document.getElementById('battle-panel-container');
            if (container) container.remove();
            if (ctx.onBattleEnd) ctx.onBattleEnd(ctx.result.won);
        }, 1000);
        return;
    }

    const log = ctx.logs[ctx.logIndex++];
    const logEl = document.getElementById('battle-log');

    if (log.switch) {
        if (logEl) logEl.innerHTML += `<div style="color: #a78bfa;">🔄 Changement ${log.side === 'player' ? 'du joueur' : 'ennemi'}</div>`;
    } else {
        const effText = log.effectiveness > 1.5 ? ' <span style="color: #ef4444;">Super efficace !</span>' :
                        log.effectiveness < 0.75 ? ' <span style="color: #6b7280;">Peu efficace...</span>' : '';
        const critText = log.crit ? ' <span style="color: #fbbf24;">Coup critique !</span>' : '';
        const color = log.side === 'player' ? '#10b981' : '#ef4444';

        if (logEl) {
            logEl.innerHTML += `<div style="color: ${color};">-${log.dmg}${effText}${critText}</div>`;
            logEl.scrollTop = logEl.scrollHeight;
        }

        // Mettre à jour les barres HP
        if (log.side === 'player') {
            const pct = Math.max(0, (log.hpAfter / ctx.enemyMaxHp) * 100);
            const bar = document.getElementById('enemy-hp-bar');
            const txt = document.getElementById('enemy-hp-text');
            if (bar) bar.style.width = pct + '%';
            if (txt) txt.textContent = `HP: ${log.hpAfter}`;
            const sprite = document.getElementById('enemy-sprite');
            if (sprite && log.ko) sprite.style.opacity = '0.3';
        } else {
            const pct = Math.max(0, (log.hpAfter / ctx.playerMaxHp) * 100);
            const bar = document.getElementById('player-hp-bar');
            const txt = document.getElementById('player-hp-text');
            if (bar) bar.style.width = pct + '%';
            if (txt) txt.textContent = `HP: ${log.hpAfter}`;
            const sprite = document.getElementById('player-sprite');
            if (sprite && log.ko) sprite.style.opacity = '0.3';
        }
    }

    setTimeout(window._replayBattleStep, 90);
};

// Passer l'animation et afficher le résultat directement
window.skipBattleAnim = function() {
    const container = document.getElementById('battle-panel-container');
    if (!container || !container._battleContext) return;
    const ctx = container._battleContext;

    if (!ctx.logs) {
        const result = window.simulateAutoBattle([ctx.playerPokemon], [ctx.enemyPokemon]);
        ctx.result = result;
    }

    container.remove();
    if (ctx.onBattleEnd) ctx.onBattleEnd(ctx.result ? ctx.result.won : false);
};
