'use strict';

/**
 * @ngdoc function
 * @name ortolangMarketApp.controller:LicenceCtrl
 * @description
 * # LicenceCtrl
 * Controller of the ortolangMarketApp
 */
angular.module('ortolangMarketApp')
    .controller('LicenceCtrl', ['$rootScope', '$scope', '$filter', '$modal', '$translate', 'Settings', 'ReferentialResource', 'Helper', 'Workspace', 'WorkspaceMetadataService', 'User',
        function ($rootScope, $scope, $filter, $modal, $translate, Settings, ReferentialResource, Helper, Workspace, WorkspaceMetadataService, User) {

            /**
             * Updates the license property.
             **/
            $scope.updateLicense = function(license) {
                // $scope.metadata.license = license.id;
                // $scope.metadata.licenseEntity = license;
                WorkspaceMetadataService.addLicense(license);
                $scope.updateStatusOfUse(license.id);

                WorkspaceMetadataService.metadataChanged = true;
            };

            /**
             * Updates the status of use.
             **/
            $scope.updateStatusOfUse = function(license) {
                var statusOfLicense = $filter('filter')($scope.allLicences, {id: license}, true);
                if(statusOfLicense.length>0) {
                    $scope.metadata.statusOfUse = statusOfLicense[0].status;
                }
            };

            /**
             * Deletes the licence.
             **/
            $scope.deleteLicense = function () {
                if (WorkspaceMetadataService.canEdit) {
                    return;
                }
                delete $scope.metadata.license;
                delete $scope.metadata.licenseEntity;
            };

            /**
             * Edit the licence.
             **/
            $scope.editLicense = function (license) {
                if (WorkspaceMetadataService.canEdit) {
                    return;
                }
                if (license.id) {
                    $scope.chooseLicence();
                } else {
                    $scope.addLicenceFromScratch(license);
                }
            };

            /**
             * All methods on license modal for choosing a licence
             **/

            function prepareModalScopeChooseLicence() {
                var modalScope = $rootScope.$new(true);
                modalScope.allLicences = $scope.allLicences;
                modalScope.model = {};

                return modalScope;
            }

            $scope.chooseLicence = function () {

                if (WorkspaceMetadataService.canEdit) {
                    return;
                }

                var modalScope = prepareModalScopeChooseLicence(),
                    chooseLicenceModal;

                modalScope.$on('modal.hide', function () {
                    modalScope.$destroy();
                });
                modalScope.chooseLicense = function(license) {
                    $scope.updateLicense(license);
                    chooseLicenceModal.hide();
                };
                chooseLicenceModal = $modal({
                    scope: modalScope,
                    templateUrl: 'workspace/templates/choose-licence-modal.html'
                });
            };

             /**** End of model license **/

            /**
             * All methods on license modal for creating a new licence
             **/

            function prepareModalScopeNewLicence(license) {
                var modalScope = $rootScope.$new(true);

                modalScope.User = User;
                modalScope.disabled = false;

                modalScope.model = {};
                modalScope.description = {selectedDescriptionLanguage : 'fr'};
                modalScope.identifier = {autoGenerated: true};

                var regExp = new RegExp(' +', 'g');

                function normalizeId(id) {
                    id = $filter('diacritics')(id);
                    modalScope.model.id = id ? id.replace(/[^\w\s]/g, '').replace(regExp, '_').toLowerCase() : id;
                }
                modalScope.generateId = function () {
                    normalizeId(modalScope.model.label);
                };

                if (license) {
                    modalScope.editing = true;
                    modalScope.license = license;
                    modalScope.model.label = angular.copy(license.label);
                    modalScope.model.status = license.status;
                    var status = $filter('filter')($scope.allStatusOfUse, {id: license.status}, true);
                    if (status.length>0) {
                        modalScope.status = {value: status[0]};
                    }
                    if (license.description) {
                        modalScope.model.description = angular.copy(license.description);
                        var description = $filter('filter')(modalScope.model.description, {lang: modalScope.description.selectedDescriptionLanguage}, true);
                        if (description.length>0) {
                            modalScope.selectedDescription = description[0];
                        } else if (modalScope.model.description.length>0) {
                            modalScope.selectedDescription = modalScope.model.description[0];
                        }
                    } else {
                        modalScope.selectedDescription = {value: ''};
                    }
                    modalScope.model.text = angular.copy(license.text);
                    if (modalScope.model.text) {
                        angular.forEach(modalScope.model.text, function (text) {
                            if(text.lang === 'fr' && angular.isDefined(text.value.url)) {
                                modalScope.model.licenseWebsite = text.value.url;
                            }
                        });
                    }
                    modalScope.generateId();
                } else {
                    modalScope.editing = false;
                    modalScope.selectedDescription = {value: ''};

                    modalScope.model.status = '${referential:free_use}';
                    /*jshint camelcase:false */
                    var freeStatus = $filter('filter')($scope.allStatusOfUse, {id: '${referential:free_use}'}, true);
                    if (freeStatus.length>0) {
                        modalScope.status = {value: freeStatus[0]};
                    }
                    modalScope.model.licenseWebsite = '';
                }

                modalScope.allStatusOfUse = $scope.allStatusOfUse;
                modalScope.languages = $scope.languages;

                return modalScope;
            }

            $scope.addLicenceFromScratch = function (license) {

                if (WorkspaceMetadataService.canEdit) {
                    return;
                }

                var modalScope = prepareModalScopeNewLicence(license),
                    addLicenceModal;

                modalScope.$on('modal.hide', function () {
                    modalScope.$destroy();
                });

                modalScope.changeDescriptionLanguage = function () {
                    var description = Helper.findObjectOfArray(modalScope.model.description, 'lang', modalScope.description.selectedDescriptionLanguage);
                    if (description !== null) {
                        modalScope.selectedDescription = description;
                    } else {
                        description = {lang: modalScope.description.selectedDescriptionLanguage, value: ''};
                        modalScope.selectedDescription = description;
                    }
                };

                modalScope.updateDescription = function() {
                    if (modalScope.selectedDescription.value !== '') {
                        var description = Helper.findObjectOfArray(modalScope.model.description, 'lang', modalScope.description.selectedDescriptionLanguage);
                        if (description === null) {
                            description = {
                                lang: modalScope.description.selectedDescriptionLanguage,
                                value: modalScope.selectedDescription.value
                            };
                            if (angular.isUndefined(modalScope.model.description)) {
                                modalScope.model.description = [];
                            }
                            modalScope.model.description.push(description);
                        } else {
                            description.value = modalScope.selectedDescription.value;
                        }
                    }
                };

                function createLicense() {
                    var license = {};
                    license.label = modalScope.model.label;
                    license.status = modalScope.status.value.id;
                    if(modalScope.model.description) {
                        license.description = angular.copy(modalScope.model.description);
                    }
                    if(modalScope.model.licenseWebsite) {
                        if (modalScope.model.text) {
                            var licenseTextFr = $filter('filter')(modalScope.model.text, {lang: 'fr'}, true);
                            if (licenseTextFr.length>0) {
                                licenseTextFr[0].value = {url: modalScope.model.licenseWebsite};
                            }
                            license.text = angular.copy(modalScope.model.text);
                        } else {
                            license.text = [{lang:'fr', value:{url: modalScope.model.licenseWebsite}}];
                        }
                    }
                    return license;
                }

                modalScope.submit = function (addLicenceForm) {

                    if (angular.isUndefined(modalScope.model.label)) {
                        addLicenceForm.label.$setValidity('undefined', false);
                    } else {
                        addLicenceForm.label.$setValidity('undefined', true);
                    }

                    if (addLicenceForm.$valid) {
                        var license = createLicense();
                        WorkspaceMetadataService.addLicense(license);

                        // Override status of use
                        $scope.metadata.statusOfUse = modalScope.status.value.id;

                        WorkspaceMetadataService.metadataChanged = true;
                        addLicenceModal.hide();
                    }
                };

                modalScope.setLicenceFromNewEntity = function (addLicenceForm) {

                    if (angular.isUndefined(modalScope.model.label)) {
                        addLicenceForm.label.$setValidity('undefined', false);
                    } else {
                        addLicenceForm.label.$setValidity('undefined', true);
                    }

                    if (addLicenceForm.$valid) {
                        var license = createLicense();
                        WorkspaceMetadataService.replaceLicense($scope.metadata.license, license);

                        WorkspaceMetadataService.metadataChanged = true;
                        Helper.hideModal();
                    }
                };

                addLicenceModal = $modal({
                    scope: modalScope,
                    templateUrl: 'workspace/templates/add-licence-modal.html'
                });
            };

            /** End of new license modal **/

            /**
             * Sets the language applies to conditions of use property.
             **/
            $scope.changeConditionsOfUseLanguage = function () {
                var conditionsOfUse = Helper.findObjectOfArray($scope.metadata.conditionsOfUse, 'lang', $scope.selectedConditionsOfUseLanguage);
                if(conditionsOfUse!==null) {
                    $scope.conditionsOfUse = conditionsOfUse;
                } else {
                    conditionsOfUse = {lang:$scope.selectedConditionsOfUseLanguage, value:''};
                    $scope.conditionsOfUse = conditionsOfUse;
                }
            };

            /**
             * Updates conditions of use property.
             **/
            $scope.updateConditionsOfUse = function() {
                if($scope.conditionsOfUse.value!=='') {
                    var conditionsOfUse = Helper.findObjectOfArray($scope.metadata.conditionsOfUse, 'lang', $scope.selectedConditionsOfUseLanguage);
                    if(conditionsOfUse===null) {
                        conditionsOfUse = {lang:$scope.selectedConditionsOfUseLanguage, value:$scope.conditionsOfUse.value};
                        if(angular.isUndefined($scope.metadata.conditionsOfUse)) {
                            $scope.metadata.conditionsOfUse = [];
                        }
                        $scope.metadata.conditionsOfUse.push(conditionsOfUse);
                    } else {
                        conditionsOfUse.value = $scope.conditionsOfUse.value;
                    }
                }
            };

            /**
             * Loads all status of use value.
             **/
            function loadAllStatusOfUse() {

                ReferentialResource.get({type: 'STATUSOFUSE'}, function(entities) {
                    $scope.allStatusOfUse = [];
                    angular.forEach(entities.entries, function(entry) {
                        var content = angular.fromJson(entry.content);
                        var label = Helper.getMultilingualValue(content.labels);

                        $scope.allStatusOfUse.push({id: '${'+entry.key+'}', label: label});
                    });

                    // Init with default value if not already set
                    if(!$scope.metadata.statusOfUse) {
                        $scope.metadata.statusOfUse = '${referential:free_use}';
                    }
                });
            }

            /**
             * Loads all license.
             **/
            function loadAllLicense() {
                ReferentialResource.get({type: 'LICENSE'}, function(entities) {
                    $scope.allLicences = [];
                    angular.forEach(entities.entries, function(entry) {
                        var content = angular.fromJson(entry.content);
                        var id = Helper.createKeyFromReferentialId(entry.key);
                        var license = {
                            id: id,
                            label: content.label,
                            status: content.status,
                            description: content.description ? Helper.getMultilingualValue(content.description) : undefined
                        };
                        $scope.allLicences.push(license);

                        if ($scope.metadata.license && $scope.metadata.license === id) {
                            $scope.metadata.licenseEntity = license;
                        }
                    });
                });
            }

        	function init() {
                $scope.User = User;
                $scope.WorkspaceMetadataService = WorkspaceMetadataService;
                $scope.languages = [
                    {key:'fr',value: $translate.instant('LANGUAGES.FR')},
                    {key:'en', value: $translate.instant('LANGUAGES.EN')},
                    {key:'es', value: $translate.instant('LANGUAGES.ES')},
                    {key:'zh', value: $translate.instant('LANGUAGES.ZH')}
                ];

        		loadAllStatusOfUse();
                loadAllLicense();

                if (angular.isObject($scope.metadata.license)) {
                    // $scope.selectedLicense = angular.copy($scope.metadata.license);
                    $scope.metadata.licenseEntity = angular.copy($scope.metadata.license);
                }

                $scope.selectedConditionsOfUseLanguage = 'fr';
                $scope.conditionsOfUse = {value: ''};
                if($scope.metadata.conditionsOfUse) {
                    $scope.changeConditionsOfUseLanguage($scope.selectedConditionsOfUseLanguage);
                }
        	}
        	init();
}]);
