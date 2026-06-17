// =====================================================
// STORYTELLING & PROGRESSION ENGINE — Genesis Reboot
// Phases 1-6 : Arc narratif, Intégrité, Objectifs
// =====================================================

// ======================================================
// PHASE 1 — RENDRE L'ARC VISIBLE
// ======================================================

function computeWorldIntegrity() {
    if (!window.gameState || !window.gameState.system) return 0;
    const gs = window.gameState;

    const kantoCaught = typeof getCaughtCount === 'function' ? getCaughtCount('Kanto') : 0;
    const kantoPct = Math.min(kantoCaught / 151, 1);

    const loreDecrypted = gs.passiveBonuses ? Object.keys(gs.passiveBonuses).length : 0;
    const lorePct = Math.min(loreDecrypted / 8, 1);

    const guardiansWon = gs.bossBattle && gs.bossBattle.battlesWon ? gs.bossBattle.battlesWon : 0;
    const guardianPct = Math.min(guardiansWon / 3, 1);

    return Math.max(0, Math.min(100, Math.floor((kantoPct * 60) + (lorePct * 20) + (guardianPct * 20))));
}

function updateIntegrityBar() {
    const container = document.getElementById('world-integrity-bar');
    const fill = document.getElementById('world-integrity-fill');
    const pctLabel = document.getElementById('world-integrity-pct');
    const titleEl = document.getElementById('world-integrity-title');

    if (!container) return;

    const gs = window.gameState;
    if (!gs || !gs.introSeen) {
        container.style.display = 'none';
        return;
    }

    const integrity = computeWorldIntegrity();

    if (gs.system) {
        gs.system.integrity = integrity;
        gs.system.glitchLevel = Math.max(0, 1 - integrity / 100);
    }

    if (fill) fill.style.width = integrity + '%';
    if (pctLabel) pctLabel.textContent = integrity + '%';

    let color, label;
    if (integrity < 20) {
        color = 'linear-gradient(90deg, #ff0055, #ff4488)';
        label = 'INTEGRITÉ CRITIQUE';
    } else if (integrity < 40) {
        color = 'linear-gradient(90deg, #f59e0b, #fcd34d)';
        label = 'SYSTÈME INSTABLE';
    } else if (integrity < 65) {
        color = 'linear-gradient(90deg, #3b82f6, #60a5fa)';
        label = 'RESTAURATION EN COURS';
    } else if (integrity < 90) {
        color = 'linear-gradient(90deg, #10b981, #6ee7b7)';
        label = 'SYSTÈME STABLE';
    } else {
        color = 'linear-gradient(90deg, #a78bfa, #34d399)';
        label = 'MONDE RESTAURÉ';
    }

    if (fill) fill.style.background = color;
    if (titleEl) titleEl.textContent = label;

    container.style.display = 'flex';

    _applyGlitchFromIntegrity(integrity);
}

function _applyGlitchFromIntegrity(integrity) {
    const body = document.body;
    body.classList.remove(
        'integrity-critical', 'integrity-low', 'integrity-mid', 'integrity-high', 'integrity-full'
    );
    if (integrity < 20) body.classList.add('integrity-critical');
    else if (integrity < 40) body.classList.add('integrity-low');
    else if (integrity < 65) body.classList.add('integrity-mid');
    else if (integrity < 90) body.classList.add('integrity-high');
    else body.classList.add('integrity-full');
}

// ======================================================
// PHASE 1 — PANNEAU 3 OBJECTIFS
// ======================================================

function _getShortTermObj() {
    const gs = window.gameState;
    if (!gs) return { label: 'Chargement...', pct: 0 };

    const dailyDef = window.QUESTS_DATA ? (window.QUESTS_DATA.daily || []) : [];
    const dailyProg = gs.questsProgress && gs.questsProgress.daily ? gs.questsProgress.daily : {};
    const claimed = gs.claimedQuests && gs.claimedQuests.daily ? gs.claimedQuests.daily : new Set();

    for (const q of dailyDef) {
        if (!claimed.has || !claimed.has(q.id)) {
            const prog = dailyProg[q.id] || 0;
            return {
                label: q.name,
                sub: q.desc,
                progress: Math.min(prog, q.target) + '/' + q.target,
                pct: Math.min(prog / q.target, 1)
            };
        }
    }
    return { label: 'Quêtes du jour complètes', sub: 'Reviens demain pour de nouvelles missions', pct: 1 };
}

