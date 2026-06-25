// ============================================================
// 🎮 MODULE GAMEMASTER — Poke-Collector Debug Panel
// Activation : ?gm=1 dans l'URL  OU  7 taps rapides n'importe où
// ============================================================
(function () {
    'use strict';

    const STORAGE_KEY = 'pokemonGameV62';
    const GM_ENABLED_KEY = 'gm_panel_enabled';

    // Niveaux de déblocage de chaque module
    const MODULES = [
        {
            level: 2,
            name: '🎣 Pêche',
            check() {
                const gs = window.gameState;
                return !!(gs?.modules?.fishing?.unlocked || gs?.level >= 2);
            },
            navSelector: null,
            hubSelector: null,
        },
        {
            level: 3,
            name: '📋 Quêtes (Hub)',
            check() {
                const gs = window.gameState;
                return !!(gs?.modules?.quests?.unlocked || gs?.level >= 3);
            },
            navSelector: null,
            hubSelector: '.hub-item.quests',
        },
        {
            level: 4,
            name: '🎁 Blind Box (Nav)',
            check() {
                const gs = window.gameState;
                return !!(gs?.modules?.blindbox?.unlocked || gs?.level >= 4);
            },
            navSelector: '#nav-btn-home',
            hubSelector: null,
        },
        {
            level: 5,
            name: '🔬 Recherche (Hub)',
            check() {
                const gs = window.gameState;
                return !!(gs?.research?.unlocked || gs?.level >= 5);
            },
            navSelector: null,
            hubSelector: '.hub-item.research',
        },
        {
            level: 8,
            name: '⚔️ Data Guardians (Hub)',
            check() {
                const gs = window.gameState;
                return !!(gs?.modules?.bossBattle?.unlocked || gs?.level >= 8);
            },
            navSelector: null,
            hubSelector: '.hub-item.bossBattle',
        },
        {
            level: 10,
            name: '🃏 Poké-Poker (Nav)',
            check() {
                const gs = window.gameState;
                return !!(gs?.modules?.poker?.unlocked || gs?.level >= 10);
            },
            navSelector: '#nav-btn-poker',
            hubSelector: null,
        },
        {
            level: 12,
            name: '🗺️ Expédition (Nav)',
            check() {
                const gs = window.gameState;
                return !!(gs?.modules?.rogue?.unlocked || gs?.level >= 12);
            },
            navSelector: '#nav-btn-expedition',
            hubSelector: null,
        },
    ];

    // ─── Utilitaires ─────────────────────────────────────────────

    function toast(msg, type) {
        if (typeof window.showToast === 'function') window.showToast(msg, type || 'success');
        else console.log('[GM]', msg);
    }

    function applyUnlocks(level) {
        const gs = window.gameState;
        if (!gs) return;
        if (!gs.modules) gs.modules = {};

        if (level >= 2 && gs.modules.fishing) gs.modules.fishing.unlocked = true;

        if (!gs.modules.quests) gs.modules.quests = { id: 'quests', condition: 'level_3', unlocked: false };
        if (level >= 3) gs.modules.quests.unlocked = true;

        if (!gs.modules.blindbox) gs.modules.blindbox = { id: 'blindbox', condition: 'level_8', unlocked: false };
        if (level >= 4) gs.modules.blindbox.unlocked = true;

        if (gs.research) gs.research.unlocked = level >= 5;

        if (!gs.modules.bossBattle) gs.modules.bossBattle = { id: 'bossBattle', condition: 'level_8', unlocked: false };
        if (level >= 8) gs.modules.bossBattle.unlocked = true;

        if (gs.modules.poker) gs.modules.poker.unlocked = level >= 10;
        if (gs.modules.rogue) gs.modules.rogue.unlocked = level >= 12;
    }

    function refreshAllUI() {
        if (typeof window.unlockFeaturesByLevel === 'function') window.unlockFeaturesByLevel();
        if (typeof window.updateNavigationVisibility === 'function') window.updateNavigationVisibility();
        if (typeof window.updateQuestsVisibility === 'function') window.updateQuestsVisibility();
        if (typeof window.updateUIFishing === 'function') window.updateUIFishing();
        if (typeof window.updateUI === 'function') window.updateUI();
        if (typeof window.saveGame === 'function') window.saveGame();
    }

    // ─── Styles ──────────────────────────────────────────────────

    function injectStyles() {
        if (document.getElementById('gm-styles')) return;
        const s = document.createElement('style');
        s.id = 'gm-styles';
        s.textContent = `
            #gm-toggle-btn {
                position: fixed;
                bottom: 90px;
                right: 15px;
                width: 46px;
                height: 46px;
                border-radius: 50%;
                background: linear-gradient(135deg, #ff6b6b, #c0392b);
                border: 2px solid rgba(255,255,255,0.25);
                color: white;
                font-size: 1.4em;
                cursor: pointer;
                z-index: 10001;
                box-shadow: 0 4px 15px rgba(0,0,0,0.5), 0 0 20px rgba(255,107,107,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.15s ease;
                line-height: 1;
            }
            #gm-toggle-btn:hover { transform: scale(1.1); }
            #gm-toggle-btn:active { transform: scale(0.95); }

            #gm-panel {
                position: fixed;
                bottom: 148px;
                right: 15px;
                width: 290px;
                max-height: 72vh;
                overflow-y: auto;
                background: linear-gradient(160deg, #0f0f1e 0%, #1a1a2e 100%);
                border: 1.5px solid rgba(255, 107, 107, 0.45);
                border-radius: 16px;
                padding: 14px;
                z-index: 10000;
                box-shadow: 0 12px 40px rgba(0,0,0,0.7), 0 0 30px rgba(255,107,107,0.1);
                font-family: 'Share Tech Mono', 'Courier New', monospace;
                color: #e2e8f0;
                font-size: 0.82em;
                display: none;
            }
            #gm-panel::-webkit-scrollbar { width: 4px; }
            #gm-panel::-webkit-scrollbar-track { background: rgba(255,255,255,0.04); border-radius: 2px; }
            #gm-panel::-webkit-scrollbar-thumb { background: rgba(255,107,107,0.4); border-radius: 2px; }

            .gm-section-title {
                font-weight: bold;
                margin-bottom: 6px;
                font-size: 0.88em;
                letter-spacing: 0.03em;
            }
            .gm-row { display: flex; gap: 5px; flex-wrap: wrap; }
            .gm-divider {
                border: none;
                border-top: 1px solid rgba(255,255,255,0.08);
                margin: 10px 0;
            }

            .gm-btn {
                background: rgba(255,255,255,0.08);
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 7px;
                color: #e2e8f0;
                padding: 5px 9px;
                cursor: pointer;
                font-size: 0.82em;
                font-family: inherit;
                transition: background 0.12s;
                white-space: nowrap;
            }
            .gm-btn:hover { background: rgba(255,255,255,0.18); }
            .gm-btn:active { transform: scale(0.96); }
            .gm-btn-green  { background: rgba(16,185,129,0.2); border-color: #10b981; color: #6ee7b7; }
            .gm-btn-green:hover  { background: rgba(16,185,129,0.38); }
            .gm-btn-yellow { background: rgba(245,158,11,0.2); border-color: #f59e0b; color: #fcd34d; }
            .gm-btn-yellow:hover { background: rgba(245,158,11,0.38); }
            .gm-btn-purple { background: rgba(167,139,250,0.2); border-color: #a78bfa; color: #c4b5fd; }
            .gm-btn-purple:hover { background: rgba(167,139,250,0.38); }
            .gm-btn-red    { background: rgba(239,68,68,0.2); border-color: #ef4444; color: #fca5a5; }
            .gm-btn-red:hover    { background: rgba(239,68,68,0.38); }
            .gm-btn-blue   { background: rgba(56,189,248,0.2); border-color: #38bdf8; color: #7dd3fc; }
            .gm-btn-blue:hover   { background: rgba(56,189,248,0.38); }
            .gm-btn-sm { padding: 3px 6px; font-size: 0.76em; }

            .gm-input {
                flex: 1;
                min-width: 0;
                background: rgba(255,255,255,0.07);
                border: 1px solid rgba(255,255,255,0.18);
                border-radius: 7px;
                color: white;
                padding: 5px 8px;
                font-size: 0.82em;
                font-family: inherit;
                outline: none;
            }
            .gm-input:focus { border-color: rgba(255,107,107,0.6); }

            .gm-status-box {
                background: rgba(255,255,255,0.04);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 9px;
                padding: 8px 10px;
                margin-bottom: 10px;
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 4px;
                text-align: center;
            }
            .gm-stat-label { color: rgba(255,255,255,0.45); font-size: 0.75em; }
            .gm-stat-value { font-size: 1.05em; font-weight: bold; margin-top: 1px; }

            .gm-module-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 3px 0;
                border-bottom: 1px solid rgba(255,255,255,0.04);
            }
            .gm-module-row:last-child { border-bottom: none; }
            .gm-module-name { color: rgba(255,255,255,0.8); font-size: 0.85em; }
            .gm-module-status { display: flex; align-items: center; gap: 4px; }

            /* Hub item lock overlay générique */
            .gm-hub-lock-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.72);
                border-radius: 16px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10;
                backdrop-filter: blur(4px);
                pointer-events: none;
            }
        `;
        document.head.appendChild(s);
    }

    // ─── Verrouillage visuel Hub items ───────────────────────────

    function applyHubLock(selector, levelRequired, unlocked) {
        const el = document.querySelector(selector);
        if (!el) return;

        const overlayClass = 'gm-hub-lock-overlay';
        let overlay = el.querySelector('.' + overlayClass);

        if (unlocked) {
            el.style.opacity = '';
            el.style.filter = '';
            el.style.pointerEvents = '';
            el.style.cursor = '';
            if (overlay) overlay.remove();
        } else {
            el.style.position = 'relative';
            el.style.opacity = '0.3';
            el.style.filter = 'grayscale(100%) blur(2px)';
            el.style.pointerEvents = 'none';
            el.style.cursor = 'not-allowed';

            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = overlayClass;
                el.appendChild(overlay);
            }
            overlay.innerHTML = `
                <div style="font-size:1.5em;filter:drop-shadow(0 0 5px rgba(255,0,0,.5))">⚡</div>
                <div style="font-size:1.2em;margin:2px 0">🔒</div>
                <div style="font-size:0.68em;color:rgba(255,255,255,.85);font-family:var(--font-family-pixel,'monospace');text-align:center">LVL ${levelRequired}</div>
                <div style="font-size:0.6em;color:rgba(255,255,255,.55);margin-top:2px;font-family:var(--font-family-pixel,'monospace');text-align:center">MÉMOIRE CORROMPUE</div>
            `;
        }
    }

    window.updateHubLockStates = function () {
        const gs = window.gameState;
        if (!gs) return;

        // Research hub item (débloqué niveau 5)
        const researchUnlocked = !!(gs.research?.unlocked || gs.level >= 5);
        applyHubLock('.hub-item.research', 5, researchUnlocked);

        // Boss Battle hub item (débloqué niveau 8)
        const bossUnlocked = !!(gs.modules?.bossBattle?.unlocked || gs.level >= 8);
        applyHubLock('.hub-item.bossBattle', 8, bossUnlocked);
    };

    // ─── Panel GameMaster ─────────────────────────────────────────

    const GM = {
        visible: false,

        build() {
            if (document.getElementById('gm-panel')) return;
            injectStyles();

            // Bouton flottant toggle
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'gm-toggle-btn';
            toggleBtn.title = 'Gamemaster Panel (debug)';
            toggleBtn.textContent = '🎮';
            toggleBtn.addEventListener('click', () => this.toggle());
            document.body.appendChild(toggleBtn);

            // Panel principal
            const panel = document.createElement('div');
            panel.id = 'gm-panel';
            panel.innerHTML = this._html();
            document.body.appendChild(panel);
        },

        _html() {
            return `
            <!-- En-tête -->
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,107,107,.3)">
                <span style="font-size:1.05em;font-weight:bold;color:#ff6b6b;letter-spacing:.04em">🎮 GAMEMASTER</span>
                <div style="display:flex;gap:5px">
                    <button class="gm-btn gm-btn-sm" onclick="window.GameMaster.refreshStatus()" title="Rafraîchir">↻</button>
                    <button class="gm-btn gm-btn-sm gm-btn-red" onclick="window.GameMaster.disable()" title="Désactiver le GM">✕</button>
                </div>
            </div>

            <!-- Status -->
            <div class="gm-status-box">
                <div>
                    <div class="gm-stat-label">NIVEAU</div>
                    <div class="gm-stat-value" id="gm-val-level" style="color:#FFD700">1</div>
                </div>
                <div>
                    <div class="gm-stat-label">XP</div>
                    <div class="gm-stat-value" id="gm-val-xp" style="color:#10b981">0</div>
                </div>
                <div>
                    <div class="gm-stat-label">COINS</div>
                    <div class="gm-stat-value" id="gm-val-coins" style="color:#f59e0b">3K</div>
                </div>
            </div>

            <!-- XP -->
            <div class="gm-section-title" style="color:#6ee7b7">⚡ Ajouter XP</div>
            <div class="gm-row" style="margin-bottom:5px">
                <button class="gm-btn" onclick="window.GameMaster.addXP(100)">+100</button>
                <button class="gm-btn" onclick="window.GameMaster.addXP(500)">+500</button>
                <button class="gm-btn" onclick="window.GameMaster.addXP(1000)">+1 000</button>
                <button class="gm-btn" onclick="window.GameMaster.addXP(5000)">+5 000</button>
            </div>
            <div class="gm-row" style="margin-bottom:2px">
                <input class="gm-input" id="gm-xp-input" type="number" placeholder="XP custom…" min="1">
                <button class="gm-btn gm-btn-green" onclick="window.GameMaster.addXPCustom()">OK</button>
            </div>

            <hr class="gm-divider">

            <!-- Coins -->
            <div class="gm-section-title" style="color:#fcd34d">💰 Ajouter Coins</div>
            <div class="gm-row" style="margin-bottom:5px">
                <button class="gm-btn" onclick="window.GameMaster.addCoins(1000)">+1 K</button>
                <button class="gm-btn" onclick="window.GameMaster.addCoins(5000)">+5 K</button>
                <button class="gm-btn" onclick="window.GameMaster.addCoins(10000)">+10 K</button>
                <button class="gm-btn" onclick="window.GameMaster.addCoins(50000)">+50 K</button>
            </div>
            <div class="gm-row" style="margin-bottom:2px">
                <input class="gm-input" id="gm-coins-input" type="number" placeholder="Coins custom…" min="1">
                <button class="gm-btn gm-btn-yellow" onclick="window.GameMaster.addCoinsCustom()">OK</button>
            </div>

            <hr class="gm-divider">

            <!-- Tickets Firewall (Game Guardian) -->
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
                <span class="gm-section-title" style="color:#fb7185;margin-bottom:0">🎟️ Tickets Firewall (Boss)</span>
                <span class="gm-stat-value" id="gm-val-tickets" style="color:#fb7185;font-size:1em">0</span>
            </div>
            <div class="gm-row" style="margin-bottom:5px">
                <button class="gm-btn" onclick="window.GameMaster.addFirewallTickets(1)">+1</button>
                <button class="gm-btn" onclick="window.GameMaster.addFirewallTickets(5)">+5</button>
                <button class="gm-btn" onclick="window.GameMaster.addFirewallTickets(10)">+10</button>
                <button class="gm-btn" onclick="window.GameMaster.addFirewallTickets(50)">+50</button>
            </div>
            <div class="gm-row" style="margin-bottom:2px">
                <input class="gm-input" id="gm-tickets-input" type="number" placeholder="Tickets custom…" min="1">
                <button class="gm-btn gm-btn-red" onclick="window.GameMaster.addFirewallTicketsCustom()">OK</button>
            </div>

            <hr class="gm-divider">

            <!-- Niveau -->
            <div class="gm-section-title" style="color:#c4b5fd">🎯 Définir Niveau</div>
            <div class="gm-row" style="margin-bottom:5px">
                <input class="gm-input" id="gm-level-input" type="number" placeholder="1 – 50" min="1" max="50">
                <button class="gm-btn gm-btn-purple" onclick="window.GameMaster.setLevelFromInput()">GO</button>
            </div>
            <!-- Shortcuts vers les seuils de déblocage -->
            <div style="color:rgba(255,255,255,.4);font-size:0.74em;margin-bottom:4px">Seuils clés :</div>
            <div class="gm-row">
                <button class="gm-btn gm-btn-sm" onclick="window.GameMaster.setLevel(2)" title="Débloquer Pêche">Lv 2</button>
                <button class="gm-btn gm-btn-sm" onclick="window.GameMaster.setLevel(3)" title="Débloquer Quêtes">Lv 3</button>
                <button class="gm-btn gm-btn-sm" onclick="window.GameMaster.setLevel(5)" title="Débloquer Recherche">Lv 5</button>
                <button class="gm-btn gm-btn-sm" onclick="window.GameMaster.setLevel(8)" title="Débloquer Boss">Lv 8</button>
                <button class="gm-btn gm-btn-sm" onclick="window.GameMaster.setLevel(10)" title="Débloquer Poker">Lv 10</button>
                <button class="gm-btn gm-btn-sm" onclick="window.GameMaster.setLevel(12)" title="Débloquer Expé">Lv 12</button>
            </div>

            <hr class="gm-divider">

            <!-- Modules -->
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <span class="gm-section-title" style="color:#7dd3fc;margin-bottom:0">🔓 État des modules</span>
                <button class="gm-btn gm-btn-sm gm-btn-blue" onclick="window.GameMaster.checkVisualLocks()">Vérifier UI</button>
            </div>
            <div id="gm-modules-list" style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:9px;padding:8px 10px">
                <div style="color:rgba(255,255,255,.35);font-size:0.8em">Cliquez ↻ pour actualiser…</div>
            </div>

            <hr class="gm-divider">

            <!-- Actions rapides -->
            <div class="gm-section-title" style="color:#fca5a5">⚡ Actions rapides</div>
            <div class="gm-row" style="margin-bottom:5px">
                <button class="gm-btn gm-btn-purple" onclick="window.GameMaster.maxAll()" title="Lv 15 + 100 000 coins + balls">MAX TOUT</button>
                <button class="gm-btn" onclick="window.GameMaster.addBalls()" title="+50 de chaque ball">+Balls</button>
            </div>
            <div class="gm-row">
                <button class="gm-btn gm-btn-red" onclick="window.GameMaster.resetSave()" title="Supprimer la sauvegarde locale">🗑 Reset Save</button>
            </div>

            <div style="color:rgba(255,255,255,.2);font-size:0.72em;text-align:center;margin-top:10px">
                Poke-Collector Gamemaster v1.0
            </div>
            `;
        },

        toggle() {
            this.visible = !this.visible;
            const panel = document.getElementById('gm-panel');
            if (!panel) return;
            panel.style.display = this.visible ? 'block' : 'none';
            if (this.visible) this.refreshStatus();
        },

        show() {
            this.visible = true;
            const panel = document.getElementById('gm-panel');
            if (panel) { panel.style.display = 'block'; this.refreshStatus(); }
        },

        refreshStatus() {
            const gs = window.gameState;
            if (!gs) return;

            const setTxt = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.textContent = val;
            };

            setTxt('gm-val-level', gs.level);
            setTxt('gm-val-xp', `${gs.xp} / ${gs.xpToNext}`);
            setTxt('gm-val-coins', gs.coins.toLocaleString('fr-FR'));
            setTxt('gm-val-tickets', gs.bossBattle?.firewallTickets ?? 0);

            this._renderModules();
        },

        _renderModules() {
            const container = document.getElementById('gm-modules-list');
            if (!container) return;
            const currentLevel = window.gameState?.level || 1;

            container.innerHTML = MODULES.map(m => {
                const ok = m.check();
                const needJump = !ok && currentLevel < m.level;
                return `<div class="gm-module-row">
                    <span class="gm-module-name">${m.name}</span>
                    <div class="gm-module-status">
                        <span style="color:${ok ? '#10b981' : '#ef4444'};font-size:1.1em">${ok ? '✅' : '🔒'}</span>
                        ${needJump
                        ? `<button class="gm-btn gm-btn-sm gm-btn-purple" onclick="window.GameMaster.setLevel(${m.level})" style="font-size:.7em;padding:2px 5px">→ Lv${m.level}</button>`
                        : ''}
                    </div>
                </div>`;
            }).join('');
        },

        // ── Commandes ──────────────────────────────────────────────

        addXP(amount) {
            const gs = window.gameState;
            if (!gs) return;
            gs.xp += amount;
            if (typeof window.checkLevelUp === 'function') window.checkLevelUp();
            refreshAllUI();
            this.refreshStatus();
            toast(`🎮 GM: +${amount.toLocaleString('fr-FR')} XP`, 'success');
        },

        addXPCustom() {
            const el = document.getElementById('gm-xp-input');
            const n = parseInt(el?.value) || 0;
            if (n > 0) { this.addXP(n); if (el) el.value = ''; }
        },

        addCoins(amount) {
            const gs = window.gameState;
            if (!gs) return;
            gs.coins += amount;
            refreshAllUI();
            this.refreshStatus();
            toast(`🎮 GM: +${amount.toLocaleString('fr-FR')} coins`, 'success');
        },

        addCoinsCustom() {
            const el = document.getElementById('gm-coins-input');
            const n = parseInt(el?.value) || 0;
            if (n > 0) { this.addCoins(n); if (el) el.value = ''; }
        },

        addFirewallTickets(amount) {
            const gs = window.gameState;
            if (!gs) return;
            if (!gs.bossBattle) gs.bossBattle = { firewallTickets: 0, lastTicketReset: null, battlesCompleted: 0, battlesWon: 0, currentBattle: null };
            gs.bossBattle.firewallTickets = (gs.bossBattle.firewallTickets || 0) + amount;
            if (typeof window.saveGame === 'function') window.saveGame();
            refreshAllUI();
            this.refreshStatus();
            toast(`🎮 GM: +${amount} Ticket(s) Firewall (total : ${gs.bossBattle.firewallTickets})`, 'success');
        },

        addFirewallTicketsCustom() {
            const el = document.getElementById('gm-tickets-input');
            const n = parseInt(el?.value) || 0;
            if (n > 0) { this.addFirewallTickets(n); if (el) el.value = ''; }
        },

        setLevel(target) {
            const gs = window.gameState;
            if (!gs || target < 1 || target > 50) return;

            gs.level = target;
            gs.xp = 0;
            gs.xpToNext = target * 250;

            applyUnlocks(target);
            refreshAllUI();

            // Mettre à jour les locks visuels du Hub
            if (typeof window.updateHubLockStates === 'function') window.updateHubLockStates();

            this.refreshStatus();
            toast(`🎮 GM: Niveau ${target} défini — modules vérifiés`, 'success');
        },

        setLevelFromInput() {
            const el = document.getElementById('gm-level-input');
            const n = parseInt(el?.value);
            if (n >= 1 && n <= 50) { this.setLevel(n); if (el) el.value = ''; }
        },

        checkVisualLocks() {
            if (typeof window.updateHubLockStates === 'function') window.updateHubLockStates();
            if (typeof window.updateNavigationVisibility === 'function') window.updateNavigationVisibility();
            if (typeof window.updateQuestsVisibility === 'function') window.updateQuestsVisibility();
            this.refreshStatus();
            toast('🎮 GM: Verrous visuels synchronisés', 'info');
        },

        addBalls() {
            const gs = window.gameState;
            if (!gs) return;
            ['pokeball', 'greatball', 'ultraball', 'masterball', 'diveball'].forEach(b => {
                gs.inventory[b] = (gs.inventory[b] || 0) + 50;
            });
            refreshAllUI();
            toast('🎮 GM: +50 de chaque Pokéball !', 'success');
        },

        maxAll() {
            this.addCoins(100000);
            this.setLevel(15);
            this.addBalls();
            toast('🎮 GM: TOUT MAXIMISÉ !', 'success');
        },

        resetSave() {
            if (!confirm('⚠️ Supprimer toute la sauvegarde locale ?\nCette action est irréversible !')) return;
            localStorage.removeItem(STORAGE_KEY);
            toast('🎮 GM: Sauvegarde supprimée — rechargement…', 'info');
            setTimeout(() => window.location.reload(), 1500);
        },

        disable() {
            localStorage.removeItem(GM_ENABLED_KEY);
            document.getElementById('gm-panel')?.remove();
            document.getElementById('gm-toggle-btn')?.remove();
            document.getElementById('gm-styles')?.remove();
            this.visible = false;
            toast('🎮 Mode Gamemaster désactivé', 'info');
        },
    };

    // ─── Activation ───────────────────────────────────────────────

    function activate() {
        GM.build();
        // Forcer la vérification des verrous dès que le jeu est prêt
        const waitForGame = setInterval(() => {
            if (window.gameState) {
                clearInterval(waitForGame);
                if (typeof window.updateHubLockStates === 'function') window.updateHubLockStates();
                GM.refreshStatus();
            }
        }, 200);
        window.GameMaster = GM;
    }

    function init() {
        const urlEnabled = window.location.search.includes('gm=1');
        const storedEnabled = localStorage.getItem(GM_ENABLED_KEY) === 'true';

        if (urlEnabled) {
            if (urlEnabled) localStorage.setItem(GM_ENABLED_KEY, 'true');
            activate();
            return;
        }

        if (storedEnabled) {
            activate();
            return;
        }

        // Secret : 7 taps rapides n'importe où en moins d'1.5 s
        let count = 0;
        let timer = null;
        document.addEventListener('click', () => {
            count++;
            clearTimeout(timer);
            timer = setTimeout(() => { count = 0; }, 1500);
            if (count >= 7) {
                count = 0;
                localStorage.setItem(GM_ENABLED_KEY, 'true');
                activate();
                setTimeout(() => { GM.show(); }, 200);
                toast('🎮 Mode Gamemaster activé ! (7 taps)', 'success');
            }
        }, true);
    }

    // Lancer après que tous les scripts soient chargés
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 600));
    } else {
        setTimeout(init, 600);
    }

    // Exposer pour appel externe (ex : depuis la console)
    window.GameMaster = { enable() { localStorage.setItem(GM_ENABLED_KEY, 'true'); activate(); GM.show(); } };
})();
