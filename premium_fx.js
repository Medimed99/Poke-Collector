/**
 * SYSTÈME DE PARTICULES & FX PREMIUM (V9.0)
 * À inclure dans index.html avant app.js
 */
const FX = {
    // Explosion de confettis (pour Level Up, Shiny, Jackpot)
    confetti: (x, y, count = 50, colors = ['#FFD700', '#FF4500', '#00BFFF', '#32CD32']) => {
        // Si x/y non fournis, centre de l'écran
        const originX = x || window.innerWidth / 2;
        const originY = y || window.innerHeight / 2;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = Math.random() * 8 + 4 + 'px';
            particle.style.height = Math.random() * 5 + 3 + 'px';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = originX + 'px';
            particle.style.top = originY + 'px';
            particle.style.borderRadius = '2px';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '10002';
            
            // Physique aléatoire
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 15 + 5; // Vitesse
            const tx = Math.cos(angle) * velocity * 20; // Distance X
            const ty = Math.sin(angle) * velocity * 20; // Distance Y
            const rotation = Math.random() * 720;
            
            // Animation JS native pour performance
            const anim = particle.animate([
                { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) rotate(${rotation}deg)`, opacity: 0 }
            ], {
                duration: 1000 + Math.random() * 1000,
                easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
            });
            
            document.body.appendChild(particle);
            anim.onfinish = () => particle.remove();
        }
    },

    // Explosion de pièces (pour Gains importants)
    coins: (amount = 10) => {
        // Limiter pour perf
        const count = Math.min(amount, 30); 
        for (let i = 0; i < count; i++) {
            const coin = document.createElement('div');
            coin.textContent = '💰';
            coin.style.position = 'fixed';
            coin.style.fontSize = '24px';
            coin.style.left = (Math.random() * 80 + 10) + 'vw';
            coin.style.top = '-50px';
            coin.style.zIndex = '10001';
            coin.style.pointerEvents = 'none';
            
            const duration = 1500 + Math.random() * 1000;
            
            const anim = coin.animate([
                { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
                { transform: `translateY(100vh) rotate(${Math.random() * 360}deg)`, opacity: 0.8 }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
                delay: Math.random() * 500
            });
            
            document.body.appendChild(coin);
            anim.onfinish = () => coin.remove();
        }
    },
    
    // Onde de choc visuelle (pour Capture critique ou Boss)
    shockwave: (element) => {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        
        const wave = document.createElement('div');
        wave.style.position = 'fixed';
        wave.style.left = cx + 'px';
        wave.style.top = cy + 'px';
        wave.style.width = '10px';
        wave.style.height = '10px';
        wave.style.borderRadius = '50%';
        wave.style.border = '2px solid rgba(255, 255, 255, 0.8)';
        wave.style.transform = 'translate(-50%, -50%)';
        wave.style.pointerEvents = 'none';
        wave.style.zIndex = '9998';
        
        const anim = wave.animate([
            { width: '10px', height: '10px', opacity: 0.8, borderWidth: '5px' },
            { width: '300px', height: '300px', opacity: 0, borderWidth: '0px' }
        ], {
            duration: 600,
            easing: 'ease-out'
        });
        
        document.body.appendChild(wave);
        anim.onfinish = () => wave.remove();
    },

    // Secousse d'écran
    screenShake: () => {
        document.body.classList.add('shake-screen');
        setTimeout(() => document.body.classList.remove('shake-screen'), 400);
    },

    // Étoiles scintillantes (pour Shiny)
    stars: (x, y, count = 20) => {
        const originX = x || window.innerWidth / 2;
        const originY = y || window.innerHeight / 2;
        
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.textContent = '✨';
            star.style.position = 'fixed';
            star.style.fontSize = (Math.random() * 20 + 15) + 'px';
            star.style.left = originX + 'px';
            star.style.top = originY + 'px';
            star.style.zIndex = '10003';
            star.style.pointerEvents = 'none';
            
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 150 + 50;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            const anim = star.animate([
                { transform: 'translate(0, 0) scale(0) rotate(0deg)', opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) scale(1.5) rotate(360deg)`, opacity: 0 }
            ], {
                duration: 800 + Math.random() * 400,
                easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
            });
            
            document.body.appendChild(star);
            anim.onfinish = () => star.remove();
        }
    }
};

// Exposer globalement
window.FX = FX;