function _getMediumTermObj() {
    const gs = window.gameState;
    if (!gs) return { label: 'Chargement...', pct: 0 };

    const guardiansWon = gs.bossBattle && gs.bossBattle.battlesWon ? gs.bossBattle.battlesWon : 0;
    if (guardiansWon < 3) {
        const names = ['Mewtwo Corrompu', 'Lugia des Abysses', 'Rayquaza Final'];
        return {
            label: 'Data Guardian : ' + names[Math.min(guardiansWon, 2)],
            sub: 'Vaincs le prochain Gardien pour débloquer une région',
            progress: guardiansWon + '/3 vaincus',
            pct: guardiansWon / 3
        };
    }
    const johto = typeof getCaughtCount === 'function' ? getCaughtCount('Johto') : 0;
    if (johto < 100) {
        return {
            label: 'Progression Johto',
            sub: 'Restaure le DeepNet région par région',
            progress: johto + '/100',
            pct: johto / 100
        };
    }
    return { label: 'Pokédex avancé', sub: 'Continue la restauration du réseau', pct: 1 };
}

function _getLongTermObj() {
    const gs = window.gameState;
    if (!gs) return { label: 'Chargement...', pct: 0 };

    const integrity = computeWorldIntegrity();
    const phase = gs.system && gs.system.currentPhase ? gs.system.currentPhase : 'BOOT_SEQUENCE';

    const phaseLabels = {
        'BOOT_SEQUENCE': 'Acte I — Boot du Système',
        'KANTO_RECOVERY': 'Acte I — Restaurer Kanto',
        'JOHTO_DESCENT': 'Acte II — Descente DeepNet',
        'FINAL_PATCH': 'Acte III — Patch Final',
        'POST_GAME': 'Post-Game — Vrai Archiviste'
    };

    return {
        label: phaseLabels[phase] || 'Arc en cours',
        sub: 'Intégrité du monde',
        progress: integrity + '%',
        pct: integrity / 100
    };
}

function renderObjectivesPanel() {
    const panel = document.getElementById('objectives-panel');
    if (!panel) return;

    const gs = window.gameState;
    if (!gs || !gs.introSeen) {
        panel.style.display = 'none';
        return;
    }

    const short = _getShortTermObj();
    const medium = _getMediumTermObj();
    const long = _getLongTermObj();

    function objHTML(obj, icon, barClass) {
        const pct = Math.round((obj.pct || 0) * 100);
        return `<div class="obj-item">
            <span class="obj-icon">${icon}</span>
            <div class="obj-content">
                <div class="obj-label">${obj.label}</div>
                ${obj.sub ? `<div class="obj-sub">${obj.sub}</div>` : ''}
                ${obj.progress !== undefined ? `<div class="obj-progress-row"><div class="obj-bar"><div class="obj-bar-fill ${barClass}" style="width:${pct}%"></div></div><span class="obj-pct">${obj.progress}</span></div>` : ''}
            </div>
        </div>`;
    }

    panel.innerHTML = `
        <div class="obj-header" onclick="window.toggleObjectivesPanel()">
            <span class="obj-title">Objectifs</span>
            <span id="obj-toggle-icon" class="obj-toggle-icon">&#9660;</span>
        </div>
        <div class="obj-body" id="obj-body">
            ${objHTML(short, '&#9889;', 'bar-short')}
            ${objHTML(medium, '&#127919;', 'bar-medium')}
            ${objHTML(long, '&#127760;', 'bar-long')}
        </div>`;

    panel.style.display = 'block';

    if (!window._objPanelOpen) {
        const body = document.getElementById('obj-body');
        if (body) body.style.display = 'none';
        const icon = document.getElementById('obj-toggle-icon');
        if (icon) icon.innerHTML = '&#9654;';
    }
}

