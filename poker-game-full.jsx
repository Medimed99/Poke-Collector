const { useState, useEffect, useMemo, useRef } = React;

// --- HELPERS & CONSTANTS ---
// NOTE: getSpriteUrl est déjà défini globalement dans config/api_endpoints.js
// Utiliser la fonction globale au lieu de redéfinir
// const getSpriteUrl = (dexId, isShiny) => { ... } // SUPPRIMÉ - Utilise window.getSpriteUrl

const getTrainerSprite = (name) => `https://play.pokemonshowdown.com/sprites/trainers/${name}.png`;

const getIcon = (type) => ({ 'Fire': '🔥', 'Water': '💧', 'Grass': '🍃', 'Electric': '⚡', 'Rock': '🪨', 'Psychic': '🔮', 'Ghost': '👻', 'Poison': '☠️', 'Flying': '🌪️', 'Ice': '❄️' }[type] || '⚪');

const getBadgeIcon = (type) => ({ Rock: '🪨', Water: '💧', Electric: '⚡', Grass: '🍃', Poison: '☠️', Psychic: '🔮', Fire: '🔥', Ground: '🏜️' }[type] || '🏅');
const getBadgeName = (type) => ({ Rock: 'Roche', Water: 'Eau', Electric: 'Électrik', Grass: 'Plante', Poison: 'Poison', Psychic: 'Psy', Fire: 'Feu', Ground: 'Sol' }[type] || type);

const TYPE_COLORS = {
    Fire: 'linear-gradient(150deg, #b91c1c, #7f1d1d)', Water: 'linear-gradient(150deg, #1e40af, #1e3a8a)', Grass: 'linear-gradient(150deg, #15803d, #14532d)',
    Electric: 'linear-gradient(150deg, #a16207, #713f12)', Psychic: 'linear-gradient(150deg, #86198f, #701a75)', Rock: 'linear-gradient(150deg, #854d0e, #451a03)',
    Ghost: 'linear-gradient(150deg, #4338ca, #312e81)', Poison: 'linear-gradient(150deg, #6b21a8, #581c87)', Flying: 'linear-gradient(150deg, #0369a1, #0c4a6e)',
    Ice: 'linear-gradient(150deg, #0e7490, #164e63)', Normal: 'linear-gradient(150deg, #d1d5db, #9ca3af)', Bug: 'linear-gradient(150deg, #166534, #14532d)', Dragon: 'linear-gradient(150deg, #1e3a8a, #1e1b4b)', Fighting: 'linear-gradient(150deg, #991b1b, #7f1d1d)', Ground: 'linear-gradient(150deg, #92400e, #78350f)', Steel: 'linear-gradient(150deg, #475569, #334155)',
};

const LEAGUE_NAMES = ["Ligue Rookie", "Ligue Bronze", "Ligue Argent", "Ligue Or", "Ligue Platine", "Ligue Ultra", "Ligue Maître", "Conseil 4"];

const POKEDEX_BASE = [
    { id: 'bulb', dexId: 1, name: 'Bulbizarre', types: ['Grass', 'Poison'], stage: 0, familyId: 'bulbasaur', chips: 10, rarity: 'uncommon' },
    { id: 'ivy', dexId: 2, name: 'Herbizarre', types: ['Grass', 'Poison'], stage: 1, familyId: 'bulbasaur', chips: 20, rarity: 'uncommon' },
    { id: 'venu', dexId: 3, name: 'Florizarre', types: ['Grass', 'Poison'], stage: 2, familyId: 'bulbasaur', chips: 30, rarity: 'rare' },
    { id: 'char', dexId: 4, name: 'Salamèche', types: ['Fire'], stage: 0, familyId: 'charmander', chips: 10, rarity: 'uncommon' },
    { id: 'meleon', dexId: 5, name: 'Reptincel', types: ['Fire'], stage: 1, familyId: 'charmander', chips: 20, rarity: 'uncommon' },
    { id: 'zard', dexId: 6, name: 'Dracaufeu', types: ['Fire', 'Flying'], stage: 2, familyId: 'charmander', chips: 30, rarity: 'rare' },
    { id: 'squirt', dexId: 7, name: 'Carapuce', types: ['Water'], stage: 0, familyId: 'squirtle', chips: 10, rarity: 'uncommon' },
    { id: 'wart', dexId: 8, name: 'Carabaffe', types: ['Water'], stage: 1, familyId: 'squirtle', chips: 20, rarity: 'uncommon' },
    { id: 'blast', dexId: 9, name: 'Tortank', types: ['Water'], stage: 2, familyId: 'squirtle', chips: 30, rarity: 'rare' },
    { id: 'caterpie', dexId: 10, name: 'Chenipan', types: ['Bug'], stage: 0, familyId: 'caterpie', chips: 8, rarity: 'common' },
    { id: 'metapod', dexId: 11, name: 'Chrysacier', types: ['Bug'], stage: 1, familyId: 'caterpie', chips: 12, rarity: 'common' },
    { id: 'butterfree', dexId: 12, name: 'Papilusion', types: ['Bug', 'Flying'], stage: 2, familyId: 'caterpie', chips: 18, rarity: 'uncommon' },
    { id: 'weedle', dexId: 13, name: 'Aspicot', types: ['Bug', 'Poison'], stage: 0, familyId: 'weedle', chips: 8, rarity: 'common' },
    { id: 'kakuna', dexId: 14, name: 'Coconfort', types: ['Bug', 'Poison'], stage: 1, familyId: 'weedle', chips: 12, rarity: 'common' },
    { id: 'beedrill', dexId: 15, name: 'Dardargnan', types: ['Bug', 'Poison'], stage: 2, familyId: 'weedle', chips: 18, rarity: 'uncommon' },
    { id: 'pidgey', dexId: 16, name: 'Roucool', types: ['Normal', 'Flying'], stage: 0, familyId: 'pidgey', chips: 5, rarity: 'common' },
    { id: 'pidgeotto', dexId: 17, name: 'Roucoups', types: ['Normal', 'Flying'], stage: 1, familyId: 'pidgey', chips: 15, rarity: 'uncommon' },
    { id: 'pidgeot', dexId: 18, name: 'Roucarnage', types: ['Normal', 'Flying'], stage: 2, familyId: 'pidgey', chips: 25, rarity: 'uncommon' },
    { id: 'rattata', dexId: 19, name: 'Rattata', types: ['Normal'], stage: 0, familyId: 'rattata', chips: 5, rarity: 'common' },
    { id: 'raticate', dexId: 20, name: 'Rattatac', types: ['Normal'], stage: 1, familyId: 'rattata', chips: 15, rarity: 'uncommon' },
    { id: 'pikachu', dexId: 25, name: 'Pikachu', types: ['Electric'], stage: 0, familyId: 'pikachu', chips: 10, rarity: 'uncommon' },
    { id: 'raichu', dexId: 26, name: 'Raichu', types: ['Electric'], stage: 1, familyId: 'pikachu', chips: 25, rarity: 'rare' },
    { id: 'zubat', dexId: 41, name: 'Nosferapti', types: ['Poison', 'Flying'], stage: 0, familyId: 'zubat', chips: 8, rarity: 'common' },
    { id: 'golbat', dexId: 42, name: 'Nosferalto', types: ['Poison', 'Flying'], stage: 1, familyId: 'zubat', chips: 18, rarity: 'uncommon' },
    { id: 'oddish', dexId: 43, name: 'Mystherbe', types: ['Grass', 'Poison'], stage: 0, familyId: 'oddish', chips: 8, rarity: 'common' },
    { id: 'gloom', dexId: 44, name: 'Ortide', types: ['Grass', 'Poison'], stage: 1, familyId: 'oddish', chips: 18, rarity: 'uncommon' },
    { id: 'vileplume', dexId: 45, name: 'Rafflesia', types: ['Grass', 'Poison'], stage: 2, familyId: 'oddish', chips: 28, rarity: 'uncommon' },
    { id: 'abra', dexId: 63, name: 'Abra', types: ['Psychic'], stage: 0, familyId: 'abra', chips: 8, rarity: 'common' },
    { id: 'kadabra', dexId: 64, name: 'Kadabra', types: ['Psychic'], stage: 1, familyId: 'abra', chips: 18, rarity: 'uncommon' },
    { id: 'alakazam', dexId: 65, name: 'Alakazam', types: ['Psychic'], stage: 2, familyId: 'abra', chips: 28, rarity: 'rare' },
    { id: 'machop', dexId: 66, name: 'Machoc', types: ['Fighting'], stage: 0, familyId: 'machop', chips: 8, rarity: 'common' },
    { id: 'machoke', dexId: 67, name: 'Machopeur', types: ['Fighting'], stage: 1, familyId: 'machop', chips: 18, rarity: 'uncommon' },
    { id: 'machamp', dexId: 68, name: 'Mackogneur', types: ['Fighting'], stage: 2, familyId: 'machop', chips: 28, rarity: 'rare' },
    { id: 'tentacool', dexId: 72, name: 'Tentacool', types: ['Water', 'Poison'], stage: 0, familyId: 'tentacool', chips: 8, rarity: 'common' },
    { id: 'tentacruel', dexId: 73, name: 'Tentacruel', types: ['Water', 'Poison'], stage: 1, familyId: 'tentacool', chips: 18, rarity: 'uncommon' },
    { id: 'geodude', dexId: 74, name: 'Racaillou', types: ['Rock', 'Ground'], stage: 0, familyId: 'geodude', chips: 8, rarity: 'common' },
    { id: 'graveler', dexId: 75, name: 'Gravalanch', types: ['Rock', 'Ground'], stage: 1, familyId: 'geodude', chips: 18, rarity: 'uncommon' },
    { id: 'golem', dexId: 76, name: 'Grolem', types: ['Rock', 'Ground'], stage: 2, familyId: 'geodude', chips: 28, rarity: 'rare' },
    { id: 'magnemite', dexId: 81, name: 'Magnéti', types: ['Electric', 'Steel'], stage: 0, familyId: 'magnemite', chips: 8, rarity: 'common' },
    { id: 'magneton', dexId: 82, name: 'Magnéton', types: ['Electric', 'Steel'], stage: 1, familyId: 'magnemite', chips: 18, rarity: 'uncommon' },
    { id: 'gastly', dexId: 92, name: 'Fantominus', types: ['Ghost', 'Poison'], stage: 0, familyId: 'gastly', chips: 8, rarity: 'common' },
    { id: 'haunter', dexId: 93, name: 'Spectrum', types: ['Ghost', 'Poison'], stage: 1, familyId: 'gastly', chips: 18, rarity: 'uncommon' },
    { id: 'gengar', dexId: 94, name: 'Ectoplasma', types: ['Ghost', 'Poison'], stage: 2, familyId: 'gastly', chips: 28, rarity: 'rare' },
    { id: 'eevee', dexId: 133, name: 'Évoli', types: ['Normal'], stage: 0, familyId: 'eevee', chips: 10, rarity: 'common' },
    { id: 'vaporeon', dexId: 134, name: 'Aquali', types: ['Water'], stage: 1, familyId: 'eevee', chips: 25, rarity: 'rare' },
    { id: 'jolteon', dexId: 135, name: 'Voltali', types: ['Electric'], stage: 1, familyId: 'eevee', chips: 25, rarity: 'rare' },
    { id: 'flareon', dexId: 136, name: 'Pyroli', types: ['Fire'], stage: 1, familyId: 'eevee', chips: 25, rarity: 'rare' },
    { id: 'dratini', dexId: 147, name: 'Dratini', types: ['Dragon'], stage: 0, familyId: 'dratini', chips: 15, rarity: 'uncommon' },
    { id: 'dragonair', dexId: 148, name: 'Dragonair', types: ['Dragon'], stage: 1, familyId: 'dratini', chips: 25, rarity: 'uncommon' },
    { id: 'dragonite', dexId: 149, name: 'Dracolosse', types: ['Dragon', 'Flying'], stage: 2, familyId: 'dratini', chips: 35, rarity: 'rare' },
    { id: 'articuno', dexId: 144, name: 'Artikodin', types: ['Ice', 'Flying'], stage: 3, familyId: 'birds', chips: 50, legendary: true, rarity: 'legendary' },
    { id: 'zapdos', dexId: 145, name: 'Électhor', types: ['Electric', 'Flying'], stage: 3, familyId: 'birds', chips: 50, legendary: true, rarity: 'legendary' },
    { id: 'moltres', dexId: 146, name: 'Sulfura', types: ['Fire', 'Flying'], stage: 3, familyId: 'birds', chips: 50, legendary: true, rarity: 'legendary' },
    { id: 'mewtwo', dexId: 150, name: 'Mewtwo', types: ['Psychic'], stage: 3, familyId: 'mewtwo', chips: 60, legendary: true, rarity: 'legendary' },
    { id: 'mew', dexId: 151, name: 'Mew', types: ['Psychic'], stage: 3, familyId: 'mew', chips: 60, legendary: true, rarity: 'legendary' },
    { id: 'staryu', dexId: 120, name: 'Stari', types: ['Water'], stage: 0, familyId: 'staryu', chips: 10, rarity: 'common' },
    { id: 'omanyte', dexId: 138, name: 'Amonita', types: ['Rock', 'Water'], stage: 0, familyId: 'omanyte', chips: 12, fossil: true, rarity: 'uncommon' },
    { id: 'omastar', dexId: 139, name: 'Amonistar', types: ['Rock', 'Water'], stage: 1, familyId: 'omanyte', chips: 25, fossil: true, rarity: 'rare' },
];

const makeExample = (ids, shinies = []) => ids.map((id, idx) => {
    const base = POKEDEX_BASE.find(p => p.id === id);
    return { uid: `ex-${idx}`, data: base, isShiny: shinies.includes(idx) };
});

const makeTypeExample = (type, count, shinies = []) => {
    const pokemonOfType = POKEDEX_BASE.filter(p => p.types.includes(type));
    return Array(count).fill(null).map((_, idx) => {
        const base = pokemonOfType[idx % pokemonOfType.length];
        return { uid: `ex-${idx}`, data: base, isShiny: shinies.includes(idx) };
    });
};

