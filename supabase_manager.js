/**
 * GESTIONNAIRE SUPABASE (Cloud Save) - V9.8 (Direct Storage Injection)
 * Correction : Écrit directement dans localStorage pour garantir la persistance
 */

const SUPABASE_URL = 'https://yokqhuqvtuxpfpgapbhy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlva3FodXF2dHV4cGZwZ2FwYmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MzE2MjAsImV4cCI6MjA3OTQwNzYyMH0.M73eM4M66ibX-GHmhZtAZOci6uYMJ3MggsfGhOQ3eRU';

let supabase = null;
let currentUser = null;
let isLoadingCloud = false;

window.SupabaseManager = {
    init: function() {
        if (typeof window.supabase === 'undefined') {
            console.warn('Supabase SDK not loaded');
            if (window.updateAuthUI) setTimeout(() => window.updateAuthUI(false), 1000);
            return;
        }

        try {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            // Vérifier session active au démarrage
            supabase.auth.getSession().then(({ data, error }) => {
                if (data && data.session) {
                    currentUser = data.session.user;
                    console.log('✅ Session active:', currentUser.email);
                    // Attendre que app.js soit prêt avant de lancer l'auto-load
                    setTimeout(() => this.onLoginSuccess(false, true), 500);
                } else {
                    if (window.updateAuthUI) window.updateAuthUI(false);
                }
            });

            supabase.auth.onAuthStateChange((event, session) => {
                currentUser = session?.user || null;
                if (event === 'SIGNED_IN') this.onLoginSuccess(true, false); // Force load au login
                if (event === 'SIGNED_OUT') {
                    currentUser = null;
                    if (window.updateAuthUI) window.updateAuthUI(false);
                    window.location.reload();
                }
            });
        } catch (err) {
            console.error('Supabase Init Error:', err);
        }
    },

    // Sauvegarder
    save: async function() {
        if (!currentUser || !window.gameState) return { success: false, error: 'Not ready' };
        if (isLoadingCloud) return { success: false, error: 'Loading in progress' };

        // PROTECTION NIV 1
        if (window.gameState.level <= 1 && window.gameState.xp < 500) {
             const { data: cloudCheck } = await supabase.from('user_progress').select('game_data').eq('user_id', currentUser.id).single();
             if (cloudCheck && cloudCheck.game_data && parseInt(cloudCheck.game_data.level) > 1) {
                 console.error('🛑 Sauvegarde bloquée : Cloud > Local. Chargement forcé.');
                 this.load(true); 
                 return { success: false, error: 'Cloud better' };
             }
        }

        try {
            const saveData = {
                ...window.gameState,
                captured: Array.from(window.gameState.captured || []),
                shinies: Array.from(window.gameState.shinies || []),
                golden: Array.from(window.gameState.golden || []),
                evolved: Array.from(window.gameState.evolved || []),
                unlockedRegions: Array.from(window.gameState.unlockedRegions || []),
                unlockedBadges: Array.from(window.gameState.unlockedBadges || []),
                claimedQuests: {
                    daily: Array.from(window.gameState.claimedQuests?.daily || []),
                    special: Array.from(window.gameState.claimedQuests?.special || []),
                    permanent: Array.from(window.gameState.claimedQuests?.permanent || [])
                },
                level: parseInt(window.gameState.level) || 1,
                xp: parseInt(window.gameState.xp) || 0,
                last_updated: new Date().toISOString()
            };

            const { error } = await supabase.from('user_progress').upsert({ 
                user_id: currentUser.id, 
                game_data: saveData,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
            
            if (error) throw error;
            console.log('✅ Sauvegarde Cloud OK');
            return { success: true };
        } catch (err) {
            console.error('Save Error:', err);
            return { success: false, error: err.message };
        }
    },

    // Charger - LOGIQUE D'INJECTION DIRECTE
    load: async function(force = false) {
        if (!currentUser) return { success: false, error: 'Not logged in' };

        isLoadingCloud = true;
        // Bloquer les sauvegardes automatiques
        if (window.saveTimeout) clearTimeout(window.saveTimeout);

        try {
            console.log("📥 Téléchargement Cloud...");

            const { data, error } = await supabase.from('user_progress').select('game_data').eq('user_id', currentUser.id).single();
            
            if (error || !data) {
                isLoadingCloud = false;
                if (error && error.code === 'PGRST116') {
                    console.log("ℹ️ Nouveau compte Cloud.");
                    await this.save();
                    return { success: true };
                }
                return { success: false, error: error ? error.message : 'No data' };
            }

            const cloudData = data.game_data;
            const cloudLevel = parseInt(cloudData.level || 1);
            const localLevel = parseInt(window.gameState?.level || 1);

            console.log(`☁️ Cloud (L${cloudLevel}) vs 🏠 Local (L${localLevel})`);

            let shouldLoad = false;

            if (force) {
                // Connexion manuelle : On prend le Cloud si meilleur ou si local est vide
                if (cloudLevel >= localLevel || localLevel === 1) {
                    shouldLoad = true;
                } else {
                    if (confirm(`⚠️ Le Cloud (Niv ${cloudLevel}) est moins avancé que vous (Niv ${localLevel}). Écraser votre partie locale ?`)) {
                        shouldLoad = true;
                    } else {
                        this.save(); // Mise à jour du Cloud avec le Local meilleur
                    }
                }
            } else {
                // Auto-load : Seulement si Cloud strictement mieux
                if (cloudLevel > localLevel) shouldLoad = true;
            }

            if (shouldLoad) {
                console.log("⚡ Écriture directe dans localStorage...");
                
                // 1. ÉCRIRE DANS LE DISQUE (CRUCIAL)
                // Cela garantit que si la page recharge, on a les bonnes données
                localStorage.setItem('pokemonGameV62', JSON.stringify(cloudData));
                
                // 2. METTRE À JOUR LA MÉMOIRE
                // On appelle applySaveData pour rafraîchir l'UI immédiatement sans recharger
                if (typeof window.applySaveData === 'function') {
                    window.applySaveData(cloudData);
                    
                    if (force && window.showToast) {
                        window.showToast(`✅ Compte récupéré ! (Niv ${cloudLevel})`, 'success');
                    }
                    
                    // 3. FORCER UN RAFRAÎCHISSEMENT VISUEL COMPLET
                    setTimeout(() => {
                        if(window.updateUI) window.updateUI();
                        if(window.renderInventory) window.renderInventory();
                        if(window.updateProfileDisplay) window.updateProfileDisplay();
                        // Recharger la grille Pokédex qui est souvent le signe visible du chargement
                        if(window.renderPokedexGrid) window.renderPokedexGrid();
                    }, 200);
                    
                    isLoadingCloud = false;
                    return { success: true };
                } else {
                    // Si applySaveData n'est pas dispo, on recharge la page pour que loadGame() lise le localStorage
                    console.warn("applySaveData introuvable, rechargement de la page...");
                    window.location.reload();
                }
            }
            
            isLoadingCloud = false;
            return { success: false, message: 'Local kept' };

        } catch (err) {
            isLoadingCloud = false;
            console.error('Load Error:', err);
            return { success: false, error: err.message };
        }
    },

    onLoginSuccess: function(forceLoad = false, autoLoad = false) {
        if (window.updateAuthUI) window.updateAuthUI(true);
        setTimeout(() => this.load(forceLoad), 1000);
    },

    signIn: async function(email, password) {
        if (!supabase) return { error: { message: 'No SDK' } };
        return await supabase.auth.signInWithPassword({ email, password });
    },

    signUp: async function(email, password) {
        if (!supabase) return { error: { message: 'No SDK' } };
        return await supabase.auth.signUp({ email, password });
    },

    signOut: async function() {
        if (supabase) await supabase.auth.signOut();
        window.location.reload();
    },

    getCurrentUserEmail: function() {
        return currentUser ? currentUser.email : null;
    },

    isLoggedIn: function() {
        return currentUser !== null;
    },

    getUser: function() {
        return currentUser;
    },
    
    get isLoadingCloud() {
        return isLoadingCloud;
    }
};