window._objPanelOpen = false;
window.toggleObjectivesPanel = function () {
    window._objPanelOpen = !window._objPanelOpen;
    const body = document.getElementById('obj-body');
    const icon = document.getElementById('obj-toggle-icon');
    if (body) body.style.display = window._objPanelOpen ? 'block' : 'none';
    if (icon) icon.innerHTML = window._objPanelOpen ? '&#9660;' : '&#9654;';
};

function updateStoryHUD() {
    updateIntegrityBar();
    renderObjectivesPanel();
    checkMissingNoInterference();
}

// ======================================================
// PHASE 2 — MOTEUR DE PALIERS NARRATIFS
// ======================================================

const NARRATIVE_BEATS = [
    {
        id: 'beat_first_capture',
        condition: () => window.gameState.totalCaught >= 1,
        onTrigger: () => { if (typeof triggerNarrative === 'function' && PORYGON_DIALOGUES.first_data_restored) triggerNarrative('first_data_restored'); }
    },
    {
        id: 'beat_guide_fishing',
        condition: () => window.gameState.level >= 2 && PORYGON_DIALOGUES && PORYGON_DIALOGUES.guide_fishing_first,
        onTrigger: () => { if (typeof triggerNarrative === 'function') triggerNarrative('guide_fishing_first'); }
    },
    {
        id: 'beat_guide_evolution',
        condition: () => {
            const cap = window.gameState.captured;
            if (!cap) return false;
            return [2, 3, 5, 6, 8, 9, 12, 15, 18].some(id => cap.has ? cap.has(id) : cap.includes(id));
        },
        onTrigger: () => { if (typeof triggerNarrative === 'function' && PORYGON_DIALOGUES && PORYGON_DIALOGUES.guide_evolution) triggerNarrative('guide_evolution'); }
    },
    {
        id: 'beat_guide_shinies',
        condition: () => (window.gameState.shinies && (window.gameState.shinies.size || window.gameState.shinies.length || 0)) >= 1,
        onTrigger: () => { if (typeof triggerNarrative === 'function' && PORYGON_DIALOGUES && PORYGON_DIALOGUES.guide_shinies) triggerNarrative('guide_shinies'); }
    },
    {
        id: 'beat_guide_berries',
        condition: () => {
            const inv = window.gameState.inventory || {};
            return (inv.pinap || 0) + (inv.razz || 0) + (inv.nanab || 0) >= 3;
        },
        onTrigger: () => { if (typeof triggerNarrative === 'function' && PORYGON_DIALOGUES && PORYGON_DIALOGUES.guide_berries) triggerNarrative('guide_berries'); }
    },
    {
        id: 'beat_kanto_50',
        condition: () => typeof getCaughtCount === 'function' && getCaughtCount('Kanto') >= 50,
        onTrigger: () => { if (typeof triggerNarrative === 'function') triggerNarrative('system_stabilizing'); }
    },
    {
        id: 'beat_lore_chen_found',
        condition: () => {
            const lores = window.gameState.loreFiles || [];
            return lores.includes('journal_chen_404') || (window.gameState.passiveBonuses && window.gameState.passiveBonuses['journal_chen_404']);
        },
        onTrigger: () => {
            if (typeof showPorygonMessage === 'function') {
                showPorygonMessage([
                    'JOURNAL DU PR. CHEN — DÉCRYPTÉ',
                    'Ces notes contiennent la clé de la restauration.',
                    '"MissingNo n\'a pas été créé... Il a été réveillé."',
                    'Continuez la restauration pour en apprendre davantage.'
                ], 'alert');
            }
        }
    },
    {
        id: 'beat_integrity_25',
        condition: () => computeWorldIntegrity() >= 25,
        onTrigger: () => {
            if (typeof showPorygonMessage === 'function') {
                showPorygonMessage([
                    'INTÉGRITÉ 25% ATTEINTE',
                    'Le système commence à se stabiliser.',
                    'La corruption recule lentement.'
                ], 'progress');
            }
        }
    },
    {
        id: 'beat_integrity_50',
        condition: () => computeWorldIntegrity() >= 50,
        onTrigger: () => { if (typeof triggerNarrative === 'function') triggerNarrative('memory_returning'); }
    },
    {
        id: 'beat_integrity_75',
        condition: () => computeWorldIntegrity() >= 75,
        onTrigger: () => {
            if (typeof showPorygonMessage === 'function') {
                showPorygonMessage([
                    'INTÉGRITÉ 75%',
                    'MissingNo perd sa prise sur le système.',
                    'Porygon-Z : "Nous y sommes presque..."'
                ], 'happy');
            }
        }
    },
    {
        id: 'beat_first_guardian',
        condition: () => {
            const bw = window.gameState.bossBattle && window.gameState.bossBattle.battlesWon;
            return (bw || 0) >= 1;
        },
        onTrigger: () => {
            playCutscene('guardian_victory_1');
            if (typeof triggerNarrative === 'function' && PORYGON_DIALOGUES.porygon_defrag_success) {
                setTimeout(() => triggerNarrative('porygon_defrag_success'), 1500);
            }
        }
    },
    {
        id: 'beat_guide_low_level',
        condition: () => window.gameState.level >= 3 && window.gameState.totalCaught < 10,
        onTrigger: () => { if (typeof triggerNarrative === 'function' && PORYGON_DIALOGUES && PORYGON_DIALOGUES.guide_low_level) triggerNarrative('guide_low_level'); }
    },
    {
        id: 'beat_reaction_time_away',
        condition: () => {
            const lastSeen = window.gameState.lastSeen || Date.now();
            return (Date.now() - lastSeen) > 8 * 60 * 60 * 1000;
        },
        onTrigger: () => {
            if (typeof triggerAmbientNarrative === 'function') triggerAmbientNarrative('time_away');
            else if (typeof showPorygonMessage === 'function') {
                showPorygonMessage([
                    'RECONNEXION DÉTECTÉE.',
                    'De nombreux cycles se sont écoulés, Archiviste.',
                    'Les données corrompues ont continué de se propager.'
                ], 'normal');
            }
        }
    },
    {
        id: 'beat_kanto_complete',
        condition: () => typeof getCaughtCount === 'function' && getCaughtCount('Kanto') >= 151,
        onTrigger: () => {
            if (window.gameState.system) window.gameState.system.currentPhase = 'JOHTO_DESCENT';
            playCutscene('region_restore_kanto');
        }
    },
    {
        id: 'beat_johto_complete',
        condition: () => typeof getCaughtCount === 'function' && getCaughtCount('Johto') >= 100,
        onTrigger: () => {
            if (window.gameState.system) window.gameState.system.currentPhase = 'FINAL_PATCH';
            playCutscene('region_restore_johto');
            if (typeof triggerNarrative === 'function') triggerNarrative('system_reboot_hoenn');
        }
    },
    {
        id: 'beat_guide_blueprints',
        condition: () => {
            const inv = window.gameState.inventory || {};
            return (inv.blueprints && inv.blueprints.length > 0) || (inv.blueprint_count > 0);
        },
        onTrigger: () => { if (typeof triggerNarrative === 'function' && PORYGON_DIALOGUES && PORYGON_DIALOGUES.guide_blueprints) triggerNarrative('guide_blueprints'); }
    },
    {
        id: 'beat_guide_streak',
        condition: () => (window.gameState.streak || 0) >= 5,
        onTrigger: () => { if (typeof triggerNarrative === 'function' && PORYGON_DIALOGUES && PORYGON_DIALOGUES.guide_streak) triggerNarrative('guide_streak'); }
    },
    {
        id: 'beat_guide_tcg',
        condition: () => window.gameState.tcg && window.gameState.tcg.unlocked,
        onTrigger: () => { if (typeof triggerNarrative === 'function' && PORYGON_DIALOGUES && PORYGON_DIALOGUES.guide_tcg_first) triggerNarrative('guide_tcg_first'); }
    },
    {
        id: 'beat_eo_production_tutorial',
        condition: () => window.gameState.research && window.gameState.research.energy > 500,
        onTrigger: () => { if (typeof triggerNarrative === 'function' && PORYGON_DIALOGUES && PORYGON_DIALOGUES.guide_eo_production) triggerNarrative('guide_eo_production'); }
    },
    {
        id: 'beat_guide_labo_synergies',
        condition: () => window.gameState.level >= 8 && window.gameState.research && window.gameState.research.unlocked,
        onTrigger: () => { if (typeof triggerNarrative === 'function' && PORYGON_DIALOGUES && PORYGON_DIALOGUES.guide_labo_synergies) triggerNarrative('guide_labo_synergies'); }
    }
];

