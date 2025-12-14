// ===== POKÉ-POKER MÉTA-SHOP =====

// Attendre que gameState soit défini
if (typeof gameState !== 'undefined') {
    if (!gameState.poker) gameState.poker = {};
    if (!gameState.poker.metaShop) gameState.poker.metaShop = { selectedDeck: null, unlockedDecks: [] };
}

const POKER_DECKS = [
    { 
        id: 'red_deck', 
        name: 'Deck Rouge', 
        cost: 50, 
        currency: 'shiny_tokens', 
        icon: '🔴',
        effect: 'Start with +1 Discard',
        description: 'Commencez chaque run avec une défausse supplémentaire'
    },
    { 
        id: 'plasma_deck', 
        name: 'Deck Plasma', 
        cost: 100, 
        currency: 'shiny_tokens', 
        icon: '⚡',
        effect: 'Electric cards give x1.5 Mult',
        description: 'Les cartes Électrik donnent x1.5 multiplicateur'
    },
    { 
        id: 'golden_deck', 
        name: 'Deck Doré', 
        cost: 200, 
        currency: 'shiny_tokens', 
        icon: '✨',
        effect: '+10% Shiny Rate in Poker',
        description: '+10% de chance de trouver des cartes Shiny'
    },
    { 
        id: 'legendary_deck', 
        name: 'Deck Légendaire', 
        cost: 150, 
        currency: 'shiny_tokens', 
        icon: '👑',
        effect: 'Start with 1 Legendary Joker',
        description: 'Commencez avec 1 Joker Légendaire aléatoire'
    },
    { 
        id: 'shard_deck', 
        name: 'Deck Shard', 
        cost: 500, 
        currency: 'shards', 
        icon: '💎',
        effect: '+50% Shards earned',
        description: '+50% de Shards gagnés à la fin des runs'
    }
];