const HANDS_CONFIG = [
    { id: 'origin_duo', name: 'Duo Originel', chips: 600, mult: 60, secret: true, desc: "Mew + Mewtwo.", example: makeExample(['mew', 'mewtwo']) },
    { id: 'kanto_pantheon', name: 'Kanto Pantheon', chips: 500, mult: 50, secret: true, desc: "5 Légendaires différents.", example: makeExample(['mewtwo', 'articuno', 'zapdos', 'moltres', 'mew']) },
    { id: 'shiny_flush', name: 'Shiny Flush', chips: 500, mult: 50, secret: false, desc: "5 Cartes Shiny (n'importe lesquelles).", example: makeExample(['char', 'squirt', 'bulb', 'pikachu', 'pidgey'], [0,1,2,3,4]) },
    { id: 'shiny_four', name: 'Carré Shiny', chips: 300, mult: 30, secret: true, desc: "4 Cartes Shiny.", example: makeExample(['pikachu', 'pidgey', 'bulb', 'char'], [0,1,2,3]) },
    { id: 'shiny_three', name: 'Brelan Shiny', chips: 200, mult: 20, secret: true, desc: "3 Cartes Shiny.", example: makeExample(['pikachu', 'pidgey', 'bulb'], [0,1,2]) },
    { id: 'shiny_pair', name: 'Paire Shiny', chips: 100, mult: 10, secret: true, desc: "2 Cartes Shiny.", example: makeExample(['pikachu', 'pidgey'], [0,1]) },
    { id: 'full_rainbow', name: 'Full Rainbow', chips: 250, mult: 25, secret: true, desc: "5 Types différents + 1 Shiny.", example: makeExample(['char', 'squirt', 'bulb', 'pikachu', 'mewtwo'], [0]) },
    { id: 'legendary_trio', name: 'Trio Légendaire', chips: 150, mult: 15, desc: "3 Pokémon Légendaires.", example: makeExample(['articuno', 'zapdos', 'moltres']) },
    { id: 'four_kind', name: 'Carré', chips: 90, mult: 9, desc: "4 Pokémon Identiques (Même ID).", example: makeExample(['pikachu', 'pikachu', 'pikachu', 'pikachu']) },
    { id: 'full_starter', name: 'Full Starter', chips: 85, mult: 8, desc: "Ligne évolutive complète Starter.", example: makeExample(['char', 'meleon', 'zard']) },
    { id: 'evolution_parfaite', name: 'Évolution Parfaite', chips: 80, mult: 8, desc: "Ligne évolutive complète (Base + Stade 1 + Stade 2).", example: makeExample(['gastly', 'haunter', 'gengar']) },
    { id: 'pokeball_full', name: 'Pokéball Pleine', chips: 70, mult: 7, desc: "Brelan + Paire (Idem ou Famille).", example: makeExample(['pikachu', 'pikachu', 'pikachu', 'pidgey', 'pidgey']) },
    { id: 'mono_type', name: 'Mono-Type', chips: 60, mult: 6, desc: "5 Pokémon du même type.", example: makeExample(['squirt', 'squirt', 'staryu', 'wart', 'squirt']) },
    { id: 'three_kind', name: 'Brelan', chips: 45, mult: 4, desc: "3 Pokémon Identiques (Même ID).", example: makeExample(['squirt', 'squirt', 'squirt']) },
    { id: 'evolution_trio', name: 'Évolution Trio', chips: 40, mult: 4, desc: "3 Pokémon de la même famille.", example: makeExample(['squirt', 'squirt', 'wart']) },
    { id: 'duo_type', name: 'Duo-Type', chips: 30, mult: 3, desc: "3 Type A + 2 Type B.", example: makeExample(['char', 'char', 'char', 'bulb', 'bulb']) },
    { id: 'double_evo_duo', name: 'Double Duo Évolutif', chips: 50, mult: 6, desc: "2 paires de familles différentes.", example: makeExample(['char', 'meleon', 'squirt', 'wart']) },
    { id: 'evolution_duo', name: 'Duo Évolutif', chips: 25, mult: 3, desc: "2 Pokémon de la même famille (IDs différents).", example: makeExample(['char', 'meleon']) },
    { id: 'pair', name: 'Paire', chips: 15, mult: 2, desc: "2 Pokémon Identiques (Même ID).", example: makeExample(['pidgey', 'pidgey']) },
    { id: 'wild_encounter', name: 'Rencontre Sauvage', chips: 5, mult: 1, desc: "Pas de combo.", example: makeExample(['bulb']) }
];

const BOSS_EFFECTS = [
    { id: 'rock', name: 'Pierre', desc: '-50% Chips sur Normal/Feu/Vol', type: 'Rock', sprite: 'brock' },
    { id: 'water', name: 'Ondine', desc: 'Cartes Feu annulées', type: 'Water', sprite: 'misty' },
    { id: 'electric', name: 'Major Bob', desc: '-1 Défausse', type: 'Electric', sprite: 'ltsurge' },
    { id: 'grass', name: 'Erika', desc: 'Main cachée 1/2 tours', type: 'Grass', sprite: 'erika' },
    { id: 'poison', name: 'Koga', desc: 'Perd 2$ par main', type: 'Poison', sprite: 'koga' },
    { id: 'psychic', name: 'Morgane', desc: 'Fissure: Gagner en 1 main', type: 'Psychic', sprite: 'sabrina' },
    { id: 'fire', name: 'Auguste', desc: 'Brûlure: -10 Chips par carte', type: 'Fire', sprite: 'blaine' },
    { id: 'ground', name: 'Giovanni', desc: 'Score Cible x1.5', type: 'Ground', sprite: 'giovanni' }
];

const JOKERS_DB = [
    { id: 'charcoal', name: 'Charbon', desc: '+4 Mult / Carte Feu', rarity: 'Common', price: 4, type: 'suit_buff', suit: 'Fire' },
    { id: 'magnet', name: 'Aimant', desc: '+4 Mult / Carte Électrik', rarity: 'Common', price: 4, type: 'suit_buff', suit: 'Electric' },
    { id: 'mysticwater', name: 'Eau Mystique', desc: '+4 Mult / Carte Eau', rarity: 'Common', price: 4, type: 'suit_buff', suit: 'Water' },
    { id: 'nugget', name: 'Pépite', desc: '+15$ victoire 1 main', rarity: 'Uncommon', price: 6, type: 'econ' },
    { id: 'exp_share', name: 'Multi Exp', desc: '+20 Chips / Carte Évoluée', rarity: 'Uncommon', price: 6, type: 'evo_buff' },
    { id: 'master_ball', name: 'Master Ball', desc: 'X2 Mult si Légendaire', rarity: 'Rare', price: 10, type: 'legend_buff' },
];

const VOUCHERS_DB = [
    { id: 'breeder', name: 'Licence Éleveur', desc: '+30% chance Peu Commun', price: 10, tier: 1 },
    { id: 'prof_badge', name: 'Badge Prof', desc: '+1 Carte visible boosters', price: 10, tier: 1 },
    { id: 'shiny_charm', name: 'Amulette Shiny', desc: '+1% Chance Shiny', price: 10, tier: 1 },
    { id: 'evo_seal', name: 'Sceau Évolution', desc: '+25% Chance Evo 2', price: 15, tier: 2 },
    { id: 'elite_cert', name: 'Certificat Élite', desc: '+1 Slot Joker', price: 20, tier: 3 },
    { id: 'silph_scope', name: 'Scope Silph', desc: '+10 Chips 1er carte', price: 15, tier: 2 },
    { id: 'super_rod', name: 'Méga Canne', desc: '+20% Chance Rare', price: 15, tier: 2 },
    { id: 'gym_badge', name: 'Badge Champion', desc: '+2$ fin de blind', price: 20, tier: 3 }
];

const BOOSTERS_CONFIG = [
    { id: 'basic', name: 'Booster Pokédex', price: 4, count: 3, desc: 'Choisir 1 parmi 3 pokémon', color: 'bg-blue-600' },
    { id: 'evo', name: 'Booster Évolution', price: 6, count: 3, desc: 'Choisir 1 parmi 3 pokémon', color: 'bg-green-600' },
    { id: 'elemental', name: 'Booster Type', price: 6, count: 3, desc: 'Choisir 1 parmi 3 pokémon', color: 'bg-red-600' },
    { id: 'shiny', name: 'Booster Chroma', price: 8, count: 3, desc: 'Choisir 1 parmi 3 pokémon', color: 'bg-yellow-500' },
    { id: 'legend', name: 'Booster Héritage', price: 15, count: 1, desc: 'Choisir 1 parmi 3 pokémon', color: 'bg-purple-600' }
];

// --- GLOBAL LOGIC ---
// Deck fixe de 52 cartes selon la spécification
const FIXED_DECK_SPEC = [
    { id: 'bulb', count: 1 },      // Bulbizarre
    { id: 'ivy', count: 1 },       // Herbizarre
    { id: 'venu', count: 1 },      // Florizarre
    { id: 'char', count: 1 },     // Salamèche
    { id: 'meleon', count: 1 },    // Reptincel
    { id: 'zard', count: 1 },     // Dracaufeu
    { id: 'squirt', count: 1 },   // Carapuce
    { id: 'wart', count: 1 },     // Carabaffe
    { id: 'blast', count: 1 },    // Tortank
    { id: 'pikachu', count: 1 },  // Pikachu
    { id: 'raichu', count: 1 },   // Raichu
    { id: 'eevee', count: 1 },    // Évoli
    { id: 'vaporeon', count: 1 }, // Aquali
    { id: 'jolteon', count: 1 },  // Voltali
    { id: 'flareon', count: 1 },   // Pyroli
    { id: 'pidgey', count: 1 },   // Roucool
    { id: 'pidgeotto', count: 1 }, // Roucoups
    { id: 'pidgeot', count: 1 },   // Roucarnage
    { id: 'rattata', count: 2 },  // Rattata x2
    { id: 'raticate', count: 1 },  // Rattatac
    { id: 'caterpie', count: 1 }, // Chenipan
    { id: 'metapod', count: 1 },  // Chrysacier
    { id: 'butterfree', count: 1 }, // Papilusion
    { id: 'weedle', count: 1 },   // Aspicot
    { id: 'kakuna', count: 1 },   // Coconfort
    { id: 'beedrill', count: 1 }, // Dardargnan
    { id: 'zubat', count: 1 },    // Nosferapti
    { id: 'golbat', count: 1 },   // Nosferalto
    { id: 'oddish', count: 1 },   // Mystherbe
    { id: 'gloom', count: 1 },    // Ortide
    { id: 'vileplume', count: 1 }, // Rafflesia
    { id: 'abra', count: 1 },     // Abra
    { id: 'kadabra', count: 1 },  // Kadabra
    { id: 'alakazam', count: 1 }, // Alakazam
    { id: 'machop', count: 1 },   // Machoc
    { id: 'machoke', count: 1 },  // Machopeur
    { id: 'machamp', count: 1 },  // Mackogneur
    { id: 'geodude', count: 1 },  // Racaillou
    { id: 'graveler', count: 1 }, // Gravalanch
    { id: 'golem', count: 1 },    // Grolem
    { id: 'dratini', count: 1 },  // Dratini
    { id: 'dragonair', count: 1 }, // Dragonair
    { id: 'dragonite', count: 1 }, // Dracolosse
    { id: 'articuno', count: 1 }, // Artikodin
    { id: 'zapdos', count: 1 },   // Électhor
    { id: 'moltres', count: 1 },  // Sulfura
    { id: 'mewtwo', count: 1 },   // Mewtwo
    { id: 'mew', count: 1 },      // Mew
    { id: 'magnemite', count: 1 }, // Magnéti
    { id: 'magneton', count: 1 }, // Magnéton
    { id: 'tentacool', count: 1 }, // Tentacool
];

const shufflePokerDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const generateDeck = (size = 52, forceShiny = false) => {
    let d = [];
    const pokemonMap = {};
    POKEDEX_BASE.forEach(p => { pokemonMap[p.id] = p; });
    
    FIXED_DECK_SPEC.forEach(spec => {
        const tpl = pokemonMap[spec.id];
        if (tpl) {
            for (let i = 0; i < spec.count; i++) {
        d.push({
                    uid: Math.random().toString(36).substr(2, 9) + '_' + i,
            data: tpl,
            isShiny: forceShiny ? true : Math.random() < 0.05
        });
    }
        }
    });
    
    if (d.length !== 52) {
        console.warn(`Deck généré avec ${d.length} cartes au lieu de 52`);
    }
    
    return shufflePokerDeck(d);
};

const generateBoosterContent = (boosterType, forcedType = null, voucherEffects = {}) => {
    let cards = [];
    const count = boosterType.count;
    const pool = POKEDEX_BASE;
    let shinyBonus = voucherEffects.shiny_charm ? 0.01 : 0;
    let rareBonus = voucherEffects.super_rod ? 0.2 : 0;

    for(let i=0; i<count; i++) {
        let candidates = pool;
        let isShiny = Math.random() < (0.05 + shinyBonus);
        
        if (boosterType.id === 'evo') {
            if (i === 0) candidates = pool.filter(p => p.stage > 0); 
            else if (i === 1) candidates = pool.filter(p => p.rarity !== 'common'); 
        } 
        else if (boosterType.id === 'elemental' && forcedType) {
            candidates = pool.filter(p => p.types.includes(forcedType));
        }
        else if (boosterType.id === 'shiny') isShiny = true; 
        else if (boosterType.id === 'legend') {
            candidates = pool.filter(p => p.rarity === 'legendary');
            isShiny = Math.random() < 0.3;
        }
        else if (boosterType.id === 'basic') {
            const rand = Math.random();
            if (rand < 0.05 + rareBonus) candidates = pool.filter(p => p.rarity === 'rare');
            else if (rand < 0.40) candidates = pool.filter(p => p.rarity === 'uncommon');
            else candidates = pool.filter(p => p.rarity === 'common');
        }

        if (candidates.length === 0) candidates = pool; 
        const tpl = candidates[Math.floor(Math.random() * candidates.length)];
        cards.push({ uid: Math.random().toString(36).substr(2, 9), data: tpl, isShiny: isShiny });
    }
    return cards;
};

const evaluateHand = (cards) => {
    if(!cards.length) return { ...HANDS_CONFIG.find(h => h.id === 'wild_encounter'), baseChips:0, shinyBonus: false };
    
    const types = {};
    const idCounts = {}; 
    const fams = {}; 
    const famIds = {}; 
    let legendaryCount = 0;
    let shinyCount = 0;

    cards.forEach(c => {
        types[c.data.types[0]] = (types[c.data.types[0]] || 0) + 1;
        idCounts[c.data.id] = (idCounts[c.data.id] || 0) + 1;
        fams[c.data.familyId] = (fams[c.data.familyId] || 0) + 1;
        if(!famIds[c.data.familyId]) famIds[c.data.familyId] = new Set();
        famIds[c.data.familyId].add(c.data.id);
        if(c.data.legendary) legendaryCount++;
        if(c.isShiny) shinyCount++;
    });

    const maxType = Math.max(...Object.values(types));
    const distinctTypes = Object.keys(types).length;
    const maxIdCount = Math.max(...Object.values(idCounts));
    const maxFam = Math.max(...Object.values(fams));
    
    let distinctFamDuoCount = 0;
    Object.values(famIds).forEach(set => { if(set.size >= 2) distinctFamDuoCount++; });

    let maxDistinctFamMembers = 0;
    Object.values(famIds).forEach(set => { if(set.size > maxDistinctFamMembers) maxDistinctFamMembers = set.size; });

    const has3Stages = Object.values(famIds).some(set => set.size >= 3);
    const famCounts = Object.values(fams);
    
    const hasFamFull = famCounts.includes(3) && famCounts.includes(2);
    const hasIdFull = Object.values(idCounts).includes(3) && Object.values(idCounts).includes(2);
    const isPokeballFull = hasFamFull || hasIdFull;

    if(shinyCount >= 5) return HANDS_CONFIG.find(h => h.id === 'shiny_flush');
    if(idCounts['mew'] && idCounts['mewtwo']) return HANDS_CONFIG.find(h => h.id === 'origin_duo'); 
    if(legendaryCount >= 3) return HANDS_CONFIG.find(h => h.id === 'legendary_trio');
    if(distinctTypes >= 5 && shinyCount >=1) return HANDS_CONFIG.find(h => h.id === 'full_rainbow');
    if(maxIdCount >= 4) return HANDS_CONFIG.find(h => h.id === 'four_kind');
    if(has3Stages) return HANDS_CONFIG.find(h => h.id === 'evolution_parfaite');
    if(isPokeballFull) return HANDS_CONFIG.find(h => h.id === 'pokeball_full'); 
    if(maxType >= 5) return HANDS_CONFIG.find(h => h.id === 'mono_type');
    if(maxIdCount >= 3) return HANDS_CONFIG.find(h => h.id === 'three_kind');
    if(maxFam >= 3) return HANDS_CONFIG.find(h => h.id === 'evolution_trio');
    if(Object.values(types).includes(3) && Object.values(types).includes(2)) return HANDS_CONFIG.find(h => h.id === 'duo_type');
    if(distinctFamDuoCount >= 2) return HANDS_CONFIG.find(h => h.id === 'double_evo_duo');
    if(maxDistinctFamMembers >= 2) return HANDS_CONFIG.find(h => h.id === 'evolution_duo');
    if(maxIdCount >= 2) return HANDS_CONFIG.find(h => h.id === 'pair');
    
    const hasShiny = shinyCount > 0;
    const wildEncounter = HANDS_CONFIG.find(h => h.id === 'wild_encounter');
    return { ...wildEncounter, shinyBonus: hasShiny, shinyCount };
};