function checkStoryProgress() {
    const gs = window.gameState;
    if (!gs || !gs.system) return;
    if (!gs.system.narrativeFlags) gs.system.narrativeFlags = [];

    let triggered = false;
    for (const beat of NARRATIVE_BEATS) {
        if (gs.system.narrativeFlags.includes(beat.id)) continue;
        try {
            if (beat.condition()) {
                gs.system.narrativeFlags.push(beat.id);
                beat.onTrigger();
                triggered = true;
                // Un seul beat par appel pour ne pas surcharger les dialogues
                break;
            }
        } catch (e) {
            // Silent - ne pas crasher le jeu
        }
    }

    // S'il reste des beats non traités, re-vérifier dans 3 secondes
    if (triggered) {
        setTimeout(checkStoryProgress, 3000);
    }

    updateStoryHUD();
}

// ======================================================
// PHASE 3 — ARC EN 3 ACTES
// ======================================================

function updateCurrentPhase() {
    const gs = window.gameState;
    if (!gs || !gs.system) return;

    const kantoCaught = typeof getCaughtCount === 'function' ? getCaughtCount('Kanto') : 0;
    const johtoCaught = typeof getCaughtCount === 'function' ? getCaughtCount('Johto') : 0;
    const guardiansWon = gs.bossBattle && gs.bossBattle.battlesWon ? gs.bossBattle.battlesWon : 0;

    let phase;
    if (kantoCaught < 1) {
        phase = 'BOOT_SEQUENCE';
    } else if (kantoCaught < 151) {
        phase = 'KANTO_RECOVERY';
    } else if (johtoCaught < 100 || guardiansWon < 2) {
        phase = 'JOHTO_DESCENT';
    } else if (guardiansWon >= 3) {
        phase = 'POST_GAME';
    } else {
        phase = 'FINAL_PATCH';
    }

    gs.system.currentPhase = phase;

    const moodMap = {
        'BOOT_SEQUENCE': 'PANIC',
        'KANTO_RECOVERY': 'NEUTRAL',
        'JOHTO_DESCENT': 'WORRIED',
        'FINAL_PATCH': 'DETERMINED',
        'POST_GAME': 'HAPPY'
    };
    if (moodMap[phase]) gs.system.porygonMood = moodMap[phase];
}

