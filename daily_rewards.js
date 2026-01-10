// ==========================================
// SYSTÈME DE RÉCOMPENSES QUOTIDIENNES (DAILY LOGIN)
// ==========================================

class DailyLoginSystem {
    constructor() {
        this.rewardsConfig = [
            { day: 1, type: 'coins', amount: 500, label: '500 Coins', icon: '💰' },
            { day: 2, type: 'item', id: 'pokeball', amount: 5, label: '5 Pokéballs', icon: '🔴' },
            { day: 3, type: 'coins', amount: 1000, label: '1000 Coins', icon: '💰' },
            { day: 4, type: 'item', id: 'superball', amount: 2, label: '2 Super Balls', icon: '🔵' },
            { day: 5, type: 'coins', amount: 2000, label: '2000 Coins', icon: '💰' },
            { day: 6, type: 'mixed', rewards: [{ type: 'item', id: 'hyperball', amount: 1 }, { type: 'item', id: 'framby', amount: 1 }], label: 'Hyper Ball + Framby', icon: '🎁' },
            { day: 7, type: 'special', label: 'Cadeau Mystère', icon: '👑' }
        ];
    }

    // Vérifie si un login est nécessaire aujourd'hui
    checkLogin() {
        const lastLoginDate = localStorage.getItem('poke_last_login_date');
        const today = new Date().toDateString();

        if (lastLoginDate !== today) {
            // C'est un nouveau jour !
            return true;
        }
        return false;
    }

    // Récupère l'état actuel de la série
    getStreakState() {
        let streak = parseInt(localStorage.getItem('poke_login_streak') || '0');
        const lastLoginDate = localStorage.getItem('poke_last_login_date');
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Si la dernière connexion n'était pas hier ni aujourd'hui, la série est brisée
        // (Sauf si c'est la toute première connexion)
        if (lastLoginDate && lastLoginDate !== today.toDateString() && lastLoginDate !== yesterday.toDateString()) {
            streak = 0;
        }

        // Cycle de 7 jours
        return streak % 7;
    }

    // Affiche le modal de récompense
    showRewardModal() {
        const currentStreakIndex = this.getStreakState(); // 0 à 6
        const modal = document.getElementById('daily-login-modal');
        const gridContainer = document.getElementById('daily-login-grid');

        if (!modal || !gridContainer) return;

        // Générer la grille
        gridContainer.innerHTML = '';
        this.rewardsConfig.forEach((reward, index) => {
            const isClaimed = index < currentStreakIndex;
            const isToday = index === currentStreakIndex;
            const isLocked = index > currentStreakIndex;

            let statusClass = 'locked';
            if (isClaimed) statusClass = 'claimed';
            if (isToday) statusClass = 'today';

            const dayElement = document.createElement('div');
            dayElement.className = `daily-reward-card ${statusClass}`;
            dayElement.innerHTML = `
                <div class="day-number">J${index + 1}</div>
                <div class="reward-icon">${reward.icon}</div>
                <div class="reward-label">${reward.label}</div>
                ${isClaimed ? '<div class="check-mark">✓</div>' : ''}
            `;

            if (isToday) {
                dayElement.onclick = () => this.claimReward(index);
                // Ajouter un bouton de réclamation explicite pour UX
                const claimBtn = document.getElementById('daily-claim-btn');
                if (claimBtn) {
                    claimBtn.onclick = () => {
                        this.claimReward(index);
                        modal.style.display = 'none';
                    };
                }
            }

            gridContainer.appendChild(dayElement);
        });

        // Afficher le modal
        modal.style.display = 'flex';
    }

    // Réclame la récompense du jour
    claimReward(dayIndex) {
        const reward = this.rewardsConfig[dayIndex];

        // Logique de distribution
        if (reward.type === 'coins') {
            window.addCoins(reward.amount);
            window.showFloatingText(`+${reward.amount} Coins!`, window.innerWidth / 2, window.innerHeight / 2, '#FFD700');
        } else if (reward.type === 'item') {
            window.addItemToInventory(reward.id, reward.amount);
            window.showFloatingText(`+${reward.amount} ${window.getItemName(reward.id)}!`, window.innerWidth / 2, window.innerHeight / 2, '#FFFFFF');
        } else if (reward.type === 'mixed' && reward.rewards) {
            reward.rewards.forEach(r => {
                if (r.type === 'item') window.addItemToInventory(r.id, r.amount);
            });
            window.showFloatingText(`Pack de soutien reçu!`, window.innerWidth / 2, window.innerHeight / 2, '#00FF00');
        } else if (reward.type === 'special') {
            // Logique spéciale pour le J7 (ex: ticket expédition)
            window.addItemToInventory('mystery_egg', 1); // Exemple simple
            window.showFloatingText(`Œuf Mystère reçu!`, window.innerWidth / 2, window.innerHeight / 2, '#FF00FF');
        }

        // Sauvegarde
        const today = new Date().toDateString();
        localStorage.setItem('poke_last_login_date', today);
        let currentStreak = parseInt(localStorage.getItem('poke_login_streak') || '0');
        localStorage.setItem('poke_login_streak', (currentStreak + 1).toString());

        // Fermer le modal visuellement s'il est encore ouvert (handled by onclick usually)
        const modal = document.getElementById('daily-login-modal');
        if (modal) modal.style.display = 'none';

        // Son
        if (window.playSound) window.playSound('levelUp'); // Utilise un son positif existant

        console.log(`🎁 Daily Reward Day ${dayIndex + 1} claimed!`);
    }
}

// Export pour utilisation globale
window.DailyLoginSystem = DailyLoginSystem;
