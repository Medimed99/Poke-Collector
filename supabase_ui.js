/* ==========================================
   SUPABASE UI - Interface d'authentification
   ========================================== */

function renderAuthModal() {
    // Supprimer les modales d'auth existantes
    const existing = document.querySelector('.auth-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal active auth-modal';
    modal.style.cssText = 'display: flex !important; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 20000; align-items: center; justify-content: center;';
    
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, rgba(26, 26, 46, 0.98), rgba(22, 33, 62, 0.98)); padding: 30px; border-radius: 20px; width: 90%; max-width: 400px; border: 2px solid rgba(255, 215, 0, 0.3); text-align: center; box-shadow: 0 8px 40px rgba(125, 95, 255, 0.5); animation: elegantFadeIn 0.5s ease-out;">
            <h2 style="color: #ffd700; margin-bottom: 20px; font-size: 1.8em; text-shadow: 0 0 20px rgba(255, 215, 0, 0.5); font-weight: 700;">💾 Archivage des Données</h2>
            <p style="color: rgba(255,255,255,0.8); margin-bottom: 20px; font-size: 0.9em; line-height: 1.5;">Archivez les données récupérées pour les synchroniser sur tous vos terminaux.</p>
            
            <div id="login-form">
                <input 
                    type="email" 
                    id="auth-email" 
                    placeholder="Email" 
                    style="width: 100%; padding: 12px; margin-bottom: 10px; border-radius: 10px; border: 2px solid rgba(102, 126, 234, 0.5); background: rgba(0,0,0,0.3); color: white; font-size: 1em; box-sizing: border-box; transition: all 0.3s;"
                    autocomplete="email"
                    onfocus="this.style.borderColor='rgba(102, 126, 234, 0.8)'; this.style.boxShadow='0 0 15px rgba(102, 126, 234, 0.3)'"
                    onblur="this.style.borderColor='rgba(102, 126, 234, 0.5)'; this.style.boxShadow='none'"
                >
                <input 
                    type="password" 
                    id="auth-password" 
                    placeholder="Mot de passe" 
                    style="width: 100%; padding: 12px; margin-bottom: 20px; border-radius: 10px; border: 2px solid rgba(102, 126, 234, 0.5); background: rgba(0,0,0,0.3); color: white; font-size: 1em; box-sizing: border-box; transition: all 0.3s;"
                    autocomplete="current-password"
                    onfocus="this.style.borderColor='rgba(102, 126, 234, 0.8)'; this.style.boxShadow='0 0 15px rgba(102, 126, 234, 0.3)'"
                    onblur="this.style.borderColor='rgba(102, 126, 234, 0.5)'; this.style.boxShadow='none'"
                >
                
                <button onclick="tryLogin()" class="btn btn--primary" style="width: 100%; padding: 12px; margin-bottom: 10px; font-size: 1.1em; background: linear-gradient(135deg, #667eea, #764ba2); border: none; color: white; font-weight: bold; border-radius: 10px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                    Accéder à l'archive
                </button>
                <button onclick="tryRegister()" class="btn btn--outline" style="width: 100%; padding: 12px; background: rgba(255,255,255,0.1); border: 2px solid rgba(102, 126, 234, 0.5); color: white; font-weight: bold; border-radius: 10px; cursor: pointer; transition: all 0.3s;">
                    Créer une archive
                </button>
            </div>
            
            <div id="auth-status" style="margin-top: 15px; min-height: 20px; color: #ef4444; font-size: 0.9em;"></div>
            
            <button onclick="this.closest('.modal').remove()" style="margin-top: 20px; background: none; border: none; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 0.9em; text-decoration: underline; transition: color 0.3s;" onmouseenter="this.style.color='rgba(255,255,255,0.9)'" onmouseleave="this.style.color='rgba(255,255,255,0.6)'">
                Fermer
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus sur le premier input
    setTimeout(() => {
        const emailInput = document.getElementById('auth-email');
        if (emailInput) emailInput.focus();
    }, 100);
    
    // Fermer en cliquant en dehors
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Entrée pour valider
    const passwordInput = document.getElementById('auth-password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                tryLogin();
            }
        });
    }
}

window.tryLogin = async function() {
    const email = document.getElementById('auth-email')?.value;
    const pass = document.getElementById('auth-password')?.value;
    const statusDiv = document.getElementById('auth-status');
    
    if (!email || !pass) {
        if (statusDiv) {
            statusDiv.textContent = 'Veuillez remplir tous les champs';
            statusDiv.style.color = '#ef4444';
        }
        return;
    }
    
    if (statusDiv) {
        statusDiv.textContent = 'Connexion en cours...';
        statusDiv.style.color = '#3b82f6';
    }
    
    const { data, error } = await window.SupabaseManager.signIn(email, pass);
    
    if (error) {
        if (statusDiv) {
            statusDiv.textContent = 'Erreur: ' + error.message;
            statusDiv.style.color = '#ef4444';
        }
        if (window.showToast) {
            window.showToast('Erreur de connexion: ' + error.message, 'error');
        }
    } else {
        const modal = document.querySelector('.auth-modal');
        if (modal) modal.remove();
        if (window.showToast) {
            window.showToast('✅ Connecté avec succès !', 'success');
        }
    }
};

