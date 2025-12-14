# Instructions pour créer les icônes PWA

## Option 1 : Utiliser le générateur HTML (Recommandé)

1. Ouvrez `generate-icons.html` dans votre navigateur
2. Cliquez sur "Choisir un fichier" et sélectionnez votre image de Pokéball
3. Cliquez sur "Générer les icônes"
4. Cliquez sur "Télécharger tout"
5. Placez les fichiers téléchargés dans `assets/icons/` :
   - `icon-192.png`
   - `icon-512.png`

## Option 2 : Redimensionner manuellement

Si vous avez Photoshop, GIMP ou un autre éditeur d'images :

1. Ouvrez votre image de Pokéball
2. Créez une nouvelle image carrée :
   - **icon-192.png** : 192x192 pixels
   - **icon-512.png** : 512x512 pixels
3. Copiez/collez votre Pokéball et redimensionnez-la pour qu'elle remplisse le carré (avec un peu de marge)
4. Exportez en PNG avec fond transparent ou couleur de thème (#2C2F33)
5. Placez les fichiers dans `assets/icons/`

## Option 3 : Outil en ligne

1. Allez sur [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
2. Uploadez votre image
3. Téléchargez les icônes générées
4. Placez-les dans `assets/icons/`

## Vérification

Une fois les icônes en place, vérifiez que :
- `assets/icons/icon-192.png` existe (192x192px)
- `assets/icons/icon-512.png` existe (512x512px)

Le manifest.json et le service worker les utiliseront automatiquement !