// ======================================================
// PHASE 4 — RESKIN NARRATIF DES MODULES
// ======================================================

const MODULE_NARRATIVE = {
    'fishing-page': {
        title: 'SONDAGE DES COUCHES PROFONDES',
        text: 'Les données corrompues se terrent dans les strates basses du réseau. Une ligne dans le DeepNet peut remonter ce qui est enfoui.'
    },
    'expedition-page': {
        title: 'INCURSION EN ZONE CORROMPUE',
        text: 'Les secteurs instables recèlent les données les plus rares. Chaque expédition est une plongée dans le code brisé — revenez avec des fragments pour la restauration.'
    },
    'poker-page': {
        title: 'DÉCRYPTAGE DE FRAGMENTS DE CODE',
        text: 'Le Poké-Poker n\'est pas un jeu de hasard. C\'est un protocole de décryptage : chaque main jouée décode un fragment du génome corrompu.'
    },
    'research-page': {
        title: 'PRODUCTION D\'ÉNERGIE ONIRIQUE',
        text: 'L\'Énergie Onirique est le carburant de la restauration — et ce qui permettra, au climax, de sauver Porygon-Z du sacrifice final.'
    },
    'boss-battle-page': {
        title: 'COMBAT DE DATA GUARDIAN',
        text: 'Les Gardiens de Données sont des programmes de défense corrompus. Les vaincre ouvre de nouveaux secteurs et renforce l\'intégrité du monde.'
    }
};

