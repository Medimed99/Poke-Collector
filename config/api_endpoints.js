// ===== ARCHITECTURE V7.0 GENESIS - CONFIGURATION API (ZÉRO-ASSET) =====
// Toutes les ressources visuelles sont chargées dynamiquement depuis des API tierces

const ASSET_SOURCES = {
    POKEMON: {
        // Sprites animés Génération 5 (Black/White) - Priorité 1
        ANIMATED: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/',
        SHINY: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/',
        // Sprites statiques - Fallback si animé n'existe pas
        STATIC: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/',
        // Back sprites (pour Buddy/Combat)
        BACK: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/back/',
        BACK_SHINY: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/back/shiny/'
    },
    ITEMS: {
        // Icônes d'objets (Balls, Baies, etc.)
        BASE: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/',
        // Mapping des noms internes vers les noms de fichiers API
        MAPPING: {
            'pokeball': 'poke-ball',
            'greatball': 'great-ball',
            'ultraball': 'ultra-ball',
            'masterball': 'master-ball',
            'diveball': 'dive-ball',
            'framby': 'oran-berry',
            'pinap': 'pinap-berry',
            'ceriz': 'cheri-berry',
            'exp_charm': 'exp-share',
            'lucky_charm': 'lucky-egg',
            'incensefleur': 'full-incense',
            'marin_lure': 'super-rod'
        }
    },
    TYPES: {
        // Icônes de types depuis Pokémon Showdown
        SHOWDOWN: 'https://play.pokemonshowdown.com/sprites/types/',
        // Mapping des types français vers les noms Showdown
        MAPPING: {
            'Normal': 'Normal',
            'Feu': 'Fire',
            'Eau': 'Water',
            'Plante': 'Grass',
            'Électrik': 'Electric',
            'Glace': 'Ice',
            'Combat': 'Fighting',
            'Poison': 'Poison',
            'Sol': 'Ground',
            'Vol': 'Flying',
            'Psy': 'Psychic',
            'Insecte': 'Bug',
            'Roche': 'Rock',
            'Spectre': 'Ghost',
            'Dragon': 'Dragon',
            'Ténèbres': 'Dark',
            'Acier': 'Steel',
            'Fée': 'Fairy'
        }
    }
};

/**
 * Génère l'URL du sprite Pokémon avec gestion d'erreur intégrée
 * @param {number} id - ID National du Pokémon
 * @param {boolean} isShiny - État shiny
 * @param {boolean} isBack - Sprite de dos (pour Buddy)
 * @returns {string} URL complète
 */
function getSpriteUrl(id, isShiny = false, isBack = false) {
    if (isBack) {
        const baseUrl = isShiny ? ASSET_SOURCES.POKEMON.BACK_SHINY : ASSET_SOURCES.POKEMON.BACK;
        return `${baseUrl}${id}.gif`;
    }
    
    const baseUrl = isShiny ? ASSET_SOURCES.POKEMON.SHINY : ASSET_SOURCES.POKEMON.ANIMATED;
    return `${baseUrl}${id}.gif`;
}

/**
 * Génère l'URL du sprite statique (fallback)
 * @param {number} id - ID National du Pokémon
 * @returns {string} URL complète
 */
function getStaticSpriteUrl(id) {
    return `${ASSET_SOURCES.POKEMON.STATIC}${id}.png`;
}

/**
 * Génère l'URL de l'icône d'objet
 * @param {string} itemId - ID interne de l'objet (ex: 'pokeball')
 * @returns {string} URL complète
 */
function getItemIconUrl(itemId) {
    const apiName = ASSET_SOURCES.ITEMS.MAPPING[itemId] || itemId;
    return `${ASSET_SOURCES.ITEMS.BASE}${apiName}.png`;
}

/**
 * Génère l'URL de l'icône de type
 * @param {string} typeFr - Nom du type en français (ex: 'Feu')
 * @returns {string} URL complète
 */
function getTypeIconUrl(typeFr) {
    const typeEn = ASSET_SOURCES.TYPES.MAPPING[typeFr] || typeFr;
    return `${ASSET_SOURCES.TYPES.SHOWDOWN}${typeEn}.png`;
}

// Export pour utilisation globale
if (typeof window !== 'undefined') {
    window.ASSET_SOURCES = ASSET_SOURCES;
    window.getSpriteUrl = getSpriteUrl;
    window.getStaticSpriteUrl = getStaticSpriteUrl;
    window.getItemIconUrl = getItemIconUrl;
    window.getTypeIconUrl = getTypeIconUrl;
}