window.tryRegister = async function() {
    const email = document.getElementById('auth-email')?.value;
    const pass = document.getElementById('auth-password')?.value;
    const statusDiv = document.getElementById('auth-status');
    
    if (!email || !pass) {
        if (statusDiv) {
            statusDiv.textContent = 'Veuillez remplir tous les champs';
            statusDiv.style.color = '#ef4444';
        }
        return;
    }
    
    if (pass.length < 6) {
        if (statusDiv) {
            statusDiv.textContent = 'Le mot de passe doit contenir au moins 6 caractères';
            statusDiv.style.color = '#ef4444';
        }
        return;
    }
    
    if (statusDiv) {
        statusDiv.textContent = 'Création du compte...';
        statusDiv.style.color = '#3b82f6';
    }
    
    const { data, error } = await window.SupabaseManager.signUp(email, pass);
    
    if (error) {
        if (statusDiv) {
            statusDiv.textContent = 'Erreur: ' + error.message;
            statusDiv.style.color = '#ef4444';
        }
        if (window.showToast) {
            window.showToast('Erreur d\'inscription: ' + error.message, 'error');
        }
    } else {
        if (statusDiv) {
            statusDiv.textContent = 'Archive créée avec succès !';
            statusDiv.style.color = '#10b981';
        }
        if (window.showToast) {
            window.showToast('✅ Archive créée avec succès !', 'success');
        }
        // Optionnel : fermer la modale après 3 secondes
        setTimeout(() => {
            const modal = document.querySelector('.auth-modal');
            if (modal) modal.remove();
        }, 3000);
    }
};

window.updateAuthUI = function(isLoggedIn) {
    // Attendre que le DOM soit prêt
    const tryUpdate = () => {
        // Chercher dans la Top Bar
        let topBarContainer = document.querySelector('.top-bar-right');
        
        // Chercher aussi dans la page Profil
        let profileContainer = document.getElementById('profile-cloud-section');
        
        if (!topBarContainer) {
            // Créer un conteneur dans la Top Bar si elle existe
            const topBar = document.querySelector('.top-bar');
            if (topBar) {
                topBarContainer = document.createElement('div');
                topBarContainer.className = 'top-bar-right';
                topBarContainer.style.cssText = 'display: flex; align-items: center; gap: 10px;';
                topBar.appendChild(topBarContainer);
            }
        }
        
        if (!topBarContainer && !profileContainer) {
            // Réessayer après un court délai si le DOM n'est pas encore prêt
            setTimeout(tryUpdate, 100);
            return;
        }
        
        // Mettre à jour les deux emplacements si disponibles
        if (topBarContainer) {
            updateAuthButton(topBarContainer, isLoggedIn, 'topbar');
        }
        if (profileContainer) {
            updateAuthButton(profileContainer, isLoggedIn, 'profile');
        }
    };
    
    tryUpdate();
};

