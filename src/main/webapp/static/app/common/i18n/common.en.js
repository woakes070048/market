'use strict';

/**
 * @ngdoc service
 * @name ortolangMarketApp.COMMON_EN
 * @description
 * # COMMON_EN
 * Constant in the ortolangMarketApp.
 */
angular.module('ortolangMarketApp')
    .constant('COMMON_EN', {
        CLOSE: 'Close',
        SELECT: 'Select',
        CANCEL: 'Cancel',
        CREATE: 'Create',
        SUBMIT: 'OK',
        ADD: 'Add',
        DELETE: 'Delete',
        NAME: 'Name',
        RENAME: 'Rename',
        DESCRIPTION: 'Description',
        INFORMATION: 'Information',
        TYPE: 'Type',
        ACTIONS: 'Actions',
        RESULT: 'Result',
        SIZE: 'Size',
        SEARCH: 'Search',
        LOG_IN: 'Login',
        NO_IMAGE_PROVIDED: 'No image provided',
        DOWNLOAD: 'Download',
        START: 'Start',
        STOP: 'Stop',
        ORTOLANG: 'Open Resources and TOols for LANGuage',
        CORPORA: 'Corpora',
        LEXICONS: 'Lexicons',
        TOOLS: 'Tools',
        INTEGRATED_PROJECTS: 'Integrated Projects',
        PRODUCERS: 'Producers',
        SELECT_WORKSPACE_ELEMENT: 'Select workspace element',
        PENDING_DATA: 'Loading...',
        CART: 'Selection',
        SEE_MORE: 'See more',
        404: {
            TITLE: 'Page not found',
            BODY: 'Sorry, but we can\'t find the page you are looking for. Maybe you should try heading home.',
            BUTTON: 'Home'
        },
        SERVER_DOWN_MODAL: {
            TITLE: 'The server seems to be currently unavailable',
            BODY: '<p>It seems that the server is currently unavailable; thus you won\'t be able to access ORTOLANG\'s resources.</p><p>You should try to refresh the page. If the problem persists, please contact us at <a href="mailto:contact@ortolang.fr">contact@ortolang.fr</a> .</p>',
            BUTTON: 'Refresh the page'
        },
        UNEXPECTED_ERROR_ALERT: {
            TITLE: 'Error',
            CONTENT: 'An unexpected error has occurred'
        },
        ROLES: {
            DEVELOPER: 'Developer',
            CHIEF_DEVELOPER: 'Chief developer',
            MANAGER: 'Manager',
            IT_MANAGER: 'IT manager',
            DESIGNER: 'Designer',
            RESEARCHER: 'Researcher',
            SCIENTIFIC_DIRECTOR: 'Scientific director',
            AUTHOR: 'Author',
            ANNOTATOR: 'Annotator',
            COMPILER: 'Compiler',
            CONSULTANT: 'Consultant',
            DATA_INPUTTER: 'Data inputter',
            DEPOSITOR: 'Depositor',
            EDITOR: 'Editor',
            ILLUSTRATOR: 'Illustrator',
            INTERPRETER: 'interpreter',
            INTERVIEWER: 'Interviewer',
            PARTICIPANT: 'Participant',
            PERFORMER: 'Performer',
            PHOTOGRAPHER: 'Photographer',
            RECORDER: 'Recorder',
            RESEARCH_PARTICIPANT: 'Research participant',
            RESPONDER: 'Responder',
            SIGNER: 'Signer',
            SINGER: 'Singer',
            SPEAKER: 'Speaker',
            SPONSOR: 'Sponsor',
            TRANSCRIBER: 'Transcriber',
            TRANSLATOR: 'Translator'
        },
        LANGUAGES: {
            FR: 'Français',
            EN: 'Anglais',
            ES: 'Spanish',
            ZH: 'Chinese'
        },
        MULTILINGUAL_TEXTFIELD: {
            LANGUAGE: 'Language',
            SELECT_LANGUAGE: 'Choose a language ...'
        },
        COOKIE_CONSENT: {
            TITLE: 'This website uses cookies:',
            BODY: 'we are using statistics cookies to understand how visitors interact with the website by collecting and reporting information anonymously. You can find out more or switch them off if you prefer. However, by continuing to use the site without changing settings, you are agreeing to our use of cookies.',
            ACCEPT: 'I agree',
            MORE: 'More information'
        }
    });