// Fonction pour parser et appliquer l'effet d'un joker depuis son tooltip/description
// Fonction pour parser et appliquer l'effet d'un joker depuis son tooltip/description
// CORRECTION : On force la définition sans 'if undefined' pour écraser celle de app.js qui est incompatible
window.applyJokerEffect = (joker, cards, handType, bossEffect, jokers, jokerIndex) => {
    // Sécurité de base
    if (!joker) return { chips: 0, mult: 0, triggered: false };
    
    // Récupérer la description peu importe où elle est stockée (JSON, DB, ou Props)
    const desc = joker.desc || joker.description || joker.tooltip || '';
    const name = joker.name || '';
    const id = joker.id || '';
    
    let chipsBonus = 0;
    let multBonus = 0;
    let triggered = false;
    
    // --- 1. GESTION DES JOKERS SPÉCIAUX (Logique par ID) ---
    // Cette section gère les jokers qui ont des effets complexes non parsables par texte
    
    // Oeil de Mew / Doppelganger (Copie)
    if (id === 'oeil_de_mew' || id === 'mew_eye' || id === 'doppelganger_mewtwo') {
        const targetIndex = id === 'doppelganger_mewtwo' ? jokerIndex - 1 : jokerIndex + 1;
        const targetJoker = jokers[targetIndex];
        
        if (targetJoker && targetJoker.id !== id) { // Éviter boucle infinie
            const copyEffect = window.applyJokerEffect(targetJoker, cards, handType, bossEffect, jokers, targetIndex);
            return { chips: copyEffect.chips, mult: copyEffect.mult, triggered: copyEffect.triggered };
        }
        return { chips: 0, mult: 0, triggered: false };
    }
    
    // Jokers Légendaires spécifiques
    if (id === 'astral_lugia') {
        if (cards.some(c => c.data.types.includes('Flying') || c.data.types.includes('Vol') || c.data.types.includes('Psychic') || c.data.types.includes('Psy'))) {
            multBonus += 20; triggered = true;
        }
    }
    
    if (id === 'reborn_hooh') {
        const shinyCount = cards.filter(c => c.isShiny).length;
        if (shinyCount > 0) { multBonus += (shinyCount * 5); triggered = true; }
    }
    
    if (id === 'joker_shiny_surge') {
        const shinyCount = cards.filter(c => c.isShiny).length;
        if (shinyCount > 0) { multBonus += (shinyCount * 10); triggered = true; }
    }
    
    // Jokers de Type (Badges/Sigils)
    const typeMap = {
        'ember_sigil': ['Fire', 'Feu'], 'badge_feu': ['Fire', 'Feu'], 'fan_salameche': ['Fire', 'Feu'],
        'torrent_mark': ['Water', 'Eau'], 'badge_eau': ['Water', 'Eau'], 'fan_carapuce': ['Water', 'Eau'],
        'verdant_seal': ['Grass', 'Plante'], 'badge_plante': ['Grass', 'Plante'], 'fan_bulbizarre': ['Grass', 'Plante'],
        'spark_emblem': ['Electric', 'Électrik'], 'badge_electrik': ['Electric', 'Électrik'],
        'badge_roche': ['Rock', 'Roche'], 'badge_spectre': ['Ghost', 'Spectre'], 
        'badge_dragon': ['Dragon'], 'badge_psy': ['Psychic', 'Psy']
    };
    
    for (const [key, types] of Object.entries(typeMap)) {
        if (id === key) {
            const count = cards.filter(c => types.some(t => c.data.types.includes(t))).length;
            if (count > 0) {
                // Fan = Chips, Badge/Sigil = Mult
                if (id.includes('fan')) chipsBonus += count * 10;
                else multBonus += count * 4;
                triggered = true;
            }
        }
    }
    
    // --- 2. ANALYSE TEXTUELLE (Fallback pour le catalogue générique) ---
    // Si pas déclenché par ID, on lit la description
    
    // Parser: "+4 Mult", "+10 Chips"
    const multMatch = desc.match(/([+-]?\d+)\s*Mult/i);
    const chipsMatch = desc.match(/([+-]?\d+)\s*Chips?/i);
    const moneyMatch = desc.match(/([+-]?\d+)\$/); // Pour l'argent, on ignore ici (géré en fin de round)
    
    // Conditions de déclenchement basées sur le texte
    let conditionMet = true; // Par défaut vrai (effets permanents)
    
    // Détection des conditions
    const isConditional = desc.toLowerCase().includes('si') || desc.toLowerCase().includes('par') || desc.toLowerCase().includes('pour');
    
    if (isConditional) {
        conditionMet = false; // On part du principe que c'est faux, on vérifie
        let countMultiplier = 0; // Pour les effets "par carte"
        
        // Condition : Type
        const frenchTypes = ['Feu', 'Eau', 'Plante', 'Électrik', 'Roche', 'Sol', 'Vol', 'Poison', 'Combat', 'Psy', 'Spectre', 'Dragon', 'Glace', 'Insecte', 'Fée', 'Normal', 'Acier', 'Ténèbres'];
        
        for (const type of frenchTypes) {
            if (desc.includes(type)) {
                // Map vers anglais pour vérifier les données
                const enType = {
                    'Feu':'Fire', 'Eau':'Water', 'Plante':'Grass', 'Électrik':'Electric', 'Roche':'Rock', 'Sol':'Ground', 
                    'Vol':'Flying', 'Poison':'Poison', 'Combat':'Fighting', 'Psy':'Psychic', 'Spectre':'Ghost', 
                    'Dragon':'Dragon', 'Glace':'Ice', 'Insecte':'Bug', 'Fée':'Fairy', 'Normal':'Normal'
                }[type] || type;
                const count = cards.filter(c => c.data.types.includes(enType)).length;
                
                if (desc.includes('par') && count > 0) {
                    countMultiplier = count;
                    conditionMet = true;
                } else if (count > 0) {
                    conditionMet = true;
                }
            }
        }
        
        // Condition : Rareté
        if (desc.toLowerCase().includes('shiny')) {
            const count = cards.filter(c => c.isShiny).length;
            if (desc.includes('par') && count > 0) { countMultiplier = count; conditionMet = true; }
            else if (count > 0) conditionMet = true;
        }
        
        if (desc.toLowerCase().includes('légendaire')) {
            const count = cards.filter(c => c.data.rarity === 'legendary').length;
            if (count > 0) conditionMet = true;
        }
        
        // Condition : Main spécifique
        const handName = (handType.name || '').toLowerCase();
        if (desc.toLowerCase().includes('paires') && handName.includes('pair')) conditionMet = true;
        if (desc.toLowerCase().includes('brelan') && handName.includes('three')) conditionMet = true;
        if (desc.toLowerCase().includes('suite') && handName.includes('straight')) conditionMet = true;
        if (desc.toLowerCase().includes('flush') && handName.includes('flush')) conditionMet = true;
        if (desc.toLowerCase().includes('full') && handName.includes('full')) conditionMet = true;
        
        // Application du multiplicateur de compteur (ex: +4 Mult PAR carte feu)
        if (conditionMet && countMultiplier > 0) {
            if (multMatch) multBonus += parseInt(multMatch[1]) * countMultiplier;
            if (chipsMatch) chipsBonus += parseInt(chipsMatch[1]) * countMultiplier;
            return { chips: chipsBonus, mult: multBonus, triggered: true };
        }
    }
    
    // Application des bonus simples ou condition remplie (sans compteur)
    if (conditionMet || !isConditional) {
        // Éviter de doubler les bonus si déjà gérés par ID ci-dessus
        if (!triggered) {
            if (multMatch) multBonus += parseInt(multMatch[1]);
            if (chipsMatch) chipsBonus += parseInt(chipsMatch[1]);
            if (multBonus !== 0 || chipsBonus !== 0) triggered = true;
        }
    }
    
    return { chips: chipsBonus, mult: multBonus, triggered };
};

const calculateScore = (cards, handType, jokers, bossEffect) => {
    let chips = handType.chips;
    let mult = handType.mult;
    
    // Vérifier si retrigger est actif
    const retriggerJoker = jokers.find(j => j.id === 'seltzer_wave' && j.remainingHands !== undefined && j.remainingHands > 0);
    const retriggerActive = !!retriggerJoker;
    
    cards.forEach(c => {
        let val = c.data.chips;
        if(c.isShiny) val += 20; 
        if(bossEffect) {
            if(bossEffect.id === 'rock' && ['Fire', 'Normal', 'Flying'].includes(c.data.types[0])) val = Math.floor(val / 2);
            if(bossEffect.id === 'water' && c.data.types[0] === 'Fire') val = 0;
        }
        chips += val;
        // Retrigger : rejouer la valeur
        if (retriggerActive) {
            chips += val;
        }
    });

    if (handType.shinyBonus) {
        mult = Math.floor(mult * 1.5);
    }

    // Appliquer tous les jokers dans l'ordre
    jokers.forEach((j, i) => {
        const effect = window.applyJokerEffect(j, cards, handType, bossEffect, jokers, i);
        chips += effect.chips;
        mult += effect.mult;
    });

    return Math.floor(chips * mult);
};

const calculateEarnings = (handsLeft, discardsLeft, score, target, winningCards) => {
    const breakdown = [];
    let total = 0;

    const handsBonus = handsLeft * 2;
    total += handsBonus;
    breakdown.push({ label: 'Mains Restantes', val: handsBonus, detail: `${handsLeft} x 2$` });

    const discardsBonus = discardsLeft * 1;
    total += discardsBonus;
    breakdown.push({ label: 'Défausses Restantes', val: discardsBonus, detail: `${discardsLeft} x 1$` });

    let perfBonus = 0;
    if (score >= target * 2) perfBonus = 7;
    else if (score >= target * 1.5) perfBonus = 5;
    else if (score >= target * 1.2) perfBonus = 3;
    
    if (perfBonus > 0) {
        total += perfBonus;
        breakdown.push({ label: 'Performance', val: perfBonus, detail: score >= target * 2 ? 'Score x2' : score >= target * 1.5 ? 'Score x1.5' : 'Score x1.2' });
    }

    const types = {};
    winningCards.forEach(c => types[c.data.types[0]] = (types[c.data.types[0]] || 0) + 1);
    if (Object.values(types).some(count => count >= 3)) {
        total += 2;
        breakdown.push({ label: 'Type Advantage', val: 2, detail: '3+ Même Type' });
    }

    const shinyCount = winningCards.filter(c => c.isShiny).length;
    if (shinyCount > 0) {
        const shinyBonus = shinyCount >= 2 ? 6 : 3;
        total += shinyBonus;
        breakdown.push({ label: 'Shiny Played', val: shinyBonus, detail: shinyCount >= 2 ? '2+ Shinies' : '1 Shiny' });
    }

    let maxRarityBonus = 0;
    let rarityLabel = '';
    if (winningCards.some(c => c.data.rarity === 'legendary')) {
        maxRarityBonus = 3;
        rarityLabel = 'Légendaire';
    } else if (winningCards.some(c => c.data.rarity === 'rare')) {
        maxRarityBonus = 1;
        rarityLabel = 'Rare';
    }

    if (maxRarityBonus > 0) {
        total += maxRarityBonus;
        breakdown.push({ label: 'Bonus Rareté', val: maxRarityBonus, detail: rarityLabel });
    }

    return { total, breakdown };
};

// --- COMPONENTS ---
const Card = ({ card, selected, onClick, small, highlight, overlap, dimmed }) => {
    const mainType = card.data.types[0];
    // Utiliser la fonction globale getSpriteUrl depuis config/api_endpoints.js
    // Fallback si la fonction globale n'est pas disponible
    let spriteUrl;
    if (typeof window !== 'undefined' && typeof window.getSpriteUrl === 'function') {
        spriteUrl = window.getSpriteUrl(card.data.dexId, card.isShiny);
    } else {
        // Fallback direct vers l'API
        const baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
        const animUrl = `${baseUrl}/versions/generation-v/black-white/animated`;
        spriteUrl = card.isShiny ? `${animUrl}/shiny/${card.data.dexId}.gif` : `${animUrl}/${card.data.dexId}.gif`;
    }
    const bgStyle = { background: TYPE_COLORS[mainType] };

    return (
        <div 
            onClick={() => onClick && onClick(card)}
            style={bgStyle}
            className={`
                ${small ? 'w-14 h-20 text-[8px]' : 'w-[75px] md:w-24 h-[105px] md:h-36 text-[9px] md:text-xs'} 
                rounded-lg shadow-lg relative flex flex-col p-0.5 md:p-1
                ${card.isShiny ? 'is-shiny' : ''}
                card-container ${selected ? 'selected' : ''} ${highlight ? 'scoring' : ''} ${dimmed ? 'dimmed' : ''}
                cursor-pointer select-none
                overflow-hidden flex-shrink-0 transition-transform duration-200
            `}
            style={{
                ...bgStyle, 
                boxShadow: '-1px 0 0 0 black, 1px 0 0 0 black, 0 -1px 0 0 black, 0 1px 0 0 black', 
                margin: '2px',
                transform: selected ? 'translateY(-10px)' : 'none',
                zIndex: selected ? 50 : 'auto'
            }}
        >
            <div className="absolute inset-0 pokeball-pattern opacity-30"></div>
            
            <div className="flex justify-between bg-black/60 px-1 z-10 backdrop-blur-sm mb-0.5 rounded-t">
                <span className="text-white truncate w-full uppercase tracking-wide font-bold leading-tight py-0.5">{card.data.name}</span>
            </div>
            
            <div className="flex-1 flex items-center justify-center z-10 relative overflow-hidden p-0.5">
                <div className="absolute text-2xl opacity-20 text-white font-black">{getIcon(mainType)}</div>
                <img 
                    src={spriteUrl} 
                    alt={card.data.name} 
                    className="drop-shadow-md" 
                    loading="lazy" 
                    style={{
                        imageRendering: 'pixelated', 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain'
                    }} 
                />
            </div>
            
            {!small && (
                <div className="flex justify-between items-end bg-black/60 p-0.5 z-10 backdrop-blur-sm rounded-b">
                    <span className="text-yellow-300 font-mono font-bold bg-black/40 px-1 rounded leading-none">{card.data.chips}</span>
                    <div className="flex gap-0.5">
                        {Array(card.data.stage + 1).fill(0).map((_,i) => <span key={i} className="text-yellow-400 text-[6px]">★</span>)}
                    </div>
                </div>
            )}
        </div>
    );
};

