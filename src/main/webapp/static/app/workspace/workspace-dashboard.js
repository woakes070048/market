'use strict';

/**
 * @ngdoc function
 * @name ortolangMarketApp.controller:WorkspaceDashboardCtrl
 * @description
 * # WorkspaceDashboardCtrl
 * Controller of the ortolangMarketApp
 */
angular.module('ortolangMarketApp')
    .controller('WorkspaceDashboardCtrl', [
        '$scope',
        '$rootScope',
        '$location',
        '$route',
        '$modal',
        '$translate',
        '$window',
        'Workspace',
        'Content',
        'Helper',
        'RuntimeResource',
        'WorkspaceResource',
        'WorkspaceBrowserService',
        function ($scope, $rootScope, $location, $route, $modal, $translate, $window, Workspace, Content, Helper, RuntimeResource, WorkspaceResource, WorkspaceBrowserService) {

            /**
             * The section selected by default
             * @type {string}
             */
            var defaultSection = 'information';
            var modalScope;

            /**
             *
             * @param {String} id   - the section id; if null or undefined sets default section
             */
            function setDashboardSection(id) {
                $scope.dashboardSection = id || defaultSection;
                if ($scope.dashboardSection === defaultSection) {
                    $location.search({});
                } else {
                    if ($scope.dashboardSection === 'content') {
                        $location.search('section', id);
                    } else {
                        $location.search({section: id});
                    }
                }
                // Refresh active workspace info
                if ($scope.dashboardSection === 'information') {
                    Workspace.refreshActiveWorkspace(['events', 'head']);
                }
                // If browsing content
                if (id === 'content') {
                    WorkspaceBrowserService.canEdit = !Workspace.active.workspace.readOnly;
                    WorkspaceBrowserService.workspace = Workspace.active.workspace;
                }
            }

            function createModalScope() {
                modalScope = $scope.$new(true);
                modalScope.models = {};
                modalScope.$on('modal.hide', function () {
                    modalScope.$destroy();
                });
            }

            $scope.selectDashboardSection = function (id) {
                setDashboardSection(id);
            };

            $scope.$on('$routeUpdate', function () {
                if ($scope.dashboardSection === 'information' && !$location.search().section) {
                    return;
                }
                if ($scope.dashboardSection !== $location.search().section) {
                    setDashboardSection($location.search().section);
                }
            });

            // *********************** //
            //       Publication       //
            // *********************** //

            $scope.publishWorkspace = function () {
                if (Workspace.active.metadata) {
                    var publishModal;
                    createModalScope();
                    modalScope.wsName = Workspace.active.workspace.name;
                    modalScope.publish = function () {
                        RuntimeResource.createProcess({
                            'process-type': 'publish-workspace',
                            'process-name': 'Publication of workspace: ' + Workspace.active.workspace.name,
                            'wskey': Workspace.active.workspace.key
                        }, function () {
                            Workspace.refreshActiveWorkspaceInfo();
                        });
                        publishModal.hide();
                    };
                    publishModal = $modal({
                        scope: modalScope,
                        template: 'workspace/templates/publish-modal.html',
                        show: true
                    });
                } else {
                     //TODO Add alert
                }
            };

            // *********************** //
            //        Deletion         //
            // *********************** //

            $scope.deleteWorkspace = function () {
                var deleteWorkspaceModal;
                createModalScope();
                modalScope.wsName = Workspace.active.workspace.name;
                modalScope.delete = function () {
                    WorkspaceResource.delete({wskey: Workspace.active.workspace.key}).$promise.then(function (data) {
                        $rootScope.$emit('process-created', data);
                    });
                    deleteWorkspaceModal.hide();
                    $location.url('/workspaces');
                };
                deleteWorkspaceModal = $modal({
                    scope: modalScope,
                    template: 'workspace/templates/delete-workspace-modal.html',
                    show: true
                });
            };

            $scope.$on('$destroy', function () {
                $rootScope.ortolangPageSubtitle = undefined;
            });

            function displaySearchErrorModal(cause, params) {
                $modal({
                    title: $translate.instant('WORKSPACE.SEARCH_ERROR_MODAL.TITLE'),
                    content: $translate.instant('WORKSPACE.SEARCH_ERROR_MODAL.BODY_' + cause, params),
                    show: true
                });
            }

            $scope.getTitleValue = function () {
                if (Workspace.active.metadata === null) {
                    return Workspace.active.workspace.name;
                }
                if (Workspace.active.metadata === undefined) {
                    return;
                }
                if (Workspace.active.metadata.title) {
                    return Helper.getMultilingualValue(Workspace.active.metadata.title);
                }
            };

            $scope.seeMoreEvents = function () {
                if (!$scope.dashboardModels.eventsInfiniteScrollBusy) {
                    $scope.dashboardModels.eventsInfiniteScrollBusy = true;
                    if (!$scope.dashboardModels.eventsSeeMoreOnce) {
                        var eventList = angular.element('.workspace-dashboard-section-events').find('ul.list-unstyled');
                        eventList.css('height', eventList.outerHeight() + 'px');
                        $scope.dashboardModels.eventsSeeMoreOnce = true;
                    }
                    $scope.dashboardModels.eventsLimit += 2;
                    $scope.dashboardModels.eventsInfiniteScrollBusy = false;
                }
            };

            (function init() {
                if (Workspace.active.workspace && Workspace.active.workspace.alias !== $route.current.params.alias) {
                    Workspace.clearActiveWorkspace();
                }
                $scope.Workspace = Workspace;
                $scope.dashboardModels = {
                    eventsLimit: 4,
                    eventsInfiniteScrollBusy: false
                };
                Workspace.getWorkspaceList(true).then(function () {
                    Workspace.setActiveWorkspaceFromAlias($route.current.params.alias).then(function () {
                        $rootScope.ortolangPageSubtitle = ' - ' + Workspace.active.workspace.alias;
                        setDashboardSection($location.search().section);
                        $scope.dashboardModels.links = {
                            base: $window.location.origin,
                            market: '/market/item/' + Workspace.active.workspace.alias,
                            content: Content.getContentUrlWithPath('', Workspace.active.workspace.alias)
                        };
                    }, function () {
                        displaySearchErrorModal('ALIAS', {alias: $route.current.params.alias});
                        $location.url('/workspaces');
                    });
                });
            }());

        }]);