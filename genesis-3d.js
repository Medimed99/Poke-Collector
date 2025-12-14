// genesis-3d.js - Moteur graphique pour le Noyau Genesis

const Genesis3D = {
    scene: null,
    camera: null,
    renderer: null,
    coreGroup: null,
    animationId: null,
    particles: null,
    container: null,
    currentEOPerSec: 0, // Stocke l'EO/s actuel pour l'animation
    
    // Configuration visuelle "Master-Tech"
    colors: {
        main: 0x6a0dad,   // Violet Profond
        sec: 0xffffff,    // Blanc
        band: 0xff00aa,   // Rose Néon
        accent: 0xff00aa, // Rose Néon
        glow: 0xff00aa    // Lueur
    },
    
    init: function(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        // Nettoyage préventif
        this.cleanup();
        
        // 1. Scène & Caméra
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.z = 6;
        
        // 2. Rendu
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);
        
        // 3. Lumières (Studio Setup)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
        mainLight.position.set(5, 5, 5);
        this.scene.add(mainLight);
        
        const rimLight = new THREE.SpotLight(0xffffff, 2.0);
        rimLight.position.set(-5, 5, -5);
        rimLight.lookAt(0, 0, 0);
        this.scene.add(rimLight);
        
        const bottomLight = new THREE.PointLight(0x7d5fff, 1.0);
        bottomLight.position.set(0, -5, 2);
        this.scene.add(bottomLight);
        
        // 4. Création de l'objet
        this.createMasterBall();
        
        // 5. Démarrage
        this.animate();
        
        // 6. Gestion du resize
        window.addEventListener('resize', () => this.onResize());
    },
    
    createMasterBall: function() {
        this.coreGroup = new THREE.Group();
        this.scene.add(this.coreGroup);
        
        const c = this.colors;
        
        // --- Coque Supérieure ---
        const topGeo = new THREE.SphereGeometry(1.2, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2 - 0.05);
        const topMat = new THREE.MeshPhysicalMaterial({ 
            color: c.main, metalness: 0.7, roughness: 0.2, clearcoat: 1.0, clearcoatRoughness: 0.1 
        });
        const top = new THREE.Mesh(topGeo, topMat);
        
        // --- Coque Inférieure ---
        const botGeo = new THREE.SphereGeometry(1.2, 64, 64, 0, Math.PI * 2, Math.PI / 2 + 0.05, Math.PI / 2);
        const botMat = new THREE.MeshPhysicalMaterial({ 
            color: c.sec, metalness: 0.5, roughness: 0.2, clearcoat: 1.0 
        });
        const bot = new THREE.Mesh(botGeo, botMat);
        
        // --- Intérieur Noir ---
        const innerGeo = new THREE.SphereGeometry(1.1, 32, 32);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const inner = new THREE.Mesh(innerGeo, innerMat);
        this.coreGroup.add(inner);
        
        // --- Groupe Coques (Animation) ---
        const shells = new THREE.Group();
        shells.add(top);
        shells.add(bot);
        this.coreGroup.add(shells);
        
        // --- Bande Centrale ---
        const bandGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.15, 64);
        const bandMat = new THREE.MeshStandardMaterial({ color: c.band, metalness: 0.8, roughness: 0.4, emissive: c.band, emissiveIntensity: 0.2 });
        const band = new THREE.Mesh(bandGeo, bandMat);
        this.coreGroup.add(band);
        
        // --- Bouton Central ---
        const btnOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.2, 32), bandMat);
        btnOuter.rotation.x = Math.PI / 2;
        btnOuter.position.z = 1.15;
        this.coreGroup.add(btnOuter);
        
        const btnInner = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 0.25, 32), 
            new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 })
        );
        btnInner.rotation.x = Math.PI / 2;
        btnInner.position.z = 1.15;
        this.coreGroup.add(btnInner);
        
        // --- DÉTAILS MASTER (Bulbes & Particules) ---
        const bulbGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const mMat = new THREE.MeshStandardMaterial({ color: c.accent, emissive: c.accent, emissiveIntensity: 0.6 });
        
        const b1 = new THREE.Mesh(bulbGeo, mMat);
        b1.position.set(-0.6, 0.7, 0.5);
        const b2 = new THREE.Mesh(bulbGeo, mMat);
        b2.position.set(0.6, 0.7, 0.5);
        top.add(b1); top.add(b2); // Attachés au top pour bouger avec lui
        
        // Particules flottantes
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(150); // 50 particules * 3
        for(let i=0; i<150; i++) pPos[i] = (Math.random() - 0.5) * 5;
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const pMat = new THREE.PointsMaterial({ size: 0.08, color: c.accent, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
        this.particles = new THREE.Points(pGeo, pMat);
        this.coreGroup.add(this.particles);
        
        // Sauvegarde pour animation
        this.coreGroup.userData = { top: top, bot: bot, btnInner: btnInner, band: band };
    },
    
    animate: function() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const t = Date.now() * 0.001;
        
        // Récupérer l'EO/s depuis le jeu (si disponible)
        if (typeof gameState !== 'undefined' && gameState.research && typeof calculateProduction === 'function') {
            this.currentEOPerSec = calculateProduction() || 0;
        }
        
        if (this.coreGroup) {
            // Flottement
            this.coreGroup.position.y = Math.sin(t * 1.5) * 0.15;
            
            // Rotation élégante
            this.coreGroup.rotation.y = Math.sin(t * 0.5) * 0.2;
            this.coreGroup.rotation.z = Math.cos(t * 0.3) * 0.1;
            
            // ANIMATION CONTINUE : Rotation de la bande centrale basée sur l'EO/s
            // Plus l'EO/s est élevé, plus la bande tourne vite
            // Formule : vitesse = log(EO/s + 1) * 0.5 (pour éviter des rotations trop rapides)
            const rotationSpeed = Math.log10(this.currentEOPerSec + 1) * 0.5;
            if (this.coreGroup.userData.band) {
                this.coreGroup.userData.band.rotation.y += rotationSpeed * 0.01; // Rotation continue
            }
            
            // Intensité de lueur basée sur l'EO/s (plus l'EO/s est élevé, plus ça brille)
            const glowIntensity = Math.min(1, Math.log10(this.currentEOPerSec + 1) / 3);
            if (this.coreGroup.userData.band && this.coreGroup.userData.band.material) {
                this.coreGroup.userData.band.material.emissiveIntensity = 0.2 + glowIntensity * 0.8;
            }
            
            // Particules
            if (this.particles) {
                this.particles.rotation.y = t * 0.1;
                this.particles.rotation.z = t * 0.05;
            }
            
            // Pulsation bouton (plus rapide si EO/s élevé)
            const pulseSpeed = 3 + (Math.log10(this.currentEOPerSec + 1) * 0.5);
            this.coreGroup.userData.btnInner.material.emissiveIntensity = 0.5 + Math.sin(t * pulseSpeed) * 0.3;
        }
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    },
    
    // Action déclenchée par le jeu
    triggerClickAnimation: function() {
        if (!this.coreGroup) return;
        
        const ud = this.coreGroup.userData;
        
        // 1. Flash Lumière
        const flash = new THREE.PointLight(0xffffff, 3, 5);
        flash.position.set(0, 0, 2);
        this.scene.add(flash);
        setTimeout(() => this.scene.remove(flash), 150);
        
        // 2. Animation Ouverture/Fermeture
        let frame = 0;
        const anim = () => {
            if (frame < 10) { // Ouvrir
                ud.top.position.y += 0.04;
                ud.top.rotation.x -= 0.05;
                ud.bot.position.y -= 0.02;
                
                // Petit scale bounce
                const s = 1 + Math.sin(frame * 0.5) * 0.02;
                this.coreGroup.scale.set(s,s,s);
            } else if (frame < 20) { // Pause
                // ...
            } else if (frame < 30) { // Fermer
                ud.top.position.y -= 0.04;
                ud.top.rotation.x += 0.05;
                ud.bot.position.y += 0.02;
                this.coreGroup.scale.set(1,1,1);
            } else {
                // Reset parfait
                ud.top.position.y = 0;
                ud.top.rotation.x = 0;
                ud.bot.position.y = 0;
                return;
            }
            frame++;
            requestAnimationFrame(anim);
        };
        anim();
    },
    
    onResize: function() {
        if (!this.container || !this.camera || !this.renderer) return;
        
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    },
    
    cleanup: function() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.container && this.renderer) {
            this.container.innerHTML = '';
        }
    }
};