const JokerCard = ({ joker, onClick, price, highlight, small = false, large = false }) => {
    const rarity = joker.rarity || 'common';
    const rarityColors = {
        common: { border: '#22c55e', shadow: '#22c55e', text: '#86efac', bg: 'rgba(34, 197, 94, 0.1)' },
        uncommon: { border: '#3b82f6', shadow: '#3b82f6', text: '#93c5fd', bg: 'rgba(59, 130, 246, 0.1)' },
        rare: { border: '#a855f7', shadow: '#a855f7', text: '#c084fc', bg: 'rgba(168, 85, 247, 0.1)' },
        legendary: { border: '#fbbf24', shadow: '#fbbf24', text: '#fde047', bg: 'rgba(251, 191, 36, 0.1)' }
    };
    const colors = rarityColors[rarity] || rarityColors.common;
    
    // Ajustement des tailles pour le mobile (plus grand dans le shop)
    const sizeClass = small ? 'w-10 h-14' : large ? 'w-24 h-32 md:w-28 md:h-40' : 'w-20 h-28';
    const textSizeClass = small ? 'text-[6px]' : large ? 'text-xs md:text-sm' : 'text-[9px]';
    const iconSizeClass = small ? 'text-lg' : large ? 'text-4xl' : 'text-2xl';
    
    return (
        <div onClick={onClick} className={`${sizeClass} bg-[#1a1a2e] ${highlight ? 'border-white scale-110 shadow-[0_0_20px_white]' : `border-[${colors.border}] shadow-[0_0_5px_${colors.shadow}]`} border-2 p-1 flex flex-col relative group transition-all cursor-pointer z-20 pixel-border`} style={{borderColor: highlight ? 'white' : colors.border, boxShadow: highlight ? '0 0 20px white' : `0 0 5px ${colors.shadow}`, backgroundColor: colors.bg}}>
            <div className={`${textSizeClass} font-bold text-center truncate uppercase tracking-wider font-vt323`} style={{color: colors.text}}>{joker.name}</div>
            <div className={`flex-1 flex items-center justify-center neon-text ${iconSizeClass}`}>
                {joker.icon || '🃏'}
            </div>
            {price && <div className="absolute top-0 right-0 bg-[#eab308] text-black text-[8px] font-bold px-1 shadow-md">{price}$</div>}
            
            {/* Tooltip amélioré pour mobile */}
            <div className={`hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 w-40 bg-black/95 border p-2 rounded text-[10px] z-[100] shadow-2xl pointer-events-none mb-2 backdrop-blur-md text-center pixel-border`} style={{borderColor: colors.border}}>
                <div className="font-bold mb-1 text-xs" style={{color: colors.text}}>{joker.name}</div>
                <div className="text-white font-vt323 text-sm leading-tight">{joker.desc || joker.name}</div>
                <div className="text-[9px] uppercase mt-1 opacity-70">{rarity}</div>
            </div>
        </div>
    );
};

const Button = ({ children, onClick, variant = 'primary', disabled, icon, className }) => {
    const variants = { primary: "bg-blue-600 hover:bg-blue-500 border-blue-400 text-white", danger: "bg-red-600 hover:bg-red-500 border-red-400 text-white", success: "bg-green-600 hover:bg-green-500 border-green-400 text-white", outline: "bg-transparent hover:bg-white/10 border-2 text-white" };
    return <button onClick={onClick} disabled={disabled} className={`px-6 py-3 font-bold uppercase tracking-widest shadow-lg border-2 pixel-border pixel-font text-xs transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${className || ''}`}>{icon && <span className="mr-2">{icon}</span>}{children}</button>;
};

const Modal = ({ title, children, onClose, closable = true }) => (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-[200]" onClick={closable ? onClose : null}>
        <div className="bg-[#0f172a] border-2 border-[#3b82f6] p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto relative shadow-[0_0_50px_rgba(59,130,246,0.3)] pixel-border" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#0f172a]/95 backdrop-blur z-50 flex justify-between items-center mb-6 border-b-2 border-blue-500/30 pb-4">
                <h2 className="text-2xl font-bold text-[#facc15] uppercase tracking-widest neon-text pixel-font">{title}</h2>
                {closable && <button onClick={(e) => { e.stopPropagation(); if(onClose) onClose(); }} className="text-red-400 text-2xl hover:scale-110 transition-transform hover:text-red-300 pixel-font cursor-pointer">X</button>}
            </div>
            <div className="overflow-y-auto max-h-[75vh] p-2">
                {children}
            </div>
        </div>
    </div>
);

const Tutorial = ({ onClose }) => (
    <Modal title="COMMENT JOUER" onClose={onClose} closable={true}>
        <div className="space-y-4 text-gray-300 font-vt323 text-base md:text-lg max-h-[80vh] overflow-y-auto">
            <div className="bg-black/30 p-4 rounded border border-white/10">
                <h3 className="text-xl text-[#facc15] font-bold mb-2">🎴 1. Construis ton Deck</h3>
                <p>Commence avec un deck de 52 cartes Pokémon. Achète des Boosters dans le shop pour ajouter des Pokémon plus puissants, des Évolutions et des Shinies à ton deck.</p>
            </div>
            
            <div className="bg-black/30 p-4 rounded border border-white/10">
                <h3 className="text-xl text-[#60a5fa] font-bold mb-2">⚔️ 2. Crée des Combos</h3>
                <p>Joue des mains de Poker revisitées (Paire, Brelan, Full...) ou des combos Pokémon (Duo Évolutif, Mono-Type, Légendaires). Chaque combo marque des points (Chips).</p>
                <p className="mt-2 text-sm text-gray-400">💡 Astuce : Les Shinies donnent un bonus x1.5 sur le score !</p>
            </div>
            
            <div className="bg-black/30 p-4 rounded border border-white/10">
                <h3 className="text-xl text-[#f87171] font-bold mb-2">🃏 3. Utilise les Jokers</h3>
                <p>Les Jokers donnent des multiplicateurs massifs et des effets spéciaux. Combine-les intelligemment pour atteindre les scores cibles des Champions d'Arène !</p>
                <p className="mt-2 text-sm text-gray-400">💡 Tu peux acheter jusqu'à 5 Jokers (6 avec un coupon spécial).</p>
            </div>
            
            <div className="bg-black/30 p-4 rounded border border-white/10">
                <h3 className="text-xl text-[#10b981] font-bold mb-2">📦 4. Passer un Dresseur</h3>
                <p>Tu peux passer les <strong>Petit Dresseur</strong> et <strong>Dresseur Costaud</strong> (mais pas le Champion). En passant, tu gagnes automatiquement un <strong>Booster gratuit</strong> !</p>
                <p className="mt-2 text-sm text-gray-400">💡 Parfait pour renforcer ton deck sans risquer de perdre !</p>
            </div>
            
            <div className="bg-black/30 p-4 rounded border border-white/10">
                <h3 className="text-xl text-[#8b5cf6] font-bold mb-2">🏆 5. Structure d'une Partie</h3>
                <p>Une partie se compose de <strong>8 Ligues</strong> (Antes). Chaque Ligue contient 3 dresseurs :</p>
                <ul className="mt-2 ml-4 list-disc text-sm">
                    <li><strong>Petit Dresseur</strong> - Facile (peut être passé)</li>
                    <li><strong>Dresseur Costaud</strong> - Moyen (peut être passé)</li>
                    <li><strong>Champion</strong> - Difficile (obligatoire, donne un Badge)</li>
                </ul>
            </div>
            
            <div className="bg-black/30 p-4 rounded border border-white/10">
                <h3 className="text-xl text-[#f59e0b] font-bold mb-2">💰 6. Le Shop</h3>
                <p>Après chaque victoire, visite le shop pour :</p>
                <ul className="mt-2 ml-4 list-disc text-sm">
                    <li>Acheter des <strong>Jokers</strong> pour renforcer tes combos</li>
                    <li>Ouvrir des <strong>Boosters</strong> pour ajouter des cartes à ton deck</li>
                    <li>Acheter des <strong>Coupons</strong> pour des avantages permanents</li>
                </ul>
            </div>
            
            <div className="bg-black/30 p-4 rounded border border-white/10">
                <h3 className="text-xl text-[#ec4899] font-bold mb-2">🎯 7. Objectif</h3>
                <p>Atteins le score cible de chaque dresseur pour le battre. Si tu échoues, c'est Game Over et tu recommences depuis le début !</p>
                <p className="mt-2 text-sm text-gray-400">💡 Gère bien tes mains restantes et tes défausses !</p>
            </div>
            
            <div className="text-center mt-6">
                <Button onClick={onClose} variant="success" className="px-8 py-3">J'AI COMPRIS !</Button>
            </div>
        </div>
    </Modal>
);

const WinRecap = ({ earnings, onCollect }) => {
    const handleCollect = () => {
        if (window.FX) {
            FX.coins(Math.min(Math.floor(earnings / 100), 30));
            FX.confetti(window.innerWidth/2, window.innerHeight/2, 50);
        }
        onCollect();
    };
    const [visibleItems, setVisibleItems] = useState(0);
    
    useEffect(() => {
        setVisibleItems(0);
        const timer = setInterval(() => {
            setVisibleItems(prev => {
                if (prev < earnings.breakdown.length) {
                    return prev + 1;
                } else {
                    clearInterval(timer);
                    return prev;
                }
            });
        }, 500);
        return () => clearInterval(timer);
    }, [earnings.breakdown.length]);
    
    return (
    <Modal title="VICTOIRE !" closable={false}>
        <div className="flex flex-col gap-4">
            <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
                    {earnings.breakdown.map((item, i) => (
                        <div 
                            key={i} 
                            className={`flex justify-between items-center border-b border-white/5 pb-2 last:border-0 transition-all duration-500 ${
                                i < visibleItems 
                                    ? 'opacity-100 translate-x-0' 
                                    : 'opacity-0 -translate-x-8'
                            }`}
                            style={{ transitionDelay: `${i * 0.1}s` }}
                        >
                            <div>
                                <div className="text-blue-300 font-bold pixel-font text-xs">{item.label}</div>
                                <div className="text-gray-500 text-[10px] font-mono">{item.detail}</div>
            </div>
                            <div className="text-[#facc15] font-bold font-mono text-lg">+{item.val}$</div>
                        </div>
                    ))}
                </div>
                <div className={`flex justify-between items-center bg-[#1e293b] p-4 rounded-xl border-2 border-[#facc15] transition-all duration-500 ${
                    visibleItems >= earnings.breakdown.length 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-8'
                }`}>
                    <div className="text-white font-bold text-xl">TOTAL GAIN</div>
                    <div className="text-4xl text-[#facc15] font-black neon-text font-mono">+{earnings.total}$</div>
                </div>
                <div className="flex justify-center mt-4">
                    <button 
                        onClick={handleCollect} 
                        className={`bg-green-600 hover:bg-green-500 text-white px-12 py-4 rounded font-black text-xl pixel-font pixel-border shadow-[0_0_20px_#22c55e] transition-all duration-500 hover:scale-105 ${
                            visibleItems >= earnings.breakdown.length 
                                ? 'opacity-100 translate-y-0' 
                                : 'opacity-0 translate-y-8 pointer-events-none'
                        }`}
                    >
                        ENCAISSER 💰
                    </button>
                </div>
        </div>
    </Modal>
);
};

const BossDefeatedModal = ({ boss, onContinue }) => {
    const trainerSprite = getTrainerSprite(boss.sprite);
    return (
        <div className="fixed inset-0 z-[300] bg-black/95 flex flex-col items-center justify-center">
            <div className="relative animate-defeat mb-8"><img src={trainerSprite} className="h-64 object-contain grayscale opacity-80" /></div>
            <div className="animate-badge text-center flex flex-col items-center">
                <div className="text-8xl mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">{getBadgeIcon(boss.type)}</div>
                <h1 className="text-4xl text-[#facc15] font-bold pixel-font neon-text mb-2">BADGE {getBadgeName(boss.type).toUpperCase()}</h1>
                <div className="text-xl text-white font-vt323 mb-8">Champion {boss.name} Vaincu !</div>
                <Button onClick={onContinue} variant="primary">CONTINUER</Button>
            </div>
        </div>
    );
};

// --- START SCREEN ---
const StartScreen = ({ onStart, onShowTutorial }) => {
    const stats = (typeof window !== 'undefined' && window.gameState?.poker) || {};
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center relative p-4 md:p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-blue-900/20 to-black opacity-50"></div>
            <div className="relative z-10 text-center max-w-2xl w-full">
                <h1 className="text-4xl md:text-7xl font-bold text-[#facc15] mb-4 neon-text uppercase" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '900', letterSpacing: '2px', textShadow: '0 0 30px rgba(250, 204, 21, 0.6)'}}>🃏 POKÉ-POKER</h1>
                <p className="text-lg md:text-2xl text-white/80 mb-8 md:mb-12 font-vt323" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600'}}>Combinez des cartes Pokémon pour créer des combos puissants!</p>
                
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8 md:mb-12">
                    <Button onClick={onStart} variant="primary" icon="🎮" className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 min-w-[180px] md:min-w-[200px]">
                        COMMENCER
                    </Button>
                    <Button onClick={onShowTutorial} variant="outline" className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 min-w-[180px] md:min-w-[200px]" style={{borderColor: '#667eea', color: '#667eea', background: 'rgba(102, 126, 234, 0.2)'}}>
                        📚 TUTORIEL
                    </Button>
                    <Button onClick={() => window.showPokerMetaShop && window.showPokerMetaShop()} variant="outline" className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 min-w-[180px] md:min-w-[200px]" style={{borderColor: '#FFD700', color: '#FFD700', background: 'rgba(255, 215, 0, 0.2)'}}>
                        🛒 MÉTA-SHOP
                    </Button>
                    <Button onClick={() => window.switchPage && window.switchPage('home')} variant="outline" className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 min-w-[180px] md:min-w-[200px]" style={{borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239, 68, 68, 0.2)'}}>
                        🚪 QUITTER
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8 md:mt-12">
                    <div className="bg-black/60 p-3 md:p-4 rounded-xl border border-white/10 text-center">
                        <div className="text-2xl md:text-3xl mb-2">🏆</div>
                        <div className="text-xl md:text-2xl font-bold text-white" style={{fontFamily: 'monospace'}}>{stats.runs_completed || 0}</div>
                        <div className="text-[10px] md:text-xs text-white/60 uppercase" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Runs</div>
                    </div>
                    <div className="bg-black/60 p-3 md:p-4 rounded-xl border border-white/10 text-center">
                        <div className="text-2xl md:text-3xl mb-2">💰</div>
                        <div className="text-xl md:text-2xl font-bold text-[#facc15]" style={{fontFamily: 'monospace'}}>{(stats.total_chips_earned || 0).toLocaleString()}</div>
                        <div className="text-[10px] md:text-xs text-white/60 uppercase" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Chips</div>
                    </div>
                    <div className="bg-black/60 p-3 md:p-4 rounded-xl border border-white/10 text-center">
                        <div className="text-2xl md:text-3xl mb-2">🎴</div>
                        <div className="text-xl md:text-2xl font-bold text-blue-400" style={{fontFamily: 'monospace'}}>{stats.total_hands_played || 0}</div>
                        <div className="text-[10px] md:text-xs text-white/60 uppercase" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Mains</div>
                    </div>
                    <div className="bg-black/60 p-3 md:p-4 rounded-xl border border-white/10 text-center">
                        <div className="text-2xl md:text-3xl mb-2">👑</div>
                        <div className="text-xl md:text-2xl font-bold text-purple-400" style={{fontFamily: 'monospace'}}>{stats.highest_ante || 1}</div>
                        <div className="text-[10px] md:text-xs text-white/60 uppercase" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Ligue Max</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- LOBBY ---