function injectModuleNarratives() {
    const gs = window.gameState;
    if (!gs || !gs.introSeen) return;

    for (const [pageId, intro] of Object.entries(MODULE_NARRATIVE)) {
        const containerId = 'mod-narrative-' + pageId;
        if (document.getElementById(containerId)) continue;

        const page = document.getElementById(pageId);
        if (!page) continue;

        const div = document.createElement('div');
        div.id = containerId;
        div.className = 'module-narrative-intro';
        div.innerHTML = `<div class="mod-narr-title">${intro.title}</div><div class="mod-narr-text">${intro.text}</div>`;

        const target = page.querySelector('.container') || page.querySelector('.page-content') || page;
        target.insertBefore(div, target.firstChild);
    }
}

// ======================================================
// PHASE 5 — CUTSCENES
// ======================================================

const CUTSCENE_DEFS = {
    'intro_chen': {
        title: 'GENESIS — BOOT SEQUENCE',
        fallback: ['Système en démarrage...', 'ERREUR CRITIQUE détectée.', 'Le Pr. Chen a lancé une procédure d\'urgence.', 'Porygon-Z en ligne. Mission : restaurer les archives.']
    },
    'porygon_appear': {
        title: 'CONTACT ÉTABLI',
        fallback: ['SIGNAL REÇU.', 'Porygon-Z synchronisé avec l\'Archiviste.', 'Commençons la restauration.']
    },
    'region_restore_kanto': {
        title: 'KANTO RESTAURÉ',
        fallback: ['Région Kanto : RESTAURÉE.', '151 fichiers de données récupérés.', 'La passerelle vers Johto s\'ouvre.', 'Mais MissingNo n\'a pas dit son dernier mot...']
    },
    'region_restore_johto': {
        title: 'JOHTO RESTAURÉ',
        fallback: ['Région Johto : RESTAURÉE.', 'La descente dans le DeepNet révèle la vérité.', 'MissingNo n\'a pas été créé — il a été réveillé.']
    },
    'guardian_victory_1': {
        title: 'DATA GUARDIAN NEUTRALISÉ',
        fallback: ['PROTOCOLE DE DÉFENSE CONTOURNÉ.', 'Les données de la région sont sécurisées.', 'L\'intégrité du monde augmente.']
    },
    'porygon_sacrifice': {
        title: 'LE SACRIFICE',
        fallback: ['Porygon-Z intercepte l\'attaque finale.', '"Je ne peux pas laisser l\'Archiviste disparaître."', 'Redirection de la corruption vers le noyau Porygon.']
    },
    'missingno_reveal': {
        title: 'LA RÉVÉLATION',
        fallback: ['MissingNo n\'est pas une erreur.', 'C\'est un vestige — le souvenir d\'un monde effacé.', 'Qui l\'a réveillé ? Les notes de Chen le savent.']
    }
};

window.playCutscene = function (sceneId) {
    const scene = CUTSCENE_DEFS[sceneId];
    if (!scene) return;

    if (scene.spritesheetSrc) {
        _playSpritesheetCutscene(scene);
    } else {
        if (scene.fallback && typeof showPorygonMessage === 'function') {
            showPorygonMessage(scene.fallback, 'cutscene');
        }
    }
};

