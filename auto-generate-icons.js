/* ==========================================
   Script Node.js pour générer les icônes automatiquement
   Nécessite: npm install canvas
   ========================================== */

const fs = require('fs');
const path = require('path');

// Vérifier si canvas est disponible
let Canvas;
try {
    Canvas = require('canvas');
} catch (e) {
    console.log('⚠️  Le module "canvas" n\'est pas installé.');
    console.log('📦 Installez-le avec: npm install canvas');
    console.log('💡 Alternative: Utilisez generate-pokeball-icons.html dans votre navigateur');
    process.exit(1);
}

function drawPokeball(ctx, size) {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.45;
    
    // Fond transparent
    ctx.clearRect(0, 0, size, size);
    
    // Cercle extérieur (contour noir)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();
    
    // Moitié supérieure (rouge)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 2, Math.PI, 0, false);
    ctx.fillStyle = '#e60012';
    ctx.fill();
    
    // Dégradé rouge pour effet 3D
    const gradientRed = ctx.createLinearGradient(centerX, centerY - radius, centerX, centerY);
    gradientRed.addColorStop(0, '#ff1a2e');
    gradientRed.addColorStop(1, '#cc0010');
    ctx.fillStyle = gradientRed;
    ctx.fill();
    
    // Moitié inférieure (blanc)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 2, 0, Math.PI, false);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Bande noire centrale
    ctx.beginPath();
    ctx.rect(centerX - radius + 2, centerY - radius * 0.12, (radius - 2) * 2, radius * 0.24);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();
    
    // Bouton central (cercle noir)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();
    
    // Cercle blanc intérieur du bouton
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Reflet/highlight sur le bouton
    const gradientButton = ctx.createRadialGradient(
        centerX - radius * 0.05, centerY - radius * 0.05,
        0,
        centerX, centerY,
        radius * 0.14
    );
    gradientButton.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradientButton.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradientButton;
    ctx.fill();
    
    // Reflet sur la partie rouge
    ctx.beginPath();
    ctx.arc(centerX - radius * 0.2, centerY - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();
}

function generateIcon(size, outputPath) {
    const canvas = Canvas.createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    drawPokeball(ctx, size);
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Généré: ${outputPath} (${size}x${size}px)`);
}

// Créer le dossier si nécessaire
const iconsDir = path.join(__dirname, 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Générer les icônes
console.log('🎨 Génération des icônes Pokéball...\n');
generateIcon(192, path.join(iconsDir, 'icon-192.png'));
generateIcon(512, path.join(iconsDir, 'icon-512.png'));
console.log('\n✨ Icônes générées avec succès !');




