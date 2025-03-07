'use strict';

/**
 * @ngdoc function
 * @name ortolangMarketApp.controller:OrtolangItemJsonCtrl
 * @description
 * # OrtolangItemJsonCtrl
 * Controller of the ortolangMarketApp
 */
angular.module('ortolangMarketApp')
    .controller('OrtolangItemJsonCtrl', ['$scope', '$rootScope', '$q', '$filter', '$location', '$modal', '$translate', '$analytics', 
                'AuthService', 'Helper', 'Settings', 'VisualizerService', 'Content', 'WorkspaceResource', 'ReferentialResource', 'ObjectResource', 
                'url', 'User', 'SearchResource', 'FormResource',
        function ($scope, $rootScope, $q, $filter, $location, $modal, $translate, $analytics, AuthService, Helper, Settings, VisualizerService, 
            Content, WorkspaceResource, ReferentialResource, ObjectResource, url, User, SearchResource, FormResource) {

            function loadReferentialEntities(items) {
                let deferred = $q.defer();
                if (items && items.length > 0) {
                    let promises = [],
                        tmpEntities = [],
                        item;
                    for (let iEntity = 0; iEntity < items.length ; iEntity++) {
                        item = items[iEntity];
                        if (Helper.startsWith(item, '$')) {
                            // From Workspace
                            promises.push(loadReferentialEntity(tmpEntities, iEntity, item));
                        } else {
                            // From Market and Workspace (entity that needs to be checked) 
                            tmpEntities[iEntity] = item;
                        }
                    }
                    $q.all(promises).then(function () {
                        deferred.resolve(tmpEntities);
                    }, function (reason) {
                        console.error(reason);
                        deferred.reject(tmpEntities);
                    });
                } else {
                    deferred.resolve([]);
                }
                return deferred.promise;
            }

            function loadReferentialEntity(tmpEntities, iEntity, item) {
                let deferredEntity = $q.defer();
                ReferentialResource.get({ name: Helper.extractNameFromReferentialId(item) }, function (entity) {
                    tmpEntities[iEntity] = entity.content;
                    deferredEntity.resolve();
                }, function() {
                    deferredEntity.reject();
                });
                return deferredEntity.promise;
            }

            function getValues(arr, propertyName, propertyValue) {
                var values = [];
                if (arr) {
                    var iObject;
                    for (iObject = 0; iObject < arr.length; iObject++) {
                        if (arr[iObject][propertyName] === propertyValue) {
                            values.push(arr[iObject].value);
                        }
                    }
                }
                return values;
            }

            function getValue(arr, propertyName, propertyValue, defaultValue) {
                var values = getValues(arr, propertyName, propertyValue);
                if (arr && values.length === 0) {
                    return arr.length > 0 ? arr[0].value : defaultValue;
                }
                return values[0];
            }

            function refreshMultilingualValue(item, lang) {
                $scope.title = getValue(item.title, 'lang', lang, 'Untitled');
                $scope.description = getValue(item.description, 'lang', lang);
                if (item.keywords) {
                    $scope.keywords = getValues(item.keywords, 'lang', lang);
                    if ($scope.keywords.length === 0) {
                        $scope.keywords = getValues(item.keywords, 'lang', 'fr');
                    }
                }
                if (item.bibliographicCitation) {
                    $scope.bibliographicCitation = getValue(item.bibliographicCitation, 'lang', lang);
                }
            }

            function loadLicense(lang) {
                if ($scope.content.license) {
                    if (Helper.startsWith($scope.content.license, '$')) {
                        // From Workspace
                        ReferentialResource.get({name: Helper.extractNameFromReferentialId($scope.content.license)}, function (entity) {
                            $scope.license = entity.content;
                            if ($scope.license.description) {
                                $scope.license.effectiveDescription = Helper.getMultilingualValue($scope.license.description, lang);
                            }
                            if ($scope.license.text) {
                                $scope.license.effectiveText = Helper.getMultilingualValue($scope.license.text, lang);
                            }
                        });
                    } else {
                        // From Market and Workspace (with licence that needs to be checked)
                        $scope.license = $scope.content.license;
                        if ($scope.license.description) {
                            $scope.license.effectiveDescription = Helper.getMultilingualValue($scope.license.description, lang);
                        }
                        if ($scope.license.text) {
                            var value = Helper.getMultilingualValue($scope.license.text, lang);
                            if (value && value.path) {
                                ObjectResource.element({
                                    key: $scope.itemKey,
                                    path: value.path
                                }).$promise.then(function (oobject) {
                                    $scope.textFileKey = oobject.key;
                                });
                            } else {
                                $scope.license.effectiveText = value;
                            }
                        }
                    }
                }
            }

            function getItemType(item) {
                switch (item.type) {
                    case 'Corpus':
                        return 'corpora';
                    case 'Lexique':
                        return 'lexicons';
                    case 'Application':
                        return 'applications';
                    case 'Outil':
                        return 'tools';
                    case 'Terminologie':
                        return 'terminologies';
                }
            }

            function loadCommonFields() {
                refreshMultilingualValue($scope.content, Settings.language);
                $scope.itemMarketType = getItemType($scope.content);

                if ($scope.content.image) {
                    $scope.image = Content.getThumbUrlWithPath($scope.content.image, $scope.alias, $scope.root, 180);
                } else {
                    $scope.imgtitle = '';
                    $scope.imgtheme = 'custom';
                    if ($scope.title) {
                        $scope.imgtitle = $scope.title.substring(0, 2);
                        $scope.imgtheme = $scope.title.substring(0, 1).toLowerCase();
                    }
                }

                if ($scope.content.datasize !== undefined && $scope.content.datasize !== '') {
                    $scope.datasizeToPrint = {'value': $filter('bytes')($scope.content.datasize)};
                }

                if ($scope.content.website) {
                    if (!Helper.startsWith($scope.content.website, 'http')) {
                        $scope.website = Content.getContentUrlWithPath($scope.content.website, $scope.alias, $scope.root);
                    } else {
                        $scope.website = $scope.content.website;
                    }
                }
            }

            function loadItem() {

                if (!$scope.preview) {
                    $rootScope.ortolangPageTitle = getValue($scope.content.title, 'lang', Settings.language, 'Untitled') + ' | ';
                }

                if ($scope.content.schema) {
                    if ($location.search().path) {
                        $scope.browseContent();
                    } else if($location.search().content) {
                        $scope.displaySearch();
                    }

                    if ($scope.content.schema === 'http://www.ortolang.fr/schema/013#') {
                        $scope.marketItemTemplate = 'market/templates/ortolang-item-json-13.html';
                        loadCommonFields();
                    } else if ($scope.content.schema === 'http://www.ortolang.fr/schema/014#') {
                        $scope.marketItemTemplate = 'market/templates/ortolang-item-json-14.html';
                        loadCommonFields();
                    } else if ($scope.content.schema === 'http://www.ortolang.fr/schema/015#') {
                        $scope.marketItemTemplate = 'market/templates/ortolang-item-json-15.html';
                        loadCommonFields();
                    } else if ($scope.content.schema === 'http://www.ortolang.fr/schema/016#') {
                        $scope.marketItemTemplate = 'market/templates/ortolang-item-json-16.html';
                        loadCommonFields();
                    } else {
                        $scope.marketItemTemplate = 'market/templates/ortolang-item-json-unknown.html';
                    }
                } else {
                    $scope.marketItemTemplate = 'market/templates/ortolang-item-json-unknown.html';
                }
            }

            function ckeckSearchable() {
                SearchResource.content({ 'workspace.key.keyword': $scope.wskey}, function (hits) {
                    $scope.searchable = hits.totalHits > 0;
                });
            }

            function checkExecutable() {
                if ($scope.content.type === 'Outil' && angular.isDefined($scope.content.applicationUrl) && $scope.content.applicationUrl !== '') {
                    FormResource.get({ formKey: 'tool-' + $scope.alias + '-form' }, function (form) {
                        $scope.executable = true;
                        $scope.form = form;
                    }, function () {
                        $scope.executable = false;
                    });
                }
            }

            $scope.$on('$routeUpdate', function () {
                if (angular.isDefined($location.search().path) && !$scope.browse) {
                    $scope.browse = !$scope.browse;
                } else if (angular.isDefined($location.search().content)) {
                    $scope.displaySearch();
                }
            });

            $scope.browseContent = function () {
                $scope.browse = !$scope.browse;
            };

            $scope.displaySearch = function () {
                $scope.search = true;
            };

            $scope.displayInfo = function () {
                // Cleans up the search url parameters
                $location.search({});
                $scope.search = false;
                $scope.browse = false;
            };

            function createLicenseModel() {
                return {
                    label: $scope.license ? $scope.license.label : undefined,
                    url: $scope.license && $scope.license.effectiveText ? $scope.license.effectiveText.url : undefined,
                    conditionsOfUse: ($scope.content.conditionsOfUse !== undefined && $scope.content.conditionsOfUse !== '') ? Helper.getMultilingualValue($scope.content.conditionsOfUse, 'fr') : undefined
                }
            }

            $scope.exportItem = function () {
                var modalScope = Helper.createModalScope(true),
                    exportModal;

                modalScope.models.authenticated = AuthService.isAuthenticated();
                modalScope.models.esr = AuthService.isEsr();
                modalScope.models.license = $scope.licenseModel;
                
                modalScope.models.size = $scope.content.datasize;

                modalScope.login = function () {
                    AuthService.login();
                };

                modalScope.submit = function (downloadItemForm) {
                    if (!modalScope.models.pendingSubmit) {
                        modalScope.models.pendingSubmit = true;
                        if (downloadItemForm.$valid) {
                            try {
                                new RegExp(modalScope.models.regex);
                            } catch (e) {
                                downloadItemForm.regex.$setValidity('invalid', false);
                                modalScope.models.pendingSubmit = false;
                                return;
                            }
                        } else {
                            modalScope.models.pendingSubmit = false;
                            return;
                        }
                    }
                    var analyticsUrl = url.content + '/export/' + $scope.alias + '/' + $scope.root;
                    $analytics.trackLink(analyticsUrl, 'download');
                    Content.exportSingle($scope.alias, $scope.root, '/', $scope.alias, modalScope.models.regex);
                    exportModal.hide();
                };

                exportModal = $modal({
                    scope: modalScope,
                    templateUrl: 'common/directives/download-item-modal-template.html',
                    show: true
                });
            };

            $scope.seeContributorPage = function (contributor) {
                if (contributor.entity.id) {
                    $location.url('/contributors/' + contributor.entity.id);
                }
            };

            $scope.computeTextCitation = function () {
                if ($scope.bibliographicCitation) {
                    return $scope.bibliographicCitation;
                }
                let citation = '', iPub = 0, iAuthor = 0;
                if ($scope.content.publications && $scope.content.publications.length > 0) {
                    angular.forEach($scope.content.publications, function (publication) {
                        if (iPub++>1) return;
                        citation += '<p>' + publication + '</p>';
                    });
                }
                if ($scope.authors && $scope.authors.length > 0) {
                    // Displays authors
                    for (iAuthor = 0; iAuthor < $scope.authors.length ; iAuthor++) {
                        if ($scope.authors[iAuthor].isAuthor) {
                            if (iAuthor > 2) {
                                citation += ', et al.';
                                break;
                            }
                            if ($scope.authors[iAuthor].entity) {
                                if (iAuthor !== 0) {
                                    citation += ', ';
                                }
                                citation += $scope.authors[iAuthor].entity.fullname;
                            }
                        }
                    }
                } else if ($scope.producers && $scope.producers.length > 0) {
                    for (let iProducer = 0; iProducer < $scope.producers.length; iProducer++) {
                        if ($scope.producers[iProducer]) {
                            if (iProducer !== 0) {
                                citation += ', ';
                            }
                            citation += $scope.producers[iProducer].name + ($scope.producers[iProducer].acronym ? ' (' + $scope.producers[iProducer].acronym + ')' : '');
                        }
                    }
                } 
                citation += ' (' + $filter('date')($scope.content.publicationDate, 'yyyy') + ').';
                citation += ' <i>' + $scope.title + '</i> [' + $scope.content.type + '].';
                citation += ' ORTOLANG (Open Resources and TOols for LANGuage) - <a target="_BLANK" href="https://www.ortolang.fr">www.ortolang.fr</a>, ';
                if (angular.isDefined($scope.tag)) {
                    citation += $scope.tag.tag + ',';
                }
                citation += ' <a target="_BLANK" href="' + $scope.handle + '">' + $scope.handle + '</a>.';
                return citation;
            };

            // https://en.wikibooks.org/wiki/LaTeX/Special_Characters
            var bibtexSpecialChars = {
                '%': '\\%',
                '$': '\\$',
                '{': '\\{',
                '_': '\\_',
                '¶': '\\P',
                '‡': '\\ddag',
                '|': '\\textbar',
                '>': '\\textgreater',
                '–': '\\textendash',
                '™': '\\texttrademark',
                '¡': '\\textexclamdown',
                '£': '\\pounds',
                '#': '\\#',
                '&': '\\&',
                '}': '\\}',
                '§': '\\S',
                '†': '\\dag',
                '\\': '\\textbackslash{}',
                '<': '\\textless',
                '—': '\\textemdash',
                '®': '\\textregistered',
                'ⓐ': '\\textcircled{a}',
                '©': '\\copyright',
                '¿': '\\textquestiondown',
                'ò': '\\`{o}',
                'ó': '\\\'{o}',
                'ô': '\\^{o}',
                'ö': '\\"{o}',
                'ő': '\\H{o}',
                'õ': '\\~{o}',
                'ç': '\\c{c}',
                'ą': '\\k{a}',
                'ł': '\\l{}',
                'ō': '\\={o}',
                // o_
                'ȯ': '\\.{o}',
                'ụ': '\\d{u}',
                'å': '\\r{a}',
                'ŏ': '\\u{o}',
                'š': '\\v{s}',
                'ø': '\\o',
                'î': '\\^{\\i}',
                'ï': '\\"{\\i}',
                '^': '\\textasciicircum{}',
                '~': '\\textasciitilde{}'
            };

            function replaceSpecialChars(str) {
                return str.replace(/[\D]/g, function (a) {
                    return bibtexSpecialChars[a] || a;
                });
            }

            $scope.computeBibtexCitation = function () {
                if ($scope.bibliographicCitation) {
                    return undefined;
                }
                var i,
                    bibTeX = '@misc{' + url.handlePrefix + '/' + $scope.alias + ($scope.tag ? '/' + $scope.tag.tag : '') + ',\n';
                bibTeX += '    title = {' + replaceSpecialChars($scope.title) + '},\n';
                bibTeX += '    author = {';
                if ($scope.authors && $scope.authors.length > 0) {
                    for (i = 0; i < $scope.authors.length; i++) {
                        if ($scope.authors[i].entity) {
                            if (i !== 0) {
                                bibTeX += ', ';
                            }
                            bibTeX += replaceSpecialChars($scope.authors[i].entity.fullname);
                        }
                    }
                } else if ($scope.producers && $scope.producers.length > 0) {
                    for (i = 0; i < $scope.producers.length; i++) {
                        if (i !== 0) {
                            bibTeX += ' and ';
                        }
                        if ($scope.producers[i].acronym) {
                            bibTeX += replaceSpecialChars($scope.producers[i].acronym);
                        } else {
                            bibTeX += '{' + replaceSpecialChars($scope.producers[i].name) + '}';
                        }
                    }
                }
                bibTeX += '},\n';
                bibTeX += '    url = {' + replaceSpecialChars($scope.handle) + '},\n';
                bibTeX += '    note = {{ORTOLANG} ({Open} {Resources} {and} {TOols} {for} {LANGuage}) \\textendash www.ortolang.fr},\n';
                if ($scope.license && $scope.license.label) {
                    bibTeX += '    copyright = {' + replaceSpecialChars($scope.license.label) + '},\n';
                }
                bibTeX += '    year = {' + $filter('date')($scope.content.publicationDate, 'yyyy') + '}\n}';
                return bibTeX;
            };

            $scope.getCitation = function () {
                return $scope.computeTextCitation($scope);
            };

            $scope.goToItem = function (url) {
                $location.url(url);
            };

            function initScopeVariables() {
                // Show info, browse, ...
                $scope.browse = false;
                $scope.isArray = angular.isArray;
                $scope.isString = angular.isString;
                $scope.marketItemTemplate = undefined;
                $scope.image = undefined;
                $scope.imgtitle = undefined;
                $scope.currentContent = $scope.content;
                $scope.showingDescription = false;
                $scope.handle = 'https://hdl.handle.net/' + url.handlePrefix + '/' + $scope.alias + ($scope.tag ? '/' + $scope.tag.tag : '');
                $scope.dynamicHandle = 'https://hdl.handle.net/' + url.handlePrefix + '/' + $scope.alias;
                $scope.shortHandle = 'hdl:' + url.handlePrefix + '/' + $scope.alias + ($scope.tag ? '/' + $scope.tag.tag : '');
                $scope.searchable = false;
                $scope.executable = false;
                $scope.form = undefined;
            }

            $scope.howToCite = function ($scope, $event) {
                $event.preventDefault();
                var modalScope = Helper.createModalScope(true);
                modalScope.models = {
                    citation: $scope.citation,
                    bibTeX: $scope.computeBibtexCitation(),
                    isMac: window.navigator.appVersion.indexOf('Mac') !== -1
                };
                modalScope.select = function (target) {
                    if (target === 'bibtext') {
                        document.getElementById('citation-bibtex').select();
                    } else {
                        var text = document.getElementById('citation-text'),
                            range,
                            selection;
                        if (document.body.createTextRange) {
                            range = document.body.createTextRange();
                            range.moveToElementText(text);
                            range.select();
                        } else if (window.getSelection) {
                            selection = window.getSelection();
                            range = document.createRange();
                            range.selectNodeContents(text);
                            selection.removeAllRanges();
                            selection.addRange(range);
                        }
                    }
                    modalScope.models.showCommands = true;
                };
                modalScope.$on('modal.show', function () {
                    var target = angular.element($event.target);
                    if (target.hasClass('label')) {
                        if (target.hasClass('bibtex')) {
                            modalScope.select('bibtext');
                        } else {
                            modalScope.select();
                        }
                    }
                });
                $modal({
                    scope: modalScope,
                    templateUrl: 'common/directives/citation-modal-template.html',
                    show: true
                });
            };

            $scope.contact = function () {
                var modalScope = Helper.createModalScope(true),
                    contactModal;

                if (User.email) {
                    modalScope.models.email = User.email;
                }

                modalScope.submit = function (contactForm) {
                    if (contactForm.$valid) {
                        WorkspaceResource.notifyOwner({wskey: $scope.wskey}, {subject: modalScope.models.subject, email: modalScope.models.email, message: modalScope.models.message}, function () {
                            contactModal.hide();
                        });
                    }
                };

                contactModal = $modal({
                    scope: modalScope,
                    templateUrl: 'market/templates/contact-modal-template.html',
                    show: true
                });
            };

            function init() {
                if ($scope.preview) {
                    $scope.content.social = {};
                }
                $scope.initilizing = true;
                initScopeVariables();
                loadItem();
                $scope.producers = [];
                loadReferentialEntities($scope.content.producers).then(function (loadedProducers) {
                    $scope.producers = loadedProducers.slice();

                    // Loads contributors and authors
                    $scope.authors = [];
                    if ($scope.content.contributors && $scope.content.contributors.length > 0) {
                        Helper.loadContributors($scope.content.contributors).then(function(loadedContributors) {
                            $scope.contributors = loadedContributors;
                            for (let iContributor = 0; iContributor < $scope.contributors.length; iContributor++) {
                                if ($scope.contributors[iContributor].isAuthor) {
                                    $scope.authors.push($scope.contributors[iContributor]);
                                }
                            }
                            // If contributors, needs authors to be loaded
                            $scope.citation = $scope.getCitation();
                        });
                    } else {
                        // If producers, needs producers to be loaded
                        $scope.citation = $scope.getCitation();
                    }
                });
                $scope.sponsors = [];
                if (angular.isDefined($scope.content.sponsors)) {
                    loadReferentialEntities($scope.content.sponsors).then(function (loadedSponsors) {
                        $scope.sponsors = loadedSponsors.slice();
                    });
                }
                loadLicense(Settings.language);
                $scope.licenseModel = createLicenseModel();
                ckeckSearchable();
                checkExecutable();
                $scope.initilizing = false;
            }

            $rootScope.$on('$translateChangeSuccess', function () {
                if ($scope.content) {
                    refreshMultilingualValue($scope.content, $translate.use());
                    loadLicense($translate.use());
                }
            });

            $scope.showPreview = function (key) {
                VisualizerService.showPreview(key);
            };

            $scope.backToSearch = function () {
                var history = $filter('orderBy')(Settings.searchHistory, '-date')[0];
                if (history) {
                    $location.path('/market/' + history.type);
                    $location.search(history.params);
                }
            };

            $scope.$watch('content', function (newContent) {
                if ($scope.content !== undefined && $scope.currentContent !== newContent) {
                    init();
                    $scope.currentContent = newContent;
                }
            });
        }]);