const RunLobby = ({ ante, blinds, currentBlindIndex, onSkip, onFight, money, vouchers, badges }) => {
    
    return (
        <div className="h-screen w-full flex flex-col relative overflow-hidden bg-[#1a1a2e]">
            {/* Header Compact */}
            <div className="flex-shrink-0 p-4 bg-black/40 border-b border-white/10 flex justify-between items-center z-20">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold text-[#facc15] neon-text uppercase" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 'bold', letterSpacing: '1px'}}>LIGUE {ante} / 8</h1>
                    <div className="text-blue-300 text-xs md:text-base uppercase tracking-wide" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600'}}>{LEAGUE_NAMES[ante-1] || "Ligue Ultime"}</div>
                </div>
                
                {/* Badges & Vouchers (Scrollable horizontalement si trop nombreux) */}
                <div className="flex gap-2 overflow-x-auto max-w-[50%] no-scrollbar">
                    {vouchers && vouchers.map((vId, i) => (
                        <div key={i} className="w-6 h-8 bg-purple-900 border border-purple-400 rounded flex-shrink-0 flex items-center justify-center text-xs group relative cursor-help">🎟️<div className="hidden group-hover:block absolute top-full mt-2 w-40 bg-black p-2 rounded border border-purple-500 text-[10px] z-50"><div className="font-bold text-purple-300">{VOUCHERS_DB.find(v=>v.id===vId)?.name}</div><div className="text-white">{VOUCHERS_DB.find(v=>v.id===vId)?.desc}</div></div></div>
                    ))}
                    {badges && badges.map((b, i) => (
                        <div key={i} className="text-xl flex-shrink-0" title={`Badge ${getBadgeName(b)}`}>{getBadgeIcon(b)}</div>
                    ))}
                </div>
            </div>
            
            {/* Carousel des Dresseurs */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden flex items-center gap-4 p-4 md:p-8 snap-x snap-mandatory no-scrollbar">
                {blinds.map((blind, idx) => {
                    const isActive = idx === currentBlindIndex; 
                    const isDone = idx < currentBlindIndex; 
                    const isBoss = idx === 2; 
                    const trainerSprite = isBoss ? getTrainerSprite(blind.bossEffect.sprite) : getTrainerSprite(idx === 0 ? 'youngster' : 'lass'); 
                    const blindTitle = isBoss ? 'CHAMPION' : idx === 0 ? 'PETIT DRESSEUR' : 'DRESSEUR COSTAUD';
                    return (
                        <div 
                            key={idx} 
                            className={`
                                snap-center flex-shrink-0 
                                w-[85vw] md:w-80 max-w-[400px] 
                                h-[65vh] md:h-[600px] 
                                border-4 rounded-xl relative flex flex-col overflow-hidden transition-all duration-300
                                ${isActive ? 'border-[#facc15] bg-gradient-to-b from-[#1e293b] to-[#0f172a] scale-100 shadow-[0_0_30px_rgba(250,204,21,0.4)]' : 'border-slate-600 bg-black/80 scale-95 opacity-60 grayscale'}
                            `}
                            style={{boxShadow: isActive ? '0 0 40px rgba(250,204,21,0.5), -3px 0 0 0 black, 3px 0 0 0 black, 0 -3px 0 0 black, 0 3px 0 0 black' : '-3px 0 0 0 black, 3px 0 0 0 black, 0 -3px 0 0 black, 0 3px 0 0 black', margin: '3px'}}
                        >
                            {/* Status Overlay */}
                            {isDone && <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center"><span className="text-green-500 text-4xl font-black rotate-[-12deg] border-4 border-green-500 p-2 rounded">VAINCU</span></div>}
                            {!isActive && !isDone && <div className="absolute inset-0 bg-black/40 z-30 flex items-center justify-center"><span className="text-slate-400 text-xl font-bold bg-black/80 px-4 py-2 rounded">VERROUILLÉ</span></div>}
                            {isActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent animate-shimmer z-5"></div>}
                            {/* Trainer Image */}
                            <div className="flex-1 relative flex items-center justify-center p-4">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
                                <img 
                                    src={trainerSprite} 
                                    className={`h-[60%] w-auto object-contain drop-shadow-xl ${isActive ? 'animate-bounce-slow' : ''}`} 
                                />
                                {isBoss && isActive && (
                                    <div className="absolute bottom-4 bg-red-900/80 text-red-200 px-3 py-1 rounded border border-red-500 text-xs max-w-[90%] text-center">
                                        ⚠️ {blind.bossEffect.name}: {blind.bossEffect.desc}
                                    </div>
                                )}
                            </div>
                            
                            {/* Info Panel */}
                            <div className="bg-black/90 p-4 border-t-2 border-white/10 z-20">
                                <div className={`text-sm font-bold mb-1 text-center uppercase tracking-widest ${isBoss ? 'text-red-500' : 'text-blue-400'}`} style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>{blindTitle}</div>
                                <div className="text-4xl font-black text-white text-center mb-4 font-mono" style={{fontFamily: 'monospace'}}>{blind.target.toLocaleString()}</div>
                                
                                {isActive && (
                                    <div className="flex gap-3">
                                        <Button onClick={() => onFight(blind)} variant="primary" className="flex-1 py-4 text-lg">
                                            COMBATTRE
                                        </Button>
                                        {!isBoss && (
                                            <button 
                                                onClick={() => onSkip(blind)} 
                                                className="px-4 py-2 bg-slate-800 border-2 border-slate-600 text-slate-300 font-bold rounded text-xs flex flex-col items-center justify-center active:bg-slate-700"
                                            >
                                                <span>PASSER</span>
                                                <span className="text-[#facc15] text-[10px]">{blind.skipReward}</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Indicateur de défilement (Dots) */}
            <div className="flex justify-center gap-2 pb-4">
                {blinds.map((_, idx) => (
                    <div key={idx} className={`w-2 h-2 rounded-full ${idx === currentBlindIndex ? 'bg-[#facc15]' : 'bg-white/20'}`}></div>
                ))}
            </div>
        </div>
    );
};

// --- GAMETABLE ---
const GameTable = ({ deck, jokers, blind, onWin, onCollect, onLose, discoveredHands, vouchers = [], onJokersUpdate }) => {
    const [hand, setHand] = useState([]);
    const [drawPile, setDrawPile] = useState([]);
    const [discardPile, setDiscardPile] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [score, setScore] = useState(0);
    const [handsLeft, setHandsLeft] = useState(4);
    const [discardsLeft, setDiscardsLeft] = useState(3);
    const [showDeck, setShowDeck] = useState(false);
    const [showHands, setShowHands] = useState(false);
    const [sortMode, setSortMode] = useState('type');
    const [scoringState, setScoringState] = useState({ active: false, step: '', index: -1, currentChips: 0, currentMult: 0, displayScore: 0 });
    const [winData, setWinData] = useState(null);
    const [winningHandId, setWinningHandId] = useState(null);
    const [winningCards, setWinningCards] = useState([]); 
    const [jokerEffects, setJokerEffects] = useState({}); // Pour tracker les effets temporaires (ex: retrigger pour 10 mains)
    const [draggedJokerIndex, setDraggedJokerIndex] = useState(null);

    useEffect(() => {
        const extraHands = jokers.filter(j => j.type === 'hand_add').length;
        setHandsLeft(4 + extraHands);
        const shuffled = [...deck].sort(() => Math.random() - 0.5);
        setHand(shuffled.slice(0, 8));
        setDrawPile(shuffled.slice(8));
    }, []);

    const toggleSelect = (card) => { if (scoringState.active) return; if(selectedIds.includes(card.uid)) setSelectedIds(selectedIds.filter(id => id !== card.uid)); else if(selectedIds.length < 5) setSelectedIds([...selectedIds, card.uid]); };

    const evaluateHandLogic = (cards) => {
        if(!cards.length) return { ...HANDS_CONFIG.find(h => h.id === 'wild_encounter'), baseChips:0, shinyBonus: false };
        
        const types = {}; const idCounts = {}; const fams = {}; const famIds = {}; 
        let legendaryCount = 0; let shinyCount = 0;

        cards.forEach(c => {
            types[c.data.types[0]] = (types[c.data.types[0]] || 0) + 1;
            idCounts[c.data.id] = (idCounts[c.data.id] || 0) + 1;
            fams[c.data.familyId] = (fams[c.data.familyId] || 0) + 1;
            if(!famIds[c.data.familyId]) famIds[c.data.familyId] = new Set();
            famIds[c.data.familyId].add(c.data.id);
            if(c.data.legendary) legendaryCount++;
            if(c.isShiny) shinyCount++;
        });

        const maxType = Math.max(...Object.values(types));
        const distinctTypes = Object.keys(types).length;
        const maxIdCount = Math.max(...Object.values(idCounts));
        const maxFam = Math.max(...Object.values(fams));
        
        let distinctFamDuoCount = 0;
        Object.values(famIds).forEach(set => { if(set.size >= 2) distinctFamDuoCount++; });

        let maxDistinctFamMembers = 0;
        Object.values(famIds).forEach(set => { if(set.size > maxDistinctFamMembers) maxDistinctFamMembers = set.size; });

        const has3Stages = Object.values(famIds).some(set => set.size >= 3);
        const famCounts = Object.values(fams);
        
        const hasFamFull = famCounts.includes(3) && famCounts.includes(2);
        const hasIdFull = Object.values(idCounts).includes(3) && Object.values(idCounts).includes(2);
        const isPokeballFull = hasFamFull || hasIdFull;

        let handType = null;
        if(shinyCount >= 5) handType = HANDS_CONFIG.find(h => h.id === 'shiny_flush');
        else if(idCounts['mew'] && idCounts['mewtwo']) handType = HANDS_CONFIG.find(h => h.id === 'origin_duo'); 
        else if(legendaryCount >= 3) handType = HANDS_CONFIG.find(h => h.id === 'legendary_trio');
        else if(distinctTypes >= 5 && shinyCount >=1) handType = HANDS_CONFIG.find(h => h.id === 'full_rainbow');
        else if(maxIdCount >= 4) handType = HANDS_CONFIG.find(h => h.id === 'four_kind');
        else if(has3Stages) handType = HANDS_CONFIG.find(h => h.id === 'evolution_parfaite');
        else if(isPokeballFull) handType = HANDS_CONFIG.find(h => h.id === 'pokeball_full');
        else if(maxType >= 5) handType = HANDS_CONFIG.find(h => h.id === 'mono_type');
        else if(maxIdCount >= 3) handType = HANDS_CONFIG.find(h => h.id === 'three_kind');
        else if(maxFam >= 3) handType = HANDS_CONFIG.find(h => h.id === 'evolution_trio');
        else if(Object.values(types).includes(3) && Object.values(types).includes(2)) handType = HANDS_CONFIG.find(h => h.id === 'duo_type');
        else if(distinctFamDuoCount >= 2) handType = HANDS_CONFIG.find(h => h.id === 'double_evo_duo');
        else if(maxDistinctFamMembers >= 2) handType = HANDS_CONFIG.find(h => h.id === 'evolution_duo');
        else if(maxIdCount >= 2) handType = HANDS_CONFIG.find(h => h.id === 'pair');
        else handType = HANDS_CONFIG.find(h => h.id === 'wild_encounter');
        
        // Toujours appliquer le bonus shiny si un ou plusieurs shiny sont dans la main
        const hasShiny = shinyCount > 0;
        return { ...handType, shinyBonus: hasShiny, shinyCount };
    };

    const currentHandInfo = useMemo(() => {
        const selectedCards = hand.filter(c => selectedIds.includes(c.uid));
        const type = evaluateHandLogic(selectedCards);
        const simulatedScore = calculateScore(selectedCards, type, jokers, blind.bossEffect);
        return { type, simulatedScore };
    }, [selectedIds, hand, jokers, blind]);

    const startScoringSequence = async () => {
        if (selectedIds.length === 0 || handsLeft === 0) return;
        const playedCards = hand.filter(c => selectedIds.includes(c.uid));
        const handType = evaluateHandLogic(playedCards);
        
        setWinningHandId(handType.id);
        setWinningCards(playedCards);
        
        setScoringState({ active: true, step: 'BASE', index: -1, currentChips: handType.chips, currentMult: handType.mult, displayScore: 0 });
        await new Promise(r => setTimeout(r, 600));

        let runChips = handType.chips;
        for (let i = 0; i < playedCards.length; i++) {
            setScoringState(prev => ({ ...prev, step: 'CARD', index: i }));
            const card = playedCards[i];
            let val = card.data.chips;
            if (card.isShiny) val += 20;
            if(blind.bossEffect?.id === 'water' && card.data.types[0] === 'Fire') val = 0;
            runChips += val;
            setScoringState(prev => ({ ...prev, currentChips: runChips }));
            await new Promise(r => setTimeout(r, 500));
        }

        setScoringState(prev => ({ ...prev, step: 'JOKER', index: -1 }));
        let runMult = handType.mult;
        if (handType.shinyBonus) runMult = Math.floor(runMult * 1.5);
        let runChipsAfterCards = runChips;

        // Appliquer tous les jokers dans l'ordre
        for (let i = 0; i < jokers.length; i++) {
            const joker = jokers[i];
            const effect = window.applyJokerEffect(joker, playedCards, handType, blind.bossEffect, jokers, i);
            
            if (effect.triggered || effect.chips !== 0 || effect.mult !== 0) {
                setScoringState(prev => ({ ...prev, index: i }));
                runChipsAfterCards += effect.chips;
                runMult += effect.mult;
                setScoringState(prev => ({ ...prev, currentChips: runChipsAfterCards, currentMult: runMult }));
                await new Promise(r => setTimeout(r, 600));
            }
        }

        const finalScore = runChipsAfterCards * runMult;
        setScoringState(prev => ({ ...prev, step: 'FINAL', displayScore: finalScore, index: -1 }));
        await new Promise(r => setTimeout(r, 1000));

        const newScore = score + finalScore;
        setScore(newScore);
        setHandsLeft(h => h - 1);
        
        // Décrémenter les jokers avec durée limitée
        const updatedJokers = jokers.map(j => {
            if (j.id === 'seltzer_wave' && j.remainingHands !== undefined && j.remainingHands > 0) {
                return { ...j, remainingHands: j.remainingHands - 1 };
            }
            return j;
        });
        // Mettre à jour les jokers si nécessaire (via callback parent)
        if (onJokersUpdate && updatedJokers.some((j, i) => j.remainingHands !== jokers[i]?.remainingHands)) {
            onJokersUpdate(updatedJokers);
        }

        if(newScore >= blind.target) {
            // Ne pas réinitialiser la main avant d'afficher la modale de victoire
            setTimeout(() => {
                const earnings = calculateEarnings(handsLeft - 1, discardsLeft, newScore, blind.target, playedCards);
                setWinData(earnings);
                onWin(earnings.total, handType.id, playedCards);
                // Réinitialiser la main après avoir affiché la modale
                setTimeout(() => {
                    const remainingHand = hand.filter(c => !selectedIds.includes(c.uid));
                    const needed = 8 - remainingHand.length;
                    const drawn = drawPile.slice(0, needed);
                    setDiscardPile([...discardPile, ...playedCards]);
                    setHand([...remainingHand, ...drawn]);
                    setDrawPile(drawPile.slice(needed));
                    setSelectedIds([]);
                    setScoringState({ active: false, step: '', index: -1, currentChips: 0, currentMult: 0, displayScore: 0 });
                }, 100);
            }, 500);
        } else if (handsLeft - 1 <= 0) {
            // DÉFAITE (Game Over)
            // On attend un peu pour que le joueur voie le score final
            setTimeout(() => {
                // Appeler la fonction de callback du parent qui déclenchera window.failRun()
                if (onLose) {
                    console.log("Déclenchement onLose depuis GameTable");
                    onLose();
                } else {
                    console.error("onLose n'est pas défini dans GameTable");
                    // Fallback de sécurité
                    if (typeof window.failRun === 'function') window.failRun();
                }
            }, 1500);
        } else {
            // Réinitialiser la main seulement si on continue à jouer
            const remainingHand = hand.filter(c => !selectedIds.includes(c.uid));
            const needed = 8 - remainingHand.length;
            const drawn = drawPile.slice(0, needed);
            setDiscardPile([...discardPile, ...playedCards]);
            setHand([...remainingHand, ...drawn]);
            setDrawPile(drawPile.slice(needed));
            setSelectedIds([]);
            setScoringState({ active: false, step: '', index: -1, currentChips: 0, currentMult: 0, displayScore: 0 });
        }
    };

    const handleDiscard = () => {
        if (scoringState.active) return;
        const discarded = hand.filter(c => selectedIds.includes(c.uid));
        const remainingHand = hand.filter(c => !selectedIds.includes(c.uid));
        const needed = 8 - remainingHand.length;
        const drawn = drawPile.slice(0, needed);
        setDiscardPile([...discardPile, ...discarded]);
        setHand([...remainingHand, ...drawn]);
        setDrawPile(drawPile.slice(needed));
        setDiscardsLeft(d => d - 1);
        setSelectedIds([]);
    };

    const sortedCards = useMemo(() => { const all = [...hand, ...drawPile, ...discardPile]; const groups = {}; all.forEach(c => { let key = sortMode === 'type' ? c.data.types[0] : sortMode === 'rarity' ? c.data.rarity : `Stade ${c.data.stage}`; if (!groups[key]) groups[key] = []; groups[key].push(c); }); return groups; }, [hand, drawPile, discardPile, sortMode]);

    return (
        <div className="h-screen flex flex-col relative" style={{overflow: 'visible'}}>
            {winData && <WinRecap earnings={winData} onCollect={() => { setWinData(null); onCollect(); }} />}

            {scoringState.active && (<div className="absolute top-0 left-0 w-full z-[90] bg-black/90 border-b-4 border-blue-500 shadow-2xl p-4 flex items-center justify-center gap-8 animate-slide-in"><div className="text-white font-bold pixel-font text-xs tracking-widest">SCORE HAND</div><div className="flex items-center gap-4 text-4xl font-mono"><div className={`text-blue-300 transition-transform ${scoringState.step === 'CARD' ? 'scale-125 text-white' : ''}`}>{scoringState.currentChips}</div><span className="text-gray-500 text-xl">X</span><div className={`text-red-300 transition-transform ${scoringState.step === 'JOKER' ? 'scale-125 text-white' : ''}`}>{scoringState.currentMult}</div></div><div className="text-5xl font-black text-[#facc15] animate-pulse-glow pixel-font ml-8">{scoringState.step === 'FINAL' ? scoringState.displayScore.toLocaleString() : (scoringState.currentChips * scoringState.currentMult).toLocaleString()}</div></div>)}

            {showDeck && (<Modal title={`Mon Deck (${drawPile.length + hand.length + discardPile.length})`} onClose={() => setShowDeck(false)}><div className="flex justify-center gap-4 mb-8">{['type', 'rarity', 'stage'].map(mode => (<button key={mode} onClick={() => setSortMode(mode)} className={`px-6 py-2 pixel-font text-[10px] border-2 ${sortMode === mode ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-600 text-gray-400'} uppercase transition-colors`}>{mode === 'type' ? 'Par Type' : mode === 'rarity' ? 'Par Rareté' : 'Par Évolution'}</button>))}</div><div className="flex flex-col gap-8 pb-8">{Object.entries(sortedCards).map(([key, cards]) => (<div key={key} className="bg-black/40 p-6 rounded-xl border border-white/10"><h3 className="text-xl font-bold mb-6 text-white/90 border-b-2 border-blue-500/50 pb-2 flex items-center gap-4 font-vt323 uppercase tracking-widest"><span className="text-2xl">{key}</span><span className="text-lg bg-blue-900 px-3 py-1 rounded ml-auto text-white font-mono">{cards.length}</span></h3><div className="flex flex-wrap pl-4 gap-y-6">{cards.map((c, i) => <div key={c.uid} className={`${i > 0 ? '-ml-10' : ''} relative hover:-translate-y-6 hover:z-50 hover:ml-4 transition-all duration-200 group`}><Card card={c} small overlap /></div>)}</div></div>))}</div></Modal>)}
            
            {showHands && (<Modal title="Tous les combos" onClose={() => setShowHands(false)}><div className="space-y-4">{HANDS_CONFIG.filter(h => !h.secret || (h.secret && discoveredHands.includes(h.id))).map(h => (<div key={h.id} className="bg-black/40 p-4 rounded-lg border border-white/5 hover:border-blue-400/50 transition-colors flex flex-col gap-3"><div className="flex justify-between items-center border-b border-white/10 pb-2"><span className="font-bold text-blue-300 text-xl tracking-wide font-vt323 uppercase">{h.name}</span><span className="font-mono text-[#facc15] bg-black/60 px-3 py-1 rounded border border-[#facc15]/30 shadow-[0_0_10px_rgba(250,204,21,0.2)]">{h.chips} x {h.mult}</span></div><p className="text-lg text-slate-300 font-vt323">{h.desc || "Description manquante"}</p><div className="flex gap-3 bg-black/30 p-3 rounded-lg justify-center overflow-x-auto">{h.example && h.example.map((ex, i) => <Card key={i} card={ex} small />)}</div></div>))}</div></Modal>)}

            <div className="bg-[#0f172a]/90 border-b-2 border-white/10 flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-3 md:py-4 z-20 backdrop-blur-md shadow-xl gap-3 md:gap-0" style={{paddingTop: 'max(15px, env(safe-area-inset-top))'}}>
                <div className="flex gap-4 md:gap-8 order-1">
                    <div className="text-right bg-black/30 px-3 md:px-4 py-2 border border-red-500/30 pixel-border">
                        <div className="text-[8px] text-red-400 font-bold tracking-widest uppercase pixel-font">Cible</div>
                        <div className="text-xl md:text-2xl font-mono text-red-100 neon-text pixel-font">{blind.target}</div>
                    </div>
                    <div className="text-right bg-black/30 px-3 md:px-4 py-2 border border-blue-500/30 pixel-border">
                        <div className="text-[8px] text-blue-400 font-bold tracking-widest uppercase pixel-font">Score</div>
                        <div className="text-xl md:text-2xl font-mono text-white neon-text pixel-font">{score}</div>
                    </div>
                </div>
                {/* Bouton Sauver et Quitter - En haut à droite, accessible (pas trop haut) */}
                <div className="absolute top-12 right-4 md:relative md:top-auto md:right-auto order-4 md:order-4 z-30">
                    <button 
                        onClick={() => {
                            if (typeof window !== 'undefined' && window.gameState && window.gameState.poker && window.gameState.poker.current_run) {
                                window.gameState.poker.current_run.shop_pending = false;
                                if (typeof saveGame === 'function') saveGame();
                            }
                            if (typeof switchPage === 'function') {
                                switchPage('home');
                            }
                        }}
                        className="bg-blue-900/50 hover:bg-blue-800 text-blue-300 border border-blue-500/50 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition-colors"
                        style={{paddingTop: 'max(8px, env(safe-area-inset-top))'}}
                    >
                        <span>💾</span> Save et Quitter
                    </button>
                </div>
                <div className="flex gap-2 md:gap-3 px-3 md:px-6 py-1 bg-black/20 border-2 border-white/5 pixel-border order-3 md:order-2 justify-center mb-0">
                    {jokers.map((j, i) => (
                        <div
                            key={i}
                            draggable
                            onDragStart={(e) => {
                                setDraggedJokerIndex(i);
                                e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (draggedJokerIndex !== null && draggedJokerIndex !== i) {
                                    const newJokers = [...jokers];
                                    const [removed] = newJokers.splice(draggedJokerIndex, 1);
                                    newJokers.splice(i, 0, removed);
                                    if (onJokersUpdate) {
                                        onJokersUpdate(newJokers);
                                    }
                                }
                                setDraggedJokerIndex(null);
                            }}
                            onDragEnd={() => setDraggedJokerIndex(null)}
                            className="cursor-move"
                            style={{ opacity: draggedJokerIndex === i ? 0.5 : 1 }}
                        >
                            <JokerCard joker={j} highlight={scoringState.step === 'JOKER' && scoringState.index === i} />
                        </div>
                    ))}
                    {[...Array(Math.max(0, (vouchers.includes('elite_cert') ? 6 : 5) - jokers.length))].map((_, i) => <div key={i} className="w-16 md:w-20 h-22 md:h-28 border-2 border-dashed border-white/10 bg-white/5 flex items-center justify-center text-[8px] text-white/20 font-bold uppercase tracking-widest pixel-font">Vide</div>)}
                </div>
                <div className="text-right flex gap-3 md:gap-4 order-2 md:order-3">
                    <div className="bg-blue-900/30 px-3 md:px-4 py-2 border border-blue-500/30 pixel-border">
                        <div className="text-blue-300 font-bold text-[8px] uppercase pixel-font">Mains</div>
                        <div className="text-lg md:text-xl font-mono pixel-font">{handsLeft}</div>
                    </div>
                    <div className="bg-red-900/30 px-3 md:px-4 py-2 border border-red-500/30 pixel-border">
                        <div className="text-red-300 font-bold text-[8px] uppercase pixel-font">Défau.</div>
                        <div className="text-lg md:text-xl font-mono pixel-font">{discardsLeft}</div>
                    </div>
                </div>
            </div>

            <div className="relative" style={{flex: '1 1 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', minHeight: 0, overflow: 'visible', padding: '20px 10px', gap: '15px'}}>
                 <div className="absolute top-4 right-4 flex flex-col gap-3 z-50">
                    <button onClick={() => setShowDeck(true)} className="w-16 h-16 bg-slate-800 flex flex-col items-center justify-center border-2 border-slate-600 hover:border-blue-400 hover:shadow-[0_0_15px_#60a5fa] transition-all group pixel-border" title="Mon Deck"><span className="text-3xl group-hover:scale-110 transition-transform">🎴</span><span className="text-[8px] font-bold text-white uppercase mt-1" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Deck</span></button>
                    <div className="text-center text-xs font-bold text-blue-300 bg-black/60 px-1 border border-blue-500/30 pixel-font">{drawPile.length}</div>
                    <button onClick={() => setShowHands(true)} className="w-16 h-16 bg-slate-800 flex flex-col items-center justify-center border-2 border-slate-600 hover:border-yellow-400 hover:shadow-[0_0_15px_#facc15] transition-all group pixel-border" title="Tous les combos"><span className="text-3xl group-hover:scale-110 transition-transform">📋</span><span className="text-[8px] font-bold text-white uppercase mt-1" style={{fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>Combo</span></button>
                </div>
                
                {/* Espace flexible en haut pour pousser le contenu vers le bas */}
                <div style={{flex: '1 1 0', minHeight: '20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%'}}>
                    {/* Bloc de la main sélectionnée - déplacé plus bas */}
                    <div className="text-center flex items-center justify-center" style={{width: '100%', maxWidth: '500px'}}>
                        {selectedIds.length > 0 ? (
                            <div className="animate-float bg-black/60 px-6 py-3 border-2 border-[#facc15] shadow-[0_0_20px_rgba(250,204,21,0.3)] backdrop-blur-sm pixel-border relative">
                                <div className="text-xl md:text-2xl font-bold text-white uppercase tracking-widest mb-1 font-vt323">{currentHandInfo.type.name}</div>
                                <div className="text-2xl md:text-3xl font-black text-[#facc15] font-mono tracking-tighter drop-shadow-md pixel-font">~ {currentHandInfo.simulatedScore.toLocaleString()}</div>
                                {currentHandInfo.type.shinyBonus && (<div className="absolute -top-4 -right-4 bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-black px-2 py-1 rounded-full border-2 border-white shadow-lg animate-pulse text-xs pixel-font transform rotate-12">x1.5 SHINY</div>)}
                            </div>
                        ) : <div className="text-slate-500 italic text-lg md:text-xl font-light tracking-wide font-vt323">Sélectionnez jusqu'à 5 cartes</div>}
                    </div>
                </div>
                
                {/* Boutons d'action */}
                <div className="flex gap-4 items-center z-30" style={{flexShrink: 0}}>
                    <Button onClick={startScoringSequence} disabled={selectedIds.length === 0 || handsLeft === 0 || scoringState.active} variant="primary" icon="⚔️" className="px-6 py-3 text-sm shadow-xl">JOUER</Button>
                    <Button onClick={handleDiscard} disabled={selectedIds.length === 0 || discardsLeft === 0 || scoringState.active} variant="danger" icon="🗑️" className="px-6 py-3 text-sm shadow-xl">JETER</Button>
                </div>
                
                {/* ZONE DES CARTES (2 LIGNES DE 4 CARTES) - Mieux répartie pour remplir l'espace */}
                <div className="w-full px-2 pb-4 safe-area-pb" style={{flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '100%'}}>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', width: '100%', maxWidth: '450px', margin: '0 auto'}}>
                        {hand.map((card, idx) => {
                            const isScoringHighlight = scoringState.step === 'CARD' && scoringState.index === selectedIds.indexOf(card.uid);
                            const isDimmed = scoringState.active && !selectedIds.includes(card.uid);
                            
                            return (
                                <div key={card.uid} className="transform transition-transform hover:z-50" style={{width: '100%', aspectRatio: '3/4', margin: '0 auto'}}>
                                    <Card 
                                        card={card} 
                                        selected={selectedIds.includes(card.uid)} 
                                        highlight={isScoringHighlight} 
                                        dimmed={isDimmed} 
                                        onClick={toggleSelect}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Shop Component
const Shop = ({ onExit, money, buyJoker, sellJoker, addCardsToDeck, inventory, currentVoucher, buyVoucher, vouchers = [] }) => {
    const [stock, setStock] = useState({ jokers: [], boosters: [], voucher: currentVoucher });
    const [boosterState, setBoosterState] = useState({ active: false, cards: [], type: null });
    const [typeSelector, setTypeSelector] = useState({ active: false, boosterIdx: -1 });

    useEffect(() => {
        // Charger le catalogue complet de jokers
        const loadJokersFromCatalogue = async () => {
            try {
                // Essayer d'utiliser le catalogue global d'abord
                let catalogue = null;
                if (typeof window !== 'undefined' && window.CARDS_CATALOGUE) {
                    catalogue = window.CARDS_CATALOGUE;
                } else if (typeof CARDS_CATALOGUE !== 'undefined' && CARDS_CATALOGUE) {
                    catalogue = CARDS_CATALOGUE;
                }
                
                if (!catalogue) {
                    try {
                        const response = await fetch('cards_catalogue.json');
                        catalogue = await response.json();
                        if (typeof window !== 'undefined') {
                            window.CARDS_CATALOGUE = catalogue;
                        }
                    } catch (fetchError) {
                        console.error('Erreur lors du chargement du catalogue:', fetchError);
                    }
                }
                
                if (catalogue && catalogue.jokers) {
                    // Combiner tous les jokers du catalogue
                    const allJokers = [
                        ...(catalogue.jokers.common || []),
                        ...(catalogue.jokers.uncommon || []),
                        ...(catalogue.jokers.rare || []),
                        ...(catalogue.jokers.legendary || [])
                    ];
                    
                    // Convertir au format attendu
                    const formattedJokers = allJokers.map(j => {
                        // Déterminer le prix selon la rareté
                        let price = 4; // default common
                        if (j.rarity === 'uncommon') price = 6;
                        else if (j.rarity === 'rare') price = 10;
                        else if (j.rarity === 'legendary') price = 15;
                        
                        return {
                            id: j.id,
                            name: j.name_fr || j.name,
                            desc: j.tooltip || j.description || '',
                            rarity: j.rarity,
                            price: price,
                            icon: j.icon || '🃏',
                            type: 'joker'
                        };
                    });
                    
                    // Générer 2 jokers uniques (pas de doublons)
                    const availableJokers = formattedJokers.length > 0 ? formattedJokers : [...JOKERS_DB];
                    const selectedJokers = [];
                    const ownedJokerIds = inventory.map(j => j.id);
                    
                    // Filtrer les jokers déjà possédés
                    let purchasableJokers = availableJokers.filter(j => !ownedJokerIds.includes(j.id));
                    
                    // Si tous les jokers sont possédés, permettre de revoir les mêmes
                    if (purchasableJokers.length === 0) {
                        purchasableJokers = availableJokers;
                    }
                    
                    // Sélectionner 2 jokers aléatoires uniques
                    const usedIds = new Set();
                    while (selectedJokers.length < 2 && purchasableJokers.length > 0) {
                        const available = purchasableJokers.filter(j => !usedIds.has(j.id));
                        if (available.length === 0) break;
                        const randomIndex = Math.floor(Math.random() * available.length);
                        const selected = available[randomIndex];
                        selectedJokers.push(selected);
                        usedIds.add(selected.id);
                    }
                    
        const boosters = [Math.random() > 0.8 ? BOOSTERS_CONFIG[3] : BOOSTERS_CONFIG[0], Math.random() > 0.7 ? BOOSTERS_CONFIG[2] : BOOSTERS_CONFIG[1]];
                    setStock({ jokers: selectedJokers, boosters, voucher: currentVoucher });
                } else {
                    // Fallback sur JOKERS_DB si le catalogue n'est pas disponible
                    const availableJokers = [...JOKERS_DB];
                    const selectedJokers = [];
                    const ownedJokerIds = inventory.map(j => j.id);
                    const purchasableJokers = availableJokers.filter(j => !ownedJokerIds.includes(j.id));
                    
                    for (let i = 0; i < 2 && purchasableJokers.length > 0; i++) {
                        const randomIndex = Math.floor(Math.random() * purchasableJokers.length);
                        selectedJokers.push(purchasableJokers[randomIndex]);
                        purchasableJokers.splice(randomIndex, 1);
                    }
                    
                    const boosters = [Math.random() > 0.8 ? BOOSTERS_CONFIG[3] : BOOSTERS_CONFIG[0], Math.random() > 0.7 ? BOOSTERS_CONFIG[2] : BOOSTERS_CONFIG[1]];
                    setStock({ jokers: selectedJokers, boosters, voucher: currentVoucher });
                }
            } catch (error) {
                console.error('Erreur lors du chargement du catalogue:', error);
                // Fallback sur JOKERS_DB
                const availableJokers = [...JOKERS_DB];
                const selectedJokers = [];
                const ownedJokerIds = inventory.map(j => j.id);
                const purchasableJokers = availableJokers.filter(j => !ownedJokerIds.includes(j.id));
                
                for (let i = 0; i < 2 && purchasableJokers.length > 0; i++) {
                    const randomIndex = Math.floor(Math.random() * purchasableJokers.length);
                    selectedJokers.push(purchasableJokers[randomIndex]);
                    purchasableJokers.splice(randomIndex, 1);
                }
                
                const boosters = [Math.random() > 0.8 ? BOOSTERS_CONFIG[3] : BOOSTERS_CONFIG[0], Math.random() > 0.7 ? BOOSTERS_CONFIG[2] : BOOSTERS_CONFIG[1]];
                setStock({ jokers: selectedJokers, boosters, voucher: currentVoucher });
            }
        };
        
        loadJokersFromCatalogue();
    }, []); // Ne pas régénérer quand inventory ou voucher change - les jokers sont fixés au chargement du shop 

    // Mettre à jour uniquement le voucher dans le stock quand currentVoucher change, sans régénérer les jokers
    useEffect(() => {
        setStock(prev => ({ ...prev, voucher: currentVoucher }));
    }, [currentVoucher]);

    const handleBuyBooster = (idx, booster) => {
        if (booster.id === 'elemental') {
            setTypeSelector({ active: true, boosterIdx: idx });
        } else {
            openBooster(idx, booster);
        }
    };

    const openBooster = (idx, booster, forcedType = null) => {
        // Animation d'ouverture
        const newBoosters = [...stock.boosters];
        newBoosters[idx] = null;
        setStock(prev => ({ ...prev, boosters: newBoosters }));
        setBoosterState({ active: false, cards: [], type: booster });
        
        setTimeout(() => {
            const cards = generateBoosterContent(booster, forcedType, {});
            setBoosterState({ active: true, cards, type: booster });
        }, 1500);
    };

    const handleSelectCard = (card) => {
        addCardsToDeck([card]);
        setBoosterState({ active: false, cards: [], type: null });
    };

    const handleBuyVoucher = () => {
        if (stock.voucher && money >= stock.voucher.price) {
            buyVoucher(stock.voucher);
            setStock(prev => ({ ...prev, voucher: null }));
        }
    };

    // Fonction pour quitter le shop vers le menu principal
    const handleSaveAndQuit = () => {
        if (typeof window !== 'undefined' && window.gameState && window.gameState.poker && window.gameState.poker.current_run) {
            window.gameState.poker.current_run.shop_pending = true;
            if (typeof saveGame === 'function') saveGame();
        }
        if (typeof switchPage === 'function') {
            switchPage('home');
        }
    };

    if (typeSelector.active) {
        const types = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Rock', 'Ghost', 'Poison', 'Flying', 'Ice'];
        return (
            <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center">
                <h2 className="text-3xl text-white font-bold mb-8 pixel-font neon-text">CHOISIS UN TYPE</h2>
                <div className="grid grid-cols-5 gap-4">
                    {types.map(t => (
                        <button key={t} onClick={() => { setTypeSelector({active: false, boosterIdx: -1}); openBooster(typeSelector.boosterIdx, BOOSTERS_CONFIG.find(b=>b.id==='elemental'), t); }} className={`w-24 h-24 rounded-xl border-4 bg-type-${t.toLowerCase()} flex items-center justify-center text-4xl hover:scale-110 transition-transform shadow-lg`}>{getIcon(t)}</button>
                    ))}
                </div>
                <button onClick={() => setTypeSelector({active:false, boosterIdx: -1})} className="mt-8 text-red-500 hover:text-red-400 pixel-font">ANNULER</button>
            </div>
        );
    }

    if (boosterState.type && !boosterState.active && boosterState.cards.length === 0) {
        // Animation d'ouverture
        return (
            <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center">
                <div className="text-8xl mb-8 animate-bounce" style={{animation: 'bounce 1s infinite'}}>📦</div>
                <h2 className="text-3xl text-[#facc15] font-bold mb-4 pixel-font animate-pulse">OUVERTURE...</h2>
            </div>
        );
    }
    
    if (boosterState.active && boosterState.cards.length > 0) {
        return (
            <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl text-[#facc15] font-bold mb-2 pixel-font">CHOISIS UNE CARTE</h2>
                <p className="text-gray-400 mb-8 font-vt323 text-sm">Les autres seront perdues...</p>
                
                {/* Grille responsive pour les cartes du booster */}
                <div className="grid grid-cols-3 md:flex gap-4 md:gap-8 justify-center items-center">
                    {boosterState.cards.map((card, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 animate-appear" style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className="transform scale-110">
                                <Card card={card} onClick={() => handleSelectCard(card)} />
                            </div>
                            <button 
                                onClick={() => handleSelectCard(card)} 
                                className="w-full py-2 bg-green-600 text-white font-bold text-[10px] rounded hover:bg-green-500"
                            >
                                CHOISIR
                            </button>
                        </div>
                    ))}
                </div>
                
                {/* Bouton Skip pour ne rien choisir */}
                <button 
                    onClick={() => setBoosterState({ active: false, cards: [], type: null })} 
                    className="mt-8 px-8 py-3 bg-gray-700 text-white font-bold text-sm rounded hover:bg-gray-600 transition-colors"
                >
                    ⏭️ SKIP (Ne rien ajouter)
                </button>
            </div>
        );
    }

    if (!stock.boosters) return <div>Chargement...</div>;

    return (
        <div className="h-screen w-full bg-[#1a1a2e] flex flex-col overflow-hidden">
            {/* HEADER SHOP AMÉLIORÉ */}
            <div className="flex-shrink-0 bg-black/80 p-3 border-b border-white/10 flex justify-between items-center z-20 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="text-2xl">🛒</div>
                    <div>
                        <div className="font-bold text-white text-lg">BOUTIQUE</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Améliorations</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                     <button 
                        onClick={handleSaveAndQuit}
                        className="bg-blue-900/50 hover:bg-blue-800 text-blue-300 border border-blue-500/50 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                        <span>💾</span> Save et Quitter
                    </button>
                    <div className="bg-black/60 px-4 py-2 rounded-full border border-[#facc15]/50 flex items-center gap-2">
                        <span className="text-xl font-mono font-bold text-[#facc15]">{money}$</span>
                    </div>
                </div>
            </div>

            {/* CONTENU SCROLLABLE */}
            <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-6">
                
                {/* 1. VOS JOKERS (Tout en haut) */}
                <div className="bg-black/40 p-4 rounded-xl border border-white/10 max-w-2xl mx-auto w-full">
                    <div className="flex justify-between items-center mb-3">
                        <div className="text-sm font-bold text-gray-300 uppercase tracking-wider">Vos Jokers ({inventory.length}/5)</div>
                        <div className="text-[10px] text-gray-500">Cliquez pour vendre</div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start min-h-[100px] bg-black/20 rounded-lg p-2">
                        {inventory.map((joker, i) => (
                            <div key={i} className="relative group flex flex-col items-center gap-1">
                                <JokerCard joker={joker} small={false} />
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        sellJoker(i);
                                    }}
                                    className="bg-red-600 hover:bg-red-500 text-white text-[8px] px-2 py-0.5 rounded font-bold shadow-sm border border-white/20 transition-colors"
                                    style={{ fontSize: '8px', padding: '2px 6px' }}
                                >
                                    Vendre {Math.floor((joker.price || 4) * 0.5)}$
                                </button>
                            </div>
                        ))}
                        {inventory.length === 0 && (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs italic">
                                Aucun joker équipé
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. COUPON (Centré) */}
                <div className="max-w-md mx-auto w-full">
                    <div className="bg-slate-900/80 border-2 border-dashed border-slate-600 rounded-xl p-4 relative text-center">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 px-3 text-slate-400 text-xs font-bold uppercase tracking-widest border border-slate-700 rounded-full">Coupon Spécial</div>
                        {stock.voucher ? (
                            <div className="flex flex-col items-center gap-3 pt-2">
                                <div className="text-5xl filter drop-shadow-lg">🎟️</div>
                                <div>
                                    <div className="font-bold text-white text-base">{stock.voucher.name}</div>
                                    <div className="text-xs text-gray-400 leading-tight mb-3 max-w-[200px] mx-auto">{stock.voucher.desc}</div>
                                    <button 
                                        onClick={() => { if(money >= stock.voucher.price) { buyVoucher(stock.voucher); setStock(p=>({...p, voucher:null})); } }}
                                        disabled={money < stock.voucher.price}
                                        className={`px-6 py-2 text-xs font-bold rounded-full transition-transform active:scale-95 ${money >= stock.voucher.price ? 'bg-green-600 text-white shadow-lg shadow-green-900/50' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                                    >
                                        ACHETER {stock.voucher.price}$
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-24 flex items-center justify-center text-gray-600 text-sm font-vt323 uppercase tracking-widest">RUPTURE DE STOCK</div>
                        )}
                    </div>
                </div>

                {/* 3. JOKERS DU JOUR (Centrés & Plus grands) */}
                <div className="max-w-2xl mx-auto w-full bg-slate-900/60 border border-slate-700 rounded-xl p-5 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1a1a2e] px-4 text-purple-400 text-xs font-bold border border-purple-500/30 rounded-full uppercase tracking-widest">Jokers du Jour</div>
                    
                    <div className="flex justify-center gap-8 pt-2 flex-wrap">
                        {stock.jokers.map((joker, i) => (
                            <div key={i} className="flex flex-col items-center gap-3">
                                {joker ? (
                                    <>
                                        <div className="transform hover:scale-105 transition-transform duration-200">
                                            <JokerCard joker={joker} large={true} />
                                        </div>
                                        <button 
                                            onClick={() => { 
                                                const hasExtraSlot = vouchers.includes('elite_cert');
                                                if(money >= joker.price && inventory.length < (hasExtraSlot?6:5)) { 
                                                    buyJoker(joker); 
                                                    const n=[...stock.jokers]; n[i]=null; setStock(p=>({...p, jokers:n})); 
                                                } 
                                            }}
                                            disabled={money < joker.price || inventory.length >= (vouchers.includes('elite_cert')?6:5)}
                                            className={`px-4 py-1.5 text-[10px] font-bold rounded-full w-full ${
                                                money >= joker.price && inventory.length < (vouchers.includes('elite_cert')?6:5)
                                                ? 'bg-green-600 text-white shadow-md shadow-green-900/30' 
                                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            {joker.price}$
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-24 h-32 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg">
                                        <span className="text-white/20 text-xs font-bold">VENDU</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. BOOSTERS (Centrés) */}
                <div className="max-w-2xl mx-auto w-full bg-slate-900/60 border border-slate-700 rounded-xl p-5 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1a1a2e] px-4 text-blue-400 text-xs font-bold border border-blue-500/30 rounded-full uppercase tracking-widest">Boosters</div>
                    
                    <div className="flex justify-center gap-6 pt-2 flex-wrap">
                        {stock.boosters.map((booster, i) => (
                            <div key={i} className="flex flex-col items-center gap-3">
                                {booster ? (
                                    <>
                                        <div 
                                            className={`w-28 h-36 rounded-xl shadow-lg booster-pack flex flex-col items-center justify-center text-center p-3 border-2 border-white/20 cursor-pointer hover:-translate-y-1 transition-transform ${booster.color}`}
                                            onClick={() => { if(money >= booster.price) { handleBuyBooster(i, booster); }}}
                                        >
                                            <div className="text-4xl mb-2 drop-shadow-md">📦</div>
                                            <div className="font-bold text-white uppercase pixel-font text-[10px] leading-tight mb-1">{booster.name}</div>
                                            <div className="text-[9px] text-white/90 font-vt323 leading-none">{booster.desc}</div>
                                        </div>
                                        <button 
                                            onClick={() => { if(money >= booster.price) { handleBuyBooster(i, booster); }}}
                                            disabled={money < booster.price}
                                            className={`px-4 py-1.5 text-[10px] font-bold rounded-full w-full ${money >= booster.price ? 'bg-green-600 text-white shadow-md' : 'bg-gray-700 text-gray-500'}`}
                                        >
                                            OUVRIR {booster.price}$
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-28 h-36 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-white/20 text-xs">VIDE</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 w-full bg-[#0f172a] p-4 border-t border-white/10 flex gap-3 z-30 safe-area-pb shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                <button 
                    onClick={onExit} 
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-4 rounded-xl font-black text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 border-b-4 border-red-900"
                >
                    <span>🔥</span> PROCHAIN COMBAT
                </button>
            </div>
        </div>
    );
};

// --- APP SHELL ---
const App = () => {
    const [view, setView] = useState('START');
    const [deck, setDeck] = useState(generateDeck(52));
    const [jokers, setJokers] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [money, setMoney] = useState(10);
    const [ante, setAnte] = useState(1);
    const [blindIdx, setBlindIdx] = useState(0);
    const [shopVoucher, setShopVoucher] = useState(null);
    const [discoveredHands, setDiscoveredHands] = useState([]);
    const [newHandUnlock, setNewHandUnlock] = useState(null);
    const [unlockCards, setUnlockCards] = useState([]);
    const [bossDefeatedData, setBossDefeatedData] = useState(null);
    const [badges, setBadges] = useState([]);
    const [showTutorial, setShowTutorial] = useState(false);
    const [skipBoosterState, setSkipBoosterState] = useState({ active: false, cards: [], type: null });

    useEffect(() => { 
        generateNewVoucher();
        // Ne plus afficher le tuto automatiquement
    }, []);

    const handleCloseTutorial = () => {
        setShowTutorial(false);
        localStorage.setItem('tutorial_seen', 'true');
    };

    const generateNewVoucher = () => {
        const available = VOUCHERS_DB.filter(v => !vouchers.includes(v.id));
        if (available.length > 0) setShopVoucher(available[Math.floor(Math.random() * available.length)]);
        else setShopVoucher(null);
    };
    
    const blinds = useMemo(() => {
        const base = 300 * Math.pow(1.5, ante - 1);
        return [
            { target: Math.floor(base), skipReward: '+ Booster', bossEffect: null },
            { target: Math.floor(base * 1.5), skipReward: '+ Booster', bossEffect: null },
            { target: Math.floor(base * 3), skipReward: 'Rare', bossEffect: BOSS_EFFECTS[(ante-1) % BOSS_EFFECTS.length] }
        ];
    }, [ante]);

    const getSecretUnlockCards = (handId, winningCards) => {
        if (handId === 'origin_duo') return winningCards.filter(c => c.data.id === 'mew' || c.data.id === 'mewtwo');
        if (handId.includes('shiny')) return winningCards.filter(c => c.isShiny);
        if (handId === 'kanto_pantheon') return winningCards.filter(c => c.data.rarity === 'legendary');
        return winningCards;
    };

    const handleWinGame = (earnings, handId, winningCards) => {
        const handConfig = HANDS_CONFIG.find(h => h.id === handId);
        if (handConfig && handConfig.secret && !discoveredHands.includes(handId)) {
            setDiscoveredHands(prev => [...prev, handId]);
            setUnlockCards(getSecretUnlockCards(handId, winningCards));
            setNewHandUnlock(handConfig);
        }

        if (blindIdx === 2) { 
            const boss = blinds[2].bossEffect;
            setBossDefeatedData(boss);
            setBadges(prev => [...prev, boss.type]);
        }

        setMoney(m => {
            const newMoney = m + earnings;
            // Synchroniser avec gameState.poker.current_run pour le calcul des chips gagnés
            if (typeof window !== 'undefined' && window.gameState && window.gameState.poker && window.gameState.poker.current_run) {
                const run = window.gameState.poker.current_run;
                const startingChips = run.starting_chips || 10;
                const chipsEarned = newMoney - startingChips;
                if (chipsEarned > 0) {
                    if (!run.rewards) run.rewards = {};
                    run.rewards.chips_earned = chipsEarned;
                }
                run.chips = newMoney;
            }
            return newMoney;
        }); 
    };

    const onMoneyCollected = () => {
        if (bossDefeatedData) {
            // No op here, let Boss modal display, handled by App state check
        } else {
            // Générer un nouveau coupon après la victoire d'une blind (pas seulement après le boss)
            if (blindIdx === 2) {
                generateNewVoucher();
            }
            setView('SHOP');
        }
    };

    const closeBossModal = () => {
        setBossDefeatedData(null);
        // Générer un nouveau coupon après la victoire du boss
        generateNewVoucher();
        setView('SHOP');
    };

    const savePokerState = () => {
        if (typeof window !== 'undefined' && window.gameState && window.gameState.poker) {
            if (!window.gameState.poker.current_run) {
                window.gameState.poker.current_run = {
                    rewards: { chips_earned: 0 }
                };
            }
            window.gameState.poker.current_run.active = true;
            window.gameState.poker.current_run.current_ante = ante;
            window.gameState.poker.current_run.current_blind_index = blindIdx;
            window.gameState.poker.current_run.chips = money;
            window.gameState.poker.current_run.active_jokers = jokers;
            // S'assurer que start_time existe pour le calcul de durée
            if (!window.gameState.poker.current_run.start_time) {
                window.gameState.poker.current_run.start_time = Date.now();
            }
            // Calculer les chips gagnés si pas déjà fait
            if (!window.gameState.poker.current_run.starting_chips) {
                window.gameState.poker.current_run.starting_chips = 10;
            }
            const chipsEarned = money - window.gameState.poker.current_run.starting_chips;
            if (chipsEarned > 0) {
                if (!window.gameState.poker.current_run.rewards) {
                    window.gameState.poker.current_run.rewards = {};
                }
                window.gameState.poker.current_run.rewards.chips_earned = chipsEarned;
            }
            if (typeof saveGame === 'function') {
                saveGame();
            }
        }
    };

    const handleFight = () => {
        savePokerState();
        setView('GAME');
    };
    const handleSkip = (blind) => {
        // Ouvrir un booster aléatoire directement
        const boosterTypes = ['basic', 'evo', 'elemental', 'shiny'];
        const randomBooster = BOOSTERS_CONFIG.find(b => boosterTypes.includes(b.id)) || BOOSTERS_CONFIG[0];
        const cards = generateBoosterContent(randomBooster, null, {});
        setSkipBoosterState({ active: true, cards, type: randomBooster });
    };
    const handleSelectSkipCard = (card) => {
        handleAddCards([card]);
        setSkipBoosterState({ active: false, cards: [], type: null });
        advanceBlind();
    };
    const handleExitShop = () => advanceBlind();
    const advanceBlind = () => { 
        if(blindIdx === 2) { 
            const newAnte = ante + 1;
            if(newAnte > 8) {
                // Fin de partie - retourner à l'écran START
                setView('START');
                // Réinitialiser l'état
                setAnte(1);
                setBlindIdx(0);
                setMoney(10);
                setJokers([]);
                setVouchers([]);
                setDeck(generateDeck(52));
                setDiscoveredHands([]);
                setBadges([]);
                if (typeof window !== 'undefined' && window.gameState && window.gameState.poker) {
                    window.gameState.poker.current_run = null;
                    if (typeof saveGame === 'function') {
                        saveGame();
                    }
                }
            } else {
                setAnte(newAnte);
                setBlindIdx(0);
                savePokerState();
                setView('LOBBY');
            }
        } 
        else { 
            setBlindIdx(i => i + 1);
            savePokerState();
            setView('LOBBY'); 
        } 
    };
    const handleBuyJoker = (joker) => {
        // Initialiser les propriétés spéciales pour certains jokers
        const jokerWithProps = { ...joker };
        if (joker.id === 'seltzer_wave') {
            jokerWithProps.remainingHands = 10; // 10 mains pour le retrigger
        } 
        const hasExtraSlot = vouchers.includes('elite_cert');
        const maxJokers = hasExtraSlot ? 6 : 5;
        if (jokers.length >= maxJokers) return; 
        setMoney(m => m - joker.price); 
        setJokers(prev => [...prev, jokerWithProps]); 
    };
    const handleSellJoker = (jokerIndex) => {
        const jokerToSell = jokers[jokerIndex];
        if (!jokerToSell) return;
        const buyPrice = jokerToSell.price || (jokerToSell.rarity === 'common' ? 4 : jokerToSell.rarity === 'uncommon' ? 6 : jokerToSell.rarity === 'rare' ? 10 : 15);
        const sellPrice = Math.floor(buyPrice * 0.5); // Vendre à 50% du prix d'achat
        setMoney(m => m + sellPrice);
        setJokers(prev => prev.filter((_, i) => i !== jokerIndex));
    };
    const handleBuyVoucher = (voucher) => { setMoney(m => m - voucher.price); setVouchers(prev => [...prev, voucher.id]); setShopVoucher(null); };
    const handleAddCards = (cards) => { setDeck(prev => [...prev, ...cards]); };
    const handleStart = () => {
        // Initialiser une nouvelle run
        setAnte(1);
        setBlindIdx(0);
        setMoney(10);
        setJokers([]);
        setVouchers([]);
        setDeck(generateDeck(52));
        setDiscoveredHands([]);
        setBadges([]);
        setView('LOBBY');
        
        // Sauvegarder dans gameState si disponible
        if (typeof window !== 'undefined' && window.gameState && window.gameState.poker) {
            const startingChips = 10;
            window.gameState.poker.current_run = {
                active: true,
                start_time: Date.now(),
                current_ante: 1,
                current_blind_index: 0,
                chips: startingChips,
                starting_chips: startingChips,
                active_jokers: [],
                rewards: {
                    chips_earned: 0,
                    cards_unlocked: [],
                    jokers_found: [],
                    shards: 0,
                    shiny_tokens: 0
                },
                blinds_cleared: 0
            };
            if (typeof saveGame === 'function') {
                saveGame();
            }
        }
    };
    const handleShowTutorial = () => {
        setShowTutorial(true);
    };

    // Synchroniser avec gameState si disponible (seulement au premier chargement)
    const [hasInitialized, setHasInitialized] = useState(false);
    const [forceReset, setForceReset] = useState(0);
    useEffect(() => {
        if (forceReset > 0) {
            // Forcer le reset en ignorant gameState
            setView('START');
            setHasInitialized(false);
            return;
        }
        if (hasInitialized) return; // Ne synchroniser qu'une fois
        
        // Toujours commencer par START, sauf si une run est vraiment active
        if (typeof window !== 'undefined' && window.gameState && window.gameState.poker && window.gameState.poker.current_run && window.gameState.poker.current_run.active === true) {
            const pokerState = window.gameState.poker;
            const run = pokerState.current_run;
            // Vérifier que la run a bien les propriétés nécessaires
            if (run.current_ante && run.current_blind_index !== undefined) {
                setMoney(run.chips || 10);
                setAnte(run.current_ante || 1);
                setBlindIdx(run.current_blind_index || 0);
                setJokers(run.active_jokers || []);
                if (run.shop_pending) {
                    setView('SHOP');
                    run.shop_pending = false;
                    if (typeof saveGame === 'function') saveGame();
                } else {
                    setView('LOBBY');
                }
            } else {
                // Run invalide, retourner à START
                setView('START');
                if (typeof window !== 'undefined' && window.gameState && window.gameState.poker) {
                    window.gameState.poker.current_run = null;
                    if (typeof saveGame === 'function') saveGame();
                }
            }
        } else {
            // Pas de run active, retourner à START
            setView('START');
            if (typeof window !== 'undefined' && window.gameState && window.gameState.poker) {
                window.gameState.poker.current_run = null;
                if (typeof saveGame === 'function') saveGame();
            }
        }
        setHasInitialized(true);
    }, [hasInitialized, forceReset]);

    return (
        <>
            {showTutorial && <Tutorial onClose={handleCloseTutorial} />}

            {newHandUnlock && (
                <div className="fixed inset-0 z-[300] bg-black/95 flex flex-col items-center justify-center text-center animate-secret" onClick={() => setNewHandUnlock(null)}>
                    <div className="text-6xl mb-8 animate-pulse">✨</div>
                    <h1 className="text-4xl text-[#facc15] font-bold pixel-font mb-8 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">MAIN SECRÈTE DÉCOUVERTE !</h1>
                    <div className="text-3xl text-white font-vt323 mb-8">{newHandUnlock.name}</div>
                    <div className="flex gap-4 justify-center mb-12">
                        {unlockCards.map((c, i) => (
                            <div key={i} className="transform scale-125">
                                <Card card={c} small={false} />
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 text-gray-400 blink text-sm pixel-font">CLIQUER POUR CONTINUER</div>
                </div>
            )}

            {bossDefeatedData && !newHandUnlock && view === 'GAME' && (
                <BossDefeatedModal boss={bossDefeatedData} onContinue={closeBossModal} />
            )}

            {view === 'START' && <StartScreen onStart={handleStart} onShowTutorial={handleShowTutorial} />}
            
            {view === 'LOBBY' && <RunLobby ante={ante} blinds={blinds} currentBlindIndex={blindIdx} onSkip={handleSkip} onFight={handleFight} money={money} vouchers={vouchers} badges={badges} />}
            
            {view === 'GAME' && <GameTable deck={deck} jokers={jokers} blind={blinds[blindIdx]} onWin={(earnings, handId, winningCards) => handleWinGame(earnings, handId, winningCards)} onCollect={onMoneyCollected} onJokersUpdate={(updatedJokers) => setJokers(updatedJokers)} onLose={() => {
                console.log("Callback onLose déclenché dans React");
                
                // S'assurer que l'état est synchronisé avant d'appeler failRun
                savePokerState();
                
                // 1. Appeler la fonction globale de Game Over
                if (typeof window.failRun === 'function') {
                    console.log("Appel de window.failRun()");
                    window.failRun();
                } else {
                    console.error("window.failRun n'est pas défini");
                }
                
                // 2. Réinitialiser l'état React local pour sortir de l'écran de jeu
                // Cela évite de rester bloqué sur la table de jeu
                setTimeout(() => {
                    setView('START');
                    setAnte(1);
                    setBlindIdx(0);
                    setMoney(10);
                    setJokers([]);
                    setVouchers([]);
                    setDeck(generateDeck(52));
                }, 100);
            }} discoveredHands={discoveredHands} vouchers={vouchers} />}
            
            {view === 'SHOP' && <Shop onExit={handleExitShop} money={money} inventory={jokers} buyJoker={handleBuyJoker} sellJoker={handleSellJoker} addCardsToDeck={handleAddCards} vouchers={vouchers} currentVoucher={shopVoucher} buyVoucher={handleBuyVoucher} />}
            
            
            {skipBoosterState.active && skipBoosterState.cards.length > 0 && (
                <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center">
                    <h2 className="text-3xl text-[#facc15] font-bold mb-4 pixel-font">BOOSTER GRATUIT</h2>
                    <p className="text-gray-400 mb-8 font-vt323 text-xl">Choisis une carte</p>
                    <div className="flex gap-8 perspective-[1000px]">
                        {skipBoosterState.cards.map((card, i) => (
                            <div key={i} className="animate-appear group hover:-translate-y-6 transition-transform duration-300" style={{ animationDelay: `${i * 0.15}s`, transform: 'scale(1.2)' }}>
                                <Card card={card} onClick={() => handleSelectSkipCard(card)} />
                                <button onClick={() => handleSelectSkipCard(card)} className="mt-4 w-full py-2 bg-green-600 text-white font-bold pixel-font text-[10px] pixel-border hover:bg-green-500">CHOISIR</button>
                            </div>
                        ))}
                    </div>
                    {/* Bouton Skip pour ne rien choisir */}
                    <button 
                        onClick={() => {
                            setSkipBoosterState({ active: false, cards: [], type: null });
                            advanceBlind();
                        }} 
                        className="mt-8 px-8 py-3 bg-gray-700 text-white font-bold text-sm rounded hover:bg-gray-600 transition-colors"
                    >
                        ⏭️ SKIP (Ne rien ajouter)
                    </button>
                </div>
            )}
        </>
    );
};

// Exporter App globalement pour que le script dans index.html puisse l'utiliser
window.App = App;
window.App = App;