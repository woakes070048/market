'use strict';

/**
 * @ngdoc service
 * @name ortolangMarketApp.MARKET_FR
 * @description
 * # MARKET_FR
 * Constant in the ortolangMarketApp.
 */
angular.module('ortolangMarketApp')
    .constant('MARKET_FR', {
        MARKET: {
            ALL_TYPE: 'Tous',
            RESOURCES: '({{value && value !=="" ? value : ""}} ressource{{value > 1 ? "s" : ""}})',
            NEW_RESOURCES: 'Publications récentes',
            NEW_CORPUS: 'Nouveaux corpus',
            FREE_CORPUS: 'Corpus libre de droits',
            WRITTEN_CORPUS: 'Corpus écrits',
            SPEECH_CORPUS: 'Corpus oraux',
            MULTIMODAL_CORPUS: 'Corpus multimodaux',
            SEE_MORE: 'Plus',
            WEBSITES: 'Sites web',
            WEBSITE: 'Site web',
            SEARCH_PAGE: 'Rechercher dans le contenu',
            REDACTOR_CHOICES: 'Choix de l\'équipe',
            CONDITIONS_OF_USE: 'Conditions d\'utilisation',
            BROWSE: 'Parcourir',
            GO_BACK_INFO: 'Retourner à la fiche',
            ADD_TO_FAVOURITES: 'Ajouter à mes favoris',
            USE_IN_MY_PROJECT: 'Utiliser dans mon projet',
            ADDITIONAL_INFORMATION: 'Informations complémentaires',
            KEYWORDS: 'Mots clés',
            EXTENT: 'Contenu',
            PUBLICATIONS: 'Liste des publications',
            PRIMARY_PUBLICATIONS: 'Publications de référence',
            SECONDARY_PUBLICATIONS: 'Autres Publications',
            EXTERNAL_RELATIONS: 'Relations avec d\'autres ressources',
            ALL_VERSIONS: 'Toutes les versions',
            PRIMARY_LANGUAGE: 'Langue principale',
            DISCOURSE_TYPE: 'Genre du discours',
            LINGUISTIC_SUBJECT: 'Domaines linguistiques',
            PROGRAMMING_LANGUAGE: 'Langages de programmation',
            OPERATING_SYSTEM: 'Systèmes d\'exploitation supportés',
            SUPPORT_TOOL: 'Type de support',
            LANGUAGE: 'Langues concernés par cet objet',
            PRODUCER: 'Laboratoire{{::producerNumber > 1 ? "s" : ""}} producteur{{::producerNumber > 1 ? "s" : ""}} :',
            SPONSORS: 'Soutien institutionnel :',
            PUBLICATION_DATE: 'Date de publication',
            RESEARCHER: 'Responsable{{value > 1 ? "s" : ""}} scientifique{{value > 1 ? "s" : ""}}',
            MANAGER: 'Responsable{{value > 1 ? "s" : ""}} informatique{{value > 1 ? "s" : ""}}',
            DESIGNER: 'Concepteur{{value > 1 ? "s" : ""}}',
            DEVELOPER: 'Responsable{{value > 1 ? "s" : ""}} technique{{value > 1 ? "s" : ""}}',
            AUTHOR: 'Auteur{{value > 1 ? "s" : ""}}',
            COMPILER: 'Compilateur{{value > 1 ? "s" : ""}}',
            TRANSCRIBER: 'Transcripteur{{value > 1 ? "s" : ""}}',
            SPONSOR: 'Sponsor{{value > 1 ? "s" : ""}}',
            SPACIAL: 'Lieux',
            TEMPORAL: 'Date de création',
            PREVIEW: 'Aperçu',
            PREVIEW_OF: 'Aperçu de :',
            LOCATION: 'Localisation',
            CONTRIBUTOR: 'Contribution',
            DOWNLOAD: 'Téléchargement',
            DOWNLOAD_ALL: 'Vous allez télécharger la totalité des données de cette ressource {{value && value !=="" ? "("+value+")" : ""}}',
            DOWNLOAD_PART: 'Vous allez télécharger une partie des données de cette ressource {{value && value !=="" ? "("+value+")" : ""}}',
            DOWNLOAD_AGREEMENT: 'Le téléchargement de cette ressource vaut acceptation de la licence d\'utilisation.',
            LICENCE_DETAIL: 'Détails sur la licence',
            DEROGATION: 'Code du patrimoine',
            BIBLIOGRAPHIC_CITATION: 'Référence à citer',
            SHARE: 'Partager',
            RESULTS_LABEL: 'Environ {{value}} résultat{{value > 1 ? "s" : ""}}',
            LINK: 'Lien',
            COMMERCIAL_LINKS: 'Distribution payante',
            COPYRIGHT: 'Copyright',
            SITE: 'Accéder au site',
            THUMBNAIL: 'Miniature',
            ALL_RESOURCE: 'Tout type de ressource',
            RESOURCE_TYPE: 'Type de ressource',
            DOCUMENTATIONS: 'Documentations',
            SEE_DOCUMENTATIONS: 'Voir la documentation',
            SEE_WEBSITE: 'Accéder au site internet',
            ITEM_NOT_FOUND: 'Aucune ressource n\'a été trouvée à cette adresse',
            METADATA_FORMAT_NOT_FOUND: 'Format des métadonnées illisible.',
            NO_RESULT: 'Aucun résultat ne correspond à votre recherche',
            ESR_ACCESSIBLE: 'Accessible aux membres de l\'ESR',
            FACET: {
                CORPORA_TYPE: 'Type de corpus',
                ALL_CORPORA: 'Tous les corpus',
                ANNOTATION_LEVEL: 'Niveaux d\'annotations',
                ALL_ANNOTATION_LEVEL: 'Tout niveaux d\'annotations',
                TEXT_FORMAT: 'Format',
                ALL_TEXT_FORMAT: 'Tout format de texte',
                TEXT_ENCODING: 'Type Encodage',
                ALL_TEXT_ENCODING: 'Tout encodages de caractères',
                STATUS_OF_USE: 'Droits d\'utilisation',
                ALL_STATUS_OF_USE: 'Tous les droits d\'utilisation',
                CORPORA_LANG: 'Langues du corpus',
                ALL_LANG: 'Toutes les Langues',
                CORPORA_STUDY_LANG: 'Langues étudiées',
                CORPORA_DATATYPES: 'Type de source',
                ALL_CORPORA_DATATYPES: 'Tout type de source',
                CORPORA_FILE_ENCODINGS: 'Encodage de caractères',
                CORPORA_LANGUAGE_TYPE: 'Type de langue',
                ALL_CORPORA_LANGUAGE_TYPE: 'Tout type de langue',
                CORPORA_STYLES: 'Genre du corpus',
                TOOL_LANGUAGE: 'Langue traitée',
                TOOL_FUNCTIONALITY: 'Fonctionnalité',
                ALL_TOOL_FUNCTIONALITY: 'Toutes les fonctionnalités',
                TOOL_INPUTDATA: 'Format en entrée',
                ALL_TOOL_INPUTDATA: 'Tout format en entrée',
                TOOL_OUTPUTDATA: 'Format en sortie',
                ALL_TOOL_OUTPUTDATA: 'Tout format en sortie',
                TOOL_FILE_ENCODINGS: 'Encodage de la donnée',
                ALL_TOOL_FILE_ENCODINGS: 'Tout encodage',
                LEXICON_INPUT_TYPE: 'Type d\'entrée',
                ALL_LEXICON_INPUT_TYPE: 'Tout type d\'entrée',
                LEXICON_DESCRIPTION_TYPE: 'Type de description',
                ALL_LEXICON_DESCRIPTION_TYPE: 'Tout type de description',
                LEXICON_INPUT_LANGUAGE: 'Langue des entrées',
                LEXICON_DESCRIPTION_LANGUAGE: 'Langue de description',
                LEXICON_FORMAT: 'Format',
                ALL_LEXICON_FORMAT: 'Tout format',
                LEXICON_LANGUAGE_TYPE: 'Type de langue',
                ALL_LEXICON_LANGUAGE_TYPE: 'Tout type de langue',
                PRODUCERS: 'Laboratoire producteur',
                ALL_PRODUCERS: 'Tout laboratoire producteur',
                RANKS: 'Disponibilités',
                ALL_RANKS: 'Toutes les disponibilités'
            },
            SORT: {
                TITLE: 'Titre',
                RANK: 'Disponibilité',
                PUBLICATION_DATE: 'Date de publication'
            },
            SEARCH: {
                CORPORA: 'Rechercher un corpus',
                TOOLS: 'Rechercher un outil',
                LEXICONS: 'Rechercher un lexique',
                TERMINOLOGIES: 'Rechercher une terminologies, thésaurus ou ontologies',
                PRODUCERS: 'Rechercher un laboratoire producteur (nom, sigle, ville)',
                ALL: 'Rechercher dans ORTOLANG',
                BACK_TO_RESULTS: 'Revenir aux résultats'
            },
            SHOW_IN: 'Présentation',
            VIEW_MODE: {
                LINE: 'Par liste',
                GRID: 'Par icônes'
            },
            FACETS: 'Recherche avancée',
            MORE_FACETS: 'Plus de filtres',
            LESS_FACETS: 'Cacher les filtres supplémentaires',
            ACTIVATED_FILTERS: 'Filtres actifs',
            RESET_FILTERS: 'Tout supprimer',
            NO_ITEM: 'Aucune ressource disponible',
            NO_CONTRIBUTOR_ITEMS: 'Aucune ressources',
            NO_PRODUCER: 'Aucune institution productrice trouvées',
            PUBLISHED_ON: 'Publié le',
            PID: 'Identifiant pérenne',
            ITEM_TYPE: {
                CORPORA: 'Corpus',
                LEXICON: 'Lexiques',
                TOOL: 'Outils',
                INTEGRATED_PROJECT: 'Projets Intégrés'
            },
            CITATION_MODAL: {
                TITLE: 'Comment citer cette ressource',
                COMMANDS: '<kbd><kbd>{{isMac ? "cmd" : "ctrl"}}</kbd> + <kbd>c</kbd></kbd> pour copier'
            },
            CONTACT_MODAL: {
                TITLE: 'Contacter le responsable de cette ressource',
                SUBJECT: {
                    LABEL: 'Sujet',
                    PLACEHOLDER: 'Sujet du message'
                },
                EMAIL: {
                    LABEL: 'Mail',
                    PLACEHOLDER: 'Votre adresse mail'
                },
                MESSAGE: {
                    LABEL: 'Message',
                    PLACEHOLDER: 'Corps du message'
                },
                SEND: 'Envoyer le message'
            },
            DOWNLOAD_MODAL: {
                TITLE: 'Téléchargement',
                ADVANCED: 'Téléchargement avancé',
                REGEX: 'Expression régulière',
                REGEX_HELP: 'Utilisez une expression régulière pour télécharger uniquement certains fichiers (exemple: <code>.*\\.xml</code> pour télécharger uniquement les fichiers XML)',
                POLICY: 'Je déclare avoir pris connaissance et accepter sans réserves <a href="/information/policy" target="_blank">la charte ORTOLANG</a> ainsi que la license relative à cette ressource',
                ANONYMOUS: '<strong>Vous n\'êtes pas connecté à ORTOLANG.</strong> Il est possible que certains fichiers de cette ressource ne soient accessibles uniquement aux utilisateurs connectés et/ou aux membres de l\'ESR. Si vous possédez un compte ORTOLANG, veuillez-vous connecter.',
                AUTHENTICATED: '<strong>Vous êtes connecté à ORTOLANG mais vous ne faites pas parti des membres de l\'ESR.</strong> Il est possible que certains fichiers de cette ressource ne soient accessibles uniquement aux membres de l\'ESR.',
                ESR: 'Vous êtes connecté à ORTOLANG et membre de l\'ESR.',
                SIZE: 'Vous allez télécharger la totalité des données de cette ressource soit un maximum de <strong>{{size | bytes}}</strong>.',
                MESSAGES: {
                    INVALID_REGEX: 'Expression régulière invalide',
                    POLICY: 'Vous devez accepter la charte ORTOLANG ainsi que la license relative à cette ressource',
                }
            }
        }
    });