function _playSpritesheetCutscene(scene) {
    const overlay = document.createElement('div');
    overlay.className = 'cutscene-overlay';
    overlay.id = 'cutscene-overlay-active';

    const titleEl = document.createElement('div');
    titleEl.className = 'cutscene-title';
    titleEl.textContent = scene.title || '';

    const canvas = document.createElement('canvas');
    canvas.className = 'cutscene-canvas';
    canvas.width = scene.frameW || 96;
    canvas.height = scene.frameH || 96;

    const skipBtn = document.createElement('button');
    skipBtn.className = 'cutscene-skip-btn';
    skipBtn.textContent = 'Passer';

    overlay.appendChild(titleEl);
    overlay.appendChild(canvas);
    overlay.appendChild(skipBtn);
    document.body.appendChild(overlay);

    const img = new Image();
    let animInterval = null;

    skipBtn.onclick = () => {
        if (animInterval) clearInterval(animInterval);
        overlay.remove();
    };

    img.onload = () => {
        const ctx = canvas.getContext('2d');
        let frame = 0;
        const totalFrames = scene.frameCount || 8;
        const fps = scene.fps || 12;

        animInterval = setInterval(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, frame * (scene.frameW || 96), 0, scene.frameW || 96, scene.frameH || 96, 0, 0, canvas.width, canvas.height);
            frame++;
            if (frame >= totalFrames) {
                clearInterval(animInterval);
                setTimeout(() => overlay.remove(), 800);
            }
        }, 1000 / fps);
    };

    img.onerror = () => {
        overlay.remove();
        if (scene.fallback && typeof showPorygonMessage === 'function') {
            showPorygonMessage(scene.fallback, 'cutscene');
        }
    };

    img.src = scene.spritesheetSrc;
}

// ======================================================
// PHASE 6 — ENDGAME & PRESTIGE OUTSIDERS
// ======================================================

function showOutsidersPrestigeNarrative() {
    if (typeof showPorygonMessage !== 'function') return;
    showPorygonMessage([
        'PROTOCOLE OUTSIDERS ACTIVÉ',
        'Et si la restauration n\'était pas la bonne voie ?',
        'Certains Pokémon refusent d\'être archivés.',
        'Une nouvelle vérité commence...'
    ], 'alert');
}

// Patch performPrestigeReset pour injecter le narrative
(function patchPrestige() {
    const orig = window.performPrestigeReset;
    if (typeof orig !== 'function') return;
    window.performPrestigeReset = function () {
        showOutsidersPrestigeNarrative();
        const args = arguments;
        setTimeout(() => orig.apply(this, args), 2500);
    };
})();

// Patch decryptLoreFile pour déclencher checkStoryProgress
(function patchDecrypt() {
    const orig = window.decryptLoreFile;
    if (typeof orig !== 'function') return;
    window.decryptLoreFile = function (loreFileId) {
        orig.apply(this, arguments);
        setTimeout(checkStoryProgress, 500);
    };
})();

// Patch completeMissingNoDefeat — branche les cutscenes du climax
(function patchMissingNoClimaxHooks() {
    // On attend que la page soit chargée pour patcher
    function tryPatch() {
        const orig = window.completeMissingNoDefeat;
        if (typeof orig !== 'function') {
            setTimeout(tryPatch, 500);
            return;
        }
        window.completeMissingNoDefeat = function () {
            // Cutscene révélation MissingNo avant le passage à Johto
            playCutscene('missingno_reveal');
            // Délai pour laisser la cutscene/fallback s'afficher brièvement
            setTimeout(() => orig.apply(this, arguments), 800);
        };
    }
    tryPatch();
})();

