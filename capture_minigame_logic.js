// ===== CAPTURE MINI-GAME (SKILL SHOT) =====
// Bonus sans pénalité : x1.0 si raté, x1.1 à x1.25 si réussi

let captureMinigameActive = false;
let captureMinigameBallType = null;

window.startCaptureMinigame = function(ballType) {
    if (captureMinigameActive || !currentPokemon) return;
    
    // Vérifier si le taux de capture est déjà à 100% (skip le mini-jeu)
    let captureRate = calculateCaptureRate(ballType, currentPokemon.rarity, usingFramby);
    if (ballType === 'masterball' || captureRate >= 1.0) {
        // Taux à 100%, on skip directement le mini-jeu
        attemptCapture(ballType, 1.0);
        return;
    }
    
    captureMinigameBallType = ballType;
    captureMinigameActive = true;
    
    // Créer la modale du mini-jeu
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.cssText = 'display: flex !important; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 10000; align-items: center; justify-content: center;';
    modal.id = 'capture-minigame-modal';
    
    const targetZone = { min: 40, max: 60 }; // Zone cible en pourcentage
    let currentPosition = 50;
    let direction = 1;
    let speed = 2;
    let skillBonus = 1.0;
    let gameStarted = false;
    let gameEnded = false;
    
    const updateUI = () => {
        const bar = modal.querySelector('.skill-bar-fill');
        const indicator = modal.querySelector('.skill-indicator');
        const bonusText = modal.querySelector('.bonus-text');
        
        if (bar) bar.style.width = currentPosition + '%';
        if (indicator) indicator.style.left = currentPosition + '%';
        if (bonusText) {
            if (currentPosition >= targetZone.min && currentPosition <= targetZone.max) {
                const zoneSize = targetZone.max - targetZone.min;
                const center = (targetZone.min + targetZone.max) / 2;
                const distanceFromCenter = Math.abs(currentPosition - center);
                const perfectRatio = 1 - (distanceFromCenter / (zoneSize / 2));
                skillBonus = 1.0 + (perfectRatio * 0.25); // x1.0 à x1.25
                bonusText.textContent = `Bonus: x${skillBonus.toFixed(2)}`;
                bonusText.style.color = '#4ade80';
            } else {
                skillBonus = 1.0;
                bonusText.textContent = 'Bonus: x1.0';
                bonusText.style.color = '#9ca3af';
            }
        }
    };
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, rgba(30, 30, 50, 0.98), rgba(20, 20, 40, 0.98)); border-radius: 20px; padding: 40px; max-width: 500px; width: 90%; text-align: center; border: 2px solid rgba(125, 95, 255, 0.5);">
            <h2 style="color: white; margin-bottom: 30px; font-size: 24px;">🎯 Skill Shot</h2>
            <p style="color: rgba(255,255,255,0.7); margin-bottom: 20px;">Cliquez quand l'indicateur est dans la zone verte !</p>
            
            <div style="position: relative; width: 100%; height: 60px; background: rgba(0,0,0,0.5); border-radius: 10px; margin: 30px 0; overflow: hidden;">
                <div style="position: absolute; left: ${targetZone.min}%; width: ${targetZone.max - targetZone.min}%; height: 100%; background: rgba(34, 197, 94, 0.3); border: 2px solid #22c55e;"></div>
                <div class="skill-bar-fill" style="position: absolute; left: 0; top: 0; height: 100%; width: ${currentPosition}%; background: linear-gradient(90deg, #7d5fff, #a855f7); transition: width 0.05s linear;"></div>
                <div class="skill-indicator" style="position: absolute; top: 0; left: ${currentPosition}%; width: 4px; height: 100%; background: #fff; box-shadow: 0 0 10px #fff; transform: translateX(-50%);"></div>
            </div>
            
            <div class="bonus-text" style="color: #9ca3af; font-size: 18px; font-weight: bold; margin-bottom: 30px;">Bonus: x1.0</div>
            
            <button id="capture-trigger-btn" style="padding: 15px 40px; background: linear-gradient(135deg, #7d5fff, #20d5d2); border: none; color: white; border-radius: 10px; font-weight: bold; font-size: 18px; cursor: pointer; width: 100%;">CAPTURER MAINTENANT</button>
            
            <p style="color: rgba(255,255,255,0.5); margin-top: 20px; font-size: 12px;">Pas de pénalité si vous ratez !</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    updateUI();
    
    const triggerBtn = modal.querySelector('#capture-trigger-btn');
    const gameLoop = () => {
        if (gameEnded) return;
        
        if (gameStarted && !gameEnded) {
            currentPosition += direction * speed;
            if (currentPosition >= 100) { direction = -1; speed += 0.1; }
            if (currentPosition <= 0) { direction = 1; speed += 0.1; }
            updateUI();
        }
        
        requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
    
    triggerBtn.addEventListener('click', () => {
        if (gameEnded) return;
        gameEnded = true;
        captureMinigameActive = false;
        
        // Animation de résultat
        const resultText = modal.querySelector('.bonus-text');
        if (skillBonus > 1.0) {
            resultText.textContent = `✨ Parfait ! Bonus: x${skillBonus.toFixed(2)}`;
            resultText.style.color = '#22c55e';
            resultText.style.fontSize = '24px';
        } else {
            resultText.textContent = 'Bonus: x1.0';
            resultText.style.color = '#9ca3af';
        }
        
        setTimeout(() => {
            modal.remove();
            attemptCapture(captureMinigameBallType, skillBonus);
        }, 1000);
    });
    
    // Démarrer le jeu après un court délai
    setTimeout(() => {
        gameStarted = true;
        triggerBtn.textContent = 'CAPTURER MAINTENANT';
    }, 500);
};




