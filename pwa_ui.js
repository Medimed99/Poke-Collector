/* ==========================================
   PWA UI - Gestion de l'installation
   ========================================== */
let deferredInstallPrompt = null;

// 1. Écouter l'événement d'installation (Android/PC)
window.addEventListener('beforeinstallprompt', (e) => {
    // Empêcher la mini-infobar automatique de Chrome
    e.preventDefault();
    // Sauvegarder l'événement pour plus tard
    deferredInstallPrompt = e;
    console.log('👍 PWA : Installation possible détectée');
});

// 2. Fonction principale pour afficher la modale
window.showInstallModal = function() {
    // Vérifier si déjà installé (Standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
        console.log('✅ Déjà en mode App');
        return;
    }

    // Vérifier si l'utilisateur a déjà refusé récemment (cookie/localstorage)
    const lastPrompt = localStorage.getItem('pwa_prompt_date');
    const now = Date.now();
    // Ne pas redemander avant 3 jours si fermé
    if (lastPrompt && (now - parseInt(lastPrompt)) < 3 * 24 * 60 * 60 * 1000) {
        return;
    }

    // Détection basique iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    const modal = document.createElement('div');
    modal.className = 'modal active pwa-modal';
    modal.style.cssText = 'display: flex !important; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 20000; align-items: center; justify-content: center;';

    // Contenu adapté selon la plateforme
    let contentHTML = '';

    if (isIOS) {
        // Version iOS (Tutoriel visuel)
        contentHTML = `
            <div style="margin-bottom: 20px; font-size: 1.1em; line-height: 1.6; color: rgba(255,255,255,0.9);">
                Pour une meilleure expérience (Plein écran, Pas de bugs), installez l'application :
            </div>
            <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 20px; text-align: left; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    <span style="font-size: 24px; margin-right: 15px;">1️⃣</span>
                    <span>Appuyez sur le bouton <strong>Partager</strong> <span style="font-size: 1.2em; vertical-align: middle;">📤</span> en bas.</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <span style="font-size: 24px; margin-right: 15px;">2️⃣</span>
                    <span>Cherchez et appuyez sur <strong>"Sur l'écran d'accueil"</strong> ⊞.</span>
                </div>
            </div>
            <div style="font-size: 0.9em; color: #FFD700; font-style: italic;">
                Cela créera une icône d'application sur votre téléphone.
            </div>
        `;
    } else {
        // Version Android / Desktop (Bouton automatique)
        contentHTML = `
            <div style="margin-bottom: 20px; font-size: 1.1em; line-height: 1.6; color: rgba(255,255,255,0.9);">
                Installez l'application pour jouer en <strong>Plein Écran</strong>, hors-ligne et sans barre de navigation !
            </div>
            <div id="pwa-install-area">
                <button onclick="triggerInstall()" class="btn btn--primary btn--large" style="width: 100%; padding: 20px; font-size: 1.2em; background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 0 20px rgba(16,185,129,0.4); animation: pulse 2s infinite;">📱 Installer l'App</button>
            </div>
        `;
    }

    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px; border-radius: 20px; width: 90%; max-width: 450px; border: 2px solid #7d5fff; text-align: center; box-shadow: 0 0 50px rgba(125, 95, 255, 0.3); position: relative;">
            
            <div style="font-size: 4em; margin-bottom: 20px; animation: bounce 2s infinite;">📲</div>
            <h2 style="color: #fff; margin-bottom: 20px; font-size: 1.8em; font-weight: bold;">Meilleure Expérience</h2>
            
            ${contentHTML}
            <button onclick="closePwaModal()" style="margin-top: 30px; background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; text-decoration: underline; font-size: 0.9em;">
                Non merci, je préfère jouer sur le navigateur
            </button>
        </div>
    `;

    document.body.appendChild(modal);
};

// Fonction déclenchée par le bouton (Android/PC)
window.triggerInstall = async function() {
    if (!deferredInstallPrompt) {
        alert("L'installation automatique n'est pas supportée par votre navigateur. Utilisez le menu pour 'Installer l'application'.");
        return;
    }
    
    // Afficher la demande native
    deferredInstallPrompt.prompt();
    
    // Attendre la réponse
    const { outcome } = await deferredInstallPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // On ne peut pas réutiliser l'événement
    deferredInstallPrompt = null;
    
    // Fermer notre modale
    closePwaModal();
};

window.closePwaModal = function() {
    const modal = document.querySelector('.pwa-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    }
    // Enregistrer la date de fermeture pour ne pas spammer
    localStorage.setItem('pwa_prompt_date', Date.now());
    // Compléter l'étape PWA dans le système séquentiel si disponible
    if (typeof completeStep === 'function') {
        completeStep('pwa');
    }
};