// Hook MissingNo — messages corrompus aux pics de tension
// Déclenchés quand l'intégrité passe sous des seuils critiques
let _lastIntegrityForGlitch = 100;
function checkMissingNoInterference() {
    const integrity = computeWorldIntegrity();
    const gs = window.gameState;
    if (!gs || !gs.introSeen) return;

    const GLITCH_MESSAGES = [
        ['̸̙͚̈́̈͋M̵̬͔̒̕Ȉ̶̫̠͘S̶̘̺̀S̷̳̹̒̽I̴̜̓N̷̩̩̿G̵͖̝͒͝N̸̙̒͜Ȯ̷̥̱͘', 'Protocole de suppression : EN COURS', 'Tu ne peux pas me stopper, Archiviste.'],
        ['ERREUR : DONNÉES MANQUANTES', '█████ FICHIER CORROMPU █████', 'Je suis ce qui reste quand tout est effacé.'],
        ['Corruption détectée : 10̴0%', 'ARRÊT DU SYSTÈME IMMINENT', 'Je précède même le code.'],
    ];

    // Intervenir quand l'intégrité baisse sous un seuil critique
    const TRIGGER_THRESHOLDS = [10, 5, 2];
    for (const t of TRIGGER_THRESHOLDS) {
        if (integrity <= t && _lastIntegrityForGlitch > t) {
            const flagId = 'missingno_glitch_' + t;
            if (!gs.system.narrativeFlags.includes(flagId)) {
                gs.system.narrativeFlags.push(flagId);
                const msg = GLITCH_MESSAGES[Math.floor(Math.random() * GLITCH_MESSAGES.length)];
                if (typeof showPorygonMessage === 'function') {
                    showPorygonMessage(msg, 'error');
                }
            }
        }
    }

    // Aussi intervenir lors des transitions de phase critique → moins critique
    if (integrity >= 20 && _lastIntegrityForGlitch < 20) {
        const flagId = 'missingno_retreating';
        if (!gs.system.narrativeFlags.includes(flagId)) {
            gs.system.narrativeFlags.push(flagId);
            if (typeof showPorygonMessage === 'function') {
                showPorygonMessage(['Corruption en recul...', 'MissingNo : "Ce n\'est qu\'un délai."', 'Continue, Archiviste.'], 'progress');
            }
        }
    }

    _lastIntegrityForGlitch = integrity;
}

// S'assurer que les objectifs post-game restent alimentés
function ensurePostGameObjectives() {
    const gs = window.gameState;
    if (!gs || !gs.system) return;
    if (gs.system.currentPhase === 'POST_GAME') {
        updateStoryHUD();
    }
}

// ======================================================
// HOOKS PRINCIPAUX — INTÉGRATION DANS LE JEU
// ======================================================

// Appel automatique après chaque checkSystemIntegrity (via override window)
(function patchCheckSystemIntegrity() {
    if (typeof window.checkSystemIntegrity !== 'function') return;
    const orig = window.checkSystemIntegrity;
    window.checkSystemIntegrity = function () {
        orig.apply(this, arguments);
        updateCurrentPhase();
        checkStoryProgress();
    };
})();

// Patch saveGame pour mettre à jour le HUD après chaque sauvegarde
(function patchSaveGame() {
    const origSave = window.saveGame;
    if (typeof origSave !== 'function') return;
    window.saveGame = function () {
        const result = origSave.apply(this, arguments);
        // Mise à jour différée pour ne pas ralentir la sauvegarde
        setTimeout(updateStoryHUD, 100);
        return result;
    };
})();

// ======================================================
// INITIALISATION
// ======================================================

window._storyEngineReady = false;

function initStorytellingEngine() {
    if (window._storyEngineReady) return;

    const poll = setInterval(() => {
        if (typeof window.gameState === 'undefined') return;
        if (typeof window.gameState.introSeen === 'undefined') return;

        clearInterval(poll);
        window._storyEngineReady = true;

        updateCurrentPhase();
        checkStoryProgress();
        updateStoryHUD();
        injectModuleNarratives();

        // Rafraîchissement toutes les 30 secondes
        setInterval(() => {
            updateCurrentPhase();
            checkStoryProgress();
            updateStoryHUD();
            injectModuleNarratives();
        }, 30000);

        // Mettre à jour le HUD quand switchPage est appelée
        const origSwitchPage = window.switchPage;
        if (typeof origSwitchPage === 'function') {
            window.switchPage = function (pageName) {
                origSwitchPage.apply(this, arguments);
                setTimeout(() => {
                    updateStoryHUD();
                    injectModuleNarratives();
                }, 200);
            };
        }

        console.log('[StoryEngine] Moteur narratif initialisé — Phase:', window.gameState.system && window.gameState.system.currentPhase);
    }, 300);
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initStorytellingEngine();
} else {
    window.addEventListener('DOMContentLoaded', initStorytellingEngine);
}