window.showPokerMetaShop = function() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.cssText = 'display: flex !important; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 10000; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;';
    
    const unlockedDecks = gameState.poker.metaShop?.unlockedDecks || [];
    const selectedDeck = gameState.poker.metaShop?.selectedDeck || null;
    const shinyTokens = gameState.shinyTokens || 0;
    const shards = gameState.rogueMeta?.shards || 0;
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, rgba(30, 30, 50, 0.98), rgba(20, 20, 40, 0.98)); border-radius: 20px; padding: 40px; max-width: 800px; width: 100%; border: 2px solid rgba(125, 95, 255, 0.5);">
            <button onclick="this.closest('.modal').remove()" style="position: absolute; top: 15px; right: 15px; background: rgba(255,255,255,0.2); border: none; color: white; font-size: 24px; cursor: pointer; width: 35px; height: 35px; border-radius: 50%;">×</button>
            
            <h2 style="color: white; text-align: center; margin-bottom: 30px; font-size: 28px;">🃏 Méta-Shop Poké-Poker</h2>
            
            <div style="display: flex; justify-content: center; gap: 30px; margin-bottom: 30px; flex-wrap: wrap;">
                <div style="text-align: center; background: rgba(255, 215, 0, 0.2); padding: 15px 25px; border-radius: 10px; border: 2px solid #FFD700;">
                    <div style="color: #FFD700; font-size: 24px; font-weight: bold;">✨</div>
                    <div style="color: white; font-size: 18px; font-weight: bold;">${shinyTokens}</div>
                    <div style="color: rgba(255,255,255,0.7); font-size: 12px;">Shiny Tokens</div>
                </div>
                <div style="text-align: center; background: rgba(147, 51, 234, 0.2); padding: 15px 25px; border-radius: 10px; border: 2px solid #9333ea;">
                    <div style="color: #9333ea; font-size: 24px; font-weight: bold;">💎</div>
                    <div style="color: white; font-size: 18px; font-weight: bold;">${shards}</div>
                    <div style="color: rgba(255,255,255,0.7); font-size: 12px;">Shards</div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                ${POKER_DECKS.map(deck => {
                    const isUnlocked = unlockedDecks.includes(deck.id);
                    const isSelected = selectedDeck === deck.id;
                    const canAfford = deck.currency === 'shiny_tokens' ? shinyTokens >= deck.cost : shards >= deck.cost;
                    
                    return `
                        <div style="
                            background: ${isSelected ? 'rgba(125, 95, 255, 0.3)' : isUnlocked ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.3)'};
                            border: 2px solid ${isSelected ? '#7d5fff' : isUnlocked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'};
                            border-radius: 12px;
                            padding: 20px;
                            text-align: center;
                            cursor: ${isUnlocked ? 'pointer' : canAfford ? 'pointer' : 'not-allowed'};
                            opacity: ${isUnlocked || canAfford ? '1' : '0.5'};
                            position: relative;
                        " onclick="${isUnlocked ? `selectPokerDeck('${deck.id}')` : canAfford ? `buyPokerDeck('${deck.id}')` : ''}">
                            ${isSelected ? '<div style="position: absolute; top: 5px; right: 5px; font-size: 1.5em;">✅</div>' : ''}
                            ${!isUnlocked ? '<div style="position: absolute; top: 5px; right: 5px; font-size: 1.5em;">🔒</div>' : ''}
                            
                            <div style="font-size: 3em; margin-bottom: 10px;">${deck.icon}</div>
                            <div style="color: white; font-weight: 600; margin-bottom: 5px; font-size: 16px;">${deck.name}</div>
                            <div style="color: rgba(255,255,255,0.6); font-size: 12px; margin-bottom: 10px;">${deck.description}</div>
                            
                            ${!isUnlocked ? `
                                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
                                    <div style="color: ${deck.currency === 'shiny_tokens' ? '#FFD700' : '#9333ea'}; font-weight: bold;">
                                        ${deck.cost} ${deck.currency === 'shiny_tokens' ? '✨' : '💎'}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
};

window.buyPokerDeck = function(deckId) {
    const deck = POKER_DECKS.find(d => d.id === deckId);
    if (!deck) return;
    
    const unlockedDecks = gameState.poker.metaShop?.unlockedDecks || [];
    if (unlockedDecks.includes(deckId)) {
        selectPokerDeck(deckId);
        return;
    }
    
    const shinyTokens = gameState.shinyTokens || 0;
    const shards = gameState.rogueMeta?.shards || 0;
    
    if (deck.currency === 'shiny_tokens' && shinyTokens < deck.cost) {
        showToast('Pas assez de Shiny Tokens !', 'error');
        return;
    }
    if (deck.currency === 'shards' && shards < deck.cost) {
        showToast('Pas assez de Shards !', 'error');
        return;
    }
    
    if (deck.currency === 'shiny_tokens') {
        gameState.shinyTokens = shinyTokens - deck.cost;
    } else {
        gameState.rogueMeta.shards = shards - deck.cost;
    }
    
    if (!gameState.poker.metaShop) gameState.poker.metaShop = { selectedDeck: null, unlockedDecks: [] };
    if (!gameState.poker.metaShop.unlockedDecks) gameState.poker.metaShop.unlockedDecks = [];
    gameState.poker.metaShop.unlockedDecks.push(deckId);
    gameState.poker.metaShop.selectedDeck = deckId;
    
    saveGame();
    showToast(`✅ ${deck.name} débloqué et équipé !`, 'success');
    document.querySelector('.modal.active')?.remove();
    showPokerMetaShop();
};

window.selectPokerDeck = function(deckId) {
    if (!gameState.poker.metaShop) gameState.poker.metaShop = { selectedDeck: null, unlockedDecks: [] };
    const unlockedDecks = gameState.poker.metaShop.unlockedDecks || [];
    
    if (!unlockedDecks.includes(deckId)) {
        showToast('Deck non débloqué !', 'error');
        return;
    }
    
    gameState.poker.metaShop.selectedDeck = deckId;
    saveGame();
    showToast(`✅ ${POKER_DECKS.find(d => d.id === deckId)?.name || deckId} équipé !`, 'success');
    document.querySelector('.modal.active')?.remove();
    showPokerMetaShop();
};

// Fonction pour appliquer les effets du deck au début d'une run
window.applyPokerDeckEffects = function(runState) {
    const selectedDeck = gameState.poker?.metaShop?.selectedDeck;
    if (!selectedDeck) return;
    
    const deck = POKER_DECKS.find(d => d.id === selectedDeck);
    if (!deck) return;
    
    switch(deck.id) {
        case 'red_deck':
            runState.discards_remaining = (runState.discards_remaining || 2) + 1;
            break;
        case 'legendary_deck':
            // Ajouter un joker légendaire aléatoire
            const legendaryJokers = ['mew_eye', 'arceus_blessing']; // Exemple
            if (legendaryJokers.length > 0) {
                const randomJoker = legendaryJokers[Math.floor(Math.random() * legendaryJokers.length)];
                if (!runState.active_jokers) runState.active_jokers = [];
                runState.active_jokers.push({ id: randomJoker, level: 1 });
            }
            break;
        // Les autres effets sont appliqués dans le code du jeu (multipliers, etc.)
    }
};

