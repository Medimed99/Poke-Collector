/**
 * Expédition PokéLike — roguelike Pokémon autobattler
 * Carte type Slay the Spire, 8 badges, Ligue, combats automatiques.
 */
(function () {
    'use strict';

    const POKELIKE_CONFIG = {
        maxTeamSize: 6,
        dailyTickets: 5,
        mapRows: 20,
        gymRows: [2, 4, 6, 8, 10, 12, 14, 16],
        eliteRow: 18,
        championRow: 19,
        victoryCoins: 2500,
        victoryXp: 500,
        battleXpBase: 1,
        luckyEggMultiplier: 1.5
    };

    const REGION_GENERATION = {
        Kanto: { label: 'Génération I', starters: [1, 4, 7] },
        Johto: { label: 'Génération II', starters: [152, 155, 158] },
        Hoenn: { label: 'Génération III', starters: [252, 255, 258] }
    };

    const NODE_META = {
        wild:     { icon: '🌿', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png',      label: 'Sauvage',    color: '#4caf50' },
        trainer:  { icon: '👤', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png',      label: 'Dresseur',   color: '#2196f3' },
        capture:  { icon: '🔴', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png', label: 'Capture',    color: '#f44336' },
        item:     { icon: '📦', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png',label: 'Objet',      color: '#ff9800' },
        heal:     { icon: '🏥', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png',    label: 'Soin',       color: '#e91e63' },
        trade:    { icon: '🔄', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png',      label: 'Échange',    color: '#9c27b0' },
        event:    { icon: '❓', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png',     label: 'Événement',  color: '#607d8b' },
        gym:      { icon: '🏅', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png',      label: 'Arène',      color: '#ffd700' },
        elite:    { icon: '👑', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png',     label: 'Elite Four', color: '#b388ff' },
        champion: { icon: '🏆', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',       label: 'Champion',   color: '#ff6f00' },
        start:    { icon: '🚩', sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',       label: 'Départ',     color: '#8bc34a' }
    };

    const TYPE_ITEMS = {
        Normal: { id: 'silk_scarf', name: 'Mouchoir Soie' },
        Combat: { id: 'black_belt', name: 'Ceinture Noire' },
        Vol: { id: 'sharp_beak', name: 'Bec Pointu' },
        Poison: { id: 'poison_barb', name: 'Pic Venin' },
        Sol: { id: 'soft_sand', name: 'Sable Doux' },
        Roche: { id: 'hard_stone', name: 'Pierre Dure' },
        Insecte: { id: 'silver_powder', name: 'Poudre Argentée' },
        Spectre: { id: 'spell_tag', name: 'Rune Sort' },
        Acier: { id: 'metal_coat', name: 'Peau Métal' },
        Feu: { id: 'charcoal', name: 'Charbon' },
        Eau: { id: 'mystic_water', name: 'Eau Mystique' },
        Plante: { id: 'miracle_seed', name: 'Graine Miracle' },
        Électrik: { id: 'magnet', name: 'Aimant' },
        Psy: { id: 'twisted_spoon', name: 'Cuillère Tordue' },
        Glace: { id: 'never_melt_ice', name: 'Glace Éternelle' },
        Dragon: { id: 'dragon_fang', name: 'Croc Dragon' },
        Ténèbres: { id: 'black_glasses', name: 'Lunettes Noires' },
        Fée: { id: 'pixie_plate', name: 'Plaque Pixie' }
    };

    const UTILITY_ITEMS = {
        quick_claw: { name: 'Vive Griffe', desc: '50% d\'agir en premier', effect: 'firstStrike' },
        choice_scarf: { name: 'Mouchoir Choix', desc: '+50% vitesse', effect: 'speedBoost' },
        kings_rock: { name: 'Roche Royale', desc: '30% d\'apeurer', effect: 'flinch' },
        rare_candy: { name: 'Super Bonbon', desc: '+3 niveaux', effect: 'levelUp' },
        lucky_egg: { name: 'Œuf Chance', desc: 'Plus d\'XP en run', effect: 'luckyEgg' },
        moon_stone: { name: 'Pierre Lune', desc: 'Évolution spéciale', effect: 'moonStone' }
    };

    const GYM_LEADERS = {
        Kanto: [
            { name: 'Pierre', badge: 'Roche', team: [74, 95], levels: [12, 14] },
            { name: 'Ondine', badge: 'Cascade', team: [120, 121], levels: [18, 21] },
            { name: 'Major Bob', badge: 'Foudre', team: [100, 25, 26], levels: [21, 18, 24] },
            { name: 'Erika', badge: 'Rainbow', team: [44, 70, 45], levels: [24, 24, 29] },
            { name: 'Koga', badge: 'Âme', team: [109, 89, 94], levels: [37, 39, 43] },
            { name: 'Morgane', badge: 'Marsh', team: [64, 122, 65], levels: [43, 43, 46] },
            { name: 'Auguste', badge: 'Volcan', team: [58, 77, 78], levels: [42, 40, 47] },
            { name: 'Giovanni', badge: 'Terre', team: [111, 34, 31], levels: [45, 45, 50] }
        ],
        Johto: [
            { name: 'Pierrick', badge: 'Zéphyr', team: [74, 95], levels: [14, 16] },
            { name: 'Ondine', badge: 'Cascade', team: [120, 121], levels: [20, 23] },
            { name: 'Falko', badge: 'Plaines', team: [163, 164], levels: [22, 24] },
            { name: 'Mortimer', badge: 'Brume', team: [92, 93, 94], levels: [24, 26, 28] },
            { name: 'Jasmine', badge: 'Minéral', team: [81, 208], levels: [30, 35] },
            { name: 'Chuck', badge: 'Choc', team: [67, 68], levels: [33, 36] },
            { name: 'Fanny', badge: 'Glacier', team: [221, 222, 220], levels: [36, 38, 40] },
            { name: 'Clair', badge: 'Rising', team: [147, 148, 230], levels: [40, 42, 44] }
        ],
        Hoenn: [
            { name: 'Roxanne', badge: 'Stone', team: [74, 299], levels: [14, 15] },
            { name: 'Bastien', badge: 'Knuckle', team: [296, 297], levels: [17, 19] },
            { name: 'Walter', badge: 'Dynamo', team: [309, 310], levels: [20, 22] },
            { name: 'Flora', badge: 'Heat', team: [322, 324, 323], levels: [24, 26, 28] },
            { name: 'Norman', badge: 'Balance', team: [288, 289], levels: [28, 30] },
            { name: 'Alizée', badge: 'Feather', team: [277, 278], levels: [31, 33] },
            { name: 'Lévy & Tatia', badge: 'Mind', team: [375, 356, 354], levels: [34, 36, 38] },
            { name: 'Marc', badge: 'Rain', team: [342, 340, 319], levels: [38, 40, 43] }
        ]
    };

    const ELITE_FOUR = {
        Kanto: { name: 'Ligue Indigo', team: [65, 68, 76, 112, 130, 149], levels: [52, 54, 56, 58, 58, 60] },
        Johto: { name: 'Ligue Johto', team: [229, 230, 248, 212, 466, 248], levels: [54, 56, 58, 60, 60, 62] },
        Hoenn: { name: 'Ligue Hoenn', team: [354, 359, 362, 376, 373, 376], levels: [56, 58, 60, 62, 62, 64] }
    };

    const CHAMPIONS = {
        Kanto: { name: 'Blue', team: [18, 65, 112, 59, 131, 6], levels: [56, 58, 58, 60, 60, 62] },
        Johto: { name: 'Lance', team: [230, 149, 248, 142, 130, 149], levels: [58, 60, 60, 62, 62, 64] },
        Hoenn: { name: 'Steven', team: [306, 227, 330, 319, 354, 376], levels: [60, 62, 62, 64, 64, 66] }
    };

    const EVENT_POOL = [
        { id: 'merchant', text: 'Un voyageur propose un échange d\'objet.', action: 'itemOffer' },
        { id: 'nurse', text: 'Une infirmière soigne votre équipe gratuitement.', action: 'fullHeal' },
        { id: 'xp', text: 'Vous trouvez un Super Bonbon !', action: 'rareCandy' },
        { id: 'level', text: 'Entraînement intensif : +1 niveau à toute l\'équipe.', action: 'teamLevel' },
        { id: 'mystery', text: 'Un Pokémon mystérieux vous rejoint !', action: 'freePokemon' }
    ];

    function getRegion() {
        return typeof getCurrentUnlockedRegion === 'function' ? getCurrentUnlockedRegion() : 'Kanto';
    }

    function getGenConfig() {
        return REGION_GENERATION[getRegion()] || REGION_GENERATION.Kanto;
    }

    function pickFromPool(rarityWeights) {
        const region = getRegion();
        const rand = Math.random() * 100;
        let cumulative = 0;
        let rarity = 'common';
        for (const [r, rate] of Object.entries(rarityWeights || { common: 40, uncommon: 30, rare: 20, super_rare: 8, legendary: 2 })) {
            cumulative += rate;
            if (rand < cumulative) { rarity = r; break; }
        }
        let pool = filterPokemonByRegion(POKEMON_DATA[rarity] || [], region);
        if (!pool.length) {
            for (const r of ['common', 'uncommon', 'rare', 'super_rare', 'legendary']) {
                pool = filterPokemonByRegion(POKEMON_DATA[r] || [], region);
                if (pool.length) break;
            }
        }
        if (!pool.length) pool = [1];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function createRunPokemon(id, level, heldItem = null) {
        const rarity = typeof getRarity === 'function' ? getRarity(id) : 'common';
        const base = BASE_STATS_BY_RARITY[rarity] || BASE_STATS_BY_RARITY.common;
        const levelMult = 1 + (level - 1) * 0.08;
        const stats = {
            hp: Math.round(base.hp * levelMult * 0.35),
            atk: Math.round(base.atk * levelMult * 0.4),
            def: Math.round(base.def * levelMult * 0.35),
            spd: Math.round(base.spd * levelMult * 0.4)
        };
        return {
            uid: `p_${id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            id,
            name: FRENCH_NAMES[id] || `Pokémon #${id}`,
            level,
            types: POKEMON_TYPES[id] || ['Normal'],
            stats,
            maxHp: stats.hp,
            currentHp: stats.hp,
            heldItem,
            rarity
        };
    }

    function applyItemBonuses(pokemon) {
        const p = { ...pokemon, stats: { ...pokemon.stats } };
        if (!p.heldItem) return p;
        const item = [...Object.values(TYPE_ITEMS), ...Object.entries(UTILITY_ITEMS).map(([id, d]) => ({ id, ...d }))].find(i => i.id === p.heldItem);
        if (!item) return p;
        if (item.effect === 'speedBoost') p.stats.spd = Math.round(p.stats.spd * 1.5);
        return p;
    }

    function getEffectiveDamage(attacker, defender) {
        let atk = attacker.stats.atk;
        const defType = defender.types[0];
        const atkType = attacker.types[0];
        if (attacker.heldItem) {
            const typeItem = Object.entries(TYPE_ITEMS).find(([type, data]) => data.id === attacker.heldItem);
            if (typeItem && typeItem[0] === atkType) atk *= 1.5;
        }
        const typeEffect = typeof calculateTypeEffectiveness === 'function'
            ? calculateTypeEffectiveness(atkType, defender.types)
            : { multiplier: 1 };
        const def = defender.stats.def;
        let damage = Math.round(atk * typeEffect.multiplier * (100 / (100 + def)) * (0.85 + Math.random() * 0.15));
        if (Math.random() < 0.12) {
            damage = Math.round(damage * 1.5);
        }
        return Math.max(1, damage);
    }

    function nextAliveIndex(units, from) {
        for (let i = from; i < units.length; i++) {
            if (units[i].currentHp > 0) return i;
        }
        return -1;
    }

    function simulateAutoBattle(playerTeam, enemyTeam, onLog) {
        const team = playerTeam.map(p => applyItemBonuses({ ...p, stats: { ...p.stats } }));
        const enemies = enemyTeam.map(e => ({ ...e, stats: { ...e.stats } }));
        let playerIdx = nextAliveIndex(team, 0);
        let enemyIdx = nextAliveIndex(enemies, 0);
        let turn = 0;
        const maxTurns = 100;
        const steps = [];

        while (playerIdx >= 0 && enemyIdx >= 0 && turn < maxTurns) {
            turn++;
            const playerMon = team[playerIdx];
            const enemyMon = enemies[enemyIdx];

            let playerFirst = playerMon.stats.spd >= enemyMon.stats.spd;
            if (playerMon.heldItem === 'quick_claw' && Math.random() < 0.5) playerFirst = true;
            if (enemyMon.heldItem === 'quick_claw' && Math.random() < 0.5) playerFirst = false;

            const order = playerFirst
                ? [{ atk: playerMon, def: enemyMon, side: 'player' }, { atk: enemyMon, def: playerMon, side: 'enemy' }]
                : [{ atk: enemyMon, def: playerMon, side: 'enemy' }, { atk: playerMon, def: enemyMon, side: 'player' }];

            for (const action of order) {
                if (action.atk.currentHp <= 0 || action.def.currentHp <= 0) continue;
                const dmg = getEffectiveDamage(action.atk, action.def);
                action.def.currentHp = Math.max(0, action.def.currentHp - dmg);
                if (onLog) onLog(`${action.atk.name} inflige ${dmg} à ${action.def.name}`);
                const ko = action.def.currentHp <= 0;
                steps.push({
                    side: action.side,
                    attackerName: action.atk.name, attackerId: action.atk.id,
                    defenderName: action.def.name, defenderId: action.def.id,
                    dmg, ko,
                    playerId: team[playerIdx]?.id, playerName: team[playerIdx]?.name,
                    playerHp: team[playerIdx]?.currentHp ?? 0, playerMaxHp: team[playerIdx]?.maxHp ?? 1,
                    enemyId: enemies[enemyIdx]?.id, enemyName: enemies[enemyIdx]?.name,
                    enemyHp: enemies[enemyIdx]?.currentHp ?? 0, enemyMaxHp: enemies[enemyIdx]?.maxHp ?? 1
                });
                if (ko) {
                    if (onLog) onLog(`${action.def.name} est K.O. !`);
                    if (action.side === 'player') enemyIdx = nextAliveIndex(enemies, enemyIdx + 1);
                    else playerIdx = nextAliveIndex(team, playerIdx + 1);
                    break;
                }
                if (action.atk.heldItem === 'kings_rock' && Math.random() < 0.3) {
                    if (onLog) onLog(`${action.atk.name} apeure ${action.def.name} !`);
                    break;
                }
            }
        }

        const won = enemyIdx < 0;
        playerTeam.forEach(p => {
            const live = team.find(t => t.uid === p.uid);
            if (live) p.currentHp = live.currentHp;
        });
        return { won, turns: turn, steps };
    }

    function checkRunEvolution(pokemon) {
        if (typeof EVOLUTION_BY_LEVEL !== 'undefined' && EVOLUTION_BY_LEVEL[pokemon.id]) {
            const evoId = EVOLUTION_BY_LEVEL[pokemon.id];
            const levelReq = pokemon.id <= 151 ? 16 : pokemon.id <= 251 ? 18 : 20;
            if (pokemon.level >= levelReq) {
                return createRunPokemon(evoId, pokemon.level, pokemon.heldItem);
            }
        }
        if (pokemon.id === 133 && runState?.items?.moon_stone > 0) {
            return null;
        }
        return null;
    }

    function equipItemToTeam(itemId) {
        if (!runState?.team?.length) return;
        const utility = UTILITY_ITEMS[itemId];
        if (utility?.effect === 'luckyEgg') {
            runState.luckyEggActive = true;
            return;
        }
        const target = runState.team.find(p => !p.heldItem) || runState.team[0];
        target.heldItem = itemId;
    }

    function grantTeamXp(amount) {
        const mult = runState.luckyEggActive ? POKELIKE_CONFIG.luckyEggMultiplier : 1;
        const levels = Math.max(1, Math.round(amount * mult));
        runState.team.forEach(p => {
            p.level += levels;
            const evo = checkRunEvolution(p);
            if (evo) {
                evo.currentHp = p.currentHp;
                evo.maxHp = evo.stats.hp;
                Object.assign(p, evo);
                showToast(`${p.name} évolue !`, 'success');
            } else {
                const rarity = p.rarity || 'common';
                const base = BASE_STATS_BY_RARITY[rarity] || BASE_STATS_BY_RARITY.common;
                const levelMult = 1 + (p.level - 1) * 0.08;
                p.stats = {
                    hp: Math.round(base.hp * levelMult * 0.35),
                    atk: Math.round(base.atk * levelMult * 0.4),
                    def: Math.round(base.def * levelMult * 0.35),
                    spd: Math.round(base.spd * levelMult * 0.4)
                };
                p.maxHp = p.stats.hp;
                p.currentHp = Math.min(p.currentHp + Math.round(p.maxHp * 0.15), p.maxHp);
            }
        });
    }

    function generateMap() {
        const nodes = [];
        const connections = [];
        let nodeId = 0;
        const rowCounts = [];

        for (let row = 0; row < POKELIKE_CONFIG.mapRows; row++) {
            let count = row === 0 ? 1 : (row >= POKELIKE_CONFIG.mapRows - 2 ? 1 : (Math.random() < 0.55 ? 2 : 3));
            rowCounts.push(count);
            for (let col = 0; col < count; col++) {
                let type = 'wild';
                if (row === 0) type = 'start';
                else if (row === POKELIKE_CONFIG.championRow) type = 'champion';
                else if (row === POKELIKE_CONFIG.eliteRow) type = 'elite';
                else if (POKELIKE_CONFIG.gymRows.includes(row)) type = 'gym';
                else {
                    const roll = Math.random();
                    if (roll < 0.28) type = 'wild';
                    else if (roll < 0.48) type = 'trainer';
                    else if (roll < 0.60) type = 'capture';
                    else if (roll < 0.72) type = 'item';
                    else if (roll < 0.82) type = 'heal';
                    else if (roll < 0.90) type = 'event';
                    else type = 'trade';
                }
                nodes.push({ id: nodeId++, row, col, type, completed: row === 0, gymIndex: type === 'gym' ? POKELIKE_CONFIG.gymRows.indexOf(row) : -1 });
            }
        }

        for (let row = 0; row < POKELIKE_CONFIG.mapRows - 1; row++) {
            const current = nodes.filter(n => n.row === row);
            const next = nodes.filter(n => n.row === row + 1);
            current.forEach(from => {
                const targets = new Set();
                const ideal = Math.round((from.col / Math.max(1, current.length - 1)) * (next.length - 1));
                targets.add(next[Math.min(ideal, next.length - 1)]);
                if (ideal > 0) targets.add(next[ideal - 1]);
                if (ideal < next.length - 1) targets.add(next[ideal + 1]);
                targets.forEach(to => connections.push({ from: from.id, to: to.id }));
            });
        }

        return { nodes, connections };
    }

    function getAvailableNodes() {
        if (!runState?.map) return [];
        const completed = new Set(runState.map.nodes.filter(n => n.completed).map(n => n.id));
        const available = new Set();
        runState.map.connections.forEach(c => {
            if (completed.has(c.from) && !completed.has(c.to)) available.add(c.to);
        });
        return runState.map.nodes.filter(n => available.has(n.id));
    }

    function buildEnemyTeam(type, gymIndex) {
        const region = getRegion();
        if (type === 'gym') {
            const leader = GYM_LEADERS[region][gymIndex];
            return leader.team.map((id, i) => createRunPokemon(id, leader.levels[i]));
        }
        if (type === 'elite') {
            const elite = ELITE_FOUR[region];
            return elite.team.map((id, i) => createRunPokemon(id, elite.levels[i]));
        }
        if (type === 'champion') {
            const champ = CHAMPIONS[region];
            return champ.team.map((id, i) => createRunPokemon(id, champ.levels[i]));
        }
        if (type === 'trainer') {
            const count = 1 + Math.floor(Math.random() * 2);
            const avgLevel = 5 + runState.badges * 3 + Math.floor(runState.currentRow / 2);
            return Array.from({ length: count }, () => createRunPokemon(pickFromPool(), avgLevel + Math.floor(Math.random() * 3)));
        }
        const avgLevel = 4 + runState.badges * 2 + Math.floor(runState.currentRow / 2);
        return [createRunPokemon(pickFromPool(), avgLevel + Math.floor(Math.random() * 2))];
    }

    function hideNav() {
        ['.top-bar', '.bottom-nav', '.new-bottom-nav'].forEach(sel => {
            const el = document.querySelector(sel);
            if (el) el.style.display = 'none';
        });
    }

    function showNav() {
        ['.top-bar', '.bottom-nav', '.new-bottom-nav'].forEach(sel => {
            const el = document.querySelector(sel);
            if (el) el.style.display = 'flex';
        });
    }

    function renderTeamSidebar() {
        const slots = [];
        for (let i = 0; i < POKELIKE_CONFIG.maxTeamSize; i++) {
            const p = runState.team[i];
            if (p) {
                const hpPct = Math.round((p.currentHp / p.maxHp) * 100);
                slots.push(`
                    <div class="pl-team-slot" data-uid="${p.uid}">
                        <img src="${getAnimatedSpriteUrl(p.id, false)}" alt="${p.name}">
                        <div class="pl-team-info">
                            <div class="pl-team-name">${p.name}</div>
                            <div class="pl-team-lv">Niv.${p.level}</div>
                            <div class="pl-hp-bar"><div class="pl-hp-fill" style="width:${hpPct}%"></div></div>
                        </div>
                        <div class="pl-team-order">
                            ${i > 0 ? `<button onclick="PokeLike.moveTeamMember(${i},-1)" title="Monter">▲</button>` : ''}
                            ${i < runState.team.length - 1 ? `<button onclick="PokeLike.moveTeamMember(${i},1)" title="Descendre">▼</button>` : ''}
                        </div>
                    </div>`);
            } else {
                slots.push(`<div class="pl-team-slot pl-team-empty"><span>Vide</span></div>`);
            }
        }
        return slots.join('');
    }

    function renderItemsSidebar() {
        const entries = Object.entries(runState.items || {});
        if (!entries.length) return '<div class="pl-empty">Sac vide</div>';
        return entries.map(([id, qty]) => {
            const meta = UTILITY_ITEMS[id] || Object.values(TYPE_ITEMS).find(t => t.id === id);
            const name = meta?.name || id;
            return `<div class="pl-item-row"><span>${name}</span><span>×${qty}</span></div>`;
        }).join('');
    }

    function renderBadgesSidebar() {
        let html = '';
        for (let i = 0; i < 8; i++) {
            html += `<div class="pl-badge ${i < runState.badges ? 'pl-badge--earned' : ''}"></div>`;
        }
        return html;
    }

    function renderMapCanvas() {
        const nodes = runState.map.nodes;
        const available = new Set(getAvailableNodes().map(n => n.id));
        const maxRow = POKELIKE_CONFIG.mapRows - 1;

        // Y inversé : row 0 (départ) en bas, row maxRow (boss) en haut
        const getY = row => (1 - row / maxRow) * 88 + 4;

        let svgLines = '';
        runState.map.connections.forEach(c => {
            const from = nodes.find(n => n.id === c.from);
            const to = nodes.find(n => n.id === c.to);
            if (!from || !to) return;
            const x1 = getNodeX(from);
            const y1 = getY(from.row);
            const x2 = getNodeX(to);
            const y2 = getY(to.row);
            const active = from.completed && available.has(to.id);
            svgLines += `<line x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%" class="pl-path ${from.completed ? 'pl-path--done' : ''} ${active ? 'pl-path--active' : ''}"/>`;
        });

        let nodeHtml = '';
        nodes.forEach(n => {
            const meta = NODE_META[n.type] || NODE_META.wild;
            const x = getNodeX(n);
            const y = getY(n.row);
            const isAvailable = available.has(n.id);
            const isDone = n.completed;
            const isCurrent = runState.currentNodeId === n.id;
            nodeHtml += `
                <button class="pl-node pl-node--${n.type} ${isDone ? 'pl-node--done' : ''} ${isAvailable ? 'pl-node--available' : ''} ${isCurrent ? 'pl-node--current' : ''}"
                    style="left:${x}%;top:${y}%;"
                    ${isCurrent ? 'data-map-current="true"' : ''}
                    ${isAvailable ? `onclick="PokeLike.selectNode(${n.id})"` : 'disabled'}
                    title="${meta.label}">
                    <img class="pl-node-sprite" src="${meta.sprite}" alt="${meta.label}">
                </button>`;
        });

        // SVG dans le même conteneur référentiel que les nœuds (référentiel unique)
        return `<div class="pl-map-nodes">
                <svg class="pl-map-lines" viewBox="0 0 100 100" preserveAspectRatio="none">${svgLines}</svg>
                ${nodeHtml}
            </div>`;
    }

    function getNodeX(node) {
        const rowNodes = runState.map.nodes.filter(n => n.row === node.row);
        const idx = rowNodes.findIndex(n => n.id === node.id);
        const count = rowNodes.length;
        if (count === 1) return 50;
        return 10 + idx * (80 / (count - 1));
    }

    function renderRunUI(extraPanel = '') {
        const container = document.getElementById('expedition-container');
        if (!container || !runState?.active) return;
        hideNav();

        const region = getRegion();
        const gen = getGenConfig();
        container.innerHTML = `
            <div class="pl-run">
                <div class="pl-sidebar pl-sidebar--left">
                    <div class="pl-panel-header">TEAM</div>
                    <div class="pl-team-list">${renderTeamSidebar()}</div>
                </div>
                <div class="pl-center">
                    <div class="pl-run-header">
                        <span>${gen.label} · ${region}</span>
                        <span>🏅 ${runState.badges}/8</span>
                    </div>
                    <div class="pl-map-area">
                        <div class="pl-map-bg"></div>
                        <div class="pl-map-scroll">${renderMapCanvas()}</div>
                    </div>
                    ${extraPanel}
                </div>
                <div class="pl-sidebar pl-sidebar--right">
                    <div class="pl-panel">
                        <div class="pl-panel-header">ITEMS</div>
                        <div class="pl-items-list">${renderItemsSidebar()}</div>
                    </div>
                    <div class="pl-panel">
                        <div class="pl-panel-header">BADGES</div>
                        <div class="pl-badges-grid">${renderBadgesSidebar()}</div>
                    </div>
                </div>
            </div>`;
        // Auto-scroll vers la rangée courante (départ = bas de la carte)
        setTimeout(() => {
            const mapScroll = container.querySelector('.pl-map-scroll');
            if (mapScroll) {
                const currentBtn = mapScroll.querySelector('[data-map-current="true"]');
                if (currentBtn) {
                    mapScroll.scrollTop = currentBtn.offsetTop - mapScroll.clientHeight / 2;
                } else {
                    mapScroll.scrollTop = mapScroll.scrollHeight;
                }
            }
        }, 50);
    }

    function addItem(itemId, qty = 1) {
        runState.items[itemId] = (runState.items[itemId] || 0) + qty;
    }

    function giveRandomItem() {
        const roll = Math.random();
        if (roll < 0.6) {
            const types = Object.values(TYPE_ITEMS);
            const item = types[Math.floor(Math.random() * types.length)];
            addItem(item.id);
            equipItemToTeam(item.id);
            return item.name;
        }
        const keys = Object.keys(UTILITY_ITEMS);
        const key = keys[Math.floor(Math.random() * keys.length)];
        addItem(key);
        equipItemToTeam(key);
        return UTILITY_ITEMS[key].name;
    }

    function showBattlePanel(enemyTeam, nodeType, callback) {
        const firstEnemy = enemyTeam[0];
        const firstPlayer = runState.team[0];
        const nodeLabel = nodeType === 'gym' ? 'Combat d\'Arène !' : nodeType === 'elite' ? 'Élite 4 !' : nodeType === 'champion' ? 'Champion !' : 'Combat !';

        renderRunUI(`
            <div class="pl-event-panel pl-battle-panel">
                <div class="pl-battle-arena">
                    <div class="pl-battle-side pl-battle-side--enemy">
                        <div class="pl-datbox pl-datbox--enemy">
                            <div class="pl-datbox-row">
                                <span class="pl-datbox-name" id="pl-enemy-name">${firstEnemy.name}</span>
                                <span class="pl-datbox-level">Niv.${firstEnemy.level}</span>
                            </div>
                            <div class="pl-hp-bar-wrap"><div class="pl-hp-bar" id="pl-hp-bar-enemy"></div></div>
                        </div>
                        <img class="pl-battle-sprite pl-battle-sprite--enemy" id="pl-sprite-enemy" src="${getAnimatedSpriteUrl(firstEnemy.id, false)}">
                    </div>
                    <div class="pl-battle-side pl-battle-side--player">
                        <img class="pl-battle-sprite pl-battle-sprite--player" id="pl-sprite-player" src="${getAnimatedSpriteUrl(firstPlayer.id, false)}">
                        <div class="pl-datbox pl-datbox--player">
                            <div class="pl-datbox-row">
                                <span class="pl-datbox-name" id="pl-player-name">${firstPlayer.name}</span>
                                <span class="pl-datbox-level">Niv.${firstPlayer.level}</span>
                            </div>
                            <div class="pl-hp-bar-wrap"><div class="pl-hp-bar" id="pl-hp-bar-player"></div></div>
                            <div class="pl-datbox-hp-text" id="pl-hp-text-player">${firstPlayer.currentHp}/${firstPlayer.maxHp}</div>
                        </div>
                    </div>
                </div>
                <div class="pl-battle-msg" id="pl-battle-msg">${NODE_META[nodeType]?.icon || '⚔️'} ${nodeLabel}</div>
                <div class="pl-battle-btns">
                    <button id="pl-battle-start" class="btn btn--primary">⚔️ Lancer le combat</button>
                    <button id="pl-battle-skip" class="btn btn--secondary" style="display:none">⏭ Passer</button>
                </div>
            </div>`);

        document.getElementById('pl-battle-start').onclick = () => {
            const startBtn = document.getElementById('pl-battle-start');
            const skipBtn = document.getElementById('pl-battle-skip');
            startBtn.style.display = 'none';
            skipBtn.style.display = 'inline-block';

            const teamCopy = runState.team.map(p => ({ ...p, stats: { ...p.stats } }));
            const enemiesCopy = enemyTeam.map(e => ({ ...e, stats: { ...e.stats } }));
            const result = simulateAutoBattle(teamCopy, enemiesCopy);
            runState.team = teamCopy;

            let stepIdx = 0;
            let skipped = false;

            const finish = () => {
                const msg = document.getElementById('pl-battle-msg');
                if (msg) {
                    msg.textContent = result.won ? '✅ Victoire !' : '❌ Défaite...';
                    msg.className = 'pl-battle-msg ' + (result.won ? 'pl-battle-msg--win' : 'pl-battle-msg--lose');
                }
                if (skipBtn) skipBtn.style.display = 'none';
                const btns = document.querySelector('.pl-battle-btns');
                if (btns) {
                    const btn = document.createElement('button');
                    btn.className = 'btn btn--primary';
                    btn.textContent = 'Continuer';
                    btn.onclick = () => callback(result.won);
                    btns.appendChild(btn);
                }
            };

            skipBtn.onclick = () => { skipped = true; finish(); };

            const setHpBar = (el, hp, maxHp) => {
                if (!el) return;
                const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
                el.style.width = pct + '%';
                el.className = 'pl-hp-bar' + (pct > 50 ? '' : pct > 20 ? ' pl-hp-bar--orange' : ' pl-hp-bar--red');
            };

            const playStep = () => {
                if (skipped) return;
                if (stepIdx >= result.steps.length) { finish(); return; }
                const step = result.steps[stepIdx++];

                const spriteEnemy = document.getElementById('pl-sprite-enemy');
                const spritePlayer = document.getElementById('pl-sprite-player');
                const hpBarEnemy = document.getElementById('pl-hp-bar-enemy');
                const hpBarPlayer = document.getElementById('pl-hp-bar-player');
                const hpText = document.getElementById('pl-hp-text-player');
                const msgEl = document.getElementById('pl-battle-msg');
                const enemyNameEl = document.getElementById('pl-enemy-name');
                const playerNameEl = document.getElementById('pl-player-name');

                if (!msgEl) return;

                // Mettre à jour sprite/nom si nouveau Pokémon au front
                if (spritePlayer && step.playerId && spritePlayer.dataset.uid !== String(step.playerId)) {
                    spritePlayer.src = getAnimatedSpriteUrl(step.playerId, false);
                    spritePlayer.style.opacity = '1';
                    spritePlayer.dataset.uid = step.playerId;
                    if (playerNameEl) playerNameEl.textContent = step.playerName;
                }
                if (spriteEnemy && step.enemyId && spriteEnemy.dataset.uid !== String(step.enemyId)) {
                    spriteEnemy.src = getAnimatedSpriteUrl(step.enemyId, false);
                    spriteEnemy.style.opacity = '1';
                    spriteEnemy.dataset.uid = step.enemyId;
                    if (enemyNameEl) enemyNameEl.textContent = step.enemyName;
                }

                // Animation lunge
                if (step.side === 'player' && spritePlayer) {
                    spritePlayer.classList.add('pl-sprite-lunge--right');
                    setTimeout(() => spritePlayer && spritePlayer.classList.remove('pl-sprite-lunge--right'), 350);
                } else if (spriteEnemy) {
                    spriteEnemy.classList.add('pl-sprite-lunge--left');
                    setTimeout(() => spriteEnemy && spriteEnemy.classList.remove('pl-sprite-lunge--left'), 350);
                }

                // Mise à jour HP bars
                setHpBar(hpBarPlayer, step.playerHp, step.playerMaxHp);
                setHpBar(hpBarEnemy, step.enemyHp, step.enemyMaxHp);
                if (hpText) hpText.textContent = `${Math.max(0, step.playerHp)}/${step.playerMaxHp}`;

                // Message
                msgEl.className = 'pl-battle-msg';
                msgEl.textContent = step.ko
                    ? `${step.defenderName} est K.O. !`
                    : `${step.attackerName} inflige ${step.dmg} pts à ${step.defenderName}`;

                // KO : fade-out du sprite perdant
                if (step.ko) {
                    const defeated = step.side === 'player' ? spriteEnemy : spritePlayer;
                    if (defeated) { defeated.style.transition = 'opacity 0.5s'; defeated.style.opacity = '0.1'; }
                }

                setTimeout(playStep, step.ko ? 1000 : 700);
            };

            playStep();
        };
    }

    function showCapturePanel(pokemonId, callback) {
        const wild = createRunPokemon(pokemonId, Math.max(3, 4 + runState.badges * 2));
        renderRunUI(`
            <div class="pl-event-panel">
                <h3>🔴 Opportunité de capture</h3>
                <img src="${getAnimatedSpriteUrl(wild.id, false)}" class="pl-event-sprite">
                <p><strong>${wild.name}</strong> Niv.${wild.level} veut rejoindre votre équipe !</p>
                <div class="pl-capture-actions">
                    ${runState.team.length < POKELIKE_CONFIG.maxTeamSize
                        ? `<button class="btn btn--primary" onclick="PokeLike.capturePokemon(${wild.id}, ${wild.level}, 'add')">Recruter</button>`
                        : ''}
                    <button class="btn btn--secondary" onclick="PokeLike.capturePokemon(${wild.id}, ${wild.level}, 'replace')">Remplacer un membre</button>
                    <button class="btn btn--outline" onclick="PokeLike.capturePokemon(0,0,'skip')">Ignorer</button>
                </div>
            </div>`);
        window._plCaptureCallback = callback;
    }

    function completeNode(node) {
        node.completed = true;
        runState.currentNodeId = node.id;
        runState.currentRow = node.row;
    }

    function checkTeamWipe() {
        const alive = runState.team.some(p => p.currentHp > 0);
        if (!alive) endPokelikeRun(false);
        return alive;
    }

    function resolveNode(nodeId) {
        const node = runState.map.nodes.find(n => n.id === nodeId);
        if (!node || !getAvailableNodes().some(n => n.id === nodeId)) return;

        if (node.type === 'start') return;

        if (['wild', 'trainer', 'gym', 'elite', 'champion'].includes(node.type)) {
            const enemies = buildEnemyTeam(node.type, node.gymIndex);
            showBattlePanel(enemies, node.type, won => {
                if (!won) {
                    runState.team.forEach(p => { p.currentHp = 0; });
                    endPokelikeRun(false);
                    return;
                }
                grantTeamXp(POKELIKE_CONFIG.battleXpBase + node.row * 0.2);
                if (node.type === 'gym') {
                    runState.badges++;
                    showToast(`Badge ${runState.badges}/8 obtenu !`, 'success');
                }
                if (node.type === 'champion') {
                    completeNode(node);
                    endPokelikeRun(true);
                    return;
                }
                if (node.type === 'wild') {
                    completeNode(node);
                    showCapturePanel(pickFromPool(), () => renderRunUI());
                    return;
                }
                completeNode(node);
                if (!checkTeamWipe()) return;
                renderRunUI();
            });
            return;
        }

        if (node.type === 'capture') {
            completeNode(node);
            showCapturePanel(pickFromPool({ uncommon: 30, rare: 35, super_rare: 25, legendary: 10 }), () => renderRunUI());
            return;
        }

        if (node.type === 'item') {
            const name = giveRandomItem();
            showToast(`Vous obtenez : ${name}`, 'success');
            completeNode(node);
            grantTeamXp(0.5);
            renderRunUI();
            return;
        }

        if (node.type === 'heal') {
            runState.team.forEach(p => { p.currentHp = p.maxHp; });
            showToast('Équipe soignée !', 'success');
            completeNode(node);
            renderRunUI();
            return;
        }

        if (node.type === 'trade') {
            if (runState.team.length >= 2) {
                const idx = Math.floor(Math.random() * runState.team.length);
                const old = runState.team[idx];
                const neu = createRunPokemon(pickFromPool({ rare: 30, super_rare: 40, legendary: 30 }), old.level);
                runState.team[idx] = neu;
                showToast(`${old.name} échangé contre ${neu.name} !`, 'success');
            }
            completeNode(node);
            renderRunUI();
            return;
        }

        if (node.type === 'event') {
            const ev = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
            if (ev.action === 'fullHeal') runState.team.forEach(p => { p.currentHp = p.maxHp; });
            if (ev.action === 'rareCandy') runState.team.forEach(p => { p.level += 3; });
            if (ev.action === 'teamLevel') grantTeamXp(1);
            if (ev.action === 'itemOffer') giveRandomItem();
            if (ev.action === 'freePokemon' && runState.team.length < POKELIKE_CONFIG.maxTeamSize) {
                runState.team.push(createRunPokemon(pickFromPool(), 8 + runState.badges * 2));
            }
            showToast(ev.text, 'success');
            completeNode(node);
            renderRunUI();
        }
    }

    function endPokelikeRun(victory) {
        const badges = runState?.badges || 0;
        const duration = Math.floor((Date.now() - (runState?.startTime || Date.now())) / 1000);
        if (victory) {
            gameState.rogue.fullClearsCount = (gameState.rogue.fullClearsCount || 0) + 1;
            gameState.coins += POKELIKE_CONFIG.victoryCoins;
            gameState.xp += POKELIKE_CONFIG.victoryXp;
            if (typeof checkLevelUp === 'function') checkLevelUp();
            if (typeof updateQuestProgress === 'function') {
                updateQuestProgress('rogue_completed', 1);
                updateQuestProgress('rogue_full_clear', 1);
            }
        }
        gameState.rogue.runsCompleted = (gameState.rogue.runsCompleted || 0) + 1;
        gameState.rogue.lastRunRewards = { victory, badges, duration, region: getRegion() };
        saveGame();
        showNav();
        runState = null;

        const modal = document.createElement('div');
        modal.className = 'modal active pl-summary-modal';
        modal.innerHTML = `
            <div class="pl-summary">
                <h2>${victory ? '🏆 CHAMPION !' : '💔 Run terminée'}</h2>
                <p>${victory ? 'Vous avez conquis la Ligue Pokémon !' : 'Votre équipe a été mise K.O.'}</p>
                <div class="pl-summary-stats">
                    <div>🏅 Badges : ${badges}/8</div>
                    <div>⏱️ ${Math.floor(duration / 60)}m ${duration % 60}s</div>
                    ${victory ? `<div>💰 +${POKELIKE_CONFIG.victoryCoins} coins</div><div>⭐ +${POKELIKE_CONFIG.victoryXp} XP</div>` : ''}
                </div>
                <button class="btn btn--primary" onclick="this.closest('.modal').remove(); renderExpeditionPage();">Retour</button>
            </div>`;
        document.body.appendChild(modal);
    }

    function startRunWithStarter(starterId) {
        if (gameState.rogue.ticketsAvailable <= 0) {
            showToast('Plus de tickets disponibles !', 'error');
            return;
        }
        gameState.rogue.ticketsAvailable--;
        gameState.rogue.runsStarted = (gameState.rogue.runsStarted || 0) + 1;

        const map = generateMap();
        runState = {
            active: true,
            mode: 'pokelike',
            startTime: Date.now(),
            region: getRegion(),
            team: [createRunPokemon(starterId, 5)],
            items: {},
            badges: 0,
            luckyEggActive: false,
            map,
            currentNodeId: 0,
            currentRow: 0
        };
        map.nodes[0].completed = true;
        saveGame();
        renderRunUI();
    }

    function showStarterModal() {
        const gen = getGenConfig();
        const region = getRegion();
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="pl-starter-modal">
                <h2>🌱 Choisissez votre starter</h2>
                <p>${gen.label} · Région ${region}</p>
                <div class="pl-starter-grid">
                    ${gen.starters.map(id => `
                        <button class="pl-starter-card" onclick="PokeLike.pickStarter(${id})">
                            <img src="${getAnimatedSpriteUrl(id, false)}" alt="${FRENCH_NAMES[id]}">
                            <span>${FRENCH_NAMES[id]}</span>
                        </button>`).join('')}
                </div>
                <button class="btn btn--outline" onclick="this.closest('.modal').remove()">Annuler</button>
            </div>`;
        document.body.appendChild(modal);
    }

    function checkTicketReset() {
        if (!gameState.rogue) gameState.rogue = {};
        if (gameState.rogue.ticketsAvailable == null) gameState.rogue.ticketsAvailable = POKELIKE_CONFIG.dailyTickets;
        const now = Date.now();
        const last = gameState.rogue.lastTicketResetTime || 0;
        if (now - last >= 86400000) {
            gameState.rogue.ticketsAvailable = POKELIKE_CONFIG.dailyTickets;
            gameState.rogue.lastTicketResetTime = now;
        }
    }

    function renderHub() {
        const container = document.getElementById('expedition-container');
        if (!container) return;
        checkTicketReset();

        if (!gameState.rogue.expeditionTutorialSeen) {
            setTimeout(() => showTutorial(), 400);
        }

        if (runState?.active) {
            renderRunUI();
            return;
        }

        showNav();
        const region = getRegion();
        const gen = getGenConfig();
        const tickets = gameState.rogue.ticketsAvailable ?? POKELIKE_CONFIG.dailyTickets;

        container.innerHTML = `
            <div class="pl-hub">
                <h1 class="pl-hub-title">⚔️ Expédition PokéLike</h1>
                <p class="pl-hub-sub">Roguelike Pokémon · Combats auto · 8 badges · Ligue</p>
                <div class="pl-hub-region">
                    <span>Région active : <strong>${region}</strong></span>
                    <span>${gen.label}</span>
                </div>
                <div class="pl-hub-stats">
                    <div class="pl-stat-card">
                        <div class="pl-stat-value">${tickets}</div>
                        <div class="pl-stat-label">🎫 Tickets</div>
                    </div>
                    <div class="pl-stat-card">
                        <div class="pl-stat-value">${gameState.rogue.fullClearsCount || 0}</div>
                        <div class="pl-stat-label">🏆 Victoires</div>
                    </div>
                    <div class="pl-stat-card">
                        <div class="pl-stat-value">${gameState.rogue.runsCompleted || 0}</div>
                        <div class="pl-stat-label">🗺️ Runs</div>
                    </div>
                </div>
                <div class="pl-hub-rules">
                    <h3>Comment jouer</h3>
                    <ul>
                        <li>Choisissez un starter de la dernière région débloquée</li>
                        <li>Avancez sur la carte et choisissez votre chemin</li>
                        <li>Les combats sont <strong>automatiques</strong> — stratégie via équipe, niveaux et objets</li>
                        <li>8 badges → Elite Four → Champion</li>
                    </ul>
                </div>
                <button class="btn btn--primary btn--large pl-start-btn" ${tickets <= 0 ? 'disabled' : ''} onclick="PokeLike.beginRun()">
                    ${tickets > 0 ? '🚀 Nouvelle run' : 'Plus de tickets'}
                </button>
                <button class="btn btn--outline" onclick="PokeLike.showTutorial()">📚 Tutoriel</button>
            </div>`;
    }

    function showTutorial() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="pl-starter-modal">
                <h2>📚 PokéLike — Tutoriel</h2>
                <div style="text-align:left;line-height:1.7;color:rgba(255,255,255,0.9);">
                    <p><strong>1.</strong> Pick starter selon votre région (Kanto / Johto / Hoenn).</p>
                    <p><strong>2.</strong> Carte verticale : cliquez les nœuds lumineux pour avancer.</p>
                    <p><strong>3.</strong> Priorisez les niveaux, la couverture de types et l'ordre de l'équipe.</p>
                    <p><strong>4.</strong> Objets : boosts de type (+50% dégâts), Vive Griffe, Super Bonbon…</p>
                    <p><strong>5.</strong> Battez 8 champions d'arène puis la Ligue pour gagner.</p>
                </div>
                <button class="btn btn--primary" onclick="this.closest('.modal').remove()">Compris !</button>
            </div>`;
        document.body.appendChild(modal);
        gameState.rogue.expeditionTutorialSeen = true;
        saveGame();
    }

    window.PokeLike = {
        beginRun: showStarterModal,
        pickStarter(id) {
            document.querySelector('.modal.active')?.remove();
            startRunWithStarter(id);
        },
        selectNode: resolveNode,
        moveTeamMember(index, dir) {
            const newIdx = index + dir;
            if (newIdx < 0 || newIdx >= runState.team.length) return;
            const t = runState.team;
            [t[index], t[newIdx]] = [t[newIdx], t[index]];
            renderRunUI();
        },
        capturePokemon(id, level, action) {
            if (action === 'skip') {
                window._plCaptureCallback?.();
                return;
            }
            const mon = createRunPokemon(id, level);
            if (action === 'add') {
                runState.team.push(mon);
                showToast(`${mon.name} rejoint l'équipe !`, 'success');
                window._plCaptureCallback?.();
                return;
            }
            if (action === 'replace' && runState.team.length) {
                const names = runState.team.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
                const choice = prompt(`Quel membre remplacer ?\n${names}`, '1');
                const idx = parseInt(choice, 10) - 1;
                if (idx >= 0 && idx < runState.team.length) {
                    const old = runState.team[idx].name;
                    runState.team[idx] = mon;
                    showToast(`${old} → ${mon.name}`, 'success');
                }
            }
            window._plCaptureCallback?.();
        },
        showTutorial
    };

    window.renderExpeditionPage = renderHub;
    window.showExpeditionTutorial = showTutorial;
    window.showExpeditionPrepModal = showStarterModal;
    window.startExpeditionRun = showStarterModal;
})();
