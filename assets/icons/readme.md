# Icônes PWA

Ce dossier doit contenir les icônes suivantes pour que l'application PWA fonctionne correctement :

## Fichiers requis

### icon-192.png
- **Taille** : 192x192 pixels
- **Format** : PNG
- **Usage** : Icône principale pour l'application (affichée sur l'écran d'accueil)
- **Recommandations** :
  - Fond transparent ou couleur de thème (#2C2F33)
  - Logo/icône du jeu centré
  - Design simple et reconnaissable même en petit format

### icon-512.png
- **Taille** : 512x512 pixels
- **Format** : PNG
- **Usage** : Icône haute résolution pour les écrans haute densité
- **Recommandations** :
  - Même design que icon-192.png mais en plus grand
  - Détails plus fins possibles
  - Fond transparent ou couleur de thème

## Outils pour créer les icônes

Vous pouvez utiliser :
- **Online** : [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- **Photoshop/GIMP** : Créer un carré 512x512, exporter en 192x192 et 512x512
- **Favicon Generator** : [RealFaviconGenerator](https://realfavicongenerator.net/)

## Note

Les icônes doivent être placées dans ce dossier (`assets/icons/`) pour que le manifest.json et le service worker puissent les trouver.




