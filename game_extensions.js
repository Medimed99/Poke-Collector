// ===== OBJETS TENUS (HELD ITEMS) & SUCCÈS CACHÉS =====

// Initialiser les objets tenus dans gameState (attendre que gameState soit défini)
if (typeof window !== 'undefined' && window.gameState) {
    if (!window.gameState.buddy) window.gameState.buddy = { activeBuddyId: null, buddies: {} };
    if (!window.gameState.buddy.heldItems) window.gameState.buddy.heldItems = {};
}

// Catalogue des objets tenus
const HELD_ITEMS = {
    poker_coin_boost: {
        name: 'Pièce Rune',
        desc: 'Double les récompenses de Poké-Poker',
        icon: '🪙',
        rarity: 'rare'
    },
    rogue_ghost_life: {
        name: 'Restes',
        desc: '+1 vie fantôme au début de chaque Expédition',
        icon: '👻',
        rarity: 'uncommon'
    },
    capture_berry_boost: {
        name: 'Baie Miracle',
        desc: '+10% taux de capture permanent',
        icon: '🍓',
        rarity: 'uncommon'
    },
    shiny_charm_plus: {
        name: 'Charm Shiny+',
        desc: '+0.5% chance Shiny (stack avec Lucky Charm)',
        icon: '✨',
        rarity: 'super_rare'
    },
    xp_amplifier: {
        name: 'Amplificateur XP',
        desc: '+25% XP gagné',
        icon: '📈',
        rarity: 'rare'
    }
};

// Fonction pour obtenir l'effet d'un objet tenu
window.getBuddyHeldItemEffect = function(itemId) {
    if (typeof window === 'undefined' || !window.gameState) return null;
    const buddyId = window.gameState.buddy?.activeBuddyId;
    if (!buddyId) return null;
    const heldItem = window.gameState.buddy.heldItems?.[buddyId];
    return heldItem === itemId;
};

// Fonction pour équiper un objet tenu
window.equipHeldItem = function(itemId) {
    if (typeof window === 'undefined' || !window.gameState) return;
    const buddyId = window.gameState.buddy?.activeBuddyId;
    if (!buddyId) {
        if (typeof showToast === 'function') showToast('Aucun Buddy sélectionné !', 'error');
        return;
    }
    
    if (!window.gameState.buddy.heldItems) window.gameState.buddy.heldItems = {};
    window.gameState.buddy.heldItems[buddyId] = itemId;
    if (typeof saveGame === 'function') saveGame();
    if (typeof showToast === 'function') showToast(`✅ ${HELD_ITEMS[itemId]?.name || itemId} équipé !`, 'success');
    
    // Rafraîchir l'affichage du Buddy
    if (window.showBuddyDetail) showBuddyDetail();
};

// Fonction pour retirer un objet tenu
window.unequipHeldItem = function() {
    if (typeof window === 'undefined' || !window.gameState) return;
    const buddyId = window.gameState.buddy?.activeBuddyId;
    if (!buddyId) return;
    
    if (window.gameState.buddy.heldItems) {
        delete window.gameState.buddy.heldItems[buddyId];
        if (typeof saveGame === 'function') saveGame();
        if (typeof showToast === 'function') showToast('Objet retiré', 'info');
        if (window.showBuddyDetail) showBuddyDetail();
    }
};

// ===== SUCCÈS CACHÉS =====

if (typeof window !== 'undefined' && window.gameState) {
    if (!window.gameState.hiddenAchievements) window.gameState.hiddenAchievements = [];
}

const HIDDEN_ACHIEVEMENTS = {
    perfect_capture_10: {
        name: 'Maître du Timing',
        desc: '10 captures parfaites (Skill Shot x1.25)',
        icon: '🎯',
        reward: { coins: 5000, shiny_tokens: 5 }
    },
    perfect_capture_50: {
        name: 'Légende du Timing',
        desc: '50 captures parfaites',
        icon: '👑',
        reward: { coins: 25000, shiny_tokens: 25 }
    },
    legendary_first_try: {
        name: 'Chance Inouïe',
        desc: 'Capturer un Légendaire au premier essai',
        icon: '🍀',
        reward: { coins: 10000, shiny_tokens: 10 }
    },
    shiny_streak_5: {
        name: 'Chaîne Dorée',
        desc: '5 Shinies d\'affilée',
        icon: '✨',
        reward: { coins: 15000, shiny_tokens: 15 }
    },
    poker_no_discard: {
        name: 'Perfectionniste',
        desc: 'Finir une run Poké-Poker sans défausse',
        icon: '🃏',
        reward: { coins: 20000, shiny_tokens: 20 }
    }
};

// Fonction pour vérifier les succès cachés
window.checkHiddenAchievements = function(pokemonId, ballType, resultType) {
    if (typeof window === 'undefined' || !window.gameState) return;
    const gameState = window.gameState; // Alias local pour éviter de répéter window.gameState
    const achievements = [];
    
    // Perfect capture
    if (resultType === 'perfect') {
        gameState.perfectCaptures = (gameState.perfectCaptures || 0) + 1;
        if (gameState.perfectCaptures === 10 && !gameState.hiddenAchievements.includes('perfect_capture_10')) {
            achievements.push('perfect_capture_10');
        }
        if (gameState.perfectCaptures === 50 && !gameState.hiddenAchievements.includes('perfect_capture_50')) {
            achievements.push('perfect_capture_50');
        }
    }
    
    // Légendaire premier essai
    if (resultType === 'success' && typeof getRarity === 'function' && getRarity(pokemonId) === 'legendary') {
        const captureCount = gameState.capturedCount[pokemonId] || 0;
        if (captureCount === 1 && !gameState.hiddenAchievements.includes('legendary_first_try')) {
            achievements.push('legendary_first_try');
        }
    }
    
    // Shiny streak
    if (resultType === 'success' && typeof currentPokemon !== 'undefined' && currentPokemon?.isShiny) {
        gameState.shinyStreak = (gameState.shinyStreak || 0) + 1;
        if (gameState.shinyStreak >= 5 && !gameState.hiddenAchievements.includes('shiny_streak_5')) {
            achievements.push('shiny_streak_5');
        }
    } else if (resultType === 'success' && typeof currentPokemon !== 'undefined' && !currentPokemon?.isShiny) {
        gameState.shinyStreak = 0;
    }
    
    // Débloquer les succès
    achievements.forEach(achievementId => {
        if (!gameState.hiddenAchievements.includes(achievementId)) {
            gameState.hiddenAchievements.push(achievementId);
            const achievement = HIDDEN_ACHIEVEMENTS[achievementId];
            if (achievement) {
                const reward = achievement.reward;
                if (reward.coins) gameState.coins += reward.coins;
                if (reward.shiny_tokens) gameState.shinyTokens = (gameState.shinyTokens || 0) + reward.shiny_tokens;
                
                if (typeof showToast === 'function') {
                    showToast(`🏆 ${achievement.icon} ${achievement.name} débloqué !\n+${reward.coins || 0} coins${reward.shiny_tokens ? `\n+${reward.shiny_tokens} Shiny Tokens` : ''}`, 'success');
                }
                if (typeof saveGame === 'function') saveGame();
            }
        }
    });
};

