# Script PowerShell pour générer les icônes PWA
# Nécessite: Ouvrir generate-pokeball-icons.html dans le navigateur

Write-Host "🎨 Générateur d'icônes PWA" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour générer les icônes automatiquement:" -ForegroundColor Yellow
Write-Host "1. Ouvrez 'generate-pokeball-icons.html' dans votre navigateur" -ForegroundColor White
Write-Host "2. Les icônes seront générées et téléchargées automatiquement" -ForegroundColor White
Write-Host "3. Placez les fichiers dans assets/icons/" -ForegroundColor White
Write-Host ""
Write-Host "Ou utilisez le script Node.js si vous avez canvas installé:" -ForegroundColor Yellow
Write-Host "   node auto-generate-icons.js" -ForegroundColor White
Write-Host ""

# Vérifier si le dossier existe
$iconsDir = "assets\icons"
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null
    Write-Host "✅ Dossier créé: $iconsDir" -ForegroundColor Green
}

# Vérifier si les icônes existent déjà
$icon192 = "$iconsDir\icon-192.png"
$icon512 = "$iconsDir\icon-512.png"

if ((Test-Path $icon192) -and (Test-Path $icon512)) {
    Write-Host "✅ Les icônes existent déjà !" -ForegroundColor Green
} else {
    Write-Host "⚠️  Les icônes n'existent pas encore." -ForegroundColor Yellow
    Write-Host "   Ouvrez 'generate-pokeball-icons.html' pour les générer." -ForegroundColor White
}

Write-Host ""
Write-Host "Appuyez sur une touche pour ouvrir le générateur HTML..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Ouvrir le fichier HTML dans le navigateur par défaut
$htmlFile = "generate-pokeball-icons.html"
if (Test-Path $htmlFile) {
    Start-Process $htmlFile
    Write-Host "✅ Générateur ouvert dans le navigateur !" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier generate-pokeball-icons.html introuvable !" -ForegroundColor Red
}




