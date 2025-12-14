// ===== ARCHITECTURE V7.0 GENESIS - BIBLE NARRATIVE COMPLÈTE =====
// Tous les textes du jeu sont diégétiques (style "Terminal/Data")

const NARRATIVE_DB = {
    // ===== SÉQUENCE D'INTRODUCTION =====
    INTRO: {
        BOOT_SCREEN: [
            'SYSTEM_BOOT_SEQUENCE...',
            'LOADING KANTO_DB...',
            'LOADING JOHTO_DB...',
            'CRITICAL FAILURE. WORLD_RENDERER NOT FOUND.',
            '...',
            'Recherche d\'un utilisateur administrateur...',
            'Signal détecté.'
        ],
        PORYGON_CONTACT: [
            'Toi... Tu m\'entends? Ma fréquence est instable.',
            'Je suis l\'Assistant de Gestion v.Z... ou ce qu\'il en reste.',
            'Le Grand Effacement a tout supprimé. Les formes, les couleurs, les sons. Il ne reste que du bruit blanc.',
            'Mais tu as un (Une Pokéball). C\'est notre seul espoir.'
        ],
        MISSION_ORDER: [
            'Nous devons réécrire le code source de ce monde. Un Pokémon à la fois.',
            'Chaque capture restaure un fragment de mémoire. Chaque évolution compile un fichier complexe.',
            'Attention. Si tu échoues, la donnée retourne au Néant (The Void). Nous n\'avons pas le droit à l\'erreur.',
            'Initialisation du Module de Capture... PRÊT. Attrape le premier signal que tu vois!'
        ]
    },
    
    // ===== ÉVÉNEMENTS DE JEU =====
    EVENTS: {
        // Fuite (Fail State)
        FLEE: [
            'CONNEXION PERDUE. Le signal s\'est désynchronisé.',
            'ERREUR CRITIQUE. Le Pokémon a glissé dans le Néant.',
            'Échec du confinement. Données corrompues.'
        ],
        // Capture Réussie
        CAPTURE_SUCCESS: [
            'Signal acquis! Intégrité sauvegardée.',
            'Données archivées dans le Pokédex.',
            'Code source extrait avec succès.'
        ],
        // Shiny Détecté
        SHINY_DETECTED: [
            '⚠️ ALERTE : ANOMALIE DÉTECTÉE. Ce code couleur n\'est pas standard!',
            'C\'est un SHINY (1/4096). Ne le laissez pas s\'échapper!'
        ],
        // Évolution
        EVOLUTION: [
            'Mise à jour du firmware détectée...',
            'Compilation des données... Évolution en cours!',
            'Le fichier a été optimisé vers sa forme supérieure.'
        ],
        // Blind Box
        BLINDBOX_OPEN: [
            'Décompression de l\'archive ZIP...',
            'Analyse du contenu aléatoire...',
            'Extraction terminée!'
        ]
    },
    
    // ===== DESCRIPTIONS D'OBJETS (FLAVOR TEXT TECH) =====
    ITEMS: {
        POKEBALL: 'Conteneur v1.0. Algorithme de compression standard. Taux d\'échec : Moyen.',
        SUPERBALL: 'Conteneur v2.0. Latence réduite. Optimisé pour les données non-communes.',
        HYPERBALL: 'Qualité militaire. Cryptage renforcé pour contenir les données volatiles.',
        MASTERBALL: 'Accès Root (Super-Utilisateur). Contourne tous les pare-feux. Capture garantie.',
        FRAMBY: 'Leurre. Surcharge le cache du Pokémon pour ralentir ses réflexes.',
        PINAP: 'Duplicateur. Exploite un bug pour doubler les métadonnées (Coins) extraites.',
        CERIZ: 'Ancre de stabilité. Empêche la déconnexion d\'urgence (Fuite) en cas d\'échec de capture.',
        EXPEDITION_TICKET: 'VPN temporaire. Autorise l\'accès aux zones non-sécurisées du Deep Web (Roguelike).',
        INCENSE: 'Balise de signal. Attire les paquets de données errants vers votre position.'
    },
    
    // ===== QUÊTES QUOTIDIENNES =====
    QUESTS: {
        DAILY: {
            CAPTURES_5: {
                title: 'Stabilisation Réseau',
                description: 'Capturez 5 Pokémon pour stabiliser la bande passante locale. Le système a besoin de données fraîches.'
            },
            CAPTURES_10: {
                title: 'Batch Processing',
                description: 'Effectuez un traitement par lot : 10 captures requises pour mettre à jour l\'index du Pokédex.'
            },
            COINS_1000: {
                title: 'Minage de Crypto',
                description: 'Minez 1000 Coins via vos captures. L\'énergie monétaire est nécessaire pour alimenter les serveurs.'
            },
            FLEES_15: {
                title: 'Analyse d\'Erreur',
                description: 'Nous devons calibrer les capteurs de fuite. Laissez 15 signaux s\'échapper pour générer des logs d\'erreur.'
            },
            FISHING_3: {
                title: 'Sondage Abyssal',
                description: 'Le Data-Lake est trouble. Extrayez 3 entités des profondeurs liquides pour analyse.'
            },
            SHINY_1: {
                title: 'Chasse au Glitch',
                description: 'Une anomalie chromatique (Shiny) a été détectée. Capturez-la pour étudier son code source unique.'
            },
            RARE_2: {
                title: 'Données Complexes',
                description: 'Les signaux communs ne suffisent plus. Capturez 2 Pokémon Rares pour augmenter la puissance processeur.'
            },
            ROGUE_1: {
                title: 'Exploration Deep Web',
                description: 'Aventurez-vous dans une Expédition (Roguelike). Cartographiez une zone instable et revenez vivant.'
            },
            STREAK_10: {
                title: 'Flux Continu',
                description: 'Maintenez une connexion stable! Réussissez 10 captures d\'affilée sans aucune perte de paquet (fuite).'
            },
            LEGENDARY_1: {
                title: 'Accès Admin',
                description: 'Signature Admin détectée. Capturez 1 Légendaire pour obtenir les privilèges système temporaires.'
            }
        },
        SPECIAL: {
            MYSTERY_EGG: {
                title: 'Le Protocole Incubation',
                description: 'J\'ai décrypté un algorithme de génération de vie, mais il est crypté. Capturez 50 Pokémon pour générer la clé de décryptage de cet Œuf Mystère.',
                success: 'Décryptage réussi! L\'algorithme se compile... C\'est un bébé Pokémon!'
            },
            COMPLETE_KANTO: {
                title: 'Restauration Secteur Kanto',
                description: 'Le volume \'KANTO\' est corrompu à 99%. Retrouvez les 151 fragments de code originaux pour restaurer la première région.',
                success: 'Secteur KANTO : 100% INTÈGRE. Backups restaurés. La passerelle vers le volume JOHTO est maintenant ouverte.'
            },
            HUNT_3_LEGENDARIES: {
                title: 'Chasseur d\'Étoiles',
                description: 'Les Légendaires sont des constantes universelles. En capturer 3 permettrait de trianguler la position de Mew.',
                success: 'Triangulation terminée. Position de Mew... incertaine. Mais le radar est calibré.'
            }
        }
    },
    
    // ===== SAFETY NETS (Filets de Sécurité) =====
    SAFETY_NETS: {
        CERIZ_BERRY: 'La Baie Ceriz retient le Pokémon!',
        BUDDY_PROTECTOR: 'Votre Buddy empêche la fuite!'
    }
};

// Export pour utilisation globale
if (typeof window !== 'undefined') {
    window.NARRATIVE_DB = NARRATIVE_DB;
}