function updateAuthButton(container, isLoggedIn, location = 'topbar') {
    const btnId = location === 'profile' ? 'cloud-save-btn-profile' : 'cloud-save-btn';
    let btn = document.getElementById(btnId);
    if (!btn) {
        btn = document.createElement('button');
        btn.id = btnId;
        btn.className = 'btn btn--outline';
        if (location === 'profile') {
            btn.style.cssText = 'padding: 12px 24px; font-size: 1em; width: 100%; max-width: 300px;';
        } else {
            btn.style.cssText = 'padding: 8px 16px; font-size: 0.9em; margin-left: 10px;';
        }
        container.appendChild(btn);
    }
    
    if (isLoggedIn) {
        // Si on est connecté, ne pas afficher le bouton dans la top bar (seulement dans le profil)
        if (location === 'topbar') {
            // Cacher le bouton dans la top bar quand on est connecté
            if (btn) {
                btn.style.display = 'none';
            }
            // Ajouter un petit bouton de sauvegarde compact
            let saveBtn = document.getElementById('cloud-save-now-btn');
            if (!saveBtn && container) {
                saveBtn = document.createElement('button');
                saveBtn.id = 'cloud-save-now-btn';
                saveBtn.className = 'btn btn--primary';
                saveBtn.style.cssText = 'padding: 6px 12px; font-size: 0.8em; min-width: auto;';
                saveBtn.innerHTML = '💾';
                saveBtn.title = 'Archiver les données récupérées';
                saveBtn.onclick = async () => {
                    saveBtn.disabled = true;
                    saveBtn.innerHTML = '⏳';
                    const result = await window.SupabaseManager.save();
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = '💾';
                    if (result.success) {
                        if (window.showToast) {
                            window.showToast('✅ Données archivées avec succès !', 'success');
                        }
                    } else {
                        if (window.showToast) {
                            window.showToast('❌ Erreur de sauvegarde: ' + (result.error || 'Erreur inconnue'), 'error');
                        }
                    }
                };
                container.appendChild(saveBtn);
            }
        } else {
            // Dans le profil, afficher le bouton complet
            btn.innerHTML = '☁️ Connexion / Déconnexion';
            btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            btn.style.border = 'none';
            btn.style.color = 'white';
            btn.style.width = '100%';
            btn.style.maxWidth = '300px';
            btn.style.margin = '0 auto';
            btn.style.display = 'block';
            container.style.justifyContent = 'center';
            btn.onclick = async () => {
                if (window.confirm && window.confirm('Voulez-vous vous déconnecter ?')) {
                    await window.SupabaseManager.signOut();
                    if (window.showToast) {
                        window.showToast('Déconnecté', 'info');
                    }
                }
            };
            
            // Afficher l'email de l'utilisateur
            let emailDisplay = document.getElementById('cloud-email-display');
            if (window.SupabaseManager && window.SupabaseManager.getCurrentUserEmail) {
                const email = window.SupabaseManager.getCurrentUserEmail();
                if (email) {
                    if (emailDisplay) {
                        // Mettre à jour l'email existant
                        emailDisplay.innerHTML = `📧 Connecté avec : <strong style="color: #ffd700;">${email}</strong>`;
                    } else {
                        // Créer l'élément email s'il n'existe pas
                        emailDisplay = document.createElement('div');
                        emailDisplay.id = 'cloud-email-display';
                        emailDisplay.style.cssText = 'color: rgba(255,255,255,0.8); font-size: 0.9em; margin-bottom: 10px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 8px; width: 100%;';
                        emailDisplay.innerHTML = `📧 Connecté avec : <strong style="color: #ffd700;">${email}</strong>`;
                        container.insertBefore(emailDisplay, btn);
                    }
                }
            }
            
            // Ajouter des boutons d'action dans le profil
            const actionsContainer = document.getElementById('profile-cloud-actions');
            if (actionsContainer && !document.getElementById('cloud-load-btn-profile')) {
                const loadBtn = document.createElement('button');
                loadBtn.id = 'cloud-load-btn-profile';
                loadBtn.className = 'btn btn--primary';
                loadBtn.style.cssText = 'padding: 10px 20px; font-size: 0.9em; flex: 1; min-width: 150px;';
                loadBtn.innerHTML = '📥 Charger du Cloud';
                loadBtn.onclick = async () => {
                    loadBtn.disabled = true;
                    loadBtn.innerHTML = '⏳ Chargement...';
                    const result = await window.SupabaseManager.load(true);
                    loadBtn.disabled = false;
                    loadBtn.innerHTML = '📥 Charger du Cloud';
                    if (result && result.success) {
                        if (window.showToast) {
                            window.showToast('✅ Progression chargée du Cloud !', 'success');
                        }
                        // Recharger l'UI
                        if (typeof window.updateUI === 'function') window.updateUI();
                        if (typeof window.updateProfileStats === 'function') window.updateProfileStats();
                    } else {
                        if (window.showToast) {
                            window.showToast('❌ ' + (result?.error || 'Erreur de chargement'), 'error');
                        }
                    }
                };
                actionsContainer.appendChild(loadBtn);
                
                const saveBtn = document.createElement('button');
                saveBtn.id = 'cloud-save-btn-profile';
                saveBtn.className = 'btn btn--outline';
                saveBtn.style.cssText = 'padding: 10px 20px; font-size: 0.9em; flex: 1; min-width: 150px;';
                saveBtn.innerHTML = '💾 Sauvegarder';
                saveBtn.onclick = async () => {
                    saveBtn.disabled = true;
                    saveBtn.innerHTML = '⏳ ...';
                    const result = await window.SupabaseManager.save();
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = '💾 Archiver';
                    if (result && result.success) {
                        if (window.showToast) {
                            window.showToast('✅ Données archivées avec succès !', 'success');
                        }
                    } else {
                        if (window.showToast) {
                            window.showToast('❌ Erreur: ' + (result?.error || 'Erreur inconnue'), 'error');
                        }
                    }
                };
                actionsContainer.appendChild(saveBtn);
            }
        }
    } else {
        // Si on n'est pas connecté, afficher le bouton
        if (btn) {
            btn.style.display = 'block';
        }
        btn.innerHTML = location === 'profile' ? '💾 Accéder à l\'archive / Créer une archive' : '💾 Archiver';
        btn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        btn.style.border = 'none';
        btn.style.color = 'white';
        btn.onclick = renderAuthModal;
        
        // Supprimer le bouton de sauvegarde manuelle
        const saveBtn = document.getElementById('cloud-save-now-btn');
        if (saveBtn) saveBtn.remove();
    }
}

